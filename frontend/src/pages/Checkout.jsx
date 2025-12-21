import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navbar, Footer } from "../components";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { emptyCart } from "../redux/action";

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.handleCart);
  const [submitting, setSubmitting] = useState(false);

  const onQuit = () => {
    navigate("/cart");
  };

  const totalAmount = useMemo(() => {
    return cart.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0);
  }, [cart]);

  const [authUser, setAuthUser] = useState(null);

  // Auth forms (shown when not logged in)
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",

    shippingAddress: "",
    shippingAddress2: "",
    shippingCountry: "",
    shippingState: "",
    shippingZip: "",

    cardName: "",
    cardNumber: "",
    cardExpiry: "",
  });

  // Checkout info (loaded from profile, or temporary)
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savedProfile, setSavedProfile] = useState(null);

  const [useSavedInfo, setUseSavedInfo] = useState(true);
  const [saveToProfile, setSaveToProfile] = useState(false);

  const [checkoutInfo, setCheckoutInfo] = useState({
    shippingAddress: "",
    shippingAddress2: "",
    shippingCountry: "",
    shippingState: "",
    shippingZip: "",
    cardName: "",
    cardNumber: "",
    cardExpiry: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;

    try {
      setAuthUser(JSON.parse(stored));
    } catch {
      localStorage.removeItem("user");
      setAuthUser(null);
    }
  }, []);

  // Load saved profile for logged in users
  useEffect(() => {
    if (!authUser?.id) return;

    const loadProfile = async () => {
      setLoadingProfile(true);
      try {
        const res = await fetch(`/api/users/${authUser.id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load profile");

        setSavedProfile(data);

        setCheckoutInfo({
          shippingAddress: data.shippingAddress || "",
          shippingAddress2: data.shippingAddress2 || "",
          shippingCountry: data.shippingCountry || "",
          shippingState: data.shippingState || "",
          shippingZip: data.shippingZip || "",
          cardName: data.cardName || "",
          cardNumber: data.cardNumber || "",
          cardExpiry: data.cardExpiry || "",
        });
      } catch (e) {
        console.error(e);
        toast.error("Could not load saved checkout info");
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [authUser]);

  // When user switches back to "Use saved", reapply saved values and lock fields
  useEffect(() => {
    if (!useSavedInfo || !savedProfile) return;

    setCheckoutInfo({
      shippingAddress: savedProfile.shippingAddress || "",
      shippingAddress2: savedProfile.shippingAddress2 || "",
      shippingCountry: savedProfile.shippingCountry || "",
      shippingState: savedProfile.shippingState || "",
      shippingZip: savedProfile.shippingZip || "",
      cardName: savedProfile.cardName || "",
      cardNumber: savedProfile.cardNumber || "",
      cardExpiry: savedProfile.cardExpiry || "",
    });

    setSaveToProfile(false);
  }, [useSavedInfo, savedProfile]);

  const onCheckoutChange = (e) => {
    const { name, value } = e.target;
    setCheckoutInfo((p) => ({ ...p, [name]: value }));
  };

  const onLoginChange = (e) => {
    const { id, value } = e.target;
    setLoginData((p) => ({ ...p, [id]: value }));
  };

  const onRegisterChange = (e) => {
    const { id, value } = e.target;
    setRegisterData((p) => ({ ...p, [id]: value }));
  };

  const doLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Login failed");

      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("authChanged"));
      setAuthUser(data.user);
      toast.success("Logged in. Keep going.");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Login failed");
    }
  };

  const doRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Registration failed");

      // Register endpoint returns id/email/name/role, store it so checkout can attach orders to this user
      const newUser = {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
      };

      localStorage.setItem("user", JSON.stringify(newUser));
      window.dispatchEvent(new Event("authChanged"));
      setAuthUser(newUser);
      toast.success("Account created. You're checked in.");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Registration failed");
    }
  };

  const placeOrder = async (e) => {
    e.preventDefault();

    if (submitting) return; // prevent spam clicking
    setSubmitting(true);

    if (!authUser?.id) {
      toast.error("Login or create an account first");
      setSubmitting(false);
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty");
      setSubmitting(false);
      return;
    }

    if (!checkoutInfo.shippingAddress || !checkoutInfo.shippingCountry || !checkoutInfo.shippingZip) {
      toast.error("Shipping address is incomplete");
      setSubmitting(false);
      return;
    }
    if (!checkoutInfo.cardName || !checkoutInfo.cardNumber || !checkoutInfo.cardExpiry) {
      toast.error("Payment info is incomplete");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: authUser.id,
          cartItems: cart.map((it) => ({
            id: it.id,
            qty: it.qty,
            title: it.title,
          })),
          totalAmount,
          shipping: {
            shippingAddress: checkoutInfo.shippingAddress,
            shippingAddress2: checkoutInfo.shippingAddress2,
            shippingCountry: checkoutInfo.shippingCountry,
            shippingState: checkoutInfo.shippingState,
            shippingZip: checkoutInfo.shippingZip,
          },
          payment: {
            cardName: checkoutInfo.cardName,
            cardNumber: checkoutInfo.cardNumber,
            cardExpiry: checkoutInfo.cardExpiry,
          },
          saveToProfile: !useSavedInfo && saveToProfile,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data?.success === false) {
        toast.error(data?.error || "Checkout failed");
        return; // stay on page, user can re-enter or quit
      }

      toast.success("Order placed!");

      const buyerName = authUser.name || authUser.email;
      const itemsSnapshot = [...cart]; // snapshot before emptyCart

      dispatch(emptyCart());

      navigate("/order-summary", {
        state: {
          name: buyerName,
          items: itemsSnapshot,
          total: totalAmount,
          orderId: data.orderId,
        },
      });
    } catch (err) {
      console.error(err);
      toast.error("Checkout failed");
    } finally {
      setSubmitting(false); // always unlock
    }
  };

  return (
    <>
      <Navbar />
      <div className="container my-3 py-3">
        <h1 className="text-center">Checkout</h1>
        <hr />

        {/* If not logged in: show prompt to login or create account */}
        {!authUser ? (
          <div className="row g-4">
            <div className="col-12">
              <p className="text-muted text-center m-0">
                Login or create an account to complete checkout. Your cart stays here.
              </p>
            </div>

            <div className="col-12 col-lg-6">
              <div className="card">
                <div className="card-header bg-light">
                  <strong>Login</strong>
                </div>
                <div className="card-body">
                  <form onSubmit={doLogin}>
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input
                        id="email"
                        type="email"
                        className="form-control"
                        value={loginData.email}
                        onChange={onLoginChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Password</label>
                      <input
                        id="password"
                        type="password"
                        className="form-control"
                        value={loginData.password}
                        onChange={onLoginChange}
                        required
                      />
                    </div>

                    <button className="btn btn-dark w-100" type="submit">
                      Login and continue
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="card">
                <div className="card-header bg-light">
                  <strong>Create Account</strong>
                </div>
                <div className="card-body">
                  <form onSubmit={doRegister}>
                    <div className="mb-3">
                      <label className="form-label">Full Name</label>
                      <input
                        id="name"
                        type="text"
                        className="form-control"
                        value={registerData.name}
                        onChange={onRegisterChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input
                        id="email"
                        type="email"
                        className="form-control"
                        value={registerData.email}
                        onChange={onRegisterChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Password</label>
                      <input
                        id="password"
                        type="password"
                        className="form-control"
                        value={registerData.password}
                        onChange={onRegisterChange}
                        required
                      />
                    </div>

                    <hr />

                    <h6 className="mb-3">Default Shipping</h6>

                    <div className="mb-3">
                      <label className="form-label">Address</label>
                      <input
                        id="shippingAddress"
                        type="text"
                        className="form-control"
                        value={registerData.shippingAddress}
                        onChange={onRegisterChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Address 2</label>
                      <input
                        id="shippingAddress2"
                        type="text"
                        className="form-control"
                        value={registerData.shippingAddress2}
                        onChange={onRegisterChange}
                      />
                    </div>

                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Country</label>
                        <input
                          id="shippingCountry"
                          type="text"
                          className="form-control"
                          value={registerData.shippingCountry}
                          onChange={onRegisterChange}
                          required
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">State/Province</label>
                        <input
                          id="shippingState"
                          type="text"
                          className="form-control"
                          value={registerData.shippingState}
                          onChange={onRegisterChange}
                          required
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Postal/Zip</label>
                        <input
                          id="shippingZip"
                          type="text"
                          className="form-control"
                          value={registerData.shippingZip}
                          onChange={onRegisterChange}
                          required
                        />
                      </div>
                    </div>

                    <hr />

                    <h6 className="mb-3">Default Payment</h6>

                    <div className="mb-3">
                      <label className="form-label">Name on card</label>
                      <input
                        id="cardName"
                        type="text"
                        className="form-control"
                        value={registerData.cardName}
                        onChange={onRegisterChange}
                        required
                      />
                    </div>

                    <div className="row">
                      <div className="col-md-8 mb-3">
                        <label className="form-label">Card number</label>
                        <input
                          id="cardNumber"
                          type="text"
                          className="form-control"
                          value={registerData.cardNumber}
                          onChange={onRegisterChange}
                          required
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Expiry</label>
                        <input
                          id="cardExpiry"
                          type="text"
                          className="form-control"
                          value={registerData.cardExpiry}
                          onChange={onRegisterChange}
                          required
                        />
                      </div>
                    </div>

                    <button className="btn btn-dark w-100" type="submit">
                      Create account and continue
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Logged in checkout form
          <div className="row g-4">
            <div className="col-12 col-lg-5">
              <div className="card">
                <div className="card-header bg-light">
                  <strong>Order Summary</strong>
                </div>
                <div className="card-body">
                  {cart.length === 0 ? (
                    <p className="text-muted m-0">Your cart is empty.</p>
                  ) : (
                    <>
                      <ul className="list-group mb-3">
                        {cart.map((item) => (
                          <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                              <div style={{ fontSize: 14 }}>{item.title}</div>
                              <div className="text-muted" style={{ fontSize: 13 }}>
                                Qty: {item.qty}
                              </div>
                            </div>
                            <div>${(Number(item.price) * Number(item.qty)).toFixed(2)}</div>
                          </li>
                        ))}
                      </ul>

                      <div className="d-flex justify-content-between">
                        <strong>Total</strong>
                        <strong>${totalAmount.toFixed(2)}</strong>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-7">
              <div className="card">
                <div className="card-header bg-light">
                  <strong>Shipping and Payment</strong>
                </div>
                <div className="card-body">
                  {loadingProfile ? (
                    <p className="text-muted m-0">Loading saved info...</p>
                  ) : (
                    <form onSubmit={placeOrder}>
                      <div className="mb-3">
                        <div className="text-muted" style={{ fontSize: 13 }}>
                          Logged in as: <strong>{authUser.email}</strong>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="useSaved"
                            id="useSavedYes"
                            checked={useSavedInfo}
                            onChange={() => setUseSavedInfo(true)}
                          />
                          <label className="form-check-label" htmlFor="useSavedYes">
                            Use saved billing and shipping info
                          </label>
                        </div>

                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="useSaved"
                            id="useSavedNo"
                            checked={!useSavedInfo}
                            onChange={() => setUseSavedInfo(false)}
                          />
                          <label className="form-check-label" htmlFor="useSavedNo">
                            Use different info for this order
                          </label>
                        </div>

                        {!useSavedInfo && (
                          <div className="form-check mt-2">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="saveToProfile"
                              checked={saveToProfile}
                              onChange={(e) => setSaveToProfile(e.target.checked)}
                            />
                            <label className="form-check-label" htmlFor="saveToProfile">
                              Save this as my default account info
                            </label>
                          </div>
                        )}
                      </div>

                      <hr />

                      <h6 className="mb-3">Shipping</h6>

                      <div className="mb-3">
                        <label className="form-label">Address</label>
                        <input
                          className="form-control"
                          name="shippingAddress"
                          value={checkoutInfo.shippingAddress}
                          onChange={onCheckoutChange}
                          disabled={useSavedInfo}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Address 2</label>
                        <input
                          className="form-control"
                          name="shippingAddress2"
                          value={checkoutInfo.shippingAddress2}
                          onChange={onCheckoutChange}
                          disabled={useSavedInfo}
                        />
                      </div>

                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Country</label>
                          <input
                            className="form-control"
                            name="shippingCountry"
                            value={checkoutInfo.shippingCountry}
                            onChange={onCheckoutChange}
                            disabled={useSavedInfo}
                            required
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">State/Province</label>
                          <input
                            className="form-control"
                            name="shippingState"
                            value={checkoutInfo.shippingState}
                            onChange={onCheckoutChange}
                            disabled={useSavedInfo}
                            required
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Postal/Zip</label>
                          <input
                            className="form-control"
                            name="shippingZip"
                            value={checkoutInfo.shippingZip}
                            onChange={onCheckoutChange}
                            disabled={useSavedInfo}
                            required
                          />
                        </div>
                      </div>

                      <hr />

                      <h6 className="mb-3">Payment</h6>

                      <div className="mb-3">
                        <label className="form-label">Name on card</label>
                        <input
                          className="form-control"
                          name="cardName"
                          value={checkoutInfo.cardName}
                          onChange={onCheckoutChange}
                          disabled={useSavedInfo}
                          required
                        />
                      </div>

                      <div className="row">
                        <div className="col-md-8 mb-3">
                          <label className="form-label">Card number</label>
                          <input
                            className="form-control"
                            name="cardNumber"
                            value={checkoutInfo.cardNumber}
                            onChange={onCheckoutChange}
                            disabled={useSavedInfo}
                            required
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Expiry</label>
                          <input
                            className="form-control"
                            name="cardExpiry"
                            value={checkoutInfo.cardExpiry}
                            onChange={onCheckoutChange}
                            disabled={useSavedInfo}
                            required
                          />
                        </div>
                      </div>

                      <div className="d-flex gap-2">
                        <button type="button" className="btn btn-outline-secondary w-50" onClick={onQuit} disabled={submitting}>
                          Quit
                        </button>

                        <button className="btn btn-dark w-50" type="submit" disabled={cart.length === 0 || submitting}>
                          {submitting ? "Processing..." : "Place Order"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Checkout;
