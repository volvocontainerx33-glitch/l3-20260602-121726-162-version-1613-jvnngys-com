(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            var isOpen = mobilePanel.hasAttribute("hidden") === false;
            if (isOpen) {
                mobilePanel.setAttribute("hidden", "");
                menuButton.setAttribute("aria-expanded", "false");
            } else {
                mobilePanel.removeAttribute("hidden");
                menuButton.setAttribute("aria-expanded", "true");
            }
        });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function startHero() {
            stopHero();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        function stopHero() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot") || 0));
                startHero();
            });
        });

        hero.addEventListener("mouseenter", stopHero);
        hero.addEventListener("mouseleave", startHero);
        startHero();
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function applyFilter(value) {
        var query = normalize(value);
        var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-card"));
        var status = document.querySelector("[data-filter-status]");
        var matched = 0;

        cards.forEach(function (card) {
            var haystack = normalize(card.textContent + " " + card.getAttribute("data-title") + " " + card.getAttribute("data-tags") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-year"));
            var visible = query === "" || haystack.indexOf(query) !== -1;
            card.classList.toggle("is-hidden", !visible);
            if (visible) {
                matched += 1;
            }
        });

        if (status) {
            status.textContent = query ? "筛选结果 " + matched + " 部" : status.getAttribute("data-default") || status.textContent;
        }
    }

    document.querySelectorAll("[data-filter-status]").forEach(function (status) {
        status.setAttribute("data-default", status.textContent);
    });

    document.querySelectorAll(".catalog-filter").forEach(function (input) {
        input.addEventListener("input", function () {
            applyFilter(input.value);
        });
    });

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q");
    if (initialQuery) {
        document.querySelectorAll(".search-input, .catalog-filter").forEach(function (input) {
            input.value = initialQuery;
        });
        applyFilter(initialQuery);
        var catalog = document.querySelector("#catalog") || document.querySelector("[data-catalog]");
        if (catalog) {
            window.setTimeout(function () {
                catalog.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 120);
        }
    }

    document.querySelectorAll(".search-form").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            var input = form.querySelector(".search-input");
            var value = input ? input.value.trim() : "";
            if (document.querySelector("[data-catalog]") && window.location.pathname.split("/").pop() !== "") {
                event.preventDefault();
                applyFilter(value);
                var target = document.querySelector("#catalog") || document.querySelector("[data-catalog]");
                if (target) {
                    target.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            }
        });
    });

    var hlsLoader = null;

    function loadHls() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        if (hlsLoader) {
            return hlsLoader;
        }
        hlsLoader = new Promise(function (resolve, reject) {
            var script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
            script.async = true;
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
        return hlsLoader;
    }

    function startVideo(box) {
        var video = box.querySelector("video");
        if (!video) {
            return;
        }
        var stream = video.getAttribute("data-stream");
        if (!stream) {
            return;
        }

        box.classList.add("is-playing");

        if (video.canPlayType("application/vnd.apple.mpegURL")) {
            if (!video.src) {
                video.src = stream;
            }
            video.play().catch(function () {});
            return;
        }

        loadHls().then(function (Hls) {
            if (Hls && Hls.isSupported()) {
                if (!video._hlsInstance) {
                    var instance = new Hls({ enableWorker: true });
                    instance.loadSource(stream);
                    instance.attachMedia(video);
                    video._hlsInstance = instance;
                    instance.on(Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else {
                    video.play().catch(function () {});
                }
            } else {
                if (!video.src) {
                    video.src = stream;
                }
                video.play().catch(function () {});
            }
        }).catch(function () {
            if (!video.src) {
                video.src = stream;
            }
            video.play().catch(function () {});
        });
    }

    document.querySelectorAll("[data-player]").forEach(function (box) {
        var button = box.querySelector(".play-layer");
        var video = box.querySelector("video");
        if (button) {
            button.addEventListener("click", function () {
                startVideo(box);
            });
        }
        if (video) {
            video.addEventListener("click", function () {
                if (!box.classList.contains("is-playing")) {
                    startVideo(box);
                }
            });
            video.addEventListener("play", function () {
                box.classList.add("is-playing");
            });
        }
    });
})();
