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

app.post('/auth', (req, res) => {
    fs.readFile('./public/db/users.json', 'utf-8', (err, data) => {
        if (err) {
            res.send('Нет такого файла');
        }
        const users = JSON.parse(data);
        const user = users.find(usr => (usr.login === req.body.login) && (usr.password === req.body.password));
        if (user) {
            res.send({
                auth: 'OK',
                id: user.id,
            });
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
        fs.writeFile('./public/db/preferences.json', JSON.stringify(prefs), () => {
            res.send({
                isLogin: prefs[0].isLogin,
                user_id: prefs[0].user_id,
            });
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
                res.send({
                    auth: 'OK',
                    id: user.id,
                });
            });
        }
    });
});

app.get('/reviews', (req, res) => {
    fs.readFile('./public/db/reviews.json', 'utf-8', (err, data) => {
        if (err) {
            res.send('Нет такого файла');
        }
        const reviews = JSON.parse(data);
        res.send({
            reviews: reviews,
        });
    });
});