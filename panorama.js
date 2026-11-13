/*
 * Equirectangular perspective viewer, rendered on a 2D canvas (no WebGL).
 * A panorama supplied by the application may be an AI-generated demonstration;
 * this viewer does not turn it into a surveyed or photographed seat view.
 * Direction arguments are degrees. yaw=0, pitch=0 points at the image centre.
 */
(function (root) {
  'use strict';
  const PI = Math.PI, TAU = PI * 2, RAD = PI / 180;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const wrap = value => ((value + 180) % 360 + 360) % 360 - 180;

  // Kept pure for orientation/seam verification, independent of the DOM.
  function directionUV(x, y, z, yaw, pitch) {
    const length = Math.hypot(x, y, z) || 1;
    x /= length; y /= length; z /= length;
    const p = pitch * RAD, h = yaw * RAD;
    const py = y * Math.cos(p) + z * Math.sin(p);
    const pz = z * Math.cos(p) - y * Math.sin(p);
    const rx = x * Math.cos(h) + pz * Math.sin(h);
    const rz = pz * Math.cos(h) - x * Math.sin(h);
    const rawU = .5 + Math.atan2(rx, rz) / TAU;
    return [((rawU % 1) + 1) % 1, clamp(.5 - Math.asin(clamp(py, -1, 1)) / PI, 0, 1)];
  }

  function mount(container, options) {
    options = options || {};
    if (!container || typeof container.appendChild !== 'function') throw new TypeError('A panorama container is required.');
    const doc = container.ownerDocument;
    const win = doc.defaultView || root;
    const canvas = doc.createElement('canvas');
    canvas.className = 'matcha-panorama-canvas';
    canvas.tabIndex = 0;
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', '파노라마 시야. 드래그 또는 방향키로 둘러보기, 더하기·빼기로 확대·축소, 0으로 초기화');
    Object.assign(canvas.style, { display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab', background: '#121922', outlineOffset: '-3px' });
    container.appendChild(canvas);
    const context = canvas.getContext('2d', { alpha: false });
    let disposed = false, ready = false, failed = false;
    let texture = null, textureWidth = 0, textureHeight = 0;
    let yaw = 0, pitch = 0, fov = 80;
    let frame = 0, settleTimer = 0, resizeObserver;
    let lowResolution = false, output = null, rays = null, rayKey = '';
    let cssWidth = 0, cssHeight = 0, lastPinch = null;
    const pointers = new Map(), listeners = [];
    const image = new win.Image();

    function fail(error) {
      if (disposed || failed) return;
      failed = true;
      canvas.setAttribute('aria-label', '파노라마 사진을 불러오지 못했습니다.');
      if (typeof options.onError === 'function') options.onError(error);
    }

    function listen(node, type, handler, settings) {
      node.addEventListener(type, handler, settings);
      listeners.push(() => node.removeEventListener(type, handler, settings));
    }

    function measure() {
      const bounds = container.getBoundingClientRect();
      cssWidth = Math.max(1, bounds.width);
      cssHeight = Math.max(1, bounds.height);
    }

    function prepareOutput() {
      const capWidth = lowResolution ? 480 : 960;
      const capHeight = lowResolution ? 280 : 540;
      const density = lowResolution ? 1 : Math.min(2, win.devicePixelRatio || 1);
      const scale = Math.min(density, capWidth / cssWidth, capHeight / cssHeight);
      const width = Math.max(1, Math.round(cssWidth * scale));
      const height = Math.max(1, Math.round(cssHeight * scale));
      const key = width + ':' + height + ':' + fov.toFixed(3);
      if (key === rayKey) return;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        output = context.createImageData(width, height);
      } else if (!output) output = context.createImageData(width, height);
      rays = new Float32Array(width * height * 3);
      const half = Math.tan(fov * RAD / 2);
      const aspect = width / height;
      let index = 0;
      for (let row = 0; row < height; row++) {
        const y = (1 - (row + .5) / height * 2) * half / aspect;
        for (let col = 0; col < width; col++) {
          const x = ((col + .5) / width * 2 - 1) * half;
          const inverse = 1 / Math.hypot(x, y, 1);
          rays[index++] = x * inverse;
          rays[index++] = y * inverse;
          rays[index++] = inverse;
        }
      }
      rayKey = key;
    }

    function draw() {
      frame = 0;
      if (disposed || failed || !texture || !context) return;
      prepareOutput();
      const target = output.data;
      const h = yaw * RAD, p = pitch * RAD;
      const ch = Math.cos(h), sh = Math.sin(h), cp = Math.cos(p), sp = Math.sin(p);
      const tw = textureWidth, th = textureHeight;
      const bilinear = !lowResolution;
      for (let i = 0, j = 0; i < target.length; i += 4, j += 3) {
        const x = rays[j], y = rays[j + 1], z = rays[j + 2];
        const py = y * cp + z * sp, pz = z * cp - y * sp;
        const rx = x * ch + pz * sh, rz = pz * ch - x * sh;
        let u = (.5 + Math.atan2(rx, rz) / TAU) * tw;
        u = ((u % tw) + tw) % tw;
        const v = clamp((.5 - Math.asin(clamp(py, -1, 1)) / PI) * (th - 1), 0, th - 1);
        const x0 = Math.floor(u), y0 = Math.floor(v);
        const a = (y0 * tw + x0) * 4;
        if (bilinear) {
          const x1 = (x0 + 1) % tw, y1 = Math.min(th - 1, y0 + 1);
          const b = (y0 * tw + x1) * 4, c = (y1 * tw + x0) * 4, d = (y1 * tw + x1) * 4;
          const fx = u - x0, fy = v - y0;
          const wa = (1 - fx) * (1 - fy), wb = fx * (1 - fy), wc = (1 - fx) * fy, wd = fx * fy;
          target[i] = texture[a] * wa + texture[b] * wb + texture[c] * wc + texture[d] * wd;
          target[i + 1] = texture[a + 1] * wa + texture[b + 1] * wb + texture[c + 1] * wc + texture[d + 1] * wd;
          target[i + 2] = texture[a + 2] * wa + texture[b + 2] * wb + texture[c + 2] * wc + texture[d + 2] * wd;
        } else {
          target[i] = texture[a]; target[i + 1] = texture[a + 1]; target[i + 2] = texture[a + 2];
        }
        target[i + 3] = 255;
      }
      context.putImageData(output, 0, 0);
      if (!ready) {
        ready = true;
        if (typeof options.onReady === 'function') options.onReady();
      }
    }

    function requestDraw(interacting) {
      if (disposed) return;
      if (interacting) {
        lowResolution = true;
        win.clearTimeout(settleTimer);
        settleTimer = win.setTimeout(() => {
          settleTimer = 0;
          if (disposed) return;
          lowResolution = false;
          requestDraw(false);
        }, 160);
      }
      if (!frame) frame = win.requestAnimationFrame(draw);
    }

    function setDirection(nextYaw, nextPitch) {
      if (disposed) return;
      if (Number.isFinite(Number(nextYaw))) yaw = wrap(Number(nextYaw));
      if (Number.isFinite(Number(nextPitch))) pitch = clamp(Number(nextPitch), -60, 60);
      requestDraw(true);
    }
    function zoom(delta) {
      if (disposed || !Number.isFinite(Number(delta))) return;
      fov = clamp(fov - Number(delta) * 8, 40, 100);
      requestDraw(true);
    }
    function reset() {
      if (disposed) return;
      yaw = 0; pitch = 0; fov = 80;
      requestDraw(true);
    }
    function pinchDistance() {
      const pair = Array.from(pointers.values());
      return pair.length < 2 ? null : Math.hypot(pair[1].x - pair[0].x, pair[1].y - pair[0].y);
    }
    function pointerDown(event) {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      event.preventDefault();
      canvas.focus({ preventScroll: true });
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      try { canvas.setPointerCapture(event.pointerId); } catch (_) { /* Pointer may already have ended. */ }
      lastPinch = pinchDistance();
      canvas.style.cursor = 'grabbing';
    }
    function pointerMove(event) {
      const old = pointers.get(event.pointerId);
      if (!old) return;
      event.preventDefault();
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pointers.size > 1) {
        const distance = pinchDistance();
        if (lastPinch && distance) fov = clamp(fov * lastPinch / distance, 40, 100);
        lastPinch = distance;
      } else {
        yaw = wrap(yaw - (event.clientX - old.x) * fov / Math.max(1, cssWidth));
        pitch = clamp(pitch + (event.clientY - old.y) * fov / Math.max(1, cssWidth), -60, 60);
      }
      requestDraw(true);
    }
    function pointerEnd(event) {
      if (!pointers.has(event.pointerId)) return;
      pointers.delete(event.pointerId);
      lastPinch = pinchDistance();
      try { if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId); } catch (_) {}
      if (!pointers.size) canvas.style.cursor = 'grab';
      requestDraw(true);
    }
    function wheel(event) {
      event.preventDefault();
      fov = clamp(fov + clamp(event.deltaY, -100, 100) * .08, 40, 100);
      requestDraw(true);
    }
    function keyDown(event) {
      const step = event.shiftKey ? 15 : 5;
      switch (event.key) {
        case 'ArrowLeft': setDirection(yaw - step, pitch); break;
        case 'ArrowRight': setDirection(yaw + step, pitch); break;
        case 'ArrowUp': setDirection(yaw, pitch + step); break;
        case 'ArrowDown': setDirection(yaw, pitch - step); break;
        case '+': case '=': zoom(1); break;
        case '-': case '_': zoom(-1); break;
        case '0': case 'Home': reset(); break;
        default: return;
      }
      event.preventDefault();
      event.stopPropagation();
    }
    function resize() { measure(); requestDraw(false); }

    function destroy() {
      if (disposed) return;
      disposed = true;
      win.cancelAnimationFrame(frame);
      win.clearTimeout(settleTimer);
      if (resizeObserver) resizeObserver.disconnect();
      listeners.forEach(remove => remove());
      for (const id of pointers.keys()) {
        try { if (canvas.hasPointerCapture(id)) canvas.releasePointerCapture(id); } catch (_) {}
      }
      pointers.clear();
      image.onload = null; image.onerror = null;
      image.removeAttribute('src');
      texture = null; rays = null; output = null;
      canvas.remove();
    }

    if (!context) {
      win.setTimeout(() => fail(new Error('Canvas 2D is not available.')), 0);
      return { destroy, reset, zoom, setDirection };
    }
    listen(canvas, 'pointerdown', pointerDown);
    listen(canvas, 'pointermove', pointerMove);
    listen(canvas, 'pointerup', pointerEnd);
    listen(canvas, 'pointercancel', pointerEnd);
    listen(canvas, 'lostpointercapture', pointerEnd);
    listen(canvas, 'wheel', wheel, { passive: false });
    listen(canvas, 'keydown', keyDown);
    if (typeof win.ResizeObserver === 'function') {
      resizeObserver = new win.ResizeObserver(resize);
      resizeObserver.observe(container);
    } else listen(win, 'resize', resize);
    measure();
    image.onload = function () {
      if (disposed) return;
      try {
        if (!image.naturalWidth || !image.naturalHeight) throw new Error('Panorama image is empty.');
        const buffer = doc.createElement('canvas');
        // Limit texture memory to 32 MB even for unusually large source assets.
        const scale = Math.min(1, 4096 / image.naturalWidth, 2048 / image.naturalHeight);
        buffer.width = Math.max(1, Math.round(image.naturalWidth * scale));
        buffer.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const bufferContext = buffer.getContext('2d', { willReadFrequently: true });
        if (!bufferContext) throw new Error('Canvas texture could not be read.');
        bufferContext.drawImage(image, 0, 0, buffer.width, buffer.height);
        textureWidth = buffer.width; textureHeight = buffer.height;
        texture = bufferContext.getImageData(0, 0, textureWidth, textureHeight).data;
        requestDraw(false);
      } catch (error) { fail(error); }
    };
    image.onerror = () => fail(new Error('Panorama image could not be loaded.'));
    if (!options.src) fail(new Error('Panorama image URL is missing.'));
    else image.src = options.src;
    return { destroy, reset, zoom, setDirection };
  }

  const api = { mount };
  if (typeof module === 'object' && module.exports) module.exports = { mount, directionUV };
  else root.MatchaPanorama = api;
})(typeof window !== 'undefined' ? window : globalThis);
