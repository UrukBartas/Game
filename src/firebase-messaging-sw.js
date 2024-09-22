importScripts(
  "https://www.gstatic.com/firebasejs/9.7.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.7.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyDInFY0vQqlsTBQIRUynninKwu9W4aYIBQ",
  authDomain: "uruk-push-v2.firebaseapp.com",
  projectId: "uruk-push-v2",
  storageBucket: "uruk-push-v2.appspot.com",
  messagingSenderId: "706694829638",
  appId: "1:706694829638:web:9a0c27ee414de9ee051c47",
});
const messaging = firebase.messaging();
