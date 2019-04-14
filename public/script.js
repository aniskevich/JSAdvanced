const API_URL = 'http://localhost:3000';

Vue.component('search-field', {
    template: `
        <form class="search col-lg-4 col-md-5" @submit.prevent>
            <div class="searchBrowse">
                Browse <i class="fas fa-caret-down"></i>
            </div>
            <input placeholder="Search for Item..." type="text" v-model="search">
            <button @click="handleSearchClick">
                <i class="fas fa-search"></i>
            </button>
        </form>
    `,
    data() {
        return {
            search: '',
        };
    },
    methods: {
        handleSearchClick() {
            this.$emit('searchclick', this.search);
        }
    }
});

Vue.component('items-list', {
    props: ['query'],
    data() {
        return {
            catalogData: [],
        };
    },
    template: `
    <div class="row itemsLayout container">
        <product @buyClick="addToCart" v-for="product in filteredCatalogData" :product="product"></product>
    </div>
    `,
    methods: {
        addToCart(product) {
            this.$emit('buyclick', product);
        }
    },
    computed: {
        filteredCatalogData() {
            const regexp = new RegExp(this.query, 'i');
            return this.catalogData.filter((product) => regexp.test(product.name));
        },
    },
    mounted() {
        fetch(`${API_URL}/catalog`)
            .then((response) =>
                response.json()
            )
            .then((catalogData) => {
                this.catalogData = catalogData;
            });
    }
});

Vue.component('product', {
    props: ['product'],
    template: `
    <div class="col-md-3">
        <div class="card product">
            <img :src="product.link" class="card-img-top">
            <div class="card-body">
                <h4 class="card-text">{{ product.name }}</h4>
                <h3 class="card-text">$ {{ product.price }}.00</h3>
            </div>
            <div class="buyFade">
                <button @click="addToCart(product)">Add to Cart</button>
            </div>
        </div>
    </div>
    `,
    methods: {
        addToCart(product) {
            this.$emit('buyClick', product);
        }
    }
});

Vue.component('cart-list', {
    props: ['cart', 'total'],
    template: `
    <div class="shoppingCart">
        <div class="container">
            <div class="row shopCartHeading" v-if="cart.length !== 0">
                <div class="col-md-4 details">PRODUCT DETAILS</div>
                <div class="col-md-2">UNIT PRICE</div>
                <div class="col-md-2">QUANTITY</div>
                <div class="col-md-1">SHIPPING</div>
                <div class="col-md-2">SUBTOTAL</div>
                <div class="col-md-1">ACTION</div>
            </div>
            <cart-product @deleteClick="deleteFromCart" v-for="product in cart" :product="product"></cart-product>
            <div class="total" v-if="cart.length !== 0">Total: $ {{ total }}.00</div>
            <div class="cartLayoutEmpty" v-if="cart.length === 0">
                Корзина пуста
            </div>
        </div>
    </div>
    `,
    methods: {
        deleteFromCart(product) {
            this.$emit('deleteclick', product);
        }
    },
});

Vue.component('cart-product', {
    props: ['product'],
    template: `
    <div class="row shopCartProduct">
        <div class="col-md-4 article">
            <img :src="product.link">
            <article>
                <h4> {{ product.name }} </h4>
                <p>
                    Color: {{ product.color }}<br>
                    Size: {{ product.size }}
                </p>
            </article>
        </div>
        <div class="col-md-2">$ {{ product.price }}.00</div>
        <div class="col-md-2">{{ product.quantity }} pcs.</div>
        <div class="col-md-1">{{ product.shipping }}</div>
        <div class="col-md-2">$ {{ product.subtotal }}.00</div>
        <div class="col-md-1"><button @click="deleteFromCart(product)">X</button></div>
    </div>
    `,
    methods: {
        deleteFromCart(product) {
            this.$emit('deleteClick', product);
        }
    }
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
        cart: [],
        search: '',
        response: '',
        total: 0,
    },
    mounted() {
        fetch(`${API_URL}/cart`)
            .then((response) => {
                this.response = response.status;
                return response.json();
            })
            .then((result) => {
                this.cart = result.products;
                this.total = result.total;
            });
    },
    methods: {
        handleSearch(query) {
            this.search = query;
        },
        addToCart(product) {
            const cartItem = this.cart.find(cartItem => cartItem.id === product.id);
            if (cartItem) {
                fetch(`${API_URL}/cart/${product.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ quantity: ++cartItem.quantity, subtotal: cartItem.price * cartItem.quantity })
                })
                    .then((response) => response.json())
                    .then((result) => {
                        const itemIdx = this.cart.findIndex(cartItem => cartItem.id === product.id);
                        Vue.set(this.cart, itemIdx, result.product);
                        this.total = result.total;
                    });
            }
            else {
                fetch(`${API_URL}/cart`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...product, quantity: 1, subtotal: product.price }),
                })
                    .then((response) => response.json())
                    .then((result) => {
                        this.cart.push(result.product);
                        this.total = result.total;
                    });
            }
        },
        deleteFromCart(product) {
            if (product.quantity > 1) {
                fetch(`${API_URL}/cart/${product.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ quantity: --product.quantity, subtotal: product.price * product.quantity })
                }).then((response) => response.json())
                    .then((result) => {
                        const itemIdx = this.cart.findIndex(cartItem => cartItem.id === product.id);
                        Vue.set(this.cart, itemIdx, result.product);
                        this.total = result.total;
                    });
            } else {
                fetch(`${API_URL}/cart/${product.id}`, {
                    method: 'DELETE',
                }).then((response) => response.json())
                    .then((result) => {
                        this.cart = this.cart.filter((cartItem) => cartItem.id !== product.id);
                        this.total = result.total;
                    });
            }
        }
    }
});