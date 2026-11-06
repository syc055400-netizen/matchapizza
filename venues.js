/* Venue facts: venue-sources.json. The rehearsal grids are not seat-by-seat surveys. */
(() => {
  'use strict';
  const venueData = {
    yes24: {
      id:'yes24', name:'YES24 LIVE HALL', kind:'hall',
      description:'1층 플로어와 2층 지정석으로 구성된 라이브 공연장',
      sourceName:'YES24 2026 회사소개서 · 공연장 안내',
      sourceUrl:'https://company.yes24.com/pdf/2026_YES24_%ED%9A%8C%EC%82%AC%EC%86%8C%EA%B0%9C%EC%84%9C.pdf',
      officialUrl:'https://www.yes24livehall.com/',
      capacity:'1층 지정석 714석 · 2층 지정석 337석',
      layoutNote:'1층은 공연에 따라 스탠딩 또는 지정석으로 운영돼요. 아래는 층 선택용 개념도예요.',
      practiceNote:'층 구분은 공식 자료를 참고했어요. 연습 좌석의 행·번호와 무대 배치는 실제 공연과 달라요.',
      zones:[
        {id:'1F',name:'1층 지정석',label:'1층 지정석',short:'1층',grade:'1층',tier:0,side:'center',price:110000,x:50,y:40},
        {id:'2F',name:'2층 지정석',label:'2층 지정석',short:'2층',grade:'2층',tier:1,side:'center',price:88000,x:50,y:74}
      ]
    },
    worldcup: {
      id:'worldcup',name:'서울월드컵경기장',kind:'football',
      description:'상암 · 축구장을 둘러싼 동·서·남·북 관람석',
      sourceName:'서울시설공단 · 주경기장 좌석안내',
      sourceUrl:'https://www.sisul.or.kr/open_content/worldcup/guidance/mainst_seat.jsp',
      officialUrl:'https://www.sisul.or.kr/open_content/worldcup/guidance/mainst_seat.jsp',
      mapUrl:'venue-worldcup.jpg',
      mapSourceUrl:'https://www.gcyf.or.kr/data/file/notice/3547819810_nwk1RMmu_ca2fc98c3ad2135f3193341ae04928916ca2bc4d.pdf',
      mapCredit:'2025 공개 안내자료의 좌석도 · 출처: 고양시청소년재단(FC서울 좌석도)',
      capacity:'공식 경기장 규모 66,704석 · 축구라인 105 × 68m',
      layoutNote:'2025 공개 안내자료의 축구 좌석도예요. 현재 운영 구역은 공식 안내를 확인하세요. 콘서트 무대·플로어는 공연마다 달라져요.',
      practiceNote:'실제 경기장 좌석도를 참고해 방향을 선택해요. 연습 좌석의 행·번호와 공연 무대는 가상 배치예요.',
      zones:[
        {id:'E',name:'동측 관람석',label:'동측 관람석',short:'동측 E',grade:'관람석',tier:0,side:'east',price:25000,x:85,y:49},
        {id:'W',name:'서측 관람석',label:'서측 관람석',short:'서측 W',grade:'관람석',tier:0,side:'west',price:35000,x:15,y:49},
        {id:'N',name:'북측 관람석',label:'북측 관람석',short:'북측 N',grade:'관람석',tier:0,side:'north',price:18000,x:50,y:15},
        {id:'S',name:'남측 관람석',label:'남측 관람석',short:'남측 S',grade:'관람석',tier:0,side:'south',price:18000,x:50,y:84}
      ]
    },
    gocheok: {
      id:'gocheok',name:'고척스카이돔',kind:'baseball',
      description:'실내 야구장 · 1~4층 내야와 외야 관람석',
      sourceName:'서울시설공단 · 고척스카이돔 2026 좌석배치도',
      sourceUrl:'https://www.sisul.or.kr/open_content/skydome/introduce/seat.jsp',
      officialUrl:'https://www.sisul.or.kr/open_content/skydome/introduce/seat.jsp',
      mapUrl:'venue-gocheok.png',
      mapSourceUrl:'https://heroesbaseball.co.kr/ticket/normal/viewCharge.do',
      mapOriginalUrl:'https://heroesbaseball.co.kr/html/front/web_2018/images/ticket/2025/dome00.png',
      mapCredit:'출처: 키움히어로즈 공식 입장요금 안내 · 전체 좌석도',
      capacity:'공식 시설 안내 16,601석',
      layoutNote:'키움히어로즈 공식 전체 좌석도예요. 번호가 표시된 대표 구역을 눌러 연습해 보세요.',
      practiceNote:'구역 번호는 공식 배치도를 참고했어요. 구역 안의 연습 좌석 행·번호는 가상이에요.',
      zones:[
        {id:'101',name:'101구역',label:'1층 101구역',short:'101',grade:'1층 내야',tier:0,side:'first',price:35000,x:86,y:44.5},
        {id:'114',name:'114구역',label:'1층 114구역',short:'114',grade:'1층 내야',tier:0,side:'third',price:35000,x:14,y:44.5},
        {id:'201',name:'201구역',label:'2층 201구역',short:'201',grade:'2층 내야',tier:1,side:'first',price:28000,x:87,y:51},
        {id:'210',name:'210구역',label:'2층 210구역',short:'210',grade:'2층 내야',tier:1,side:'third',price:28000,x:13,y:51},
        {id:'301',name:'301구역',label:'3층 301구역',short:'301',grade:'3층 내야',tier:2,side:'first',price:20000,x:90,y:57},
        {id:'322',name:'322구역',label:'3층 322구역',short:'322',grade:'3층 내야',tier:2,side:'third',price:20000,x:10,y:57},
        {id:'401',name:'401구역',label:'4층 401구역',short:'401',grade:'4층 내야',tier:3,side:'first',price:15000,x:92,y:61},
        {id:'424',name:'424구역',label:'4층 424구역',short:'424',grade:'4층 내야',tier:3,side:'third',price:15000,x:8,y:61},
        {id:'115',name:'115구역',label:'외야 115구역',short:'115',grade:'외야',tier:0,side:'outfield',price:15000,x:19,y:31},
        {id:'132',name:'132구역',label:'외야 132구역',short:'132',grade:'외야',tier:0,side:'outfield',price:15000,x:81,y:31}
      ]
    }
  };
  const safe = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function get(id) { return venueData[typeof id==='object' ? id.venueId : id] || venueData.yes24; }
  function background(venue) {
    if (venue.kind==='hall') return `<svg viewBox="0 0 500 300" aria-hidden="true"><rect x="68" y="15" width="364" height="37" rx="8" fill="#283440"/><text x="250" y="39" text-anchor="middle" fill="white" font-size="13">STAGE</text><rect x="90" y="75" width="320" height="95" rx="16" class="mv-terrace"/><path d="M70 198h360v65H70z" class="mv-terrace mv-upper"/><path d="M100 187h300" stroke="#c9cfd6" stroke-dasharray="5 4"/><text x="250" y="284" text-anchor="middle" class="mv-svg-note">층 구분 개념도</text></svg>`;
    if (venue.kind==='football') return `<svg viewBox="0 0 500 300" aria-hidden="true"><rect x="24" y="14" width="452" height="268" rx="98" class="mv-terrace"/><rect x="72" y="52" width="356" height="196" rx="68" fill="white"/><rect x="150" y="78" width="200" height="142" rx="3" fill="#e5f1e6" stroke="#91bb96"/><path d="M250 78v142M150 111h30v76h-30M350 111h-30v76h30" fill="none" stroke="white" stroke-width="2"/><circle cx="250" cy="149" r="23" fill="none" stroke="white" stroke-width="2"/><text x="250" y="153" text-anchor="middle" class="mv-svg-note">FIELD</text></svg>`;
    return `<svg viewBox="0 0 500 340" aria-hidden="true"><path d="M57 92Q250-6 443 92L413 242Q250 359 87 242Z" class="mv-terrace"/><path d="M88 96Q250 20 412 96L383 225Q250 317 117 225Z" fill="white"/><path d="M102 102Q250 33 398 102L250 225Z" fill="#e5f1e6" stroke="#91bb96"/><path d="M250 225l-50-50 50-50 50 50Z" fill="#eadac3" stroke="white" stroke-width="2"/><circle cx="250" cy="175" r="6" fill="#c7a37a"/><path d="M250 225L102 102M250 225L398 102" stroke="white" stroke-width="2"/><text x="250" y="91" text-anchor="middle" class="mv-svg-note">외야</text><text x="250" y="246" text-anchor="middle" class="mv-svg-note">HOME</text><text x="104" y="155" text-anchor="middle" class="mv-svg-note">3루</text><text x="396" y="155" text-anchor="middle" class="mv-svg-note">1루</text></svg>`;
  }
  function renderOverview(venueId, activeZoneId) {
    const venue=get(venueId), selected=venue.zones.find(z=>z.id===String(activeZoneId)) || venue.zones[0];
    return `<section class="mv-overview" aria-label="${safe(venue.name)} 구역 선택"><div class="mv-heading"><div><span class="mv-kicker">VENUE GUIDE</span><h3>${safe(venue.name)}</h3><p>${safe(venue.description)}</p></div><a class="mv-source-link" href="${safe(venue.sourceUrl)}" target="_blank" rel="noopener noreferrer">공식 안내 ↗</a></div><div class="mv-schematic mv-${venue.kind} ${venue.mapUrl?'mv-source-map':''}">${venue.mapUrl?`<img class="mv-primary-image" src="${safe(venue.mapUrl)}" alt="${safe(venue.name)} 실제 좌석배치도" decoding="async">`:background(venue)}${venue.zones.map(z=>`<button type="button" data-action="venue-zone" data-zone="${safe(z.id)}" class="mv-zone ${venue.mapUrl?'mv-map-anchor':''} ${selected.id===z.id?'is-selected':''}" style="--mv-x:${z.x}%;--mv-y:${z.y}%" aria-label="${safe(z.label)} 선택" aria-pressed="${selected.id===z.id}">${safe(z.short)}</button>`).join('')}</div>${venue.mapUrl?`<p class="mv-credit mv-primary-credit">${safe(venue.mapCredit || venue.sourceName)} · <a href="${safe(venue.mapSourceUrl || venue.sourceUrl)}" target="_blank" rel="noopener noreferrer">출처 ↗</a></p>`:''}<div class="mv-selection"><span>선택 구역</span><strong>${safe(selected.label)}</strong><span>${safe(selected.grade)}</span></div><p class="mv-map-note">${safe(venue.layoutNote)}</p>${venue.mapUrl?`<details class="mv-official-map"><summary>공식 좌석배치도 펼쳐보기 <span>원본 자료</span></summary><div class="mv-map-image-wrap"><a href="${safe(venue.mapUrl)}" target="_blank" rel="noopener noreferrer" aria-label="공식 좌석배치도 원본 새 창으로 열기"><img class="mv-official-image" src="${safe(venue.mapUrl)}" alt="${safe(venue.name)} 공식 전체 좌석배치도" loading="lazy" decoding="async" referrerpolicy="no-referrer"></a><p class="mv-image-fallback" hidden>공식 이미지를 불러오지 못했어요. <a href="${safe(venue.sourceUrl)}" target="_blank" rel="noopener noreferrer">공식 사이트에서 좌석도 보기 ↗</a></p></div><p class="mv-credit">${safe(venue.mapCredit || venue.sourceName)} · <a href="${safe(venue.mapSourceUrl || venue.sourceUrl)}" target="_blank" rel="noopener noreferrer">출처 확인 ↗</a></p></details>`:''}<p class="mv-practice-note">${safe(venue.practiceNote)}</p></section>`;
  }
  document.addEventListener('error',event=>{
    const img=event.target;
    if (!img?.classList?.contains('mv-official-image')) return;
    img.hidden=true;
    const fallback=img.closest('.mv-map-image-wrap')?.querySelector('.mv-image-fallback');
    if(fallback) fallback.hidden=false;
  },true);
  window.MatchaVenues={data:venueData,venues:venueData,get,renderOverview};
})();
