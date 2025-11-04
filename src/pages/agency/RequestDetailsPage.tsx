import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Calendar, Briefcase, Users, Clock, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  db,
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where
} from '../../lib/firebase';

interface RequestDetailsPageProps {
  onNavigate: (page: string) => void;
  requestId: string;
}

interface HiringRequest {
  id: string;
  job_title: string;
  quantity: number;
  destination_country: string;
  requirements: string;
  salary_range: string;
  deadline: string;
  status: string;
  created_at: any;
  updated_at: any;
}

interface Application {
  id: string;
  candidate_id: string;
  status: string;
  applied_at: any;
  candidate: {
    full_name: string;
    email: string;
    phone: string;
    profession: string;
    experience_years: number;
    verified: boolean;
  };
}

export function RequestDetailsPage({ onNavigate, requestId }: RequestDetailsPageProps) {
  const { agency } = useAuth();
  const [request, setRequest] = useState<HiringRequest | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (requestId && agency) {
      fetchRequestDetails();
    }
  }, [requestId, agency]);

  const fetchRequestDetails = async () => {
    try {
      // Fetch request details
      const requestRef = doc(db, 'hiring_requests', requestId);
      const requestSnap = await getDoc(requestRef);

      if (requestSnap.exists()) {
        setRequest({ id: requestSnap.id, ...requestSnap.data() } as HiringRequest);
      }

      // Fetch applications for this request
      const applicationsRef = collection(db, 'applications');
      const applicationsQuery = query(
        applicationsRef,
        where('hiring_request_id', '==', requestId)
      );
      const applicationsSnapshot = await getDocs(applicationsQuery);

      // Fetch candidate details for each application
      const candidatesSnapshot = await getDocs(collection(db, 'candidates'));
      const candidates = candidatesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const applicationsWithCandidates = applicationsSnapshot.docs.map(doc => {
        const applicationData = { id: doc.id, ...doc.data() };
        const candidate = candidates.find(c => c.id === applicationData.candidate_id);

        return {
          ...applicationData,
          candidate: candidate || {
            full_name: 'Unknown',
            email: 'Unknown',
            phone: 'Unknown',
            profession: 'Unknown',
            experience_years: 0,
            verified: false
          }
        };
      }) as Application[];

      setApplications(applicationsWithCandidates);
    } catch (error) {
      console.error('Error fetching request details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'fulfilled':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin border border-gray-300 h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Not Found</h2>
          <p className="text-gray-600 mb-4">The hiring request you're looking for doesn't exist.</p>
          <button
            onClick={() => onNavigate('agency/dashboard')}
            className="bg-primary text-white px-6 py-2 border border-gray-300 hover:bg-primary/90"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="ml-12 sm:ml-14 w-[98%] px-2 sm:px-4 py-6 sm:py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Request Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-300 shadow-sm p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {request.quantity}x {request.job_title}
                  </h2>
                  <span className={`px-3 py-1 border border-gray-300 text-sm font-semibold ${getStatusColor(request.status)}`}>
                    {request.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <span className="text-gray-900">{request.destination_country}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Briefcase className="h-5 w-5 text-primary" />
                    <span className="text-gray-900">{request.salary_range}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-gray-500" />
                    <span className="text-gray-900">{request.quantity} positions</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <span className="text-gray-900">Deadline: {new Date(request.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{request.requirements}</p>
              </div>
            </div>

            {/* Applications */}
            <div className="bg-white border border-gray-300 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Applications ({applications.length})
              </h3>

              {applications.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No applications yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div key={application.id} className="border border-gray-200 border border-gray-300 p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{application.candidate.full_name}</h4>
                          <p className="text-gray-600">{application.candidate.profession}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {application.candidate.verified && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs border border-gray-300">Verified</span>
                          )}
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs border border-gray-300">
                            {application.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Email: {application.candidate.email}</p>
                          <p className="text-gray-600">Phone: {application.candidate.phone}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Experience: {application.candidate.experience_years} years</p>
                          <p className="text-gray-600">Applied: {new Date(application.applied_at.seconds * 1000).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-300 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Timeline</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Created</p>
                    <p className="text-sm text-gray-600">
                      {new Date(request.created_at.seconds * 1000).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {request.updated_at && (
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Last Updated</p>
                      <p className="text-sm text-gray-600">
                        {new Date(request.updated_at.seconds * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white border border-gray-300 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Applications</span>
                  <span className="font-semibold">{applications.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Verified Candidates</span>
                  <span className="font-semibold">
                    {applications.filter(app => app.candidate.verified).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Positions Remaining</span>
                  <span className="font-semibold">{request.quantity}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}