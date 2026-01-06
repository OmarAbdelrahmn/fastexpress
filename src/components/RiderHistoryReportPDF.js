import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font,
    Image,
} from '@react-pdf/renderer';

Font.register({
    family: 'Cairo',
    src: '/fonts/7.ttf',
});

// Styles
const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Cairo',
        fontSize: 11,
    },
    // Header
    header: {
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#2563eb', // Blue
        borderRadius: 6,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerContent: {
        flex: 1,
    },
    headerLogo: {
        width: 50,
        height: 50,
    },
    logoContainer: {
        alignItems: 'center',
    },
    companyName: {
        fontSize: 11,
        color: '#ffffff',
        textAlign: 'center',
        marginTop: 4,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 15,
        color: '#dbeafe',
        textAlign: 'center',
    },

    // Rider Info Section
    riderInfoCard: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        backgroundColor: '#f8fafc',
        padding: 10,
        borderRadius: 4,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    riderName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1e293b',
        textAlign: 'right',
    },
    riderSubDetail: {
        fontSize: 11,
        color: '#64748b',
        textAlign: 'right',
        marginTop: 2,
    },
    datesContainer: {
        alignItems: 'flex-end',
    },
    dateLabel: {
        fontSize: 10,
        color: '#64748b',
    },
    dateValue: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },

    // Yearly Columns
    yearsContainer: {
        flexDirection: 'row-reverse', // RTL Layout for columns
        gap: 10,
        flexWrap: 'wrap',
    },
    yearColumn: {
        width: '24%', // Show approx 4 years per row
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 4,
        backgroundColor: '#f8fafc',
        marginBottom: 10,
    },
    yearHeader: {
        backgroundColor: '#2563eb',
        padding: 8,
        alignItems: 'center',
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
    },
    yearHeaderText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    monthsHeader: {
        flexDirection: 'row-reverse',
        backgroundColor: '#f1f5f9',
        paddingVertical: 5,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderColor: '#e2e8f0',
    },
    monthRow: {
        flexDirection: 'row-reverse',
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderColor: '#e2e8f0',
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    monthName: {
        fontSize: 11,
        color: '#1e293b',
        textAlign: 'right',
    },
    ordersBadge: {
        backgroundColor: '#eff6ff',
        color: '#1d4ed8',
        fontSize: 11,
        fontWeight: 'bold',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
    },

    // Footer
    pageFooter: {
        position: 'absolute',
        bottom: 20,
        left: 30,
        right: 30,
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        fontSize: 9,
        color: '#94a3b8',
        borderTopWidth: 1,
        borderColor: '#e2e8f0',
        paddingTop: 8,
    },
});

const RiderHistoryReportPDF = ({ data }) => {
    if (!data) return null;

    // Process data to group by year (same logic as page.js)
    const yearsData = data.monthlyData?.reduce((acc, month) => {
        const year = month.year;
        if (!acc[year]) acc[year] = [];
        acc[year].push(month);
        return acc;
    }, {}) || {};

    const sortedYears = Object.entries(yearsData).sort(([yearA], [yearB]) => yearB - yearA);

    return (
        <Document>
            <Page size="A4" style={styles.page} orientation="landscape">
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>سجل المندوب التاريخي</Text>
                        <Text style={styles.headerSubtitle}>عرض الأداء الشهري</Text>
                    </View>
                    <View style={styles.logoContainer}>
                        <Image src="/2.png" style={styles.headerLogo} />
                        <Text style={styles.companyName}>شركة الخدمة السريعة{"\n"}express service</Text>
                    </View>
                </View>

                {/* Rider Info */}
                <View style={styles.riderInfoCard}>
                    <View>
                        <Text style={styles.riderName}>{data.riderName}</Text>
                        <Text style={styles.riderSubDetail}>ID: {data.workingId}</Text>
                        <Text style={styles.riderSubDetail}>Iqama: {data.iqamaNo}</Text>
                    </View>
                    <View style={styles.datesContainer}>
                        <Text style={styles.dateLabel}>تاريخ أول اداء</Text>
                        <Text style={styles.dateValue}>{data.firstShiftDate || '-'}</Text>
                        <Text style={styles.dateLabel}>تاريخ آخر اداء</Text>
                        <Text style={styles.dateValue}>{data.lastShiftDate || '-'}</Text>
                    </View>
                </View>

                {/* Years Columns */}
                <View style={styles.yearsContainer}>
                    {sortedYears.map(([year, months]) => (
                        <View key={year} style={styles.yearColumn}>
                            {/* Year Title */}
                            <View style={styles.yearHeader}>
                                <Text style={styles.yearHeaderText}>{year}</Text>
                            </View>

                            {/* Table Header inside Column */}
                            <View style={styles.monthsHeader}>
                                <Text style={[styles.dateLabel, { flex: 1, textAlign: 'right' }]}>الشهر</Text>
                                <Text style={[styles.dateLabel, { textAlign: 'left' }]}>الطلبات</Text>
                            </View>

                            {/* Months Rows */}
                            {months.map((month, idx) => (
                                <View key={idx} style={styles.monthRow}>
                                    <Text style={styles.monthName}>{month.monthName}</Text>
                                    <Text style={styles.ordersBadge}>{month.totalAcceptedOrders}</Text>
                                </View>
                            ))}
                        </View>
                    ))}
                </View>

                {/* Footer */}
                <View style={styles.pageFooter} fixed>
                    <Text>تم الإنشاء: {new Date().toLocaleString('en-US')}</Text>
                    <Text>Fastexpress</Text>
                </View>
            </Page>
        </Document>
    );
};

export default RiderHistoryReportPDF;
