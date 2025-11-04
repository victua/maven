import { useState, useEffect } from 'react';
import { ArrowLeft, Building, Mail, Phone, MapPin, Save, Edit2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  db,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from '../../lib/firebase';

interface AgencyProfileProps {
  onNavigate: (page: string) => void;
}

interface AgencyProfile {
  name: string;
  email: string;
  phone: string;
  country: string;
  address: string;
  website?: string;
  description?: string;
  contact_person: string;
  contact_title: string;
  license_number?: string;
  subscription_tier: string;
  subscription_status: string;
}

export function AgencyProfile({ onNavigate }: AgencyProfileProps) {
  const { user, agency } = useAuth();
  const [profile, setProfile] = useState<AgencyProfile>({
    name: '',
    email: '',
    phone: '',
    country: '',
    address: '',
    website: '',
    description: '',
    contact_person: '',
    contact_title: '',
    license_number: '',
    subscription_tier: 'basic',
    subscription_status: 'active'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (agency) {
      fetchProfile();
    }
  }, [agency]);

  const fetchProfile = async () => {
    try {
      if (!agency) return;

      const agencyRef = doc(db, 'agencies', agency.id);
      const agencySnap = await getDoc(agencyRef);

      if (agencySnap.exists()) {
        const agencyData = agencySnap.data() as AgencyProfile;
        setProfile(agencyData);
      }
    } catch (error) {
      console.error('Error fetching agency profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!agency) return;

    setSaving(true);
    try {
      const agencyRef = doc(db, 'agencies', agency.id);
      await updateDoc(agencyRef, {
        ...profile,
        updated_at: serverTimestamp()
      });

      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin border border-gray-300 h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="ml-12 sm:ml-14 w-[98%] px-2 sm:px-4 py-6 sm:py-8">
        <div className="bg-white border border-gray-300 shadow-sm">
          {/* Profile Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary/10 border border-gray-300 flex items-center justify-center">
                <Building className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
                <div className="flex items-center space-x-4 mt-1">
                  <span className={`px-3 py-1 border border-gray-300 text-xs font-semibold ${
                    profile.subscription_status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {profile.subscription_status}
                  </span>
                  <span className="px-3 py-1 border border-gray-300 text-xs font-semibold bg-blue-100 text-blue-800 capitalize">
                    {profile.subscription_tier}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {editing ? (
              <div className="space-y-6">
                {/* Company Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                      <input
                        type="text"
                        value={profile.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <input
                        type="text"
                        value={profile.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                      <input
                        type="url"
                        value={profile.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                      <input
                        type="text"
                        value={profile.license_number}
                        onChange={(e) => handleInputChange('license_number', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Person */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Primary Contact</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
                      <input
                        type="text"
                        value={profile.contact_person}
                        onChange={(e) => handleInputChange('contact_person', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title/Position</label>
                      <input
                        type="text"
                        value={profile.contact_title}
                        onChange={(e) => handleInputChange('contact_title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Description</label>
                  <textarea
                    value={profile.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                    placeholder="Brief description of your agency and services..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="flex items-center space-x-2 bg-primary text-white px-6 py-2 border border-gray-300 hover:bg-primary/90 transition-colors disabled:opacity-50"
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
                  <button
                    onClick={() => {
                      setEditing(false);
                      fetchProfile(); // Reset to original data
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Display Mode */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-gray-500" />
                        <span className="text-gray-900">{profile.email}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-gray-500" />
                        <span className="text-gray-900">{profile.phone}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-gray-500" />
                        <span className="text-gray-900">{profile.country}</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {profile.website && (
                        <div>
                          <p className="text-sm font-medium text-gray-900">Website</p>
                          <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                            {profile.website}
                          </a>
                        </div>
                      )}
                      {profile.license_number && (
                        <div>
                          <p className="text-sm font-medium text-gray-900">License Number</p>
                          <p className="text-gray-700">{profile.license_number}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {profile.address && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Address</h4>
                    <p className="text-gray-700">{profile.address}</p>
                  </div>
                )}

                {(profile.contact_person || profile.contact_title) && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Primary Contact</h4>
                    <p className="text-gray-700">
                      {profile.contact_person} {profile.contact_title && `- ${profile.contact_title}`}
                    </p>
                  </div>
                )}

                {profile.description && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">About Us</h4>
                    <p className="text-gray-700">{profile.description}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}