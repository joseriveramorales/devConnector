const express = require('express');
const connectDB =  require('./config/db');

const app = express();

// Single Endpoint for testing, just sending data to the browser using res.send
app.get('/', (req,res) => res.send('API Running'));

const PORT = process.env.PORT || 6655;

app.listen(PORT, () => console.log('Server started on port ${PORT}'));


