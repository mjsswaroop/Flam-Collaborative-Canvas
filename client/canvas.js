class Canvas {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.drawing = false;
    this.points = [];
    this.tool = 'brush';
    this.color = '#000000';
    this.size = 3;
    this.myStrokes = [];
    this.undoStack = [];
    this.redoStack = [];
    this.strokeCache = new Map();
    this.onDraw = null;
    this.onMove = null;
    
    this.init();
  }

  init() {
    this.resize();
    this.setupEvents();
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width - 32;
    this.canvas.height = rect.height - 32;
  }

  setupEvents() {
    this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
    this.canvas.addEventListener('mousemove', (e) => this.draw(e));
    this.canvas.addEventListener('mouseup', () => this.stopDrawing());
    this.canvas.addEventListener('mouseleave', () => this.stopDrawing());
  }

  getPosition(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (this.canvas.width / rect.width),
      y: (e.clientY - rect.top) * (this.canvas.height / rect.height)
    };
  }

  startDrawing(e) {
    this.drawing = true;
    this.points = [];
    const pos = this.getPosition(e);
    this.points.push(pos);
    
    this.ctx.beginPath();
    this.ctx.moveTo(pos.x, pos.y);
    this.ctx.strokeStyle = this.tool === 'eraser' ? '#FFFFFF' : this.color;
    this.ctx.lineWidth = this.size;
    this.ctx.lineCap = 'round';
  }

  draw(e) {
    const pos = this.getPosition(e);
    
    if (this.onMove) {
      this.onMove(pos);
    }
    
    if (!this.drawing) return;
    
    this.points.push(pos);
    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.stroke();
  }

  stopDrawing() {
    if (!this.drawing) return;
    this.drawing = false;
    
    if (this.points.length < 2) return;
    
    const strokeId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const strokeData = {
      strokeId,
      tool: this.tool,
      color: this.color,
      size: this.size,
      points: [...this.points]
    };
    
    this.myStrokes.push(strokeId);
    this.undoStack.push(strokeId);
    this.strokeCache.set(strokeId, strokeData);
    this.redoStack = [];
    
    if (this.onDraw) {
      this.onDraw(strokeData);
    }
  }

  drawStroke(stroke) {
    if (!stroke || !stroke.points || stroke.points.length < 2) return;
    
    this.ctx.beginPath();
    this.ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    this.ctx.strokeStyle = stroke.tool === 'eraser' ? '#FFFFFF' : stroke.color;
    this.ctx.lineWidth = stroke.size;
    this.ctx.lineCap = 'round';
    
    for (let i = 1; i < stroke.points.length; i++) {
      this.ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    this.ctx.stroke();
  }

  redrawFromHistory(history) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    history.forEach(stroke => this.drawStroke(stroke));
  }

  undo() {
    if (this.undoStack.length === 0) return null;
    const strokeId = this.undoStack.pop();
    this.redoStack.push(strokeId);
    return strokeId;
  }

  redo() {
    if (this.redoStack.length === 0) return null;
    const strokeId = this.redoStack.pop();
    this.undoStack.push(strokeId);
    return this.strokeCache.get(strokeId);
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.myStrokes = [];
    this.undoStack = [];
    this.redoStack = [];
    this.strokeCache.clear();
  }

  setTool(tool) { this.tool = tool; }
  setColor(color) { this.color = color; }
  setSize(size) { this.size = size; }
}