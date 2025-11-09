class WebSocketClient {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.userId = null;
    this.userName = null;
    this.userColor = null;
    this.users = {};
    this.history = [];
    
    this.onInit = null;
    this.onUserJoined = null;
    this.onUserLeft = null;
    this.onDraw = null;
    this.onCursorMove = null;
    this.onUndo = null;
    this.onClear = null;
  }

  connect() {
    this.socket = io();
    
    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.connected = true;
      this.userId = this.socket.id;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected');
      this.connected = false;
    });

    this.socket.on('init', (data) => {
      this.userId = data.userId;
      this.userName = data.userName;
      this.userColor = data.color;
      this.users = data.users;
      this.history = data.history;
      if (this.onInit) this.onInit(data);
    });

    this.socket.on('user_joined', (data) => {
      this.users[data.userId] = { name: data.userName, color: data.color };
      if (this.onUserJoined) this.onUserJoined(data);
      this.showNotification(`${data.userName} joined`);
    });

    this.socket.on('user_left', (data) => {
      delete this.users[data.userId];
      if (this.onUserLeft) this.onUserLeft(data);
      this.showNotification(`${data.userName} left`);
    });

    this.socket.on('draw', (data) => {
      this.history.push(data);
      if (this.onDraw) this.onDraw(data);
    });

    this.socket.on('cursor_move', (data) => {
      if (this.onCursorMove) this.onCursorMove(data);
    });

    this.socket.on('undo', (data) => {
      this.history = this.history.filter(s => s.strokeId !== data.strokeId);
      if (this.onUndo) this.onUndo();
    });

    this.socket.on('clear_canvas', () => {
      this.history = [];
      if (this.onClear) this.onClear();
    });
  }

  join(userName, room = 'default') {
    this.socket.emit('join', { name: userName, room });
  }

  sendDraw(strokeData) {
    this.socket.emit('draw', strokeData);
  }

  sendCursorMove(pos) {
    this.socket.emit('cursor_move', pos);
  }

  sendUndo(strokeId) {
    this.socket.emit('undo', { strokeId });
  }

  sendRedo(strokeData) {
    this.socket.emit('redo', { stroke: strokeData });
  }

  sendClear() {
    this.socket.emit('clear_canvas');
  }

  showNotification(message) {
    const container = document.getElementById('notifications');
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.textContent = message;
    container.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
  }

  getCurrentUser() {
    return { userId: this.userId, userName: this.userName, color: this.userColor };
  }

  getAllUsers() {
    return this.users;
  }
}