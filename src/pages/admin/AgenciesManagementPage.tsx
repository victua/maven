import { useState, useEffect } from 'react';
import { Search, Building, Edit2, Trash2, Plus, Mail, Phone, MapPin, Calendar, DollarSign, CheckCircle2, XCircle, Clock } from 'lucide-react';
import {
  db,
  collection,
  getDocs,
  query,
  orderBy,
  doc,
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

export function AgenciesManagementPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAgencyModal, setShowAgencyModal] = useState(false);
  const [editingAgency, setEditingAgency] = useState<Agency | null>(null);
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCountry, setFilterCountry] = useState<string>('all');

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

  useEffect(() => {
    fetchAgencies();
  }, []);

  const fetchAgencies = async () => {
    try {
      const agenciesRef = collection(db, 'agencies');
      const agenciesQuery = query(agenciesRef, orderBy('created_at', 'desc'));
      const agenciesSnapshot = await getDocs(agenciesQuery);
      const agenciesData = agenciesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        contract_start: doc.data().contract_start?.toDate(),
        contract_end: doc.data().contract_end?.toDate(),
        created_at: doc.data().created_at?.toDate(),
        updated_at: doc.data().updated_at?.toDate()
      })) as Agency[];

      setAgencies(agenciesData);
    } catch (error) {
      console.error('Error fetching agencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const uniqueCountries = [...new Set(agencies.map(agency => agency.country))].sort();

  const filteredAgencies = agencies.filter(agency => {
    const matchesSearch =
      agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.contact_person?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTier = filterTier === 'all' || agency.subscription_tier === filterTier;
    const matchesStatus = filterStatus === 'all' || agency.subscription_status === filterStatus;
    const matchesCountry = filterCountry === 'all' || agency.country === filterCountry;

    return matchesSearch && matchesTier && matchesStatus && matchesCountry;
  });

  const openAgencyModal = (agency?: Agency) => {
    if (agency) {
      setEditingAgency(agency);
      setAgencyForm({
        name: agency.name || '',
        email: agency.email || '',
        phone: agency.phone || '',
        country: agency.country || '',
        city: agency.city || '',
        address: agency.address || '',
        website: agency.website || '',
        license_number: agency.license_number || '',
        contact_person: agency.contact_person || '',
        contact_title: agency.contact_title || '',
        subscription_tier: agency.subscription_tier || 'basic',
        subscription_status: agency.subscription_status || 'pending',
        billing_email: agency.billing_email || '',
        payment_method: agency.payment_method || '',
        contract_start: agency.contract_start?.toISOString().split('T')[0] || '',
        contract_end: agency.contract_end?.toISOString().split('T')[0] || '',
        notes: agency.notes || ''
      });
    } else {
      setEditingAgency(null);
      setAgencyForm({
        name: '', email: '', phone: '', country: '', city: '', address: '', website: '',
        license_number: '', contact_person: '', contact_title: '', subscription_tier: 'basic',
        subscription_status: 'pending', billing_email: '', payment_method: '',
        contract_start: '', contract_end: '', notes: ''
      });
    }
    setShowAgencyModal(true);
  };

  const closeAgencyModal = () => {
    setShowAgencyModal(false);
    setEditingAgency(null);
  };

  const saveAgency = async () => {
    try {
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

      if (editingAgency) {
        const agencyRef = doc(db, 'agencies', editingAgency.id);
        await updateDoc(agencyRef, agencyData);
      } else {
        await addDoc(collection(db, 'agencies'), {
          ...agencyData,
          created_at: serverTimestamp()
        });
      }

      fetchAgencies();
      closeAgencyModal();
    } catch (error) {
      console.error('Error saving agency:', error);
    }
  };

  const updateAgencyStatus = async (agencyId: string, newStatus: 'active' | 'inactive' | 'pending' | 'suspended') => {
    try {
      const agencyRef = doc(db, 'agencies', agencyId);
      await updateDoc(agencyRef, {
        subscription_status: newStatus,
        updated_at: serverTimestamp()
      });
      fetchAgencies();
    } catch (error) {
      console.error('Error updating agency status:', error);
    }
  };

  const deleteAgency = async (agencyId: string) => {
    if (window.confirm('Are you sure you want to delete this agency? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'agencies', agencyId));
        fetchAgencies();
      } catch (error) {
        console.error('Error deleting agency:', error);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="ml-12 sm:ml-14 w-[98%] px-2 sm:px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">Agencies Management</h1>
          <p className="text-gray-600">Manage recruitment agency partners and subscriptions</p>
        </div>

        <div className="bg-white shadow-lg border border-gray-200">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search agencies by name, email, country..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm sm:text-base"
                  />
                </div>
                <select
                  value={filterTier}
                  onChange={(e) => setFilterTier(e.target.value)}
                  className="px-4 py-2 sm:py-3 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm sm:text-base"
                >
                  <option value="all">All Tiers</option>
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 sm:py-3 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm sm:text-base"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
                <select
                  value={filterCountry}
                  onChange={(e) => setFilterCountry(e.target.value)}
                  className="px-4 py-2 sm:py-3 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm sm:text-base"
                >
                  <option value="all">All Countries</option>
                  {uniqueCountries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => openAgencyModal()}
                className="flex items-center justify-center space-x-2 px-4 py-2 sm:py-3 bg-primary text-white hover:bg-primary/90 transition-colors font-semibold border border-primary text-sm sm:text-base whitespace-nowrap"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Add Agency</span>
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="inline-block animate-spin border border-gray-300 h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-gray-600">Loading agencies...</span>
              </div>
            ) : filteredAgencies.length === 0 ? (
              <div className="text-center py-8">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-2">No agencies found</p>
                <p className="text-gray-500">Add your first agency partner to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Desktop Table View */}
                <div className="hidden xl:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Agency</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Contact</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Location</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Subscription</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAgencies.map((agency) => (
                        <tr key={agency.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-green-100 border border-gray-300 flex items-center justify-center">
                                <Building className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{agency.name}</div>
                                <div className="text-sm text-gray-500">{agency.license_number}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm">
                              <div className="flex items-center space-x-1 text-gray-900">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span>{agency.email}</span>
                              </div>
                              {agency.phone && (
                                <div className="flex items-center space-x-1 text-gray-600 mt-1">
                                  <Phone className="h-4 w-4 text-gray-400" />
                                  <span>{agency.phone}</span>
                                </div>
                              )}
                              {agency.contact_person && (
                                <div className="text-gray-600 mt-1">
                                  <strong>Contact:</strong> {agency.contact_person}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-1 text-gray-700">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span>{agency.city ? `${agency.city}, ` : ''}{agency.country}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 text-xs font-semibold border ${getTierColor(agency.subscription_tier)}`}>
                              {agency.subscription_tier.charAt(0).toUpperCase() + agency.subscription_tier.slice(1)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(agency.subscription_status)}
                              <span className={`px-3 py-1 text-xs font-semibold border ${getStatusColor(agency.subscription_status)}`}>
                                {agency.subscription_status}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => openAgencyModal(agency)}
                                className="p-2 text-gray-600 hover:text-primary transition-colors border border-gray-300 hover:bg-gray-100"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <select
                                value={agency.subscription_status}
                                onChange={(e) => updateAgencyStatus(agency.id, e.target.value as any)}
                                className="text-xs border border-gray-300 rounded px-2 py-1"
                              >
                                <option value="active">Active</option>
                                <option value="pending">Pending</option>
                                <option value="inactive">Inactive</option>
                                <option value="suspended">Suspended</option>
                              </select>
                              <button
                                onClick={() => deleteAgency(agency.id)}
                                className="p-2 text-red-600 hover:text-red-700 transition-colors border border-red-300 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile/Tablet Card View */}
                <div className="xl:hidden space-y-4">
                  {filteredAgencies.map((agency) => (
                    <div key={agency.id} className="bg-gray-50 border border-gray-300 p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-green-100 border border-gray-300 flex items-center justify-center">
                          <Building className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{agency.name}</h3>
                          <p className="text-sm text-gray-500">{agency.license_number}</p>
                        </div>
                        <div className="flex gap-1">
                          <span className={`px-2 py-1 text-xs font-semibold border ${getTierColor(agency.subscription_tier)}`}>
                            {agency.subscription_tier}
                          </span>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(agency.subscription_status)}
                            <span className={`px-2 py-1 text-xs font-semibold border ${getStatusColor(agency.subscription_status)}`}>
                              {agency.subscription_status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center space-x-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900">{agency.email}</span>
                        </div>
                        {agency.phone && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">{agency.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2 text-sm">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{agency.city ? `${agency.city}, ` : ''}{agency.country}</span>
                        </div>
                        {agency.contact_person && (
                          <div className="text-sm text-gray-600">
                            <strong>Contact:</strong> {agency.contact_person}
                            {agency.contact_title && ` (${agency.contact_title})`}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => openAgencyModal(agency)}
                          className="flex items-center space-x-1 px-3 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors text-sm border border-gray-300"
                        >
                          <Edit2 className="h-4 w-4" />
                          <span>Edit</span>
                        </button>
                        <select
                          value={agency.subscription_status}
                          onChange={(e) => updateAgencyStatus(agency.id, e.target.value as any)}
                          className="text-sm border border-gray-300 rounded px-3 py-2"
                        >
                          <option value="active">Active</option>
                          <option value="pending">Pending</option>
                          <option value="inactive">Inactive</option>
                          <option value="suspended">Suspended</option>
                        </select>
                        <button
                          onClick={() => deleteAgency(agency.id)}
                          className="flex items-center space-x-1 px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 transition-colors text-sm border border-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Agency Modal */}
      {showAgencyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-gray-400 p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-primary mb-6">
              {editingAgency ? 'Edit Agency' : 'Add New Agency'}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">Agency Name *</label>
                  <input
                    type="text"
                    value={agencyForm.name}
                    onChange={(e) => setAgencyForm({ ...agencyForm, name: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-400 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={agencyForm.email}
                    onChange={(e) => setAgencyForm({ ...agencyForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={agencyForm.phone}
                    onChange={(e) => setAgencyForm({ ...agencyForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                    <select
                      value={agencyForm.country}
                      onChange={(e) => setAgencyForm({ ...agencyForm, country: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                    >
                      <option value="">Select Country</option>
                      {countries.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={agencyForm.city}
                      onChange={(e) => setAgencyForm({ ...agencyForm, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    value={agencyForm.address}
                    onChange={(e) => setAgencyForm({ ...agencyForm, address: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="url"
                    value={agencyForm.website}
                    onChange={(e) => setAgencyForm({ ...agencyForm, website: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                    placeholder="https://"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                  <input
                    type="text"
                    value={agencyForm.license_number}
                    onChange={(e) => setAgencyForm({ ...agencyForm, license_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                    <input
                      type="text"
                      value={agencyForm.contact_person}
                      onChange={(e) => setAgencyForm({ ...agencyForm, contact_person: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Title</label>
                    <input
                      type="text"
                      value={agencyForm.contact_title}
                      onChange={(e) => setAgencyForm({ ...agencyForm, contact_title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                      placeholder="e.g., CEO, Manager"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Tier</label>
                    <select
                      value={agencyForm.subscription_tier}
                      onChange={(e) => setAgencyForm({ ...agencyForm, subscription_tier: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                    >
                      <option value="basic">Basic</option>
                      <option value="premium">Premium</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={agencyForm.subscription_status}
                      onChange={(e) => setAgencyForm({ ...agencyForm, subscription_status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Billing Email</label>
                  <input
                    type="email"
                    value={agencyForm.billing_email}
                    onChange={(e) => setAgencyForm({ ...agencyForm, billing_email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <input
                    type="text"
                    value={agencyForm.payment_method}
                    onChange={(e) => setAgencyForm({ ...agencyForm, payment_method: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                    placeholder="e.g., Credit Card, Bank Transfer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contract Start</label>
                    <input
                      type="date"
                      value={agencyForm.contract_start}
                      onChange={(e) => setAgencyForm({ ...agencyForm, contract_start: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contract End</label>
                    <input
                      type="date"
                      value={agencyForm.contract_end}
                      onChange={(e) => setAgencyForm({ ...agencyForm, contract_end: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={agencyForm.notes}
                    onChange={(e) => setAgencyForm({ ...agencyForm, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none text-sm"
                    placeholder="Internal notes about this agency"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={saveAgency}
                className="flex-1 bg-primary text-white py-3 px-6 hover:bg-primary/90 transition-colors font-semibold border border-primary text-sm sm:text-base"
              >
                {editingAgency ? 'Update Agency' : 'Add Agency'}
              </button>
              <button
                onClick={closeAgencyModal}
                className="flex-1 border-2 border-gray-400 text-gray-700 py-3 px-6 hover:bg-gray-50 transition-colors font-semibold text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}