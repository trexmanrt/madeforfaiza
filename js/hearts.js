/**
 * ====================================================================
 * 💖 Floating Hearts Module
 * ====================================================================
 * Spawns romantic floating heart emojis with randomized sizes, speeds,
 * trajectories, and smooth upward float animations for Faiza's birthday celebration.
 */

const Hearts = {
  // Interval timer identifier
  interval: null,

  // Active state tracker
  active: false,

  // Variety of pink & romantic heart emojis
  emojis: ['❤️', '💕', '💖', '💗', '💘', '💝', '💞', '💓', '🩷'],

  /**
   * Starts spawning floating heart emojis at regular 300ms intervals
   * @returns {Hearts} Self instance for chaining
   */
  start() {
    if (this.active && this.interval) {
      return this;
    }

    this.active = true;

    // Spawn an initial heart immediately
    this._createHeart();

    // Set recurring timer to spawn a new heart every 300ms
    this.interval = setInterval(() => {
      if (this.active) {
        this._createHeart();
      }
    }, 300);

    return this;
  },

  /**
   * Spawns a single floating heart element and attaches it to the DOM
   * @private
   */
  _createHeart() {
    const heart = document.createElement('div');
    heart.className = 'heart';

    // 1. Random heart emoji from palette
    const emoji = this.emojis[Math.floor(Math.random() * this.emojis.length)];
    heart.textContent = emoji;

    // 2. Random font size between 15px and 35px
    const fontSize = Math.floor(Math.random() * 21) + 15;

    // 3. Random horizontal position across viewport width (0 - 100vw)
    const leftPos = Math.random() * 100;

    // 4. Random animation duration between 3s and 6s
    const duration = (Math.random() * 3 + 3).toFixed(2);

    // Apply inline style overrides for smooth animation and randomized appearance
    heart.style.position = 'fixed';
    heart.style.fontSize = `${fontSize}px`;
    heart.style.left = `${leftPos}vw`;
    heart.style.bottom = '-20px';
    heart.style.animationDuration = `${duration}s`;
    heart.style.pointerEvents = 'none';
    heart.style.zIndex = '1000';

    // Cleanup: Remove heart element when its float animation completes
    heart.addEventListener('animationend', () => {
      if (heart.parentNode) {
        heart.remove();
      }
    });

    // Fallback safety cleanup timer in case animationend does not fire
    setTimeout(() => {
      if (heart.parentNode) {
        heart.remove();
      }
    }, (parseFloat(duration) + 1) * 1000);

    // Append to document body
    document.body.appendChild(heart);
  },

  /**
   * Stops heart generation and removes all existing hearts from the screen
   * @returns {Hearts} Self instance for chaining
   */
  stop() {
    this.active = false;

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    // Remove all floating heart elements from the DOM
    const existingHearts = document.querySelectorAll('.heart');
    existingHearts.forEach(heart => heart.remove());

    return this;
  },
};

// Expose globally to window and export for module systems
if (typeof window !== 'undefined') {
  window.Hearts = Hearts;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Hearts;
}
