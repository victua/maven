import { useState, useEffect } from 'react';
import { Search, Users, FileText, CheckCircle2, Plus, Trash2, Edit2, Briefcase } from 'lucide-react';
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

interface HiringRequest {
  id: string;
  job_title: string;
  quantity: number;
  destination_country: string;
  requirements: string;
  salary_range: string;
  status: string;
  deadline: string;
  agencies: {
    name: string;
    email: string;
    phone: string;
  };
}

interface Candidate {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  profession: string;
  experience_years: number;
  skills: string[];
  verified: boolean;
  available: boolean;
}

interface JobType {
  id: string;
  title: string;
  description: string;
  category: string;
  skills_required: string[];
  min_experience_years: number;
  active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<'requests' | 'candidates' | 'job-types'>('requests');
  const [requests, setRequests] = useState<HiringRequest[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showJobTypeModal, setShowJobTypeModal] = useState(false);
  const [editingJobType, setEditingJobType] = useState<JobType | null>(null);
  const [jobTypeForm, setJobTypeForm] = useState({
    title: '',
    description: '',
    category: '',
    skills_required: '',
    min_experience_years: 0,
    active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch hiring requests with agency data
      const requestsRef = collection(db, 'hiring_requests');
      const requestsQuery = query(requestsRef, orderBy('created_at', 'desc'));
      const requestsSnapshot = await getDocs(requestsQuery);

      const requestsPromises = requestsSnapshot.docs.map(async (docSnapshot) => {
        const requestData = { id: docSnapshot.id, ...docSnapshot.data() } as any;

        // Fetch agency data for each request
        if (requestData.agency_id) {
          const agenciesRef = collection(db, 'agencies');
          const agenciesSnapshot = await getDocs(agenciesRef);
          const agency = agenciesSnapshot.docs.find(doc => doc.id === requestData.agency_id);
          if (agency) {
            requestData.agencies = agency.data();
          }
        }

        return requestData;
      });

      const requestsData = await Promise.all(requestsPromises);

      // Fetch candidates
      const candidatesRef = collection(db, 'candidates');
      const candidatesQuery = query(candidatesRef, orderBy('created_at', 'desc'));
      const candidatesSnapshot = await getDocs(candidatesQuery);
      const candidatesData = candidatesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch job types
      const jobTypesRef = collection(db, 'job_types');
      const jobTypesQuery = query(jobTypesRef, orderBy('created_at', 'desc'));
      const jobTypesSnapshot = await getDocs(jobTypesQuery);
      const jobTypesData = jobTypesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setRequests(requestsData as HiringRequest[]);
      setCandidates(candidatesData as Candidate[]);
      setJobTypes(jobTypesData as JobType[]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, newStatus: string) => {
    try {
      const requestRef = doc(db, 'hiring_requests', requestId);
      await updateDoc(requestRef, {
        status: newStatus,
        updated_at: serverTimestamp()
      });
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const filteredRequests = requests.filter(r =>
    r.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.destination_country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.agencies.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCandidates = candidates.filter(c =>
    c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.profession.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredJobTypes = jobTypes.filter(jt =>
    jt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    jt.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    jt.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openJobTypeModal = (jobType?: JobType) => {
    if (jobType) {
      setEditingJobType(jobType);
      setJobTypeForm({
        title: jobType.title,
        description: jobType.description,
        category: jobType.category,
        skills_required: jobType.skills_required.join(', '),
        min_experience_years: jobType.min_experience_years,
        active: jobType.active
      });
    } else {
      setEditingJobType(null);
      setJobTypeForm({
        title: '',
        description: '',
        category: '',
        skills_required: '',
        min_experience_years: 0,
        active: true
      });
    }
    setShowJobTypeModal(true);
  };

  const closeJobTypeModal = () => {
    setShowJobTypeModal(false);
    setEditingJobType(null);
    setJobTypeForm({
      title: '',
      description: '',
      category: '',
      skills_required: '',
      min_experience_years: 0,
      active: true
    });
  };

  const saveJobType = async () => {
    try {
      const jobTypeData = {
        title: jobTypeForm.title,
        description: jobTypeForm.description,
        category: jobTypeForm.category,
        skills_required: jobTypeForm.skills_required.split(',').map(s => s.trim()).filter(s => s),
        min_experience_years: jobTypeForm.min_experience_years,
        active: jobTypeForm.active,
        updated_at: serverTimestamp()
      };

      if (editingJobType) {
        const jobTypeRef = doc(db, 'job_types', editingJobType.id);
        await updateDoc(jobTypeRef, jobTypeData);
      } else {
        await addDoc(collection(db, 'job_types'), {
          ...jobTypeData,
          created_at: serverTimestamp()
        });
      }

      fetchData();
      closeJobTypeModal();
    } catch (error) {
      console.error('Error saving job type:', error);
    }
  };

  const deleteJobType = async (jobTypeId: string) => {
    if (window.confirm('Are you sure you want to delete this job type?')) {
      try {
        await deleteDoc(doc(db, 'job_types', jobTypeId));
        fetchData();
      } catch (error) {
        console.error('Error deleting job type:', error);
      }
    }
  };

  const toggleJobTypeStatus = async (jobTypeId: string, currentStatus: boolean) => {
    try {
      const jobTypeRef = doc(db, 'job_types', jobTypeId);
      await updateDoc(jobTypeRef, {
        active: !currentStatus,
        updated_at: serverTimestamp()
      });
      fetchData();
    } catch (error) {
      console.error('Error updating job type status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-primary/10 text-primary';
      case 'fulfilled':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-secondary/10 text-secondary';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="ml-12 sm:ml-14 w-[98%] px-2 sm:px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <div className="bg-white shadow-lg border border-gray-200">
            <div className="border-b border-gray-300">
              <nav className="flex overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => setActiveTab('requests')}
                  className={`flex-shrink-0 px-3 sm:px-6 py-4 font-semibold border-b-2 transition-colors ${
                    activeTab === 'requests'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base whitespace-nowrap">Hiring Requests</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('candidates')}
                  className={`flex-shrink-0 px-3 sm:px-6 py-4 font-semibold border-b-2 transition-colors ${
                    activeTab === 'candidates'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base whitespace-nowrap">Candidates</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('job-types')}
                  className={`flex-shrink-0 px-3 sm:px-6 py-4 font-semibold border-b-2 transition-colors ${
                    activeTab === 'job-types'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <Briefcase className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base whitespace-nowrap">Job Types</span>
                  </div>
                </button>
              </nav>
            </div>

            <div className="p-4 sm:p-6">
              <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={activeTab === 'requests' ? 'Search requests...' : activeTab === 'candidates' ? 'Search candidates...' : 'Search job types...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm sm:text-base"
                  />
                </div>
                {activeTab === 'job-types' && (
                  <button
                    onClick={() => openJobTypeModal()}
                    className="flex items-center justify-center space-x-2 px-4 py-2 sm:py-3 bg-primary text-white hover:bg-primary/90 transition-colors font-semibold border border-gray-300 text-sm sm:text-base whitespace-nowrap"
                  >
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden xs:inline">Add Job Type</span>
                    <span className="xs:hidden">Add</span>
                  </button>
                )}
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="inline-block animate-spin border border-gray-300 h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2 text-gray-600">Loading...</span>
                </div>
              ) : activeTab === 'requests' ? (
                <div className="space-y-4">
                  {filteredRequests.length === 0 ? (
                    <p className="text-gray-600 text-center py-8">No hiring requests found</p>
                  ) : (
                    filteredRequests.map((request) => (
                      <div key={request.id} className="bg-white border border-gray-300 p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-2">
                          <div className="flex-1">
                            <h3 className="text-base sm:text-lg font-bold text-primary mb-1">
                              {request.quantity}x {request.job_title}
                            </h3>
                            <p className="text-sm text-gray-700">
                              {request.destination_country} • Deadline: {new Date(request.deadline).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-2 sm:px-3 py-1 text-xs font-semibold ${getStatusColor(request.status)} whitespace-nowrap self-start border`}>
                            {request.status.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div className="border-l-4 border-primary pl-4">
                            <p className="text-xs sm:text-sm font-semibold text-primary mb-1">Agency</p>
                            <p className="text-xs sm:text-sm text-gray-900">{request.agencies.name}</p>
                            <p className="text-xs sm:text-sm text-gray-700 break-all">{request.agencies.email}</p>
                            <p className="text-xs sm:text-sm text-gray-700">{request.agencies.phone}</p>
                          </div>
                          <div className="border-l-4 border-secondary pl-4">
                            <p className="text-xs sm:text-sm font-semibold text-secondary mb-1">Salary Range</p>
                            <p className="text-xs sm:text-sm text-gray-900">{request.salary_range}</p>
                          </div>
                        </div>

                        <div className="mb-4 border-l-4 border-gray-400 pl-4">
                          <p className="text-xs sm:text-sm font-semibold text-gray-900 mb-1">Requirements</p>
                          <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">{request.requirements}</p>
                        </div>

                        <div className="flex flex-col xs:flex-row gap-2 xs:space-x-2 xs:space-y-0">
                          <button
                            onClick={() => updateRequestStatus(request.id, 'in_progress')}
                            className="flex-1 xs:flex-none px-3 sm:px-4 py-2 bg-primary text-white hover:bg-primary/90 transition-colors text-xs sm:text-sm font-semibold border border-primary"
                          >
                            <span className="hidden sm:inline">Mark In Progress</span>
                            <span className="sm:hidden">In Progress</span>
                          </button>
                          <button
                            onClick={() => updateRequestStatus(request.id, 'fulfilled')}
                            className="flex-1 xs:flex-none px-3 sm:px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors text-xs sm:text-sm font-semibold border border-green-600"
                          >
                            <span className="hidden sm:inline">Mark Fulfilled</span>
                            <span className="sm:hidden">Fulfilled</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : activeTab === 'candidates' ? (
                <div>
                  {filteredCandidates.length === 0 ? (
                    <p className="text-gray-600 text-center py-8">No candidates found</p>
                  ) : (
                    <div className="space-y-4">
                      {/* Desktop Table View */}
                      <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Name</th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Profession</th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Experience</th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Contact</th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredCandidates.map((candidate) => (
                              <tr key={candidate.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-4 px-4">
                                  <div className="flex items-center space-x-2">
                                    <div className="text-gray-900 font-medium">{candidate.full_name}</div>
                                    {candidate.verified && (
                                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    )}
                                  </div>
                                </td>
                                <td className="py-4 px-4 text-gray-700">{candidate.profession}</td>
                                <td className="py-4 px-4 text-gray-700">{candidate.experience_years} years</td>
                                <td className="py-4 px-4">
                                  <div className="text-sm text-gray-700">{candidate.email}</div>
                                  <div className="text-sm text-gray-600">{candidate.phone}</div>
                                </td>
                                <td className="py-4 px-4">
                                  <span className={`px-3 py-1 text-xs font-semibold border border-gray-300 ${
                                    candidate.available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {candidate.available ? 'Available' : 'Unavailable'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Card View */}
                      <div className="lg:hidden space-y-4">
                        {filteredCandidates.map((candidate) => (
                          <div key={candidate.id} className="bg-white border border-gray-300 p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-medium text-primary">{candidate.full_name}</h3>
                                {candidate.verified && (
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                )}
                              </div>
                              <span className={`px-2 py-1 text-xs font-semibold border ${
                                candidate.available ? 'bg-green-100 text-green-800 border-green-300' : 'bg-gray-100 text-gray-800 border-gray-300'
                              }`}>
                                {candidate.available ? 'Available' : 'Unavailable'}
                              </span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Profession:</span>
                                <span className="text-sm text-gray-900">{candidate.profession}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Experience:</span>
                                <span className="text-sm text-gray-900">{candidate.experience_years} years</span>
                              </div>
                              <div className="flex flex-col space-y-1">
                                <span className="text-sm text-gray-600">Contact:</span>
                                <span className="text-sm text-gray-900 break-all">{candidate.email}</span>
                                <span className="text-sm text-gray-700">{candidate.phone}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredJobTypes.length === 0 ? (
                    <p className="text-gray-600 text-center py-8">No job types found</p>
                  ) : (
                    filteredJobTypes.map((jobType) => (
                      <div key={jobType.id} className="bg-gray-50 p-4 sm:p-6 border border-gray-300">
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4 gap-3">
                          <div className="flex-1">
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">{jobType.title}</h3>
                            <p className="text-xs sm:text-sm text-primary font-medium mb-2">{jobType.category}</p>
                            <p className="text-sm text-gray-700 mb-3 leading-relaxed">{jobType.description}</p>
                            <div className="flex flex-wrap gap-1 sm:gap-2 mb-2">
                              {jobType.skills_required.map((skill, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium border border-blue-200">
                                  {skill}
                                </span>
                              ))}
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600">
                              Minimum Experience: {jobType.min_experience_years} years
                            </p>
                          </div>

                          {/* Desktop Actions */}
                          <div className="hidden lg:flex items-center space-x-2 ml-4">
                            <span className={`px-3 py-1 text-xs font-semibold border border-gray-300 ${
                              jobType.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {jobType.active ? 'Active' : 'Inactive'}
                            </span>
                            <button
                              onClick={() => openJobTypeModal(jobType)}
                              className="p-2 text-gray-600 hover:text-primary transition-colors border border-gray-300 hover:bg-gray-100"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => toggleJobTypeStatus(jobType.id, jobType.active)}
                              className={`px-3 py-1 text-xs font-semibold transition-colors border border-gray-300 ${
                                jobType.active
                                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                  : 'bg-green-100 text-green-800 hover:bg-green-200'
                              }`}
                            >
                              {jobType.active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => deleteJobType(jobType.id)}
                              className="p-2 text-red-600 hover:text-red-700 transition-colors border border-gray-300 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Mobile Actions */}
                          <div className="lg:hidden">
                            <div className="flex items-center justify-between mb-3">
                              <span className={`px-2 py-1 text-xs font-semibold border border-gray-300 ${
                                jobType.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {jobType.active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => openJobTypeModal(jobType)}
                                className="flex items-center space-x-1 px-3 py-1 bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors text-xs border border-gray-300"
                              >
                                <Edit2 className="h-3 w-3" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => toggleJobTypeStatus(jobType.id, jobType.active)}
                                className={`px-3 py-1 text-xs font-semibold transition-colors border border-gray-300 ${
                                  jobType.active
                                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                                }`}
                              >
                                {jobType.active ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                onClick={() => deleteJobType(jobType.id)}
                                className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 transition-colors text-xs border border-gray-300"
                              >
                                <Trash2 className="h-3 w-3" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Job Type Modal */}
      {showJobTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-gray-400 p-4 sm:p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-bold text-primary mb-4 sm:mb-6">
              {editingJobType ? 'Edit Job Type' : 'Add New Job Type'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-primary mb-1">Job Title</label>
                <input
                  type="text"
                  value={jobTypeForm.title}
                  onChange={(e) => setJobTypeForm({ ...jobTypeForm, title: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-400 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
                  placeholder="e.g., Driver, Nurse, Engineer"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={jobTypeForm.category}
                  onChange={(e) => setJobTypeForm({ ...jobTypeForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                  placeholder="e.g., Healthcare, Transportation, IT"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={jobTypeForm.description}
                  onChange={(e) => setJobTypeForm({ ...jobTypeForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none text-sm"
                  placeholder="Brief description of the job role"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Required Skills</label>
                <input
                  type="text"
                  value={jobTypeForm.skills_required}
                  onChange={(e) => setJobTypeForm({ ...jobTypeForm, skills_required: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                  placeholder="Comma-separated skills (e.g., Communication, Time Management)"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Minimum Experience (Years)</label>
                <input
                  type="number"
                  min="0"
                  value={jobTypeForm.min_experience_years}
                  onChange={(e) => setJobTypeForm({ ...jobTypeForm, min_experience_years: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={jobTypeForm.active}
                  onChange={(e) => setJobTypeForm({ ...jobTypeForm, active: e.target.checked })}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="active" className="ml-2 text-xs sm:text-sm text-gray-700">
                  Active (available for talent profiles)
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:space-x-3 mt-6">
              <button
                onClick={saveJobType}
                className="flex-1 bg-primary text-white py-2 px-4 hover:bg-primary/90 transition-colors font-semibold border border-primary text-sm sm:text-base"
              >
                {editingJobType ? 'Update' : 'Create'} Job Type
              </button>
              <button
                onClick={closeJobTypeModal}
                className="flex-1 border-2 border-gray-400 text-gray-700 py-2 px-4 hover:bg-gray-50 transition-colors font-semibold text-sm sm:text-base"
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
