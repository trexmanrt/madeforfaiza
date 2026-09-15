class Color {
  constructor(r, g, b, a = 1) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
  render() {
    return `rgba(${this.r},${this.g},${this.b},${this.a})`;
  }
}

class Particle {
  constructor(x, y, z = 2) {
    this.x = x;
    this.y = y;
    this.z = z; // z is radius
    this.ox = x;
    this.oy = y; // original position (target)
    this.vx = 0;
    this.vy = 0;
    this.color = new Color(255, 105, 180); // pink
  }

  update() {
    // Spring physics: pull toward original position
    const dx = this.ox - this.x;
    const dy = this.oy - this.y;
    this.vx += dx * 0.03; // spring constant
    this.vy += dy * 0.03;
    this.vx *= 0.92; // friction/damping
    this.vy *= 0.92;
    this.x += this.vx;
    this.y += this.vy;
  }
}

const ShapeBuilder = {
  // Create an offscreen canvas
  _canvas: document.createElement('canvas'),
  _ctx: null,

  init() {
    this._ctx = this._canvas.getContext('2d', { willReadFrequently: true });
  },

  letter(text, isCountdown = false) {
    if (!this._ctx) this.init();

    const area = Drawing.getArea();
    this._canvas.width = area.w;
    this._canvas.height = area.h;

    const ctx = this._ctx;
    ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

    // Calculate font size dynamically based on text length and canvas size
    let fontSize;
    if (isCountdown) {
        fontSize = Math.min(area.w, area.h) * 0.8;
    } else {
        const charCount = text.length;
        if (charCount <= 3) {
            fontSize = area.w / 3;
        } else {
            fontSize = area.w / Math.max(charCount, 5) * 1.5;
        }
    }
    
    // clamp font size
    fontSize = Math.min(fontSize, area.h * 0.8);

    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';

    // Draw text centered on offscreen canvas
    ctx.fillText(text, this._canvas.width / 2, this._canvas.height / 2);

    // Get pixel data
    const imageData = ctx.getImageData(0, 0, this._canvas.width, this._canvas.height);
    const data = imageData.data;
    const points = [];

    // Sampling gap based on screen size
    const gap = area.w < 768 ? 6 : 4;

    // Sample pixels at regular intervals
    for (let y = 0; y < this._canvas.height; y += gap) {
      for (let x = 0; x < this._canvas.width; x += gap) {
        const index = (y * this._canvas.width + x) * 4;
        const alpha = data[index + 3];

        if (alpha > 128) { // If pixel is mostly opaque
          points.push({ x, y });
        }
      }
    }

    return points;
  },

  countdownNumber(num) {
    return this.letter(num.toString(), true);
  }
};

const Shape = {
  particles: [],

  switchShape(points) {
    const pCount = this.particles.length;
    const ptCount = points.length;

    const area = Drawing.getArea();

    // If more points than particles, create new particles
    if (ptCount > pCount) {
      for (let i = pCount; i < ptCount; i++) {
        // Start from random edge or random position
        const startX = Math.random() * area.w;
        const startY = Math.random() * area.h;
        this.particles.push(new Particle(startX, startY, Math.random() * 1.5 + 1.5));
      }
    } else if (ptCount < pCount) {
      // If fewer points, remove excess particles
      this.particles.splice(ptCount, pCount - ptCount);
    }

    // Assign each particle a new target position from points
    for (let i = 0; i < ptCount; i++) {
      const p = this.particles[i];
      const pt = points[i];
      p.ox = pt.x;
      p.oy = pt.y;
    }
  },

  render() {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.update();
      Drawing.drawCircle(p, p.color);
    }
  }
};

const Drawing = {
  canvas: null,
  ctx: null,

  init(selector) {
    this.canvas = document.querySelector(selector);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.resize = this.resize.bind(this);
    window.addEventListener('resize', this.resize);
    this.resize();
  },

  resize() {
    if (this.canvas) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  },

  loop(fn) {
    const render = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      fn();
      requestAnimationFrame(render);
    };
    render();
  },

  drawCircle(particle, color) {
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, particle.z, 0, Math.PI * 2, false);
    this.ctx.fillStyle = color.render();
    this.ctx.fill();
  },

  getArea() {
    return { w: this.canvas ? this.canvas.width : window.innerWidth, h: this.canvas ? this.canvas.height : window.innerHeight };
  }
};

const UI = {
  sequence: [],
  timeoutId: null,
  onGiftCallback: null,

  simulate(sequenceString) {
    this.reset();
    this.sequence = sequenceString.split('|');
    this.processSequence();
  },

  processSequence() {
    if (this.sequence.length === 0) return;

    const item = this.sequence.shift().trim();
    if (!item) {
        this.processSequence();
        return;
    }

    let delay = 1900; // Base delay

    if (item.startsWith('#countdown')) {
        const parts = item.split(' ');
        const count = parseInt(parts[1], 10);
        this.runCountdown(count);
        return; // Countdown handles its own sequence progression
    } else if (item.startsWith('#gift')) {
        if (typeof this.onGiftCallback === 'function') {
            this.onGiftCallback();
        }
        this.processSequence();
        return;
    } else {
        // Normal text
        const points = ShapeBuilder.letter(item);
        Shape.switchShape(points);
        // Extra delay for longer words
        if (item.length > 5) {
            delay += (item.length - 5) * 100;
        }
    }

    this.timeoutId = setTimeout(() => {
        this.processSequence();
    }, delay);
  },
  
  runCountdown(n) {
      if (n > 0) {
          const points = ShapeBuilder.countdownNumber(n);
          Shape.switchShape(points);
          this.timeoutId = setTimeout(() => {
              this.runCountdown(n - 1);
          }, 1000);
      } else {
          this.processSequence();
      }
  },

  reset() {
    if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
    }
    this.sequence = [];
  }
};

// Export globals
window.Color = Color;
window.Particle = Particle;
window.ShapeBuilder = ShapeBuilder;
window.Shape = Shape;
window.Drawing = Drawing;
window.UI = UI;
