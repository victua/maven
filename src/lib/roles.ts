import { UserRole } from './firebase';

export const ROLES: Record<UserRole, string> = {
  admin: 'Administrator',
  agency: 'Agency Partner',
  talent: 'Talent/Candidate',
  team: 'Maven Team'
};

export const ROLE_PERMISSIONS = {
  admin: {
    canAccessAdmin: true,
    canAccessAgency: true,
    canAccessTalent: true,
    canManageUsers: true,
    canViewAllRequests: true,
    canManageSystem: true
  },
  team: {
    canAccessAdmin: true,
    canAccessAgency: false,
    canAccessTalent: false,
    canManageUsers: false,
    canViewAllRequests: true,
    canManageSystem: false
  },
  agency: {
    canAccessAdmin: false,
    canAccessAgency: true,
    canAccessTalent: false,
    canManageUsers: false,
    canViewAllRequests: false,
    canManageSystem: false
  },
  talent: {
    canAccessAdmin: false,
    canAccessAgency: false,
    canAccessTalent: true,
    canManageUsers: false,
    canViewAllRequests: false,
    canManageSystem: false
  }
};

export const getDefaultRoute = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return '/dashboard';
    case 'team':
      return '/admin';
    case 'agency':
      return '/agency/dashboard';
    case 'talent':
      return '/talent/dashboard';
    default:
      return '/login';
  }
};

export const hasPermission = (role: UserRole, permission: keyof typeof ROLE_PERMISSIONS.admin): boolean => {
  return ROLE_PERMISSIONS[role]?.[permission] || false;
};

// Sample users data
export const SAMPLE_USERS = [
  {
    email: 'admin@maven.co.ke',
    password: 'test1234',
    role: 'admin' as UserRole,
    displayName: 'Maven Administrator'
  },
  {
    email: 'agency@maven.co.ke',
    password: 'test1234',
    role: 'agency' as UserRole,
    displayName: 'Sample Agency'
  },
  {
    email: 'talent@maven.co.ke',
    password: 'test1234',
    role: 'talent' as UserRole,
    displayName: 'Sample Talent'
  },
  {
    email: 'team@maven.co.ke',
    password: 'test1234',
    role: 'team' as UserRole,
    displayName: 'Maven Team Member'
  }
];