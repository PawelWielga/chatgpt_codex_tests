document.addEventListener('DOMContentLoaded', () => {
  const footer = document.querySelector('footer');
  if (footer) {
    const info = document.createElement('div');
    info.className = 'small mt-2 d-flex flex-column align-items-center gap-2 badge-legend';
    info.innerHTML = `
      <span class="d-inline-flex align-items-center">
        <span class="badge text-bg-primary me-1"><i class="bi bi-cpu"></i></span>
        gra przeciw komputerowi
      </span>
      <span class="d-inline-flex align-items-center">
        <span class="badge text-bg-success me-1"><i class="bi bi-person"></i></span>
        gra jednoosobowa
      </span>
      <span class="d-inline-flex align-items-center">
        <span class="badge text-bg-warning me-1"><i class="bi bi-people"></i></span>
        gra dwuosobowa
      </span>
    `;
    footer.appendChild(info);
  }
});
