import { useState, useEffect } from 'react';
import { Search, Users, Briefcase, CheckCircle2, XCircle, Send } from 'lucide-react';
import {
  db,
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp
} from '../../lib/firebase';

interface HiringRequest {
  id: string;
  job_title: string;
  quantity: number;
  destination_country: string;
  requirements: string;
  salary_range: string;
  deadline: string;
  status: string;
  agency_id: string;
  agency?: { name: string };
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

export function MatchingPage() {
  const [requests, setRequests] = useState<HiringRequest[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<HiringRequest | null>(null);
  const [matchedCandidates, setMatchedCandidates] = useState<Candidate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedRequest) {
      findMatches();
    }
  }, [selectedRequest, candidates]);

  const fetchData = async () => {
    try {
      // Fetch pending/in-progress requests
      const requestsSnapshot = await getDocs(collection(db, 'hiring_requests'));
      const requestsData = requestsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(req => req.status === 'pending' || req.status === 'in_progress') as HiringRequest[];

      // Fetch agencies
      const agenciesSnapshot = await getDocs(collection(db, 'agencies'));
      const agencies = agenciesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Add agency names to requests
      const requestsWithAgencies = requestsData.map(req => ({
        ...req,
        agency: agencies.find(a => a.id === req.agency_id)
      }));

      // Fetch available candidates
      const candidatesSnapshot = await getDocs(collection(db, 'candidates'));
      const candidatesData = candidatesSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(candidate => candidate.verified && candidate.available) as Candidate[];

      setRequests(requestsWithAgencies);
      setCandidates(candidatesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const findMatches = () => {
    if (!selectedRequest) return;

    const matches = candidates.filter(candidate => {
      // Match by profession
      const professionMatch = candidate.profession.toLowerCase().includes(
        selectedRequest.job_title.toLowerCase()
      ) || selectedRequest.job_title.toLowerCase().includes(
        candidate.profession.toLowerCase()
      );

      // Match by skills (basic keyword matching)
      const skillsMatch = candidate.skills.some(skill =>
        selectedRequest.requirements.toLowerCase().includes(skill.toLowerCase())
      );

      // Basic matching logic
      return professionMatch || skillsMatch;
    });

    // Sort by experience and verification status
    const sortedMatches = matches.sort((a, b) => {
      if (a.verified && !b.verified) return -1;
      if (!a.verified && b.verified) return 1;
      return b.experience_years - a.experience_years;
    });

    setMatchedCandidates(sortedMatches);
  };

  const recommendCandidate = async (candidateId: string) => {
    if (!selectedRequest) return;

    setMatching(true);
    try {
      await addDoc(collection(db, 'recommendations'), {
        hiring_request_id: selectedRequest.id,
        candidate_id: candidateId,
        agency_id: selectedRequest.agency_id,
        status: 'recommended',
        recommended_by: 'admin',
        created_at: serverTimestamp()
      });

      alert('Candidate recommended successfully!');
      // Remove candidate from matches after recommendation
      setMatchedCandidates(prev => prev.filter(c => c.id !== candidateId));
    } catch (error) {
      console.error('Error recommending candidate:', error);
      alert('Error sending recommendation. Please try again.');
    } finally {
      setMatching(false);
    }
  };

  const filteredRequests = requests.filter(req =>
    req.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.destination_country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.agency?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin border border-gray-300 h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading matching data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-[96%] ml-auto mr-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Candidate Matching</h1>
          <p className="text-gray-600">Match qualified candidates to hiring requests</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Hiring Requests */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-300 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Active Requests</h3>
              </div>
              <div className="p-4">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search requests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                  />
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredRequests.map((request) => (
                    <div
                      key={request.id}
                      onClick={() => setSelectedRequest(request)}
                      className={`p-3 border border-gray-300 border cursor-pointer transition-colors ${
                        selectedRequest?.id === request.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {request.quantity}x {request.job_title}
                        </h4>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs border border-gray-300">
                          {request.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{request.agency?.name}</p>
                      <p className="text-xs text-gray-500">{request.destination_country}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Matched Candidates */}
          <div className="lg:col-span-2">
            {selectedRequest ? (
              <div className="bg-white border border-gray-300 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Matched Candidates for {selectedRequest.job_title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {matchedCandidates.length} candidates found
                  </p>
                </div>
                <div className="p-6">
                  {matchedCandidates.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No Matches Found</h4>
                      <p className="text-gray-600">
                        No candidates match the requirements for this position.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {matchedCandidates.map((candidate) => (
                        <div key={candidate.id} className="border border-gray-200 border border-gray-300 p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                                <span>{candidate.full_name}</span>
                                {candidate.verified && (
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                )}
                              </h4>
                              <p className="text-gray-600">{candidate.profession}</p>
                            </div>
                            <button
                              onClick={() => recommendCandidate(candidate.id)}
                              disabled={matching}
                              className="flex items-center space-x-1 bg-primary text-white px-3 py-1 rounded text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                              <Send className="h-3 w-3" />
                              <span>Recommend</span>
                            </button>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-sm text-gray-600">Email: {candidate.email}</p>
                              <p className="text-sm text-gray-600">Phone: {candidate.phone}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                Experience: {candidate.experience_years} years
                              </p>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs border border-gray-300 ${
                                  candidate.available
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {candidate.available ? 'Available' : 'Unavailable'}
                                </span>
                                {candidate.verified && (
                                  <span className="px-2 py-1 text-xs border border-gray-300 bg-blue-100 text-blue-800">
                                    Verified
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {candidate.skills.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-900 mb-1">Skills:</p>
                              <div className="flex flex-wrap gap-1">
                                {candidate.skills.slice(0, 5).map((skill, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                                  >
                                    {skill}
                                  </span>
                                ))}
                                {candidate.skills.length > 5 && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                    +{candidate.skills.length - 5} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-300 shadow-sm p-12 text-center">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Hiring Request</h3>
                <p className="text-gray-600">
                  Choose a hiring request from the left to see matched candidates
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}