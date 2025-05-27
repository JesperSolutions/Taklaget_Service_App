import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Calendar, User, MapPin, Phone, Mail, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Inspector {
  id: string;
  name: string;
  code: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

function CreateReport() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [inspectors, setInspectors] = useState<Inspector[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  
  const [formData, setFormData] = useState({
    inspectionDate: new Date().toISOString().split('T')[0],
    inspectorId: '',
    departmentId: '',
    notes: '',
    customer: {
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      email: '',
    },
  });

  useEffect(() => {
    fetchInspectorsAndDepartments();
  }, []);

  const fetchInspectorsAndDepartments = async () => {
    try {
      const [inspectorsRes, departmentsRes] = await Promise.all([
        fetch('/api/v1/company/inspectors', {
          headers: {
            'x-api-token': 'ABC:INS-001-ABC',
          },
        }),
        fetch('/api/v1/company/departments', {
          headers: {
            'x-api-token': 'ABC:INS-001-ABC',
          },
        }),
      ]);

      if (!inspectorsRes.ok || !departmentsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const inspectorsData = await inspectorsRes.json();
      const departmentsData = await departmentsRes.json();

      if (inspectorsData.success && departmentsData.success) {
        setInspectors(inspectorsData.data);
        setDepartments(departmentsData.data);
      } else {
        throw new Error('Failed to load form data');
      }
    } catch (error) {
      toast.error('Failed to load form data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/v1/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-token': 'ABC:INS-001-ABC',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create report');
      }

      if (data.success && data.data.id) {
        toast.success('Report created successfully');
        navigate(`/reports/${data.data.id}`);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create report';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('customer.')) {
      const customerField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        customer: {
          ...prev.customer,
          [customerField]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            New Inspection Report
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="inspectionDate" className="block text-sm font-medium text-gray-700">
                  Inspection Date
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="inspectionDate"
                    id="inspectionDate"
                    required
                    value={formData.inspectionDate}
                    onChange={handleInputChange}
                    className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="inspectorId" className="block text-sm font-medium text-gray-700">
                  Inspector
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="inspectorId"
                    name="inspectorId"
                    required
                    value={formData.inspectorId}
                    onChange={handleInputChange}
                    className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select an inspector</option>
                    {inspectors.map(inspector => (
                      <option key={inspector.id} value={inspector.id}>
                        {inspector.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700">
                  Department
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="departmentId"
                    name="departmentId"
                    required
                    value={formData.departmentId}
                    onChange={handleInputChange}
                    className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select a department</option>
                    {departments.map(department => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <div className="mt-1">
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Customer Information</h3>
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label htmlFor="customer.name" className="block text-sm font-medium text-gray-700">
                  Customer Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="customer.name"
                    id="customer.name"
                    required
                    value={formData.customer.name}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="customer.address" className="block text-sm font-medium text-gray-700">
                  Street Address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="customer.address"
                    id="customer.address"
                    required
                    value={formData.customer.address}
                    onChange={handleInputChange}
                    className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="customer.city" className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="customer.city"
                    id="customer.city"
                    required
                    value={formData.customer.city}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="customer.state" className="block text-sm font-medium text-gray-700">
                  State
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="customer.state"
                    id="customer.state"
                    value={formData.customer.state}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="customer.zipCode" className="block text-sm font-medium text-gray-700">
                  ZIP Code
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="customer.zipCode"
                    id="customer.zipCode"
                    required
                    value={formData.customer.zipCode}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="customer.phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="customer.phone"
                    id="customer.phone"
                    value={formData.customer.phone}
                    onChange={handleInputChange}
                    className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="customer.email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="customer.email"
                    id="customer.email"
                    value={formData.customer.email}
                    onChange={handleInputChange}
                    className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {loading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              <>
                <FileText className="h-5 w-5 mr-2" />
                Create Report
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateReport;