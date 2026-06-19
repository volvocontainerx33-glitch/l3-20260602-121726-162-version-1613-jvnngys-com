document.addEventListener("DOMContentLoaded", function () {
  setupNavigation();
  setupHero();
  setupLocalFilters();
  setupGlobalSearch();
  setupPlayers();
});

function setupNavigation() {
  var toggle = document.querySelector("[data-nav-toggle]");
  if (!toggle) {
    return;
  }

  toggle.addEventListener("click", function () {
    document.body.classList.toggle("nav-open");
  });
}

function setupHero() {
  var slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
  if (slides.length === 0) {
    return;
  }

  var current = 0;
  var timer = null;

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
    window.clearInterval(timer);
    timer = window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      show(Number(dot.getAttribute("data-hero-dot")) || 0);
      start();
    });
  });

  show(0);
  start();
}

function setupLocalFilters() {
  var scopes = Array.from(document.querySelectorAll("[data-filter-scope]"));
  scopes.forEach(function (scope) {
    var input = scope.querySelector("[data-local-filter]");
    var select = scope.querySelector("[data-year-filter]");
    var list = document.querySelector("[data-filter-list]");
    if (!list) {
      return;
    }

    var cards = Array.from(list.querySelectorAll(".movie-card"));

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var year = select ? select.value : "";
      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type")
        ].join(" ").toLowerCase();
        var matchesQuery = !query || text.indexOf(query) !== -1;
        var matchesYear = !year || card.getAttribute("data-year") === year;
        card.style.display = matchesQuery && matchesYear ? "" : "none";
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    if (select) {
      select.addEventListener("change", apply);
    }
  });
}

function setupGlobalSearch() {
  var root = document.querySelector("[data-global-search]");
  var results = document.querySelector("[data-search-results]");
  var title = document.querySelector("[data-search-title]");
  if (!root || !results || !window.MOVIE_SEARCH_DATA) {
    return;
  }

  var input = root.querySelector("[data-global-query]");
  var type = root.querySelector("[data-global-type]");
  var button = root.querySelector("[data-global-submit]");
  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get("q") || "";

  if (initialQuery && input) {
    input.value = initialQuery;
  }

  function cardTemplate(item) {
    var tags = item.tags && item.tags.length ? item.tags[0] : item.type;
    return [
      '<article class="movie-card" data-title="' + escapeHtml(item.title) + '" data-year="' + item.year + '">',
      '  <a class="card-cover" href="details/' + item.id + '.html" aria-label="查看' + escapeHtml(item.title) + '">',
      '    <div class="poster-art" data-cover-index="' + item.coverIndex + '"><span>' + escapeHtml(item.title.slice(0, 2)) + '</span></div>',
      '    <span class="score-badge">' + item.hotScore + '</span>',
      '  </a>',
      '  <div class="card-body">',
      '    <div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + item.year + '年</span><span>' + escapeHtml(tags) + '</span></div>',
      '    <h3><a href="details/' + item.id + '.html">' + escapeHtml(item.title) + '</a></h3>',
      '    <p>' + escapeHtml(item.oneLine) + '</p>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function apply() {
    var query = input ? input.value.trim().toLowerCase() : "";
    var typeValue = type ? type.value : "";
    var matches = window.MOVIE_SEARCH_DATA.filter(function (item) {
      var haystack = [
        item.title,
        item.region,
        item.type,
        item.year,
        item.genreRaw,
        item.tags.join(" "),
        item.oneLine
      ].join(" ").toLowerCase();
      var queryOk = !query || haystack.indexOf(query) !== -1;
      var typeOk = !typeValue || item.type === typeValue;
      return queryOk && typeOk;
    }).slice(0, 120);

    if (title) {
      title.textContent = query || typeValue ? "找到 " + matches.length + " 个结果" : "热门推荐";
    }

    if (matches.length === 0) {
      results.innerHTML = '<div class="empty-state">没有找到匹配影片，请更换关键词。</div>';
      return;
    }

    results.innerHTML = matches.map(cardTemplate).join("");
  }

  if (input) {
    input.addEventListener("input", apply);
  }
  if (type) {
    type.addEventListener("change", apply);
  }
  if (button) {
    button.addEventListener("click", apply);
  }

  if (initialQuery) {
    apply();
  }
}

function setupPlayers() {
  var videos = Array.from(document.querySelectorAll("video[data-m3u8]"));
  videos.forEach(function (video) {
    var shell = video.closest(".video-shell");
    var button = shell ? shell.querySelector("[data-play-button]") : null;
    var source = video.getAttribute("data-m3u8");

    function initialize() {
      if (!source) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.play().catch(function () {});
      }

      if (button) {
        button.classList.add("hidden");
      }
    }

    if (button) {
      button.addEventListener("click", initialize, { once: true });
    }

    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("hidden");
      }
    });
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
