async function addBook() {
  const book = {
    title: document.getElementById('title').value,
    category: document.getElementById('category').value,
    author: document.getElementById('author').value,
    publisher: document.getElementById('publisher').value,
    format: document.getElementById('format').value,
    location: document.getElementById('location').value,
    volume: document.getElementById('volume').value,
    owner: document.getElementById('owner').value,
    note: ''
  };

  await fetch('/books', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(book)
  });

  // 新增後跳回主頁
  window.location.href = 'index.html';
}
