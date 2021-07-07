'use strict';

const headerCityButton = document.querySelector('.header__city-button');
const navigationLinks = document.querySelectorAll('.navigation__link');

let hash = location.hash.substring(1);

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

//Запрос базы данных
const getData = async () => {
  const data = await fetch('db.json');
  if (data.ok) {
    return data.json();
  } else {
    throw new Error(`Данные небыли получены, ошибка ${data.status} ${data.statusText}`);
  }
};

const getGoods = (callback, value) => {
  getData().then(data => {
    if (value) {
      callback(data.filter(item => item.category === value));
    } else {
      callback(data);
    }
  }).catch(err => {
    console.error(err);
  });
};

subheaderCart.addEventListener('click', cartModalOpen);

cartOverlay.addEventListener('click', event => {
  const target = event.target;
  if (target.matches('.cart__btn-close') || target.matches('.cart-overlay')) {
    cartModalClose();
  }
});

document.addEventListener('keydown', event => {
  if (event.code === 'Escape') {
    cartModalClose();
  }
});

try {
  const goodsTitle = document.querySelector('.goods__title');
  const goodsList = document.querySelector('.goods__list');

  if (!goodsList) {
    throw 'This is not a goods page!';
  }

  const createCard = ({
    id,
    preview,
    cost,
    brand,
    name,
    sizes,
  }) => {
    const li = document.createElement('li');
    li.classList.add('goods__item');
    /* eslint-disable indent */
    li.innerHTML = `
          <article class="good">
            <a class="good__link-img" href="card-good.html#${id}">
              <img class="good__img" src="goods-image/${preview}" alt="">
            </a>
            <div class="good__description">
              <p class="good__price">${cost} &#8381;</p>
              <h3 class="good__title">${brand} <span class="good__title__grey">/ ${name}</span></h3>
              ${sizes ?
                  `<p class="good__sizes">Размеры (RUS): <span class="good__sizes-list">${sizes.join(' ')}</span></p>` :
                ''}
              <a class="good__link" href="card-good.html#${id}">Подробнее</a>
            </div>
          </article>
    `;
    return li;
  };

  const renderGoodsList = data => {
    goodsList.textContent = '';
    for (const item of data) {
      const card = createCard(item);
      goodsList.append(card);
    }
    navigationLinks.forEach(item => {
      if (item.hash.substring(1) === hash) {
        goodsTitle.textContent = item.textContent;
      }
    });
  };

  getGoods(renderGoodsList, hash);

  window.addEventListener('hashchange', () => {
    hash = location.hash.substring(1);
    getGoods(renderGoodsList, hash);
  });

} catch (err) {
  console.warn(err);
}
