async function search() {
  const searchInput = document
    .getElementById('searchInput')
    .value.toLowerCase();
  const searchResultContainer = document.getElementById('searchResult');

  if (!searchInput) {
    searchResultContainer.innerHTML =
      '<p>Vui lòng nhập từ khóa để tìm kiếm.</p>';
    return;
  }

  searchResultContainer.innerHTML = '<p>Đang tìm kiếm...</p>';

  try {
    // In a real application, you would search a database or an index.
    // For this example, we'll fetch the blog content and search within it.
    const response = await fetch('../blog/index.html');
    const blogHtml = await response.text();

    // This is a very simple search.
    // A more robust solution would parse the HTML more carefully.
    const parser = new DOMParser();
    const doc = parser.parseFromString(blogHtml, 'text/html');

    // This is a mock search within the blog's content.
    // Let's pretend blog posts are in divs with a specific class.
    // Since there isn't a clear structure, we'll search the whole body for now.
    const contentToSearch = doc.body.innerText.toLowerCase();

    if (contentToSearch.includes(searchInput)) {
      // Found a match. In a real scenario, you'd link to the post.
      searchResultContainer.innerHTML = `
            <p>Kết quả tìm kiếm cho: "${searchInput}"</p>
            <ul>
                <li><a href="/blog/">Tìm thấy nội dung phù hợp trong Blog.</a></li>
            </ul>`;
    } else {
      searchResultContainer.innerHTML = `<p>Không tìm thấy kết quả nào cho "${searchInput}".</p>`;
    }
  } catch (error) {
    console.error('Search failed:', error);
    searchResultContainer.innerHTML =
      '<p>Đã có lỗi xảy ra trong quá trình tìm kiếm.</p>';
  }
}
