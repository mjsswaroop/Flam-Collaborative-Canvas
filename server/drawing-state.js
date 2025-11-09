class DrawingState {
  constructor() {
    this.history = {};
  }

  addStroke(roomId, stroke) {
    if (!this.history[roomId]) {
      this.history[roomId] = [];
    }
    this.history[roomId].push(stroke);
  }

  removeStroke(roomId, strokeId) {
    if (!this.history[roomId]) return;
    this.history[roomId] = this.history[roomId].filter(
      s => s.strokeId !== strokeId
    );
  }

  getHistory(roomId) {
    return this.history[roomId] || [];
  }

  clearHistory(roomId) {
    this.history[roomId] = [];
  }
}

module.exports = DrawingState;