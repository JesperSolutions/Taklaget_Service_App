import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, Calendar, User, MapPin, Phone, Mail, FileText, Loader2, AlertTriangle, Image as ImageIcon, X, Trash2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import debounce from 'lodash/debounce';

interface Checklist {
  id: string;
  accessConditions: string;
  accessComments?: string;
  fallProtection: string;
  fallProtectionComments?: string;
  existingRoofMaterial?: string;
  roofAge?: number;
  roofArea?: number;
  technicalExecution?: string;
  welds?: string;
  drainage?: string;
  edgesAndCrowns?: string;
  skylights?: string;
  technicalInstallations?: string;
  insulationType?: string;
  greenRoof?: string;
  solarPanels?: string;
  noxTreatment: string;
  rainwaterCollection: string;
  recreationalAreas: string;
}

interface Report {
  id: string;
  reportCode: string;
  inspectionDate: string;
  notes: string;
  status: string;
  checklist?: Checklist;
  inspector: {
    name: string;
    email: string;
    phone: string;
  };
  department: {
    name: string;
  };
  customer: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    email: string;
  };
  findings: {
    id: string;
    title: string;
    description: string;
    severity: string;
    images: {
      id: string;
      url: string;
      comment?: string;
      severity?: string;
    }[];
  }[];
}

interface Finding {
  title: string;
  description: string;
  severity: string;
}

const STATUS_OPTIONS = {
  IKKE_RELEVANT: 'Ikke relevant',
  IKKE_ETABLERET: 'Ikke etableret',
  ETABLERET: 'Etableret'
} as const;

const CHECKLIST_ITEMS = [
  { key: 'accessConditions', label: 'Adgangsforhold', hasStatus: true, hasComments: true, commentKey: 'accessComments' },
  { key: 'fallProtection', label: 'Faldsikring / rækværk', hasStatus: true, hasComments: true, commentKey: 'fallProtectionComments' },
  { key: 'existingRoofMaterial', label: 'Eksisterende tag materiale', hasComments: true },
  { key: 'roofAge', label: 'Alder på eksisterende tag materiale', type: 'number' },
  { key: 'technicalExecution', label: 'Tekniske udførelse', hasComments: true },
  { key: 'welds', label: 'Svejsninger', hasComments: true },
  { key: 'drainage', label: 'Afløb', hasComments: true },
  { key: 'edgesAndCrowns', label: 'Opkanter og murkroner', hasComments: true },
  { key: 'skylights', label: 'Ovenlys', hasComments: true },
  { key: 'technicalInstallations', label: 'Tekniske installationer', hasComments: true },
  { key: 'insulationType', label: 'Vurdering af isoleringstype', hasComments: true },
  { key: 'greenRoof', label: 'Grønt tag', hasComments: true },
  { key: 'solarPanels', label: 'Solceller', hasComments: true },
  { key: 'noxTreatment', label: 'NOx reducerende behandling', hasStatus: true },
  { key: 'rainwaterCollection', label: 'Regnvandsopsamling', hasStatus: true },
  { key: 'recreationalAreas', label: 'Rekreative områder', hasStatus: true }
];

function ReportDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [newFinding, setNewFinding] = useState<Finding>({
    title: '',
    description: '',
    severity: 'LOW'
  });
  const [showFindingForm, setShowFindingForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const debouncedSave = useCallback(
    debounce(async (data: Partial<Checklist>) => {
      if (!id) return;

      try {
        const response = await fetch(`/api/v1/reports/${id}/checklist`, {
          method: checklist ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-token': 'ABC:INS-001-ABC',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to save checklist');
        }

        const result = await response.json();
        setChecklist(result.data);
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Error saving checklist:', error);
      }
    }, 1000),
    [id, checklist]
  );

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    if (id) {
      fetchReport();
    }
  }, [id]);

  const fetchReport = async () => {
    try {
      const response = await fetch(`/api/v1/reports/${id}`, {
        headers: {
          'x-api-token': 'ABC:INS-001-ABC',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch report');
      }

      const data = await response.json();
      setReport(data.data);
      setChecklist(data.data.checklist || null);
    } catch (error) {
      toast.error('Failed to load report');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleChecklistChange = (field: keyof Checklist, value: string | number) => {
    if (!report) return;

    const updatedChecklist = {
      ...checklist,
      [field]: value,
      accessConditions: checklist?.accessConditions || 'IKKE_RELEVANT',
      fallProtection: checklist?.fallProtection || 'IKKE_RELEVANT',
      noxTreatment: checklist?.noxTreatment || 'IKKE_RELEVANT',
      rainwaterCollection: checklist?.rainwaterCollection || 'IKKE_RELEVANT',
      recreationalAreas: checklist?.recreationalAreas || 'IKKE_RELEVANT',
    };

    setChecklist(updatedChecklist);
    setHasUnsavedChanges(true);
    debouncedSave(updatedChecklist);
  };

  const handleAddFinding = async () => {
    try {
      const response = await fetch(`/api/v1/reports/${id}/findings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-token': 'ABC:INS-001-ABC',
        },
        body: JSON.stringify(newFinding),
      });

      if (!response.ok) {
        throw new Error('Failed to add finding');
      }

      toast.success('Finding added successfully');
      setNewFinding({ title: '', description: '', severity: 'LOW' });
      setShowFindingForm(false);
      fetchReport();
    } catch (error) {
      toast.error('Failed to add finding');
    }
  };

  const handleDeleteFinding = async (findingId: string) => {
    try {
      const response = await fetch(`/api/v1/reports/${id}/findings/${findingId}`, {
        method: 'DELETE',
        headers: {
          'x-api-token': 'ABC:INS-001-ABC',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete finding');
      }

      toast.success('Finding deleted successfully');
      fetchReport();
    } catch (error) {
      toast.error('Failed to delete finding');
    }
  };

  const handleImageUpload = async (findingId: string, files: FileList) => {
    setUploading(findingId);
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await fetch(`/api/v1/reports/${findingId}/images`, {
        method: 'POST',
        headers: {
          'x-api-token': 'ABC:INS-001-ABC',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload images');
      }

      toast.success('Images uploaded successfully');
      fetchReport();
    } catch (error) {
      toast.error('Failed to upload images');
    } finally {
      setUploading(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/v1/reports/images/${imageId}`, {
        method: 'DELETE',
        headers: {
          'x-api-token': 'ABC:INS-001-ABC',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      toast.success('Image deleted successfully');
      fetchReport();
    } catch (error) {
      toast.error('Failed to delete image');
    }
  };

  const handleSubmitReport = async () => {
    try {
      const response = await fetch(`/api/v1/reports/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-api-token': 'ABC:INS-001-ABC',
        },
        body: JSON.stringify({ status: 'SUBMITTED' }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      toast.success('Report submitted successfully');
      fetchReport();
    } catch (error) {
      toast.error('Failed to submit report');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case 'LOW':
        return 'bg-blue-100 text-blue-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'CRITICAL':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Report: {report.reportCode}
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${getStatusColor(report.status)}`}>
            {report.status}
          </span>
          {report.status === 'DRAFT' && (
            <button
              onClick={handleSubmitReport}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Submit Report
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Inspection Details</h3>
            <div className="mt-5 border-t border-gray-200">
              <dl className="divide-y divide-gray-200">
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Date</dt>
                  <dd className="mt-1 flex items-center text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    {new Date(report.inspectionDate).toLocaleDateString()}
                  </dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Inspector</dt>
                  <dd className="mt-1 flex items-center text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    <User className="h-5 w-5 text-gray-400 mr-2" />
                    {report.inspector.name}
                  </dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Department</dt>
                  <dd className="mt-1 flex items-center text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    <Building2 className="h-5 w-5 text-gray-400 mr-2" />
                    {report.department.name}
                  </dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Notes</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {report.notes || 'No notes provided'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Customer Information</h3>
            <div className="mt-5 border-t border-gray-200">
              <dl className="divide-y divide-gray-200">
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {report.customer.name}
                  </dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="mt-1 flex items-center text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                    {report.customer.address}, {report.customer.city}, {report.customer.state} {report.customer.zipCode}
                  </dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 flex items-center text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    <Phone className="h-5 w-5 text-gray-400 mr-2" />
                    {report.customer.phone || 'Not provided'}
                  </dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 flex items-center text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    <Mail className="h-5 w-5 text-gray-400 mr-2" />
                    {report.customer.email || 'Not provided'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Inspection Checklist</h3>
            {hasUnsavedChanges && (
              <span className="text-sm text-gray-500">
                Saving changes...
              </span>
            )}
          </div>
          <div className="mt-5 border-t border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status / Value
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comments
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {CHECKLIST_ITEMS.map((item) => (
                    <tr key={item.key}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.label}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.hasStatus ? (
                          <select
                            value={checklist?.[item.key as keyof Checklist] || 'IKKE_RELEVANT'}
                            onChange={(e) => handleChecklistChange(item.key as keyof Checklist, e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          >
                            {Object.entries(STATUS_OPTIONS).map(([value, label]) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </select>
                        ) : item.type === 'number' ? (
                          <input
                            type="number"
                            value={checklist?.[item.key as keyof Checklist] || ''}
                            onChange={(e) => handleChecklistChange(item.key as keyof Checklist, Number(e.target.value) || 0)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        ) : (
                          <input
                            type="text"
                            value={checklist?.[item.key as keyof Checklist] || ''}
                            onChange={(e) => handleChecklistChange(item.key as keyof Checklist, e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.hasComments && (
                          <input
                            type="text"
                            value={checklist?.[item.commentKey as keyof Checklist] || ''}
                            onChange={(e) => handleChecklistChange(item.commentKey as keyof Checklist, e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="Add comments..."
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Inspection Findings</h3>
              <p className="mt-2 text-sm text-gray-500">
                Document issues found during the inspection.
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <button
                onClick={() => setShowFindingForm(!showFindingForm)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Add Finding
              </button>
            </div>
          </div>

          {showFindingForm && (
            <div className="mt-6 bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={newFinding.title}
                    onChange={(e) => setNewFinding({ ...newFinding, title: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="severity" className="block text-sm font-medium text-gray-700">
                    Severity
                  </label>
                  <select
                    id="severity"
                    value={newFinding.severity}
                    onChange={(e) => setNewFinding({ ...newFinding, severity: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={newFinding.description}
                    onChange={(e) => setNewFinding({ ...newFinding, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowFindingForm(false)}
                    className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddFinding}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Add Finding
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6">
            {report.findings?.map((finding) => (
              <div key={finding.id} className="mb-4 bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertTriangle className={`h-5 w-5 ${getSeverityColor(finding.severity)} rounded-full p-1`} />
                    <h4 className="ml-2 text-lg font-medium">{finding.title}</h4>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(finding.severity)}`}>
                      {finding.severity}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      id={`file-${finding.id}`}
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={(e) => e.target.files && handleImageUpload(finding.id, e.target.files)}
                      ref={fileInputRef}
                    />
                    <label
                      htmlFor={`file-${finding.id}`}
                      className={`cursor-pointer inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
                        uploading === finding.id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {uploading === finding.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      <span className="ml-2">Upload Images</span>
                    </label>
                    <button
                      onClick={() => handleDeleteFinding(finding.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-gray-600">{finding.description}</p>

                {finding.images && finding.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {finding.images.map((image) => (
                      <div key={image.id} className="relative group">
                        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200">
                          <img
                            src={image.url}
                            alt={`Finding ${finding.title}`}
                            className="object-cover cursor-pointer"
                            onClick={() => setSelectedImage(image.url)}
                          />
                          <button
                            onClick={() => handleDeleteImage(image.id)}
                            className="absolute top-2 right-2 p-1 bg-red-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                        {image.comment && (
                          <p className="mt-1 text-sm text-gray-500">{image.comment}</p>
                        )}
                        {image.severity && (
                          <span className={`mt-1 inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getSeverityColor(image.severity)}`}>
                            {image.severity}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {report.findings?.length === 0 && (
              <div className="text-center py-12">
                <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No findings</h3>
                <p className="mt-1 text-sm text-gray-500">Add findings to document inspection issues.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative max-w-4xl mx-auto">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full"
            >
              <X className="h-6 w-6" />
            </button>
            <img src={selectedImage} alt="Preview" className="max-h-[80vh] rounded-lg" />
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportDetails;