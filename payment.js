(function () {
  'use strict';
  const CODE = '123456';
  const CARDS = ['신한카드', 'KB국민카드', '현대카드', '삼성카드', '하나카드', '우리카드'];
  const PAYS = ['카카오페이', '네이버페이', '토스페이'];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const won = value => `${Math.max(0, Number(value) || 0).toLocaleString('ko-KR')}원`;
  const defaults = options => ({ method:options.initialMethod === 'easy' ? 'easy':'card', card:CARDS[0], pay:PAYS[0], installment:'일시불', consent:[false,false], delay:false, delayed:false });

  function markup(options, state) {
    return `<div class="mp-pay">
      <div class="mp-pay-intro"><div><span class="mp-pay-eyebrow">PAYMENT</span><h2>결제수단 선택</h2><p>결제창에서 인증까지, 실전처럼 연습해 보세요.</p></div><span class="mp-pay-badge">모의결제</span></div>
      <section class="mp-pay-section"><h3><span>01</span> 결제 방법</h3>
        <div class="mp-pay-methods" role="group" aria-label="결제 방법">
          <button type="button" data-pay="method" data-value="card" class="mp-pay-method ${state.method==='card'?'selected':''}" aria-pressed="${state.method==='card'}"><span class="mp-pay-method-icon" aria-hidden="true">▰</span><span><strong>신용·체크카드</strong><small>카드사 선택 후 인증</small></span><i aria-hidden="true"></i></button>
          <button type="button" data-pay="method" data-value="easy" class="mp-pay-method ${state.method==='easy'?'selected':''}" aria-pressed="${state.method==='easy'}"><span class="mp-pay-method-icon mp-pay-icon-p" aria-hidden="true">P</span><span><strong>간편결제</strong><small>앱 결제 흐름 체험</small></span><i aria-hidden="true"></i></button>
        </div>
        ${state.method==='card'?`<div class="mp-pay-provider-grid" role="group" aria-label="카드사">${CARDS.map(name=>`<button type="button" data-pay="card" data-value="${name}" class="${state.card===name?'selected':''}" aria-pressed="${state.card===name}">${name}</button>`).join('')}</div><div class="mp-pay-card-row"><div class="mp-pay-sample-card"><span>${esc(state.card)} <small>연습용 카드</small></span><strong>•••• &nbsp;•••• &nbsp;•••• &nbsp;2026</strong><span class="mp-pay-card-footer">MATCHAPIZZA <span>DEMO</span></span></div><label class="mp-pay-installment">할부 선택<select data-pay="installment" aria-label="할부 선택"><option ${state.installment==='일시불'?'selected':''}>일시불</option>${Number(options.amount)>=50000?['2개월','3개월'].map(x=>`<option ${state.installment===x?'selected':''}>${x}</option>`).join(''):''}</select><small>${Number(options.amount)>=50000?'5만 원 이상 · 할부 선택 체험':'5만 원 미만은 일시불만 가능해요.'}</small></label></div>`:`<div class="mp-pay-provider-grid mp-pay-provider-grid-easy" role="group" aria-label="간편결제 서비스">${PAYS.map((name,i)=>`<button type="button" data-pay="pay" data-value="${name}" class="mp-pay-provider-${i} ${state.pay===name?'selected':''}" aria-pressed="${state.pay===name}"><b aria-hidden="true">${['pay','N','toss'][i]}</b>${name}</button>`).join('')}</div><div class="mp-pay-easy-note"><span aria-hidden="true">↗</span><div><strong>결제 요청 → 앱 확인 → 인증</strong><p>이 화면 안에서 앱 결제 과정을 체험해요.</p></div></div>`}
        <p class="mp-pay-safety">실제 카드번호·비밀번호는 입력하지 않아요. 안내된 체험번호만 사용해 주세요.</p>
      </section>
      <section class="mp-pay-section"><h3><span>02</span> 결제 금액 확인</h3><dl class="mp-pay-cost"><div><dt>티켓 금액 <small>${Array.isArray(options.seats)?options.seats.length:1}매</small></dt><dd>${won(options.ticketAmount ?? options.amount)}</dd></div><div><dt>예매수수료 <small>체험용</small></dt><dd>${won(options.fee)}</dd></div><div><dt>수령 방법</dt><dd>모바일 티켓 <small>무료</small></dd></div><div class="mp-pay-cost-total"><dt>총 모의결제 금액</dt><dd>${won(options.amount)}</dd></div></dl></section>
      <section class="mp-pay-section mp-pay-consents"><h3><span>03</span> 예매 내용 동의</h3><label class="mp-pay-all"><input type="checkbox" data-pay="all" ${state.consent.every(Boolean)?'checked':''}><strong>아래 내용을 모두 확인했어요.</strong></label><label><input type="checkbox" data-pay="consent" data-index="0" ${state.consent[0]?'checked':''}><span><b>[필수]</b> 관람일시·좌석·결제 금액을 확인했어요.</span></label><label><input type="checkbox" data-pay="consent" data-index="1" ${state.consent[1]?'checked':''}><span><b>[필수]</b> 실제 승인·청구가 없는 모의결제에 동의해요.</span></label></section>
      <details class="mp-pay-practice"><summary>돌발 상황도 연습하기 <span>선택</span></summary><label><input type="checkbox" data-pay="delay" ${state.delay?'checked':''}><span>인증 지연 상황 연습<small>첫 인증이 지연되면, 좌석을 유지한 채 다시 시도해요.</small></span></label></details>
      <div class="mp-pay-submit"><p>다음 단계에서 <strong>${state.method==='card'?'카드':'간편결제'} 인증</strong>을 진행해요.</p><button type="button" class="btn btn-primary" data-pay="submit" ${state.consent.every(Boolean)?'':'disabled'}>${won(options.amount)} 모의결제 <span aria-hidden="true">→</span></button></div>
    </div>`;
  }
  function render(options) { return markup(options, defaults(options)); }

  function mount(root, options) {
    if (!root) throw new Error('Payment container is required');
    const state = defaults(options);
    let alive = true, modal = null, timer = null, pin = '', phase = '', completed = false, launchButton = null;
    root.innerHTML = markup(options,state);
    function refresh(focusKey, focusValue) {
      root.innerHTML = markup(options,state);
      if (focusKey) [...root.querySelectorAll('[data-pay]')].find(node=>node.dataset.pay===focusKey && (!focusValue||node.dataset.value===focusValue))?.focus({preventScroll:true});
    }
    function stopTimer() { if(timer !== null) { clearTimeout(timer); timer=null; } }
    function closeAuth() {
      stopTimer();
      if(modal) { modal.close(); modal.remove(); modal=null; }
      pin=''; phase='';
      if(alive) (launchButton?.isConnected ? launchButton : root.querySelector('[data-pay="submit"]'))?.focus({preventScroll:true});
    }
    function head() { return `<header class="mp-auth-header"><div><strong>matchapizza <span>PAY</span></strong><small>안전하게 연습하는 결제창</small></div><span class="mp-pay-badge">연습용</span><button type="button" data-auth="close" aria-label="결제 인증 취소">×</button></header>`; }
    function authBody() {
      const provider = state.method==='card'?state.card:state.pay;
      const purchase = `<div class="mp-auth-purchase"><span>${esc(options.eventTitle)}</span><strong>${won(options.amount)}</strong><small>${esc(provider)} · ${state.method==='card'?esc(state.installment):'간편결제'}</small></div>`;
      if(phase==='app') return `${head()}<div class="mp-auth-body"><div class="mp-auth-phone" aria-hidden="true"><span>${esc(provider)}</span><i>✓</i><strong>결제 요청 도착</strong></div><h2 id="mp-auth-title">앱에서 결제를 확인해 주세요</h2><p>모의 앱 화면에서 결제 요청을 확인해요.</p>${purchase}<button class="btn btn-primary mp-auth-wide" type="button" data-auth="confirm-app">모의 앱에서 결제 확인</button><p class="mp-auth-note">실제 앱 실행이나 계정 연결은 필요 없어요.</p></div>`;
      if(phase==='processing') return `${head()}<div class="mp-auth-body mp-auth-processing" role="status" aria-live="polite"><div class="mp-auth-spinner" aria-hidden="true"></div><h2 id="mp-auth-title">결제 승인을 확인하고 있어요</h2><p>잠시만 기다려 주세요.</p>${purchase}<ol class="mp-auth-progress"><li>✓ 인증 확인</li><li class="active">모의 승인 처리 중</li><li>예매 완료</li></ol></div>`;
      if(phase==='failure') return `${head()}<div class="mp-auth-body"><div class="mp-auth-failure" aria-hidden="true">!</div><h2 id="mp-auth-title">인증 응답이 늦어지고 있어요</h2><p>연습용 지연 상황이에요.<br>선택한 좌석과 결제수단은 그대로 유지돼요.</p>${purchase}<button class="btn btn-primary mp-auth-wide" type="button" data-auth="retry">인증 다시 시도</button><button class="text-button mp-auth-back" type="button" data-auth="close">결제수단 다시 선택</button></div>`;
      return `${head()}<div class="mp-auth-body"><h2 id="mp-auth-title">${state.method==='card'?'카드 결제':'간편결제'} 인증</h2><p>아래 체험번호 6자리를 눌러 주세요.</p>${purchase}<div class="mp-auth-code">체험번호 <strong>${CODE}</strong><span>이 번호만 사용해 주세요</span></div><div class="mp-auth-pin" role="status" aria-label="체험번호 ${pin.length}자리 입력됨">${Array.from({length:6},(_,i)=>`<i class="${i<pin.length?'filled':''}" aria-hidden="true"></i>`).join('')}</div><p class="mp-auth-error" role="alert"></p><div class="mp-auth-keypad" aria-label="체험번호 입력 키패드">${['1','2','3','4','5','6','7','8','9','clear','0','back'].map(key=>`<button type="button" data-auth="key" data-key="${key}" aria-label="${key==='clear'?'전체 지우기':key==='back'?'한 자리 지우기':key}">${key==='clear'?'전체 삭제':key==='back'?'⌫':key}</button>`).join('')}</div><p class="mp-auth-note">키보드 숫자로도 입력할 수 있어요.</p></div>`;
    }
    function showAuth(next) {
      phase = next;
      modal.innerHTML = authBody();
      modal.querySelector(next==='app'?'[data-auth="confirm-app"]':next==='failure'?'[data-auth="retry"]':next==='pin'?'[data-key="1"]':'[data-auth="close"]')?.focus({preventScroll:true});
    }
    function finishAuth() {
      if(!alive||completed||phase!=='processing')return;
      if(state.delay && !state.delayed) { state.delayed=true; pin=''; showAuth('failure'); return; }
      completed=true;
      const approvedAt=Date.now();
      const receipt={method:state.method, provider:state.method==='card'?state.card:state.pay, installment:state.method==='card'&&state.installment!=='일시불'?Number.parseInt(state.installment,10):0, amount:Number(options.amount)||0, approvedAt, approvalCode:`MP-${String(approvedAt).slice(-8)}`};
      closeAuth();
      options.onComplete?.(receipt);
    }
    function pressKey(key) {
      if(phase!=='pin') return;
      if(key==='clear')pin=''; else if(key==='back')pin=pin.slice(0,-1); else if(/^\d$/.test(key)&&pin.length<6)pin+=key; else return;
      const dots=modal.querySelector('.mp-auth-pin');
      dots.setAttribute('aria-label',`체험번호 ${pin.length}자리 입력됨`);
      [...dots.children].forEach((node,i)=>node.classList.toggle('filled',i<pin.length));
      const error=modal.querySelector('.mp-auth-error'); error.textContent='';
      if(pin.length===6) {
        if(pin!==CODE) { pin=''; [...dots.children].forEach(node=>node.classList.remove('filled'));dots.setAttribute('aria-label','체험번호 0자리 입력됨'); error.textContent='안내된 체험번호 123456을 입력해 주세요.'; return; }
        showAuth('processing');
        timer=setTimeout(finishAuth,1800);
      }
    }
    function openAuth(button) {
      if(!alive||completed||modal||!state.consent.every(Boolean))return;
      launchButton=button; pin='';
      modal=document.createElement('dialog');modal.className='mp-auth-dialog';modal.setAttribute('aria-labelledby','mp-auth-title');
      modal.addEventListener('cancel',event=>{event.preventDefault();closeAuth();});
      modal.addEventListener('click',event=>{
        const control=event.target.closest('[data-auth]');if(!control)return;
        const action=control.dataset.auth;
        if(action==='close')closeAuth();
        else if(action==='confirm-app'||action==='retry'){pin='';showAuth('pin');}
        else if(action==='key')pressKey(control.dataset.key);
      });
      modal.addEventListener('keydown',event=>{
        if(phase!=='pin')return;
        if(/^\d$/.test(event.key)){event.preventDefault();pressKey(event.key);}
        else if(event.key==='Backspace'){event.preventDefault();pressKey('back');}
        else if(event.key==='Delete'){event.preventDefault();pressKey('clear');}
      });
      document.body.append(modal);
      phase=state.method==='easy'?'app':'pin';modal.innerHTML=authBody();modal.showModal();
      modal.querySelector(phase==='app'?'[data-auth="confirm-app"]':'[data-key="1"]')?.focus({preventScroll:true});
    }
    function onClick(event) {
      const control=event.target.closest('[data-pay]'); if(!control||!root.contains(control)||control.disabled)return;
      const kind=control.dataset.pay, value=control.dataset.value;
      if(kind==='method' && ['card','easy'].includes(value)) {state.method=value;refresh(kind,value);options.onMethodChange?.(value);}
      else if(kind==='card'&&CARDS.includes(value)){state.card=value;refresh(kind,value);}
      else if(kind==='pay'&&PAYS.includes(value)){state.pay=value;refresh(kind,value);}
      else if(kind==='submit')openAuth(control);
      options.onActivity?.();
    }
    function onChange(event) {
      const control=event.target, kind=control.dataset.pay;
      if(kind==='consent') state.consent[Number(control.dataset.index)]=control.checked;
      if(kind==='all') {state.consent=[control.checked,control.checked];root.querySelectorAll('[data-pay="consent"]').forEach(node=>node.checked=control.checked);}
      if(kind==='consent'||kind==='all') {const all=root.querySelector('[data-pay="all"]');all.checked=state.consent.every(Boolean);all.indeterminate=state.consent.some(Boolean)&&!all.checked;root.querySelector('[data-pay="submit"]').disabled=!all.checked;}
      if(kind==='installment' && ['일시불',...(Number(options.amount)>=50000?['2개월','3개월']:[])].includes(control.value))state.installment=control.value;
      if(kind==='delay'){state.delay=control.checked;state.delayed=false;}
      options.onActivity?.();
    }
    root.addEventListener('click',onClick);root.addEventListener('change',onChange);
    return {destroy(){alive=false;stopTimer();closeAuth();root.removeEventListener('click',onClick);root.removeEventListener('change',onChange);}};
  }
  function receiptHTML(receipt) {
    if(!receipt)return '';
    const date=new Date(receipt.approvedAt);
    const timestamp=Number.isFinite(date.getTime())?date.toLocaleString('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}):'';
    return `<section class="mp-pay-receipt" aria-label="모의 결제 내역"><header><div><span>PAYMENT RECEIPT</span><h3>모의 결제 내역</h3></div><b>승인 완료</b></header><dl><div><dt>결제수단</dt><dd>${esc(receipt.provider)} · ${Number(receipt.installment)>0?`${Number(receipt.installment)}개월`:'일시불'}</dd></div><div><dt>결제 금액</dt><dd><strong>${won(receipt.amount)}</strong></dd></div><div><dt>승인 시각</dt><dd>${esc(timestamp)}</dd></div><div><dt>체험 승인번호</dt><dd>${esc(receipt.approvalCode)}</dd></div></dl><p>연습용 내역 · 실제 승인 및 청구 없음</p></section>`;
  }
  window.MatchaPayment=Object.freeze({render,mount,receiptHTML});
})();
