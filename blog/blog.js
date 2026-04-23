(function () {
  const feed = document.getElementById("blog-feed");
  const postsLoaded = "BLOG_POSTS" in window;
  const posts = Array.isArray(window.BLOG_POSTS) ? window.BLOG_POSTS : [];

  if (!feed) {
    return;
  }

  if (!postsLoaded) {
    feed.innerHTML = '<article class="blog-post empty-post">Blog posts could not load. Check blog/posts.js.</article>';
    return;
  }

  if (posts.length === 0) {
    feed.innerHTML = '<article class="blog-post empty-post">No posts yet.</article>';
    return;
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  });

  feed.innerHTML = posts.map((post) => {
    const date = post.date ? formatter.format(new Date(post.date)) : "";
    const photos = Array.isArray(post.photos) ? post.photos : [];
    const youtube = Array.isArray(post.youtube) ? post.youtube : [];
    const videos = Array.isArray(post.videos) ? post.videos : [];

    return `
      <article class="blog-post">
        <header class="post-header">
          <img class="post-avatar" src="${escapeAttr(post.profilePicture || "/images/favicon.webp")}" alt="">
          <div>
            <h2>${escapeHtml(post.name || "Kobe")}</h2>
            <time datetime="${escapeAttr(post.date || "")}">${escapeHtml(date)}</time>
          </div>
        </header>
        <p class="post-text">${escapeHtml(post.text || "")}</p>
        ${renderPhotos(photos)}
        ${renderVideos(videos)}
        ${renderYoutube(youtube)}
        <div class="post-actions" aria-label="Post actions">
          <div class="post-action-links">
            <button type="button">Like</button>
            <span aria-hidden="true">·</span>
            <button type="button">Comment</button>
            <span aria-hidden="true">·</span>
            <button type="button">Share</button>
          </div>
          <div class="post-like-summary">
            <span class="like-icon" aria-hidden="true">👍</span>
            <span><strong>${Number(post.likes || 0)}</strong> <span class="like-summary-muted">people</span> <span class="like-summary-text">like this</span></span>
          </div>
        </div>
      </article>
    `;
  }).join("");

  function renderPhotos(photos) {
    if (photos.length === 0) {
      return "";
    }

    return `
      <div class="post-photos">
        ${photos.map((photo) => `<img src="${escapeAttr(photo)}" alt="">`).join("")}
      </div>
    `;
  }

  function renderVideos(videos) {
    if (videos.length === 0) {
      return "";
    }

    return `
      <div class="post-media">
        ${videos.map((video) => `<video src="${escapeAttr(video)}" controls playsinline></video>`).join("")}
      </div>
    `;
  }

  function renderYoutube(youtube) {
    if (youtube.length === 0) {
      return "";
    }

    return `
      <div class="post-youtube">
        ${youtube.map((url) => `
          <iframe
            src="${escapeAttr(toYoutubeEmbedUrl(url))}"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen>
          </iframe>
        `).join("")}
      </div>
    `;
  }

  function toYoutubeEmbedUrl(url) {
    const raw = String(url);

    if (raw.includes("youtube.com/embed/")) {
      return raw;
    }

    try {
      const parsed = new URL(raw);

      if (parsed.hostname.includes("youtu.be")) {
        const id = parsed.pathname.replace("/", "");
        return `https://www.youtube.com/embed/${id}`;
      }

      if (parsed.hostname.includes("youtube.com")) {
        const id = parsed.searchParams.get("v");
        if (id) {
          return `https://www.youtube.com/embed/${id}`;
        }
      }
    } catch (error) {
      return raw;
    }

    return raw;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replaceAll("`", "&#096;");
  }
})();
