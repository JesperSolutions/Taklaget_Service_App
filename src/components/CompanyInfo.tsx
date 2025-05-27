import React, { useState, useEffect } from 'react';
import { Building2, Users, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Company {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  parentGroup: {
    name: string;
    code: string;
  };
  departments: {
    id: string;
    name: string;
    code: string;
  }[];
}

function CompanyInfo() {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanyInfo();
  }, []);

  const fetchCompanyInfo = async () => {
    try {
      setError(null);
      const response = await fetch('http://localhost:3000/api/v1/company', {
        headers: {
          'x-api-token': 'ABC:INS-001-ABC',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setCompany(data.data);
      } else {
        throw new Error(data.message || 'Failed to load company data');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load company information';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto mt-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading company information</h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <button
                onClick={fetchCompanyInfo}
                className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Company Information
          </h2>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-gray-400" />
              <div className="ml-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900">{company.name}</h3>
                <p className="text-sm text-gray-500">Company Code: {company.code}</p>
              </div>
            </div>
            
            <div className="mt-5 border-t border-gray-200">
              <dl className="divide-y divide-gray-200">
                <div className="py-4">
                  <dt className="text-sm font-medium text-gray-500">Parent Group</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {company.parentGroup.name} ({company.parentGroup.code})
                  </dd>
                </div>
                <div className="py-4">
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="mt-1 text-sm text-gray-900">{company.address}</dd>
                </div>
                <div className="py-4">
                  <dt className="text-sm font-medium text-gray-500">Contact</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <div>{company.phone}</div>
                    <div>{company.email}</div>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Departments</h3>
            <div className="mt-5 border-t border-gray-200">
              <ul role="list" className="divide-y divide-gray-200">
                {company.departments.map((department) => (
                  <li key={department.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Users className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {department.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          Department Code: {department.code}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">API Information</h3>
          <div className="mt-5 border-t border-gray-200">
            <dl className="divide-y divide-gray-200">
              <div className="py-4">
                <dt className="text-sm font-medium text-gray-500">API Token Format</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <code className="px-2 py-1 bg-gray-100 rounded">
                    {company.code}:INSPECTOR_CODE
                  </code>
                </dd>
              </div>
              <div className="py-4">
                <dt className="text-sm font-medium text-gray-500">Example Token</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <code className="px-2 py-1 bg-gray-100 rounded">
                    {company.code}:INS-001-{company.code}
                  </code>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyInfo;