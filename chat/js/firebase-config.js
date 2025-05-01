// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBJyiyELkxcrUx_YYz010qc11ldLXs1Iwg",
  authDomain: "pls-chat.firebaseapp.com",
  projectId: "pls-chat",
  databaseURL: "https://pls-chat-default-rtdb.europe-west1.firebasedatabase.app",
  messagingSenderId: "257223618239",
  appId: "1:257223618239:web:802d4c3320c4fceb07200a",
  measurementId: "G-1N5R5HFQ01"
};
// Initialize Firebase based on which page we're on
if (window.location.pathname.includes('/admin')) {
  // We're on the admin page
  firebase.initializeApp(firebaseConfig);
  
  // Set global references - with storage for admin
  window.auth = firebase.auth();
  window.db = firebase.firestore();
  window.functions = firebase.functions();
  window.storage = firebase.storage();
  window.rtdb = firebase.database(); // Make sure database module is imported
  
  // Use LOCAL persistence for admin
  window.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
} 
else {
  // We're on the chat page - no storage
  firebase.initializeApp(firebaseConfig);
  
  // Set global references - WITHOUT storage
  window.auth = firebase.auth();
  window.db = firebase.firestore();
  window.functions = firebase.functions();
  window.rtdb = firebase.database(); // Make sure database module is imported
  // No realtime storage initialization
  
  // Use SESSION persistence for chat
  window.auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
}
