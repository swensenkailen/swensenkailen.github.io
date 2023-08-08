window.onload = function() {
  const slider = document.querySelector('.wrapper4');
  let isDown = false;
  let startX;
  let prevX = 0;

  slider.addEventListener('pointerdown', (e) => {
    isDown = true;
    startX = e.pageX - slider.offsetLeft;
    prevX = e.pageX;
    e.preventDefault();
  });

  slider.addEventListener('pointerleave', () => {
    isDown = false;
  });

  slider.addEventListener('pointerup', () => {
    isDown = false;
  });

  slider.addEventListener('pointermove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const scrollDistance = x - startX;
    const scrollDirection = (scrollDistance < 0) ? 1 : -1;
    const scrollAmount = Math.abs(scrollDistance);

    slider.scrollBy({
      left: scrollDirection * scrollAmount,
      behavior: 'smooth'
    });

    prevX = e.pageX;
  });
};