export const firebaseConfig = {
  apiKey: "AIzaSyCNw4fKLAg_jawTq6-Ojyg0E3EFgGQXOdw",
  authDomain: "imgonnabarfonthewhitehou-f5f06.firebaseapp.com",
  projectId: "imgonnabarfonthewhitehou-f5f06",
  storageBucket: "imgonnabarfonthewhitehou-f5f06.firebasestorage.app",
  messagingSenderId: "148908591081",
  appId: "1:148908591081:web:bbb15c7e9d8a894ea96d78",
  measurementId: "G-RG3J5RTYLP"
};

export function hasFirebaseConfig(config) {
  return Object.values(config).every((value) => {
    return typeof value === "string" && value.length > 0 && !value.startsWith("YOUR_");
  });
}
