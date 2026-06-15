const { MongoClient } = require("mongodb");
const dns = require("dns");

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
const databaseName = process.env.MONGODB_DB || "kinotime";
const moviesCollectionName = process.env.MONGODB_MOVIES_COLLECTION || "movies";
const seriesCollectionName = process.env.MONGODB_SERIES_COLLECTION || "series";
const assetsCollectionName = process.env.MONGODB_ASSETS_COLLECTION || "assets";
const usersCollectionName = process.env.MONGODB_USERS_COLLECTION || "users";
const downloadHistoryCollectionName = process.env.MONGODB_DOWNLOAD_HISTORY_COLLECTION || "downloadHistory";
const analyticsEventsCollectionName = process.env.MONGODB_ANALYTICS_EVENTS_COLLECTION || "analytics_events";
const dailyStatsCollectionName = process.env.MONGODB_DAILY_STATS_COLLECTION || "daily_stats";
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
let analyticsEventIndexesReady = false;
let dailyStatsIndexesReady = false;

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

async function getAnalyticsEventsCollection() {
  const db = await getDatabase();
  const collection = db.collection(analyticsEventsCollectionName);

  if (!analyticsEventIndexesReady) {
    await collection.createIndex({ createdAt: -1 });
    await collection.createIndex({ type: 1 });
    await collection.createIndex({ movieId: 1 });
    await collection.createIndex({ visitorId: 1 });
    await collection.createIndex({ createdAt: -1, visitorId: 1 });
    await collection.createIndex({ type: 1, createdAt: -1 });
    analyticsEventIndexesReady = true;
  }

  return collection;
}

async function getDailyStatsCollection() {
  const db = await getDatabase();
  const collection = db.collection(dailyStatsCollectionName);

  if (!dailyStatsIndexesReady) {
    await collection.createIndex({ day: 1 }, { unique: true });
    await collection.createIndex({ date: -1 });
    dailyStatsIndexesReady = true;
  }

  return collection;
}

module.exports = {
  getAnalyticsEventsCollection,
  getAssetsCollection,
  getDailyStatsCollection,
  getDatabase,
  getDownloadHistoryCollection,
  getMoviesCollection,
  getSeriesCollection,
  getUsersCollection,
  isMongoConfigured,
};
