import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font,
} from '@react-pdf/renderer';

// Register Arabic font
Font.register({
    family: 'Cairo',
    src: 'https://fonts.gstatic.com/s/cairo/v20/SLXGc1nY6HkvangtZmpcMw.ttf',
});

// Create styles with RTL support
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Cairo',
        backgroundColor: '#ffffff',
    },
    container: {
        border: '2px solid #2563eb',
        borderRadius: 8,
        padding: 20,
    },
    header: {
        backgroundColor: '#2563eb',
        padding: 15,
        marginBottom: 20,
        borderRadius: 6,
        textAlign: 'center',
    },
    headerText: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    housingId: {
        color: '#e0e7ff',
        fontSize: 12,
        marginTop: 5,
    },
    statsContainer: {
        flexDirection: 'column',
        gap: 12,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 12,
        backgroundColor: '#f8fafc',
        borderRadius: 4,
        borderLeft: '4px solid #2563eb',
    },
    statLabel: {
        fontSize: 12,
        color: '#64748b',
        textAlign: 'right',
        flex: 1,
    },
    statValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#0f172a',
        textAlign: 'left',
        flex: 1,
    },
    highlightRow: {
        backgroundColor: '#dbeafe',
        borderLeft: '4px solid #1d4ed8',
    },
    footer: {
        marginTop: 20,
        padding: 10,
        textAlign: 'center',
        fontSize: 10,
        color: '#94a3b8',
        borderTop: '1px solid #e2e8f0',
    },
});

// Main PDF Document Component
const HousingReportPDF = ({ data }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.container}>
                {/* Header Section */}
                <View style={styles.header}>
                    <Text style={styles.headerText}>{data?.housingName || 'تقرير'}</Text>
                    <Text style={styles.housingId}>Date: {data?.date}</Text>
                </View>

                {/* Statistics Section */}
                <View style={styles.statsContainer}>
                    {/* Total Orders */}
                    <View style={[styles.statRow, styles.highlightRow]}>
                        <Text style={styles.statValue}>{data?.totalOrders || 0}</Text>
                        <Text style={styles.statLabel}>إجمالي الطلبات (Total Orders)</Text>
                    </View>

                    {/* Active Riders */}
                    <View style={styles.statRow}>
                        <Text style={styles.statValue}>{data?.activeRiders || 0}</Text>
                        <Text style={styles.statLabel}>السائقون النشطون (Active Riders)</Text>
                    </View>

                    {/* Average Orders Per Rider */}
                    <View style={styles.statRow}>
                        <Text style={styles.statValue}>
                            {data?.averageOrdersPerRider?.toFixed(2) || '0.00'}
                        </Text>
                        <Text style={styles.statLabel}>
                            متوسط الطلبات لكل سائق (Avg Orders/Rider)
                        </Text>
                    </View>

                    {/* Percentage of Total Orders */}
                    <View style={[styles.statRow, styles.highlightRow]}>
                        <Text style={styles.statValue}>{data?.percentageOfTotalOrders || 0}%</Text>
                        <Text style={styles.statLabel}>
                            نسبة من إجمالي الطلبات (% of Total Orders)
                        </Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>Generated on {new Date().toLocaleDateString('ar-EG')}</Text>
                </View>
            </View>
        </Page>
    </Document>
);

export default HousingReportPDF;
