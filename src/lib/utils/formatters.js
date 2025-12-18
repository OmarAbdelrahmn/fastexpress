/**
 * Formats an Arabic plate number by adding spaces between characters.
 * Example: "أبج١٢٣٤" -> "أ ب ج ١ ٢ ٣ ٤"
 * @param {string} plate - The plate number string
 * @returns {string} - The formatted plate number
 */
export const formatPlateNumber = (plate) => {
    if (!plate) return "";
    // Remove existing spaces to ensure clean input, then split and join with space
    return plate.replace(/\s/g, '').split('').join(' ');
};

/**
 * Converts a Hijri date to Gregorian Date object.
 * This is an approximation based on the Kuwaiti algorithm.
 * @param {number} hYear - Hijri Year
 * @param {number} hMonth - Hijri Month (1-12)
 * @param {number} hDay - Hijri Day
 * @returns {Date} - Gregorian Date
 */
const hijriToGregorian = (hYear, hMonth, hDay) => {
    const jd = Math.floor((11 * hYear + 3) / 30) + 354 * hYear + 30 * hMonth - Math.floor((hMonth - 1) / 2) + hDay + 1948440 - 385;

    let l = jd + 68569;
    let n = Math.floor((4 * l) / 146097);
    l = l - Math.floor((146097 * n + 3) / 4);
    let i = Math.floor((4000 * (l + 1)) / 1461001);
    l = l - Math.floor((1461 * i) / 4) + 31;
    let j = Math.floor((80 * l) / 2447);
    const day = l - Math.floor((2447 * j) / 80);
    l = Math.floor(j / 11);
    const month = j + 2 - 12 * l;
    const year = 100 * (n - 49) + i + l;

    return new Date(year, month - 1, day);
};

// Hijri month names in English
const hijriMonthsEn = [
    "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
    "Jumada al-Ula", "Jumada al-Akhirah", "Rajab", "Sha'ban",
    "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
];

// Hijri month names in Arabic (optional, but good for completeness using the same pattern)
// const hijriMonthsAr = [
//   "محرم", "صفر", "ربيع الأول", "ربيع الآخر",
//   "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان",
//   "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
// ];

/**
 * Formats a Hijri date string (e.g., "1448-09-27") to display both Hijri and Gregorian dates.
 * It detects if the input year is Hijri (roughly < 1500) or Gregorian.
 * @param {string} dateString - The date string
 * @returns {string} - Formatted string
 */
export const formatLicenseExpiry = (dateString) => {
    if (!dateString) return "";

    try {
        // Handle "YYYY-MM-DD" or ISO format
        const parts = dateString.split('T')[0].split('-');
        if (parts.length < 3) return dateString;

        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const d = parseInt(parts[2], 10);

        // Heuristic: If year is less than 1700, treat as Hijri. Current Gregorian is 2025+, current Hijri is ~1447.
        if (y < 1700) {
            // Input is Hijri
            const gDate = hijriToGregorian(y, m, d);
            const gString = gDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Format Hijri part manually since we have the components and want to trust them
            const hMonthName = hijriMonthsEn[m - 1] || m;
            const hString = `${hMonthName} ${d}, ${y} AH`;

            return `${hString} / ${gString}`;
        } else {
            // Input is likely Gregorian (or invalid)
            // Use standard conversion
            const date = new Date(dateString);
            const hString = date.toLocaleDateString('en-US-u-ca-islamic-umalqura', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const gString = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            return `${hString} / ${gString}`;
        }

    } catch (err) {
        return dateString;
    }
};
