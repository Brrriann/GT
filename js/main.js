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
