/**
 * ====================================================================
 * 🎆 Fireworks Effect Module
 * ====================================================================
 * Creates vibrant, sparkling pink/rose fireworks bursts with physics,
 * glowing trails, gravity, and smooth canvas fading for Faiza's birthday celebration.
 */

const Fireworks = {
  // Canvas and 2D rendering context
  canvas: null,
  ctx: null,

  // Active particle list & state
  particles: [],
  active: false,
  animationId: null,

  // Pink-themed color palette
  colors: [
    '#ff69b4', // Hot pink
    '#ff1493', // Deep pink
    '#ff6b9d', // Charm pink
    '#c471ed', // Lavender violet
    '#f64f59', // Rose coral
    '#ffd700', // Gold sparkle
    '#ff4081', // Vivid pink
    '#e91e63', // Crimson rose
  ],

  /**
   * Initializes the Fireworks canvas and binds resize listener
   * @param {string|HTMLCanvasElement} canvasId - Canvas element ID or canvas instance
   * @returns {Fireworks} Self instance for chaining
   */
  init(canvasId) {
    if (typeof canvasId === 'string') {
      this.canvas = document.getElementById(canvasId);
    } else if (canvasId && canvasId.getContext) {
      this.canvas = canvasId;
    }

    if (!this.canvas) {
      console.warn('Fireworks: Canvas element not found with ID:', canvasId);
      return this;
    }

    this.ctx = this.canvas.getContext('2d');
    this.resize();

    // Bind window resize
    window.removeEventListener('resize', this._resizeBound);
    this._resizeBound = () => this.resize();
    window.addEventListener('resize', this._resizeBound);

    return this;
  },

  /**
   * Adjusts canvas resolution to match full screen dimensions
   */
  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },

  /**
   * Launches multiple firework bursts at random positions on screen
   * @returns {Fireworks} Self instance for chaining
   */
  launch() {
    if (!this.canvas) return this;

    const width = this.canvas.width;
    const height = this.canvas.height;

    // Number of simultaneous bursts (2 to 4 bursts per launch)
    const burstCount = Math.floor(Math.random() * 3) + 2;

    for (let i = 0; i < burstCount; i++) {
      // Random coordinates in the upper/middle portion of viewport
      const x = width * (0.15 + Math.random() * 0.7);
      const y = height * (0.15 + Math.random() * 0.45);

      // Stagger burst creation slightly
      setTimeout(() => {
        this.createBurst(x, y);
      }, i * 150);
    }

    // Set active state and start animation loop if not already running
    if (!this.active) {
      this.active = true;
      this.animate();
    }

    return this;
  },

  /**
   * Creates an explosion burst of 80-120 particles at specified coordinates
   * @param {number} x - Burst center X coordinate
   * @param {number} y - Burst center Y coordinate
   */
  createBurst(x, y) {
    // 80 to 120 particles per burst
    const count = Math.floor(Math.random() * 41) + 80;

    for (let i = 0; i < count; i++) {
      // Full circle angle distribution
      const angle = Math.random() * Math.PI * 2;

      // Random speed velocity between 2 and 8
      const speed = Math.random() * 6 + 2;

      // Calculate velocity components
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      // Pick random color from palette
      const color = this.colors[Math.floor(Math.random() * this.colors.length)];

      // Particle attributes
      this.particles.push({
        x: x,
        y: y,
        vx: vx,
        vy: vy,
        alpha: 1.0,
        decay: Math.random() * 0.02 + 0.01, // 0.01 to 0.03
        size: Math.random() * 2 + 2,         // 2 to 4 px radius
        color: color,
        gravity: 0.05,
        friction: 0.98,
        trail: [],                           // Trail coordinate history
        maxTrail: 5,
      });
    }

    // Ensure loop is running when new particles arrive
    if (!this.active) {
      this.active = true;
      this.animate();
    }
  },

  /**
   * Main requestAnimationFrame animation loop
   */
  animate() {
    if (!this.active || !this.ctx || !this.canvas) return;

    // 1. Clear canvas with slight fade for trailing glow effect
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.globalCompositeOperation = 'source-over';

    const remainingParticles = [];

    // 2. Process each particle
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Save previous position to trail
      p.trail.push({ x: p.x, y: p.y, alpha: p.alpha });
      if (p.trail.length > p.maxTrail) {
        p.trail.shift();
      }

      // Physics update: gravity, friction, velocity
      p.vy += p.gravity;
      p.vx *= p.friction;
      p.vy *= p.friction;
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;

      // Skip and discard dead particles
      if (p.alpha <= 0) continue;

      remainingParticles.push(p);

      // Draw particle trail
      if (p.trail.length > 1) {
        this.ctx.beginPath();
        this.ctx.moveTo(p.trail[0].x, p.trail[0].y);
        for (let j = 1; j < p.trail.length; j++) {
          this.ctx.lineTo(p.trail[j].x, p.trail[j].y);
        }
        this.ctx.strokeStyle = p.color;
        this.ctx.globalAlpha = Math.max(0, p.alpha * 0.4);
        this.ctx.lineWidth = Math.max(1, p.size * 0.6);
        this.ctx.stroke();
      }

      // Draw glowing particle circle
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2, false);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.shadowColor = p.color;
      this.ctx.shadowBlur = 10;
      this.ctx.fill();

      // Reset canvas state
      this.ctx.shadowBlur = 0;
      this.ctx.globalAlpha = 1.0;
    }

    this.particles = remainingParticles;

    // Continue animation loop if particles still exist
    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      this.active = false;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  },

  /**
   * Stops all animations and clears canvas
   */
  stop() {
    this.active = false;
    this.particles = [];

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  },
};

// Expose globally to window and export for module systems
if (typeof window !== 'undefined') {
  window.Fireworks = Fireworks;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Fireworks;
}
