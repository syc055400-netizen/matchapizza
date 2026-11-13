(function () {
  'use strict';
  const CODE = '123456';
  const CARDS = ['신한카드', 'KB국민카드', '현대카드', '삼성카드', '하나카드', '우리카드'];
  const PAYS = ['카카오페이', '네이버페이', '토스페이'];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const won = value => `${Math.max(0, Number(value) || 0).toLocaleString('ko-KR')}원`;
  const defaults = options => ({ method:options.initialMethod === 'easy' ? 'easy':'card', card:CARDS[0], pay:PAYS[0], installment:'일시불', consent:[false,false], delay:false, delayed:false, channel:'app', sample:0 });
  const cardIcon = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2.5" y="5" width="19" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M3 9h18M6 15h5" stroke="currentColor" stroke-width="1.5"/></svg>';

  function markup(options, state) {
    return `<div class="mp-pay">
      <div class="mp-pay-intro"><div><span class="mp-pay-eyebrow">PAYMENT</span><h2>결제하기</h2><p>결제수단을 선택하고 결제창에서 인증을 진행해 주세요.</p></div><span class="mp-pay-badge">연습용</span></div>
      <section class="mp-pay-section"><h3><span>01</span> 결제수단</h3>
        <div class="mp-pay-methods" role="group" aria-label="결제 방법">
          <button type="button" data-pay="method" data-value="card" class="mp-pay-method ${state.method==='card'?'selected':''}" aria-pressed="${state.method==='card'}"><span class="mp-pay-method-icon">${cardIcon}</span><span><strong>신용·체크카드</strong><small>카드사 인증 후 결제</small></span><i aria-hidden="true"></i></button>
          <button type="button" data-pay="method" data-value="easy" class="mp-pay-method ${state.method==='easy'?'selected':''}" aria-pressed="${state.method==='easy'}"><span class="mp-pay-method-icon mp-pay-icon-p" aria-hidden="true">P</span><span><strong>간편결제</strong><small>등록된 결제수단 사용</small></span><i aria-hidden="true"></i></button>
        </div>
        ${state.method==='card'?`<div class="mp-pay-provider-grid" role="group" aria-label="카드사">${CARDS.map(name=>`<button type="button" data-pay="card" data-value="${name}" class="${state.card===name?'selected':''}" aria-pressed="${state.card===name}">${name}</button>`).join('')}</div><label class="mp-pay-installment">할부 기간<select data-pay="installment" aria-label="할부 선택"><option ${state.installment==='일시불'?'selected':''}>일시불</option>${Number(options.amount)>=50000?['2개월','3개월'].map(x=>`<option ${state.installment===x?'selected':''}>${x}</option>`).join(''):''}</select><small>${Number(options.amount)>=50000?'할부 선택 체험 · 무이자 혜택은 적용되지 않습니다.':'5만 원 미만은 일시불로 진행합니다.'}</small></label>`:`<div class="mp-pay-provider-grid mp-pay-provider-grid-easy" role="group" aria-label="간편결제 서비스">${PAYS.map((name,i)=>`<button type="button" data-pay="pay" data-value="${name}" class="mp-pay-provider-${i} ${state.pay===name?'selected':''}" aria-pressed="${state.pay===name}"><b aria-hidden="true">${['pay','N','toss'][i]}</b>${name}</button>`).join('')}</div>`}
        <div class="mp-pay-route"><span>결제창 열기</span><i>›</i><span>${state.method==='card'?'카드사':'간편결제'} 인증</span><i>›</i><span>최종 승인</span></div>
      </section>
      <section class="mp-pay-section"><h3><span>02</span> 결제 금액</h3><dl class="mp-pay-cost"><div><dt>티켓 금액 <small>${Array.isArray(options.seats)?options.seats.length:1}매</small></dt><dd>${won(options.ticketAmount ?? options.amount)}</dd></div><div><dt>예매수수료 <small>연습용</small></dt><dd>${won(options.fee)}</dd></div><div><dt>수령 방법</dt><dd>모바일 티켓 <small>무료</small></dd></div><div class="mp-pay-cost-total"><dt>총 결제 금액</dt><dd>${won(options.amount)}</dd></div></dl></section>
      <section class="mp-pay-section mp-pay-consents"><h3><span>03</span> 주문 확인 및 동의</h3><label class="mp-pay-all"><input type="checkbox" data-pay="all" ${state.consent.every(Boolean)?'checked':''}><strong>아래 내용을 모두 확인하고 동의합니다.</strong></label><label><input type="checkbox" data-pay="consent" data-index="0" ${state.consent[0]?'checked':''}><span><b>[필수]</b> 관람일시·좌석·결제 금액 확인</span></label><details class="mp-pay-order-details"><summary>예매 내용 보기</summary><p>${esc(options.eventTitle)}</p><p>${esc(options.session)}</p><p>${(options.seats||[]).map(esc).join(' / ')}</p></details><label><input type="checkbox" data-pay="consent" data-index="1" ${state.consent[1]?'checked':''}><span><b>[필수]</b> 실제 청구가 없는 결제 연습에 동의</span></label></section>
      <details class="mp-pay-practice"><summary>인증 지연 상황 연습 <span>선택</span></summary><label><input type="checkbox" data-pay="delay" ${state.delay?'checked':''}><span>첫 승인 요청에 지연 상황 적용<small>좌석과 결제수단을 유지한 채 다시 인증합니다.</small></span></label></details>
      <div class="mp-pay-submit"><button type="button" class="btn btn-primary" data-pay="submit" ${state.consent.every(Boolean)?'':'disabled'}>${won(options.amount)} 결제하기 <span aria-hidden="true">→</span></button><p>연습용 결제창이 열립니다. 실제 금액은 청구되지 않습니다.</p></div>
    </div>`;
  }
  function render(options) { return markup(options, defaults(options)); }

  function mount(root, options) {
    if (!root) throw new Error('Payment container is required');
    const state = defaults(options);
    let alive = true, modal = null, timer = null, clockTimer = null, pin = '', phase = '', processingStep = 0, completed = false, launchButton = null;
    root.innerHTML = markup(options,state);
    function refresh(focusKey, focusValue) {
      root.innerHTML = markup(options,state);
      if (focusKey) [...root.querySelectorAll('[data-pay]')].find(node=>node.dataset.pay===focusKey && (!focusValue||node.dataset.value===focusValue))?.focus({preventScroll:true});
    }
    function stopTimer() { if(timer !== null) { clearTimeout(timer); timer=null; } }
    function closeAuth() {
      stopTimer();
      if(clockTimer!==null){clearInterval(clockTimer);clockTimer=null;}
      if(modal) { modal.close(); modal.remove(); modal=null; }
      pin=''; phase='';
      if(alive) (launchButton?.isConnected ? launchButton : root.querySelector('[data-pay="submit"]'))?.focus({preventScroll:true});
    }
    function remaining() { const seconds=Math.max(0,Math.ceil((options.holdUntil-Date.now())/1000));return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`; }
    function isExpired(){return Number.isFinite(options.holdUntil)&&Date.now()>=options.holdUntil;}
    function tickClock(){const node=modal?.querySelector('[data-auth-clock]');if(node)node.textContent=remaining();}
    function provider(){return state.method==='card'?state.card:state.pay;}
    function cardTail(){return state.sample===0?'2026':'1106';}
    function head() {
      const step=phase==='gateway'?0:['app','pin','failure'].includes(phase)?1:2;
      return `<header class="mp-auth-header"><div><strong>matchapizza <span>PAY</span></strong><small>결제 서비스 체험</small></div><span class="mp-pay-badge">연습용</span><button type="button" data-auth="close" aria-label="결제 인증 취소">×</button></header><div class="mp-auth-meta"><span>실제 청구 없음</span>${Number.isFinite(options.holdUntil)?`<span>좌석 확보 <time data-auth-clock>${remaining()}</time></span>`:''}</div><ol class="mp-auth-steps" aria-label="결제 진행 단계">${['결제 방식','본인 인증','결제 확인'].map((text,i)=>`<li class="${i===step?'active':i<step?'done':''}" ${i===step?'aria-current="step"':''}><b>${i<step?'✓':i+1}</b>${text}</li>`).join('')}</ol>`;
    }
    function orderSummary(compact=false) {
      return `<section class="mp-auth-order ${compact?'is-compact':''}" aria-label="결제 주문 정보"><div class="mp-auth-merchant"><span>이용 가맹점</span><b>matchapizza</b></div><strong class="mp-auth-event">${esc(options.eventTitle)}</strong>${compact?'':`<p>${esc(options.session)}</p><p>${(options.seats||[]).map(esc).join(' · ')}</p>`}<div class="mp-auth-order-total"><span>결제 금액</span><strong>${won(options.amount)}</strong></div></section>`;
    }
    function sampleCard() {
      return `<div class="mp-auth-sample-card"><div><b>${esc(provider())}</b><span>DEMO CARD</span></div><i aria-hidden="true"></i><strong>•••• &nbsp;•••• &nbsp;•••• &nbsp;${cardTail()}</strong><div><span>REHEARSAL USER</span><span>${state.sample===0?'STANDARD':'PLUS'}</span></div></div>`;
    }
    function authBody() {
      if(phase==='gateway')return `${head()}<div class="mp-auth-body"><h2 id="mp-auth-title">${esc(provider())} 결제</h2><p class="mp-auth-lead">주문 정보를 확인하고 인증 방법을 선택해 주세요.</p>${orderSummary()}<h3 class="mp-auth-label">인증 방법</h3><div class="mp-auth-channels" role="group" aria-label="인증 방법">${state.method==='card'?`<button type="button" data-auth="channel" data-value="app" class="${state.channel==='app'?'selected':''}" aria-pressed="${state.channel==='app'}"><strong>카드사 앱</strong><small>등록된 카드로 인증</small><i aria-hidden="true"></i></button><button type="button" data-auth="channel" data-value="pin" class="${state.channel==='pin'?'selected':''}" aria-pressed="${state.channel==='pin'}"><strong>체험번호 인증</strong><small>6자리 번호로 진행</small><i aria-hidden="true"></i></button>`:`<div class="mp-auth-wallet-route"><strong>${esc(state.pay)} 앱</strong><span>등록된 결제수단으로 인증</span></div>`}</div><button class="btn btn-primary mp-auth-wide" type="button" data-auth="launch">${state.method==='easy'||state.channel==='app'?'모의 앱 열기':'인증 시작'}</button><p class="mp-auth-note">실제 앱 설치·로그인 없이 이 결제창에서 체험합니다.</p></div>`;
      if(phase==='app') return `${head()}<div class="mp-auth-body"><div class="mp-auth-app-title"><span>${esc(provider())}</span><small>모의 앱 화면</small></div><h2 id="mp-auth-title">결제할 카드를 선택해 주세요</h2><p class="mp-auth-lead">체험 사용자님의 등록 카드</p>${sampleCard()}<div class="mp-auth-card-selector" role="group" aria-label="체험 카드 선택">${['기본 카드','추가 카드'].map((name,i)=>`<button type="button" data-auth="sample" data-index="${i}" class="${state.sample===i?'selected':''}" aria-pressed="${state.sample===i}">${name} · ${i===0?'2026':'1106'}</button>`).join('')}</div><dl class="mp-auth-app-cost"><div><dt>결제 금액</dt><dd>${won(options.amount)}</dd></div><div><dt>결제 방식</dt><dd>${state.method==='card'?esc(state.installment):'일시불'}</dd></div></dl><button class="btn btn-primary mp-auth-wide" type="button" data-auth="confirm-app">이 카드로 인증하기</button><button class="text-button mp-auth-back" type="button" data-auth="back-gateway">다른 인증 방법 선택</button></div>`;
      if(phase==='confirm')return `${head()}<div class="mp-auth-body"><div class="mp-auth-verified"><span aria-hidden="true">✓</span>인증 완료</div><h2 id="mp-auth-title">이 금액으로 결제할까요?</h2><p class="mp-auth-lead">마지막으로 주문과 결제수단을 확인해 주세요.</p>${orderSummary()}<dl class="mp-auth-confirm-details"><div><dt>결제수단</dt><dd>${esc(provider())}</dd></div><div><dt>카드번호</dt><dd>•••• •••• •••• ${cardTail()} <small>체험용</small></dd></div><div><dt>할부 기간</dt><dd>${state.method==='card'?esc(state.installment):'일시불'}</dd></div></dl><button class="btn btn-primary mp-auth-wide" type="button" data-auth="approve">${won(options.amount)} 결제 승인</button><button class="text-button mp-auth-back" type="button" data-auth="back-gateway">결제수단 다시 확인</button><p class="mp-auth-note">연습용 승인입니다. 실제 청구는 발생하지 않습니다.</p></div>`;
      if(phase==='processing')return `${head()}<div class="mp-auth-body mp-auth-processing" role="status" aria-live="polite"><div class="mp-auth-spinner" aria-hidden="true"></div><h2 id="mp-auth-title">${processingStep===0?'인증 결과를 확인하고 있어요':'결제 승인 요청 중입니다'}</h2><p class="mp-auth-lead">결제가 끝날 때까지 잠시 기다려 주세요.</p>${orderSummary(true)}<ol class="mp-auth-process-list"><li class="done"><b>✓</b>결제수단 인증 완료</li><li class="${processingStep===1?'active':''}"><b>${processingStep===1?'•••':'2'}</b>${esc(provider())} 승인 요청</li><li><b>3</b>예매 결과 전달</li></ol></div>`;
      if(phase==='approved')return `${head()}<div class="mp-auth-body mp-auth-approved" role="status" aria-live="polite"><div class="mp-auth-checkmark" aria-hidden="true">✓</div><h2 id="mp-auth-title">예매 결과를 확인하고 있어요</h2><p class="mp-auth-lead">결제창을 닫고 예매 결과를 전달합니다.</p>${orderSummary(true)}<button class="btn btn-primary mp-auth-wide" type="button" data-auth="return">예매 결과 확인</button><p class="mp-auth-note">연습용 승인 · 실제 청구 없음</p></div>`;
      if(phase==='failure') return `${head()}<div class="mp-auth-body"><div class="mp-auth-failure" aria-hidden="true">!</div><h2 id="mp-auth-title">승인 응답이 지연되고 있습니다</h2><p class="mp-auth-lead">결제가 완료되지 않았습니다.<br>좌석 확보 시간 안에 다시 인증해 주세요.</p>${orderSummary(true)}<p class="mp-auth-failure-code">체험 오류 PAY-TIMEOUT · 선택한 좌석 유지</p><button class="btn btn-primary mp-auth-wide" type="button" data-auth="retry">다시 인증하기</button><button class="text-button mp-auth-back" type="button" data-auth="close">결제창 닫기</button></div>`;
      return `${head()}<div class="mp-auth-body mp-auth-pin-body"><span class="mp-auth-provider">${esc(provider())}</span><h2 id="mp-auth-title">결제 비밀번호 입력</h2><p class="mp-auth-lead">아래 체험번호 6자리를 입력해 주세요.</p><div class="mp-auth-code"><span>체험번호</span><strong>${CODE}</strong><small>실제 비밀번호 대신 이 번호를 사용하세요.</small></div><div class="mp-auth-pin" role="status" aria-label="체험번호 ${pin.length}자리 입력됨">${Array.from({length:6},(_,i)=>`<i class="${i<pin.length?'filled':''}" aria-hidden="true"></i>`).join('')}</div><p class="mp-auth-error" role="alert"></p><div class="mp-auth-keypad" aria-label="체험번호 입력 키패드">${['7','2','9','4','1','6','3','8','5','clear','0','back'].map(key=>`<button type="button" data-auth="key" data-key="${key}" aria-label="${key==='clear'?'전체 지우기':key==='back'?'한 자리 지우기':key}">${key==='clear'?'전체 삭제':key==='back'?'⌫':key}</button>`).join('')}</div><p class="mp-auth-note">키보드 숫자 입력 가능 · 체험용 보안 키패드</p><button class="text-button mp-auth-back" type="button" data-auth="back-gateway">인증 방법 다시 선택</button></div>`;
    }
    function showAuth(next,focusSelector) {
      if(!alive||!modal)return;
      phase = next;modal.innerHTML = authBody();modal.scrollTop=0;
      const focus=focusSelector||({gateway:'[data-auth="launch"]',app:'[data-auth="confirm-app"]',failure:'[data-auth="retry"]',pin:'[data-key="1"]',confirm:'[data-auth="approve"]',approved:'[data-auth="return"]'}[next]||'[data-auth="close"]');
      modal.querySelector(focus)?.focus({preventScroll:true});
    }
    function finishAuth() {
      if(!alive||completed||phase!=='approved'||isExpired()){if(isExpired())closeAuth();return;}
      completed=true;
      const approvedAt=Date.now();
      const receipt={method:state.method,provider:provider(),installment:state.method==='card'&&state.installment!=='일시불'?Number.parseInt(state.installment,10):0,amount:Number(options.amount)||0,approvedAt,approvalCode:`MP-${String(approvedAt).slice(-8)}`,cardLast4:cardTail(),authentication:state.method==='easy'?'간편결제 앱':state.channel==='app'?'카드사 앱':'체험번호 인증'};
      closeAuth();options.onComplete?.(receipt);
    }
    function advanceApproval(){
      if(!alive||!modal||completed||phase!=='processing'||isExpired()){if(isExpired())closeAuth();return;}
      if(processingStep===0){processingStep=1;showAuth('processing');timer=setTimeout(advanceApproval,1100);return;}
      if(state.delay&&!state.delayed){state.delayed=true;pin='';showAuth('failure');return;}
      showAuth('approved');timer=setTimeout(finishAuth,1000);
    }
    function approve(){if(phase!=='confirm'||completed||isExpired())return;processingStep=0;showAuth('processing');timer=setTimeout(advanceApproval,700);}
    function pressKey(key) {
      if(phase!=='pin') return;
      if(key==='clear')pin=''; else if(key==='back')pin=pin.slice(0,-1); else if(/^\d$/.test(key)&&pin.length<6)pin+=key; else return;
      const dots=modal.querySelector('.mp-auth-pin');dots.setAttribute('aria-label',`체험번호 ${pin.length}자리 입력됨`);
      [...dots.children].forEach((node,i)=>node.classList.toggle('filled',i<pin.length));
      const error=modal.querySelector('.mp-auth-error'); error.textContent='';
      if(pin.length===6) {
        if(pin!==CODE) { pin=''; [...dots.children].forEach(node=>node.classList.remove('filled'));dots.setAttribute('aria-label','체험번호 0자리 입력됨'); error.textContent='체험번호가 일치하지 않습니다. 123456을 입력해 주세요.'; return; }
        pin='';showAuth('confirm');
      }
    }
    function openAuth(button) {
      if(!alive||completed||modal||!state.consent.every(Boolean)||isExpired())return;
      launchButton=button;pin='';state.sample=0;
      modal=document.createElement('dialog');modal.className='mp-auth-dialog';modal.setAttribute('aria-labelledby','mp-auth-title');
      modal.addEventListener('cancel',event=>{event.preventDefault();closeAuth();});
      modal.addEventListener('click',event=>{
        const control=event.target.closest('[data-auth]');if(!control||control.disabled)return;
        const action=control.dataset.auth;
        if(action==='close')closeAuth();
        else if(action==='channel'&&phase==='gateway'&&['app','pin'].includes(control.dataset.value)){state.channel=control.dataset.value;showAuth('gateway',`[data-auth="channel"][data-value="${state.channel}"]`);}
        else if(action==='launch'&&phase==='gateway'){pin='';showAuth(state.method==='easy'||state.channel==='app'?'app':'pin');}
        else if(action==='sample'&&phase==='app'&&['0','1'].includes(control.dataset.index)){state.sample=Number(control.dataset.index);showAuth('app',`[data-auth="sample"][data-index="${state.sample}"]`);}
        else if(action==='confirm-app'&&phase==='app'||action==='retry'&&phase==='failure'){pin='';showAuth('pin');}
        else if(action==='back-gateway'&&['app','pin','confirm'].includes(phase)){pin='';showAuth('gateway');}
        else if(action==='key')pressKey(control.dataset.key);
        else if(action==='approve')approve();
        else if(action==='return')finishAuth();
      });
      modal.addEventListener('keydown',event=>{
        if(phase!=='pin')return;
        if(/^\d$/.test(event.key)){event.preventDefault();pressKey(event.key);}
        else if(event.key==='Backspace'){event.preventDefault();pressKey('back');}
        else if(event.key==='Delete'){event.preventDefault();pressKey('clear');}
      });
      document.body.append(modal);phase='gateway';modal.innerHTML=authBody();modal.showModal();modal.querySelector('[data-auth="launch"]')?.focus({preventScroll:true});
      if(Number.isFinite(options.holdUntil))clockTimer=setInterval(tickClock,1000);
    }
    function onClick(event) {
      const control=event.target.closest('[data-pay]'); if(!control||!root.contains(control)||control.disabled)return;
      const kind=control.dataset.pay,value=control.dataset.value;
      if(kind==='method' && ['card','easy'].includes(value)){state.method=value;refresh(kind,value);options.onMethodChange?.(value);}
      else if(kind==='card'&&CARDS.includes(value)){state.card=value;refresh(kind,value);}
      else if(kind==='pay'&&PAYS.includes(value)){state.pay=value;refresh(kind,value);}
      else if(kind==='submit')openAuth(control);
      options.onActivity?.();
    }
    function onChange(event) {
      const control=event.target,kind=control.dataset.pay;
      if(kind==='consent')state.consent[Number(control.dataset.index)]=control.checked;
      if(kind==='all'){state.consent=[control.checked,control.checked];root.querySelectorAll('[data-pay="consent"]').forEach(node=>node.checked=control.checked);}
      if(kind==='consent'||kind==='all'){const all=root.querySelector('[data-pay="all"]');all.checked=state.consent.every(Boolean);all.indeterminate=state.consent.some(Boolean)&&!all.checked;root.querySelector('[data-pay="submit"]').disabled=!all.checked;}
      if(kind==='installment'&&['일시불',...(Number(options.amount)>=50000?['2개월','3개월']:[])].includes(control.value))state.installment=control.value;
      if(kind==='delay'){state.delay=control.checked;state.delayed=false;}
      options.onActivity?.();
    }
    root.addEventListener('click',onClick);root.addEventListener('change',onChange);
    return {destroy(){alive=false;stopTimer();closeAuth();root.removeEventListener('click',onClick);root.removeEventListener('change',onChange);}};
  }
  function receiptHTML(receipt) {
    if(!receipt)return '';
    const date=new Date(receipt.approvedAt),timestamp=Number.isFinite(date.getTime())?date.toLocaleString('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}):'';
    const last4=/^\d{4}$/.test(receipt.cardLast4||'')?receipt.cardLast4:'';
    return `<section class="mp-pay-receipt" aria-label="모의 결제 내역"><header><div><span>PAYMENT RECEIPT</span><h3>결제 승인내역</h3></div><b>승인 완료</b></header><dl><div><dt>가맹점</dt><dd>matchapizza</dd></div><div><dt>결제수단</dt><dd>${esc(receipt.provider)} · ${Number(receipt.installment)>0?`${Number(receipt.installment)}개월`:'일시불'}</dd></div>${last4?`<div><dt>체험 카드</dt><dd>•••• •••• •••• ${last4}</dd></div>`:''}<div><dt>결제 금액</dt><dd><strong>${won(receipt.amount)}</strong></dd></div><div><dt>승인 일시</dt><dd>${esc(timestamp)}</dd></div><div><dt>승인번호</dt><dd class="mp-pay-receipt-code">${esc(receipt.approvalCode)}</dd></div></dl><p>연습용 내역 · 실제 승인 및 청구 없음</p></section>`;
  }
  window.MatchaPayment=Object.freeze({render,mount,receiptHTML});
})();
