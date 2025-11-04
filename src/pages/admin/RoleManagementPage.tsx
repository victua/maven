import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Briefcase, MapPin, DollarSign, Calendar, Users } from 'lucide-react';
import {
  db,
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  serverTimestamp,
  addDoc,
  deleteDoc
} from '../../lib/firebase';

interface Role {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  salary_range: string;
  experience_required: string;
  skills_required: string[];
  responsibilities: string[];
  qualifications: string[];
  employment_type: 'full-time' | 'part-time' | 'contract' | 'temporary';
  posted_date: Date;
  deadline: Date;
  positions_available: number;
  status: 'active' | 'inactive' | 'filled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at?: Date;
  updated_at?: Date;
}

export function RoleManagementPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [roleForm, setRoleForm] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    salary_range: '',
    experience_required: '',
    skills_required: '',
    responsibilities: '',
    qualifications: '',
    employment_type: 'full-time' as const,
    deadline: '',
    positions_available: 1,
    status: 'active' as const,
    priority: 'medium' as const
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const rolesRef = collection(db, 'roles');
      const rolesQuery = query(rolesRef, orderBy('created_at', 'desc'));
      const rolesSnapshot = await getDocs(rolesQuery);
      const rolesData = rolesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        posted_date: doc.data().posted_date?.toDate() || new Date(),
        deadline: doc.data().deadline?.toDate() || new Date(),
        created_at: doc.data().created_at?.toDate() || new Date(),
        updated_at: doc.data().updated_at?.toDate() || new Date()
      }));
      setRoles(rolesData as Role[]);
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRoles = roles.filter(role => {
    const matchesSearch =
      role.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.skills_required.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = filterStatus === 'all' || role.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const openRoleModal = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setRoleForm({
        title: role.title,
        description: role.description,
        company: role.company,
        location: role.location,
        salary_range: role.salary_range,
        experience_required: role.experience_required,
        skills_required: role.skills_required.join(', '),
        responsibilities: role.responsibilities.join('\n'),
        qualifications: role.qualifications.join('\n'),
        employment_type: role.employment_type,
        deadline: role.deadline.toISOString().split('T')[0],
        positions_available: role.positions_available,
        status: role.status,
        priority: role.priority
      });
    } else {
      setEditingRole(null);
      setRoleForm({
        title: '',
        description: '',
        company: '',
        location: '',
        salary_range: '',
        experience_required: '',
        skills_required: '',
        responsibilities: '',
        qualifications: '',
        employment_type: 'full-time',
        deadline: '',
        positions_available: 1,
        status: 'active',
        priority: 'medium'
      });
    }
    setShowRoleModal(true);
  };

  const closeRoleModal = () => {
    setShowRoleModal(false);
    setEditingRole(null);
  };

  const saveRole = async () => {
    try {
      const roleData = {
        title: roleForm.title,
        description: roleForm.description,
        company: roleForm.company,
        location: roleForm.location,
        salary_range: roleForm.salary_range,
        experience_required: roleForm.experience_required,
        skills_required: roleForm.skills_required.split(',').map(s => s.trim()).filter(s => s),
        responsibilities: roleForm.responsibilities.split('\n').map(s => s.trim()).filter(s => s),
        qualifications: roleForm.qualifications.split('\n').map(s => s.trim()).filter(s => s),
        employment_type: roleForm.employment_type,
        deadline: new Date(roleForm.deadline),
        positions_available: roleForm.positions_available,
        status: roleForm.status,
        priority: roleForm.priority,
        updated_at: serverTimestamp()
      };

      if (editingRole) {
        const roleRef = doc(db, 'roles', editingRole.id);
        await updateDoc(roleRef, roleData);
      } else {
        await addDoc(collection(db, 'roles'), {
          ...roleData,
          posted_date: serverTimestamp(),
          created_at: serverTimestamp()
        });
      }

      fetchRoles();
      closeRoleModal();
    } catch (error) {
      console.error('Error saving role:', error);
    }
  };

  const deleteRole = async (roleId: string) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await deleteDoc(doc(db, 'roles', roleId));
        fetchRoles();
      } catch (error) {
        console.error('Error deleting role:', error);
      }
    }
  };

  const updateRoleStatus = async (roleId: string, newStatus: 'active' | 'inactive' | 'filled') => {
    try {
      const roleRef = doc(db, 'roles', roleId);
      await updateDoc(roleRef, {
        status: newStatus,
        updated_at: serverTimestamp()
      });
      fetchRoles();
    } catch (error) {
      console.error('Error updating role status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'filled':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="ml-12 sm:ml-14 w-[98%] px-2 sm:px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">Role Management</h1>
          <p className="text-gray-600">Create and manage job roles for talent recruitment</p>
        </div>

        <div className="bg-white shadow-lg border border-gray-200">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search roles by title, company, location, or skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm sm:text-base"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 sm:py-3 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm sm:text-base"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="filled">Filled</option>
                </select>
              </div>
              <button
                onClick={() => openRoleModal()}
                className="flex items-center justify-center space-x-2 px-4 py-2 sm:py-3 bg-primary text-white hover:bg-primary/90 transition-colors font-semibold border border-primary text-sm sm:text-base whitespace-nowrap"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Create Role</span>
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="inline-block animate-spin border border-gray-300 h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-gray-600">Loading roles...</span>
              </div>
            ) : filteredRoles.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-2">No roles found</p>
                <p className="text-gray-500">Create your first role to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRoles.map((role) => (
                  <div key={role.id} className="bg-gray-50 border border-gray-300 p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4 gap-3">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="text-lg sm:text-xl font-bold text-primary">{role.title}</h3>
                          <span className={`px-2 py-1 text-xs font-semibold border ${getStatusColor(role.status)}`}>
                            {role.status}
                          </span>
                          <span className={`px-2 py-1 text-xs font-semibold border ${getPriorityColor(role.priority)}`}>
                            {role.priority} priority
                          </span>
                        </div>
                        <p className="text-primary font-medium mb-2">{role.company}</p>
                        <p className="text-gray-700 mb-3 leading-relaxed">{role.description}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span>{role.location}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <DollarSign className="h-4 w-4 flex-shrink-0" />
                            <span>{role.salary_range}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span>Deadline: {role.deadline.toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Users className="h-4 w-4 flex-shrink-0" />
                            <span>{role.positions_available} position{role.positions_available > 1 ? 's' : ''}</span>
                          </div>
                        </div>

                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-900 mb-1">Experience Required:</p>
                          <p className="text-sm text-gray-700">{role.experience_required}</p>
                        </div>

                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-900 mb-2">Skills Required:</p>
                          <div className="flex flex-wrap gap-1 sm:gap-2">
                            {role.skills_required.map((skill, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium border border-blue-200">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="text-xs text-gray-500">
                          Posted: {role.posted_date.toLocaleDateString()} •
                          Type: {role.employment_type.replace('-', ' ')}
                        </div>
                      </div>

                      <div className="flex flex-col lg:flex-row gap-2 lg:ml-4">
                        <button
                          onClick={() => openRoleModal(role)}
                          className="flex items-center justify-center space-x-1 px-3 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors text-sm border border-gray-300"
                        >
                          <Edit2 className="h-4 w-4" />
                          <span>Edit</span>
                        </button>
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateRoleStatus(role.id, role.status === 'active' ? 'inactive' : 'active')}
                            className={`px-3 py-2 text-sm font-semibold transition-colors border ${
                              role.status === 'active'
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300'
                                : 'bg-green-100 text-green-800 hover:bg-green-200 border-green-300'
                            }`}
                          >
                            {role.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => updateRoleStatus(role.id, 'filled')}
                            className="px-3 py-2 bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors text-sm border border-blue-300"
                            disabled={role.status === 'filled'}
                          >
                            Mark Filled
                          </button>
                        </div>
                        <button
                          onClick={() => deleteRole(role.id)}
                          className="flex items-center justify-center space-x-1 px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 transition-colors text-sm border border-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-gray-400 p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-primary mb-6">
              {editingRole ? 'Edit Role' : 'Create New Role'}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">Job Title *</label>
                  <input
                    type="text"
                    value={roleForm.title}
                    onChange={(e) => setRoleForm({ ...roleForm, title: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-400 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                  <input
                    type="text"
                    value={roleForm.company}
                    onChange={(e) => setRoleForm({ ...roleForm, company: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                    placeholder="Company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <input
                    type="text"
                    value={roleForm.location}
                    onChange={(e) => setRoleForm({ ...roleForm, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                    placeholder="e.g., New York, NY or Remote"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
                  <input
                    type="text"
                    value={roleForm.salary_range}
                    onChange={(e) => setRoleForm({ ...roleForm, salary_range: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                    placeholder="e.g., $80,000 - $120,000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience Required</label>
                  <input
                    type="text"
                    value={roleForm.experience_required}
                    onChange={(e) => setRoleForm({ ...roleForm, experience_required: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                    placeholder="e.g., 3-5 years"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                  <select
                    value={roleForm.employment_type}
                    onChange={(e) => setRoleForm({ ...roleForm, employment_type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="temporary">Temporary</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Positions Available</label>
                    <input
                      type="number"
                      min="1"
                      value={roleForm.positions_available}
                      onChange={(e) => setRoleForm({ ...roleForm, positions_available: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={roleForm.priority}
                      onChange={(e) => setRoleForm({ ...roleForm, priority: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline</label>
                  <input
                    type="date"
                    value={roleForm.deadline}
                    onChange={(e) => setRoleForm({ ...roleForm, deadline: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
                  <textarea
                    value={roleForm.description}
                    onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none text-sm"
                    placeholder="Brief description of the role and responsibilities"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills</label>
                  <input
                    type="text"
                    value={roleForm.skills_required}
                    onChange={(e) => setRoleForm({ ...roleForm, skills_required: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                    placeholder="Comma-separated skills (e.g., JavaScript, React, Node.js)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Key Responsibilities</label>
                  <textarea
                    value={roleForm.responsibilities}
                    onChange={(e) => setRoleForm({ ...roleForm, responsibilities: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none text-sm"
                    placeholder="One responsibility per line"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qualifications</label>
                  <textarea
                    value={roleForm.qualifications}
                    onChange={(e) => setRoleForm({ ...roleForm, qualifications: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none text-sm"
                    placeholder="One qualification per line"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={roleForm.status}
                    onChange={(e) => setRoleForm({ ...roleForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="filled">Filled</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={saveRole}
                className="flex-1 bg-primary text-white py-3 px-6 hover:bg-primary/90 transition-colors font-semibold border border-primary text-sm sm:text-base"
              >
                {editingRole ? 'Update Role' : 'Create Role'}
              </button>
              <button
                onClick={closeRoleModal}
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