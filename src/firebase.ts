import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBl798oJTWNzU6ULNQdmKSiAK6KM8YekUU",
  authDomain: "maechaem-db-rfd.firebaseapp.com",
  projectId: "maechaem-db-rfd",
  storageBucket: "maechaem-db-rfd.firebasestorage.app",
  messagingSenderId: "91906629606",
  appId: "1:91906629606:web:39b9b2ca41fe5cd7070027",
  measurementId: "G-1DLXXWY1CK",
};

const app = initializeApp(firebaseConfig);

const analyticsPromise = isSupported()
  .then((supported) => (supported ? getAnalytics(app) : null))
  .catch(() => null);

export { app, analyticsPromise };
