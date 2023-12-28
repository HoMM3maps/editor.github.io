const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');
const hexes = [];

const backgroundImage = new Image();
backgroundImage.src = 'water.png'; // Replace 'water.png' with your image path

const hexRadius = 60; // Constant hexagon radius
const lineWidth = 2; // Border width

let horizontalSpacing = -16; // Initial horizontal spacing
let verticalSpacing = -14; // Initial vertical spacing
let rowOffset = 51; // Offset for every other row

const texts = []; // Store text and position

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  redraw();
}

function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const pattern = ctx.createPattern(backgroundImage, 'repeat');
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'black'; // Black outline
  ctx.lineWidth = lineWidth; // Border width

  for (let q = 0; q * (2 * hexRadius + horizontalSpacing) <= canvas.width; q++) {
    for (let r = 0; r * (Math.sqrt(3) * hexRadius + verticalSpacing) <= canvas.height; r++) {
      const x = q * (2 * hexRadius + horizontalSpacing) + (r % 2) * rowOffset;
      const y = r * (Math.sqrt(3) * hexRadius + verticalSpacing);

      drawHex(x, y, hexRadius);
    }
  }

  // Redraw texts
  for (const textData of texts) {
    const { x, y, text } = textData;
    drawText(x, y, text);
  }
}

function drawHex(x, y, radius) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = Math.PI / 3 * i + Math.PI / 6;
    const hx = x + radius * Math.cos(angle);
    const hy = y + radius * Math.sin(angle);
    ctx.lineTo(hx, hy);
  }
  ctx.closePath();
  ctx.stroke(); // Stroke to draw outline
}

function drawText(x, y, text) {
  ctx.font = 'bold 14px Arial'; // Set font style to bold and 14px
  ctx.fillStyle = 'white'; // Set text color to white
  ctx.textAlign = 'center'; // Center the text
  ctx.textBaseline = 'middle'; // Align vertically

  const textArray = text.split(' ');
  const maxCharsPerLine = 10; // Maximum characters per line

  let textY = y;
  for (let i = 0; i < textArray.length; i++) {
    const words = textArray[i].split('\n');
    let line = '';
    for (let j = 0; j < words.length; j++) {
      if ((line + words[j]).length <= maxCharsPerLine) {
        line += words[j] + ' ';
      } else {
        ctx.fillText(line.trim(), x, textY);
        line = words[j] + ' ';
        textY += 16; // Increase for the next line
      }
    }
    ctx.fillText(line.trim(), x, textY);
    textY += 16; // Increase for the next line
  }
}

function updateSpacing(horizontal, vertical) {
  horizontalSpacing = horizontal || 120;
  verticalSpacing = vertical || 100;
  redraw();
}

function updateRowOffset(offset) {
  rowOffset = offset || 0; // Set the row offset
  redraw();
}

function isPointInHexagon(x, y, mouseX, mouseY, radius) {
  const dx = mouseX - x;
  const dy = mouseY - y;
  return (
    dx * dx + dy * dy < radius * radius ||
    (dx * dx + dy * dy < radius * radius && Math.abs(dx * dy) < radius * radius / 2)
  );
}

canvas.addEventListener('mousemove', function(e) {
  const mouseX = e.clientX;
  const mouseY = e.clientY;

  redraw(); // Redraw to clear previous highlights

  for (let q = 0; q * (2 * hexRadius + horizontalSpacing) <= canvas.width; q++) {
    for (let r = 0; r * (Math.sqrt(3) * hexRadius + verticalSpacing) <= canvas.height; r++) {
      const x = q * (2 * hexRadius + horizontalSpacing) + (r % 2) * rowOffset;
      const y = r * (Math.sqrt(3) * hexRadius + verticalSpacing);

      if (isPointInHexagon(x, y, mouseX, mouseY, hexRadius)) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'; // Highlight color
        drawHex(x, y, hexRadius);
      }
    }
  }
});

canvas.addEventListener('click', function(e) {
  const mouseX = e.clientX;
  const mouseY = e.clientY;

  for (let q = 0; q * (2 * hexRadius + horizontalSpacing) <= canvas.width; q++) {
    for (let r = 0; r * (Math.sqrt(3) * hexRadius + verticalSpacing) <= canvas.height; r++) {
      const x = q * (2 * hexRadius + horizontalSpacing) + (r % 2) * rowOffset;
      const y = r * (Math.sqrt(3) * hexRadius + verticalSpacing);

      // Check if clicked inside the hexagon
      if (isPointInHexagon(x, y, mouseX, mouseY, hexRadius)) {
        const text = prompt('Enter text to display:');
        if (text) {
          // Check if there's existing text at this position
          const existingTextIndex = texts.findIndex(
            (item) => item.x === x && item.y === y
          );
          if (existingTextIndex !== -1) {
            texts[existingTextIndex].text = text; // Replace existing text
          } else {
            texts.push({ x, y, text }); // Store text and its position
          }
          redraw();
        }
        return;
      }
    }
  }
});

backgroundImage.onload = function() {
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Apply initial spacing here
  updateSpacing(horizontalSpacing, verticalSpacing);
};
