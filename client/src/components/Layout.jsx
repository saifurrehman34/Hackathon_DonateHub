import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Heart, LogOut, User, Home, PlusCircle, BarChart3 } from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <Heart className="h-8 w-8 text-red-500" />
                <span className="text-xl font-bold text-gray-900">DonateHub</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/"
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/') 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Home className="h-4 w-4" />
                    <span>Home</span>
                  </Link>

                  {user?.role === 'ngo' && (
                    <>
                      <Link
                        to="/create-campaign"
                        className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive('/create-campaign') 
                            ? 'bg-primary text-primary-foreground' 
                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <PlusCircle className="h-4 w-4" />
                        <span>Create Campaign</span>
                      </Link>
                      <Link
                        to="/ngo-dashboard"
                        className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive('/ngo-dashboard') 
                            ? 'bg-primary text-primary-foreground' 
                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <BarChart3 className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </>
                  )}

                  {user?.role === 'donor' && (
                    <Link
                      to="/donor-dashboard"
                      className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/donor-dashboard') 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <User className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  )}

                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">
                      Welcome, {user?.name}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                      className="flex items-center space-x-1"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login">
                    <Button variant="outline" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm">
                      Register
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Heart className="h-6 w-6 text-red-500" />
              <span className="text-lg font-semibold text-gray-900">DonateHub</span>
            </div>
            <p className="text-gray-600">
              Connecting hearts, changing lives. Making donations transparent and impactful.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              © 2024 DonateHub. Built with ❤️ for a better world.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

