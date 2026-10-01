// Virtual Gamepad Overlay for Mobile Controls - Adaptive Layouts

export class VirtualGamepad {
  constructor(container, targetFrame) {
    this.container = container;
    this.targetFrame = targetFrame;
    this.pressedButtons = new Set();
    this.isMobile = this.detectMobile();
    this.currentLayout = 'hidden';
    this.gameAspectRatio = 16/9;
    
    this.init();
    this.bindResizeObserver();
  }

  detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
  }

  init() {
    if (!this.isMobile) {
      this.container.classList.add('hidden');
      this.currentLayout = 'hidden';
      return;
    }
    
    this.container.classList.remove('hidden');
    this.bindTouchEvents();
    this.updateLayout();
  }

  bindResizeObserver() {
    // Watch iframe for aspect ratio changes
    this.resizeObserver = new ResizeObserver(() => {
      this.updateLayout();
    });
    this.resizeObserver.observe(this.targetFrame);
    
    // Also watch window resize
    window.addEventListener('resize', () => this.updateLayout());
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.updateLayout(), 100);
    });
  }

  updateLayout() {
    if (!this.isMobile) return;
    
    const rect = this.targetFrame.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();
    
    // Calculate game aspect ratio
    this.gameAspectRatio = rect.width / rect.height;
    
    let newLayout;
    
    if (this.gameAspectRatio >= 1.5) {
      // Widescreen (16:9, 21:9, etc.) - overlay at bottom
      newLayout = 'overlay-bottom';
    } else if (this.gameAspectRatio >= 0.9 && this.gameAspectRatio <= 1.1) {
      // Square-ish (1:1, 4:3) - controls on sides
      newLayout = 'sidebar';
    } else if (this.gameAspectRatio < 0.9) {
      // Portrait - controls below
      newLayout = 'below';
    } else {
      // Default fallback
      newLayout = 'overlay-bottom';
    }
    
    if (newLayout !== this.currentLayout) {
      this.applyLayout(newLayout);
      this.currentLayout = newLayout;
    }
  }

  applyLayout(layout) {
    // Remove all layout classes
    this.container.classList.remove('layout-overlay-bottom', 'layout-sidebar', 'layout-below', 'hidden');
    
    switch (layout) {
      case 'overlay-bottom':
        this.container.classList.add('layout-overlay-bottom');
        this.rebuildGamepad('overlay');
        break;
      case 'sidebar':
        this.container.classList.add('layout-sidebar');
        this.rebuildGamepad('sidebar');
        break;
      case 'below':
        this.container.classList.add('layout-below');
        this.rebuildGamepad('below');
        break;
    }
  }

  rebuildGamepad(mode) {
    const isSidebar = mode === 'sidebar';
    const isBelow = mode === 'below';
    const isOverlay = mode === 'overlay';
    
    let html = '';
    
    if (isSidebar) {
      // Sidebar layout: D-pad left, buttons right, triggers top/bottom
      html = `
        <div class="gamepad-sidebar">
          <div class="sidebar-left">
            <div class="gamepad-dpad">
              <button class="dpad-btn" data-dir="up" aria-label="Up">▲</button>
              <button class="dpad-btn" data-dir="down" aria-label="Down">▼</button>
              <button class="dpad-btn" data-dir="left" aria-label="Left">◄</button>
              <button class="dpad-btn" data-dir="right" aria-label="Right">►</button>
            </div>
            <div class="gamepad-menu">
              <button class="menu-btn" data-btn="select" aria-label="Select">⬜</button>
              <button class="menu-btn" data-btn="start" aria-label="Start">▶</button>
            </div>
          </div>
          <div class="sidebar-right">
            <div class="gamepad-triggers-vertical">
              <button class="trigger-btn" data-btn="l1" aria-label="L1">L1</button>
              <button class="trigger-btn" data-btn="l2" aria-label="L2">L2</button>
            </div>
            <div class="gamepad-buttons">
              <button class="action-btn" data-btn="y" aria-label="Y">Y</button>
              <button class="action-btn" data-btn="x" aria-label="X">X</button>
              <button class="action-btn" data-btn="a" aria-label="A">A</button>
              <button class="action-btn" data-btn="b" aria-label="B">B</button>
            </div>
            <div class="gamepad-triggers-vertical">
              <button class="trigger-btn" data-btn="r1" aria-label="R1">R1</button>
              <button class="trigger-btn" data-btn="r2" aria-label="R2">R2</button>
            </div>
          </div>
        </div>
      `;
    } else if (isBelow) {
      // Below layout: full width controls under game
      html = `
        <div class="gamepad-below">
          <div class="below-row dpad-row">
            <div class="gamepad-dpad">
              <button class="dpad-btn" data-dir="up" aria-label="Up">▲</button>
              <button class="dpad-btn" data-dir="down" aria-label="Down">▼</button>
              <button class="dpad-btn" data-dir="left" aria-label="Left">◄</button>
              <button class="dpad-btn" data-dir="right" aria-label="Right">►</button>
            </div>
            <div class="gamepad-menu">
              <button class="menu-btn" data-btn="select" aria-label="Select">⬜</button>
              <button class="menu-btn" data-btn="start" aria-label="Start">▶</button>
            </div>
          </div>
          <div class="below-row buttons-row">
            <div class="gamepad-triggers">
              <button class="trigger-btn" data-btn="l1" aria-label="L1">L1</button>
              <button class="trigger-btn" data-btn="l2" aria-label="L2">L2</button>
            </div>
            <div class="gamepad-buttons">
              <button class="action-btn" data-btn="y" aria-label="Y">Y</button>
              <button class="action-btn" data-btn="x" aria-label="X">X</button>
              <button class="action-btn" data-btn="a" aria-label="A">A</button>
              <button class="action-btn" data-btn="b" aria-label="B">B</button>
            </div>
            <div class="gamepad-triggers">
              <button class="trigger-btn" data-btn="r1" aria-label="R1">R1</button>
              <button class="trigger-btn" data-btn="r2" aria-label="R2">R2</button>
            </div>
          </div>
        </div>
      `;
    } else {
      // Overlay bottom (original) - compact horizontal
      html = `
        <div class="gamepad-overlay">
          <div class="gamepad-dpad">
            <button class="dpad-btn" data-dir="up" aria-label="Up">▲</button>
            <button class="dpad-btn" data-dir="down" aria-label="Down">▼</button>
            <button class="dpad-btn" data-dir="left" aria-label="Left">◄</button>
            <button class="dpad-btn" data-dir="right" aria-label="Right">►</button>
          </div>
          <div class="gamepad-buttons">
            <button class="action-btn" data-btn="a" aria-label="A">A</button>
            <button class="action-btn" data-btn="b" aria-label="B">B</button>
            <button class="action-btn" data-btn="x" aria-label="X">X</button>
            <button class="action-btn" data-btn="y" aria-label="Y">Y</button>
          </div>
          <div class="gamepad-triggers">
            <button class="trigger-btn" data-btn="l1" aria-label="L1">L1</button>
            <button class="trigger-btn" data-btn="r1" aria-label="R1">R1</button>
            <button class="trigger-btn" data-btn="l2" aria-label="L2">L2</button>
            <button class="trigger-btn" data-btn="r2" aria-label="R2">R2</button>
          </div>
          <div class="gamepad-menu">
            <button class="menu-btn" data-btn="select" aria-label="Select">⬜</button>
            <button class="menu-btn" data-btn="start" aria-label="Start">▶</button>
          </div>
        </div>
      `;
    }
    
    this.container.innerHTML = html;
    this.bindTouchEvents();
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
    
    this.targetFrame.contentWindow.postMessage({
      type: 'xdc-gamepad-input',
      action,
      pressed,
      key
    }, '*');
    
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

  enableGamepadAPI() {
    const pollGamepads = () => {
      const gamepads = navigator.getGamepads();
      for (const gp of gamepads) {
        if (gp) this.processGamepad(gp);
      }
      requestAnimationFrame(pollGamepads);
    };
    
    window.addEventListener('gamepadconnected', (e) => {
      console.log('Gamepad connected:', e.gamepad.id);
      pollGamepads();
    });
    
    window.addEventListener('gamepaddisconnected', (e) => {
      console.log('Gamepad disconnected');
    });
  }

  processGamepad(gamepad) {
    const buttonMap = [
      { index: 0, action: 'a' }, { index: 1, action: 'b' },
      { index: 2, action: 'x' }, { index: 3, action: 'y' },
      { index: 4, action: 'l1' }, { index: 5, action: 'r1' },
      { index: 6, action: 'l2' }, { index: 7, action: 'r2' },
      { index: 8, action: 'select' }, { index: 9, action: 'start' },
      { index: 12, action: 'up' }, { index: 13, action: 'down' },
      { index: 14, action: 'left' }, { index: 15, action: 'right' }
    ];
    
    for (const mapping of buttonMap) {
      const btn = gamepad.buttons[mapping.index];
      if (btn) {
        const wasPressed = this.pressedButtons.has(mapping.action);
        const isPressed = btn.pressed;
        
        if (isPressed && !wasPressed) {
          this.pressedButtons.add(mapping.action);
          this.updateButtonVisual(mapping.action, true);
          this.sendInput(mapping.action, true);
        } else if (!isPressed && wasPressed) {
          this.pressedButtons.delete(mapping.action);
          this.updateButtonVisual(mapping.action, false);
          this.sendInput(mapping.action, false);
        }
      }
    }
    
    if (gamepad.axes.length >= 2) {
      const deadzone = 0.3;
      this.handleAxis('left', 'right', gamepad.axes[0], deadzone);
      this.handleAxis('up', 'down', gamepad.axes[1], deadzone);
    }
  }

  handleAxis(negAction, posAction, value, deadzone) {
    const wasNeg = this.pressedButtons.has(negAction);
    const wasPos = this.pressedButtons.has(posAction);
    const isNeg = value < -deadzone;
    const isPos = value > deadzone;
    
    if (isNeg && !wasNeg) { this.pressAction(negAction); }
    else if (!isNeg && wasNeg) { this.releaseAction(negAction); }
    if (isPos && !wasPos) { this.pressAction(posAction); }
    else if (!isPos && wasPos) { this.releaseAction(posAction); }
  }

  pressAction(action) {
    this.pressedButtons.add(action);
    this.updateButtonVisual(action, true);
    this.sendInput(action, true);
  }

  releaseAction(action) {
    this.pressedButtons.delete(action);
    this.updateButtonVisual(action, false);
    this.sendInput(action, false);
  }

  updateButtonVisual(action, pressed) {
    const btn = this.container.querySelector(`[data-btn="${action}"], [data-dir="${action}"]`);
    if (btn) btn.classList.toggle('pressed', pressed);
  }

  destroy() {
    this.pressedButtons.clear();
    this.container.classList.add('hidden');
    
    if (this.keyHandler) {
      window.removeEventListener('keydown', this.keyHandler);
      window.removeEventListener('keyup', this.keyHandler);
    }
    
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    
    const buttons = this.container.querySelectorAll('button');
    buttons.forEach(btn => {
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
    });
  }
}