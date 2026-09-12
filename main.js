const { useState, useRef, useEffect, useCallback } = React;

const WIDTH = 600;
const HEIGHT = 400;

const BUTTON = { x: WIDTH / 2 - 100, y: 190, w: 200, h: 70 };

function drawScene(ctx, count, hover, pressed) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = '#1e1e2e';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // 3. Draw the title text
  ctx.fillStyle = '#cdd6f4';
  ctx.font = 'bold 32px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Click Counter', WIDTH / 2, 60);

  // 4. Draw the number (the current count)
  ctx.font = '48px sans-serif';
  ctx.fillStyle = '#f5e0dc';
  ctx.fillText(String(count), WIDTH / 2, 130);

  // 5. Draw the button background
  // We use paths to draw a rounded rectangle
  const radius = 14;
  const { x, y, w, h } = BUTTON;
  
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();

  // Change color based on interaction state
  ctx.fillStyle = pressed ? '#89b4fa' : hover ? '#a6adc8' : '#cdd6f4';
  ctx.fill();

  // 6. Draw the button text
  ctx.fillStyle = '#11111b';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('Click me', x + w / 2, y + h / 2);
}

// 1. Check if an (x, y) coordinate falls inside our button boundaries
function pointInButton(x, y) {
  return (
    x >= BUTTON.x &&
    x <= BUTTON.x + BUTTON.w &&
    y >= BUTTON.y &&
    y <= BUTTON.y + BUTTON.h
  );
}

function App() {
  const canvasRef = useRef(null);

  // 1. Define our state variables
  const [count, setCount] = useState(0);
  const [hover, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);

  // 2. Synchronize our React state with the Canvas drawing
  useEffect(() => {
    // Grab the 2D drawing tools from our canvas element
    const ctx = canvasRef.current.getContext('2d');
    
    // Draw the scene using our current state variables!
    drawScene(ctx, count, hover, pressed);
    
  // 3. The Dependency Array
  }, [count, hover, pressed]);
    // 1. Convert global browser coordinates to canvas-specific coordinates
  const getPos = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  // 2. Handle Mouse Movement (Hover State)
  const onMouseMove = useCallback((e) => {
    const { x, y } = getPos(e);
    setHover(pointInButton(x, y));
  }, [getPos]);

  // 3. Handle Mouse Down (Pressed State)
  const onMouseDown = useCallback((e) => {
    const { x, y } = getPos(e);
    if (pointInButton(x, y)) setPressed(true);
  }, [getPos]);

  // 4. Handle Mouse Up (The actual "Click")
  const onMouseUp = useCallback((e) => {
    const { x, y } = getPos(e);
    
    // Only register a click if they pressed down ON the button, 
    // and also released ON the button!
    if (pressed && pointInButton(x, y)) {
      setCount((c) => c + 1);
    }
    setPressed(false);
  }, [getPos, pressed]);
  return React.createElement('canvas', {
    ref: canvasRef,
    width: WIDTH,
    height: HEIGHT,
    onMouseMove: onMouseMove,
    onMouseDown: onMouseDown,
    onMouseUp: onMouseUp,
  });
}

ReactDOM.createRoot(document.body).render(React.createElement(App));