require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3005;

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Order schema and model
const orderSchema = new mongoose.Schema({
    consumer: String, // Name of the consumer
    quantity: Number,
    date: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// Define the menuSchema
const menuSchema = new mongoose.Schema({
    category: String,
    items: [
        {
            name: String,
            price: String,
            image: String,
            quantity: Number
        }
    ]
});

// Create the Menu model
const Menu = mongoose.model('Menu', menuSchema);

// Test route
app.get('/api/test', (req, res) => {
    res.send('API is working!');
});

// API endpoint to fetch orders
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find();
        console.log('Orders fetched:', orders); // Debugging log
        res.json(orders);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// API endpoint to delete an order by phone number
app.delete('/api/orders', async (req, res) => {
    try {
        const { phone } = req.body; // Expect phone number in the request body
        const order = await Order.findOneAndDelete({ phone });

        if (!order) {
            return res.status(404).json({ error: 'Order not found or incorrect phone number' });
        }

        res.json({ message: 'Order deleted successfully' });
    } catch (err) {
        console.error('Error deleting order:', err);
        res.status(500).json({ error: 'Failed to delete order' });
    }
});

// Endpoint to update the quantity of a specific item
app.put('/api/menu/update-quantity', async (req, res) => {
    const { category, itemName, newQuantity } = req.body;

    try {
        const menu = await Menu.findOneAndUpdate(
            { category, "items.name": itemName }, // Find the category and item by name
            { $set: { "items.$.quantity": newQuantity } }, // Update the quantity of the matched item
            { new: true } // Return the updated document
        );

        if (!menu) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.json({ message: 'Quantity updated successfully', menu });
    } catch (error) {
        console.error('Error updating quantity:', error);
        res.status(500).json({ error: 'Failed to update quantity' });
    }
});

// Endpoint to fetch categories and items
app.get('/api/menu/categories', async (req, res) => {
    try {
        const categories = await Menu.find({}, 'category items.name'); // Fetch categories and item names
        console.log('Categories fetched:', categories); // Debugging log
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}).on('error', (err) => {
    console.error('Failed to start server:', err);
});

app.post('/api/menu/add-item', async (req, res) => {
    const { category, name, price, image, quantity } = req.body;

    try {
        const menu = await Menu.findOneAndUpdate(
            { category }, // Find the category
            { $push: { items: { name, price, image, quantity } } }, // Add the new item to the items array
            { new: true, upsert: true } // Create the category if it doesn't exist
        );

        res.json({ message: 'Item added successfully', menu });
    } catch (error) {
        console.error('Error adding item:', error);
        res.status(500).json({ error: 'Failed to add item' });
    }
});
