// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBJyiyELkxcrUx_YYz010qc11ldLXs1Iwg",
  authDomain: "pls-chat.firebaseapp.com",
  projectId: "pls-chat",
  messagingSenderId: "257223618239",
  appId: "1:257223618239:web:802d4c3320c4fceb07200a",
  measurementId: "G-1N5R5HFQ01",
  databaseURL: "https://pls-chat-default-rtdb.europe-west1.firebasedatabase.app",
  storageBucket: "pls-chat.appspot.com"
};

// Initialize Firebase once
try {
  // Check if Firebase is already initialized to avoid errors
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  
  // Set global references to Firebase services
  window.auth = firebase.auth();
  window.db = firebase.firestore();
  window.functions = firebase.functions();
  window.database = firebase.database();
  window.storage = firebase.storage ? firebase.storage() : null;
  
  // Set the appropriate persistence based on the page
  if (window.location.pathname.includes('/admin')) {
    // For admin page - use LOCAL persistence to keep admin logged in
    window.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      .catch(error => {
        console.error("Error setting persistence for admin:", error);
      });
  } else {
    // For chat page - use SESSION persistence (only for current tab)
    // This prevents the anonymous auth from affecting other tabs
    window.auth.setPersistence(firebase.auth.Auth.Persistence.SESSION)
      .catch(error => {
        console.error("Error setting persistence for chat:", error);
      });
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
}
