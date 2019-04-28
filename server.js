const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();

app.use(express.static('./public'));
app.use(bodyParser.json());

app.listen(3000, () => {
    console.log('started');
});

app.get('/catalog', (req, res) => {
    fs.readFile('./public/db/catalog.json', 'utf-8', (err, data) => {
        if (err) {
            res.send('Нет такого файла');
        }
        res.send(data);
    });
});

app.get('/cart/:user', (req, res) => {
    fs.readFile('./public/db/cart.json', 'utf-8', (err, data) => {
        if (err) {
            res.send('Нет такого файла');
        }
        let cart = JSON.parse(data);
        cart = cart.filter(userCart => {
            return +userCart.user_id === +req.params.user;
        });
        if (cart.length != 0) {
            const userCart = cart[0].products;
            res.send({
                total: userCart.reduce((acc, product) => acc + product.subtotal, 0),
                products: userCart.map((product) => ({ ...product })),
            });
        }
        else {
            res.send({
                total: 0,
                products: [],
            });
        }
    });
});

app.post('/cart/:user', (req, res) => {
    fs.readFile('./public/db/cart.json', 'utf-8', (err, data) => {
        if (err) {
            res.send('Нет такого файла');
        }
        let cart = JSON.parse(data);
        if (cart.length != 0) {
            const tmpCart = cart.filter(userCart => {
                return +userCart.user_id === +req.params.user;
            });
            if (tmpCart.length != 0) {
                tmpCart[0].products.push(req.body);
                cart = cart.filter(userCart => {
                    return +userCart.user_id !== +req.params.user;
                });
                cart.push(tmpCart[0]);
                fs.writeFile('./public/db/cart.json', JSON.stringify(cart), () => {
                    res.send({
                        product: req.body,
                        total: tmpCart[0].products.reduce((acc, product) => acc + product.subtotal, 0)
                    });
                });
            }
            else {
                const userCart = { user_id: +req.params.user, products: [] };
                userCart.products.push(req.body);
                cart.push(userCart);
                fs.writeFile('./public/db/cart.json', JSON.stringify(cart), () => {
                    res.send({
                        product: req.body,
                        total: userCart.products.reduce((acc, product) => acc + product.subtotal, 0)
                    });
                });
            }
        }
        else {
            const userCart = { user_id: +req.params.user, products: [] };
            userCart.products.push(req.body);
            cart.push(userCart);
            fs.writeFile('./public/db/cart.json', JSON.stringify(cart), () => {
                res.send({
                    product: req.body,
                    total: userCart.products.reduce((acc, product) => acc + product.subtotal, 0)
                });
            });
        }
    });
});

app.patch('/cart/:user', (req, res) => {
    fs.readFile('./public/db/cart.json', 'utf-8', (err, data) => {
        if (err) {
            res.send('Нет такого файла');
        }
        let cart = JSON.parse(data);
        let tmpCart = cart.filter(userCart => {
            return +userCart.user_id === +req.params.user;
        });
        tmpCart[0].products = tmpCart[0].products.map((product) => {
            if (+product.id === +req.body.product_id) {
                product.quantity = req.body.quantity;
                product.subtotal = req.body.subtotal;
            }
            return product;
        });
        cart = cart.filter(userCart => {
            return +userCart.user_id !== +req.params.user;
        });
        cart.push(tmpCart[0]);
        fs.writeFile('./public/db/cart.json', JSON.stringify(cart), () => {
            res.send({
                product: tmpCart[0].products.find((product) => +product.id === +req.body.product_id),
                total: tmpCart[0].products.reduce((acc, product) => acc + product.subtotal, 0)
            });
        });
    });
});

app.delete('/cart/:user/:id', (req, res) => {
    fs.readFile('./public/db/cart.json', 'utf-8', (err, data) => {
        if (err) {
            res.send('Нет такого файла');
        }
        let cart = JSON.parse(data);
        let tmpCart = cart.filter(userCart => {
            return +userCart.user_id === +req.params.user;
        });
        tmpCart[0].products = tmpCart[0].products.filter(product => {
            return +product.id !== +req.params.id;
        });
        cart = cart.filter(userCart => {
            return +userCart.user_id !== +req.params.user;
        });
        cart.push(tmpCart[0]);
        fs.writeFile('./public/db/cart.json', JSON.stringify(cart), () => {
            res.send({
                total: tmpCart[0].products.reduce((acc, product) => acc + product.subtotal, 0)
            });
        });
    })
});

app.delete('/cart/:user', (req, res) => {
    fs.readFile('./public/db/cart.json', 'utf-8', (err, data) => {
        if (err) {
            res.send('Нет такого файла');
        }
        let cart = JSON.parse(data);
        cart = cart.filter(userCart => {
            return +userCart.user_id !== +req.params.user;
        });
        fs.writeFile('./public/db/cart.json', JSON.stringify(cart), () => {
            res.send({
                cart: [],
                total: 0,
            });
        });
    })
});

app.post('/auth', (req, res) => {
    fs.readFile('./public/db/users.json', 'utf-8', (err, data) => {
        if (err) {
            res.send('Нет такого файла');
        }
        const users = JSON.parse(data);
        const user = users.find(usr => (usr.login === req.body.login) && (usr.password === req.body.password));
        if (user) {
            if (user.isAdmin) {
                fs.readFile('./public/db/preferences.json', 'utf-8', (err, data) => {
                    if (err) {
                        res.send('Нет такого файла');
                    }
                    const prefs = [{ isLogin: true, user_id: user.id, isAdmin: true}];
                    fs.writeFile('./public/db/preferences.json', JSON.stringify(prefs), () => {
                        res.send({
                            auth: 'OK',
                            id: user.id,
                            isAdmin: true,
                        });
                    });
                });
            }
            else {
                res.send({
                    auth: 'OK',
                    id: user.id,
                    isAdmin: false,
                });
            } 
        }
        else {
            res.send({
                auth: 'error',
            });
        }
    });
});

app.get('/preferences', (req, res) => {
    fs.readFile('./public/db/preferences.json', 'utf-8', (err, data) => {
        if (err) {
            res.send('Нет такого файла');
        }
        const prefs = JSON.parse(data);
        res.send({
            isLogin: prefs[0].isLogin,
            user_id: prefs[0].user_id,
            isAdmin: prefs[0].isAdmin,
        });
    });
});

app.patch('/preferences', (req, res) => {
    fs.readFile('./public/db/preferences.json', 'utf-8', (err, data) => {
        if (err) {
            res.send('Нет такого файла');
        }
        let prefs = JSON.parse(data);
        prefs[0].isLogin = req.body.isLogin;
        prefs[0].user_id = req.body.user_id;
        prefs[0].isAdmin = req.body.isAdmin;
        fs.writeFile('./public/db/preferences.json', JSON.stringify(prefs), () => {
            res.send({
                isLogin: prefs[0].isLogin,
                user_id: prefs[0].user_id,
                isAdmin: prefs[0].isAdmin,
            });
        });
    });
});

app.get('/users/:id', (req, res) => {
    fs.readFile('./public/db/users.json', 'utf-8', (err, data) => {
        if (err) {
            res.send('Нет такого файла');
        }
        const users = JSON.parse(data);
        let user = users.find(usr => (+usr.id === +req.params.id));
        if (user) {
            delete user.password;
        }
        else {
            user = {name:'', link:'', bio:'', gender:'', email: ''};
        }
        res.send({
            user: user,
        });
    });
});

app.post('/users', (req, res) => {
    fs.readFile('./public/db/users.json', 'utf-8', (err, data) => {
        if (err) {
            res.send('Нет такого файла');
        }
        const users = JSON.parse(data);
        const user = users.find(usr => (usr.login === req.body.login) && (usr.password === req.body.password));
        if (user) {
            res.send({
                auth: 'error',
            });
        }
        else {
            let user = req.body;
            user.id = users.length + 1;
            users.push(user);
            fs.writeFile('./public/db/users.json', JSON.stringify(users), () => {
                const prefs = [{ isLogin: true, user_id: user.id}];
                fs.readFile('./public/db/preferences.json', 'utf-8', (err, data) => {
                    if (err) {
                        res.send('Нет такого файла');
                    }
                    fs.writeFile('./public/db/preferences.json', JSON.stringify(prefs), () => {
                        res.send({
                            auth: 'OK',
                            id: user.id,
                        });
                    });
                });
            });
        }
    });
});

app.patch('/users/:id', (req, res) => {
    fs.readFile('./public/db/users.json', 'utf-8', (err, data) => {
        if (err) {
            res.send('Нет такого файла');
        }
        let users = JSON.parse(data);
        const user = users.find(usr => (+usr.id === +req.params.id));
        for (param in req.body.user) {
            user[param] = req.body.user[param];
        }
        users = users.filter(user => {
            return +user.id !== +req.params.id;
        });
        users.push(user);
        fs.writeFile('./public/db/users.json', JSON.stringify(users), () => {
            delete user.password;
            res.send({
                user: user,
            });
        });
    });
});

app.get('/reviews', (req, res) => {
    fs.readFile('./public/db/reviews.json', 'utf-8', (err, data) => {
        if (err) {
            res.send('Нет такого файла');
        }
        let reviews = JSON.parse(data);
        reviews = reviews.filter(review => {
            return review.isApproved;
        });
        if (reviews.length > 3) {
            const tmp = Math.floor(Math.random() * (reviews.length - 2));
            reviews = reviews.slice(tmp, tmp + 3);
        }
        res.send({
            reviews: reviews,
        });
    });
});

app.get('/reviews/:id', (req, res) => {
    fs.readFile('./public/db/reviews.json', 'utf-8', (err, data) => {
        if (err) {
            res.send('Нет такого файла');
        }
        let reviews = JSON.parse(data);
        const reviewsToApprove = reviews.filter(review => {
            return review.isApproved === false;
        });
        reviews = reviews.filter(review => {
            return +review.user_id === +req.params.id;
        });
        res.send({
            reviews: reviews,
            reviewsToApprove: reviewsToApprove,
        });
    });
});

app.post('/reviews', (req, res) => {
    fs.readFile('./public/db/reviews.json', 'utf-8', (err, data) => {
        if (err) {
            res.send('Нет такого файла');
        }
        let reviews = JSON.parse(data);
        if (reviews.length !== 0) {
            reviews.sort( (a, b) => {
                if (a.id > b.id) return 1;
                if (a.id < b.id) return -1;
            });
            req.body.id = reviews[reviews.length - 1].id + 1;
            reviews.push(req.body);
        }
        else {
            req.body.id = 0;
            reviews.push(req.body);
        }
        fs.writeFile('./public/db/reviews.json', JSON.stringify(reviews), () => {
            reviewsToApprove = reviews.filter(review => {
                return review.isApproved === false;
            });
            reviews = reviews.filter(review => {
                return +review.user_id === +req.body.user_id;
            });
            res.send({
                reviews: reviews,
                reviewsToApprove: reviewsToApprove,
            });
        });
    });
});

app.delete('/reviews/:user/:id', (req, res) => {
    fs.readFile('./public/db/reviews.json', 'utf-8', (err, data) => {
        if (err) {
            res.send('Нет такого файла');
        }
        let reviews = JSON.parse(data);
        reviews = reviews.filter(review => {
            return +review.id !== +req.params.id;
        });
        const reviewsToApprove = reviews.filter(review => {
            return review.isApproved === false;
        });
        fs.writeFile('./public/db/reviews.json', JSON.stringify(reviews), () => {
            reviews = reviews.filter(review => {
                return +review.user_id === +req.params.user;
            });
            res.send({
                reviews: reviews,
                reviewsToApprove: reviewsToApprove,
            });
        });
    });
});

app.patch('/reviews/:id', (req, res) => {
    fs.readFile('./public/db/reviews.json', 'utf-8', (err, data) => {
        if (err) {
            res.send('Нет такого файла');
        }
        let reviews = JSON.parse(data);
        const review = reviews.find(review => {
            return +review.id === +req.params.id;
        });
        review.isApproved = true;
        reviews = reviews.filter(review => {
            return +review.id !== +req.params.id;
        });
        reviews.push(review);
        const reviewsToApprove = reviews.filter(review => {
            return review.isApproved === false;
        });
        fs.writeFile('./public/db/reviews.json', JSON.stringify(reviews), () => {
             res.send({
                reviewsToApprove: reviewsToApprove,
             });
         });
    });
});