let allBooks = []; // 儲存所有書籍資料

async function fetchBooks() {
  const res = await fetch('/books');
  const books = await res.json();
  allBooks = books;
  populateFilters(); // 更新篩選選項
  renderBooks(books); // 顯示書籍
}

// 顯示書籍表格
function renderBooks(books) {
  const tbody = document.querySelector('#book-table tbody');
  tbody.innerHTML = '';
  books.forEach(book => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${book.title}</td>
      <td>${book.category || ''}</td>
      <td>${book.author || ''}</td>
      <td>${book.publisher || ''}</td>
      <td>${book.format || ''}</td>
      <td>${book.location || ''}</td>
      <td>${book.volume || ''}</td>
      <td>${book.owner || ''}</td>
      <td>${book.note || ''}</td>
      <td><button onclick="deleteBook(${book.id})">刪除</button></td>
    `;
    tbody.appendChild(tr);
  });
}

// 填充篩選選項
function populateFilters() {
  const categorySet = new Set();
  const authorSet = new Set();
  const ownerSet = new Set();

  allBooks.forEach(b => {
    if(b.category) categorySet.add(b.category);
    if(b.author) authorSet.add(b.author);
    if(b.owner) ownerSet.add(b.owner);
  });

  fillSelect('filter-category', categorySet);
  fillSelect('filter-author', authorSet);
  fillSelect('filter-owner', ownerSet);
}

function fillSelect(selectId, itemsSet) {
  const select = document.getElementById(selectId);
  select.innerHTML = `<option value="">全部</option>`;
  Array.from(itemsSet).sort().forEach(item => {
    const opt = document.createElement('option');
    opt.value = item;
    opt.textContent = item;
    select.appendChild(opt);
  });
}

// 篩選函式
function applyFilter() {
  const category = document.getElementById('filter-category').value;
  const author = document.getElementById('filter-author').value;
  const owner = document.getElementById('filter-owner').value;

  const filtered = allBooks.filter(b => {
    return (!category || b.category === category) &&
           (!author || b.author === author) &&
           (!owner || b.owner === owner);
  });

  renderBooks(filtered);
}

fetchBooks();
