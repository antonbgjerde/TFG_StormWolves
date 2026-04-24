const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const session = require('express-session');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, 'claves.env') });

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const SESSION_SECRET = process.env.SESSION_SECRET || 'cambia-esta-clave';

const db = new sqlite3.Database(path.join(__dirname, 'users.db'), (err) => {
  if (err) return console.error('Error abriendo base de datos:', err);
  console.log('Base de datos conectada.');
});

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 465,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Error con el servidor de correo:', error.message);
  } else {
    console.log('Servidor de correo listo para enviar mensajes.');
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);

app.use(express.static(path.join(__dirname)));

function initDb() {
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      email TEXT UNIQUE,
      age INTEGER,
      password TEXT,
      verified INTEGER DEFAULT 0,
      verificationToken TEXT
    )`
  );
}

initDb();

app.post('/api/register', async (req, res) => {
  const { username, age, email, password } = req.body;

  if (!username || !email || !password || !age) {
    return res.status(400).json({ error: 'Debes completar todos los campos.' });
  }

  const numericAge = Number(age);
  if (Number.isNaN(numericAge) || numericAge < 13) {
    return res.status(400).json({ error: 'Debes indicar una edad válida (13+).' });
  }

  db.get('SELECT id FROM users WHERE email = ? OR username = ?', [email, username], async (err, row) => {
    if (err) return res.status(500).json({ error: 'Error interno de la base de datos.' });
    if (row) {
      return res.status(400).json({ error: 'El correo o el nombre de usuario ya están en uso.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(20).toString('hex');

    db.run(
      'INSERT INTO users (username, email, age, password, verificationToken) VALUES (?, ?, ?, ?, ?)',
      [username, email, numericAge, hashedPassword, verificationToken],
      async function (insertErr) {
        if (insertErr) {
          return res.status(500).json({ error: 'No se pudo crear el usuario.' });
        }

        const verificationUrl = `${BASE_URL}/verify-email?token=${verificationToken}`;
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Verifica tu cuenta Storm Wolves',
          html: `
            <p>Hola <strong>${username}</strong>,</p>
            <p>Gracias por registrarte. Haz clic en el siguiente enlace para verificar tu correo electrónico:</p>
            <p><a href="${verificationUrl}">Verificar cuenta</a></p>
            <p>Si no solicitaste este registro, ignora este mensaje.</p>
          `,
        };

        transporter.sendMail(mailOptions, (mailErr) => {
          if (mailErr) {
            console.error('Error enviando correo de verificación:', mailErr);
            return res.status(500).json({ error: 'No se pudo enviar el correo de verificación.' });
          }

          return res.json({ success: true, message: 'Usuario creado. Revisa tu correo y confirma tu cuenta.' });
        });
      }
    );
  });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Debes enviar email y contraseña.' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Error interno de la base de datos.' });
    if (!user) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }
    if (!user.verified) {
      return res.status(403).json({ error: 'Debes verificar tu correo antes de iniciar sesión.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    return res.json({ success: true, message: 'Inicio de sesión correcto.' });
  });
});

app.get('/verify-email', (req, res) => {
  const token = req.query.token;
  if (!token) {
    return res.status(400).send('<h1>Token inválido</h1><p>El token de verificación no es válido.</p>');
  }

  db.run(
    'UPDATE users SET verified = 1, verificationToken = NULL WHERE verificationToken = ?',
    [token],
    function (err) {
      if (err) {
        return res.status(500).send('<h1>Error interno</h1><p>No se pudo verificar la cuenta.</p>');
      }
      if (this.changes === 0) {
        return res.status(400).send('<h1>Token inválido</h1><p>El token ya no es válido o ya se ha utilizado.</p>');
      }
      return res.send('<h1>Cuenta verificada</h1><p>Tu correo ha sido confirmado. Puedes volver a la página y entrar con tus datos.</p>');
    }
  );
});

app.get('/api/session', (req, res) => {
  if (req.session.user) {
    return res.json({ loggedIn: true, user: req.session.user });
  }
  return res.json({ loggedIn: false });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'WebPage.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});