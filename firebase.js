// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// PEGA AQUÍ TU CONFIGURACIÓN DE FIREBASE (La que copiaste de la consola)
// Debe verse parecida a esta:
const firebaseConfig = {
  apiKey: "AIzaSyB1eXkCiF5VZcTin0W5hBQv2X2PEE2bAJc",
  authDomain: "leccionario-virtual.firebaseapp.com",
  projectId: "leccionario-virtual",
  storageBucket: "leccionario-virtual.firebasestorage.app",
  messagingSenderId: "731785058376",
  appId: "1:731785058376:web:161550bdc3941e1a64207d",
  measurementId: "G-ZR0SXQDNY9"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Exportar herramientas para usarlas en otros archivos
export { db, auth, collection, addDoc, getDocs, query, where, doc, setDoc, getDoc, signInWithEmailAndPassword, signOut, onAuthStateChanged };