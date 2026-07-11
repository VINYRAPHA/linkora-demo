const dialog = document.querySelector('#demo');
document.querySelectorAll('[data-open-demo]').forEach((button) => {
  button.addEventListener('click', () => dialog.showModal());
});
dialog.querySelectorAll('.close, .close-bottom').forEach((button) => {
  button.addEventListener('click', () => dialog.close());
});
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});
