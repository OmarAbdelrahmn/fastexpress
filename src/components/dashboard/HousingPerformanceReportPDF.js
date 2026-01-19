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
        padding: 25,
        paddingBottom: 30,
        fontFamily: 'Cairo',
        fontSize: 14,
    },
    // Header
    header: {
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#4f46e5', // Indigo
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
        fontSize: 22,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#e0e7ff',
        textAlign: 'center',
    },
    // Housing Section
    housingSection: {
        marginBottom: 20,
        break: 'avoid',
    },
    housingHeader: {
        padding: 8,
        backgroundColor: '#eef2ff',
        borderRightWidth: 4,
        borderColor: '#4f46e5',
        marginBottom: 10,
    },
    housingTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#312e81',
        textAlign: 'right',
    },
    // Table
    table: {
        width: '100%',
        marginBottom: 10,
    },
    tableHeader: {
        flexDirection: 'row-reverse',
        backgroundColor: '#1e293b',
        padding: 8,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
    },
    tableRow: {
        flexDirection: 'row-reverse',
        borderBottomWidth: 1,
        borderColor: '#e2e8f0',
        paddingVertical: 8,
        paddingHorizontal: 6,
        backgroundColor: '#ffffff',
    },
    tableRowAlt: {
        backgroundColor: '#f8fafc',
    },
    // Columns (Total width ~100%)
    colRider: { width: '18%', textAlign: 'center' },
    colId: { width: '10%', textAlign: 'center' },
    colDays: { width: '8%', textAlign: 'center' },
    colMissing: { width: '8%', textAlign: 'center' },
    colHours: { width: '9%', textAlign: 'center' },
    colTargetHours: { width: '9%', textAlign: 'center' },
    colDiffHours: { width: '9%', textAlign: 'center' },
    colOrders: { width: '9%', textAlign: 'center' },
    colTargetOrders: { width: '9%', textAlign: 'center' },
    colDiffOrders: { width: '9%', textAlign: 'center' },

    headerText: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    cellText: {
        fontSize: 9,
        color: '#334155',
    },
    cellTextSmall: {
        fontSize: 8,
        color: '#64748b',
    },

    // Footer
    pageFooter: {
        position: 'absolute',
        bottom: 25,
        left: 30,
        right: 30,
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        fontSize: 8,
        color: '#94a3b8',
        borderTopWidth: 1,
        borderColor: '#e2e8f0',
        paddingTop: 8,
    },
});

const HousingPerformanceReportPDF = ({ reportData, startDate, endDate }) => {
    // Helper to chunk riders for a single housing
    const chunkHousingData = (housing) => {
        const riders = housing.summaryReport?.riderSummaries || [];
        const chunks = [];

        // Configuration
        const firstPageLimit = 7;
        const otherPageLimit = 8;

        // If no riders, still return one chunk to show the housing header
        if (riders.length === 0) {
            return [{
                pageIndex: 0,
                isFirstPage: true,
                riders: [],
                housingName: housing.housingName,
                totalPages: 1
            }];
        }

        // First chunk
        chunks.push({
            pageIndex: 0,
            isFirstPage: true,
            riders: riders.slice(0, firstPageLimit),
            housingName: housing.housingName,
        });

        // Remaining chunks
        let currentIdx = firstPageLimit;
        let pageIdx = 1;
        while (currentIdx < riders.length) {
            chunks.push({
                pageIndex: pageIdx,
                isFirstPage: false,
                riders: riders.slice(currentIdx, currentIdx + otherPageLimit),
                housingName: housing.housingName,
            });
            currentIdx += otherPageLimit;
            pageIdx++;
        }

        // Add total pages info
        return chunks.map(chunk => ({
            ...chunk,
            totalPages: chunks.length
        }));
    };

    // Flatten all data into a linear array of pages
    const reportPages = reportData ? reportData.flatMap(housing => chunkHousingData(housing)) : [];

    return (
        <Document>
            {reportPages.map((pageData, globalPageIndex) => (
                <Page key={globalPageIndex} size="A4" style={styles.page} orientation="landscape">
                    {/* Global Document Header */}
                    <View style={styles.header}>
                        <View style={styles.headerContent}>
                            <Text style={styles.headerTitle}>تقرير أداء المناديب - مجموعات السكن</Text>
                            <Text style={styles.headerSubtitle}>من: {startDate} إلى: {endDate}</Text>
                        </View>
                        <View style={styles.logoContainer}>
                            <Image src="/2.png" style={styles.headerLogo} />
                            <Text style={styles.companyName}>شركة الخدمة السريعة{"\n"}express service</Text>
                        </View>
                    </View>

                    {/* Housing Header */}
                    {pageData.isFirstPage && (
                        <View style={styles.housingHeader}>
                            <Text style={styles.housingTitle}>{pageData.housingName}</Text>
                        </View>
                    )}

                    {/* Riders Table */}
                    <View style={styles.table}>
                        {/* Table Header */}
                        <View style={styles.tableHeader}>
                            <View style={styles.colRider}><Text style={styles.headerText}>المندوب</Text></View>
                            <View style={styles.colId}><Text style={styles.headerText}>رقم العمل</Text></View>
                            <View style={styles.colDays}><Text style={styles.headerText}>ايام العمل</Text></View>
                            <View style={styles.colMissing}><Text style={[styles.headerText, { color: '#fca5a5' }]}>الغياب</Text></View>
                            <View style={styles.colHours}><Text style={styles.headerText}>الساعات</Text></View>
                            <View style={styles.colTargetHours}><Text style={styles.headerText}>هدف الساعات</Text></View>
                            <View style={styles.colDiffHours}><Text style={[styles.headerText, { color: '#fbbf24' }]}>فرق ساعات</Text></View>
                            <View style={styles.colOrders}><Text style={styles.headerText}>الطلبات</Text></View>
                            <View style={styles.colTargetOrders}><Text style={styles.headerText}>هدف الطلبات</Text></View>
                            <View style={styles.colDiffOrders}><Text style={[styles.headerText, { color: '#fbbf24' }]}>فرق طلبات</Text></View>
                        </View>

                        {/* Table Rows */}
                        {pageData.riders.map((rider, idx) => {
                            const hoursDiff = rider.hoursDifference;
                            const hoursPositive = hoursDiff >= 0;
                            const ordersDiff = rider.ordersDifference;
                            const ordersPositive = ordersDiff >= 0;
                            const missingDays = Math.abs(rider.missingDays || 0);

                            return (
                                <View key={idx} style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]}>
                                    <View style={styles.colRider}>
                                        <Text style={styles.cellText}>{rider.riderNameAR}</Text>
                                        <Text style={styles.cellTextSmall}>{rider.riderNameEN}</Text>
                                    </View>
                                    <View style={styles.colId}><Text style={styles.cellText}>{rider.workingId}</Text></View>
                                    <View style={styles.colDays}><Text style={styles.cellText}>{rider.actualWorkingDays}</Text></View>
                                    <View style={styles.colMissing}><Text style={[styles.cellText, { color: missingDays > 0 ? '#dc2626' : '#334155' }]}>{missingDays}</Text></View>
                                    <View style={styles.colHours}><Text style={styles.cellText}>{rider.totalWorkingHours?.toFixed(1)}</Text></View>
                                    <View style={styles.colTargetHours}><Text style={styles.cellText}>{rider.targetWorkingHours}</Text></View>
                                    <View style={styles.colDiffHours}>
                                        <Text style={[
                                            styles.cellText,
                                            {
                                                color: hoursPositive ? '#16a34a' : '#dc2626',
                                                fontWeight: 'bold'
                                            }
                                        ]}>
                                            {hoursPositive ? '+' : ''}{hoursDiff?.toFixed(1)}
                                        </Text>
                                    </View>
                                    <View style={styles.colOrders}><Text style={styles.cellText}>{rider.totalOrders}</Text></View>
                                    <View style={styles.colTargetOrders}><Text style={styles.cellText}>{rider.targetOrders}</Text></View>
                                    <View style={styles.colDiffOrders}>
                                        <Text style={[
                                            styles.cellText,
                                            {
                                                color: ordersPositive ? '#16a34a' : '#dc2626',
                                                fontWeight: 'bold'
                                            }
                                        ]}>
                                            {ordersPositive ? '+' : ''}{ordersDiff}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>

                    {/* Footer */}
                    <View style={styles.pageFooter}>
                        <Text>صفحة {pageData.pageIndex + 1} من {pageData.totalPages} للمجموعة</Text>
                        <Text>تم الإنشاء: {new Date().toLocaleString('en-US')}</Text>
                    </View>
                </Page>
            ))}
        </Document>
    );
};

export default HousingPerformanceReportPDF;
