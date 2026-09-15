/**
 * ========================================
 * 🎂 Happy Birthday Faiza - Main App
 * ========================================
 * Orchestrates all effects in sequence:
 * Matrix Rain → Countdown → Text Sequence → Fireworks → GIF → Book → Hearts
 */

const App = {
  // State
  isPlaying: false,
  isStarted: false,
  musicPlaying: false,

  // Elements
  elements: {
    audio: null,
    musicBtn: null,
    matrixCanvas: null,
    particleCanvas: null,
    fireworkCanvas: null,
    giftImage: null,
    contentDisplay: null,
    contentText: null,
    bookContainer: null,
    orientationLock: null,
    starsContainer: null,
  },

  // Settings
  settings: {
    music: '',
    countdown: 3,
    matrixText: 'HAPPYBIRTHDAY',
    matrixColor1: '#ff69b4',
    matrixColor2: '#ff1493',
    sequence: 'HAPPY|BIRTHDAY|DEAR|FAIZA|❤',
    sequenceColor: '#ff69b4',
    gift: '',
    enableBook: true,
    enableHeart: true,
    pages: [],
  },

  /**
   * Initialize the app
   */
  init() {
    this.cacheElements();
    this.setupMusic();
    this.checkOrientation();
    this.createStars();

    // Make settings globally available
    window.settings = this.settings;

    console.log('🎂 Happy Birthday Faiza - App Initialized!');
  },

  /**
   * Cache DOM elements
   */
  cacheElements() {
    this.elements.audio = document.getElementById('birthdayAudio');
    this.elements.musicBtn = document.getElementById('musicControl');
    this.elements.matrixCanvas = document.getElementById('matrix-rain');
    this.elements.particleCanvas = document.querySelector('.canvas');
    this.elements.fireworkCanvas = document.getElementById('firework-canvas');
    this.elements.giftImage = document.getElementById('gift-image');
    this.elements.contentDisplay = document.getElementById('contentDisplay');
    this.elements.contentText = document.getElementById('contentText');
    this.elements.bookContainer = document.querySelector('.book-container');
    this.elements.orientationLock = document.getElementById('orientation-lock');
    this.elements.starsContainer = document.getElementById('starsContainer');
  },

  /**
   * Setup music player
   */
  setupMusic() {
    const btn = this.elements.musicBtn;
    if (!btn) return;

    btn.addEventListener('click', () => {
      this.toggleMusic();
    });
  },

  /**
   * Toggle music play/pause
   */
  toggleMusic() {
    const audio = this.elements.audio;
    const btn = this.elements.musicBtn;
    if (!audio || !btn) return;

    if (this.musicPlaying) {
      audio.pause();
      btn.textContent = '▶';
      btn.title = 'Play Music';
      this.musicPlaying = false;
    } else {
      audio.play().then(() => {
        btn.textContent = '⏸';
        btn.title = 'Pause Music';
        this.musicPlaying = true;
      }).catch(err => {
        console.log('Music autoplay blocked, user interaction needed');
      });
    }
  },

  /**
   * Start music (called from user interaction)
   */
  startMusic() {
    const audio = this.elements.audio;
    const btn = this.elements.musicBtn;
    if (!audio || this.musicPlaying) return;

    audio.play().then(() => {
      if (btn) {
        btn.textContent = '⏸';
        btn.title = 'Pause Music';
      }
      this.musicPlaying = true;
    }).catch(() => {});
  },

  /**
   * Check device orientation
   */
  checkOrientation() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const lock = this.elements.orientationLock;

    if (!isMobile) {
      // Desktop - start immediately
      if (lock) lock.style.display = 'none';
      this.startWebsite();
      return;
    }

    // Mobile - check orientation
    const mediaQuery = window.matchMedia("(orientation: landscape)");

    const handleOrientation = (isLandscape) => {
      if (isLandscape) {
        if (lock) lock.style.display = 'none';
        this.showCanvases(true);
        this.startWebsite();
      } else {
        if (lock) lock.style.display = 'flex';
        this.showCanvases(false);
        this.stopWebsite();
      }
    };

    handleOrientation(mediaQuery.matches);
    mediaQuery.addEventListener('change', (e) => handleOrientation(e.matches));
  },

  /**
   * Show/hide canvas elements
   */
  showCanvases(show) {
    const display = show ? 'block' : 'none';
    if (this.elements.matrixCanvas) this.elements.matrixCanvas.style.display = display;
    if (this.elements.particleCanvas) this.elements.particleCanvas.style.display = display;
    if (this.elements.bookContainer) this.elements.bookContainer.style.display = show ? '' : 'none';
  },

  /**
   * Start the website experience
   */
  startWebsite() {
    if (this.isStarted) return;
    this.isStarted = true;

    // Initialize matrix rain
    if (typeof MatrixRain !== 'undefined') {
      MatrixRain.init('matrix-rain');
      MatrixRain.setColors(this.settings.matrixColor1, this.settings.matrixColor2);
      MatrixRain.setChars(this.settings.matrixText);
      MatrixRain.start();
    }

    // Initialize particle drawing system
    if (typeof Drawing !== 'undefined') {
      Drawing.init('.canvas');

      Drawing.loop(() => {
        if (typeof Shape !== 'undefined') {
          Shape.render();
        }
      });
    }

    // Start the main sequence
    this.startSequence();
  },

  /**
   * Stop the website
   */
  stopWebsite() {
    if (typeof MatrixRain !== 'undefined') MatrixRain.stop();
    this.isStarted = false;
  },

  /**
   * Start the main animation sequence
   */
  startSequence() {
    if (typeof UI === 'undefined') {
      console.error('Particle UI not loaded');
      return;
    }

    // Set the gift callback
    UI.onGiftCallback = () => {
      this.showGiftSequence();
    };

    // Build the sequence string
    const seq = `|#countdown ${this.settings.countdown}|${this.settings.sequence}|#gift|`;

    // Start music on first interaction or with sequence
    this.startMusic();

    // Run the sequence
    UI.simulate(seq);
  },

  /**
   * Show the gift sequence (after particle text)
   */
  showGiftSequence() {
    // Show fireworks
    if (typeof Fireworks !== 'undefined') {
      const fwCanvas = document.getElementById('firework-canvas');
      if (fwCanvas) fwCanvas.style.display = 'block';
      
      Fireworks.init('firework-canvas');
      Fireworks.launch();

      // Launch more fireworks periodically
      let fireworkCount = 0;
      const fireworkInterval = setInterval(() => {
        Fireworks.launch();
        fireworkCount++;
        if (fireworkCount >= 4) {
          clearInterval(fireworkInterval);
          // Fade out firework canvas after last burst completes
          setTimeout(() => {
            if (fwCanvas) fwCanvas.style.display = 'none';
          }, 4000);
        }
      }, 1500);
    }

    // Show GIF if configured
    const gif = this.elements.giftImage;
    if (gif && this.settings.gift) {
      gif.src = this.settings.gift;
      gif.style.display = 'block';
      gif.style.animation = 'fadeInScale 1s ease-out forwards';

      // Hide GIF after 4 seconds
      setTimeout(() => {
        gif.style.animation = 'fadeOutScale 1s ease-in forwards';
        setTimeout(() => {
          gif.style.display = 'none';
        }, 1000);
      }, 4000);
    }

    // Show content display with typewriter message
    setTimeout(() => {
      this.showContentMessage();
    }, 2000);

    // Show book after message
    setTimeout(() => {
      if (this.settings.enableBook) {
        this.showBook();
      }
    }, 4000);
  },

  /**
   * Show the content message with typewriter effect
   */
  showContentMessage() {
    const display = this.elements.contentDisplay;
    const text = this.elements.contentText;
    if (!display || !text) return;

    const message = "Happy Birthday Faiza! 🎂\nMay your day be filled with love, joy, and all the happiness in the world! 💕";

    display.classList.add('show');
    text.innerHTML = '';

    // Typewriter effect
    let i = 0;
    const typeInterval = setInterval(() => {
      if (i < message.length) {
        if (message[i] === '\n') {
          text.innerHTML += '<br>';
        } else {
          text.innerHTML += message[i];
        }
        i++;
      } else {
        clearInterval(typeInterval);
      }
    }, 50);
  },

  /**
   * Show the flip book
   */
  showBook() {
    if (typeof Book === 'undefined') return;

    Book.init('book', 'bookContainer');

    // Set completion callback
    Book.onComplete = () => {
      // Start hearts after book is done
      if (this.settings.enableHeart && typeof Hearts !== 'undefined') {
        Hearts.start();
      }
      // Show stars
      this.showStars();
    };

    Book.show();
  },

  /**
   * Create star particles in background
   */
  createStars() {
    const container = this.elements.starsContainer;
    if (!container) return;

    for (let i = 0; i < 100; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.cssText = `
        position: absolute;
        width: ${Math.random() * 3 + 1}px;
        height: ${Math.random() * 3 + 1}px;
        background: white;
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        opacity: ${Math.random() * 0.7 + 0.3};
        animation: twinkle ${Math.random() * 3 + 2}s ease-in-out infinite;
        animation-delay: ${Math.random() * 3}s;
      `;
      container.appendChild(star);
    }
  },

  /**
   * Show stars background
   */
  showStars() {
    const container = this.elements.starsContainer;
    if (container) {
      container.style.opacity = '1';
    }
  },

  /**
   * Hide stars
   */
  hideStars() {
    const container = this.elements.starsContainer;
    if (container) {
      container.style.opacity = '0';
    }
  },
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

// Handle visibility change (pause/resume)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (App.musicPlaying) {
      App.elements.audio?.pause();
    }
  } else {
    if (App.musicPlaying) {
      App.elements.audio?.play().catch(() => {});
    }
  }
});

// Make App globally available
window.App = App;
