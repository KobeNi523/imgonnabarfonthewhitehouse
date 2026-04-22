# Adding Blog Posts

Edit `posts.js`. Each post is one object inside `window.BLOG_POSTS`.

Newest posts should go at the top of the list.

```js
{
  name: "Kobe",
  profilePicture: "images/favicon.webp",
  date: "2026-04-22T12:00:00-05:00",
  text: "Write the post text here.",
  photos: ["images/photo-one.png", "images/photo-two.jpg"],
  likes: 0,
  comments: 0,
  shares: 0
}
```

Rules:

- Put uploaded image files in the `images/` folder.
- Add their filenames to `photos`.
- Use an empty photo list if there are no photos: `photos: []`.
- The fake buttons use the numbers from `likes`, `comments`, and `shares`.
- Visitors cannot add posts from the website. Only someone with GitHub repo access can edit `posts.js`.
