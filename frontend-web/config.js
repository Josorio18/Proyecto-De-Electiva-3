// Configuración de la API - se adapta automáticamente al entorno.
// Si abres el HTML con doble clic (file://), se fuerza localhost.
const isLocal =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.protocol === 'file:';

const API_URL = isLocal
    ? 'http://localhost:3000/api'
    : `${window.location.origin}/api`;
