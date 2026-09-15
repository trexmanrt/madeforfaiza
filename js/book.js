/**
 * Birthday 3D Flip Book Component for Faiza
 * Provides realistic 3D page-turning animations, photo display, and personalized birthday messages.
 */

const Book = {
  element: null,
  container: null,
  currentPage: 0,
  totalPages: 0,
  isFlipping: false,
  isFinished: false,
  pages: [],
  onComplete: null, // Callback triggered when the entire book has been read

  // Pages with Faiza's photos and personalized birthday messages
  defaultPages: [
    { image: '', content: 'For You, Faiza 💗', bgGradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
    { image: 'assets/1.jpg', content: '' },
    { image: 'assets/2.jpg', content: '' },
    { image: '', content: 'Wishing you the happiest birthday ever! 🎂', bgGradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
    { image: 'assets/3.jpg', content: '' },
    { image: 'assets/4.jpg', content: '' },
    { image: '', content: 'May all your dreams come true! ✨', bgGradient: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)' },
    { image: 'assets/5.jpg', content: '' },
    { image: 'assets/6.jpg', content: '' },
    { image: '', content: 'You make the world brighter just by being you 🌟', bgGradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
    { image: 'assets/7.jpg', content: '' },
    { image: 'assets/8.jpg', content: '' },
    { image: '', content: 'Every moment with you is a beautiful memory 💕', bgGradient: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)' },
    { image: 'assets/9.jpg', content: '' },
    { image: 'assets/10.jpg', content: '' },
    { image: '', content: 'Your smile lights up the whole world 😊', bgGradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)' },
    { image: 'assets/11.jpg', content: '' },
    { image: 'assets/12.jpg', content: '' },
    { image: '', content: 'Stay amazing, stay beautiful, stay YOU 💖', bgGradient: 'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)' },
    { image: 'assets/13.jpg', content: '' },
    { image: 'assets/14.jpg', content: '' },
    { image: '', content: 'Here\'s to another year of being awesome! 🎉', bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { image: 'assets/15.jpg', content: '' },
    { image: '', content: 'Happy Birthday Faiza!\nWith all my love ❤', bgGradient: 'linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)' },
    { image: 'assets/gallery1.jpg', content: '' },
    { image: 'assets/gallery2.jpg', content: '' },
    { image: '', content: 'The End 💕\n\nClick anywhere to replay', bgGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  ],

  /**
   * Initializes the 3D book component.
   * @param {string} bookId - ID of the element containing the book sheets.
   * @param {string} [containerId] - Optional ID of the parent container holding the book.
   */
  init(bookId, containerId) {
    this.injectStyles();
    this.element = document.getElementById(bookId);
    if (!this.element) {
      console.warn(`Book element with ID "${bookId}" not found.`);
      return;
    }

    this.container = containerId ? document.getElementById(containerId) : this.element.closest('.book-container');
    this.pages = [...this.defaultPages];
    this.createPages();
    this.setupEvents();
  },

  /**
   * Injects core 3D CSS styles into the document head if not already present.
   */
  injectStyles() {
    if (document.getElementById('book-3d-styles')) return;

    const style = document.createElement('style');
    style.id = 'book-3d-styles';
    style.textContent = `
      .book-container {
        perspective: 1500px;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: opacity 0.6s ease, transform 0.6s ease;
      }
      .book {
        width: 300px;
        height: 400px;
        position: relative;
        transform-style: preserve-3d;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        border-radius: 8px;
        user-select: none;
      }
      .page {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        transform-origin: left center;
        transition: transform 0.8s cubic-bezier(0.645, 0.045, 0.355, 1);
        transform-style: preserve-3d;
        cursor: pointer;
        border-radius: 8px;
      }
      .page.flipped {
        transform: rotateY(-180deg);
      }
      .page-front, .page-back {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
        border-radius: 8px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
      }
      .page-front {
        background: #ffffff;
        box-shadow: inset 3px 0 10px rgba(0, 0, 0, 0.1);
        z-index: 2;
      }
      .page-back {
        background: #ffffff;
        transform: rotateY(180deg);
        box-shadow: inset -3px 0 10px rgba(0, 0, 0, 0.1);
        z-index: 1;
      }
      .page-text {
        font-family: 'Dancing Script', 'Caveat', 'Brush Script MT', cursive, sans-serif;
        font-size: 22px;
        color: #2c1810;
        text-align: center;
        padding: 24px;
        line-height: 1.5;
        text-shadow: 0 1px 3px rgba(255, 182, 193, 0.6);
        pointer-events: none;
      }
      .page img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 4px;
        display: block;
      }
      .book-container.show {
        opacity: 1;
        transform: scale(1);
      }
    `;
    document.head.appendChild(style);
  },

  /**
   * Generates DOM elements for each sheet (front + back).
   */
  createPages() {
    if (!this.element) return;
    this.element.innerHTML = '';

    // Pages are arranged as sheets. Each sheet has a front and back.
    // For N content pages, we need ceil(N/2) sheets.
    const totalSheets = Math.ceil(this.pages.length / 2);
    this.totalPages = totalSheets;

    for (let i = 0; i < totalSheets; i++) {
      const page = document.createElement('div');
      page.className = 'page';
      page.dataset.page = i;
      page.style.zIndex = totalSheets - i;

      // Front face
      const front = document.createElement('div');
      front.className = 'page-front';
      const frontData = this.pages[i * 2];
      if (frontData) {
        if (frontData.image) {
          front.innerHTML = `<img src="${frontData.image}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:4px;">` +
            (frontData.content ? `<div class="page-text">${frontData.content}</div>` : '');
        } else {
          front.style.background = frontData.bgGradient || '#fff';
          if (frontData.content) {
            front.innerHTML = `<div class="page-text">${frontData.content}</div>`;
          }
        }
      }

      // Back face
      const back = document.createElement('div');
      back.className = 'page-back';
      const backData = this.pages[i * 2 + 1];
      if (backData) {
        if (backData.image) {
          back.innerHTML = `<img src="${backData.image}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:4px;">` +
            (backData.content ? `<div class="page-text">${backData.content}</div>` : '');
        } else {
          back.style.background = backData.bgGradient || '#fff';
          if (backData.content) {
            back.innerHTML = `<div class="page-text">${backData.content}</div>`;
          }
        }
      }

      page.appendChild(front);
      page.appendChild(back);
      this.element.appendChild(page);
    }
  },

  /**
   * Sets up click and swipe event listeners.
   */
  setupEvents() {
    if (!this.element) return;

    // Click/tap on book to flip next page
    this.element.addEventListener('click', () => this.flipNext());

    // Mobile touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    this.element.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    this.element.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      // If swiped left significantly
      if (touchStartX - touchEndX > 40) {
        this.flipNext();
      }
    }, { passive: true });
  },

  /**
   * Flips the current visible page to reveal the next sheet.
   */
  flipNext() {
    if (this.isFlipping || this.isFinished) return;
    if (this.currentPage >= this.totalPages) {
      this.isFinished = true;
      if (typeof this.onComplete === 'function') this.onComplete();
      return;
    }

    this.isFlipping = true;
    const page = this.element.querySelector(`[data-page="${this.currentPage}"]`);
    if (page) {
      page.classList.add('flipped');
      this.currentPage++;

      setTimeout(() => {
        this.isFlipping = false;
        if (this.currentPage >= this.totalPages) {
          this.isFinished = true;
          if (typeof this.onComplete === 'function') this.onComplete();
        }
      }, 800);
    }
  },

  /**
   * Displays the book container with a smooth transition.
   */
  show() {
    if (this.container) {
      this.container.style.display = 'block';
      setTimeout(() => this.container.classList.add('show'), 50);
    }
  },

  /**
   * Hides the book container smoothly.
   */
  hide() {
    if (this.container) {
      this.container.classList.remove('show');
      setTimeout(() => {
        this.container.style.display = 'none';
      }, 1000);
    }
  },

  /**
   * Resets all flipped pages back to initial state.
   */
  reset() {
    this.currentPage = 0;
    this.isFinished = false;
    this.isFlipping = false;
    if (this.element) {
      const pages = this.element.querySelectorAll('.page');
      pages.forEach(p => p.classList.remove('flipped'));
    }
  },

  /**
   * Updates the book pages with custom content and rebuilds the book.
   * @param {Array<Object>} pagesData - Array of page objects { image, content, bgGradient }
   */
  setPages(pagesData) {
    if (Array.isArray(pagesData)) {
      this.pages = pagesData;
      this.createPages();
      this.reset();
    }
  }
};

// Export to window if running in browser environment
if (typeof window !== 'undefined') {
  window.Book = Book;
}
