import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { WasteClassification } from '../types';
import { ImpactService } from '../services/impactService';
import { RewardService } from '../services/rewardService';

export interface QueuedOfflineScan {
  id: string;
  item: WasteClassification;
  queuedAt: string;
}

interface OfflineContextType {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  effectiveOnline: boolean;
  pendingSyncCount: number;
  offlineQueue: QueuedOfflineScan[];
  swRegistered: boolean;
  toggleSimulatedOffline: () => void;
  setSimulatedOffline: (simulated: boolean) => void;
  queueOfflineScan: (item: WasteClassification) => void;
  syncPendingScans: () => Promise<number>;
  clearOfflineQueue: () => void;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

const QUEUE_STORAGE_KEY = 'smart_recycle_offline_queue';
const SIMULATED_OFFLINE_KEY = 'smart_recycle_simulated_offline';

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(() => {
    return localStorage.getItem(SIMULATED_OFFLINE_KEY) === 'true';
  });
  const [offlineQueue, setOfflineQueue] = useState<QueuedOfflineScan[]>(() => {
    try {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [swRegistered, setSwRegistered] = useState<boolean>(false);

  // Sync effective network status with window online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check service worker status
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => setSwRegistered(true)).catch(() => {});
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save simulated offline preference
  const toggleSimulatedOffline = useCallback(() => {
    setIsSimulatedOffline((prev) => {
      const next = !prev;
      localStorage.setItem(SIMULATED_OFFLINE_KEY, String(next));
      return next;
    });
  }, []);

  const setSimulatedOffline = useCallback((simulated: boolean) => {
    setIsSimulatedOffline(simulated);
    localStorage.setItem(SIMULATED_OFFLINE_KEY, String(simulated));
  }, []);

  // Effective online status
  const effectiveOnline = isOnline && !isSimulatedOffline;

  // Queue an offline scan
  const queueOfflineScan = useCallback((item: WasteClassification) => {
    const newEntry: QueuedOfflineScan = {
      id: `offline-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      item,
      queuedAt: new Date().toISOString()
    };

    setOfflineQueue((prev) => {
      const updated = [newEntry, ...prev];
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Clear offline queue
  const clearOfflineQueue = useCallback(() => {
    setOfflineQueue([]);
    localStorage.removeItem(QUEUE_STORAGE_KEY);
  }, []);

  // Sync pending scans when online
  const syncPendingScans = useCallback(async (): Promise<number> => {
    if (offlineQueue.length === 0) return 0;

    let syncedCount = 0;
    for (const entry of offlineQueue) {
      // Record into impact ledger
      ImpactService.recordScan(entry.item, true);
      // Award points with offline resilience bonus (+5 extra points)
      RewardService.awardDirectPoints(
        RewardService.POINTS_PER_CONFIRMED_SORT + 5,
        `Offline Sync: ${entry.item.itemName} (+5 Resilience Bonus)`
      );
      syncedCount++;
    }

    // Clear queue after sync
    clearOfflineQueue();
    RewardService.fireConfetti();

    return syncedCount;
  }, [offlineQueue, clearOfflineQueue]);

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        isSimulatedOffline,
        effectiveOnline,
        pendingSyncCount: offlineQueue.length,
        offlineQueue,
        swRegistered,
        toggleSimulatedOffline,
        setSimulatedOffline,
        queueOfflineScan,
        syncPendingScans,
        clearOfflineQueue
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = (): OfflineContextType => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};
