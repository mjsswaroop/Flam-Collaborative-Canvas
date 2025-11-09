class RoomManager {
  constructor() {
    this.rooms = {};
  }

  addUser(roomId, userId, color, name) {
    if (!this.rooms[roomId]) {
      this.rooms[roomId] = {};
    }
    this.rooms[roomId][userId] = { name, color };
  }

  removeUser(roomId, userId) {
    if (this.rooms[roomId]) {
      delete this.rooms[roomId][userId];
    }
  }

  getUsers(roomId) {
    return this.rooms[roomId] || {};
  }
}

module.exports = RoomManager;