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
        fontSize: 10,
    },
    // Header
    header: {
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#2563eb', // Blue to match page
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
        fontSize: 10,
        color: '#ffffff',
        textAlign: 'center',
        marginTop: 4,
    },
    headerTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#dbeafe',
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
        fontSize: 11,
        color: '#64748b',
        textAlign: 'right',
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#0f172a',
        textAlign: 'right',
    },
    summarySubValue: {
        fontSize: 11,
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
    // Columns (Total width ~100%)
    colRider: { width: '22%', textAlign: 'center' },
    colId: { width: '8%', textAlign: 'center' },
    colDays: { width: '8%', textAlign: 'center' },
    colMissing: { width: '8%', textAlign: 'center' },
    colHours: { width: '9%', textAlign: 'center' },
    colTargetH: { width: '9%', textAlign: 'center' },
    colDiffH: { width: '9%', textAlign: 'center' },
    colOrders: { width: '9%', textAlign: 'center' },
    colTargetO: { width: '9%', textAlign: 'center' },
    colDiffO: { width: '9%', textAlign: 'center' },

    headerText: {
        color: '#ffffff',
        fontSize: 11,
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
    cellTextBold: {
        fontSize: 9,
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
        fontSize: 10,
        color: '#94a3b8',
        borderTopWidth: 1,
        borderColor: '#e2e8f0',
        paddingTop: 8,
    },
});

const RidersSummaryReportPDF = ({ data, startDate, endDate }) => {
    const { totals, riderSummaries = [] } = data || {};

    // Variable pagination logic
    // Page 1 has summary, so fewer items.
    // 4 items to be safe with summary cards.
    const firstPageLimit = 5;
    const otherPageLimit = 7;
    const riderChunks = [];

    if (riderSummaries && riderSummaries.length > 0) {
        riderChunks.push(riderSummaries.slice(0, firstPageLimit));
        for (let i = firstPageLimit; i < riderSummaries.length; i += otherPageLimit) {
            riderChunks.push(riderSummaries.slice(i, i + otherPageLimit));
        }
    }

    if (riderChunks.length === 0) {
        return (
            <Document>
                <Page size="A4" style={styles.page} orientation="landscape">
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>ملخص أداء المناديب (Riders Summary)</Text>
                        <Text style={styles.headerSubtitle}>من: {startDate} إلى: {endDate}</Text>
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
                            <Text style={styles.headerTitle}>ملخص أداء المناديب (Riders Summary)</Text>
                            <Text style={styles.headerSubtitle}>من: {startDate} إلى: {endDate}</Text>
                        </View>
                        <View style={styles.logoContainer}>
                            <Image src="/2.png" style={styles.headerLogo} />
                            <Text style={styles.companyName}>شركة الخدمة السريعة{"\n"}express service</Text>
                        </View>
                    </View>

                    {/* Summary (First Page Only) */}
                    {pageIndex === 0 && totals && (
                        <View style={styles.summaryGrid}>
                            <View style={[styles.summaryCard, { borderColor: '#3b82f6' }]}>
                                <Text style={styles.summaryLabel}>إجمالي المناديب</Text>
                                <Text style={[styles.summaryValue, { color: '#3b82f6' }]}>{totals.totalRiders}</Text>
                            </View>
                            <View style={[styles.summaryCard, { borderColor: '#6366f1' }]}>
                                <Text style={styles.summaryLabel}>إجمالي الاداء</Text>
                                <Text style={[styles.summaryValue, { color: '#6366f1' }]}>{totals.totalWorkingDays}</Text>
                            </View>
                            <View style={[styles.summaryCard, { borderColor: '#22c55e' }]}>
                                <Text style={styles.summaryLabel}>إجمالي الطلبات</Text>
                                <Text style={[styles.summaryValue, { color: '#22c55e' }]}>{totals.totalOrders}</Text>
                                <Text style={styles.summarySubValue}>المستهدف: {totals.totalTargetOrders}</Text>
                                <Text style={styles.summarySubValue}>الفرق: {totals.ordersDifference}</Text>
                            </View>
                            <View style={[styles.summaryCard, { borderColor: '#f97316' }]}>
                                <Text style={styles.summaryLabel}>إجمالي الساعات</Text>
                                <Text style={[styles.summaryValue, { color: '#f97316' }]}>{totals.totalWorkingHours?.toFixed(2)}</Text>
                                <Text style={styles.summarySubValue}>المستهدف: {totals.totalTargetHours}</Text>
                                <Text style={styles.summarySubValue}>الفرق: {totals.hoursDifference?.toFixed(2)}</Text>
                            </View>
                        </View>
                    )}

                    {/* Table Header */}
                    <View style={styles.table}>
                        <View style={styles.tableHeader}>
                            <View style={styles.colRider}><Text style={styles.headerText}>المندوب</Text></View>
                            <View style={styles.colId}><Text style={styles.headerText}>رقم العمل</Text></View>
                            <View style={styles.colDays}><Text style={styles.headerText}>أيام العمل</Text></View>
                            <View style={styles.colMissing}><Text style={[styles.headerText, { color: '#fca5a5' }]}>أيام الغياب</Text></View>
                            <View style={styles.colHours}><Text style={styles.headerText}>الساعات</Text></View>
                            <View style={styles.colTargetH}><Text style={styles.headerText}>هدف س</Text></View>
                            <View style={styles.colDiffH}><Text style={styles.headerText}>فرق س</Text></View>
                            <View style={styles.colOrders}><Text style={styles.headerText}>الطلبات</Text></View>
                            <View style={styles.colTargetO}><Text style={styles.headerText}>هدف ط</Text></View>
                            <View style={styles.colDiffO}><Text style={styles.headerText}>فرق ط</Text></View>
                        </View>

                        {/* Rows */}
                        {chunk.map((rider, idx) => {
                            const missingDays = rider.missingDays ?? rider.MissingDays ?? 0;

                            return (
                                <View key={idx} style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]}>
                                    <View style={styles.colRider}>
                                        <Text style={styles.cellText}>{rider.riderNameAR}</Text>
                                        <Text style={styles.cellTextSmall}>{rider.riderNameEN}</Text>
                                    </View>
                                    <View style={styles.colId}><Text style={styles.cellText}>{rider.workingId}</Text></View>
                                    <View style={styles.colDays}><Text style={styles.cellText}>{rider.actualWorkingDays}</Text></View>
                                    <View style={styles.colMissing}>
                                        <Text style={[styles.cellText, { color: missingDays !== 0 ? '#dc2626' : '#334155' }]}>
                                            {missingDays !== 0 ? Math.abs(missingDays) : '-'}
                                        </Text>
                                    </View>
                                    <View style={styles.colHours}><Text style={styles.cellTextBold}>{rider.totalWorkingHours?.toFixed(2)}</Text></View>
                                    <View style={styles.colTargetH}><Text style={styles.cellTextSmall}>{rider.targetWorkingHours}</Text></View>
                                    <View style={styles.colDiffH}>
                                        <Text style={[styles.cellTextBold, { color: rider.hoursDifference >= 0 ? '#15803d' : '#b91c1c' }]}>
                                            {rider.hoursDifference?.toFixed(2)}
                                        </Text>
                                    </View>
                                    <View style={styles.colOrders}><Text style={styles.cellTextBold}>{rider.totalOrders}</Text></View>
                                    <View style={styles.colTargetO}><Text style={styles.cellTextSmall}>{rider.targetOrders}</Text></View>
                                    <View style={styles.colDiffO}>
                                        <Text style={[styles.cellTextBold, { color: rider.ordersDifference >= 0 ? '#15803d' : '#b91c1c' }]}>
                                            {rider.ordersDifference}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>

                    {/* Footer */}
                    <View style={styles.pageFooter} fixed>
                        <Text>تم الإنشاء: {new Date().toLocaleString('en-US')}</Text>
                        <Text>Page {pageIndex + 1} of {riderChunks.length}</Text>
                    </View>
                </Page>
            ))}
        </Document>
    );
};

export default RidersSummaryReportPDF;
