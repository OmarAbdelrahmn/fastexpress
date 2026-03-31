'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import PageHeader from '@/components/layout/pageheader';
import { Camera, Search, ArrowRight, Image, Users } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function RiderImagesPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [riderImages, setRiderImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'with' | 'without'

  useEffect(() => {
    loadRiderImages();
  }, []);

  const loadRiderImages = async () => {
    setLoading(true);
    try {
      const data = await ApiService.get(API_ENDPOINTS.EMPLOYEE_DOCUMENTS.ALL);
      setRiderImages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading rider images:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (iqamaNo) => {
    router.push(`/admin/riders/${iqamaNo}/details`);
  };

  // Filter + search
  const filtered = riderImages.filter((rider) => {
    const matchesSearch =
      rider.nameAR?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rider.nameEN?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rider.iqamaNo?.toString().includes(searchTerm);

    const matchesFilter =
      filter === 'all' ||
      (filter === 'with' && rider.profileImageUrl) ||
      (filter === 'without' && !rider.profileImageUrl);

    return matchesSearch && matchesFilter;
  });

  const withPhoto = riderImages.filter((r) => r.profileImageUrl).length;
  const withoutPhoto = riderImages.filter((r) => !r.profileImageUrl).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="صور الموظفين"
        subtitle={`إجمالي: ${riderImages.length} سجل`}
        icon={Camera}
        actionButton={{
          text: 'العودة للموظفين',
          icon: <ArrowRight size={18} />,
          onClick: () => router.push('/admin/riders'),
        }}
      />

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 px-4">
        <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600 mb-0.5">الإجمالي</p>
              <p className="text-2xl font-bold text-blue-700">{riderImages.length}</p>
            </div>
            <Users className="text-blue-400" size={32} />
          </div>
        </div>
        <div className="bg-green-50 border-r-4 border-green-500 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-600 mb-0.5">مع صورة</p>
              <p className="text-2xl font-bold text-green-700">{withPhoto}</p>
            </div>
            <Camera className="text-green-400" size={32} />
          </div>
        </div>
        <div className="bg-red-50 border-r-4 border-red-400 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-red-500 mb-0.5">بدون صورة</p>
              <p className="text-2xl font-bold text-red-600">{withoutPhoto}</p>
            </div>
            <Image className="text-red-400" size={32} />
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="px-4 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="ابحث بالاسم أو رقم الإقامة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'الكل', color: 'blue' },
            { key: 'with', label: 'مع صورة', color: 'green' },
            { key: 'without', label: 'بدون صورة', color: 'red' },
          ].map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === key
                  ? color === 'blue'
                    ? 'bg-blue-600 text-white'
                    : color === 'green'
                    ? 'bg-green-600 text-white'
                    : 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="px-4">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <div className="w-7 h-7 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-500">جاري تحميل الصور...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
            <Image size={48} className="opacity-30" />
            <p className="text-sm">لا توجد نتائج</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
            {filtered.map((rider) => (
              <button
                key={rider.iqamaNo}
                onClick={() => handleViewDetails(rider.iqamaNo)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 hover:border-purple-300 hover:shadow-lg hover:scale-[1.04] transition-all duration-200 bg-white group text-center"
              >
                {/* Avatar */}
                <div className="relative">
                  {rider.profileImageUrl ? (
                    <img
                      src={`${'https://fastexpress.tryasp.net'}${rider.profileImageUrl}`}
                      alt={rider.nameAR}
                      className="w-34 h-34 rounded-full object-cover object-center border-2 border-purple-200 group-hover:border-purple-500 transition-colors"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 items-center justify-center border-2 border-purple-200 group-hover:border-purple-400 transition-colors"
                    style={{ display: rider.profileImageUrl ? 'none' : 'flex' }}
                  >
                    <span className="text-purple-700 font-bold text-3xl">
                      {rider.nameAR?.charAt(0) || '?'}
                    </span>
                  </div>
                  {!rider.profileImageUrl && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-400 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-white text-[9px] font-bold">!</span>
                    </div>
                  )}
                  {rider.profileImageUrl && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-white text-[9px] font-bold">✓</span>
                    </div>
                  )}
                </div>

                {/* Name */}
                <div className="w-full">
                  <p className="text-sm font-bold text-gray-900 truncate leading-tight">{rider.nameAR}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{rider.nameEN}</p>
                  <p className="text-xs text-gray-300 font-mono mt-0.5 truncate">{rider.iqamaNo}</p>
                </div>

                {/* Badge */}
                {!rider.profileImageUrl ? (
                  <span className="text-[9px] bg-red-50 text-red-500 font-semibold px-2 py-0.5 rounded-full border border-red-100">
                    بدون صورة
                  </span>
                ) : (
                  <span className="text-[9px] bg-green-50 text-green-600 font-semibold px-2 py-0.5 rounded-full border border-green-100">
                    لديه صورة
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}