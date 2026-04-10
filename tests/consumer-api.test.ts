import { config } from '../src/shared/config';
import { HttpMethod } from '../src/shared/enums/http-method';
import { ApiException } from '../src/shared/exceptions/api.exception';
import { UnknownException } from '../src/shared/exceptions/unknown.exception';
import { ConsumerApi } from '../src/consumer/services/consumer-api';

describe('ConsumerApi', () => {
  let consumerApi: ConsumerApi;
  let fetchSpy: jest.SpyInstance;
  let mockResponse: Promise<Response>;

  const baseUrl = config.backend.url;

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const headers = { 'Accept-Language': 'en' };

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, 'fetch').mockImplementation(() => mockResponse);
    consumerApi = new ConsumerApi();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rate limit bypass', () => {
    const bypassToken = 'test-bypass-token';
    const originalToken = config.backend.rateLimitBypassToken;

    beforeEach(() => {
      delete (config.backend as Record<string, unknown>).rateLimitBypassToken;
    });

    afterAll(() => {
      config.backend.rateLimitBypassToken = originalToken;
    });

    it('should include x-rate-limit-bypass header when bypass token is configured', async () => {
      config.backend.rateLimitBypassToken = bypassToken;
      mockResponse = Promise.resolve(new Response(null, { status: 200 }));

      await consumerApi.ping();

      expect(fetchSpy).toHaveBeenCalledWith(
        `${baseUrl}/healthcheck?lang=en`,
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/naming-convention
          headers: { ...headers, 'x-rate-limit-bypass': bypassToken }
        })
      );
    });

    it('should not include x-rate-limit-bypass header when bypass token is not configured', async () => {
      mockResponse = Promise.resolve(new Response(null, { status: 200 }));

      await consumerApi.ping();

      expect(fetchSpy).toHaveBeenCalledWith(
        `${baseUrl}/healthcheck?lang=en`,
        expect.objectContaining({
          headers: expect.not.objectContaining({
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'x-rate-limit-bypass': expect.anything()
          })
        })
      );
    });
  });

  describe('Error handling', () => {
    it('should throw an UnknownException when the backend is unreachable', async () => {
      mockResponse = Promise.reject(new Error('Service Unavailable'));
      await expect(consumerApi.fetch({ url: 'example.com/api' })).rejects.toThrow(
        new UnknownException('Service Unavailable')
      );
    });

    it('should throw an ApiException when the backend returns a 500', async () => {
      mockResponse = Promise.resolve(new Response(null, { status: 500, statusText: 'Internal Server Error' }));
      await expect(consumerApi.fetch({ url: 'example.com/api' })).rejects.toThrow(
        new ApiException('Internal Server Error', 500)
      );
    });
  });

  describe('ping', () => {
    it('should return true when the backend is reachable', async () => {
      mockResponse = Promise.resolve(new Response(null, { status: 200 }));

      const ping = await consumerApi.ping();

      expect(fetchSpy).toHaveBeenCalledWith(
        `${baseUrl}/healthcheck?lang=en`,
        expect.objectContaining({ method: HttpMethod.Get, headers })
      );
      expect(ping).toBe(true);
    });
  });
});
