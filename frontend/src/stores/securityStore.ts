import { create } from 'zustand';
import type {
  SecurityScore,
  MonitoredAsset,
  BreachAlert,
  SecurityAction,
  SecurityChecklist,
} from '@aegis/shared';
import { api } from '../lib/api';

interface SecurityState {
  score: SecurityScore | null;
  assets: MonitoredAsset[];
  alerts: BreachAlert[];
  actions: { pending: SecurityAction[]; completed: SecurityAction[] };
  checklist: SecurityChecklist | null;
  isLoading: boolean;
  error: string | null;

  fetchScore: () => Promise<void>;
  fetchAssets: () => Promise<void>;
  fetchAlerts: () => Promise<void>;
  fetchActions: () => Promise<void>;
  fetchChecklist: () => Promise<void>;
  addAsset: (type: string, value: string, label?: string) => Promise<void>;
  deleteAsset: (assetId: string) => Promise<void>;
  markAlertRead: (alertId: string) => Promise<void>;
  resolveAlert: (alertId: string) => Promise<void>;
  completeAction: (actionId: string) => Promise<void>;
  toggleChecklistItem: (itemId: string, isCompleted: boolean) => Promise<void>;
}

export const useSecurityStore = create<SecurityState>((set, get) => ({
  score: null,
  assets: [],
  alerts: [],
  actions: { pending: [], completed: [] },
  checklist: null,
  isLoading: false,
  error: null,

  fetchScore: async () => {
    try {
      const response = await api.get('/api/security/score');
      set({ score: response.data });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  fetchAssets: async () => {
    try {
      const response = await api.get('/api/assets');
      set({ assets: response.data });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  fetchAlerts: async () => {
    try {
      const response = await api.get('/api/security/alerts');
      set({ alerts: response.data });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  fetchActions: async () => {
    try {
      const response = await api.get('/api/security/actions');
      set({ actions: response.data });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  fetchChecklist: async () => {
    try {
      const response = await api.get('/api/security/checklist');
      set({ checklist: response.data });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  addAsset: async (type: string, value: string, label?: string) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/api/assets', { type, value, label });
      set((state) => ({
        assets: [...state.assets, response.data],
        isLoading: false,
      }));
      // Refresh score and alerts after adding asset
      get().fetchScore();
      get().fetchAlerts();
    } catch (error: any) {
      set({ isLoading: false, error: error.response?.data?.error?.message });
      throw error;
    }
  },

  deleteAsset: async (assetId: string) => {
    try {
      await api.delete(`/api/assets/${assetId}`);
      set((state) => ({
        assets: state.assets.filter((a) => a.id !== assetId),
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  markAlertRead: async (alertId: string) => {
    try {
      await api.put(`/api/security/alerts/${alertId}/read`);
      set((state) => ({
        alerts: state.alerts.map((a) =>
          a.id === alertId ? { ...a, isRead: true } : a
        ),
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  resolveAlert: async (alertId: string) => {
    try {
      await api.put(`/api/security/alerts/${alertId}/resolve`);
      set((state) => ({
        alerts: state.alerts.map((a) =>
          a.id === alertId ? { ...a, isResolved: true } : a
        ),
      }));
      get().fetchScore();
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  completeAction: async (actionId: string) => {
    try {
      await api.put(`/api/security/actions/${actionId}/complete`);
      set((state) => {
        const action = state.actions.pending.find((a) => a.id === actionId);
        if (!action) return state;

        return {
          actions: {
            pending: state.actions.pending.filter((a) => a.id !== actionId),
            completed: [...state.actions.completed, { ...action, isCompleted: true }],
          },
        };
      });
      get().fetchScore();
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  toggleChecklistItem: async (itemId: string, isCompleted: boolean) => {
    try {
      const response = await api.put(`/api/security/checklist/${itemId}`, {
        isCompleted,
      });
      set({ checklist: response.data });
      get().fetchScore();
    } catch (error: any) {
      set({ error: error.message });
    }
  },
}));
