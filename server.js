/**
  📁 File: server.js 
  🧑‍💻 Developed by: Elyoo (NotElyoo)
  🌐 Website: https://miyeon.fr
  📬 Contact: contact@miyeon.fr
 */

  require('dotenv').config();
  const express = require('express');
  const multer = require('multer');
  const path = require('path');
  const fs = require('fs');
  const sqlite3 = require('sqlite3').verbose();
  const session = require('express-session');
  const bcrypt = require('bcrypt');
  const csrf = require('csurf');
  const rateLimit = require('express-rate-limit');
  const helmet = require('helmet');
  
  const app = express();
  app.set('trust proxy', 1);
  const DB_PATH = path.join(__dirname, 'database.db');
  const uploadsDir = path.join(__dirname, 'public', 'uploads');
  
  const ADMIN_USER = process.env.ADMIN_USER || 'admin';
  const ADMIN_HASHED_PASS = process.env.ADMIN_HASHED_PASS;
  
  function sanitizeInput(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[<>&"'`]/g, (c) => ({
      '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#x27;', '`': '&#x60;'
    })[c]);
  }
  
  app.use(helmet({ contentSecurityPolicy: false }));
  
  app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy",
      "default-src 'self'; " +
      "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://open.spotify.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com; " +
      "connect-src 'self'; " +
      "img-src 'self' data: https://*.ggpht.com https://*.googleusercontent.com https://*.spotifycdn.com https://i.ytimg.com;");
    next();
  });
  
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: { error: 'Trop de requêtes. Réessayez plus tard.' }
  });
  
  const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: { error: 'Trop de tentatives de connexion. Réessayez plus tard.' }
  });
  
  app.use(globalLimiter);
  
  app.use(session({
    secret: process.env.SESSION_SECRET || 'changeme',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60 * 2
    }
  }));
  
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, 'public')));
  
  app.get('/', (req, res) => res.redirect('/home'));
  app.get('/home', (req, res) => res.sendFile(path.join(__dirname, 'public', 'home.html')));
  app.get('/collection', (req, res) => res.sendFile(path.join(__dirname, 'public', 'collection.html')));
  app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'public', 'about.html')));
  app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
  
  app.use(csrf());
  app.get('/api/csrf-token', (req, res) => res.json({ csrfToken: req.csrfToken() }));
  
  function isAuthenticated(req, res, next) {
    if (req.session.isAdmin) return next();
    return res.status(403).json({ error: 'Not authorized' });
  }
  
  const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) return console.error('SQLite error:', err);
    db.run(`CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filePath TEXT NOT NULL,
      groupName TEXT NOT NULL,
      idolName TEXT NOT NULL,
      album TEXT,
      preorder TEXT,
      exclusive TEXT,
      quantity INTEGER,
      note TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      embedUrl TEXT NOT NULL
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS albums (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      embedUrl TEXT NOT NULL
    )`);
  });
  
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
      cb(null, uniqueName);
    }
  });
  const upload = multer({
    storage,
    fileFilter: (req, file, cb) => cb(null, file.mimetype.startsWith('image/'))
  });
  
  app.post('/api/login', loginLimiter, async (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && await bcrypt.compare(password, ADMIN_HASHED_PASS)) {
      req.session.isAdmin = true;
      return res.json({ success: true });
    }
    res.json({ success: false });
  });
  
  app.post('/api/logout', (req, res) => {
    req.session.destroy(() => res.json({ success: true }));
  });
  
  app.get('/api/check-auth', (req, res) => {
    res.json({ isAdmin: req.session.isAdmin === true });
  });
  
  app.get('/api/items', (req, res) => {
    db.all(`SELECT * FROM items`, (err, rows) => {
      if (err) return res.status(500).json({ error: 'Internal server error' });
      res.json(rows);
    });
  });
  
  app.post('/upload', isAuthenticated, upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier transmis' });
    const { group, idol, album, preorder, exclusive, quantity, note } = req.body;
    const filePath = '/uploads/' + req.file.filename;
    const query = `INSERT INTO items (filePath, groupName, idolName, album, preorder, exclusive, quantity, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      filePath,
      sanitizeInput(group),
      sanitizeInput(idol),
      sanitizeInput(album || ''),
      preorder || 'false',
      exclusive || 'false',
      parseInt(quantity) || 1,
      sanitizeInput(note || '')
    ];
    db.run(query, values, function (err) {
      if (err) return res.status(500).json({ error: 'Internal server error' });
      res.json({ id: this.lastID, filePath, group, idol, album, preorder, exclusive, quantity, note });
    });
  });
  
  app.put('/api/items/:id', isAuthenticated, (req, res) => {
    const { idol, group, album, preorder, exclusive, quantity, note } = req.body;
    const id = req.params.id;
    if (!idol || !group || !quantity) return res.status(400).json({ error: 'Missing fields' });
  
    const query = `UPDATE items SET idolName = ?, groupName = ?, album = ?, preorder = ?, exclusive = ?, quantity = ?, note = ? WHERE id = ?`;
    const values = [
      sanitizeInput(idol),
      sanitizeInput(group),
      sanitizeInput(album),
      preorder,
      exclusive,
      parseInt(quantity),
      sanitizeInput(note),
      id
    ];
  
    db.run(query, values, function (err) {
      if (err) return res.status(500).json({ error: 'Internal server error' });
      db.get(`SELECT * FROM items WHERE id = ?`, [id], (err2, row) => {
        if (err2) return res.status(500).json({ error: 'Internal server error' });
        if (!row) return res.status(404).json({ error: 'Item not found after update' });
        res.json(row);
      });
    });
  });
  
  app.delete('/api/items/:id', isAuthenticated, (req, res) => {
    const itemId = parseInt(req.params.id);
    db.get('SELECT filePath FROM items WHERE id = ?', [itemId], (err, row) => {
      if (err) return res.status(500).json({ error: 'Internal server error' });
      if (!row) return res.status(404).json({ error: 'Item not found' });
      const absoluteFilePath = path.join(__dirname, 'public', row.filePath);
      db.run('DELETE FROM items WHERE id = ?', [itemId], function(err) {
        if (err) return res.status(500).json({ error: 'Internal server error' });
        fs.unlink(absoluteFilePath, () => res.json({ success: true }));
      });
    });
  });
  
  app.get('/export', isAuthenticated, (req, res) => {
    db.all('SELECT * FROM items', (err, rows) => {
      if (err) return res.status(500).json({ error: 'Internal server error' });
      const exportPath = path.join(__dirname, 'photocards_export.json');
      fs.writeFile(exportPath, JSON.stringify(rows, null, 2), (writeErr) => {
        if (writeErr) return res.status(500).json({ error: 'Internal server error' });
        res.download(exportPath, 'photocards_export.json');
      });
    });
  });
  
  app.get('/api/videos', (req, res) => {
    db.all(`SELECT * FROM videos`, (err, rows) => {
      if (err) return res.status(500).json({ error: 'Internal server error' });
      res.json(rows);
    });
  });
  
  app.post('/api/videos', isAuthenticated, (req, res) => {
    const { embedUrl } = req.body;
    if (!embedUrl) return res.status(400).json({ error: 'embedUrl is required' });
    db.run(`INSERT INTO videos (embedUrl) VALUES (?)`, [sanitizeInput(embedUrl)], function (err) {
      if (err) return res.status(500).json({ error: 'Internal server error' });
      res.json({ id: this.lastID, embedUrl });
    });
  });
  
  app.delete('/api/videos/:id', isAuthenticated, (req, res) => {
    const id = parseInt(req.params.id);
    db.get('SELECT * FROM videos WHERE id = ?', [id], (err, row) => {
      if (err) return res.status(500).json({ error: 'Internal server error' });
      if (!row) return res.status(404).json({ error: 'Video not found' });
      db.run('DELETE FROM videos WHERE id = ?', [id], err2 => {
        if (err2) return res.status(500).json({ error: 'Internal server error' });
        res.json({ success: true });
      });
    });
  });
  
  app.get('/api/albums', (req, res) => {
    db.all(`SELECT * FROM albums`, (err, rows) => {
      if (err) return res.status(500).json({ error: 'Internal server error' });
      res.json(rows);
    });
  });
  
  app.post('/api/albums', isAuthenticated, (req, res) => {
    const { embedUrl } = req.body;
    if (!embedUrl) return res.status(400).json({ error: 'embedUrl is required' });
    db.run(`INSERT INTO albums (embedUrl) VALUES (?)`, [sanitizeInput(embedUrl)], function (err) {
      if (err) return res.status(500).json({ error: 'Internal server error' });
      res.json({ id: this.lastID, embedUrl });
    });
  });
  
  app.delete('/api/albums/:id', isAuthenticated, (req, res) => {
    const id = parseInt(req.params.id);
    db.get('SELECT * FROM albums WHERE id = ?', [id], (err, row) => {
      if (err) return res.status(500).json({ error: 'Internal server error' });
      if (!row) return res.status(404).json({ error: 'Album not found' });
      db.run('DELETE FROM albums WHERE id = ?', [id], err2 => {
        if (err2) return res.status(500).json({ error: 'Internal server error' });
        res.json({ success: true });
      });
    });
  });
  
  app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
      return res.status(403).json({ error: 'Invalid CSRF token' });
    }
    next(err);
  });
  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));  