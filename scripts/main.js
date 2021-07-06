'use strict';

const headerCityButton = document.querySelector('.header__city-button');

headerCityButton.textContent = localStorage.getItem('lomoda-location') || 'Ваш город?';

headerCityButton.addEventListener('click', () => {
  const city = prompt('Укажите Ваш город:');
  if (city === null || city.trim() === '') {
    headerCityButton.textContent = 'Ваш город?';
  } else {
    headerCityButton.textContent = city;
    localStorage.setItem('lomoda-location', city);
  }
});

//Блокировка скролла
const disableScroll = () => {
  const widthScroll = window.innerWidth - document.body.offsetWidth;
  document.querySelector('header').style.width = '100vw';
  document.body.dbScrollY = window.scrollY;
  document.body.style.cssText = `
    position: fixed;
    top: ${-window.scrollY}px;
    left: 0;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    padding-right: ${widthScroll}px;
  `;
};

const enableScroll = () => {
  document.querySelector('header').style.width = '';
  document.body.style.cssText = '';
  window.scroll({
    top: document.body.dbScrollY,
  });
};

//Модальное окно
const subheaderCart = document.querySelector('.subheader__cart');
const cartOverlay = document.querySelector('.cart-overlay');

const cartModalOpen = () => {
  cartOverlay.classList.add('cart-overlay-open');
  disableScroll();
};

const cartModalClose = () => {
  cartOverlay.classList.remove('cart-overlay-open');
  enableScroll();
};

subheaderCart.addEventListener('click', cartModalOpen);

cartOverlay.addEventListener('click', event => {
  const target = event.target;
  if (target.matches('.cart__btn-close') || target.matches('.cart-overlay')) {
    cartModalClose();
  }
});

document.addEventListener('keydown', event => {
  if (event.code === 'Escape') cartModalClose();
});
