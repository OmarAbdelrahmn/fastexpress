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

// Styles matching DailyDetailsReportPDF for consistency
const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Cairo',
        fontSize: 10,
    },
    // Header
    header: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#1e40af',
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
    // Main Net Change Section
    netChangeSection: {
        marginBottom: 20,
        padding: 20,
        backgroundColor: '#f8fafc',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        alignItems: 'center',
    },
    netChangeTitle: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 10,
    },
    netChangeValue: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 5,
        textAlign: 'center',
    },
    positiveChange: {
        color: '#16a34a', // Green
    },
    negativeChange: {
        color: '#dc2626', // Red
    },
    netChangePercentage: {
        fontSize: 14,
        fontWeight: 'bold',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginTop: 5,
    },
    positiveBadge: {
        backgroundColor: '#dcfce7',
        color: '#166534',
    },
    negativeBadge: {
        backgroundColor: '#fee2e2',
        color: '#991b1b',
    },
    trendDescription: {
        marginTop: 10,
        fontSize: 10,
        color: '#64748b',
        textAlign: 'center',
    },
    // Comparison Container
    comparisonContainer: {
        flexDirection: 'row-reverse',
        gap: 15,
        marginBottom: 20,
    },
    periodCard: {
        flex: 1,
        padding: 15,
        borderRadius: 6,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    periodHeader: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'right',
        color: '#1e40af',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        paddingBottom: 5,
    },
    periodStat: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    statLabel: {
        fontSize: 10,
        color: '#64748b',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    dateRange: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    dateRow: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    dateLabel: {
        fontSize: 9,
        color: '#94a3b8',
    },
    dateValue: {
        fontSize: 9,
        fontFamily: 'Cairo',
        color: '#334155',
    },
    // Footer
    pageFooter: {
        position: 'absolute',
        bottom: 20,
        left: 30,
        right: 30,
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        fontSize: 8,
        color: '#94a3b8',
        borderTop: '1px solid #e2e8f0',
        paddingTop: 10,
    },
});

const ComparePeriodsReportPDF = ({ data }) => {
    const {
        period1Start,
        period1End,
        period1TotalOrders,
        period2Start,
        period2End,
        period2TotalOrders,
        ordersDifference,
        changePercentage,
        trendDescription,
    } = data || {};

    const isPositive = ordersDifference >= 0;
    const sign = ordersDifference > 0 ? '+' : '';

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>تقرير مقارنة الفترات</Text>
                        <Text style={styles.headerSubtitle}>تحليل الأداء</Text>
                    </View>
                    <View style={styles.logoContainer}>
                        <Image src="/2.png" style={styles.headerLogo} />
                        <Text style={styles.companyName}>شركة الخدمة السريعة{"\n"}express service</Text>
                    </View>
                </View>

                {/* Net Change Section */}
                <View style={styles.netChangeSection}>
                    <Text style={styles.netChangeTitle}>التغيير في الطلبات</Text>
                    <Text style={[styles.netChangeValue, isPositive ? styles.positiveChange : styles.negativeChange]}>
                        {sign}{ordersDifference}
                    </Text>
                    <View style={[styles.netChangePercentage, isPositive ? styles.positiveBadge : styles.negativeBadge]}>
                        <Text>{sign}{changePercentage}%</Text>
                    </View>
                    <Text style={styles.trendDescription}>{trendDescription}</Text>
                </View>

                {/* Comparison Section */}
                <View style={styles.comparisonContainer}>
                    {/* Period 2 (Current/Newer) */}
                    <View style={[styles.periodCard, { borderColor: '#bfdbfe', backgroundColor: '#eff6ff' }]}>
                        <Text style={styles.periodHeader}>الفترة الحالية (2)</Text>
                        <View style={styles.periodStat}>
                            <Text style={styles.statLabel}>إجمالي الطلبات</Text>
                            <Text style={[styles.statValue, { color: '#1e40af' }]}>{period2TotalOrders}</Text>
                        </View>
                        <View style={styles.dateRange}>
                            <View style={styles.dateRow}>
                                <Text style={styles.dateLabel}>:من</Text>
                                <Text style={styles.dateValue}>{period2Start}</Text>
                            </View>
                            <View style={styles.dateRow}>
                                <Text style={styles.dateLabel}>:إلى</Text>
                                <Text style={styles.dateValue}>{period2End}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Period 1 (Previous/Older) */}
                    <View style={styles.periodCard}>
                        <Text style={styles.periodHeader}>الفترة السابقة (1)</Text>
                        <View style={styles.periodStat}>
                            <Text style={styles.statLabel}>إجمالي الطلبات</Text>
                            <Text style={styles.statValue}>{period1TotalOrders}</Text>
                        </View>
                        <View style={styles.dateRange}>
                            <View style={styles.dateRow}>
                                <Text style={styles.dateLabel}>:من</Text>
                                <Text style={styles.dateValue}>{period1Start}</Text>
                            </View>
                            <View style={styles.dateRow}>
                                <Text style={styles.dateLabel}>:إلى</Text>
                                <Text style={styles.dateValue}>{period1End}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.pageFooter} fixed>
                    <Text>تم الإنشاء: {new Date().toLocaleString('en-US')}</Text>
                    <Text>express service Analytics System</Text>
                </View>
            </Page>
        </Document>
    );
};

export default ComparePeriodsReportPDF;
