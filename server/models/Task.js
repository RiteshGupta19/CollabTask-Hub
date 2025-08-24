// In-memory task storage
const tasks = new Map();
let taskIdCounter = 1;

class Task {
  constructor(title, description, priority, assignedUserId, dependencies = []) {
    this.id = taskIdCounter++;
    this.title = title;
    this.description = description;
    this.priority = priority; // Low, Medium, High
    this.status = 'To Do'; // To Do, In Progress, Done
    this.assignedUserId = assignedUserId;
    this.dependencies = dependencies; // Array of task IDs
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  // Create new task
  static create(taskData) {
    const { title, description, priority, assignedUserId, dependencies } = taskData;
    const task = new Task(title, description, priority, assignedUserId, dependencies || []);
    tasks.set(task.id, task);
    return task;
  }

  // Get task by ID
  static findById(id) {
    return tasks.get(parseInt(id));
  }

  // Get all tasks
  static findAll() {
    return Array.from(tasks.values());
  }

  // Get tasks by user ID
  static findByUserId(userId) {
    return Array.from(tasks.values()).filter(task => task.assignedUserId === parseInt(userId));
  }

  // Update task
  static update(id, updateData) {
    const task = tasks.get(parseInt(id));
    if (!task) return null;

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        task[key] = updateData[key];
      }
    });
    
    task.updatedAt = new Date();
    return task;
  }

  // Delete task
  static delete(id) {
    return tasks.delete(parseInt(id));
  }

  // Check if task can be marked as complete (dependencies check)
  static canComplete(taskId) {
    const task = tasks.get(parseInt(taskId));
    if (!task) return false;

    // Check if all dependencies are completed
    for (let depId of task.dependencies) {
      const depTask = tasks.get(parseInt(depId));
      if (!depTask || depTask.status !== 'Done') {
        return false;
      }
    }
    return true;
  }

  // Get blocked tasks (tasks that cannot be completed due to dependencies)
  static getBlockedTasks() {
    return Array.from(tasks.values()).filter(task => {
      return task.status !== 'Done' && !this.canComplete(task.id);
    });
  }

  // Mark task as complete (only if dependencies are met)
  static markComplete(id) {
    if (!this.canComplete(id)) {
      throw new Error('Cannot complete task: dependencies not met');
    }
    
    const task = tasks.get(parseInt(id));
    if (task) {
      task.status = 'Done';
      task.updatedAt = new Date();
    }
    return task;
  }
}

module.exports = Task;