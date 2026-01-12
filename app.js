// --- CONFIGURACIÓN DE DATOS LOCALES (Simulación de DB) ---
const LOCAL_USERS = [
    {
        id: "user_01",
        email: "gasencio@ecomundo.edu.ec",
        password: "123456",
        area: "Ciencias Exactas",
        materia: "Matemáticas",
        nivel: "Bachillerato",
        cursos: "1ero, 2do",
        secciones: "A, B",
        roles: ["docente"]
    },
    {
        id: "admin_01",
        email: "admin",
        password: "admin",
        area: "Dirección",
        materia: "General",
        nivel: "Institucional",
        cursos: "Todos",
        secciones: "Todas",
        roles: ["admin", "administrativo"]
    }
];

// Opciones para los selectores del modal
const ACADEMIC_OPTIONS = {
    areas: ["Ciencias Exactas", "Lengua y Literatura", "Ciencias Naturales", "Ciencias Sociales", "Educación Física", "Artes"],
    materias: ["Matemáticas", "Física", "Química", "Biología", "Historia", "Lengua", "Inglés", "Informática"],
    niveles: ["Inicial", "Básica Elemental", "Básica Media", "Básica Superior", "Bachillerato"]
};

// Estado Global de la App
let currentUser = null;
let viewDate = new Date();
let currentEditingId = null;

// Elementos del DOM
const loader = document.getElementById('loader');
const authContainer = document.getElementById('auth-container');
const userLoggedSection = document.getElementById('user-logged-in');
const usersTableBody = document.getElementById('users-table-body');
const modalEdit = document.getElementById('modal-edit-user');

// --- FUNCIONES DE CONTROL DE INTERFAZ ---

function hideLoader() {
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => { loader.style.display = 'none'; }, 400);
    }
}

function updateDayDisplay() {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    const display = document.getElementById('day-current-display');
    if (display) display.textContent = viewDate.toLocaleDateString('es-ES', options);
}

// --- GESTIÓN DE USUARIOS (LOCAL) ---

function renderUsersTable() {
    if (!usersTableBody) return;
    usersTableBody.innerHTML = '';
    
    LOCAL_USERS.forEach((u) => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50/50 transition-colors group";
        tr.innerHTML = `
            <td class="px-8 py-6">
                <div class="font-black text-slate-800">${u.email}</div>
                <div class="text-[10px] text-slate-400 font-mono mt-1 opacity-0 group-hover:opacity-100 transition-opacity">${u.id}</div>
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
                    ${u.roles.map(r => `<span class="role-badge role-${r}">${r.replace('_',' ')}</span>`).join('')}
                </div>
            </td>
            <td class="px-8 py-6 text-right">
                <button class="btn-edit-user bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-black text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm" 
                    data-id="${u.id}">
                    EDITAR
                </button>
            </td>
        `;
        usersTableBody.appendChild(tr);
    });

    document.querySelectorAll('.btn-edit-user').forEach(btn => {
        btn.onclick = () => openEditUser(btn.dataset.id);
    });
}

function populateSelectors() {
    const areaSelect = document.getElementById('edit-user-area');
    const matSelect = document.getElementById('edit-user-materia');
    const nivelSelect = document.getElementById('edit-user-nivel');

    if (areaSelect) areaSelect.innerHTML = ACADEMIC_OPTIONS.areas.map(a => `<option value="${a}">${a}</option>`).join('');
    if (matSelect) matSelect.innerHTML = ACADEMIC_OPTIONS.materias.map(m => `<option value="${m}">${m}</option>`).join('');
    if (nivelSelect) nivelSelect.innerHTML = ACADEMIC_OPTIONS.niveles.map(n => `<option value="${n}">${n}</option>`).join('');
}

function openEditUser(id) {
    currentEditingId = id;
    const u = LOCAL_USERS.find(user => user.id === id);
    if (!u) return;

    document.getElementById('edit-user-email-label').textContent = u.email;
    document.getElementById('edit-user-area').value = u.area || '';
    document.getElementById('edit-user-materia').value = u.materia || '';
    document.getElementById('edit-user-nivel').value = u.nivel || '';
    document.getElementById('edit-user-cursos').value = u.cursos || '';
    document.getElementById('edit-user-secciones').value = u.secciones || '';
    
    document.querySelectorAll('.role-cb').forEach(cb => {
        cb.checked = u.roles.includes(cb.value);
    });

    modalEdit.classList.remove('hidden');
    modalEdit.classList.add('flex');
}

// --- LÓGICA DE AUTENTICACIÓN ---

function showDashboard(user) {
    currentUser = user;
    authContainer.classList.add('hidden');
    userLoggedSection.classList.remove('hidden');
    
    document.getElementById('user-email-display').textContent = user.email === 'admin' ? 'Administrador' : user.email;
    document.getElementById('user-initial').textContent = user.email.charAt(0).toUpperCase();
    
    updateDayDisplay();
    renderUsersTable();
}

// --- EVENTOS ---

document.getElementById('auth-form').onsubmit = (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;

    const userFound = LOCAL_USERS.find(u => u.email === email && u.password === password);

    if (userFound) {
        showDashboard(userFound);
    } else {
        alert("Credenciales incorrectas. Intenta con admin/admin o gasencio@ecomundo.edu.ec/123456");
    }
};

document.getElementById('btn-save-user-full').onclick = () => {
    const index = LOCAL_USERS.findIndex(u => u.id === currentEditingId);
    if (index !== -1) {
        const roles = Array.from(document.querySelectorAll('.role-cb:checked')).map(cb => cb.value);
        LOCAL_USERS[index] = {
            ...LOCAL_USERS[index],
            area: document.getElementById('edit-user-area').value,
            materia: document.getElementById('edit-user-materia').value,
            nivel: document.getElementById('edit-user-nivel').value,
            cursos: document.getElementById('edit-user-cursos').value,
            secciones: document.getElementById('edit-user-secciones').value,
            roles: roles
        };
        renderUsersTable();
        modalEdit.classList.add('hidden');
        modalEdit.classList.remove('flex');
    }
};

document.getElementById('logout-btn').onclick = () => {
    location.reload(); // Reiniciar app al estado inicial
};

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

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    populateSelectors();
    // Ocultar loader inmediatamente
    setTimeout(hideLoader, 500);
});