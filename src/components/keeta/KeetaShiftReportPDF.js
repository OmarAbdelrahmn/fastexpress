'use client';

import { useState, useEffect } from 'react';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Register Cairo font from public directory
Font.register({
    family: 'Cairo',
    src: '/fonts/7.ttf',
});

const styles = StyleSheet.create({
    page: {
        padding: 20,
        fontFamily: 'Cairo',
        backgroundColor: '#ffffff',
        flexDirection: 'column',
    },
    // Unified Header Section (Title + Info Box)
    headerSection: {
        borderWidth: 1.5,
        borderColor: '#000000',
        marginBottom: 12,
        flexDirection: 'column',
    },
    titleContainer: {
        backgroundColor: '#d9d9d9', // Gray background like reference
        borderBottomWidth: 1.5,
        borderBottomColor: '#000000',
        paddingVertical: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    titleText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000000',
    },
    infoSection: {
        flexDirection: 'row-reverse',
    },
    infoCellRight: {
        width: '50%',
        paddingHorizontal: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoNameText: {
        fontSize: 9.5,
        fontWeight: 'bold',
        color: '#000000',
        textAlign: 'center',
    },
    infoCellLeft: {
        width: '50%',
        borderRightWidth: 1.5,
        borderRightColor: '#000000',
        flexDirection: 'column',
    },
    infoSubRowTop: {
        borderBottomWidth: 1.5,
        borderBottomColor: '#000000',
        paddingHorizontal: 8,
        paddingVertical: 2,
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoSubRowBottom: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 7,
        fontWeight: 'bold',
        color: '#000000',
    },
    infoValue: {
        fontSize: 7,
        fontWeight: 'bold',
        color: '#000000',
    },
    // Table
    tableHeader: {
        flexDirection: 'row-reverse',
        backgroundColor: '#bfbfbf',
        borderWidth: 1.5,
        borderColor: '#000000',
    },
    tableRow: {
        flexDirection: 'row-reverse',
        borderLeftWidth: 1.5,
        borderRightWidth: 1.5,
        borderBottomWidth: 1.5,
        borderColor: '#000000',
    },
    tableRowAlt: {
        flexDirection: 'row-reverse',
        borderLeftWidth: 1.5,
        borderRightWidth: 1.5,
        borderBottomWidth: 1.5,
        borderColor: '#000000',
        backgroundColor: '#f9fafb',
    },
    // Columns (right to left visually)
    colDate: { width: '11%', borderLeftWidth: 1.5, borderLeftColor: '#000000', justifyContent: 'center', alignItems: 'center' },
    colDriverId: { width: '16%', borderLeftWidth: 1.5, borderLeftColor: '#000000', justifyContent: 'center', alignItems: 'center' },
    colShift: { width: '25%', borderLeftWidth: 1.5, borderLeftColor: '#000000', justifyContent: 'center', alignItems: 'center' },
    colLocation: { width: '22%', borderLeftWidth: 1.5, borderLeftColor: '#000000', justifyContent: 'center', alignItems: 'center' },
    colStatus: { width: '8%', borderLeftWidth: 1.5, borderLeftColor: '#000000', justifyContent: 'center', alignItems: 'center' },
    colHours: { width: '10%', borderLeftWidth: 1.5, borderLeftColor: '#000000', justifyContent: 'center', alignItems: 'center' },
    colOrders: { width: '8%', justifyContent: 'center', alignItems: 'center' },

    headerText: {
        fontSize: 8,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#000000',
        paddingVertical: 0,
    },
    cellText: {
        fontSize: 7,
        textAlign: 'center',
        color: '#000000',
        paddingVertical: 0,
    },
    // Footer
    footerContainer: {
        flexGrow: 1,
        justifyContent: 'flex-end',
        marginTop: 15,
    },
    footerContent: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    footerStamp: {
        width: 150,
        height: 150,
        objectFit: 'contain',
        marginBottom: 5,
    },
    footerTimestamp: {
        fontSize: 8,
        color: '#555555',
        textAlign: 'left',
        width: '100%',
    },
});

// React PDF Document
function KeetaShiftDocument({ rider, workLocation, generatedAt }) {
    if (!rider) return null;

    const days = rider.days || [];
    const name = rider.riderNameAR || rider.riderNameEN || '-';
    const iqama = rider.riderIqama || rider.iqamaNo || '-';
    const workingId = rider.workingId || '-';

    // ── Helpers ──
    const buildShiftString = (day) => {
        if (!day.slots || day.slots.length === 0) return '-';
        return day.slots.map(s => s.slotKey).join(' | ');
    };

    const formatHours = (day) => {
        const raw = day.connectionTimeRaw ? String(day.connectionTimeRaw).trim() : null;
        if (raw) {
            const decimalMatch = raw.match(/^(\d*)\.(\d+)$/);
            if (decimalMatch) {
                const h = decimalMatch[1] !== '' ? decimalMatch[1] : '0';
                return `${h}.${decimalMatch[2]}`;
            }
            const hmMatch = raw.match(/^(\d{1,2}):(\d{2})$/);
            if (hmMatch) {
                const decimal = parseInt(hmMatch[1]) + parseInt(hmMatch[2]) / 60;
                return decimal.toFixed(2);
            }
            const hoursMatch = raw.match(/(\d+)\s*س/);
            const minsMatch = raw.match(/(\d+)\s*د/);
            if (hoursMatch || minsMatch) {
                const h = hoursMatch ? parseInt(hoursMatch[1]) : 0;
                const m = minsMatch ? parseInt(minsMatch[1]) : 0;
                return (h + m / 60).toFixed(2);
            }
            if (/\d*\s*ث/.test(raw)) return '0.00';
            if (/^\d+$/.test(raw)) return parseFloat(raw).toFixed(2);
        }
        if (day.connectionMinutes != null) {
            return (day.connectionMinutes / 60).toFixed(2);
        }
        return '0.00';
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const match = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (match) {
            return `${parseInt(match[2])}/${parseInt(match[3])}/${match[1]}`;
        }
        return String(dateStr);
    };

    const getStatus = (day) => {
        if (day.isInShift === true) return 'Yes';
        if (day.isInShift === false) return 'No';
        return '-';
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Unified Header Section */}
                <View style={styles.headerSection}>
                    {/* Title Box */}
                    <View style={styles.titleContainer}>
                        <Text style={styles.titleText}>تقرير الحضور والإنصراف</Text>
                    </View>

                    {/* Info Section */}
                    <View style={styles.infoSection}>
                        {/* Right Half: Name (centered) */}
                        <View style={styles.infoCellRight}>
                            <Text style={styles.infoNameText}>الإسم : {name}</Text>
                        </View>
                        {/* Left Half: Iqama & ID (split with divider) */}
                        <View style={styles.infoCellLeft}>
                            <View style={styles.infoSubRowTop}>
                                <Text style={styles.infoLabel}>: رقم الإقامة </Text>
                                <Text style={styles.infoValue}>{iqama}</Text>
                            </View>
                            <View style={styles.infoSubRowBottom}>
                                <Text style={styles.infoLabel}>: رقم المعرف </Text>
                                <Text style={styles.infoValue}>{workingId}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Data Table Header */}
                <View style={styles.tableHeader}>
                    <View style={styles.colDate}><Text style={styles.headerText}>التاريخ</Text></View>
                    <View style={styles.colDriverId}><Text style={styles.headerText}>معرف السائق</Text></View>
                    <View style={styles.colShift}><Text style={styles.headerText}>فترة الوردية</Text></View>
                    <View style={styles.colLocation}><Text style={styles.headerText}>مكان العمل</Text></View>
                    <View style={styles.colStatus}><Text style={styles.headerText}>حالة العمل</Text></View>
                    <View style={styles.colHours}><Text style={styles.headerText}>ساعات العمل</Text></View>
                    <View style={styles.colOrders}><Text style={styles.headerText}>عدد الطلبات</Text></View>
                </View>

                {/* Data Table Rows */}
                {days.map((day, idx) => {
                    const rowStyle = idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt;
                    return (
                        <View key={idx} style={rowStyle} wrap={false}>
                            <View style={styles.colDate}><Text style={styles.cellText}>{formatDate(day.reportDate)}</Text></View>
                            <View style={styles.colDriverId}><Text style={styles.cellText}>{workingId}</Text></View>
                            <View style={styles.colShift}><Text style={styles.cellText}>{buildShiftString(day)}</Text></View>
                            <View style={styles.colLocation}><Text style={styles.cellText}>{workLocation}</Text></View>
                            <View style={styles.colStatus}><Text style={styles.cellText}>{getStatus(day)}</Text></View>
                            <View style={styles.colHours}><Text style={styles.cellText}>{formatHours(day)}</Text></View>
                            <View style={styles.colOrders}><Text style={styles.cellText}>{day.tasksDelivered ?? 0}</Text></View>
                        </View>
                    );
                })}

                {/* Footer Stamp & Timestamp */}
                <View style={styles.footerContainer} fixed={false}>
                    <View style={styles.footerContent}>
                        <Image src="/Companyimage.png" style={styles.footerStamp} />
                        <Text style={styles.footerTimestamp}>{generatedAt}</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
}

// Exported component
export default function KeetaShiftReportPDF({ rider, workLocation, generatedAt, onClose }) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient || !rider) return null;

    const filename = `shift_report_${rider?.workingId || 'rider'}_${new Date().toISOString().slice(0, 10)}.pdf`;

    return (
        <div style={{ display: 'inline-block' }}>
            <PDFDownloadLink
                document={<KeetaShiftDocument rider={rider} workLocation={workLocation} generatedAt={generatedAt} />}
                fileName={filename}
                style={{ textDecoration: 'none' }}
            >
                {({ loading }) => (
                    <button
                        style={{
                            padding: '10px 20px',
                            fontSize: '14px',
                            fontFamily: "'Cairo', sans-serif",
                            cursor: 'pointer',
                            background: '#007bff',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                        }}
                        disabled={loading}
                    >
                        {loading ? 'جاري التحضير...' : '⬇ تحميل PDF'}
                    </button>
                )}
            </PDFDownloadLink>
        </div>
    );
}