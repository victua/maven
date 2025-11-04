import { useState } from 'react';
import { Users } from 'lucide-react';
import { HeroSection } from '../../components/HeroSection';
import { useAuth } from '../../contexts/AuthContext';

interface SignupPageProps {
  onNavigate: (page: string) => void;
}

export function SignupPage({ onNavigate }: SignupPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    password: '',
    confirmPassword: '',
    subscription_tier: 'basic',
    subscription_status: 'trial'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await signUp(formData.email, formData.password, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        subscription_tier: formData.subscription_tier,
        subscription_status: formData.subscription_status
      });
      onNavigate('dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to create account. Please try again.');
      } else {
        setError('Failed to create account. Please try again.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <HeroSection
        title="Create Your Agency Account"
        subtitle="Start your 14-day free trial today and connect with verified Kenyan talent for your recruitment needs."
        showCta={false}
      />

      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-[96%] max-w-2xl">

        <div className="bg-white shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-secondary/10 border border-secondary/20 text-secondary px-4 py-3">
                {error}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                  Agency Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-secondary focus:border-transparent outline-none"
                  placeholder="Your Agency Ltd"
                  required
                />
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-semibold text-gray-900 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-secondary focus:border-transparent outline-none"
                  placeholder="United Arab Emirates"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-secondary focus:border-transparent outline-none"
                placeholder="agency@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-secondary focus:border-transparent outline-none"
                placeholder="+971 50 123 4567"
                required
              />
            </div>

            <div>
              <label htmlFor="subscription_tier" className="block text-sm font-semibold text-gray-900 mb-2">
                Subscription Plan
              </label>
              <select
                id="subscription_tier"
                name="subscription_tier"
                value={formData.subscription_tier}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-secondary focus:border-transparent outline-none"
              >
                <option value="basic">Basic - $299/month</option>
                <option value="pro">Professional - $599/month</option>
                <option value="enterprise">Enterprise - Custom</option>
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-secondary focus:border-transparent outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-900 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-secondary focus:border-transparent outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-secondary text-white py-3 hover:bg-secondary/90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Start Free Trial'}
            </button>

            <p className="text-sm text-gray-600 text-center">
              By signing up, you agree to our Terms of Service and Privacy Policy
            </p>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => onNavigate('login')}
                className="text-secondary hover:text-secondary/80 font-semibold"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
