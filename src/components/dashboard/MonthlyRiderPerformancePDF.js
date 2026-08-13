import React from "react";
import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

Font.register({
  family: "Cairo",
  src: "/fonts/7.ttf",
});

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTHS_PER_PAGE = 6;
const RIDERS_PER_PAGE = 10;

const styles = StyleSheet.create({
  page: {
    paddingTop: 24,
    paddingHorizontal: 22,
    paddingBottom: 38,
    fontFamily: "Cairo",
    fontSize: 8,
    color: "#172033",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1d4ed8",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  logo: { width: 34, height: 34, marginLeft: 8 },
  company: { color: "#dbeafe", fontSize: 7, textAlign: "right" },
  title: { color: "#ffffff", fontSize: 13, fontWeight: "bold", textAlign: "right" },
  period: { color: "#dbeafe", fontSize: 8, marginTop: 2, textAlign: "right" },
  summary: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#dbe3ee",
    borderRadius: 4,
    paddingVertical: 7,
    paddingHorizontal: 9,
    marginBottom: 10,
  },
  summaryItem: { width: "24%", alignItems: "flex-end" },
  summaryLabel: { color: "#64748b", fontSize: 7, textAlign: "right" },
  summaryValue: { color: "#0f172a", fontSize: 10, fontWeight: "bold", marginTop: 2, textAlign: "right" },
  tableHeader: {
    flexDirection: "row-reverse",
    backgroundColor: "#0f172a",
    color: "#ffffff",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  headerRider: { width: "29%", padding: 6, borderLeftWidth: 1, borderColor: "#334155" },
  headerMonth: { width: `${71 / MONTHS_PER_PAGE}%`, padding: 6, borderLeftWidth: 1, borderColor: "#334155", textAlign: "center" },
  headerText: { color: "#ffffff", fontSize: 7, fontWeight: "bold", textAlign: "center" },
  row: {
    flexDirection: "row-reverse",
    minHeight: 43,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#dbe3ee",
  },
  rowAlt: { backgroundColor: "#f8fafc" },
  riderCell: { width: "29%", padding: 5, borderLeftWidth: 1, borderColor: "#dbe3ee", justifyContent: "center" },
  riderName: { fontSize: 8, fontWeight: "bold", textAlign: "right" },
  riderEnglish: { fontSize: 6.5, color: "#64748b", textAlign: "right", marginTop: 1 },
  riderMeta: { fontSize: 6.5, color: "#475569", textAlign: "right", marginTop: 2 },
  monthCell: { width: `${71 / MONTHS_PER_PAGE}%`, paddingVertical: 5, paddingHorizontal: 2, borderLeftWidth: 1, borderColor: "#dbe3ee", justifyContent: "center" },
  metric: { fontSize: 6.5, textAlign: "center", marginVertical: 0.5 },
  accepted: { color: "#047857" },
  rejected: { color: "#dc2626" },
  target: { color: "#334155" },
  footer: {
    position: "absolute",
    bottom: 18,
    left: 22,
    right: 22,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderColor: "#dbe3ee",
    paddingTop: 5,
  },
  footerText: { fontSize: 6.5, color: "#64748b" },
});

const chunks = (items, size) => Array.from({ length: Math.ceil(items.length / size) || 1 }, (_, index) => items.slice(index * size, (index + 1) * size));
const formatNumber = (value) => Number(value || 0).toLocaleString("en-US");

function monthFor(rider, year, monthNumber) {
  return (rider.months || []).find((month) => Number(month.year) === Number(year) && Number(month.month) === monthNumber);
}

export default function MonthlyRiderPerformancePDF({ report, riders, months }) {
  const monthGroups = chunks(months, MONTHS_PER_PAGE);
  const riderPages = chunks(riders, RIDERS_PER_PAGE);
  const generatedAt = new Date().toLocaleString("en-US");
  const totalPages = monthGroups.length * riderPages.length;

  return (
    <Document>
      {monthGroups.flatMap((monthGroup, groupIndex) => riderPages.map((riderPage, riderPageIndex) => {
        const currentPage = groupIndex * riderPages.length + riderPageIndex + 1;
        return (
          <Page key={`months-${groupIndex}-riders-${riderPageIndex}`} size="A4" style={styles.page}>
            <View style={styles.header}>
              <View style={{ flexDirection: "row-reverse", alignItems: "center" }}>
                <Image src="/2.png" style={styles.logo} />
                <View>
                  <Text style={styles.title}>تقرير الأداء الشهري للمناديب</Text>
                  <Text style={styles.period}>الفترة: {MONTH_NAMES[Number(report.fromMonth) - 1]} إلى {MONTH_NAMES[Number(report.toMonth) - 1]} {report.year}</Text>
                </View>
              </View>
              <Text style={styles.company}>شركة الخدمة السريعة{`\n`}Express Service</Text>
            </View>

            {groupIndex === 0 && riderPageIndex === 0 && (
              <View style={styles.summary}>
                <View style={styles.summaryItem}><Text style={styles.summaryLabel}>عدد المناديب</Text><Text style={styles.summaryValue}>{formatNumber(riders.length)}</Text></View>
                <View style={styles.summaryItem}><Text style={styles.summaryLabel}>هدف Hunger الشهري</Text><Text style={styles.summaryValue}>{formatNumber(report.hungerMonthlyWorkingHoursTarget || 208)}</Text></View>
                <View style={styles.summaryItem}><Text style={styles.summaryLabel}>هدف Keeta الشهري</Text><Text style={styles.summaryValue}>{formatNumber(report.keetaMonthlyWorkingHoursTarget || 234)}</Text></View>
                <View style={styles.summaryItem}><Text style={styles.summaryLabel}>الأشهر في هذه الصفحة</Text><Text style={styles.summaryValue}>{monthGroup.length}</Text></View>
              </View>
            )}

            <View style={styles.tableHeader}>
              <View style={styles.headerRider}><Text style={styles.headerText}>المندوب</Text></View>
              {monthGroup.map((monthNumber) => <View key={monthNumber} style={styles.headerMonth}><Text style={styles.headerText}>{MONTH_NAMES[monthNumber - 1]}</Text></View>)}
              {Array.from({ length: MONTHS_PER_PAGE - monthGroup.length }, (_, index) => <View key={`empty-${index}`} style={styles.headerMonth}><Text style={styles.headerText}>-</Text></View>)}
            </View>

            {riderPage.map((rider, index) => (
              <View key={`${rider.riderId ?? "rider"}-${rider.workingId ?? "working"}-${index}`} style={[styles.row, index % 2 === 1 && styles.rowAlt]}>
                <View style={styles.riderCell}>
                  <Text style={styles.riderName}>{rider.riderNameAR || rider.riderNameEN || "-"}</Text>
                  {!!rider.riderNameEN && <Text style={styles.riderEnglish}>{rider.riderNameEN}</Text>}
                  <Text style={styles.riderMeta}>{rider.companyName || "-"} | #{rider.workingId || "-"}</Text>
                  <Text style={styles.riderMeta}>Iqama: {rider.iqamaNo || "-"}</Text>
                </View>
                {monthGroup.map((monthNumber) => {
                  const month = monthFor(rider, report.year, monthNumber);
                  return <View key={monthNumber} style={styles.monthCell}>
                    <Text style={[styles.metric, styles.accepted]}>م: {formatNumber(month?.totalAcceptedOrders)}</Text>
                    <Text style={[styles.metric, styles.rejected]}>ر: {formatNumber(month?.totalRealRejectedOrders)}</Text>
                    <Text style={[styles.metric, styles.target]}>س: {formatNumber(month?.workingHoursTarget)}</Text>
                  </View>;
                })}
                {Array.from({ length: MONTHS_PER_PAGE - monthGroup.length }, (_, index) => <View key={`empty-cell-${index}`} style={styles.monthCell}><Text style={styles.metric}>-</Text></View>)}
              </View>
            ))}

            <View style={styles.footer} fixed>
              <Text style={styles.footerText}>م: مقبولة | ر: رفض حقيقي | س: هدف الساعات</Text>
              <Text style={styles.footerText}>تم الإنشاء: {generatedAt} | صفحة {currentPage} من {totalPages}</Text>
            </View>
          </Page>
        );
      }))}
    </Document>
  );
}
