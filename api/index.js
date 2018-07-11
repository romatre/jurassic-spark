const Koa = require('koa');
const Router = require('koa-router');
const { PORT, MONGODB_URI } = require('./config');
const services = require('./services')
const cors = require('@koa/cors');

const app = new Koa();
const router = new Router();

app.use(cors());

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

  router.get('/top100Triplets', async (ctx, next) => {
    const { skip, limit, find, sort } = ctx;
    ctx.body = await db.collection('top100Triplets')
      .find(find)
      .limit(limit)
      .skip(skip)
      .sort(sort)
      .toArray();
  });

  router.get('/top100Vertices', async (ctx, next) => {
    const { skip, limit, find, sort } = ctx;
    ctx.body = await db.collection('top100Vertices')
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
        "standard_deviation": { "$lte": 3, "$gte": 0 },
        "number_of_blocks": { "$gte": 20 },
        "gas": {"$gte": 0 },
        "value": {"$gte": 0, "$lte": 1053380108336903720000 },
        "period": {"$gte": 0 },
      }, find))
      .limit(limit)
      .skip(skip)
      .sort({ period: -1 })
      .toArray();
  });

  router.get('/std_from', async (ctx, next) => {
    const { skip, limit, find } = ctx;
    ctx.body = await db.collection('std_from')
      .find(Object.assign({}, {
        "standard_deviation": { "$lte": 3, "$gte": 0 },
        "number_of_blocks": { "$gte": 20 },
        "gas": {"$gte": 0, "$lte": 31673611 },
        "value": {"$gte": 0 },
        "period": {"$gte": 0 },
      }, find))
      .limit(limit)
      .skip(skip)
      .sort({ period: -1 })
      .toArray();
  });


  app
    .use(router.routes())
    .use(router.allowedMethods())
    .listen(PORT);

})
