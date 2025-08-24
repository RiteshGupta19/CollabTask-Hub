'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { userAPI } from '@/lib/api';
import UserForm from '@/components/UserForm';

interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  // Load users
  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await userAPI.getAll();
      setUsers(usersData);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [refresh]);

  const handleUserCreated = () => {
    setRefresh(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Smart Task Manager
          </h1>
          <p className="text-gray-600 text-lg">
            Manage tasks, assign users, and track dependencies in real-time
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Create User Form */}
          <UserForm onUserCreated={handleUserCreated} />

          {/* Users List */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">All Users</h2>
            
            {loading ? (
              <div className="text-center py-4">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="text-gray-500 text-center py-4">
                No users found. Create your first user!
              </div>
            ) : (
              <div className="space-y-3">
                {users.map(user => (
                  <div key={user.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        href={`/login?username=${user.username}`}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                      >
                        Login
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/login"
              className="block p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <h3 className="font-semibold text-blue-800 mb-2">Login</h3>
              <p className="text-blue-600 text-sm">Access your dashboard and manage tasks</p>
            </Link>

            <Link
              href="/dashboard"
              className="block p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <h3 className="font-semibold text-green-800 mb-2">Dashboard</h3>
              <p className="text-green-600 text-sm">View all tasks and manage the system</p>
            </Link>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Features</h3>
              <ul className="text-gray-600 text-sm space-y-1">
                <li>• Create and assign tasks</li>
                <li>• Set task dependencies</li>
                <li>• Track task progress</li>
                <li>• Filter by priority</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-800 mb-3">How to Get Started:</h3>
          <ol className="text-blue-700 space-y-2">
            <li>1. Create a new user using the form above</li>
            <li>2. Click "Login" next to the user to access the dashboard</li>
            <li>3. Create tasks, assign them to users, and set dependencies</li>
            <li>4. Track progress and manage your team's workflow</li>
          </ol>
        </div>
      </div>
    </div>
  );
}