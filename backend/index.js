const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 4000;
const DB_PATH = path.join(__dirname, '../members.db');

app.use(cors());
app.use(bodyParser.json());

// SQLite bağlantısı
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Veritabanı bağlantı hatası:', err.message);
  } else {
    console.log('SQLite veritabanına bağlandı.');
  }
});

// Üyeleri listele
app.get('/api/members', (req, res) => {
  const q = req.query.q || '';
  db.all(
    'SELECT * FROM Members WHERE name LIKE ? ORDER BY member_id DESC',
    [`%${q}%`],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Üye ekle
app.post('/api/members', (req, res) => {
  const { name, phone, email, address, date_of_birth, registration_date } = req.body;
  if (!name || !registration_date) {
    return res.status(400).json({ error: 'İsim ve kayıt tarihi zorunludur.' });
  }
  db.run(
    `INSERT INTO Members (name, phone, email, address, date_of_birth, registration_date) VALUES (?, ?, ?, ?, ?, ?)`,
    [name, phone, email, address, date_of_birth, registration_date],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ member_id: this.lastID });
    }
  );
});

// Üye güncelle
app.put('/api/members/:id', (req, res) => {
  const { name, phone, email, address, date_of_birth, registration_date } = req.body;
  db.run(
    `UPDATE Members SET name=?, phone=?, email=?, address=?, date_of_birth=?, registration_date=? WHERE member_id=?`,
    [name, phone, email, address, date_of_birth, registration_date, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: this.changes });
    }
  );
});

// Üye sil
app.delete('/api/members/:id', (req, res) => {
  db.run(
    `DELETE FROM Members WHERE member_id=?`,
    [req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ deleted: this.changes });
    }
  );
});

// Grupları listele
app.get('/api/groups', (req, res) => {
  db.all('SELECT * FROM Groups ORDER BY group_id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Grup ekle
app.post('/api/groups', (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Grup adı zorunludur.' });
  db.run(
    `INSERT INTO Groups (name, description) VALUES (?, ?)`,
    [name, description],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ group_id: this.lastID });
    }
  );
});

// Grup güncelle
app.put('/api/groups/:id', (req, res) => {
  const { name, description } = req.body;
  db.run(
    `UPDATE Groups SET name=?, description=? WHERE group_id=?`,
    [name, description, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: this.changes });
    }
  );
});

// Grup sil
app.delete('/api/groups/:id', (req, res) => {
  db.run(
    `DELETE FROM Groups WHERE group_id=?`,
    [req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ deleted: this.changes });
    }
  );
});

// --- Sports Branches ---
app.get('/api/branches', (req, res) => {
  db.all('SELECT * FROM Sports_Branches ORDER BY branch_id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
app.post('/api/branches', (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Branş adı zorunludur.' });
  db.run(
    `INSERT INTO Sports_Branches (name, description) VALUES (?, ?)`,
    [name, description],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ branch_id: this.lastID });
    }
  );
});
app.put('/api/branches/:id', (req, res) => {
  const { name, description } = req.body;
  db.run(
    `UPDATE Sports_Branches SET name=?, description=? WHERE branch_id=?`,
    [name, description, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: this.changes });
    }
  );
});
app.delete('/api/branches/:id', (req, res) => {
  db.run(
    `DELETE FROM Sports_Branches WHERE branch_id=?`,
    [req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ deleted: this.changes });
    }
  );
});

// --- Member_Sports_Branches ---
app.post('/api/member-branches', (req, res) => {
  const { member_id, branch_id } = req.body;
  if (!member_id || !branch_id) return res.status(400).json({ error: 'Üye ve branş zorunludur.' });
  db.run(
    `INSERT OR IGNORE INTO Member_Sports_Branches (member_id, branch_id) VALUES (?, ?)`,
    [member_id, branch_id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ status: 'ok' });
    }
  );
});
app.get('/api/member-branches/:member_id', (req, res) => {
  db.all(
    `SELECT b.* FROM Member_Sports_Branches mb JOIN Sports_Branches b ON mb.branch_id = b.branch_id WHERE mb.member_id = ?`,
    [req.params.member_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Üyeden branş sil
app.delete('/api/member-branches/:branch_id', (req, res) => {
  const member_id = req.query.member_id;
  const branch_id = req.params.branch_id;
  if (!member_id || !branch_id) {
    return res.status(400).json({ error: 'member_id ve branch_id zorunludur.' });
  }
  db.run(
    `DELETE FROM Member_Sports_Branches WHERE member_id=? AND branch_id=?`,
    [member_id, branch_id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ deleted: this.changes });
    }
  );
});

// --- Membership_Packages ---
app.get('/api/packages', (req, res) => {
  db.all('SELECT * FROM Membership_Packages ORDER BY package_id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
app.post('/api/packages', (req, res) => {
  const { name, type, duration_days, num_classes, price } = req.body;
  if (!name || !type || !price) return res.status(400).json({ error: 'Ad, tür ve fiyat zorunludur.' });
  db.run(
    `INSERT INTO Membership_Packages (name, type, duration_days, num_classes, price) VALUES (?, ?, ?, ?, ?)`,
    [name, type, duration_days, num_classes, price],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ package_id: this.lastID });
    }
  );
});
app.put('/api/packages/:id', (req, res) => {
  const { name, type, duration_days, num_classes, price } = req.body;
  db.run(
    `UPDATE Membership_Packages SET name=?, type=?, duration_days=?, num_classes=?, price=? WHERE package_id=?`,
    [name, type, duration_days, num_classes, price, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: this.changes });
    }
  );
});
app.delete('/api/packages/:id', (req, res) => {
  db.run(
    `DELETE FROM Membership_Packages WHERE package_id=?`,
    [req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ deleted: this.changes });
    }
  );
});

// Üyeye atanmış paketi sil
app.delete('/api/member-packages/:id', (req, res) => {
  db.run(
    `DELETE FROM Member_Packages WHERE member_package_id=?`,
    [req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ deleted: this.changes });
    }
  );
});

// --- Member_Packages ---
app.post('/api/member-packages', (req, res) => {
  const { member_id, package_id, start_date, end_date, classes_remaining } = req.body;
  if (!member_id || !package_id) return res.status(400).json({ error: 'Üye ve paket zorunludur.' });
  db.run(
    `INSERT INTO Member_Packages (member_id, package_id, start_date, end_date, classes_remaining) VALUES (?, ?, ?, ?, ?)`,
    [member_id, package_id, start_date, end_date, classes_remaining],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ member_package_id: this.lastID });
    }
  );
});
app.get('/api/member-packages/:member_id', (req, res) => {
  db.all(
    `SELECT mp.*, p.name as package_name, p.type as package_type FROM Member_Packages mp JOIN Membership_Packages p ON mp.package_id = p.package_id WHERE mp.member_id = ?`,
    [req.params.member_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// --- SEED endpoint: örnek veri ekle ---
app.post('/api/seed', (req, res) => {
  db.serialize(() => {
    db.run(`INSERT INTO Sports_Branches (name, description) VALUES ('Yoga', 'Yoga dersleri'), ('Fitness', 'Fitness salonu'), ('Pilates', 'Pilates grubu')`);
    db.run(`INSERT INTO Membership_Packages (name, type, duration_days, num_classes, price) VALUES
      ('Aylık Sınırsız', 'duration', 30, NULL, 800),
      ('10 Derslik', 'class', NULL, 10, 600)`);
    db.run(`INSERT INTO Groups (name, description) VALUES ('Kadınlar Grubu', 'Kadın üyeler için'), ('Sabah Grubu', 'Sabah katılımcıları')`);
    db.run(`INSERT INTO Members (name, phone, email, address, date_of_birth, registration_date) VALUES
      ('Zeynep Korkmaz', '5552223344', 'zeynep@spor.com', 'Ankara', '1992-05-12', '2025-04-20'),
      ('Mehmet Yıldız', '5553334455', 'mehmet@spor.com', 'İzmir', '1988-03-08', '2025-04-20')`);
    db.run(`INSERT INTO Member_Groups (member_id, group_id) VALUES (1, 1), (2, 2)`);
    db.run(`INSERT INTO Member_Sports_Branches (member_id, branch_id) VALUES (1, 1), (1, 2), (2, 2)`);
    db.run(`INSERT INTO Member_Packages (member_id, package_id, start_date, end_date, classes_remaining) VALUES (1, 1, '2025-04-20', '2025-05-20', NULL), (2, 2, NULL, NULL, 10)`);
  });
  res.json({ status: 'Örnek veriler eklendi.' });
});

app.listen(PORT, () => {
  console.log(`Backend API http://localhost:${PORT} adresinde çalışıyor.`);
});
