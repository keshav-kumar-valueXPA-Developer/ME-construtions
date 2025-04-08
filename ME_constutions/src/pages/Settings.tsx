import React, { useEffect } from 'react';
import { Save, Bell, Moon, Sun, Globe, Shield, Users, Loader2 } from 'lucide-react';
import { cn } from '../utils/utils';
import { usePreferences } from '../store/preferences';
import { useAuth } from '../components/AuthProvider';

type ThemeType = 'light' | 'dark' | 'system';
type NotificationType = 'all' | 'important' | 'none';

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ElementType;
}

const sections: SettingsSection[] = [
  { id: 'appearance', title: 'Appearance', icon: Sun },
  { id: 'notifications', title: 'Notifications', icon: Bell },
  { id: 'domains', title: 'Domains & Projects', icon: Globe },
  { id: 'security', title: 'Security', icon: Shield },
  { id: 'roles', title: 'Roles & Permissions', icon: Users },
];

const domains = [
  { id: 'construction', name: 'Construction — Cost Metrics' },
  { id: 'financial', name: 'Financial Forecasting' },
  { id: 'hr', name: 'HR Analytics' },
];

export default function Settings() {
  const { user } = useAuth();
  const { preferences, loading, fetchPreferences, updatePreferences } = usePreferences();
  const [activeSection, setActiveSection] = React.useState('appearance');
  const [localPreferences, setLocalPreferences] = React.useState({
    theme: 'light' as ThemeType,
    notification_level: 'all' as NotificationType,
    active_domain: 'construction',
  });

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user, fetchPreferences]);

  useEffect(() => {
    if (preferences) {
      setLocalPreferences({
        theme: preferences.theme,
        notification_level: preferences.notification_level,
        active_domain: preferences.active_domain,
      });
    }
  }, [preferences]);

  const handleSave = async () => {
    await updatePreferences(localPreferences);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Theme</h3>
              <div className="grid grid-cols-3 gap-4">
                {(['light', 'dark', 'system'] as ThemeType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setLocalPreferences(prev => ({ ...prev, theme: t }))}
                    className={cn(
                      'p-4 rounded-lg border-2 text-center',
                      localPreferences.theme === t ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    )}
                  >
                    <div className="flex justify-center mb-2">
                      {t === 'light' ? (
                        <Sun className="h-6 w-6" />
                      ) : t === 'dark' ? (
                        <Moon className="h-6 w-6" />
                      ) : (
                        <Globe className="h-6 w-6" />
                      )}
                    </div>
                    <span className="capitalize">{t}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Notification Preferences</h3>
              <div className="space-y-4">
                {(['all', 'important', 'none'] as NotificationType[]).map((n) => (
                  <label
                    key={n}
                    className={cn(
                      'flex items-center p-4 rounded-lg border-2',
                      localPreferences.notification_level === n ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    )}
                  >
                    <input
                      type="radio"
                      name="notifications"
                      checked={localPreferences.notification_level === n}
                      onChange={() => setLocalPreferences(prev => ({ ...prev, notification_level: n }))}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-3 capitalize">{n}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 'domains':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Active Domain</h3>
              <div className="space-y-4">
                {domains.map((domain) => (
                  <label
                    key={domain.id}
                    className={cn(
                      'flex items-center p-4 rounded-lg border-2',
                      localPreferences.active_domain === domain.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    )}
                  >
                    <input
                      type="radio"
                      name="domain"
                      checked={localPreferences.active_domain === domain.id}
                      onChange={() => setLocalPreferences(prev => ({ ...prev, active_domain: domain.id }))}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-3">{domain.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-gray-500 py-8">
            This section is coming soon
          </div>
        );
    }
  };

  if (loading && !preferences) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your preferences and configurations</p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Sidebar */}
        <div className="col-span-3">
          <div className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left',
                  activeSection === section.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <section.icon className="h-5 w-5" />
                {section.title}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-9">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {renderSection()}

            <div className="mt-8 pt-6 border-t flex items-center justify-between">
              <button
                onClick={handleSave}
                disabled={loading}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg",
                  loading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700",
                  "text-white"
                )}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}