// Importamos solo lo necesario del SDK de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// 1. VINCULACIÓN: Pega aquí los datos que copiaste de tu consola de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB1eXkCiF5VZcTin0W5hBQv2X2PEE2bAJc",
  authDomain: "leccionario-virtual.firebaseapp.com",
  projectId: "leccionario-virtual",
  storageBucket: "leccionario-virtual.firebasestorage.app",
  messagingSenderId: "731785058376",
  appId: "1:731785058376:web:161550bdc3941e1a64207d",
  measurementId: "G-ZR0SXQDNY9"
};

// 2. INICIALIZACIÓN
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 3. REFERENCIAS AL DOM
const authForm = document.getElementById('auth-form');
const authContainer = document.getElementById('auth-container');
const userSection = document.getElementById('user-logged-in');
const emailDisplay = document.getElementById('user-email-display');
const toggleBtn = document.getElementById('toggle-auth');
const loader = document.getElementById('loader');

let isLogin = true;

// 4. ESCUCHA DE SESIÓN (Detecta si el usuario ya está logueado)
onAuthStateChanged(auth, (user) => {
    if (user) {
        authContainer.classList.add('hidden');
        userSection.classList.remove('hidden');
        emailDisplay.textContent = user.email;
    } else {
        authContainer.classList.remove('hidden');
        userSection.classList.add('hidden');
    }
    loader.style.display = 'none'; // Quitamos el cargando
});

// 5. MANEJO DE REGISTRO / LOGIN
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        if (isLogin) {
            await signInWithEmailAndPassword(auth, email, password);
            alert("¡Bienvenido!");
        } else {
            await createUserWithEmailAndPassword(auth, email, password);
            alert("Cuenta creada con éxito");
        }
    } catch (error) {
        alert("Error: " + error.message);
    }
});

// 6. CAMBIAR ENTRE LOGIN Y REGISTRO
toggleBtn.addEventListener('click', () => {
    isLogin = !isLogin;
    document.getElementById('form-title').textContent = isLogin ? 'Iniciar Sesión' : 'Registrarse';
    document.getElementById('submit-btn').textContent = isLogin ? 'Acceder' : 'Crear Cuenta';
    toggleBtn.textContent = isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Login';
});

// 7. CERRAR SESIÓN
document.getElementById('logout-btn').addEventListener('click', () => {
    signOut(auth);
});