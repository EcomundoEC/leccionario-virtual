// admin.js
import { auth, db, doc, setDoc, collection, getDocs, signOut, onAuthStateChanged } from './firebase.js';

// 1. Proteger la ruta (Si no está logueado, fuera)
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'index.html';
    } else if (user.email !== 'gasencio@ecomundo.edu.ec') {
        // Aquí podrías validar doble check contra DB si quisieras
        // Por ahora confiamos en el email
    }
});

// 2. Crear Usuario (Solo datos en Firestore)
const form = document.getElementById('formCrearUsuario');
if(form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const nuevoDocente = {
            email: email,
            rol: 'docente',
            nombre: 'Docente Ecomundo',
            area: document.getElementById('area').value,
            cursos: document.getElementById('cursos').value,
            nivel: document.getElementById('nivel').value,
            materias: document.getElementById('materias').value
        };

        try {
            // Guardamos en la colección "usuarios", usando el email como ID del documento
            await setDoc(doc(db, "usuarios", email), nuevoDocente);
            
            alert(`Datos de ${email} guardados.\n\nIMPORTANTE: Ahora ve a la consola de Firebase > Authentication y crea el usuario con su contraseña manualmente.`);
            form.reset();
            cargarTabla();
        } catch (error) {
            alert("Error al guardar: " + error.message);
        }
    });
}

// 3. Cargar Tabla desde la Nube
async function cargarTabla() {
    const tbody = document.querySelector('#tablaUsuarios tbody');
    tbody.innerHTML = 'Cargando datos...';
    
    const querySnapshot = await getDocs(collection(db, "usuarios"));
    tbody.innerHTML = '';

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        if(data.rol !== 'admin') {
            tbody.innerHTML += `
                <tr>
                    <td>${data.email}</td>
                    <td>${data.area}</td>
                    <td>${data.materias}</td>
                </tr>`;
        }
    });
}

// 4. Cerrar Sesión
window.cerrarSesion = function() {
    signOut(auth).then(() => {
        window.location.href = 'index.html';
    });
}

// Inicializar
cargarTabla();