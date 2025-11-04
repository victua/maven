import { useState, useEffect } from 'react';
import { FileText, Users, Briefcase, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  db,
  collection,
  getDocs,
  query,
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
  agency_id: string;
}

interface Candidate {
  id: string;
  full_name: string;
  profession: string;
  verified: boolean;
  available: boolean;
}

interface Agency {
  id: string;
  name: string;
  subscription_tier: string;
  subscription_status: string;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { user, userProfile } = useAuth();
  const [hiringRequests, setHiringRequests] = useState<HiringRequest[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch all hiring requests
      const requestsRef = collection(db, 'hiring_requests');
      const requestsQuery = query(requestsRef, orderBy('created_at', 'desc'));
      const requestsSnapshot = await getDocs(requestsQuery);
      const requestsData = requestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HiringRequest[];

      // Fetch all candidates
      const candidatesRef = collection(db, 'candidates');
      const candidatesSnapshot = await getDocs(candidatesRef);
      const candidatesData = candidatesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Candidate[];

      // Fetch all agencies
      const agenciesRef = collection(db, 'agencies');
      const agenciesSnapshot = await getDocs(agenciesRef);
      const agenciesData = agenciesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Agency[];

      setHiringRequests(requestsData);
      setCandidates(candidatesData);
      setAgencies(agenciesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalRequests: hiringRequests.length,
    pending: hiringRequests.filter(r => r.status === 'pending').length,
    inProgress: hiringRequests.filter(r => r.status === 'in_progress').length,
    fulfilled: hiringRequests.filter(r => r.status === 'fulfilled').length,
    totalCandidates: candidates.length,
    verifiedCandidates: candidates.filter(c => c.verified).length,
    availableCandidates: candidates.filter(c => c.available).length,
    totalAgencies: agencies.length,
    activeAgencies: agencies.filter(a => a.subscription_status === 'active').length
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

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="ml-12 sm:ml-14 w-[98%] px-2 sm:px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-primary border-2 border-primary p-4 sm:p-6 text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold mb-1">
                  Welcome back, {userProfile?.displayName || 'Admin'}
                </h2>
                <p className="text-sm sm:text-base text-white/90">
                  Admin Dashboard - System Overview
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Hiring Requests Stats */}
          <div className="bg-white border-2 border-gray-400 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-primary">{stats.totalRequests}</p>
            <p className="text-gray-700 text-xs sm:text-sm font-medium">Total Requests</p>
            <div className="mt-3 pt-3 border-t border-gray-200 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Pending:</span>
                <span className="font-semibold text-yellow-700">{stats.pending}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">In Progress:</span>
                <span className="font-semibold text-blue-700">{stats.inProgress}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Fulfilled:</span>
                <span className="font-semibold text-green-700">{stats.fulfilled}</span>
              </div>
            </div>
          </div>

          {/* Candidates Stats */}
          <div className="bg-white border-2 border-gray-400 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-primary">{stats.totalCandidates}</p>
            <p className="text-gray-700 text-xs sm:text-sm font-medium">Total Candidates</p>
            <div className="mt-3 pt-3 border-t border-gray-200 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Verified:</span>
                <span className="font-semibold text-green-700">{stats.verifiedCandidates}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Available:</span>
                <span className="font-semibold text-blue-700">{stats.availableCandidates}</span>
              </div>
            </div>
          </div>

          {/* Agencies Stats */}
          <div className="bg-white border-2 border-gray-400 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-primary">{stats.totalAgencies}</p>
            <p className="text-gray-700 text-xs sm:text-sm font-medium">Partner Agencies</p>
            <div className="mt-3 pt-3 border-t border-gray-200 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Active:</span>
                <span className="font-semibold text-green-700">{stats.activeAgencies}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border-2 border-gray-400 p-4 sm:p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => onNavigate('admin')}
                className="w-full bg-primary text-white px-3 py-2 hover:bg-primary/90 transition-colors text-xs font-semibold"
              >
                Manage Requests
              </button>
              <button
                onClick={() => onNavigate('talent')}
                className="w-full bg-white border-2 border-primary text-primary px-3 py-2 hover:bg-primary/10 transition-colors text-xs font-semibold"
              >
                View Candidates
              </button>
              <button
                onClick={() => onNavigate('agencies')}
                className="w-full bg-white border-2 border-primary text-primary px-3 py-2 hover:bg-primary/10 transition-colors text-xs font-semibold"
              >
                Manage Agencies
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Hiring Requests */}
          <div className="bg-white border border-gray-300 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Recent Hiring Requests</h3>
              <button
                onClick={() => onNavigate('admin')}
                className="text-primary hover:text-primary/80 font-medium text-sm"
              >
                View All
              </button>
            </div>
            <div className="p-6">
              {hiringRequests.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No hiring requests yet</p>
              ) : (
                <div className="space-y-3">
                  {hiringRequests.slice(0, 5).map((request) => (
                    <div key={request.id} className="border-l-4 border-primary pl-3 py-2">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-semibold text-gray-900 text-sm">
                          {request.quantity}x {request.job_title}
                        </p>
                        <span className={`px-2 py-0.5 text-xs font-semibold ${getStatusColor(request.status)}`}>
                          {request.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        {request.destination_country} • {new Date(request.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Candidates */}
          <div className="bg-white border border-gray-300 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Recent Candidates</h3>
              <button
                onClick={() => onNavigate('talent')}
                className="text-primary hover:text-primary/80 font-medium text-sm"
              >
                View All
              </button>
            </div>
            <div className="p-6">
              {candidates.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No candidates yet</p>
              ) : (
                <div className="space-y-3">
                  {candidates.slice(0, 5).map((candidate) => (
                    <div key={candidate.id} className="flex justify-between items-center border-b border-gray-100 pb-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold text-gray-900 text-sm">{candidate.full_name}</p>
                          {candidate.verified && (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600">{candidate.profession}</p>
                      </div>
                      <span className={`px-2 py-0.5 text-xs font-semibold ${
                        candidate.available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {candidate.available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
