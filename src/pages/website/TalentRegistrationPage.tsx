import { useState, useEffect } from 'react';
import { User, FileText, Briefcase, Star, ArrowLeft, ArrowRight, Check, Upload, Plus, Trash2 } from 'lucide-react';
import { HeroSection } from '../../components/HeroSection';
import {
  db,
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc
} from '../../lib/firebase';

interface Role {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
}

export function TalentRegistrationPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [roleId, setRoleId] = useState<string | null>(null);
  const [roleDetails, setRoleDetails] = useState<Role | null>(null);

  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    nationality: '',
    currentLocation: '',
    preferredLocations: [''],

    // Professional Information
    currentTitle: '',
    industry: '',
    experienceYears: 0,
    skills: [''],
    languages: [{ language: '', proficiency: 'intermediate' }],
    salaryExpectation: '',
    availability: 'immediately',

    // Experience
    workExperience: [{
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      achievements: ['']
    }],

    // Education
    education: [{
      institution: '',
      degree: '',
      fieldOfStudy: '',
      graduationYear: new Date().getFullYear(),
      gpa: ''
    }],

    // Portfolio
    website: '',
    linkedin: '',
    github: '',
    coverLetter: '',

    // Privacy
    agreeToTerms: false,
    allowContact: true
  });

  const steps = [
    { title: 'Personal Info', icon: User },
    { title: 'Professional', icon: Briefcase },
    { title: 'Experience', icon: Star },
    { title: 'Portfolio', icon: FileText }
  ];

  useEffect(() => {
    // Get role ID from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const roleIdParam = urlParams.get('roleId');
    if (roleIdParam) {
      setRoleId(roleIdParam);
      fetchRoleDetails(roleIdParam);
    }
  }, []);

  const fetchRoleDetails = async (id: string) => {
    try {
      const roleDoc = await getDoc(doc(db, 'roles', id));
      if (roleDoc.exists()) {
        setRoleDetails({ id, ...roleDoc.data() } as Role);
      }
    } catch (error) {
      console.error('Error fetching role details:', error);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addArrayItem = (field: string, defaultValue: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field as keyof typeof prev] as any[], defaultValue]
    }));
  };

  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as any[]).filter((_, i) => i !== index)
    }));
  };

  const updateArrayItem = (field: string, index: number, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as any[]).map((item, i) => i === index ? value : item)
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitApplication = async () => {
    setLoading(true);
    try {
      const applicationData = {
        // Personal Info
        personal_info: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          date_of_birth: new Date(formData.dateOfBirth),
          nationality: formData.nationality,
          current_location: formData.currentLocation,
          preferred_locations: formData.preferredLocations.filter(loc => loc.trim())
        },

        // Professional Info
        professional_info: {
          current_title: formData.currentTitle,
          industry: formData.industry,
          experience_years: formData.experienceYears,
          skills: formData.skills.filter(skill => skill.trim()),
          languages: formData.languages.filter(lang => lang.language.trim()),
          salary_expectation: formData.salaryExpectation,
          availability: formData.availability
        },

        // Work Experience
        work_experience: formData.workExperience.filter(exp => exp.company.trim() || exp.position.trim()),

        // Education
        education: formData.education.filter(edu => edu.institution.trim() || edu.degree.trim()),

        // Portfolio
        portfolio: {
          website: formData.website,
          linkedin: formData.linkedin,
          github: formData.github,
          projects: []
        },

        // Application specific
        applied_role_id: roleId,
        cover_letter: formData.coverLetter,
        status: 'pending',
        rating: 0,
        notes: '',
        source: 'website_application',
        allow_contact: formData.allowContact,

        // Timestamps
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };

      await addDoc(collection(db, 'talent_profiles'), applicationData);

      // Show success message and redirect
      alert('Application submitted successfully! We will review your profile and get back to you soon.');
      window.location.href = '/website/roles';
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('There was an error submitting your application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">First Name *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => updateFormData('firstName', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-400 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-2">Last Name *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => updateFormData('lastName', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-400 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
              <input
                type="text"
                value={formData.nationality}
                onChange={(e) => updateFormData('nationality', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="e.g., American, British, Nigerian"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Location *</label>
              <input
                type="text"
                value={formData.currentLocation}
                onChange={(e) => updateFormData('currentLocation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="City, Country"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Work Locations</label>
              {formData.preferredLocations.map((location, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => updateArrayItem('preferredLocations', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="City, Country or Remote"
                  />
                  {formData.preferredLocations.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('preferredLocations', index)}
                      className="p-2 text-red-600 hover:bg-red-50 border border-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('preferredLocations', '')}
                className="flex items-center space-x-1 px-3 py-2 text-primary border border-primary hover:bg-primary/10 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Location</span>
              </button>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-primary mb-2">Current Job Title *</label>
              <input
                type="text"
                value={formData.currentTitle}
                onChange={(e) => updateFormData('currentTitle', e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-400 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                placeholder="e.g., Senior Software Engineer"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => updateFormData('industry', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="e.g., Technology, Healthcare"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  value={formData.experienceYears}
                  onChange={(e) => updateFormData('experienceYears', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
              {formData.skills.map((skill, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => updateArrayItem('skills', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="e.g., JavaScript, Project Management"
                  />
                  {formData.skills.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('skills', index)}
                      className="p-2 text-red-600 hover:bg-red-50 border border-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('skills', '')}
                className="flex items-center space-x-1 px-3 py-2 text-primary border border-primary hover:bg-primary/10 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Skill</span>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
              {formData.languages.map((lang, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={lang.language}
                    onChange={(e) => updateArrayItem('languages', index, { ...lang, language: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="Language"
                  />
                  <select
                    value={lang.proficiency}
                    onChange={(e) => updateArrayItem('languages', index, { ...lang, proficiency: e.target.value })}
                    className="px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  >
                    <option value="basic">Basic</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="native">Native</option>
                  </select>
                  {formData.languages.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('languages', index)}
                      className="p-2 text-red-600 hover:bg-red-50 border border-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('languages', { language: '', proficiency: 'intermediate' })}
                className="flex items-center space-x-1 px-3 py-2 text-primary border border-primary hover:bg-primary/10 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Language</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Salary Expectation</label>
                <input
                  type="text"
                  value={formData.salaryExpectation}
                  onChange={(e) => updateFormData('salaryExpectation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="e.g., $80,000 - $120,000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                <select
                  value={formData.availability}
                  onChange={(e) => updateFormData('availability', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
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
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Experience</h3>
              {formData.workExperience.map((exp, index) => (
                <div key={index} className="border border-gray-300 p-4 mb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateArrayItem('workExperience', index, { ...exp, company: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                      <input
                        type="text"
                        value={exp.position}
                        onChange={(e) => updateArrayItem('workExperience', index, { ...exp, position: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={exp.startDate}
                        onChange={(e) => updateArrayItem('workExperience', index, { ...exp, startDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        value={exp.endDate}
                        onChange={(e) => updateArrayItem('workExperience', index, { ...exp, endDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        disabled={exp.current}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exp.current}
                        onChange={(e) => updateArrayItem('workExperience', index, { ...exp, current: e.target.checked, endDate: e.target.checked ? '' : exp.endDate })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Currently working here</span>
                    </label>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={exp.description}
                      onChange={(e) => updateArrayItem('workExperience', index, { ...exp, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                      placeholder="Describe your role and responsibilities"
                    />
                  </div>

                  {formData.workExperience.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('workExperience', index)}
                      className="flex items-center space-x-1 px-3 py-2 text-red-600 border border-red-300 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Remove Experience</span>
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => addArrayItem('workExperience', {
                  company: '', position: '', startDate: '', endDate: '', current: false, description: '', achievements: ['']
                })}
                className="flex items-center space-x-1 px-3 py-2 text-primary border border-primary hover:bg-primary/10 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Work Experience</span>
              </button>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Education</h3>
              {formData.education.map((edu, index) => (
                <div key={index} className="border border-gray-300 p-4 mb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => updateArrayItem('education', index, { ...edu, institution: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => updateArrayItem('education', index, { ...edu, degree: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        placeholder="e.g., Bachelor's, Master's"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                      <input
                        type="text"
                        value={edu.fieldOfStudy}
                        onChange={(e) => updateArrayItem('education', index, { ...edu, fieldOfStudy: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        placeholder="e.g., Computer Science"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
                      <input
                        type="number"
                        value={edu.graduationYear}
                        onChange={(e) => updateArrayItem('education', index, { ...edu, graduationYear: parseInt(e.target.value) || new Date().getFullYear() })}
                        className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  {formData.education.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('education', index)}
                      className="flex items-center space-x-1 px-3 py-2 text-red-600 border border-red-300 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Remove Education</span>
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => addArrayItem('education', {
                  institution: '', degree: '', fieldOfStudy: '', graduationYear: new Date().getFullYear(), gpa: ''
                })}
                className="flex items-center space-x-1 px-3 py-2 text-primary border border-primary hover:bg-primary/10 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Education</span>
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Links</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website/Portfolio</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => updateFormData('website', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn Profile</label>
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => updateFormData('linkedin', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GitHub Profile</label>
                  <input
                    type="url"
                    value={formData.github}
                    onChange={(e) => updateFormData('github', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="https://github.com/yourusername"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cover Letter</label>
              <textarea
                value={formData.coverLetter}
                onChange={(e) => updateFormData('coverLetter', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                placeholder={`Tell us why you're interested in${roleDetails ? ` the ${roleDetails.title} position at ${roleDetails.company}` : ' this role'} and what makes you a great fit...`}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.agreeToTerms}
                  onChange={(e) => updateFormData('agreeToTerms', e.target.checked)}
                  className="mt-1 mr-3"
                  required
                />
                <label htmlFor="terms" className="text-sm text-gray-700">
                  I agree to the Terms of Service and Privacy Policy, and I consent to the processing of my personal data for recruitment purposes. *
                </label>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="contact"
                  checked={formData.allowContact}
                  onChange={(e) => updateFormData('allowContact', e.target.checked)}
                  className="mt-1 mr-3"
                />
                <label htmlFor="contact" className="text-sm text-gray-700">
                  I allow Maven to contact me about other relevant opportunities.
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection
        title="Create Your Profile"
        subtitle="Tell us about yourself and showcase your talents. Join thousands of verified Kenyan professionals in our network."
        showCta={false}
      />

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.history.back()}
              className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Jobs</span>
            </button>
          </div>

          {roleDetails && (
            <div className="mt-4 p-4 bg-primary/10 border border-primary/20">
              <h2 className="text-lg font-semibold text-primary">Applying for:</h2>
              <p className="text-gray-700">{roleDetails.title} at {roleDetails.company}</p>
              <p className="text-sm text-gray-600">{roleDetails.location}</p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-12 border-2 transition-colors ${
                    index <= currentStep
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-300 text-gray-500'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 transition-colors ${
                      index < currentStep ? 'bg-primary' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900">{steps[currentStep].title}</h3>
            <p className="text-gray-600">Step {currentStep + 1} of {steps.length}</p>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white border border-gray-200 p-6 sm:p-8">
          {renderStepContent()}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            {currentStep === steps.length - 1 ? (
              <button
                onClick={submitApplication}
                disabled={!formData.agreeToTerms || loading}
                className="flex items-center space-x-2 px-6 py-2 bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? (
                  <>
                    <div className="animate-spin border border-white h-4 w-4 border-b-2 border-transparent"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Submit Application</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                <span>Next</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}