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

// 刪除書籍
async function deleteBook(id) {
  await fetch(`/books/${id}`, { method: 'DELETE' });
  fetchBooks();
}

fetchBooks();
