// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBp3URYWEW1AQgPC734BqN1zLQj7HaQ2yo",
    authDomain: "moneychoicewebsite.firebaseapp.com",
    projectId: "moneychoicewebsite",
    storageBucket: "moneychoicewebsite.firebasestorage.app",
    messagingSenderId: "395104519801",
    appId: "1:395104519801:web:b918492f3faa603f9676a8",
    measurementId: "G-XMW5HM29RV"
  };

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Initialize Firebase services
const auth = firebase.auth();
const database = firebase.database();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Make auth and database available globally
window.auth = auth;
window.database = database;
window.googleProvider = googleProvider;

// Export the services if using modules
// export { auth, database, googleProvider };