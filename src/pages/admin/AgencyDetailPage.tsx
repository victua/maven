import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building,
  Mail,
  Phone,
  MapPin,
  Globe,
  User,
  Calendar,
  DollarSign,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  Trash2,
  Edit3
} from 'lucide-react';
import {
  db,
  collection,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  addDoc
} from '../../lib/firebase';

interface Agency {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  city?: string;
  address?: string;
  website?: string;
  license_number?: string;
  contact_person?: string;
  contact_title?: string;
  subscription_tier: 'basic' | 'premium' | 'enterprise';
  subscription_status: 'active' | 'inactive' | 'pending' | 'suspended';
  billing_email?: string;
  payment_method?: string;
  contract_start?: Date;
  contract_end?: Date;
  notes?: string;
  user_id?: string;
  created_at?: any;
  updated_at?: any;
}

export function AgencyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [agency, setAgency] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [agencyForm, setAgencyForm] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    address: '',
    website: '',
    license_number: '',
    contact_person: '',
    contact_title: '',
    subscription_tier: 'basic' as 'basic' | 'premium' | 'enterprise',
    subscription_status: 'pending' as 'active' | 'inactive' | 'pending' | 'suspended',
    billing_email: '',
    payment_method: '',
    contract_start: '',
    contract_end: '',
    notes: ''
  });

  const countries = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Netherlands',
    'Singapore', 'UAE', 'Saudi Arabia', 'Kuwait', 'Qatar', 'Bahrain', 'Oman', 'Jordan',
    'Egypt', 'Morocco', 'South Africa', 'Nigeria', 'Kenya', 'Ghana', 'India', 'Philippines',
    'Malaysia', 'Thailand', 'Indonesia', 'Vietnam', 'Japan', 'South Korea', 'China'
  ];

  const isNewAgency = id === 'new';

  useEffect(() => {
    if (isNewAgency) {
      setLoading(false);
      setEditing(true);
    } else {
      fetchAgency();
    }
  }, [id]);

  const fetchAgency = async () => {
    if (!id || id === 'new') return;

    try {
      const agencyRef = doc(db, 'agencies', id);
      const agencySnap = await getDoc(agencyRef);

      if (agencySnap.exists()) {
        const agencyData = {
          id: agencySnap.id,
          ...agencySnap.data(),
          contract_start: agencySnap.data().contract_start?.toDate(),
          contract_end: agencySnap.data().contract_end?.toDate(),
          created_at: agencySnap.data().created_at?.toDate(),
          updated_at: agencySnap.data().updated_at?.toDate()
        } as Agency;

        setAgency(agencyData);
        setAgencyForm({
          name: agencyData.name || '',
          email: agencyData.email || '',
          phone: agencyData.phone || '',
          country: agencyData.country || '',
          city: agencyData.city || '',
          address: agencyData.address || '',
          website: agencyData.website || '',
          license_number: agencyData.license_number || '',
          contact_person: agencyData.contact_person || '',
          contact_title: agencyData.contact_title || '',
          subscription_tier: agencyData.subscription_tier || 'basic',
          subscription_status: agencyData.subscription_status || 'pending',
          billing_email: agencyData.billing_email || '',
          payment_method: agencyData.payment_method || '',
          contract_start: agencyData.contract_start?.toISOString().split('T')[0] || '',
          contract_end: agencyData.contract_end?.toISOString().split('T')[0] || '',
          notes: agencyData.notes || ''
        });
      } else {
        setError('Agency not found');
      }
    } catch (error) {
      console.error('Error fetching agency:', error);
      setError('Failed to load agency details');
    } finally {
      setLoading(false);
    }
  };

  const saveAgency = async () => {
    try {
      setSaving(true);
      setError(null);

      const agencyData = {
        name: agencyForm.name,
        email: agencyForm.email,
        phone: agencyForm.phone,
        country: agencyForm.country,
        city: agencyForm.city,
        address: agencyForm.address,
        website: agencyForm.website,
        license_number: agencyForm.license_number,
        contact_person: agencyForm.contact_person,
        contact_title: agencyForm.contact_title,
        subscription_tier: agencyForm.subscription_tier,
        subscription_status: agencyForm.subscription_status,
        billing_email: agencyForm.billing_email,
        payment_method: agencyForm.payment_method,
        contract_start: agencyForm.contract_start ? new Date(agencyForm.contract_start) : null,
        contract_end: agencyForm.contract_end ? new Date(agencyForm.contract_end) : null,
        notes: agencyForm.notes,
        updated_at: serverTimestamp()
      };

      if (isNewAgency) {
        const newAgencyRef = await addDoc(collection(db, 'agencies'), {
          ...agencyData,
          created_at: serverTimestamp()
        });
        navigate(`/agencies/${newAgencyRef.id}`);
      } else {
        const agencyRef = doc(db, 'agencies', id!);
        await updateDoc(agencyRef, agencyData);
        await fetchAgency();
        setEditing(false);
      }
    } catch (error) {
      console.error('Error saving agency:', error);
      setError('Failed to save agency');
    } finally {
      setSaving(false);
    }
  };

  const deleteAgency = async () => {
    if (!agency || isNewAgency) return;

    if (window.confirm('Are you sure you want to delete this agency? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'agencies', agency.id));
        navigate('/agencies');
      } catch (error) {
        console.error('Error deleting agency:', error);
        setError('Failed to delete agency');
      }
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'basic':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'premium':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'enterprise':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'suspended':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="ml-12 sm:ml-14 w-[98%] px-2 sm:px-4 py-6 sm:py-8">
          <div className="flex items-center justify-center py-12">
            <div className="inline-block animate-spin border border-gray-300 h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-gray-600">Loading agency details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="ml-12 sm:ml-14 w-[98%] px-2 sm:px-4 py-6 sm:py-8">
          <div className="text-center py-12">
            <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <button
              onClick={() => navigate('/agencies')}
              className="bg-primary text-white px-4 py-2 hover:bg-primary/90 transition-colors"
            >
              Back to Agencies
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="ml-12 sm:ml-14 w-[98%] px-2 sm:px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => navigate('/agencies')}
              className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Agencies</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-primary">
                {isNewAgency ? 'New Agency' : (editing ? 'Edit Agency' : agency?.name)}
              </h1>
              <p className="text-gray-600">
                {isNewAgency ? 'Create a new agency partner' : 'Manage agency details and subscription'}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {!isNewAgency && !editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary text-white hover:bg-primary/90 transition-colors border border-primary"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              )}

              {editing && (
                <>
                  <button
                    onClick={() => {
                      if (isNewAgency) {
                        navigate('/agencies');
                      } else {
                        setEditing(false);
                        fetchAgency();
                      }
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveAgency}
                    disabled={saving}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary text-white hover:bg-primary/90 transition-colors border border-primary disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    <span>{saving ? 'Saving...' : 'Save'}</span>
                  </button>
                </>
              )}

              {!isNewAgency && !editing && (
                <button
                  onClick={deleteAgency}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors border border-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agency Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white shadow-lg border border-gray-200">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Building className="h-5 w-5 text-primary" />
                  <span>Basic Information</span>
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Agency Name *</label>
                    {editing ? (
                      <input
                        type="text"
                        value={agencyForm.name}
                        onChange={(e) => setAgencyForm({ ...agencyForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        placeholder="Enter agency name"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{agency?.name || 'Not specified'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                    {editing ? (
                      <input
                        type="text"
                        value={agencyForm.license_number}
                        onChange={(e) => setAgencyForm({ ...agencyForm, license_number: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        placeholder="Enter license number"
                      />
                    ) : (
                      <p className="text-gray-900">{agency?.license_number || 'Not specified'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                    {editing ? (
                      <input
                        type="email"
                        value={agencyForm.email}
                        onChange={(e) => setAgencyForm({ ...agencyForm, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        placeholder="Enter email address"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <p className="text-gray-900">{agency?.email || 'Not specified'}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    {editing ? (
                      <input
                        type="tel"
                        value={agencyForm.phone}
                        onChange={(e) => setAgencyForm({ ...agencyForm, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        placeholder="Enter phone number"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <p className="text-gray-900">{agency?.phone || 'Not specified'}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    {editing ? (
                      <input
                        type="url"
                        value={agencyForm.website}
                        onChange={(e) => setAgencyForm({ ...agencyForm, website: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        placeholder="https://example.com"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-gray-400" />
                        {agency?.website ? (
                          <a
                            href={agency.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {agency.website}
                          </a>
                        ) : (
                          <p className="text-gray-900">Not specified</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-white shadow-lg border border-gray-200">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>Location</span>
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                    {editing ? (
                      <select
                        value={agencyForm.country}
                        onChange={(e) => setAgencyForm({ ...agencyForm, country: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      >
                        <option value="">Select Country</option>
                        {countries.map(country => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-900">{agency?.country || 'Not specified'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    {editing ? (
                      <input
                        type="text"
                        value={agencyForm.city}
                        onChange={(e) => setAgencyForm({ ...agencyForm, city: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        placeholder="Enter city"
                      />
                    ) : (
                      <p className="text-gray-900">{agency?.city || 'Not specified'}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    {editing ? (
                      <textarea
                        value={agencyForm.address}
                        onChange={(e) => setAgencyForm({ ...agencyForm, address: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                        placeholder="Enter full address"
                      />
                    ) : (
                      <p className="text-gray-900">{agency?.address || 'Not specified'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white shadow-lg border border-gray-200">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <User className="h-5 w-5 text-primary" />
                  <span>Contact Person</span>
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
                    {editing ? (
                      <input
                        type="text"
                        value={agencyForm.contact_person}
                        onChange={(e) => setAgencyForm({ ...agencyForm, contact_person: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        placeholder="Enter contact person name"
                      />
                    ) : (
                      <p className="text-gray-900">{agency?.contact_person || 'Not specified'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Title</label>
                    {editing ? (
                      <input
                        type="text"
                        value={agencyForm.contact_title}
                        onChange={(e) => setAgencyForm({ ...agencyForm, contact_title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        placeholder="e.g., CEO, Manager"
                      />
                    ) : (
                      <p className="text-gray-900">{agency?.contact_title || 'Not specified'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white shadow-lg border border-gray-200">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span>Notes</span>
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                {editing ? (
                  <textarea
                    value={agencyForm.notes}
                    onChange={(e) => setAgencyForm({ ...agencyForm, notes: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                    placeholder="Internal notes about this agency..."
                  />
                ) : (
                  <p className="text-gray-900 whitespace-pre-wrap">{agency?.notes || 'No notes available'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status & Subscription */}
            <div className="bg-white shadow-lg border border-gray-200">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Status & Subscription</h2>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subscription Tier</label>
                  {editing ? (
                    <select
                      value={agencyForm.subscription_tier}
                      onChange={(e) => setAgencyForm({ ...agencyForm, subscription_tier: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    >
                      <option value="basic">Basic</option>
                      <option value="premium">Premium</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  ) : (
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold border ${getTierColor(agency?.subscription_tier || 'basic')}`}>
                      {agency?.subscription_tier?.charAt(0).toUpperCase() + agency?.subscription_tier?.slice(1)}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  {editing ? (
                    <select
                      value={agencyForm.subscription_status}
                      onChange={(e) => setAgencyForm({ ...agencyForm, subscription_status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  ) : (
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(agency?.subscription_status || 'pending')}
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold border ${getStatusColor(agency?.subscription_status || 'pending')}`}>
                        {agency?.subscription_status}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Billing Information */}
            <div className="bg-white shadow-lg border border-gray-200">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span>Billing</span>
                </h2>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Billing Email</label>
                  {editing ? (
                    <input
                      type="email"
                      value={agencyForm.billing_email}
                      onChange={(e) => setAgencyForm({ ...agencyForm, billing_email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      placeholder="Enter billing email"
                    />
                  ) : (
                    <p className="text-gray-900">{agency?.billing_email || 'Not specified'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  {editing ? (
                    <input
                      type="text"
                      value={agencyForm.payment_method}
                      onChange={(e) => setAgencyForm({ ...agencyForm, payment_method: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      placeholder="e.g., Credit Card, Bank Transfer"
                    />
                  ) : (
                    <p className="text-gray-900">{agency?.payment_method || 'Not specified'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contract Information */}
            <div className="bg-white shadow-lg border border-gray-200">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>Contract</span>
                </h2>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contract Start</label>
                  {editing ? (
                    <input
                      type="date"
                      value={agencyForm.contract_start}
                      onChange={(e) => setAgencyForm({ ...agencyForm, contract_start: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {agency?.contract_start ? agency.contract_start.toLocaleDateString() : 'Not specified'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contract End</label>
                  {editing ? (
                    <input
                      type="date"
                      value={agencyForm.contract_end}
                      onChange={(e) => setAgencyForm({ ...agencyForm, contract_end: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {agency?.contract_end ? agency.contract_end.toLocaleDateString() : 'Not specified'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Metadata */}
            {!isNewAgency && agency && (
              <div className="bg-white shadow-lg border border-gray-200">
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Metadata</h2>
                </div>
                <div className="p-4 sm:p-6 space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Created:</span>
                    <p className="text-gray-900">
                      {agency.created_at ? agency.created_at.toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Last Updated:</span>
                    <p className="text-gray-900">
                      {agency.updated_at ? agency.updated_at.toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Agency ID:</span>
                    <p className="text-gray-900 font-mono text-xs">{agency.id}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}