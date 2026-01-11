import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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
const db = getFirestore(app);

// --- ELEMENTOS DOM ---
const authForm = document.getElementById('auth-form');
const userSection = document.getElementById('user-logged-in');
const mainDashboard = document.getElementById('main-dashboard-view');
const adminUsersView = document.getElementById('admin-users-view');
const usersTableBody = document.getElementById('users-table-body');
const loader = document.getElementById('loader');

let editingUserId = null;

// --- GESTIÓN DE VISTAS ---
function showView(viewId) {
    mainDashboard.classList.add('hidden');
    adminUsersView.classList.add('hidden');
    document.getElementById(viewId).classList.remove('hidden');
}

document.getElementById('btn-open-admin').onclick = () => {
    showView('admin-users-view');
    loadAllUsers();
};

document.getElementById('btn-back-dashboard').onclick = () => showView('main-dashboard-view');

// --- CARGAR USUARIOS (SOLO ADMIN) ---
async function loadAllUsers() {
    usersTableBody.innerHTML = '<tr><td colspan="3" class="p-8 text-center text-slate-400">Cargando directorio...</td></tr>';
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        usersTableBody.innerHTML = '';
        querySnapshot.forEach((docSnap) => {
            const user = docSnap.data();
            const id = docSnap.id;
            const roles = user.roles || [];
            
            const tr = document.createElement('tr');
            tr.className = "border-b border-slate-50 hover:bg-slate-50/50 transition";
            tr.innerHTML = `
                <td class="px-8 py-5">
                    <div class="font-bold text-slate-800">${user.email}</div>
                    <div class="text-[10px] text-slate-400 font-mono">${id}</div>
                </td>
                <td class="px-8 py-5">
                    <div class="flex flex-wrap gap-1">
                        ${roles.map(r => `<span class="role-badge role-${r}">${r.replace('_', ' ')}</span>`).join('')}
                    </div>
                </td>
                <td class="px-8 py-5 text-right">
                    <button class="btn-edit text-indigo-600 font-bold text-sm hover:underline" data-id="${id}" data-email="${user.email}" data-roles='${JSON.stringify(roles)}'>
                        Editar Roles
                    </button>
                </td>
            `;
            usersTableBody.appendChild(tr);
        });

        // Eventos de botones editar
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.onclick = () => openEditModal(btn.dataset.id, btn.dataset.email, JSON.parse(btn.dataset.roles));
        });

    } catch (e) {
        console.error("Error cargando usuarios:", e);
    }
}

// --- MODAL DE EDICIÓN ---
function openEditModal(id, email, roles) {
    editingUserId = id;
    document.getElementById('edit-user-email').textContent = email;
    document.querySelectorAll('.role-checkbox').forEach(cb => {
        cb.checked = roles.includes(cb.value);
    });
    document.getElementById('modal-edit-user').classList.remove('hidden');
    document.getElementById('modal-edit-user').classList.add('flex');
}

document.getElementById('btn-close-modal').onclick = () => {
    document.getElementById('modal-edit-user').classList.add('hidden');
    document.getElementById('modal-edit-user').classList.remove('flex');
};

document.getElementById('btn-save-roles').onclick = async () => {
    const selectedRoles = Array.from(document.querySelectorAll('.role-checkbox:checked')).map(cb => cb.value);
    
    loader.style.display = 'flex';
    loader.style.opacity = '1';
    
    try {
        await updateDoc(doc(db, "users", editingUserId), {
            roles: selectedRoles
        });
        document.getElementById('modal-edit-user').classList.add('hidden');
        loadAllUsers(); // Recargar tabla
    } catch (e) {
        alert("Error al actualizar: " + e.message);
    } finally {
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 500);
    }
};

// --- AUTH LISTENER ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Aseguramos que el usuario exista en Firestore (si es nuevo)
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
            await setDoc(userRef, { email: user.email, roles: ['docente'] }); // Rol por defecto
        }

        const data = (await getDoc(userRef)).data();
        document.getElementById('user-email-display').textContent = user.email;
        
        // Renderizar Badges en Header
        const container = document.getElementById('user-roles-container');
        container.innerHTML = '';
        (data.roles || []).forEach(r => {
            const b = document.createElement('span');
            b.className = `role-badge role-${r}`;
            b.textContent = r.replace('_', ' ');
            container.appendChild(b);
        });

        if (data.roles && data.roles.includes('admin')) {
            document.getElementById('admin-panel').classList.remove('hidden');
        }

        document.getElementById('auth-container').classList.add('hidden');
        userSection.classList.remove('hidden');
        renderCalendar(); // Función del calendario (debe estar definida)
    } else {
        document.getElementById('auth-container').classList.remove('hidden');
        userSection.classList.add('hidden');
    }
    loader.style.opacity = '0';
    setTimeout(() => loader.style.display = 'none', 500);
});

// --- LÓGICA DE CALENDARIO (Simplificada para este bloque) ---
let currentDate = new Date();
function renderCalendar() {
    const calendarDays = document.getElementById('calendar-days');
    if(!calendarDays) return;
    calendarDays.innerHTML = '';
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    document.getElementById('current-month-year').textContent = `${monthNames[month]} ${year}`;
    
    const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 0; i < firstDay; i++) {
        const d = document.createElement('div');
        d.className = 'calendar-day other-month h-16';
        calendarDays.appendChild(d);
    }
    const today = new Date();
    for (let d = 1; d <= daysInMonth; d++) {
        const btn = document.createElement('div');
        btn.className = `calendar-day h-16 ${d === today.getDate() && month === today.getMonth() ? 'today' : ''}`;
        btn.textContent = d;
        btn.onclick = () => {
            document.querySelectorAll('.calendar-day').forEach(el => el.classList.remove('selected'));
            btn.classList.add('selected');
            const selDate = new Date(year, month, d);
            document.getElementById('selected-date-str').textContent = selDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
        };
        calendarDays.appendChild(btn);
    }
}

document.getElementById('prev-month').onclick = () => { currentDate.setMonth(currentDate.getMonth() -1); renderCalendar(); };
document.getElementById('next-month').onclick = () => { currentDate.setMonth(currentDate.getMonth() +1); renderCalendar(); };

// Auth Forms
authForm.onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    loader.style.display = 'flex'; loader.style.opacity = '1';
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (err) { 
        // Si no existe, intentar registro (solo para desarrollo, luego quitar)
        try { await createUserWithEmailAndPassword(auth, email, password); }
        catch(e2) { alert("Error: " + err.message); }
    }
};
document.getElementById('logout-btn').onclick = () => signOut(auth);