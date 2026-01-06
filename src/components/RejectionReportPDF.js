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
        padding: 25, // Standard margin
        paddingBottom: 30,
        fontFamily: 'Cairo',
        fontSize: 13, // Back to 10 for better fit, user said bigger but 11 might be pushing it with padding
    },
    // Header
    header: {
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#dc2626',
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
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 15,
        color: '#fee2e2',
        textAlign: 'center',
    },
    // Summary Section
    summaryGrid: {
        flexDirection: 'row-reverse',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 20,
        justifyContent: 'space-between',
    },
    summaryCard: {
        width: '23%',
        padding: 10,
        backgroundColor: '#f8fafc',
        borderRadius: 4,
        borderRightWidth: 3,
        borderColor: '#e2e8f0',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 12,
        color: '#64748b',
        textAlign: 'right',
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#0f172a',
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
    colRider: { width: '20%', textAlign: 'center' },
    colId: { width: '10%', textAlign: 'center' },
    colDays: { width: '8%', textAlign: 'center' },
    colOrders: { width: '9%', textAlign: 'center' },
    colTarget: { width: '9%', textAlign: 'center' },
    colRej: { width: '9%', textAlign: 'center' },
    colRejRate: { width: '12%', textAlign: 'center' },
    colRealRej: { width: '10%', textAlign: 'center' },
    colRealRate: { width: '12%', textAlign: 'center' },

    headerText: {
        color: '#ffffff',
        fontSize: 12, // Slightly smaller header text to prevent wrap
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

const RejectionReportPDF = ({ data, startDate, endDate }) => {
    const { totals, riderDetails = [] } = data || {};

    // Variable pagination logic
    const firstPageLimit = 4; // Less items on first page due to summary
    const otherPageLimit = 7; // More items on other pages
    const riderChunks = [];

    if (riderDetails && riderDetails.length > 0) {
        // First chunk
        riderChunks.push(riderDetails.slice(0, firstPageLimit));

        // Subsequent chunks
        for (let i = firstPageLimit; i < riderDetails.length; i += otherPageLimit) {
            riderChunks.push(riderDetails.slice(i, i + otherPageLimit));
        }
    }

    if (riderChunks.length === 0) {
        return (
            <Document>
                <Page size="A4" style={styles.page} orientation="landscape">
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>تقرير الطلبات المرفوضة</Text>
                        <Text style={styles.headerSubtitle}>
                            من: {startDate} إلى: {endDate}

                        </Text>
                    </View>
                    <Text style={{ textAlign: 'center', marginTop: 20 }}>لا توجد بيانات للعرض</Text>
                </Page>
            </Document>
        )
    }

    return (
        <Document>
            {riderChunks.map((chunk, pageIndex) => (
                <Page key={pageIndex} size="A4" style={styles.page} orientation="landscape">
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerContent}>
                            <Text style={styles.headerTitle}>تقرير الطلبات المرفوضة (DECLINED ORDERS)</Text>
                            <Text style={styles.headerSubtitle}> من: {startDate} إلى: {endDate}</Text>
                        </View>
                        {/* <View style={styles.logoContainer}>
                            <Image src="/2.png" style={styles.headerLogo} />
                            <Text style={styles.companyName}>شركة الخدمة السريعة{"\n"}express service</Text>
                        </View> */}
                    </View>

                    {/* Summary (First Page Only) */}
                    {pageIndex === 0 && totals && (
                        <View style={styles.summaryGrid}>
                            <View style={[styles.summaryCard, { borderColor: '#3b82f6' }]}>
                                <Text style={styles.summaryLabel}>إجمالي المناديب</Text>
                                <Text style={[styles.summaryValue, { color: '#3b82f6' }]}>{totals.totalRiders}</Text>
                            </View>
                            <View style={[styles.summaryCard, { borderColor: '#22c55e' }]}>
                                <Text style={styles.summaryLabel}>إجمالي الطلبات</Text>
                                <Text style={[styles.summaryValue, { color: '#22c55e' }]}>{totals.totalOrders}</Text>
                            </View>
                            <View style={[styles.summaryCard, { borderColor: '#a855f7' }]}>
                                <Text style={styles.summaryLabel}>التاجت</Text>
                                <Text style={[styles.summaryValue, { color: '#a855f7' }]}>{totals.totalTargetOrders}</Text>
                            </View>
                            <View style={[styles.summaryCard, { borderColor: '#ef4444' }]}>
                                <Text style={styles.summaryLabel}>الفرق</Text>
                                <Text style={[styles.summaryValue, { color: '#ef4444' }]}>{totals.totalOrders - totals.totalTargetOrders}</Text>
                            </View>
                            <View style={[styles.summaryCard, { borderColor: '#ef4444' }]}>
                                <Text style={styles.summaryLabel}>إجمالي الرفض</Text>
                                <Text style={[styles.summaryValue, { color: '#ef4444' }]}>{totals.totalRejections}</Text>
                            </View>
                            <View style={[styles.summaryCard, { borderColor: '#f97316' }]}>
                                <Text style={styles.summaryLabel}>نسبة الرفض</Text>
                                <Text style={[styles.summaryValue, { color: '#f97316' }]}>{totals.overallRejectionRate}%</Text>
                            </View>
                            <View style={[styles.summaryCard, { borderColor: '#991b1b' }]}>
                                <Text style={styles.summaryLabel}>الرفض الحقيقي</Text>
                                <Text style={[styles.summaryValue, { color: '#991b1b' }]}>{totals.totalRealRejections}</Text>
                            </View>
                            <View style={[styles.summaryCard, { borderColor: '#c2410c' }]}>
                                <Text style={styles.summaryLabel}>نسبة الرفض الحقيقي</Text>
                                <Text style={[styles.summaryValue, { color: '#c2410c' }]}>{totals.overallRealRejectionRate}%</Text>
                            </View>
                        </View>
                    )}

                    {/* Table Header */}
                    <View style={styles.table}>
                        <View style={styles.tableHeader}>
                            <View style={styles.colRider}><Text style={styles.headerText}>المندوب</Text></View>
                            <View style={styles.colId}><Text style={styles.headerText}>المعرف</Text></View>
                            <View style={styles.colDays}><Text style={styles.headerText}>الأيام</Text></View>
                            <View style={styles.colOrders}><Text style={styles.headerText}>الطلبات</Text></View>
                            <View style={styles.colTarget}><Text style={styles.headerText}>التارجيت</Text></View>
                            <View style={styles.colRej}><Text style={[styles.headerText, { color: '#fca5a5' }]}>الرفض</Text></View>
                            <View style={styles.colRejRate}><Text style={[styles.headerText, { color: '#fdba74' }]}>نسبة الرفض</Text></View>
                            <View style={styles.colRealRej}><Text style={[styles.headerText, { color: '#fecaca' }]}>رفض ح</Text></View>
                            <View style={styles.colRealRate}><Text style={[styles.headerText, { color: '#fed7aa' }]}>نسبة ح</Text></View>
                        </View>

                        {/* Rows */}
                        {chunk.map((rider, idx) => (
                            <View key={idx} style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]}>
                                <View style={styles.colRider}>
                                    <Text style={styles.cellText}>{rider.riderNameAR}</Text>
                                    <Text style={styles.cellTextSmall}>{rider.riderNameEN}</Text>
                                </View>
                                <View style={styles.colId}><Text style={styles.cellText}>{rider.workingId}</Text></View>
                                <View style={styles.colDays}><Text style={styles.cellText}>{rider.totalShifts}</Text></View>
                                <View style={styles.colOrders}><Text style={styles.cellText}>{rider.totalOrders}</Text></View>
                                <View style={styles.colTarget}><Text style={styles.cellText}>{rider.targetOrders}</Text></View>
                                <View style={styles.colRej}><Text style={[styles.cellText, { color: '#dc2626' }]}>{rider.totalRejections}</Text></View>
                                <View style={styles.colRejRate}><Text style={styles.cellText}>{rider.rejectionRate}%</Text></View>
                                <View style={styles.colRealRej}><Text style={[styles.cellText, { color: '#991b1b' }]}>{rider.totalRealRejections}</Text></View>
                                <View style={styles.colRealRate}><Text style={styles.cellText}>{rider.realRejectionRate}%</Text></View>
                            </View>
                        ))}
                    </View>

                    {/* Footer */}
                    <View style={styles.pageFooter} fixed>
                        <Text>تم الإنشاء: {new Date().toLocaleString('en-US')}</Text>
                    </View>
                </Page>
            ))}
        </Document>
    );
};

export default RejectionReportPDF;
