'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ApiService } from '@/lib/api/apiService';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import Input from '@/components/Ui/Input';
import PageHeader from '@/components/layout/pageheader';
import { useLanguage } from "@/lib/context/LanguageContext";
import { MapPin, Save, Search, Car, Navigation } from 'lucide-react';

export default function ChangeLocationPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [newLocation, setNewLocation] = useState('');

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const data = await ApiService.get('/api/vehicles/with-riders');
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading vehicles:', err);
    }
  };

  const searchVehicle = async () => {
    if (!searchTerm.trim()) {
      setErrorMessage(t('vehicles.enterPlateNumber'));
      return;
    }

    setSearchLoading(true);
    setErrorMessage('');
    try {
      const data = await ApiService.get(`/api/vehicles/plate/${searchTerm}`);
      if (data && data.length > 0) {
        setSelectedVehicle(data[0]);
        setNewLocation(data[0].location || '');
      } else {
        setErrorMessage(t('vehicles.vehicleNotFound'));
        setSelectedVehicle(null);
      }
    } catch (err) {
      console.error('Error searching vehicle:', err);
      setErrorMessage(t('vehicles.searchError'));
      setSelectedVehicle(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedVehicle) {
      setErrorMessage(t('vehicles.selectVehicleFirst'));
      return;
    }

    if (!newLocation.trim()) {
      setErrorMessage(t('vehicles.enterNewLocation'));
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await ApiService.put(
        `/api/vehicles/change-location/${selectedVehicle.plateNumberA}?newLocation=${encodeURIComponent(newLocation)}`
      );

      setSuccessMessage(t('vehicles.locationChangedSuccess'));
      setTimeout(() => {
        setSelectedVehicle(null);
        setSearchTerm('');
        setNewLocation('');
        loadVehicles();
      }, 2000);
    } catch (err) {
      console.error('Error changing location:', err);
      setErrorMessage(err?.message || t('vehicles.locationChangeError'));
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter(v =>
    v.plateNumberA?.includes(searchTerm) ||
    v.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full">
      {/* Full Width Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white px-8 py-8 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-xl">
              <MapPin size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">{t('vehicles.changeLocation')}</h1>
              <p className="text-teal-100">{t('vehicles.updateLocations')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6">

        {errorMessage && (
          <Alert
            type="error"
            title={t('common.error')}
            message={errorMessage}
            onClose={() => setErrorMessage('')}
          />
        )}

        {successMessage && (
          <Alert
            type="success"
            title={t('common.success')}
            message={successMessage}
            onClose={() => setSuccessMessage('')}
          />
        )}

        {/* Search Section */}
        <Card>
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Search size={20} />
              {t('vehicles.searchVehicle')}
            </h3>

            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('vehicles.enterPlateNumberPlaceholder')}
                  onKeyPress={(e) => e.key === 'Enter' && searchVehicle()}
                />
              </div>
              <Button
                onClick={searchVehicle}
                loading={searchLoading}
                disabled={searchLoading}
              >
                <Search size={18} className="ml-2" />
                {t('common.search')}
              </Button>
            </div>
          </div>

          {/* Selected Vehicle Info */}
          {selectedVehicle && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                <Car size={18} />
                {t('vehicles.vehicleInfo')}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-blue-600 mb-1">{t('vehicles.plateNumber')}</p>
                  <p className="font-medium text-gray-800">{selectedVehicle.plateNumberA}</p>
                </div>
                <div>
                  <p className="text-blue-600 mb-1">{t('vehicles.serialNumber')}</p>
                  <p className="font-medium text-gray-800">{selectedVehicle.serialNumber}</p>
                </div>
                <div>
                  <p className="text-blue-600 mb-1">{t('vehicles.currentLocation')}</p>
                  <p className="font-medium text-gray-800">{selectedVehicle.location || t('vehicles.notSpecified')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Change Location Form */}
          {selectedVehicle && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-gray-50 border-r-4 border-green-500 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Navigation className="text-green-600 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-green-800 mb-1">{t('vehicles.newLocation')}</h3>
                    <p className="text-sm text-green-600">
                      {t('vehicles.enterNewLocationDesc')}
                    </p>
                  </div>
                </div>
              </div>

              <Input
                label={t('vehicles.newLocation')}
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                required
                placeholder={t('vehicles.enterNewLocationPlaceholder')}
              />

              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setSelectedVehicle(null);
                    setSearchTerm('');
                    setNewLocation('');
                  }}
                  disabled={loading}
                >
                  {t('common.cancel')}
                </Button>
                <Button type="submit" loading={loading} disabled={loading}>
                  <Save size={18} className="ml-2" />
                  {t('vehicles.saveNewLocation')}
                </Button>
              </div>
            </form>
          )}
        </Card>

        {/* Recent Locations */}
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4">{t('vehicles.currentLocations')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVehicles.slice(0, 9).map((vehicle) => (
              <div
                key={vehicle.vehicleNumber}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                onClick={() => {
                  setSelectedVehicle(vehicle);
                  setSearchTerm(vehicle.plateNumberA);
                  setNewLocation(vehicle.location || '');
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-800">{vehicle.plateNumberA}</span>
                  <Car className="text-blue-500" size={16} />
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={14} />
                  <span>{vehicle.location || t('vehicles.notSpecified')}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}