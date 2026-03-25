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
  const { t, locale } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [rider, setRider] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [loadingVehicle, setLoadingVehicle] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(null);

  const API_BASE = 'https://fastexpress.tryasp.net';

  useEffect(() => {
    if (iqamaNo) {
      loadRiderDetails();
      loadVehicleDetails();
      loadProfileImage();
    }
  }, [iqamaNo]);

  const loadProfileImage = async () => {
    try {
      const data = await ApiService.get(API_ENDPOINTS.EMPLOYEE_DOCUMENTS.PROFILE_IMAGE(iqamaNo));
      if (data?.profileImageUrl) {
        const url = data.profileImageUrl.startsWith('http')
          ? data.profileImageUrl
          : `${API_BASE}${data.profileImageUrl}`;
        setProfileImageUrl(url);
      }
    } catch {
      // Profile image not uploaded yet — silently ignore
    }
  };

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

  const getCompactDate = (dateString) => {
    if (!dateString) return t('profile.notSpecified');
    if (typeof dateString === 'string' && dateString.includes('-')) {
       const parts = dateString.split('T')[0].split('-');
       if (parts.length === 3) {
         return `${parts[0]}/${parts[1].padStart(2, '0')}/${parts[2].padStart(2, '0')}`;
       }
    }
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  const getCompactHijriDate = (dateString) => {
    if (!dateString) return t('profile.notSpecified');
    if (typeof dateString === 'string') {
      const parts = dateString.split('T')[0].split(/[-/]/);
      if (parts.length === 3 && parts[0].startsWith('14')) {
        return `${parts[0]}/${parts[1].padStart(2, '0')}/${parts[2].padStart(2, '0')}`;
      }
    }
    try {
      const d = new Date(dateString);
      const parts = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).formatToParts(d);
      const year = parts.find(p => p.type === 'year')?.value;
      const month = parts.find(p => p.type === 'month')?.value;
      const day = parts.find(p => p.type === 'day')?.value;
      if (year && month && day) return `${year}/${month}/${day}`;
      return getCompactDate(dateString);
    } catch {
      return getCompactDate(dateString);
    }
  };

  const getDateStatusClass = (dateString, type) => {
    if (!dateString) return type === 'bg' ? 'bg-blue-50' : type === 'text' ? 'text-blue-300' : 'text-gray-500';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return type === 'bg' ? 'bg-blue-50' : type === 'text' ? 'text-blue-300' : 'text-gray-500';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    
    const isPastOrToday = target.getTime() <= today.getTime();
    
    if (type === 'bg') return isPastOrToday ? 'bg-red-400 text-white' : 'bg-blue-400 text-white';
    if (type === 'title') return isPastOrToday ? 'text-red-100' : 'text-blue-100';
    if (type === 'val') return 'text-white font-bold';
    return '';
  };

  return (
    <div className="space-y-3">
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
      <div className={`p-3 rounded-lg ${rider.status === 'enable'
        ? 'bg-green-50 border-r-4 border-green-500'
        : 'bg-red-50 border-r-4 border-red-500'
        }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl flex-shrink-0 ${rider.status === 'enable' ? 'bg-green-100' : 'bg-red-100'
            }`}>
            <Shield className={rider.status === 'enable' ? 'text-green-600' : 'text-red-600'} size={24} />
          </div>
          <div>
            <h2 className={`text-lg sm:text-2xl font-bold ${rider.status === 'enable' ? 'text-green-800' : 'text-red-800'
              }`}>
              {rider.status === 'enable'
                ? (rider.isEmployee ? t('riders.activeEmployee') : t('riders.activeRider'))
                : (rider.isEmployee ? t('riders.inactiveEmployee') : t('riders.inactiveStatus'))
              }
            </h2>
            <p className={`text-sm ${rider.status === 'enable' ? 'text-green-600' : 'text-red-600'}`}>
              {rider.isEmployee ? t('riders.employeeCurrentStatus') : t('riders.currentStatus')}
            </p>
          </div>
        </div>
      </div>
      {/* Card 1: Profile Header + All Personal/Work Info */}
      <Card>
        {/* Top: Avatar + key identity info */}
        <div className="flex items-start gap-4 mb-3">
          <div className="flex flex-col items-center shrink-0">
            <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
              {profileImageUrl ? (
                <img src={profileImageUrl} alt={rider.nameAR} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
              ) : (
                <User size={32} className="text-gray-400" />
              )}
            </div>
            <button onClick={() => router.push(`/admin/riders/${iqamaNo}/images`)} className="mt-1 text-xs text-blue-600 hover:underline flex items-center gap-1">
              <ImageIcon size={11} /> {t('riderImages.manageDocuments')}
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 flex-1">
            <div>
              <p className="text-xs text-gray-500">{t('riders.nameArabic')}</p>
              <p className="font-bold text-gray-800 text-sm">{rider.nameAR}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('riders.nameEnglish')}</p>
              <p className="font-bold text-gray-800 text-sm">{rider.nameEN}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('riders.phone')}</p>
              <p className="font-medium text-gray-800 text-sm flex items-center gap-1"><Phone size={11} />{rider.phone}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('riders.country')}</p>
              <p className="font-medium text-gray-800 text-sm flex items-center gap-1"><MapPin size={11} />{rider.country}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('riders.iqamaNumber')}</p>
              <div className="flex flex-wrap items-center gap-1">
                <span className="font-medium text-gray-800 text-sm">{rider.iqamaNo}</span>
                <span className={`${getDateStatusClass(rider.iqamaEndM, 'bg')} text-[13px] text-white px-1.5 py-0.5 rounded-sm`}>{getCompactDate(rider.iqamaEndM)}</span>
                <span className={`${getDateStatusClass(rider.iqamaEndM, 'bg')} text-[13px] text-white px-1.5 py-0.5 rounded-sm`}>{getCompactHijriDate(rider.iqamaEndH)}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('riders.passportNumber')}</p>
              <div className="flex flex-wrap items-center gap-1">
                <span className="font-medium text-gray-800 text-sm">{rider.passportNo || t('profile.notSpecified')}</span>
                {rider.passportEnd && (
                  <span className={`${getDateStatusClass(rider.passportEnd, 'bg')} text-[13px] text-white px-1.5 py-0.5 rounded-sm`}>{getCompactDate(rider.passportEnd)}</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('riders.dateOfBirth')}</p>
              <p className="font-medium text-gray-800 text-sm">{formatDate(rider.dateOfBirth)}</p>
            </div>
          </div>
        </div>

        {/* Divider and bottom section */}
        <div className="border-t border-gray-100 pt-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2">
            {!rider.isEmployee && (
              <div>
                <p className="text-xs text-gray-500">{t('riders.workingId')}</p>
                <p className="font-bold text-blue-700 text-lg leading-none">{rider.workingId || 'N/A'}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500">{t('riders.jobTitle')}</p>
              <p className="font-medium text-gray-800 text-sm">{rider.jobTitle}</p>
            </div>
            {!rider.isEmployee && (
              <div>
                <p className="text-xs text-gray-500">{t('riders.company')}</p>
                <p className="font-medium text-gray-800 text-sm flex items-center gap-1"><Building size={11} />{rider.companyName}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500">{t('riders.housing')}</p>
              <p className="font-medium text-gray-800 text-sm">{rider.housingAddress || t('profile.notSpecified')}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Vehicle Information */}
      {(loadingVehicle || vehicle) && (
        <Card>
          <h3 className="text-base font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Truck size={18} />
            {t('vehicles.title') || 'Vehicle Information'}
          </h3>
          {loadingVehicle ? (
            <div className="flex justify-center py-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
      {/* Sponsor, Banking & Registration - merged */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">{t('riders.sponsor')}</p>
            <p className="font-medium text-gray-800">{rider.sponsor}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">{t('riders.sponsorNumber')}</p>
            <p className="font-medium text-gray-800">{rider.sponsorNo || t('profile.notSpecified')}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">{t('riders.ibanNumber')}</p>
            <p className="font-medium text-gray-800 font-mono">{rider.iban || t('profile.notSpecified')}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">{t('riders.inKSA')}</p>
            <p className={`font-bold ${rider.inksa ? 'text-green-600' : 'text-gray-600'}`}>
              {rider.inksa ? t('common.yes') : t('common.no')}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">{t('riders.addedToSystem')}</p>
            <p className="font-medium text-gray-800">{formatDate(rider.createdAt)}</p>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <Card>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          <Button
            onClick={() => router.push(`/admin/riders/${iqamaNo}/edit`)}
            variant="secondary"
            className="text-xs !py-1.5"
          >
            <Edit size={14} className="ml-1" />
            {t('riders.editData')}
          </Button>
          <Button
            onClick={() => router.push('/admin/riders')}
            variant="secondary"
            className="text-xs !py-1.5"
          >
            <ArrowRight size={14} className="ml-1" />
            {t('navigation.backToList')}
          </Button>
          <Button
            onClick={() => router.push(`/admin/shifts/rider/${rider.workingId}`)}
            variant="secondary"
            className="text-xs !py-1.5"
          >
            <Calendar size={14} className="ml-1" />
            {t('riders.viewShifts')}
          </Button>
          <Button
            onClick={() => router.push(`/admin/reports/riders/${rider.workingId}/renge`)}
            variant="secondary"
            className="text-xs !py-1.5"
          >
            <FileText size={14} className="ml-1" />
            {t('reports.title')}
          </Button>
          <Button
            onClick={() => router.push(`/admin/riders/working-id-history?iqama=${iqamaNo}`)}
            variant="secondary"
            className="text-xs !py-1.5"
          >
            <FileText size={14} className="ml-1" />
            {t('riders.workingIdHistory')}
          </Button>
          <Button
            onClick={() => router.push(`/admin/riders/${iqamaNo}/images`)}
            className="!bg-indigo-600 hover:!bg-indigo-700 text-white text-xs !py-1.5"
          >
            <ImageIcon size={14} className={locale === 'ar' ? 'ml-1' : 'mr-1'} />
            {t('riderImages.manageDocuments')}
          </Button>
        </div>
      </Card>
    </div>
  );
}