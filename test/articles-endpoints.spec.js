const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeArticlesArray } = require('./articles.fixtures')

describe.only('Articles Endpoints', function() {
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db('bookmarks').truncate())

    this.afterEach('cleanup', () => db('bookmarks').truncate())

    describe(`GET /articles`, () => {
        context(`given no articles`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/bookmarks')
                    .expect(200, [])
            })
        })
    })

    describe(`GET /articles/:articles_id`, () => {
        context(`Given no articles`, () => {
            it(`responds with 404`, () => {
                const bookmarkId = 123456
                return supertest(app)
                .get(`/bookmarks/${bookmarkId}`)
                .expect(404, { error: { message: `Bookmark doesn't exeist` }})
            })
        })
    })
    context('Given there are articles in the database', () => {
        const testArticles = makeArticlesArray()

        beforeEach('insert article', () => {
            return db
                .into('bookmark_articles')
                .insert(testArticles)
        })

        it('GET /bookmarks responds with 200 and all of the articles', () => {
            return supertest(app)
                .get('/bookmarks')
                .expect(200, testArticles)
        })

        it('GET /bookmarks/:bookmark_id responds with 200 and the specified article', () => {
            const bookmarkId = 2
            const expectedArticle = testArticles[bookmarkId -1]
            return supertest(app)
                .get(`/bookmarks/${bookmarkId}`)
                .expect(200, expectedArticle)
        })
    })
    
})