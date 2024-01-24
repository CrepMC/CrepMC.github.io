function search() {
  var searchInput = document.getElementById("searchInput").value;
  var searchResultContainer = document.getElementById("searchResult");

  // Gọi hàm tìm kiếm thực tế ở đây
  var searchResult = performSearch(searchInput);

  // Hiển thị kết quả tìm kiếm
  searchResultContainer.innerHTML = "<p>Kết quả tìm kiếm:</p>" + searchResult;
}

function performSearch(keyword) {
  // Hàm tìm kiếm thực tế sẽ được triển khai ở đây
  // Trả về kết quả tìm kiếm dưới dạng HTML
  return "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>";
}
