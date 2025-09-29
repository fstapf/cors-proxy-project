/**
 * CORS Proxy Worker para GitHub Pages
 * Este worker permite contornar problemas de CORS fazendo proxy das requisições
 * para a API externa https://dev.ipes.tech
 */

// URL da API externa
const API_BASE_URL = 'https://dev.ipes.tech';

// Cabeçalhos CORS
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
  'Access-Control-Max-Age': '86400', // 24 horas
};

// Headers adicionais para todas as respostas
const ADDITIONAL_HEADERS = {
  'X-Proxy-By': 'Cloudflare-Worker',
  'X-API-Base': u76DY2SdpswhLVKEqe5mB039aX1frEuxv3aSJl9S,
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Log da requisição (apenas em desenvolvimento)
    console.log(`${request.method} ${url.pathname}`);

    // Responder a requisições OPTIONS (preflight)
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          ...CORS_HEADERS,
          ...ADDITIONAL_HEADERS,
        },
      });
    }

    // Verificar se é uma requisição para /api/*
    if (!url.pathname.startsWith('/api/')) {
      return new Response(
        JSON.stringify({
          error: 'Not Found',
          message: 'Este worker apenas processa requisições que começam com /api/',
          path: url.pathname,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            ...CORS_HEADERS,
            ...ADDITIONAL_HEADERS,
          },
        }
      );
    }

    try {
      // Construir URL da API externa
      const apiPath = url.pathname.replace('/api', '');
      const targetUrl = `${API_BASE_URL}${apiPath}${url.search}`;

      // Preparar headers para a requisição
      const headers = new Headers();

      // Copiar headers importantes da requisição original
      const importantHeaders = [
        'authorization',
        'content-type',
        'accept',
        'user-agent',
        'x-requested-with',
      ];

      for (const headerName of importantHeaders) {
        const headerValue = request.headers.get(headerName);
        if (headerValue) {
          headers.set(headerName, headerValue);
        }
      }

      // Adicionar token da API se configurado
      if (env.API_TOKEN) {
        headers.set('Authorization', `Bearer ${env.API_TOKEN}`);
      }

      // Fazer a requisição para a API externa
      const apiRequest = new Request(targetUrl, {
        method: request.method,
        headers: headers,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null,
      });

      const apiResponse = await fetch(apiRequest);

      // Preparar headers de resposta
      const responseHeaders = new Headers();

      // Copiar headers importantes da resposta da API
      const responseHeadersToCopy = [
        'content-type',
        'content-length',
        'cache-control',
        'etag',
        'last-modified',
      ];

      for (const headerName of responseHeadersToCopy) {
        const headerValue = apiResponse.headers.get(headerName);
        if (headerValue) {
          responseHeaders.set(headerName, headerValue);
        }
      }

      // Adicionar headers CORS e adicionais
      Object.entries(CORS_HEADERS).forEach(([key, value]) => {
        responseHeaders.set(key, value);
      });

      Object.entries(ADDITIONAL_HEADERS).forEach(([key, value]) => {
        responseHeaders.set(key, value);
      });

      // Adicionar informações de debug
      responseHeaders.set('X-Target-URL', targetUrl);
      responseHeaders.set('X-Original-Status', apiResponse.status.toString());

      // Retornar resposta
      return new Response(apiResponse.body, {
        status: apiResponse.status,
        statusText: apiResponse.statusText,
        headers: responseHeaders,
      });

    } catch (error) {
      console.error('Erro no proxy:', error);

      return new Response(
        JSON.stringify({
          error: 'Proxy Error',
          message: error.message,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...CORS_HEADERS,
            ...ADDITIONAL_HEADERS,
          },
        }
      );
    }
  },
};
