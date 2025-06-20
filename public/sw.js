// =============================================================================
// SERVICE WORKER - STAYFOCUS PWA
// =============================================================================
// Service Worker para cache offline, PWA e sincronização em background
// =============================================================================

const CACHE_NAME = 'stayfocus-v1.0.0'
const STATIC_CACHE = 'stayfocus-static-v1.0.0'
const DYNAMIC_CACHE = 'stayfocus-dynamic-v1.0.0'
const API_CACHE = 'stayfocus-api-v1.0.0'

// Recursos estáticos para cache
const STATIC_ASSETS = [
  '/',
  '/hiperfocos',
  '/estudos',
  '/saude',
  '/sono',
  '/lazer',
  '/autoconhecimento',
  '/perfil',
  '/roadmap',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

// URLs da API para cache
const API_URLS = [
  '/api/hiperfocos',
  '/api/tarefas',
  '/api/sessoes'
]

// Estratégias de cache
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
}

// =============================================================================
// INSTALAÇÃO DO SERVICE WORKER
// =============================================================================

self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...')
  
  event.waitUntil(
    Promise.all([
      // Cache de recursos estáticos
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[SW] Caching static assets...')
        return cache.addAll(STATIC_ASSETS)
      }),
      
      // Pular waiting para ativar imediatamente
      self.skipWaiting()
    ])
  )
})

// =============================================================================
// ATIVAÇÃO DO SERVICE WORKER
// =============================================================================

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...')
  
  event.waitUntil(
    Promise.all([
      // Limpar caches antigos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      
      // Tomar controle de todas as abas
      self.clients.claim()
    ])
  )
})

// =============================================================================
// INTERCEPTAÇÃO DE REQUESTS
// =============================================================================

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Ignorar requests não HTTP/HTTPS
  if (!request.url.startsWith('http')) {
    return
  }
  
  // Estratégia baseada no tipo de recurso
  if (isStaticAsset(url)) {
    event.respondWith(handleStaticAsset(request))
  } else if (isAPIRequest(url)) {
    event.respondWith(handleAPIRequest(request))
  } else if (isNavigationRequest(request)) {
    event.respondWith(handleNavigationRequest(request))
  } else {
    event.respondWith(handleDynamicRequest(request))
  }
})

// =============================================================================
// ESTRATÉGIAS DE CACHE
// =============================================================================

// Cache First - Para recursos estáticos
async function handleStaticAsset(request) {
  try {
    const cache = await caches.open(STATIC_CACHE)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.error('[SW] Static asset error:', error)
    return new Response('Offline', { status: 503 })
  }
}

// Network First - Para APIs
async function handleAPIRequest(request) {
  try {
    const cache = await caches.open(API_CACHE)
    
    // Tentar rede primeiro
    try {
      const networkResponse = await fetch(request)
      
      if (networkResponse.ok) {
        // Cache apenas GET requests
        if (request.method === 'GET') {
          cache.put(request, networkResponse.clone())
        }
        return networkResponse
      }
    } catch (networkError) {
      console.log('[SW] Network failed, trying cache...')
    }
    
    // Fallback para cache se rede falhar
    const cachedResponse = await cache.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Retornar resposta offline para APIs
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'Dados não disponíveis offline',
        offline: true 
      }), 
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('[SW] API request error:', error)
    return new Response(
      JSON.stringify({ error: 'Service Worker Error' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Stale While Revalidate - Para navegação
async function handleNavigationRequest(request) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE)
    const cachedResponse = await cache.match(request)
    
    // Buscar na rede em background
    const networkPromise = fetch(request).then((response) => {
      if (response.ok) {
        cache.put(request, response.clone())
      }
      return response
    }).catch(() => null)
    
    // Retornar cache imediatamente se disponível
    if (cachedResponse) {
      networkPromise.catch(() => {}) // Evitar unhandled promise rejection
      return cachedResponse
    }
    
    // Aguardar rede se não há cache
    const networkResponse = await networkPromise
    if (networkResponse) {
      return networkResponse
    }
    
    // Fallback para página offline
    return await caches.match('/') || new Response('Offline', { status: 503 })
  } catch (error) {
    console.error('[SW] Navigation error:', error)
    return new Response('Offline', { status: 503 })
  }
}

// Cache dinâmico para outros recursos
async function handleDynamicRequest(request) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE)
    
    try {
      const networkResponse = await fetch(request)
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone())
      }
      return networkResponse
    } catch (networkError) {
      const cachedResponse = await cache.match(request)
      if (cachedResponse) {
        return cachedResponse
      }
      throw networkError
    }
  } catch (error) {
    console.error('[SW] Dynamic request error:', error)
    return new Response('Offline', { status: 503 })
  }
}

// =============================================================================
// UTILITÁRIOS
// =============================================================================

function isStaticAsset(url) {
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf)$/) ||
         STATIC_ASSETS.includes(url.pathname)
}

function isAPIRequest(url) {
  return url.pathname.startsWith('/api/') ||
         API_URLS.some(apiUrl => url.pathname.startsWith(apiUrl))
}

function isNavigationRequest(request) {
  return request.mode === 'navigate' ||
         (request.method === 'GET' && request.headers.get('accept').includes('text/html'))
}

// =============================================================================
// SINCRONIZAÇÃO EM BACKGROUND
// =============================================================================

self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  try {
    // Buscar operações pendentes do IndexedDB
    const pendingOperations = await getPendingOperations()
    
    for (const operation of pendingOperations) {
      try {
        await syncOperation(operation)
        await removePendingOperation(operation.id)
      } catch (error) {
        console.error('[SW] Sync operation failed:', error)
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error)
  }
}

// =============================================================================
// NOTIFICAÇÕES PUSH
// =============================================================================

self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event)
  
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação do StayFocus',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Abrir App',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icons/icon-192x192.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('StayFocus', options)
  )
})

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click received:', event)
  
  event.notification.close()
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// =============================================================================
// PLACEHOLDER FUNCTIONS (implementar conforme necessário)
// =============================================================================

async function getPendingOperations() {
  // TODO: Implementar busca no IndexedDB
  return []
}

async function syncOperation(operation) {
  // TODO: Implementar sincronização de operação
  console.log('[SW] Syncing operation:', operation)
}

async function removePendingOperation(id) {
  // TODO: Implementar remoção do IndexedDB
  console.log('[SW] Removing pending operation:', id)
}
