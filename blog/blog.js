import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { firebaseConfig, hasFirebaseConfig } from "./firebase-config.js";

const feed = document.getElementById("blog-feed");
const postsLoaded = "BLOG_POSTS" in window;
const posts = Array.isArray(window.BLOG_POSTS) ? window.BLOG_POSTS : [];
const deviceId = getDeviceId();
const firebaseEnabled = hasFirebaseConfig(firebaseConfig);
const db = firebaseEnabled ? getFirestore(initializeApp(firebaseConfig)) : null;

if (!feed) {
  throw new Error("Blog feed container not found.");
}

if (!postsLoaded) {
  feed.innerHTML = '<article class="blog-post empty-post">Blog posts could not load. Check blog/posts.js.</article>';
} else if (posts.length === 0) {
  feed.innerHTML = '<article class="blog-post empty-post">No posts yet.</article>';
} else {
  renderPosts();
  bindStaticActions();
  if (firebaseEnabled) {
    hydrateLikes().catch((error) => {
      console.error("Failed to load likes:", error);
    });
  } else {
    markLikesUnconfigured();
  }
}

function renderPosts() {
  const formatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  });

  feed.innerHTML = posts.map((post, index) => {
    const postId = getPostId(post, index);
    const date = post.date ? formatter.format(new Date(post.date)) : "";
    const photos = Array.isArray(post.photos) ? post.photos : [];
    const youtube = Array.isArray(post.youtube) ? post.youtube : [];
    const videos = Array.isArray(post.videos) ? post.videos : [];

    return `
      <article class="blog-post" data-post-id="${escapeAttr(postId)}">
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
            <button type="button" class="like-button" data-post-id="${escapeAttr(postId)}">Like</button>
            <span aria-hidden="true">·</span>
            <button type="button">Comment</button>
            <span aria-hidden="true">·</span>
            <button type="button">Share</button>
          </div>
          <div class="post-like-summary">
            <span class="like-icon" aria-hidden="true">👍</span>
            <span><strong class="like-count" data-post-id="${escapeAttr(postId)}">${Number(post.likes || 0)}</strong> <span class="like-summary-muted">people</span> <span class="like-summary-text">like this</span></span>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function bindStaticActions() {
  for (const button of feed.querySelectorAll(".post-action-links button")) {
    if (!button.classList.contains("like-button")) {
      button.addEventListener("click", (event) => {
        event.preventDefault();
      });
    }
  }
}

async function hydrateLikes() {
  await Promise.all(posts.map(async (post, index) => {
    const postId = getPostId(post, index);
    const countEl = getCountElement(postId);
    const buttonEl = getLikeButton(postId);
    const likeDocRef = doc(db, "posts", postId, "likes", deviceId);
    const likesCollectionRef = collection(db, "posts", postId, "likes");

    if (!countEl || !buttonEl) {
      return;
    }

    const [countSnapshot, likeSnapshot] = await Promise.all([
      getCountFromServer(likesCollectionRef),
      getDoc(likeDocRef)
    ]);

    countEl.textContent = String(countSnapshot.data().count);

    if (likeSnapshot.exists()) {
      setLikedState(buttonEl, true);
      return;
    }

    buttonEl.addEventListener("click", async (event) => {
      event.preventDefault();

      if (buttonEl.dataset.pending === "true" || buttonEl.dataset.liked === "true") {
        return;
      }

      buttonEl.dataset.pending = "true";
      buttonEl.textContent = "Liking...";

      try {
        await setDoc(likeDocRef, {
          postId,
          deviceId,
          createdAt: serverTimestamp()
        });

        const nextCount = Number(countEl.textContent || "0") + 1;
        countEl.textContent = String(nextCount);
        setLikedState(buttonEl, true);
      } catch (error) {
        console.error(`Failed to like post ${postId}:`, error);
        buttonEl.textContent = "Like";
        buttonEl.dataset.pending = "false";
      }
    });
  }));
}

function markLikesUnconfigured() {
  for (const button of feed.querySelectorAll(".like-button")) {
    button.title = "Add your Firebase config in blog/firebase-config.js to enable saved likes.";
  }
}

function setLikedState(buttonEl, liked) {
  buttonEl.dataset.pending = "false";
  buttonEl.dataset.liked = liked ? "true" : "false";
  buttonEl.textContent = liked ? "Liked" : "Like";
  buttonEl.classList.toggle("is-active", liked);
}

function getLikeButton(postId) {
  return feed.querySelector(`.like-button[data-post-id="${cssEscape(postId)}"]`);
}

function getCountElement(postId) {
  return feed.querySelector(`.like-count[data-post-id="${cssEscape(postId)}"]`);
}

function getPostId(post, index) {
  if (typeof post.id === "string" && post.id.trim()) {
    return post.id.trim();
  }

  const seed = `${post.date || "no-date"}-${post.name || "no-name"}-${post.text || "no-text"}-${index}`;
  return seed.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function getDeviceId() {
  const key = "kobeni523-blog-device-id";
  const existing = window.localStorage.getItem(key);

  if (existing) {
    return existing;
  }

  const created = self.crypto?.randomUUID
    ? self.crypto.randomUUID()
    : `device-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  window.localStorage.setItem(key, created);
  return created;
}

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

function cssEscape(value) {
  if (window.CSS && typeof window.CSS.escape === "function") {
    return window.CSS.escape(value);
  }

  return String(value).replace(/["\\]/g, "\\$&");
}
