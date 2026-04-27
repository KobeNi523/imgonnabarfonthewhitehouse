# Firebase Likes Setup

This site uses anonymous browser-based likes. A visitor does **not** need an account.

Each browser gets a local device ID. A like is stored in Firestore at:

```text
posts/{postId}/likes/{deviceId}
```

That means:

- Refreshing the page does not add more likes.
- Coming back later in the same browser still shows `Liked`.
- Clearing browser storage or using another device can create another like.

## 1. Create a Firebase project

In the Firebase console:

1. Create a project.
2. Add a **Web app** to that project.
3. Copy the Firebase config object.

## 2. Enable Firestore

In Firebase:

1. Go to **Firestore Database**.
2. Create the database in production mode.

## 3. Paste your config

Open:

[`blog/firebase-config.js`](/Users/kobeknee/Documents/White House Website/blog/firebase-config.js)

Replace the placeholder values with your real Firebase web config.

## 4. Firestore security rules

In Firestore Rules, use:

```txt
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /posts/{postId}/likes/{deviceId} {
      allow read: if true;
      allow create: if
        !exists(/databases/$(database)/documents/posts/$(postId)/likes/$(deviceId)) &&
        request.resource.data.keys().hasOnly(['postId', 'deviceId', 'createdAt']) &&
        request.resource.data.postId == postId &&
        request.resource.data.deviceId == deviceId;
      allow update, delete: if false;
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

These rules let anyone:

- read likes
- create one like document per `deviceId`

But they cannot:

- edit an existing like
- delete likes
- write anywhere else in your database

## 5. How likes work in posts

Each post in:

[`blog/posts.js`](/Users/kobeknee/Documents/White House Website/blog/posts.js)

needs a stable `id`:

```js
{
  id: "post-2026-04-23-911",
  name: "Kobe Ni",
  profilePicture: "/images/pfp.jpg",
  date: "2026-04-23T19:54:00-05:00",
  text: "9/11 was bad.",
  likes: 0
}
```

The visible `likes` number in `blog/posts.js` is only the fallback/default. Once Firebase is configured, the real count comes from Firestore.

## 6. Upload these files

When you push to GitHub, make sure these are updated:

- `blog/index.html`
- `blog/posts.js`
- `blog/blog.js`
- `blog/firebase-config.js`
- `FIREBASE_LIKES_SETUP.md`

## Notes

- Firebase web config is expected to be public in browser apps.
- Security comes from Firestore Rules, not from hiding the config.
- If you want more abuse protection later, add Firebase App Check.
