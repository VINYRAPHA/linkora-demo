const MAX_BYTES = 50 * 1024 * 1024;
let media = [];
let currentStep = 1;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function saveCapsule() {
  const data = {
    title: $('#title').value,
    occasion: $('#occasion').value,
    intro: $('#intro').value,
    signature: $('#signature').value,
    theme: $('input[name="theme"]:checked').value
  };
  localStorage.setItem('linkora-capsule', JSON.stringify(data));
  $('#save-state').innerHTML = '<span></span> Enregistré sur cet appareil';
}

function loadCapsule() {
  const stored = localStorage.getItem('linkora-capsule');
  if (!stored) return;
  try {
    const data = JSON.parse(stored);
    $('#title').value = data.title || '';
    $('#occasion').value = data.occasion || 'Couple';
    $('#intro').value = data.intro || '';
    $('#signature').value = data.signature || '';
    const theme = $(`input[name="theme"][value="${data.theme || 'ivoire'}"]`);
    if (theme) theme.checked = true;
  } catch (_) {}
}

function showStep(step) {
  currentStep = Number(step);
  $$('.form-step').forEach((panel) => panel.classList.toggle('active', Number(panel.dataset.panel) === currentStep));
  $$('.step-link').forEach((link) => link.classList.toggle('active', Number(link.dataset.step) === currentStep));
  window.scrollTo({ top: 0, behavior: 'smooth' });
  saveCapsule();
}

function totalBytes() { return media.reduce((sum, item) => sum + item.file.size, 0); }

function addFiles(files, kind) {
  const additions = [...files].map((file) => ({ id: crypto.randomUUID(), file, kind, url: URL.createObjectURL(file) }));
  const incoming = additions.reduce((sum, item) => sum + item.file.size, 0);
  if (totalBytes() + incoming > MAX_BYTES) {
    additions.forEach((item) => URL.revokeObjectURL(item.url));
    alert('La limite gratuite de démonstration est de 50 Mo. Retirez un média ou choisissez un fichier plus léger.');
    return;
  }
  if (kind !== 'photo') media = media.filter((item) => item.kind !== kind);
  media.push(...additions);
  renderMedia();
}

function renderMedia() {
  const list = $('#media-list');
  if (!media.length) {
    list.innerHTML = '<div class="empty-media"><span>◇</span><p>Vos premiers souvenirs apparaîtront ici.</p></div>';
  } else {
    list.innerHTML = media.map((item) => {
      const content = item.kind === 'photo' ? `<img src="${item.url}" alt="Souvenir ajouté">` : item.kind === 'video' ? `<video src="${item.url}" muted></video>` : '<span>Message vocal</span>';
      return `<article class="media-item ${item.kind === 'audio' ? 'audio-item' : ''}" data-id="${item.id}">${content}<button type="button" aria-label="Supprimer">×</button></article>`;
    }).join('');
    list.querySelectorAll('.media-item button').forEach((button) => button.addEventListener('click', () => {
      const id = button.parentElement.dataset.id;
      const removed = media.find((item) => item.id === id);
      if (removed) URL.revokeObjectURL(removed.url);
      media = media.filter((item) => item.id !== id);
      renderMedia();
    }));
  }
  $('#usage-value').textContent = (totalBytes() / 1024 / 1024).toFixed(1);
}

function renderPreview() {
  $('#preview-title').textContent = $('#title').value || 'Une histoire à raconter';
  $('#preview-occasion').textContent = $('#occasion').value;
  $('#preview-intro').textContent = $('#intro').value || 'Les premiers mots de votre histoire apparaîtront ici.';
  $('#preview-signature').textContent = $('#signature').value;
  const preview = $('#full-preview');
  preview.className = `full-preview theme-${$('input[name="theme"]:checked').value}`;
  const container = $('#preview-memories');
  if (!media.length) {
    container.innerHTML = '<p class="preview-empty">Ajoutez une photo, une vidéo ou une voix pour donner vie à cette histoire.</p>';
  } else {
    container.innerHTML = media.map((item) => {
      if (item.kind === 'photo') return `<figure class="preview-media"><img src="${item.url}" alt="Un souvenir de la capsule"></figure>`;
      if (item.kind === 'video') return `<figure class="preview-media"><video src="${item.url}" controls></video></figure>`;
      return `<div class="preview-media audio-preview"><span>▶</span><div><strong>Un message à écouter</strong><br><small>${item.file.name}</small></div></div>`;
    }).join('');
  }
  $('#capsule-preview').showModal();
}

loadCapsule();
$$('.step-link').forEach((button) => button.addEventListener('click', () => showStep(button.dataset.step)));
$$('[data-next]').forEach((button) => button.addEventListener('click', () => showStep(button.dataset.next)));
$$('[data-back]').forEach((button) => button.addEventListener('click', () => showStep(button.dataset.back)));
['title', 'occasion', 'intro', 'signature'].forEach((id) => $(`#${id}`).addEventListener('input', () => {
  $('#save-state').textContent = 'Enregistrement…';
  clearTimeout(window.saveTimer);
  window.saveTimer = setTimeout(saveCapsule, 350);
}));
$('#intro').addEventListener('input', () => $('#intro-count').textContent = $('#intro').value.length);
$('#intro-count').textContent = $('#intro').value.length;
$$('input[name="theme"]').forEach((input) => input.addEventListener('change', () => {
  $$('.theme-option').forEach((option) => option.classList.toggle('selected', option.contains(input)));
  saveCapsule();
}));
const selectedTheme = $('input[name="theme"]:checked');
$$('.theme-option').forEach((option) => option.classList.toggle('selected', option.contains(selectedTheme)));
$('#photo-input').addEventListener('change', (event) => addFiles(event.target.files, 'photo'));
$('#video-input').addEventListener('change', (event) => addFiles(event.target.files, 'video'));
$('#audio-input').addEventListener('change', (event) => addFiles(event.target.files, 'audio'));
$('#preview-button').addEventListener('click', renderPreview);
$('#final-preview').addEventListener('click', renderPreview);
$('.preview-close').addEventListener('click', () => $('#capsule-preview').close());
$('#copy-link').addEventListener('click', async () => {
  await navigator.clipboard.writeText($('#capsule-url').textContent);
  $('#copy-link').textContent = 'Copié';
  setTimeout(() => $('#copy-link').textContent = 'Copier', 1500);
});
