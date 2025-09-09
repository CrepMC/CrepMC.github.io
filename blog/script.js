document.getElementById('publishButton').addEventListener('click', function () {
  const textContent = document.getElementById('inputText').value;
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];

  const publishedContentDiv = document.getElementById('publishedContent');
  const videoElement = document.getElementById('publishedVideo');

  // Check if there is any content to publish
  if (!textContent.trim() && !file) {
    alert('Vui lòng nhập văn bản hoặc chọn một video để xuất bản.');
    return;
  }

  // Publish text content
  if (textContent.trim()) {
    const formattedContent = textContent.replace(/\n/g, '<br>'); // Convert newlines to <br>
    publishedContentDiv.innerHTML = formattedContent;
  }

  // Publish video content
  if (file) {
    const objectUrl = URL.createObjectURL(file);
    videoElement.src = objectUrl;
    videoElement.style.display = 'block'; // Show the video tag after upload
  }
});
