const items = [
   {name: 'Coat', price: 500, link: 'images/product1.jpg'},
   {name: 'Jacket', price: 300, link: 'images/product2.jpg'},
   {name: 'Coat', price: 200, link: 'images/product3.jpg'},
   {name: 'T-Shirt', price: 150, link: 'images/product4.jpg'},
];
const renderItem = ({name, price, link}) => `<div class="item"><img src="${link}"><div class="itemText"><h4>${name}</h4><h3>$${price}.00</h3></div><div class="fade"><button>Add to Cart</button></div></div>`;

const renderItemsLayout = (items = []) => {
    if (items.length === 0) {
        document.querySelector('.itemsLayout').innerHTML = 'Нет связи с сервером';
    }
    else {
        const itemsHtml = items.map(renderItem);
        document.querySelector('.itemsLayout').innerHTML = itemsHtml.join('');
        const $proceedToCartBtn = document.createElement('button');
        $proceedToCartBtn.innerHTML = 'Proceed to Cart';
        document.querySelector('.proceedToCartBtn').appendChild($proceedToCartBtn);
    }
}

function init() {
    renderItemsLayout(items);
}

window.onload = function() {init()};