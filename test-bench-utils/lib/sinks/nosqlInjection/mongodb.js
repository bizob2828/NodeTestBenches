'use strict';

const escape = require('escape-html');
const { MongoClient } = require('mongodb');

const {
  MONGO_COLLECTION = 'documents',
  MONGO_DB = 'testbench',
  MONGO_URL = 'mongodb://localhost:27017'
} = process.env;

const client = new MongoClient(MONGO_URL);

const initDb = async () => {
  await client.connect();
  const db = client.db(MONGO_DB);

  const collections = await db.collections();
  await Promise.all(
    collections.map((collection) =>
      db.dropCollection(collection.collectionName).catch((err) => {
        // this handles a race condition that can occur where we try to drop a
        // collection after it has already been dropped
        if (!err.codeName || err.codeName !== 'NamespaceNotFound') throw err;
      })
    )
  );

  await db.collection(MONGO_COLLECTION).insertOne({
    hello: 'world'
  });

  return db;
};

/**
 * @param {Object} params
 * @param {string} params.input user input string
 * @param {Object} opts
 * @param {boolean} [opts.safe] are we calling the sink safely?
 * @param {boolean} [opts.noop] are we calling the sink as a noop?
 */
module.exports['mongodb.Db.prototype.eval'] = async function _eval(
  { input },
  { safe = false, noop = false } = {}
) {
  if (noop) return 'NOOP';

  const fn = safe ? 'function() {}' : input;
  const db = await initDb();
  const result = await db.eval(fn);

  return `<pre>${escape(JSON.stringify(result, null, 2))}</pre>`;
};

/**
 * @param {Object} params
 * @param {string} params.input user input string
 * @param {Object} opts
 * @param {boolean} [opts.safe] are we calling the sink safely?
 * @param {boolean} [opts.noop] are we calling the sink as a noop?
 */
module.exports['mongodb.Collection.prototype.rename'] = async function rename(
  { input },
  { safe = false, noop = false } = {}
) {
  if (noop) return 'NOOP';

  const newName = safe ? 'newName' : input;
  const db = await initDb();
  const result = await db
    .collection(MONGO_COLLECTION)
    .rename(newName)
    .catch((err) => {});

  return `<pre>${escape(JSON.stringify(result.collectionName, null, 2))}</pre>`;
};
