const body = document.body;
const header = document.querySelector('[data-header]');
const menu = document.querySelector('[data-menu]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const storyDialog = document.querySelector('[data-story-dialog]');
const searchPanel = document.querySelector('[data-search-panel]');

const updateHeader = () => header.classList.toggle('is-fixed', window.scrollY > 120);
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

menuToggle.addEventListener('click', () => {
  const open = !menu.classList.contains('is-open');
  menu.classList.toggle('is-open', open);
  body.classList.toggle('menu-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-hidden', String(!open));
});

menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menu.classList.remove('is-open');
  body.classList.remove('menu-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-hidden', 'true');
}));

document.querySelectorAll('[data-story-open]').forEach((button) => button.addEventListener('click', () => {
  storyDialog.showModal();
  body.classList.add('dialog-open');
}));

document.querySelector('[data-story-close]').addEventListener('click', () => {
  storyDialog.close();
  body.classList.remove('dialog-open');
});

storyDialog.addEventListener('click', (event) => {
  if (event.target === storyDialog) {
    storyDialog.close();
    body.classList.remove('dialog-open');
  }
});

document.querySelector('[data-search]').addEventListener('click', () => {
  searchPanel.classList.add('is-open');
  searchPanel.setAttribute('aria-hidden', 'false');
  searchPanel.querySelector('input').focus();
});

document.querySelector('[data-search-close]').addEventListener('click', () => {
  searchPanel.classList.remove('is-open');
  searchPanel.setAttribute('aria-hidden', 'true');
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -35px' });

document.querySelectorAll('.reveal:not(.hero .reveal)').forEach((element) => observer.observe(element));
