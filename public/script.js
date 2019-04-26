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

Vue.component('account', {
    template: `
    <div class="account col-lg-3 offset-lg-2 col-md-3">
        <a href="http://localhost:3000/shoppingcart.html"><img class="" src="images/cart.png" alt="cart"></a>
        
        <button id="myAcc" type="button" class="myAcc btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            My Account
        </button>
            <div class="dropdown-menu" aria-labelledby="myAcc" v-if="!app.isLogin">
                <a class="dropdown-item" @click="$('#loginModal').modal('show')">Log In</a>
                <a class="dropdown-item" @click="$('#registerModal').modal('show')">Register</a>
            </div>
            <div class="dropdown-menu" aria-labelledby="myAcc" v-if="app.isLogin">
                <a class="dropdown-item" href="#">Cabinet</a>
                <a class="dropdown-item" @click="handleLogout">Log Out</a>
            </div>
            <modalLogin @handleLogin="handleLogin" :user="{}"></modalLogin>
            <modalRegister @handleRegister="handleRegister" :user="{}"></modalRegister>
    </div>
    `,
    methods: {
        handleLogin(user) {
            this.$emit('handlelogin', user);
        },
        handleRegister(user) {
            this.$emit('handleregister', user);
        },
        handleLogout() {
            this.$emit('handlelogout');
        }
    }
});

Vue.component('modalLogin', {
    props: ['user'],
    template: `
    <div class="modal fade" id="loginModal" tabindex="-1" role="dialog" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <h4>EMAIL ADDRESS<span> *</span></h4>
            <input type="email" v-model="user.login">
            <h4>PASSWORD<span> *</span></h4>
            <input type="password" v-model="user.password">
            <p>* Required Fields</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" @click="handleLogin(user)" @click="$('#loginModal').modal('hide')">Log In</button>
          </div>
        </div>
      </div>
    </div>
    `,
    methods: {
        handleLogin(user) {
            this.$emit('handleLogin', user);
            this.user = [];
        }
    }
});

Vue.component('modalRegister', {
    props: ['user'],
    template: `
    <div class="modal fade" id="registerModal" tabindex="-1" role="dialog" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <h4>EMAIL ADDRESS<span> *</span></h4>
            <input type="email" v-model="user.login">
            <h4>PASSWORD<span> *</span></h4>
            <input type="password" v-model="user.password">
            <p>* Required Fields</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" @click="handleRegister(user)" @click="$('#registerModal').modal('hide')">Register</button>
          </div>
        </div>
      </div>
    </div>
    `,
    methods: {
        handleRegister(user) {
            this.$emit('handleRegister', user);
            this.user = [];
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
    <div>
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
                CART IS EMPTY
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
        <div class="col-md-1"><i class="fas fa-times-circle" @click="deleteFromCart(product)"></i></div>
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

Vue.component('copy', {
    template: `
    <div class="copy">
        <div class="container">
            <div class="row">
                <div>
                    &copy; 2019 Brand All Rights Reserved.
                </div>
                <div>
                    <a href="#"><img src="images/facebook.png" alt="facebook"></a>
                    <a href="#"><img src="images/twitter.png" alt="twitter"></a>
                    <a href="#"><img src="images/linkedin.png" alt="linkedin"></a>
                    <a href="#"><img src="images/pinterest.png" alt="pinterest"></a>
                    <a href="#"><img src="images/googleplus.png" alt="google"></a>
                </div>
            </div>
        </div>
    </div>
    `
});

Vue.component('foot', {
    template: `
    <footer>
    <div class="container">
        <div class="row">
            <div class="col-xl-5 col-md-12 information">
                <div class="logo">
                    BRAN<span>D</span>
                </div>
                <p>
                    Objectively transition extensive data rather than cross functional solutions.
                    Monotonectally
                    syndicate multidisciplinary materials before go forward benefits. Intrinsicly syndicate an
                    expanded array of processes and cross-unit partnerships.
                </p>
                <p>
                    Efficiently plagiarize 24/365 action items and focused infomediaries.
                    Distinctively seize superior initiatives for wireless technologies. Dynamically optimize.
                </p>
            </div>
            <div class="col-xl-2 offset-xl-1 col-md-4 links">
                <h4>COMPANY</h4>
                <ul>
                    <li><a href="#">Home</a></li>
                    <li><a href="#">Shop</a></li>
                    <li><a href="#">About</a></li>
                    <li><a href="#">How It Works</a></li>
                    <li><a href="#">Contact</a></li>
                </ul>
            </div>
            <div class="col-xl-2 col-md-4 links">
                <h4>INFORMATION</h4>
                <ul>
                    <li><a href="#">Terms & Condition</a></li>
                    <li><a href="#">Privacy Policy</a></li>
                    <li><a href="#">How to Buy</a></li>
                    <li><a href="#">How to Sell</a></li>
                    <li><a href="#">Promotion</a></li>
                </ul>
            </div>
            <div class="col-xl-2 col-md-4 links">
                <h4>SHOP CATEGORY</h4>
                <ul>
                    <li><a href="#">Men</a></li>
                    <li><a href="#">Women</a></li>
                    <li><a href="#">Child</a></li>
                    <li><a href="#">Apparel</a></li>
                    <li><a href="#">Browse All</a></li>
                </ul>
            </div>
        </div>
    </div>
    </footer>
    `
});

Vue.component('foot-banner', {
    data() {
        return {
            reviews: [],
        };
    },
    template: `
   <div class="footBanner">
   <div class="container">
    <div class="row">
        <div class="col-lg-5">
        <div id="carouselReviews" class="carousel slide" data-ride="carousel">
        <ol class="carousel-indicators">
            <li data-target="#carouselReviews" data-slide-to="0" class="active"></li>
            <li data-target="#carouselReviews" data-slide-to="1"></li>
            <li data-target="#carouselReviews" data-slide-to="2"></li>
        </ol>
    <div class="carousel-inner">
        <div class="carousel-item" v-for="(review, index) in reviews" :class="{ 'active': index === 0 }">
            <div class="media">
                <img :src="review.user_avatar" class="align-self-center mr-3" alt="...">
                <div class="media-body">
                    <blockquote>
                        {{ review.text }}
                    </blockquote>
                    <h3>{{ review.user_name }}</h3>
                </div>
            </div>
        </div>
    </div> 
</div>
</div>
<div class="divider"></div>
        <div class="col-lg-5">
            <div class="label">
                <h3>SUBSCRIBE</h3>
                <h4>FOR OUR NEWLETTER AND PROMOTION</h4>
            </div>
            <form>
                <div class="form-group">
                    <input type="email" class="form-control" id="exampleInputEmail1" placeholder="Enter email">
                </div>
                <button type="submit" class="btn btn-primary">Submit</button>
            </form>
        </div>
    </div>
    </div>
    </div>
   `,
    mounted() {
        fetch(`${API_URL}/reviews`)
            .then((response) => {
                this.response = response.status;
                return response.json();
            })
            .then((result) => {
                this.reviews = result.reviews;
            });
    },
});

const app = new Vue({
    el: '#app',
    data: {
        mainNav: [
            { name: 'home', link: "http://localhost:3000/index.html" },
            { name: 'men', link: "http://localhost:3000/product.html" },
            { name: 'women', link: "http://localhost:3000/product.html" },
            { name: 'kids', link: "http://localhost:3000/product.html" },
            { name: 'accessoriese', link: "http://localhost:3000/product.html" },
            { name: 'featured', link: "#" },
            { name: 'hot deals', link: "#" },
        ],
        cart: [],
        reviews: [],
        search: '',
        response: '',
        total: 0,
        isLogin: false,
        activeUserId: 0,
    },
    mounted() {
        fetch(`${API_URL}/preferences`)
            .then((response) => {
                this.response = response.status;
                return response.json();
            })
            .then((result) => {
                this.isLogin = result.isLogin;
                this.activeUserId = result.user_id;
                fetch(`${API_URL}/cart/${this.activeUserId}`)
                    .then((response) => {
                        this.response = response.status;
                        return response.json();
                    })
                    .then((result) => {
                        this.cart = result.products;
                        this.total = result.total;
                    });
            });
    },
    methods: {
        handleSearch(query) {
            this.search = query;
        },
        addToCart(product) {
            const cartItem = this.cart.find(cartItem => cartItem.id === product.id);
            if (cartItem) {
                fetch(`${API_URL}/cart/${this.activeUserId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ product_id: product.id, quantity: ++cartItem.quantity, subtotal: cartItem.price * cartItem.quantity })
                })
                    .then((response) => response.json())
                    .then((result) => {
                        const itemIdx = this.cart.findIndex(cartItem => cartItem.id === product.id);
                        Vue.set(this.cart, itemIdx, result.product);
                        this.total = result.total;
                    });
            }
            else {
                fetch(`${API_URL}/cart/${this.activeUserId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...product, quantity: 1, subtotal: product.price, }),
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
                fetch(`${API_URL}/cart/${this.activeUserId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ product_id: product.id, quantity: --product.quantity, subtotal: product.price * product.quantity })
                }).then((response) => response.json())
                    .then((result) => {
                        const itemIdx = this.cart.findIndex(cartItem => cartItem.id === product.id);
                        Vue.set(this.cart, itemIdx, result.product);
                        this.total = result.total;
                    });
            } else {
                fetch(`${API_URL}/cart/${this.activeUserId}/${product.id}`, {
                    method: 'DELETE',
                }).then((response) => response.json())
                    .then((result) => {
                        this.cart = this.cart.filter((cartItem) => cartItem.id !== product.id);
                        this.total = result.total;
                    });
            }
        },
        handleLogin(user) {
            fetch(`${API_URL}/auth`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...user }),
            })
                .then((response) => response.json())
                .then((result) => {
                    if (result.auth === 'OK') {
                        this.activeUserId = result.id;
                        fetch(`${API_URL}/preferences`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ isLogin: true, user_id: this.activeUserId })
                        }).then((response) => response.json())
                            .then((result) => {
                                this.isLogin = result.isLogin;
                                this.activeUserId = result.user_id;
                            });
                    }
                    else {
                        console.log('error');
                    }
                });
        },
        handleRegister(user) {
            fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...user }),
            })
                .then((response) => response.json())
                .then((result) => {
                    if (result.auth === 'OK') {
                        this.isLogin = true;
                        this.activeUserId = result.id;
                    }
                    else {
                        console.log('error');
                    }
                });
        },
        handleLogout() {
            fetch(`${API_URL}/preferences`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isLogin: false, user_id: 0 })
            })
                .then((response) => response.json())
                .then((result) => {
                    this.isLogin = result.isLogin;
                    this.activeUserId = result.user_id;
                });
        },
    }
});