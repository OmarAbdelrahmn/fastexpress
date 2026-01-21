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
        fontSize: 18,
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
        fontSize: 13,
        color: '#1e3a8a',
        fontWeight: 'bold',
    },
    dateValue: {
        fontSize: 13,
        color: '#000000',
    },
    companyName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e3a8a',
        textAlign: 'right',
    },
    companySub: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#f59e0b',
        textAlign: 'right',
    },
    logo: {
        width: 45,
        height: 45,
    },

    // Housing Group
    housingTitleBox: {
        backgroundColor: '#fef08a',
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 4,
        alignSelf: 'flex-end',
        marginBottom: 8,
        marginTop: 10,
    },
    housingTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e3a8a',
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

    // Columns
    colIndex: { width: '10%', textAlign: 'center' },
    colName: { width: '35%', textAlign: 'right', paddingRight: 5 },
    colOrders: { width: '25%', alignItems: 'center' },
    colId: { width: '30%', textAlign: 'center' },

    headerText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#000000',
    },
    cellText: {
        fontSize: 13,
        color: '#000000',
    },
    orderBadge: {
        borderWidth: 1,
        borderColor: '#1e3a8a',
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: 2,
    },
    orderText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1e3a8a',
    },
    idText: {
        fontSize: 12,
        color: '#374151',
    },

    // Grand Total
    grandTotalSection: {
        marginTop: 35,
        marginBottom: 20,
        paddingTop: 10,
        borderTopWidth: 3,
        borderTopColor: '#000000',
    },
    grandTotalBox: {
        backgroundColor: '#f3f4f6',
        padding: 10,
        borderRadius: 4,
        flexDirection: 'row-reverse',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    gtItem: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 8,
    },
    gtLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e3a8a',
    },
    gtValueBox: {
        backgroundColor: '#1e3a8a',
        borderRadius: 4,
        paddingHorizontal: 12,
        paddingVertical: 2,
    },
    gtValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
    },

    // Housing Summary
    housingSummarySection: {
        marginTop: 15,
        paddingTop: 10,
        borderTopWidth: 2,
        borderTopColor: '#9ca3af',
        borderTopStyle: 'dashed',
    },
    housingSummaryBox: {
        backgroundColor: '#fef3c7',
        padding: 10,
        borderRadius: 4,
        flexDirection: 'row-reverse',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    hsItem: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 6,
    },
    hsLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1e3a8a',
    },
    hsValueBox: {
        backgroundColor: '#1e3a8a',
        borderRadius: 4,
        paddingHorizontal: 10,
        paddingVertical: 2,
    },
    hsValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#ffffff',
    },
});

const HousingDetailedReportPDF = ({ data }) => {
    if (!data) return null;

    const ROWS_PER_PAGE = 18;
    const formatDate = (dateString) => dateString || '';

    // Prepare pages organized by housing
    const createPages = () => {
        const housingPages = [];

        data.housingDetails?.forEach((housing, housingIndex) => {
            const housingRiders = housing.riders || [];
            const housingName = housing.housingName;

            // Calculate housing statistics
            const totalOrders = housingRiders.reduce((sum, rider) => sum + (rider.acceptedOrders || 0), 0);
            const riderCount = housingRiders.length;
            const avgOrders = riderCount > 0 ? (totalOrders / riderCount).toFixed(2) : 0;

            // Split riders into pages (max ROWS_PER_PAGE per page)
            const housingPagesData = [];
            for (let i = 0; i < housingRiders.length; i += ROWS_PER_PAGE) {
                housingPagesData.push({
                    riders: housingRiders.slice(i, i + ROWS_PER_PAGE),
                    startIndex: i,
                    isFirstPage: i === 0,
                    isLastPage: i + ROWS_PER_PAGE >= housingRiders.length,
                });
            }

            // If no riders, still create one page for the housing
            if (housingPagesData.length === 0) {
                housingPagesData.push({
                    riders: [],
                    startIndex: 0,
                    isFirstPage: true,
                    isLastPage: true,
                });
            }

            housingPagesData.forEach((pageData) => {
                housingPages.push({
                    housingName,
                    riders: pageData.riders,
                    startIndex: pageData.startIndex,
                    isFirstPage: pageData.isFirstPage,
                    isLastPage: pageData.isLastPage,
                    housingStats: {
                        totalOrders,
                        riderCount,
                        avgOrders,
                    },
                });
            });
        });

        return housingPages;
    };

    const pages = createPages();

    // Header component
    const Header = () => (
        <View style={styles.header}>
            <View style={styles.headerRight}>
                <View style={styles.titleBox}>
                    <Text style={styles.titleText}>تقرير تفصيلي لعدد الطلبات لجميع السائقين</Text>
                </View>
                <View style={styles.dateRow}>
                    <Text style={styles.dateLabel}>تاريخ التقرير:</Text>
                    <Text style={styles.dateValue}>{formatDate(data.reportDate)}</Text>
                </View>
            </View>
            <View style={styles.headerLeft}>
                <View>
                    <Text style={styles.companyName}>{data.companyName || "شركة الخدمة السريعة"}</Text>
                    <Text style={styles.companySub}>للخدمات اللوجستية</Text>
                </View>
                <Image src="/2.png" style={styles.logo} />
            </View>
        </View>
    );

    // Calculate cumulative rider count for global indexing
    let cumulativeRiderCount = 0;
    const pageGlobalOffsets = pages.map((page) => {
        const offset = cumulativeRiderCount;
        cumulativeRiderCount += page.riders.length;
        return offset;
    });

    return (
        <Document>
            {pages.map((pageData, pageIndex) => {
                const isLastPageOfReport = pageIndex === pages.length - 1;
                const globalOffset = pageGlobalOffsets[pageIndex];

                return (
                    <Page key={pageIndex} size="A4" style={styles.page}>
                        <Header />

                        {/* Housing Title - Only on first page of housing */}
                        {pageData.isFirstPage && (
                            <>
                                <View style={styles.housingTitleBox}>
                                    <Text style={styles.housingTitle}>{pageData.housingName}</Text>
                                </View>
                                <View style={styles.tableHeader}>
                                    <View style={styles.colIndex}><Text style={styles.headerText}>م</Text></View>
                                    <View style={styles.colName}><Text style={styles.headerText}>اسم السائق</Text></View>
                                    <View style={styles.colOrders}><Text style={styles.headerText}>الطلبات</Text></View>
                                    <View style={styles.colId}><Text style={styles.headerText}>المعرف</Text></View>
                                </View>
                            </>
                        )}

                        {/* Table Rows */}
                        {pageData.riders.map((rider, riderIndex) => (
                            <View key={riderIndex} style={styles.tableRow}>
                                <View style={styles.colIndex}>
                                    <Text style={styles.cellText}>{globalOffset + riderIndex + 1}</Text>
                                </View>
                                <View style={styles.colName}>
                                    <Text style={[styles.cellText, { textAlign: 'right' }]}>
                                        {rider.riderName}
                                    </Text>
                                </View>
                                <View style={styles.colOrders}>
                                    <View style={styles.orderBadge}>
                                        <Text style={styles.orderText}>{rider.acceptedOrders}</Text>
                                    </View>
                                </View>
                                <View style={styles.colId}>
                                    <Text style={styles.idText}>
                                        {rider.workingId || rider.riderId}
                                    </Text>
                                </View>
                            </View>
                        ))}

                        {/* Housing Summary - Only on last page of housing */}
                        {pageData.isLastPage && (
                            <View style={styles.housingSummarySection} wrap={false}>
                                <View style={styles.housingSummaryBox}>
                                    <View style={styles.hsItem}>
                                        <Text style={styles.hsLabel}>عدد السائقين:</Text>
                                        <View style={styles.hsValueBox}>
                                            <Text style={styles.hsValue}>{pageData.housingStats.riderCount}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.hsItem}>
                                        <Text style={styles.hsLabel}>إجمالي الطلبات:</Text>
                                        <View style={styles.hsValueBox}>
                                            <Text style={styles.hsValue}>{pageData.housingStats.totalOrders}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.hsItem}>
                                        <Text style={styles.hsLabel}>المتوسط:</Text>
                                        <View style={styles.hsValueBox}>
                                            <Text style={styles.hsValue}>{pageData.housingStats.avgOrders}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Grand Totals - Only on last page of entire report */}
                        {isLastPageOfReport && (
                            <View style={styles.grandTotalSection}>
                                <View style={styles.grandTotalBox}>
                                    <View style={styles.gtItem}>
                                        <Text style={styles.gtLabel}>إجمالي عدد الطلبات الكلي:</Text>
                                        <View style={styles.gtValueBox}>
                                            <Text style={styles.gtValue}>{data.grandTotalOrders}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.gtItem}>
                                        <Text style={styles.gtLabel}>إجمالي عدد السائقين:</Text>
                                        <View style={styles.gtValueBox}>
                                            <Text style={styles.gtValue}>{data.grandTotalRiders}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        )}
                    </Page>
                );
            })}
        </Document>
    );
};

export default HousingDetailedReportPDF;
