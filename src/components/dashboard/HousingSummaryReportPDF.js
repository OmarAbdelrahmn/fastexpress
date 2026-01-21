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

// Styles
const styles = StyleSheet.create({
    page: {
        padding: 20,
        fontFamily: 'Cairo',
        backgroundColor: '#ffffff',
    },
    // Header
    header: {
        flexDirection: 'row', // LTR in PDF coordinate system, but we visually want RTL. 
        // Actually, for RTL layout in flex:
        // row-reverse puts items starting from right.
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottomWidth: 2,
        borderBottomColor: '#9ca3af', // gray-400
        borderBottomStyle: 'dashed',
        paddingBottom: 15,
        marginBottom: 20,
    },
    headerRight: {
        flexDirection: 'column',
        alignItems: 'flex-end', // Align to right
        width: '60%',
    },
    headerLeft: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        width: '40%',
        justifyContent: 'flex-end', // Align to left (visually right in PDF if reversed? No.)
        // Let's stick to standard flow and adjust alignment.
    },
    titleBox: {
        padding: 5,
        backgroundColor: '#ffffff',
        marginBottom: 10,
    },
    titleText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e3a8a', // blue-900
        textAlign: 'right',
    },
    dateRow: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 5,
    },
    dateLabel: {
        fontSize: 12,
        color: '#1e3a8a',
        fontWeight: 'bold',
    },
    dateValue: {
        fontSize: 12,
        color: '#000000',
    },
    companyInfo: {
        alignItems: 'flex-end',
        marginRight: 10,
    },
    companyName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1e3a8a',
        textAlign: 'right',
    },
    companySub: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#f59e0b', // amber-500
        textAlign: 'right',
    },
    logo: {
        width: 50,
        height: 50,
    },

    // Table
    table: {
        width: '100%',
        flexDirection: 'column',
    },
    tableHeaderRow: {
        flexDirection: 'row-reverse',
        gap: 2,
        marginBottom: 2,
    },
    tableHeaderCell: {
        backgroundColor: '#1a365d',
        padding: 4,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 2,
    },
    headerText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },

    // Table Data
    tableRow: {
        flexDirection: 'row-reverse',
        gap: 2,
        marginBottom: 2, // gap between rows
        height: 25,
        alignItems: 'stretch',
    },
    dataCell: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 1,
    },
    cellText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    // Colors per column
    colHousing: { width: '22%', backgroundColor: '#b91c1c' }, // red-700
    colTotal: { width: '23%', backgroundColor: '#0000cc' }, // blue-700ish
    colAvg: { width: '25%', backgroundColor: '#a3e635' }, // lime-400
    colActive: { width: '15%', backgroundColor: '#fbbf24' }, // amber-400
    colPerc: { width: '15%', backgroundColor: '#06b6d4' }, // cyan-500

    separator: {
        borderBottomWidth: 1,
        borderBottomColor: '#4c1d95',
        borderBottomStyle: 'dashed',
        marginBottom: 2,
        width: '100%',
    },

    // Footer Totals
    footerSection: {
        marginTop: 20,
        alignItems: 'center',
        width: '100%',
    },
    footerRow: {
        flexDirection: 'row-reverse', // Label right, value left
        width: '70%',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    footerLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1e3a8a',
    },
    footerValueBox: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        width: '35%',
    },
    valueContainer: {
        backgroundColor: '#000080',
        paddingVertical: 2,
        flexGrow: 1,
        alignItems: 'center',
        borderRadius: 2,
    },
    valueText: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: 'bold',
    },
    unitText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#1e3a8a',
        marginLeft: 5,
        paddingRight: 5,
    },
    footerDivider: {
        height: 1,
        backgroundColor: '#000000',
        width: '70%',
        marginBottom: 5,
    },
});

const HousingSummaryReportPDF = ({ data }) => {
    if (!data) return null;

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return dateString;
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    {/* Title Section (Right side visually because row-reverse) */}
                    <View style={styles.headerRight}>
                        <View style={styles.titleBox}>
                            <Text style={styles.titleText}>تقرير إجمالي عدد الطلبات لكل مجموعة</Text>
                        </View>
                        <View style={styles.dateRow}>
                            <Text style={styles.dateLabel}>اليوم:</Text>
                            <Text style={styles.dateValue}>{formatDate(data.reportDate)}</Text>
                        </View>
                    </View>

                    {/* Company Info (Left side visually) */}
                    <View style={styles.headerLeft}>
                        <View style={styles.companyInfo}>
                            <Text style={styles.companyName}>{data.companyName || "شركة الخدمة السريعة"}</Text>
                            <Text style={styles.companySub}>للخدمات اللوجستية</Text>
                        </View>
                        <Image src="/2.png" style={styles.logo} />
                    </View>
                </View>

                {/* Table Header */}
                <View style={styles.tableHeaderRow}>
                    <View style={[styles.tableHeaderCell, { width: '22%' }]}>
                        <Text style={styles.headerText}>المجموعة</Text>
                    </View>
                    <View style={[styles.tableHeaderCell, { width: '23%' }]}>
                        <Text style={styles.headerText}>عدد الطلبات</Text>
                        <Text style={styles.headerText}>الإجمالي</Text>
                    </View>
                    <View style={[styles.tableHeaderCell, { width: '25%' }]}>
                        <Text style={styles.headerText}>متوسط</Text>
                        <Text style={styles.headerText}>عدد الطلبات</Text>
                    </View>
                    <View style={[styles.tableHeaderCell, { width: '15%' }]}>
                        <Text style={styles.headerText}>عدد</Text>
                        <Text style={styles.headerText}>المناديب</Text>
                    </View>
                    <View style={[styles.tableHeaderCell, { width: '15%' }]}>
                        <Text style={styles.headerText}>نسبة</Text>
                        <Text style={styles.headerText}>كل مجموعة</Text>
                    </View>
                </View>

                {/* Rows */}
                {data.housingSummaries?.map((item, index) => (
                    <View key={index} wrap={false}>
                        <View style={styles.tableRow}>
                            {/* Housing Name - Red */}
                            <View style={[styles.dataCell, styles.colHousing]}>
                                <Text style={[styles.cellText, { color: '#ffffff' }]}>{item.housingName}</Text>
                            </View>
                            {/* Total Orders - Blue */}
                            <View style={[styles.dataCell, styles.colTotal]}>
                                <Text style={[styles.cellText, { color: '#ffffff', textDecoration: 'underline' }]}>{item.totalOrders}</Text>
                            </View>
                            {/* Avg - Lime */}
                            <View style={[styles.dataCell, styles.colAvg]}>
                                <Text style={[styles.cellText, { color: '#000000', textDecoration: 'underline' }]}>{item.averageOrdersPerRider}</Text>
                            </View>
                            {/* Active - Amber */}
                            <View style={[styles.dataCell, styles.colActive]}>
                                <Text style={[styles.cellText, { color: '#000000', textDecoration: 'underline' }]}>{item.activeRiders}</Text>
                            </View>
                            {/* Perc - Cyan */}
                            <View style={[styles.dataCell, styles.colPerc]}>
                                <Text style={[styles.cellText, { color: '#000000', textDecoration: 'underline' }]}>{item.percentageOfTotalOrders}%</Text>
                            </View>
                        </View>
                        <View style={styles.separator} />
                    </View>
                ))}

                {/* Footer Totals */}
                <View style={styles.footerSection}>
                    {/* Total Orders */}
                    <View style={styles.footerRow}>
                        <Text style={styles.footerLabel}>إجمالي عدد الطلبات الكلي</Text>
                        <View style={styles.footerValueBox}>
                            <View style={styles.valueContainer}>
                                <Text style={styles.valueText}>{data.totalOrders}</Text>
                            </View>
                            <Text style={styles.unitText}>طلب</Text>
                        </View>
                    </View>

                    <View style={styles.footerDivider} />

                    {/* Total Riders */}
                    <View style={styles.footerRow}>
                        <Text style={styles.footerLabel}>إجمالي عدد المناديب النشطين خلال هذه الفترة</Text>
                        <View style={styles.footerValueBox}>
                            <View style={styles.valueContainer}>
                                <Text style={styles.valueText}>{data.totalRiders}</Text>
                            </View>
                            <Text style={styles.unitText}>سائق</Text>
                        </View>
                    </View>
                </View>

            </Page>
        </Document>
    );
};

export default HousingSummaryReportPDF;
