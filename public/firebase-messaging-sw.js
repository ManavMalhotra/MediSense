importScripts(
  "https://www.gstatic.com/firebasejs/10.4.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.4.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyBEJD_SM69AJv6uf9YvjcyxiIvrwU2MFUg",
  authDomain: "hackathon-24d28.firebaseapp.com",
  databaseURL: "https://hackathon-24d28-default-rtdb.firebaseio.com",
  projectId: "hackathon-24d28",
  storageBucket: "hackathon-24d28.firebasestorage.app",
  messagingSenderId: "395014943549",
  appId: "1:395014943549:web:9b6e81f9dee9c805920b54",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || "Reminder", {
    body,
    icon: "/favicon.ico",
  });
});
