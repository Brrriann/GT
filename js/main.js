console.log('[GT] main.js v2 로드됨');
/* ===== 네비게이션: 스크롤 시 투명→흰색 ===== */
const navbar = document.getElementById('navbar');
const topBar = document.getElementById('top-logo-bar');
const topBarH = topBar ? topBar.offsetHeight : 80;

// 초기 위치: top-bar 아래에서 히어로에 겹치도록
function positionNav() {
  const scrollY = window.scrollY;
  if (scrollY > topBarH - 10) {
    navbar.classList.add('scrolled');
    navbar.style.top = '0';
  } else {
    navbar.classList.remove('scrolled');
    navbar.style.top = topBarH + 'px';
  }
}
positionNav();
window.addEventListener('scroll', positionNav, { passive: true });

/* ===== 부드러운 스크롤 (앵커 링크) ===== */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id = link.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    // 사이드메뉴 닫기
    closeSideMenu();
    setTimeout(() => {
      const offset = id === 'hero' ? 0 : parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'));
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }, 50);
  });
});

/* ===== 사이드 메뉴 ===== */
const sideMenu    = document.getElementById('side-menu');
const sideOverlay = document.getElementById('side-overlay');
const openBtn     = document.getElementById('sideMenuOpen');
const closeBtn    = document.getElementById('sideMenuClose');

function openSideMenu() {
  sideMenu.classList.add('open');
  sideOverlay.classList.add('active');
  sideMenu.removeAttribute('aria-hidden');
  openBtn.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
  closeBtn.focus();
}
function closeSideMenu() {
  sideMenu.classList.remove('open');
  sideOverlay.classList.remove('active');
  sideMenu.setAttribute('aria-hidden', 'true');
  openBtn.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

openBtn.addEventListener('click', openSideMenu);
closeBtn.addEventListener('click', closeSideMenu);
sideOverlay.addEventListener('click', closeSideMenu);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeSideMenu();
});

/* ===== 히어로 프로필 자동 전환 ===== */
const cards = document.querySelectorAll('.profile-card');
const dots  = document.querySelectorAll('.dot');
const heroTitle = document.querySelector('.hero-title');
const heroSub   = document.querySelector('.hero-sub');
const heroOverlayTrust  = document.getElementById('heroOverlayTrust');
const heroOverlayExpert = document.getElementById('heroOverlayExpert');
const heroOverlays = [heroOverlayTrust, heroOverlayExpert];
const heroBg1 = document.getElementById('heroBg');
const heroBg2 = document.getElementById('heroBg2');
const heroBgs = [heroBg1, heroBg2];
let current = 0;
let profileTimer;
let isTransitioning = false;

function showProfile(idx) {
  if (isTransitioning || idx === current) return;
  isTransitioning = true;

  const prev = current;
  current = idx;
  const card = cards[current];

  // fade out card + text
  cards[prev].style.opacity = '0';
  dots[prev].classList.remove('active');
  if (heroTitle) heroTitle.style.opacity = '0';
  if (heroSub)   heroSub.style.opacity   = '0';

  // switch background overlay + background image
  heroOverlays.forEach((ov, i) => {
    if (ov) ov.classList.toggle('active', i === current);
  });
  heroBgs.forEach((bg, i) => {
    if (bg) bg.style.opacity = i === current ? '1' : '0';
  });

  setTimeout(() => {
    cards[prev].style.display = 'none';
    cards[prev].classList.remove('active');
    cards[prev].style.opacity = '';

    // update hero text
    if (heroTitle && card.dataset.title) heroTitle.textContent = card.dataset.title;
    if (heroSub   && card.dataset.sub)   heroSub.innerHTML     = card.dataset.sub;

    // fade text back in
    if (heroTitle) heroTitle.style.opacity = '1';
    if (heroSub)   heroSub.style.opacity   = '1';

    // show next card
    cards[current].classList.add('active');
    cards[current].style.display = 'block';
    cards[current].style.opacity = '0';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        cards[current].style.opacity = '1';
        dots[current].classList.add('active');
        setTimeout(() => {
          cards[current].style.opacity = '';
          isTransitioning = false;
        }, 350);
      });
    });
  }, 300);
}

function startProfileCycle() {
  profileTimer = setInterval(() => {
    const next = (current + 1) % cards.length;
    showProfile(next);
  }, 5000); // 5초 간격 (fade 0.8s 고려)
}

dots.forEach(dot => {
  dot.addEventListener('click', () => {
    clearInterval(profileTimer);
    showProfile(parseInt(dot.dataset.idx));
    startProfileCycle();
  });
});

startProfileCycle();

/* ===== 상담문의: 서비스 드롭다운 ===== */
const serviceSelect = document.getElementById('selectedServices');
if (serviceSelect) {
  serviceSelect.addEventListener('change', () => {
    serviceSelect.classList.toggle('has-value', serviceSelect.value !== '');
  });
}

/* ===== 상담문의: web3forms 제출 ===== */
(function () {
  console.log('[GT폼] IIFE 실행됨. form:', document.getElementById('contactForm'), 'msgEl:', document.getElementById('formMsg'));
  const form        = document.getElementById('contactForm');
  const msgEl       = document.getElementById('formMsg');
  const submitBtn   = form ? form.querySelector('.form-submit') : null;
  if (!form) { console.error('[GT폼] contactForm을 찾을 수 없음'); return; }

  /* native fallback 제출 후 돌아왔을 때 성공 메시지 표시 */
  if (new URLSearchParams(location.search).get('submitted') === '1') {
    msgEl.textContent = '상담 신청이 완료되었습니다. 빠른 시일 내에 연락드리겠습니다.';
    msgEl.className   = 'form-msg form-msg--success';
    msgEl.hidden      = false;
    reportLeadConversion();
    history.replaceState(null, '', location.pathname);
    setTimeout(() => {
      const contactSection = document.getElementById('contact');
      if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  /* Google Ads 전환: 견적문의(리드폼)가 실제 접수 성공한 시점에만 1회 발사
     - head에 두면 페이지 로드마다 가짜 전환이 생기므로 성공 분기에서만 호출 */
  function reportLeadConversion() {
    if (typeof gtag !== 'function') return;
    gtag('event', 'conversion', {
      'send_to':  'AW-18283639564/NlzrCNGrl_UcEIzmqI5E',
      'value':    1.0,
      'currency': 'KRW'
    });
  }

  function showMsg(text, type) {
    msgEl.textContent = text;
    msgEl.className   = 'form-msg form-msg--' + type;
    msgEl.hidden      = false;
  }

  function validate() {
    const name    = form.querySelector('#contactName').value.trim();
    const phone   = form.querySelector('#contactPhone').value.trim();
    const message = form.querySelector('#contactMessage').value.trim();
    const privacy = form.querySelector('#privacyCheck').checked;

    if (!name)    { showMsg('이름을 입력해 주세요.', 'error'); return false; }
    if (!phone)   { showMsg('연락처를 입력해 주세요.', 'error'); return false; }
    if (!message) { showMsg('문의 내용을 입력해 주세요.', 'error'); return false; }
    if (!privacy) { showMsg('개인정보 수집 및 이용에 동의해 주세요.', 'error'); return false; }
    return true;
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    msgEl.hidden = true;

    if (!validate()) return;

    const services = form.querySelector('#selectedServices').value;
    const name     = form.querySelector('#contactName').value.trim();
    const phone    = form.querySelector('#contactPhone').value.trim();
    const message  = form.querySelector('#contactMessage').value.trim();

    submitBtn.disabled    = true;
    submitBtn.textContent = '전송 중...';

    try {
      console.log('[GT폼] fetch 시작');
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: '23ff213b-11ce-4c4b-8fde-2d4fd6abfe99',
          subject:    'GT탐정사무소 상담 문의 - ' + (services || '기타'),
          from_name:  name,
          '문의유형':   services || '(미선택)',
          '이름':       name,
          '연락처':     phone,
          '문의내용':   message,
          botcheck:   '',
        }),
      });

      const data = await res.json();
      console.log('[GT폼] 응답:', data);

      if (data.success) {
        showMsg('상담 신청이 완료되었습니다. 빠른 시일 내에 연락드리겠습니다.', 'success');
        reportLeadConversion();
        form.reset();
        if (serviceSelect) serviceSelect.classList.remove('has-value');
      } else {
        showMsg('전송 실패: ' + (data.message || '잠시 후 다시 시도해 주세요.'), 'error');
      }
    } catch (err) {
      console.error('[GT폼] 오류:', err);
      showMsg('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.', 'error');
    } finally {
      submitBtn.disabled    = false;
      submitBtn.textContent = '상담 신청하기';
    }
  });
}());

/* ===== 상담문의: 전화번호 자동 하이픈 ===== */
const phoneInput = document.getElementById('contactPhone');
if (phoneInput) {
  phoneInput.addEventListener('input', e => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
    let formatted = digits;

    if (digits.startsWith('02')) {
      // 서울 02: 02-XXX-XXXX or 02-XXXX-XXXX
      if (digits.length <= 2)       formatted = digits;
      else if (digits.length <= 5)  formatted = digits.slice(0,2) + '-' + digits.slice(2);
      else if (digits.length <= 9)  formatted = digits.slice(0,2) + '-' + digits.slice(2,5) + '-' + digits.slice(5);
      else                          formatted = digits.slice(0,2) + '-' + digits.slice(2,6) + '-' + digits.slice(6,10);
    } else if (digits.startsWith('010')) {
      // 010 모바일: 010-XXXX-XXXX
      if (digits.length <= 3)       formatted = digits;
      else if (digits.length <= 7)  formatted = digits.slice(0,3) + '-' + digits.slice(3);
      else                          formatted = digits.slice(0,3) + '-' + digits.slice(3,7) + '-' + digits.slice(7,11);
    } else if (/^01[1-9]/.test(digits)) {
      // 011~019 모바일: 01X-XXX-XXXX or 01X-XXXX-XXXX
      if (digits.length <= 3)       formatted = digits;
      else if (digits.length <= 6)  formatted = digits.slice(0,3) + '-' + digits.slice(3);
      else if (digits.length <= 9)  formatted = digits.slice(0,3) + '-' + digits.slice(3,6) + '-' + digits.slice(6);
      else                          formatted = digits.slice(0,3) + '-' + digits.slice(3,7) + '-' + digits.slice(7,11);
    } else if (/^0[3-9]/.test(digits)) {
      // 지역번호 031~099: 0XX-XXX-XXXX or 0XX-XXXX-XXXX
      if (digits.length <= 3)       formatted = digits;
      else if (digits.length <= 6)  formatted = digits.slice(0,3) + '-' + digits.slice(3);
      else if (digits.length <= 9)  formatted = digits.slice(0,3) + '-' + digits.slice(3,6) + '-' + digits.slice(6);
      else                          formatted = digits.slice(0,3) + '-' + digits.slice(3,7) + '-' + digits.slice(7,11);
    }

    e.target.value = formatted;
  });
}

/* ===== 카운트업 애니메이션 ===== */
function startCountUp(el) {
  const target = parseInt(el.dataset.target);
  const duration = 1800;
  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  }
  requestAnimationFrame(update);
}

const countObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.count-up').forEach(startCountUp);
    }
  });
}, { threshold: 0.3 });

const statsGrid = document.querySelector('.stats-grid');
if (statsGrid) countObserver.observe(statsGrid);

/* ===== 스크롤 애니메이션 ===== */
const animItems = document.querySelectorAll('[data-animate]');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

animItems.forEach(el => observer.observe(el));


/* ===== 맨 위로 버튼 ===== */
const fabTop = document.getElementById('fabTop');
if (fabTop) {
  fabTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ===== FAQ 아코디언 (복수 열림 + 누적 줌) ===== */
const faqSection = document.getElementById('faq');
const faqBg = faqSection ? faqSection.querySelector('.faq-bg') : null;

function updateFaqZoom() {
  if (!faqBg) return;
  const openCount = faqSection.querySelectorAll('.faq-question[aria-expanded="true"]').length;
  const scale = 1 + openCount * 0.04;
  faqBg.style.transform = `scale(${Math.min(scale, 1.20)})`;
}

document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    const answer = btn.nextElementSibling;

    if (isOpen) {
      btn.setAttribute('aria-expanded', 'false');
      answer.classList.remove('open');
    } else {
      btn.setAttribute('aria-expanded', 'true');
      answer.classList.add('open');
    }

    updateFaqZoom();
  });
});

/* ===== 자격증 슬라이더 (무한루프 + 양쪽 peek + 5초 자동재생) ===== */
(function () {
  var track   = document.getElementById('certTrack');
  var navWrap = document.getElementById('certNav');
  if (!track) return;

  /* 원본 아이템 (클론 추가 전) */
  var realItems = Array.from(track.children);
  var total     = realItems.length;
  var INTERVAL  = 5000;
  var TRANS     = 500;
  var current   = 0;
  var busy      = false;
  var timer;

  /* 앞뒤에 클론 추가 — total장씩 붙여서 어떤 방향으로도 빈칸 없음 */
  for (var i = total - 1; i >= 0; i--) {
    var c = realItems[i].cloneNode(true);
    c.classList.add('cert-clone');
    c.setAttribute('aria-hidden', 'true');
    track.insertBefore(c, track.firstChild);
  }
  for (var j = 0; j < total; j++) {
    var d = realItems[j].cloneNode(true);
    d.classList.add('cert-clone');
    d.setAttribute('aria-hidden', 'true');
    track.appendChild(d);
  }

  var OFFSET = total; /* 앞에 붙인 클론 수 */

  /* 인디케이터 바 생성 */
  realItems.forEach(function (_, i) {
    var bar = document.createElement('div');
    bar.className = 'cert-nav-bar' + (i === 0 ? ' active' : '');
    bar.addEventListener('click', function () { jumpTo(i); resetTimer(); });
    navWrap.appendChild(bar);
  });

  function getStep() {
    var first = track.querySelector('.cert-item');
    var gap   = parseFloat(window.getComputedStyle(track).gap) || 24;
    return first.offsetWidth + gap;
  }

  function updateNav() {
    navWrap.querySelectorAll('.cert-nav-bar').forEach(function (b, i) {
      b.classList.toggle('active', i === current);
    });
  }

  /* 트랜지션 없이 즉시 이동 (클론→실제 점프용) */
  function setPos(displayIdx) {
    track.style.transition = 'none';
    track.style.transform  = 'translateX(-' + (displayIdx * getStep()) + 'px)';
    track.getBoundingClientRect(); /* force reflow */
    track.style.transition = '';
  }

  /* 애니메이션 슬라이드 → 완료 후 실제 위치로 점프 */
  function slide(delta) {
    if (busy) return;
    busy = true;
    var targetDisplay = current + OFFSET + delta;
    track.style.transform = 'translateX(-' + (targetDisplay * getStep()) + 'px)';
    setTimeout(function () {
      current = ((current + delta) % total + total) % total;
      setPos(current + OFFSET);
      updateNav();
      busy = false;
    }, TRANS);
  }

  function next() { slide(1); }
  function prev() { slide(-1); }

  /* 인디케이터 클릭용 즉시 이동 */
  function jumpTo(realIdx) {
    current = ((realIdx % total) + total) % total;
    setPos(current + OFFSET);
    updateNav();
  }

  /* 초기 위치 */
  setPos(OFFSET);
  updateNav();

  /* 자동재생 */
  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(next, INTERVAL);
  }
  resetTimer();

  /* 슬라이더 터치 스와이프 */
  var startX = 0;
  track.addEventListener('touchstart', function (e) {
    startX = e.touches[0].clientX;
  }, { passive: true });
  track.addEventListener('touchend', function (e) {
    var diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { diff > 0 ? next() : prev(); resetTimer(); }
  }, { passive: true });

  window.addEventListener('resize', function () { setPos(current + OFFSET); });
}());

/* ===== 자격증 라이트박스 (스와이프·키보드 넘기기 포함) ===== */
(function () {
  var lightbox    = document.getElementById('certLightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var overlay     = lightbox.querySelector('.lightbox-overlay');
  var closeBtn    = lightbox.querySelector('.lightbox-close');

  /* 실제 이미지 목록 (클론 제외) */
  var images  = Array.from(document.querySelectorAll('.cert-item:not(.cert-clone) img'));
  var current = 0;

  function showImage(idx) {
    current = ((idx % images.length) + images.length) % images.length;
    lightboxImg.src = images[current].src;
    lightboxImg.alt = images[current].alt;
  }

  function openLightbox(idx) {
    showImage(idx);
    lightbox.setAttribute('aria-hidden', 'false');
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(function () { lightboxImg.src = ''; }, 250);
  }

  /* 클론 포함 모든 자격증 이미지 클릭 → 실제 인덱스로 열기 */
  document.querySelectorAll('.cert-item img').forEach(function (img) {
    img.addEventListener('click', function () {
      var idx = images.findIndex(function (ri) { return ri.src === img.src; });
      openLightbox(idx !== -1 ? idx : 0);
    });
  });

  overlay.addEventListener('click', closeLightbox);
  closeBtn.addEventListener('click', closeLightbox);

  /* 키보드: Esc 닫기, ←→ 넘기기 */
  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowRight') showImage(current + 1);
    if (e.key === 'ArrowLeft')  showImage(current - 1);
  });

  /* 라이트박스 내 스와이프 넘기기 */
  var startX = 0;
  lightbox.addEventListener('touchstart', function (e) {
    startX = e.touches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener('touchend', function (e) {
    var diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) showImage(diff > 0 ? current + 1 : current - 1);
  }, { passive: true });
}());

/* ===== 고객 후기 슬라이더 (구글 비즈니스 리뷰) =====
   - index.html의 #reviewsData(JSON 배열)를 읽어 카드 생성
   - 데이터가 없으면 섹션을 숨긴 채로 둠
   - 한 장씩 자동 슬라이드(무한 루프) + 화살표 + 스와이프 */
(function () {
  var section = document.getElementById('reviews');
  var dataEl  = document.getElementById('reviewsData');
  var track   = document.getElementById('reviewsTrack');
  if (!section || !dataEl || !track) return;

  var reviews = [];
  try { reviews = JSON.parse(dataEl.textContent || '[]'); } catch (e) { reviews = []; }
  reviews = reviews.filter(function (r) { return r && r.text; });
  var total = reviews.length;
  if (!total) return;               /* 후기 없으면 섹션 숨김 유지 */
  section.hidden = false;

  var prevBtn = document.getElementById('reviewsPrev');
  var nextBtn = document.getElementById('reviewsNext');
  var dotsEl  = document.getElementById('reviewsDots');
  var controls = section.querySelector('.reviews-controls');
  /* 닷 네비게이션: 후기 수만큼 생성, 누르면 해당 후기로 이동 */
  var dots = [];
  for (var d = 0; d < total; d++) {
    var dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'reviews-dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', (d + 1) + '번째 후기');
    (function (n) { dot.addEventListener('click', function () { goTo(n); start(); }); })(d);
    dotsEl.appendChild(dot);
    dots.push(dot);
  }

  var STAR = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M10 1.5l2.6 5.3 5.9.9-4.25 4.1 1 5.8L10 14.9l-5.25 2.75 1-5.8L1.5 7.7l5.9-.9z"/></svg>';
  var GOOGLE_G = '<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.2l7.9 6.2C12.5 13.7 17.8 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 7l7.4 5.7c4.3-4 6.9-9.9 6.9-17.2z"/><path fill="#FBBC05" d="M10.6 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.2C1 16.6 0 20.2 0 24s1 7.4 2.7 10.8l7.9-6.2z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.2 0-11.5-4.2-13.4-9.9l-7.9 6.2C6.6 42.6 14.6 48 24 48z"/></svg>';

  function makeCard(r) {
    var card = document.createElement('article');
    card.className = 'review-card';
    var rating = Math.max(0, Math.min(5, Math.round(Number(r.rating) || 5)));
    var stars = '';
    for (var i = 0; i < 5; i++) stars += i < rating ? STAR : STAR.replace('<svg', '<svg class="off"');
    card.innerHTML =
      '<div class="review-top"><div class="review-stars" aria-label="별점 ' + rating + '점">' + stars + '</div>' +
      '<span class="review-date"></span></div>' +
      '<p class="review-text"></p>' +
      '<div class="review-author"><span class="review-avatar"></span>' +
      '<div><p class="review-name"></p><p class="review-source">' + GOOGLE_G + 'Google 리뷰</p></div></div>';
    var name = String(r.name || '의뢰인');
    card.querySelector('.review-date').textContent = r.date || '';
    card.querySelector('.review-text').textContent = r.text;
    card.querySelector('.review-name').textContent = name;
    card.querySelector('.review-avatar').textContent = name.charAt(0);

    /* 긴 후기: 7줄로 접고 '더보기'로 펼침 (넘칠 때만 버튼 노출) */
    var textEl = card.querySelector('.review-text');
    textEl.classList.add('is-clamped');
    var more = document.createElement('button');
    more.type = 'button';
    more.className = 'review-more';
    more.textContent = '더보기';
    more.hidden = true;
    textEl.insertAdjacentElement('afterend', more);
    more.addEventListener('click', function () {
      var open = card.classList.toggle('is-open');
      textEl.classList.toggle('is-clamped', !open);
      more.textContent = open ? '접기' : '더보기';
      if (open) stop(); else start();
    });
    return card;
  }

  var perView = 1, index = 0, timer = null, busy = false, hovering = false;
  var AUTO_MS = 3000;

  function getPerView() {
    var w = window.innerWidth;
    return w > 1024 ? 3 : (w > 768 ? 2 : 1);
  }

  /* 무한 루프용: 앞뒤로 perView장씩 복제 */
  function build() {
    perView = Math.min(getPerView(), total);
    track.innerHTML = '';
    var looping = total > perView;
    controls.style.display = looping ? '' : 'none';
    track.style.justifyContent = looping ? '' : 'center';
    if (looping) {
      for (var a = total - perView; a < total; a++) track.appendChild(makeCard(reviews[a])).setAttribute('aria-hidden', 'true');
    }
    reviews.forEach(function (r) { track.appendChild(makeCard(r)); });
    if (looping) {
      for (var b = 0; b < perView; b++) track.appendChild(makeCard(reviews[b])).setAttribute('aria-hidden', 'true');
    }
    index = looping ? perView : 0;
    jump();
    checkClamp();
  }

  /* 실제로 7줄을 넘는 카드에만 '더보기' 표시 */
  function checkClamp() {
    Array.prototype.forEach.call(track.querySelectorAll('.review-card'), function (card) {
      var t = card.querySelector('.review-text'), m = card.querySelector('.review-more');
      if (!t || !m || card.classList.contains('is-open')) return;
      m.hidden = t.scrollHeight <= t.clientHeight + 2;
    });
  }

  function step() {
    var first = track.children[0];
    if (!first) return 0;
    var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
    return first.getBoundingClientRect().width + gap;
  }
  function render() {
    track.style.transform = 'translate3d(' + (-index * step()) + 'px,0,0)';
    var real = ((index - perView) % total + total) % total;
    dots.forEach(function (el, n) {
      var on = n === real;
      el.classList.toggle('is-active', on);
      el.setAttribute('aria-selected', on ? 'true' : 'false');
    });
  }
  function jump() {
    track.classList.add('no-anim');
    render();
    void track.offsetWidth;          /* 리플로우 후 애니메이션 복원 */
    track.classList.remove('no-anim');
  }
  function go(dir) {
    if (busy || total <= perView) return;
    busy = true;
    index += dir;
    render();
  }
  /* 닷 클릭: 지금 위치에서 가장 가까운 방향으로 이동 */
  function goTo(n) {
    if (busy || total <= perView) return;
    var real = ((index - perView) % total + total) % total;
    if (n === real) return;
    busy = true;
    index += n - real;
    render();
  }

  track.addEventListener('transitionend', function (e) {
    if (e.target !== track) return;
    if (index >= total + perView) { index -= total; jump(); }
    else if (index < perView)     { index += total; jump(); }
    busy = false;
  });

  function start() {
    stop();
    if (total <= perView || hovering || track.querySelector('.review-card.is-open')) return;
    timer = setInterval(function () { go(1); }, AUTO_MS);
  }
  function stop()  { if (timer) { clearInterval(timer); timer = null; } }

  prevBtn.addEventListener('click', function () { go(-1); start(); });
  nextBtn.addEventListener('click', function () { go(1);  start(); });

  var slider = section.querySelector('.reviews-slider');
  /* 실제 마우스를 올렸을 때만 일시정지 (모바일 탭이 만드는 가짜 hover로 멈추지 않도록) */
  slider.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { hovering = true; stop(); } });
  slider.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { hovering = false; start(); } });
  document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });

  /* 스와이프 */
  var sx = 0, sy = 0, swiping = false;
  track.addEventListener('touchstart', function (e) {
    sx = e.touches[0].clientX; sy = e.touches[0].clientY; swiping = true; stop();
  }, { passive: true });
  track.addEventListener('touchend', function (e) {
    if (!swiping) return; swiping = false;
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
    start();
  }, { passive: true });

  /* 화면 크기 변경 시 다시 구성 */
  var lastPer = getPerView(), rt = null;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      var p = getPerView();
      if (p !== lastPer) { lastPer = p; busy = false; build(); start(); }
      else { jump(); checkClamp(); }
    }, 150);
  });

  build();
  start();
})();
