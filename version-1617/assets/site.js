(function () {
    var toggle = document.querySelector('.mobile-toggle');
    var nav = document.querySelector('.site-nav');
    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var prev = hero.querySelector('.hero-prev');
        var next = hero.querySelector('.hero-next');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                showSlide(i);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    var panels = document.querySelectorAll('[data-filter-panel]');
    panels.forEach(function (panel) {
        var scope = panel.parentElement || document;
        var input = panel.querySelector('[data-filter-input]');
        var year = panel.querySelector('[data-year-select]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
        var query = new URLSearchParams(window.location.search).get('q');
        if (query && input) {
            input.value = query;
        }

        function applyFilter() {
            var text = input ? input.value.trim().toLowerCase() : '';
            var selectedYear = year ? year.value : '';
            cards.forEach(function (card) {
                var key = (card.getAttribute('data-key') || '').toLowerCase();
                var cardYear = card.getAttribute('data-year') || '';
                var matchedText = !text || key.indexOf(text) !== -1;
                var matchedYear = !selectedYear || cardYear === selectedYear;
                card.classList.toggle('is-hidden-by-filter', !(matchedText && matchedYear));
            });
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }
        if (year) {
            year.addEventListener('change', applyFilter);
        }
        applyFilter();
    });
})();

function initMoviePlayer(streamUrl) {
    var video = document.getElementById('movieVideo');
    var button = document.getElementById('playOverlay');
    var hlsInstance = null;

    if (!video || !button || !streamUrl) {
        return;
    }

    function attachSource() {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (video.src !== streamUrl) {
                video.src = streamUrl;
            }
            return Promise.resolve();
        }

        if (window.Hls && window.Hls.isSupported()) {
            if (!hlsInstance) {
                hlsInstance = new window.Hls();
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            }
            return new Promise(function (resolve) {
                if (video.readyState > 0) {
                    resolve();
                } else {
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        resolve();
                    });
                }
            });
        }

        video.src = streamUrl;
        return Promise.resolve();
    }

    function playVideo() {
        button.classList.add('is-hidden');
        attachSource().then(function () {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    button.classList.remove('is-hidden');
                });
            }
        });
    }

    button.addEventListener('click', playVideo);
    video.addEventListener('click', function () {
        if (video.paused) {
            playVideo();
        }
    });
    video.addEventListener('play', function () {
        button.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
        if (!video.ended) {
            button.classList.remove('is-hidden');
        }
    });
}
