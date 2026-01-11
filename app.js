// app.js - Lógica del Sistema

// 1. Inicializar Base de Datos (Si está vacía)
function inicializarSistema() {
    if (!localStorage.getItem('usuarios')) {
        const adminInicial = {
            email: "gasencio@ecomundo.edu.ec",
            pass: "123456",
            rol: "admin",
            nombre: "Admin Principal",
            area: "Sistemas",
            cursos: "Todos",
            nivel: "Todos",
            materias: "Administración"
        };
        localStorage.setItem('usuarios', JSON.stringify([adminInicial]));
        console.log("Sistema inicializado con Admin por defecto");
    }
}

// 2. Función de Login
function iniciarSesion(email, password) {
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuarioEncontrado = usuarios.find(u => u.email === email && u.pass === password);

    if (usuarioEncontrado) {
        // Guardar sesión actual
        localStorage.setItem('sesionActual', JSON.stringify(usuarioEncontrado));
        
        // Redireccionar según el rol
        if (usuarioEncontrado.rol === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'clases.html';
        }
    } else {
        alert("Usuario o contraseña incorrectos");
    }
}

// 3. Crear Nuevo Usuario (Solo Admins)
function crearUsuario(datos) {
    // Validar dominio ecomundo
    if (!datos.email.endsWith("@ecomundo.edu.ec")) {
        alert("Error: El correo debe terminar en @ecomundo.edu.ec");
        return false;
    }

    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    
    // Validar que no exista ya
    if (usuarios.find(u => u.email === datos.email)) {
        alert("Error: Este usuario ya existe.");
        return false;
    }

    usuarios.push(datos);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    alert("Usuario creado exitosamente");
    return true;
}

// 4. Verificar Seguridad (Poner esto al inicio de admin.html y clases.html)
function verificarSesion(rolRequerido) {
    const sesion = JSON.parse(localStorage.getItem('sesionActual'));
    if (!sesion) {
        window.location.href = 'index.html';
    } else if (rolRequerido && sesion.rol !== rolRequerido) {
        alert("Acceso denegado: No tienes permisos de administrador");
        window.location.href = 'clases.html';
    }
    return sesion;
}

// Ejecutar inicialización al cargar
inicializarSistema();