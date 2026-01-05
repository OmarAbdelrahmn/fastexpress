import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font,
} from '@react-pdf/renderer';

Font.register({
    family: 'Cairo',
    src: '/fonts/7.ttf',
});

// Styles for the daily details report
const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Cairo',
        fontSize: 14,
    },
    // Header Section
    header: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#1e40af',
        borderRadius: 6,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 5,
    },
    headerSubtitle: {
        fontSize: 15,
        color: '#e0e7ff',
        textAlign: 'center',
    },
    reportDate: {
        fontSize: 14,
        color: '#dbeafe',
        textAlign: 'center',
        marginTop: 5,
    },
    // Summary Cards
    summaryContainer: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        marginBottom: 20,
        gap: 10,
    },
    summaryCard: {
        flex: 1,
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 6,
        borderRight: '4px solid #2563eb', // Changed to right border for RTL usually, but visually let's keep consistency or mirrored? keeping Right makes sense if content flows right to left.
    },
    summaryLabel: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 4,
        textAlign: 'right', // Align Right
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
        textAlign: 'right', // Align Right
    },
    // Housing Section
    housingSection: {
        marginBottom: 20,
    },
    housingHeader: {
        backgroundColor: '#dbeafe',
        padding: 12,
        borderRadius: 6,
        marginBottom: 10,
    },
    housingTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e40af',
        marginBottom: 5,
        textAlign: 'right',
    },
    housingStats: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    housingStatItem: {
        fontSize: 18,
        color: '#475569',
        textAlign: 'right',
    },
    // Table Styles
    table: {
        width: '100%',
        marginBottom: 15,
    },
    tableHeader: {
        flexDirection: 'row-reverse',
        backgroundColor: '#334155',
        padding: 8,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
    },
    tableRow: {
        flexDirection: 'row-reverse',
        borderBottom: '1px solid #e2e8f0',
        padding: 8,
        backgroundColor: '#ffffff',
    },
    tableRowAlt: {
        backgroundColor: '#f8fafc',
    },
    tableRowHighlight: {
        backgroundColor: '#fef3c7',
    },
    // Table Columns
    colNo: {
        width: '5%',
        textAlign: 'center',
    },
    // Rider ID removed column definition
    colRiderName: {
        width: '25%', // Reduced to make space
        textAlign: 'center',
    },
    colRiderNameEn: {
        width: '25%', // New English Name Column
        textAlign: 'center',
    },
    colPhone: {
        width: '15%',
        textAlign: 'center',
    },
    colWorkingId: {
        width: '10%',
        textAlign: 'center',
    },
    colOrders: {
        width: '10%',
        textAlign: 'center',
    },
    colDate: {
        width: '10%',
        textAlign: 'center',
    },
    // Header Text
    headerText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    // Cell Text
    cellText: {
        fontSize: 12,
        color: '#1e293b',
    },
    cellTextBold: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    cellTextCenter: {
        textAlign: 'center',
        fontSize: 12,
        fontWeight: 'bold',
        color: '#2563eb',
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
        borderTop: '1px solid #e2e8f0',
        paddingTop: 10,
    },
});

// Helper function to determine performance level
const getPerformanceLevel = (orders) => {
    if (orders >= 15) return 'high';
    if (orders >= 10) return 'medium';
    return 'low';
};

// Helper function to format phone number
const formatPhone = (phone) => {
    if (!phone || phone.length < 5) return phone;
    return phone.replace(/(\d{3})(\d{3})(\d{3,4})/, '$1 $2 $3');
};

const DailyDetailsReport = ({ data }) => {
    const { reportDate, housingDetails = [], grandTotalOrders, grandTotalRiders } = data || {};

    return (
        <Document>
            {housingDetails?.map((housing, housingIndex) => {
                // Split riders into chunks for pagination (20 riders per page)
                // Variable pagination: 6 for first page, 12 for others
                const firstPageLimit = 4;
                const otherPageLimit = 7;
                const riderChunks = [];

                if (housing.riders && housing.riders.length > 0) {
                    // First chunk
                    riderChunks.push(housing.riders.slice(0, firstPageLimit));

                    // Subsequent chunks
                    for (let i = firstPageLimit; i < housing.riders.length; i += otherPageLimit) {
                        riderChunks.push(housing.riders.slice(i, i + otherPageLimit));
                    }
                }

                // Handle case with no riders
                if (riderChunks.length === 0) {
                    return (
                        <Page
                            key={`${housingIndex}-empty`}
                            size="A4"
                            style={styles.page}
                            orientation="landscape"
                        >
                            <View style={styles.header}>
                                <Text style={styles.headerTitle}>تقرير يومي تفصيلي</Text>
                                <Text style={styles.headerSubtitle}>{housing.housingName}</Text>
                                <Text style={styles.reportDate}>التاريخ: {reportDate}</Text>
                            </View>
                            <View style={styles.housingHeader}>
                                <Text style={styles.housingTitle}>
                                    سكن {housing.housingId}: {housing.housingName}
                                </Text>
                                <Text style={{ textAlign: 'right', fontSize: 10 }}>لا يوجد مناديب في هذا السكن.</Text>
                            </View>
                        </Page>
                    );
                }

                return riderChunks.map((riderChunk, chunkIndex) => (
                    <Page
                        key={`${housingIndex}-${chunkIndex}`}
                        size="A4"
                        style={styles.page}
                        orientation="landscape"
                    >
                        {/* Header - Show on every page */}
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>تقرير يومي تفصيلي</Text>
                            <Text style={styles.headerSubtitle}>{housing.housingName}</Text>
                            <Text style={styles.reportDate}>التاريخ: {reportDate}</Text>
                        </View>

                        {/* Summary - Show on first page only */}
                        {chunkIndex === 0 && (
                            <>
                                <View style={styles.summaryContainer}>
                                    <View style={styles.summaryCard}>
                                        <Text style={styles.summaryLabel}>إجمالي الطلبات</Text>
                                        <Text style={styles.summaryValue}>{grandTotalOrders}</Text>
                                    </View>
                                    <View style={styles.summaryCard}>
                                        <Text style={styles.summaryLabel}>إجمالي المناديب</Text>
                                        <Text style={styles.summaryValue}>{grandTotalRiders}</Text>
                                    </View>
                                    <View style={styles.summaryCard}>
                                        <Text style={styles.summaryLabel}>متوسط الطلبات/مندوب</Text>
                                        <Text style={styles.summaryValue}>
                                            {grandTotalRiders ? (grandTotalOrders / grandTotalRiders).toFixed(2) : '0'}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.housingHeader}>
                                    <Text style={styles.housingTitle}>
                                        سكن {housing.housingId}: {housing.housingName}
                                    </Text>
                                    <View style={styles.housingStats}>
                                        <Text style={styles.housingStatItem}>
                                            الطلبات: {housing.housingTotalOrders}
                                        </Text>
                                        <Text style={styles.housingStatItem}>
                                            المناديب: {housing.housingRiderCount}
                                        </Text>
                                    </View>
                                </View>
                            </>
                        )}

                        {/* Page indicator for multi-page housing */}
                        {chunkIndex > 0 && (
                            <View style={styles.housingHeader}>
                                <Text style={styles.housingTitle}>
                                    {housing.housingName} (تابع)
                                </Text>
                                <Text style={styles.housingStatItem}>
                                    صفحة {chunkIndex + 1} من {riderChunks.length}
                                </Text>
                            </View>
                        )}

                        {/* Table Header */}
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <View style={styles.colNo}>
                                    <Text style={styles.headerText}>#</Text>
                                </View>
                                {/* Removed Rider ID Header */}
                                <View style={styles.colRiderName}>
                                    <Text style={styles.headerText}>اسم المندوب</Text>
                                </View>
                                <View style={styles.colWorkingId}>
                                    <Text style={styles.headerText}>المعرف</Text>
                                </View>
                                <View style={styles.colOrders}>
                                    <Text style={styles.headerText}>الطلبات</Text>
                                </View>
                                <View style={styles.colDate}>
                                    <Text style={styles.headerText}>التاريخ</Text>
                                </View>
                                <View style={styles.colRiderNameEn}>
                                    <Text style={styles.headerText}>الاسم (En)</Text>
                                </View>
                                <View style={styles.colPhone}>
                                    <Text style={styles.headerText}>رقم الجوال</Text>
                                </View>
                            </View>

                            {/* Table Rows */}
                            {riderChunk.map((rider, index) => {
                                // Calculate global index based on variable pagination
                                let globalIndex;
                                if (chunkIndex === 0) {
                                    globalIndex = index + 1;
                                } else {
                                    globalIndex = 6 + (chunkIndex - 1) * 12 + index + 1;
                                }
                                const isHighPerformer = rider.acceptedOrders >= 15;

                                return (
                                    <View
                                        key={rider.riderId}
                                        style={[
                                            styles.tableRow,
                                            index % 2 === 1 && styles.tableRowAlt,
                                            isHighPerformer && styles.tableRowHighlight,
                                        ]}
                                    >
                                        <View style={styles.colNo}>
                                            <Text style={styles.cellText}>{globalIndex}</Text>
                                        </View>
                                        {/* Removed Rider ID Cell */}
                                        <View style={styles.colRiderName}>
                                            <Text style={[styles.cellText, { textAlign: 'center' }]}>{rider.riderName}</Text>
                                        </View>
                                        <View style={styles.colWorkingId}>
                                            <Text style={[styles.cellText, { textAlign: 'center' }]}>{rider.workingId}</Text>
                                        </View>
                                        <View style={styles.colOrders}>
                                            <Text style={styles.cellTextCenter}>{rider.acceptedOrders}</Text>
                                        </View>
                                        <View style={styles.colDate}>
                                            <Text style={[styles.cellText, { textAlign: 'center' }]}>{rider.shiftDate}</Text>
                                        </View>
                                        <View style={styles.colRiderNameEn}>
                                            <Text style={[styles.cellText, { textAlign: 'center' }]}>{rider.riderNameE || '-'}</Text>
                                        </View>
                                        <View style={styles.colPhone}>
                                            <Text style={[styles.cellText, { textAlign: 'center' }]}>{formatPhone(rider.phoneNumber)}</Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>

                        {/* Footer */}
                        <View style={styles.pageFooter} fixed>
                            <Text>تم الإنشاء: {new Date().toLocaleString('en-US')}</Text>
                            <Text>
                                صفحة {chunkIndex + 1} من {riderChunks.length} |
                                سكن {housingIndex + 1} من {housingDetails.length}
                            </Text>
                        </View>
                    </Page>
                ));
            })}
        </Document>
    );
};

export default DailyDetailsReport;
