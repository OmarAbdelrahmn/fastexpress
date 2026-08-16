import React from 'react';
import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';

Font.register({
  family: 'IBMPlexArabic',
  fonts: [
    { src: '/fonts/7.ttf', fontWeight: 400 },
    { src: '/fonts/8.ttf', fontWeight: 600 },
  ],
});

const EXPRESS_SERVICE_LEGAL_NAME = 'شركة الخدمة السريعة للخدمات اللوجستية';
const PAGE_WIDTH = 841.89;
const TABLE_WIDTH = 603;
const TOP_MARGIN = 10;
const PERIOD_IMAGE_SCALE = 4;
const periodImageCache = new Map();

const COLUMN_WIDTHS = {
  name: 247,
  gross: 86,
  advance: 49,
  deduction: 50,
  allowance: 71,
  net: 100,
};

const ARABIC_MONTHS = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

const styles = StyleSheet.create({
  page: {
    position: 'relative',
    backgroundColor: '#ffffff',
    color: '#050505',
    fontFamily: 'IBMPlexArabic',
    fontSize: 12,
  },
  sourcePage: {
    position: 'absolute',
    top: TOP_MARGIN,
    left: 0,
    width: '100%',
    height: '100%',
  },
  brandedBodyMask: {
    position: 'absolute',
    top: 78 + TOP_MARGIN,
    left: 0,
    width: '100%',
    height: 462,
    backgroundColor: '#ffffff',
  },
  watermark: {
    position: 'absolute',
    top: 104 + TOP_MARGIN,
    left: 211,
    width: 420,
    height: 420,
    objectFit: 'contain',
    opacity: 0.085,
  },
  plainCompanyName: {
    position: 'absolute',
    top: 24 + TOP_MARGIN,
    left: 56,
    width: PAGE_WIDTH - 112,
    color: '#111827',
    fontSize: 19,
    fontWeight: 600,
    lineHeight: 1.4,
    textAlign: 'center',
  },
  plainCompanyRule: {
    position: 'absolute',
    top: 65 + TOP_MARGIN,
    left: 118,
    width: TABLE_WIDTH,
    height: 1,
    backgroundColor: '#111827',
  },
  documentTitle: {
    position: 'absolute',
    left: 0,
    width: '100%',
    fontSize: 18,
    fontWeight: 600,
    textAlign: 'center',
  },
  titleRule: {
    position: 'absolute',
    left: (PAGE_WIDTH - 156) / 2,
    width: 156,
    height: 2,
    backgroundColor: '#090909',
  },
  periodText: {
    position: 'absolute',
    left: 42,
    width: PAGE_WIDTH - 84,
    fontSize: 12.5,
    fontWeight: 400,
    lineHeight: 1.55,
    textAlign: 'center',
    direction: 'rtl',
  },
  periodImage: {
    position: 'absolute',
    left: 42,
    width: PAGE_WIDTH - 84,
    height: 27,
    objectFit: 'contain',
  },
  table: {
    position: 'absolute',
    left: (PAGE_WIDTH - TABLE_WIDTH) / 2,
    width: TABLE_WIDTH,
    borderWidth: 0.75,
    borderColor: '#000000',
  },
  row: {
    flexDirection: 'row-reverse',
  },
  rowDivider: {
    borderBottomWidth: 0.75,
    borderBottomColor: '#000000',
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    textAlign: 'center',
  },
  cellDivider: {
    borderLeftWidth: 0.75,
    borderLeftColor: '#000000',
  },
  headerCell: {
    height: 38,
  },
  headerText: {
    fontSize: 12.5,
    fontWeight: 600,
    lineHeight: 1.4,
    textAlign: 'center',
  },
  deductionGroup: {
    width: COLUMN_WIDTHS.advance + COLUMN_WIDTHS.deduction,
    height: 38,
    borderLeftWidth: 0.75,
    borderLeftColor: '#000000',
  },
  deductionHeading: {
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 0.75,
    borderBottomColor: '#000000',
  },
  deductionSubRow: {
    flexDirection: 'row-reverse',
    height: 19.25,
  },
  deductionSubCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueRow: {
    height: 42,
  },
  valueText: {
    fontSize: 12,
    fontWeight: 600,
    textAlign: 'center',
  },
  riderNameText: {
    fontSize: 11.5,
    fontWeight: 600,
    textAlign: 'center',
  },
  totalRow: {
    height: 42,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 600,
    textAlign: 'center',
  },
  declaration: {
    position: 'absolute',
    left: 30,
    width: PAGE_WIDTH - 60,
    fontSize: 12.5,
    fontWeight: 400,
    lineHeight: 1.7,
    textAlign: 'right',
    direction: 'rtl',
  },
  signatureBlock: {
    position: 'absolute',
    left: 155,
    width: 205,
    alignItems: 'flex-end',
    direction: 'rtl',
  },
  signatureHeading: {
    alignSelf: 'center',
    marginBottom: 8,
    fontSize: 13,
    fontWeight: 600,
  },
  signatureLine: {
    width: '100%',
    marginBottom: 11,
    fontSize: 12.5,
    lineHeight: 1.6,
    textAlign: 'right',
  },
});

function getValue(source, camelName, pascalName) {
  return source?.[camelName] ?? source?.[pascalName];
}

function isCompanyRider(rider) {
  const value = getValue(rider, 'onCompany', 'OnCompany');
  return value === true || value === 'true' || value === 1;
}

function parseDate(value) {
  if (!value) return null;
  const [year, month, day] = String(value).split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function formatSalary(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '-';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
}

function formatDateForRtl(value) {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : value || '-';
}

function getPeriodLabel(startDate, endDate) {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  const startLabel = formatDateForRtl(startDate);
  const endLabel = formatDateForRtl(endDate);
  if (!start || !end) return `عن الفترة من ${startLabel} حتى ${endLabel}`;

  const isSameMonth =
    start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth();

  if (!isSameMonth) return `عن الفترة من ${startLabel} حتى ${endLabel}`;

  return `عن شهر ${ARABIC_MONTHS[start.getMonth()]} ${start.getFullYear()} - عن الفترة من ${startLabel} حتى ${endLabel}`;
}

function createPeriodImage(text) {
  if (periodImageCache.has(text)) return periodImageCache.get(text);
  if (typeof globalThis.document === 'undefined') return null;

  const width = Math.round((PAGE_WIDTH - 84) * PERIOD_IMAGE_SCALE);
  const height = 27 * PERIOD_IMAGE_SCALE;
  const canvas = globalThis.document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) return null;

  canvas.width = width;
  canvas.height = height;
  context.direction = 'rtl';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = '#050505';

  const availableWidth = width - 12 * PERIOD_IMAGE_SCALE;
  let fontSize = 12.5 * PERIOD_IMAGE_SCALE;
  context.font = `${fontSize}px Arial, "Noto Sans Arabic", sans-serif`;

  const measuredWidth = context.measureText(text).width;
  if (measuredWidth > availableWidth) {
    fontSize *= availableWidth / measuredWidth;
    context.font = `${fontSize}px Arial, "Noto Sans Arabic", sans-serif`;
  }

  context.fillText(text, width / 2, height * 0.52);
  const image = canvas.toDataURL('image/png');
  periodImageCache.set(text, image);
  return image;
}

function SalaryTable({ riderName, salary, top }) {
  const netSalary = formatSalary(salary);

  return (
    <View style={[styles.table, { top }]}>
      <View style={[styles.row, styles.rowDivider]}>
        <View
          style={[
            styles.cell,
            styles.headerCell,
            styles.cellDivider,
            { width: COLUMN_WIDTHS.name },
          ]}
        >
          <Text style={styles.headerText}>الاسم</Text>
        </View>
        <View
          style={[
            styles.cell,
            styles.headerCell,
            styles.cellDivider,
            { width: COLUMN_WIDTHS.gross },
          ]}
        >
          <Text style={styles.headerText}>إجمالي الراتب</Text>
        </View>
        <View style={styles.deductionGroup}>
          <View style={styles.deductionHeading}>
            <Text style={styles.headerText}>الاستقطاعات</Text>
          </View>
          <View style={styles.deductionSubRow}>
            <View
              style={[
                styles.deductionSubCell,
                styles.cellDivider,
                { width: COLUMN_WIDTHS.advance },
              ]}
            >
              <Text style={styles.headerText}>سلف</Text>
            </View>
            <View style={[styles.deductionSubCell, { width: COLUMN_WIDTHS.deduction }]}>
              <Text style={styles.headerText}>خصم</Text>
            </View>
          </View>
        </View>
        <View
          style={[
            styles.cell,
            styles.headerCell,
            styles.cellDivider,
            { width: COLUMN_WIDTHS.allowance },
          ]}
        >
          <Text style={styles.headerText}>بدلات ومكافآت</Text>
        </View>
        <View style={[styles.cell, styles.headerCell, { width: COLUMN_WIDTHS.net }]}>
          <Text style={styles.headerText}>صافي الراتب</Text>
        </View>
      </View>

      <View style={[styles.row, styles.rowDivider, styles.valueRow]}>
        <View style={[styles.cell, styles.cellDivider, { width: COLUMN_WIDTHS.name }]}>
          <Text style={styles.riderNameText}>{riderName}</Text>
        </View>
        <View style={[styles.cell, styles.cellDivider, { width: COLUMN_WIDTHS.gross }]}>
          <Text style={styles.valueText}>{netSalary}</Text>
        </View>
        <View style={[styles.cell, styles.cellDivider, { width: COLUMN_WIDTHS.advance }]}>
          <Text style={styles.valueText}>-</Text>
        </View>
        <View style={[styles.cell, styles.cellDivider, { width: COLUMN_WIDTHS.deduction }]}>
          <Text style={styles.valueText}>-</Text>
        </View>
        <View style={[styles.cell, styles.cellDivider, { width: COLUMN_WIDTHS.allowance }]}>
          <Text style={styles.valueText}>-</Text>
        </View>
        <View style={[styles.cell, { width: COLUMN_WIDTHS.net }]}>
          <Text style={styles.valueText}>{netSalary}</Text>
        </View>
      </View>

      <View style={[styles.row, styles.totalRow]}>
        <View
          style={[
            styles.cell,
            styles.cellDivider,
            {
              width:
                COLUMN_WIDTHS.name +
                COLUMN_WIDTHS.gross +
                COLUMN_WIDTHS.advance +
                COLUMN_WIDTHS.deduction +
                COLUMN_WIDTHS.allowance,
            },
          ]}
        >
          <Text style={styles.totalLabel}>الإجمالي</Text>
        </View>
        <View style={[styles.cell, { width: COLUMN_WIDTHS.net }]}>
          <Text style={styles.valueText}>{netSalary}</Text>
        </View>
      </View>
    </View>
  );
}

function StatementBody({ row, startDate, endDate, branded }) {
  const rider = getValue(row, 'rider', 'Rider') || {};
  const riderName =
    getValue(rider, 'nameAR', 'NameAR') || getValue(rider, 'nameEN', 'NameEN') || '-';
  const iqamaNo =
    getValue(row, 'iqamaNo', 'IqamaNo') ?? getValue(rider, 'iqamaNo', 'IqamaNo') ?? '-';
  const salary = getValue(row, 'salary', 'Salary');
  const sponsor = getValue(rider, 'sponsor', 'Sponsor');
  const companyName = branded ? EXPRESS_SERVICE_LEGAL_NAME : sponsor || 'جهة العمل';
  const periodLabel = getPeriodLabel(startDate, endDate);
  const periodText = `كشف رواتب ${companyName} ${periodLabel}`;
  const periodImage = createPeriodImage(periodText);
  const declarationText = `أقر أنا / ${riderName} - هوية مقيم رقم (${String(
    iqamaNo,
  )}) - بأنني استلمت من ${companyName} راتبي عن الفترة الموضحة أعلاه، وتوقيعي يُعد إقرارًا مني باستلام المبلغ المذكور.`;

  const positions = branded
    ? {
        title: 94 + TOP_MARGIN,
        titleRule: 124 + TOP_MARGIN,
        period: 130 + TOP_MARGIN,
        table: 162 + TOP_MARGIN,
        declaration: 304 + TOP_MARGIN,
        signature: 363 + TOP_MARGIN,
      }
    : {
        title: 78 + TOP_MARGIN,
        titleRule: 108 + TOP_MARGIN,
        period: 115 + TOP_MARGIN,
        table: 148 + TOP_MARGIN,
        declaration: 291 + TOP_MARGIN,
        signature: 351 + TOP_MARGIN,
      };

  return (
    <>
      {!branded && (
        <>
          <Text style={styles.plainCompanyName}>{companyName}</Text>
          <View style={styles.plainCompanyRule} />
        </>
      )}

      <Text style={[styles.documentTitle, { top: positions.title }]}>إقرار استلام راتب</Text>
      <View style={[styles.titleRule, { top: positions.titleRule }]} />
      {periodImage ? (
        <Image src={periodImage} style={[styles.periodImage, { top: positions.period }]} />
      ) : (
        <Text style={[styles.periodText, { top: positions.period }]}>{periodText}</Text>
      )}

      <SalaryTable riderName={riderName} salary={salary} top={positions.table} />

      <Text style={[styles.declaration, { top: positions.declaration }]}>{declarationText}</Text>

      <View style={[styles.signatureBlock, { top: positions.signature }]}>
        <Text style={styles.signatureHeading}>المستلم</Text>
        <Text style={styles.signatureLine}>الاسم: {riderName}</Text>
        <Text style={styles.signatureLine}>التوقيع:</Text>
      </View>
    </>
  );
}

function CompanySalaryPage({ row, startDate, endDate }) {
  return (
    <Page size="A4" orientation="landscape" style={styles.page}>
      <Image src="/templates/rider-salary-company-page.png" style={styles.sourcePage} fixed />
      <View style={styles.brandedBodyMask} fixed />
      <Image src="/2.png" style={styles.watermark} fixed />
      <StatementBody row={row} startDate={startDate} endDate={endDate} branded />
    </Page>
  );
}

function ExternalSalaryPage({ row, startDate, endDate }) {
  return (
    <Page size="A4" orientation="landscape" style={styles.page}>
      <StatementBody row={row} startDate={startDate} endDate={endDate} branded={false} />
    </Page>
  );
}

export default function RiderSalaryDocument({ row, rows, startDate, endDate }) {
  const statementRows = Array.isArray(rows) ? rows.filter(Boolean) : row ? [row] : [];
  const firstRider = getValue(statementRows[0], 'rider', 'Rider') || {};
  const isBulkDocument = statementRows.length > 1;

  return (
    <Document
      title={isBulkDocument ? 'Rider salary statements' : 'Rider salary statement'}
      author={
        isBulkDocument || isCompanyRider(firstRider)
          ? 'Express Service'
          : getValue(firstRider, 'sponsor', 'Sponsor') || 'Employer'
      }
      subject={`${startDate} - ${endDate}`}
    >
      {statementRows.map((statementRow, index) => {
        const rider = getValue(statementRow, 'rider', 'Rider') || {};
        const pageKey = `${getValue(statementRow, 'rowNumber', 'RowNumber') ?? index}-${
          getValue(statementRow, 'iqamaNo', 'IqamaNo') ?? index
        }`;

        return isCompanyRider(rider) ? (
          <CompanySalaryPage
            key={pageKey}
            row={statementRow}
            startDate={startDate}
            endDate={endDate}
          />
        ) : (
          <ExternalSalaryPage
            key={pageKey}
            row={statementRow}
            startDate={startDate}
            endDate={endDate}
          />
        );
      })}
    </Document>
  );
}
