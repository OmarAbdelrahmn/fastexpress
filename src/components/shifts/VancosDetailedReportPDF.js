// File: src/components/shifts/VancosDetailedReportPDF.js
import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font,
    Image,
    pdf,
} from '@react-pdf/renderer';

// Register Cairo font from public directory (identical to HousingDetailedReportPDF)
Font.register({
    family: 'Cairo',
    src: '/fonts/7.ttf',
});

const styles = StyleSheet.create({
    page: {
        padding: 20,
        paddingBottom: 65,
        fontFamily: 'Cairo',
        backgroundColor: '#ffffff',
    },

    // Header (Styled like HousingDetailedReportPDF)
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
        width: '58%',
    },
    headerLeft: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        width: '42%',
        gap: 8,
    },
    titleBox: {
        padding: 2,
        marginBottom: 4,
    },
    titleText: {
        fontSize: 17,
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
        fontSize: 17,
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
        width: 44,
        height: 44,
        borderRadius: 6,
        objectFit: 'contain',
    },

    // Table Header
    tableHeader: {
        flexDirection: 'row-reverse',
        backgroundColor: '#fde68a',
        paddingVertical: 6,
        borderBottomWidth: 2,
        borderBottomColor: '#ffffff',
        borderRadius: 2,
    },
    tableRow: {
        flexDirection: 'row-reverse',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        paddingVertical: 4.5,
        alignItems: 'center',
    },
    tableRowEven: {
        backgroundColor: '#fafafa',
    },

    // Columns: No housing, strictly serial, rider name, orders, working hours
    colIndex: { width: '10%', textAlign: 'center' },
    colName: { width: '50%', textAlign: 'right', paddingRight: 8 },
    colOrders: { width: '20%', alignItems: 'center', justifyContent: 'center' },
    colWorkingHours: { width: '20%', alignItems: 'center', justifyContent: 'center' },

    headerText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#000000',
    },
    cellText: {
        fontSize: 11.5,
        color: '#000000',
    },
    riderNameText: {
        fontSize: 11.5,
        fontWeight: 'bold',
        color: '#111827',
    },
    riderSubText: {
        fontSize: 9,
        color: '#6b7280',
        marginTop: 1,
    },
    orderBadge: {
        borderWidth: 1,
        borderColor: '#1e3a8a',
        paddingHorizontal: 8,
        paddingVertical: 1.5,
        borderRadius: 3,
        minWidth: 32,
        alignItems: 'center',
    },
    orderText: {
        fontSize: 11.5,
        fontWeight: 'bold',
        color: '#1e3a8a',
        textAlign: 'center',
    },

    // Grand Total Section (Matches HousingDetailedReportPDF)
    grandTotalSection: {
        marginTop: 22,
        marginBottom: 10,
        paddingTop: 10,
        borderTopWidth: 2.5,
        borderTopColor: '#000000',
    },
    grandTotalBox: {
        backgroundColor: '#f3f4f6',
        padding: 9,
        borderRadius: 4,
        flexDirection: 'row-reverse',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    gtItem: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 5,
    },
    gtLabel: {
        fontSize: 11.5,
        fontWeight: 'bold',
        color: '#1e3a8a',
    },
    gtValueBox: {
        backgroundColor: '#1e3a8a',
        borderRadius: 4,
        paddingHorizontal: 9,
        paddingVertical: 2,
    },
    gtValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#ffffff',
    },

    // Empty state
    emptyBox: {
        paddingVertical: 35,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 13,
        color: '#9ca3af',
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 18,
        left: 20,
        right: 20,
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        paddingTop: 6,
    },
    footerText: {
        fontSize: 9,
        color: '#6b7280',
    },
});

export const VancosDetailedReportPDF = ({ data }) => {
    if (!data) return null;

    const ROWS_PER_PAGE = 20;
    const formatDate = (dateString) => dateString || '';
    const items = Array.isArray(data.items) ? data.items : [];

    // Paginate rows without housing grouping
    const createPages = () => {
        if (items.length === 0) {
            return [{
                items: [],
                startIndex: 0,
                isFirstPage: true,
                isLastPage: true,
            }];
        }

        const pagesData = [];
        for (let i = 0; i < items.length; i += ROWS_PER_PAGE) {
            pagesData.push({
                items: items.slice(i, i + ROWS_PER_PAGE),
                startIndex: i,
                isFirstPage: i === 0,
                isLastPage: i + ROWS_PER_PAGE >= items.length,
            });
        }
        return pagesData;
    };

    const pages = createPages();

    // Reusable Header Component
    const isRtl = data.isRtl !== false && data.locale !== 'en';

    const Header = () => (
        <View style={[styles.header, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <View style={[styles.headerRight, { alignItems: isRtl ? 'flex-end' : 'flex-start' }]}>
                <View style={styles.titleBox}>
                    <Text style={[styles.titleText, { textAlign: isRtl ? 'right' : 'left' }]}>
                        {isRtl ? 'تقرير تفصيلي لعدد الطلبات وساعات العمل' : 'Detailed Orders & Working Hours Report'}
                    </Text>
                </View>
                <View style={[styles.dateRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                    <Text style={styles.dateLabel}>{isRtl ? 'تاريخ التقرير:' : 'Report Date:'}</Text>
                    <Text style={styles.dateValue}>{formatDate(data.reportDate)}</Text>
                </View>
            </View>
            <View style={[styles.headerLeft, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <View>
                    <Text style={[styles.companyName, { textAlign: isRtl ? 'right' : 'left' }]}>
                        {isRtl ? (data.companyName || 'فانكوس جولد') : (data.companyNameEN || 'Vancos Gold')}
                    </Text>
                    <Text style={[styles.companySub, { textAlign: isRtl ? 'right' : 'left' }]}>
                        {isRtl ? 'للخدمات اللوجستية' : 'Logistics Services'}
                    </Text>
                </View>
                <Image src={data.logoUrl || "/vancos-icon.png"} style={styles.logo} />
            </View>
        </View>
    );

    return (
        <Document>
            {pages.map((pageData, pageIndex) => {
                const isLastPageOfReport = pageIndex === pages.length - 1;

                return (
                    <Page key={pageIndex} size="A4" style={styles.page}>
                        <Header />

                        {/* Table Header */}
                        <View style={[styles.tableHeader, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                            <View style={styles.colIndex}><Text style={styles.headerText}>{isRtl ? 'م' : '#'}</Text></View>
                            <View style={[styles.colName, { textAlign: isRtl ? 'right' : 'left', paddingRight: isRtl ? 8 : 0, paddingLeft: isRtl ? 0 : 8 }]}>
                                <Text style={styles.headerText}>{isRtl ? 'اسم السائق' : 'Driver / Rider Name'}</Text>
                            </View>
                            <View style={styles.colOrders}><Text style={styles.headerText}>{isRtl ? 'الطلبات' : 'Orders'}</Text></View>
                            <View style={styles.colWorkingHours}><Text style={styles.headerText}>{isRtl ? 'ساعات العمل' : 'Working Hours'}</Text></View>
                        </View>

                        {/* Table Rows (No Housing Grouping) */}
                        {pageData.items.length === 0 ? (
                            <View style={styles.emptyBox}>
                                <Text style={styles.emptyText}>
                                    {isRtl ? 'لا توجد سجلات عمل مسجلة لهذا اليوم' : 'No daily work records found for this date'}
                                </Text>
                            </View>
                        ) : (
                            pageData.items.map((rider, idx) => {
                                const globalIdx = pageData.startIndex + idx + 1;
                                const isEven = idx % 2 === 1;
                                const orders = rider.orders ?? 0;
                                const hours = Number(rider.workingHours ?? 0);
                                const isLowHours = hours < 8;

                                return (
                                    <View key={idx} style={[
                                        styles.tableRow, 
                                        { flexDirection: isRtl ? 'row-reverse' : 'row' },
                                        isEven ? styles.tableRowEven : {}
                                    ]}>
                                        <View style={styles.colIndex}>
                                            <Text style={styles.cellText}>{globalIdx}</Text>
                                        </View>
                                        <View style={[
                                            styles.colName, 
                                            { textAlign: isRtl ? 'right' : 'left', paddingRight: isRtl ? 8 : 0, paddingLeft: isRtl ? 0 : 8 }
                                        ]}>
                                            <Text style={[styles.riderNameText, { textAlign: isRtl ? 'right' : 'left' }]}>
                                                {rider.riderName || rider.name}
                                            </Text>
                                            {(rider.workingId || rider.date) ? (
                                                <Text style={[styles.riderSubText, { textAlign: isRtl ? 'right' : 'left' }]}>
                                                    {rider.date ? `${isRtl ? 'التاريخ: ' : 'Date: '}${rider.date}` : ''}
                                                    {rider.date && rider.workingId ? ' | ' : ''}
                                                    {rider.workingId ? `${isRtl ? 'معرّف: ' : 'ID: '}${rider.workingId}` : ''}
                                                </Text>
                                            ) : null}
                                        </View>
                                        <View style={styles.colOrders}>
                                            <View style={styles.orderBadge}>
                                                <Text style={styles.orderText}>{orders}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.colWorkingHours}>
                                            <Text style={[
                                                styles.cellText,
                                                isLowHours ? { color: '#ef4444', fontWeight: 'bold' } : {}
                                            ]}>
                                                {hours.toFixed(2)}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })
                        )}

                        {/* Grand Totals - Displayed at the end of the report */}
                        {isLastPageOfReport && (
                            <View style={styles.grandTotalSection} wrap={false}>
                                <View style={[styles.grandTotalBox, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                                    <View style={[styles.gtItem, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                                        <Text style={styles.gtLabel}>{isRtl ? 'إجمالي عدد السائقين:' : 'Total Drivers:'}</Text>
                                        <View style={styles.gtValueBox}>
                                            <Text style={styles.gtValue}>{data.grandTotalRiders ?? items.length}</Text>
                                        </View>
                                    </View>
                                    <View style={[styles.gtItem, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                                        <Text style={styles.gtLabel}>{isRtl ? 'إجمالي عدد الطلبات:' : 'Total Orders:'}</Text>
                                        <View style={styles.gtValueBox}>
                                            <Text style={styles.gtValue}>{data.grandTotalOrders ?? 0}</Text>
                                        </View>
                                    </View>
                                    <View style={[styles.gtItem, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                                        <Text style={styles.gtLabel}>{isRtl ? 'إجمالي ساعات العمل:' : 'Total Working Hours:'}</Text>
                                        <View style={styles.gtValueBox}>
                                            <Text style={styles.gtValue}>{data.grandTotalHours ?? '0.00'}</Text>
                                        </View>
                                    </View>
                                    <View style={[styles.gtItem, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                                        <Text style={styles.gtLabel}>{isRtl ? 'متوسط الطلبات:' : 'Average Orders:'}</Text>
                                        <View style={styles.gtValueBox}>
                                            <Text style={styles.gtValue}>{data.avgOrders ?? '0'}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Page Footer */}
                        <View style={[styles.footer, { flexDirection: isRtl ? 'row-reverse' : 'row' }]} fixed>
                            <Text style={styles.footerText}>
                                {isRtl ? 'فانكوس جولد - تقرير العمل اليومي' : 'Vancos Gold - Daily Work Report'}
                            </Text>
                            <Text 
                                style={styles.footerText} 
                                render={({ pageNumber, totalPages }) => 
                                    isRtl ? `صفحة ${pageNumber} من ${totalPages}` : `Page ${pageNumber} of ${totalPages}`
                                } 
                            />
                        </View>
                    </Page>
                );
            })}
        </Document>
    );
};

// Queue for serializing pdf rendering tasks to prevent concurrent worker crashes
let pdfRenderQueue = Promise.resolve();

export function renderVancosPdfBlob(data) {
    const renderTask = pdfRenderQueue.then(() => pdf(<VancosDetailedReportPDF data={data} />).toBlob());
    pdfRenderQueue = renderTask.catch(() => undefined);
    return renderTask;
}

export function downloadVancosBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
}

export default VancosDetailedReportPDF;
