import { useState, useEffect } from 'react';
import { LogOut, Plus, FileText, Users, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  db,
  collection,
  getDocs,
  query,
  where,
  orderBy
} from '../../lib/firebase';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
}

interface HiringRequest {
  id: string;
  job_title: string;
  quantity: number;
  destination_country: string;
  status: string;
  deadline: string;
  created_at: string;
}

interface Placement {
  id: string;
  status: string;
  placement_fee: number | null;
  hiring_requests: {
    job_title: string;
  };
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { user, agency, signOut } = useAuth();
  const [hiringRequests, setHiringRequests] = useState<HiringRequest[]>([]);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (agency) {
      fetchData();
    }
  }, [agency]);

  const fetchData = async () => {
    if (!agency) return;

    try {
      // Fetch hiring requests
      const requestsRef = collection(db, 'hiring_requests');
      const requestsQuery = query(
        requestsRef,
        where('agency_id', '==', agency.id),
        orderBy('created_at', 'desc')
      );
      const requestsSnapshot = await getDocs(requestsQuery);
      const requestsData = requestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HiringRequest[];

      // Fetch placements with hiring request data
      const placementsRef = collection(db, 'placements');
      const placementsQuery = query(
        placementsRef,
        where('agency_id', '==', agency.id)
      );
      const placementsSnapshot = await getDocs(placementsQuery);

      const placementsPromises = placementsSnapshot.docs.map(async (docSnapshot) => {
        const placementData = { id: docSnapshot.id, ...docSnapshot.data() } as any;

        // Get the hiring request data for this placement
        const hiringRequest = requestsData.find(r => r.id === placementData.hiring_request_id);
        if (hiringRequest) {
          placementData.hiring_requests = {
            job_title: hiringRequest.job_title
          };
        }

        return placementData;
      });

      const placementsData = await Promise.all(placementsPromises);

      setHiringRequests(requestsData);
      setPlacements(placementsData as Placement[]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onNavigate('home');
  };

  const stats = {
    totalRequests: hiringRequests.length,
    pending: hiringRequests.filter(r => r.status === 'pending').length,
    inProgress: hiringRequests.filter(r => r.status === 'in_progress').length,
    fulfilled: hiringRequests.filter(r => r.status === 'fulfilled').length,
    placements: placements.length
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

  if (!user || !agency) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="ml-12 sm:ml-14 w-[98%] px-2 sm:px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <div className="bg-primary border-2 border-primary p-4 sm:p-6 text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold mb-1">Welcome back, {agency.name}</h2>
                <p className="text-sm sm:text-base text-white/90">
                  Subscription: <span className="font-bold capitalize">{agency.subscription_tier}</span>
                  {' '} • Status: <span className="font-bold capitalize">{agency.subscription_status}</span>
                </p>
              </div>
              <button
                onClick={() => onNavigate('agency/new-request')}
                className="w-full sm:w-auto bg-white text-primary px-4 sm:px-6 py-2 sm:py-3 border-2 border-white hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center space-x-2"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base">New Request</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white border-2 border-gray-400 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-primary">{stats.totalRequests}</p>
            <p className="text-gray-700 text-xs sm:text-sm font-medium">Total Requests</p>
          </div>

          <div className="bg-white shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
            <p className="text-gray-600 text-sm">Pending</p>
          </div>

          <div className="bg-white shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.inProgress}</p>
            <p className="text-gray-600 text-sm">In Progress</p>
          </div>

          <div className="bg-white shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.fulfilled}</p>
            <p className="text-gray-600 text-sm">Fulfilled</p>
          </div>

          <div className="bg-white shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.placements}</p>
            <p className="text-gray-600 text-sm">Placements</p>
          </div>
        </div>

        <div className="bg-white shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Recent Hiring Requests</h3>
          </div>
          <div className="p-6">
            {loading ? (
              <p className="text-gray-600 text-center py-8">Loading...</p>
            ) : hiringRequests.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No hiring requests yet</p>
                <button
                  onClick={() => onNavigate('agency/new-request')}
                  className="bg-primary text-white px-6 py-2 hover:bg-primary/90 transition-colors"
                >
                  Create Your First Request
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Position</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Quantity</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Destination</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Deadline</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hiringRequests.map((request) => (
                      <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 text-gray-900 font-medium">{request.job_title}</td>
                        <td className="py-4 px-4 text-gray-700">{request.quantity}</td>
                        <td className="py-4 px-4 text-gray-700">{request.destination_country}</td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 text-xs font-semibold ${getStatusColor(request.status)}`}>
                            {request.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-700">
                          {new Date(request.deadline).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 text-gray-700">
                          {new Date(request.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
