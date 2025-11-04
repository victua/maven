import { useState, useEffect } from 'react';
import { Search, UserPlus, Edit2, Trash2, Shield, Users, Building, User, CheckCircle2, XCircle, Clock } from 'lucide-react';
import {
  db,
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from '../../lib/firebase';

interface UserData {
  uid: string;
  email: string;
  role: string;
  displayName?: string;
  createdAt?: any;
  updatedAt?: any;
}

interface AgencyData {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  subscription_tier: string;
  subscription_status: string;
  user_id?: string;
  created_at?: any;
}

interface CandidateData {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  profession: string;
  verified: boolean;
  available: boolean;
  created_at?: any;
}

export function UsersPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'agencies' | 'candidates'>('users');
  const [users, setUsers] = useState<UserData[]>([]);
  const [agencies, setAgencies] = useState<AgencyData[]>([]);
  const [candidates, setCandidates] = useState<CandidateData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch users
      const usersRef = collection(db, 'users');
      const usersQuery = query(usersRef, orderBy('createdAt', 'desc'));
      const usersSnapshot = await getDocs(usersQuery);
      const usersData = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as UserData[];

      // Fetch agencies
      const agenciesRef = collection(db, 'agencies');
      const agenciesQuery = query(agenciesRef, orderBy('created_at', 'desc'));
      const agenciesSnapshot = await getDocs(agenciesQuery);
      const agenciesData = agenciesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AgencyData[];

      // Fetch candidates
      const candidatesRef = collection(db, 'candidates');
      const candidatesQuery = query(candidatesRef, orderBy('created_at', 'desc'));
      const candidatesSnapshot = await getDocs(candidatesQuery);
      const candidatesData = candidatesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CandidateData[];

      setUsers(usersData);
      setAgencies(agenciesData);
      setCandidates(candidatesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: serverTimestamp()
      });
      fetchData();
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const deleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        fetchData();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const updateAgencyStatus = async (agencyId: string, status: string) => {
    try {
      const agencyRef = doc(db, 'agencies', agencyId);
      await updateDoc(agencyRef, {
        subscription_status: status,
        updated_at: serverTimestamp()
      });
      fetchData();
    } catch (error) {
      console.error('Error updating agency status:', error);
    }
  };

  const updateCandidateVerification = async (candidateId: string, verified: boolean) => {
    try {
      const candidateRef = doc(db, 'candidates', candidateId);
      await updateDoc(candidateRef, {
        verified: verified,
        updated_at: serverTimestamp()
      });
      fetchData();
    } catch (error) {
      console.error('Error updating candidate verification:', error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAgencies = agencies.filter(agency =>
    agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agency.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agency.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCandidates = candidates.filter(candidate =>
    candidate.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.profession?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'team':
        return 'bg-blue-100 text-blue-800';
      case 'agency':
        return 'bg-green-100 text-green-800';
      case 'talent':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin border border-gray-300 h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-[96%] ml-auto mr-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage users, agencies, and candidates</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="bg-white shadow-sm border border-gray-300">
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-6 py-4 font-semibold border-b-2 transition-colors ${
                    activeTab === 'users'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Users ({users.length})</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('agencies')}
                  className={`px-6 py-4 font-semibold border-b-2 transition-colors ${
                    activeTab === 'agencies'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Building className="h-5 w-5" />
                    <span>Agencies ({agencies.length})</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('candidates')}
                  className={`px-6 py-4 font-semibold border-b-2 transition-colors ${
                    activeTab === 'candidates'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Candidates ({candidates.length})</span>
                  </div>
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'users' && (
          <div className="bg-white border border-gray-300 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">System Users</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900">User</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900">Email</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900">Role</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900">Created</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.uid} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 border border-gray-300 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium text-gray-900">{user.displayName || 'No Name'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-700">{user.email}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 border border-gray-300 text-xs font-semibold ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-700">
                        {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown'}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <select
                            value={user.role}
                            onChange={(e) => updateUserRole(user.uid, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="talent">Talent</option>
                            <option value="agency">Agency</option>
                            <option value="team">Team</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            onClick={() => deleteUser(user.uid)}
                            className="p-1 text-red-600 hover:text-red-700"
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
          </div>
        )}

        {activeTab === 'agencies' && (
          <div className="bg-white border border-gray-300 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Agency Partners</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900">Agency</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900">Contact</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900">Country</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900">Subscription</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900">Status</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAgencies.map((agency) => (
                    <tr key={agency.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 border border-gray-300 flex items-center justify-center">
                            <Building className="h-4 w-4 text-green-600" />
                          </div>
                          <span className="font-medium text-gray-900">{agency.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <div className="text-gray-900">{agency.email}</div>
                          <div className="text-gray-500 text-sm">{agency.phone}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-700">{agency.country}</td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 border border-gray-300 text-xs font-semibold bg-blue-100 text-blue-800">
                          {agency.subscription_tier}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 border border-gray-300 text-xs font-semibold ${getStatusColor(agency.subscription_status)}`}>
                          {agency.subscription_status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <select
                          value={agency.subscription_status}
                          onChange={(e) => updateAgencyStatus(agency.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="pending">Pending</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'candidates' && (
          <div className="bg-white border border-gray-300 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Talent Candidates</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900">Candidate</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900">Contact</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900">Profession</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900">Status</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900">Verified</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidates.map((candidate) => (
                    <tr key={candidate.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-100 border border-gray-300 flex items-center justify-center">
                            <User className="h-4 w-4 text-purple-600" />
                          </div>
                          <span className="font-medium text-gray-900">{candidate.full_name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <div className="text-gray-900">{candidate.email}</div>
                          <div className="text-gray-500 text-sm">{candidate.phone}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-700">{candidate.profession}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 border border-gray-300 text-xs font-semibold ${
                          candidate.available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {candidate.available ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          {candidate.verified ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-600" />
                          )}
                          <span className={`text-sm ${candidate.verified ? 'text-green-600' : 'text-yellow-600'}`}>
                            {candidate.verified ? 'Verified' : 'Pending'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => updateCandidateVerification(candidate.id, !candidate.verified)}
                          className={`text-xs px-3 py-1 rounded ${
                            candidate.verified
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {candidate.verified ? 'Unverify' : 'Verify'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}