/// <reference types="cypress" />

describe('API Testing with Cypress', () => {
  beforeEach(() => {
    cy.request('https://jsonplaceholder.typicode.com/posts')
      .as('posts')
  })

  it('should return a list of posts', () => {
    cy.get('@posts')
      .should((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.length(100)
        expect(response.headers['content-type']).to.include('application/json')
      })
  })

  it('should return a specific post', () => {
    cy.get('@posts')
      .its('body')
      .should('have.length', 100)
      .then((posts) => {
        const randomPost = Cypress._.sample(posts)
        cy.request(`https://jsonplaceholder.typicode.com/posts/${randomPost.id}`)
          .as('post')
          .its('body')
          .should('deep.equal', randomPost)
      })
  })

  it('should have valid userId attribute', () => {
    cy.get('@posts')
      .its('body')
      .each((post) => {
        expect(post.userId).to.be.a('number')
      })
  })

  it('should have valid title attribute', () => {
    cy.get('@posts')
      .its('body')
      .each((post) => {
        expect(post.title).to.be.a('string')
      })
  })

  it('should return error for invalid post ID', () => {
    cy.request({
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/posts/invalid',
      failOnStatusCode: false
    }).as('invalidPost')

    cy.get('@invalidPost')
      .its('status')
      .should('eq', 404)
  })

  it('should create a new post', () => {
    const newPost = {
      title: 'New Post',
      body: 'This is a new post.',
      userId: 1
    }

    cy.request('POST', 'https://jsonplaceholder.typicode.com/posts', newPost)
      .as('createdPost')

    cy.get('@createdPost')
      .should((response) => {
        expect(response.status).to.eq(201)
        expect(response.body.title).to.eq(newPost.title)
        expect(response.body.body).to.eq(newPost.body)
        expect(response.body.userId).to.eq(newPost.userId)
      })
  })

  it('should test performance', () => {
    const startTime = Date.now()

    for (let i = 0; i < 10; i++) {
      cy.request('https://jsonplaceholder.typicode.com/posts')
    }

    const endTime = Date.now()
    const duration = endTime - startTime

    cy.log(`Performed 10 requests in ${duration}ms`)
  })
})