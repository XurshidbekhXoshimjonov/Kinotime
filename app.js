// Catalog content is user-managed in MongoDB. Movies must not fall back to localStorage.
const RUNTIME_CONFIG = window.KINOTIME_CONFIG || {};
const PUBLIC_SITE_URL = normalizeBaseUrl(RUNTIME_CONFIG.siteUrl || window.location.origin);
const PUBLIC_API_URL = normalizeBaseUrl(RUNTIME_CONFIG.apiUrl || `${PUBLIC_SITE_URL}/api`);
const CATALOG_API_URL = buildApiUrl("/movies");
const SERIES_API_URL = buildApiUrl("/series");
const AUTH_API_URL = buildApiUrl("/auth");
const DOWNLOAD_HISTORY_API_URL = buildApiUrl("/download-history");
const ANALYTICS_API_URL = buildApiUrl("/analytics");
const ADMIN_STATS_API_URL = buildApiUrl("/admin/stats");
const POSTER_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='520' height='780' viewBox='0 0 520 780'%3E%3Crect width='520' height='780' fill='%23121722'/%3E%3Crect x='34' y='34' width='452' height='712' rx='28' fill='none' stroke='%23283144' stroke-width='4'/%3E%3Ctext x='260' y='390' fill='%23aab2c2' font-family='Arial,sans-serif' font-size='34' text-anchor='middle'%3EPoster%3C/text%3E%3C/svg%3E";
const CATALOG_ITEMS_PER_PAGE = 12;
const CATALOG_SORT_OPTIONS = [
  { value: "newest", label: "Yangi qo'shilganlar" },
  { value: "oldest", label: "Eskilar" },
];
const WORLD_COUNTRIES = [
  { label: "Afghanistan" },
  { label: "Albania" },
  { label: "Algeria" },
  { label: "Andorra" },
  { label: "Angola" },
  { label: "Antigua and Barbuda" },
  { label: "Argentina" },
  { label: "Armenia" },
  { label: "Australia" },
  { label: "Austria" },
  { label: "Azerbaijan", aliases: ["Ozarbayjon"] },
  { label: "Bahamas" },
  { label: "Bahrain" },
  { label: "Bangladesh" },
  { label: "Barbados" },
  { label: "Belarus" },
  { label: "Belgium" },
  { label: "Belize" },
  { label: "Benin" },
  { label: "Bhutan" },
  { label: "Bolivia" },
  { label: "Bosnia and Herzegovina" },
  { label: "Botswana" },
  { label: "Brazil" },
  { label: "Brunei" },
  { label: "Bulgaria" },
  { label: "Burkina Faso" },
  { label: "Burundi" },
  { label: "Cabo Verde" },
  { label: "Cambodia" },
  { label: "Cameroon" },
  { label: "Canada" },
  { label: "Central African Republic" },
  { label: "Chad" },
  { label: "Chile" },
  { label: "China", aliases: ["Xitoy"] },
  { label: "Colombia" },
  { label: "Comoros" },
  { label: "Congo" },
  { label: "Costa Rica" },
  { label: "Cote d'Ivoire" },
  { label: "Croatia" },
  { label: "Cuba" },
  { label: "Cyprus" },
  { label: "Czechia" },
  { label: "Democratic Republic of the Congo" },
  { label: "Denmark" },
  { label: "Djibouti" },
  { label: "Dominica" },
  { label: "Dominican Republic" },
  { label: "Ecuador" },
  { label: "Egypt" },
  { label: "El Salvador" },
  { label: "Equatorial Guinea" },
  { label: "Eritrea" },
  { label: "Estonia" },
  { label: "Eswatini" },
  { label: "Ethiopia" },
  { label: "Fiji" },
  { label: "Finland" },
  { label: "France" },
  { label: "Gabon" },
  { label: "Gambia" },
  { label: "Georgia", aliases: ["Gruziya"] },
  { label: "Germany" },
  { label: "Ghana" },
  { label: "Greece" },
  { label: "Grenada" },
  { label: "Guatemala" },
  { label: "Guinea" },
  { label: "Guinea-Bissau" },
  { label: "Guyana" },
  { label: "Haiti" },
  { label: "Honduras" },
  { label: "Hungary" },
  { label: "Iceland" },
  { label: "India", aliases: ["Hindiston"] },
  { label: "Indonesia" },
  { label: "Iran" },
  { label: "Iraq" },
  { label: "Ireland" },
  { label: "Israel" },
  { label: "Italy" },
  { label: "Jamaica" },
  { label: "Japan", aliases: ["Yaponiya"] },
  { label: "Jordan" },
  { label: "Kazakhstan", aliases: ["Qozog'iston", "Qozogiston"] },
  { label: "Kenya" },
  { label: "Kiribati" },
  { label: "Kuwait" },
  { label: "Kyrgyzstan", aliases: ["Qirg'iziston", "Qirgiziston"] },
  { label: "Laos" },
  { label: "Latvia" },
  { label: "Lebanon" },
  { label: "Lesotho" },
  { label: "Liberia" },
  { label: "Libya" },
  { label: "Liechtenstein" },
  { label: "Lithuania" },
  { label: "Luxembourg" },
  { label: "Madagascar" },
  { label: "Malawi" },
  { label: "Malaysia" },
  { label: "Maldives" },
  { label: "Mali" },
  { label: "Malta" },
  { label: "Marshall Islands" },
  { label: "Mauritania" },
  { label: "Mauritius" },
  { label: "Mexico" },
  { label: "Micronesia" },
  { label: "Moldova" },
  { label: "Monaco" },
  { label: "Mongolia" },
  { label: "Montenegro" },
  { label: "Morocco" },
  { label: "Mozambique" },
  { label: "Myanmar" },
  { label: "Namibia" },
  { label: "Nauru" },
  { label: "Nepal" },
  { label: "Netherlands" },
  { label: "New Zealand" },
  { label: "Nicaragua" },
  { label: "Niger" },
  { label: "Nigeria" },
  { label: "North Korea" },
  { label: "North Macedonia" },
  { label: "Norway" },
  { label: "Oman" },
  { label: "Pakistan" },
  { label: "Palau" },
  { label: "Palestine" },
  { label: "Panama" },
  { label: "Papua New Guinea" },
  { label: "Paraguay" },
  { label: "Peru" },
  { label: "Philippines" },
  { label: "Poland" },
  { label: "Portugal" },
  { label: "Qatar" },
  { label: "Romania" },
  { label: "Russia", aliases: ["Rossiya", "Russian Federation"] },
  { label: "Rwanda" },
  { label: "Saint Kitts and Nevis" },
  { label: "Saint Lucia" },
  { label: "Saint Vincent and the Grenadines" },
  { label: "Samoa" },
  { label: "San Marino" },
  { label: "Sao Tome and Principe" },
  { label: "Saudi Arabia" },
  { label: "Senegal" },
  { label: "Serbia" },
  { label: "Seychelles" },
  { label: "Sierra Leone" },
  { label: "Singapore" },
  { label: "Slovakia" },
  { label: "Slovenia" },
  { label: "Solomon Islands" },
  { label: "Somalia" },
  { label: "South Africa" },
  { label: "South Korea", aliases: ["Korea", "Koreya", "Janubiy Koreya"] },
  { label: "South Sudan" },
  { label: "Spain" },
  { label: "Sri Lanka" },
  { label: "Sudan" },
  { label: "Suriname" },
  { label: "Sweden" },
  { label: "Switzerland" },
  { label: "Syria" },
  { label: "Tajikistan", aliases: ["Tojikiston"] },
  { label: "Tanzania" },
  { label: "Thailand" },
  { label: "Timor-Leste" },
  { label: "Togo" },
  { label: "Tonga" },
  { label: "Trinidad and Tobago" },
  { label: "Tunisia" },
  { label: "Turkey", aliases: ["Turkiya"] },
  { label: "Turkmenistan" },
  { label: "Tuvalu" },
  { label: "Uganda" },
  { label: "Ukraine" },
  { label: "United Arab Emirates", aliases: ["UAE", "BAA"] },
  { label: "United Kingdom", aliases: ["UK", "Great Britain", "Britain", "Buyuk Britaniya", "Angliya"] },
  { label: "USA", aliases: ["United States", "United States of America", "AQSh", "Amerika"] },
  { label: "Uruguay" },
  { label: "Uzbekistan", aliases: ["O'zbekiston", "O‘zbekiston"] },
  { label: "Vanuatu" },
  { label: "Vatican City" },
  { label: "Venezuela" },
  { label: "Vietnam" },
  { label: "Yemen" },
  { label: "Zambia" },
  { label: "Zimbabwe" },
];
const UZBEK_COUNTRY_LABELS = {
  Afghanistan: "Afg'oniston",
  Albania: "Albaniya",
  Algeria: "Jazoir",
  Andorra: "Andorra",
  Angola: "Angola",
  "Antigua and Barbuda": "Antigua va Barbuda",
  Argentina: "Argentina",
  Armenia: "Armaniston",
  Australia: "Avstraliya",
  Austria: "Avstriya",
  Azerbaijan: "Ozarbayjon",
  Bahamas: "Bagama orollari",
  Bahrain: "Bahrayn",
  Bangladesh: "Bangladesh",
  Barbados: "Barbados",
  Belarus: "Belarus",
  Belgium: "Belgiya",
  Belize: "Beliz",
  Benin: "Benin",
  Bhutan: "Butan",
  Bolivia: "Boliviya",
  "Bosnia and Herzegovina": "Bosniya va Gersegovina",
  Botswana: "Botsvana",
  Brazil: "Braziliya",
  Brunei: "Bruney",
  Bulgaria: "Bolgariya",
  "Burkina Faso": "Burkina-Faso",
  Burundi: "Burundi",
  "Cabo Verde": "Kabo-Verde",
  Cambodia: "Kambodja",
  Cameroon: "Kamerun",
  Canada: "Kanada",
  "Central African Republic": "Markaziy Afrika Respublikasi",
  Chad: "Chad",
  Chile: "Chili",
  China: "Xitoy",
  Colombia: "Kolumbiya",
  Comoros: "Komor orollari",
  Congo: "Kongo",
  "Costa Rica": "Kosta-Rika",
  "Cote d'Ivoire": "Kot-d'Ivuar",
  Croatia: "Xorvatiya",
  Cuba: "Kuba",
  Cyprus: "Kipr",
  Czechia: "Chexiya",
  "Democratic Republic of the Congo": "Kongo Demokratik Respublikasi",
  Denmark: "Daniya",
  Djibouti: "Jibuti",
  Dominica: "Dominika",
  "Dominican Republic": "Dominikan Respublikasi",
  Ecuador: "Ekvador",
  Egypt: "Misr",
  "El Salvador": "Salvador",
  "Equatorial Guinea": "Ekvatorial Gvineya",
  Eritrea: "Eritreya",
  Estonia: "Estoniya",
  Eswatini: "Esvatini",
  Ethiopia: "Efiopiya",
  Fiji: "Fiji",
  Finland: "Finlyandiya",
  France: "Fransiya",
  Gabon: "Gabon",
  Gambia: "Gambiya",
  Georgia: "Gruziya",
  Germany: "Germaniya",
  Ghana: "Gana",
  Greece: "Gretsiya",
  Grenada: "Grenada",
  Guatemala: "Gvatemala",
  Guinea: "Gvineya",
  "Guinea-Bissau": "Gvineya-Bisau",
  Guyana: "Gayana",
  Haiti: "Gaiti",
  Honduras: "Gonduras",
  Hungary: "Vengriya",
  Iceland: "Islandiya",
  India: "Hindiston",
  Indonesia: "Indoneziya",
  Iran: "Eron",
  Iraq: "Iroq",
  Ireland: "Irlandiya",
  Israel: "Isroil",
  Italy: "Italiya",
  Jamaica: "Yamayka",
  Japan: "Yaponiya",
  Jordan: "Iordaniya",
  Kazakhstan: "Qozog'iston",
  Kenya: "Keniya",
  Kiribati: "Kiribati",
  Kuwait: "Quvayt",
  Kyrgyzstan: "Qirg'iziston",
  Laos: "Laos",
  Latvia: "Latviya",
  Lebanon: "Livan",
  Lesotho: "Lesoto",
  Liberia: "Liberiya",
  Libya: "Liviya",
  Liechtenstein: "Lixtenshteyn",
  Lithuania: "Litva",
  Luxembourg: "Lyuksemburg",
  Madagascar: "Madagaskar",
  Malawi: "Malavi",
  Malaysia: "Malayziya",
  Maldives: "Maldiv orollari",
  Mali: "Mali",
  Malta: "Malta",
  "Marshall Islands": "Marshall orollari",
  Mauritania: "Mavritaniya",
  Mauritius: "Mavrikiy",
  Mexico: "Meksika",
  Micronesia: "Mikroneziya",
  Moldova: "Moldova",
  Monaco: "Monako",
  Mongolia: "Mo'g'uliston",
  Montenegro: "Chernogoriya",
  Morocco: "Marokash",
  Mozambique: "Mozambik",
  Myanmar: "Myanma",
  Namibia: "Namibiya",
  Nauru: "Nauru",
  Nepal: "Nepal",
  Netherlands: "Niderlandiya",
  "New Zealand": "Yangi Zelandiya",
  Nicaragua: "Nikaragua",
  Niger: "Niger",
  Nigeria: "Nigeriya",
  "North Korea": "Shimoliy Koreya",
  "North Macedonia": "Shimoliy Makedoniya",
  Norway: "Norvegiya",
  Oman: "Ummon",
  Pakistan: "Pokiston",
  Palau: "Palau",
  Palestine: "Falastin",
  Panama: "Panama",
  "Papua New Guinea": "Papua-Yangi Gvineya",
  Paraguay: "Paragvay",
  Peru: "Peru",
  Philippines: "Filippin",
  Poland: "Polsha",
  Portugal: "Portugaliya",
  Qatar: "Qatar",
  Romania: "Ruminiya",
  Russia: "Rossiya",
  Rwanda: "Ruanda",
  "Saint Kitts and Nevis": "Sent-Kits va Nevis",
  "Saint Lucia": "Sent-Lyusiya",
  "Saint Vincent and the Grenadines": "Sent-Vinsent va Grenadinlar",
  Samoa: "Samoa",
  "San Marino": "San-Marino",
  "Sao Tome and Principe": "San-Tome va Prinsipi",
  "Saudi Arabia": "Saudiya Arabistoni",
  Senegal: "Senegal",
  Serbia: "Serbiya",
  Seychelles: "Seyshel orollari",
  "Sierra Leone": "Syerra-Leone",
  Singapore: "Singapur",
  Slovakia: "Slovakiya",
  Slovenia: "Sloveniya",
  "Solomon Islands": "Solomon orollari",
  Somalia: "Somali",
  "South Africa": "Janubiy Afrika",
  "South Korea": "Janubiy Koreya",
  "South Sudan": "Janubiy Sudan",
  Spain: "Ispaniya",
  "Sri Lanka": "Shri-Lanka",
  Sudan: "Sudan",
  Suriname: "Surinam",
  Sweden: "Shvetsiya",
  Switzerland: "Shveytsariya",
  Syria: "Suriya",
  Tajikistan: "Tojikiston",
  Tanzania: "Tanzaniya",
  Thailand: "Tailand",
  "Timor-Leste": "Sharqiy Timor",
  Togo: "Togo",
  Tonga: "Tonga",
  "Trinidad and Tobago": "Trinidad va Tobago",
  Tunisia: "Tunis",
  Turkey: "Turkiya",
  Turkmenistan: "Turkmaniston",
  Tuvalu: "Tuvalu",
  Uganda: "Uganda",
  Ukraine: "Ukraina",
  "United Arab Emirates": "Birlashgan Arab Amirliklari",
  "United Kingdom": "Buyuk Britaniya",
  USA: "AQSh",
  Uruguay: "Urugvay",
  Uzbekistan: "O'zbekiston",
  Vanuatu: "Vanuatu",
  "Vatican City": "Vatikan",
  Venezuela: "Venesuela",
  Vietnam: "Vetnam",
  Yemen: "Yaman",
  Zambia: "Zambiya",
  Zimbabwe: "Zimbabve",
};
const SHARED_GENRES = [
  "Action",
  "Adventure",
  "Animation",
  "Anime",
  "Biography",
  "Comedy",
  "Crime",
  "Detective",
  "Documentary",
  "Drama",
  "Family",
  "Fantasy",
  "History",
  "Horror",
  "Martial Arts",
  "Music",
  "Musical",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Sport",
  "Superhero",
  "Thriller",
  "War",
  "Western",
];
let catalogItems = [];
let movieCatalogItems = [];
let seriesCatalogItems = [];
syncCatalogItems();
let isMongoCatalogConnected = false;
let isMongoSeriesConnected = false;
let isCatalogLoading = true;

// Section settings: copy and accessible labels for each top navigation item.
const sectionConfig = {
  filmlar: {
    title: "Filmlar",
    subtitle: "Yangi va mashhur filmlarni tomosha qiling",
    searchPlaceholder: "Kino qidirish...",
    ariaLabel: "Filmlar ro'yxati",
  },
  seriallar: {
    title: "Seriallar",
    subtitle: "Yangi va mashhur seriallarni tomosha qiling",
    searchPlaceholder: "Serial qidirish...",
    ariaLabel: "Seriallar ro'yxati",
  },
  admin: {
    title: "Admin panel",
    subtitle: "",
    searchPlaceholder: "",
    ariaLabel: "Admin panel",
  },
};

// DOM references: cached once for predictable UI updates.
const kinoGrid = document.querySelector("#kino-grid");
const catalogTitle = document.querySelector("#catalog-title");
const catalogSubtitle = document.querySelector("#catalog-subtitle");
const catalogHeader = document.querySelector(".catalog-header");
const catalogSection = document.querySelector("#catalog-section");
const catalogFooter = document.querySelector("#catalog-footer");
const catalogStats = document.querySelector("#catalog-stats");
const catalogPagination = document.querySelector("#catalog-pagination");
const filterResetButton = document.querySelector("[data-filter-reset]");
const filterToggleButtons = document.querySelectorAll("[data-filter-toggle]");
const filterOptionMenus = document.querySelectorAll("[data-filter-options]");
const filterLabels = document.querySelectorAll("[data-filter-label]");
const detailPage = document.querySelector("#detail-page");
const detailContent = document.querySelector("#detail-content");
const adminPanel = document.querySelector("#admin-panel");
const adminGuard = document.querySelector("#admin-guard");
const adminWorkspace = document.querySelector("#admin-workspace");
const adminTitle = document.querySelector("#admin-title");
const adminMovieFormTitle = document.querySelector("#admin-movie-form-title");
const adminTabButtons = document.querySelectorAll("[data-admin-tab]");
const adminPanels = document.querySelectorAll("[data-admin-panel]");
const adminForm = document.querySelector("#admin-form");
const adminFeedback = document.querySelector("#admin-feedback");
const adminSubmitButton = document.querySelector(".admin-form__submit");
const adminMovieList = document.querySelector("#admin-movie-list");
const adminRefreshMovies = document.querySelector("#admin-refresh-movies");
const adminPreviewEditButton = document.querySelector("#admin-preview-edit");
const seriesCreateForm = document.querySelector("#series-create-form");
const seriesCreateEpisodes = document.querySelector("#series-create-episodes");
const seriesEditPanel = document.querySelector("#series-edit-panel");
const seriesEditForm = document.querySelector("#series-edit-form");
const seriesEditEpisodes = document.querySelector("#series-edit-episodes");
const seriesCancelEditButton = document.querySelector("#series-cancel-edit");
const seriesFeedback = document.querySelector("#series-feedback");
const adminSeriesList = document.querySelector("#admin-series-list");
const adminRefreshSeries = document.querySelector("#admin-refresh-series");
const seriesPreviewPanel = document.querySelector("#series-preview-panel");
const seriesPreviewContent = document.querySelector("#series-preview-content");
const seriesPreviewClose = document.querySelector("#series-preview-close");
const seriesEpisodePanel = document.querySelector("#series-episode-panel");
const seriesEpisodeSubtitle = document.querySelector("#series-episode-subtitle");
const seriesEpisodeForm = document.querySelector("#series-episode-form");
const seriesEpisodeSubmit = document.querySelector("#series-episode-submit");
const seriesEpisodeCancel = document.querySelector("#series-episode-cancel");
const seriesEpisodeList = document.querySelector("#series-episode-list");
const seriesCloseEpisodes = document.querySelector("#series-close-episodes");
const statisticsSummaryCards = document.querySelector("#statistics-summary-cards");
const statisticsChart7 = document.querySelector("#statistics-chart-7");
const statisticsChart30 = document.querySelector("#statistics-chart-30");
const statisticsTopViewed = document.querySelector("#statistics-top-viewed");
const statisticsTopDownloaded = document.querySelector("#statistics-top-downloaded");
const statisticsFeedback = document.querySelector("#statistics-feedback");
const adminRefreshStatistics = document.querySelector("#admin-refresh-statistics");
const authPage = document.querySelector("#auth-page");
const authPageTitle = document.querySelector("#auth-page-title");
const authPageSubtitle = document.querySelector("#auth-page-subtitle");
const authPageFeedback = document.querySelector("#auth-page-feedback");
const authPageSwitch = document.querySelector("#auth-page-switch");
const loginForm = document.querySelector("#login-form");
const signupForm = document.querySelector("#signup-form");
const previewPoster = document.querySelector("#preview-poster");
const previewTitle = document.querySelector("#preview-title");
const previewOriginal = document.querySelector("#preview-original");
const previewMeta = document.querySelector("#preview-meta");
const previewQuality = document.querySelector("#preview-quality");
const previewVideo = document.querySelector("#preview-video");
const previewFormat = document.querySelector("#preview-format");
const previewSize = document.querySelector("#preview-size");
const searchInput = document.querySelector("#search-input");
const homeLink = document.querySelector("[data-home-link]");
const backToCatalogButton = document.querySelector("[data-back-to-catalog]");
const sectionLinks = document.querySelectorAll("[data-section-link]");
const menuToggle = document.querySelector(".menu-toggle");
const authActions = document.querySelector(".auth-actions");
const authButtons = document.querySelectorAll("[data-auth-link]");
const profileMenu = document.querySelector("#profile-menu");
const profileToggle = document.querySelector("#profile-toggle");
const profileDropdown = document.querySelector("#profile-dropdown");
const profileAvatar = document.querySelector("#profile-avatar");
const profileName = document.querySelector("#profile-name");
const profilePageLink = document.querySelector("#profile-page-link");
const profileAdminLink = document.querySelector("#profile-admin-link");
const settingsPageLink = document.querySelector("#settings-page-link");
const logoutButton = document.querySelector("#logout-button");
const profilePage = document.querySelector("#profile-page");
const profilePageContent = document.querySelector("#profile-page-content");
const settingsPage = document.querySelector("#settings-page");
const settingsPageContent = document.querySelector("#settings-page-content");

let activeSection = "filmlar";
let searchTerm = "";
let currentCatalogPage = 1;
let catalogFilters = {
  genre: "",
  country: "",
  year: "",
  sort: "newest",
};
let activeDetailSection = "filmlar";
let slugEditedManually = false;
let posterPreviewDataUrl = "";
let isPosterProcessing = false;
let editingMovieSlug = "";
let isAdminMoviesLoading = false;
let activeAdminPanel = "movies";
let seriesCreateSlugEditedManually = false;
let seriesCreatePosterDataUrl = "";
let seriesEditPosterDataUrl = "";
let isSeriesPosterProcessing = false;
let editingSeriesId = "";
let selectedSeriesId = "";
let editingEpisodeId = "";
let isAdminSeriesLoading = false;
let isStatisticsLoading = false;
let lastStatisticsLoadedAt = 0;
let statisticsSnapshot = null;
let fallbackVisitorId = "";
let currentUser = null;
let pendingAuthRedirect = "";

const USERS_STORAGE_KEY = "kinotime.users";
const SESSION_STORAGE_KEY = "kinotime.session";
const DOWNLOAD_HISTORY_STORAGE_KEY = "kinotime.downloadHistory";
const VISITOR_ID_STORAGE_KEY = "kinotime.visitorId";
const PASSWORD_ITERATIONS = 120000;
const HASH_SECTION_ROUTES = new Set(["", "home", "filmlar", "seriallar", "admin", "login", "signup", "profile", "settings"]);

// Helpers: normalize text, build tags and render list values consistently.
function normalizeBaseUrl(value) {
  return value.toString().replace(/\/+$/, "");
}

function buildApiUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${PUBLIC_API_URL}${normalizedPath}`;
}

function isLocalAssetHost(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

function resolvePublicUrl(value) {
  const url = (value ?? "").toString().trim();

  if (!url || url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }

  if (url.startsWith("/")) {
    return `${PUBLIC_SITE_URL}${url}`;
  }

  try {
    const parsed = new URL(url);

    if (isLocalAssetHost(parsed.hostname) && parsed.pathname.startsWith("/uploads/")) {
      return `${PUBLIC_SITE_URL}${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
  } catch (error) {
    return url;
  }

  return url;
}

function getAuthHeaders(headers = {}) {
  const authHeaders = { ...headers };

  if (currentUser?.token) {
    authHeaders.Authorization = `Bearer ${currentUser.token}`;
  }

  return authHeaders;
}

function normalizeText(value) {
  return value.toString().trim().toLowerCase();
}

function createTag(label) {
  return `<span class="genre-tag">${label}</span>`;
}

function createSlug(value) {
  const transliterated = normalizeText(value)
    .replace(/[‘’']/g, "")
    .replace(/oʻ|o‘|o'/g, "o")
    .replace(/gʻ|g‘|g'/g, "g")
    .replace(/sh/g, "sh")
    .replace(/ch/g, "ch")
    .replace(/а/g, "a")
    .replace(/б/g, "b")
    .replace(/в/g, "v")
    .replace(/г/g, "g")
    .replace(/д/g, "d")
    .replace(/е/g, "e")
    .replace(/ё/g, "yo")
    .replace(/ж/g, "j")
    .replace(/з/g, "z")
    .replace(/и/g, "i")
    .replace(/й/g, "y")
    .replace(/к/g, "k")
    .replace(/л/g, "l")
    .replace(/м/g, "m")
    .replace(/н/g, "n")
    .replace(/о/g, "o")
    .replace(/п/g, "p")
    .replace(/р/g, "r")
    .replace(/с/g, "s")
    .replace(/т/g, "t")
    .replace(/у/g, "u")
    .replace(/ф/g, "f")
    .replace(/х/g, "x")
    .replace(/ц/g, "ts")
    .replace(/ч/g, "ch")
    .replace(/ш/g, "sh")
    .replace(/ъ|ь/g, "")
    .replace(/э/g, "e")
    .replace(/ю/g, "yu")
    .replace(/я/g, "ya");

  return transliterated
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatList(values) {
  return Array.isArray(values) ? values.join(", ") : values;
}

function splitCommaList(value) {
  return value
    .toString()
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

const GENRE_NORMALIZATION_MAP = {
  action: "Action",
  aksiya: "Action",
  adventure: "Adventure",
  sarguzasht: "Adventure",
  animation: "Animation",
  animatsiya: "Animation",
  anime: "Anime",
  biography: "Biography",
  biografiya: "Biography",
  comedy: "Comedy",
  komediya: "Comedy",
  crime: "Crime",
  jinoyat: "Crime",
  detective: "Detective",
  detektiv: "Detective",
  documentary: "Documentary",
  drama: "Drama",
  melodrama: "Drama",
  family: "Family",
  fantasy: "Fantasy",
  history: "History",
  historical: "History",
  horror: "Horror",
  qorqinchli: "Horror",
  "qo'rqinchli": "Horror",
  "qo‘rqinchli": "Horror",
  "martial arts": "Martial Arts",
  music: "Music",
  musical: "Musical",
  mystery: "Mystery",
  romance: "Romance",
  romantika: "Romance",
  "sci-fi": "Sci-Fi",
  scifi: "Sci-Fi",
  sci_fi: "Sci-Fi",
  sci: "Sci-Fi",
  "ilmiy fantastika": "Sci-Fi",
  fantastika: "Sci-Fi",
  sport: "Sport",
  superhero: "Superhero",
  thriller: "Thriller",
  triller: "Thriller",
  war: "War",
  western: "Western",
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

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  return value ? splitCommaList(value) : [];
}

function formatDuration(value) {
  const duration = value?.toString().trim() ?? "";

  if (!duration) {
    return "";
  }

  return /^\d+$/.test(duration) ? `${duration} daqiqa` : duration;
}

function isEpisodeCountDuration(value) {
  return /^\d+\s*(ta\s*)?(qism|qismlar|episode|episodes)\b/i.test(value.toString().trim());
}

function normalizeSeriesDuration(value) {
  const duration = value?.toString().trim() ?? "";

  if (!duration || isEpisodeCountDuration(duration)) {
    return "";
  }

  return formatDuration(duration);
}

function getSelectedValues(selectElement) {
  if (!selectElement) {
    return [];
  }

  return Array.from(selectElement.selectedOptions).map((option) => option.value);
}

function normalizeMovieSchema(item) {
  const titleUz = item.title ?? item.titleUz ?? "";
  const type = item.type ?? (item.section === "seriallar" ? "Serial" : "Film");
  const download1080p = item.downloads?.["1080p"] ?? {};
  const downloadFormat = download1080p.format ?? item.downloadFormat ?? item.format ?? "MP4";
  const downloadUrl = download1080p.url ?? item.download1080pUrl ?? "#";
  const downloadSize = download1080p.size ?? item.download1080pSize ?? "";
  const description = item.tavsif ?? item.description ?? "";

  return {
    id: item.id ?? item.slug,
    mongoId: item.mongoId ?? "",
    title: titleUz,
    titleUz,
    originalTitle: item.originalTitle ?? titleUz,
    slug: item.slug ?? item.id ?? createSlug(titleUz),
    tavsif: description,
    description,
    posterUrl: resolvePublicUrl(item.posterUrl ?? item.poster ?? POSTER_PLACEHOLDER),
    year: item.year,
    country: item.country ?? formatList(item.countries ?? []),
    genres: normalizeGenres(item.genres),
    languages: normalizeArray(item.languages),
    duration: formatDuration(item.duration),
    director: item.director ?? "",
    rating: Number(item.rating ?? 0),
    type,
    section: type === "Serial" ? "seriallar" : "filmlar",
    category: item.category ?? "",
    status: item.status ?? "Published",
    quality: "Full HD",
    videoSource: item.videoSource ?? "WEB-DL",
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
    createdAt: item.createdAt ?? "",
    updatedAt: item.updatedAt ?? "",
  };
}

function normalizeEpisodeSchema(item = {}, index = 0) {
  const title = (item.title ?? item.episodeTitle ?? "").toString().trim();
  const seasonNumber = Number(item.seasonNumber ?? item.season ?? 1) || 1;
  const episodeNumber = Number(item.episodeNumber ?? item.number ?? index + 1) || index + 1;
  const fallbackId = `${seasonNumber}-${episodeNumber}-${createSlug(title) || index + 1}`;
  const downloadLink = (item.downloadLink ?? item.videoUrl ?? item.downloadUrl ?? item.url ?? item.link ?? "")
    .toString()
    .trim();

  return {
    id: (item.id ?? item.episodeId ?? fallbackId).toString(),
    title: title || `Episode ${episodeNumber}`,
    episodeNumber,
    seasonNumber,
    quality: (item.quality ?? "Full HD").toString().trim(),
    videoSource: (item.videoSource ?? "WEB-DL").toString().trim(),
    format: (item.format ?? item.downloadFormat ?? "MP4").toString().trim(),
    fileSize: (item.fileSize ?? item.downloadSize ?? item.download1080pSize ?? "").toString().trim(),
    downloadLink,
    videoUrl: downloadLink,
    description: (item.description ?? "").toString().trim(),
    duration: (item.duration ?? "").toString().trim(),
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

function normalizeCount(value, fallback = "") {
  if (value === "" || value === null || value === undefined) {
    return fallback;
  }

  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    return fallback;
  }

  return Math.round(number);
}

function getDerivedSeasonCount(episodes) {
  return new Set(episodes.map((episode) => episode.seasonNumber).filter(Boolean)).size;
}

function getSeriesEpisodeCount(series) {
  const episodesCountValue =
    series?.episodesCount ??
    series?.episodeCount ??
    (Array.isArray(series?.episodes) ? undefined : series?.episodes);
  const normalizedCount = normalizeCount(episodesCountValue, "");

  if (normalizedCount !== "") {
    return normalizedCount;
  }

  return Array.isArray(series?.episodes) ? series.episodes.length : 0;
}

function normalizeSeriesSchema(item = {}) {
  const titleUz = item.title ?? item.titleUz ?? "";
  const description = item.tavsif ?? item.description ?? "";
  const rawGenres = normalizeGenres(item.genres);
  const genre = (item.genre ?? item.category ?? rawGenres[0] ?? "").toString().trim();
  const category = genre;
  const genres = rawGenres.length ? rawGenres : normalizeGenres(category);
  const episodes = sortEpisodes(
    (Array.isArray(item.episodes) ? item.episodes : []).map((episode, index) =>
      normalizeEpisodeSchema(episode, index),
    ),
  );
  const derivedEpisodeCount = episodes.length;
  const derivedSeasonCount = getDerivedSeasonCount(episodes);
  const seasonsCount = normalizeCount(item.seasonsCount ?? item.seasons, derivedSeasonCount || "");
  const episodesCountValue =
    item.episodesCount ??
    item.episodeCount ??
    (Array.isArray(item.episodes) ? undefined : item.episodes);
  const episodesCount = normalizeCount(episodesCountValue, derivedEpisodeCount || "");
  const firstEpisode = episodes[0] ?? {};
  const download1080p = item.downloads?.["1080p"] ?? {};
  const downloadFormat = download1080p.format ?? item.downloadFormat ?? item.format ?? firstEpisode.format ?? "MP4";
  const downloadUrl = download1080p.url ?? item.download1080pUrl ?? firstEpisode.videoUrl ?? "#";
  const downloadSize = download1080p.size ?? item.download1080pSize ?? firstEpisode.fileSize ?? "";

  return {
    id: item.id ?? item.slug ?? createSlug(titleUz),
    mongoId: item.mongoId ?? "",
    title: titleUz,
    titleUz,
    originalTitle: item.originalTitle ?? titleUz,
    slug: item.slug ?? item.id ?? createSlug(titleUz),
    tavsif: description,
    description,
    posterUrl: resolvePublicUrl(item.posterUrl ?? item.poster ?? POSTER_PLACEHOLDER),
    year: item.year,
    country: item.country ?? formatList(item.countries ?? []),
    genres,
    genre,
    category,
    languages: normalizeArray(item.languages),
    duration: normalizeSeriesDuration(item.duration ?? item.runtime ?? ""),
    director: item.director ?? "",
    rating: Number(item.rating ?? 0),
    type: "Serial",
    section: "seriallar",
    status: item.status ?? "Published",
    quality: "Full HD",
    videoSource: item.videoSource ?? firstEpisode.videoSource ?? "WEB-DL",
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
    createdAt: item.createdAt ?? "",
    updatedAt: item.updatedAt ?? "",
  };
}

function isSeriesLike(item) {
  return item?.type === "Serial" || item?.section === "seriallar" || Array.isArray(item?.episodes);
}

function forceMovieSchema(item) {
  const movie = normalizeMovieSchema(item);
  return {
    ...movie,
    type: "Film",
    section: "filmlar",
  };
}

function getResponseList(payload, key) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && Array.isArray(payload[key])) {
    return payload[key];
  }

  if (payload && Array.isArray(payload.data)) {
    return payload.data;
  }

  return [];
}

function syncCatalogItems() {
  catalogItems = [
    ...movieCatalogItems.map(forceMovieSchema),
    ...seriesCatalogItems.map(normalizeSeriesSchema),
  ];

  return catalogItems;
}

function saveMovieItems(items = movieCatalogItems) {
  movieCatalogItems = items.map(forceMovieSchema);
  syncCatalogItems();
}

function saveSeriesItems(items = seriesCatalogItems) {
  seriesCatalogItems = items.map(normalizeSeriesSchema);
  syncCatalogItems();
}

function saveCatalogItems(items) {
  movieCatalogItems = items.filter((item) => !isSeriesLike(item)).map(forceMovieSchema);
  seriesCatalogItems = items.filter(isSeriesLike).map(normalizeSeriesSchema);
  saveMovieItems(movieCatalogItems);
  saveSeriesItems(seriesCatalogItems);
}

function matchesContentId(item, identifier, normalizer) {
  const normalized = normalizer(item);
  return [getMovieRecordId(normalized), normalized.slug, normalized.id, normalized.mongoId].includes(identifier);
}

function upsertMovieItem(item) {
  const movie = forceMovieSchema(item);
  const movieIds = [getMovieRecordId(movie), movie.slug, movie.id, movie.mongoId].filter(Boolean);
  movieCatalogItems = [
    movie,
    ...movieCatalogItems.filter((existingItem) => {
      const existingMovie = forceMovieSchema(existingItem);
      const existingIds = [getMovieRecordId(existingMovie), existingMovie.slug, existingMovie.id, existingMovie.mongoId].filter(Boolean);
      return !existingIds.some((id) => movieIds.includes(id));
    }),
  ];
  saveMovieItems(movieCatalogItems);
  renderCards();
  renderAdminMovieList();
  return movie;
}

function upsertSeriesItem(item) {
  const series = normalizeSeriesSchema(item);
  const seriesIds = [getSeriesRecordId(series), series.slug, series.id, series.mongoId].filter(Boolean);
  seriesCatalogItems = [
    series,
    ...seriesCatalogItems.filter((existingItem) => {
      const existingSeries = normalizeSeriesSchema(existingItem);
      const existingIds = [
        getSeriesRecordId(existingSeries),
        existingSeries.slug,
        existingSeries.id,
        existingSeries.mongoId,
      ].filter(Boolean);
      return !existingIds.some((id) => seriesIds.includes(id));
    }),
  ];
  saveSeriesItems(seriesCatalogItems);
  renderCards();
  renderAdminSeriesList();
  renderEpisodePanel();
  return series;
}

async function loadMoviesFromApi() {
  try {
    const response = await fetch(CATALOG_API_URL, { headers: { Accept: "application/json" } });

    if (!response.ok) {
      throw new Error("MongoDB kino katalogini o'qib bo'lmadi.");
    }

    const payload = await response.json();
    const movies = getResponseList(payload, "movies");
    movieCatalogItems = movies.filter((item) => !isSeriesLike(item)).map(forceMovieSchema);
    saveMovieItems(movieCatalogItems);
    isMongoCatalogConnected = true;
    return "";
  } catch (error) {
    isMongoCatalogConnected = false;
    return error.message;
  }
}

async function loadSeriesFromApi() {
  try {
    const response = await fetch(SERIES_API_URL, { headers: { Accept: "application/json" } });

    if (!response.ok) {
      throw new Error("MongoDB serial katalogini o'qib bo'lmadi.");
    }

    const payload = await response.json();
    const series = getResponseList(payload, "series");
    seriesCatalogItems = series.map(normalizeSeriesSchema);
    saveSeriesItems(seriesCatalogItems);
    isMongoSeriesConnected = true;
    return "";
  } catch (error) {
    isMongoSeriesConnected = false;
    return error.message;
  }
}

async function loadCatalogFromApi() {
  if (hasAdminAccess()) {
    isAdminMoviesLoading = true;
    isAdminSeriesLoading = true;
    renderAdminMovieList();
    renderAdminSeriesList();
  }

  const [movieErrorMessage, seriesErrorMessage] = await Promise.all([loadMoviesFromApi(), loadSeriesFromApi()]);

  isCatalogLoading = false;
  syncCatalogItems();
  const didResolveDetailRoute = resolveHashDetailRoute();

  if (!didResolveDetailRoute) {
    renderCards();
  }

  if (hasAdminAccess()) {
    isAdminMoviesLoading = false;
    isAdminSeriesLoading = false;
    renderAdminMovieList(movieErrorMessage);
    renderAdminSeriesList(seriesErrorMessage);
  }
}

async function saveMovieToCatalog(movie, existingSlug = "") {
  const moviePayload = forceMovieSchema(movie);
  const endpoint = existingSlug ? `${CATALOG_API_URL}/${encodeURIComponent(existingSlug)}` : CATALOG_API_URL;
  const method = existingSlug ? "PATCH" : "POST";

  const response = await fetch(endpoint, {
    method,
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(moviePayload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || "MongoDB'ga saqlab bo'lmadi.");
  }

  const savedMovie = forceMovieSchema(await response.json());
  isMongoCatalogConnected = true;
  return {
    movie: upsertMovieItem(savedMovie),
    storage: "mongo",
  };
}

async function deleteMovieFromCatalog(slug) {
  const response = await fetch(`${CATALOG_API_URL}/${encodeURIComponent(slug)}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || "Filmni o'chirib bo'lmadi.");
  }

  isMongoCatalogConnected = true;
  movieCatalogItems = movieCatalogItems.filter((item) => {
    const movie = forceMovieSchema(item);
    return ![getMovieRecordId(movie), movie.slug, movie.id].includes(slug);
  });
  saveMovieItems(movieCatalogItems);
  renderCards();
  renderAdminMovieList();
}

async function saveSeriesToCatalog(series, existingId = "") {
  const seriesPayload = normalizeSeriesSchema(series);
  const endpoint = existingId ? `${SERIES_API_URL}/${encodeURIComponent(existingId)}` : SERIES_API_URL;
  const method = existingId ? "PATCH" : "POST";

  const response = await fetch(endpoint, {
    method,
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(seriesPayload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || "Serialni MongoDB'ga saqlab bo'lmadi.");
  }

  const savedSeries = normalizeSeriesSchema(await response.json());
  isMongoSeriesConnected = true;
  return {
    series: upsertSeriesItem(savedSeries),
    storage: "mongo",
  };
}

async function deleteSeriesFromCatalog(identifier) {
  const response = await fetch(`${SERIES_API_URL}/${encodeURIComponent(identifier)}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || "Serialni o'chirib bo'lmadi.");
  }

  isMongoSeriesConnected = true;
  seriesCatalogItems = seriesCatalogItems.filter((item) => {
    const series = normalizeSeriesSchema(item);
    return ![getSeriesRecordId(series), series.slug, series.id].includes(identifier);
  });

  if (selectedSeriesId === identifier) {
    clearEpisodePanel();
  }

  saveSeriesItems(seriesCatalogItems);
  renderCards();
  renderAdminSeriesList();
}

async function saveEpisodeForSeries(seriesIdentifier, episode, existingEpisodeId = "") {
  const series = findSeriesById(seriesIdentifier);

  if (!series) {
    throw new Error("Serial topilmadi.");
  }

  const endpoint = existingEpisodeId
    ? `${SERIES_API_URL}/${encodeURIComponent(seriesIdentifier)}/episodes/${encodeURIComponent(existingEpisodeId)}`
    : `${SERIES_API_URL}/${encodeURIComponent(seriesIdentifier)}/episodes`;
  const method = existingEpisodeId ? "PATCH" : "POST";

  const response = await fetch(endpoint, {
    method,
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(episode),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || "Qismni saqlab bo'lmadi.");
  }

  isMongoSeriesConnected = true;
  return upsertSeriesItem(await response.json());
}

async function deleteEpisodeFromSeries(seriesIdentifier, episodeId) {
  const series = findSeriesById(seriesIdentifier);

  if (!series) {
    throw new Error("Serial topilmadi.");
  }

  const response = await fetch(
    `${SERIES_API_URL}/${encodeURIComponent(seriesIdentifier)}/episodes/${encodeURIComponent(episodeId)}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    },
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || "Qismni o'chirib bo'lmadi.");
  }

  isMongoSeriesConnected = true;
  return upsertSeriesItem(await response.json());
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(new Error("Poster faylini o'qib bo'lmadi.")));
    reader.readAsDataURL(file);
  });
}

function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("Poster rasmini yuklab bo'lmadi.")));
    image.src = src;
  });
}

async function createPersistentPosterDataUrl(file) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Faqat rasm faylini yuklang.");
  }

  const sourceDataUrl = await readFileAsDataUrl(file);
  const image = await loadImageElement(sourceDataUrl);
  const maxWidth = 700;
  const maxHeight = 1050;
  const scale = Math.min(1, maxWidth / image.naturalWidth, maxHeight / image.naturalHeight);
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = width;
  canvas.height = height;
  context.fillStyle = "#121722";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  return canvas.toDataURL("image/jpeg", 0.86);
}

function normalizeCatalogItem(item) {
  return isSeriesLike(item) ? normalizeSeriesSchema(item) : forceMovieSchema(item);
}

function findMovieById(itemId) {
  const rawItem = catalogItems.find((item) => {
    const catalogItem = normalizeCatalogItem(item);
    return catalogItem.id === itemId || catalogItem.slug === itemId || catalogItem.mongoId === itemId;
  });

  return rawItem ? normalizeCatalogItem(rawItem) : null;
}

function findAdminMovieById(itemId) {
  const rawItem = movieCatalogItems.find((item) => {
    const movie = forceMovieSchema(item);
    return movie.id === itemId || movie.slug === itemId || movie.mongoId === itemId;
  });

  return rawItem ? forceMovieSchema(rawItem) : null;
}

function findSeriesById(itemId) {
  const rawItem = seriesCatalogItems.find((item) => {
    const series = normalizeSeriesSchema(item);
    return series.id === itemId || series.slug === itemId || series.mongoId === itemId;
  });

  return rawItem ? normalizeSeriesSchema(rawItem) : null;
}

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) ?? [];
  } catch (error) {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function getUserIdentity(user = currentUser) {
  return user?.id || user?.email || "";
}

function decodeHashValue(value) {
  try {
    return decodeURIComponent(value);
  } catch (error) {
    return value;
  }
}

function getHashRouteValue() {
  return decodeHashValue(window.location.hash.replace(/^#/, "")).trim();
}

function isSectionHashRoute(value) {
  return HASH_SECTION_ROUTES.has(value);
}

function getCatalogItemSlug(item) {
  return String(item?.slug ?? "").trim();
}

function findCatalogItemBySlug(slug) {
  const routeSlug = String(slug ?? "").trim();

  if (!routeSlug) {
    return null;
  }

  const movie = movieCatalogItems.map(forceMovieSchema).find((item) => getCatalogItemSlug(item) === routeSlug);

  if (movie) {
    return movie;
  }

  return seriesCatalogItems.map(normalizeSeriesSchema).find((item) => getCatalogItemSlug(item) === routeSlug) || null;
}

function openDetailRoute(slug) {
  const item = findCatalogItemBySlug(slug);

  if (!item) {
    return false;
  }

  openDetailPage(item, { updateHash: false });
  return true;
}

function resolveHashDetailRoute() {
  const hashValue = getHashRouteValue();

  if (!hashValue || isSectionHashRoute(hashValue)) {
    return false;
  }

  if (openDetailRoute(hashValue)) {
    return true;
  }

  if (!isCatalogLoading) {
    setSection("filmlar", false);
  }

  return false;
}

function routeFromCurrentHash({ shouldResetSearch = false } = {}) {
  const hashValue = getHashRouteValue();

  if (hashValue && !isSectionHashRoute(hashValue)) {
    if (openDetailRoute(hashValue)) {
      return true;
    }

    setSection("filmlar", shouldResetSearch);
    return false;
  }

  setSection(getSectionFromHash(), shouldResetSearch);
  return true;
}

function getStoredSession() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY));

    if (!session?.email) {
      return null;
    }

    if (session.role === "admin" && !session.token) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }

    return session;
  } catch (error) {
    return null;
  }
}

function createSession(user) {
  const session = {
    id: user.id || user.mongoId || user.email,
    email: user.email,
    name: user.name,
    role: user.role || "user",
    token: user.token || "",
    createdAt: user.createdAt || user.joinedAt || new Date().toISOString(),
    sessionCreatedAt: new Date().toISOString(),
  };

  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  currentUser = session;
  updateAuthUI();
}

function clearSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  currentUser = null;
  updateAuthUI();
}

async function restoreStoredSession() {
  const session = getStoredSession();

  if (!session) {
    return null;
  }

  if (!session.token) {
    return session;
  }

  const response = await fetch(`${AUTH_API_URL}/me`, {
    headers: getAuthHeadersForSession(session, { Accept: "application/json" }),
  }).catch(() => null);

  if (!response?.ok) {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }

  const payload = await response.json();
  const verifiedSession = {
    ...payload.user,
    token: session.token,
    createdAt: payload.user.createdAt || session.createdAt,
    sessionCreatedAt: session.sessionCreatedAt,
  };

  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(verifiedSession));
  return verifiedSession;
}

function getAuthHeadersForSession(session, headers = {}) {
  const authHeaders = { ...headers };

  if (session?.token) {
    authHeaders.Authorization = `Bearer ${session.token}`;
  }

  return authHeaders;
}

function bytesToBase64(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)));
}

function base64ToBytes(value) {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

async function hashPassword(password, saltBase64 = "") {
  const encoder = new TextEncoder();
  const salt = saltBase64 ? base64ToBytes(saltBase64) : crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: PASSWORD_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    256,
  );

  return {
    hash: bytesToBase64(derivedBits),
    salt: bytesToBase64(salt),
  };
}

async function registerUser({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const serverResponse = await fetch(`${AUTH_API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ name: name.trim(), email: normalizedEmail, password: password.toString() }),
  }).catch(() => null);

  if (serverResponse?.ok) {
    const payload = await serverResponse.json();
    const user = {
      ...payload.user,
      token: payload.token,
    };

    createSession(user);
    return user;
  }

  if (serverResponse && ![401, 503].includes(serverResponse.status)) {
    const errorBody = await serverResponse.json().catch(() => ({}));
    throw new Error(errorBody.error || "Profil yaratib bo'lmadi.");
  }

  const users = getUsers();

  if (users.some((user) => user.email === normalizedEmail)) {
    throw new Error("Bu email bilan profil mavjud.");
  }

  const passwordRecord = await hashPassword(password);
  const user = {
    id: crypto.randomUUID(),
    name: name.trim() || normalizedEmail,
    email: normalizedEmail,
    role: "user",
    passwordHash: passwordRecord.hash,
    passwordSalt: passwordRecord.salt,
    passwordIterations: PASSWORD_ITERATIONS,
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  saveUsers(users);
  createSession(user);
  return user;
}

async function loginUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  let serverAuthError = "";
  const authResponse = await fetch(`${AUTH_API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email: normalizedEmail, password: password.toString() }),
  }).catch(() => null);

  if (authResponse?.ok) {
    const payload = await authResponse.json();
    const user = {
      ...payload.user,
      token: payload.token,
    };

    createSession(user);
    return user;
  }

  if (authResponse && authResponse.status !== 401) {
    const errorBody = await authResponse.json().catch(() => ({}));
    serverAuthError = errorBody.error || "Admin login sozlamalarini tekshiring.";
  }

  const user = getUsers().find((item) => item.email === normalizedEmail);

  if (!user) {
    throw new Error(serverAuthError || "Email yoki parol noto'g'ri.");
  }

  const passwordRecord = await hashPassword(password, user.passwordSalt);

  if (passwordRecord.hash !== user.passwordHash) {
    throw new Error("Email yoki parol noto'g'ri.");
  }

  const localUser = {
    ...user,
    role: "user",
  };

  createSession(localUser);
  return localUser;
}

function updateCurrentSession(updates) {
  if (!currentUser) {
    return;
  }

  currentUser = {
    ...currentUser,
    ...updates,
  };
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(currentUser));
  updateAuthUI();
}

function getLocalCurrentUser() {
  const identity = getUserIdentity();

  if (!identity) {
    return null;
  }

  return getUsers().find((user) => user.id === identity || user.email === currentUser.email) || null;
}

async function updateUserDisplayName(name) {
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error("Ism bo'sh bo'lmasligi kerak.");
  }

  if (currentUser?.token) {
    const response = await fetch(`${AUTH_API_URL}/me`, {
      method: "PATCH",
      headers: getAuthHeaders({
        "Content-Type": "application/json",
        Accept: "application/json",
      }),
      body: JSON.stringify({ name: trimmedName }),
    });

    if (response.ok) {
      const payload = await response.json();
      updateCurrentSession({
        ...payload.user,
        token: currentUser.token,
        name: payload.user.name || trimmedName,
      });
      return currentUser;
    }

    if (currentUser.role !== "admin") {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.error || "Ismni saqlab bo'lmadi.");
    }
  }

  const users = getUsers();
  const index = users.findIndex((user) => user.id === currentUser.id || user.email === currentUser.email);

  if (index >= 0) {
    users[index] = {
      ...users[index],
      name: trimmedName,
      updatedAt: new Date().toISOString(),
    };
    saveUsers(users);
  }

  updateCurrentSession({ name: trimmedName });
  return currentUser;
}

async function changeUserPassword({ currentPassword, newPassword, confirmPassword }) {
  if (!currentPassword) {
    throw new Error("Joriy parol majburiy.");
  }

  if (newPassword.length < 6) {
    throw new Error("Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak.");
  }

  if (newPassword !== confirmPassword) {
    throw new Error("Yangi parol tasdiqlash bilan mos emas.");
  }

  if (currentUser?.token) {
    const response = await fetch(`${AUTH_API_URL}/change-password`, {
      method: "POST",
      headers: getAuthHeaders({
        "Content-Type": "application/json",
        Accept: "application/json",
      }),
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (response.ok) {
      return;
    }

    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || "Parolni o'zgartirib bo'lmadi.");
  }

  const users = getUsers();
  const index = users.findIndex((user) => user.id === currentUser.id || user.email === currentUser.email);
  const user = index >= 0 ? users[index] : null;

  if (!user) {
    throw new Error("Profil topilmadi.");
  }

  const currentPasswordRecord = await hashPassword(currentPassword, user.passwordSalt);

  if (currentPasswordRecord.hash !== user.passwordHash) {
    throw new Error("Joriy parol noto'g'ri.");
  }

  const newPasswordRecord = await hashPassword(newPassword);
  users[index] = {
    ...user,
    passwordHash: newPasswordRecord.hash,
    passwordSalt: newPasswordRecord.salt,
    passwordIterations: PASSWORD_ITERATIONS,
    updatedAt: new Date().toISOString(),
  };
  saveUsers(users);
}

function getLocalDownloadHistory() {
  try {
    return JSON.parse(localStorage.getItem(DOWNLOAD_HISTORY_STORAGE_KEY)) ?? [];
  } catch (error) {
    return [];
  }
}

function saveLocalDownloadHistory(history) {
  localStorage.setItem(DOWNLOAD_HISTORY_STORAGE_KEY, JSON.stringify(history));
}

function upsertLocalDownloadHistory(record) {
  const history = getLocalDownloadHistory();
  const index = history.findIndex(
    (item) => item.userId === record.userId && item.movieId === record.movieId && item.quality === record.quality,
  );

  if (index >= 0) {
    history[index] = {
      ...history[index],
      ...record,
      id: history[index].id,
      updatedAt: record.downloadedAt,
    };
  } else {
    history.unshift({
      id: crypto.randomUUID(),
      ...record,
      createdAt: record.downloadedAt,
    });
  }

  saveLocalDownloadHistory(history);
}

function getCurrentUserLocalDownloadHistory() {
  const userId = getUserIdentity();

  return getLocalDownloadHistory()
    .filter((item) => item.userId === userId)
    .sort((first, second) => new Date(second.downloadedAt) - new Date(first.downloadedAt));
}

async function fetchDownloadHistory() {
  if (!currentUser) {
    return [];
  }

  if (!currentUser.token) {
    return getCurrentUserLocalDownloadHistory();
  }

  const response = await fetch(`${DOWNLOAD_HISTORY_API_URL}/me`, {
    headers: getAuthHeaders({ Accept: "application/json" }),
  }).catch(() => null);

  if (!response?.ok) {
    return getCurrentUserLocalDownloadHistory();
  }

  return response.json();
}

function normalizeHistoryRecord(record) {
  return {
    userId: getUserIdentity(),
    movieId: record.movieId,
    title: record.title,
    poster: record.poster,
    quality: record.quality || "1080p",
    size: record.size || "",
    format: record.format || "MP4",
    downloadUrl: getSafeDownloadUrl(record.downloadUrl),
    downloadedAt: new Date().toISOString(),
  };
}

function getSafeDownloadUrl(value) {
  const url = (value || "").toString().trim();

  if (!url) {
    return "";
  }

  if (url.startsWith("/")) {
    return url;
  }

  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol) ? url : "";
  } catch (error) {
    return "";
  }
}

function createVisitorId() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `visitor-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function getVisitorId() {
  try {
    const storedVisitorId = localStorage.getItem(VISITOR_ID_STORAGE_KEY);

    if (storedVisitorId) {
      return storedVisitorId;
    }

    const visitorId = createVisitorId();
    localStorage.setItem(VISITOR_ID_STORAGE_KEY, visitorId);
    return visitorId;
  } catch (error) {
    if (!fallbackVisitorId) {
      fallbackVisitorId = createVisitorId();
    }

    return fallbackVisitorId;
  }
}

function shouldSendAnalytics() {
  return !hasAdminAccess();
}

function sendAnalyticsEvent(endpoint, payload, options = {}) {
  if (!shouldSendAnalytics()) {
    return;
  }

  const visitorId = getVisitorId();

  if (!visitorId) {
    return;
  }

  const body = JSON.stringify({
    ...payload,
    visitorId,
  });

  if (options.useBeacon && navigator.sendBeacon) {
    try {
      const blob = new Blob([body], { type: "application/json" });

      if (navigator.sendBeacon(endpoint, blob)) {
        return;
      }
    } catch (error) {
      // Fetch below keeps analytics failures isolated from navigation.
    }
  }

  fetch(endpoint, {
    method: "POST",
    keepalive: true,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body,
  }).catch(() => {});
}

function getAnalyticsPath() {
  return `${window.location.pathname}${window.location.search}${window.location.hash || ""}`;
}

function getContentAnalyticsId(item) {
  const normalized = normalizeCatalogItem(item);
  return normalized.slug || normalized.id || normalized.mongoId || "";
}

function trackPageView(movieId = "") {
  sendAnalyticsEvent(
    `${ANALYTICS_API_URL}/page-view`,
    {
      path: getAnalyticsPath(),
      movieId,
    },
    { useBeacon: true },
  );
}

function trackAnalyticsDownload(record) {
  const movieId = record.analyticsMovieId || record.movieId || "";

  if (!movieId) {
    return;
  }

  sendAnalyticsEvent(`${ANALYTICS_API_URL}/download-click`, {
    movieId,
  });
}

function trackDownload(record) {
  trackAnalyticsDownload(record);

  if (!currentUser) {
    return;
  }

  const historyRecord = normalizeHistoryRecord(record);
  upsertLocalDownloadHistory(historyRecord);

  if (!currentUser.token) {
    return;
  }

  fetch(DOWNLOAD_HISTORY_API_URL, {
    method: "POST",
    keepalive: true,
    headers: getAuthHeaders({
      "Content-Type": "application/json",
      Accept: "application/json",
    }),
    body: JSON.stringify(historyRecord),
  }).catch(() => {});
}

function hasAdminAccess() {
  return currentUser?.role === "admin" && Boolean(currentUser?.token);
}

function assertAdminAccess() {
  if (!hasAdminAccess()) {
    throw new Error("Admin access required");
  }
}

function getMultiSelectLabel(name) {
  return name === "genres" ? "Janr tanlanmagan" : "Til tanlanmagan";
}

function getMultiSelectRoot(target, form = adminForm) {
  if (!target) {
    return null;
  }

  if (typeof target === "string") {
    return form?.querySelector(`[data-multi-select="${target}"]`) ?? null;
  }

  if (target.matches?.("[data-multi-select]")) {
    return target;
  }

  return target.closest?.("[data-multi-select]") ?? null;
}

function getMultiSelectSelect(root) {
  return root?.querySelector(".multi-select__native") ?? root?.querySelector("select") ?? null;
}

function getFormForMultiSelect(root) {
  return root?.closest("form") ?? adminForm;
}

function setMultiSelectError(name, message = "", form = adminForm) {
  const root = getMultiSelectRoot(name, form);
  const error = root?.querySelector("[data-field-error]");

  if (!root || !error) {
    return;
  }

  root.classList.toggle("has-error", Boolean(message));
  error.textContent = message;
}

function setMultiSelectErrorForRoot(root, message = "") {
  const select = getMultiSelectSelect(root);

  if (!select) {
    return;
  }

  setMultiSelectError(select.name, message, getFormForMultiSelect(root));
}

function closeMultiSelectMenus(exceptRoot = null) {
  document.querySelectorAll("[data-multi-select]").forEach((root) => {
    if (root === exceptRoot) {
      return;
    }

    const menu = root.querySelector("[data-multi-menu]");
    const toggle = root.querySelector("[data-multi-toggle]");
    root.classList.remove("is-open");

    if (menu) {
      menu.hidden = true;
    }

    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

function renderMultiSelect(target, form = adminForm) {
  const root = getMultiSelectRoot(target, form);
  const select = getMultiSelectSelect(root);
  const tags = root?.querySelector("[data-selected-tags]");
  const menu = root?.querySelector("[data-multi-menu]");

  if (!select || !root || !tags || !menu) {
    return;
  }

  const selectedValues = getSelectedValues(select);
  tags.innerHTML = "";

  if (!selectedValues.length) {
    const placeholder = document.createElement("span");
    placeholder.className = "multi-select__placeholder";
    placeholder.textContent = getMultiSelectLabel(select.name);
    tags.append(placeholder);
  }

  selectedValues.forEach((value) => {
    const tag = document.createElement("span");
    const removeButton = document.createElement("button");

    tag.className = "multi-select__tag";
    tag.textContent = value;
    removeButton.className = "multi-select__remove";
    removeButton.type = "button";
    removeButton.dataset.removeValue = value;
    removeButton.setAttribute("aria-label", `${value} ni olib tashlash`);
    removeButton.textContent = "x";

    tag.append(removeButton);
    tags.append(tag);
  });

  menu.querySelectorAll(".multi-select__option").forEach((button) => {
    button.classList.toggle("is-selected", selectedValues.includes(button.dataset.value));
  });
}

function setSelectOptions(select, values) {
  if (!select) {
    return;
  }

  const selectedValues = getSelectedValues(select);
  select.innerHTML = "";
  values.forEach((value) => {
    const option = new Option(value, value);
    option.selected = selectedValues.includes(value);
    select.add(option);
  });
}

function hydrateSharedGenreSelects() {
  document.querySelectorAll("[data-shared-genres]").forEach((select) => {
    setSelectOptions(select, SHARED_GENRES);
  });
}

function initializeMultiSelect(root) {
  const select = getMultiSelectSelect(root);
  const toggle = root.querySelector("[data-multi-toggle]");
  const menu = root.querySelector("[data-multi-menu]");
  const tags = root.querySelector("[data-selected-tags]");

  if (!select || !toggle || !menu || !tags) {
    return;
  }

  menu.innerHTML = "";
  Array.from(select.options).forEach((option) => {
    const button = document.createElement("button");
    button.className = "multi-select__option";
    button.type = "button";
    button.dataset.value = option.value;
    button.textContent = option.value;
    menu.append(button);
  });

  toggle.addEventListener("click", () => {
    const willOpen = menu.hidden;
    closeMultiSelectMenus(root);
    menu.hidden = !willOpen;
    root.classList.toggle("is-open", willOpen);
    toggle.setAttribute("aria-expanded", willOpen.toString());
  });

  menu.addEventListener("click", (event) => {
    const optionButton = event.target.closest(".multi-select__option");

    if (!optionButton) {
      return;
    }

    const option = Array.from(select.options).find((item) => item.value === optionButton.dataset.value);
    option.selected = !option.selected;
    setMultiSelectErrorForRoot(root);
    renderMultiSelect(root);
    updatePreviewForForm(getFormForMultiSelect(root));
  });

  tags.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove-value]");

    if (!removeButton) {
      return;
    }

    const option = Array.from(select.options).find((item) => item.value === removeButton.dataset.removeValue);
    option.selected = false;
    renderMultiSelect(root);
    updatePreviewForForm(getFormForMultiSelect(root));
  });

  renderMultiSelect(root);
}

async function updateMovieBySlug(slug, updates) {
  assertAdminAccess();
  const index = movieCatalogItems.findIndex((item) => forceMovieSchema(item).slug === slug);

  if (index >= 0) {
    movieCatalogItems[index] = forceMovieSchema({ ...movieCatalogItems[index], ...updates });
    saveMovieItems(movieCatalogItems);
    renderCards();
  }

  if (isMongoCatalogConnected) {
    await fetch(`${CATALOG_API_URL}/${encodeURIComponent(slug)}`, {
      method: "PATCH",
      headers: getAuthHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(updates),
    }).catch(() => {});
  }
}

async function deleteMovieBySlug(slug) {
  assertAdminAccess();
  const index = movieCatalogItems.findIndex((item) => forceMovieSchema(item).slug === slug);

  if (index >= 0) {
    movieCatalogItems.splice(index, 1);
    saveMovieItems(movieCatalogItems);
    renderCards();
  }

  if (isMongoCatalogConnected) {
    await fetch(`${CATALOG_API_URL}/${encodeURIComponent(slug)}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).catch(() => {});
  }
}

function getSectionFromHash() {
  const hashValue = getHashRouteValue();

  if (hashValue === "seriallar") {
    return "seriallar";
  }

  if (hashValue === "admin") {
    return "admin";
  }

  if (hashValue === "login") {
    return "login";
  }

  if (hashValue === "signup") {
    return "signup";
  }

  if (hashValue === "profile") {
    return "profile";
  }

  if (hashValue === "settings") {
    return "settings";
  }

  if (!hashValue || hashValue === "home" || hashValue === "filmlar") {
    return "filmlar";
  }

  const routeName = window.location.pathname.replace(/\/+$/, "").split("/").pop();

  if (["admin", "login", "signup", "seriallar", "filmlar", "profile", "settings"].includes(routeName)) {
    return routeName;
  }

  return "filmlar";
}

function normalizeFilterText(value) {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[‘’ʻ]/g, "'")
    .replace(/[^a-z0-9а-яё' -]/g, " ")
    .replace(/\s+/g, " ");
}

function getCountryOption(value) {
  return WORLD_COUNTRIES.find((country) => country.label === value);
}

function getCountryDisplayLabel(value) {
  return UZBEK_COUNTRY_LABELS[value] || value;
}

function getCountrySearchValues(value) {
  const country = getCountryOption(value);
  return [value, getCountryDisplayLabel(value), ...(country?.aliases || [])]
    .map(normalizeFilterText)
    .filter(Boolean);
}

function getBaseCatalogItems() {
  return catalogItems
    .map(normalizeCatalogItem)
    .filter((item) => item.section === activeSection && item.status === "Published");
}

function getAvailableGenres(items = getBaseCatalogItems()) {
  const genreMap = new Map();

  items.forEach((item) => {
    normalizeGenres(item.genres).forEach((genre) => {
      const key = normalizeFilterText(genre);

      if (key && !genreMap.has(key)) {
        genreMap.set(key, genre);
      }
    });
  });

  return Array.from(genreMap.values()).sort((a, b) => a.localeCompare(b));
}

function getYearOptions(items = getBaseCatalogItems()) {
  const currentYear = new Date().getFullYear();
  const years = new Set();

  for (let year = currentYear; year >= 1900; year -= 1) {
    years.add(year.toString());
  }

  items.forEach((item) => {
    const year = Number(item.year);

    if (Number.isFinite(year) && year > 0) {
      years.add(Math.round(year).toString());
    }
  });

  return Array.from(years).sort((a, b) => Number(b) - Number(a));
}

function getSortLabel(value = catalogFilters.sort) {
  return CATALOG_SORT_OPTIONS.find((option) => option.value === value)?.label || CATALOG_SORT_OPTIONS[0].label;
}

function hasActiveCatalogFilters() {
  return Boolean(catalogFilters.genre || catalogFilters.country || catalogFilters.year || catalogFilters.sort !== "newest");
}

function closeFilterMenus(exceptType = "") {
  filterOptionMenus.forEach((menu) => {
    const type = menu.dataset.filterOptions;
    const shouldKeepOpen = exceptType && type === exceptType;
    menu.hidden = !shouldKeepOpen;
  });

  filterToggleButtons.forEach((button) => {
    const type = button.dataset.filterToggle;
    button.setAttribute("aria-expanded", (exceptType && type === exceptType).toString());
  });
}

function getFilterOptions(type, items = getBaseCatalogItems()) {
  if (type === "genre") {
    return [
      { value: "", label: "Barcha janrlar" },
      ...getAvailableGenres(items).map((genre) => ({ value: genre, label: genre })),
    ];
  }

  if (type === "country") {
    const countryOptions = WORLD_COUNTRIES.map((country) => ({
      value: country.label,
      label: getCountryDisplayLabel(country.label),
    })).sort((firstCountry, secondCountry) =>
      firstCountry.label.localeCompare(secondCountry.label, "uz", { sensitivity: "base" })
    );

    return [
      { value: "", label: "Barcha mamlakatlar" },
      ...countryOptions,
    ];
  }

  if (type === "year") {
    return [
      { value: "", label: "Barcha yillar" },
      ...getYearOptions(items).map((year) => ({ value: year, label: year })),
    ];
  }

  if (type === "sort") {
    return CATALOG_SORT_OPTIONS;
  }

  return [];
}

function renderFilterMenu(type, items) {
  const menu = document.querySelector(`[data-filter-options="${type}"]`);

  if (!menu) {
    return;
  }

  const options = getFilterOptions(type, items);
  const activeValue = catalogFilters[type] ?? "";

  if (!options.length) {
    menu.innerHTML = '<span class="filter-option filter-option--empty">Variant yo\'q</span>';
    return;
  }

  menu.innerHTML = options
    .map((option) => {
      const isActive = option.value === activeValue;
      return `
        <button class="filter-option${isActive ? " is-selected" : ""}" type="button" data-filter-type="${type}" data-filter-value="${escapeHtml(option.value)}">
          ${escapeHtml(option.label)}
        </button>
      `;
    })
    .join("");
}

function renderCatalogFilters() {
  const items = getBaseCatalogItems();

  renderFilterMenu("genre", items);
  renderFilterMenu("country", items);
  renderFilterMenu("year", items);
  renderFilterMenu("sort", items);

  filterLabels.forEach((label) => {
    const type = label.dataset.filterLabel;
    const value = catalogFilters[type];

    if (type === "genre") {
      label.textContent = value || "Janr";
    }

    if (type === "country") {
      label.textContent = value ? getCountryDisplayLabel(value) : "Mamlakat";
    }

    if (type === "year") {
      label.textContent = value || "Yil";
    }

    if (type === "sort") {
      label.textContent = getSortLabel(value);
    }
  });

  filterToggleButtons.forEach((button) => {
    const type = button.dataset.filterToggle;
    const isActive = type === "sort" ? catalogFilters.sort !== "newest" : Boolean(catalogFilters[type]);
    button.classList.toggle("filter-chip--active", isActive);
  });

  filterResetButton?.classList.toggle("filter-chip--active", !hasActiveCatalogFilters());
  filterResetButton?.setAttribute("aria-pressed", (!hasActiveCatalogFilters()).toString());
}

function resetCatalogFilters({ render = true, clearSearch = true } = {}) {
  catalogFilters = {
    genre: "",
    country: "",
    year: "",
    sort: "newest",
  };

  if (clearSearch) {
    searchTerm = "";

    if (searchInput) {
      searchInput.value = "";
    }
  }

  currentCatalogPage = 1;
  closeFilterMenus();

  if (render) {
    renderCards();
  }
}

function doesItemMatchGenre(item) {
  if (!catalogFilters.genre) {
    return true;
  }

  const activeGenre = normalizeFilterText(catalogFilters.genre);
  return normalizeGenres(item.genres).some((genre) => normalizeFilterText(genre) === activeGenre);
}

function doesItemMatchCountry(item) {
  if (!catalogFilters.country) {
    return true;
  }

  const countryText = normalizeFilterText(item.country || "");

  if (!countryText) {
    return false;
  }

  return getCountrySearchValues(catalogFilters.country).some((country) => countryText.includes(country));
}

function doesItemMatchYear(item) {
  if (!catalogFilters.year) {
    return true;
  }

  return Number(item.year) === Number(catalogFilters.year);
}

function getCatalogSortTimestamp(item) {
  const createdAt = Date.parse(item.createdAt);

  if (Number.isFinite(createdAt)) {
    return createdAt;
  }

  const updatedAt = Date.parse(item.updatedAt);

  if (Number.isFinite(updatedAt)) {
    return updatedAt;
  }

  const year = Number(item.year);

  if (Number.isFinite(year) && year > 0) {
    return new Date(Math.round(year), 0, 1).getTime();
  }

  return null;
}

function sortCatalogItems(items) {
  const direction = catalogFilters.sort === "oldest" ? 1 : -1;

  return [...items].sort((a, b) => {
    const aTime = getCatalogSortTimestamp(a);
    const bTime = getCatalogSortTimestamp(b);

    if (aTime !== null && bTime !== null && aTime !== bTime) {
      return (aTime - bTime) * direction;
    }

    if (aTime !== null && bTime === null) {
      return -1;
    }

    if (aTime === null && bTime !== null) {
      return 1;
    }

    return a.catalogIndex - b.catalogIndex;
  });
}

function getFilteredCatalogItems() {
  const normalizedSearchTerm = normalizeText(searchTerm);

  const items = getBaseCatalogItems()
    .map((item, catalogIndex) => ({ ...item, catalogIndex }))
    .filter((item) => {
      const searchableText = normalizeText(
        `${item.titleUz} ${item.originalTitle} ${item.genres.join(" ")} ${item.country} ${item.year}`,
      );
      const matchesSearch = searchableText.includes(normalizedSearchTerm);

      return (
        matchesSearch &&
        doesItemMatchGenre(item) &&
        doesItemMatchCountry(item) &&
        doesItemMatchYear(item)
      );
    });

  return sortCatalogItems(items);
}

// Rendering: draw cards from the active section and current search term.
function hideCatalogFooter() {
  if (!catalogFooter) {
    return;
  }

  catalogFooter.hidden = true;

  if (catalogStats) {
    catalogStats.textContent = "";
  }

  if (catalogPagination) {
    catalogPagination.innerHTML = "";
    catalogPagination.hidden = true;
  }
}

function getPaginationTokens(totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, currentCatalogPage - 1, currentCatalogPage, currentCatalogPage + 1]);

  if (currentCatalogPage <= 4) {
    [2, 3, 4, 5].forEach((page) => pages.add(page));
  }

  if (currentCatalogPage >= totalPages - 3) {
    [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1].forEach((page) => pages.add(page));
  }

  const sortedPages = Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  return sortedPages.flatMap((page, index) => {
    const previousPage = sortedPages[index - 1];

    if (index > 0 && page - previousPage > 1) {
      return [`ellipsis-${previousPage}-${page}`, page];
    }

    return [page];
  });
}

function renderCatalogFooter(totalItems, totalPages) {
  if (!catalogFooter) {
    return;
  }

  catalogFooter.hidden = false;

  if (catalogStats) {
    const contentLabel = activeSection === "seriallar" ? "serial" : "film";
    const dailyLabel = activeSection === "seriallar" ? "seriallar" : "filmlar";
    const formattedCount = totalItems.toLocaleString("uz-UZ");

    catalogStats.innerHTML = `
      <span><i class="ti ti-circle-dashed-check" aria-hidden="true"></i>${formattedCount} ${contentLabel}</span>
      <span>Har kuni yangi ${dailyLabel}</span>
    `;
  }

  if (!catalogPagination) {
    return;
  }

  if (totalPages <= 1) {
    catalogPagination.innerHTML = "";
    catalogPagination.hidden = true;
    return;
  }

  catalogPagination.hidden = false;
  catalogPagination.innerHTML = [
    `
      <button class="pagination-button pagination-button--icon" type="button" data-page-number="${currentCatalogPage - 1}" ${currentCatalogPage === 1 ? "disabled" : ""} aria-label="Oldingi sahifa">
        <i class="ti ti-chevron-left" aria-hidden="true"></i>
      </button>
    `,
    ...getPaginationTokens(totalPages).map((token) => {
      if (typeof token === "string") {
        return '<span class="pagination-ellipsis" aria-hidden="true">...</span>';
      }

      const isActive = token === currentCatalogPage;
      return `
        <button class="pagination-button${isActive ? " pagination-button--active" : ""}" type="button" data-page-number="${token}" ${isActive ? 'aria-current="page"' : ""}>
          ${token}
        </button>
      `;
    }),
    `
      <button class="pagination-button pagination-button--icon" type="button" data-page-number="${currentCatalogPage + 1}" ${currentCatalogPage === totalPages ? "disabled" : ""} aria-label="Keyingi sahifa">
        <i class="ti ti-chevron-right" aria-hidden="true"></i>
      </button>
    `,
  ].join("");
}

function renderCards() {
  if (isCatalogLoading) {
    const loadingLabel = activeSection === "seriallar" ? "Seriallar yuklanmoqda..." : "Filmlar yuklanmoqda...";
    kinoGrid.innerHTML = `
      <div class="catalog-empty" role="status" aria-live="polite">
        <i class="ti ti-loader-2" aria-hidden="true"></i>
        <h2>${loadingLabel}</h2>
      </div>
    `;
    hideCatalogFooter();
    return;
  }

  renderCatalogFilters();

  const filteredItems = getFilteredCatalogItems();

  if (!filteredItems.length) {
    const sectionLabel = activeSection === "seriallar" ? "seriallar" : "filmlar";
    const emptyTitle = searchTerm || hasActiveCatalogFilters() ? "Mos kontent topilmadi" : `Hozircha ${sectionLabel} yo'q`;
    const emptyText =
      searchTerm || hasActiveCatalogFilters()
        ? "Qidiruv yoki filtrlarni o'zgartirib qayta urinib ko'ring."
        : "Admin paneldan yangi kontent yuklanganda shu yerda paydo bo'ladi va saqlanib qoladi.";
    kinoGrid.innerHTML = `
      <div class="catalog-empty" role="status">
        <i class="ti ti-photo-off" aria-hidden="true"></i>
        <h2>${emptyTitle}</h2>
        <p>${emptyText}</p>
      </div>
    `;
    hideCatalogFooter();
    return;
  }

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / CATALOG_ITEMS_PER_PAGE));
  currentCatalogPage = Math.min(Math.max(currentCatalogPage, 1), totalPages);

  const pageStart = (currentCatalogPage - 1) * CATALOG_ITEMS_PER_PAGE;
  const paginatedItems = filteredItems.slice(pageStart, pageStart + CATALOG_ITEMS_PER_PAGE);

  kinoGrid.innerHTML = paginatedItems
    .map(
      (item) => `
        <button class="film-card" type="button" data-film-id="${escapeHtml(item.id)}" aria-label="${escapeHtml(item.titleUz)}">
          <span class="film-card__poster">
            <span class="rating-badge"><i class="ti ti-star-filled" aria-hidden="true"></i>${item.rating.toFixed(1)}</span>
            <img src="${escapeHtml(item.posterUrl)}" alt="${escapeHtml(item.titleUz)} posteri" loading="lazy" />
          </span>
          <span class="film-card__body">
            <span class="film-card__title">${escapeHtml(item.titleUz)}</span>
            <span class="film-card__info">
              <span class="film-card__genres">${escapeHtml(item.genres.slice(0, 2).join(", "))}</span>
              <span class="film-card__year">${item.year}</span>
            </span>
          </span>
        </button>
      `,
    )
    .join("");

  renderCatalogFooter(filteredItems.length, totalPages);
}

function escapeHtml(value) {
  return value
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDisplayDate(value, fallback = "Noma'lum") {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return new Intl.DateTimeFormat("uz-UZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getRoleLabel(role) {
  return role === "admin" ? "Admin" : "User";
}

function getUserInitial(user = currentUser) {
  return getUserLabel(user).charAt(0).toUpperCase() || "U";
}

function renderDownloadHistoryList(downloads = []) {
  if (!downloads.length) {
    return `
      <div class="account-empty">
        <i class="ti ti-download-off" aria-hidden="true"></i>
        <p>Hali hech qanday film yuklab olinmagan.</p>
      </div>
    `;
  }

  return `
    <div class="download-history-grid">
      ${downloads
        .map(
          (item) => `
            <article class="download-history-card">
              <img src="${escapeHtml(item.poster || POSTER_PLACEHOLDER)}" alt="${escapeHtml(item.title || "Film")} posteri" loading="lazy" />
              <div class="download-history-card__body">
                <h3>${escapeHtml(item.title || "Film")}</h3>
                <div class="download-history-card__tags">
                  <span>${escapeHtml(item.quality || "1080p")}</span>
                  ${item.size ? `<span>${escapeHtml(item.size)}</span>` : ""}
                  <span>${escapeHtml(item.format || "MP4")}</span>
                </div>
                <p>${escapeHtml(formatDisplayDate(item.downloadedAt))}</p>
              </div>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

async function renderProfilePage() {
  if (!profilePageContent || !currentUser) {
    return;
  }

  const label = getUserLabel(currentUser);
  profilePageContent.innerHTML = `
    <div class="account-layout">
      <section class="account-card account-card--hero">
        <div class="account-avatar-large">${escapeHtml(getUserInitial(currentUser))}</div>
        <div class="account-profile-main">
          <p class="account-kicker">Profil</p>
          <h1 id="profile-page-title">${escapeHtml(label)}</h1>
          <p>${escapeHtml(currentUser.email || "Email kiritilmagan")}</p>
        </div>
        <div class="account-status">
          <span class="account-status__dot"></span>
          Online
        </div>
      </section>

      <section class="account-card account-info-grid" aria-label="Profil ma'lumotlari">
        <div>
          <span>Rol</span>
          <strong>${escapeHtml(getRoleLabel(currentUser.role))}</strong>
        </div>
        <div>
          <span>Email</span>
          <strong>${escapeHtml(currentUser.email || "Noma'lum")}</strong>
        </div>
        <div>
          <span>Qo'shilgan sana</span>
          <strong>${escapeHtml(formatDisplayDate(currentUser.createdAt, "Noma'lum"))}</strong>
        </div>
        <div>
          <span>Holat</span>
          <strong>Online</strong>
        </div>
      </section>

      <section class="account-card">
        <div class="account-section-heading">
          <div>
            <p class="account-kicker">Tarix</p>
            <h2>Yuklab olingan filmlar</h2>
          </div>
        </div>
        <div id="download-history-content">
          <div class="account-empty">
            <i class="ti ti-loader-2" aria-hidden="true"></i>
            <p>Yuklab olishlar yuklanmoqda...</p>
          </div>
        </div>
      </section>
    </div>
  `;

  const historyContent = profilePageContent.querySelector("#download-history-content");
  const downloads = await fetchDownloadHistory();

  if (historyContent) {
    historyContent.innerHTML = renderDownloadHistoryList(downloads);
  }
}

function renderSettingsPage() {
  if (!settingsPageContent || !currentUser) {
    return;
  }

  settingsPageContent.innerHTML = `
    <div class="account-layout">
      <section class="account-page-header">
        <p class="account-kicker">Sozlamalar</p>
        <h1 id="settings-page-title">Profil sozlamalari</h1>
        <p>Ism va parolingizni xavfsiz yangilang.</p>
      </section>

      <div class="settings-grid">
        <form class="account-card account-form" id="settings-name-form" novalidate>
          <div class="account-section-heading">
            <div>
              <p class="account-kicker">Profil</p>
              <h2>Ismni o'zgartirish</h2>
            </div>
          </div>
          <p class="account-current-name">Hozirgi ism: <strong>${escapeHtml(getUserLabel(currentUser))}</strong></p>
          <label class="auth-field">
            <span class="auth-field__label">Ism</span>
            <div class="auth-field__control">
              <i class="ti ti-user auth-field__icon" aria-hidden="true"></i>
              <input type="text" name="name" value="${escapeHtml(getUserLabel(currentUser))}" autocomplete="name" />
            </div>
            <p class="auth-field__error" data-settings-error="name"></p>
          </label>
          <button class="auth-page__submit" type="submit">Saqlash</button>
          <p class="settings-feedback" data-settings-feedback="name" role="status"></p>
        </form>

        <form class="account-card account-form" id="settings-password-form" novalidate>
          <div class="account-section-heading">
            <div>
              <p class="account-kicker">Xavfsizlik</p>
              <h2>Parolni o'zgartirish</h2>
            </div>
          </div>
          <label class="auth-field">
            <span class="auth-field__label">Joriy parol</span>
            <div class="auth-field__control">
              <i class="ti ti-lock auth-field__icon" aria-hidden="true"></i>
              <input type="password" name="currentPassword" autocomplete="current-password" />
            </div>
          </label>
          <label class="auth-field">
            <span class="auth-field__label">Yangi parol</span>
            <div class="auth-field__control">
              <i class="ti ti-lock-plus auth-field__icon" aria-hidden="true"></i>
              <input type="password" name="newPassword" autocomplete="new-password" />
            </div>
          </label>
          <label class="auth-field">
            <span class="auth-field__label">Yangi parolni tasdiqlash</span>
            <div class="auth-field__control">
              <i class="ti ti-shield-check auth-field__icon" aria-hidden="true"></i>
              <input type="password" name="confirmPassword" autocomplete="new-password" />
            </div>
          </label>
          <button class="auth-page__submit" type="submit">Saqlash</button>
          <p class="settings-feedback" data-settings-feedback="password" role="status"></p>
        </form>
      </div>
    </div>
  `;
}

function renderAdminMovieList(errorMessage = "") {
  if (!adminMovieList) {
    return;
  }

  if (!hasAdminAccess()) {
    adminMovieList.innerHTML = "";
    return;
  }

  if (isAdminMoviesLoading) {
    adminMovieList.innerHTML = `
      <div class="admin-list-state">
        <i class="ti ti-loader-2" aria-hidden="true"></i>
        <span>Kinolar yuklanmoqda...</span>
      </div>
    `;
    return;
  }

  if (errorMessage) {
    adminMovieList.innerHTML = `
      <div class="admin-list-state admin-list-state--error">
        <i class="ti ti-alert-circle" aria-hidden="true"></i>
        <span>${escapeHtml(errorMessage)}</span>
      </div>
    `;
    return;
  }

  const movies = movieCatalogItems.map(forceMovieSchema);

  if (!movies.length) {
    adminMovieList.innerHTML = `
      <div class="admin-list-state">
        <i class="ti ti-database-off" aria-hidden="true"></i>
        <span>Hozircha MongoDB'da kino yo'q. Form orqali yangi kino qo'shing.</span>
      </div>
    `;
    return;
  }

  adminMovieList.innerHTML = movies
    .map((movie) => {
      const movieRecordId = movie.mongoId || movie.slug;
      const isSelected = Boolean(editingMovieSlug) && editingMovieSlug === movieRecordId;

      return `
        <article class="admin-movie-item added-movie-item${isSelected ? " is-selected" : ""}">
          <img class="admin-movie-item__poster added-movie-poster" src="${movie.posterUrl}" alt="${escapeHtml(movie.titleUz)} posteri" />
          <div class="admin-movie-item__body added-movie-info">
            <div>
              <h4 class="added-movie-title">${escapeHtml(movie.titleUz)}</h4>
              <p class="added-movie-meta">${escapeHtml(movie.originalTitle)} • ${movie.year} • ${escapeHtml(movie.type)}</p>
            </div>
            <div class="admin-movie-item__meta">
              <span class="added-movie-genres">${movie.genres.map(escapeHtml).join(", ")}</span>
            </div>
          </div>
          <div class="admin-movie-item__actions added-movie-actions">
            <button class="button button--ghost admin-movie-item__button" type="button" data-admin-edit="${escapeHtml(movieRecordId)}">
              <i class="ti ti-edit" aria-hidden="true"></i>
              Edit
            </button>
            <button class="button admin-movie-item__button admin-movie-item__button--danger" type="button" data-admin-delete="${escapeHtml(movieRecordId)}">
              <i class="ti ti-trash" aria-hidden="true"></i>
              Delete
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function getMovieRecordId(movie) {
  return movie?.mongoId || movie?.slug || movie?.id || "";
}

function getSeriesRecordId(series) {
  return series?.mongoId || series?.slug || series?.id || "";
}

function getSeriesCountText(series) {
  const seasonCount = Number(series.seasonsCount) || getDerivedSeasonCount(series.episodes);
  const episodeCount = getSeriesEpisodeCount(series);
  const parts = [];

  if (seasonCount) {
    parts.push(`${seasonCount} season${seasonCount === 1 ? "" : "s"}`);
  }

  if (episodeCount) {
    parts.push(`${episodeCount} episode${episodeCount === 1 ? "" : "s"}`);
  }

  return parts.join(" • ") || "Episodes not added";
}

function renderAdminSeriesList(errorMessage = "") {
  if (!adminSeriesList) {
    return;
  }

  if (!hasAdminAccess()) {
    adminSeriesList.innerHTML = "";
    return;
  }

  const seriesList = seriesCatalogItems.map(normalizeSeriesSchema);

  if (isAdminSeriesLoading && !seriesList.length) {
    adminSeriesList.innerHTML = `
      <div class="admin-list-state">
        <i class="ti ti-loader-2" aria-hidden="true"></i>
        <span>Seriallar yuklanmoqda...</span>
      </div>
    `;
    return;
  }

  if (errorMessage && !seriesList.length) {
    adminSeriesList.innerHTML = `
      <div class="admin-list-state admin-list-state--error">
        <i class="ti ti-alert-circle" aria-hidden="true"></i>
        <span>${escapeHtml(errorMessage)}</span>
      </div>
    `;
    return;
  }

  if (!seriesList.length) {
    adminSeriesList.innerHTML = `
      <div class="admin-list-state">
        <i class="ti ti-database-off" aria-hidden="true"></i>
        <span>Hozircha serial yo'q. Create Series formasidan yangi serial qo'shing.</span>
      </div>
    `;
    return;
  }

  const statusMarkup = errorMessage
    ? `
      <div class="admin-list-state admin-list-state--error">
        <i class="ti ti-alert-circle" aria-hidden="true"></i>
        <span>${escapeHtml(errorMessage)}</span>
      </div>
    `
    : "";

  adminSeriesList.innerHTML =
    statusMarkup +
    seriesList
    .map((series) => {
      const seriesRecordId = getSeriesRecordId(series);
      const isSelected =
        Boolean(editingSeriesId) &&
        [seriesRecordId, series.slug, series.id].includes(editingSeriesId);
      const genreText = series.genres.length ? series.genres.join(", ") : series.genre || series.category || "Janr";
      const countText = getSeriesCountText(series);

      return `
        <article class="admin-movie-item added-movie-item admin-series-card${isSelected ? " is-selected" : ""}">
          <img class="admin-movie-item__poster added-movie-poster admin-series-card__poster" src="${escapeHtml(series.posterUrl)}" alt="${escapeHtml(series.titleUz)} posteri" />
          <div class="admin-movie-item__body added-movie-info admin-series-card__body">
            <div>
              <h4 class="added-movie-title">${escapeHtml(series.titleUz)}</h4>
              <p class="added-movie-meta">${escapeHtml(series.originalTitle)} • ${series.year || "Year"} • Series</p>
            </div>
            <div class="admin-movie-item__meta admin-series-card__meta">
              <span class="added-movie-genres">${escapeHtml(genreText)}</span>
              <span>${escapeHtml(countText)}</span>
              <span>${escapeHtml(series.status)}</span>
            </div>
          </div>
          <div class="admin-movie-item__actions added-movie-actions admin-series-card__actions">
            <button class="button button--ghost admin-movie-item__button admin-series-card__button" type="button" data-series-preview="${escapeHtml(seriesRecordId)}">
              <i class="ti ti-eye" aria-hidden="true"></i>
              View
            </button>
            <button class="button button--ghost admin-movie-item__button admin-series-card__button" type="button" data-series-edit="${escapeHtml(seriesRecordId)}">
              <i class="ti ti-edit" aria-hidden="true"></i>
              Edit
            </button>
            <button class="button admin-movie-item__button admin-series-card__button admin-movie-item__button--danger" type="button" data-series-delete="${escapeHtml(seriesRecordId)}">
              <i class="ti ti-trash" aria-hidden="true"></i>
              Delete
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function formatMetric(value) {
  return new Intl.NumberFormat("en-US").format(Number(value || 0));
}

function setStatisticsFeedback(message = "", type = "") {
  if (!statisticsFeedback) {
    return;
  }

  statisticsFeedback.textContent = message;
  statisticsFeedback.className = "admin-form__feedback statistics-feedback";

  if (type) {
    statisticsFeedback.classList.add(`statistics-feedback--${type}`);
  }
}

function getSummaryCardMarkup(label, value, icon) {
  return `
    <article class="statistics-card">
      <span class="statistics-card__icon">
        <i class="ti ${icon}" aria-hidden="true"></i>
      </span>
      <div>
        <p>${escapeHtml(label)}</p>
        <strong>${escapeHtml(value)}</strong>
      </div>
    </article>
  `;
}

function renderStatisticsSummary(summary = {}) {
  if (!statisticsSummaryCards) {
    return;
  }

  const cards = [
    ["Today's visits", formatMetric(summary.todaysVisits), "ti-calendar-stats"],
    ["Total visits", formatMetric(summary.totalVisits), "ti-eye"],
    ["Online users right now", formatMetric(summary.onlineUsers), "ti-users"],
    ["Total movies", formatMetric(summary.totalMovies), "ti-movie"],
    ["Total series", formatMetric(summary.totalSeries), "ti-device-tv"],
    ["Total download clicks", formatMetric(summary.totalDownloadClicks), "ti-download"],
  ];

  statisticsSummaryCards.innerHTML = cards.map(([label, value, icon]) => getSummaryCardMarkup(label, value, icon)).join("");
}

function renderStatisticsLoading() {
  renderStatisticsSummary({
    todaysVisits: 0,
    totalVisits: 0,
    onlineUsers: 0,
    totalMovies: 0,
    totalSeries: 0,
    totalDownloadClicks: 0,
  });

  [statisticsChart7, statisticsChart30, statisticsTopViewed, statisticsTopDownloaded].forEach((container) => {
    if (!container) {
      return;
    }

    container.innerHTML = `
      <div class="admin-list-state">
        <i class="ti ti-loader-2" aria-hidden="true"></i>
        <span>Statistics loading...</span>
      </div>
    `;
  });
  setStatisticsFeedback("");
}

function renderStatisticsError(message) {
  [statisticsChart7, statisticsChart30, statisticsTopViewed, statisticsTopDownloaded].forEach((container) => {
    if (!container) {
      return;
    }

    container.innerHTML = `
      <div class="admin-list-state admin-list-state--error">
        <i class="ti ti-alert-circle" aria-hidden="true"></i>
        <span>${escapeHtml(message)}</span>
      </div>
    `;
  });
  setStatisticsFeedback(message, "error");
}

function renderStatisticsTable(container, rows = []) {
  if (!container) {
    return;
  }

  if (!rows.length) {
    container.innerHTML = `
      <div class="admin-list-state">
        <i class="ti ti-chart-bar-off" aria-hidden="true"></i>
        <span>No analytics data yet.</span>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <table class="statistics-table">
      <thead>
        <tr>
          <th>Poster</th>
          <th>Title</th>
          <th>Type</th>
          <th>View count</th>
          <th>Download count</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map((row) => {
            const posterUrl = resolvePublicUrl(row.poster || POSTER_PLACEHOLDER);

            return `
              <tr>
                <td>
                  <img class="statistics-table__poster" src="${escapeHtml(posterUrl)}" alt="${escapeHtml(row.title)} poster" loading="lazy" />
                </td>
                <td>
                  <strong>${escapeHtml(row.title)}</strong>
                </td>
                <td>
                  <span class="statistics-type">${escapeHtml(row.type === "series" ? "series" : "movie")}</span>
                </td>
                <td>${formatMetric(row.viewCount)}</td>
                <td>${formatMetric(row.downloadCount)}</td>
              </tr>
            `;
          })
          .join("")}
      </tbody>
    </table>
  `;
}

function renderStatisticsChart(container, chart = {}) {
  if (!container) {
    return;
  }

  const days = Array.isArray(chart.days) ? chart.days : [];

  if (!days.length) {
    container.innerHTML = `
      <div class="admin-list-state">
        <i class="ti ti-chart-line" aria-hidden="true"></i>
        <span>No chart data yet.</span>
      </div>
    `;
    return;
  }

  const maxValue = Math.max(
    1,
    ...days.flatMap((item) => [Number(item.visits || 0), Number(item.downloadClicks || 0)]),
  );

  container.innerHTML = `
    <div class="statistics-chart__legend">
      <span><i class="statistics-dot statistics-dot--visits" aria-hidden="true"></i> Daily visits</span>
      <span><i class="statistics-dot statistics-dot--downloads" aria-hidden="true"></i> Daily download clicks</span>
    </div>
    <div class="statistics-chart__plot">
      ${days
        .map((item) => {
          const visits = Number(item.visits || 0);
          const downloads = Number(item.downloadClicks || 0);
          const visitHeight = Math.max(3, Math.round((visits / maxValue) * 100));
          const downloadHeight = Math.max(3, Math.round((downloads / maxValue) * 100));

          return `
            <div class="statistics-chart__day">
              <div class="statistics-chart__bars" title="${escapeHtml(item.day)}: ${visits} visits, ${downloads} downloads">
                <span class="statistics-chart__bar statistics-chart__bar--visits" style="height: ${visitHeight}%"></span>
                <span class="statistics-chart__bar statistics-chart__bar--downloads" style="height: ${downloadHeight}%"></span>
              </div>
              <span class="statistics-chart__label">${escapeHtml(item.label || item.day)}</span>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderStatisticsDashboard(snapshot) {
  if (!snapshot) {
    return;
  }

  renderStatisticsSummary(snapshot.summary);
  renderStatisticsChart(statisticsChart7, snapshot.chart7);
  renderStatisticsChart(statisticsChart30, snapshot.chart30);
  renderStatisticsTable(statisticsTopViewed, snapshot.topMovies?.topViewed || []);
  renderStatisticsTable(statisticsTopDownloaded, snapshot.topMovies?.topDownloaded || []);
  setStatisticsFeedback(`Updated ${new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}.`, "success");
}

async function fetchAdminStatsJson(path) {
  const response = await fetch(`${ADMIN_STATS_API_URL}${path}`, {
    headers: getAuthHeaders({ Accept: "application/json" }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || "Statistics could not be loaded.");
  }

  return response.json();
}

async function loadAdminStatistics(options = {}) {
  if (!hasAdminAccess() || !statisticsSummaryCards) {
    return;
  }

  if (isStatisticsLoading) {
    return;
  }

  const canUseSnapshot =
    statisticsSnapshot &&
    !options.force &&
    Date.now() - lastStatisticsLoadedAt < 30 * 1000;

  if (canUseSnapshot) {
    renderStatisticsDashboard(statisticsSnapshot);
    return;
  }

  isStatisticsLoading = true;
  renderStatisticsLoading();

  try {
    const [summary, topMovies, chart7, chart30] = await Promise.all([
      fetchAdminStatsJson("/summary"),
      fetchAdminStatsJson("/top-movies"),
      fetchAdminStatsJson("/chart?range=7"),
      fetchAdminStatsJson("/chart?range=30"),
    ]);

    statisticsSnapshot = {
      summary,
      topMovies,
      chart7,
      chart30,
    };
    lastStatisticsLoadedAt = Date.now();
    renderStatisticsDashboard(statisticsSnapshot);
  } catch (error) {
    renderStatisticsError(error.message);
  } finally {
    isStatisticsLoading = false;
  }
}

function getSeriesEpisodeContainer(form) {
  return form === seriesEditForm ? seriesEditEpisodes : seriesCreateEpisodes;
}

function createSeriesEpisodeRow(episode = {}, index = 0) {
  const item = normalizeEpisodeSchema(episode, index);
  const row = document.createElement("article");
  row.className = "series-episode-row";
  row.dataset.episodeId = item.id;
  row.innerHTML = `
    <input type="hidden" class="episode-id" value="${escapeHtml(item.id)}" />
    <label class="field">
      <span>Season</span>
      <input class="episode-season" type="number" min="1" value="${escapeHtml(item.seasonNumber)}" required />
    </label>
    <label class="field">
      <span>Episode</span>
      <input class="episode-number" type="number" min="1" value="${escapeHtml(item.episodeNumber)}" required />
    </label>
    <label class="field">
      <span>Episode title</span>
      <input class="episode-title" type="text" value="${escapeHtml(item.title)}" required />
    </label>
    <label class="field">
      <span>Quality</span>
      <input class="episode-quality" type="text" value="${escapeHtml(item.quality || "Full HD")}" required />
    </label>
    <label class="field">
      <span>Video source</span>
      <select class="episode-video-source" required>
        <option value="WEB-DL"${item.videoSource === "WEB-DL" ? " selected" : ""}>WEB-DL</option>
        <option value="WEBRip"${item.videoSource === "WEBRip" ? " selected" : ""}>WEBRip</option>
        <option value="BluRay"${item.videoSource === "BluRay" ? " selected" : ""}>BluRay</option>
        <option value="BDRip"${item.videoSource === "BDRip" ? " selected" : ""}>BDRip</option>
        <option value="HDRip"${item.videoSource === "HDRip" ? " selected" : ""}>HDRip</option>
        <option value="HDTV"${item.videoSource === "HDTV" ? " selected" : ""}>HDTV</option>
        <option value="DVDRip"${item.videoSource === "DVDRip" ? " selected" : ""}>DVDRip</option>
      </select>
    </label>
    <label class="field">
      <span>Format</span>
      <select class="episode-format" required>
        <option value="MP4"${item.format === "MP4" ? " selected" : ""}>MP4</option>
        <option value="MKV"${item.format === "MKV" ? " selected" : ""}>MKV</option>
        <option value="AVI"${item.format === "AVI" ? " selected" : ""}>AVI</option>
        <option value="MOV"${item.format === "MOV" ? " selected" : ""}>MOV</option>
      </select>
    </label>
    <label class="field">
      <span>File size</span>
      <input class="episode-file-size" type="text" value="${escapeHtml(item.fileSize)}" placeholder="1.2 GB" />
    </label>
    <label class="field">
      <span>Download/video URL</span>
      <input class="episode-download-link" type="url" value="${escapeHtml(item.downloadLink || item.videoUrl)}" required />
    </label>
    <label class="field field--wide">
      <span>Optional description</span>
      <textarea class="episode-description" rows="2" maxlength="600">${escapeHtml(item.description || item.duration)}</textarea>
    </label>
    <div class="series-episode-row__actions">
      <button class="button admin-movie-item__button--danger" type="button" data-remove-episode>
        <i class="ti ti-trash" aria-hidden="true"></i>
        Remove Episode
      </button>
    </div>
  `;
  return row;
}

function renderSeriesEpisodeRows(form, episodes = []) {
  const container = getSeriesEpisodeContainer(form);

  if (!container) {
    return;
  }

  container.innerHTML = "";
  episodes.map(normalizeEpisodeSchema).forEach((episode, index) => {
    container.append(createSeriesEpisodeRow(episode, index));
  });
  syncSeriesEpisodeCounts(form);
}

function getSeriesEpisodesFromForm(form) {
  const container = getSeriesEpisodeContainer(form);

  if (!container) {
    return [];
  }

  return sortEpisodes(
    Array.from(container.querySelectorAll(".series-episode-row")).map((row, index) =>
      normalizeEpisodeSchema(
        {
          id: row.querySelector(".episode-id")?.value || crypto.randomUUID(),
          seasonNumber: row.querySelector(".episode-season")?.value,
          episodeNumber: row.querySelector(".episode-number")?.value,
          title: row.querySelector(".episode-title")?.value,
          quality: row.querySelector(".episode-quality")?.value,
          videoSource: row.querySelector(".episode-video-source")?.value,
          format: row.querySelector(".episode-format")?.value,
          fileSize: row.querySelector(".episode-file-size")?.value,
          downloadLink: row.querySelector(".episode-download-link")?.value,
          description: row.querySelector(".episode-description")?.value,
        },
        index,
      ),
    ),
  );
}

function syncSeriesEpisodeCounts(form) {
  const episodes = getSeriesEpisodesFromForm(form);
  const seasonsField = form.elements.namedItem("seasonsCount");
  const episodesField = form.elements.namedItem("episodesCount");

  if (episodes.length) {
    if (seasonsField) {
      seasonsField.value = getDerivedSeasonCount(episodes) || "";
    }

    if (episodesField) {
      episodesField.value = episodes.length;
    }
  } else if (document.activeElement?.closest(".series-episode-rows")) {
    if (seasonsField) {
      seasonsField.value = "";
    }

    if (episodesField) {
      episodesField.value = "";
    }
  }
}

function getSeriesFormPayload(form, posterDataUrl = "", existingSeries = null) {
  const formData = new FormData(form);
  const titleUz = formData.get("titleUz").toString().trim();
  const slug = formData.get("slug").toString().trim() || createSlug(titleUz);
  const genres = getSelectedValues(form.elements.namedItem("genres"));
  const genre = genres[0] || "";
  const languages = getSelectedValues(form.elements.namedItem("languages"));
  const posterUrl = formData.get("posterUrl").toString().trim() || posterDataUrl || existingSeries?.posterUrl || "";
  const episodes = getSeriesEpisodesFromForm(form);
  const seasonsCount = formData.get("seasonsCount").toString().trim();
  const episodesCount = formData.get("episodesCount").toString().trim();
  const duration = formData.get("duration").toString().trim();

  return normalizeSeriesSchema({
    ...existingSeries,
    id: existingSeries?.id || slug,
    titleUz,
    originalTitle: formData.get("originalTitle").toString().trim(),
    slug,
    description: formData.get("description").toString().trim(),
    posterUrl,
    year: Number(formData.get("year")) || new Date().getFullYear(),
    country: formData.get("country").toString().trim(),
    duration,
    genres,
    genre,
    category: genre,
    languages,
    seasonsCount: seasonsCount ? Number(seasonsCount) : getDerivedSeasonCount(episodes),
    episodesCount: episodesCount ? Number(episodesCount) : episodes.length,
    rating: Number(formData.get("rating")) || 0,
    status: formData.get("status").toString(),
    episodes,
  });
}

function validateSeriesForm(form, posterDataUrl = "", existingSeries = null) {
  const requiredFields = Array.from(form.querySelectorAll("[required]")).filter(
    (field) => !field.classList.contains("multi-select__native"),
  );
  const firstEmptyField = requiredFields.find((field) => !field.value.trim());
  const genres = getSelectedValues(form.elements.namedItem("genres"));
  const languages = getSelectedValues(form.elements.namedItem("languages"));
  const posterUrl = form.elements.namedItem("posterUrl").value.trim() || posterDataUrl || existingSeries?.posterUrl;

  setMultiSelectError("genres", "", form);
  setMultiSelectError("languages", "", form);

  if (isSeriesPosterProcessing) {
    seriesFeedback.textContent = "Poster hali tayyorlanmoqda. Bir necha soniya kuting.";
    return false;
  }

  if (firstEmptyField) {
    firstEmptyField.focus();
    seriesFeedback.textContent = "Majburiy maydonlarni to'ldiring.";
    return false;
  }

  if (!genres.length) {
    setMultiSelectError("genres", "Kamida bitta janr tanlang.", form);
    seriesFeedback.textContent = "Kamida bitta janr tanlang.";
    return false;
  }

  if (!languages.length) {
    setMultiSelectError("languages", "Kamida bitta til tanlang.", form);
    seriesFeedback.textContent = "Kamida bitta til tanlang.";
    return false;
  }

  if (!posterUrl) {
    form.elements.namedItem("posterFile").focus();
    seriesFeedback.textContent = "Serial posteri uchun rasm yuklang yoki URL kiriting.";
    return false;
  }

  return true;
}

function setSeriesFormValues(form, series) {
  form.elements.namedItem("titleUz").value = series.titleUz;
  form.elements.namedItem("originalTitle").value = series.originalTitle;
  form.elements.namedItem("slug").value = series.slug;
  form.elements.namedItem("description").value = series.description;
  form.elements.namedItem("year").value = series.year || new Date().getFullYear();
  form.elements.namedItem("country").value = series.country;
  form.elements.namedItem("duration").value = series.duration || "";
  form.elements.namedItem("seasonsCount").value = series.seasonsCount ?? "";
  form.elements.namedItem("episodesCount").value = series.episodesCount ?? "";
  form.elements.namedItem("rating").value = series.rating || 0;
  form.elements.namedItem("status").value = series.status;
  form.elements.namedItem("posterUrl").value = series.posterUrl === POSTER_PLACEHOLDER ? "" : series.posterUrl;
  form.elements.namedItem("posterFile").value = "";
  setMultiSelectValues("genres", series.genres, form);
  setMultiSelectValues("languages", series.languages, form);
  renderSeriesEpisodeRows(form, series.episodes);
}

function fillSeriesEditForm(series) {
  const item = normalizeSeriesSchema(series);

  editingSeriesId = getSeriesRecordId(item);
  seriesEditPosterDataUrl = "";
  setSeriesFormValues(seriesEditForm, item);
  seriesEditPanel.hidden = false;
  renderSeriesPreview(item);
  renderAdminSeriesList();
  seriesFeedback.textContent = "Edit Series ochildi.";
  seriesEditPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function clearSeriesEditForm() {
  editingSeriesId = "";
  seriesEditPosterDataUrl = "";
  seriesEditForm.reset();
  renderSeriesEpisodeRows(seriesEditForm, []);
  setMultiSelectValues("genres", [], seriesEditForm);
  setMultiSelectValues("languages", [], seriesEditForm);
  seriesEditPanel.hidden = true;
  updateSeriesPreviewFromForm(seriesCreateForm, seriesCreatePosterDataUrl);
  renderAdminSeriesList();
}

function clearEpisodeForm() {
  editingEpisodeId = "";
  seriesEpisodeForm.reset();
  seriesEpisodeSubmit.innerHTML = '<i class="ti ti-plus" aria-hidden="true"></i> Add Episode';
}

function clearEpisodePanel() {
  selectedSeriesId = "";
  clearEpisodeForm();
  if (seriesEpisodePanel) {
    seriesEpisodePanel.hidden = true;
  }
}

function selectSeriesEpisodes(seriesIdentifier) {
  const series = findSeriesById(seriesIdentifier);

  if (!series) {
    seriesFeedback.textContent = "Serial topilmadi.";
    return;
  }

  selectedSeriesId = getSeriesRecordId(series);
  clearEpisodeForm();
  renderEpisodePanel();
  seriesEpisodePanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderEpisodePanel() {
  if (!seriesEpisodePanel || !seriesEpisodeList) {
    return;
  }

  if (!selectedSeriesId) {
    seriesEpisodePanel.hidden = true;
    return;
  }

  const series = findSeriesById(selectedSeriesId);

  if (!series) {
    clearEpisodePanel();
    return;
  }

  seriesEpisodePanel.hidden = false;
  seriesEpisodeSubtitle.textContent = series.titleUz;

  if (!series.episodes.length) {
    seriesEpisodeList.innerHTML = `
      <div class="admin-list-state">
        <i class="ti ti-list" aria-hidden="true"></i>
        <span>Bu serialga qism qo'shilmagan.</span>
      </div>
    `;
    return;
  }

  seriesEpisodeList.innerHTML = series.episodes
    .map(
      (episode) => `
        <article class="episode-item">
          <div>
            <h5>S${episode.seasonNumber} E${episode.episodeNumber}: ${escapeHtml(episode.title)}</h5>
            <p>${escapeHtml(episode.description || episode.downloadLink || episode.videoUrl)}</p>
          </div>
          <div class="episode-item__actions">
            <button class="button button--ghost admin-series-card__button" type="button" data-episode-edit="${escapeHtml(episode.id)}">
              <i class="ti ti-edit" aria-hidden="true"></i>
              Edit
            </button>
            <button class="button admin-series-card__button admin-movie-item__button--danger" type="button" data-episode-delete="${escapeHtml(episode.id)}">
              <i class="ti ti-trash" aria-hidden="true"></i>
              Delete
            </button>
          </div>
        </article>
      `,
    )
    .join("");
}

function fillEpisodeForm(episode) {
  editingEpisodeId = episode.id;
  seriesEpisodeForm.elements.namedItem("title").value = episode.title;
  seriesEpisodeForm.elements.namedItem("episodeNumber").value = episode.episodeNumber;
  seriesEpisodeForm.elements.namedItem("seasonNumber").value = episode.seasonNumber;
  seriesEpisodeForm.elements.namedItem("videoUrl").value = episode.downloadLink || episode.videoUrl;
  seriesEpisodeForm.elements.namedItem("description").value = episode.description;
  seriesEpisodeSubmit.innerHTML = '<i class="ti ti-device-floppy" aria-hidden="true"></i> Save Episode';
  seriesEpisodeForm.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function getEpisodeFormPayload() {
  const formData = new FormData(seriesEpisodeForm);

  return normalizeEpisodeSchema({
    id: editingEpisodeId || crypto.randomUUID(),
    title: formData.get("title").toString().trim(),
    episodeNumber: Number(formData.get("episodeNumber")) || 1,
    seasonNumber: Number(formData.get("seasonNumber")) || 1,
    downloadLink: formData.get("videoUrl").toString().trim(),
    description: formData.get("description").toString().trim(),
  });
}

function renderSeriesPreview(series = {}, { scroll = false } = {}) {
  const item = normalizeSeriesSchema(series);
  const category = item.genre || item.category || item.genres.join(", ") || "Janr";
  const languages = item.languages.length ? item.languages.join(", ") : "O‘zbek";
  const seasonCount = Number(item.seasonsCount) || getDerivedSeasonCount(item.episodes);
  const episodeCount = getSeriesEpisodeCount(item);
  const episodeMarkup = item.episodes.length
    ? item.episodes
        .map(
          (episode) => `
            <li>
              <div>
                <strong>S${episode.seasonNumber} E${episode.episodeNumber}: ${escapeHtml(episode.title)}</strong>
                <span>${escapeHtml(episode.quality || "Full HD")} • ${escapeHtml(episode.videoSource || "WEB-DL")} • ${escapeHtml(episode.format || "MP4")}${episode.fileSize ? ` • ${escapeHtml(episode.fileSize)}` : ""}</span>
              </div>
              ${
                episode.downloadLink || episode.videoUrl
                  ? `<a href="${escapeHtml(episode.downloadLink || episode.videoUrl)}" target="_blank" rel="noreferrer">Download</a>`
                  : `<span class="series-preview-card__missing-link">No link</span>`
              }
            </li>
          `,
        )
        .join("")
    : "<li>Qismlar hali qo'shilmagan.</li>";

  seriesPreviewContent.innerHTML = `
    <article class="preview-card series-preview-card">
      <div class="preview-card__poster-wrap">
        <img class="preview-card__poster series-preview-card__poster" src="${escapeHtml(item.posterUrl || POSTER_PLACEHOLDER)}" alt="${escapeHtml(item.titleUz || "Series")} posteri" />
        <span class="preview-card__quality">SERIES<br />${escapeHtml(item.status || "Draft")}</span>
      </div>
      <div class="series-preview-card__body">
        <h4>${escapeHtml(item.titleUz || "Yangi serial")}</h4>
        <p>${escapeHtml(item.originalTitle || "Original nomi")}</p>
        <div class="series-preview-card__meta">
          <span>${escapeHtml(category)}</span>
          <span>${escapeHtml(item.year || "2026")}</span>
          <span>${escapeHtml(item.country || "Davlat")}</span>
          <span>${escapeHtml(languages)}</span>
          <span>★ ${Number(item.rating || 0).toFixed(1)}</span>
          <span>${seasonCount || 0} seasons</span>
          <span>${episodeCount || 0} episodes</span>
        </div>
        <p class="series-preview-card__description">${escapeHtml(item.description || item.tavsif || "")}</p>
        <ul class="series-preview-card__episodes">${episodeMarkup}</ul>
      </div>
    </article>
  `;
  seriesPreviewPanel.hidden = false;

  if (scroll) {
    seriesPreviewPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function renderPreviewMovie(movie) {
  const item = normalizeMovieSchema(movie);
  const download = item.downloads["1080p"] ?? {};
  const languages = item.languages.length ? item.languages.join(", ") : "O‘zbek";

  previewPoster.src = item.posterUrl || POSTER_PLACEHOLDER;
  previewTitle.textContent = item.titleUz || "Yangi film";
  previewOriginal.textContent = item.originalTitle || "Original nomi";
  previewMeta.textContent = `${item.year || "2026"} • ${item.genres.join(", ") || "Janr"} • ${languages}`;
  previewQuality.textContent = item.quality || "Full HD";
  previewVideo.textContent = item.videoSource || "WEB-DL";
  previewFormat.textContent = download.format || item.format || "MP4";
  previewSize.textContent = download.size || item.download1080pSize || "2.4 GB";
}

function ensureSelectOption(select, value) {
  if (!select || !value) {
    return;
  }

  const exists = Array.from(select.options).some((option) => option.value === value);

  if (!exists) {
    select.add(new Option(value, value));
  }
}

function setMultiSelectValues(name, values, form = adminForm) {
  const select = form?.elements.namedItem(name);
  const normalizedValues = name === "genres" ? normalizeGenres(values) : normalizeArray(values);

  if (!select) {
    return;
  }

  normalizedValues.forEach((value) => ensureSelectOption(select, value));
  Array.from(select.options).forEach((option) => {
    option.selected = normalizedValues.includes(option.value);
  });
  renderMultiSelect(name, form);
}

function fillAdminForm(movie) {
  const item = normalizeMovieSchema(movie);
  const download = item.downloads["1080p"] ?? {};

  editingMovieSlug = getMovieRecordId(item);
  adminPreviewEditButton.hidden = true;
  adminPreviewEditButton.disabled = true;
  adminMovieFormTitle.textContent = "Edit Movie";
  adminSubmitButton.textContent = "Save Changes";
  adminForm.elements.namedItem("slug").readOnly = true;
  adminForm.elements.namedItem("titleUz").value = item.titleUz;
  adminForm.elements.namedItem("originalTitle").value = item.originalTitle;
  adminForm.elements.namedItem("slug").value = item.slug;
  adminForm.elements.namedItem("description").value = item.tavsif;
  adminForm.elements.namedItem("year").value = item.year;
  adminForm.elements.namedItem("country").value = item.country;
  adminForm.elements.namedItem("duration").value = item.duration;
  adminForm.elements.namedItem("director").value = item.director;
  adminForm.elements.namedItem("rating").value = item.rating;
  adminForm.elements.namedItem("status").value = item.status;
  adminForm.elements.namedItem("posterUrl").value = item.posterUrl;
  adminForm.elements.namedItem("posterFile").value = "";
  adminForm.elements.namedItem("quality").value = "Full HD";
  adminForm.elements.namedItem("videoSource").value = item.videoSource;
  adminForm.elements.namedItem("format").value = download.format || item.format;
  adminForm.elements.namedItem("download1080pUrl").value = download.url || item.download1080pUrl;
  adminForm.elements.namedItem("download1080pSize").value = download.size || item.download1080pSize;
  setMultiSelectValues("genres", item.genres);
  setMultiSelectValues("languages", item.languages);
  posterPreviewDataUrl = "";
  slugEditedManually = true;
  updateAdminPreview();
  renderAdminMovieList();
  adminFeedback.textContent = "Edit mode opened. Make changes and click Save Changes.";
  adminForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetAdminFormMode() {
  editingMovieSlug = "";
  adminPreviewEditButton.hidden = true;
  adminPreviewEditButton.disabled = true;
  adminMovieFormTitle.textContent = "Add New Movie";
  adminSubmitButton.textContent = "Add Movie";
  adminForm.elements.namedItem("slug").readOnly = false;
  renderAdminMovieList();
}

function setActiveNav(section) {
  sectionLinks.forEach((link) => {
    const isActive = link.dataset.sectionLink === section;
    link.classList.toggle("site-nav__link--active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function setActiveAdminPanel(panel) {
  activeAdminPanel = ["movies", "series", "statistics"].includes(panel) ? panel : "movies";

  adminTabButtons.forEach((button) => {
    const isActive = button.dataset.adminTab === activeAdminPanel;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", isActive.toString());
  });

  adminPanels.forEach((panelElement) => {
    panelElement.hidden = panelElement.dataset.adminPanel !== activeAdminPanel;
    panelElement.classList.toggle("is-active", !panelElement.hidden);
  });

  if (activeAdminPanel === "statistics") {
    loadAdminStatistics();
  }
}

function showCatalogShell() {
  document.body.classList.remove("is-auth-page");
  catalogHeader.hidden = false;
  catalogSection.hidden = false;
  detailPage.hidden = true;
  adminPanel.hidden = true;
  authPage.hidden = true;
  profilePage.hidden = true;
  settingsPage.hidden = true;
}

function hideCatalogAndAccountPages() {
  catalogHeader.hidden = true;
  catalogSection.hidden = true;
  detailPage.hidden = true;
  adminPanel.hidden = true;
  authPage.hidden = true;
  profilePage.hidden = true;
  settingsPage.hidden = true;
}

function clearAuthFieldErrors(form) {
  form.querySelectorAll("[data-field-error]").forEach((element) => {
    element.textContent = "";
  });
  form.querySelectorAll(".auth-field__control").forEach((element) => {
    element.classList.remove("is-invalid");
  });
}

function setAuthFieldError(form, name, message) {
  const errorElement = form.querySelector(`[data-field-error="${name}"]`);
  const control = form.querySelector(`[name="${name}"]`)?.closest(".auth-field__control");

  if (errorElement) {
    errorElement.textContent = message;
  }

  if (control) {
    control.classList.add("is-invalid");
  }
}

function setAuthFeedback(message = "", type = "") {
  authPageFeedback.textContent = message;
  authPageFeedback.className = "auth-page__feedback";

  if (type === "error") {
    authPageFeedback.classList.add("auth-page__feedback--error");
  }

  if (type === "success") {
    authPageFeedback.classList.add("auth-page__feedback--success");
  }
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateLoginForm(form, formData) {
  clearAuthFieldErrors(form);
  let isValid = true;
  const email = formData.get("email").toString().trim();
  const password = formData.get("password").toString();

  if (!email) {
    setAuthFieldError(form, "email", "Email kiriting.");
    isValid = false;
  } else if (!isValidEmail(email)) {
    setAuthFieldError(form, "email", "To'g'ri email kiriting.");
    isValid = false;
  }

  if (!password) {
    setAuthFieldError(form, "password", "Parol kiriting.");
    isValid = false;
  }

  return isValid;
}

function validateSignupForm(form, formData) {
  clearAuthFieldErrors(form);
  let isValid = true;
  const name = formData.get("name").toString().trim();
  const email = formData.get("email").toString().trim();
  const password = formData.get("password").toString();

  if (!name) {
    setAuthFieldError(form, "name", "Ismingizni kiriting.");
    isValid = false;
  }

  if (!email) {
    setAuthFieldError(form, "email", "Email kiriting.");
    isValid = false;
  } else if (!isValidEmail(email)) {
    setAuthFieldError(form, "email", "To'g'ri email kiriting.");
    isValid = false;
  }

  if (!password) {
    setAuthFieldError(form, "password", "Parol kiriting.");
    isValid = false;
  } else if (password.length < 6) {
    setAuthFieldError(form, "password", "Parol kamida 6 ta belgidan iborat bo'lishi kerak.");
    isValid = false;
  }

  return isValid;
}

function resetAuthForm(form) {
  form.reset();
  clearAuthFieldErrors(form);
  form.querySelectorAll("[data-password-toggle]").forEach((button) => {
    const input = button.closest(".auth-field__control")?.querySelector("input");
    const icon = button.querySelector("i");

    if (input) {
      input.type = "password";
    }

    if (icon) {
      icon.classList.add("ti-eye");
      icon.classList.remove("ti-eye-off");
    }

    button.setAttribute("aria-label", "Parolni ko'rsatish");
  });
}

function renderAuthPage(mode) {
  const isSignup = mode === "signup";

  document.body.classList.add("is-auth-page");
  hideCatalogAndAccountPages();
  authPage.hidden = false;
  authPageTitle.textContent = isSignup ? "Create account" : "Welcome back";
  authPageSubtitle.textContent = isSignup
    ? "Yangi KinoTime profilingizni yarating"
    : "KinoTime profilingizga kiring";
  loginForm.hidden = isSignup;
  signupForm.hidden = !isSignup;
  resetAuthForm(loginForm);
  resetAuthForm(signupForm);
  setAuthFeedback();
  authPageSwitch.innerHTML = isSignup
    ? 'Profilingiz bormi? <button type="button" data-auth-switch="login">Login</button>'
    : 'Profilingiz yo\'qmi? <button type="button" data-auth-switch="signup">Sign Up</button>';
  setActiveNav("");
}

// Section switcher: updates navigation, title, search label and grid.
function setSection(section, shouldResetSearch = false) {
  activeSection = sectionConfig[section] ? section : "filmlar";
  setActiveNav(activeSection);

  if (activeSection === "admin") {
    if (!currentUser) {
      pendingAuthRedirect = "#admin";
      history.replaceState(null, "", "#login");
      renderAuthPage("login");
      closeMobileMenu();
      trackPageView();
      return;
    }

    if (!hasAdminAccess()) {
      clearSession();
      pendingAuthRedirect = "#admin";
      history.replaceState(null, "", "#login");
      renderAuthPage("login");
      setAuthFeedback("Admin panel uchun admin email va parol bilan kiring.", "error");
      closeMobileMenu();
      trackPageView();
      return;
    }

    document.body.classList.remove("is-auth-page");
    hideCatalogAndAccountPages();
    adminPanel.hidden = false;
    adminGuard.hidden = hasAdminAccess();
    adminWorkspace.hidden = !hasAdminAccess();
    if (hasAdminAccess()) {
      setActiveAdminPanel(activeAdminPanel);
      updateAdminPreview();
      renderAdminMovieList();
      renderAdminSeriesList();
      renderEpisodePanel();
      loadCatalogFromApi();
    }
    trackPageView();
    return;
  }

  if (section === "profile" || section === "settings") {
    if (!currentUser) {
      pendingAuthRedirect = `#${section}`;
      history.replaceState(null, "", "#login");
      renderAuthPage("login");
      closeMobileMenu();
      return;
    }

    document.body.classList.remove("is-auth-page");
    setActiveNav("");
    hideCatalogAndAccountPages();

    if (section === "profile") {
      profilePage.hidden = false;
      renderProfilePage();
    } else {
      settingsPage.hidden = false;
      renderSettingsPage();
    }

    closeMobileMenu();
    trackPageView();
    return;
  }

  if (section === "login" || section === "signup") {
    if (currentUser) {
      history.replaceState(null, "", "#home");
      setSection("filmlar", true);
      return;
    }

    renderAuthPage(section);
    trackPageView();
    return;
  }

  if (shouldResetSearch) {
    searchTerm = "";
    searchInput.value = "";
    currentCatalogPage = 1;
    resetCatalogFilters({ render: false });
  }

  const config = sectionConfig[activeSection];
  catalogTitle.textContent = config.title;
  if (catalogSubtitle) {
    catalogSubtitle.textContent = config.subtitle;
  }
  searchInput.placeholder = config.searchPlaceholder;
  catalogSection.setAttribute("aria-label", config.ariaLabel);
  showCatalogShell();
  renderCards();
  trackPageView();
}

// Detail page: show metadata and movie downloads or series episodes.
function openDetailPage(itemOrId, options = {}) {
  const item = typeof itemOrId === "object" && itemOrId !== null ? normalizeCatalogItem(itemOrId) : findMovieById(itemOrId);

  if (!item) {
    return;
  }

  const isSeries = item.section === "seriallar";
  const download = item.downloads?.["1080p"] ?? {};
  const detailTitle = item.titleUz.toUpperCase();
  const sectionLabel = isSeries ? "Seriallar" : "Filmlar";
  const infoCardExtraItem = isSeries
    ? `
          <div>
            <dt><i class="ti ti-list-numbers" aria-hidden="true"></i> QISMLAR</dt>
            <dd>${getSeriesEpisodeCount(item)} qism</dd>
          </div>
        `
    : `
          <div>
            <dt><i class="ti ti-user" aria-hidden="true"></i> Rejissor</dt>
            <dd>${item.director}</dd>
          </div>
        `;
  const downloadMarkup =
    isSeries && item.episodes.length
      ? `
        <section class="download-section" aria-labelledby="download-title">
          <h3 id="download-title">Serial qismlari</h3>
          <div class="episode-download-list">
            ${item.episodes
              .map(
                (episode) => `
                  <div class="download-row episode-download-row">
                    <div class="download-row__left">
                      <span class="download-row__label">S${episode.seasonNumber} E${episode.episodeNumber}: ${escapeHtml(episode.title)}</span>
                      <span class="download-badge">${escapeHtml(episode.description || "Episode")}</span>
                    </div>
                    <a class="download-row__button" href="${escapeHtml(episode.downloadLink || episode.videoUrl)}" download aria-label="${escapeHtml(episode.title)} yuklab olish" data-download-track data-download-content-id="${escapeHtml(getContentAnalyticsId(item))}" data-download-movie-id="${escapeHtml(`${item.id}-${episode.id}`)}" data-download-title="${escapeHtml(`${item.titleUz} - S${episode.seasonNumber} E${episode.episodeNumber}: ${episode.title}`)}" data-download-poster="${escapeHtml(item.posterUrl)}" data-download-quality="${escapeHtml(episode.quality || item.quality || "1080p")}" data-download-size="${escapeHtml(episode.fileSize || "")}" data-download-format="${escapeHtml(episode.format || item.format || "MP4")}">
                      <i class="ti ti-download" aria-hidden="true"></i>
                    </a>
                  </div>
                `,
              )
              .join("")}
          </div>
        </section>
      `
      : `
        <section class="download-section" aria-labelledby="download-title">
          <h3 id="download-title">${isSeries ? "Serialni yuklab olish" : "Filmni yuklab olish"}</h3>
          <div class="download-row">
            <div class="download-row__left">
              <span class="download-row__label">Download 1080p</span>
              <span class="download-badge">${escapeHtml(download.size || item.download1080pSize || "")}</span>
              <span class="download-badge download-badge--format">${escapeHtml(download.format || item.format || "MP4")}</span>
            </div>
            <a class="download-row__button" href="${escapeHtml(download.url || item.download1080pUrl || "#")}" download aria-label="Download 1080p" data-download-track data-download-content-id="${escapeHtml(getContentAnalyticsId(item))}" data-download-movie-id="${escapeHtml(item.id)}" data-download-title="${escapeHtml(item.titleUz)}" data-download-poster="${escapeHtml(item.posterUrl)}" data-download-quality="1080p" data-download-size="${escapeHtml(download.size || item.download1080pSize || "")}" data-download-format="${escapeHtml(download.format || item.format || "MP4")}">
              <i class="ti ti-download" aria-hidden="true"></i>
            </a>
          </div>
        </section>
      `;

  activeDetailSection = item.section;
  setActiveNav(item.section);
  document.body.classList.remove("is-auth-page");
  hideCatalogAndAccountPages();
  detailPage.hidden = false;
  detailPage.style.setProperty("--detail-backdrop", `url(${JSON.stringify(item.posterUrl)})`);

  detailContent.innerHTML = `
    <article class="movie-detail">
      <div class="movie-detail__poster-wrap">
        <img class="movie-detail__poster" src="${item.posterUrl}" alt="${item.titleUz} posteri" />
      </div>

      <div class="movie-detail__content">
        <nav class="breadcrumb" aria-label="Sahifa yo'li">
          <a href="#${item.section}" data-detail-section-link="${item.section}">${sectionLabel}</a>
          <span>${detailTitle}</span>
        </nav>

        <div class="movie-detail__title-block">
          <h2>${detailTitle}</h2>
          <p class="movie-detail__original">Original nomi: ${item.originalTitle}</p>
        </div>

        <div class="genre-list">${item.genres.map(createTag).join("")}</div>
        <p class="movie-detail__description">${item.tavsif}</p>

        <dl class="movie-meta">
          <div>
            <dt><i class="ti ti-calendar" aria-hidden="true"></i> Yil</dt>
            <dd>${item.year}</dd>
          </div>
          <div>
            <dt><i class="ti ti-flag" aria-hidden="true"></i> Davlat</dt>
            <dd>${item.country}</dd>
          </div>
          <div>
            <dt><i class="ti ti-language" aria-hidden="true"></i> Til</dt>
            <dd>${formatList(item.languages)}</dd>
          </div>
          <div>
            <dt><i class="ti ti-clock" aria-hidden="true"></i> Davomiyligi</dt>
            <dd>${item.duration}</dd>
          </div>
          <div>
            <dt><i class="ti ti-device-tv" aria-hidden="true"></i> Sifat</dt>
            <dd>${item.quality}</dd>
          </div>
          <div>
            <dt><i class="ti ti-video" aria-hidden="true"></i> Video</dt>
            <dd>${item.videoSource}</dd>
          </div>
          ${infoCardExtraItem}
          <div>
            <dt><i class="ti ti-star" aria-hidden="true"></i> Reyting</dt>
            <dd class="movie-meta__rating">★ ${item.rating.toFixed(1)} / 10</dd>
          </div>
        </dl>

        ${downloadMarkup}
      </div>
    </article>
  `;

  if (options.updateHash !== false) {
    const itemSlug = getCatalogItemSlug(item);

    if (itemSlug && getHashRouteValue() !== itemSlug) {
      history.pushState(null, "", `#${encodeURIComponent(itemSlug)}`);
    }
  }

  trackPageView(getContentAnalyticsId(item));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function closeMobileMenu() {
  document.body.classList.remove("is-nav-open");
  menuToggle.setAttribute("aria-expanded", "false");
}

function getUserLabel(user) {
  return user?.name || user?.email || "User";
}

function closeProfileDropdown() {
  profileDropdown.hidden = true;
  profileToggle.setAttribute("aria-expanded", "false");
}

function renderProfileAvatar(user, label) {
  const fallbackInitial = label.charAt(0).toUpperCase();
  const avatarUrl = (user?.avatarUrl || user?.avatar || user?.photoUrl || "").toString().trim();

  profileAvatar.replaceChildren();

  if (!avatarUrl) {
    profileAvatar.textContent = fallbackInitial;
    return;
  }

  const avatarImage = document.createElement("img");
  avatarImage.src = resolvePublicUrl(avatarUrl);
  avatarImage.alt = "";
  avatarImage.loading = "lazy";
  avatarImage.addEventListener("error", () => {
    profileAvatar.replaceChildren(document.createTextNode(fallbackInitial));
  });

  profileAvatar.append(avatarImage);
}

function updateAuthUI() {
  const isLoggedIn = Boolean(currentUser);

  authActions.hidden = isLoggedIn;
  profileMenu.hidden = !isLoggedIn;

  if (!isLoggedIn) {
    if (profileAdminLink) {
      profileAdminLink.hidden = true;
    }
    closeProfileDropdown();
    return;
  }

  const label = getUserLabel(currentUser);
  renderProfileAvatar(currentUser, label);
  profileName.textContent = label;
  if (profileAdminLink) {
    profileAdminLink.hidden = !hasAdminAccess();
  }
}

hydrateSharedGenreSelects();
document.querySelectorAll("[data-multi-select]").forEach(initializeMultiSelect);
updateSeriesPreviewFromForm(seriesCreateForm, seriesCreatePosterDataUrl);

// Events: home reset, section links, search, detail page, mobile menu and dialogs.
homeLink.addEventListener("click", (event) => {
  event.preventDefault();
  history.pushState(null, "", "#home");
  setSection("filmlar", true);
  closeMobileMenu();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

sectionLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const section = link.dataset.sectionLink;

    history.pushState(null, "", `#${section}`);
    setSection(section, true);
    closeMobileMenu();
  });
});

backToCatalogButton?.addEventListener("click", () => {
  history.pushState(null, "", `${window.location.pathname}${window.location.search}`);
  setSection("filmlar", false);
});

searchInput.addEventListener("input", (event) => {
  searchTerm = event.target.value;
  currentCatalogPage = 1;
  renderCards();
});

filterResetButton?.addEventListener("click", () => {
  resetCatalogFilters();
});

filterToggleButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    const type = button.dataset.filterToggle;
    const menu = document.querySelector(`[data-filter-options="${type}"]`);
    const shouldOpen = menu?.hidden;

    closeFilterMenus(shouldOpen ? type : "");
  });
});

filterOptionMenus.forEach((menu) => {
  menu.addEventListener("click", (event) => {
    const option = event.target.closest("[data-filter-value]");

    if (!option) {
      return;
    }

    const type = option.dataset.filterType;
    const value = option.dataset.filterValue || "";

    catalogFilters = {
      ...catalogFilters,
      [type]: value,
    };
    currentCatalogPage = 1;
    closeFilterMenus();
    renderCards();
  });
});

catalogPagination?.addEventListener("click", (event) => {
  const pageButton = event.target.closest("[data-page-number]");

  if (!pageButton || pageButton.disabled) {
    return;
  }

  const pageNumber = Number(pageButton.dataset.pageNumber);

  if (!Number.isFinite(pageNumber) || pageNumber === currentCatalogPage) {
    return;
  }

  currentCatalogPage = pageNumber;
  renderCards();
  catalogHeader.scrollIntoView({ behavior: "smooth", block: "start" });
});

kinoGrid.addEventListener("click", (event) => {
  const card = event.target.closest(".film-card");

  if (card) {
    const item = findMovieById(card.dataset.filmId);
    const itemSlug = getCatalogItemSlug(item);

    if (!item) {
      return;
    }

    if (itemSlug) {
      if (getHashRouteValue() === itemSlug) {
        openDetailPage(item, { updateHash: false });
      } else {
        window.location.hash = itemSlug;
      }
      return;
    }

    openDetailPage(item);
  }
});

detailContent.addEventListener("click", (event) => {
  const downloadLink = event.target.closest("[data-download-track]");

  if (downloadLink) {
    trackDownload({
      movieId: downloadLink.dataset.downloadMovieId,
      analyticsMovieId: downloadLink.dataset.downloadContentId || downloadLink.dataset.downloadMovieId,
      title: downloadLink.dataset.downloadTitle,
      poster: downloadLink.dataset.downloadPoster,
      quality: downloadLink.dataset.downloadQuality,
      size: downloadLink.dataset.downloadSize,
      format: downloadLink.dataset.downloadFormat,
      downloadUrl: downloadLink.getAttribute("href") || "",
    });
    return;
  }

  const sectionLink = event.target.closest("[data-detail-section-link]");

  if (!sectionLink) {
    return;
  }

  event.preventDefault();
  history.pushState(null, "", `#${sectionLink.dataset.detailSectionLink}`);
  setSection(sectionLink.dataset.detailSectionLink, true);
});

menuToggle.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("is-nav-open");
  menuToggle.setAttribute("aria-expanded", isOpen.toString());
});

authButtons.forEach((button) => {
  button.addEventListener("click", () => {
    history.pushState(null, "", `#${button.dataset.authLink}`);
    setSection(button.dataset.authLink, true);
    closeMobileMenu();
  });
});

document.addEventListener("click", (event) => {
  if (!event.target.closest("[data-multi-select]")) {
    closeMultiSelectMenus();
  }

  if (!event.target.closest("[data-filter-dropdown]")) {
    closeFilterMenus();
  }

  if (!event.target.closest("#profile-menu")) {
    closeProfileDropdown();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeFilterMenus();
    closeProfileDropdown();
  }
});

profileToggle.addEventListener("click", () => {
  const willOpen = profileDropdown.hidden;
  profileDropdown.hidden = !willOpen;
  profileToggle.setAttribute("aria-expanded", willOpen.toString());
});

profileDropdown.addEventListener("click", (event) => {
  if (event.target.closest(".profile-menu__item")) {
    closeProfileDropdown();
  }
});

profilePageLink?.addEventListener("click", () => {
  closeProfileDropdown();
  history.pushState(null, "", "#profile");
  setSection("profile", true);
});

profileAdminLink?.addEventListener("click", () => {
  closeProfileDropdown();
  history.pushState(null, "", "#admin");
  setSection("admin", true);
});

settingsPageLink?.addEventListener("click", () => {
  closeProfileDropdown();
  history.pushState(null, "", "#settings");
  setSection("settings", true);
});

settingsPage?.addEventListener("submit", async (event) => {
  const nameForm = event.target.closest("#settings-name-form");
  const passwordForm = event.target.closest("#settings-password-form");

  if (!nameForm && !passwordForm) {
    return;
  }

  event.preventDefault();

  if (nameForm) {
    const feedback = nameForm.querySelector('[data-settings-feedback="name"]');
    const error = nameForm.querySelector('[data-settings-error="name"]');
    const input = nameForm.elements.namedItem("name");
    const name = input.value.trim();

    if (error) {
      error.textContent = "";
    }

    if (!name) {
      if (error) {
        error.textContent = "Ism bo'sh bo'lmasligi kerak.";
      }
      return;
    }

    try {
      await updateUserDisplayName(name);
      renderSettingsPage();
      if (settingsPageContent) {
        const updatedFeedback = settingsPageContent.querySelector('[data-settings-feedback="name"]');
        if (updatedFeedback) {
          updatedFeedback.textContent = "Ism saqlandi.";
          updatedFeedback.className = "settings-feedback settings-feedback--success";
        }
      }
    } catch (errorMessage) {
      if (feedback) {
        feedback.textContent = errorMessage.message;
        feedback.className = "settings-feedback settings-feedback--error";
      }
    }
    return;
  }

  const feedback = passwordForm.querySelector('[data-settings-feedback="password"]');
  const formData = new FormData(passwordForm);
  const currentPassword = formData.get("currentPassword").toString();
  const newPassword = formData.get("newPassword").toString();
  const confirmPassword = formData.get("confirmPassword").toString();

  try {
    await changeUserPassword({ currentPassword, newPassword, confirmPassword });
    passwordForm.reset();
    if (feedback) {
      feedback.textContent = "Parol yangilandi.";
      feedback.className = "settings-feedback settings-feedback--success";
    }
  } catch (errorMessage) {
    if (feedback) {
      feedback.textContent = errorMessage.message;
      feedback.className = "settings-feedback settings-feedback--error";
    }
  }
});

adminTabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveAdminPanel(button.dataset.adminTab);
  });
});

adminRefreshStatistics?.addEventListener("click", () => {
  loadAdminStatistics({ force: true });
});

adminRefreshMovies.addEventListener("click", () => {
  adminFeedback.textContent = "Kinolar ro'yxati yangilanmoqda...";
  loadCatalogFromApi().then(() => {
    adminFeedback.textContent = "Kinolar ro'yxati yangilandi.";
  });
});

adminRefreshSeries.addEventListener("click", async () => {
  seriesFeedback.textContent = "Seriallar ro'yxati yangilanmoqda...";
  const errorMessage = await loadSeriesFromApi();
  syncCatalogItems();
  renderCards();
  renderAdminSeriesList(errorMessage);

  if (errorMessage) {
    seriesFeedback.textContent = errorMessage;
  } else {
    seriesFeedback.textContent = "Seriallar ro'yxati yangilandi.";
  }
});

adminMovieList.addEventListener("click", async (event) => {
  const editButton = event.target.closest("[data-admin-edit]");
  const deleteButton = event.target.closest("[data-admin-delete]");

  if (editButton) {
    const movie = findAdminMovieById(editButton.dataset.adminEdit);

    if (!movie) {
      adminFeedback.textContent = "Film topilmadi.";
      return;
    }

    fillAdminForm(movie);
    return;
  }

  if (deleteButton) {
    const slug = deleteButton.dataset.adminDelete;
    const movie = findAdminMovieById(slug);
    const deletedMovieId = movie ? getMovieRecordId(movie) : slug;
    const confirmed = window.confirm("Are you sure you want to delete this movie?");

    if (!confirmed) {
      return;
    }

    try {
      deleteButton.disabled = true;
      adminFeedback.textContent = `${movie?.titleUz || "Film"} o'chirilmoqda...`;
      await deleteMovieFromCatalog(slug);
      adminFeedback.textContent = "Film MongoDB'dan o'chirildi.";

      if (editingMovieSlug === deletedMovieId || editingMovieSlug === movie?.slug) {
        adminForm.reset();
      } else {
        renderAdminMovieList();
      }
    } catch (error) {
      deleteButton.disabled = false;
      adminFeedback.textContent = error.message;
    }
    return;
  }
});

adminSeriesList.addEventListener("click", async (event) => {
  const previewButton = event.target.closest("[data-series-preview]");
  const editButton = event.target.closest("[data-series-edit]");
  const episodesButton = event.target.closest("[data-series-episodes]");
  const deleteButton = event.target.closest("[data-series-delete]");

  if (previewButton) {
    const series = findSeriesById(previewButton.dataset.seriesPreview);

    if (!series) {
      seriesFeedback.textContent = "Serial topilmadi.";
      return;
    }

    renderSeriesPreview(series, { scroll: false });
    seriesFeedback.textContent = "Serial preview ko'rsatildi.";
    return;
  }

  if (editButton) {
    const series = findSeriesById(editButton.dataset.seriesEdit);

    if (!series) {
      seriesFeedback.textContent = "Serial topilmadi.";
      return;
    }

    fillSeriesEditForm(series);
    return;
  }

  if (episodesButton) {
    selectSeriesEpisodes(episodesButton.dataset.seriesEpisodes);
    return;
  }

  if (deleteButton) {
    const series = findSeriesById(deleteButton.dataset.seriesDelete);
    const deletedSeriesIds = series ? [getSeriesRecordId(series), series.slug, series.id] : [deleteButton.dataset.seriesDelete];
    const confirmed = window.confirm("Are you sure you want to delete this series?");

    if (!confirmed) {
      return;
    }

    try {
      deleteButton.disabled = true;
      seriesFeedback.textContent = `${series?.titleUz || "Serial"} o'chirilmoqda...`;
      await deleteSeriesFromCatalog(deleteButton.dataset.seriesDelete);
      seriesFeedback.textContent = "Serial o'chirildi.";

      if (deletedSeriesIds.includes(editingSeriesId)) {
        clearSeriesEditForm();
      }

      if (deletedSeriesIds.includes(selectedSeriesId)) {
        clearEpisodePanel();
      }
    } catch (error) {
      deleteButton.disabled = false;
      seriesFeedback.textContent = error.message;
    }
  }
});

adminPreviewEditButton.addEventListener("click", () => {
  adminFeedback.textContent = "Filmni tahrirlash uchun Qo'shilgan kinolar ro'yxatidagi Edit tugmasini bosing.";
});

logoutButton.addEventListener("click", () => {
  clearSession();
  closeProfileDropdown();
  history.pushState(null, "", "#home");
  setSection("filmlar", true);
});

authPageSwitch.addEventListener("click", (event) => {
  const button = event.target.closest("[data-auth-switch]");

  if (!button) {
    return;
  }

  history.pushState(null, "", `#${button.dataset.authSwitch}`);
  renderAuthPage(button.dataset.authSwitch);
});

document.querySelectorAll("[data-password-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    const input = button.closest(".auth-field__control")?.querySelector("input");
    const icon = button.querySelector("i");

    if (!input || !icon) {
      return;
    }

    const showPassword = input.type === "password";
    input.type = showPassword ? "text" : "password";
    icon.classList.toggle("ti-eye", !showPassword);
    icon.classList.toggle("ti-eye-off", showPassword);
    button.setAttribute("aria-label", showPassword ? "Parolni yashirish" : "Parolni ko'rsatish");
  });
});

[loginForm, signupForm].forEach((form) => {
  form.addEventListener("input", (event) => {
    const field = event.target.closest(".auth-field");

    if (!field) {
      return;
    }

    const errorElement = field.querySelector("[data-field-error]");
    const control = field.querySelector(".auth-field__control");

    if (errorElement) {
      errorElement.textContent = "";
    }

    if (control) {
      control.classList.remove("is-invalid");
    }

    setAuthFeedback();
  });
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(loginForm);

  if (!validateLoginForm(loginForm, formData)) {
    setAuthFeedback("Maydonlarni to'g'ri to'ldiring.", "error");
    return;
  }

  try {
    await loginUser({
      email: formData.get("email"),
      password: formData.get("password"),
    });
    const redirect =
      pendingAuthRedirect && (pendingAuthRedirect !== "#admin" || hasAdminAccess()) ? pendingAuthRedirect : "#home";
    pendingAuthRedirect = "";
    history.pushState(null, "", redirect);
    setSection(redirect.replace("#", "") || "filmlar", true);
  } catch (error) {
    setAuthFeedback(error.message, "error");
  }
});

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(signupForm);

  if (!validateSignupForm(signupForm, formData)) {
    setAuthFeedback("Maydonlarni to'g'ri to'ldiring.", "error");
    return;
  }

  try {
    await registerUser({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password").toString(),
    });
    const redirect =
      pendingAuthRedirect && (pendingAuthRedirect !== "#admin" || hasAdminAccess()) ? pendingAuthRedirect : "#home";
    pendingAuthRedirect = "";
    history.pushState(null, "", redirect);
    setSection(redirect.replace("#", "") || "filmlar", true);
  } catch (error) {
    setAuthFeedback(error.message, "error");
  }
});

function getAdminFormValue(name, fallback = "") {
  const field = adminForm.elements.namedItem(name);
  return field ? field.value.trim() || fallback : fallback;
}

function getAdminPreviewData() {
  const selectedGenres = getSelectedValues(adminForm.elements.namedItem("genres"));
  const selectedLanguages = getSelectedValues(adminForm.elements.namedItem("languages"));

  return {
    titleUz: getAdminFormValue("titleUz", "Yangi film"),
    originalTitle: getAdminFormValue("originalTitle", "Original nomi"),
    year: getAdminFormValue("year", "2026"),
    genres: selectedGenres.length ? selectedGenres : ["Janr"],
    languages: selectedLanguages,
    quality: "Full HD",
    videoSource: getAdminFormValue("videoSource", "WEB-DL"),
    format: getAdminFormValue("format", "MP4"),
    fileSize: getAdminFormValue("download1080pSize", "2.4 GB"),
    posterUrl: getAdminFormValue("posterUrl") || posterPreviewDataUrl || POSTER_PLACEHOLDER,
  };
}

function updateAdminPreview() {
  if (!adminForm || !previewPoster) {
    return;
  }

  const preview = getAdminPreviewData();
  const languages = preview.languages.length ? preview.languages.join(", ") : "O‘zbek";

  previewPoster.src = preview.posterUrl;
  previewTitle.textContent = preview.titleUz;
  previewOriginal.textContent = preview.originalTitle;
  previewMeta.textContent = `${preview.year} • ${preview.genres.join(", ")} • ${languages}`;
  previewQuality.textContent = preview.quality;
  previewVideo.textContent = preview.videoSource;
  previewFormat.textContent = preview.format;
  previewSize.textContent = preview.fileSize;
}

function updateSeriesPreviewFromForm(form, posterDataUrl = "", { scroll = false } = {}) {
  if (!form || !seriesPreviewContent) {
    return;
  }

  const existingSeries = form === seriesEditForm ? findSeriesById(editingSeriesId) : null;
  renderSeriesPreview(getSeriesFormPayload(form, posterDataUrl, existingSeries), { scroll });
}

function updatePreviewForForm(form) {
  if (form === adminForm) {
    updateAdminPreview();
    return;
  }

  if (form === seriesCreateForm) {
    updateSeriesPreviewFromForm(seriesCreateForm, seriesCreatePosterDataUrl);
    return;
  }

  if (form === seriesEditForm) {
    updateSeriesPreviewFromForm(seriesEditForm, seriesEditPosterDataUrl);
  }
}

adminForm.addEventListener("input", (event) => {
  if (event.target.name === "titleUz" && !slugEditedManually) {
    adminForm.elements.namedItem("slug").value = createSlug(event.target.value);
  }

  if (event.target.name === "slug") {
    slugEditedManually = true;
  }

  updateAdminPreview();
});

adminForm.addEventListener("change", async (event) => {
  if (event.target.name === "posterFile") {
    const [file] = event.target.files;
    posterPreviewDataUrl = "";

    if (file) {
      isPosterProcessing = true;
      adminFeedback.textContent = "Poster saqlashga tayyorlanmoqda...";

      try {
        posterPreviewDataUrl = await createPersistentPosterDataUrl(file);
        adminFeedback.textContent = "";
      } catch (error) {
        event.target.value = "";
        adminFeedback.textContent = error.message;
      } finally {
        isPosterProcessing = false;
      }
    }
  }

  updateAdminPreview();
});

adminForm.addEventListener("reset", () => {
  setTimeout(() => {
    resetAdminFormMode();
    slugEditedManually = false;
    posterPreviewDataUrl = "";
    isPosterProcessing = false;
    adminForm.elements.namedItem("quality").value = "Full HD";
    renderMultiSelect("genres");
    renderMultiSelect("languages");
    updateAdminPreview();
  }, 0);
});

function validateAdminForm() {
  const requiredFields = Array.from(adminForm.querySelectorAll("[required]")).filter(
    (field) => !field.classList.contains("multi-select__native"),
  );
  const firstEmptyField = requiredFields.find((field) => !field.value.trim());
  const genres = getSelectedValues(adminForm.elements.namedItem("genres"));
  const languages = getSelectedValues(adminForm.elements.namedItem("languages"));
  const posterUrl = getAdminFormValue("posterUrl") || posterPreviewDataUrl;

  setMultiSelectError("genres");
  setMultiSelectError("languages");

  if (isPosterProcessing) {
    adminFeedback.textContent = "Poster hali tayyorlanmoqda. Bir necha soniya kuting.";
    return false;
  }

  if (firstEmptyField) {
    firstEmptyField.focus();
    adminFeedback.textContent = "Majburiy maydonlarni to'ldiring.";
    return false;
  }

  if (!genres.length) {
    setMultiSelectError("genres", "Kamida bitta janr tanlang.");
    adminFeedback.textContent = "Kamida bitta janr tanlang.";
    return false;
  }

  if (!languages.length) {
    setMultiSelectError("languages", "Kamida bitta til tanlang.");
    adminFeedback.textContent = "Kamida bitta til tanlang.";
    return false;
  }

  if (!posterUrl) {
    adminForm.elements.namedItem("posterFile").focus();
    adminFeedback.textContent = "Poster rasmi yuklang yoki poster URL kiriting.";
    return false;
  }

  return true;
}

adminForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    assertAdminAccess();
  } catch (error) {
    adminFeedback.textContent = "Faqat admin film qo'shishi, tahrirlashi yoki o'chirishi mumkin.";
    return;
  }

  if (!validateAdminForm()) {
    return;
  }

  const formData = new FormData(adminForm);
  const titleUz = formData.get("titleUz").toString().trim();
  const slug = formData.get("slug").toString().trim() || createSlug(titleUz);
  const type = "Film";
  const posterUrl = formData.get("posterUrl").toString().trim() || posterPreviewDataUrl;
  const genres = getSelectedValues(adminForm.elements.namedItem("genres"));
  const languages = getSelectedValues(adminForm.elements.namedItem("languages"));

  const newItem = normalizeMovieSchema({
    id: slug,
    titleUz,
    originalTitle: formData.get("originalTitle").toString().trim(),
    slug,
    description: formData.get("description").toString().trim(),
    posterUrl,
    year: Number(formData.get("year")),
    country: formData.get("country").toString().trim(),
    genres,
    languages,
    duration: formData.get("duration").toString().trim(),
    director: formData.get("director").toString().trim(),
    rating: Number(formData.get("rating")),
    type,
    status: formData.get("status").toString(),
    quality: "Full HD",
    videoSource: formData.get("videoSource").toString(),
    downloadFormat: formData.get("format").toString(),
    format: formData.get("format").toString(),
    downloads: {
      "1080p": {
        url: formData.get("download1080pUrl").toString().trim(),
        size: formData.get("download1080pSize").toString().trim(),
        format: formData.get("format").toString(),
      },
    },
    download1080pUrl: formData.get("download1080pUrl").toString().trim(),
    download1080pSize: formData.get("download1080pSize").toString().trim(),
  });

  try {
    adminFeedback.textContent = "Kontent MongoDB'ga saqlanmoqda...";
    await saveMovieToCatalog(newItem, editingMovieSlug);
    adminFeedback.textContent = editingMovieSlug
      ? "Film MongoDB'da yangilandi."
      : "Film MongoDB'ga saqlandi. Endi katalogda paydo bo'ladi.";
  } catch (error) {
    adminFeedback.textContent = error.message;
    return;
  }

  await loadCatalogFromApi();
  adminForm.reset();
  slugEditedManually = false;
  posterPreviewDataUrl = "";
  adminForm.elements.quality.value = "Full HD";
});

document.querySelectorAll("[data-add-episode]").forEach((button) => {
  button.addEventListener("click", () => {
    const form = button.dataset.addEpisode === "edit" ? seriesEditForm : seriesCreateForm;
    const container = getSeriesEpisodeContainer(form);
    const currentCount = container.querySelectorAll(".series-episode-row").length;
    container.append(
      createSeriesEpisodeRow(
        {
          seasonNumber: 1,
          episodeNumber: currentCount + 1,
          title: "",
          downloadLink: "",
        },
        currentCount,
      ),
    );
    syncSeriesEpisodeCounts(form);
    updateSeriesPreviewFromForm(
      form,
      form === seriesEditForm ? seriesEditPosterDataUrl : seriesCreatePosterDataUrl,
    );
    seriesFeedback.textContent = "";
  });
});

[seriesCreateEpisodes, seriesEditEpisodes].forEach((container) => {
  container.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove-episode]");

    if (!removeButton) {
      return;
    }

    const form = container === seriesEditEpisodes ? seriesEditForm : seriesCreateForm;
    removeButton.closest(".series-episode-row")?.remove();
    syncSeriesEpisodeCounts(form);
    updateSeriesPreviewFromForm(
      form,
      form === seriesEditForm ? seriesEditPosterDataUrl : seriesCreatePosterDataUrl,
    );
    seriesFeedback.textContent = "";
  });

  container.addEventListener("input", () => {
    const form = container === seriesEditEpisodes ? seriesEditForm : seriesCreateForm;
    syncSeriesEpisodeCounts(form);
    updateSeriesPreviewFromForm(
      form,
      form === seriesEditForm ? seriesEditPosterDataUrl : seriesCreatePosterDataUrl,
    );
    seriesFeedback.textContent = "";
  });
});

document.querySelectorAll("[data-series-preview-form]").forEach((button) => {
  button.addEventListener("click", () => {
    const isEditPreview = button.dataset.seriesPreviewForm === "edit";
    const form = isEditPreview ? seriesEditForm : seriesCreateForm;
    const existingSeries = isEditPreview ? findSeriesById(editingSeriesId) : null;
    const posterDataUrl = isEditPreview ? seriesEditPosterDataUrl : seriesCreatePosterDataUrl;
    const previewSeries = getSeriesFormPayload(form, posterDataUrl, existingSeries);

    renderSeriesPreview(previewSeries, { scroll: true });
    seriesFeedback.textContent = "Preview tayyor. MongoDB'ga saqlanmadi.";
  });
});

seriesPreviewClose?.addEventListener("click", () => {
  updateSeriesPreviewFromForm(seriesCreateForm, seriesCreatePosterDataUrl);
});

seriesCreateForm.addEventListener("input", (event) => {
  if (event.target.name === "titleUz" && !seriesCreateSlugEditedManually) {
    seriesCreateForm.elements.namedItem("slug").value = createSlug(event.target.value);
  }

  if (event.target.name === "slug") {
    seriesCreateSlugEditedManually = true;
  }

  seriesFeedback.textContent = "";
  updateSeriesPreviewFromForm(seriesCreateForm, seriesCreatePosterDataUrl);
});

seriesCreateForm.addEventListener("change", async (event) => {
  if (event.target.name === "posterFile") {
    const [file] = event.target.files;
    seriesCreatePosterDataUrl = "";

    if (file) {
      isSeriesPosterProcessing = true;
      seriesFeedback.textContent = "Serial posteri tayyorlanmoqda...";

      try {
        seriesCreatePosterDataUrl = await createPersistentPosterDataUrl(file);
        seriesFeedback.textContent = "";
      } catch (error) {
        event.target.value = "";
        seriesFeedback.textContent = error.message;
      } finally {
        isSeriesPosterProcessing = false;
      }
    }
  }

  updateSeriesPreviewFromForm(seriesCreateForm, seriesCreatePosterDataUrl);
});

seriesCreateForm.addEventListener("reset", () => {
  setTimeout(() => {
    seriesCreateSlugEditedManually = false;
    seriesCreatePosterDataUrl = "";
    isSeriesPosterProcessing = false;
    renderSeriesEpisodeRows(seriesCreateForm, []);
    renderMultiSelect("genres", seriesCreateForm);
    renderMultiSelect("languages", seriesCreateForm);
    updateSeriesPreviewFromForm(seriesCreateForm, seriesCreatePosterDataUrl);
    seriesFeedback.textContent = "";
  }, 0);
});

seriesCreateForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    assertAdminAccess();
  } catch (error) {
    seriesFeedback.textContent = "Faqat admin serial qo'shishi, tahrirlashi yoki o'chirishi mumkin.";
    return;
  }

  if (!validateSeriesForm(seriesCreateForm, seriesCreatePosterDataUrl)) {
    return;
  }

  const series = getSeriesFormPayload(seriesCreateForm, seriesCreatePosterDataUrl);

  try {
    seriesFeedback.textContent = "Serial MongoDB'ga saqlanmoqda...";
    await saveSeriesToCatalog(series);
    seriesFeedback.textContent = "Serial MongoDB'ga saqlandi.";
  } catch (error) {
    seriesFeedback.textContent = error.message;
    return;
  }

  await loadCatalogFromApi();
  seriesCreateForm.reset();
  seriesCreateSlugEditedManually = false;
  seriesCreatePosterDataUrl = "";
  renderSeriesEpisodeRows(seriesCreateForm, []);
  updateSeriesPreviewFromForm(seriesCreateForm, seriesCreatePosterDataUrl);
});

seriesEditForm.addEventListener("input", () => {
  seriesFeedback.textContent = "";
  updateSeriesPreviewFromForm(seriesEditForm, seriesEditPosterDataUrl);
});

seriesEditForm.addEventListener("change", async (event) => {
  if (event.target.name === "posterFile") {
    const [file] = event.target.files;
    seriesEditPosterDataUrl = "";

    if (file) {
      isSeriesPosterProcessing = true;
      seriesFeedback.textContent = "Serial posteri tayyorlanmoqda...";

      try {
        seriesEditPosterDataUrl = await createPersistentPosterDataUrl(file);
        seriesFeedback.textContent = "";
      } catch (error) {
        event.target.value = "";
        seriesFeedback.textContent = error.message;
      } finally {
        isSeriesPosterProcessing = false;
      }
    }
  }

  updateSeriesPreviewFromForm(seriesEditForm, seriesEditPosterDataUrl);
});

seriesEditForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    assertAdminAccess();
  } catch (error) {
    seriesFeedback.textContent = "Faqat admin serial qo'shishi, tahrirlashi yoki o'chirishi mumkin.";
    return;
  }

  const existingSeries = findSeriesById(editingSeriesId);

  if (!existingSeries) {
    seriesFeedback.textContent = "Serial topilmadi.";
    return;
  }

  if (!validateSeriesForm(seriesEditForm, seriesEditPosterDataUrl, existingSeries)) {
    return;
  }

  const series = getSeriesFormPayload(seriesEditForm, seriesEditPosterDataUrl, existingSeries);

  try {
    seriesFeedback.textContent = "Serial MongoDB'da yangilanmoqda...";
    await saveSeriesToCatalog(series, editingSeriesId);
    seriesFeedback.textContent = "Serial MongoDB'da yangilandi.";
  } catch (error) {
    seriesFeedback.textContent = error.message;
    return;
  }

  await loadCatalogFromApi();
  clearSeriesEditForm();
});

seriesCancelEditButton.addEventListener("click", () => {
  clearSeriesEditForm();
  seriesFeedback.textContent = "";
});

seriesEpisodeForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    assertAdminAccess();
  } catch (error) {
    seriesFeedback.textContent = "Faqat admin qismlarni boshqarishi mumkin.";
    return;
  }

  if (!selectedSeriesId) {
    seriesFeedback.textContent = "Avval serial tanlang.";
    return;
  }

  const firstEmptyField = Array.from(seriesEpisodeForm.querySelectorAll("[required]")).find(
    (field) => !field.value.trim(),
  );

  if (firstEmptyField) {
    firstEmptyField.focus();
    seriesFeedback.textContent = "Qism uchun majburiy maydonlarni to'ldiring.";
    return;
  }

  const episode = getEpisodeFormPayload();
  seriesFeedback.textContent = editingEpisodeId ? "Qism yangilanmoqda..." : "Qism qo'shilmoqda...";

  try {
    await saveEpisodeForSeries(selectedSeriesId, episode, editingEpisodeId);
    seriesFeedback.textContent = editingEpisodeId ? "Qism yangilandi." : "Qism qo'shildi.";
    clearEpisodeForm();
    renderEpisodePanel();
  } catch (error) {
    seriesFeedback.textContent = error.message;
  }
});

seriesEpisodeList.addEventListener("click", async (event) => {
  const editButton = event.target.closest("[data-episode-edit]");
  const deleteButton = event.target.closest("[data-episode-delete]");
  const series = findSeriesById(selectedSeriesId);

  if (!series) {
    seriesFeedback.textContent = "Serial topilmadi.";
    return;
  }

  if (editButton) {
    const episode = series.episodes.find((item) => item.id === editButton.dataset.episodeEdit);

    if (!episode) {
      seriesFeedback.textContent = "Qism topilmadi.";
      return;
    }

    fillEpisodeForm(episode);
    return;
  }

  if (deleteButton) {
    const confirmed = window.confirm("Are you sure you want to delete this episode?");

    if (!confirmed) {
      return;
    }

    try {
      deleteButton.disabled = true;
      seriesFeedback.textContent = "Qism o'chirilmoqda...";
      await deleteEpisodeFromSeries(selectedSeriesId, deleteButton.dataset.episodeDelete);
      seriesFeedback.textContent = "Qism o'chirildi.";
      clearEpisodeForm();
      renderEpisodePanel();
    } catch (error) {
      deleteButton.disabled = false;
      seriesFeedback.textContent = error.message;
    }
  }
});

seriesEpisodeCancel.addEventListener("click", () => {
  clearEpisodeForm();
  seriesFeedback.textContent = "";
});

seriesCloseEpisodes.addEventListener("click", () => {
  clearEpisodePanel();
  renderAdminSeriesList();
});

window.addEventListener("hashchange", () => {
  routeFromCurrentHash({ shouldResetSearch: true });
});

window.addEventListener("popstate", () => {
  routeFromCurrentHash({ shouldResetSearch: true });
});

async function initializeApp() {
  currentUser = await restoreStoredSession();
  updateAuthUI();
  routeFromCurrentHash({ shouldResetSearch: false });
  await loadCatalogFromApi();
}

initializeApp();
