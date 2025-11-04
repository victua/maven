import { useState, useEffect } from 'react';
import { User, MapPin, Clock, Star, Briefcase, Edit2, Phone, Mail, Calendar, Award, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  db,
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from '../../lib/firebase';

interface TalentDashboardProps {
  onNavigate: (page: string) => void;
}

interface JobType {
  id: string;
  title: string;
  description: string;
  category: string;
  skills_required: string[];
  min_experience_years: number;
  active: boolean;
}

interface TalentProfile {
  full_name: string;
  phone: string;
  date_of_birth: string;
  profession: string;
  experience_years: number;
  skills: string[];
  education_level: string;
  certifications: string[];
  previous_countries: string[];
  preferred_countries: string[];
  languages: string[];
  emergency_contact: {
    name: string;
    phone: string;
    relationship: string;
  };
  verified: boolean;
  available: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export function TalentDashboard({ }: TalentDashboardProps) {
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'applications'>('dashboard');
  const [talentProfile, setTalentProfile] = useState<TalentProfile | null>(null);
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<TalentProfile>({
    full_name: '',
    phone: '',
    date_of_birth: '',
    profession: '',
    experience_years: 0,
    skills: [],
    education_level: '',
    certifications: [],
    previous_countries: [],
    preferred_countries: [],
    languages: [],
    emergency_contact: {
      name: '',
      phone: '',
      relationship: ''
    },
    verified: false,
    available: true
  });
  const [opportunities] = useState([
    {
      id: '1',
      title: 'Driver - Dubai, UAE',
      company: 'Al Futtaim Group',
      location: 'Dubai, UAE',
      salary: '$1,800 - $2,200/month',
      deadline: '2024-12-15',
      status: 'recommended'
    },
    {
      id: '2',
      title: 'Construction Worker - Qatar',
      company: 'Qatar Construction Ltd',
      location: 'Doha, Qatar',
      salary: '$1,500 - $2,000/month',
      deadline: '2024-12-20',
      status: 'applied'
    }
  ]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch talent profile
      const profileRef = doc(db, 'candidates', user!.uid);
      const profileSnap = await getDoc(profileRef);

      if (profileSnap.exists()) {
        const profileData = profileSnap.data() as TalentProfile;
        setTalentProfile(profileData);
        setProfileForm(profileData);
      }

      // Fetch active job types
      const jobTypesRef = collection(db, 'job_types');
      const jobTypesQuery = query(jobTypesRef, where('active', '==', true));
      const jobTypesSnapshot = await getDocs(jobTypesQuery);
      const jobTypesData = jobTypesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as JobType[];

      setJobTypes(jobTypesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProfileCompletion = () => {
    if (!talentProfile) return 0;

    const fields = [
      talentProfile.full_name,
      talentProfile.phone,
      talentProfile.date_of_birth,
      talentProfile.profession,
      talentProfile.experience_years > 0,
      talentProfile.skills.length > 0,
      talentProfile.education_level,
      talentProfile.preferred_countries.length > 0,
      talentProfile.languages.length > 0,
      talentProfile.emergency_contact.name,
      talentProfile.emergency_contact.phone
    ];

    const completedFields = fields.filter(field => {
      if (typeof field === 'boolean') return field;
      if (typeof field === 'string') return field.trim() !== '';
      return false;
    }).length;

    return Math.round((completedFields / fields.length) * 100);
  };

  const saveProfile = async () => {
    try {
      const profileData = {
        ...profileForm,
        updated_at: serverTimestamp()
      };

      if (talentProfile) {
        const profileRef = doc(db, 'candidates', user!.uid);
        await updateDoc(profileRef, profileData);
      } else {
        const profileRef = doc(db, 'candidates', user!.uid);
        await setDoc(profileRef, {
          ...profileData,
          created_at: serverTimestamp()
        });
      }

      fetchData();
      setEditingProfile(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };


  const stats = {
    profileCompletion: calculateProfileCompletion(),
    applicationsSubmitted: 3,
    recommendedJobs: 5,
    interviewsScheduled: 1
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin border border-gray-300 h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 border-2 border-white flex items-center justify-center">
                  <User className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold">
                    Welcome, {talentProfile?.full_name || userProfile?.displayName || 'Talent'}
                  </h1>
                  <p className="text-sm sm:text-base text-white/90">Talent Dashboard</p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs sm:text-sm text-white/90">Profile Status</p>
                <p className="text-base sm:text-lg font-bold">
                  {talentProfile?.verified ? '✅ Verified' : '⏳ Pending Verification'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white border-2 border-gray-400">
            <div className="border-b-2 border-gray-400">
              <nav className="flex overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 font-semibold border-b-2 transition-colors ${
                    activeTab === 'dashboard'
                      ? 'border-primary text-primary bg-primary/10'
                      : 'border-transparent text-gray-700 hover:text-primary hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <Star className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base whitespace-nowrap">Dashboard</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 font-semibold border-b-2 transition-colors ${
                    activeTab === 'profile'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>My Profile</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('applications')}
                  className={`px-6 py-4 font-semibold border-b-2 transition-colors ${
                    activeTab === 'applications'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Applications</span>
                  </div>
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'dashboard' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white border border-gray-300 shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <User className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.profileCompletion}%</p>
                <p className="text-gray-600 text-sm">Profile Completion</p>
                {stats.profileCompletion < 100 && (
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="mt-2 text-xs text-primary hover:text-primary/80 font-medium"
                  >
                    Complete Profile →
                  </button>
                )}
              </div>

              <div className="bg-white border border-gray-300 shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <Briefcase className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.applicationsSubmitted}</p>
                <p className="text-gray-600 text-sm">Applications</p>
              </div>

              <div className="bg-white border border-gray-300 shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <Star className="h-8 w-8 text-yellow-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.recommendedJobs}</p>
                <p className="text-gray-600 text-sm">Recommended Jobs</p>
              </div>

              <div className="bg-white border border-gray-300 shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.interviewsScheduled}</p>
                <p className="text-gray-600 text-sm">Interviews</p>
              </div>
            </div>

            {/* Opportunities */}
            <div className="bg-white border border-gray-300 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Job Opportunities</h3>
              </div>
              <div className="p-6">
                {!talentProfile ? (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Complete Your Profile</h4>
                    <p className="text-gray-600 mb-4">Create your profile to start receiving job opportunities</p>
                    <button
                      onClick={() => setActiveTab('profile')}
                      className="bg-primary text-white px-6 py-2 font-semibold hover:bg-primary/90 transition-colors"
                    >
                      Create Profile
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {opportunities.map((opportunity) => (
                      <div key={opportunity.id} className="border border-gray-200 border border-gray-300 p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-1">
                              {opportunity.title}
                            </h4>
                            <p className="text-gray-600">{opportunity.company}</p>
                          </div>
                          <span className={`px-3 py-1 border border-gray-300 text-xs font-semibold ${
                            opportunity.status === 'recommended'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {opportunity.status === 'recommended' ? 'Recommended' : 'Applied'}
                          </span>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{opportunity.location}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Briefcase className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{opportunity.salary}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-700">
                              Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          {opportunity.status === 'recommended' ? (
                            <button className="bg-green-600 text-white px-4 py-2 border border-gray-300 hover:bg-green-700 transition-colors text-sm font-semibold">
                              Apply Now
                            </button>
                          ) : (
                            <button className="bg-gray-100 text-gray-700 px-4 py-2 border border-gray-300 hover:bg-gray-200 transition-colors text-sm font-semibold">
                              View Application
                            </button>
                          )}
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-semibold">
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white border border-gray-300 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">My Profile</h3>
              {talentProfile && !editingProfile && (
                <button
                  onClick={() => setEditingProfile(true)}
                  className="flex items-center space-x-2 text-primary hover:text-primary/80 font-medium"
                >
                  <Edit2 className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
            <div className="p-6">
              {!talentProfile && !editingProfile ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Create Your Profile</h4>
                  <p className="text-gray-600 mb-4">Let's start building your professional profile</p>
                  <button
                    onClick={() => setEditingProfile(true)}
                    className="bg-primary text-white px-6 py-3 font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Get Started
                  </button>
                </div>
              ) : editingProfile ? (
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={profileForm.full_name}
                          onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                        <input
                          type="date"
                          value={profileForm.date_of_birth}
                          onChange={(e) => setProfileForm({ ...profileForm, date_of_birth: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Education Level</label>
                        <select
                          value={profileForm.education_level}
                          onChange={(e) => setProfileForm({ ...profileForm, education_level: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        >
                          <option value="">Select education level</option>
                          <option value="Primary">Primary School</option>
                          <option value="Secondary">Secondary School</option>
                          <option value="Certificate">Certificate</option>
                          <option value="Diploma">Diploma</option>
                          <option value="Degree">Bachelor's Degree</option>
                          <option value="Masters">Master's Degree</option>
                          <option value="PhD">PhD</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
                        <select
                          value={profileForm.profession}
                          onChange={(e) => setProfileForm({ ...profileForm, profession: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        >
                          <option value="">Select your profession</option>
                          {jobTypes.map((jobType) => (
                            <option key={jobType.id} value={jobType.title}>
                              {jobType.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                        <input
                          type="number"
                          min="0"
                          value={profileForm.experience_years}
                          onChange={(e) => setProfileForm({ ...profileForm, experience_years: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                        <input
                          type="text"
                          value={profileForm.emergency_contact.name}
                          onChange={(e) => setProfileForm({
                            ...profileForm,
                            emergency_contact: { ...profileForm.emergency_contact, name: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                        <input
                          type="tel"
                          value={profileForm.emergency_contact.phone}
                          onChange={(e) => setProfileForm({
                            ...profileForm,
                            emergency_contact: { ...profileForm.emergency_contact, phone: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                        <select
                          value={profileForm.emergency_contact.relationship}
                          onChange={(e) => setProfileForm({
                            ...profileForm,
                            emergency_contact: { ...profileForm.emergency_contact, relationship: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        >
                          <option value="">Select relationship</option>
                          <option value="Parent">Parent</option>
                          <option value="Spouse">Spouse</option>
                          <option value="Sibling">Sibling</option>
                          <option value="Friend">Friend</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={saveProfile}
                      className="bg-primary text-white px-6 py-2 font-semibold hover:bg-primary/90 transition-colors"
                    >
                      Save Profile
                    </button>
                    <button
                      onClick={() => setEditingProfile(false)}
                      className="border border-gray-300 text-gray-700 px-6 py-2 hover:bg-gray-50 transition-colors font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Profile Display */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <User className="h-5 w-5 text-gray-500" />
                          <span className="text-gray-900">{talentProfile?.full_name}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Phone className="h-5 w-5 text-gray-500" />
                          <span className="text-gray-900">{talentProfile?.phone}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Mail className="h-5 w-5 text-gray-500" />
                          <span className="text-gray-900">{userProfile?.email}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5 text-gray-500" />
                          <span className="text-gray-900">
                            {talentProfile?.date_of_birth && new Date(talentProfile.date_of_birth).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Award className="h-5 w-5 text-gray-500" />
                          <span className="text-gray-900">{talentProfile?.education_level}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Briefcase className="h-5 w-5 text-gray-500" />
                          <span className="text-gray-900">{talentProfile?.profession}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Clock className="h-5 w-5 text-gray-500" />
                          <span className="text-gray-900">{talentProfile?.experience_years} years experience</span>
                        </div>
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-900 mb-2">Emergency Contact</p>
                          <p className="text-sm text-gray-700">
                            {talentProfile?.emergency_contact.name} ({talentProfile?.emergency_contact.relationship})
                          </p>
                          <p className="text-sm text-gray-700">{talentProfile?.emergency_contact.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="bg-white border border-gray-300 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">My Applications</h3>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h4>
                <p className="text-gray-600">Start applying to job opportunities to see them here</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}