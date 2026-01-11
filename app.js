import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Referencias DOM
const authForm = document.getElementById('auth-form');
const authContainer = document.getElementById('auth-container');
const userSection = document.getElementById('user-logged-in');
const calendarDays = document.getElementById('calendar-days');
const monthYearDisplay = document.getElementById('current-month-year');
const selectedDateDisplay = document.getElementById('selected-date-str');
const loader = document.getElementById('loader');

let currentDate = new Date();
let selectedDate = new Date();
let isLogin = true;

// --- LÓGICA DE CALENDARIO ---

function renderCalendar() {
    calendarDays.innerHTML = '';
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Nombre del mes
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    monthYearDisplay.textContent = `${monthNames[month]} ${year}`;

    // Primer día del mes (0=Dom, 1=Lun...)
    const firstDayIndex = new Date(year, month, 1).getDay();
    // Ajustar para que la semana empiece en Lunes (L=0, D=6)
    const startDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    const lastDay = new Date(year, month + 1, 0).getDate();
    const prevLastDay = new Date(year, month, 0).getDate();

    // Días del mes anterior (relleno)
    for (let x = startDay; x > 0; x--) {
        const div = document.createElement('div');
        div.classList.add('calendar-day', 'other-month');
        div.textContent = prevLastDay - x + 1;
        calendarDays.appendChild(div);
    }

    // Días del mes actual
    const today = new Date();
    for (let i = 1; i <= lastDay; i++) {
        const div = document.createElement('div');
        div.classList.add('calendar-day');
        div.textContent = i;

        // Marcar hoy
        if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            div.classList.add('today');
        }

        div.addEventListener('click', () => {
            selectDay(new Date(year, month, i));
        });

        calendarDays.appendChild(div);
    }
}

function selectDay(date) {
    selectedDate = date;
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    selectedDateDisplay.textContent = date.toLocaleDateString('es-ES', options);
    
    // Aquí es donde en el futuro consultaremos Firestore para este día
    console.log("Día seleccionado:", date.toISOString().split('T')[0]);
}

// Navegación
document.getElementById('prev-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('next-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

// --- LÓGICA DE AUTH ---

onAuthStateChanged(auth, (user) => {
    if (user) {
        authContainer.classList.add('hidden');
        userSection.classList.remove('hidden');
        renderCalendar();
        selectDay(new Date());
    } else {
        authContainer.classList.remove('hidden');
        userSection.classList.add('hidden');
    }
    loader.style.opacity = '0';
    setTimeout(() => loader.style.display = 'none', 500);
});

// (Resto de funciones de login y logout iguales a la versión anterior...)
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
        if (isLogin) await signInWithEmailAndPassword(auth, email, password);
        else await createUserWithEmailAndPassword(auth, email, password);
    } catch (e) { alert(e.message); }
});

document.getElementById('logout-btn').addEventListener('click', () => signOut(auth));
document.getElementById('toggle-auth').addEventListener('click', () => {
    isLogin = !isLogin;
    document.getElementById('form-title').textContent = isLogin ? 'Iniciar Sesión' : 'Registrarse';
    document.getElementById('submit-btn').textContent = isLogin ? 'Acceder' : 'Crear Cuenta';
});