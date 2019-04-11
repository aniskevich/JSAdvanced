Vue.component('search-field', {
    props: [],
    template:`
        <input type="text" v-model="app.search">
    `
});

Vue.component('items-list', {
    props: ['filtered-catalog-data'],
    template:`
    <div class="itemsLayout">
        <product v-for="product in filteredCatalogData" :product="product"></product>
    </div>
    `
});

Vue.component('product', {
    props: ['product'],
    template: `
    <div class="item">
        <img :src="product.link">
        <div class="itemText">
            <h4>{{ product.name }}</h4>
            <h3>$ {{ product.price }}.00</h3>
        </div>
        <div class="fade">
            <button @click="app.addToCart" :id="product.id">Add to Cart</button>
        </div>
    </div>
    `
});

Vue.component('cart-list', {
    props: ['cart'], 
    template: `
    <div class="cartLayout">
        <div class="cartList" v-if="cart.length !== 0">
            <cart-item v-for="item in cart" :item="item"></cart-item>
            <div class="total">Total: $ {{ app.getTotal }}.00</div>
        </div>
        <div class="cartLayoutEmpty" v-if="cart.length === 0">
            Корзина пуста
        </div>
    </div>
    `
});

Vue.component('cart-item', {
    props: ['item'],
    template: `
    <div class="cartItem">
        <div class="details">
            <img :src="item.link">
            <article>
                <h4></h4>
                <p>
                    Color: {{ item.color }}<br>
                    Size: {{ item.size }}
                </p>
            </article>
        </div>
        <div>$ {{ item.price }}.00</div>
        <div>{{ item.quantity }} pcs.</div>
        <div>{{ item.shipping }}</div>
        <div>$ {{ item.subtotal }}.00</div>
        <div><button>X</button></div>
    </div>
    `
});

Vue.component('error', {
    props: ['response'],
    template: `
    <div class="error" v-if="response !== 200">Ошибка соединения с сервером</div>
    `
});

const app = new Vue({
    el: '#app',
    data: {
        mainNav: ['home', 'men', 'women', 'kids', 'accessoriese', 'featured', 'hot deals'],
        catalogData: [],
        cart: [],
        search: '',
        response: '',
    },
    methods: {
        addToCart: function(event) {
            if(this.cart.includes(this.catalogData[event.target.id - 1])) {
                for(item in this.cart) {
                    if(this.cart[item].id == (event.target.id)) {
                        this.cart[item].quantity++;
                        this.cart[item].subtotal = this.cart[item].price * this.cart[item].quantity;
                    }
                }
            }
            else {
                this.cart.push(this.catalogData[event.target.id - 1]);
                for(item in this.cart) {
                   if(this.cart[item].id == (event.target.id)) {
                        this.$set(this.cart[item], 'quantity', 1);
                        this.$set(this.cart[item], 'subtotal', this.cart[item].price);
                    }
                }
            }
        }
    },
    computed: {
        filteredCatalogData() {
            const regexp = new RegExp(this.search, 'i');
            return this.catalogData.filter((product) => regexp.test(product.name));
        },
        getTotal() {
            return this.cart.reduce((acc, product) => acc + product.subtotal, 0);
        }
    },
    mounted() {
        fetch('http://localhost:3000/catalogData')
            .then((response) => {
                this.response = response.status;
                response.json().then((catalogData) => {
                    this.catalogData = catalogData;
            })  
        });
    }
}); 