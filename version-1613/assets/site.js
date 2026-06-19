
import { H as Hls } from './hls.js';

const select = (selector, root = document) => root.querySelector(selector);
const selectAll = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function setupMobileMenu() {
    const toggle = select('[data-menu-toggle]');
    const nav = select('[data-mobile-nav]');

    if (!toggle || !nav) {
        return;
    }

    toggle.addEventListener('click', () => {
        nav.classList.toggle('is-open');
        toggle.classList.toggle('is-open');
    });
}

function setupHeroSlider() {
    const slider = select('[data-hero-slider]');

    if (!slider) {
        return;
    }

    const slides = selectAll('[data-hero-slide]', slider);
    const dots = selectAll('[data-hero-dot]', slider);
    const previous = select('[data-hero-prev]', slider);
    const next = select('[data-hero-next]', slider);
    let activeIndex = 0;
    let timer = null;

    const showSlide = (index) => {
        activeIndex = (index + slides.length) % slides.length;

        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === activeIndex);
        });

        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === activeIndex);
        });
    };

    const startTimer = () => {
        window.clearInterval(timer);
        timer = window.setInterval(() => showSlide(activeIndex + 1), 5200);
    };

    previous?.addEventListener('click', () => {
        showSlide(activeIndex - 1);
        startTimer();
    });

    next?.addEventListener('click', () => {
        showSlide(activeIndex + 1);
        startTimer();
    });

    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            showSlide(Number(dot.dataset.heroDot));
            startTimer();
        });
    });

    showSlide(0);
    startTimer();
}

function setupLiveFiltering() {
    const scope = select('[data-filter-scope]');
    const filterInput = select('[data-live-filter]');
    const categorySelect = select('[data-category-select]');
    const countLabel = select('[data-result-count]');
    const emptyState = select('[data-empty-state]');

    if (!scope) {
        return;
    }

    const cards = selectAll('[data-movie-card]', scope);
    const params = new URLSearchParams(window.location.search);
    const queryFromUrl = params.get('q') || '';

    if (filterInput && queryFromUrl) {
        filterInput.value = queryFromUrl;
    }

    const normalize = (value) => (value || '').toString().trim().toLowerCase();

    const applyFilter = () => {
        const query = normalize(filterInput?.value || '');
        const category = categorySelect?.value || 'all';
        let visibleCount = 0;

        cards.forEach((card) => {
            const haystack = normalize([
                card.dataset.title,
                card.dataset.genre,
                card.dataset.category,
                card.dataset.tags,
                card.dataset.year,
            ].join(' '));
            const matchesQuery = !query || haystack.includes(query);
            const matchesCategory = category === 'all' || card.dataset.category === category;
            const isVisible = matchesQuery && matchesCategory;

            card.hidden = !isVisible;
            if (isVisible) {
                visibleCount += 1;
            }
        });

        if (countLabel) {
            countLabel.textContent = String(visibleCount);
        }

        if (emptyState) {
            emptyState.hidden = visibleCount !== 0;
        }
    };

    filterInput?.addEventListener('input', applyFilter);
    categorySelect?.addEventListener('change', applyFilter);
    applyFilter();
}

function setupSearchForms() {
    selectAll('[data-site-search]').forEach((form) => {
        form.addEventListener('submit', (event) => {
            const input = select('input[name="q"]', form);
            if (!input || input.value.trim()) {
                return;
            }

            event.preventDefault();
            input.focus();
        });
    });
}

function setupPlayers() {
    selectAll('[data-video-player]').forEach((player) => {
        const video = select('video', player);
        const button = select('[data-play-button]', player);
        const status = select('[data-player-status]', player);

        if (!video) {
            return;
        }

        const hlsSource = video.dataset.hlsSrc;
        const mp4Source = video.dataset.mp4Src;
        let hlsInstance = null;
        let sourceReady = false;

        const setStatus = (message) => {
            if (status) {
                status.textContent = message;
            }
        };

        const useMp4Fallback = () => {
            if (mp4Source) {
                video.src = mp4Source;
                sourceReady = true;
                setStatus('MP4 备用源已就绪');
            } else {
                setStatus('当前浏览器无法加载播放源');
            }
        };

        const loadSource = () => {
            if (sourceReady) {
                return;
            }

            if (hlsSource && Hls.isSupported()) {
                hlsInstance = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 60,
                });

                hlsInstance.loadSource(hlsSource);
                hlsInstance.attachMedia(video);
                hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
                    sourceReady = true;
                    setStatus('高清播放源已就绪');
                });
                hlsInstance.on(Hls.Events.ERROR, (_event, data) => {
                    if (data?.fatal) {
                        hlsInstance.destroy();
                        hlsInstance = null;
                        useMp4Fallback();
                    }
                });
                return;
            }

            if (hlsSource && video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = hlsSource;
                sourceReady = true;
                setStatus('高清播放源已就绪');
                return;
            }

            useMp4Fallback();
        };

        const playVideo = async () => {
            loadSource();

            try {
                await video.play();
                player.classList.add('is-playing');
                setStatus('正在播放');
            } catch (_error) {
                setStatus('点击播放器继续播放');
            }
        };

        button?.addEventListener('click', playVideo);
        video.addEventListener('click', () => {
            if (video.paused) {
                playVideo();
            } else {
                video.pause();
            }
        });
        video.addEventListener('play', () => {
            player.classList.add('is-playing');
            setStatus('正在播放');
        });
        video.addEventListener('pause', () => {
            player.classList.remove('is-playing');
            setStatus('已暂停');
        });
        video.addEventListener('ended', () => {
            player.classList.remove('is-playing');
            setStatus('播放结束');
        });

        loadSource();
    });
}

setupMobileMenu();
setupHeroSlider();
setupLiveFiltering();
setupSearchForms();
setupPlayers();
