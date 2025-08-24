const { google } = require('googleapis');
const db = require('./database');  // SQLite

const auth = new google.auth.GoogleAuth({
  keyFile: 'booklist-470015-b075c39ed522.json',       // 下載的服務帳號金鑰
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = '1eZRmOGe0aOvhN3fvyqm6OLQVOHPXGBlsIHoQqF5iFkM';
const RANGE = '漫畫!A2:I';  // A-I，包含 note 欄位

async function syncBooksFromSheet() {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const rows = res.data.values;
    if (!rows || rows.length === 0) return console.log('No data found');

    rows.forEach(row => {
      const [
        title,
        category,
        author,
        publisher,
        format,
        location,
        volume,
        owner,
        note
      ] = row;

      if (!title || !owner) return; // 必填欄位檢查

      // 避免重複插入：可依 title + owner 檢查
      db.get(
        "SELECT id FROM books WHERE title = ? AND owner = ?",
        [title, owner],
        (err, existing) => {
          if (err) return console.log('DB select error:', err.message);
          if (existing) return; // 已存在，不插入

          const stmt = db.prepare(`
            INSERT INTO books (title, category, author, publisher, format, location, volume, owner, note)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          stmt.run(
            [title, category, author, publisher, format, location, volume, owner, note],
            err => {
              if (err) console.log('DB insert error:', err.message);
            }
          );
        }
      );
    });

    console.log('同步完成！');
  } catch (error) {
    console.error('Google Sheets API error:', error.message);
  }
}

syncBooksFromSheet();
