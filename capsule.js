const client = window.supabase.createClient(window.LINKORA_SUPABASE.url, window.LINKORA_SUPABASE.publishableKey);
const slug = new URLSearchParams(window.location.search).get('slug');
const page = document.querySelector('#public-capsule');
const memories = document.querySelector('#public-memories');

function showError(message) {
  document.querySelector('#public-title').textContent = 'Cette histoire est introuvable';
  document.querySelector('#public-intro').textContent = message;
  memories.innerHTML = '';
}

async function loadCapsule() {
  if (!slug) return showError('Aucune capsule n’est associée à cette adresse.');
  const { data, error } = await client.rpc('get_published_capsule', { requested_slug: slug });
  if (error || !data) return showError('Vérifiez l’adresse ou demandez un nouveau lien.');
  document.title = `${data.title} — Linkora`;
  page.className = `full-preview theme-${data.theme} public-capsule`;
  document.querySelector('#public-title').textContent = data.title;
  document.querySelector('#public-occasion').textContent = data.occasion;
  document.querySelector('#public-intro').textContent = data.intro;
  document.querySelector('#public-signature').textContent = data.signature;
  if (!data.media?.length) {
    memories.innerHTML = '<p class="preview-empty">Cette histoire commence par quelques mots précieux.</p>';
    return;
  }
  memories.innerHTML = data.media.map((item) => {
    const { data: urlData } = client.storage.from('capsule-media').getPublicUrl(item.storage_path);
    const url = urlData.publicUrl;
    if (item.kind === 'photo') return `<figure class="preview-media"><img src="${url}" alt="Un souvenir de cette histoire" loading="lazy"></figure>`;
    if (item.kind === 'video') return `<figure class="preview-media"><video src="${url}" controls playsinline></video></figure>`;
    return `<div class="preview-media audio-preview"><audio src="${url}" controls></audio><span>Un message à écouter</span></div>`;
  }).join('');
}

loadCapsule();
