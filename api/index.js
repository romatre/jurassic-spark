const Koa = require('koa');
const Router = require('koa-router');
const { PORT, MONGODB_URI } = require('./config');
const services = require('./services')

const app = new Koa();
const router = new Router();

services.getMongoDBConnection().then(db => {

  router.use(async (ctx, next) => {
    ctx.skip = parseInt(ctx.request.query.skip || 0);
    ctx.limit = parseInt(ctx.request.query.limit || 25);
    ctx.find = Object.keys(ctx.request.query)
      .filter(e => e !== 'skip' && e !== 'limit' && e !== 'sort' && e !== 'order')
      .reduce((prev, curr) => Object.assign({}, prev, { [curr]: ctx.request.query[curr] }), {});
    ctx.sort = { [ctx.request.query.sort]: parseInt(ctx.request.query.order) || 1 };
    return next(ctx);
  });

  router.get('/transactions', async (ctx, next) => {
    const { skip, limit, find, sort } = ctx;
    ctx.body = await db.collection('transactions')
      .find(find)
      .limit(limit)
      .skip(skip)
      .sort(sort)
      .toArray();
  });

  router.get('/std_to', async (ctx, next) => {
    const { skip, limit, find } = ctx;
    ctx.body = await db.collection('std_to')
      .find(Object.assign({}, {
        "standard_deviation": { "$lte": 2 },
        "number_of_blocks": { "$gte": 50 }
      }, find))
      .limit(limit)
      .skip(skip)
      .sort({ number_of_blocks: -1 })
      .toArray();
  });

  router.get('/std_from', async (ctx, next) => {
    const { skip, limit, find } = ctx;
    ctx.body = await db.collection('std_from')
      .find(Object.assign({}, {
        "standard_deviation": { "$lte": 2 },
        "number_of_blocks": { "$gte": 50 }
      }, find))
      .limit(limit)
      .skip(skip)
      .sort({ number_of_blocks: -1 })
      .toArray();
  });

  app
    .use(router.routes())
    .use(router.allowedMethods())
    .listen(PORT);

})
