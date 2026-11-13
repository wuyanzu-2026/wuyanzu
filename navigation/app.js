// Each project button controls only its own date-version panel.
const projectButtons = document.querySelectorAll('.project-toggle');

projectButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const panelId = button.getAttribute('aria-controls');
    const panel = document.getElementById(panelId);
    const isExpanded = button.getAttribute('aria-expanded') === 'true';

    if (!panel) return;

    button.setAttribute('aria-expanded', String(!isExpanded));
    panel.hidden = isExpanded;
  });
});
