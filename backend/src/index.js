const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

// ----- Mock payment authorization (every 3rd attempt fails) -----
let paymentAttemptCounter = 0;
function authorizePaymentMock() {
  paymentAttemptCounter += 1;
  // deny every 3rd request
  return paymentAttemptCounter % 3 !== 0;
}

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // react frontend URL
  credentials: true
}));
app.use(express.json());

// get all products (optionally filter by q + category)
app.get('/api/products', async (req, res) => {
  try {
    const q = (req.query.q || "").toString().trim();
    const category = (req.query.category || "").toString().trim();

    const andConditions = [];

    if (category) {
      andConditions.push({ category });
    }

    if (q) {
      andConditions.push({
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { category: { contains: q, mode: "insensitive" } },
        ],
      });
    }

    const where = andConditions.length ? { AND: andConditions } : undefined;

    const products = await prisma.product.findMany({ where });
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// get single product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// get products by category
app.get('/api/products/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const products = await prisma.product.findMany({
      where: { category }
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ error: 'Failed to fetch products by category' });
  }
});

// ---------- Auth: Register (plain text password) ----------
app.post('/api/auth/register', async (req, res) => {
  try {
    const {
      name, email, password, 
      shippingAddress, shippingAddress2, shippingCountry, shippingState, shippingZip,
      cardName, cardNumber, cardExpiry,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    const user = await prisma.user.create({
      data: {
        email: email.trim(),
        password, // plain text on purpose for now
        name: name?.trim() || null,
        role: 'CUSTOMER',

        shippingAddress: shippingAddress?.trim() || null,
        shippingAddress2: shippingAddress2?.trim() || null,
        shippingCountry: shippingCountry?.trim() || null,
        shippingState: shippingState?.trim() || null,
        shippingZip: shippingZip?.trim() || null,

        cardName: cardName?.trim() || null,
        cardNumber: cardNumber?.trim() || null,
        cardExpiry: cardExpiry?.trim() || null,
      },
    });

    // dont send password back in response
    res.status(201).json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// ---------- Auth: Login (plain text password match) ----------
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Plain text comparison (no bcrypt)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // no JWT or cookies for now, just send back the user
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Admin: orders with filtering (customer, product, date range, search)
app.get('/api/admin/orders', async (req, res) => {
  try {
    const userId = req.query.userId ? Number(req.query.userId) : null;
    const productId = req.query.productId ? Number(req.query.productId) : null;

    const q = (req.query.q || "").toString().trim();
    const from = req.query.from ? new Date(req.query.from) : null;
    const toRaw = req.query.to ? new Date(req.query.to) : null;

    const where = {};

    if (Number.isInteger(userId)) {
      where.userId = userId;
    }

    if (Number.isInteger(productId)) {
      where.items = { some: { productId } };
    }

    if (from || toRaw) {
      where.createdAt = {};
      if (from) where.createdAt.gte = from;

      if (toRaw) {
        // include the entire "to" day
        const to = new Date(toRaw);
        to.setHours(23, 59, 59, 999);
        where.createdAt.lte = to;
      }
    }

    if (q) {
      const maybeId = Number(q);
      where.OR = [
        ...(Number.isInteger(maybeId) ? [{ id: maybeId }] : []),
        { user: { email: { contains: q, mode: "insensitive" } } },
        { user: { name: { contains: q, mode: "insensitive" } } },
        { items: { some: { product: { title: { contains: q, mode: "insensitive" } } } } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, name: true } },
        items: { include: { product: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(orders);
  } catch (error) {
    console.error("Admin orders error:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// get simple stats for the dashboard cards
app.get('/api/admin/stats', async (req, res) => {
  const totalSales = await prisma.order.aggregate({ _sum: { total: true } });
  const orderCount = await prisma.order.count();
  const productCount = await prisma.product.count();
  
  res.json({
    revenue: totalSales._sum.total || 0,
    orders: orderCount,
    products: productCount
  });
});

app.patch('/api/admin/products/:id', async (req, res) => {
  const { stock } = req.body;
  try {
    const updated = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: { stock: parseInt(stock) }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
});

// Admin: update customer info (name/email + shipping + billing)
app.patch('/api/admin/users/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid user id" });

  const {
    name, email,
    shippingAddress, shippingAddress2, shippingCountry, shippingState, shippingZip,
    cardName, cardNumber, cardExpiry,
  } = req.body;

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: {
        name: name ?? undefined,
        email: email ?? undefined,

        shippingAddress: shippingAddress ?? undefined,
        shippingAddress2: shippingAddress2 ?? undefined,
        shippingCountry: shippingCountry ?? undefined,
        shippingState: shippingState ?? undefined,
        shippingZip: shippingZip ?? undefined,

        cardName: cardName ?? undefined,
        cardNumber: cardNumber ?? undefined,
        cardExpiry: cardExpiry ?? undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,

        shippingAddress: true,
        shippingAddress2: true,
        shippingCountry: true,
        shippingState: true,
        shippingZip: true,

        cardName: true,
        cardNumber: true,
        cardExpiry: true,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error("Admin update user error:", error);
    res.status(500).json({ error: "Update failed" });
  }
});

// get all users with their history
app.get('/api/admin/users', async (req, res) => {
  const users = await prisma.user.findMany({
    include: { orders: true },
  });
  res.json(users);
});

// checkout process (logged-in users only)
app.post('/api/checkout', async (req, res) => {
  const { userId, cartItems, totalAmount, shipping, payment, saveToProfile } = req.body;

  const uid = Number(userId);
  if (!Number.isInteger(uid)) {
    return res.status(400).json({ success: false, error: "userId is required (login/register first)" });
  }

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({ success: false, error: "Cart is empty" });
  }

  const total = Number(totalAmount);
  if (!Number.isFinite(total)) {
    return res.status(400).json({ success: false, error: "Invalid totalAmount" });
  }

  // mock payment authorization
  if (!authorizePaymentMock()) {
    return res.status(402).json({
      success: false,
      error: "Credit Card Authorization Failed.",
    });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: uid } });
      if (!user) throw new Error("User not found. Please login again.");

      // save profile defaults if selected
      if (saveToProfile) {
        await tx.user.update({
          where: { id: uid },
          data: {
            shippingAddress: shipping?.shippingAddress ?? undefined,
            shippingAddress2: shipping?.shippingAddress2 ?? undefined,
            shippingCountry: shipping?.shippingCountry ?? undefined,
            shippingState: shipping?.shippingState ?? undefined,
            shippingZip: shipping?.shippingZip ?? undefined,

            cardName: payment?.cardName ?? undefined,
            cardNumber: payment?.cardNumber ?? undefined,
            cardExpiry: payment?.cardExpiry ?? undefined,
          },
        });
      }

      // validate stock
      for (const item of cartItems) {
        const pid = Number(item.id);
        const qty = Number(item.qty);
        if (!Number.isInteger(pid) || !Number.isInteger(qty) || qty <= 0) {
          throw new Error("Invalid cart item");
        }

        const product = await tx.product.findUnique({ where: { id: pid } });
        if (!product) throw new Error("Product not found");
        if (product.stock < qty) throw new Error(`Product "${product.title}" is out of stock!`);
      }

      // create order
      const order = await tx.order.create({
        data: {
          userId: uid,
          total: total,
          items: {
            create: cartItems.map((item) => ({
              productId: Number(item.id),
              quantity: Number(item.qty),
            })),
          },
        },
      });

      // decrement stock
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: Number(item.id) },
          data: { stock: { decrement: Number(item.qty) } },
        });
      }

      // clear user DB cart after successful checkout
      await tx.cartItem.deleteMany({ where: { userId: uid } });
      return order;
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: result.id,
    });
  } catch (error) {
    console.error("Checkout error:", error.message);
    res.status(400).json({
      success: false,
      error: error.message || "Checkout failed",
    });
  }
});

// get a user's profile (excluding password)
app.get("/api/users/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid user id" });

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,

      shippingAddress: true,
      shippingAddress2: true,
      shippingCountry: true,
      shippingState: true,
      shippingZip: true,

      cardName: true,
      cardNumber: true,
      cardExpiry: true,
    },
  });

  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

// update a user's profile (excluding password)
app.put("/api/users/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid user id" });

  const {
    name,
    shippingAddress,
    shippingAddress2,
    shippingCountry,
    shippingState,
    shippingZip,
    cardName,
    cardNumber,
    cardExpiry,
  } = req.body;

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: {
        name: name ?? undefined,
        shippingAddress: shippingAddress ?? undefined,
        shippingAddress2: shippingAddress2 ?? undefined,
        shippingCountry: shippingCountry ?? undefined,
        shippingState: shippingState ?? undefined,
        shippingZip: shippingZip ?? undefined,
        cardName: cardName ?? undefined,
        cardNumber: cardNumber ?? undefined,
        cardExpiry: cardExpiry ?? undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,

        shippingAddress: true,
        shippingAddress2: true,
        shippingCountry: true,
        shippingState: true,
        shippingZip: true,

        cardName: true,
        cardNumber: true,
        cardExpiry: true,
      },
    });

    res.json(updated);
  } catch (e) {
    console.error("Update user error:", e);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// purchase history
app.get("/api/users/:id/orders", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid user id" });

  const orders = await prisma.order.findMany({
    where: { userId: id },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  res.json(orders);
});

// -----------------------------
// Cart helpers (CartItem table)
// -----------------------------
const toInt = (v) => {
  const n = Number(v);
  return Number.isInteger(n) ? n : null;
};

const normalizeCartItems = (raw) => {
  const arr = Array.isArray(raw) ? raw : [];
  const map = new Map();

  for (const it of arr) {
    const productId = toInt(it?.productId ?? it?.id);
    const qty = toInt(it?.qty ?? it?.quantity);
    if (!productId || !qty || qty <= 0) continue;
    map.set(productId, (map.get(productId) || 0) + qty);
  }

  return [...map.entries()].map(([productId, quantity]) => ({ productId, quantity }));
};

const cartItemsToFrontend = (cartItems) => {
  // return objects shaped like frontend cart items: { ...productFields, qty: quantity }
  return cartItems.map((ci) => ({
    ...ci.product,
    qty: ci.quantity,
  }));
};

// -----------------
// User Cart Routes
// -----------------

// get a users cart
app.get("/api/users/:id/cart", async (req, res) => {
  const userId = toInt(req.params.id);
  if (!userId) return res.status(400).json({ error: "Invalid user id" });

  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true },
    orderBy: { createdAt: "asc" },
  });

  res.json(cartItemsToFrontend(cartItems));
});

// replace a users cart (sync current cart to DB)
app.put("/api/users/:id/cart", async (req, res) => {
  const userId = toInt(req.params.id);
  if (!userId) return res.status(400).json({ error: "Invalid user id" });

  const normalized = normalizeCartItems(req.body?.items ?? req.body?.cartItems ?? req.body);

  try {
    await prisma.$transaction(async (tx) => {
      const keepIds = normalized.map((x) => x.productId);

      // delete items removed from cart
      await tx.cartItem.deleteMany({
        where: {
          userId,
          ...(keepIds.length ? { productId: { notIn: keepIds } } : {}),
        },
      });

      // upsert current items
      for (const it of normalized) {
        await tx.cartItem.upsert({
          where: { userId_productId: { userId, productId: it.productId } },
          update: { quantity: it.quantity },
          create: { userId, productId: it.productId, quantity: it.quantity },
        });
      }
    });

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: "asc" },
    });

    res.json(cartItemsToFrontend(cartItems));
  } catch (e) {
    console.error("PUT cart error:", e);
    res.status(500).json({ error: "Failed to update cart" });
  }
});

// merge guest cart into users cart (right after login/registration)
app.post("/api/users/:id/cart/merge", async (req, res) => {
  const userId = toInt(req.params.id);
  if (!userId) return res.status(400).json({ error: "Invalid user id" });

  const normalized = normalizeCartItems(req.body?.items ?? req.body?.cartItems ?? req.body);

  try {
    await prisma.$transaction(async (tx) => {
      for (const it of normalized) {
        await tx.cartItem.upsert({
          where: { userId_productId: { userId, productId: it.productId } },
          update: { quantity: { increment: it.quantity } },
          create: { userId, productId: it.productId, quantity: it.quantity },
        });
      }
    });

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: "asc" },
    });

    res.json(cartItemsToFrontend(cartItems));
  } catch (e) {
    console.error("POST merge cart error:", e);
    res.status(500).json({ error: "Failed to merge cart" });
  }
});

// clear users cart
app.delete("/api/users/:id/cart", async (req, res) => {
  const userId = toInt(req.params.id);
  if (!userId) return res.status(400).json({ error: "Invalid user id" });

  await prisma.cartItem.deleteMany({ where: { userId } });
  res.json({ success: true });
});

// test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'E-commerce API is running' });
});

// start server
app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
  console.log(`📦 API Endpoints:`);
  console.log(`   GET http://localhost:${PORT}/api/products`);
  console.log(`   GET http://localhost:${PORT}/api/products/:id`);
  console.log(`   GET http://localhost:${PORT}/api/products/category/:category`);
});
