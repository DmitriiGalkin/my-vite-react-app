require('dotenv').config();

const express = require('express')
const bodyParser = require('body-parser');
const router = require('./router')
const cors = require('cors');
var session = require('express-session');
const createError = require('http-errors')

const port = process.env.PORT || 4000; // Setup server port

const app = express();
app.disable('etag'); // Удаляю кеш, чтобы не возникали попытки 304 реквеста
app.use(cors({ origin: '*' })); // Разрешаем CORS
app.use(bodyParser.urlencoded({ extended: true })) // parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.json()) // parse requests of content-type - application/json
app.use(session({
    secret: 'keyboard cat',
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
}));
app.use('/', router)

// Создаем 404 если запрос не нашел своего роута
app.use((req, res, next) => {
    next(createError(404))
})

// Процесс вывода ошибок
app.use((error, req, res, next) => {
    // // console.log(error,'error')
    // // console.log(req,'req')
    // // console.log(res,'res')
    //
    // Сделать это нужно только в том случае, если ответ передаётся в потоковом режиме
    if (res.headersSent) {
        return next(error)
    }
    //
    // res.status(error.status || 500)
    // res.json({
    //     status: error.status,
    //     message: error.message,
    //     stack: error.stack
    // })
})

app.listen(port, () => { console.log(`Server listening on port ${port}`) });
