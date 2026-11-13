(function () {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = value => `${(Number(value)||0).toLocaleString('ko-KR')}원`;
  const icons = {
    back:'<path d="m15 5-7 7 7 7"/>',
    home:'<path d="m3 10 9-7 9 7v11h-6v-7H9v7H3Z"/>',
    search:'<circle cx="10.5" cy="10.5" r="7.5"/><path d="m16 16 5 5"/>',
    arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
    view:'<path d="M3 9c4-5 14-5 18 0v9c-5 4-13 4-18 0Z"/><path d="M3 9c5 4 13 4 18 0M12 12v9"/>',
    pin:'<path d="M19 10c0 6-7 11-7 11S5 16 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>'
  };
  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.arrow}</svg>`;
  const tabs = [['info','상세정보'],['venue','장소'],['view','3D뷰'],['community','커뮤니티']];
  function safeURL(value) {const v=String(value||''); return /^(https?:\/\/|\.?\.?\/|[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp))/i.test(v)?esc(v):'';}
  function photoBlock(photo, extra='') {
    if(!photo?.src)return '';
    return `<figure class="ed-photo ${extra}"><img src="${safeURL(photo.src)}" alt="공연장 실제 내부 참고 사진" loading="lazy"><figcaption>${photo.sourceUrl?`<a href="${safeURL(photo.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(photo.credit||'사진 출처')} ↗</a>`:esc(photo.credit||'실제 내부 참고 사진')}</figcaption></figure>`;
  }
  function facts(e) {
    return `<dl class="ed-facts"><div><dt>기간</dt><dd>${esc(e.dates)}</dd></div><div><dt>관람시간 · 등급</dt><dd>${esc(e.duration)} · ${esc(e.age)}</dd></div><div><dt>장소</dt><dd><button type="button" data-action="detail-tab" data-tab="venue">${esc(e.place)} <span aria-hidden="true">›</span></button></dd></div></dl>`;
  }
  function priceTable(e) {
    return `<details class="ed-prices"><summary>좌석별 가격 안내 <span>연습용 가격</span><i aria-hidden="true">⌄</i></summary><div class="ed-price-list">${(e.zones||[]).map(z=>`<div><span>${esc(z.name)}</span><strong>${money(z.price)}</strong></div>`).join('')}</div><p>예매수수료는 1매당 1,000원으로 연습해요.</p></details>`;
  }
  function info(options) {
    const e=options.event;
    return `<div class="ed-info-layout"><div class="ed-poster-hero"><div class="ed-poster-wrap">${options.posterHTML||''}</div><span class="ed-poster-watermark">TICKETING REHEARSAL</span></div><section class="ed-information"><div class="ed-tags"><span>${esc(e.type)}</span><span class="ed-practice-tag">예매 연습</span></div><h1>${esc(e.title)}</h1><p class="ed-subtitle">${esc(e.subtitle)}</p>${facts(e)}${priceTable(e)}<button class="ed-rehearsal-banner" type="button" data-action="detail-tab" data-tab="view"><span><strong>실전 전에, 한 번 리허설</strong><small>내 자리 시야부터 미리 확인해요.</small></span><span class="ed-banner-icon">${icon('view')}</span>${icon('arrow')}</button></section></div>`;
  }
  function venue(options) {
    return `<section class="ed-tab-content ed-venue-panel"><div class="ed-section-title"><span class="ed-section-icon">${icon('pin')}</span><div><h1>${esc(options.event.place)}</h1><p>공연장과 좌석 구역을 살펴보세요.</p></div></div><div class="ed-venue-layout"><div>${photoBlock(options.photo)}<button class="ed-outline-button" data-action="detail-tab" data-tab="view" type="button">이 공연장 3D뷰 보기 ${icon('arrow')}</button></div><div>${options.venueHTML||''}</div></div></section>`;
  }
  function view(options) {
    return `<section class="ed-tab-content ed-view-panel"><div class="ed-section-title"><div><span class="ed-kicker">SEAT VIEW</span><h1>내 자리에서는 어떻게 보일까?</h1><p>공간을 둘러보고, 원하는 구역의 시야를 비교해요.</p></div></div><div class="ed-view-preview">${options.photo?.src?`<img src="${safeURL(options.photo.src)}" alt="${esc(options.event.place)} 내부 전경">`:''}<div class="ed-view-preview-copy"><span class="ed-view-tag">360° 둘러보기</span><h2>${esc(options.event.place)}</h2><p>드래그하며 좌우로 둘러보세요.</p><button class="ed-view-launch" type="button" data-action="seat-view" data-mode="panorama">파노라마 체험 시작 ${icon('arrow')}</button></div></div>${options.photo?.sourceUrl?`<p class="ed-credit">미리보기 사진 · <a href="${safeURL(options.photo.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(options.photo.credit||'출처 보기')} ↗</a></p>`:''}<div class="ed-view-choices"><button type="button" data-action="seat-view" data-mode="photo"><span>실제 사진</span><small>실내 전경 자세히 보기</small>${icon('arrow')}</button><button type="button" data-action="seat-view" data-mode="seat"><span>3D 좌석 시야</span><small>구역·좌석 위치 바꿔보기</small>${icon('arrow')}</button></div><p class="ed-view-note">파노라마는 AI 재현 체험용이며, 3D 좌석 시야는 연습용 모형이에요.</p></section>`;
  }
  function community() {return `<div class="ed-community-intro"><span class="ed-kicker">TOGETHER, TICKETING</span><h1>같은 공연, 함께 준비해요.</h1><p>좌석 고민부터 예매 팁까지 이야기해 보세요.</p></div>`;}
  function render(options) {
    const e=options.event,tab=tabs.some(([key])=>key===options.tab)?options.tab:'info';
    const body={info,venue,view,community}[tab](options);
    return `<div class="ed-shell"><header class="ed-topbar"><button type="button" data-action="home" class="ed-icon-button ed-back" aria-label="전체 공연으로 돌아가기">${icon('back')}</button><strong class="ed-topbar-title">${esc(e.title)}</strong><div class="ed-topbar-actions"><button type="button" data-action="home" class="ed-icon-button" aria-label="홈으로">${icon('home')}</button><button type="button" data-action="detail-search" class="ed-icon-button" aria-label="공연 검색">${icon('search')}</button></div></header><nav class="ed-tabs" role="tablist" aria-label="공연 상세 메뉴">${tabs.map(([key,label])=>`<button type="button" data-action="detail-tab" data-tab="${key}" role="tab" aria-selected="${key===tab}" aria-controls="event-detail-panel" id="detail-tab-${key}" tabindex="${key===tab?0:-1}" class="${key===tab?'is-active':''}" ${key===tab?'aria-current="page"':''}>${label}</button>`).join('')}</nav><div class="ed-tab-panel" id="event-detail-panel" role="tabpanel" aria-labelledby="detail-tab-${tab}">${body}</div><div class="ed-bookbar"><div class="ed-bookbar-inner"><div class="ed-book-price"><small>연습용 티켓</small><strong>${money(options.minPrice)}<span>부터</span></strong></div><button type="button" class="ed-book-button" data-action="detail-book">예매 연습하기 <span aria-hidden="true">→</span></button></div></div></div>`;
  }
  window.MatchaEventDetail=Object.freeze({render});
})();
