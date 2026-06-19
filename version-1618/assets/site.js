(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;
    var setSlide = function (nextIndex) {
      if (!slides.length) return;
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    };
    var start = function () {
      timer = window.setInterval(function () {
        setSlide(index + 1);
      }, 5200);
    };
    var restart = function () {
      window.clearInterval(timer);
      start();
    };
    if (prev) {
      prev.addEventListener('click', function () {
        setSlide(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        setSlide(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        setSlide(i);
        restart();
      });
    });
    setSlide(0);
    start();
  }

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    var scope = panel.closest('main') || document;
    var input = panel.querySelector('[data-search-input]');
    var region = panel.querySelector('[data-region-filter]');
    var year = panel.querySelector('[data-year-filter]');
    var reset = panel.querySelector('[data-filter-reset]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var apply = function () {
      var q = input ? input.value.trim().toLowerCase() : '';
      var r = region ? region.value : '';
      var y = year ? year.value : '';
      cards.forEach(function (card) {
        var hay = [card.dataset.title, card.dataset.region, card.dataset.year, card.dataset.genre].join(' ').toLowerCase();
        var show = true;
        if (q && hay.indexOf(q) === -1) show = false;
        if (r && card.dataset.region !== r) show = false;
        if (y && card.dataset.year !== y) show = false;
        card.classList.toggle('hidden-by-filter', !show);
      });
    };
    if (input) input.addEventListener('input', apply);
    if (region) region.addEventListener('change', apply);
    if (year) year.addEventListener('change', apply);
    if (reset) {
      reset.addEventListener('click', function () {
        if (input) input.value = '';
        if (region) region.value = '';
        if (year) year.value = '';
        apply();
      });
    }
  });

  document.querySelectorAll('[data-video-stage]').forEach(function (stage) {
    var video = stage.querySelector('video');
    var button = stage.querySelector('[data-play-button]');
    if (!video || !button) return;
    var src = video.dataset.src || '';
    var initialized = false;
    var initialize = function () {
      if (initialized) return;
      initialized = true;
      if (src && video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (src && window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else if (src) {
        video.src = src;
      }
    };
    var play = function () {
      initialize();
      var promise = video.play();
      if (promise && promise.then) {
        promise.then(function () {
          stage.classList.add('is-playing');
        }).catch(function () {
          stage.classList.remove('is-playing');
        });
      } else {
        stage.classList.add('is-playing');
      }
    };
    button.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
    video.addEventListener('play', function () {
      stage.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      stage.classList.remove('is-playing');
    });
  });
})();
