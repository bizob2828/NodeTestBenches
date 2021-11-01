const newrelic = require('newrelic')
const axios = require('axios')
module.exports = ({ router }) => {
  router.get('/', (ctx, next) => ctx.render('index'));
  router.get('/await', async function middleOne(ctx, next) {
      // ctx.router available
      await next()
    }, async function middleTwo(ctx, next) {
      // ctx.router available
      await next()
    }, async function middleThree(ctx, next) {
      // ctx.router available
      ctx.body = 'Hello World.'
    });



    router.get('/json', function(ctx, next) {
      return new Promise((resolve) => {
        setTimeout(resolve, 500)
      }).then(() => {
        ctx.body = 'hi'
      })
    })

    router.get('/more/interesting', async function middleOne (ctx, next) {
      await next()
    }, async function middleTwo(ctx, next) {
      await newrelic.startSegment('doSomething', false, doSomething)
      await next()
    }, async function middleThree(ctx, next) {
      await newrelic.startSegment('doSomething2', false, doSomething2)
      ctx.body = 'Did Something!'
    })

    router.get('/external/json', async function middleOne (ctx, next) {
      await next()
    }, async function middleTwo(ctx, next) {
      const response = await axios.request('http://127.0.0.1:3000/json')
      await next()
    }, async function middleThree(ctx, next) {
      await newrelic.startSegment('doSomething2', false, doSomething2)
      ctx.body = 'Did Something!'
    })

    router.get('/error', async function middleOne (ctx, next) {
      await next()
    }, async function middleTwo(ctx, next) {
      try {
        const response = await axios.request('http://127.0.0.1:3000/error')
      } catch(error) {
        newrelic.noticeError(error)
        ctx.status = 500
      }
      await next()
    }, async function middleThree(ctx, next) {
      await newrelic.startSegment('doSomething2', false, doSomething2)
      ctx.body = 'An error happened'
    })

    function doSomething() {
      return new Promise((resolve) => {
        setImmediate(() => {
          resolve()
        })
      })
    }

    function doSomething2() {
      return new Promise((resolve) => {
        setTimeout(resolve, 1)
      })
    }

};
