import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
// Website portal imports
import { Navbar } from './components/website/Navbar';
import { HomePage } from './pages/website/HomePage';
import { AboutPage } from './pages/website/AboutPage';
import { PricingPage } from './pages/website/PricingPage';
import { ContactPage } from './pages/website/ContactPage';
import { LoginPage } from './pages/website/LoginPage';
import { SignupPage } from './pages/website/SignupPage';
import { RolesPage } from './pages/website/RolesPage';

// Admin portal imports
import { AdminPage } from './pages/admin/AdminPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { AnalyticsPage } from './pages/admin/AnalyticsPage';
import { UsersPage } from './pages/admin/UsersPage';
import { StaffManagementPage } from './pages/admin/StaffManagementPage';
import { AgenciesManagementPage } from './pages/admin/AgenciesManagementPage';
import { AgencyDetailPage } from './pages/admin/AgencyDetailPage';
import { RoleManagementPage } from './pages/admin/RoleManagementPage';
import { TalentProfilePage } from './pages/admin/TalentProfilePage';
import { MatchingPage } from './pages/admin/MatchingPage';
import { VerificationPage } from './pages/admin/VerificationPage';
import { ReportsPage } from './pages/admin/ReportsPage';

// Agency portal imports
import { NewRequestPage } from './pages/agency/NewRequestPage';
import { AgencyDashboard } from './pages/agency/AgencyDashboard';
import { AgencyProfile } from './pages/agency/AgencyProfile';

// Talent portal imports
import { TalentDashboard } from './pages/talent/TalentDashboard';
import { ApplicationsPage } from './pages/talent/ApplicationsPage';

// Shared imports
import { SettingsPage } from './pages/SettingsPage';

// Components
import { Sidebar } from './components/Sidebar';
import { RouteGuard } from './components/RouteGuard';
import { SetupPage } from './pages/SetupPage';

function AppContent() {
  const { user, userProfile, loading, getDefaultRoute } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && user && userProfile && location.pathname === '/') {
      const defaultRoute = getDefaultRoute();
      navigate(defaultRoute.startsWith('/') ? defaultRoute : `/${defaultRoute}`);
    }
  }, [user, userProfile, loading, location.pathname, getDefaultRoute, navigate]);

  const handleNavigate = (page: string) => {
    navigate(`/${page}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const publicPaths = ['/home', '/about', '/pricing', '/contact', '/login', '/signup', '/setup', '/roles', '/'];
  const showNavbar = publicPaths.includes(location.pathname);
  const showSidebar = user && userProfile && !publicPaths.includes(location.pathname);

  const handleUnauthorized = () => {
    navigate('/login');
  };

  return (
    <div className="flex">
      {showSidebar && (
        <Sidebar currentPage={location.pathname.replace('/', '') || 'dashboard'} onNavigate={handleNavigate} />
      )}

      <div className={`flex-1 ${showSidebar ? 'ml-14 sm:ml-16' : ''}`}>
        {showNavbar && <Navbar onNavigate={handleNavigate} currentPage={location.pathname.replace('/', '') || 'home'} />}

        <Routes>
          {/* Default route */}
          <Route path="/" element={user ? <Navigate to={getDefaultRoute()} replace /> : <HomePage />} />

          {/* Public Pages */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/pricing" element={<PricingPage onNavigate={handleNavigate} />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage onNavigate={handleNavigate} />} />
          <Route path="/signup" element={<SignupPage onNavigate={handleNavigate} />} />
          <Route path="/setup" element={<SetupPage onNavigate={handleNavigate} />} />
          <Route path="/roles" element={<RolesPage />} />

          {/* Protected Pages */}
          <Route path="/admin" element={
            <RouteGuard requiredRole={['admin', 'team']} onUnauthorized={handleUnauthorized}>
              <AdminPage />
            </RouteGuard>
          } />

          <Route path="/dashboard" element={
            <RouteGuard requiredRole={['admin']} onUnauthorized={handleUnauthorized}>
              <DashboardPage onNavigate={handleNavigate} />
            </RouteGuard>
          } />

          <Route path="/agency/dashboard" element={
            <RouteGuard requiredRole={['agency']} onUnauthorized={handleUnauthorized}>
              <AgencyDashboard onNavigate={handleNavigate} />
            </RouteGuard>
          } />

          <Route path="/agency/profile" element={
            <RouteGuard requiredRole={['agency']} onUnauthorized={handleUnauthorized}>
              <AgencyProfile onNavigate={handleNavigate} />
            </RouteGuard>
          } />

          <Route path="/agency/new-request" element={
            <RouteGuard requiredRole={['agency']} onUnauthorized={handleUnauthorized}>
              <NewRequestPage onNavigate={handleNavigate} />
            </RouteGuard>
          } />

          <Route path="/talent/dashboard" element={
            <RouteGuard requiredRole={['talent']} onUnauthorized={handleUnauthorized}>
              <TalentDashboard onNavigate={handleNavigate} />
            </RouteGuard>
          } />

          <Route path="/talent/applications" element={
            <RouteGuard requiredRole={['talent']} onUnauthorized={handleUnauthorized}>
              <ApplicationsPage onNavigate={handleNavigate} />
            </RouteGuard>
          } />

          {/* Admin Pages */}
          <Route path="/analytics" element={
            <RouteGuard requiredRole={['admin']} onUnauthorized={handleUnauthorized}>
              <AnalyticsPage />
            </RouteGuard>
          } />

          <Route path="/admin/roles" element={
            <RouteGuard requiredRole={['admin']} onUnauthorized={handleUnauthorized}>
              <RoleManagementPage />
            </RouteGuard>
          } />

          <Route path="/talent" element={
            <RouteGuard requiredRole={['admin']} onUnauthorized={handleUnauthorized}>
              <TalentProfilePage />
            </RouteGuard>
          } />

          <Route path="/agencies" element={
            <RouteGuard requiredRole={['admin']} onUnauthorized={handleUnauthorized}>
              <AgenciesManagementPage />
            </RouteGuard>
          } />

          <Route path="/agencies/:id" element={
            <RouteGuard requiredRole={['admin']} onUnauthorized={handleUnauthorized}>
              <AgencyDetailPage />
            </RouteGuard>
          } />

          <Route path="/team" element={
            <RouteGuard requiredRole={['admin']} onUnauthorized={handleUnauthorized}>
              <StaffManagementPage />
            </RouteGuard>
          } />

          <Route path="/users" element={
            <RouteGuard requiredRole={['admin', 'team']} onUnauthorized={handleUnauthorized}>
              <UsersPage />
            </RouteGuard>
          } />

          <Route path="/matching" element={
            <RouteGuard requiredRole={['admin', 'team']} onUnauthorized={handleUnauthorized}>
              <MatchingPage />
            </RouteGuard>
          } />

          <Route path="/verification" element={
            <RouteGuard requiredRole={['admin', 'team']} onUnauthorized={handleUnauthorized}>
              <VerificationPage />
            </RouteGuard>
          } />

          <Route path="/reports" element={
            <RouteGuard requiredRole={['admin', 'team']} onUnauthorized={handleUnauthorized}>
              <ReportsPage />
            </RouteGuard>
          } />

          {/* Shared Pages */}
          <Route path="/website" element={
            <RouteGuard requiredRole={['admin']} onUnauthorized={handleUnauthorized}>
              <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto">
                  <h1 className="text-3xl font-bold text-primary mb-4">Website Management</h1>
                  <p className="text-gray-600 mb-6">Manage public website content and settings</p>
                  <div className="bg-white border border-gray-200 p-6">
                    <p className="text-gray-700">Website management features coming soon...</p>
                  </div>
                </div>
              </div>
            </RouteGuard>
          } />

          <Route path="/settings" element={
            <RouteGuard requiredRole={['admin', 'agency', 'talent', 'team']} onUnauthorized={handleUnauthorized}>
              <SettingsPage onNavigate={handleNavigate} />
            </RouteGuard>
          } />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
