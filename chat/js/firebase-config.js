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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Set global references
window.auth = firebase.auth();
window.db = firebase.firestore();
window.functions = firebase.functions();
window.database = firebase.database();
window.storage = firebase.storage();

// Set persistence based on page
if (window.location.pathname.includes('/admin')) {
  // For admin page - use LOCAL persistence
  window.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .catch(function(error) {
      console.error("Error setting persistence for admin:", error);
    });
} else {
  // For chat page - use SESSION persistence
  window.auth.setPersistence(firebase.auth.Auth.Persistence.SESSION)
    .catch(function(error) {
      console.error("Error setting persistence for chat:", error);
    });
}
