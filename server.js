require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3005;

// CORS configuration (Allow frontend URL from .env)
app.use(cors({
    origin: process.env.CLIENT_URL || 'https://giriprasad2304.github.io',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}));

// Middleware
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Order Schema and Model
const orderSchema = new mongoose.Schema({
    consumer: String,
    flavour: String,
    quantity: Number,
    phone: String,
    info: String,
    date: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// Menu Schema and Model
const menuSchema = new mongoose.Schema({
    category: String,
    items: [{
        name: String,
        price: String,
        image: String,
        quantity: Number
    }]
});

const Menu = mongoose.model('Menu', menuSchema);

// ✅ Test API
app.get('/api/test', (req, res) => {
    res.send('✅ API is working!');
});

// ✅ Place New Order
app.post('/order', async (req, res) => {
    try {
        const { consumer, flavour, quantity, phone, info } = req.body;

        if (!consumer || !flavour || !quantity || !phone) {
            return res.status(400).json({ message: '⚠️ Missing required fields' });
        }

        const newOrder = new Order({ consumer, flavour, quantity, phone, info });
        await newOrder.save();

        res.status(201).json({ message: '✅ Order placed successfully', order: newOrder });
    } catch (error) {
        console.error('❌ Error placing order:', error);
        res.status(500).json({ message: 'Failed to place order', error: error.message });
    }
});

// ✅ Get All Orders
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find();
        res.json(orders);
    } catch (err) {
        console.error('❌ Error fetching orders:', err);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// ✅ DELETE Order (Fix for Mark as Delivered)
app.delete('/order/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: '⚠️ Invalid order ID' });
        }

        const deletedOrder = await Order.findByIdAndDelete(id);

        if (!deletedOrder) {
            return res.status(404).json({ message: '⚠️ Order not found' });
        }

        res.json({ message: '✅ Order marked as delivered and deleted', order: deletedOrder });
    } catch (error) {
        console.error('❌ Error deleting order:', error);
        res.status(500).json({ message: 'Failed to delete order', error: error.message });
    }
});

// ✅ Graceful Shutdown - Close MongoDB Connection on Server Stop
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('❌ MongoDB connection closed.');
    process.exit(0);
});

// ✅ Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
}).on('error', (err) => {
    console.error('❌ Failed to start server:', err);
});
s
