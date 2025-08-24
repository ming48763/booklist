let allBooks = [];

// 取得書籍
async function fetchBooks() {
  const res = await fetch('/books');
  allBooks = await res.json();
  updateSecondFilter();
  renderBooks(allBooks);
}

// 渲染表格
function renderBooks(books) {
  const tbody = document.querySelector('#book-table tbody');
  tbody.innerHTML = '';
  books.forEach(b => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${b.title}</td>
      <td>${b.category || ''}</td>
      <td>${b.author || ''}</td>
      <td>${b.publisher || ''}</td>
      <td>${b.format || ''}</td>
      <td>${b.location || ''}</td>
      <td>${b.volume || ''}</td>
      <td>${b.owner || ''}</td>
      <td><button onclick="deleteBook(${b.id})">刪除</button></td>
    `;
    tbody.appendChild(tr);
  });
}

// 更新第二個下拉選單
function updateSecondFilter() {
  const column = document.getElementById('filter-column').value;
  const valueSelect = document.getElementById('filter-value');

  if (!column) {
    valueSelect.innerHTML = `<option value="">全部</option>`;
    return;
  }

  const values = new Set();
  allBooks.forEach(b => {
    if (b[column]) values.add(b[column]);
  });

  valueSelect.innerHTML = `<option value="">全部</option>`;
  Array.from(values).sort().forEach(v => {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = v;
    valueSelect.appendChild(opt);
  });
}

// 篩選
function applyFilter() {
  const column = document.getElementById('filter-column').value;
  const value = document.getElementById('filter-value').value;
  const searchText = document.getElementById('search-box').value.toLowerCase();

  const filtered = allBooks.filter(b => {
    const matchesSearch = !searchText || b.title.toLowerCase().includes(searchText);
    const matchesColumn = !column || !value || b[column] === value;
    return matchesSearch && matchesColumn;
  });

  renderBooks(filtered);
}

//完結判定
function applyFilter() {
  const column = document.getElementById('filter-column').value;
  const value = document.getElementById('filter-value').value;
  const searchText = document.getElementById('search-box').value.toLowerCase();
  const finishedOnly = document.getElementById('finished-checkbox').checked;

  const filtered = allBooks.filter(b => {
    const matchesSearch = !searchText || b.title.toLowerCase().includes(searchText);
    const matchesColumn = !column || !value || b[column] === value;
    const matchesFinished = !finishedOnly || (b.volume && b.volume.includes('(完)'));
    return matchesSearch && matchesColumn && matchesFinished;
  });

  renderBooks(filtered);
}

// 刪除書籍
async function deleteBook(id) {
  await fetch(`/books/${id}`, { method: 'DELETE' });
  fetchBooks();
}

async function syncDB() {
  const res = await fetch('/sync-db', { method: 'POST' });
  const data = await res.json();
  alert(data.message || '同步完成');
  fetchBooks(); // 同步後重新抓資料更新表格
}

let editMode = false; // 是否編輯模式

function toggleEditMode() {
  editMode = !editMode;
  document.getElementById('edit-toggle').textContent = editMode ? '結束編輯模式' : '切換編輯模式';
  renderBooks(currentFilteredBooks); // 重新渲染表格，顯示或隱藏刪除按鈕
}

function goToAddPage() {
  window.location.href = 'add.html';
}

function renderBooks(books) {
  currentFilteredBooks = books; // 儲存目前篩選後的書籍
  const tbody = document.querySelector('#book-table tbody');
  tbody.innerHTML = '';
  books.forEach(b => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${b.title}</td>
      <td>${b.category || ''}</td>
      <td>${b.author || ''}</td>
      <td>${b.publisher || ''}</td>
      <td>${b.format || ''}</td>
      <td>${b.location || ''}</td>
      <td>${b.volume || ''}</td>
      <td>${b.owner || ''}</td>
      <td>
        ${editMode ? `<button onclick="deleteBook(${b.id})">刪除</button>` : ''}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// 其他篩選、新增、刪除函式保持不變

fetchBooks();
