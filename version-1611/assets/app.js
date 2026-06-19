import { H as Hls } from './hls-dru42stk.js';

function ready(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

function setupMobileMenu() {
  const button = document.querySelector('[data-menu-button]');
  const nav = document.querySelector('[data-mobile-nav]');

  if (!button || !nav) {
    return;
  }

  button.addEventListener('click', () => {
    nav.classList.toggle('is-open');
  });
}

function setupHeroSlider() {
  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));

  if (slides.length === 0) {
    return;
  }

  let index = 0;

  function activate(nextIndex) {
    index = nextIndex % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === index);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === index);
    });
  }

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener('click', () => activate(dotIndex));
  });

  window.setInterval(() => activate(index + 1), 5200);
}

function setupFilters() {
  const panels = Array.from(document.querySelectorAll('[data-filter-panel]'));

  panels.forEach((panel) => {
    const scope = panel.parentElement || document;
    const grid = scope.querySelector('[data-movie-grid]') || document.querySelector('[data-movie-grid]');
    const cards = grid ? Array.from(grid.querySelectorAll('[data-movie-card]')) : [];
    const empty = scope.querySelector('[data-filter-empty]') || document.querySelector('[data-filter-empty]');

    if (!grid || cards.length === 0) {
      return;
    }

    const keywordInput = panel.querySelector('[data-filter-keyword]');
    const yearSelect = panel.querySelector('[data-filter-year]');
    const typeSelect = panel.querySelector('[data-filter-type]');
    const regionSelect = panel.querySelector('[data-filter-region]');
    const sortSelect = panel.querySelector('[data-filter-sort]');

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function cardText(card) {
      return [
        card.dataset.title,
        card.dataset.year,
        card.dataset.type,
        card.dataset.region,
        card.dataset.genre,
        card.dataset.tags
      ].join(' ').toLowerCase();
    }

    function compareCards(a, b) {
      const sortValue = sortSelect ? sortSelect.value : 'year-desc';

      if (sortValue === 'title-asc') {
        return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN');
      }

      if (sortValue === 'hot-desc') {
        return Number(b.dataset.hot || 0) - Number(a.dataset.hot || 0);
      }

      return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
    }

    function applyFilters() {
      const keyword = normalize(keywordInput ? keywordInput.value : '');
      const year = normalize(yearSelect ? yearSelect.value : '');
      const type = normalize(typeSelect ? typeSelect.value : '');
      const region = normalize(regionSelect ? regionSelect.value : '');
      let visibleCount = 0;

      cards.sort(compareCards).forEach((card) => {
        const text = cardText(card);
        const matched = (!keyword || text.includes(keyword)) &&
          (!year || normalize(card.dataset.year) === year) &&
          (!type || normalize(card.dataset.type) === type) &&
          (!region || normalize(card.dataset.region) === region);

        card.hidden = !matched;
        if (matched) {
          visibleCount += 1;
        }
        grid.appendChild(card);
      });

      if (empty) {
        empty.hidden = visibleCount !== 0;
      }
    }

    [keywordInput, yearSelect, typeSelect, regionSelect, sortSelect]
      .filter(Boolean)
      .forEach((control) => {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      });
  });
}

function setupPlayers() {
  const players = Array.from(document.querySelectorAll('[data-player]'));

  players.forEach((player) => {
    const video = player.querySelector('video');
    const button = player.querySelector('[data-play-button]');
    const cover = player.querySelector('[data-video-cover]');
    const source = video ? video.dataset.src : '';

    if (!video || !button || !source) {
      return;
    }

    let initialized = false;

    function attachSource() {
      if (initialized) {
        return;
      }

      initialized = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (Hls && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    button.addEventListener('click', () => {
      attachSource();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.controls = true;
      video.play().catch(() => {
        video.controls = true;
      });
    });
  });
}

ready(() => {
  setupMobileMenu();
  setupHeroSlider();
  setupFilters();
  setupPlayers();
});
