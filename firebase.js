import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // Import necessary auth functions
const firebaseConfig = {
  apiKey: "AIzaSyCVupEKdySNYhlzuXbEpLxnBtjT7xg3P9E",
  authDomain: "meetyourmate-c3b29.firebaseapp.com",
  projectId: "meetyourmate-c3b29",
  storageBucket: "meetyourmate-c3b29.appspot.com",
  messagingSenderId: "65029582858",
  appId: "1:65029582858:web:1daab73f274152f2d46ff3",
  measurementId: "G-MVLJQ1YYLG"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Pass the Firebase app instance to getAuth()
export { auth, app };