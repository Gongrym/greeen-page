"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".header");
  const hamburger = document.querySelector("#hamburger");
  const mobileMenu = document.querySelector("#mobile-menu");
  const overlay = document.querySelector(".overlay");
  const mobileClose = document.querySelector(".mobile-close");
  const backToTop = document.querySelector(".back-to-top");
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  /* =========================
     1. 스크롤 헤더
  ========================= */

  function updateHeader() {
    header?.classList.toggle("is-scrolled", window.scrollY > 24);
  }

  updateHeader();

  window.addEventListener("scroll", updateHeader, {
    passive: true,
  });

  /* =========================
     2. 모바일 메뉴 열기 / 닫기
  ========================= */

  let previousFocus = null;

  function openMenu() {
    if (!mobileMenu || !hamburger || !overlay) return;

    previousFocus = document.activeElement;

    mobileMenu.classList.add("is-open");
    overlay.classList.add("is-visible");
    document.body.classList.add("menu-open");

    hamburger.setAttribute("aria-expanded", "true");
    hamburger.setAttribute("aria-label", "메뉴 닫기");
    mobileMenu.setAttribute("aria-hidden", "false");

    const firstFocusable = mobileMenu.querySelector(
      ".mobile-close, a, summary",
    );

    firstFocusable?.focus();
  }

  function closeMenu(restoreFocus = true) {
    if (!mobileMenu || !hamburger || !overlay) return;

    mobileMenu.classList.remove("is-open");
    overlay.classList.remove("is-visible");
    document.body.classList.remove("menu-open");

    hamburger.setAttribute("aria-expanded", "false");
    hamburger.setAttribute("aria-label", "메뉴 열기");
    mobileMenu.setAttribute("aria-hidden", "true");

    if (restoreFocus && previousFocus instanceof HTMLElement) {
      previousFocus.focus();
    }
  }

  hamburger?.addEventListener("click", () => {
    const isOpen = hamburger.getAttribute("aria-expanded") === "true";

    if (isOpen) {
      closeMenu(false);
    } else {
      openMenu();
    }
  });

  mobileClose?.addEventListener("click", () => {
    closeMenu();
  });

  overlay?.addEventListener("click", () => {
    closeMenu();
  });

  mobileMenu?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu(false);
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760 && mobileMenu?.classList.contains("is-open")) {
      closeMenu(false);
    }
  });

  /* =========================
     3. PC 드롭다운 메뉴
  ========================= */

  document.querySelectorAll(".has-submenu > .nav-link").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (!window.matchMedia("(min-width: 761px)").matches) {
        return;
      }

      event.preventDefault();

      const parent = link.closest(".has-submenu");
      if (!parent) return;

      const wasOpen = parent.classList.contains("submenu-open");

      document.querySelectorAll(".has-submenu.submenu-open").forEach((item) => {
        item.classList.remove("submenu-open");
        item.querySelector(".nav-link")?.setAttribute("aria-expanded", "false");
      });

      if (!wasOpen) {
        parent.classList.add("submenu-open");
        link.setAttribute("aria-expanded", "true");
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;

    if (!event.target.closest(".nav-item.has-submenu")) {
      document.querySelectorAll(".has-submenu.submenu-open").forEach((item) => {
        item.classList.remove("submenu-open");
        item.querySelector(".nav-link")?.setAttribute("aria-expanded", "false");
      });
    }
  });

  /* =========================
     4. 부드러운 앵커 이동
  ========================= */

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      // 다른 기능이 이미 클릭을 처리했다면 중복 처리하지 않음
      if (event.defaultPrevented) return;

      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });

      history.replaceState(null, "", targetId);
    });
  });

  /* =========================
     5. 현재 섹션 메뉴 표시
  ========================= */

  const sectionLinks = document.querySelectorAll('.nav-link[href^="#"]');

  const sectionMap = new Map();

  sectionLinks.forEach((link) => {
    const section = document.querySelector(link.getAttribute("href"));

    if (section && !sectionMap.has(section)) {
      sectionMap.set(section, link);
    }
  });

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const activeLink = sectionMap.get(entry.target);
          if (!activeLink) return;

          document.querySelectorAll(".nav-item.is-active").forEach((item) => {
            item.classList.remove("is-active");
          });

          activeLink.closest(".nav-item")?.classList.add("is-active");
        });
      },
      {
        rootMargin: "-28% 0px -60% 0px",
        threshold: 0,
      },
    );

    sectionMap.forEach((link, section) => {
      sectionObserver.observe(section);
    });
  }

  /* =========================
     6. 스크롤 등장 애니메이션
  ========================= */

  const revealItems = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px",
      },
    );

    revealItems.forEach((item) => {
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach((item) => {
      item.classList.add("is-visible");
    });
  }

  /* =========================
     7. 뉴스 카드 모달
  ========================= */

  const newsItems = [
    {
      category: "INSIGHT",
      date: "2026. 10. 12",
      title: "GREEN-A의 새로운 시작",
      image: "images/news1.jpg",
      alt: "자연과 건축이 조화를 이루는 공간",
      body: `좋은 변화는 거창한 선언보다 주변을 세심하게 관찰하는 일에서 시작됩니다.

GREEN-A는 사람과 자연이 함께 성장할 수 있는 방법을 고민하며, 일상에 실제로 도움이 되는 아이디어를 디자인합니다. 앞으로 우리가 만날 프로젝트와 이야기를 통해 더 나은 내일을 함께 만들어가겠습니다.`,
    },
    {
      category: "DESIGN",
      date: "2026. 09. 28",
      title: "일상에 스며드는 지속 가능성",
      image: "images/news2.jpg",
      alt: "친환경 소재와 제품 디테일",
      body: `지속 가능성은 특별한 순간에만 실천하는 목표가 아니라 매일의 선택에 가까워야 합니다.

오래 사용할 수 있는 물건, 낭비를 줄이는 과정, 꼭 필요한 것에 집중하는 디자인. 작은 선택이 쌓일 때 일상은 조금씩 달라집니다.`,
    },
    {
      category: "PROJECT",
      date: "2026. 09. 10",
      title: "더 나은 공간을 만드는 방법",
      image: "images/news3.jpg",
      alt: "빛과 식물이 어우러진 실내 공간",
      body: `좋은 공간은 멋진 모습만으로 완성되지 않습니다. 그곳에서 시간을 보내는 사람이 어떻게 움직이고, 쉬고, 서로 만나는지를 먼저 이해해야 합니다.

우리는 빛과 소재, 동선과 사용 경험을 함께 살피며 공간의 본질을 찾아갑니다.`,
    },
    {
      category: "PEOPLE",
      date: "2026. 08. 22",
      title: "함께 만드는 내일",
      image: "images/news4.jpg",
      alt: "협업하며 아이디어를 나누는 사람들",
      body: `서로 다른 관점은 때때로 더 좋은 질문을 만들어냅니다. 다양한 경험을 가진 사람들이 생각을 나누고 함께 실험할 때, 혼자서는 발견하기 어려웠던 가능성이 열립니다.

GREEN-A는 열린 대화와 협업을 통해 다음 단계를 만들어갑니다.`,
    },
  ];

  const newsModal = document.querySelector("#news-modal");
  const modalImage = document.querySelector("#modal-image");
  const modalCategory = document.querySelector("#modal-category");
  const modalTitle = document.querySelector("#modal-title");
  const modalDate = document.querySelector("#modal-date");
  const modalBody = document.querySelector("#modal-body");
  const modalClose = document.querySelector(".modal-close");
  const modalDone = document.querySelector(".modal-done");

  let modalOpener = null;

  function openNewsModal(index, opener) {
    const item = newsItems[index];

    if (!item || !newsModal) return;

    modalOpener = opener;

    modalImage.src = item.image;
    modalImage.alt = item.alt;

    // textContent를 사용해 제목과 본문을 안전하게 삽입
    modalCategory.replaceChildren();

    const categoryDot = document.createElement("span");
    modalCategory.append(categoryDot, ` ${item.category}`);

    modalTitle.textContent = item.title;
    modalDate.textContent = item.date;
    modalBody.textContent = item.body;

    if (typeof newsModal.showModal === "function") {
      newsModal.showModal();
      document.body.classList.add("modal-open");
      modalClose?.focus();
    }
  }

  function closeNewsModal() {
    if (newsModal?.open) {
      newsModal.close();
    }
  }

  document.querySelectorAll("[data-news]").forEach((card) => {
    card.addEventListener("click", () => {
      openNewsModal(Number(card.dataset.news), card);
    });
  });

  modalClose?.addEventListener("click", closeNewsModal);
  modalDone?.addEventListener("click", closeNewsModal);

  // 모달 바깥쪽을 클릭하면 닫기
  newsModal?.addEventListener("click", (event) => {
    if (event.target === newsModal) {
      closeNewsModal();
    }
  });

  newsModal?.addEventListener("close", () => {
    document.body.classList.remove("modal-open");

    if (modalOpener instanceof HTMLElement) {
      modalOpener.focus();
    }
  });

  /* =========================
     8. Swiper 프로젝트 슬라이더
  ========================= */

  const swiperElement = document.querySelector(".productSwiper");

  if (swiperElement && typeof Swiper !== "undefined") {
    new Swiper(swiperElement, {
      slidesPerView: 1.15,
      spaceBetween: 18,
      speed: 650,
      grabCursor: true,
      watchOverflow: true,
      rewind: true,

      keyboard: {
        enabled: true,
        onlyInViewport: true,
      },

      navigation: {
        prevEl: ".slider-prev",
        nextEl: ".slider-next",
      },

      pagination: {
        el: ".product-slider-bottom .swiper-pagination",
        clickable: true,
      },

      autoplay: reduceMotion
        ? false
        : {
            delay: 4200,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          },

      breakpoints: {
        560: {
          slidesPerView: 1.8,
          spaceBetween: 18,
        },
        760: {
          slidesPerView: 2.4,
          spaceBetween: 22,
        },
        1024: {
          slidesPerView: 3.2,
          spaceBetween: 24,
        },
        1280: {
          slidesPerView: 3.5,
          spaceBetween: 26,
        },
      },

      a11y: {
        enabled: true,
      },
    });
  } else if (swiperElement) {
    console.warn(
      "Swiper를 불러오지 못했습니다. 인터넷 연결과 CDN 주소를 확인하세요.",
    );
  }

  /* =========================
     9. 맨 위로 이동
  ========================= */

  backToTop?.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? "auto" : "smooth",
    });

    history.replaceState(null, "", "#top");
  });

  /* =========================
     10. ESC 키 처리
  ========================= */

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    if (mobileMenu?.classList.contains("is-open")) {
      closeMenu();
    }

    if (newsModal?.open) {
      closeNewsModal();
    }

    document.querySelectorAll(".has-submenu.submenu-open").forEach((item) => {
      item.classList.remove("submenu-open");
      item.querySelector(".nav-link")?.setAttribute("aria-expanded", "false");
    });
  });

  /* =========================
     11. 누락된 이미지 확인
  ========================= */

  document.querySelectorAll("img").forEach((img) => {
    img.addEventListener("error", () => {
      console.warn(`이미지를 불러오지 못했습니다: ${img.getAttribute("src")}`);
    });
  });
});
