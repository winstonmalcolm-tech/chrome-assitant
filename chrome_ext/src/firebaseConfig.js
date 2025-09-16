// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZvg0wW7N7_X0es3RHDPQDwr6XZVXxVSQ",
  authDomain: "browser-assistant-855b9.firebaseapp.com",
  projectId: "browser-assistant-855b9",
  storageBucket: "browser-assistant-855b9.firebasestorage.app",
  messagingSenderId: "89676469212",
  appId: "1:89676469212:web:fe7922aa6127f32806b519"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

//Auth Properties
const auth = getAuth(app);
const provider = new GoogleAuthProvider()

export {app, auth, provider, signInWithPopup}