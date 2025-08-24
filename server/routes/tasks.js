const express = require('express');
const Task = require('../models/Task');

const router = express.Router();

// Create new task
router.post('/', (req, res) => {
  try {
    const { title, description, priority, assignedUserId, dependencies } = req.body;
    
    if (!title || !description || !priority || !assignedUserId) {
      return res.status(400).json({ error: 'Title, description, priority, and assignedUserId are required' });
    }

    const task = Task.create({ title, description, priority, assignedUserId, dependencies });
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all tasks
router.get('/', (req, res) => {
  try {
    const { priority, userId } = req.query;
    let tasks = Task.findAll();
    
    // Filter by priority if specified
    if (priority) {
      tasks = tasks.filter(task => task.priority === priority);
    }
    
    // Filter by user if specified
    if (userId) {
      tasks = tasks.filter(task => task.assignedUserId === parseInt(userId));
    }
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get tasks for a specific user
router.get('/user/:userId', (req, res) => {
  try {
    const tasks = Task.findByUserId(req.params.userId);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get blocked tasks
router.get('/blocked', (req, res) => {
  try {
    const blockedTasks = Task.getBlockedTasks();
    res.json(blockedTasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get task by ID
router.get('/:id', (req, res) => {
  try {
    const task = Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update task
router.put('/:id', (req, res) => {
  try {
    const task = Task.update(req.params.id, req.body);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Mark task as complete
router.patch('/:id/complete', (req, res) => {
  try {
    const task = Task.markComplete(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete task
router.delete('/:id', (req, res) => {
  try {
    const deleted = Task.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;