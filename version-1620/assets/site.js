(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var button = $('[data-mobile-menu-button]');
    var menu = $('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
      button.textContent = menu.classList.contains('is-open') ? '×' : '☰';
    });
  }

  function setupHero() {
    var root = $('[data-hero]');
    if (!root) {
      return;
    }
    var slides = $all('[data-hero-slide]', root);
    var dots = $all('[data-hero-dot]', root);
    var prev = $('[data-hero-prev]', root);
    var next = $('[data-hero-next]', root);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        play();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        play();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        play();
      });
    });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', play);
    show(0);
    play();
  }

  function getQueryParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function setupFilters() {
    var root = $('[data-filter-root]');
    var list = $('[data-card-list]');
    if (!root || !list) {
      return;
    }
    var input = $('[data-page-search]', root);
    var selects = $all('[data-filter-select]', root);
    var cards = $all('[data-title]', list);
    var resultCount = $('[data-result-count]');
    var activeChip = '';

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function apply() {
      var query = normalize(input ? input.value : '');
      var filters = {};
      selects.forEach(function (select) {
        filters[select.getAttribute('data-filter-select')] = normalize(select.value);
      });
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.category,
          card.dataset.tags
        ].join(' '));
        var ok = !query || haystack.indexOf(query) !== -1;
        Object.keys(filters).forEach(function (key) {
          if (filters[key] && normalize(card.dataset[key]) !== filters[key]) {
            ok = false;
          }
        });
        if (activeChip && activeChip !== 'all') {
          var parts = activeChip.split(':');
          if (parts.length === 2 && normalize(card.dataset[parts[0]]) !== normalize(parts[1])) {
            ok = false;
          }
        }
        card.classList.toggle('is-hidden', !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (resultCount) {
        resultCount.textContent = '共 ' + visible + ' 部影片';
      }
    }

    if (input) {
      input.value = getQueryParam('q');
      input.addEventListener('input', apply);
    }
    selects.forEach(function (select) {
      select.addEventListener('change', apply);
    });
    $all('[data-filter-chip]', root).forEach(function (chip) {
      chip.addEventListener('click', function () {
        $all('[data-filter-chip]', root).forEach(function (item) {
          item.classList.remove('is-active');
        });
        chip.classList.add('is-active');
        activeChip = chip.getAttribute('data-filter-chip') || '';
        apply();
      });
    });
    var reset = $('[data-filter-reset]', root);
    if (reset) {
      reset.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        selects.forEach(function (select) {
          select.value = '';
        });
        activeChip = '';
        apply();
      });
    }
    apply();
  }

  function setupPlayers() {
    $all('[data-player]').forEach(function (root) {
      var video = $('video', root);
      var button = $('[data-play-button]', root);
      var source = root.getAttribute('data-video-src');
      var hlsInstance = null;

      function start() {
        if (!video || !source) {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          if (!hlsInstance) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
          }
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          video.src = source;
        }
        root.classList.add('is-playing');
        video.play().catch(function () {
          root.classList.remove('is-playing');
        });
      }

      if (button) {
        button.addEventListener('click', start);
      }
      if (video) {
        video.addEventListener('play', function () {
          root.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
          if (!video.currentTime) {
            root.classList.remove('is-playing');
          }
        });
      }
    });
  }

  function setupImageFallbackState() {
    $all('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.style.opacity = '0';
        if (image.parentElement) {
          image.parentElement.classList.add('image-missing');
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
    setupPlayers();
    setupImageFallbackState();
  });
})();
