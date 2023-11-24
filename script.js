setTimeout(function () {
  hideElement("hideLoadingbar");
  hideElement("hideLoadingicon");
  hideElement("hideLoadingbar2");
  hideElement("hideLoading");
  showElement("element2");
  showElement("wrapshow");
}, 3500);

document.addEventListener('contextmenu', function (e) {
  e.preventDefault();
});

document.addEventListener('copy', function (e) {
  e.preventDefault();
});

function hideElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = 'none';
  }
}

function showElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = 'block';
  }
}
