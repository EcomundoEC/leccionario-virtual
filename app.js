// app.js
import { auth, db, doc, getDoc, signInWithEmailAndPassword } from './firebase.js';

// Exponer la función al contexto global (window) para que el botón HTML la encuentre
window.manejarLogin = async function() {
    const email = document.getElementById('usuario').value;
    const pass = document.getElementById('password').value;
    const btn = document.querySelector('.btn-ingresar');

    try {
        btn.textContent = "Verificando...";
        
        // 1. Intentar loguear en Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        const user = userCredential.user;

        // 2. Verificar Rol en Base de Datos (Firestore)
        // Buscamos si existe información extra de este usuario
        const docRef = doc(db, "usuarios", email); 
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const datosUsuario = docSnap.data();
            
            if (datosUsuario.rol === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'clases.html';
            }
        } else {
            // Si entra por primera vez y es el admin principal, lo dejamos pasar
            if(email === 'gasencio@ecomundo.edu.ec') {
                window.location.href = 'admin.html'; // Acceso de emergencia para crear el primer registro
            } else {
                alert("Usuario autenticado pero sin datos de perfil. Contacte al Admin.");
            }
        }

    } catch (error) {
        console.error(error);
        alert("Error: " + error.message);
        btn.textContent = "Ingresar";
    }
}