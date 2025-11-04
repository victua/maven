import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Home,
  UserCheck,
  Briefcase,
  Building,
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  permission?: string;
  roles?: string[];
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: BarChart3,
    roles: ['admin']
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    roles: ['admin']
  },
  {
    id: 'roles',
    label: 'Roles',
    icon: Briefcase,
    roles: ['admin']
  },
  {
    id: 'talent',
    label: 'Talent',
    icon: User,
    roles: ['admin']
  },
  {
    id: 'agencies',
    label: 'Agencies',
    icon: Building,
    roles: ['admin']
  },
  {
    id: 'team',
    label: 'Team',
    icon: Users,
    roles: ['admin']
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    roles: ['admin']
  },
  {
    id: 'website',
    label: 'Website',
    icon: Home,
    roles: ['admin']
  },
  {
    id: 'agency/dashboard',
    label: 'Agency Dashboard',
    icon: Briefcase,
    permission: 'canAccessAgency',
    roles: ['agency']
  },
  {
    id: 'agency/new-request',
    label: 'New Request',
    icon: FileText,
    permission: 'canAccessAgency',
    roles: ['agency']
  },
  {
    id: 'talent/dashboard',
    label: 'Talent Dashboard',
    icon: UserCheck,
    permission: 'canAccessTalent',
    roles: ['talent']
  }
];

export function Sidebar({ currentPage }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const { userProfile, signOut, hasPermission } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isHovering) {
        setIsExpanded(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [isHovering]);

  const handleMouseEnter = () => {
    setIsHovering(true);
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getFilteredMenuItems = () => {
    if (!userProfile) return [];

    return menuItems.filter(item => {
      // Check role-based access
      if (item.roles && !item.roles.includes(userProfile.role)) {
        return false;
      }

      // Check permission-based access
      if (item.permission && !hasPermission(item.permission)) {
        return false;
      }

      return true;
    });
  };

  const filteredItems = getFilteredMenuItems();

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-primary border-r border-primary shadow-lg transition-all duration-300 ease-in-out z-50 ${
        isExpanded ? 'w-56 sm:w-64' : 'w-14 sm:w-16'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-3 sm:p-4 border-b-2 border-white/20">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white border border-white flex items-center justify-center">
              <span className="text-primary font-bold text-xs sm:text-sm">M</span>
            </div>
            {isExpanded && (
              <div className="flex-1 min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-white truncate">Maven</h1>
                <p className="text-xs text-white/80 truncate">
                  {userProfile?.displayName || userProfile?.email}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-1 sm:p-2 space-y-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => navigate(`/${item.id}`)}
                className={`w-full flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 border transition-colors ${
                  isActive
                    ? 'bg-primary text-white border-primary'
                    : 'text-white hover:bg-white/10 border-transparent hover:border-white/20'
                }`}
                title={!isExpanded ? item.label : undefined}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                {isExpanded && (
                  <span className="flex-1 text-left text-xs sm:text-sm font-medium truncate">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Role Badge */}
        {isExpanded && userProfile && (
          <div className="p-3 sm:p-4 border-t-2 border-white/20">
            <div className="bg-white/10 border border-white/20 p-2 sm:p-3">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 ${
                  userProfile.role === 'admin' ? 'bg-secondary' :
                  userProfile.role === 'team' ? 'bg-purple-400' :
                  userProfile.role === 'agency' ? 'bg-white' :
                  'bg-green-400'
                }`} />
                <span className="text-xs font-bold text-white capitalize">
                  {userProfile.role}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Sign Out */}
        <div className="p-1 sm:p-2 border-t border-white/20">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 border border-transparent text-white hover:bg-red-500/20 hover:text-red-200 hover:border-red-300/50 transition-colors"
            title={!isExpanded ? 'Sign Out' : undefined}
          >
            <LogOut className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            {isExpanded && (
              <span className="flex-1 text-left text-xs sm:text-sm font-medium">
                Sign Out
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}