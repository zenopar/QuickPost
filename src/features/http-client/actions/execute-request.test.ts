import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { executeHttpRequest } from './execute-request';
import { HttpRequest } from '../types';
import { resetRateLimiter } from '../../../shared/lib/rate-limiter';
import { verifyDemoPassword, lockDemoSession } from './demo-mode';
import { isAllowedDemoUrl } from '../utils/demo-utils';


const mockCookieStore = new Map<string, { name: string; value: string }>();

// Mock Next.js headers() and cookies()
vi.mock('next/headers', () => ({
  headers: async () => new Map([['x-forwarded-for', '192.168.1.100']]),
  cookies: async () => ({
    get: (name: string) => mockCookieStore.get(name),
    set: (name: string, value: string) => mockCookieStore.set(name, { name, value }),
    delete: (name: string) => mockCookieStore.delete(name),
  }),
}));

describe('executeHttpRequest Server Action', () => {
  const originalAllowLocal = process.env.ALLOW_LOCAL_REQUESTS;
  const originalDemo = process.env.DEMO;
  const originalPass = process.env.PASS;

  beforeEach(() => {
    vi.restoreAllMocks();
    resetRateLimiter(); // Reset Rate Limiter memory before each test
    mockCookieStore.clear();
    process.env.ALLOW_LOCAL_REQUESTS = 'false';
    process.env.DEMO = 'false';
    delete process.env.PASS;
  });

  afterEach(() => {
    mockCookieStore.clear();
    if (originalAllowLocal === undefined) {
      delete process.env.ALLOW_LOCAL_REQUESTS;
    } else {
      process.env.ALLOW_LOCAL_REQUESTS = originalAllowLocal;
    }
    if (originalDemo === undefined) {
      delete process.env.DEMO;
    } else {
      process.env.DEMO = originalDemo;
    }
    if (originalPass === undefined) {
      delete process.env.PASS;
    } else {
      process.env.PASS = originalPass;
    }
  });

  it('should successfully execute a GET request and return formatted response', async () => {
    const mockResponseText = JSON.stringify({ message: 'Success' });

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status: 200,
        statusText: 'OK',
        ok: true,
        headers: new Map([['content-type', 'application/json']]),
        text: async () => mockResponseText,
      })
    );

    const mockRequest: HttpRequest = {
      id: 'req-1',
      method: 'GET',
      url: 'https://api.example.com/data',
      queryParams: [{ id: 'p1', key: 'search', value: 'vitest', enabled: true }],
      headers: [{ id: 'h1', key: 'Accept', value: 'application/json', enabled: true }],
      auth: { type: 'none' },
      body: { type: 'none' },
    };

    const response = await executeHttpRequest(mockRequest);

    expect(response.status).toBe(200);
    expect(response.statusText).toBe('OK');
    expect(response.data).toBe(mockResponseText);
    expect(response.isError).toBe(false);
    expect(response.contentType).toBe('application/json');
    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.com/data?search=vitest',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Accept: 'application/json' }),
      })
    );
  });

  it('should format Bearer authentication header correctly', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status: 200,
        statusText: 'OK',
        ok: true,
        headers: new Map(),
        text: async () => 'OK',
      })
    );

    const mockRequest: HttpRequest = {
      id: 'req-2',
      method: 'POST',
      url: 'https://api.example.com/secure',
      queryParams: [],
      headers: [],
      auth: { type: 'bearer', bearerToken: 'secret-token-123' },
      body: { type: 'json', rawContent: '{"key":"value"}' },
    };

    await executeHttpRequest(mockRequest);

    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.com/secure',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer secret-token-123',
          'Content-Type': 'application/json',
        }),
        body: '{"key":"value"}',
      })
    );
  });

  it('should handle network errors gracefully without crashing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Failed to fetch / DNS lookup failed'))
    );

    const mockRequest: HttpRequest = {
      id: 'req-3',
      method: 'GET',
      url: 'https://invalid-domain-that-does-not-exist.test',
      queryParams: [],
      headers: [],
      auth: { type: 'none' },
      body: { type: 'none' },
    };

    const response = await executeHttpRequest(mockRequest);

    expect(response.status).toBe(0);
    expect(response.statusText).toBe('Network Error');
    expect(response.isError).toBe(true);
    expect(response.errorDetails).toContain('Failed to fetch');
  });

  it('should block requests to localhost (SSRF protection)', async () => {
    vi.stubGlobal('fetch', vi.fn());

    const mockRequest: HttpRequest = {
      id: 'req-ssrf-local',
      method: 'GET',
      url: 'http://localhost:8080/admin',
      queryParams: [],
      headers: [],
      auth: { type: 'none' },
      body: { type: 'none' },
    };

    const response = await executeHttpRequest(mockRequest);
    expect(response.status).toBe(403);
    expect(response.statusText).toBe('Forbidden');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should allow requests to localhost if ALLOW_LOCAL_REQUESTS is true', async () => {
    process.env.ALLOW_LOCAL_REQUESTS = 'true';
    
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status: 200,
        statusText: 'OK',
        ok: true,
        headers: new Map(),
        text: async () => 'OK',
      })
    );

    const mockRequest: HttpRequest = {
      id: 'req-ssrf-local-allowed',
      method: 'GET',
      url: 'http://localhost:8080/admin',
      queryParams: [],
      headers: [],
      auth: { type: 'none' },
      body: { type: 'none' },
    };

    const response = await executeHttpRequest(mockRequest);
    expect(response.status).toBe(200);
    expect(fetch).toHaveBeenCalled();
  });

  it('should block requests to private IP ranges (SSRF protection)', async () => {
    vi.stubGlobal('fetch', vi.fn());

    const testIps = ['192.168.1.1', '10.0.0.5', '172.16.2.3', '169.254.1.1', '[::1]'];

    for (const ip of testIps) {
      const mockRequest: HttpRequest = {
        id: `req-ssrf-${ip}`,
        method: 'GET',
        url: `http://${ip}/secure-data`,
        queryParams: [],
        headers: [],
        auth: { type: 'none' },
        body: { type: 'none' },
      };

      const response = await executeHttpRequest(mockRequest);
      expect(response.status).toBe(403);
    }
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should enforce rate limit and return 429 Too Many Requests on the 31st request', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status: 200,
        statusText: 'OK',
        ok: true,
        headers: new Map(),
        text: async () => 'OK',
      })
    );

    const mockRequest: HttpRequest = {
      id: 'req-rate-limit',
      method: 'GET',
      url: 'https://api.example.com/ping',
      queryParams: [],
      headers: [],
      auth: { type: 'none' },
      body: { type: 'none' },
    };

    // Execute 30 requests - all should succeed
    for (let i = 0; i < 30; i++) {
      const res = await executeHttpRequest(mockRequest);
      expect(res.status).toBe(200);
    }

    // 31st request from the same IP must fail with 429 Too Many Requests
    const rateLimitedResponse = await executeHttpRequest(mockRequest);

    expect(rateLimitedResponse.status).toBe(429);
    expect(rateLimitedResponse.statusText).toBe('Too Many Requests');
    expect(rateLimitedResponse.isError).toBe(true);
    expect(rateLimitedResponse.errorDetails).toContain('Rate limit exceeded');
    expect(rateLimitedResponse.headers['retry-after']).toBe('60');
  });

  describe('DEMO Mode & PASS Protection', () => {
    it('should allow arbitrary URLs when DEMO is false (default)', async () => {
      process.env.DEMO = 'false';
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          status: 200,
          statusText: 'OK',
          ok: true,
          headers: new Map(),
          text: async () => 'OK',
        })
      );

      const mockRequest: HttpRequest = {
        id: 'demo-test-1',
        method: 'GET',
        url: 'https://api.github.com/users',
        queryParams: [],
        headers: [],
        auth: { type: 'none' },
        body: { type: 'none' },
      };

      const response = await executeHttpRequest(mockRequest);
      expect(response.status).toBe(200);
      expect(fetch).toHaveBeenCalled();
    });

    it('should allow requests to https://echo.free.beeceptor.com when DEMO is true without unlocking', async () => {
      process.env.DEMO = 'true';
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          status: 200,
          statusText: 'OK',
          ok: true,
          headers: new Map(),
          text: async () => '{"status":"echoed"}',
        })
      );

      const mockRequest: HttpRequest = {
        id: 'demo-test-beeceptor',
        method: 'GET',
        url: 'https://echo.free.beeceptor.com/sample/path?test=1',
        queryParams: [],
        headers: [],
        auth: { type: 'none' },
        body: { type: 'none' },
      };

      const response = await executeHttpRequest(mockRequest);
      expect(response.status).toBe(200);
      expect(fetch).toHaveBeenCalledWith(
        'https://echo.free.beeceptor.com/sample/path?test=1',
        expect.anything()
      );
    });

    it('should block non-beeceptor URLs when DEMO is true and not unlocked', async () => {
      process.env.DEMO = 'true';
      vi.stubGlobal('fetch', vi.fn());

      const mockRequest: HttpRequest = {
        id: 'demo-test-blocked',
        method: 'GET',
        url: 'https://api.example.com/sensitive-endpoint',
        queryParams: [],
        headers: [],
        auth: { type: 'none' },
        body: { type: 'none' },
      };

      const response = await executeHttpRequest(mockRequest);
      expect(response.status).toBe(403);
      expect(response.statusText).toBe('Forbidden (Demo Mode)');
      expect(response.isError).toBe(true);
      expect(response.errorDetails).toContain('Demo mode restriction');
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should block http (insecure) beeceptor URL when DEMO is true', async () => {
      process.env.DEMO = 'true';
      vi.stubGlobal('fetch', vi.fn());

      const mockRequest: HttpRequest = {
        id: 'demo-test-http-blocked',
        method: 'GET',
        url: 'http://echo.free.beeceptor.com/test',
        queryParams: [],
        headers: [],
        auth: { type: 'none' },
        body: { type: 'none' },
      };

      const response = await executeHttpRequest(mockRequest);
      expect(response.status).toBe(403);
      expect(response.statusText).toBe('Forbidden (Demo Mode)');
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should unlock full access when correct PASS is verified', async () => {
      process.env.DEMO = 'true';
      process.env.PASS = 'mySecretPass123';

      // 1. Verify with wrong password
      const wrongResult = await verifyDemoPassword('wrongPassword');
      expect(wrongResult.success).toBe(false);
      expect(wrongResult.error).toContain('Incorrect password');

      // Request to other URL should still be blocked
      const blockedRes = await executeHttpRequest({
        id: 'req-blocked',
        method: 'GET',
        url: 'https://api.example.com/data',
        queryParams: [],
        headers: [],
        auth: { type: 'none' },
        body: { type: 'none' },
      });
      expect(blockedRes.status).toBe(403);

      // 2. Verify with correct password
      const correctResult = await verifyDemoPassword('mySecretPass123');
      expect(correctResult.success).toBe(true);

      // 3. Request to other URL should now succeed
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          status: 200,
          statusText: 'OK',
          ok: true,
          headers: new Map(),
          text: async () => '{"unlocked":true}',
        })
      );

      const unlockedRes = await executeHttpRequest({
        id: 'req-unlocked',
        method: 'GET',
        url: 'https://api.example.com/data',
        queryParams: [],
        headers: [],
        auth: { type: 'none' },
        body: { type: 'none' },
      });
      expect(unlockedRes.status).toBe(200);
      expect(fetch).toHaveBeenCalled();

      // 4. Lock session again
      await lockDemoSession();
      const reBlockedRes = await executeHttpRequest({
        id: 'req-re-blocked',
        method: 'GET',
        url: 'https://api.example.com/data',
        queryParams: [],
        headers: [],
        auth: { type: 'none' },
        body: { type: 'none' },
      });
      expect(reBlockedRes.status).toBe(403);
    });

    it('isAllowedDemoUrl should only allow exact host echo.free.beeceptor.com with https', () => {
      expect(isAllowedDemoUrl('https://echo.free.beeceptor.com')).toBe(true);
      expect(isAllowedDemoUrl('https://echo.free.beeceptor.com/')).toBe(true);
      expect(isAllowedDemoUrl('https://echo.free.beeceptor.com/api/v1/test')).toBe(true);
      expect(isAllowedDemoUrl('http://echo.free.beeceptor.com')).toBe(false);
      expect(isAllowedDemoUrl('https://echo.free.beeceptor.com.attacker.com')).toBe(false);
      expect(isAllowedDemoUrl('https://subdomain.echo.free.beeceptor.com')).toBe(false);
      expect(isAllowedDemoUrl('https://google.com')).toBe(false);
      expect(isAllowedDemoUrl('invalid-url')).toBe(false);
    });
  });
});
