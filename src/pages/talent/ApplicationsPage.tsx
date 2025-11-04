import { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle2, XCircle, MapPin, Briefcase, Calendar, Building, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  db,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp
} from '../../lib/firebase';

interface ApplicationsPageProps {
  onNavigate: (page: string) => void;
}

interface Application {
  id: string;
  hiring_request_id: string;
  candidate_id: string;
  status: 'applied' | 'under_review' | 'interview_scheduled' | 'accepted' | 'rejected' | 'withdrawn';
  applied_at: any;
  updated_at: any;
  notes?: string;
  hiring_request: {
    job_title: string;
    quantity: number;
    destination_country: string;
    salary_range: string;
    deadline: string;
    requirements: string;
    agency: {
      name: string;
      email: string;
    };
  };
}

interface HiringRequest {
  id: string;
  job_title: string;
  quantity: number;
  destination_country: string;
  salary_range: string;
  deadline: string;
  requirements: string;
  status: string;
  agency_id: string;
  agency?: {
    name: string;
    email: string;
  };
}

export function ApplicationsPage({ onNavigate }: ApplicationsPageProps) {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [availableJobs, setAvailableJobs] = useState<HiringRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'my-applications' | 'available-jobs'>('my-applications');
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch user's applications
      const applicationsRef = collection(db, 'applications');
      const applicationsQuery = query(
        applicationsRef,
        where('candidate_id', '==', user.uid),
        orderBy('applied_at', 'desc')
      );
      const applicationsSnapshot = await getDocs(applicationsQuery);

      // Fetch hiring requests and agencies to populate application details
      const hiringRequestsSnapshot = await getDocs(collection(db, 'hiring_requests'));
      const hiringRequests = hiringRequestsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const agenciesSnapshot = await getDocs(collection(db, 'agencies'));
      const agencies = agenciesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const applicationsWithDetails = applicationsSnapshot.docs.map(doc => {
        const applicationData = { id: doc.id, ...doc.data() };
        const hiringRequest = hiringRequests.find(hr => hr.id === applicationData.hiring_request_id);
        const agency = agencies.find(a => a.id === hiringRequest?.agency_id);

        return {
          ...applicationData,
          hiring_request: {
            ...hiringRequest,
            agency: agency ? { name: agency.name, email: agency.email } : { name: 'Unknown Agency', email: '' }
          }
        };
      }) as Application[];

      // Fetch available jobs (not applied to)
      const appliedRequestIds = applicationsWithDetails.map(app => app.hiring_request_id);
      const availableRequests = hiringRequests
        .filter(hr =>
          hr.status === 'pending' || hr.status === 'in_progress' &&
          !appliedRequestIds.includes(hr.id) &&
          new Date(hr.deadline) > new Date()
        )
        .map(hr => {
          const agency = agencies.find(a => a.id === hr.agency_id);
          return {
            ...hr,
            agency: agency ? { name: agency.name, email: agency.email } : { name: 'Unknown Agency', email: '' }
          };
        }) as HiringRequest[];

      setApplications(applicationsWithDetails);
      setAvailableJobs(availableRequests);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyToJob = async (hiringRequestId: string) => {
    if (!user) return;

    setApplying(hiringRequestId);
    try {
      await addDoc(collection(db, 'applications'), {
        hiring_request_id: hiringRequestId,
        candidate_id: user.uid,
        status: 'applied',
        applied_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });

      // Refresh data to show new application
      fetchData();
      setActiveTab('my-applications');
    } catch (error) {
      console.error('Error applying to job:', error);
      alert('Error submitting application. Please try again.');
    } finally {
      setApplying(null);
    }
  };

  const withdrawApplication = async (applicationId: string) => {
    if (window.confirm('Are you sure you want to withdraw this application?')) {
      try {
        const applicationRef = doc(db, 'applications', applicationId);
        await updateDoc(applicationRef, {
          status: 'withdrawn',
          updated_at: serverTimestamp()
        });
        fetchData();
      } catch (error) {
        console.error('Error withdrawing application:', error);
        alert('Error withdrawing application. Please try again.');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-100 text-blue-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'interview_scheduled':
        return 'bg-purple-100 text-purple-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied':
        return <Clock className="h-4 w-4" />;
      case 'under_review':
        return <FileText className="h-4 w-4" />;
      case 'interview_scheduled':
        return <Calendar className="h-4 w-4" />;
      case 'accepted':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'withdrawn':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin border border-gray-300 h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="ml-12 sm:ml-14 w-[98%] px-2 sm:px-4 py-6 sm:py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="bg-white shadow-sm border border-gray-300">
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('my-applications')}
                  className={`px-6 py-4 font-semibold border-b-2 transition-colors ${
                    activeTab === 'my-applications'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>My Applications ({applications.length})</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('available-jobs')}
                  className={`px-6 py-4 font-semibold border-b-2 transition-colors ${
                    activeTab === 'available-jobs'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Building className="h-5 w-5" />
                    <span>Available Jobs ({availableJobs.length})</span>
                  </div>
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* My Applications Tab */}
        {activeTab === 'my-applications' && (
          <div className="space-y-4">
            {applications.length === 0 ? (
              <div className="bg-white border border-gray-300 shadow-sm p-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
                <p className="text-gray-600 mb-4">Start applying to job opportunities to see them here</p>
                <button
                  onClick={() => setActiveTab('available-jobs')}
                  className="bg-primary text-white px-6 py-2 border border-gray-300 hover:bg-primary/90 transition-colors"
                >
                  Browse Available Jobs
                </button>
              </div>
            ) : (
              applications.map((application) => (
                <div key={application.id} className="bg-white border border-gray-300 shadow-sm p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {application.hiring_request.job_title}
                      </h3>
                      <p className="text-gray-600">{application.hiring_request.agency.name}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 border border-gray-300 text-xs font-semibold flex items-center space-x-1 ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                        <span>{application.status.replace('_', ' ')}</span>
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{application.hiring_request.destination_country}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Briefcase className="h-4 w-4 text-primary" />
                      <span className="text-sm text-gray-700">{application.hiring_request.salary_range}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        Applied: {new Date(application.applied_at.seconds * 1000).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-900 mb-1">Requirements</p>
                    <p className="text-sm text-gray-700 line-clamp-2">{application.hiring_request.requirements}</p>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Deadline: {new Date(application.hiring_request.deadline).toLocaleDateString()}
                    </span>
                    {application.status === 'applied' && (
                      <button
                        onClick={() => withdrawApplication(application.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Withdraw Application
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Available Jobs Tab */}
        {activeTab === 'available-jobs' && (
          <div className="space-y-4">
            {availableJobs.length === 0 ? (
              <div className="bg-white border border-gray-300 shadow-sm p-12 text-center">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Available Jobs</h3>
                <p className="text-gray-600">Check back later for new job opportunities</p>
              </div>
            ) : (
              availableJobs.map((job) => (
                <div key={job.id} className="bg-white border border-gray-300 shadow-sm p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {job.quantity}x {job.job_title}
                      </h3>
                      <p className="text-gray-600">{job.agency?.name}</p>
                    </div>
                    <span className="px-3 py-1 border border-gray-300 text-xs font-semibold bg-green-100 text-green-800">
                      Open
                    </span>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{job.destination_country}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Briefcase className="h-4 w-4 text-primary" />
                      <span className="text-sm text-gray-700">{job.salary_range}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        Deadline: {new Date(job.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-900 mb-1">Requirements</p>
                    <p className="text-sm text-gray-700 line-clamp-3">{job.requirements}</p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => applyToJob(job.id)}
                      disabled={applying === job.id}
                      className="bg-primary text-white px-6 py-2 border border-gray-300 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {applying === job.id ? 'Applying...' : 'Apply Now'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}