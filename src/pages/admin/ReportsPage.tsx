import { useState, useEffect } from 'react';
import { Download, FileText, BarChart3, TrendingUp, Calendar, Filter } from 'lucide-react';
import {
  db,
  collection,
  getDocs,
  query,
  where,
  orderBy
} from '../../lib/firebase';

interface ReportData {
  requests: any[];
  candidates: any[];
  agencies: any[];
  placements: any[];
  applications: any[];
}

export function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData>({
    requests: [],
    candidates: [],
    agencies: [],
    placements: [],
    applications: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [reportType, setReportType] = useState<'overview' | 'agencies' | 'candidates' | 'placements'>('overview');

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999);

      // Fetch all data
      const [requestsSnapshot, candidatesSnapshot, agenciesSnapshot, placementsSnapshot, applicationsSnapshot] =
        await Promise.all([
          getDocs(collection(db, 'hiring_requests')),
          getDocs(collection(db, 'candidates')),
          getDocs(collection(db, 'agencies')),
          getDocs(collection(db, 'placements')),
          getDocs(collection(db, 'applications'))
        ]);

      const requests = requestsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const candidates = candidatesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const agencies = agenciesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const placements = placementsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const applications = applicationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Filter by date range
      const filteredRequests = requests.filter(r => {
        if (!r.created_at) return false;
        const createdDate = new Date(r.created_at.seconds * 1000);
        return createdDate >= startDate && createdDate <= endDate;
      });

      const filteredCandidates = candidates.filter(c => {
        if (!c.created_at) return false;
        const createdDate = new Date(c.created_at.seconds * 1000);
        return createdDate >= startDate && createdDate <= endDate;
      });

      const filteredPlacements = placements.filter(p => {
        if (!p.created_at) return false;
        const createdDate = new Date(p.created_at.seconds * 1000);
        return createdDate >= startDate && createdDate <= endDate;
      });

      const filteredApplications = applications.filter(a => {
        if (!a.applied_at) return false;
        const appliedDate = new Date(a.applied_at.seconds * 1000);
        return appliedDate >= startDate && appliedDate <= endDate;
      });

      setReportData({
        requests: filteredRequests,
        candidates: filteredCandidates,
        agencies: agencies, // Don't filter agencies by date
        placements: filteredPlacements,
        applications: filteredApplications
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(data[0]).filter(key =>
      typeof data[0][key] !== 'object' || data[0][key] === null
    );

    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          if (value && typeof value === 'object' && value.seconds) {
            return new Date(value.seconds * 1000).toLocaleDateString();
          }
          return value ? `"${value.toString().replace(/"/g, '""')}"` : '';
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getOverviewStats = () => {
    const totalRevenue = reportData.placements.reduce((sum, p) => sum + (p.placement_fee || 0), 0);
    const avgTimeToFulfillment = reportData.requests.filter(r => r.status === 'fulfilled').length > 0
      ? reportData.requests
          .filter(r => r.status === 'fulfilled' && r.created_at && r.updated_at)
          .reduce((sum, r) => {
            const created = new Date(r.created_at.seconds * 1000);
            const updated = new Date(r.updated_at.seconds * 1000);
            return sum + (updated.getTime() - created.getTime());
          }, 0) / reportData.requests.filter(r => r.status === 'fulfilled').length / (1000 * 60 * 60 * 24)
      : 0;

    return {
      totalRequests: reportData.requests.length,
      totalCandidates: reportData.candidates.length,
      totalPlacements: reportData.placements.length,
      totalApplications: reportData.applications.length,
      totalRevenue,
      avgTimeToFulfillment: Math.round(avgTimeToFulfillment),
      fulfillmentRate: reportData.requests.length > 0
        ? Math.round((reportData.requests.filter(r => r.status === 'fulfilled').length / reportData.requests.length) * 100)
        : 0
    };
  };

  const stats = getOverviewStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin border border-gray-300 h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-[96%] ml-auto mr-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Generate and export business reports</p>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-300 shadow-sm p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="overview">Overview</option>
                <option value="agencies">Agencies</option>
                <option value="candidates">Candidates</option>
                <option value="placements">Placements</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchReportData}
                className="w-full flex items-center justify-center space-x-2 bg-primary text-white px-4 py-2 border border-gray-300 hover:bg-primary/90 transition-colors"
              >
                <Filter className="h-4 w-4" />
                <span>Apply Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        {reportType === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white border border-gray-300 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Requests</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalRequests}</p>
                </div>
                <FileText className="h-12 w-12 text-primary" />
              </div>
            </div>
            <div className="bg-white border border-gray-300 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Placements</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalPlacements}</p>
                </div>
                <TrendingUp className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <div className="bg-white border border-gray-300 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
                </div>
                <BarChart3 className="h-12 w-12 text-blue-600" />
              </div>
            </div>
            <div className="bg-white border border-gray-300 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Fulfillment Rate</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.fulfillmentRate}%</p>
                </div>
                <Calendar className="h-12 w-12 text-purple-600" />
              </div>
            </div>
          </div>
        )}

        {/* Export Buttons */}
        <div className="bg-white border border-gray-300 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Reports</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => generateCSV(reportData.requests, 'hiring_requests')}
              className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 border border-gray-300 hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export Requests</span>
            </button>
            <button
              onClick={() => generateCSV(reportData.candidates, 'candidates')}
              className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 border border-gray-300 hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export Candidates</span>
            </button>
            <button
              onClick={() => generateCSV(reportData.agencies, 'agencies')}
              className="flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-3 border border-gray-300 hover:bg-purple-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export Agencies</span>
            </button>
            <button
              onClick={() => generateCSV(reportData.placements, 'placements')}
              className="flex items-center justify-center space-x-2 bg-orange-600 text-white px-4 py-3 border border-gray-300 hover:bg-orange-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export Placements</span>
            </button>
          </div>
        </div>

        {/* Data Tables */}
        <div className="mt-8 bg-white border border-gray-300 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Data Preview</h3>
          </div>
          <div className="p-6">
            {reportType === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Key Metrics</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 border border-gray-300">
                      <p className="text-sm text-gray-600">Average Time to Fulfillment</p>
                      <p className="text-lg font-semibold text-gray-900">{stats.avgTimeToFulfillment} days</p>
                    </div>
                    <div className="bg-gray-50 p-4 border border-gray-300">
                      <p className="text-sm text-gray-600">Active Agencies</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {reportData.agencies.filter(a => a.subscription_status === 'active').length}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 border border-gray-300">
                      <p className="text-sm text-gray-600">Verified Candidates</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {reportData.candidates.filter(c => c.verified).length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {reportType === 'agencies' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Agency</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Country</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Subscription</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Requests</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.agencies.slice(0, 10).map((agency) => (
                      <tr key={agency.id} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-gray-900">{agency.name}</td>
                        <td className="py-3 px-4 text-gray-700">{agency.country}</td>
                        <td className="py-3 px-4 text-gray-700">{agency.subscription_tier}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs border border-gray-300 ${
                            agency.subscription_status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {agency.subscription_status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {reportData.requests.filter(r => r.agency_id === agency.id).length}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Similar tables for other report types would go here */}
          </div>
        </div>
      </div>
    </div>
  );
}