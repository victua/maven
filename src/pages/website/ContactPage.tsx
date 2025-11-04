import { Mail, Phone, MapPin } from 'lucide-react';
import { HeroSection } from '../../components/HeroSection';

export function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection
        title="Get in Touch"
        subtitle="Have questions about our platform? Our team is here to help you get started with connecting to quality Kenyan talent."
        showCta={false}
      />

      <section className="w-[96%] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

        <div className="grid md:grid-cols-2 gap-12">
          <div className="animate-slideInLeft">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-md card-hover">
                <div className="bg-gradient-to-br from-primary/10 to-primary/20 p-3 rounded-full">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                  <a href="mailto:info@maven.co.ke" className="text-primary hover:text-primary/80 transition-colors">
                    info@maven.co.ke
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-md card-hover">
                <div className="bg-gradient-to-br from-secondary/10 to-secondary/20 p-3 rounded-full">
                  <Phone className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                  <a href="tel:+254700000000" className="text-secondary hover:text-secondary/80 transition-colors">
                    +254 700 000 000
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-md card-hover">
                <div className="bg-gradient-to-br from-primary/10 to-primary/20 p-3 rounded-full">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Office</h3>
                  <p className="text-gray-600">
                    Nairobi, Kenya<br />
                    Westlands, ABC Place
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 bg-gradient-to-br from-secondary/10 to-green-50 p-6 rounded-xl shadow-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Business Hours</h3>
              <p className="text-gray-700">Monday - Friday: 8:00 AM - 6:00 PM EAT</p>
              <p className="text-gray-700">Saturday: 9:00 AM - 2:00 PM EAT</p>
              <p className="text-gray-700">Sunday: Closed</p>
            </div>
          </div>

          <div className="animate-slideInRight">
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                    Agency Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="Your agency name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="agency@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="+254 700 000 000"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none transition-all"
                    placeholder="Tell us about your hiring needs..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-blue-600 text-white py-3 rounded-lg hover:shadow-xl transition-all duration-300 font-semibold transform hover:scale-105"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
