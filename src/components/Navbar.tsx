import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ClipboardList, Plus, Building2, LogOut } from 'lucide-react';

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <ClipboardList className="h-6 w-6 text-gray-700" />
              <span className="ml-2 text-xl font-semibold text-gray-900">
                Roof Inspection
              </span>
            </Link>
            
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-gray-600"
              >
                Reports
              </Link>
              <Link
                to="/company"
                className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-gray-600"
              >
                Company
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link
              to="/reports/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Report
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;