'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';
import { taskAPI } from '@/lib/api';
import Swal from 'sweetalert2';

interface User {
  id: number;
  username: string;
  email: string;
}

interface TaskStats {
  totalTasks: number;
  myTasks: number;
  completed: number;
  blocked: number;
}

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('all-tasks');
  const [refresh, setRefresh] = useState(0);
  const [taskStats, setTaskStats] = useState<TaskStats>({ totalTasks: 0, myTasks: 0, completed: 0, blocked: 0 });
  const router = useRouter();

  // Load current user from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
      } catch (err) {
        Swal.fire('Error', 'Failed to load user data', 'error');
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  // Load task statistics
  useEffect(() => {
    const loadTaskStats = async () => {
      if (!currentUser) return;

      try {
        const [allTasks, myTasks, blockedTasks] = await Promise.all([
          taskAPI.getAll(),
          taskAPI.getByUser(currentUser.id),
          taskAPI.getBlocked()
        ]);

        const completedTasks = allTasks.filter((task: any) => task.status === 'Done');

        setTaskStats({
          totalTasks: allTasks.length,
          myTasks: myTasks.length,
          completed: completedTasks.length,
          blocked: blockedTasks.length
        });
      } catch (err) {
        Swal.fire('Error', 'Failed to load task statistics', 'error');
      }
    };

    loadTaskStats();
  }, [currentUser, refresh]);

  const handleTaskAction = () => {
  setRefresh(prev => prev + 1);
  // Force immediate stats reload
  setTimeout(() => {
    setRefresh(prev => prev + 1);
  }, 100);
};

  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out of the system',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout!'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('currentUser');
        Swal.fire('Logged Out!', 'You have been successfully logged out.', 'success');
        router.push('/');
      }
    });
  };

  const handleTaskCreated = () => {
    setRefresh(prev => prev + 1);
    Swal.fire('Success!', 'Task created successfully!', 'success');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

const tabs = [
  { id: 'all-tasks', label: 'All Tasks', component: <TaskList refresh={refresh} onTaskAction={handleTaskAction} /> },
  { id: 'my-tasks', label: 'My Tasks', component: <TaskList userId={currentUser.id} refresh={refresh} onTaskAction={handleTaskAction} /> },
  { id: 'blocked-tasks', label: 'Blocked Tasks', component: <TaskList showBlocked refresh={refresh} onTaskAction={handleTaskAction} /> },
  { id: 'create-task', label: 'Create Task', component: <TaskForm onTaskCreated={handleTaskAction} refresh={refresh} /> }, // Add refresh prop
];
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Task Manager Dashboard</h1>
              <p className="text-gray-600">Welcome, {currentUser.username}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">{currentUser.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800">Total Tasks</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{taskStats.totalTasks}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800">My Tasks</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{taskStats.myTasks}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800">Completed</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">{taskStats.completed}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800">Blocked</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">{taskStats.blocked}</p>
          </div>
        </div>

        {/* Active Tab Content */}
        <div>
          {tabs.find(tab => tab.id === activeTab)?.component}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 ">
        <div className="container mx-auto px-4 py-6 position-absolute ">
          <div className="text-center text-gray-500 text-sm">
            <p>&copy; 2025 Smart Task Manager. Built with Next.js and Node.js.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}