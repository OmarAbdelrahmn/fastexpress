import { useLanguage } from '@/lib/context/LanguageContext';

// Keep notification wording together so the composer and tracker use the same terms.
const copy = {
  en: {
    ridersRefine: 'Search by name or company to see more riders.',
    recipientMode: 'Send to', broadcastOption: 'All eligible riders', singleRider: 'One rider', chooseRider: 'Choose a rider', riderSearch: 'Search by rider name or company…', ridersLoading: 'Loading riders…', riderResolving: 'Checking the selected rider…', ridersError: 'Could not load the riders. Please try again.', ridersEmpty: 'No riders are available to select.', ridersNoMatch: 'No matching riders. Try another name or company.', reloadRiders: 'Reload riders', singleRiderHelp: 'Only the rider you select will receive this message.', selectRiderError: 'Choose a rider from the list before reviewing your message.', company: 'Company',
    title: 'Notifications', subtitle: 'Keep riders informed with a clear, timely message.',
    compose: 'Create notification', track: 'Latest notification', message: 'Write your message', messageHelp: 'Start with English, then add translations for your riders.',
    audience: 'Recipients', scope: 'Eligible riders in your authorized scope', all: 'All eligible riders', scopeHelp: 'Only eligible riders with a registered device can receive this message.',
    en: 'English', ar: 'Arabic', bn: 'Bengali', required: 'Required', optional: 'Optional', fallback: 'Riders receive their preferred language. English is used when a translation is unavailable.',
    heading: 'Title', body: 'Message', titleExample: 'e.g. Your monthly report is ready', bodyExample: 'Let riders know what has changed and what to do next.',
    addTranslations: 'Add translations', translationsHelp: 'Make your message easier for every rider to understand.',
    destination: 'Where should a tap take them?', destinationHelp: 'Choose the screen that opens in the rider app.',
    home: 'Home', homeHelp: 'Open the app home screen', profile: 'Profile', profileHelp: 'Open their personal profile', performance_report: 'Performance report', performance_reportHelp: 'Open a monthly report',
    year: 'Year', month: 'Month', reportNote: 'Choose an existing report period. Keep private report values out of the message.',
    expiry: 'Delivery window', expiryHelp: 'Stop trying to deliver to offline devices after this time.',
    h1: '1 hour', h6: '6 hours', h12: '12 hours', h24: '24 hours · Recommended', d3: '3 days', d7: '7 days',
    preview: 'Message preview', previewHelp: 'An example of how your notification may appear.', app: 'Express Service', now: 'Now', emptyTitle: 'Your notification title', emptyBody: 'Your message will appear here as you type.',
    privacy: 'Visible on the lock screen', privacyHelp: 'Keep passwords, personal information and confidential report values out of your message.',
    review: 'Review notification', reviewHelp: 'Check the message and recipients before sending.', send: 'Confirm & send', edit: 'Back to editing', sending: 'Queuing…',
    errorRequired: 'Enter a title and message for each enabled language.', errorPeriod: 'Choose a valid report month that is not in the future.',
    uncertain: 'We could not confirm whether your notification was queued. Check or retry the same send to avoid creating a duplicate.', retry: 'Check / retry this send',
    permission: 'Your account is not permitted to perform this action. Contact your administrator.', session: 'Your session has expired. Sign in again to continue.', conflict: 'This send conflicts with an earlier attempt. Keep this draft and contact your administrator.', serverError: 'The service could not confirm the send. Retry the same send in a moment.', invalid: 'The notification could not be accepted. Check the content and report period.',
    rate: 'Too many requests. Please wait before trying again.', generic: 'Something went wrong. Please try again.',
    queued: 'Notification queued', queuedHelp: 'Your message is waiting to be processed.', expanding: 'Preparing recipients', expandingHelp: 'Recipients are being prepared. Counts may still increase.', processing: 'Sending to devices', processingHelp: 'Device deliveries are being processed.', completed: 'Processing complete', completedHelp: 'Review the delivery results below.', completed_with_errors: 'Finished with delivery issues', completed_with_errorsHelp: 'Some device deliveries failed or expired. Review the results below.', unknown: 'Status needs checking', unknownHelp: 'Automatic updates are paused. Refresh to check the latest status.',
    delivery: 'Delivery overview', auto: 'Updates automatically every 10 seconds', refresh: 'Refresh status', loading: 'Loading delivery status…', unavailable: 'This notification is unavailable, outside your scope, or no longer retained.', stale: 'Could not refresh. Showing the last available results.', cooldown: 'Updates paused briefly. They will resume automatically.',
    riders: 'Recipients', audienceRiders: 'Eligible riders', skippedNoDeviceRiders: 'Riders without a registered device', devices: 'Device deliveries', totalDeliveries: 'Total device deliveries', acceptedDeliveries: 'Accepted by Firebase', pendingDeliveries: 'Waiting to send', failedDeliveries: 'Failed', expiredDeliveries: 'Expired', skippedDeliveries: 'Skipped devices', acceptedNote: 'Accepted by Firebase does not confirm that a rider has seen or read the message.', zero: 'Finished without any accepted device deliveries.', created: 'Created', expires: 'Delivery window ends', new: 'Create another notification', empty: 'No notification to track yet', emptyHelp: 'After you send a notification, its delivery results will appear here automatically.', recovery: 'Only your latest send is available in this browser session. This is not a complete notification history.', missingRider: 'This rider is unavailable for notifications. Refresh their details and try again.', close: 'Close',
  },
  ar: {
    ridersRefine: 'ابحث بالاسم أو الشركة لعرض المزيد من المناديب.',
    recipientMode: 'إرسال إلى', broadcastOption: 'جميع المناديب المؤهلين', singleRider: 'مندوب واحد', chooseRider: 'اختر المندوب', riderSearch: 'ابحث باسم المندوب أو الشركة…', ridersLoading: 'جارٍ تحميل المناديب…', riderResolving: 'جارٍ التحقّق من المندوب المختار…', ridersError: 'تعذّر تحميل المناديب. يرجى المحاولة مجددًا.', ridersEmpty: 'لا يوجد مناديب متاحون للاختيار.', ridersNoMatch: 'لا توجد نتائج مطابقة. جرّب اسمًا أو شركة أخرى.', reloadRiders: 'إعادة تحميل المناديب', singleRiderHelp: 'سيصل الإشعار إلى المندوب الذي تختاره فقط.', selectRiderError: 'اختر مندوبًا من القائمة قبل مراجعة الرسالة.', company: 'الشركة',
    title: 'الإشعارات', subtitle: 'أبقِ المناديب على اطلاع برسالة واضحة في الوقت المناسب.',
    compose: 'إنشاء إشعار', track: 'آخر إشعار', message: 'اكتب رسالتك', messageHelp: 'ابدأ بالإنجليزية، ثم أضف الترجمات المناسبة للمناديب.',
    audience: 'المستلمون', scope: 'المناديب المؤهلون ضمن نطاق صلاحياتك', all: 'جميع المناديب المؤهلين', scopeHelp: 'يصل الإشعار إلى المناديب المؤهلين الذين لديهم جهاز مسجّل فقط.',
    en: 'الإنجليزية', ar: 'العربية', bn: 'البنغالية', required: 'مطلوب', optional: 'اختياري', fallback: 'تُستخدم لغة المندوب المفضّلة، وتُستخدم الإنجليزية عند عدم توفر ترجمة.',
    heading: 'العنوان', body: 'الرسالة', titleExample: 'مثال: تقريرك الشهري جاهز', bodyExample: 'وضّح للمندوب ما الجديد وما الخطوة التالية.',
    addTranslations: 'إضافة ترجمات', translationsHelp: 'اجعل رسالتك أوضح لجميع المناديب.',
    destination: 'ماذا يفتح عند الضغط على الإشعار؟', destinationHelp: 'اختر الشاشة التي تفتح في تطبيق المندوب.',
    home: 'الرئيسية', homeHelp: 'فتح الصفحة الرئيسية للتطبيق', profile: 'الملف الشخصي', profileHelp: 'فتح الملف الشخصي للمندوب', performance_report: 'تقرير الأداء', performance_reportHelp: 'فتح تقرير شهر محدد',
    year: 'السنة', month: 'الشهر', reportNote: 'اختر فترة تقرير متوفر، ولا تضع بيانات التقرير الخاصة في الرسالة.',
    expiry: 'مهلة توصيل الإشعار', expiryHelp: 'تتوقف محاولات التوصيل للأجهزة غير المتصلة بعد هذه المدة.',
    h1: 'ساعة واحدة', h6: '٦ ساعات', h12: '١٢ ساعة', h24: '٢٤ ساعة · موصى بها', d3: '٣ أيام', d7: '٧ أيام',
    preview: 'معاينة الرسالة', previewHelp: 'مثال توضيحي لشكل الإشعار لدى المندوب.', app: 'إكسبريس سيرفس', now: 'الآن', emptyTitle: 'عنوان الإشعار', emptyBody: 'ستظهر رسالتك هنا أثناء الكتابة.',
    privacy: 'قد تظهر الرسالة على شاشة القفل', privacyHelp: 'لا تضع كلمات مرور أو معلومات شخصية أو بيانات تقارير سرية في الرسالة.',
    review: 'مراجعة الإشعار', reviewHelp: 'راجع الرسالة والمستلمين قبل الإرسال.', send: 'تأكيد وإرسال', edit: 'العودة للتعديل', sending: 'جارٍ إضافة الإشعار للإرسال…',
    errorRequired: 'أدخل العنوان والرسالة لكل لغة مفعّلة.', errorPeriod: 'اختر شهر تقرير صحيحًا لا يقع في المستقبل.',
    uncertain: 'تعذّر التأكد من إضافة الإشعار للإرسال. تحقّق أو أعد محاولة الإرسال نفسه لتجنب إنشاء إشعار مكرر.', retry: 'التحقّق / إعادة المحاولة',
    permission: 'حسابك لا يملك صلاحية هذا الإجراء. يرجى التواصل مع المسؤول.', session: 'انتهت جلستك. سجّل الدخول مجددًا للمتابعة.', conflict: 'تعارض الإرسال مع محاولة سابقة. احتفظ بالمسودة وتواصل مع المسؤول.', serverError: 'تعذّر تأكيد الإرسال من الخدمة. أعد المحاولة نفسها بعد قليل.', invalid: 'تعذّر قبول الإشعار. راجع المحتوى وفترة التقرير.',
    rate: 'طلبات كثيرة. يرجى الانتظار قبل إعادة المحاولة.', generic: 'حدث خطأ. يرجى المحاولة مجددًا.',
    queued: 'الإشعار في قائمة الانتظار', queuedHelp: 'رسالتك بانتظار بدء المعالجة.', expanding: 'جارٍ تجهيز المستلمين', expandingHelp: 'جارٍ تجهيز المستلمين، وقد تزداد الأعداد.', processing: 'جارٍ الإرسال للأجهزة', processingHelp: 'تجري معالجة عمليات التوصيل للأجهزة.', completed: 'اكتملت المعالجة', completedHelp: 'راجع نتائج التوصيل أدناه.', completed_with_errors: 'اكتمل مع مشكلات في التوصيل', completed_with_errorsHelp: 'فشلت بعض عمليات التوصيل أو انتهت مهلتها. راجع النتائج أدناه.', unknown: 'تحتاج الحالة إلى التحقّق', unknownHelp: 'التحديث التلقائي متوقف. حدّث الحالة للاطلاع على آخر نتيجة.',
    delivery: 'متابعة التوصيل', auto: 'تحديث تلقائي كل ١٠ ثوانٍ', refresh: 'تحديث الحالة', loading: 'جارٍ تحميل حالة التوصيل…', unavailable: 'هذا الإشعار غير متاح، أو خارج صلاحياتك، أو انتهت مدة الاحتفاظ به.', stale: 'تعذّر التحديث. تظهر آخر نتائج متاحة.', cooldown: 'توقفت التحديثات مؤقتًا وستُستأنف تلقائيًا.',
    riders: 'المستلمون', audienceRiders: 'المناديب المؤهلون', skippedNoDeviceRiders: 'مناديب دون جهاز مسجّل', devices: 'التوصيل للأجهزة', totalDeliveries: 'إجمالي عمليات التوصيل', acceptedDeliveries: 'قبلتها خدمة Firebase', pendingDeliveries: 'بانتظار الإرسال', failedDeliveries: 'فشلت', expiredDeliveries: 'انتهت مهلتها', skippedDeliveries: 'أجهزة تم تجاوزها', acceptedNote: 'قبول Firebase للإشعار لا يؤكد ظهوره للمندوب أو قراءته.', zero: 'انتهت المعالجة دون قبول أي عملية توصيل للأجهزة.', created: 'وقت الإنشاء', expires: 'نهاية مهلة التوصيل', new: 'إنشاء إشعار آخر', empty: 'لا يوجد إشعار لمتابعته بعد', emptyHelp: 'بعد الإرسال، ستظهر نتائج توصيل الإشعار هنا تلقائيًا.', recovery: 'يتوفر آخر إرسال فقط في جلسة المتصفح هذه. هذه ليست قائمة كاملة بالإشعارات.', missingRider: 'هذا المندوب غير متاح للإشعارات. حدّث بياناته وحاول مجددًا.', close: 'إغلاق',
  },
};

export function useNotificationCopy() {
  const { locale } = useLanguage();
  return { c: copy[locale] || copy.en, locale, dir: locale === 'ar' ? 'rtl' : 'ltr' };
}
