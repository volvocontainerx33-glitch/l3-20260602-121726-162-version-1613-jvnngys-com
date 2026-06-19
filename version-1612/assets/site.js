(function () {
  const SELECTORS = {
    menuButton: "[data-menu-button]",
    mobilePanel: "[data-mobile-panel]",
    searchForm: "[data-site-search-form]",
    pageFilter: "[data-page-filter]",
    yearFilter: "[data-year-filter]",
    filterCard: "[data-filter-card]",
    filterCount: "[data-filter-count]",
    heroSlide: "[data-hero-slide]",
    heroDot: "[data-hero-dot]",
    player: "[data-player]",
    playButton: "[data-play-button]"
  };

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function setupMobileMenu() {
    const button = document.querySelector(SELECTORS.menuButton);
    const panel = document.querySelector(SELECTORS.mobilePanel);

    if (!button || !panel) {
      return;
    }

    button.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function setupHeaderSearch() {
    document.querySelectorAll(SELECTORS.searchForm).forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        const input = form.querySelector("input[name='q']");
        const target = form.getAttribute("data-search-target") || "search.html";
        const query = input ? input.value.trim() : "";
        const separator = target.indexOf("?") === -1 ? "?" : "&";
        window.location.href = query ? target + separator + "q=" + encodeURIComponent(query) : target;
      });
    });
  }

  function setupImageFallbacks() {
    document.querySelectorAll("img[data-fallback-title]").forEach(function (image) {
      function markMissing() {
        image.classList.add("is-missing");
      }

      image.addEventListener("error", markMissing);

      if (image.complete && image.naturalWidth === 0) {
        markMissing();
      }
    });
  }

  function collectYears(cards) {
    const years = new Set();

    cards.forEach(function (card) {
      const year = card.getAttribute("data-year");
      if (year) {
        years.add(year);
      }
    });

    return Array.from(years).sort(function (a, b) {
      return Number(b) - Number(a);
    });
  }

  function setupFilters() {
    const input = document.querySelector(SELECTORS.pageFilter);
    const yearSelect = document.querySelector(SELECTORS.yearFilter);
    const cards = Array.from(document.querySelectorAll(SELECTORS.filterCard));
    const count = document.querySelector(SELECTORS.filterCount);

    if (!cards.length || (!input && !yearSelect)) {
      return;
    }

    if (yearSelect) {
      collectYears(cards).forEach(function (year) {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
      });
    }

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q") || "";
    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function applyFilter() {
      const keyword = normalize(input ? input.value : "");
      const selectedYear = normalize(yearSelect ? yearSelect.value : "");
      let visible = 0;

      cards.forEach(function (card) {
        const text = normalize(card.getAttribute("data-title"));
        const cardYear = normalize(card.getAttribute("data-year"));
        const matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        const matchYear = !selectedYear || cardYear === selectedYear;
        const isVisible = matchKeyword && matchYear;

        card.classList.toggle("is-hidden", !isVisible);
        if (isVisible) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = "当前显示 " + visible + " 部 / 共 " + cards.length + " 部";
      }
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }

    if (yearSelect) {
      yearSelect.addEventListener("change", applyFilter);
    }

    applyFilter();
  }

  function setupHeroCarousel() {
    const slides = Array.from(document.querySelectorAll(SELECTORS.heroSlide));
    const dots = Array.from(document.querySelectorAll(SELECTORS.heroDot));

    if (slides.length <= 1) {
      return;
    }

    let current = 0;
    let timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    const stage = slides[0].closest(".hero-stage");
    if (stage) {
      stage.addEventListener("mouseenter", stop);
      stage.addEventListener("mouseleave", start);
    }

    show(0);
    start();
  }

  function setupPlayers() {
    document.querySelectorAll(SELECTORS.player).forEach(function (player) {
      const button = player.querySelector(SELECTORS.playButton);
      const video = player.querySelector("video[data-video-source]");
      const message = player.querySelector("[data-player-message]");

      if (!button || !video) {
        return;
      }

      function nativePlay() {
        const source = video.getAttribute("data-video-source");
        if (!source) {
          if (message) {
            message.textContent = "当前页面没有可用的视频源。";
          }
          return;
        }

        if (!video.getAttribute("src")) {
          video.setAttribute("src", source);
        }

        video.play().catch(function () {
          if (message) {
            message.textContent = "浏览器阻止了自动播放，请再次点击视频控件播放。";
          }
        });
      }

      button.addEventListener("click", function () {
        button.classList.add("hidden");

        if (window.MovieHlsPlayer && typeof window.MovieHlsPlayer.initAndPlay === "function") {
          window.MovieHlsPlayer.initAndPlay(player);
        } else {
          nativePlay();
        }
      });

      video.addEventListener("play", function () {
        button.classList.add("hidden");
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMobileMenu();
    setupHeaderSearch();
    setupImageFallbacks();
    setupFilters();
    setupHeroCarousel();
    setupPlayers();
  });
})();
