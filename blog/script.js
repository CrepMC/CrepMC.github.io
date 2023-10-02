document.getElementById('publishButton').addEventListener('click', function() {
    var content = document.getElementById('inputText').value;
    content = content.replace(/\n/g, '<br>'); // Chuyển đổi xuống dòng thành <br>
    document.getElementById('publishedContent').innerHTML = content;
});
document.getElementById('uploadButton').addEventListener('click', function () {
    var fileInput = document.getElementById('fileInput');
    var file = fileInput.files[0];

    if (file) {
        var videoElement = document.getElementById('publishedVideo');
        var objectUrl = URL.createObjectURL(file);

        videoElement.src = objectUrl;
        videoElement.style.display = "block"; // Hiển thị thẻ video sau khi tải lên
    } else {
        alert("Vui lòng chọn một video trước khi xuất bản.");
    }
});
