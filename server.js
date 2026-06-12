require("dotenv").config();

const express = require("express");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { ObjectId } = require("mongodb");
const {
  getAssetsCollection,
  getDatabase,
  getMoviesCollection,
  getSeriesCollection,
  isMongoConfigured,
} = require("./db");

const app = express();
const port = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === "production";
const defaultSiteUrl = `http://localhost:${port}`;
const configuredSiteUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_SITE_URL || defaultSiteUrl);
const configuredApiUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL || `${configuredSiteUrl}/api`);
const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD || "";
const jwtSecret = process.env.JWT_SECRET || (isProduction ? "" : "kinotime-development-jwt-secret");
const betaNoindex =
  process.env.BETA_NOINDEX === "true" ||
  (process.env.BETA_NOINDEX !== "false" && getHostname(configuredSiteUrl) === "beta.kinotime.net");
const indexHtmlPath = path.join(__dirname, "index.html");
const indexHtml = fs.readFileSync(indexHtmlPath, "utf8");
const publicStaticFiles = new Set([
  "app.js",
  "styles.css",
  "logopng.png",
  "Gemini_Generated_Image_olm3wrolm3wrolm3.png",
]);

app.set("trust proxy", 1);
app.use(express.json({ limit: "25mb" }));

app.use((req, res, next) => {
  if (shouldNoindex(req)) {
    res.set("X-Robots-Tag", "noindex, nofollow");
  }

  next();
});

app.get("/robots.txt", (req, res) => {
  res.type("text/plain");

  if (shouldNoindex(req)) {
    res.send("User-agent: *\nDisallow: /\n");
    return;
  }

  res.send("User-agent: *\nAllow: /\n");
});

app.get("/api/config.js", (req, res) => {
  const config = {
    siteUrl: getPublicSiteUrl(req),
    apiUrl: configuredApiUrl,
    betaNoindex: shouldNoindex(req),
  };

  res.type("application/javascript");
  res.set("Cache-Control", "no-store");
  res.send(`window.KINOTIME_CONFIG = ${JSON.stringify(config)};`);
});

app.get("/:file", (req, res, next) => {
  if (!publicStaticFiles.has(req.params.file)) {
    next();
    return;
  }

  res.sendFile(path.join(__dirname, req.params.file));
});

function normalizeBaseUrl(value) {
  return String(value || "").replace(/\/+$/, "");
}

function getHostname(value) {
  try {
    return new URL(value).hostname;
  } catch (error) {
    return "";
  }
}

function getPublicSiteUrl(req) {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return configuredSiteUrl;
  }

  const host = req.get("host");
  return host ? `${req.protocol}://${host}` : configuredSiteUrl;
}

function shouldNoindex(req) {
  return betaNoindex || req.hostname === "beta.kinotime.net";
}

function renderIndexHtml(req) {
  const robotsMeta = shouldNoindex(req)
    ? '    <meta name="robots" content="noindex, nofollow" />\n'
    : "";

  return indexHtml.replace("    <!-- KINOTIME_NOINDEX_META -->\n", robotsMeta);
}

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

const GENRE_NORMALIZATION_MAP = {
  action: "Action",
  aksiya: "Action",
  comedy: "Comedy",
  komediya: "Comedy",
  drama: "Drama",
  thriller: "Thriller",
  triller: "Thriller",
  horror: "Horror",
  qorqinchli: "Horror",
  "qo'rqinchli": "Horror",
  "qo‘rqinchli": "Horror",
  romance: "Romance",
  romantika: "Romance",
  crime: "Crime",
  jinoyat: "Crime",
  adventure: "Adventure",
  sarguzasht: "Adventure",
  animation: "Animation",
  animatsiya: "Animation",
  "sci-fi": "Sci-Fi",
  scifi: "Sci-Fi",
  sci_fi: "Sci-Fi",
  sci: "Sci-Fi",
  "ilmiy fantastika": "Sci-Fi",
  fantastika: "Sci-Fi",
};

function normalizeGenreKey(value) {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[^a-z0-9' -]/g, "")
    .replace(/\s+/g, " ");
}

function normalizeGenre(value) {
  const genre = value.toString().trim();
  const normalizedKey = normalizeGenreKey(genre);

  return GENRE_NORMALIZATION_MAP[normalizedKey] || genre;
}

function normalizeGenres(value) {
  return normalizeArray(value).map(normalizeGenre);
}

function normalizeMoviePayload(payload) {
  const titleUz = String(payload.titleUz || payload.title || "").trim();
  const slug = String(payload.slug || payload.id || "")
    .trim()
    .toLowerCase();
  const type = "Film";
  const download1080p = payload.downloads?.["1080p"] || {};
  const downloadFormat = String(download1080p.format || payload.downloadFormat || payload.format || "MP4").trim();
  const downloadUrl = String(download1080p.url || payload.download1080pUrl || "").trim();
  const downloadSize = String(download1080p.size || payload.download1080pSize || "").trim();

  return {
    id: slug,
    title: titleUz,
    titleUz,
    originalTitle: String(payload.originalTitle || titleUz).trim(),
    slug,
    tavsif: String(payload.tavsif || payload.description || "").trim(),
    description: String(payload.description || payload.tavsif || "").trim(),
    posterUrl: String(payload.posterUrl || payload.poster || "").trim(),
    year: Number(payload.year || new Date().getFullYear()),
    country: String(payload.country || "").trim(),
    genres: normalizeGenres(payload.genres),
    languages: normalizeArray(payload.languages),
    duration: String(payload.duration || "").trim(),
    director: String(payload.director || "").trim(),
    rating: Number(payload.rating || 0),
    type,
    section: "filmlar",
    category: String(payload.category || "").trim(),
    status: payload.status === "Draft" ? "Draft" : "Published",
    quality: "Full HD",
    videoSource: String(payload.videoSource || "WEB-DL").trim(),
    downloadFormat,
    format: downloadFormat,
    downloads: {
      "1080p": {
        url: downloadUrl,
        size: downloadSize,
        format: downloadFormat,
      },
    },
    download1080pUrl: downloadUrl,
    download1080pSize: downloadSize,
    updatedAt: new Date(),
  };
}

function toClientMovie(document) {
  if (!document) {
    return null;
  }

  const { _id, ...movie } = document;
  return {
    ...movie,
    id: movie.slug || movie.id || _id.toString(),
    mongoId: _id.toString(),
    genres: normalizeGenres(movie.genres),
  };
}

function getMovieFilter(identifier) {
  if (/^[a-f\d]{24}$/i.test(identifier)) {
    return { _id: new ObjectId(identifier) };
  }

  return { slug: identifier };
}

function normalizePositiveInteger(value, fallback = 0) {
  if (value === "" || value === null || value === undefined) {
    return fallback;
  }

  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    return fallback;
  }

  return Math.round(number);
}

function isEpisodeCountDuration(value) {
  return /^\d+\s*(ta\s*)?(qism|qismlar|episode|episodes)\b/i.test(value.toString().trim());
}

function normalizeSeriesDuration(value) {
  const duration = String(value || "").trim();

  return duration && !isEpisodeCountDuration(duration) ? duration : "";
}

function normalizeEpisodePayload(payload = {}, fallbackId = "") {
  const title = String(payload.title || payload.episodeTitle || "").trim();
  const seasonNumber = normalizePositiveInteger(payload.seasonNumber || payload.season, 1) || 1;
  const episodeNumber = normalizePositiveInteger(payload.episodeNumber || payload.number, 1) || 1;
  const id = String(payload.id || payload.episodeId || fallbackId || new ObjectId().toString());
  const downloadLink = String(
    payload.downloadLink || payload.videoUrl || payload.downloadUrl || payload.url || payload.link || "",
  ).trim();

  return {
    id,
    title: title || `Episode ${episodeNumber}`,
    episodeNumber,
    seasonNumber,
    quality: String(payload.quality || "Full HD").trim(),
    videoSource: String(payload.videoSource || "WEB-DL").trim(),
    format: String(payload.format || payload.downloadFormat || "MP4").trim(),
    fileSize: String(payload.fileSize || payload.downloadSize || payload.download1080pSize || "").trim(),
    downloadLink,
    videoUrl: downloadLink,
    description: String(payload.description || "").trim(),
    duration: String(payload.duration || "").trim(),
    updatedAt: new Date(),
  };
}

function sortEpisodes(episodes) {
  return [...episodes].sort((first, second) => {
    if (first.seasonNumber !== second.seasonNumber) {
      return first.seasonNumber - second.seasonNumber;
    }

    return first.episodeNumber - second.episodeNumber;
  });
}

function getDerivedSeasonCount(episodes, fallback = 0) {
  const count = new Set(episodes.map((episode) => episode.seasonNumber).filter(Boolean)).size;
  return count || fallback;
}

function normalizeSeriesPayload(payload = {}) {
  const titleUz = String(payload.titleUz || payload.title || "").trim();
  const slug = String(payload.slug || payload.id || "")
    .trim()
    .toLowerCase();
  const rawGenres = normalizeGenres(payload.genres);
  const genre = String(payload.genre || payload.category || rawGenres[0] || "").trim();
  const category = genre;
  const genres = rawGenres.length ? rawGenres : normalizeGenres(category);
  const rawEpisodes = Array.isArray(payload.episodes) ? payload.episodes : [];
  const episodes = sortEpisodes(rawEpisodes.map((episode) => normalizeEpisodePayload(episode)));
  const episodesCountValue =
    payload.episodesCount ??
    payload.episodeCount ??
    (Array.isArray(payload.episodes) ? undefined : payload.episodes);
  const seasonsCount = normalizePositiveInteger(
    payload.seasonsCount ?? payload.seasons,
    getDerivedSeasonCount(episodes),
  );
  const episodesCount = normalizePositiveInteger(
    episodesCountValue,
    episodes.length,
  );
  const firstEpisode = episodes[0] || {};
  const download1080p = payload.downloads?.["1080p"] || {};
  const downloadUrl = String(
    download1080p.url || payload.download1080pUrl || firstEpisode.videoUrl || "",
  ).trim();
  const downloadFormat = String(download1080p.format || payload.downloadFormat || payload.format || firstEpisode.format || "MP4").trim();
  const downloadSize = String(download1080p.size || payload.download1080pSize || firstEpisode.fileSize || "").trim();

  return {
    id: slug,
    title: titleUz,
    titleUz,
    originalTitle: String(payload.originalTitle || titleUz).trim(),
    slug,
    tavsif: String(payload.tavsif || payload.description || "").trim(),
    description: String(payload.description || payload.tavsif || "").trim(),
    posterUrl: String(payload.posterUrl || payload.poster || "").trim(),
    year: Number(payload.year || new Date().getFullYear()),
    country: String(payload.country || "").trim(),
    genres,
    genre,
    category,
    languages: normalizeArray(payload.languages),
    duration: normalizeSeriesDuration(payload.duration ?? payload.runtime),
    director: String(payload.director || "").trim(),
    rating: Number(payload.rating || 0),
    type: "Serial",
    section: "seriallar",
    status: payload.status === "Draft" ? "Draft" : "Published",
    quality: "Full HD",
    videoSource: String(payload.videoSource || firstEpisode.videoSource || "WEB-DL").trim(),
    seasonsCount,
    episodesCount,
    episodes,
    downloadFormat,
    format: downloadFormat,
    downloads: {
      "1080p": {
        url: downloadUrl,
        size: downloadSize,
        format: downloadFormat,
      },
    },
    download1080pUrl: downloadUrl,
    download1080pSize: downloadSize,
    updatedAt: new Date(),
  };
}

function toClientSeries(document) {
  if (!document) {
    return null;
  }

  const { _id, ...series } = document;
  const normalized = normalizeSeriesPayload(series);

  return {
    ...series,
    ...normalized,
    id: series.slug || series.id || _id.toString(),
    mongoId: _id.toString(),
  };
}

function getSeriesFilter(identifier) {
  if (/^[a-f\d]{24}$/i.test(identifier)) {
    return { _id: new ObjectId(identifier) };
  }

  return { slug: identifier };
}

function getAuthSettingsError() {
  const missing = [];

  if (!adminEmail) {
    missing.push("ADMIN_EMAIL");
  }

  if (!adminPassword) {
    missing.push("ADMIN_PASSWORD");
  }

  if (!jwtSecret) {
    missing.push("JWT_SECRET");
  }

  return missing.length ? `${missing.join(", ")} configured emas.` : "";
}

function base64UrlEncode(value) {
  return Buffer.from(value).toString("base64url");
}

function createAdminToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64UrlEncode(
    JSON.stringify({
      sub: adminEmail,
      role: "admin",
      iat: now,
      exp: now + 60 * 60 * 12,
    }),
  );
  const signature = crypto
    .createHmac("sha256", jwtSecret)
    .update(`${header}.${payload}`)
    .digest("base64url");

  return `${header}.${payload}.${signature}`;
}

function verifyAdminToken(token) {
  if (!token || !jwtSecret) {
    return null;
  }

  const [header, payload, signature] = token.split(".");

  if (!header || !payload || !signature) {
    return null;
  }

  const expectedSignature = crypto
    .createHmac("sha256", jwtSecret)
    .update(`${header}.${payload}`)
    .digest("base64url");
  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
    return null;
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    const now = Math.floor(Date.now() / 1000);

    if (decoded.exp <= now || decoded.role !== "admin" || decoded.sub !== adminEmail) {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
}

function getBearerToken(req) {
  const header = req.header("authorization") || "";
  const [scheme, token] = header.split(" ");

  return scheme?.toLowerCase() === "bearer" ? token : "";
}

function timingSafeStringEqual(first, second) {
  const firstHash = crypto.createHash("sha256").update(String(first)).digest();
  const secondHash = crypto.createHash("sha256").update(String(second)).digest();

  return crypto.timingSafeEqual(firstHash, secondHash);
}

function getAdminUser() {
  return {
    email: adminEmail,
    name: adminEmail.split("@")[0] || "Admin",
    role: "admin",
  };
}

function sanitizeFilenamePart(value) {
  return String(value || "poster")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "poster";
}

function getImageExtension(contentType) {
  if (contentType === "image/png") {
    return "png";
  }

  if (contentType === "image/webp") {
    return "webp";
  }

  return "jpg";
}

function isLocalHost(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

function normalizeStoredAssetUrl(value) {
  const url = String(value || "").trim();

  if (!url || url.startsWith("data:image/")) {
    return url;
  }

  if (url.startsWith("/uploads/")) {
    return url;
  }

  try {
    const parsed = new URL(url);
    const configuredHost = getHostname(configuredSiteUrl);

    if (parsed.pathname.startsWith("/uploads/") && (isLocalHost(parsed.hostname) || parsed.hostname === configuredHost)) {
      return parsed.pathname;
    }
  } catch (error) {
    return url;
  }

  return url;
}

async function persistPosterUrl(value, slug) {
  const posterUrl = String(value || "").trim();
  const match = posterUrl.match(/^data:(image\/(?:png|jpe?g|webp));base64,([a-z0-9+/=]+)$/i);

  if (!match) {
    return normalizeStoredAssetUrl(posterUrl);
  }

  const contentType = match[1].toLowerCase() === "image/jpg" ? "image/jpeg" : match[1].toLowerCase();
  const buffer = Buffer.from(match[2], "base64");

  if (!buffer.length || buffer.length > 8 * 1024 * 1024) {
    const error = new Error("Poster rasmi 8 MB dan kichik bo'lishi kerak.");
    error.statusCode = 400;
    throw error;
  }

  const contentHash = crypto.createHash("sha256").update(buffer).digest("hex");
  const filename = `${sanitizeFilenamePart(slug)}-${contentHash.slice(0, 16)}.${getImageExtension(contentType)}`;
  const collection = await getAssetsCollection();

  await collection.updateOne(
    { filename },
    {
      $set: {
        filename,
        contentHash,
        contentType,
        data: buffer,
        byteLength: buffer.length,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    },
    { upsert: true },
  );

  return `/uploads/posters/${filename}`;
}

function requireMongo(req, res, next) {
  if (!isMongoConfigured()) {
    res.status(503).json({
      error: "MongoDB ulanmagan. .env faylga MONGODB_URI kiriting.",
    });
    return;
  }

  next();
}

function requireAdmin(req, res, next) {
  const settingsError = getAuthSettingsError();

  if (settingsError) {
    res.status(503).json({ error: `Admin auth sozlanmagan: ${settingsError}` });
    return;
  }

  const tokenPayload = verifyAdminToken(getBearerToken(req));

  if (!tokenPayload) {
    res.status(401).json({ error: "Admin token noto'g'ri yoki muddati tugagan." });
    return;
  }

  next();
}

app.post("/api/auth/login", (req, res) => {
  const settingsError = getAuthSettingsError();

  if (settingsError) {
    res.status(503).json({ error: `Admin auth sozlanmagan: ${settingsError}` });
    return;
  }

  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (email !== adminEmail || !timingSafeStringEqual(password, adminPassword)) {
    res.status(401).json({ error: "Email yoki parol noto'g'ri." });
    return;
  }

  res.json({
    user: getAdminUser(),
    token: createAdminToken(),
  });
});

app.get("/api/auth/me", (req, res) => {
  const tokenPayload = verifyAdminToken(getBearerToken(req));

  if (!tokenPayload) {
    res.status(401).json({ error: "Session muddati tugagan." });
    return;
  }

  res.json({ user: getAdminUser() });
});

app.get("/uploads/posters/:filename", requireMongo, async (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const collection = await getAssetsCollection();
    const asset = await collection.findOne({ filename });

    if (!asset) {
      res.status(404).send("Poster topilmadi.");
      return;
    }

    const data = Buffer.isBuffer(asset.data) ? asset.data : Buffer.from(asset.data.buffer);

    res.type(asset.contentType || "image/jpeg");
    res.set("Cache-Control", "public, max-age=31536000, immutable");
    res.send(data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/api/health", async (req, res) => {
  if (!isMongoConfigured()) {
    res.json({ ok: true, mongoConfigured: false, mongoConnected: false });
    return;
  }

  try {
    const db = await getDatabase();
    await db.command({ ping: 1 });
    res.json({ ok: true, mongoConfigured: true, mongoConnected: true });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mongoConfigured: true,
      mongoConnected: false,
      error: error.message,
    });
  }
});

app.get("/api/movies", requireMongo, async (req, res) => {
  try {
    const collection = await getMoviesCollection();
    const movies = await collection
      .find({
        $and: [{ type: { $ne: "Serial" } }, { section: { $ne: "seriallar" } }],
      })
      .sort({ createdAt: -1, updatedAt: -1 })
      .toArray();
    res.json(movies.map(toClientMovie));
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

app.post("/api/movies", requireMongo, requireAdmin, async (req, res) => {
  try {
    const movie = normalizeMoviePayload(req.body);

    if (!movie.slug || !movie.titleUz || !movie.posterUrl) {
      res.status(400).json({ error: "Film nomi, slug va poster majburiy." });
      return;
    }

    movie.posterUrl = await persistPosterUrl(movie.posterUrl, movie.slug);

    const collection = await getMoviesCollection();
    const existing = await collection.findOne({ slug: movie.slug });
    const savedMovie = {
      ...movie,
      createdAt: existing?.createdAt || new Date(),
    };

    await collection.updateOne({ slug: movie.slug }, { $set: savedMovie }, { upsert: true });
    const document = await collection.findOne({ slug: movie.slug });

    res.status(existing ? 200 : 201).json(toClientMovie(document));
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

async function updateMovieHandler(req, res) {
  try {
    const collection = await getMoviesCollection();
    const filter = getMovieFilter(req.params.id);
    const existing = await collection.findOne(filter);

    if (!existing) {
      res.status(404).json({ error: "Film topilmadi." });
      return;
    }

    const movie = normalizeMoviePayload({
      ...existing,
      ...req.body,
      slug: req.body.slug || existing.slug,
    });
    movie.posterUrl = await persistPosterUrl(movie.posterUrl, movie.slug);

    await collection.updateOne(
      { _id: existing._id },
      {
        $set: {
          ...movie,
          createdAt: existing.createdAt || new Date(),
        },
      },
    );
    const document = await collection.findOne({ _id: existing._id });

    res.json(toClientMovie(document));
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
}

app.patch("/api/movies/:id", requireMongo, requireAdmin, updateMovieHandler);
app.put("/api/movies/:id", requireMongo, requireAdmin, updateMovieHandler);

app.delete("/api/movies/:id", requireMongo, requireAdmin, async (req, res) => {
  try {
    const collection = await getMoviesCollection();
    const result = await collection.deleteOne(getMovieFilter(req.params.id));
    res.json({ deleted: result.deletedCount > 0 });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

app.get("/api/series", requireMongo, async (req, res) => {
  try {
    const collection = await getSeriesCollection();
    const series = await collection.find({}).sort({ createdAt: -1, updatedAt: -1 }).toArray();
    res.json(series.map(toClientSeries));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/series/:id", requireMongo, async (req, res) => {
  try {
    const collection = await getSeriesCollection();
    const document = await collection.findOne(getSeriesFilter(req.params.id));

    if (!document) {
      res.status(404).json({ error: "Serial topilmadi." });
      return;
    }

    res.json(toClientSeries(document));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/series", requireMongo, requireAdmin, async (req, res) => {
  try {
    const series = normalizeSeriesPayload(req.body);

    if (!series.slug || !series.titleUz || !series.posterUrl) {
      res.status(400).json({ error: "Serial nomi, slug va poster majburiy." });
      return;
    }

    series.posterUrl = await persistPosterUrl(series.posterUrl, series.slug);

    const collection = await getSeriesCollection();
    const existing = await collection.findOne({ slug: series.slug });
    const savedSeries = {
      ...series,
      createdAt: existing?.createdAt || new Date(),
    };

    await collection.updateOne({ slug: series.slug }, { $set: savedSeries }, { upsert: true });
    const document = await collection.findOne({ slug: series.slug });

    res.status(existing ? 200 : 201).json(toClientSeries(document));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function updateSeriesHandler(req, res) {
  try {
    const collection = await getSeriesCollection();
    const filter = getSeriesFilter(req.params.id);
    const existing = await collection.findOne(filter);

    if (!existing) {
      res.status(404).json({ error: "Serial topilmadi." });
      return;
    }

    const series = normalizeSeriesPayload({
      ...existing,
      ...req.body,
      slug: req.body.slug || existing.slug,
      episodes: req.body.episodes || existing.episodes || [],
    });
    series.posterUrl = await persistPosterUrl(series.posterUrl, series.slug);

    await collection.updateOne(
      { _id: existing._id },
      {
        $set: {
          ...series,
          createdAt: existing.createdAt || new Date(),
        },
      },
    );
    const document = await collection.findOne({ _id: existing._id });

    res.json(toClientSeries(document));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

app.patch("/api/series/:id", requireMongo, requireAdmin, updateSeriesHandler);
app.put("/api/series/:id", requireMongo, requireAdmin, updateSeriesHandler);

app.delete("/api/series/:id", requireMongo, requireAdmin, async (req, res) => {
  try {
    const collection = await getSeriesCollection();
    const result = await collection.deleteOne(getSeriesFilter(req.params.id));
    res.json({ deleted: result.deletedCount > 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function getEpisodeSummary(episodes, fallbackSeasonsCount = 0) {
  const sortedEpisodes = sortEpisodes(episodes.map((episode) => normalizeEpisodePayload(episode, episode.id)));
  const seasonsCount = getDerivedSeasonCount(sortedEpisodes, fallbackSeasonsCount);

  return {
    episodes: sortedEpisodes,
    episodesCount: sortedEpisodes.length,
    seasonsCount,
    updatedAt: new Date(),
  };
}

app.post("/api/series/:id/episodes", requireMongo, requireAdmin, async (req, res) => {
  try {
    const collection = await getSeriesCollection();
    const existing = await collection.findOne(getSeriesFilter(req.params.id));

    if (!existing) {
      res.status(404).json({ error: "Serial topilmadi." });
      return;
    }

    const episode = normalizeEpisodePayload(req.body);

    if (!episode.title || !episode.videoUrl) {
      res.status(400).json({ error: "Qism nomi va video havola majburiy." });
      return;
    }

    const summary = getEpisodeSummary([...(existing.episodes || []), episode], existing.seasonsCount || 0);

    await collection.updateOne({ _id: existing._id }, { $set: summary });
    const document = await collection.findOne({ _id: existing._id });

    res.status(201).json(toClientSeries(document));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/series/:id/episodes/:episodeId", requireMongo, requireAdmin, async (req, res) => {
  try {
    const collection = await getSeriesCollection();
    const existing = await collection.findOne(getSeriesFilter(req.params.id));

    if (!existing) {
      res.status(404).json({ error: "Serial topilmadi." });
      return;
    }

    const episodes = (existing.episodes || []).map((episode) => normalizeEpisodePayload(episode, episode.id));
    const episodeIndex = episodes.findIndex((episode) => episode.id === req.params.episodeId);

    if (episodeIndex < 0) {
      res.status(404).json({ error: "Qism topilmadi." });
      return;
    }

    episodes[episodeIndex] = normalizeEpisodePayload({
      ...episodes[episodeIndex],
      ...req.body,
      id: episodes[episodeIndex].id,
    });

    const summary = getEpisodeSummary(episodes, existing.seasonsCount || 0);

    await collection.updateOne({ _id: existing._id }, { $set: summary });
    const document = await collection.findOne({ _id: existing._id });

    res.json(toClientSeries(document));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/series/:id/episodes/:episodeId", requireMongo, requireAdmin, async (req, res) => {
  try {
    const collection = await getSeriesCollection();
    const existing = await collection.findOne(getSeriesFilter(req.params.id));

    if (!existing) {
      res.status(404).json({ error: "Serial topilmadi." });
      return;
    }

    const episodes = (existing.episodes || []).filter((episode) => episode.id !== req.params.episodeId);
    const summary = getEpisodeSummary(episodes, 0);

    await collection.updateOne({ _id: existing._id }, { $set: summary });
    const document = await collection.findOne({ _id: existing._id });

    res.json(toClientSeries(document));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use((req, res, next) => {
  if (req.method !== "GET" || req.path.startsWith("/api/")) {
    next();
    return;
  }

  res.type("html").send(renderIndexHtml(req));
});

app.listen(port, () => {
  console.log(`KinoTime server running at ${configuredSiteUrl}`);
});
