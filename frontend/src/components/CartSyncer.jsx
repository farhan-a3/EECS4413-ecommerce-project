import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { setCart, emptyCart } from "../redux/action";

/*
  Keeps the Redux cart and the DB cart in sync
  - While logged out: we persist the current cart to localStorage (cart_guest)
  - On login: we merge cart_guest into the user's DB cart, then hydrate Redux
  - On logout: we clear Redux cart and reset guest cart so we don't double-merge later
  This solves the “guest cart gets wiped on login” issue by doing the merge BEFORE hydration.
*/
const GUEST_CART_KEY = "cart_guest";

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.id ? parsed : null;
  } catch {
    return null;
  }
};

const normalizeCartFromState = (cartState) => {
  // cartState items look like: { id, title, price, image, qty }
  // we only send the minimum needed to the server
  const map = new Map();
  for (const item of cartState || []) {
    const productId = Number(item?.productId ?? item?.id);
    const quantity = Number(item?.quantity ?? item?.qty);
    if (!Number.isFinite(productId) || productId <= 0) continue;
    if (!Number.isFinite(quantity) || quantity <= 0) continue;
    map.set(productId, (map.get(productId) || 0) + quantity);
  }
  return Array.from(map.entries()).map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
};

const readGuestCart = () => {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeGuestCart = (items) => {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch {
    // ignore storage failures
  }
};

const CartSyncer = () => {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.handleCart);
  const [user, setUser] = useState(getStoredUser());

  const hydratedRef = useRef(false);
  const hydratingRef = useRef(false);
  const debounceRef = useRef(null);

  // track last known logged in user to detect logout transitions cleanly
  const lastUserIdRef = useRef(user?.id || null);

  // listen for auth changes (already dispatches this event)
  useEffect(() => {
    const syncAuth = () => setUser(getStoredUser());
    const onStorage = (e) => {
      if (e.key === "user") syncAuth();
    };

    window.addEventListener("authChanged", syncAuth);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("authChanged", syncAuth);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // compute normalized cart payload (used for guest storage + DB sync)
  const normalizedCart = useMemo(() => normalizeCartFromState(cart), [cart]);

  // (0) while logged out, persist guest cart so login can merge it later
  useEffect(() => {
    if (user?.id) return;
    writeGuestCart(normalizedCart);
  }, [user?.id, normalizedCart]);

  // (0.5) on logout, clear redux cart + guest cache to prevent double-merges
  useEffect(() => {
    const currentUserId = user?.id || null;

    // logged out transition (was logged in, now not)
    if (!currentUserId && lastUserIdRef.current) {
      hydratedRef.current = false;
      dispatch(emptyCart());
      writeGuestCart([]); // keep guest cart empty after logout
      lastUserIdRef.current = null;
      return;
    }

    // logged in (update tracker)
    if (currentUserId) lastUserIdRef.current = currentUserId;
  }, [user?.id, dispatch]);

  // (1) on login: merge guest cart first, then hydrate Redux
  useEffect(() => {
    if (!user?.id) {
      hydratedRef.current = false;
      return;
    }
    if (hydratedRef.current) return;
    if (hydratingRef.current) return;

    hydratingRef.current = true;
    let cancelled = false;

    const hydrate = async () => {
      try {
        // prefer guest cart from localStorage (stable), fallback to current in-memory cart snapshot
        const guestFromStorage = readGuestCart();
        const guestFallback = normalizeCartFromState(cart);
        const guestItems =
          guestFromStorage.length > 0 ? guestFromStorage : guestFallback;

        if (guestItems.length > 0) {
          const mergeRes = await fetch(`/api/users/${user.id}/cart/merge`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: guestItems }),
          });

          const merged = await mergeRes.json().catch(() => []);
          if (!mergeRes.ok) {
            throw new Error(merged?.error || "Failed to merge carts");
          }

          if (!cancelled) {
            // merged response is the final cart
            localStorage.removeItem(GUEST_CART_KEY);
            dispatch(setCart(merged));
          }
        } else {
          // no guest cart, standard hydrate
          const res = await fetch(`/api/users/${user.id}/cart`);
          const data = await res.json().catch(() => []);
          if (!res.ok) throw new Error(data?.error || "Failed to load cart");

          if (!cancelled) {
            dispatch(setCart(data));
          }
        }

        hydratedRef.current = true;
      } catch (err) {
        console.error("Cart hydrate/merge failed:", err);
        toast.error(err?.message || "Cart sync failed");
      } finally {
        hydratingRef.current = false;
      }
    };

    hydrate();

    return () => {
      cancelled = true;
    };
    // intentionally depends only on user.id: we want this to run once per login
  }, [user?.id, dispatch]);

  // (2) when logged in and hydrated, keep DB updated (debounced)
  useEffect(() => {
    if (!user?.id) return;
    if (!hydratedRef.current) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/${user.id}/cart`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: normalizedCart }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Failed to sync cart");
      } catch (err) {
        console.error("Cart sync failed:", err);
      }
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [user?.id, normalizedCart]);

  return null;
};

export default CartSyncer;
