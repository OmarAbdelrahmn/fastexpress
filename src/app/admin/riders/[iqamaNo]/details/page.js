'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { formatPlateNumber } from '@/lib/utils/formatters';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import PageHeader from '@/components/layout/pageheader';
import {
  User,
  ArrowRight,
  Edit,
  Calendar,
  MapPin,
  Phone,
  CreditCard,
  Building,
  Package,
  FileText,
  Shield,
  Briefcase,
  Truck,
  Image as ImageIcon
} from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function RiderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const iqamaNo = params?.iqamaNo;
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [rider, setRider] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [loadingVehicle, setLoadingVehicle] = useState(false);

  useEffect(() => {
    if (iqamaNo) {
      loadRiderDetails();
      loadVehicleDetails();
    }
  }, [iqamaNo]);

  const loadVehicleDetails = async () => {
    setLoadingVehicle(true);
    try {
      const data = await ApiService.get(API_ENDPOINTS.RIDER.VEHICLE(iqamaNo));
      if (data) {
        setVehicle(data);
      }
    } catch (err) {
      console.error('Error loading vehicle details:', err);
    } finally {
      setLoadingVehicle(false);
    }
  };

  const loadRiderDetails = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await ApiService.get(API_ENDPOINTS.RIDER.BY_IQAMA(iqamaNo));

      if (data && data.length > 0) {
        setRider(data[0]);
      } else {
        setErrorMessage(t('riders.riderNotFound'));
      }
    } catch (err) {
      console.error('Error loading rider details:', err);
      setErrorMessage(err?.message || t('riders.loadDetailsError'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t('riders.riderDetails')}
          subtitle={t('common.loading')}
          icon={User}
        />
        <Card>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">{t('riders.loadingDetails')}</p>
          </div>
        </Card>
      </div>
    );
  }

  if (errorMessage || !rider) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t('riders.riderDetails')}
          subtitle={t('riders.errorOccurred')}
          icon={User}
          actionButton={{
            text: t('common.back'),
            icon: <ArrowRight size={18} />,
            onClick: () => router.back(),
            variant: 'secondary'
          }}
        />
        <Alert
          type="error"
          title={t('common.error')}
          message={errorMessage || t('riders.riderNotFound')}
        />
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return t('profile.notSpecified');
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatHijriDate = (dateString) => {
    if (!dateString) return t('profile.notSpecified');
    try {
      return new Date(dateString).toLocaleDateString('en-US-u-ca-islamic-umalqura', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (err) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${rider.nameAR}`}
        subtitle={rider.isEmployee
          ? `${t('riders.iqamaNumber')}: ${rider.iqamaNo}`
          : `${t('riders.workingId')}: ${rider.workingId || 'N/A'} | ${t('riders.iqamaNumber')}: ${rider.iqamaNo}`
        }
        icon={User}
        actionButton={{
          text: t('common.edit'),
          icon: <Edit size={18} />,
          onClick: () => router.push(`/admin/riders/${iqamaNo}/edit`)
        }}
      />

      {/* Status Banner */}
      <div className={`p-6 rounded-lg ${rider.status === 'enable'
        ? 'bg-green-50 border-r-4 border-green-500'
        : 'bg-red-50 border-r-4 border-red-500'
        }`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${rider.status === 'enable' ? 'bg-green-100' : 'bg-red-100'
            }`}>
            <Shield className={rider.status === 'enable' ? 'text-green-600' : 'text-red-600'} size={32} />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${rider.status === 'enable' ? 'text-green-800' : 'text-red-800'
              }`}>
              {rider.status === 'enable'
                ? (rider.isEmployee ? t('riders.activeEmployee') : t('riders.activeRider'))
                : (rider.isEmployee ? t('riders.inactiveEmployee') : t('riders.inactiveStatus'))
              }
            </h2>
            <p className={rider.status === 'enable' ? 'text-green-600' : 'text-red-600'}>
              {rider.isEmployee ? t('riders.employeeCurrentStatus') : t('riders.currentStatus')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <User size={20} />
            {t('riders.personalInfo')}
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('riders.nameArabic')}</p>
                <p className="font-bold text-gray-800 text-lg">{rider.nameAR}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('riders.nameEnglish')}</p>
                <p className="font-bold text-gray-800 text-lg">{rider.nameEN}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('riders.iqamaNumber')}</p>
                <p className="font-medium text-gray-800">{rider.iqamaNo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('riders.passportNumber')}</p>
                <p className="font-medium text-gray-800">{rider.passportNo || t('profile.notSpecified')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('riders.country')}</p>
                <p className="font-medium text-gray-800 flex items-center gap-2">
                  <MapPin size={14} />
                  {rider.country}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('riders.phone')}</p>
                <p className="font-medium text-gray-800 flex items-center gap-2">
                  <Phone size={14} />
                  {rider.phone}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">{t('riders.dateOfBirth')}</p>
              <p className="font-medium text-gray-800 flex items-center gap-2">
                <Calendar size={14} />
                {formatDate(rider.dateOfBirth)}
              </p>
            </div>
          </div>
        </Card>

        {/* Rider Work Information */}
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Briefcase size={20} />
            {t('riders.workInfo')}
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {!rider.isEmployee && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('riders.workingId')}</p>
                  <p className="font-bold text-blue-700 text-xl">{rider.workingId || 'N/A'}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('riders.jobTitle')}</p>
                <p className="font-medium text-gray-800">{rider.jobTitle}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {!rider.isEmployee && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('riders.company')}</p>
                  <p className="font-medium text-gray-800 flex items-center gap-2">
                    <Building size={14} />
                    {rider.companyName}
                  </p>
                </div>
              )}
              {!rider.isEmployee && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('riders.licenseNumber')}</p>
                  <p className="font-medium text-gray-800 flex items-center gap-2">
                    <FileText size={14} />
                    {rider.licenseNumber}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {!rider.isEmployee && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('riders.tshirtSize')}</p>
                  <p className="font-medium text-gray-800 flex items-center gap-2">
                    <Package size={14} />
                    {rider.tshirtSize}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('riders.housing')}</p>
                <p className="font-medium text-gray-800">
                  {rider.housingAddress || t('profile.notSpecified')}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Iqama & Passport Details */}
      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FileText size={20} />
          {t('riders.iqamaPassportDetails')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-600 mb-1 text-sm">{t('riders.iqamaEndGregorian')}</p>
            <p className="font-bold text-gray-800">{formatDate(rider.iqamaEndM)}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-600 mb-1 text-sm">{t('riders.iqamaEndHijri')}</p>
            <p className="font-bold text-gray-800">{formatHijriDate(rider.iqamaEndH)}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-600 mb-1 text-sm">{t('riders.passportEnd')}</p>
            <p className="font-bold text-gray-800">{formatDate(rider.passportEnd)}</p>
          </div>
        </div>
      </Card>

      {/* Vehicle Information */}
      {(loadingVehicle || vehicle) && (
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Truck size={20} />
            {t('vehicles.title') || 'Vehicle Information'}
          </h3>
          {loadingVehicle ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('vehicles.plateNumber') || 'Plate Number'}</p>
                  <p className="font-bold text-gray-800 text-lg">{formatPlateNumber(vehicle.plateNumberA)}</p>
                  <p className="text-xs text-gray-500">{vehicle.plateNumberE}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('vehicles.vehicleType') || 'Vehicle Type'}</p>
                  <p className="font-medium text-gray-800">{vehicle.vehicleType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('vehicles.vehicleNumber') || 'Vehicle Number'}</p>
                  <p className="font-medium text-gray-800">{vehicle.vehicleNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('vehicles.manufacturer') || 'Manufacturer'}</p>
                  <p className="font-medium text-gray-800">{vehicle.manufacturer}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('vehicles.manufactureYear') || 'Manufacture Year'}</p>
                  <p className="font-medium text-gray-800">{vehicle.manufactureYear}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('vehicles.licenseExpiry') || 'License Expiry Date'}</p>
                  <p className="font-medium text-gray-800 flex items-center gap-2">
                    <Calendar size={14} />
                    {formatDate(vehicle.licenseExpiryDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('common.location') || 'Location'}</p>
                  <p className="font-medium text-gray-800 flex items-center gap-2">
                    <MapPin size={14} />
                    {vehicle.location}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('vehicles.ownerName') || 'Owner Name'}</p>
                  <p className="font-medium text-gray-800">{vehicle.ownerName}</p>
                </div>
              </div>

              {/* Vehicle Images */}
              {(vehicle.vehicleImagePath || vehicle.licenseImagePath || vehicle.exstraImage || vehicle.exstraImage1) && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <ImageIcon size={16} />
                    {t('common.images') || 'Images'}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {vehicle.vehicleImagePath && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">{t('vehicles.vehicleImage') || 'Vehicle Image'}</p>
                        <img
                          src={vehicle.vehicleImagePath}
                          alt="Vehicle"
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      </div>
                    )}
                    {vehicle.licenseImagePath && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">{t('vehicles.licenseImage') || 'License Image'}</p>
                        <img
                          src={vehicle.licenseImagePath}
                          alt="License"
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      </div>
                    )}
                    {vehicle.exstraImage && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">{t('common.extraImage') || 'Extra Image 1'}</p>
                        <img
                          src={vehicle.exstraImage}
                          alt="Extra 1"
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      </div>
                    )}
                    {vehicle.exstraImage1 && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">{t('common.extraImage') || 'Extra Image 2'}</p>
                        <img
                          src={vehicle.exstraImage1}
                          alt="Extra 2"
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      )}
      {/* Sponsor Information */}
      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Shield size={20} />
          {t('riders.sponsorInfo')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">{t('riders.sponsor')}</p>
            <p className="font-medium text-gray-800">{rider.sponsor}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">{t('riders.sponsorNumber')}</p>
            <p className="font-medium text-gray-800">{rider.sponserNo || t('profile.notSpecified')}</p>
          </div>
        </div>
      </Card>

      {/* Banking Information */}
      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <CreditCard size={20} />
          {t('riders.bankingInfo')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">{t('riders.ibanNumber')}</p>
            <p className="font-medium text-gray-800 font-mono">{rider.iban || t('profile.notSpecified')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">{t('riders.inKSA')}</p>
            <p className={`font-bold ${rider.inksa ? 'text-green-600' : 'text-gray-600'}`}>
              {rider.inksa ? t('common.yes') : t('common.no')}
            </p>
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar size={20} />
          {t('riders.registration')}
        </h3>
        <div>
          <p className="text-sm text-gray-600 mb-1">{t('riders.addedToSystem')}</p>
          <p className="font-medium text-gray-800">
            {formatDate(rider.createdAt)}
          </p>
        </div>
      </Card>

      {/* Action Buttons */}
      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-4">{t('riders.quickActions')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            onClick={() => router.push(`/admin/riders/${iqamaNo}/edit`)}
            variant="secondary"
          >
            <Edit size={18} className="ml-2" />
            {t('riders.editData')}
          </Button>
          <Button
            onClick={() => router.push('/admin/riders')}
            variant="secondary"
          >
            <ArrowRight size={18} className="ml-2" />
            {t('navigation.backToList')}
          </Button>
          <Button
            onClick={() => router.push(`/admin/shifts/rider/${rider.workingId}`)}
            variant="secondary"
          >
            <Calendar size={18} className="ml-2" />
            {t('riders.viewShifts')}
          </Button>
          <Button
            onClick={() => router.push(`/admin/reports/riders/${rider.workingId}/renge`)}
            variant="secondary"
          >
            <FileText size={18} className="ml-2" />
            {t('reports.title')}
          </Button>
          <Button
            onClick={() => router.push(`/admin/riders/working-id-history?iqama=${iqamaNo}`)}
            variant="secondary"
          >
            <FileText size={18} className="ml-2" />
            {t('riders.workingIdHistory')}
          </Button>
        </div>
      </Card>
    </div>
  );
}