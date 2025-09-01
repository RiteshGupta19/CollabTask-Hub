"use client";

import React, { useState, useEffect } from "react";
import { taskAPI, userAPI } from "@/lib/api";
import Swal from "sweetalert2";

interface User {
  id: number;
  username: string;
  email: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  assignedUserId: number;
  dependencies: number[];
}

interface TaskFormProps {
  onTaskCreated?: () => void;
  refresh?: number; // Add this new prop
}

interface TaskFormProps {
  onTaskCreated?: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onTaskCreated, refresh = 0 }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Low");
  const [assignedUserId, setAssignedUserId] = useState<number | "">("");
  const [dependencies, setDependencies] = useState<number[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  // Load users and tasks on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, tasksData] = await Promise.all([
          userAPI.getAll(),
          taskAPI.getAll(),
        ]);
        setUsers(usersData);
        setTasks(tasksData);
      } catch (err) {
        Swal.fire("Error", "Failed to load data", "error");
      }
    };
    loadData();
  }, [refresh]); // Add refresh as dependency

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!assignedUserId) {
        throw new Error("Please select a user to assign the task");
      }

      await taskAPI.create({
        title,
        description,
        priority,
        assignedUserId: Number(assignedUserId),
        dependencies,
      });

      // Reset form
      setTitle("");
      setDescription("");
      setPriority("Low");
      setAssignedUserId("");
      setDependencies([]);

      // Trigger refresh to update dependencies list immediately
      if (onTaskCreated) {
        onTaskCreated();
        // Small delay to ensure backend is updated
        setTimeout(() => {
          if (onTaskCreated) onTaskCreated();
        }, 100);
      }

      Swal.fire("Success!", "Task created successfully!", "success");
    } catch (err: any) {
      Swal.fire(
        "Error",
        err.response?.data?.error || err.message || "Failed to create task",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDependencyChange = (taskId: number, checked: boolean) => {
    if (checked) {
      setDependencies([...dependencies, taskId]);
    } else {
      setDependencies(dependencies.filter((id) => id !== taskId));
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Create New Task</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter task title"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter task description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">   
          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Priority
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="assignedUser"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Assign to User
            </label>
            <select
              id="assignedUser"
              value={assignedUserId}
              onChange={(e) =>
                setAssignedUserId(e.target.value ? Number(e.target.value) : "")
              }
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>
        </div>

        {tasks.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dependencies (Select tasks this depends on)
            </label>
            <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
              {tasks.map((task) => (
                <label
                  key={task.id}
                  className="flex items-center space-x-2 py-1"
                >
                  <input
                    type="checkbox"
                    checked={dependencies.includes(task.id)}
                    onChange={(e) =>
                      handleDependencyChange(task.id, e.target.checked)
                    }
                    className="rounded"
                  />
                  <span className="text-sm">{task.title}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Task"}
        </button>
      </form>
    </div>
  );
};

export default TaskForm;
