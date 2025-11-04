import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission } from '../lib/roles';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRole?: string[];
  requiredPermission?: string;
  fallback?: React.ReactNode;
  onUnauthorized?: () => void;
}

export function RouteGuard({
  children,
  requiredRole,
  requiredPermission,
  fallback,
  onUnauthorized
}: RouteGuardProps) {
  const { userProfile, loading } = useAuth();

  useEffect(() => {
    if (!loading && userProfile) {
      // Check role-based access
      if (requiredRole && !requiredRole.includes(userProfile.role)) {
        onUnauthorized?.();
        return;
      }

      // Check permission-based access
      if (requiredPermission && !hasPermission(userProfile.role, requiredPermission as any)) {
        onUnauthorized?.();
        return;
      }
    }
  }, [userProfile, loading, requiredRole, requiredPermission, onUnauthorized]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!userProfile) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to access this page.</p>
        </div>
      </div>
    );
  }

  // Check role-based access
  if (requiredRole && !requiredRole.includes(userProfile.role)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
          <p className="text-sm text-gray-500 mt-2">Required role: {requiredRole.join(', ')}</p>
        </div>
      </div>
    );
  }

  // Check permission-based access
  if (requiredPermission && !hasPermission(userProfile.role, requiredPermission as any)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
          <p className="text-sm text-gray-500 mt-2">Required permission: {requiredPermission}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}