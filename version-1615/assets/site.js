(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('.page-filter');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-card'));

  function applyFilter(value) {
    var keyword = (value || '').trim().toLowerCase();

    cards.forEach(function (card) {
      var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
      card.classList.toggle('is-hidden', keyword !== '' && text.indexOf(keyword) === -1);
    });
  }

  if (filterInput && cards.length) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (query) {
      filterInput.value = query;
      applyFilter(query);
    }

    filterInput.addEventListener('input', function () {
      applyFilter(filterInput.value);
    });
  }
})();

function initVideoPlayer(videoUrl) {
  var video = document.getElementById('videoPlayer');
  var playButton = document.getElementById('playButton');

  if (!video || !videoUrl) {
    return;
  }

  function attachVideo() {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls();
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      return;
    }

    video.src = videoUrl;
  }

  function startVideo() {
    attachVideo();

    if (playButton) {
      playButton.classList.add('hidden');
    }

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  if (playButton) {
    playButton.addEventListener('click', startVideo);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      startVideo();
    }
  });
}
