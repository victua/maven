import { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Bell, Shield, Save, Edit2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  db,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from '../lib/firebase';

interface SettingsProps {
  onNavigate: (page: string) => void;
}

interface UserSettings {
  displayName: string;
  email: string;
  phone?: string;
  notifications: {
    emailUpdates: boolean;
    smsUpdates: boolean;
    marketingEmails: boolean;
  };
  privacy: {
    profileVisible: boolean;
    contactInfoVisible: boolean;
  };
}

export function SettingsPage({ onNavigate }: SettingsProps) {
  const { user, userProfile } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    displayName: '',
    email: '',
    phone: '',
    notifications: {
      emailUpdates: true,
      smsUpdates: false,
      marketingEmails: false
    },
    privacy: {
      profileVisible: true,
      contactInfoVisible: false
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy' | 'security'>('profile');

  useEffect(() => {
    if (user) {
      fetchUserSettings();
    }
  }, [user]);

  const fetchUserSettings = async () => {
    try {
      if (!user) return;

      // Get user profile data
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      let userData = {};
      if (userSnap.exists()) {
        userData = userSnap.data();
      }

      // Check if user is talent, agency, etc. and get additional data
      let additionalData = {};
      if (userProfile?.role === 'talent') {
        const candidateRef = doc(db, 'candidates', user.uid);
        const candidateSnap = await getDoc(candidateRef);
        if (candidateSnap.exists()) {
          additionalData = candidateSnap.data();
        }
      } else if (userProfile?.role === 'agency') {
        // For agencies, we might need to get agency-specific settings
        const agenciesRef = doc(db, 'agencies', user.uid);
        const agencySnap = await getDoc(agenciesRef);
        if (agencySnap.exists()) {
          additionalData = agencySnap.data();
        }
      }

      setSettings({
        displayName: userData.displayName || userProfile?.displayName || '',
        email: user.email || '',
        phone: additionalData.phone || userData.phone || '',
        notifications: {
          emailUpdates: userData.notifications?.emailUpdates ?? true,
          smsUpdates: userData.notifications?.smsUpdates ?? false,
          marketingEmails: userData.notifications?.marketingEmails ?? false
        },
        privacy: {
          profileVisible: userData.privacy?.profileVisible ?? true,
          contactInfoVisible: userData.privacy?.contactInfoVisible ?? false
        }
      });
    } catch (error) {
      console.error('Error fetching user settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);

      await updateDoc(userRef, {
        displayName: settings.displayName,
        phone: settings.phone,
        notifications: settings.notifications,
        privacy: settings.privacy,
        updatedAt: serverTimestamp()
      });

      // If user is talent, also update candidate profile
      if (userProfile?.role === 'talent') {
        const candidateRef = doc(db, 'candidates', user.uid);
        const candidateSnap = await getDoc(candidateRef);
        if (candidateSnap.exists()) {
          await updateDoc(candidateRef, {
            phone: settings.phone,
            updated_at: serverTimestamp()
          });
        }
      }

      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setSettings(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin border border-gray-300 h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="ml-12 sm:ml-14 w-[98%] px-2 sm:px-4 py-6 sm:py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your account preferences and privacy settings</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="bg-white shadow-sm border border-gray-300">
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-6 py-4 font-semibold border-b-2 transition-colors ${
                    activeTab === 'profile'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`px-6 py-4 font-semibold border-b-2 transition-colors ${
                    activeTab === 'notifications'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <span>Notifications</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('privacy')}
                  className={`px-6 py-4 font-semibold border-b-2 transition-colors ${
                    activeTab === 'privacy'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Privacy</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`px-6 py-4 font-semibold border-b-2 transition-colors ${
                    activeTab === 'security'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Lock className="h-5 w-5" />
                    <span>Security</span>
                  </div>
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white border border-gray-300 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={settings.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="Enter your display name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={settings.email}
                    disabled
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 border border-gray-300 bg-gray-50 text-gray-500"
                    placeholder="Email address"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">Email cannot be changed from this page</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-white border border-gray-300 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Email Updates</h4>
                  <p className="text-sm text-gray-500">Receive updates about your requests and matches</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.emailUpdates}
                    onChange={(e) => handleInputChange('notifications.emailUpdates', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 border border-gray-300 peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:border border-gray-300 after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">SMS Updates</h4>
                  <p className="text-sm text-gray-500">Receive urgent notifications via SMS</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.smsUpdates}
                    onChange={(e) => handleInputChange('notifications.smsUpdates', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 border border-gray-300 peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:border border-gray-300 after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Marketing Emails</h4>
                  <p className="text-sm text-gray-500">Receive newsletters and promotional content</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.marketingEmails}
                    onChange={(e) => handleInputChange('notifications.marketingEmails', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 border border-gray-300 peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:border border-gray-300 after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <div className="bg-white border border-gray-300 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Privacy Settings</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Profile Visibility</h4>
                  <p className="text-sm text-gray-500">Allow others to view your profile information</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.privacy.profileVisible}
                    onChange={(e) => handleInputChange('privacy.profileVisible', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 border border-gray-300 peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:border border-gray-300 after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Contact Information Visibility</h4>
                  <p className="text-sm text-gray-500">Show your contact information to potential employers</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.privacy.contactInfoVisible}
                    onChange={(e) => handleInputChange('privacy.contactInfoVisible', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 border border-gray-300 peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:border border-gray-300 after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="bg-white border border-gray-300 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h3>
            <div className="space-y-6">
              <div className="border border-gray-200 border border-gray-300 p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Password</h4>
                <p className="text-sm text-gray-500 mb-4">
                  Password management is handled through Firebase Authentication
                </p>
                <button
                  onClick={() => {
                    // This would typically trigger a password reset email
                    alert('Password reset functionality would be implemented here using Firebase Auth');
                  }}
                  className="text-primary hover:text-primary/80 text-sm font-medium"
                >
                  Request Password Reset
                </button>
              </div>

              <div className="border border-gray-200 border border-gray-300 p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Account</h4>
                <p className="text-sm text-gray-500 mb-4">
                  Account status and role: {userProfile?.role || 'Unknown'}
                </p>
                <p className="text-sm text-gray-500">
                  Account created: {user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center space-x-2 bg-primary text-white px-6 py-3 border border-gray-300 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="animate-spin border border-gray-300 h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}