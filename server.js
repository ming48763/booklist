// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database'); // 確保 database.js 已經建立

const app = express();
const PORT = 3000;

// 中間件
app.use(cors());
app.use(bodyParser.json());

// 提供 public 資料夾的靜態檔案
app.use(express.static('public'));

// ===== /books API =====

// 取得所有書籍
app.get('/books', (req, res) => {
  db.all("SELECT * FROM books", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 新增書籍
app.post('/books', (req, res) => {
  const { title, category, author, publisher, format, location, volume, owner, note } = req.body;
  
  if (!title || !owner) {
    return res.status(400).json({ error: '書名與擁有者必填' });
  }

  const stmt = db.prepare(`
    INSERT INTO books (title, category, author, publisher, format, location, volume, owner, note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run([title, category, author, publisher, format, location, volume, owner, note], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

// 刪除書籍
app.delete('/books/:id', (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM books WHERE id = ?", [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ changes: this.changes });
  });
});

// （可選）根路徑提示
app.get('/', (req, res) => {
  res.send('書籍管理 API 正在運行，請使用 /books API 或前端頁面');
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: 'booklist-470015-b075c39ed522.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});
const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = '1eZRmOGe0aOvhN3fvyqm6OLQVOHPXGBlsIHoQqF5iFkM';
const RANGE = '漫畫!A2:H1000'; // 從第二列開始，假設第一列是標題

app.post('/sync-db', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) return res.json({ message: 'Sheet沒有資料' });

    // 先清空原本資料
    db.run("DELETE FROM books", err => {
      if (err) return res.status(500).json({ error: err.message });

      const stmt = db.prepare(`INSERT INTO books (title, category, author, publisher, format, location, volume, owner) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
      rows.forEach(r => {
        stmt.run(r, err => {
          if (err) console.log('DB insert error:', err.message);
        });
      });
      stmt.finalize();

      res.json({ message: '資料庫已更新完成' });
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});