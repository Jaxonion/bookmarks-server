const express = require('express')
const uuid = require('uuid/v4')
const winston = require('winston')
const { NODE_ENV } = require('../config')
const logger = require('../app')

const bookmarkRouter = express.Router()
const bodyParser = express.json()


const bookmarks = [{
    id: 1,
    title: 'stuff',
    content: 'this is first bookmark'
}]

bookmarkRouter
    .route('/bookmarks')
    .get((req, res) => {
        res.json(bookmarks);
    })
    .post(bodyParser, (req, res) => {
        const { title, content } = req.body;

        if (!title) {
            logger.error(` is required`)
            return res
                .status(400)
                .send('Invalid data')
        }

        if (!content) {
            logger.error(` is required`)
            return res
                .status(400)
                .send('Invalid data');
        }

        const id = uuid();

        const bookmark = {
            id,
            title,
            content
        }

        bookmarks.push(bookmark)

        res.json(bookmark)



    })

bookmarkRouter
    .route('/bookmarks/:id')
    .get((req, res) => {
        const { id } = req.params;
        const bookmark = bookmarks.find(b => b.id == id);

        if (!bookmark) {
            logger.error(`Bookmark with id ${id} not found.`);
            return res
                .status(404)
                .send('Card Not Found');
        }
        res.json(bookmark);
    })
    .delete((req, res) => {
        const { id } = req.params;

        const bookmarkIndex = bookmarks.findIndex(b => b.id == id)

        if (bookmarkIndex === -1) {
            logger.error(`Bookmark with id ${id} not found.`);
            return res
                .status(404)
                .send('Not Found')
        }
        
        bookmarks.splice(bookmarkIndex, 1);
        
        

        logger.info(`Bookmark with id ${id} deleted.`)
        res
            .status(204)
            .end()
    })

module.exports = bookmarkRouter;