'use client';

import React, { useState, useEffect } from 'react';
import { taskAPI, userAPI } from '@/lib/api';
import Swal from 'sweetalert2';

interface Task {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  assignedUserId: number;
  dependencies: number[];
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: number;
  username: string;
  email: string;
}

interface TaskListProps {
  userId?: number;
  showBlocked?: boolean;
  refresh?: number;
  onTaskAction?: () => void; // Add this new prop
}

const TaskList: React.FC<TaskListProps> = ({ userId, showBlocked = false, refresh = 0, onTaskAction }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState<string>('');

  // Load tasks and users
  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, tasksData] = await Promise.all([
        userAPI.getAll(),
        showBlocked 
          ? taskAPI.getBlocked() 
          : userId 
            ? taskAPI.getByUser(userId)
            : taskAPI.getAll()
      ]);
      setUsers(usersData);
      setTasks(tasksData);
    } catch (err: any) {
      Swal.fire('Error', 'Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId, showBlocked, refresh]);

  // Get username by user ID
  const getUserName = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user ? user.username : 'Unknown User';
  };

  // Get task title by ID (for dependencies)
  const getTaskTitle = (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    return task ? task.title : `Task ${taskId}`;
  };

  // Check if dependencies are completed
  const checkDependencies = (task: Task) => {
    const incompleteDependencies = task.dependencies
      .map(depId => tasks.find(t => t.id === depId))
      .filter(depTask => depTask && depTask.status !== 'Done');
    
    return {
      canComplete: incompleteDependencies.length === 0,
      incompleteDependencies: incompleteDependencies
    };
  };

  // Filter tasks by priority
  const filteredTasks = priorityFilter 
    ? tasks.filter(task => task.priority === priorityFilter)
    : tasks;

  // Handle status update with dependency validation
  const handleStatusUpdate = async (taskId: number, status: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      // Special validation for "Done" status
      if (status === 'Done') {
        const { canComplete, incompleteDependencies } = checkDependencies(task);
        
        if (!canComplete && incompleteDependencies && incompleteDependencies.length > 0) {
          const incompleteTaskNames = incompleteDependencies
            .map(depTask => `• ${depTask?.title}`)
            .join('<br>');
          
          await Swal.fire({
            icon: 'error',
            title: 'Cannot Complete Task',
            html: `
              <div class="text-left">
                <p class="mb-3">This task cannot be completed because the following dependencies are not finished:</p>
                <div class="bg-red-50 p-3 rounded border-l-4 border-red-400">
                  ${incompleteTaskNames}
                </div>
                <p class="mt-3 text-sm text-gray-600">Please complete all dependencies first before marking this task as done.</p>
              </div>
            `,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Understood'
          });
          return;
        }
        await taskAPI.markComplete(taskId);
      } else {
        await taskAPI.update(taskId, { status });
      }
      
      loadData(); // Refresh the list
      if (onTaskAction) onTaskAction();
      Swal.fire('Success!', 'Task status updated successfully!', 'success');
    } catch (err: any) {
      Swal.fire('Error', err.response?.data?.error || 'Failed to update task status', 'error');
    }
  };

  // Handle task editing with modern UI
  const handleEditTask = async (task: Task) => {
    const result = await Swal.fire({
      title: '<strong>Edit Task</strong>',
      html: `
        <div class="modern-edit-form">
          <style>
            .modern-edit-form {
              text-align: left;
              max-width: 500px;
              margin: 0 auto;
            }
            .form-group {
              margin-bottom: 20px;
            }
            .form-label {
              display: block;
              font-weight: 600;
              color: #374151;
              margin-bottom: 6px;
              font-size: 14px;
            }
            .form-input, .form-textarea, .form-select {
              width: 100%;
              padding: 12px 16px;
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              font-size: 14px;
              transition: all 0.2s;
              box-sizing: border-box;
            }
            .form-input:focus, .form-textarea:focus, .form-select:focus {
              outline: none;
              border-color: #3b82f6;
              box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            .form-textarea {
              min-height: 80px;
              resize: vertical;
            }
            .priority-high { background-color: #fef2f2; }
            .priority-medium { background-color: #fffbeb; }
            .priority-low { background-color: #f0fdf4; }
            .status-done { background-color: #f0fdf4; }
            .status-progress { background-color: #eff6ff; }
            .status-todo { background-color: #f9fafb; }
          </style>
          
          <div class="form-group">
            <label class="form-label">📝 Task Title</label>
            <input id="edit-title" class="form-input" value="${task.title}" placeholder="Enter task title">
          </div>
          
          <div class="form-group">
            <label class="form-label">📄 Description</label>
            <textarea id="edit-description" class="form-textarea" placeholder="Enter task description">${task.description}</textarea>
          </div>
          
          <div class="form-group">
            <label class="form-label">⚡ Priority</label>
            <select id="edit-priority" class="form-select">
              <option value="Low" class="priority-low" ${task.priority === 'Low' ? 'selected' : ''}>🟢 Low Priority</option>
              <option value="Medium" class="priority-medium" ${task.priority === 'Medium' ? 'selected' : ''}>🟡 Medium Priority</option>
              <option value="High" class="priority-high" ${task.priority === 'High' ? 'selected' : ''}>🔴 High Priority</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">📊 Status</label>
            <select id="edit-status" class="form-select">
              <option value="To Do" class="status-todo" ${task.status === 'To Do' ? 'selected' : ''}>📋 To Do</option>
              <option value="In Progress" class="status-progress" ${task.status === 'In Progress' ? 'selected' : ''}>🔄 In Progress</option>
              <option value="Done" class="status-done" ${task.status === 'Done' ? 'selected' : ''}>✅ Done</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">👤 Assign to User</label>
            <select id="edit-user" class="form-select">
              ${users.map(user => 
                `<option value="${user.id}" ${user.id === task.assignedUserId ? 'selected' : ''}>👤 ${user.username}</option>`
              ).join('')}
            </select>
          </div>
        </div>
      `,
      width: 600,
      showCancelButton: true,
      confirmButtonText: '<i class="fas fa-save"></i> Update Task',
      cancelButtonText: '<i class="fas fa-times"></i> Cancel',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      focusConfirm: false,
      customClass: {
        popup: 'modern-swal-popup',
        title: 'modern-swal-title',
        confirmButton: 'modern-confirm-btn',
        cancelButton: 'modern-cancel-btn'
      },
      didOpen: () => {
        // Add custom styles
        const style = document.createElement('style');
        style.textContent = `
          .modern-swal-popup {
            border-radius: 16px !important;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
          }
          .modern-swal-title {
            color: #1f2937 !important;
            font-size: 24px !important;
          }
          .modern-confirm-btn, .modern-cancel-btn {
            border-radius: 8px !important;
            font-weight: 600 !important;
            padding: 12px 24px !important;
            margin: 0 8px !important;
          }
        `;
        document.head.appendChild(style);
      },
      preConfirm: () => {
        const title = (document.getElementById('edit-title') as HTMLInputElement).value.trim();
        const description = (document.getElementById('edit-description') as HTMLTextAreaElement).value.trim();
        const priority = (document.getElementById('edit-priority') as HTMLSelectElement).value;
        const status = (document.getElementById('edit-status') as HTMLSelectElement).value;
        const assignedUserId = parseInt((document.getElementById('edit-user') as HTMLSelectElement).value);
        
        if (!title) {
          Swal.showValidationMessage('📝 Task title is required');
          return false;
        }
        if (!description) {
          Swal.showValidationMessage('📄 Task description is required');
          return false;
        }
        
        return { title, description, priority, status, assignedUserId };
      }
    });

    if (result.isConfirmed && result.value) {
      try {
        // Special handling for "Done" status
        if (result.value.status === 'Done' && task.status !== 'Done') {
          const { canComplete, incompleteDependencies } = checkDependencies(task);
          
          if (!canComplete && incompleteDependencies && incompleteDependencies.length > 0) {
            const incompleteTaskNames = incompleteDependencies
              .map(depTask => `• ${depTask?.title}`)
              .join('<br>');
            
            await Swal.fire({
              icon: 'error',
              title: 'Cannot Complete Task',
              html: `
                <div class="text-left">
                  <p class="mb-3">This task cannot be marked as completed because the following dependencies are not finished:</p>
                  <div class="bg-red-50 p-3 rounded border-l-4 border-red-400">
                    ${incompleteTaskNames}
                  </div>
                  <p class="mt-3 text-sm text-gray-600">Please complete all dependencies first.</p>
                </div>
              `,
              confirmButtonColor: '#d33'
            });
            return;
          }
        }
        
        await taskAPI.update(task.id, result.value);
        loadData();
        if (onTaskAction) onTaskAction();
        Swal.fire({
          icon: 'success',
          title: 'Task Updated!',
          text: 'Task has been updated successfully',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (err: any) {
        Swal.fire('Error', err.response?.data?.error || 'Failed to update task', 'error');
      }
    }
  };

  // Handle task deletion
  const handleDelete = async (taskId: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await taskAPI.delete(taskId);
        loadData();
        if (onTaskAction) onTaskAction();
        Swal.fire('Deleted!', 'Task has been deleted.', 'success');
      } catch (err: any) {
        Swal.fire('Error', err.response?.data?.error || 'Failed to delete task', 'error');
      }
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'To Do': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading tasks...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {showBlocked ? 'Blocked Tasks' : userId ? 'My Tasks' : 'All Tasks'}
        </h2>
        
        {!showBlocked && (
          <div>
            <label htmlFor="priority-filter" className="text-sm font-medium text-gray-700 mr-2">
              Filter by Priority:
            </label>
            <select
              id="priority-filter"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        )}
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          No tasks found
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map(task => {
            const { canComplete } = checkDependencies(task);
            
            return (
              <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{task.title}</h3>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                    {!canComplete && task.status !== 'Done' && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        🚫 Blocked
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-600 mb-3">{task.description}</p>
                
                <div className="text-sm text-gray-500 mb-3">
                  <p><strong>Assigned to:</strong> {getUserName(task.assignedUserId)}</p>
                  {task.dependencies.length > 0 && (
                    <p><strong>Dependencies:</strong> {task.dependencies.map(depId => getTaskTitle(depId)).join(', ')}</p>
                  )}
                  <p><strong>Created:</strong> {new Date(task.createdAt).toLocaleDateString()}</p>
                </div>

                {!showBlocked && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditTask(task)}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                    >
                      ✏️ Edit
                    </button>
                    
                    {/* Quick Complete Button (with dependency check) */}
                    {task.status !== 'Done' && (
                      <button
                        onClick={() => handleStatusUpdate(task.id, 'Done')}
                        disabled={!canComplete}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          canComplete 
                            ? 'bg-green-500 text-white hover:bg-green-600' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        title={!canComplete ? 'Cannot complete: dependencies not finished' : 'Mark as complete'}
                      >
                        ✅ Complete
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TaskList;