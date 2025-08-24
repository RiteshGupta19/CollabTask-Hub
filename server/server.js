const express = require('express');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/users');
const taskRoutes = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Task Manager API is running!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});