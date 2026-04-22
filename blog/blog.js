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
        <div class="post-actions" aria-label="Post actions">
          <button type="button">Like ${Number(post.likes || 0)}</button>
          <button type="button">Comment ${Number(post.comments || 0)}</button>
          <button type="button">Share ${Number(post.shares || 0)}</button>
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
