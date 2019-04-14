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

app.get('/cart', (req, res) => {
    fs.readFile('./public/db/cart.json', 'utf-8', (err, data) => {
        if (err) {
            res.send('Нет такого файла');
        }
        const cart = JSON.parse(data);
        res.send({
            total: cart.reduce((acc, product) => acc + product.subtotal, 0),
            products: cart.map((product) => ({ ...product })),
        });
    });
});

app.get('/cart/:id', (req, res) => {
    fs.readFile('./public/db/cart.json', 'utf-8', (err, data) => {
        if (err) {
            res.send('Нет такого файла');
        }
        let cart = JSON.parse(data);
        cart = cart.filter(cartItem => {
            return cartItem.id == req.params.id;
        });

        res.send({
            total: cart.reduce((acc, product) => acc + product.subtotal, 0),
            product: cart,
        });
    });
});

app.post('/cart', (req, res) => {
    fs.readFile('./public/db/cart.json', 'utf-8', (err, data) => {
        if (err) {
            res.send('Нет такого файла');
        }
        const cart = JSON.parse(data);
        cart.push(req.body);
        fs.writeFile('./public/db/cart.json', JSON.stringify(cart), () => {
            res.send({
                product: req.body,
                total: cart.reduce((acc, product) => acc + product.subtotal, 0)
            });
        });
    });
});

app.patch('/cart/:id', (req, res) => {
    fs.readFile('./public/db/cart.json', 'utf-8', (err, data) => {
        if (err) {
            res.send('Нет такого файла');
        }
        let cart = JSON.parse(data);
        cart = cart.map((product) => {
            if (+product.id === +req.params.id) {
                return { ...product, ...req.body };
            }
            return product;
        });
        fs.writeFile('./public/db/cart.json', JSON.stringify(cart), () => {
            res.send({
                product: cart.find((product) => +product.id === +req.params.id),
                total: cart.reduce((acc, product) => acc + product.subtotal, 0)
            });
        });
    });
});

app.delete('/cart/:id', (req, res) => {
    fs.readFile('./public/db/cart.json', 'utf-8', (err, data) => {
        if (err) {
            res.send('Нет такого файла');
        }
        let cart = JSON.parse(data);
        cart = cart.filter(cartItem => {
            return +cartItem.id !== +req.params.id;
        });
        fs.writeFile('./public/db/cart.json', JSON.stringify(cart), () => {
            res.send({
                total: cart.reduce((acc, product) => acc + product.subtotal, 0)
            });
        });
    })
});

/*
app.get('/users', (req, res) => {
    fs.readFile('./public/db/users.json', 'utf-8', (err, data) => {
        if (err) {
            res.send('Нет такого файла');
        }
        const users = JSON.parse(data);
        res.send({
            userIdCounter: users.length,
        });
    });
}); 
*/

app.post('/auth', (req, res) => {
    fs.readFile('./public/db/users.json', 'utf-8', (err, data) => {
        if (err) {
            res.send('Нет такого файла');
        }
        const users = JSON.parse(data);
        const user = users.find(usr => (usr.login === req.body.login) && (usr.password === req.body.password));
        if(user) {
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

app.post('/users', (req, res) => {
    fs.readFile('./public/db/users.json', 'utf-8', (err, data) => {
        if (err) {
            res.send('Нет такого файла');
        }
        const users = JSON.parse(data);
        const user = users.find(usr => (usr.login === req.body.login) && (usr.password === req.body.password));
        if(user) {
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