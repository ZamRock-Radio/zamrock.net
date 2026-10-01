// Virtual Gamepad - Standard Mobile Layout
// D-pad left, Action buttons right, Triggers top corners, Menu center

export class VirtualGamepad {
  constructor(container, targetFrame) {
    this.container = container;
    this.targetFrame = targetFrame;
    this.pressedButtons = new Set();
    this.isMobile = this.detectMobile();
    this.init();
  }

  detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
  }

  init() {
    // Force show on any touch device or small screen
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmall = window.innerWidth <= 1024;
    
    if (!this.isMobile && !isTouch && !isSmall) {
      this.container.classList.add('hidden');
      return;
    }
    
    this.container.classList.remove('hidden');
    this.buildGamepad();
    this.bindTouchEvents();
    
    // Keyboard only when iframe focused
    this.targetFrame.addEventListener('focus', () => this.bindKeyboardEvents());
    this.targetFrame.addEventListener('blur', () => this.unbindKeyboardEvents());
  }

  buildGamepad() {
    // Standard layout: D-pad left, action buttons right, triggers top, menu center
    this.container.innerHTML = `
      <div class="gamepad-standard">
        <!-- Left side: D-pad + L1/L2 on top -->
        <div class="gamepad-left">
          <div class="gamepad-triggers-top gamepad-triggers-left">
            <button class="trigger-btn" data-btn="l1" aria-label="L1">L1</button>
            <button class="trigger-btn" data-btn="l2" aria-label="L2">L2</button>
          </div>
          <div class="gamepad-dpad">
            <button class="dpad-btn" data-dir="up" aria-label="Up">▲</button>
            <button class="dpad-btn" data-dir="down" aria-label="Down">▼</button>
            <button class="dpad-btn" data-dir="left" aria-label="Left">◄</button>
            <button class="dpad-btn" data-dir="right" aria-label="Right">►</button>
          </div>
        </div>
        
        <!-- Right side: Action buttons + R1/R2 on top + Select/Start center -->
        <div class="gamepad-right">
          <div class="gamepad-triggers-top gamepad-triggers-right">
            <button class="trigger-btn" data-btn="r1" aria-label="R1">R1</button>
            <button class="trigger-btn" data-btn="r2" aria-label="R2">R2</button>
          </div>
          <div class="gamepad-buttons">
            <button class="action-btn" data-btn="y" aria-label="Y">Y</button>
            <button class="action-btn" data-btn="x" aria-label="X">X</button>
            <button class="action-btn" data-btn="a" aria-label="A">A</button>
            <button class="action-btn" data-btn="b" aria-label="B">B</button>
          </div>
          <div class="gamepad-menu-center">
            <button class="menu-btn" data-btn="select" aria-label="Select">⬜</button>
            <button class="menu-btn" data-btn="start" aria-label="Start">▶</button>
          </div>
        </div>
      </div>
    `;
  }

  bindTouchEvents() {
    const buttons = this.container.querySelectorAll('button');
    
    buttons.forEach(btn => {
      btn.addEventListener('touchstart', (e) => this.handlePress(e, btn), { passive: false });
      btn.addEventListener('touchend', (e) => this.handleRelease(e, btn), { passive: false });
      btn.addEventListener('touchcancel', (e) => this.handleRelease(e, btn), { passive: false });
      btn.addEventListener('mousedown', (e) => this.handlePress(e, btn));
      btn.addEventListener('mouseup', (e) => this.handleRelease(e, btn));
      btn.addEventListener('mouseleave', (e) => this.handleRelease(e, btn));
      btn.addEventListener('contextmenu', (e) => e.preventDefault());
    });
  }

  bindKeyboardEvents() {
    const keyMap = {
      'ArrowUp': 'up', 'ArrowDown': 'down', 'ArrowLeft': 'left', 'ArrowRight': 'right',
      'KeyW': 'up', 'KeyS': 'down', 'KeyA': 'left', 'KeyD': 'right',
      'KeyZ': 'a', 'KeyX': 'b', 'KeyC': 'x', 'KeyV': 'y',
      'ShiftLeft': 'l1', 'ShiftRight': 'r1',
      'ControlLeft': 'l2', 'ControlRight': 'r2',
      'Enter': 'start', 'Escape': 'select'
    };
    
    this.keyHandler = (e) => {
      // Only handle keys when iframe is focused
      if (document.activeElement !== this.targetFrame) return;
      
      const action = keyMap[e.code];
      if (!action) return;
      
      const btn = this.container.querySelector(`[data-btn="${action}"], [data-dir="${action}"]`);
      if (btn) {
        e.preventDefault();
        if (e.type === 'keydown' && !this.pressedButtons.has(action)) {
          this.handlePress({ preventDefault: () => {} }, btn);
        } else if (e.type === 'keyup' && this.pressedButtons.has(action)) {
          this.handleRelease({ preventDefault: () => {} }, btn);
        }
      }
    };
    
    window.addEventListener('keydown', this.keyHandler);
    window.addEventListener('keyup', this.keyHandler);
  }

  unbindKeyboardEvents() {
    if (this.keyHandler) {
      window.removeEventListener('keydown', this.keyHandler);
      window.removeEventListener('keyup', this.keyHandler);
    }
  }

  handlePress(event, button) {
    const dir = button.dataset.dir;
    const btn = button.dataset.btn;
    const action = dir || btn;
    
    if (!action || this.pressedButtons.has(action)) return;
    
    this.pressedButtons.add(action);
    button.classList.add('pressed');
    
    this.sendInput(action, true);
  }

  handleRelease(event, button) {
    const dir = button.dataset.dir;
    const btn = button.dataset.btn;
    const action = dir || btn;
    
    if (!action || !this.pressedButtons.has(action)) return;
    
    this.pressedButtons.delete(action);
    button.classList.remove('pressed');
    
    this.sendInput(action, false);
  }

  sendInput(action, pressed) {
    if (!this.targetFrame || !this.targetFrame.contentWindow) return;
    
    const keyMap = {
      'up': 'ArrowUp', 'down': 'ArrowDown', 'left': 'ArrowLeft', 'right': 'ArrowRight',
      'a': 'KeyZ', 'b': 'KeyX', 'x': 'KeyC', 'y': 'KeyV',
      'l1': 'ShiftLeft', 'r1': 'ShiftRight', 'l2': 'ControlLeft', 'r2': 'ControlRight',
      'start': 'Enter', 'select': 'Escape'
    };
    
    const key = keyMap[action];
    if (!key) return;
    
    // Send as postMessage for games that listen
    this.targetFrame.contentWindow.postMessage({
      type: 'xdc-gamepad-input',
      action,
      pressed,
      key
    }, '*');
    
    // Also dispatch keyboard event on iframe
    try {
      const event = new KeyboardEvent(pressed ? 'keydown' : 'keyup', {
        code: key,
        key: key,
        bubbles: true,
        cancelable: true
      });
      this.targetFrame.contentWindow.dispatchEvent(event);
    } catch (e) {
      // Cross-origin iframe may block this
    }
  }

  destroy() {
    this.pressedButtons.clear();
    this.container.classList.add('hidden');
    this.unbindKeyboardEvents();
    
    // Clean up button listeners
    const buttons = this.container.querySelectorAll('button');
    buttons.forEach(btn => {
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
    });
  }
}