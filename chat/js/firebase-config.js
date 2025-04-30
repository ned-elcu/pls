// FIREBASE CONFIGURATION
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Admin Firebase app for admin.html
let adminFirebaseApp;
if (window.location.pathname.includes('/admin')) {
  adminFirebaseApp = firebase.initializeApp(firebaseConfig, "adminApp");
  // Export auth and db for admin
  window.auth = adminFirebaseApp.auth();
  window.db = adminFirebaseApp.firestore();
  window.storage = adminFirebaseApp.storage();
  window.functions = adminFirebaseApp.functions();
  
  // Use LOCAL persistence (stays logged in across browser sessions)
  window.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
} 
// Initialize Chat Firebase app for index.html
else {
  const chatFirebaseApp = firebase.initializeApp(firebaseConfig, "chatApp");
  // Export auth and db for chat
  window.auth = chatFirebaseApp.auth();
  window.db = chatFirebaseApp.firestore();
  window.functions = chatFirebaseApp.functions();
  
  // Use SESSION persistence (only for current tab)
  window.auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
}
