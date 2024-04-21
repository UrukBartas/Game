importScripts(
  "https://www.gstatic.com/firebasejs/9.7.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.7.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyARtOTOTqtsQx46kaxVCpsuFrn75C_6D6c",
  authDomain: "uruk-bartas-push.firebaseapp.com",
  projectId: "uruk-bartas-push",
  storageBucket: "uruk-bartas-push.appspot.com",
  messagingSenderId: "657642113527",
  appId: "1:657642113527:web:097ccbdd8ba629025146f2",
});
const messaging = firebase.messaging();

