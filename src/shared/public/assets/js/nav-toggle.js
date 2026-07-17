(() => {
  const nav = document.querySelector('.js-primary-nav');
  if (!nav) return;

  const toggle = nav.querySelector('.js-nav-toggle');
  const content = nav.querySelector('.nav__content');
  if (!toggle || !content) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('nav--is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
})();
