/**
 * Service IndexedDB pour stockage offline côté client
 * Gère la persistance des données en mode hors ligne
 * et la synchronisation lors du retour en ligne
 */

const DB_NAME = 'passerelle-jeunesse-offline';
const DB_VERSION = 2;

// Stores IndexedDB
const STORES = {
  BOOKINGS: 'cached-bookings',
  MESSAGES: 'cached-messages',
  PROFILE: 'cached-profile',
  PENDING_ACTIONS: 'pending-actions',
  POSITIONS: 'cached-positions',
  SYNC_LOG: 'sync-log',
} as const;

type StoreName = (typeof STORES)[keyof typeof STORES];

export interface PendingAction {
  id: string;
  type: 'booking' | 'message' | 'review' | 'status-update';
  data: Record<string, unknown>;
  timestamp: number;
  retries: number;
  lastError?: string;
}

export interface SyncLogEntry {
  id: string;
  type: string;
  status: 'success' | 'failed' | 'pending';
  timestamp: number;
  details?: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Créer les object stores s'ils n'existent pas
      Object.values(STORES).forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          const keyPath = storeName === STORES.PROFILE ? 'userId' : 'id';
          const store = db.createObjectStore(storeName, { keyPath });
          
          // Index pour les requêtes
          if (storeName === STORES.PENDING_ACTIONS) {
            store.createIndex('type', 'type', { unique: false });
            store.createIndex('timestamp', 'timestamp', { unique: false });
          }
          if (storeName === STORES.SYNC_LOG) {
            store.createIndex('timestamp', 'timestamp', { unique: false });
            store.createIndex('status', 'status', { unique: false });
          }
          if (storeName === STORES.BOOKINGS) {
            store.createIndex('status', 'status', { unique: false });
          }
          if (storeName === STORES.POSITIONS) {
            store.createIndex('timestamp', 'timestamp', { unique: false });
          }
        }
      });
    };
  });
}

// --- OPÉRATIONS GÉNÉRIQUES ---

export async function getAllFromStore<T>(storeName: StoreName): Promise<T[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
      tx.oncomplete = () => db.close();
    });
  } catch {
    return [];
  }
}

export async function getFromStore<T>(storeName: StoreName, key: string): Promise<T | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
      tx.oncomplete = () => db.close();
    });
  } catch {
    return null;
  }
}

export async function putInStore<T>(storeName: StoreName, data: T): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.put(data);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error(`❌ IndexedDB put error (${storeName}):`, error);
  }
}

export async function deleteFromStore(storeName: StoreName, key: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.delete(key);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error(`❌ IndexedDB delete error (${storeName}):`, error);
  }
}

export async function clearStore(storeName: StoreName): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.clear();
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error(`❌ IndexedDB clear error (${storeName}):`, error);
  }
}

export async function countInStore(storeName: StoreName): Promise<number> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      tx.oncomplete = () => db.close();
    });
  } catch {
    return 0;
  }
}

// --- CACHE RÉSERVATIONS ---

export async function cacheBookings(bookings: Array<Record<string, unknown>>): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.BOOKINGS, 'readwrite');
    const store = tx.objectStore(STORES.BOOKINGS);
    
    // Nettoyer les anciennes
    store.clear();
    
    // Ajouter les nouvelles
    for (const booking of bookings) {
      store.put(booking);
    }

    return new Promise((resolve) => {
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
    });
  } catch (error) {
    console.error('❌ Erreur cache réservations:', error);
  }
}

export async function getCachedBookings(): Promise<Array<Record<string, unknown>>> {
  return getAllFromStore(STORES.BOOKINGS);
}

// --- CACHE MESSAGES ---

export async function cacheMessages(messages: Array<Record<string, unknown>>): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.MESSAGES, 'readwrite');
    const store = tx.objectStore(STORES.MESSAGES);
    
    for (const message of messages) {
      store.put(message);
    }

    return new Promise((resolve) => {
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
    });
  } catch (error) {
    console.error('❌ Erreur cache messages:', error);
  }
}

export async function getCachedMessages(): Promise<Array<Record<string, unknown>>> {
  return getAllFromStore(STORES.MESSAGES);
}

// --- CACHE PROFIL ---

export async function cacheProfile(userId: string, profile: Record<string, unknown>): Promise<void> {
  await putInStore(STORES.PROFILE, { userId, ...profile, cachedAt: Date.now() });
}

export async function getCachedProfile(userId: string): Promise<Record<string, unknown> | null> {
  return getFromStore(STORES.PROFILE, userId);
}

// --- ACTIONS EN ATTENTE (pour sync offline) ---

export async function addPendingAction(action: Omit<PendingAction, 'id' | 'timestamp' | 'retries'>): Promise<string> {
  const id = `pending-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const pendingAction: PendingAction = {
    ...action,
    id,
    timestamp: Date.now(),
    retries: 0,
  };
  await putInStore(STORES.PENDING_ACTIONS, pendingAction);
  
  // Enregistrer pour background sync si disponible
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await (registration as any).sync.register(`${action.type}-sync`);
    } catch (error) {
      console.warn('⚠️ Background sync non disponible:', error);
    }
  }
  
  return id;
}

export async function getPendingActions(type?: string): Promise<PendingAction[]> {
  const all = await getAllFromStore<PendingAction>(STORES.PENDING_ACTIONS);
  if (type) return all.filter((a) => a.type === type);
  return all;
}

export async function removePendingAction(id: string): Promise<void> {
  await deleteFromStore(STORES.PENDING_ACTIONS, id);
}

export async function updatePendingAction(id: string, updates: Partial<PendingAction>): Promise<void> {
  const existing = await getFromStore<PendingAction>(STORES.PENDING_ACTIONS, id);
  if (existing) {
    await putInStore(STORES.PENDING_ACTIONS, { ...existing, ...updates });
  }
}

// --- SYNC LOG ---

export async function addSyncLog(entry: Omit<SyncLogEntry, 'id' | 'timestamp'>): Promise<void> {
  const log: SyncLogEntry = {
    ...entry,
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: Date.now(),
  };
  await putInStore(STORES.SYNC_LOG, log);
}

export async function getSyncLogs(limit = 50): Promise<SyncLogEntry[]> {
  const logs = await getAllFromStore<SyncLogEntry>(STORES.SYNC_LOG);
  return logs.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
}

export async function clearSyncLogs(): Promise<void> {
  await clearStore(STORES.SYNC_LOG);
}

// --- POSITIONS GÉOLOCALISATION ---

export async function cachePosition(position: {
  latitude: number;
  longitude: number;
  accuracy: number;
  heading?: number;
  speed?: number;
}): Promise<void> {
  const entry = {
    id: `pos-${Date.now()}`,
    ...position,
    timestamp: Date.now(),
  };
  await putInStore(STORES.POSITIONS, entry);
  
  // Limiter à 200 positions max
  const all = await getAllFromStore(STORES.POSITIONS);
  if (all.length > 200) {
    const sorted = all.sort((a: any, b: any) => a.timestamp - b.timestamp);
    const toDelete = sorted.slice(0, all.length - 200);
    for (const pos of toDelete) {
      await deleteFromStore(STORES.POSITIONS, (pos as any).id);
    }
  }
}

export async function getCachedPositions(): Promise<Array<Record<string, unknown>>> {
  return getAllFromStore(STORES.POSITIONS);
}

// --- SYNCHRONISATION ---

export async function syncAllPending(): Promise<{
  synced: number;
  failed: number;
  remaining: number;
}> {
  const pending = await getPendingActions();
  let synced = 0;
  let failed = 0;

  for (const action of pending) {
    try {
      let endpoint = '';
      let method = 'POST';

      switch (action.type) {
        case 'booking':
          endpoint = '/api/bookings/create';
          break;
        case 'message':
          endpoint = '/api/messages';
          break;
        case 'review':
          endpoint = '/api/reviews';
          break;
        case 'status-update':
          endpoint = `/api/bookings/${action.data.bookingId}/status`;
          method = 'POST';
          break;
        default:
          continue;
      }

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action.data),
      });

      if (response.ok) {
        await removePendingAction(action.id);
        await addSyncLog({ type: action.type, status: 'success', details: `Synced ${action.type}` });
        synced++;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      failed++;
      await updatePendingAction(action.id, {
        retries: action.retries + 1,
        lastError: error instanceof Error ? error.message : 'Unknown error',
      });
      await addSyncLog({
        type: action.type,
        status: 'failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  const remaining = await countInStore(STORES.PENDING_ACTIONS);
  return { synced, failed, remaining };
}

// --- UTILITAIRES ---

export async function getStorageEstimate(): Promise<{
  usage: number;
  quota: number;
  usagePercent: number;
  usageFormatted: string;
}> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage || 0;
    const quota = estimate.quota || 0;

    return {
      usage,
      quota,
      usagePercent: Math.round((usage / (quota || 1)) * 100),
      usageFormatted: formatBytes(usage),
    };
  }
  return { usage: 0, quota: 0, usagePercent: 0, usageFormatted: '0 B' };
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export async function clearAllOfflineData(): Promise<void> {
  await Promise.all(Object.values(STORES).map((store) => clearStore(store)));
}

export { STORES };
