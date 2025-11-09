let canvas;
let ws;
const cursors = new Map();

function initApp() {
  document.getElementById('nameModal').style.display = 'none';
  document.getElementById('app').style.display = 'flex';
  
  canvas = new Canvas(document.getElementById('canvas'));
  ws = new WebSocketClient();
  ws.connect();
  
  // Canvas callbacks
  canvas.onDraw = (strokeData) => ws.sendDraw(strokeData);
  canvas.onMove = (pos) => ws.sendCursorMove(pos);
  
  // WebSocket callbacks
  ws.onInit = (data) => {
    canvas.redrawFromHistory(data.history);
    updateUserList();
    updateCurrentUser();
  };
  
  ws.onUserJoined = () => updateUserList();
  ws.onUserLeft = (data) => {
    removeCursor(data.userId);
    updateUserList();
  };
  
  ws.onDraw = (data) => canvas.drawStroke(data);
  ws.onCursorMove = (data) => showCursor(data.userId, data.userName, data.x, data.y);
  ws.onUndo = () => canvas.redrawFromHistory(ws.history);
  ws.onClear = () => canvas.clear();
  
  setupUI();
  setupKeyboard();
}

function setupUI() {
  document.getElementById('brush').onclick = () => {
    canvas.setTool('brush');
    setActive('brush');
  };
  
  document.getElementById('eraser').onclick = () => {
    canvas.setTool('eraser');
    setActive('eraser');
  };
  
  document.getElementById('color').oninput = (e) => {
    canvas.setColor(e.target.value);
  };
  
  document.getElementById('size').oninput = (e) => {
    const size = parseInt(e.target.value);
    canvas.setSize(size);
    document.getElementById('sizeLabel').textContent = size + 'px';
  };
  
  document.getElementById('undo').onclick = () => {
    const id = canvas.undo();
    if (id) {
      ws.sendUndo(id);
      canvas.redrawFromHistory(ws.history);
    }
  };
  
  document.getElementById('redo').onclick = () => {
    const stroke = canvas.redo();
    if (stroke) {
      ws.sendRedo(stroke);
      canvas.drawStroke(stroke);
    }
  };
  
  document.getElementById('clear').onclick = () => {
    if (confirm('Clear canvas for everyone?')) {
      ws.sendClear();
      canvas.clear();
    }
  };
}

function setupKeyboard() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'b') document.getElementById('brush').click();
    if (e.key === 'e') document.getElementById('eraser').click();
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      document.getElementById('undo').click();
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
      e.preventDefault();
      document.getElementById('redo').click();
    }
  });
}

function setActive(tool) {
  document.querySelectorAll('.toolbar button').forEach(b => b.classList.remove('active'));
  document.getElementById(tool).classList.add('active');
}

function updateUserList() {
  const list = document.getElementById('userList');
  list.innerHTML = '';
  
  const current = ws.getCurrentUser();
  addUser(list, current.userId, current.userName, current.color, true);
  
  Object.entries(ws.getAllUsers()).forEach(([id, user]) => {
    if (id !== current.userId) {
      addUser(list, id, user.name, user.color, false);
    }
  });
}

function addUser(container, id, name, color, isYou) {
  const div = document.createElement('div');
  div.className = 'user-item';
  div.innerHTML = `
    <div class="user-color" style="background: ${color}"></div>
    <span>${name}</span>
    ${isYou ? '<span style="color:#2563eb">(You)</span>' : ''}
  `;
  container.appendChild(div);
}

function updateCurrentUser() {
  const user = ws.getCurrentUser();
  const badge = document.getElementById('currentUser');
  badge.textContent = user.userName;
  badge.style.backgroundColor = user.color;
}

function showCursor(userId, userName, x, y) {
  const layer = document.getElementById('cursors');
  
  if (!cursors.has(userId)) {
    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    
    const label = document.createElement('div');
    label.className = 'cursor-label';
    label.textContent = userName;
    cursor.appendChild(label);
    
    layer.appendChild(cursor);
    cursors.set(userId, cursor);
  }
  
  const cursor = cursors.get(userId);
  const user = ws.getAllUsers()[userId];
  if (user) {
    cursor.style.backgroundColor = user.color;
    cursor.style.left = x + 'px';
    cursor.style.top = y + 'px';
  }
}

function removeCursor(userId) {
  if (cursors.has(userId)) {
    cursors.get(userId).remove();
    cursors.delete(userId);
  }
}

// Join button
document.getElementById('joinBtn').onclick = () => {
  const name = document.getElementById('nameInput').value.trim();
  if (!name) {
    alert('Please enter your name');
    return;
  }
  initApp();
  ws.join(name);
};

// Enter key to join
document.getElementById('nameInput').onkeypress = (e) => {
  if (e.key === 'Enter') {
    document.getElementById('joinBtn').click();
  }
};

window.onload = () => {
  document.getElementById('nameInput').focus();
};