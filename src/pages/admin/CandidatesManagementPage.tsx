import { useState, useEffect } from 'react';
import { Search, User, Edit2, Trash2, CheckCircle2, XCircle, Clock, Star, Mail, Phone, MapPin, Briefcase, Calendar, Eye, FileText } from 'lucide-react';
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

interface Candidate {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  profession: string;
  experience_years?: number;
  skills?: string[];
  location?: string;
  preferred_locations?: string[];
  salary_expectation?: string;
  availability?: string;
  verified: boolean;
  available: boolean;
  rating?: number;
  notes?: string;
  source?: string;
  applied_role_id?: string;
  status?: 'pending' | 'active' | 'placed' | 'rejected' | 'on_hold';
  created_at?: any;
  updated_at?: any;
  last_contact?: any;
}

export function CandidatesManagementPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterVerified, setFilterVerified] = useState<string>('all');
  const [filterAvailable, setFilterAvailable] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterExperience, setFilterExperience] = useState<string>('all');

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      // Fetch from both candidates and talent_profiles collections
      const candidatesRef = collection(db, 'candidates');
      const candidatesQuery = query(candidatesRef, orderBy('created_at', 'desc'));
      const candidatesSnapshot = await getDocs(candidatesQuery);

      const talentProfilesRef = collection(db, 'talent_profiles');
      const talentProfilesQuery = query(talentProfilesRef, orderBy('created_at', 'desc'));
      const talentProfilesSnapshot = await getDocs(talentProfilesQuery);

      // Process legacy candidates
      const legacyCandidates = candidatesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        source: 'legacy',
        created_at: doc.data().created_at?.toDate(),
        updated_at: doc.data().updated_at?.toDate(),
        last_contact: doc.data().last_contact?.toDate()
      })) as Candidate[];

      // Process talent profiles (from new registration)
      const talentProfiles = talentProfilesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          full_name: `${data.personal_info?.first_name || ''} ${data.personal_info?.last_name || ''}`.trim(),
          email: data.personal_info?.email || '',
          phone: data.personal_info?.phone || '',
          profession: data.professional_info?.current_title || '',
          experience_years: data.professional_info?.experience_years || 0,
          skills: data.professional_info?.skills || [],
          location: data.personal_info?.current_location || '',
          preferred_locations: data.personal_info?.preferred_locations || [],
          salary_expectation: data.professional_info?.salary_expectation || '',
          availability: data.professional_info?.availability || '',
          verified: false,
          available: true,
          rating: data.rating || 0,
          notes: data.notes || '',
          source: data.source || 'website_application',
          applied_role_id: data.applied_role_id || '',
          status: data.status || 'pending',
          created_at: data.created_at?.toDate(),
          updated_at: data.updated_at?.toDate()
        };
      }) as Candidate[];

      const allCandidates = [...legacyCandidates, ...talentProfiles];
      setCandidates(allCandidates);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch =
      candidate.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.profession?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesVerified = filterVerified === 'all' ||
      (filterVerified === 'verified' && candidate.verified) ||
      (filterVerified === 'unverified' && !candidate.verified);

    const matchesAvailable = filterAvailable === 'all' ||
      (filterAvailable === 'available' && candidate.available) ||
      (filterAvailable === 'unavailable' && !candidate.available);

    const matchesStatus = filterStatus === 'all' || candidate.status === filterStatus;

    const matchesExperience = filterExperience === 'all' ||
      (filterExperience === 'entry' && (candidate.experience_years || 0) <= 2) ||
      (filterExperience === 'mid' && (candidate.experience_years || 0) >= 3 && (candidate.experience_years || 0) <= 7) ||
      (filterExperience === 'senior' && (candidate.experience_years || 0) >= 8);

    return matchesSearch && matchesVerified && matchesAvailable && matchesStatus && matchesExperience;
  });

  const updateCandidateVerification = async (candidateId: string, verified: boolean) => {
    try {
      const collection_name = candidates.find(c => c.id === candidateId)?.source === 'legacy' ? 'candidates' : 'talent_profiles';
      const candidateRef = doc(db, collection_name, candidateId);
      await updateDoc(candidateRef, {
        verified: verified,
        updated_at: serverTimestamp()
      });
      fetchCandidates();
    } catch (error) {
      console.error('Error updating candidate verification:', error);
    }
  };

  const updateCandidateStatus = async (candidateId: string, status: string) => {
    try {
      const collection_name = candidates.find(c => c.id === candidateId)?.source === 'legacy' ? 'candidates' : 'talent_profiles';
      const candidateRef = doc(db, collection_name, candidateId);
      await updateDoc(candidateRef, {
        status: status,
        updated_at: serverTimestamp()
      });
      fetchCandidates();
    } catch (error) {
      console.error('Error updating candidate status:', error);
    }
  };

  const updateCandidateRating = async (candidateId: string, rating: number) => {
    try {
      const collection_name = candidates.find(c => c.id === candidateId)?.source === 'legacy' ? 'candidates' : 'talent_profiles';
      const candidateRef = doc(db, collection_name, candidateId);
      await updateDoc(candidateRef, {
        rating: rating,
        updated_at: serverTimestamp()
      });
      fetchCandidates();
    } catch (error) {
      console.error('Error updating candidate rating:', error);
    }
  };

  const updateCandidateNotes = async (candidateId: string, notes: string) => {
    try {
      const collection_name = candidates.find(c => c.id === candidateId)?.source === 'legacy' ? 'candidates' : 'talent_profiles';
      const candidateRef = doc(db, collection_name, candidateId);
      await updateDoc(candidateRef, {
        notes: notes,
        updated_at: serverTimestamp(),
        last_contact: serverTimestamp()
      });
      fetchCandidates();
    } catch (error) {
      console.error('Error updating candidate notes:', error);
    }
  };

  const deleteCandidate = async (candidateId: string) => {
    if (window.confirm('Are you sure you want to delete this candidate? This action cannot be undone.')) {
      try {
        const collection_name = candidates.find(c => c.id === candidateId)?.source === 'legacy' ? 'candidates' : 'talent_profiles';
        await deleteDoc(doc(db, collection_name, candidateId));
        fetchCandidates();
      } catch (error) {
        console.error('Error deleting candidate:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'placed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'on_hold':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getVerificationIcon = (verified: boolean) => {
    return verified ? (
      <CheckCircle2 className="h-4 w-4 text-green-600" />
    ) : (
      <Clock className="h-4 w-4 text-yellow-600" />
    );
  };

  const renderStars = (rating: number, candidateId: string) => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        onClick={() => updateCandidateRating(candidateId, i + 1)}
        className="hover:scale-110 transition-transform"
      >
        <Star
          className={`h-4 w-4 ${
            i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      </button>
    ));
  };

  const openDetailsModal = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setShowDetailsModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="ml-12 sm:ml-14 w-[98%] px-2 sm:px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">Candidates Management</h1>
          <p className="text-gray-600">Manage talent candidates and applications</p>
        </div>

        <div className="bg-white shadow-lg border border-gray-200">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search candidates by name, email, profession, skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm sm:text-base"
                  />
                </div>
                <select
                  value={filterVerified}
                  onChange={(e) => setFilterVerified(e.target.value)}
                  className="px-4 py-2 sm:py-3 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm sm:text-base"
                >
                  <option value="all">All Verification</option>
                  <option value="verified">Verified</option>
                  <option value="unverified">Unverified</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 sm:py-3 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm sm:text-base"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="placed">Placed</option>
                  <option value="rejected">Rejected</option>
                  <option value="on_hold">On Hold</option>
                </select>
                <select
                  value={filterExperience}
                  onChange={(e) => setFilterExperience(e.target.value)}
                  className="px-4 py-2 sm:py-3 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm sm:text-base"
                >
                  <option value="all">All Experience</option>
                  <option value="entry">Entry (0-2 years)</option>
                  <option value="mid">Mid (3-7 years)</option>
                  <option value="senior">Senior (8+ years)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="inline-block animate-spin border border-gray-300 h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-gray-600">Loading candidates...</span>
              </div>
            ) : filteredCandidates.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-2">No candidates found</p>
                <p className="text-gray-500">Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Desktop Table View */}
                <div className="hidden xl:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Candidate</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Contact</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Professional</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Rating</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCandidates.map((candidate) => (
                        <tr key={candidate.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-purple-100 border border-gray-300 flex items-center justify-center">
                                <User className="h-5 w-5 text-purple-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{candidate.full_name}</div>
                                <div className="text-sm text-gray-500 flex items-center space-x-2">
                                  {getVerificationIcon(candidate.verified)}
                                  <span>{candidate.verified ? 'Verified' : 'Pending'}</span>
                                  {candidate.source && (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                      {candidate.source === 'legacy' ? 'Legacy' : 'Website'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm">
                              <div className="flex items-center space-x-1 text-gray-900">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span>{candidate.email}</span>
                              </div>
                              {candidate.phone && (
                                <div className="flex items-center space-x-1 text-gray-600 mt-1">
                                  <Phone className="h-4 w-4 text-gray-400" />
                                  <span>{candidate.phone}</span>
                                </div>
                              )}
                              {candidate.location && (
                                <div className="flex items-center space-x-1 text-gray-600 mt-1">
                                  <MapPin className="h-4 w-4 text-gray-400" />
                                  <span>{candidate.location}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm">
                              <div className="flex items-center space-x-1 text-gray-900">
                                <Briefcase className="h-4 w-4 text-gray-400" />
                                <span>{candidate.profession}</span>
                              </div>
                              {candidate.experience_years !== undefined && (
                                <div className="text-gray-600 mt-1">
                                  {candidate.experience_years} years experience
                                </div>
                              )}
                              {candidate.availability && (
                                <div className="text-gray-600 mt-1 capitalize">
                                  Available: {candidate.availability.replace('_', ' ')}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <span className={`px-3 py-1 text-xs font-semibold border ${getStatusColor(candidate.status || 'pending')}`}>
                                {candidate.status || 'pending'}
                              </span>
                              <div className={`text-xs ${candidate.available ? 'text-green-600' : 'text-gray-600'}`}>
                                {candidate.available ? 'Available' : 'Unavailable'}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-1">
                              {renderStars(candidate.rating || 0, candidate.id)}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => openDetailsModal(candidate)}
                                className="p-2 text-gray-600 hover:text-primary transition-colors border border-gray-300 hover:bg-gray-100"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => updateCandidateVerification(candidate.id, !candidate.verified)}
                                className={`px-3 py-1 text-xs font-semibold transition-colors border ${
                                  candidate.verified
                                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300'
                                    : 'bg-green-100 text-green-800 hover:bg-green-200 border-green-300'
                                }`}
                              >
                                {candidate.verified ? 'Unverify' : 'Verify'}
                              </button>
                              <select
                                value={candidate.status || 'pending'}
                                onChange={(e) => updateCandidateStatus(candidate.id, e.target.value)}
                                className="text-xs border border-gray-300 rounded px-2 py-1"
                              >
                                <option value="pending">Pending</option>
                                <option value="active">Active</option>
                                <option value="placed">Placed</option>
                                <option value="rejected">Rejected</option>
                                <option value="on_hold">On Hold</option>
                              </select>
                              <button
                                onClick={() => deleteCandidate(candidate.id)}
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
                  {filteredCandidates.map((candidate) => (
                    <div key={candidate.id} className="bg-gray-50 border border-gray-300 p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-purple-100 border border-gray-300 flex items-center justify-center">
                          <User className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{candidate.full_name}</h3>
                          <p className="text-sm text-gray-500">{candidate.profession}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center space-x-1">
                            {getVerificationIcon(candidate.verified)}
                            <span className="text-xs">{candidate.verified ? 'Verified' : 'Pending'}</span>
                          </div>
                          <span className={`px-2 py-1 text-xs font-semibold border ${getStatusColor(candidate.status || 'pending')}`}>
                            {candidate.status || 'pending'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center space-x-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900">{candidate.email}</span>
                        </div>
                        {candidate.phone && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">{candidate.phone}</span>
                          </div>
                        )}
                        {candidate.location && (
                          <div className="flex items-center space-x-2 text-sm">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">{candidate.location}</span>
                          </div>
                        )}
                        {candidate.experience_years !== undefined && (
                          <div className="text-sm text-gray-600">
                            <strong>Experience:</strong> {candidate.experience_years} years
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Rating:</span>
                          <div className="flex items-center space-x-1">
                            {renderStars(candidate.rating || 0, candidate.id)}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => openDetailsModal(candidate)}
                          className="flex items-center space-x-1 px-3 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors text-sm border border-gray-300"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Details</span>
                        </button>
                        <button
                          onClick={() => updateCandidateVerification(candidate.id, !candidate.verified)}
                          className={`px-3 py-2 text-sm font-semibold transition-colors border ${
                            candidate.verified
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300'
                              : 'bg-green-100 text-green-800 hover:bg-green-200 border-green-300'
                          }`}
                        >
                          {candidate.verified ? 'Unverify' : 'Verify'}
                        </button>
                        <select
                          value={candidate.status || 'pending'}
                          onChange={(e) => updateCandidateStatus(candidate.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-3 py-2"
                        >
                          <option value="pending">Pending</option>
                          <option value="active">Active</option>
                          <option value="placed">Placed</option>
                          <option value="rejected">Rejected</option>
                          <option value="on_hold">On Hold</option>
                        </select>
                        <button
                          onClick={() => deleteCandidate(candidate.id)}
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

      {/* Candidate Details Modal */}
      {showDetailsModal && selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-gray-400 p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-primary">
                {selectedCandidate.full_name}
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{selectedCandidate.email}</span>
                    </div>
                    {selectedCandidate.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{selectedCandidate.phone}</span>
                      </div>
                    )}
                    {selectedCandidate.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{selectedCandidate.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Professional Information</h3>
                  <div className="space-y-2">
                    <div><strong>Position:</strong> {selectedCandidate.profession}</div>
                    {selectedCandidate.experience_years !== undefined && (
                      <div><strong>Experience:</strong> {selectedCandidate.experience_years} years</div>
                    )}
                    {selectedCandidate.salary_expectation && (
                      <div><strong>Salary Expectation:</strong> {selectedCandidate.salary_expectation}</div>
                    )}
                    {selectedCandidate.availability && (
                      <div><strong>Availability:</strong> {selectedCandidate.availability.replace('_', ' ')}</div>
                    )}
                  </div>
                </div>

                {selectedCandidate.skills && selectedCandidate.skills.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.skills.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium border border-blue-200">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCandidate.preferred_locations && selectedCandidate.preferred_locations.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Preferred Locations</h3>
                    <div className="space-y-1">
                      {selectedCandidate.preferred_locations.map((location, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{location}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Status & Rating</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span>Status:</span>
                      <span className={`px-3 py-1 text-xs font-semibold border ${getStatusColor(selectedCandidate.status || 'pending')}`}>
                        {selectedCandidate.status || 'pending'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>Verification:</span>
                      {getVerificationIcon(selectedCandidate.verified)}
                      <span>{selectedCandidate.verified ? 'Verified' : 'Pending'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>Rating:</span>
                      <div className="flex items-center space-x-1">
                        {renderStars(selectedCandidate.rating || 0, selectedCandidate.id)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>Available:</span>
                      <span className={`px-2 py-1 text-xs font-semibold ${
                        selectedCandidate.available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedCandidate.available ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Application Details</h3>
                  <div className="space-y-2">
                    <div><strong>Source:</strong> {selectedCandidate.source === 'legacy' ? 'Legacy System' : 'Website Application'}</div>
                    {selectedCandidate.applied_role_id && (
                      <div><strong>Applied Role ID:</strong> {selectedCandidate.applied_role_id}</div>
                    )}
                    {selectedCandidate.created_at && (
                      <div><strong>Applied:</strong> {selectedCandidate.created_at.toLocaleDateString()}</div>
                    )}
                    {selectedCandidate.last_contact && (
                      <div><strong>Last Contact:</strong> {selectedCandidate.last_contact.toLocaleDateString()}</div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
                  <textarea
                    value={selectedCandidate.notes || ''}
                    onChange={(e) => {
                      setSelectedCandidate({
                        ...selectedCandidate,
                        notes: e.target.value
                      });
                    }}
                    onBlur={(e) => updateCandidateNotes(selectedCandidate.id, e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none text-sm"
                    placeholder="Add notes about this candidate..."
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}