import { H as Hls } from "./hls.js";

function setMessage(player, text) {
  const message = player.querySelector("[data-player-message]");

  if (message) {
    message.textContent = text;
  }
}

function playVideo(video, player) {
  video.play().catch(function () {
    setMessage(player, "浏览器阻止了自动播放，请使用播放器控件继续播放。");
  });
}

window.MovieHlsPlayer = {
  initAndPlay: function (player) {
    const video = player.querySelector("video[data-video-source]");

    if (!video) {
      setMessage(player, "未找到播放器。请刷新页面后重试。");
      return;
    }

    const source = video.getAttribute("data-video-source");

    if (!source) {
      setMessage(player, "当前页面没有可用的视频源。");
      return;
    }

    if (video.getAttribute("data-hls-ready") === "true") {
      playVideo(video, player);
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.setAttribute("data-hls-ready", "true");
      setMessage(player, "已加载播放源。若播放未开始，请点击播放器控件。");
      playVideo(video, player);
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      player._hlsInstance = hls;
      video.setAttribute("data-hls-ready", "true");

      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        setMessage(player, "已加载播放源。若播放未开始，请点击播放器控件。");
        playVideo(video, player);
      });

      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setMessage(player, "播放源加载失败，请稍后重试或更换浏览器。 ");
        }
      });

      return;
    }

    video.src = source;
    video.setAttribute("data-hls-ready", "true");
    setMessage(player, "当前浏览器可能不支持 HLS，已尝试使用原生播放方式。 ");
    playVideo(video, player);
  }
};
