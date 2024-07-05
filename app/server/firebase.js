// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import {getStorage} from "firebase/storage"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB_QZSvCgCWf3OsRqqW1w8dCHii0XI5jeU",
  authDomain: "note-app-8016a.firebaseapp.com",
  projectId: "note-app-8016a",
  storageBucket: "note-app-8016a.appspot.com",
  messagingSenderId: "498371886209",
  appId: "1:498371886209:web:44fc6c62b6d7a674c1a180"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
