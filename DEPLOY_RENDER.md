# Despliegue de CanchaPro en Render

Este proyecto despliega **frontend y backend juntos** en un solo servicio de Render.

## Requisitos previos

1. **Cuenta en Render** - [render.com](https://render.com)
2. **Base de datos MySQL/MariaDB** - Render no incluye MariaDB. Opciones:
   - [PlanetScale](https://planetscale.com) - MySQL gratis
   - [Railway](https://railway.app) - MySQL/MariaDB
   - [ClearDB](https://www.cleardb.com) - MySQL en Heroku/Render

## Pasos para desplegar

### 1. Subir el proyecto a GitHub

```bash
git init
git add .
git commit -m "Proyecto CanchaPro listo para Render"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/Proyecto_Electiva3.git
git push -u origin main
```

### 2. Crear el servicio en Render

1. Ve a [dashboard.render.com](https://dashboard.render.com)
2. **New** → **Web Service**
3. Conecta tu repositorio de GitHub
4. Configuración:
   - **Name:** canchapro
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

### 3. Variables de entorno

En **Environment** del servicio, agrega:

| Variable     | Valor |
|-------------|-------|
| `NODE_ENV`  | production |
| `DATABASE_URL` | `mariadb://usuario:contraseña@host:3306/nombre_bd` |

Ejemplo para PlanetScale (requiere cambiar dialect a `mysql` en `backend/config/database.js`):
```
mysql://usuario:contraseña@host.connect.psdb.cloud:3306/canchapro
```

Ejemplo para Railway:
```
mysql://root:password@host.railway.app:3306/railway
```

> **Nota:** El proyecto usa MariaDB por defecto. Para PlanetScale o Railway (MySQL), cambia en `backend/config/database.js` el dialect de `'mariadb'` a `'mysql'` e instala: `npm install mysql2`.

### 4. Desplegar

Render desplegará automáticamente. La URL será algo como:
`https://canchapro-xxxx.onrender.com`

## Credenciales por defecto

Tras el primer despliegue, el sistema crea automáticamente:

| Tipo   | Email               | Contraseña |
|--------|---------------------|------------|
| Usuario | demo@canchapro.com | demo123    |
| Admin  | admin@canchapro.com | admin123   |

## Usando Blueprint (render.yaml)

Si prefieres el despliegue con Blueprint:

1. **New** → **Blueprint**
2. Conecta el repositorio
3. Render leerá `render.yaml` y creará el servicio
4. Configura `DATABASE_URL` manualmente en el Dashboard

## Solución de problemas

- **Error de base de datos:** Verifica que `DATABASE_URL` sea correcta y que el host permita conexiones externas.
- **Frontend no carga:** El backend sirve los archivos estáticos desde `/`. La raíz muestra el login.
- **Cold start:** En el plan gratuito, el servicio puede tardar ~30 segundos en despertar tras inactividad.
