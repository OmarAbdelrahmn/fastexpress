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

// Register Arabic font
Font.register({
    family: 'Cairo',
    src: '/fonts/7.ttf',
});

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Cairo',
        backgroundColor: '#ffffff',
    },
    // Header
    headerContainer: {
        backgroundColor: '#1e40af', // Blue-800ish (Since no gradients, pick a solid middle color)
        borderRadius: 8,
        padding: 15,
        marginBottom: 30,
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerRight: {
        flexDirection: 'column',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    headerLeft: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 10,
    },
    companyName: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'right',
    },
    logoBox: {
        width: 45,
        height: 45,
        backgroundColor: '#ffffff',
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
    },
    logo: {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
    },

    // Main Grid
    gridContainer: {
        flexDirection: 'row-reverse', // Period 1 is right (first in rtl), Period 2 is left.
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    column: {
        width: '30%',
        alignItems: 'center',
    },

    // Column Headers
    periodHeader: {
        backgroundColor: '#2563eb', // Blue-600
        paddingVertical: 10,
        width: '100%',
        borderRadius: 6,
        marginBottom: 20,
    },
    diffHeader: {
        backgroundColor: '#f59e0b', // Amber-500
        paddingVertical: 10,
        width: '100%',
        borderRadius: 6,
        marginBottom: 20,
    },
    headerText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },

    // Date/Info Box
    infoBox: {
        width: '100%',
        paddingHorizontal: 5,
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    infoLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#374151',
    },
    infoValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#374151',
    },

    // Value Card
    valueCard: {
        backgroundColor: '#3730a3', // Indigo-800
        paddingVertical: 15,
        width: '100%',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    valueText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
    },

    // Difference Value Card
    diffValueCardPositive: {
        backgroundColor: '#059669', // Emerald-600
    },
    diffValueCardNegative: {
        backgroundColor: '#dc2626', // Red-600
    },

    // Percentage Section
    percContainer: {
        flexDirection: 'row-reverse',
        justifyContent: 'center',
        gap: 20,
        marginTop: 20,
    },
    percLabelCard: {
        backgroundColor: '#3730a3', // Indigo-800
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 6,
        width: 150,
        alignItems: 'center',
    },
    percValueCard: {
        // Dynamic color
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 6,
        width: 150,
        alignItems: 'center',
    },

});

const SpecialReportPDF = ({ data }) => {
    if (!data) return null;

    const diff = Number(data.ordersDifference);
    const isPositive = diff >= 0;

    const perc = Number(data.changePercentage);
    const isPercPositive = perc >= 0; // Usually matches diff, but strictly checking logic.

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.headerContainer}>
                    <View style={styles.headerRight}>
                        <Text style={styles.headerTitle}>تقرير فرق عدد الطلبات</Text>
                    </View>
                    <View style={styles.headerLeft}>
                        <Text style={styles.companyName}>{data.companyName || "شركة الخدمة السريعة"}</Text>
                        <View style={styles.logoBox}>
                            <Image src="/2.png" style={styles.logo} />
                        </View>
                    </View>
                </View>

                {/* Grid */}
                <View style={styles.gridContainer}>

                    {/* Period 1 (Right) */}
                    <View style={styles.column}>
                        <View style={styles.periodHeader}>
                            <Text style={styles.headerText}>الفترة الأولى</Text>
                        </View>
                        <View style={styles.infoBox}>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>من:</Text>
                                <Text style={styles.infoValue}>{data.period1Start}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>إلى:</Text>
                                <Text style={styles.infoValue}>{data.period1End}</Text>
                            </View>
                        </View>
                        <View style={styles.valueCard}>
                            <Text style={styles.valueText}>{data.period1TotalOrders} طلب</Text>
                        </View>
                    </View>

                    {/* Difference (Middle) */}
                    <View style={styles.column}>
                        {/* Invisible spacer or empty view for alignment if needed, but flex gap handles it */}
                        <View style={{ height: 20 }} />

                        <View style={styles.diffHeader}>
                            <Text style={styles.headerText}>الفرق</Text>
                        </View>

                        {/* Spacer to align with Date Box height? 
                            Date box has 2 rows + margin ~ 40-50 height?
                            Let's just use margin bottom.
                        */}
                        <View style={{ marginBottom: 44 }} />

                        <View style={[styles.valueCard, isPositive ? styles.diffValueCardPositive : styles.diffValueCardNegative]}>
                            <Text style={styles.valueText}>{data.ordersDifference} طلب</Text>
                        </View>
                    </View>

                    {/* Period 2 (Left) */}
                    <View style={styles.column}>
                        <View style={styles.periodHeader}>
                            <Text style={styles.headerText}>الفترة الثانية</Text>
                        </View>
                        <View style={styles.infoBox}>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>من:</Text>
                                <Text style={styles.infoValue}>{data.period2Start}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>إلى:</Text>
                                <Text style={styles.infoValue}>{data.period2End}</Text>
                            </View>
                        </View>
                        <View style={styles.valueCard}>
                            <Text style={styles.valueText}>{data.period2TotalOrders} طلب</Text>
                        </View>
                    </View>

                </View>

                {/* Percentage Section */}
                <View style={styles.percContainer}>
                    <View style={styles.percLabelCard}>
                        <Text style={styles.headerText}>نسبة التغير</Text>
                    </View>
                    <View style={[styles.percValueCard, isPercPositive ? styles.diffValueCardPositive : styles.diffValueCardNegative]}>
                        <Text style={styles.valueText}>%{data.changePercentage}</Text>
                    </View>
                </View>

            </Page>
        </Document>
    );
};

export default SpecialReportPDF;
