// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCPcWiiOfqx-1lQ8eNIvsmV3tdzH72Mgtg",
    authDomain: "loginuser-950fb.firebaseapp.com",
    projectId: "loginuser-950fb",
    storageBucket: "loginuser-950fb.appspot.com",
    messagingSenderId: "575244003228",
    appId: "1:575244003228:web:c969df6c757fdf5a948a59",
    measurementId: "G-PS62W73LSN",
    databaseURL: "https://loginuser-950fb-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Initialize Firebase services
const auth = firebase.auth();
const database = firebase.database();

// Make auth and database available globally
window.auth = auth;
window.database = database;

// Export the services if using modules
// export { auth, database };