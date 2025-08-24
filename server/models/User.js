// In-memory user storage
const users = new Map();
let userIdCounter = 1;

class User {
  constructor(username, email) {
    this.id = userIdCounter++;
    this.username = username;
    this.email = email;
    this.createdAt = new Date();
  }

  // Create new user
  static create(userData) {
    const { username, email } = userData;
    
    // Check if user already exists
    for (let user of users.values()) {
      if (user.username === username || user.email === email) {
        throw new Error('User already exists');
      }
    }
    
    const user = new User(username, email);
    users.set(user.id, user);
    return user;
  }

  // Get user by ID
  static findById(id) {
    return users.get(parseInt(id));
  }

  // Get user by username (for login)
  static findByUsername(username) {
    for (let user of users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return null;
  }

  // Get all users
  static findAll() {
    return Array.from(users.values());
  }

  // Delete user
  static delete(id) {
    return users.delete(parseInt(id));
  }
}

module.exports = User;