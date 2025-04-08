import { create } from 'zustand';
import { getUserPreferences, updateUserPreferences, type UserPreferences } from '../lib/supabase';
import toast from 'react-hot-toast';

interface PreferencesState {
  preferences: UserPreferences | null;
  loading: boolean;
  error: string | null;
  fetchPreferences: () => Promise<void>;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
}

export const usePreferences = create<PreferencesState>((set) => ({
  preferences: null,
  loading: true,
  error: null,

  fetchPreferences: async () => {
    try {
      const preferences = await getUserPreferences();
      set({ preferences, loading: false, error: null });
    } catch (error) {
      set({ error: 'Failed to load preferences', loading: false });
      toast.error('Failed to load preferences');
    }
  },

  updatePreferences: async (updates) => {
    try {
      set({ loading: true });
      await updateUserPreferences(updates);
      const preferences = await getUserPreferences();
      set({ preferences, loading: false, error: null });
      toast.success('Settings saved successfully');
    } catch (error) {
      set({ error: 'Failed to update preferences', loading: false });
      toast.error('Failed to save settings');
    }
  },
}));