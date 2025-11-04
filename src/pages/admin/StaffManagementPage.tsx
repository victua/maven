import { useState, useEffect } from 'react';
import { Search, UserPlus, Edit2, Trash2, Shield, Users, User, CheckCircle2, XCircle, Plus, Mail, Phone, Calendar } from 'lucide-react';
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

interface StaffUser {
  uid: string;
  email: string;
  role: 'admin' | 'team';
  displayName?: string;
  phone?: string;
  department?: string;
  position?: string;
  permissions?: string[];
  status: 'active' | 'inactive';
  createdAt?: any;
  updatedAt?: any;
  lastLogin?: any;
}

export function StaffManagementPage() {
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [staffForm, setStaffForm] = useState({
    email: '',
    displayName: '',
    phone: '',
    role: 'team' as 'admin' | 'team',
    department: '',
    position: '',
    status: 'active' as 'active' | 'inactive',
    permissions: [] as string[]
  });

  const availablePermissions = [
    'canAccessAdmin',
    'canManageUsers',
    'canManageAgencies',
    'canManageCandidates',
    'canViewAnalytics',
    'canManageRoles',
    'canManageReports',
    'canAccessSettings'
  ];

  const departments = [
    'Human Resources',
    'Operations',
    'Business Development',
    'Customer Support',
    'IT & Technology',
    'Marketing',
    'Finance',
    'Legal & Compliance'
  ];

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const usersRef = collection(db, 'users');
      const usersQuery = query(usersRef, orderBy('createdAt', 'desc'));
      const usersSnapshot = await getDocs(usersQuery);
      const staffData = usersSnapshot.docs
        .map(doc => ({
          uid: doc.id,
          ...doc.data()
        }))
        .filter(user => user.role === 'admin' || user.role === 'team') as StaffUser[];

      setStaff(staffData);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = staff.filter(member => {
    const matchesSearch =
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.position?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'all' || member.role === filterRole;
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const openStaffModal = (staffMember?: StaffUser) => {
    if (staffMember) {
      setEditingStaff(staffMember);
      setStaffForm({
        email: staffMember.email || '',
        displayName: staffMember.displayName || '',
        phone: staffMember.phone || '',
        role: staffMember.role || 'team',
        department: staffMember.department || '',
        position: staffMember.position || '',
        status: staffMember.status || 'active',
        permissions: staffMember.permissions || []
      });
    } else {
      setEditingStaff(null);
      setStaffForm({
        email: '',
        displayName: '',
        phone: '',
        role: 'team',
        department: '',
        position: '',
        status: 'active',
        permissions: []
      });
    }
    setShowStaffModal(true);
  };

  const closeStaffModal = () => {
    setShowStaffModal(false);
    setEditingStaff(null);
  };

  const saveStaff = async () => {
    try {
      const staffData = {
        email: staffForm.email,
        displayName: staffForm.displayName,
        phone: staffForm.phone,
        role: staffForm.role,
        department: staffForm.department,
        position: staffForm.position,
        status: staffForm.status,
        permissions: staffForm.permissions,
        updatedAt: serverTimestamp()
      };

      if (editingStaff) {
        const staffRef = doc(db, 'users', editingStaff.uid);
        await updateDoc(staffRef, staffData);
      } else {
        await addDoc(collection(db, 'users'), {
          ...staffData,
          createdAt: serverTimestamp()
        });
      }

      fetchStaff();
      closeStaffModal();
    } catch (error) {
      console.error('Error saving staff:', error);
    }
  };

  const updateStaffRole = async (staffId: string, newRole: 'admin' | 'team') => {
    try {
      const staffRef = doc(db, 'users', staffId);
      await updateDoc(staffRef, {
        role: newRole,
        updatedAt: serverTimestamp()
      });
      fetchStaff();
    } catch (error) {
      console.error('Error updating staff role:', error);
    }
  };

  const updateStaffStatus = async (staffId: string, newStatus: 'active' | 'inactive') => {
    try {
      const staffRef = doc(db, 'users', staffId);
      await updateDoc(staffRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      fetchStaff();
    } catch (error) {
      console.error('Error updating staff status:', error);
    }
  };

  const deleteStaff = async (staffId: string) => {
    if (window.confirm('Are you sure you want to delete this staff member? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'users', staffId));
        fetchStaff();
      } catch (error) {
        console.error('Error deleting staff:', error);
      }
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'team':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="ml-12 sm:ml-14 w-[98%] px-2 sm:px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">Staff Management</h1>
          <p className="text-gray-600">Manage internal team members and administrators</p>
        </div>

        <div className="bg-white shadow-lg border border-gray-200">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search staff by name, email, department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm sm:text-base"
                  />
                </div>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-4 py-2 sm:py-3 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm sm:text-base"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="team">Team</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 sm:py-3 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm sm:text-base"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <button
                onClick={() => openStaffModal()}
                className="flex items-center justify-center space-x-2 px-4 py-2 sm:py-3 bg-primary text-white hover:bg-primary/90 transition-colors font-semibold border border-primary text-sm sm:text-base whitespace-nowrap"
              >
                <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Add Staff</span>
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="inline-block animate-spin border border-gray-300 h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-gray-600">Loading staff...</span>
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-2">No staff members found</p>
                <p className="text-gray-500">Add your first staff member to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Staff Member</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Contact</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Department</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Role</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStaff.map((member) => (
                        <tr key={member.uid} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-primary/10 border border-gray-300 flex items-center justify-center">
                                {member.role === 'admin' ? (
                                  <Shield className="h-5 w-5 text-red-600" />
                                ) : (
                                  <User className="h-5 w-5 text-blue-600" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{member.displayName || 'No Name'}</div>
                                <div className="text-sm text-gray-500">{member.position}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm">
                              <div className="flex items-center space-x-1 text-gray-900">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span>{member.email}</span>
                              </div>
                              {member.phone && (
                                <div className="flex items-center space-x-1 text-gray-600 mt-1">
                                  <Phone className="h-4 w-4 text-gray-400" />
                                  <span>{member.phone}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-700">{member.department || 'Not specified'}</td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 text-xs font-semibold border ${getRoleColor(member.role)}`}>
                              {member.role === 'admin' ? 'Administrator' : 'Team Member'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 text-xs font-semibold border ${getStatusColor(member.status)}`}>
                              {member.status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => openStaffModal(member)}
                                className="p-2 text-gray-600 hover:text-primary transition-colors border border-gray-300 hover:bg-gray-100"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => updateStaffStatus(member.uid, member.status === 'active' ? 'inactive' : 'active')}
                                className={`px-3 py-1 text-xs font-semibold transition-colors border ${
                                  member.status === 'active'
                                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300'
                                    : 'bg-green-100 text-green-800 hover:bg-green-200 border-green-300'
                                }`}
                              >
                                {member.status === 'active' ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                onClick={() => deleteStaff(member.uid)}
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

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4">
                  {filteredStaff.map((member) => (
                    <div key={member.uid} className="bg-gray-50 border border-gray-300 p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-primary/10 border border-gray-300 flex items-center justify-center">
                          {member.role === 'admin' ? (
                            <Shield className="h-5 w-5 text-red-600" />
                          ) : (
                            <User className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{member.displayName || 'No Name'}</h3>
                          <p className="text-sm text-gray-500">{member.position}</p>
                        </div>
                        <div className="flex gap-1">
                          <span className={`px-2 py-1 text-xs font-semibold border ${getRoleColor(member.role)}`}>
                            {member.role === 'admin' ? 'Admin' : 'Team'}
                          </span>
                          <span className={`px-2 py-1 text-xs font-semibold border ${getStatusColor(member.status)}`}>
                            {member.status}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center space-x-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900">{member.email}</span>
                        </div>
                        {member.phone && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">{member.phone}</span>
                          </div>
                        )}
                        <div className="text-sm text-gray-600">
                          <strong>Department:</strong> {member.department || 'Not specified'}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => openStaffModal(member)}
                          className="flex items-center space-x-1 px-3 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors text-sm border border-gray-300"
                        >
                          <Edit2 className="h-4 w-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => updateStaffStatus(member.uid, member.status === 'active' ? 'inactive' : 'active')}
                          className={`px-3 py-2 text-sm font-semibold transition-colors border ${
                            member.status === 'active'
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300'
                              : 'bg-green-100 text-green-800 hover:bg-green-200 border-green-300'
                          }`}
                        >
                          {member.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => deleteStaff(member.uid)}
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

      {/* Staff Modal */}
      {showStaffModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-gray-400 p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-primary mb-6">
              {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-primary mb-1">Email Address *</label>
                <input
                  type="email"
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-400 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
                  disabled={!!editingStaff}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={staffForm.displayName}
                  onChange={(e) => setStaffForm({ ...staffForm, displayName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={staffForm.phone}
                  onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={staffForm.role}
                  onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value as 'admin' | 'team' })}
                  className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                >
                  <option value="team">Team Member</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={staffForm.department}
                  onChange={(e) => setStaffForm({ ...staffForm, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <input
                  type="text"
                  value={staffForm.position}
                  onChange={(e) => setStaffForm({ ...staffForm, position: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                  placeholder="e.g., HR Manager, Operations Lead"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Permissions</label>
              <div className="grid grid-cols-2 gap-2">
                {availablePermissions.map(permission => (
                  <label key={permission} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={staffForm.permissions.includes(permission)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setStaffForm({
                            ...staffForm,
                            permissions: [...staffForm.permissions, permission]
                          });
                        } else {
                          setStaffForm({
                            ...staffForm,
                            permissions: staffForm.permissions.filter(p => p !== permission)
                          });
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">
                      {permission.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={staffForm.status}
                onChange={(e) => setStaffForm({ ...staffForm, status: e.target.value as 'active' | 'inactive' })}
                className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={saveStaff}
                className="flex-1 bg-primary text-white py-3 px-6 hover:bg-primary/90 transition-colors font-semibold border border-primary text-sm sm:text-base"
              >
                {editingStaff ? 'Update Staff Member' : 'Add Staff Member'}
              </button>
              <button
                onClick={closeStaffModal}
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