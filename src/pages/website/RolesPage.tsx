import { useState, useEffect } from 'react';
import { Search, MapPin, DollarSign, Calendar, Briefcase, Clock, Building, Users, ChevronRight } from 'lucide-react';
import { HeroSection } from '../../components/HeroSection';
import {
  db,
  collection,
  getDocs,
  query,
  orderBy,
  where
} from '../../lib/firebase';

interface Role {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  salary_range: string;
  experience_required: string;
  skills_required: string[];
  employment_type: 'full-time' | 'part-time' | 'contract' | 'temporary';
  posted_date: Date;
  deadline: Date;
  positions_available: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterLocation, setFilterLocation] = useState('');
  const [filterEmploymentType, setFilterEmploymentType] = useState('');
  const [filterExperience, setFilterExperience] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  useEffect(() => {
    fetchActiveRoles();
  }, []);

  const fetchActiveRoles = async () => {
    try {
      const rolesRef = collection(db, 'roles');
      const rolesQuery = query(
        rolesRef,
        where('status', '==', 'active'),
        orderBy('priority', 'desc'),
        orderBy('posted_date', 'desc')
      );
      const rolesSnapshot = await getDocs(rolesQuery);
      const rolesData = rolesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        posted_date: doc.data().posted_date?.toDate() || new Date(),
        deadline: doc.data().deadline?.toDate() || new Date()
      }));
      setRoles(rolesData as Role[]);
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRoles = roles.filter(role => {
    const matchesSearch =
      role.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.skills_required.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesLocation = !filterLocation || role.location.toLowerCase().includes(filterLocation.toLowerCase());
    const matchesEmploymentType = !filterEmploymentType || role.employment_type === filterEmploymentType;
    const matchesExperience = !filterExperience || role.experience_required.toLowerCase().includes(filterExperience.toLowerCase());

    return matchesSearch && matchesLocation && matchesEmploymentType && matchesExperience;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatEmploymentType = (type: string) => {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  const handleApply = (role: Role) => {
    // Navigate to talent registration/application form
    window.location.href = `/talent/register?roleId=${role.id}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection
        title="Available Opportunities"
        subtitle="Discover your next career opportunity. Browse through our curated list of roles from top companies worldwide seeking Kenyan talent."
        showCta={false}
      />

      <div className="w-full px-6 sm:px-8 lg:px-12 py-8">
        {/* Search and Filters */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-lg animate-slideInDown">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by job title, company, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-base transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="Any location"
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                <select
                  value={filterEmploymentType}
                  onChange={(e) => setFilterEmploymentType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm transition-all"
                >
                  <option value="">All Types</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="temporary">Temporary</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                <input
                  type="text"
                  placeholder="e.g., 2-5 years"
                  value={filterExperience}
                  onChange={(e) => setFilterExperience(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm transition-all"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterLocation('');
                    setFilterEmploymentType('');
                    setFilterExperience('');
                  }}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium border border-gray-300"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Jobs List */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="inline-block animate-spin border border-gray-300 h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-gray-600">Loading opportunities...</span>
              </div>
            ) : filteredRoles.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-2">No opportunities found</p>
                <p className="text-gray-500">Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-gray-600">
                    {filteredRoles.length} opportunity{filteredRoles.length !== 1 ? 'ies' : 'y'} found
                  </p>
                </div>

                {filteredRoles.map((role, index) => (
                  <div
                    key={role.id}
                    className={`bg-white border border-gray-200 rounded-xl p-6 hover:border-primary hover:shadow-xl transition-all cursor-pointer card-hover animate-slideInUp ${
                      selectedRole?.id === role.id ? 'border-primary shadow-xl ring-2 ring-primary/20' : ''
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                    onClick={() => setSelectedRole(role)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-primary">{role.title}</h3>
                          {role.priority === 'urgent' && (
                            <span className={`px-2 py-1 text-xs font-semibold border ${getPriorityColor(role.priority)}`}>
                              URGENT
                            </span>
                          )}
                        </div>
                        <p className="text-primary font-medium mb-2">{role.company}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span>{role.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 flex-shrink-0" />
                        <span>{formatEmploymentType(role.employment_type)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 flex-shrink-0" />
                        <span>{role.salary_range || 'Competitive'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 flex-shrink-0" />
                        <span>{role.experience_required}</span>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-2">{role.description}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {role.skills_required.slice(0, 4).map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium border border-blue-200">
                          {skill}
                        </span>
                      ))}
                      {role.skills_required.length > 4 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200">
                          +{role.skills_required.length - 4} more
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>Posted {getTimeAgo(role.posted_date)}</span>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{role.positions_available} position{role.positions_available > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Apply by {role.deadline.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Job Details Sidebar */}
          <div className="lg:col-span-1">
            {selectedRole ? (
              <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-4 shadow-xl animate-scaleIn">
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-xl font-bold text-primary">{selectedRole.title}</h2>
                  {selectedRole.priority === 'urgent' && (
                    <span className={`px-2 py-1 text-xs font-semibold border ${getPriorityColor(selectedRole.priority)}`}>
                      URGENT
                    </span>
                  )}
                </div>

                <p className="text-primary font-medium mb-4">{selectedRole.company}</p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{selectedRole.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Building className="h-4 w-4 text-gray-400" />
                    <span>{formatEmploymentType(selectedRole.employment_type)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span>{selectedRole.salary_range || 'Competitive salary'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{selectedRole.experience_required}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>Apply by {selectedRole.deadline.toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Job Description</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{selectedRole.description}</p>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRole.skills_required.map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium border border-blue-200">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => handleApply(selectedRole)}
                    className="w-full bg-gradient-to-r from-primary to-blue-600 text-white py-3 px-4 rounded-lg hover:shadow-xl transition-all duration-300 font-semibold transform hover:scale-105"
                  >
                    Apply Now
                  </button>
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: selectedRole.title,
                          text: `Check out this job opportunity: ${selectedRole.title} at ${selectedRole.company}`,
                          url: window.location.href
                        });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Job link copied to clipboard!');
                      }
                    }}
                    className="w-full border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 hover:border-primary transition-all duration-300 font-semibold"
                  >
                    Share Job
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 p-6 text-center">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Select a job to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}