document.addEventListener('DOMContentLoaded', () => {
    const footer = document.createElement('footer');
    footer.className = 'text-center py-3';
    footer.textContent = `© ${new Date().getFullYear()} programmed by DIHOR`;
    document.body.appendChild(footer);
});
