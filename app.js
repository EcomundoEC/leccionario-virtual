import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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
// Estado de navegación diaria
let viewDate = new Date();

// Elementos DOM
const loader = document.getElementById('loader');
const userLoggedSection = document.getElementById('user-logged-in');
const authContainer = document.getElementById('auth-container');
const usersTableBody = document.getElementById('users-table-body');
const modalEdit = document.getElementById('modal-edit-user');

let currentEditingId = null;

// --- FUNCIONES DE FECHA ---
function updateDayDisplay() {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    document.getElementById('day-current-display').textContent = viewDate.toLocaleDateString('es-ES', options);
}

// --- GESTIÓN DE USUARIOS ---
async function loadUsersTable() {
    const usersRef = collection(db, 'artifacts', appId, 'public', 'data', 'users');
    
    // Listener en tiempo real para reflejar cambios automáticos desde la DB
    onSnapshot(usersRef, (snapshot) => {
        usersTableBody.innerHTML = '';
        snapshot.forEach((docSnap) => {
            const u = docSnap.data();
            const id = docSnap.id;
            const roles = u.roles || [];
            
            const tr = document.createElement('tr');
            tr.className = "hover:bg-slate-50/50 transition-colors group";
            tr.innerHTML = `
                <td class="px-8 py-6">
                    <div class="font-black text-slate-800">${u.email}</div>
                    <div class="text-[10px] text-slate-400 font-mono mt-1 opacity-0 group-hover:opacity-100 transition-opacity">${id}</div>
                </td>
                <td class="px-8 py-6">
                    <div class="text-xs space-y-1">
                        <div class="flex gap-2"><span class="text-slate-400 font-bold uppercase text-[9px]">Área:</span> <span class="text-slate-700 font-medium">${u.area || '-'}</span></div>
                        <div class="flex gap-2"><span class="text-slate-400 font-bold uppercase text-[9px]">Mat:</span> <span class="text-slate-700 font-medium">${u.materia || '-'}</span></div>
                        <div class="flex gap-2"><span class="text-slate-400 font-bold uppercase text-[9px]">Nivel:</span> <span class="text-slate-700 font-medium">${u.nivel || '-'}</span></div>
                    </div>
                </td>
                <td class="px-8 py-6">
                    <div class="flex flex-wrap gap-1">
                        ${roles.map(r => `<span class="role-badge role-${r}">${r.replace('_',' ')}</span>`).join('')}
                    </div>
                </td>
                <td class="px-8 py-6 text-right">
                    <button class="btn-edit-user bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-black text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm" 
                        data-id="${id}" data-email="${u.email}">
                        EDITAR
                    </button>
                </td>
            `;
            usersTableBody.appendChild(tr);
        });

        document.querySelectorAll('.btn-edit-user').forEach(btn => {
            btn.onclick = () => openEditUser(btn.dataset.id);
        });
    }, (err) => console.error("Error en snapshot:", err));
}

async function openEditUser(id) {
    currentEditingId = id;
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', id);
    const snap = await getDoc(docRef);
    
    if (snap.exists()) {
        const u = snap.data();
        document.getElementById('edit-user-email-label').textContent = u.email;
        document.getElementById('edit-user-area').value = u.area || '';
        document.getElementById('edit-user-materia').value = u.materia || '';
        document.getElementById('edit-user-nivel').value = u.nivel || '';
        document.getElementById('edit-user-cursos').value = u.cursos || '';
        document.getElementById('edit-user-secciones').value = u.secciones || '';
        
        const roles = u.roles || [];
        document.querySelectorAll('.role-cb').forEach(cb => {
            cb.checked = roles.includes(cb.value);
            cb.parentElement.classList.toggle('active', cb.checked);
        });

        modalEdit.classList.remove('hidden');
        modalEdit.classList.add('flex');
    }
}

// Guardar cambios del usuario
document.getElementById('btn-save-user-full').onclick = async () => {
    if (!currentEditingId) return;
    
    const roles = Array.from(document.querySelectorAll('.role-cb:checked')).map(cb => cb.value);
    const data = {
        area: document.getElementById('edit-user-area').value,
        materia: document.getElementById('edit-user-materia').value,
        nivel: document.getElementById('edit-user-nivel').value,
        cursos: document.getElementById('edit-user-cursos').value,
        secciones: document.getElementById('edit-user-secciones').value,
        roles: roles
    };

    try {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', currentEditingId), data);
        modalEdit.classList.add('hidden');
        modalEdit.classList.remove('flex');
    } catch (e) {
        alert("Error al guardar: " + e.message);
    }
};

// --- AUTENTICACIÓN ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Inicializar documento de usuario si no existe
        const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', user.uid);
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
            await setDoc(userRef, { email: user.email, roles: ['docente'], area: '', materia: '', nivel: '' });
        }

        document.getElementById('user-email-display').textContent = user.email;
        document.getElementById('user-initial').textContent = user.email.charAt(0).toUpperCase();
        
        authContainer.classList.add('hidden');
        userLoggedSection.classList.remove('hidden');
        updateDayDisplay();
        loadUsersTable();
    } else {
        authContainer.classList.remove('hidden');
        userLoggedSection.classList.add('hidden');
    }
    
    // Quitar loader
    loader.style.opacity = '0';
    setTimeout(() => loader.style.display = 'none', 500);
});

// Eventos de Navegación
document.getElementById('day-prev').onclick = () => { viewDate.setDate(viewDate.getDate() - 1); updateDayDisplay(); };
document.getElementById('day-next').onclick = () => { viewDate.setDate(viewDate.getDate() + 1); updateDayDisplay(); };
document.getElementById('btn-open-admin').onclick = () => {
    document.getElementById('main-dashboard-view').classList.add('hidden');
    document.getElementById('admin-users-view').classList.remove('hidden');
};
document.getElementById('btn-back-dashboard').onclick = () => {
    document.getElementById('admin-users-view').classList.add('hidden');
    document.getElementById('main-dashboard-view').classList.remove('hidden');
};

document.getElementById('btn-close-modal').onclick = () => {
    modalEdit.classList.add('hidden');
    modalEdit.classList.remove('flex');
};

// Login simplificado
document.getElementById('auth-form').onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
        alert("Error de credenciales. Revisa tu correo y contraseña.");
    }
};

document.getElementById('logout-btn').onclick = () => signOut(auth);

// Estética de los chips de roles
document.querySelectorAll('.role-chip').forEach(chip => {
    const cb = chip.querySelector('input');
    cb.onchange = () => chip.classList.toggle('active', cb.checked);
});