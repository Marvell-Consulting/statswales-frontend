import { checkConfig } from '../../../src/shared/config/check-config';
import { AppConfig } from '../../../src/shared/config/app-config.interface';
import { AppEnv } from '../../../src/shared/config/env.enum';
import { SessionStore } from '../../../src/shared/config/session-store.enum';
import { AuthProvider } from '../../../src/shared/enums/auth-providers';
import { Locale } from '../../../src/shared/enums/locale';

const VALID_SECRET = 'a-very-long-and-random-secret-value-1234567890';

const buildConfig = (overrides: Partial<AppConfig> = {}, env: AppEnv = AppEnv.Prod): AppConfig => ({
  env,
  build: { gitSha: 'abc123' },
  email: {
    support: { en: 'support@example.com', cy: 'support@example.com' },
    notify: { apiKey: 'notify-api-key', templateId: 'notify-template-id' }
  },
  frontend: {
    publisher: { port: 3000, url: 'https://publisher.example.com' },
    consumer: { port: 3100, url: 'https://consumer.example.com' }
  },
  backend: { port: 3001, url: 'https://backend.example.com' },
  language: {
    availableTranslations: [Locale.English, Locale.Welsh],
    supportedLocales: [Locale.English, Locale.EnglishGb, Locale.Welsh, Locale.WelshGb],
    fallback: Locale.English
  },
  session: {
    store: SessionStore.Redis,
    secret: VALID_SECRET,
    secure: true,
    maxAge: 86400000
  },
  logger: { level: 'info' },
  rateLimit: { windowMs: 60000, maxRequests: 100 },
  auth: {
    providers: [AuthProvider.EntraId],
    jwt: { secret: VALID_SECRET, cookieDomain: 'example.com' }
  },
  ...overrides
});

describe('checkConfig', () => {
  it('boots successfully with a valid, real-looking config', () => {
    expect(() => checkConfig(buildConfig())).not.toThrow();
  });

  it('throws when a required leaf is undefined', () => {
    const config = buildConfig({ backend: { port: 3001, url: undefined as unknown as string } });
    expect(() => checkConfig(config)).toThrow('backend.url is invalid or missing, stopping server');
  });

  it('throws when a required leaf is an empty string', () => {
    const config = buildConfig({ backend: { port: 3001, url: '' } });
    expect(() => checkConfig(config)).toThrow('backend.url is invalid or missing, stopping server');
  });

  it('throws when a required leaf is a whitespace-only string', () => {
    const config = buildConfig({ backend: { port: 3001, url: '   ' } });
    expect(() => checkConfig(config)).toThrow('backend.url is invalid or missing, stopping server');
  });

  it('does not throw when an optional leaf is undefined', () => {
    const config = buildConfig({
      backend: { port: 3001, url: 'https://backend.example.com', rateLimitBypassToken: undefined }
    });
    expect(() => checkConfig(config)).not.toThrow();
  });

  describe('in a prod-like environment', () => {
    it('rejects an empty jwt secret', () => {
      const config = buildConfig({
        auth: { providers: [AuthProvider.EntraId], jwt: { secret: '', cookieDomain: 'example.com' } }
      });
      expect(() => checkConfig(config)).toThrow('auth.jwt.secret is invalid or missing, stopping server');
    });

    it('rejects a short jwt secret', () => {
      const config = buildConfig({
        auth: { providers: [AuthProvider.EntraId], jwt: { secret: 'short', cookieDomain: 'example.com' } }
      });
      expect(() => checkConfig(config)).toThrow(
        'auth.jwt.secret is too short (minimum 32 characters), stopping server'
      );
    });

    it('rejects a known-weak jwt secret', () => {
      const config = buildConfig({
        auth: { providers: [AuthProvider.EntraId], jwt: { secret: 'jwtsecret', cookieDomain: 'example.com' } }
      });
      expect(() => checkConfig(config)).toThrow('auth.jwt.secret is a known weak/default value, stopping server');
    });

    it('rejects a known-weak session secret regardless of case', () => {
      const config = buildConfig({
        session: { store: SessionStore.Redis, secret: 'MySecret', secure: true, maxAge: 86400000 }
      });
      expect(() => checkConfig(config)).toThrow('session.secret is a known weak/default value, stopping server');
    });

    it('rejects a short session secret', () => {
      const config = buildConfig({
        session: { store: SessionStore.Redis, secret: 'tooshort', secure: true, maxAge: 86400000 }
      });
      expect(() => checkConfig(config)).toThrow('session.secret is too short (minimum 32 characters), stopping server');
    });

    it('boots when secrets are long and not known-weak values', () => {
      expect(() => checkConfig(buildConfig({}, AppEnv.Staging))).not.toThrow();
    });
  });

  describe('in local/CI environments', () => {
    it('allows the known-weak placeholder jwt secret in local', () => {
      const config = buildConfig(
        { auth: { providers: [AuthProvider.Local], jwt: { secret: 'jwtsecret', cookieDomain: 'localhost' } } },
        AppEnv.Local
      );
      expect(() => checkConfig(config)).not.toThrow();
    });

    it('allows the known-weak placeholder session secret in CI', () => {
      const config = buildConfig(
        { session: { store: SessionStore.Memory, secret: 'mysecret', secure: false, maxAge: 86400000 } },
        AppEnv.Ci
      );
      expect(() => checkConfig(config)).not.toThrow();
    });

    it('still rejects a blank secret in local', () => {
      const config = buildConfig(
        { auth: { providers: [AuthProvider.Local], jwt: { secret: '', cookieDomain: 'localhost' } } },
        AppEnv.Local
      );
      expect(() => checkConfig(config)).toThrow('auth.jwt.secret is invalid or missing, stopping server');
    });
  });
});
