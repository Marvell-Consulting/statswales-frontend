import { createRequestHandler } from "@react-router/express";
import express from "express";
import { merge } from "lodash-es";
import { unstable_createContext } from "react-router";
import pino from "pino";
import pinoHttp from "pino-http";
import pick from "lodash/pick.js";
var AuthProvider = /* @__PURE__ */ ((AuthProvider2) => {
  AuthProvider2["Jwt"] = "jwt";
  AuthProvider2["Google"] = "google";
  AuthProvider2["EntraId"] = "entraid";
  AuthProvider2["Local"] = "local";
  return AuthProvider2;
})(AuthProvider || {});
var AppEnv = /* @__PURE__ */ ((AppEnv2) => {
  AppEnv2["Local"] = "local";
  AppEnv2["Ci"] = "ci";
  AppEnv2["Staging"] = "staging";
  AppEnv2["Prod"] = "production";
  AppEnv2["Default"] = "default";
  return AppEnv2;
})(AppEnv || {});
var SessionStore = /* @__PURE__ */ ((SessionStore2) => {
  SessionStore2["Memory"] = "memory";
  SessionStore2["Redis"] = "redis";
  return SessionStore2;
})(SessionStore || {});
var Locale = /* @__PURE__ */ ((Locale2) => {
  Locale2["English"] = "en";
  Locale2["Welsh"] = "cy";
  Locale2["EnglishGb"] = "en-GB";
  Locale2["WelshGb"] = "cy-GB";
  return Locale2;
})(Locale || {});
const ONE_DAY = 24 * 60 * 60 * 1e3;
const getDefaultConfig = () => {
  return {
    env: AppEnv.Default,
    // MUST be overridden by other configs
    supportEmail: {
      en: process.env.SUPPORT_EMAIL || "StatsWales@gov.wales",
      cy: process.env.SUPPORT_EMAIL_CY || "StatsCymru@llyw.cymru"
    },
    frontend: {
      port: parseInt(process.env.FRONTEND_PORT || "3000", 10),
      url: process.env.FRONTEND_URL
    },
    backend: {
      port: parseInt(process.env.BACKEND_PORT || "3000", 10),
      url: process.env.BACKEND_URL
    },
    language: {
      availableTranslations: [Locale.English, Locale.Welsh],
      supportedLocales: [Locale.English, Locale.EnglishGb, Locale.Welsh, Locale.WelshGb],
      fallback: Locale.English
    },
    session: {
      store: process.env.SESSION_STORE,
      secret: process.env.SESSION_SECRET,
      secure: true,
      maxAge: parseInt(process.env.SESSION_MAX_AGE || ONE_DAY.toString(), 10),
      redisUrl: process.env.REDIS_URL,
      redisPassword: process.env.REDIS_ACCESS_KEY
    },
    logger: {
      level: process.env.LOG_LEVEL || "info"
    },
    rateLimit: {
      windowMs: 6e4,
      maxRequests: 100
    },
    auth: {
      providers: [],
      jwt: {
        secret: process.env.JWT_SECRET,
        cookieDomain: process.env.JWT_COOKIE_DOMAIN
      }
    }
  };
};
function defineConfig(config2) {
  return merge({}, getDefaultConfig(), config2);
}
function getLocalConfig() {
  return defineConfig({
    env: AppEnv.Local,
    frontend: {
      port: parseInt(process.env.FRONTEND_PORT || "3000", 10),
      url: process.env.FRONTEND_URL || "http://localhost:3000"
    },
    backend: {
      port: parseInt(process.env.BACKEND_PORT || "3001", 10),
      url: process.env.BACKEND_URL || "http://localhost:3001"
    },
    session: {
      store: process.env.SESSION_STORE || SessionStore.Redis,
      secret: process.env.SESSION_SECRET || "mysecret",
      secure: false,
      redisUrl: process.env.REDIS_URL || "redis://localhost:6380"
    },
    logger: {
      level: process.env.LOG_LEVEL || "debug"
    },
    rateLimit: {
      windowMs: -1
      // disable rate limiting in local
    },
    auth: {
      providers: [AuthProvider.EntraId, AuthProvider.Google, AuthProvider.Local],
      jwt: {
        secret: process.env.JWT_SECRET || "jwtsecret",
        cookieDomain: "http://localhost"
      }
    }
  });
}
function getCIConfig() {
  return defineConfig({
    env: AppEnv.Ci,
    supportEmail: {
      en: "support@example.com",
      cy: "support@example.com"
    },
    logger: {
      level: process.env.LOG_LEVEL || "silent"
    },
    frontend: {
      port: 3e3,
      url: "http://localhost:3000"
    },
    backend: {
      port: 3001,
      url: "http://localhost:3001"
    },
    rateLimit: {
      windowMs: -1
      // disable rate limiting in CI
    },
    session: {
      store: SessionStore.Memory,
      secret: "mysecret",
      secure: false
    },
    auth: {
      providers: [AuthProvider.Local],
      jwt: {
        secret: process.env.JWT_SECRET || "jwtsecret",
        cookieDomain: "http://localhost"
      }
    }
  });
}
function getStagingConfig() {
  return defineConfig({
    env: AppEnv.Staging,
    session: {
      store: SessionStore.Redis
    },
    auth: {
      providers: [AuthProvider.EntraId],
      jwt: {
        cookieDomain: process.env.JWT_COOKIE_DOMAIN || process.env.BACKEND_URL.replace("api.", "")
      }
    }
  });
}
function getProductionConfig() {
  return defineConfig({
    env: AppEnv.Prod,
    session: {
      store: SessionStore.Redis
    }
  });
}
const appConfig = () => {
  const currentEnv = process.env.APP_ENV;
  switch (currentEnv) {
    case AppEnv.Local:
      return getLocalConfig();
    case AppEnv.Ci:
      return getCIConfig();
    case AppEnv.Staging:
      return getStagingConfig();
    case AppEnv.Prod:
      return getProductionConfig();
    case AppEnv.Default:
    default:
      throw new Error(`Invalid APP_ENV "${currentEnv}"`);
  }
};
const appConfigContext = unstable_createContext(appConfig());
const config$1 = appConfig();
const logger = pino({
  level: config$1.logger.level
});
pinoHttp({
  logger,
  autoLogging: {
    ignore: (req) => {
      const ignorePathsRx = /^\/css|\/public|\/assets|\/favicon/;
      return ignorePathsRx.test(req.url || "");
    }
  },
  customLogLevel(req, res, err) {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return "warn";
    } else if (res.statusCode >= 500 || err) {
      return "error";
    }
    return "info";
  },
  serializers: {
    req(req) {
      return pick(req, ["method", "url", "query", "params"]);
    },
    res(res) {
      return pick(res, ["statusCode"]);
    }
  }
});
const config = appConfig();
const app = express();
app.get("/.well-known/appspecific/com.chrome.devtools.json", () => {
});
app.get("/:lang/auth/google", (req, res) => {
  logger.debug("Sending user to backend for google authentication");
  res.redirect(`${config.backend.url}/auth/google?lang=${req.params.lang}`);
});
app.get("/:lang/auth/entraid", (req, res) => {
  logger.debug("Sending user to backend for entraid authentication");
  res.redirect(`${config.backend.url}/auth/entraid?lang=${req.params.lang}`);
});
app.use(
  createRequestHandler({
    build: () => import("./server-build-DrTCsTao.js"),
    getLoadContext: (req, res) => {
      let map = /* @__PURE__ */ new Map();
      map.set(appConfigContext, config);
      return map;
    }
  })
);
export {
  Locale as L,
  SessionStore as S,
  appConfig as a,
  appConfigContext as b,
  app as c,
  logger as l
};
