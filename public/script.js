class Item {
    constructor(name, price, link) {
        this.name = name;
        this.price = price;
        this.link = link;
    }
    addToCart() {

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
        return new Promise((resolve, reject) => {
            sendRequest('http://localhost:3000/catalogData.json').then((response) => {
                return this.items = JSON.parse(response).map(item => new Item(item.name, item.price, item.link));
            }).then(() => resolve(this.items));
        });        
    }
    render() {
        const itemsHtml = this.items.map(item => item.render());
        return document.querySelector('.itemsLayout').innerHTML = itemsHtml.join('');   
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
        return document.querySelector('.shopCart').innerHTML = itemsHtml.join('');
    }
    getItems() {
        return new Promise((resolve, reject) => {
            sendRequest('http://localhost:3000/getBasket.json').then((response) => {
                return this.items = JSON.parse(response).map(item => new ItemInCart(item.name, item.price, item.link, item.color, item.size, item.quantity, item.subtotal));
            }).then(() => resolve(this.items));
        }); 
    }
    getTotal() {
        return this.items.reduce((acc, item) => acc + item.subtotal, 0);
    }
    clearCart() {
        this.items = [];
    }
}

function sendRequest(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.send();
        xhr.onreadystatechange = () => {
            if(xhr.readyState === XMLHttpRequest.DONE) {
                if(xhr.status === 200) {
                    resolve(xhr.responseText);
                }
                else {
                    reject(alert(xhr.status));
                }
            }
        }
    }); 
}

function init() {
    const items = new ItemsList();
    items.getItems().then(()=>{items.render();});
    
    const $proceedToCartBtn = document.createElement('button');
    document.querySelector('.proceedToCartBtn').appendChild($proceedToCartBtn);
    $proceedToCartBtn.innerHTML = 'Proceed to Cart';

    const cartItems = new CartList();
    cartItems.getItems().then(() => {cartItems.render();});
}

window.onload = function() {init()};