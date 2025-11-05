import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building, Edit2, Trash2, Plus, Mail, Phone, MapPin, Calendar, DollarSign, CheckCircle2, XCircle, Clock, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
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
  const navigate = useNavigate();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCountry, setFilterCountry] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;


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

  // Pagination logic
  const totalPages = Math.ceil(filteredAgencies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAgencies = filteredAgencies.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterTier, filterStatus, filterCountry]);

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
                onClick={() => navigate('/agencies/new')}
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
                      {paginatedAgencies.map((agency) => (
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
                                onClick={() => navigate(`/agencies/${agency.id}`)}
                                className="p-2 text-gray-600 hover:text-primary transition-colors border border-gray-300 hover:bg-gray-100"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
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
                  {paginatedAgencies.map((agency) => (
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
                          onClick={() => navigate(`/agencies/${agency.id}`)}
                          className="flex items-center space-x-1 px-3 py-2 bg-primary text-white hover:bg-primary/90 transition-colors text-sm border border-primary"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View</span>
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

            {/* Pagination */}
            {filteredAgencies.length > 0 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredAgencies.length)} of {filteredAgencies.length} agencies
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center px-3 py-2 text-sm border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </button>

                  <div className="flex space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                      // Show first page, current page and its neighbors, and last page
                      const showPage = page === 1 || page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1);

                      if (!showPage && page === 2 && currentPage > 4) {
                        return <span key={page} className="px-2 py-1 text-gray-500">...</span>;
                      }

                      if (!showPage && page === totalPages - 1 && currentPage < totalPages - 3) {
                        return <span key={page} className="px-2 py-1 text-gray-500">...</span>;
                      }

                      if (!showPage) return null;

                      return (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`px-3 py-2 text-sm border transition-colors ${
                            currentPage === page
                              ? 'bg-primary text-white border-primary'
                              : 'border-gray-300 hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center px-3 py-2 text-sm border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


    </div>
  );
}