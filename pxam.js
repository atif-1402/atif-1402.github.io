// pxam.js — atif@anom

// inject blinking cursor after prompt
document.addEventListener('DOMContentLoaded', () => {
  const prompt = document.querySelector('.prompt');
  if (prompt && !prompt.querySelector('.cursor')) {
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    prompt.appendChild(cursor);
  }
});