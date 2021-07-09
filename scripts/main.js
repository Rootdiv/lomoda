'use strict';

const headerCityButton = document.querySelector('.header__city-button');
const subheaderCart = document.querySelector('.subheader__cart');
const cartOverlay = document.querySelector('.cart-overlay');
const navigationLinks = document.querySelectorAll('.navigation__link');
const cartListGoods = document.querySelector('.cart__list-goods');
const cartTotalCost = document.querySelector('.cart__total-cost');

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

const getLocalStorage = () => JSON.parse(localStorage.getItem('lomoda-cart')) || [];
const setLocalStorage = data => (localStorage.setItem('lomoda-cart', JSON.stringify(data)));

const declOfNum = (n, titles) => n + ' ' + titles[n % 10 === 1 && n % 100 !== 11 ?
  0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2];

const updateCountGoodsCart = () => {
  if (getLocalStorage().length) {
    subheaderCart.textContent = declOfNum(getLocalStorage().length, [' товар', ' товара', ' товаров']);
  } else {
    subheaderCart.textContent = 'Корзина';
  }
};

updateCountGoodsCart();

const renderCart = () => {
  let totalPrice = 0;
  cartListGoods.innerHTML = '<tr></tr>';
  const cartItems = getLocalStorage();
  cartItems.forEach((item, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
              <td>${i + 1}</td>
              <td>${item.brand} ${item.title}</td>
              ${item.color ? `<td>${item.color}</td>` : '<td>-</td>'}
              ${item.size ? `<td>${item.size}</td>` : '<td>-</td>'}
              <td>${item.cost} &#8381;</td>
              <td><button class="btn-delete" data-id="${item.id}">&times;</button></td>
    `;
    totalPrice += item.cost;
    cartListGoods.append(tr);
  });
  cartTotalCost.textContent = totalPrice + ' ₽';
};

const deleteItemCart = id => {
  const cartItems = getLocalStorage();
  const newCartItems = cartItems.filter(item => item.id !== id);
  setLocalStorage(newCartItems);
  updateCountGoodsCart();
};

//Блокировка скролла
const disableScroll = () => {
  if (document.disableScroll) return;
  document.disableScroll = true;
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
  document.disableScroll = false;
  document.querySelector('header').removeAttribute('style');
  document.body.removeAttribute('style');
  window.scroll({
    top: document.body.dbScrollY,
  });
};

//Модальное окно
const cartModalOpen = () => {
  cartOverlay.classList.add('cart-overlay-open');
  disableScroll();
  renderCart();
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

const getGoods = (callback, prop, value) => {
  getData().then(data => {
    if (value) {
      callback(data.filter(item => item[prop] === value));
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

cartListGoods.addEventListener('click', event => {
  if (event.target.matches('.btn-delete')) {
    deleteItemCart(event.target.dataset.id);
    renderCart();
  }
});

//Страница категорий
try {
  const goodsList = document.querySelector('.goods__list');

  if (!goodsList) {
    throw 'This is not a goods page!';
  }

  const goodsTitle = document.querySelector('.goods__title');
  // const updateTitle = () => {
  //   goodsTitle.textContent = document.querySelector(`[href*="#${hash}"]`).textContent;
  // };

  const createCard = ({
    id,
    preview,
    cost,
    brand,
    name: title,
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
              <h3 class="good__title">${brand} <span class="good__title__grey">/ ${title}</span></h3>
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

  getGoods(renderGoodsList, 'category', hash);

  window.addEventListener('hashchange', () => {
    hash = location.hash.substring(1);
    getGoods(renderGoodsList, 'category', hash);
  });

} catch (err) {
  console.warn(err);
}

//Страница товара
try {

  if (!document.querySelector('.card-good')) {
    throw 'This is not a card-good page!';
  }

  const cardGoodImage = document.querySelector('.card-good__image');
  const cardGoodBrand = document.querySelector('.card-good__brand');
  const cardGoodTitle = document.querySelector('.card-good__title');
  const cardGoodPrice = document.querySelector('.card-good__price');
  const cardGoodColor = document.querySelector('.card-good__color');
  const cardGoodSelectWrapper = document.querySelectorAll('.card-good__select__wrapper');
  const cardGoodColorList = document.querySelector('.card-good__color-list');
  const cardGoodSizes = document.querySelector('.card-good__sizes');
  const cardGoodSizesList = document.querySelector('.card-good__sizes-list');
  const cardGoodBuy = document.querySelector('.card-good__buy');

  const generateList = data => data.reduce((html, item, i) => html +
    `<li class="card-good__select-item" data-id="${i}">${item}</li>`, '');

  const renderCardGood = ([{
    id,
    photo,
    cost,
    brand,
    name: title,
    color,
    sizes,
  }]) => {

    const data = {
      id,
      brand,
      title,
      cost,
    };

    cardGoodImage.src = `goods-image/${photo}`;
    cardGoodImage.alt = `${brand} ${title}`;
    cardGoodBrand.textContent = brand;
    cardGoodTitle.textContent = title;
    cardGoodPrice.textContent = `${cost} ₽`;
    if (color) {
      cardGoodColor.textContent = color[0];
      cardGoodColor.dataset.id = 0;
      cardGoodColorList.innerHTML = generateList(color);
    } else {
      cardGoodColor.style.display = 'none';
    }
    if (sizes) {
      cardGoodSizes.textContent = sizes[0];
      cardGoodSizes.dataset.id = 0;
      cardGoodSizesList.innerHTML = generateList(sizes);
    } else {
      cardGoodSizes.style.display = 'none';
    }

    const addCart = () => {
      cardGoodBuy.classList.add('delete');
      cardGoodBuy.textContent = 'Удалить из корзины';
      updateCountGoodsCart();
    };

    if (getLocalStorage().some(item => item.id === id)) addCart();

    cardGoodBuy.addEventListener('click', () => {
      if (cardGoodBuy.classList.contains('delete')) {
        deleteItemCart(id);
        cardGoodBuy.classList.remove('delete');
        cardGoodBuy.textContent = 'Добавить в корзину';
        return;
      }
      if (color) data.color = cardGoodColor.textContent;
      if (sizes) data.size = cardGoodSizes.textContent;
      const cardData = getLocalStorage();
      cardData.push(data);
      setLocalStorage(cardData);
      addCart();
    });
  };

  cardGoodSelectWrapper.forEach(item => {
    item.addEventListener('click', event => {
      const target = event.target;
      if (target.closest('.card-good__select')) {
        target.classList.toggle('card-good__select__open');
      }
      if (target.closest('.card-good__select-item')) {
        const cardGoodSelect = item.querySelector('.card-good__select');
        cardGoodSelect.textContent = target.textContent;
        cardGoodSelect.dataset.id = target.dataset.id;
        cardGoodSelect.classList.remove('card-good__select__open');
      }
    });
  });

  getGoods(renderCardGood, 'id', hash);

} catch (error) {
  console.warn(error);
}
