// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBJyiyELkxcrUx_YYz010qc11ldLXs1Iwg",
  authDomain: "pls-chat.firebaseapp.com",
  projectId: "pls-chat",
  messagingSenderId: "257223618239",
  appId: "1:257223618239:web:802d4c3320c4fceb07200a",
  measurementId: "G-1N5R5HFQ01",
  databaseURL: "https://pls-chat-default-rtdb.europe-west1.firebasedatabase.app",
  storageBucket: "pls-chat.appspot.com" // Added storage bucket based on project ID
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Export auth and db
window.auth = firebase.auth();
window.db = firebase.firestore();
window.storage = firebase.storage();
window.functions = firebase.functions();
window.database = firebase.database(); // Add database reference

// ONLY ADDITION: Set persistence based on page (to prevent admin logout issue)
if (window.location.pathname.includes('/admin')) {
  window.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
} else {
  window.auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
}
