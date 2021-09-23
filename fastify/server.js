const start = async() => {
  const fastify = require('fastify')({ logger: true });
//  const middie = require('middie')
  //await fastify.register(middie)
  fastify.register(require('fastify-formbody'));

  const path = require('path');
  const { navRoutes } = require('@contrast/test-bench-utils');
  const { PORT = 3000, HOST = 'localhost' } = process.env;

  fastify.use(function handlerBob(request, reply, next) {
    setTimeout(() => {
      debugger
      next()
    }, 1000)
  })

  fastify.use(function handlerBob2(request, reply, next) {
    setTimeout(() => {
      debugger
      next()
    }, 300)
  })

  // setup ejs renderer
  // god damn point-of-view doesnt support layouts like every other
  // view front-end in node.
  fastify.register(require('point-of-view'), {
    engine: {
      ejs: require('ejs')
    },
    templates: `${__dirname}/view`,
    includeViewExtension: true // dont want to write .ejs every time
  });

  fastify.register(require('fastify-multipart'), { addToBody: true });
  fastify.register(require('fastify-cookie'));

  // shared route information
  const context = { navRoutes, currentYear: new Date().getFullYear() };

  // setup public assets
  fastify.register(require('fastify-static'), {
    root: path.join(__dirname, 'public'),
    prefix: '/assets/'
  });

  fastify.register(require('./routes/index'), context);

  // register routes for each vulnerability
  navRoutes.forEach(({ base }) => {
    fastify.register(require(`./routes/${base.substring(1)}`), context);
  });

  // one off routes that are not members of navroutes
  fastify.register(require('./routes/header-injection'), context);
  fastify.register(require('./routes/csp-header'), context);
  fastify.register(require('./routes/aws'), context)

  try {
    await fastify.listen(PORT, HOST);
  } catch (err) {
    console.log(err);
  }
}

start();
