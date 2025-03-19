
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu on route change
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <Link 
              to="/" 
              className="text-2xl font-semibold text-primary transition-colors duration-300"
            >
              MediConnect
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              <Link 
                to="/" 
                className={`transition-colors duration-300 ${
                  location.pathname === '/' 
                    ? 'text-primary font-medium' 
                    : 'text-foreground/70 hover:text-primary'
                }`}
              >
                Home
              </Link>

              {isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className={`transition-colors duration-300 ${
                      location.pathname === '/dashboard' 
                        ? 'text-primary font-medium' 
                        : 'text-foreground/70 hover:text-primary'
                    }`}
                  >
                    Dashboard
                  </Link>

                  <Button 
                    variant="ghost"
                    onClick={logout}
                    className="text-foreground/70 hover:text-primary hover:bg-transparent"
                  >
                    Logout
                  </Button>

                  <div className="relative">
                    <Button 
                      variant="outline" 
                      className="rounded-full w-10 h-10 p-0 border-primary"
                    >
                      <span className="sr-only">Profile</span>
                      <span className="text-sm text-primary font-semibold">
                        {user?.name.charAt(0).toUpperCase()}
                      </span>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Link 
                    to="/sign-in" 
                    className={`transition-colors duration-300 ${
                      location.pathname === '/sign-in' 
                        ? 'text-primary font-medium' 
                        : 'text-foreground/70 hover:text-primary'
                    }`}
                  >
                    Sign In
                  </Link>

                  <Link to="/sign-up">
                    <Button 
                      variant="default" 
                      className="rounded-full"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground/80 hover:text-primary focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md shadow-lg animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:text-primary"
            >
              Home
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:text-primary"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-foreground hover:text-primary"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/sign-in"
                  className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:text-primary"
                >
                  Sign In
                </Link>
                <Link
                  to="/sign-up"
                  className="block px-3 py-2 rounded-md text-base font-medium text-primary"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
