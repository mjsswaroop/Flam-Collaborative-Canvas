# Architecture Documentation

## Data Flow Diagram
[User Input] → [Canvas.js] → [WebSocket Client] → [Server] → [Broadcast] → [All Clients]

## WebSocket Protocol
- `draw`: {strokeId, tool, color, size, points[]}
- `cursor_move`: {x, y}
- `undo`: {strokeId}
- `clear_canvas`: {}

## Undo/Redo Strategy
- Each stroke gets unique ID (timestamp + random)
- Server maintains full history array
- Undo removes from history by ID
- Client redraws entire canvas from history
- Limitation: Only undoes own strokes

## Conflict Resolution
- Last-write-wins approach
- Strokes rendered in order received
- No merge conflicts (canvas layers naturally)

## Performance Decisions
- Full canvas redraw on undo (simple but not optimal)
- No point throttling (sends all mouse movements)
- In-memory storage only (lost on server restart)
