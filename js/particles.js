
const canvas = document.getElementById('magic-canvas');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

let particles = [];

for (let i = 0; i < 80; i++) {
  particles.push({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 2 + 1,
    dx: (Math.random() - 0.5) * 0.5,
    dy: (Math.random() - 0.5) * 0.5
  });
}

function drawParticles() {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#00f0ff';

  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  moveParticles();
  requestAnimationFrame(drawParticles);
}

function moveParticles() {
  particles.forEach(p => {
    p.x += p.dx;
    p.y += p.dy;

    if (p.x < 0 || p.x > width) p.dx *= -1;
    if (p.y < 0 || p.y > height) p.dy *= -1;
  });
}

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

drawParticles();
