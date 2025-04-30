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

// Initialize Firebase based on which page we're on
if (window.location.pathname.includes('/admin')) {
  // Initialize Admin Firebase app for admin.html
  const adminFirebaseApp = firebase.initializeApp(firebaseConfig, "adminApp");
  
  // Export auth and db for admin - using namespaced exports
  window.auth = adminFirebaseApp.auth();
  window.db = adminFirebaseApp.firestore();
  window.storage = adminFirebaseApp.storage();
  window.functions = adminFirebaseApp.functions();
  window.database = adminFirebaseApp.database();
  
  // Use LOCAL persistence (stays logged in across browser sessions)
  window.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .catch(error => {
      console.error("Error setting persistence for admin:", error);
    });
} 
else {
  // Initialize Chat Firebase app for index.html
  const chatFirebaseApp = firebase.initializeApp(firebaseConfig, "chatApp");
  
  // Export auth and db for chat
  window.auth = chatFirebaseApp.auth();
  window.db = chatFirebaseApp.firestore();
  window.functions = chatFirebaseApp.functions();
  window.database = chatFirebaseApp.database();
  
  // Use SESSION persistence (only for current tab)
  window.auth.setPersistence(firebase.auth.Auth.Persistence.SESSION)
    .catch(error => {
      console.error("Error setting persistence for chat:", error);
    });
