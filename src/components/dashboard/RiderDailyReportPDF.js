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
        paddingRight: 10,
        paddingLeft: 10,
        paddingTop: 5,
        paddingBottom: 5,
        fontFamily: 'Cairo',
        fontSize: 11,
    },
    // Header
    header: {
        marginBottom: 5,
        padding: 10,
        backgroundColor: '#2563eb', // Blue
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerContent: {
        flex: 1,
    },
    headerLogo: {
        width: 30,
        height: 30,
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
        fontSize: 12,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 3,
    },
    headerSubtitle: {
        fontSize: 12,
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
        marginBottom: 7,
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
        fontSize: 10,
        color: '#64748b',
        textAlign: 'right',
    },

    // Summary Section
    summaryGrid: {
        flexDirection: 'row-reverse',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 8,
        justifyContent: 'space-between',
        margin: 5,
    },
    summaryCard: {
        width: '23%',
        padding: 10,
        backgroundColor: '#ffffff',
        borderRadius: 4,
        borderRightWidth: 3,
        borderColor: '#e2e8f0',
        marginBottom: 8,
        borderWidth: 1,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderBottomWidth: 1,
    },
    summaryLabel: {
        fontSize: 10,
        color: '#64748b',
        textAlign: 'right',
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#0f172a',
        textAlign: 'right',
    },
    summarySubValue: {
        fontSize: 10,
        color: '#64748b',
        textAlign: 'right',
        marginTop: 2,
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

    // Columns
    colDate: { width: '15%', textAlign: 'right' },
    colStatus: { width: '15%', textAlign: 'center' },
    colOrders: { width: '14%', textAlign: 'center' },
    colRejected: { width: '14%', textAlign: 'center' },
    colHours: { width: '14%', textAlign: 'center' },
    colTargetH: { width: '14%', textAlign: 'center' },
    colDiff: { width: '14%', textAlign: 'center' },

    headerText: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    cellText: {
        fontSize: 9,
        color: '#334155',
    },
    cellTextBold: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#0f172a',
    },

    // Footer
    pageFooter: {
        position: 'absolute',
        bottom: 20,
        left: 30,
        right: 30,
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        fontSize: 12,
        color: '#94a3b8',
        borderTopWidth: 1,
        borderColor: '#e2e8f0',
        paddingTop: 8,
    },
});

const getShiftStatusText = (hasShift, status) => {
    if (!hasShift) return 'لا يوجد';
    const s = status?.toLowerCase() || '';
    if (s === 'failed') return 'فشل';
    if (s === 'incomplete') return 'غير مكتمل';
    if (s === 'completed' || s === 'active') return 'مكتمل';
    return status || 'مجَدول';
};

const RiderDailyReportPDF = ({ data, startDate, endDate }) => {
    if (!data) return null;
    const { dailyDetails = [] } = data;

    // Variable pagination logic
    // Page 1 has rider info + summary stats
    const firstPageLimit = 16;
    const otherPageLimit = 23;
    const chunks = [];

    if (dailyDetails && dailyDetails.length > 0) {
        chunks.push(dailyDetails.slice(0, firstPageLimit));
        for (let i = firstPageLimit; i < dailyDetails.length; i += otherPageLimit) {
            chunks.push(dailyDetails.slice(i, i + otherPageLimit));
        }
    }

    if (chunks.length === 0) {
        return (
            <Document>
                <Page size="A4" style={styles.page} orientation="landscape">
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>تفاصيل المندوب اليومية</Text>
                        <Text style={styles.headerSubtitle}>من: {startDate} إلى: {endDate}</Text>
                    </View>
                    <Text style={{ textAlign: 'center', marginTop: 20 }}>لا توجد بيانات للعرض</Text>
                </Page>
            </Document>
        )
    }

    return (
        <Document>
            {chunks.map((chunk, pageIndex) => (
                <Page key={pageIndex} size="A4" style={styles.page}>
                    {/* Header - Only on first page */}
                    {pageIndex === 0 && (
                        <View style={styles.header}>
                            <View style={styles.headerContent}>
                                <Text style={styles.headerTitle}>تفاصيل المندوب اليومية</Text>
                                <Text style={styles.headerSubtitle}>من: {startDate} إلى: {endDate}</Text>
                            </View>
                            <View style={styles.logoContainer}>
                                <Image src="/2.png" style={styles.headerLogo} />
                                <Text style={styles.companyName}>شركة الخدمة السريعة{"\n"}express service</Text>
                            </View>
                        </View>
                    )}
                    {/* First Page Summary Info */}
                    {pageIndex === 0 && (
                        <>
                            <View style={styles.riderInfoCard}>
                                <View>
                                    <Text style={styles.riderName}>{data.riderNameAR}</Text>
                                    <Text style={styles.riderSubDetail}>{data.riderNameEN}</Text>
                                </View>
                                <View>
                                    <Text style={styles.riderSubDetail}>ID: {data.workingId}</Text>
                                    <Text style={styles.riderSubDetail}>Iqama: {data.iqamaNo}</Text>
                                </View>
                            </View>

                            <View style={styles.summaryGrid}>
                                <View style={[styles.summaryCard, { borderColor: '#6366f1' }]}>
                                    <Text style={styles.summaryLabel}>أيام العمل</Text>
                                    <Text style={[styles.summaryValue, { color: '#6366f1' }]}>{data.totalWorkingDays}</Text>
                                    <Text style={styles.summarySubValue}>أيام الغياب: {data.missingDays}</Text>
                                </View>
                                <View style={[styles.summaryCard, { borderColor: '#22c55e' }]}>
                                    <Text style={styles.summaryLabel}>إجمالي الطلبات</Text>
                                    <Text style={[styles.summaryValue, { color: '#22c55e' }]}>{data.totalOrders}</Text>
                                    <Text style={styles.summarySubValue}>الفرق: {data.totalOrders - (data.totalWorkingDays * 14)}</Text>
                                </View>
                                <View style={[styles.summaryCard, { borderColor: '#f97316' }]}>
                                    <Text style={styles.summaryLabel}>إجمالي الساعات</Text>
                                    <Text style={[styles.summaryValue, { color: '#f97316' }]}>{data.totalWorkingHours?.toFixed(2)}</Text>
                                    <Text style={styles.summarySubValue}>الفرق: {data.hoursDifference?.toFixed(2)}</Text>
                                </View>
                                <View style={[styles.summaryCard, { borderColor: '#ef4444' }]}>
                                    <Text style={styles.summaryLabel}>طلبات مرفوضة</Text>
                                    <Text style={[styles.summaryValue, { color: '#ef4444' }]}>{data.totalRejections}</Text>
                                    <Text style={styles.summarySubValue}>رفض حقيقي: {data.totalRealRejections}</Text>
                                </View>
                            </View>
                        </>
                    )}

                    {/* Table Header */}
                    <View style={styles.table}>
                        <View style={styles.tableHeader}>
                            <View style={styles.colDate}><Text style={styles.headerText}>التاريخ</Text></View>
                            <View style={styles.colStatus}><Text style={styles.headerText}>الحالة</Text></View>
                            <View style={styles.colOrders}><Text style={styles.headerText}>الطلبات</Text></View>
                            <View style={styles.colRejected}><Text style={[styles.headerText, { color: '#fca5a5' }]}>مرفوضة</Text></View>
                            <View style={styles.colHours}><Text style={styles.headerText}>ساعات العمل</Text></View>
                            <View style={styles.colTargetH}><Text style={styles.headerText}>هدف س</Text></View>
                            <View style={styles.colDiff}><Text style={styles.headerText}>الفرق</Text></View>
                        </View>

                        {/* Rows */}
                        {chunk.map((day, idx) => (
                            <View key={idx} style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]}>
                                <View style={styles.colDate}><Text style={styles.cellText}>{day.date}</Text></View>
                                <View style={styles.colStatus}><Text style={styles.cellText}>{getShiftStatusText(day.hasShift, day.shiftStatus)}</Text></View>
                                <View style={styles.colOrders}><Text style={styles.cellTextBold}>{day.acceptedOrders}</Text></View>
                                <View style={styles.colRejected}>
                                    <Text style={[styles.cellTextBold, { color: day.rejectedOrders > 0 ? '#dc2626' : '#94a3b8' }]}>
                                        {day.rejectedOrders > 0 ? day.rejectedOrders : '-'}
                                    </Text>
                                </View>
                                <View style={styles.colHours}><Text style={styles.cellTextBold}>{day.workingHours?.toFixed(2)}</Text></View>
                                <View style={styles.colTargetH}><Text style={styles.cellText}>{day.targetHours}</Text></View>
                                <View style={styles.colDiff}>
                                    <Text style={[styles.cellTextBold, { color: day.hoursDifference >= 0 ? '#15803d' : '#b91c1c' }]}>
                                        {day.hoursDifference?.toFixed(2)}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Footer */}
                    <View style={styles.pageFooter} fixed>
                        <Text>تم الإنشاء: {new Date().toLocaleString('en-US')}</Text>
                        <Text>Page {pageIndex + 1} of {chunks.length}</Text>
                    </View>
                </Page>
            ))}
        </Document>
    );
};

export default RiderDailyReportPDF;
