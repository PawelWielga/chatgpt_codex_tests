document.addEventListener('DOMContentLoaded', () => {
  const footer = document.querySelector('footer');
  if (footer) {
    const info = document.createElement('div');
    info.className = 'small mt-2';
    info.innerHTML = `
      <span class="badge text-bg-primary me-1"><i class="bi bi-cpu"></i></span> gra przeciw komputerowi
      <span class="badge text-bg-success ms-3 me-1"><i class="bi bi-person"></i></span> gra jednoosobowa
      <span class="badge text-bg-warning ms-3 me-1"><i class="bi bi-people"></i></span> gra dwuosobowa
    `;
    footer.appendChild(info);
  }
});
