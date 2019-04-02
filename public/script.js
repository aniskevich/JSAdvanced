const app = new Vue({
    el: '#app',
    data: {
        mainNav: ['home', 'men', 'women', 'kids', 'accessoriese', 'featured', 'hot deals'],
        catalogData: [],
        cart: [],
        search: '',
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
                        this.cart[item].subtotal = this.cart[item].price;
                    }
                }
            }
        },
        getTotal: function() {
            return this.cart.reduce((acc, product) => acc + product.subtotal, 0);
        },
    },
    computed: {
        filteredCatalogData() {
            const regexp = new RegExp(this.search, 'i');
            return this.catalogData.filter((product) => regexp.test(product.name));
        }
    },
    mounted() {
        fetch('http://localhost:3000/catalogData')
            .then((response) => response.json())
            .then((catalogData) => {
                this.catalogData = catalogData;
        });
    }
}); 