/**
 * Matrix Rain Animation Effect (Pink Birthday Theme)
 * 
 * A canvas-based Matrix rain animation featuring falling glowing characters
 * in shades of pink, customizable text, adaptive mobile layout, and trail fade effects.
 */

const MatrixRain = {
  // Canvas and Rendering Context
  canvas: null,
  ctx: null,
  
  // Animation loop interval ID
  interval: null,
  
  // Animation state and column tracking
  columns: 0,
  drops: [],
  columnColors: [],
  delays: [],
  started: [],
  startTime: 0,
  
  // Typography and character set
  fontSize: 25, // Default 25px, adjusts to 13px on mobile devices
  chars: 'HAPPYBIRTHDAY'.split(''),
  
  // Pink-themed color palette (alternating columns)
  color1: '#ff69b4', // Hot pink
  color2: '#ff1493', // Deep pink
  
  // Debounce timer reference for window resizing
  _resizeTimeout: null,
  _resizeHandler: null,

  /**
   * Helper method to detect if the client is on a mobile device
   * @returns {boolean}
   */
  _isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent || navigator.vendor || (typeof window !== 'undefined' && window.opera)
    );
  },

  /**
   * Helper method to initialize column state arrays
   */
  _initArrays() {
    this.drops = new Array(this.columns).fill(0);
    this.columnColors = [];
    this.delays = [];
    this.started = new Array(this.columns).fill(false);

    const now = Date.now();
    for (let i = 0; i < this.columns; i++) {
      // Alternate colors between color1 and color2
      this.columnColors.push(i % 2 === 0 ? this.color1 : this.color2);
      // Stagger column start with random delay between 0 and 2000ms
      this.delays.push(now + Math.random() * 2000);
    }
  },

  /**
   * Initialize canvas dimensions, context, columns, and event listeners
   * @param {string|HTMLCanvasElement} canvasId - The canvas element ID or element itself
   * @returns {MatrixRain} Self instance for chaining
   */
  init(canvasId) {
    // 1. Get canvas element by ID or direct reference
    if (typeof canvasId === 'string') {
      this.canvas = document.getElementById(canvasId);
    } else if (canvasId && canvasId.getContext) {
      this.canvas = canvasId;
    }

    if (!this.canvas) {
      console.error('MatrixRain: Canvas element not found for identifier:', canvasId);
      return this;
    }

    // 2. Get 2D rendering context
    this.ctx = this.canvas.getContext('2d');

    // 3. Set canvas width and height to current window size
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    // 4. Detect mobile and adjust font size accordingly
    const isMobile = this._isMobile();
    this.fontSize = isMobile ? 13 : 25;

    // 5. Calculate total columns based on canvas width and font size
    this.columns = Math.floor(this.canvas.width / this.fontSize);

    // 6. Initialize arrays: drops, columnColors, delays, started
    this._initArrays();

    // 7. Add window resize listener with 100ms debounce
    if (this._resizeHandler && typeof window !== 'undefined') {
      window.removeEventListener('resize', this._resizeHandler);
    }

    this._resizeHandler = () => {
      if (this._resizeTimeout) {
        clearTimeout(this._resizeTimeout);
      }
      this._resizeTimeout = setTimeout(() => {
        this.resize();
      }, 100);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this._resizeHandler);
    }

    // 8. Return this for chaining
    return this;
  },

  /**
   * Start the Matrix Rain animation loop
   * @returns {MatrixRain} Self instance for chaining
   */
  start() {
    // If already running, stop previous loop first
    if (this.interval) {
      this.stop();
    }

    // Record start time
    this.startTime = Date.now();

    // Stagger column start times relative to animation start
    for (let i = 0; i < this.columns; i++) {
      if (!this.started[i] || this.drops[i] === 0) {
        this.delays[i] = this.startTime + Math.random() * 2000;
        this.started[i] = false;
        this.drops[i] = 0;
      }
    }

    // Interval speed: 44ms on mobile (~22.7 fps), 50ms on desktop (20 fps)
    const isMobile = this._isMobile();
    const intervalMs = isMobile ? 44 : 50;

    this.interval = setInterval(() => {
      this.draw();
    }, intervalMs);

    return this;
  },

  /**
   * Main render method executed on every interval tick
   */
  draw() {
    if (!this.ctx || !this.canvas) return;

    // 1. Fill canvas with semi-transparent black for fading trail effect
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 2. Set font style and size
    this.ctx.font = `bold ${this.fontSize}px Menlo, Consolas, monospace`;

    // Maximum drop length before reset (height / fontSize + 2 extra buffer rows)
    const maxLength = Math.floor(this.canvas.height / this.fontSize) + 2;
    const now = Date.now();

    // 3. Process each column
    for (let i = 0; i < this.columns; i++) {
      // Check if delay has elapsed, if so mark column as started
      if (!this.started[i] && now >= this.delays[i]) {
        this.started[i] = true;
      }

      // If started and within max vertical range, render character
      if (this.started[i] && this.drops[i] < maxLength) {
        // Pick random character from chars array
        const char = this.chars[Math.floor(Math.random() * this.chars.length)];

        // Calculate coordinates
        const x = i * this.fontSize;
        const y = this.drops[i] * this.fontSize;

        // Set fill color and glow effect
        this.ctx.fillStyle = this.columnColors[i];
        this.ctx.shadowColor = this.columnColors[i];
        this.ctx.shadowBlur = 8;

        // Draw character
        this.ctx.fillText(char, x, y);

        // Reset shadowBlur to avoid bleeding into other canvas operations
        this.ctx.shadowBlur = 0;
      }

      // Increment drop position if column is active
      if (this.started[i]) {
        this.drops[i]++;

        // If drop reaches or exceeds bottom bounds, reset column
        if (this.drops[i] >= maxLength) {
          this.drops[i] = 0;
          this.delays[i] = Date.now() + Math.random() * 1000; // New random delay 0-1000ms
          this.started[i] = false;
        }
      }
    }
  },

  /**
   * Stop the animation loop and clear canvas
   * @returns {MatrixRain} Self instance for chaining
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    return this;
  },

  /**
   * Update primary colors and recalculate column color mappings
   * @param {string} c1 - Primary color (e.g. '#ff69b4')
   * @param {string} c2 - Secondary alternating color (e.g. '#ff1493')
   * @returns {MatrixRain} Self instance for chaining
   */
  setColors(c1, c2) {
    if (c1) this.color1 = c1;
    if (c2) this.color2 = c2;

    this.columnColors = [];
    for (let i = 0; i < this.columns; i++) {
      this.columnColors.push(i % 2 === 0 ? this.color1 : this.color2);
    }

    return this;
  },

  /**
   * Update character set used for matrix rain
   * @param {string|string[]} text - String or array of characters
   * @returns {MatrixRain} Self instance for chaining
   */
  setChars(text) {
    if (typeof text === 'string' && text.length > 0) {
      this.chars = text.split('');
    } else if (Array.isArray(text) && text.length > 0) {
      this.chars = [...text];
    }

    return this;
  },

  /**
   * Recalculate dimensions on window resize and restart animation if running
   * @returns {MatrixRain} Self instance for chaining
   */
  resize() {
    if (!this.canvas) return this;

    const wasRunning = this.interval !== null;

    // Stop current animation
    if (wasRunning) {
      this.stop();
    }

    // Recalculate dimensions and font size
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    const isMobile = this._isMobile();
    this.fontSize = isMobile ? 13 : 25;
    this.columns = Math.floor(this.canvas.width / this.fontSize);

    // Reinitialize state arrays
    this._initArrays();

    // Restart if it was previously active
    if (wasRunning) {
      this.start();
    }

    return this;
  }
};

// Export for module systems (CommonJS / ES) and attach to global window
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MatrixRain;
}
if (typeof window !== 'undefined') {
  window.MatrixRain = MatrixRain;
}
