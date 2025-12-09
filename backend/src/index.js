const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Your React frontend URL
  credentials: true
}));
app.use(express.json());

// 1. Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// 2. Get single product by ID
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

// 3. Get products by category
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

// Test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'E-commerce API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
  console.log(`📦 API Endpoints:`);
  console.log(`   GET http://localhost:${PORT}/api/products`);
  console.log(`   GET http://localhost:${PORT}/api/products/:id`);
  console.log(`   GET http://localhost:${PORT}/api/products/category/:category`);
});