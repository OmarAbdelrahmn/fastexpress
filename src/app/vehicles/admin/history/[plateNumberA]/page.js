"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ApiService } from '@/lib/api/apiService';

export default function VehicleHistory() {
  const [vehicleData, setVehicleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const router = useRouter();
  const params = useParams();
  const plateNumber = params?.plateNumberA  || '';

  useEffect(() => {
    const fetchVehicleHistory = async () => {
      try {
        setLoading(true);
        const response = await ApiService.get(`/api/vehicle-history/${plateNumber}`);
        
        setVehicleData(response); 
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to fetch vehicle history');
        setLoading(false);
      }
    };

    if (plateNumber) {
      fetchVehicleHistory();
    } else {
      setError('No plate number provided');
      setLoading(false);
    }
  }, [plateNumberA]); // Added plateNumberA to dependency array

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vehicle history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-semibold text-lg mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!vehicleData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md">
          <h2 className="text-yellow-800 font-semibold text-lg mb-2">No Data Found</h2>
          <p className="text-yellow-600">No vehicle history found for this plate number.</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (statusType) => {
    switch (statusType) {
      case 1:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white px-6 py-4">
            <h1 className="text-2xl font-bold">Vehicle History</h1>
            <p className="text-blue-100 mt-1">Plate Number: {vehicleData.plateNumberA}</p>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vehicle Information */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Vehicle Information</h2>
                
                <div>
                  <label className="text-sm text-gray-500">Vehicle Number</label>
                  <p className="text-gray-900 font-medium">{vehicleData.vehicleNumber || 'N/A'}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-500">Serial Number</label>
                  <p className="text-gray-900 font-medium">{vehicleData.serialNumber || 'N/A'}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-500">Plate Number (English)</label>
                  <p className="text-gray-900 font-medium">{vehicleData.plateNumberE || 'N/A'}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-500">Manufacturer</label>
                  <p className="text-gray-900 font-medium">{vehicleData.manufacturer || 'N/A'}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-500">Manufacture Year</label>
                  <p className="text-gray-900 font-medium">{vehicleData.manufactureYear || 'N/A'}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-500">Location</label>
                  <p className="text-gray-900 font-medium">{vehicleData.location || 'N/A'}</p>
                </div>
              </div>

              {/* Owner & Rider Information */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Owner & Rider Information</h2>
                
                <div>
                  <label className="text-sm text-gray-500">Owner Name</label>
                  <p className="text-gray-900 font-medium">{vehicleData.ownerName || 'N/A'}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-500">Owner ID</label>
                  <p className="text-gray-900 font-medium">{vehicleData.ownerId || 'N/A'}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-500">Rider Name</label>
                  <p className="text-gray-900 font-medium">{vehicleData.riderName || 'N/A'}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-500">Rider Name (English)</label>
                  <p className="text-gray-900 font-medium">{vehicleData.riderNameE || 'N/A'}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-500">Employee Iqama No</label>
                  <p className="text-gray-900 font-medium">{vehicleData.employeeIqamaNo || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Status Section */}
            <div className="mt-6 pt-6 border-t">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Status</label>
                  <div className="mt-1">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(vehicleData.statusType)}`}>
                      {vehicleData.statusTypeDisplay || 'Unknown'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-500">Reason</label>
                  <p className="text-gray-900 font-medium">{vehicleData.reason || 'N/A'}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-500">Active Status</label>
                  <p className="text-gray-900 font-medium">
                    {vehicleData.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>

              {vehicleData.timestamp && (
                <div className="mt-4">
                  <label className="text-sm text-gray-500">Last Updated</label>
                  <p className="text-gray-900 font-medium">
                    {new Date(vehicleData.timestamp).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Back Button */}
          <div className="px-6 py-4 bg-gray-50 border-t">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}