require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const winston = require('winston')
const BooksService = require('./books-service')


const uuid = require('uuid/v4')
const bookmarkRouter = require('./bookmarks/bookmarks-router')

const app = express()

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'info.log'})
    ]
});

if (NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

const morganOption = (NODE_ENV === 'production')
    ? 'tiny'
    : 'common';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())
app.use(express.json());

app.use(function validateBearerToken(req, res, next) {
    const apiToken = process.env.API_TOKEN
    
    const authToken = req.get('Authorization')

    if (!authToken || authToken.split(' ')[1] !== apiToken) {
        logger.error(`Unauthorized request to path: ${req.path}`)
        return res.status(401).json({ error: 'Unauthorized request' })
    }

    next()
})

app.get('/', (req, res) => {
    res.send('Hello, world!')
})

app.get('/bookmarks', (req, res, next) => {
    const knexInstance = req.app.get('db')
    BooksService.getAllArticles(knexInstance)
        .then(articles => {
            res.json(articles)
        })
        .catch(next)
})

app.get('/bookmarks/:bookmark_id', (req, res, next) => {
    const knexInstance = req.app.get('db')
    BooksService.getById(knexInstance, req.params.bookmark_id)
        .then(article => {
            if(!article) {
                return res.status(404).json({
                    error: { message: `Bookmark doesn't exist` }
                })
            }
        })
})

app.use(bookmarkRouter)

app.use(function errorHandler(error, req, res, next) {
    let response
    if (NODE_ENV === 'production') {
        response = { error: { message: 'server error' }}
    }
    else {
        console.log(error)
        response = { message: error.message, error }
    }
    res.status(500).json(response)
})

module.exports = app