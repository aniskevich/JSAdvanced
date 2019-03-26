class Item {
    constructor(name, price, link) {
        this.name = name;
        this.price = price;
        this.link = link;
    }
    render() {
        return `<div class="item"><img src="${this.link}"><div class="itemText"><h4>${this.name}</h4>
        <h3>$${this.price}.00</h3></div><div class="fade"><button>Add to Cart</button></div></div>`;
    }
}

class ItemsList {
    constructor() {
        this.items = [];
    }
    getItems() {
        this.items = [
            {name: 'Coat', price: 500, link: 'images/product1.jpg'},
            {name: 'Jacket', price: 300, link: 'images/product2.jpg'},
            {name: 'Coat', price: 200, link: 'images/product3.jpg'},
            {name: 'T-Shirt', price: 150, link: 'images/product4.jpg'},
        ];
        this.items = this.items.map(item => new Item(item.name, item.price, item.link));
    }
    render() {
        const itemsHtml = this.items.map(item => item.render());
        return itemsHtml.join('');
    }
}

class ItemInCart {
    constructor(name, price, link, color, size, quantity, subtotal) {
        this.link = link;
        this.name = name;
        this.color = color;
        this.size = size;
        this.price = price;
        this.quantity = quantity;
        this.subtotal = subtotal;
    }
    render() {
        this.getSubTotal(this.price, this.quantity);
        return `<div><span>${this.name}</span><span>${this.price}</span><span>${this.link}</span>
        <span>${this.color}</span><span>${this.size}</span><span>${this.quantity}</span><span>${this.subtotal}</span></div>`;
    }
    getSubTotal(price, quantity) {
        return this.subtotal = price * quantity;
    }
    removeOne(quantity) {
        //доделать удаление единицы товара
    }
}

class CartList {
    constructor() {
        this.items = [];
    }
    render() {
        const itemsHtml = this.items.map(item => item.render());
        return itemsHtml.join('');
    }
    getItems() {
        this.items = [
            {name: 'Coat', price: 500, link: 'images/product1.jpg', color: 'red', size: 'L', quantity: 3, subtotal: 0},
            {name: 'Jacket', price: 300, link: 'images/product2.jpg', color: 'red', size: 'L', quantity: 2, subtotal: 0},
            {name: 'Coat', price: 200, link: 'images/product3.jpg', color: 'red', size: 'L', quantity: 1, subtotal: 0},
            {name: 'T-Shirt', price: 150, link: 'images/product4.jpg', color: 'red', size: 'L', quantity: 2, subtotal: 0},
        ];
        this.items = this.items.map(item => new ItemInCart(item.name, item.price, item.link, item.color, item.size, item.quantity, item.subtotal));
    }
    getTotal() {
        return this.items.reduce((acc, item) => acc + item.subtotal, 0);
    }
    clearCart() {
        this.items = [];
    }
}

function init() {
    const items = new ItemsList();
    items.getItems();
    document.querySelector('.itemsLayout').innerHTML = items.render();
    const $proceedToCartBtn = document.createElement('button');
    document.querySelector('.proceedToCartBtn').appendChild($proceedToCartBtn);
    $proceedToCartBtn.innerHTML = 'Proceed to Cart';

    const cartItems = new CartList();
    cartItems.getItems();
    document.querySelector('.shopCart').innerHTML = cartItems.render(); 
}

window.onload = function() {init()};