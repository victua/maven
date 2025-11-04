import { Users, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export function Navbar({ currentPage }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigate = (page: string) => {
    if (page === 'home') {
      navigate('/');
    } else {
      navigate(`/${page}`);
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => handleNavigate('home')}>
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Maven</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <button
              onClick={() => handleNavigate('home')}
              className={`text-sm lg:text-base font-bold text-left ${
                currentPage === 'home' ? 'text-primary' : 'text-gray-700'
              } hover:text-primary transition-colors`}
            >
              HOME
            </button>
            <button
              onClick={() => handleNavigate('roles')}
              className={`text-sm lg:text-base font-bold text-left ${
                currentPage === 'roles' ? 'text-primary' : 'text-gray-700'
              } hover:text-primary transition-colors`}
            >
              ROLES
            </button>
            <button
              onClick={() => handleNavigate('about')}
              className={`text-sm lg:text-base font-bold text-left ${
                currentPage === 'about' ? 'text-primary' : 'text-gray-700'
              } hover:text-primary transition-colors`}
            >
              HOW IT WORKS
            </button>
            <button
              onClick={() => handleNavigate('pricing')}
              className={`text-sm lg:text-base font-bold text-left ${
                currentPage === 'pricing' ? 'text-primary' : 'text-gray-700'
              } hover:text-primary transition-colors`}
            >
              PRICING
            </button>
            <button
              onClick={() => handleNavigate('contact')}
              className={`text-sm lg:text-base font-bold text-left ${
                currentPage === 'contact' ? 'text-primary' : 'text-gray-700'
              } hover:text-primary transition-colors`}
            >
              CONTACT
            </button>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            <button
              onClick={() => handleNavigate('login')}
              className="text-sm lg:text-base font-medium text-gray-700 hover:text-primary transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => handleNavigate('signup')}
              className="bg-primary text-white px-3 py-1.5 lg:px-4 lg:py-2 border border-gray-300 hover:bg-primary/90 transition-colors text-sm lg:text-base font-medium"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 border border-gray-300 hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? (
              <X className="h-5 w-5 text-gray-700" />
            ) : (
              <Menu className="h-5 w-5 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
          <div className="px-4 py-2 space-y-1">
            <button
              onClick={() => handleNavigate('home')}
              className={`block w-full text-left px-3 py-2 border border-gray-300 text-sm font-bold ${
                currentPage === 'home' ? 'text-primary bg-primary/10' : 'text-gray-700 hover:bg-gray-100'
              } transition-colors`}
            >
              HOME
            </button>
            <button
              onClick={() => handleNavigate('roles')}
              className={`block w-full text-left px-3 py-2 border border-gray-300 text-sm font-bold ${
                currentPage === 'roles' ? 'text-primary bg-primary/10' : 'text-gray-700 hover:bg-gray-100'
              } transition-colors`}
            >
              ROLES
            </button>
            <button
              onClick={() => handleNavigate('about')}
              className={`block w-full text-left px-3 py-2 border border-gray-300 text-sm font-bold ${
                currentPage === 'about' ? 'text-primary bg-primary/10' : 'text-gray-700 hover:bg-gray-100'
              } transition-colors`}
            >
              HOW IT WORKS
            </button>
            <button
              onClick={() => handleNavigate('pricing')}
              className={`block w-full text-left px-3 py-2 border border-gray-300 text-sm font-bold ${
                currentPage === 'pricing' ? 'text-primary bg-primary/10' : 'text-gray-700 hover:bg-gray-100'
              } transition-colors`}
            >
              PRICING
            </button>
            <button
              onClick={() => handleNavigate('contact')}
              className={`block w-full text-left px-3 py-2 border border-gray-300 text-sm font-bold ${
                currentPage === 'contact' ? 'text-primary bg-primary/10' : 'text-gray-700 hover:bg-gray-100'
              } transition-colors`}
            >
              CONTACT
            </button>

            <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
              <button
                onClick={() => handleNavigate('login')}
                className="block w-full text-left px-3 py-2 border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => handleNavigate('signup')}
                className="block w-full text-left px-3 py-2 bg-primary text-white border border-gray-300 hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
