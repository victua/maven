import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  db,
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where
} from '../../lib/firebase';

interface NewRequestPageProps {
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

export function NewRequestPage({ onNavigate }: NewRequestPageProps) {
  const { agency } = useAuth();
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [selectedJobType, setSelectedJobType] = useState<JobType | null>(null);
  const [formData, setFormData] = useState({
    job_title: '',
    quantity: '',
    destination_country: '',
    requirements: '',
    salary_range: '',
    deadline: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingJobTypes, setFetchingJobTypes] = useState(true);

  useEffect(() => {
    fetchJobTypes();
  }, []);

  const fetchJobTypes = async () => {
    try {
      const jobTypesRef = collection(db, 'job_types');
      const jobTypesQuery = query(jobTypesRef, where('active', '==', true));
      const jobTypesSnapshot = await getDocs(jobTypesQuery);
      const jobTypesData = jobTypesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as JobType[];

      setJobTypes(jobTypesData);
    } catch (error) {
      console.error('Error fetching job types:', error);
    } finally {
      setFetchingJobTypes(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'job_title') {
      const jobType = jobTypes.find(jt => jt.title === value);
      setSelectedJobType(jobType || null);

      // Auto-populate requirements if a job type is selected
      if (jobType) {
        setFormData({
          ...formData,
          [name]: value,
          requirements: `Required qualifications:\n• Minimum ${jobType.min_experience_years} years of experience\n• Skills: ${jobType.skills_required.join(', ')}\n\nAdditional requirements:\n• `
        });
      } else {
        setFormData({
          ...formData,
          [name]: value
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!agency) {
      setError('Agency information not found');
      return;
    }

    setLoading(true);

    try {
      const requestsRef = collection(db, 'hiring_requests');
      await addDoc(requestsRef, {
        agency_id: agency.id,
        job_title: formData.job_title,
        quantity: parseInt(formData.quantity),
        destination_country: formData.destination_country,
        requirements: formData.requirements,
        salary_range: formData.salary_range,
        deadline: formData.deadline,
        status: 'pending',
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });

      onNavigate('agency/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to create request. Please try again.');
      } else {
        setError('Failed to create request. Please try again.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="w-[96%] ml-auto mr-4 px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">New Hiring Request</h1>
          <p className="text-gray-600 mb-8">
            Submit your hiring needs and our team will match qualified candidates from our verified database
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-secondary/10 border border-secondary/20 text-secondary px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="job_title" className="block text-sm font-semibold text-gray-900 mb-2">
                Job Title / Position
              </label>
              {fetchingJobTypes ? (
                <div className="w-full px-4 py-3 border border-gray-300 bg-gray-50 text-gray-500">
                  Loading job types...
                </div>
              ) : (
                <>
                  <select
                    id="job_title"
                    name="job_title"
                    value={formData.job_title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    required
                  >
                    <option value="">Select a job type</option>
                    {jobTypes.map((jobType) => (
                      <option key={jobType.id} value={jobType.title}>
                        {jobType.title} - {jobType.category}
                      </option>
                    ))}
                  </select>
                  {selectedJobType && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 text-sm">
                      <p className="font-medium text-blue-900">{selectedJobType.title}</p>
                      <p className="text-blue-700 mb-2">{selectedJobType.description}</p>
                      <p className="text-blue-600">
                        <strong>Category:</strong> {selectedJobType.category} |
                        <strong> Min. Experience:</strong> {selectedJobType.min_experience_years} years
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="quantity" className="block text-sm font-semibold text-gray-900 mb-2">
                  Number of Positions
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="50"
                  min="1"
                  required
                />
              </div>

              <div>
                <label htmlFor="destination_country" className="block text-sm font-semibold text-gray-900 mb-2">
                  Destination Country
                </label>
                <input
                  type="text"
                  id="destination_country"
                  name="destination_country"
                  value={formData.destination_country}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="e.g., Dubai, UAE"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="requirements" className="block text-sm font-semibold text-gray-900 mb-2">
                Requirements & Qualifications
              </label>
              <textarea
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                placeholder="List the key requirements, qualifications, experience, and skills needed for this position..."
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="salary_range" className="block text-sm font-semibold text-gray-900 mb-2">
                  Salary Range
                </label>
                <input
                  type="text"
                  id="salary_range"
                  name="salary_range"
                  value={formData.salary_range}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="e.g., $1,500 - $2,000/month"
                  required
                />
              </div>

              <div>
                <label htmlFor="deadline" className="block text-sm font-semibold text-gray-900 mb-2">
                  Deadline
                </label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  required
                />
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/20 p-4">
              <p className="text-sm text-primary">
                <strong>What happens next?</strong> Our Maven team will review your request and begin matching
                qualified candidates from our verified database. You'll be notified as we progress through the
                fulfillment process.
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => onNavigate('agency/dashboard')}
                className="flex-1 bg-gray-100 text-gray-900 py-3 hover:bg-gray-200 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary text-white py-3 hover:bg-primary/90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
