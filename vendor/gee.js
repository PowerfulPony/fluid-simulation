/*
 * gee.js - http://georgealways.github.com/gee
 *
 * George Michael Brower - http://georgemichaelbrower.com
 * Jono Brandel - http://jonobr1.com
 */

window.GEE = function (params) {
  if (!params) {
    params = {};
  }

  // Do we support canvas?
  if (!document.createElement('canvas').getContext) {
    if (params.fallback) {
      params.fallback();
    }
    return;
  }

  const _this = this;
  const _keysDown = {};
  const _privateParts =	{
    ctx:	undefined,
    domElement: undefined,
    width:	undefined,
    height:	undefined,
    desiredFrameTime: 1E3 / 60,
    frameCount: 0,
    key:	undefined,
    keyCode: undefined,
    mouseX: 0,
    mouseY: 0,
    pmouseX:	undefined,
    pmouseY:	undefined,
    mousePressed: false,
  };
  let _actualFrameTime;
  let d; // shorthand for the dom element

  const getOffset = function () {
    let obj = d;
    let x = 0; let
      y = 0;
    while (obj) {
      y += obj.offsetTop;
      x += obj.offsetLeft;
      obj = obj.offsetParent;
    }
    offset = { x, y };
  };
  // Default parameters

  if (!params.context) {
    params.context = '2d';
  }

  if (!params.width) {
    params.width = 500;
  }

  if (!params.height) {
    params.height = 500;
  }

  // Create domElement, grab context

  d = _privateParts.domElement = document.createElement('canvas');
  _privateParts.ctx = d.getContext(params.context);

  // Are we capable of this context?

  if (_privateParts.ctx == null) {
    if (params.fallback) {
      params.fallback();
    }
    return;
  }

  // Set up width and height setters / listeners
  const getter = function (n) {
    Object.defineProperty(_this, n, {
      get() {
        return _privateParts[n];
      },
    });
  };
  if (params.fullscreen) {
    const onResize = function () {
      getOffset();
      _privateParts.width = d.width = window.innerWidth;
      _privateParts.height = d.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize, false);
    onResize();

    if (!params.container) {
      params.container = document.body;
    }
    document.body.style.margin = '0px';
    document.body.style.padding = '0px';
    document.body.style.overflow = 'hidden';

    getter('width');
    getter('height');
  } else {
    getOffset();
    Object.defineProperty(_this, 'width', {
      get() {
        return _privateParts.width;
      },
      set(v) {
        _privateParts.width = d.width = v;
      },
    });
    Object.defineProperty(_this, 'height', {
      get() {
        return _privateParts.height;
      },
      set(v) {
        _privateParts.height = d.height = v;
      },
    });
    _this.width = params.width;
    _this.height = params.height;
  }

  // Put it where we talked about (if we talked about it).
  if (params.container) {
    params.container.appendChild(d);
    getOffset();
  }

  // Would love to reduce this to params.
  getter('ctx');
  getter('frameCount');
  getter('key');
  getter('keyCode');
  getter('mouseX');
  getter('mouseY');
  getter('pmouseX');
  getter('pmouseY');
  getter('mousePressed');

  const n = function () {
  };
  // TODO: Ensure data type
  _this.loop = true;

  // TODO: Ensure data type
  _this.keyup = n;
  _this.keydown = n;
  _this.draw = n;
  _this.mousedown = n;
  _this.mouseup = n;
  _this.mousemove = n;
  _this.mousedrag = n;

  // Custom Getters & Setters
  Object.defineProperty(_this, 'frameRate', {
    get() {
      return 1E3 / _actualFrameTime;
    },
    set(v) {
      _privateParts.desiredFrameTime = k / v;
    },
  });

  Object.defineProperty(_this, 'frameTime', {
    get() {
      return _actualFrameTime;
    },
    set(v) {
      _privateParts.desiredFrameTime = v;
    },
  });

  Object.defineProperty(_this, 'keyPressed', {
    get() {
      for (const i in _keysDown) {
        if (_keysDown[i]) {
          return true;
        }
      }
      return false;
    },
  });
  // Listeners

  d.addEventListener('mouseenter', (e) => {
    getOffset();
  }, false);
  const fireMouseMove = function (e) {
    _this.mousemove();
  };
  const updateMousePosition = function (e) {
    const x = e.pageX - offset.x;
    const y = e.pageY - offset.y;
    if (_privateParts.pmouseX == undefined) {
      _privateParts.pmouseX = x;
      _privateParts.pmouseY = y;
    } else {
      _privateParts.pmouseX = _privateParts.mouseX;
      _privateParts.pmouseY = _privateParts.mouseY;
    }
    _privateParts.mouseX = x;
    _privateParts.mouseY = y;
  };
  d.addEventListener('mousemove', updateMousePosition, false);
  d.addEventListener('mousemove', fireMouseMove, false);

  d.addEventListener('mousedown', () => {
    _privateParts.mousePressed = true;
    _this.mousedown();
    d.addEventListener('mousemove', _this.mousedrag, false);
    d.removeEventListener('mousemove', fireMouseMove, false);
  }, false);
  d.addEventListener('mouseup', () => {
    _privateParts.mousePressed = false;
    _this.mouseup();
    d.removeEventListener('mousemove', _this.mousedrag, false);
    d.addEventListener('mousemove', fireMouseMove, false);
  }, false);
  window.addEventListener('keydown', (e) => {
    const kc = e.keyCode;
    _privateParts.key = String.fromCharCode(kc); // Kinda busted.
    _privateParts.keyCode = kc;
    _keysDown[kc] = true;
    _this.keydown();
  }, false);
  window.addEventListener('keyup', (e) => {
    const kc = e.keyCode;
    _privateParts.key = String.fromCharCode(kc); // Kinda busted.
    _privateParts.keyCode = kc;
    _keysDown[kc] = false;
    _this.keyup();
  }, false);
  // Internal loop.

  const requestAnimationFrame = (function () {
    return window.requestAnimationFrame
		|| window.webkitRequestAnimationFrame
		|| window.mozRequestAnimationFrame
		|| window.oRequestAnimationFrame
		|| window.msRequestAnimationFrame
		|| function (callback) {
		  window.setTimeout(callback, _actualFrameTime);
		};
  }());
  _idraw = function () {
    if (_this.loop) {
      requestAnimationFrame(_idraw);
    }

    _privateParts.frameCount++;
    const prev = new Date().getTime();

    _this.draw();

    const delta = new Date().getTime() - prev;

    if (delta > _privateParts.desiredFrameTime) {
      _actualFrameTime = delta;
    } else {
      _actualFrameTime = _privateParts.desiredFrameTime;
    }
  };
  _idraw();
};
