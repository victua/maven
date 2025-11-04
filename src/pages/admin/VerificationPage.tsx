import { useState, useEffect } from 'react';
import { Search, CheckCircle2, XCircle, Clock, User, FileText, Phone, Mail } from 'lucide-react';
import {
  db,
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  serverTimestamp
} from '../../lib/firebase';

interface Candidate {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  profession: string;
  experience_years: number;
  education_level: string;
  date_of_birth: string;
  skills: string[];
  verified: boolean;
  available: boolean;
  created_at: any;
  updated_at: any;
  emergency_contact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export function VerificationPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'verified'>('pending');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    filterCandidates();
  }, [candidates, searchTerm, filterStatus]);

  const fetchCandidates = async () => {
    try {
      const candidatesSnapshot = await getDocs(collection(db, 'candidates'));
      const candidatesData = candidatesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Candidate[];

      // Sort by creation date, newest first
      candidatesData.sort((a, b) => {
        if (!a.created_at || !b.created_at) return 0;
        return new Date(b.created_at.seconds * 1000).getTime() - new Date(a.created_at.seconds * 1000).getTime();
      });

      setCandidates(candidatesData);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCandidates = () => {
    let filtered = candidates;

    // Filter by status
    if (filterStatus === 'pending') {
      filtered = filtered.filter(c => !c.verified);
    } else if (filterStatus === 'verified') {
      filtered = filtered.filter(c => c.verified);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.profession.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCandidates(filtered);
  };

  const updateVerificationStatus = async (candidateId: string, verified: boolean) => {
    setUpdating(candidateId);
    try {
      const candidateRef = doc(db, 'candidates', candidateId);
      await updateDoc(candidateRef, {
        verified: verified,
        updated_at: serverTimestamp()
      });

      // Update local state
      setCandidates(prev => prev.map(c =>
        c.id === candidateId ? { ...c, verified } : c
      ));

      if (selectedCandidate?.id === candidateId) {
        setSelectedCandidate(prev => prev ? { ...prev, verified } : null);
      }
    } catch (error) {
      console.error('Error updating verification status:', error);
      alert('Error updating verification status. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  const getProfileCompleteness = (candidate: Candidate) => {
    const fields = [
      candidate.full_name,
      candidate.phone,
      candidate.date_of_birth,
      candidate.profession,
      candidate.experience_years > 0,
      candidate.education_level,
      candidate.skills.length > 0,
      candidate.emergency_contact.name,
      candidate.emergency_contact.phone
    ];

    const completedFields = fields.filter(field => {
      if (typeof field === 'boolean') return field;
      if (typeof field === 'string') return field.trim() !== '';
      return false;
    }).length;

    return Math.round((completedFields / fields.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin border border-gray-300 h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading candidates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-[96%] ml-auto mr-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Candidate Verification</h1>
          <p className="text-gray-600">Review and verify candidate profiles</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Candidates List */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-300 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Candidates</h3>
              </div>
              <div className="p-4">
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search candidates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                  />
                </div>

                {/* Filter */}
                <div className="mb-4">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as 'all' | 'pending' | 'verified')}
                    className="w-full px-3 py-2 border border-gray-300 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                  >
                    <option value="all">All Candidates</option>
                    <option value="pending">Pending Verification</option>
                    <option value="verified">Verified</option>
                  </select>
                </div>

                {/* Candidates List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredCandidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      onClick={() => setSelectedCandidate(candidate)}
                      className={`p-3 border border-gray-300 border cursor-pointer transition-colors ${
                        selectedCandidate?.id === candidate.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">{candidate.full_name}</h4>
                        <div className="flex items-center space-x-1">
                          {candidate.verified ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-600" />
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">{candidate.profession}</p>
                      <p className="text-xs text-gray-500">{candidate.experience_years} years exp.</p>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 border border-gray-300 h-1.5">
                          <div
                            className="bg-primary h-1.5 border border-gray-300"
                            style={{ width: `${getProfileCompleteness(candidate)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {getProfileCompleteness(candidate)}% complete
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Candidate Details */}
          <div className="lg:col-span-2">
            {selectedCandidate ? (
              <div className="bg-white border border-gray-300 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedCandidate.full_name}
                    </h3>
                    <p className="text-gray-600">{selectedCandidate.profession}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 border border-gray-300 text-sm font-semibold ${
                      selectedCandidate.verified
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedCandidate.verified ? 'Verified' : 'Pending'}
                    </span>
                    <div className="flex space-x-2">
                      {!selectedCandidate.verified && (
                        <button
                          onClick={() => updateVerificationStatus(selectedCandidate.id, true)}
                          disabled={updating === selectedCandidate.id}
                          className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Verify</span>
                        </button>
                      )}
                      {selectedCandidate.verified && (
                        <button
                          onClick={() => updateVerificationStatus(selectedCandidate.id, false)}
                          disabled={updating === selectedCandidate.id}
                          className="flex items-center space-x-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          <XCircle className="h-3 w-3" />
                          <span>Unverify</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Personal Information</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-900">{selectedCandidate.email}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-900">{selectedCandidate.phone}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-900">
                            Born: {new Date(selectedCandidate.date_of_birth).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-900">Education:</span>
                          <span className="ml-2 text-gray-700">{selectedCandidate.education_level}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-900">Experience:</span>
                          <span className="ml-2 text-gray-700">{selectedCandidate.experience_years} years</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-900">Status:</span>
                          <span className={`ml-2 text-sm ${
                            selectedCandidate.available ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {selectedCandidate.available ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  {selectedCandidate.skills.length > 0 && (
                    <div>
                      <h4 className="text-md font-semibold text-gray-900 mb-3">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCandidate.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 text-sm border border-gray-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Emergency Contact */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Emergency Contact</h4>
                    <div className="bg-gray-50 p-4 border border-gray-300">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-900">Name:</span>
                          <span className="ml-2 text-gray-700">{selectedCandidate.emergency_contact.name}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-900">Phone:</span>
                          <span className="ml-2 text-gray-700">{selectedCandidate.emergency_contact.phone}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-900">Relationship:</span>
                          <span className="ml-2 text-gray-700">{selectedCandidate.emergency_contact.relationship}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Profile Statistics */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Profile Statistics</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 border border-gray-300 text-center">
                        <p className="text-2xl font-bold text-gray-900">{getProfileCompleteness(selectedCandidate)}%</p>
                        <p className="text-sm text-gray-600">Profile Complete</p>
                      </div>
                      <div className="bg-gray-50 p-4 border border-gray-300 text-center">
                        <p className="text-2xl font-bold text-gray-900">
                          {selectedCandidate.created_at
                            ? Math.floor((Date.now() - selectedCandidate.created_at.seconds * 1000) / (1000 * 60 * 60 * 24))
                            : 0
                          }
                        </p>
                        <p className="text-sm text-gray-600">Days Since Registration</p>
                      </div>
                      <div className="bg-gray-50 p-4 border border-gray-300 text-center">
                        <p className="text-2xl font-bold text-gray-900">{selectedCandidate.skills.length}</p>
                        <p className="text-sm text-gray-600">Skills Listed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-300 shadow-sm p-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Candidate</h3>
                <p className="text-gray-600">
                  Choose a candidate from the left to review their profile for verification
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}