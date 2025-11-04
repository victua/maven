import { useState, useEffect } from 'react';
import { TrendingUp, Users, FileText, CheckCircle2, Clock, Briefcase, BarChart3, PieChart } from 'lucide-react';
import {
  db,
  collection,
  getDocs,
  query,
  where,
  orderBy
} from '../../lib/firebase';

export function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalRequests: 0,
    totalCandidates: 0,
    totalAgencies: 0,
    totalPlacements: 0,
    requestsByStatus: {
      pending: 0,
      in_progress: 0,
      fulfilled: 0,
      cancelled: 0
    },
    requestsByJobType: {} as Record<string, number>,
    candidatesByProfession: {} as Record<string, number>,
    placementTrends: [] as Array<{ month: string; placements: number; revenue: number }>,
    topPerformingAgencies: [] as Array<{ name: string; requests: number; placements: number }>,
    averageTimeToFulfillment: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch hiring requests
      const requestsSnapshot = await getDocs(collection(db, 'hiring_requests'));
      const requests = requestsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch candidates
      const candidatesSnapshot = await getDocs(collection(db, 'candidates'));
      const candidates = candidatesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch agencies
      const agenciesSnapshot = await getDocs(collection(db, 'agencies'));
      const agencies = agenciesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch placements
      const placementsSnapshot = await getDocs(collection(db, 'placements'));
      const placements = placementsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate analytics
      const requestsByStatus = {
        pending: requests.filter(r => r.status === 'pending').length,
        in_progress: requests.filter(r => r.status === 'in_progress').length,
        fulfilled: requests.filter(r => r.status === 'fulfilled').length,
        cancelled: requests.filter(r => r.status === 'cancelled').length
      };

      const requestsByJobType = requests.reduce((acc, request) => {
        const jobType = request.job_title || 'Unknown';
        acc[jobType] = (acc[jobType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const candidatesByProfession = candidates.reduce((acc, candidate) => {
        const profession = candidate.profession || 'Unknown';
        acc[profession] = (acc[profession] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calculate agency performance
      const agencyRequestCounts = requests.reduce((acc, request) => {
        const agencyId = request.agency_id;
        if (agencyId) {
          acc[agencyId] = (acc[agencyId] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const agencyPlacementCounts = placements.reduce((acc, placement) => {
        const agencyId = placement.agency_id;
        if (agencyId) {
          acc[agencyId] = (acc[agencyId] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const topPerformingAgencies = agencies
        .map(agency => ({
          name: agency.name,
          requests: agencyRequestCounts[agency.id] || 0,
          placements: agencyPlacementCounts[agency.id] || 0
        }))
        .sort((a, b) => (b.placements + b.requests) - (a.placements + a.requests))
        .slice(0, 5);

      // Calculate revenue
      const totalRevenue = placements.reduce((sum, placement) => sum + (placement.placement_fee || 0), 0);

      // Generate placement trends (last 6 months)
      const placementTrends = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

        const monthPlacements = placements.filter(p => {
          if (!p.placed_at) return false;
          const placementDate = new Date(p.placed_at.seconds ? p.placed_at.seconds * 1000 : p.placed_at);
          return placementDate.getMonth() === monthDate.getMonth() &&
                 placementDate.getFullYear() === monthDate.getFullYear();
        });

        const monthRevenue = monthPlacements.reduce((sum, p) => sum + (p.placement_fee || 0), 0);

        placementTrends.push({
          month: monthName,
          placements: monthPlacements.length,
          revenue: monthRevenue
        });
      }

      // Calculate average time to fulfillment
      const fulfilledRequests = requests.filter(r => r.status === 'fulfilled' && r.created_at && r.updated_at);
      const avgTime = fulfilledRequests.length > 0
        ? fulfilledRequests.reduce((sum, request) => {
            const createdAt = new Date(request.created_at.seconds ? request.created_at.seconds * 1000 : request.created_at);
            const updatedAt = new Date(request.updated_at.seconds ? request.updated_at.seconds * 1000 : request.updated_at);
            return sum + (updatedAt.getTime() - createdAt.getTime());
          }, 0) / fulfilledRequests.length / (1000 * 60 * 60 * 24) // Convert to days
        : 0;

      setAnalytics({
        totalRequests: requests.length,
        totalCandidates: candidates.length,
        totalAgencies: agencies.length,
        totalPlacements: placements.length,
        requestsByStatus,
        requestsByJobType,
        candidatesByProfession,
        placementTrends,
        topPerformingAgencies,
        averageTimeToFulfillment: Math.round(avgTime),
        totalRevenue
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin border border-gray-300 h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-[96%] ml-auto mr-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
          <p className="text-gray-600">Track performance metrics and business insights</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-gray-300 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Requests</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalRequests}</p>
              </div>
              <FileText className="h-12 w-12 text-primary" />
            </div>
          </div>

          <div className="bg-white border border-gray-300 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Candidates</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalCandidates}</p>
              </div>
              <Users className="h-12 w-12 text-blue-600" />
            </div>
          </div>

          <div className="bg-white border border-gray-300 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Placements</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalPlacements}</p>
              </div>
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </div>

          <div className="bg-white border border-gray-300 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">${analytics.totalRevenue.toLocaleString()}</p>
              </div>
              <Briefcase className="h-12 w-12 text-primary" />
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Request Status Distribution */}
          <div className="bg-white border border-gray-300 shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-4">
              <PieChart className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Request Status Distribution</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(analytics.requestsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 border border-gray-300 ${
                      status === 'pending' ? 'bg-yellow-500' :
                      status === 'in_progress' ? 'bg-blue-500' :
                      status === 'fulfilled' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-gray-700 capitalize">{status.replace('_', ' ')}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Placement Trends */}
          <div className="bg-white border border-gray-300 shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-4">
              <BarChart3 className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Placement Trends (6 Months)</h3>
            </div>
            <div className="space-y-3">
              {analytics.placementTrends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-700">{trend.month}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">{trend.placements} placements</span>
                    <span className="font-semibold text-gray-900">${trend.revenue.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Job Types */}
          <div className="bg-white border border-gray-300 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Requested Job Types</h3>
            <div className="space-y-3">
              {Object.entries(analytics.requestsByJobType)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([jobType, count]) => (
                <div key={jobType} className="flex items-center justify-between">
                  <span className="text-gray-700">{jobType}</span>
                  <span className="font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performing Agencies */}
          <div className="bg-white border border-gray-300 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Agencies</h3>
            <div className="space-y-3">
              {analytics.topPerformingAgencies.map((agency, index) => (
                <div key={index} className="border-b border-gray-100 pb-2 last:border-b-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{agency.name}</span>
                    <span className="text-sm text-gray-600">{agency.placements} placements</span>
                  </div>
                  <span className="text-sm text-gray-500">{agency.requests} requests</span>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white border border-gray-300 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Avg. Time to Fulfillment</span>
                  <span className="font-semibold text-gray-900">{analytics.averageTimeToFulfillment} days</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Fulfillment Rate</span>
                  <span className="font-semibold text-gray-900">
                    {analytics.totalRequests > 0
                      ? Math.round((analytics.requestsByStatus.fulfilled / analytics.totalRequests) * 100)
                      : 0}%
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Active Agencies</span>
                  <span className="font-semibold text-gray-900">{analytics.totalAgencies}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Avg. Revenue per Placement</span>
                  <span className="font-semibold text-gray-900">
                    ${analytics.totalPlacements > 0
                      ? Math.round(analytics.totalRevenue / analytics.totalPlacements).toLocaleString()
                      : 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}