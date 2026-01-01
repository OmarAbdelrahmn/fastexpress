import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font,
} from '@react-pdf/renderer';

// Styles for the daily details report
const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Helvetica',
        fontSize: 10,
    },
    // Header Section
    header: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#1e40af',
        borderRadius: 6,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 5,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#e0e7ff',
        textAlign: 'center',
    },
    reportDate: {
        fontSize: 12,
        color: '#dbeafe',
        textAlign: 'center',
        marginTop: 5,
    },
    // Summary Cards
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        gap: 10,
    },
    summaryCard: {
        flex: 1,
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 6,
        borderLeft: '4px solid #2563eb',
    },
    summaryLabel: {
        fontSize: 9,
        color: '#64748b',
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f172a',
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
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1e40af',
        marginBottom: 5,
    },
    housingStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    housingStatItem: {
        fontSize: 9,
        color: '#475569',
    },
    // Table Styles
    table: {
        display: 'table',
        width: 'auto',
        marginBottom: 15,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#334155',
        padding: 8,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
    },
    tableRow: {
        flexDirection: 'row',
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
    },
    colRiderId: {
        width: '8%',
    },
    colRiderName: {
        width: '30%',
    },
    colPhone: {
        width: '15%',
    },
    colWorkingId: {
        width: '12%',
    },
    colOrders: {
        width: '10%',
        textAlign: 'center',
    },
    colDate: {
        width: '15%',
    },
    // Header Text
    headerText: {
        color: '#ffffff',
        fontSize: 9,
        fontWeight: 'bold',
    },
    // Cell Text
    cellText: {
        fontSize: 8,
        color: '#1e293b',
    },
    cellTextBold: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    cellTextCenter: {
        textAlign: 'center',
        fontSize: 9,
        fontWeight: 'bold',
        color: '#2563eb',
    },
    // Footer
    pageFooter: {
        position: 'absolute',
        bottom: 20,
        left: 30,
        right: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 8,
        color: '#94a3b8',
        borderTop: '1px solid #e2e8f0',
        paddingTop: 10,
    },
    // Performance Indicators
    performanceTag: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 3,
        fontSize: 7,
        fontWeight: 'bold',
    },
    performanceHigh: {
        backgroundColor: '#dcfce7',
        color: '#166534',
    },
    performanceMedium: {
        backgroundColor: '#fef3c7',
        color: '#854d0e',
    },
    performanceLow: {
        backgroundColor: '#fee2e2',
        color: '#991b1b',
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
    const { reportDate, housingDetails, grandTotalOrders, grandTotalRiders } = data;

    return (
        <Document>
            {housingDetails?.map((housing, housingIndex) => {
                // Split riders into chunks for pagination (20 riders per page)
                const ridersPerPage = 20;
                const riderChunks = [];
                if (housing.riders) {
                    for (let i = 0; i < housing.riders.length; i += ridersPerPage) {
                        riderChunks.push(housing.riders.slice(i, i + ridersPerPage));
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
                                <Text style={styles.headerTitle}>تقرير يومي تفصيلي - Daily Details Report</Text>
                                <Text style={styles.headerSubtitle}>{housing.housingName}</Text>
                                <Text style={styles.reportDate}>Report Date: {reportDate}</Text>
                            </View>
                            <View style={styles.housingHeader}>
                                <Text style={styles.housingTitle}>
                                    Housing #{housing.housingId}: {housing.housingName}
                                </Text>
                                <Text>No riders found for this housing.</Text>
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
                            <Text style={styles.headerTitle}>تقرير يومي تفصيلي - Daily Details Report</Text>
                            <Text style={styles.headerSubtitle}>{housing.housingName}</Text>
                            <Text style={styles.reportDate}>Report Date: {reportDate}</Text>
                        </View>

                        {/* Summary - Show on first page only */}
                        {chunkIndex === 0 && (
                            <>
                                <View style={styles.summaryContainer}>
                                    <View style={styles.summaryCard}>
                                        <Text style={styles.summaryLabel}>Total Orders</Text>
                                        <Text style={styles.summaryValue}>{grandTotalOrders}</Text>
                                    </View>
                                    <View style={styles.summaryCard}>
                                        <Text style={styles.summaryLabel}>Total Riders</Text>
                                        <Text style={styles.summaryValue}>{grandTotalRiders}</Text>
                                    </View>
                                    <View style={styles.summaryCard}>
                                        <Text style={styles.summaryLabel}>Avg Orders/Rider</Text>
                                        <Text style={styles.summaryValue}>
                                            {grandTotalRiders ? (grandTotalOrders / grandTotalRiders).toFixed(2) : '0'}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.housingHeader}>
                                    <Text style={styles.housingTitle}>
                                        Housing #{housing.housingId}: {housing.housingName}
                                    </Text>
                                    <View style={styles.housingStats}>
                                        <Text style={styles.housingStatItem}>
                                            Total Orders: {housing.housingTotalOrders}
                                        </Text>
                                        <Text style={styles.housingStatItem}>
                                            Riders: {housing.housingRiderCount}
                                        </Text>
                                        <Text style={styles.housingStatItem}>
                                            Percentage: {housing.percentageOfCompanyTotal}%
                                        </Text>
                                    </View>
                                </View>
                            </>
                        )}

                        {/* Page indicator for multi-page housing */}
                        {chunkIndex > 0 && (
                            <View style={styles.housingHeader}>
                                <Text style={styles.housingTitle}>
                                    {housing.housingName} (Continued)
                                </Text>
                                <Text style={styles.housingStatItem}>
                                    Page {chunkIndex + 1} of {riderChunks.length}
                                </Text>
                            </View>
                        )}

                        {/* Table Header */}
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <View style={styles.colNo}>
                                    <Text style={styles.headerText}>#</Text>
                                </View>
                                <View style={styles.colRiderId}>
                                    <Text style={styles.headerText}>Rider ID</Text>
                                </View>
                                <View style={styles.colRiderName}>
                                    <Text style={styles.headerText}>Rider Name</Text>
                                </View>
                                <View style={styles.colPhone}>
                                    <Text style={styles.headerText}>Phone</Text>
                                </View>
                                <View style={styles.colWorkingId}>
                                    <Text style={styles.headerText}>Working ID</Text>
                                </View>
                                <View style={styles.colOrders}>
                                    <Text style={styles.headerText}>Orders</Text>
                                </View>
                                <View style={styles.colDate}>
                                    <Text style={styles.headerText}>Shift Date</Text>
                                </View>
                            </View>

                            {/* Table Rows */}
                            {riderChunk.map((rider, index) => {
                                const globalIndex = chunkIndex * ridersPerPage + index + 1;
                                const performance = getPerformanceLevel(rider.acceptedOrders);
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
                                        <View style={styles.colRiderId}>
                                            <Text style={styles.cellTextBold}>{rider.riderId}</Text>
                                        </View>
                                        <View style={styles.colRiderName}>
                                            <Text style={styles.cellText}>{rider.riderName}</Text>
                                        </View>
                                        <View style={styles.colPhone}>
                                            <Text style={styles.cellText}>{formatPhone(rider.phoneNumber)}</Text>
                                        </View>
                                        <View style={styles.colWorkingId}>
                                            <Text style={styles.cellText}>{rider.workingId}</Text>
                                        </View>
                                        <View style={styles.colOrders}>
                                            <Text style={styles.cellTextCenter}>{rider.acceptedOrders}</Text>
                                        </View>
                                        <View style={styles.colDate}>
                                            <Text style={styles.cellText}>{rider.shiftDate}</Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>

                        {/* Footer */}
                        <View style={styles.pageFooter} fixed>
                            <Text>Generated: {new Date().toLocaleString('en-US')}</Text>
                            <Text>
                                Page {chunkIndex + 1} of {riderChunks.length} |
                                Housing {housingIndex + 1} of {housingDetails.length}
                            </Text>
                        </View>
                    </Page>
                ));
            })}
        </Document>
    );
};

export default DailyDetailsReport;
