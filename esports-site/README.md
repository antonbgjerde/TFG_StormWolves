# Esports Site - Configuración PHP/MySQL

Este proyecto usa PHP para el registro e inicio de sesión de usuarios con una base de datos MySQL.

## Archivos importantes

- `WebPage.html` - Interfaz del sitio con popup de login/registro.
- `register.php` - Registro de usuario.
- `login.php` - Inicio de sesión.
- `verify.php` - Verificación de correo electrónico.
- `db.php` - Conexión a la base de datos.
- `config.php` - Configuración de MySQL y correo.
- `create_users_table.sql` - Script para crear la base de datos y la tabla `users`.

## Pasos para configurar

### 1. Instalar XAMPP

1. Descarga XAMPP desde https://www.apachefriends.org/es/index.html
2. Instala XAMPP con Apache y MySQL.
3. Inicia el panel de control de XAMPP y arranca Apache y MySQL.

### 2. Copiar el proyecto a la carpeta pública

Copia la carpeta `esports-site` dentro de la carpeta pública de XAMPP, normalmente:

```text
C:\xampp\htdocs\esports-site
```

### 3. Crear la base de datos

Abre `http://localhost/phpmyadmin` y crea la base de datos:

- Nombre: `esports_site`
- Cotejamiento: `utf8mb4_unicode_ci`

Después importa el archivo `create_users_table.sql` desde phpMyAdmin.

### 4. Configurar `config.php`

Edita `config.php` con tus datos reales:

- `DB_HOST` = `127.0.0.1`
- `DB_NAME` = `esports_site`
- `DB_USER` = `root`
- `DB_PASS` = `` (vacío en XAMPP por defecto)
- `BASE_URL` = `http://localhost/esports-site`
- `EMAIL_FROM` = tu correo Gmail

### 5. Configurar correo en PHP

Para enviar emails de verificación con Gmail, debes tener una contraseña de aplicación.

1. Activa la verificación en dos pasos en tu cuenta de Google.
2. Crea una contraseña de aplicación para Gmail.
3. En `config.php`, usa tu correo Gmail en `EMAIL_FROM`.

> Nota: Si el correo no funciona con `mail()` en XAMPP, puedes usar un servidor SMTP real o un servicio como Gmail/SendGrid.

### 6. Abrir el sitio

Abre el navegador en:

```text
http://localhost/esports-site/WebPage.html
```

### 7. Probar registro y verificación

- Regístrate con un usuario nuevo.
- Revisa la carpeta de correo local de XAMPP si el email no llega.
- Abre el enlace de verificación y luego inicia sesión.

## Si no quieres usar XAMPP

Puedes instalar PHP directamente en Windows, pero XAMPP es más sencillo porque ya incluye Apache y MySQL.

## Solución de problemas

- Si aparece error de conexión: asegúrate de que Apache y MySQL estén arrancados.
- Si aparece error de base de datos: revisa los datos en `config.php`.
- Si el email no llega: revisa la configuración del `mail()` en PHP o usa otro método SMTP.
