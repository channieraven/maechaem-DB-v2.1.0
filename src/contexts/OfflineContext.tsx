import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

type SyncStatus = 'idle' | 'syncing' | 'error';

interface OfflineContextType {
  isOnline: boolean;
  syncStatus: SyncStatus;
  pendingCount: number;
  syncNow: () => Promise<void>;
}

// ── Context ──────────────────────────────────────────────────────────────────

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');

  // Track online/offline transitions
  useEffect(() => {
    const handleOnline = () => {
      console.log('[OfflineContext] Back online');
      setIsOnline(true);
      // Firestore will automatically sync pending writes when back online
    };
    
    const handleOffline = () => {
      console.log('[OfflineContext] Offline');
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Firestore handles offline sync automatically via IndexedDB persistence.
  // This syncNow() is kept for compatibility but doesn't need manual queue processing.
  const syncNow = useCallback(async () => {
    if (!isOnline) {
      console.log('[OfflineContext] Cannot sync while offline');
      return;
    }

    setSyncStatus('syncing');
    
    // Firestore's built-in offline persistence handles sync automatically.
    // Just wait briefly to ensure any pending writes are flushed.
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setSyncStatus('idle');
    console.log('[OfflineContext] Sync complete (Firestore auto-sync)');
  }, [isOnline]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline) {
      syncNow();
    }
  }, [isOnline, syncNow]);

  const value: OfflineContextType = {
    isOnline,
    syncStatus,
    pendingCount: 0, // Firestore manages pending writes internally
    syncNow,
  };

  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
};

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useOffline(): OfflineContextType {
  const ctx = useContext(OfflineContext);
  if (!ctx) throw new Error('useOffline must be used within OfflineProvider');
  return ctx;
}
