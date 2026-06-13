const { MongoClient } = require("mongodb");
const dns = require("dns");

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
const databaseName = process.env.MONGODB_DB || "kinotime";
const moviesCollectionName = process.env.MONGODB_MOVIES_COLLECTION || "movies";
const seriesCollectionName = process.env.MONGODB_SERIES_COLLECTION || "series";
const assetsCollectionName = process.env.MONGODB_ASSETS_COLLECTION || "assets";
const usersCollectionName = process.env.MONGODB_USERS_COLLECTION || "users";
const downloadHistoryCollectionName = process.env.MONGODB_DOWNLOAD_HISTORY_COLLECTION || "downloadHistory";
const dnsServers = (process.env.MONGODB_DNS_SERVERS || "8.8.8.8,1.1.1.1")
  .split(",")
  .map((server) => server.trim())
  .filter(Boolean);

if (dnsServers.length) {
  dns.setServers(dnsServers);
}

let clientPromise;
let movieIndexesReady = false;
let seriesIndexesReady = false;
let assetIndexesReady = false;
let userIndexesReady = false;
let downloadHistoryIndexesReady = false;

function isMongoConfigured() {
  return Boolean(mongoUri);
}

async function getMongoClient() {
  if (!mongoUri) {
    throw new Error("MONGODB_URI is not configured.");
  }

  if (!clientPromise) {
    const client = new MongoClient(mongoUri);
    clientPromise = client.connect();
  }

  return clientPromise;
}

async function getDatabase() {
  const client = await getMongoClient();
  return client.db(databaseName);
}

async function getMoviesCollection() {
  const db = await getDatabase();
  const collection = db.collection(moviesCollectionName);

  if (!movieIndexesReady) {
    await collection.createIndex({ slug: 1 }, { unique: true });
    await collection.createIndex({ createdAt: -1 });
    movieIndexesReady = true;
  }

  return collection;
}

async function getSeriesCollection() {
  const db = await getDatabase();
  const collection = db.collection(seriesCollectionName);

  if (!seriesIndexesReady) {
    await collection.createIndex({ slug: 1 }, { unique: true });
    await collection.createIndex({ createdAt: -1 });
    seriesIndexesReady = true;
  }

  return collection;
}

async function getAssetsCollection() {
  const db = await getDatabase();
  const collection = db.collection(assetsCollectionName);

  if (!assetIndexesReady) {
    await collection.createIndex({ filename: 1 }, { unique: true });
    await collection.createIndex({ contentHash: 1 });
    assetIndexesReady = true;
  }

  return collection;
}

async function getUsersCollection() {
  const db = await getDatabase();
  const collection = db.collection(usersCollectionName);

  if (!userIndexesReady) {
    await collection.createIndex({ email: 1 }, { unique: true });
    await collection.createIndex({ createdAt: -1 });
    userIndexesReady = true;
  }

  return collection;
}

async function getDownloadHistoryCollection() {
  const db = await getDatabase();
  const collection = db.collection(downloadHistoryCollectionName);

  if (!downloadHistoryIndexesReady) {
    await collection.createIndex({ userId: 1, downloadedAt: -1 });
    await collection.createIndex({ userId: 1, movieId: 1, quality: 1 }, { unique: true });
    downloadHistoryIndexesReady = true;
  }

  return collection;
}

module.exports = {
  getAssetsCollection,
  getDatabase,
  getDownloadHistoryCollection,
  getMoviesCollection,
  getSeriesCollection,
  getUsersCollection,
  isMongoConfigured,
};
