'use server';

import { HttpRequest, HttpResponse } from '../types';
import { checkRateLimit } from '../../../shared/lib/rate-limiter';
import { getClientIp } from '../../../shared/utils/get-client-ip';
import { isDemoUnlocked } from './demo-mode';
import { isAllowedDemoUrl } from '../utils/demo-utils';



export async function executeHttpRequest(request: HttpRequest): Promise<HttpResponse> {
  const startTime = performance.now();

  // 0. Rate Limiting Check (Upstash Redis in Production or In-Memory with auto-cleanup)
  const clientIp = await getClientIp();
  const rateLimitResult = await checkRateLimit(clientIp);

  if (!rateLimitResult.success) {
    return {
      status: 429,
      statusText: 'Too Many Requests',
      headers: {
        'retry-after': '60',
        'x-ratelimit-limit': rateLimitResult.limit.toString(),
        'x-ratelimit-remaining': rateLimitResult.remaining.toString(),
      },
      data: '',
      executionTimeMs: 0,
      sizeBytes: 0,
      isError: true,
      errorDetails: 'Rate limit exceeded. Maximum 30 requests per minute allowed to protect proxy infrastructure.',
    };
  }

  try {
    // 1. Build URL with enabled query parameters
    const urlObj = new URL(request.url);

    // Demo Mode Protection: If DEMO is enabled, requests are restricted to https://echo.free.beeceptor.com unless unlocked with PASS
    if (process.env.DEMO === 'true') {
      const unlocked = await isDemoUnlocked();
      if (!unlocked && !isAllowedDemoUrl(request.url)) {
        return {
          status: 403,
          statusText: 'Forbidden (Demo Mode)',
          headers: {},
          data: '',
          executionTimeMs: Math.round(performance.now() - startTime),
          sizeBytes: 0,
          isError: true,
          errorDetails: 'Demo mode restriction: Requests can only be sent to https://echo.free.beeceptor.com. Enter the access password to unlock full access.',
        };
      }
    }

    // SSRF Protection: Block localhost and local IP addresses (private networks) if explicitly set to false (default: true)
    const allowLocal = process.env.ALLOW_LOCAL_REQUESTS !== 'false';
    if (!allowLocal && isPrivateOrLocalHost(urlObj.hostname)) {
      return {
        status: 403,
        statusText: 'Forbidden',
        headers: {},
        data: '',
        executionTimeMs: Math.round(performance.now() - startTime),
        sizeBytes: 0,
        isError: true,
        errorDetails: 'Security restriction: Requests to localhost or local IP addresses are not allowed.',
      };
    }

    request.queryParams
      .filter((param) => param.enabled && param.key.trim() !== '')
      .forEach((param) => {
        urlObj.searchParams.append(param.key, param.value);
      });

    // 2. Build Headers
    const headersObj: Record<string, string> = {};

    request.headers
      .filter((header) => header.enabled && header.key.trim() !== '')
      .forEach((header) => {
        headersObj[header.key] = header.value;
      });

    // 3. Apply Authentication
    const { auth } = request;
    if (auth.type === 'bearer' && auth.bearerToken) {
      headersObj['Authorization'] = `Bearer ${auth.bearerToken}`;
    } else if (auth.type === 'basic' && (auth.basicUsername || auth.basicPassword)) {
      const credentials = `${auth.basicUsername || ''}:${auth.basicPassword || ''}`;
      const encoded = Buffer.from(credentials).toString('base64');
      headersObj['Authorization'] = `Basic ${encoded}`;
    } else if (auth.type === 'apikey' && auth.apiKeyName && auth.apiKeyValue) {
      if (auth.apiKeyAddTo === 'query') {
        urlObj.searchParams.append(auth.apiKeyName, auth.apiKeyValue);
      } else {
        headersObj[auth.apiKeyName] = auth.apiKeyValue;
      }
    }

    // 4. Prepare Request Body
    let bodyPayload: string | undefined = undefined;

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      if (request.body.type === 'json' && request.body.rawContent) {
        bodyPayload = request.body.rawContent;
        if (!headersObj['Content-Type'] && !headersObj['content-type']) {
          headersObj['Content-Type'] = 'application/json';
        }
      } else if (request.body.type === 'raw' && request.body.rawContent) {
        bodyPayload = request.body.rawContent;
      }
    }

    // 5. Execute HTTP Request on Server
    const response = await fetch(urlObj.toString(), {
      method: request.method,
      headers: headersObj,
      body: bodyPayload,
      cache: 'no-store',
    });

    const endTime = performance.now();
    const executionTimeMs = Math.round(endTime - startTime);

    // 6. Parse Response Headers
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    // 7. Parse Response Body Data
    const responseData = await response.text();
    const sizeBytes = new Blob([responseData]).size;
    const contentType = responseHeaders['content-type'] || 'text/plain';

    return {
      status: response.status,
      statusText: response.statusText || getHttpStatusText(response.status),
      headers: responseHeaders,
      data: responseData,
      executionTimeMs,
      sizeBytes,
      contentType,
      isError: !response.ok,
    };
  } catch (error: unknown) {
    const endTime = performance.now();
    const executionTimeMs = Math.round(endTime - startTime);
    const errorMessage = error instanceof Error ? error.message : 'Unknown network error';

    return {
      status: 0,
      statusText: 'Network Error',
      headers: {},
      data: '',
      executionTimeMs,
      sizeBytes: 0,
      isError: true,
      errorDetails: errorMessage,
    };
  }
}

function getHttpStatusText(status: number): string {
  const statusTexts: Record<number, string> = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
  };
  return statusTexts[status] || 'Unknown Status';
}

function isPrivateOrLocalHost(hostname: string): boolean {
  const host = hostname.toLowerCase();

  // Basic string matches
  if (host === 'localhost' || host === '0.0.0.0' || host.endsWith('.localhost')) {
    return true;
  }

  // IPv4 check
  const ipv4Pattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = host.match(ipv4Pattern);
  
  if (match) {
    const p1 = parseInt(match[1], 10);
    const p2 = parseInt(match[2], 10);
    
    // Check private ranges (RFC 1918 + loopback/link-local)
    if (
      p1 === 10 || // 10.0.0.0/8
      p1 === 127 || // 127.0.0.0/8
      (p1 === 172 && p2 >= 16 && p2 <= 31) || // 172.16.0.0/12
      (p1 === 192 && p2 === 168) || // 192.168.0.0/16
      (p1 === 169 && p2 === 254) // 169.254.0.0/16
    ) {
      return true;
    }
  }

  // IPv6 local/private check (remove brackets for testing)
  const v6Host = host.replace(/^\[|\]$/g, '');
  if (
    v6Host === '::1' || 
    v6Host.startsWith('fc') || 
    v6Host.startsWith('fd') || 
    v6Host.startsWith('fe8') || 
    v6Host.startsWith('fe9') || 
    v6Host.startsWith('fea') || 
    v6Host.startsWith('feb')
  ) {
    return true;
  }

  return false;
}
