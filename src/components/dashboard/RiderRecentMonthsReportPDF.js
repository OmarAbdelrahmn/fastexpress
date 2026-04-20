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
        padding: 20,
        paddingBottom: 75,
        fontFamily: 'Cairo',
        backgroundColor: '#ffffff',
    },
    // Header
    header: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottomWidth: 2,
        borderBottomColor: '#9ca3af',
        borderBottomStyle: 'dashed',
        paddingBottom: 10,
        marginBottom: 15,
    },
    headerRight: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        width: '60%',
    },
    headerLeft: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        width: '40%',
        gap: 8,
    },
    titleBox: {
        padding: 4,
        marginBottom: 6,
    },
    titleText: {
        fontSize: 16, // Slightly smaller to fit long title
        fontWeight: 'bold',
        color: '#1e3a8a',
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
    companyName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1e3a8a',
        textAlign: 'right',
    },
    companySub: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#f59e0b',
        textAlign: 'right',
    },
    logo: {
        width: 40,
        height: 40,
    },

    // Table
    tableHeader: {
        flexDirection: 'row-reverse',
        backgroundColor: '#fde68a',
        paddingVertical: 5,
        borderBottomWidth: 2,
        borderBottomColor: '#ffffff',
    },
    tableRow: {
        flexDirection: 'row-reverse',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        paddingVertical: 4,
        alignItems: 'center',
    },

    // Dynamic Columns (RTL order: Index, Name, Months..., Avg, Trend)
    colIndex: { width: '5%', textAlign: 'center' },
    colName: { width: '35%', textAlign: 'right', paddingRight: 5 },
    colMonth: { flex: 1, textAlign: 'center' },
    colAvg: { width: '15%', textAlign: 'center' },

    headerText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#000000',
    },
    cellText: {
        fontSize: 10,
        color: '#000000',
    },

    // Footer Stats
    footerSection: {
        marginTop: 20,
        paddingTop: 10,
        borderTopWidth: 2,
        borderTopColor: '#9ca3af',
        borderTopStyle: 'dashed',
    },
    footerBox: {
        padding: 8,
        backgroundColor: '#f8fafc',
        borderRadius: 4,
        flexDirection: 'row-reverse',
        justifyContent: 'space-around',
    },
    footerItem: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 5,
    },
    footerLabel: { fontSize: 11, fontWeight: 'bold' },
    footerValue: { fontSize: 11, color: '#1e3a8a', fontWeight: 'bold' },
});

const RiderRecentMonthsReportPDF = ({ data }) => {
    if (!data) return null;

    const ROWS_PER_PAGE = 22;
    const months = data.monthsQueried || [];
    const riders = data.riders || [];

    const getMonthValue = (rider, year, month) => {
        const found = rider.monthlyOrders?.find(m => m.year === year && m.month === month);
        return found ? found.acceptedOrders : 0;
    };

    // Pagination logic
    const createPages = () => {
        const pages = [];
        for (let i = 0; i < riders.length; i += ROWS_PER_PAGE) {
            pages.push(riders.slice(i, i + ROWS_PER_PAGE));
        }
        if (pages.length === 0) pages.push([]);
        return pages;
    };

    const pages = createPages();

    const Header = () => (
        <View style={styles.header}>
            <View style={styles.headerRight}>
                <View style={styles.titleBox}>
                    <Text style={styles.titleText}>تقرير أداء السائقين خلال الشهور الأخيرة</Text>
                </View>
                <View style={styles.dateRow}>
                    <Text style={styles.dateLabel}>تاريخ استخراج التقرير:</Text>
                    <Text style={styles.dateValue}>{data.currentMonth || new Date().toISOString().split('T')[0]}</Text>
                </View>
            </View>
            <View style={styles.headerLeft}>
                <View>
                    <Text style={styles.companyName}>شركة الخدمة السريعة</Text>
                    <Text style={styles.companySub}>للخدمات اللوجستية</Text>
                </View>
                <Image src="/2.png" style={styles.logo} />
            </View>
        </View>
    );

    return (
        <Document>
            {pages.map((pageRiders, pageIndex) => (
                <Page key={pageIndex} size="A4" style={styles.page}>
                    <Header />

                    {/* Table Header */}
                    <View style={styles.tableHeader}>
                        <View style={styles.colIndex}><Text style={styles.headerText}>م</Text></View>
                        <View style={styles.colName}><Text style={styles.headerText}>اسم السائق</Text></View>
                        {months.map((m, idx) => (
                            <View key={idx} style={styles.colMonth}>
                                <Text style={styles.headerText}>{m.monthName}</Text>
                            </View>
                        ))}
                        <View style={styles.colAvg}><Text style={styles.headerText}>المتوسط</Text></View>
                    </View>

                    {/* Table Rows */}
                    {pageRiders.map((rider, rIdx) => {
                        const globalIdx = pageIndex * ROWS_PER_PAGE + rIdx + 1;
                        const trend = Number(rider.trendVsPrevious3Avg);

                        return (
                            <View key={rIdx} style={styles.tableRow}>
                                <View style={styles.colIndex}><Text style={styles.cellText}>{globalIdx}</Text></View>
                                <View style={styles.colName}><Text style={styles.cellText}>{rider.riderNameAR || rider.riderNameEN}</Text></View>
                                {months.map((m, mIdx) => (
                                    <View key={mIdx} style={styles.colMonth}>
                                        <Text style={styles.cellText}>{getMonthValue(rider, m.year, m.month)}</Text>
                                    </View>
                                ))}
                                <View style={styles.colAvg}><Text style={styles.cellText}>{rider.averageOrdersPerActiveMonth?.toFixed(1) || 0}</Text></View>
                            </View>
                        );
                    })}

                    {/* Footer Stats - Only on last page */}
                    {pageIndex === pages.length - 1 && (
                        <View style={styles.footerSection}>
                            <View style={styles.footerBox}>
                                <View style={styles.footerItem}>
                                    <Text style={styles.footerLabel}>إجمالي المذكورين:</Text>
                                    <Text style={styles.footerValue}>{data.totalRequested}</Text>
                                </View>
                                <View style={styles.footerItem}>
                                    <Text style={styles.footerLabel}>تم العثور على:</Text>
                                    <Text style={styles.footerValue}>{data.totalFound}</Text>
                                </View>
                                <View style={styles.footerItem}>
                                    <Text style={styles.footerLabel}>غير موجود:</Text>
                                    <Text style={styles.footerValue}>{data.notFound?.length || 0}</Text>
                                </View>
                            </View>
                        </View>
                    )}
                </Page>
            ))}
        </Document>
    );
};

export default RiderRecentMonthsReportPDF;
