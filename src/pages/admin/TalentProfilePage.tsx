import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, User, MapPin, Phone, Mail, Briefcase, Star, CheckCircle2, Upload, FileText } from 'lucide-react';
import {
  db,
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  serverTimestamp,
  addDoc,
  deleteDoc
} from '../../lib/firebase';

interface TalentProfile {
  id: string;
  personal_info: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    date_of_birth: Date;
    nationality: string;
    current_location: string;
    preferred_locations: string[];
  };
  professional_info: {
    current_title: string;
    industry: string;
    experience_years: number;
    skills: string[];
    languages: Array<{
      language: string;
      proficiency: 'basic' | 'intermediate' | 'advanced' | 'native';
    }>;
    salary_expectation: string;
    availability: 'immediately' | '2_weeks' | '1_month' | '3_months' | 'not_available';
  };
  education: Array<{
    institution: string;
    degree: string;
    field_of_study: string;
    graduation_year: number;
    gpa?: string;
  }>;
  work_experience: Array<{
    company: string;
    position: string;
    start_date: Date;
    end_date?: Date;
    current: boolean;
    description: string;
    achievements: string[];
  }>;
  certifications: Array<{
    name: string;
    issuing_organization: string;
    issue_date: Date;
    expiry_date?: Date;
    credential_id?: string;
  }>;
  portfolio: {
    website?: string;
    linkedin?: string;
    github?: string;
    projects: Array<{
      title: string;
      description: string;
      technologies: string[];
      url?: string;
    }>;
  };
  preferences: {
    job_types: string[];
    work_arrangements: string[];
    industries: string[];
    company_sizes: string[];
  };
  status: 'active' | 'inactive' | 'placed' | 'on_hold';
  rating: number;
  notes: string;
  created_at?: Date;
  updated_at?: Date;
}

export function TalentProfilePage() {
  const [profiles, setProfiles] = useState<TalentProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<TalentProfile | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeStep, setActiveStep] = useState(0);

  const [profileForm, setProfileForm] = useState({
    // Personal Info
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    nationality: '',
    current_location: '',
    preferred_locations: '',

    // Professional Info
    current_title: '',
    industry: '',
    experience_years: 0,
    skills: '',
    languages: '',
    salary_expectation: '',
    availability: 'immediately' as const,

    // Additional
    status: 'active' as const,
    rating: 0,
    notes: ''
  });

  const steps = [
    'Personal Information',
    'Professional Details',
    'Experience & Education',
    'Preferences & Status'
  ];

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const profilesRef = collection(db, 'talent_profiles');
      const profilesQuery = query(profilesRef, orderBy('created_at', 'desc'));
      const profilesSnapshot = await getDocs(profilesQuery);
      const profilesData = profilesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          personal_info: {
            ...data.personal_info,
            date_of_birth: data.personal_info?.date_of_birth?.toDate() || new Date()
          },
          created_at: data.created_at?.toDate() || new Date(),
          updated_at: data.updated_at?.toDate() || new Date()
        };
      });
      setProfiles(profilesData as TalentProfile[]);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProfiles = profiles.filter(profile => {
    const fullName = `${profile.personal_info?.first_name} ${profile.personal_info?.last_name}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      profile.personal_info?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.professional_info?.current_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.professional_info?.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = filterStatus === 'all' || profile.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const openProfileModal = (profile?: TalentProfile) => {
    if (profile) {
      setEditingProfile(profile);
      setProfileForm({
        first_name: profile.personal_info?.first_name || '',
        last_name: profile.personal_info?.last_name || '',
        email: profile.personal_info?.email || '',
        phone: profile.personal_info?.phone || '',
        date_of_birth: profile.personal_info?.date_of_birth?.toISOString().split('T')[0] || '',
        nationality: profile.personal_info?.nationality || '',
        current_location: profile.personal_info?.current_location || '',
        preferred_locations: profile.personal_info?.preferred_locations?.join(', ') || '',
        current_title: profile.professional_info?.current_title || '',
        industry: profile.professional_info?.industry || '',
        experience_years: profile.professional_info?.experience_years || 0,
        skills: profile.professional_info?.skills?.join(', ') || '',
        languages: profile.professional_info?.languages?.map(l => `${l.language}:${l.proficiency}`).join(', ') || '',
        salary_expectation: profile.professional_info?.salary_expectation || '',
        availability: profile.professional_info?.availability || 'immediately',
        status: profile.status || 'active',
        rating: profile.rating || 0,
        notes: profile.notes || ''
      });
    } else {
      setEditingProfile(null);
      setProfileForm({
        first_name: '', last_name: '', email: '', phone: '', date_of_birth: '',
        nationality: '', current_location: '', preferred_locations: '',
        current_title: '', industry: '', experience_years: 0, skills: '',
        languages: '', salary_expectation: '', availability: 'immediately',
        status: 'active', rating: 0, notes: ''
      });
    }
    setActiveStep(0);
    setShowProfileModal(true);
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
    setEditingProfile(null);
    setActiveStep(0);
  };

  const saveProfile = async () => {
    try {
      const profileData = {
        personal_info: {
          first_name: profileForm.first_name,
          last_name: profileForm.last_name,
          email: profileForm.email,
          phone: profileForm.phone,
          date_of_birth: new Date(profileForm.date_of_birth),
          nationality: profileForm.nationality,
          current_location: profileForm.current_location,
          preferred_locations: profileForm.preferred_locations.split(',').map(s => s.trim()).filter(s => s)
        },
        professional_info: {
          current_title: profileForm.current_title,
          industry: profileForm.industry,
          experience_years: profileForm.experience_years,
          skills: profileForm.skills.split(',').map(s => s.trim()).filter(s => s),
          languages: profileForm.languages.split(',').map(s => s.trim()).filter(s => s).map(lang => {
            const [language, proficiency] = lang.split(':');
            return { language: language?.trim() || '', proficiency: proficiency?.trim() || 'intermediate' };
          }),
          salary_expectation: profileForm.salary_expectation,
          availability: profileForm.availability
        },
        education: [],
        work_experience: [],
        certifications: [],
        portfolio: { projects: [] },
        preferences: {
          job_types: [],
          work_arrangements: [],
          industries: [],
          company_sizes: []
        },
        status: profileForm.status,
        rating: profileForm.rating,
        notes: profileForm.notes,
        updated_at: serverTimestamp()
      };

      if (editingProfile) {
        const profileRef = doc(db, 'talent_profiles', editingProfile.id);
        await updateDoc(profileRef, profileData);
      } else {
        await addDoc(collection(db, 'talent_profiles'), {
          ...profileData,
          created_at: serverTimestamp()
        });
      }

      fetchProfiles();
      closeProfileModal();
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const deleteProfile = async (profileId: string) => {
    if (window.confirm('Are you sure you want to delete this talent profile?')) {
      try {
        await deleteDoc(doc(db, 'talent_profiles', profileId));
        fetchProfiles();
      } catch (error) {
        console.error('Error deleting profile:', error);
      }
    }
  };

  const updateProfileStatus = async (profileId: string, newStatus: 'active' | 'inactive' | 'placed' | 'on_hold') => {
    try {
      const profileRef = doc(db, 'talent_profiles', profileId);
      await updateDoc(profileRef, {
        status: newStatus,
        updated_at: serverTimestamp()
      });
      fetchProfiles();
    } catch (error) {
      console.error('Error updating profile status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'placed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const nextStep = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const prevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const renderFormStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-1">First Name *</label>
                <input
                  type="text"
                  value={profileForm.first_name}
                  onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-400 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-1">Last Name *</label>
                <input
                  type="text"
                  value={profileForm.last_name}
                  onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-400 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={profileForm.date_of_birth}
                  onChange={(e) => setProfileForm({ ...profileForm, date_of_birth: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
              <input
                type="text"
                value={profileForm.nationality}
                onChange={(e) => setProfileForm({ ...profileForm, nationality: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Location</label>
              <input
                type="text"
                value={profileForm.current_location}
                onChange={(e) => setProfileForm({ ...profileForm, current_location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Locations</label>
              <input
                type="text"
                value={profileForm.preferred_locations}
                onChange={(e) => setProfileForm({ ...profileForm, preferred_locations: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                placeholder="Comma-separated locations"
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Current Job Title *</label>
              <input
                type="text"
                value={profileForm.current_title}
                onChange={(e) => setProfileForm({ ...profileForm, current_title: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-400 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <input
                  type="text"
                  value={profileForm.industry}
                  onChange={(e) => setProfileForm({ ...profileForm, industry: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
                <input
                  type="number"
                  min="0"
                  value={profileForm.experience_years}
                  onChange={(e) => setProfileForm({ ...profileForm, experience_years: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
              <input
                type="text"
                value={profileForm.skills}
                onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                placeholder="Comma-separated skills"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Languages</label>
              <input
                type="text"
                value={profileForm.languages}
                onChange={(e) => setProfileForm({ ...profileForm, languages: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                placeholder="Format: English:advanced, Spanish:intermediate"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salary Expectation</label>
                <input
                  type="text"
                  value={profileForm.salary_expectation}
                  onChange={(e) => setProfileForm({ ...profileForm, salary_expectation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                  placeholder="e.g., $80,000 - $120,000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                <select
                  value={profileForm.availability}
                  onChange={(e) => setProfileForm({ ...profileForm, availability: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                >
                  <option value="immediately">Immediately</option>
                  <option value="2_weeks">2 Weeks Notice</option>
                  <option value="1_month">1 Month Notice</option>
                  <option value="3_months">3 Months Notice</option>
                  <option value="not_available">Not Available</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Experience and Education details</p>
              <p className="text-sm text-gray-500">These sections can be filled out later in the full profile editor</p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={profileForm.status}
                  onChange={(e) => setProfileForm({ ...profileForm, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="placed">Placed</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={profileForm.rating}
                  onChange={(e) => setProfileForm({ ...profileForm, rating: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={profileForm.notes}
                onChange={(e) => setProfileForm({ ...profileForm, notes: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none text-sm"
                placeholder="Internal notes about this talent"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="ml-12 sm:ml-14 w-[98%] px-2 sm:px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">Talent Profiles</h1>
          <p className="text-gray-600">Create and manage talent profiles for recruitment</p>
        </div>

        <div className="bg-white shadow-lg border border-gray-200">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search profiles by name, email, title, or skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm sm:text-base"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 sm:py-3 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm sm:text-base"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="placed">Placed</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>
              <button
                onClick={() => openProfileModal()}
                className="flex items-center justify-center space-x-2 px-4 py-2 sm:py-3 bg-primary text-white hover:bg-primary/90 transition-colors font-semibold border border-primary text-sm sm:text-base whitespace-nowrap"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Create Profile</span>
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="inline-block animate-spin border border-gray-300 h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-gray-600">Loading profiles...</span>
              </div>
            ) : filteredProfiles.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-2">No talent profiles found</p>
                <p className="text-gray-500">Create your first talent profile to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProfiles.map((profile) => (
                  <div key={profile.id} className="bg-gray-50 border border-gray-300 p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4 gap-3">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="text-lg sm:text-xl font-bold text-primary">
                            {profile.personal_info?.first_name} {profile.personal_info?.last_name}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-semibold border ${getStatusColor(profile.status)}`}>
                            {profile.status}
                          </span>
                          <div className="flex items-center space-x-1">
                            {renderStars(profile.rating || 0)}
                          </div>
                        </div>

                        <p className="text-primary font-medium mb-2">{profile.professional_info?.current_title}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Mail className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{profile.personal_info?.email}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4 flex-shrink-0" />
                            <span>{profile.personal_info?.phone}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span>{profile.personal_info?.current_location}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Briefcase className="h-4 w-4 flex-shrink-0" />
                            <span>{profile.professional_info?.experience_years} years exp.</span>
                          </div>
                        </div>

                        {profile.professional_info?.skills && profile.professional_info.skills.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-900 mb-2">Skills:</p>
                            <div className="flex flex-wrap gap-1 sm:gap-2">
                              {profile.professional_info.skills.slice(0, 6).map((skill, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium border border-blue-200">
                                  {skill}
                                </span>
                              ))}
                              {profile.professional_info.skills.length > 6 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200">
                                  +{profile.professional_info.skills.length - 6} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {profile.notes && (
                          <div className="text-sm text-gray-600 bg-yellow-50 border border-yellow-200 p-2 rounded">
                            <strong>Notes:</strong> {profile.notes}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col lg:flex-row gap-2 lg:ml-4">
                        <button
                          onClick={() => openProfileModal(profile)}
                          className="flex items-center justify-center space-x-1 px-3 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors text-sm border border-gray-300"
                        >
                          <Edit2 className="h-4 w-4" />
                          <span>Edit</span>
                        </button>
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateProfileStatus(profile.id, profile.status === 'active' ? 'inactive' : 'active')}
                            className={`px-3 py-2 text-sm font-semibold transition-colors border ${
                              profile.status === 'active'
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300'
                                : 'bg-green-100 text-green-800 hover:bg-green-200 border-green-300'
                            }`}
                          >
                            {profile.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => updateProfileStatus(profile.id, 'placed')}
                            className="px-3 py-2 bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors text-sm border border-blue-300"
                            disabled={profile.status === 'placed'}
                          >
                            Mark Placed
                          </button>
                        </div>
                        <button
                          onClick={() => deleteProfile(profile.id)}
                          className="flex items-center justify-center space-x-1 px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 transition-colors text-sm border border-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-gray-400 p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-primary mb-6">
              {editingProfile ? 'Edit Talent Profile' : 'Create New Talent Profile'}
            </h2>

            {/* Progress Steps */}
            <div className="mb-6">
              <div className="flex items-center space-x-4 mb-4">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold ${
                      index <= activeStep
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-300 text-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-16 h-0.5 ${
                        index < activeStep ? 'bg-primary' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{steps[activeStep]}</h3>
            </div>

            {/* Form Content */}
            {renderFormStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <button
                onClick={prevStep}
                disabled={activeStep === 0}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="flex gap-3">
                <button
                  onClick={closeProfileModal}
                  className="px-6 py-2 border-2 border-gray-400 text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>

                {activeStep === steps.length - 1 ? (
                  <button
                    onClick={saveProfile}
                    className="px-6 py-2 bg-primary text-white hover:bg-primary/90 transition-colors font-semibold border border-primary"
                  >
                    {editingProfile ? 'Update Profile' : 'Create Profile'}
                  </button>
                ) : (
                  <button
                    onClick={nextStep}
                    className="px-4 py-2 bg-primary text-white hover:bg-primary/90 transition-colors font-semibold border border-primary"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}