import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User API functions
export const userAPI = {
  // Create new user
  create: async (userData: { username: string; email: string }) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Login user
  login: async (username: string) => {
    const response = await api.post('/users/login', { username });
    return response.data;
  },

  // Get all users
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  // Get user by ID
  getById: async (id: number) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
};

// Task API functions
export const taskAPI = {
  // Create new task
  create: async (taskData: {
    title: string;
    description: string;
    priority: string;
    assignedUserId: number;
    dependencies?: number[];
  }) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  // Get all tasks with optional filters
  getAll: async (filters?: { priority?: string; userId?: number }) => {
    const params = new URLSearchParams();
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.userId) params.append('userId', filters.userId.toString());
    
    const response = await api.get(`/tasks?${params.toString()}`);
    return response.data;
  },

  // Get tasks for a specific user
  getByUser: async (userId: number) => {
    const response = await api.get(`/tasks/user/${userId}`);
    return response.data;
  },

  // Get blocked tasks
  getBlocked: async () => {
    const response = await api.get('/tasks/blocked');
    return response.data;
  },

  // Update task
  update: async (id: number, updateData: any) => {
    const response = await api.put(`/tasks/${id}`, updateData);
    return response.data;
  },

  // Mark task as complete
  markComplete: async (id: number) => {
    const response = await api.patch(`/tasks/${id}/complete`);
    return response.data;
  },

  // Delete task
  delete: async (id: number) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
};

export default api;