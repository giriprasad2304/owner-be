require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3005; // Use environment PORT for Render

// CORS configuration
app.use(cors({
    origin: 'https://giriprasad2304.github.io', // Allow your GitHub Pages domain
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed methods
    allowedHeaders: ['Content-Type'], // Allowed headers
    credentials: true // If you need to send cookies or auth headers
}));

// Middleware
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Order schema and model
const orderSchema = new mongoose.Schema({
    consumer: String,
    flavour: String,    // Added missing fields from frontend
    quantity: Number,
    phone: String,      // Added missing fields from frontend
    info: String,       // Added missing fields from frontend
    date: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// Menu schema and model
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

// Test route
app.get('/api/test', (req, res) => {
    res.send('API is working!');
});

// NEW ORDER ENDPOINT - This is what your frontend is calling
app.post('/order', async (req, res) => {
    try {
        const { consumer, flavour, quantity, phone, info } = req.body;
        
        // Basic validation
        if (!consumer || !flavour || !quantity || !phone) {
            return res.status(400).json({ 
                message: 'Missing required fields' 
            });
        }

        const newOrder = new Order({
            consumer,
            flavour,
            quantity,
            phone,
            info
        });

        await newOrder.save();
        res.status(201).json({ 
            message: 'Order placed successfully',
            order: newOrder 
        });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ 
            message: 'Failed to place order',
            error: error.message 
        });
    }
});

// Existing endpoints...
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find();
        res.json(orders);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// ... [rest of your existing endpoints remain the same]

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}).on('error', (err) => {
    console.error('Failed to start server:', err);
});

// Your other endpoints (delete, update, etc.) remain unchanged
