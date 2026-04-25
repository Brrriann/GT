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

/* ===== 히어로 프로필 자동 전환 (1.5초, 자연스러운 fade) ===== */
const cards = document.querySelectorAll('.profile-card');
const dots  = document.querySelectorAll('.dot');
let current = 0;
let profileTimer;
let isTransitioning = false;

function showProfile(idx) {
  if (isTransitioning || idx === current) return;
  isTransitioning = true;

  const prev = current;
  current = idx;

  // fade out current
  cards[prev].style.opacity = '0';
  dots[prev].classList.remove('active');

  setTimeout(() => {
    cards[prev].style.display = 'none';
    cards[prev].classList.remove('active');
    cards[prev].style.opacity = '';

    // show next card, start at 0, then animate to 1
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

/* ===== 상담문의: 서비스 토글 ===== */
const serviceToggles = document.querySelectorAll('.service-toggle');
const selectedServicesInput = document.getElementById('selectedServices');

serviceToggles.forEach(btn => {
  btn.addEventListener('click', () => {
    btn.classList.toggle('active');
    const selected = [...serviceToggles]
      .filter(b => b.classList.contains('active'))
      .map(b => b.dataset.value);
    if (selectedServicesInput) selectedServicesInput.value = selected.join(', ');
  });
});

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
      countObserver.unobserve(entry.target);
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

/* ===== 히어로 마우스 패럴랙스 (PC only) ===== */
const heroBg = document.getElementById('heroBg');
if (heroBg && window.matchMedia('(min-width: 769px)').matches) {
  const heroEl = document.getElementById('hero');
  let rafId;

  heroEl.addEventListener('mousemove', e => {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      const rect = heroEl.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const dx = (e.clientX - rect.left - cx) / cx; // -1 ~ 1
      const dy = (e.clientY - rect.top  - cy) / cy;
      heroBg.style.transform = `translate(${dx * -18}px, ${dy * -12}px)`;
    });
  });

  heroEl.addEventListener('mouseleave', () => {
    cancelAnimationFrame(rafId);
    heroBg.style.transition = 'transform 0.6s ease-out';
    heroBg.style.transform = 'translate(0, 0)';
    setTimeout(() => { heroBg.style.transition = 'transform 0.08s ease-out'; }, 600);
  });
}

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
