/* Public, server-backed venue conversation. No seeded or simulated posts. */
(function () {
  'use strict';

  const API = 'https://matchapizza-community.syc123400.chatgpt.site/api/community';
  const ROOMS = {
    yes24: 'YES24 LIVE HALL',
    worldcup: '서울월드컵경기장',
    gocheok: '고척스카이돔'
  };
  const KEY = 'matchapizza.community.v1';
  const INTERVAL = 3000;
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (_) { /* Storage may be blocked. */ }
  function uuid() {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (letter) {
      const n = Math.floor(Math.random() * 16);
      return (letter === 'x' ? n : (n & 3) | 8).toString(16);
    });
  }
  const profile = {
    clientId: /^[0-9a-f-]{36}$/i.test(saved.clientId || '') ? saved.clientId : uuid(),
    nickname: typeof saved.nickname === 'string' ? Array.from(saved.nickname).slice(0, 12).join('') : '관객' + String(Math.floor(Math.random() * 10000)).padStart(4, '0'),
    tokens: saved.tokens && typeof saved.tokens === 'object' && !Array.isArray(saved.tokens) ? saved.tokens : {}
  };
  const rooms = {};
  Object.keys(ROOMS).forEach(function (room) {
    rooms[room] = { draft: '', messages: [], loaded: false, error: '', scrollTop: null, sending: false };
  });
  let active = null;
  let sequence = 0;
  let cooldownUntil = 0;
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(profile)); } catch (_) { /* In-memory use still works. */ }
  }
  persist();

  function node(tag, className, value) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (value !== undefined) el.textContent = value;
    return el;
  }
  function button(className, value, action) {
    const el = node('button', className, value);
    el.type = 'button';
    if (action) el.addEventListener('click', action);
    return el;
  }
  function current(ctx) { return active === ctx && ctx.container.isConnected; }
  function roomView(room) { return active && active.room === room && current(active) ? active : null; }
  function limit(value, max) { return Array.from(value).slice(0, max).join(''); }
  function length(value) { return Array.from(value).length; }
  function setError(ctx, message) {
    rooms[ctx.room].error = message;
    if (current(ctx)) {
      ctx.ui.error.textContent = message;
      ctx.ui.error.hidden = !message;
    }
  }
  function status(ctx, state) {
    ctx.status = state;
    if (!current(ctx)) return;
    const labels = { loading: '연결 중', connected: '3초마다 갱신', offline: '연결 끊김 · 재시도', paused: '갱신 일시정지' };
    ctx.ui.status.dataset.state = state;
    ctx.ui.status.textContent = labels[state];
    ctx.ui.refresh.textContent = state === 'offline' ? '다시 연결' : '새로고침';
    ctx.ui.refresh.disabled = !!ctx.polling;
  }
  function updateComposer(ctx) {
    if (!current(ctx)) return;
    const left = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
    const count = length(ctx.ui.input.value);
    ctx.ui.count.textContent = count + ' / 300';
    const sending = rooms[ctx.room].sending;
    ctx.ui.send.textContent = sending ? '전송 중…' : left ? left + '초 후 전송' : '보내기';
    ctx.ui.send.disabled = sending || left > 0 || !ctx.ui.input.value.trim();
  }
  function timeLabel(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const today = new Date();
    const sameDay = date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
    return date.toLocaleString('ko-KR', sameDay ? { hour: '2-digit', minute: '2-digit', hour12: false } : { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
  }
  function messages(ctx, forceBottom) {
    if (!current(ctx)) return;
    const data = rooms[ctx.room];
    const list = ctx.ui.list;
    const priorTop = list.scrollTop;
    const atBottom = list.scrollHeight - list.clientHeight - priorTop < 64;
    const signature = JSON.stringify(data.messages.map(function (m) { return [m.id, m.nickname, m.body, m.createdAt, !!profile.tokens[String(m.id)]]; }));
    if (ctx.messageSignature === signature && ctx.emptyState === data.loaded) return;
    ctx.messageSignature = signature;
    ctx.emptyState = data.loaded;
    list.replaceChildren();
    if (!data.messages.length) {
      const empty = node('div', 'mc-empty');
      empty.append(node('span', 'mc-empty-symbol', '“'), node('strong', '', data.loaded ? '첫 이야기를 남겨보세요' : '대화 불러오는 중'));
      empty.append(node('p', '', data.loaded ? '좌석 고민, 예매 준비 팁을 함께 나눠요.' : '공연장별 대화를 서버에서 확인하고 있어요.'));
      list.append(empty);
    } else {
      data.messages.forEach(function (item) {
        const own = !!profile.tokens[String(item.id)];
        const row = node('article', 'mc-message' + (own ? ' mc-message-own' : ''));
        const avatar = node('span', 'mc-avatar', limit(item.nickname, 1) || '관');
        avatar.setAttribute('aria-hidden', 'true');
        const content = node('div', 'mc-message-content');
        const meta = node('div', 'mc-message-meta');
        meta.append(node('strong', 'mc-message-author', item.nickname));
        if (own) meta.append(node('span', 'mc-own-tag', '나'));
        const time = node('time', 'mc-message-time', timeLabel(item.createdAt));
        time.dateTime = item.createdAt;
        meta.append(time);
        if (own) {
          const remove = button('mc-delete', '삭제', function () { removeMessage(ctx, item.id, remove); });
          remove.setAttribute('aria-label', '내 메시지 삭제: ' + limit(item.body, 20));
          meta.append(remove);
        }
        content.append(meta, node('p', 'mc-message-body', item.body));
        row.append(avatar, content);
        list.append(row);
      });
    }
    if (forceBottom || atBottom) list.scrollTop = list.scrollHeight;
    else list.scrollTop = priorTop;
  }
  async function request(ctx, method, body) {
    const controller = new AbortController();
    // Switching rooms may cancel a read. A submitted mutation must finish so its
    // server-issued deletion token is retained even after its view is unmounted.
    if (method === 'GET') ctx.controllers.add(controller);
    const timeout = window.setTimeout(function () { controller.abort(); }, 10000);
    try {
      const response = await fetch(API + (method === 'GET' ? '?room=' + encodeURIComponent(ctx.room) : ''), {
        method: method,
        mode: 'cors',
        credentials: 'omit',
        cache: 'no-store',
        headers: body ? { 'Content-Type': 'application/json' } : {},
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });
      const data = await response.json();
      if (!response.ok) {
        const error = new Error(typeof data.error === 'string' ? data.error : '요청을 처리하지 못했어요. 잠시 후 다시 시도해주세요.');
        error.status = response.status;
        error.retryAfter = Number(data.retryAfter || response.headers.get('Retry-After') || 3);
        throw error;
      }
      return data;
    } finally {
      window.clearTimeout(timeout);
      ctx.controllers.delete(controller);
    }
  }
  function schedule(ctx) {
    window.clearTimeout(ctx.pollTimer);
    if (current(ctx) && !document.hidden) ctx.pollTimer = window.setTimeout(function () { poll(ctx); }, INTERVAL);
  }
  async function poll(ctx) {
    if (!current(ctx) || document.hidden || ctx.polling) return;
    window.clearTimeout(ctx.pollTimer);
    ctx.polling = true;
    status(ctx, rooms[ctx.room].loaded ? ctx.status : 'loading');
    try {
      const result = await request(ctx, 'GET');
      if (!Array.isArray(result.messages)) throw new Error('Invalid message response');
      if (!current(ctx)) return;
      rooms[ctx.room].messages = result.messages.filter(function (m) {
        return m && (typeof m.id === 'string' || typeof m.id === 'number') && typeof m.nickname === 'string' && typeof m.body === 'string' && typeof m.createdAt === 'string';
      }).slice(-50);
      rooms[ctx.room].loaded = true;
      status(ctx, 'connected');
      messages(ctx, false);
    } catch (_) {
      if (!current(ctx)) return;
      status(ctx, document.hidden ? 'paused' : 'offline');
      if (!rooms[ctx.room].loaded) {
        ctx.ui.list.replaceChildren();
        const empty = node('div', 'mc-empty');
        empty.append(node('span', 'mc-empty-symbol', '↻'), node('strong', '', '대화에 연결하지 못했어요'), node('p', '', '연결을 확인한 뒤 다시 연결을 눌러주세요.'));
        ctx.ui.list.append(empty);
        ctx.messageSignature = null;
      }
    } finally {
      ctx.polling = false;
      if (current(ctx)) {
        status(ctx, ctx.status);
        schedule(ctx);
      }
    }
  }
  async function submit(ctx, event) {
    event.preventDefault();
    if (!current(ctx) || rooms[ctx.room].sending || Date.now() < cooldownUntil) return;
    const body = rooms[ctx.room].draft.trim();
    if (!body) return;
    const nickname = ctx.ui.nickname.value.trim() || profile.nickname || '관객' + String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    profile.nickname = limit(nickname, 12);
    ctx.ui.nickname.value = profile.nickname;
    persist();
    rooms[ctx.room].sending = true;
    setError(ctx, '');
    updateComposer(ctx);
    try {
      const result = await request(ctx, 'POST', { room: ctx.room, nickname: profile.nickname, body: body, clientId: profile.clientId });
      if (!result.message || result.message.id === undefined) throw new Error('Invalid send response');
      if (typeof result.deleteToken === 'string') {
        profile.tokens[String(result.message.id)] = result.deleteToken;
        persist();
      }
      cooldownUntil = Date.now() + INTERVAL;
      const data = rooms[ctx.room];
      if (data.draft.trim() === body) data.draft = '';
      if (!data.messages.some(function (m) { return String(m.id) === String(result.message.id); })) data.messages.push(result.message);
      data.messages = data.messages.slice(-50);
      data.loaded = true;
      const view = roomView(ctx.room);
      if (view) {
        view.ui.input.value = data.draft;
        status(view, 'connected');
        messages(view, true);
      }
    } catch (error) {
      if (error.status === 429) cooldownUntil = Date.now() + Math.min(60, Math.max(3, error.retryAfter || 3)) * 1000;
      const view = roomView(ctx.room);
      setError(view || ctx, error.status ? error.message : '전송 결과를 확인하지 못했어요. 대화를 새로고침한 뒤 다시 시도해주세요.');
      if (view && !error.status) status(view, 'offline');
    } finally {
      rooms[ctx.room].sending = false;
      const view = roomView(ctx.room);
      if (view) updateComposer(view);
    }
  }
  async function removeMessage(ctx, id, control) {
    const token = profile.tokens[String(id)];
    if (!current(ctx) || !token || control.disabled) return;
    control.disabled = true;
    control.textContent = '삭제 중';
    setError(ctx, '');
    try {
      await request(ctx, 'DELETE', { id: id, deleteToken: token });
      delete profile.tokens[String(id)];
      persist();
      rooms[ctx.room].messages = rooms[ctx.room].messages.filter(function (m) { return String(m.id) !== String(id); });
      const view = roomView(ctx.room);
      if (view) messages(view, false);
    } catch (error) {
      const view = roomView(ctx.room);
      setError(view || ctx, error.status ? error.message : '삭제 결과를 확인하지 못했어요. 새로고침한 뒤 확인해주세요.');
      if (!current(ctx)) return;
      control.disabled = false;
      control.textContent = '삭제';
    }
  }
  function unmount() {
    const ctx = active;
    if (!ctx) return;
    rooms[ctx.room].scrollTop = ctx.ui.list.scrollTop;
    active = null;
    window.clearTimeout(ctx.pollTimer);
    window.clearInterval(ctx.composerTimer);
    document.removeEventListener('visibilitychange', ctx.visibility);
    ctx.controllers.forEach(function (controller) { controller.abort(); });
    ctx.controllers.clear();
    if (ctx.root.parentNode === ctx.container) ctx.root.remove();
  }
  function mount(container, options) {
    options = options || {};
    if (typeof container === 'string') container = document.querySelector(container);
    if (!container || typeof container.append !== 'function') return null;
    const room = Object.prototype.hasOwnProperty.call(ROOMS, options.room) ? options.room : 'yes24';
    unmount();
    const ctx = { container: container, room: room, compact: !!options.compact, id: ++sequence, controllers: new Set(), status: 'loading', polling: false, ui: {} };
    active = ctx;
    const section = node('section', 'matcha-community' + (ctx.compact ? ' mc-compact' : ''));
    ctx.root = section;
    const headingId = 'mc-heading-' + ctx.id;
    section.setAttribute('aria-labelledby', headingId);
    const head = node('div', 'mc-header');
    const titleGroup = node('div', 'mc-title-group');
    const eyebrow = node('span', 'mc-eyebrow', 'TOGETHER, TICKETING');
    const title = node('h2', 'mc-title', '예매 실시간 커뮤니티');
    title.id = headingId;
    titleGroup.append(eyebrow, title, node('p', 'mc-subtitle', '같은 공연장을 준비하는 사람들과 이야기해요.'));
    const connection = node('div', 'mc-connection');
    ctx.ui.status = node('span', 'mc-status', '연결 중');
    ctx.ui.status.setAttribute('role', 'status');
    ctx.ui.status.setAttribute('aria-live', 'polite');
    ctx.ui.status.dataset.state = 'loading';
    ctx.ui.refresh = button('mc-refresh', '새로고침', function () { poll(ctx); });
    connection.append(ctx.ui.status, ctx.ui.refresh);
    head.append(titleGroup, connection);
    const tabs = node('div', 'mc-rooms');
    tabs.setAttribute('role', 'group');
    tabs.setAttribute('aria-label', '공연장 대화방');
    Object.keys(ROOMS).forEach(function (key) {
      const tab = button('mc-room' + (key === room ? ' is-active' : ''), ROOMS[key], function () {
        if (key !== ctx.room) setRoom(key);
      });
      tab.setAttribute('aria-pressed', String(key === room));
      tabs.append(tab);
    });
    ctx.ui.list = node('div', 'mc-messages');
    ctx.ui.list.setAttribute('role', 'region');
    ctx.ui.list.setAttribute('aria-label', ROOMS[room] + ' 최근 대화');
    ctx.ui.list.tabIndex = 0;
    const form = node('form', 'mc-composer');
    form.addEventListener('submit', function (event) { submit(ctx, event); });
    const row = node('div', 'mc-compose-top');
    const nickLabel = node('label', 'mc-nickname-label', '닉네임');
    ctx.ui.nickname = node('input', 'mc-nickname');
    ctx.ui.nickname.type = 'text';
    ctx.ui.nickname.value = profile.nickname;
    ctx.ui.nickname.setAttribute('aria-label', '대화에 표시할 닉네임, 최대 12자');
    ctx.ui.nickname.autocomplete = 'off';
    ctx.ui.nickname.maxLength = 24;
    ctx.ui.nickname.addEventListener('input', function () {
      if (length(ctx.ui.nickname.value) > 12) ctx.ui.nickname.value = limit(ctx.ui.nickname.value, 12);
      profile.nickname = ctx.ui.nickname.value;
      persist();
    });
    nickLabel.append(ctx.ui.nickname);
    row.append(nickLabel, node('span', 'mc-post-notice', '작성한 글은 누구나 볼 수 있어요.'));
    const inputLabel = node('label', 'mc-visually-hidden', '대화 내용');
    const inputId = 'mc-input-' + ctx.id;
    inputLabel.htmlFor = inputId;
    ctx.ui.input = node('textarea', 'mc-input');
    ctx.ui.input.id = inputId;
    ctx.ui.input.rows = 2;
    ctx.ui.input.maxLength = 600;
    ctx.ui.input.value = rooms[room].draft;
    ctx.ui.input.placeholder = '좌석이나 예매에 대해 이야기해보세요.';
    ctx.ui.input.setAttribute('aria-describedby', 'mc-input-hint-' + ctx.id);
    ctx.ui.input.addEventListener('input', function () {
      if (length(ctx.ui.input.value) > 300) ctx.ui.input.value = limit(ctx.ui.input.value, 300);
      rooms[ctx.room].draft = ctx.ui.input.value;
      updateComposer(ctx);
    });
    ctx.ui.input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' && !event.shiftKey && !event.isComposing && event.keyCode !== 229) submit(ctx, event);
    });
    const bottom = node('div', 'mc-compose-bottom');
    const hint = node('span', 'mc-input-hint', 'Enter 전송 · Shift+Enter 줄바꿈');
    hint.id = 'mc-input-hint-' + ctx.id;
    ctx.ui.count = node('span', 'mc-count', '0 / 300');
    ctx.ui.send = button('mc-send', '보내기');
    ctx.ui.send.type = 'submit';
    const sendGroup = node('div', 'mc-send-group');
    sendGroup.append(ctx.ui.count, ctx.ui.send);
    bottom.append(hint, sendGroup);
    ctx.ui.error = node('p', 'mc-error', rooms[room].error);
    ctx.ui.error.hidden = !rooms[room].error;
    ctx.ui.error.setAttribute('role', 'alert');
    form.append(row, inputLabel, ctx.ui.input, bottom, ctx.ui.error);
    section.append(head, tabs, ctx.ui.list, form);
    container.append(section);
    messages(ctx, true);
    if (rooms[room].scrollTop !== null) ctx.ui.list.scrollTop = rooms[room].scrollTop;
    updateComposer(ctx);
    ctx.composerTimer = window.setInterval(function () { updateComposer(ctx); }, 250);
    ctx.visibility = function () {
      if (!current(ctx)) return;
      if (document.hidden) {
        window.clearTimeout(ctx.pollTimer);
        status(ctx, 'paused');
      } else poll(ctx);
    };
    document.addEventListener('visibilitychange', ctx.visibility);
    if (document.hidden) status(ctx, 'paused');
    else poll(ctx);
    return section;
  }
  function setRoom(room) {
    if (!active || !Object.prototype.hasOwnProperty.call(ROOMS, room) || active.room === room) return;
    return mount(active.container, { room: room, compact: active.compact });
  }
  window.MatchaCommunity = Object.freeze({ mount: mount, unmount: unmount, setRoom: setRoom });
})();
