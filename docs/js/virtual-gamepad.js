// Virtual Gamepad - Standard Mobile Layout with Analog Stick Option
// D-pad left, Action buttons right, Triggers top corners, Menu center

export class VirtualGamepad {
  constructor(container, targetFrame, options = {}) {
    this.container = container;
    this.targetFrame = targetFrame;
    this.pressedButtons = new Set();
    this.isMobile = this.detectMobile();
    this.layout = options.layout || localStorage.getItem('xdc-gamepad-layout') || 'dpad';
    this.showOnFullscreen = options.showOnFullscreen !== false;
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
    const isDesktop = !this.isMobile && !isTouch && !isSmall;
    
    // Default layout: sidebar for desktop, overlay for mobile
    const storedLayout = localStorage.getItem('xdc-gamepad-layout');
    if (!storedLayout) {
      this.layout = isDesktop ? 'sidebar' : 'dpad';
    }
    
    // Always show gamepad (sidebar on desktop, overlay on mobile)
    this.container.classList.remove('hidden');
    
    this.buildGamepad();
    this.bindTouchEvents();
    
    // Keyboard only when iframe focused
    this.targetFrame.addEventListener('focus', () => this.bindKeyboardEvents());
    this.targetFrame.addEventListener('blur', () => this.unbindKeyboardEvents());
    
    // Listen for fullscreen changes
    if (this.showOnFullscreen) {
      this.fullscreenHandler = () => this.onFullscreenChange();
      document.addEventListener('fullscreenchange', this.fullscreenHandler);
    }
    
    // Handle resize to switch layouts
    this.resizeHandler = () => this.onResize();
    window.addEventListener('resize', this.resizeHandler);
  }

  onFullscreenChange() {
    const isFullscreen = !!document.fullscreenElement;
    if (isFullscreen) {
      // In fullscreen, show as compact overlay at bottom
      this.container.classList.add('fullscreen-overlay');
      this.container.classList.remove('hidden');
    } else {
      // Exit fullscreen - restore previous layout
      this.container.classList.remove('fullscreen-overlay');
      // Re-apply the correct layout class
      if (this.layout === 'sidebar') {
        this.container.classList.add('layout-sidebar');
      } else if (this.layout === 'dpad') {
        this.container.classList.add('layout-overlay-bottom');
      }
    }
  }

  onResize() {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmall = window.innerWidth <= 1024;
    const isDesktop = !this.isMobile && !isTouch && !isSmall;
    
    // Auto-switch layout based on screen size if not manually set
    const storedLayout = localStorage.getItem('xdc-gamepad-layout');
    if (!storedLayout) {
      const newLayout = isDesktop ? 'sidebar' : 'dpad';
      if (newLayout !== this.layout) {
        this.setLayout(newLayout);
      }
    }
  }

  setLayout(layout) {
    this.layout = layout;
    localStorage.setItem('xdc-gamepad-layout', layout);
    // Remove old layout classes
    this.container.classList.remove('layout-sidebar', 'layout-overlay-bottom', 'fullscreen-overlay');
    this.buildGamepad();
    this.bindTouchEvents();
  }

  destroy() {
    this.pressedButtons.clear();
    this.container.classList.add('hidden');
    this.unbindKeyboardEvents();
    
    if (this.fullscreenHandler) {
      document.removeEventListener('fullscreenchange', this.fullscreenHandler);
    }
    
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
    
    // Clean up stick handlers
    if (this.stickHandlers) {
      const { handleStart, handleMoveEvent, handleEnd, base } = this.stickHandlers;
      base.removeEventListener('touchstart', handleStart);
      base.removeEventListener('touchmove', handleMoveEvent);
      base.removeEventListener('touchend', handleEnd);
      base.removeEventListener('touchcancel', handleEnd);
      base.removeEventListener('mousedown', handleStart);
      window.removeEventListener('mousemove', handleMoveEvent);
      window.removeEventListener('mouseup', handleEnd);
      this.stickHandlers = null;
    }
    
    // Clean up button listeners
    const buttons = this.container.querySelectorAll('button');
    buttons.forEach(btn => {
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
    });
  }

buildGamepad() {
    // Standard layout: D-pad left, action buttons right, triggers top, menu center
    // Analog stick layout: virtual joystick left, action buttons right, triggers top, menu center
    const isStick = this.layout === 'stick';
    const isSidebar = this.layout === 'sidebar';
    const isOverlayBottom = this.layout === 'dpad';
    
    // Apply layout class to container
    this.container.classList.remove('layout-sidebar', 'layout-overlay-bottom', 'fullscreen-overlay');
    if (isSidebar) {
      this.container.classList.add('layout-sidebar');
    } else if (isOverlayBottom) {
      this.container.classList.add('layout-overlay-bottom');
    }
    if (!this.container.classList.contains('hidden')) {
      this.container.classList.remove('hidden');
    }
    
    this.container.innerHTML = `
      <div class="gamepad-standard">
        <!-- Left side: D-pad/Stick + L1/L2 on top -->
        <div class="gamepad-left">
          <div class="gamepad-triggers-top gamepad-triggers-left">
            <button class="trigger-btn" data-btn="l1" aria-label="L1">L1</button>
            <button class="trigger-btn" data-btn="l2" aria-label="L2">L2</button>
          </div>
          ${isStick ? this.buildStick() : this.buildDpad()}
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
        
        <!-- Settings button -->
        <div class="gamepad-settings">
          <button class="settings-btn" data-action="settings" aria-label="Gamepad Settings">⚙</button>
        </div>
      </div>
    `;
    
    // Add settings button handler
    this.container.querySelector('[data-action="settings"]').addEventListener('click', () => this.showSettings());
  }

  buildDpad() {
    return `
      <div class="gamepad-dpad">
        <button class="dpad-btn" data-dir="up" aria-label="Up">▲</button>
        <button class="dpad-btn" data-dir="down" aria-label="Down">▼</button>
        <button class="dpad-btn" data-dir="left" aria-label="Left">◄</button>
        <button class="dpad-btn" data-dir="right" aria-label="Right">►</button>
      </div>
    `;
  }

  buildStick() {
    return `
      <div class="gamepad-stick">
        <div class="joystick-base" data-stick="left">
          <div class="joystick-stick"></div>
        </div>
      </div>
    `;
  }

  showSettings() {
    const currentLayout = this.layout;
    const newLayout = currentLayout === 'dpad' ? 'stick' : 'dpad';
    this.setLayout(newLayout);
    
    // Show brief notification
    const msg = newLayout === 'stick' ? 'Switched to Analog Stick' : 'Switched to D-Pad';
    this.showNotification(msg);
  }

  showNotification(message) {
    const existing = this.container.querySelector('.gamepad-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'gamepad-notification';
    notification.textContent = message;
    this.container.appendChild(notification);
    
    setTimeout(() => notification.remove(), 1500);
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
    
    // Handle joystick if present
    const stickBase = this.container.querySelector('.joystick-base');
    if (stickBase) {
      this.bindStickEvents(stickBase);
    }
  }

  bindStickEvents(base) {
    const stick = base.querySelector('.joystick-stick');
    let stickActive = false;
    let startX = 0, startY = 0;
    const maxRadius = 40; // max distance from center
    
    const handleMove = (clientX, clientY) => {
      if (!stickActive) return;
      
      const rect = base.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      let dx = clientX - centerX;
      let dy = clientY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > maxRadius) {
        dx = (dx / distance) * maxRadius;
        dy = (dy / distance) * maxRadius;
      }
      
      stick.style.transform = `translate(${dx}px, ${dy}px)`;
      
      // Calculate direction and send input
      const angle = Math.atan2(dy, dx);
      const deadzone = 0.15;
      const normalizedDistance = Math.min(distance / maxRadius, 1);
      
      if (normalizedDistance > deadzone) {
        this.handleStickDirection(angle, normalizedDistance);
      } else {
        this.releaseStickDirections();
      }
    };
    
    const handleStart = (e) => {
      e.preventDefault();
      stickActive = true;
      base.classList.add('active');
      
      const touch = e.touches ? e.touches[0] : e;
      handleMove(touch.clientX, touch.clientY);
    };
    
    const handleMoveEvent = (e) => {
      e.preventDefault();
      const touch = e.touches ? e.touches[0] : e;
      handleMove(touch.clientX, touch.clientY);
    };
    
    const handleEnd = (e) => {
      e.preventDefault();
      stickActive = false;
      base.classList.remove('active');
      stick.style.transform = 'translate(0, 0)';
      this.releaseStickDirections();
    };
    
    base.addEventListener('touchstart', handleStart, { passive: false });
    base.addEventListener('touchmove', handleMoveEvent, { passive: false });
    base.addEventListener('touchend', handleEnd, { passive: false });
    base.addEventListener('touchcancel', handleEnd, { passive: false });
    
    base.addEventListener('mousedown', handleStart);
    window.addEventListener('mousemove', handleMoveEvent);
    window.addEventListener('mouseup', handleEnd);
    
    // Store handlers for cleanup
    this.stickHandlers = { handleStart, handleMoveEvent, handleEnd, base };
  }

  handleStickDirection(angle, magnitude) {
    // Convert angle to 8-direction input
    // angle is in radians, -PI to PI
    // 0 = right, PI/2 = down, PI/-PI = left, -PI/2 = up
    const directions = [];
    
    // Up: -PI/2 +/- PI/4
    if (angle > -3 * Math.PI / 4 && angle < -Math.PI / 4) directions.push('up');
    // Down: PI/2 +/- PI/4
    if (angle > Math.PI / 4 && angle < 3 * Math.PI / 4) directions.push('down');
    // Left: PI +/- PI/4 or -PI +/- PI/4
    if (angle > 3 * Math.PI / 4 || angle < -3 * Math.PI / 4) directions.push('left');
    // Right: -PI/4 to PI/4
    if (angle > -Math.PI / 4 && angle < Math.PI / 4) directions.push('right');
    
    // Press new directions
    directions.forEach(dir => {
      if (!this.pressedButtons.has(dir)) {
        this.pressedButtons.add(dir);
        const btn = this.container.querySelector(`[data-dir="${dir}"]`);
        if (btn) btn.classList.add('pressed');
        this.sendInput(dir, true);
      }
    });
    
    // Release directions not in current set
    ['up', 'down', 'left', 'right'].forEach(dir => {
      if (!directions.includes(dir) && this.pressedButtons.has(dir)) {
        this.pressedButtons.delete(dir);
        const btn = this.container.querySelector(`[data-dir="${dir}"]`);
        if (btn) btn.classList.remove('pressed');
        this.sendInput(dir, false);
      }
    });
  }

  releaseStickDirections() {
    ['up', 'down', 'left', 'right'].forEach(dir => {
      if (this.pressedButtons.has(dir)) {
        this.pressedButtons.delete(dir);
        const btn = this.container.querySelector(`[data-dir="${dir}"]`);
        if (btn) btn.classList.remove('pressed');
        this.sendInput(dir, false);
      }
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