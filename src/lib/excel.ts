import ExcelJS from 'exceljs';
import { Project, User } from '@/types';
import { formatJalaliNumeric, getDaysRemaining } from './date-utils';

interface GenerateExcelOptions {
  projects: Project[];
  developer?: User | null;
  generatedBy?: string;
}

export async function generateProjectsExcelReport({
  projects,
  developer,
  generatedBy = 'مدیر سیستم',
}: GenerateExcelOptions): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'سامانه گزارش‌دهی پروژه‌ها';
  workbook.lastModifiedBy = generatedBy;
  workbook.created = new Date();
  workbook.modified = new Date();

  const isFiltered = !!developer;
  const sheetTitle = isFiltered ? `پروژه‌های ${developer.name}` : 'گزارش جامع کلیه پروژه‌ها';
  const worksheet = workbook.addWorksheet(isFiltered ? 'پروژه‌های کاربر' : 'گزارش جامع', {
    views: [{ rightToLeft: true }], // RTL Persian layout
    properties: { tabColor: { argb: 'FF06B6D4' } },
  });

  // Calculate metrics
  const total = projects.length;
  const planned = projects.filter((p) => p.status === 'PLANNED').length;
  const completed = projects.filter((p) => p.status === 'COMPLETED').length;
  const inProgress = projects.filter((p) => p.status === 'IN_PROGRESS').length;
  const avgProgress = total > 0 ? Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / total) : 0;

  // 1. Title Banner
  worksheet.mergeCells('A1:J2');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = `📊 ${sheetTitle} - سامانه مدیریت و رصد پروژه‌ها`;
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  titleCell.font = { name: 'Tahoma', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0B1329' }, // Navy blue brand color
  };

  // 2. Metadata row
  worksheet.mergeCells('A3:D3');
  const metaLeft = worksheet.getCell('A3');
  metaLeft.value = `تاریخ گزارش: ${formatJalaliNumeric(new Date().toISOString())} | ایجاد کننده: ${generatedBy}`;
  metaLeft.font = { name: 'Tahoma', size: 10, italic: true, color: { argb: 'FF475569' } };
  metaLeft.alignment = { vertical: 'middle', horizontal: 'right' };

  worksheet.mergeCells('E3:J3');
  const metaRight = worksheet.getCell('E3');
  metaRight.value = isFiltered
    ? `توسعه‌دهنده: ${developer?.name} (${developer?.department || 'توسعه نرم‌افزار'}) | شناسه سازمانی: ${developer?.ssoId || '-'}`
    : `دامنه: کلیه پروژه‌های سازمان`;
  metaRight.font = { name: 'Tahoma', size: 10, bold: true, color: { argb: 'FF0284C7' } };
  metaRight.alignment = { vertical: 'middle', horizontal: 'left' };

  // 3. KPI Statistics Cards in Excel
  worksheet.addRow([]);
  worksheet.mergeCells('A5:B5');
  worksheet.mergeCells('C5:D5');
  worksheet.mergeCells('E5:F5');
  worksheet.mergeCells('G5:H5');
  worksheet.mergeCells('I5:J5');

  const kpis = [
    { cell: 'A5', label: 'کل پروژه‌ها', value: total, bg: 'FFF1F5F9', fg: 'FF0F172A' },
    { cell: 'C5', label: 'پروژه‌های آینده', value: planned, bg: 'FFEEF2FF', fg: 'FF4F46E5' },
    { cell: 'E5', label: 'در حال انجام', value: inProgress, bg: 'FFE0F2FE', fg: 'FF0369A1' },
    { cell: 'G5', label: 'تکمیل شده', value: completed, bg: 'FFDCFCE7', fg: 'FF15803D' },
    { cell: 'I5', label: 'میانگین پیشرفت', value: `${avgProgress}%`, bg: 'FFFCE7F3', fg: 'FFBE185D' },
  ];

  kpis.forEach(({ cell, label, value, bg, fg }) => {
    const c = worksheet.getCell(cell);
    c.value = `${label}: ${value}`;
    c.alignment = { vertical: 'middle', horizontal: 'center' };
    c.font = { name: 'Tahoma', size: 11, bold: true, color: { argb: fg } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    c.border = {
      top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    };
  });

  worksheet.addRow([]); // Blank line

  // 4. Table Headers
  const headerRowNumber = 7;
  const headers = [
    { header: 'ردیف', key: 'rowNum', width: 8 },
    { header: 'توسعه‌دهنده', key: 'developer', width: 22 },
    { header: 'دپارتمان', key: 'department', width: 20 },
    { header: 'عنوان پروژه', key: 'title', width: 35 },
    { header: 'توضیحات و اهداف', key: 'description', width: 45 },
    { header: 'وضعیت', key: 'status', width: 16 },
    { header: 'درصد پیشرفت', key: 'progress', width: 15 },
    { header: 'تاریخ شروع', key: 'startDate', width: 16 },
    { header: 'پیش‌بینی اتمام', key: 'endDate', width: 16 },
    { header: 'وضعیت مهلت زمانی', key: 'deadline', width: 18 },
  ];

  const tableHeaderRow = worksheet.getRow(headerRowNumber);
  headers.forEach((h, index) => {
    const cell = tableHeaderRow.getCell(index + 1);
    cell.value = h.header;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.font = { name: 'Tahoma', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' }, // Slate dark
    };
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF0EA5E9' } },
      bottom: { style: 'medium', color: { argb: 'FF0EA5E9' } },
      left: { style: 'thin', color: { argb: 'FF475569' } },
      right: { style: 'thin', color: { argb: 'FF475569' } },
    };
    worksheet.getColumn(index + 1).width = h.width;
  });
  tableHeaderRow.height = 28;

  // 5. Data Rows
  projects.forEach((proj, idx) => {
    const rowIdx = headerRowNumber + 1 + idx;
    const row = worksheet.getRow(rowIdx);
    const deadlineInfo = getDaysRemaining(proj.endDate);
    const isCompleted = proj.status === 'COMPLETED';
    const isPlanned = proj.status === 'PLANNED';
    const isOverdue = deadlineInfo.isOverdue && !isCompleted && !isPlanned;
    const statusText = isCompleted
      ? 'تکمیل شده'
      : isPlanned
      ? 'پروژه‌های آینده (برنامه‌ریزی‌شده)'
      : 'در حال انجام';

    let deadlineText = '';
    if (isCompleted) {
      deadlineText = 'پایان یافته';
    } else if (isPlanned) {
      deadlineText = 'شروع در آینده';
    } else if (isOverdue) {
      deadlineText = `⚠️ تاخیر (${deadlineInfo.days} روز)`;
    } else {
      deadlineText = `${deadlineInfo.days} روز باقیمانده`;
    }

    const devNames = proj.users && proj.users.length > 0 ? proj.users.map((u) => u.name).join('، ') : 'تیم توسعه';
    const devDept = proj.users?.[0]?.department || 'تیم توسعه نرم‌افزار پالایشگاه';

    row.values = [
      idx + 1,
      devNames,
      devDept,
      proj.title,
      proj.description || '-',
      statusText,
      `${proj.progress}%`,
      formatJalaliNumeric(proj.startDate),
      formatJalaliNumeric(proj.endDate),
      deadlineText,
    ];

    row.height = 24;

    // Apply fonts and zebra striping
    const isEven = idx % 2 === 0;
    const rowBgColor = isEven ? 'FFFFFFFF' : 'FFF8FAFC';

    for (let c = 1; c <= 10; c++) {
      const cell = row.getCell(c);
      cell.font = { name: 'Tahoma', size: 10 };
      cell.alignment = {
        vertical: 'middle',
        horizontal: c === 4 || c === 5 ? 'right' : 'center',
        wrapText: c === 4 || c === 5,
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: rowBgColor },
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };

      // Status pill coloring
      if (c === 6) {
        if (proj.status === 'COMPLETED') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
          cell.font = { name: 'Tahoma', size: 10, bold: true, color: { argb: 'FF15803D' } };
        } else if (proj.status === 'PLANNED') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEF2FF' } };
          cell.font = { name: 'Tahoma', size: 10, bold: true, color: { argb: 'FF4F46E5' } };
        } else {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2FE' } };
          cell.font = { name: 'Tahoma', size: 10, bold: true, color: { argb: 'FF0284C7' } };
        }
      }

      // Progress percentage coloring
      if (c === 7) {
        cell.font = { name: 'Tahoma', size: 10, bold: true };
        if (proj.progress === 100) {
          cell.font.color = { argb: 'FF15803D' };
        } else if (proj.progress >= 70) {
          cell.font.color = { argb: 'FF0284C7' };
        } else {
          cell.font.color = { argb: 'FFD97706' };
        }
      }

      // Deadline coloring
      if (c === 10 && isOverdue) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
        cell.font = { name: 'Tahoma', size: 10, bold: true, color: { argb: 'FFDC2626' } };
      }
    }
  });

  // Footer summary row
  const summaryRowIdx = headerRowNumber + 1 + projects.length;
  const summaryRow = worksheet.getRow(summaryRowIdx);
  worksheet.mergeCells(`A${summaryRowIdx}:E${summaryRowIdx}`);
  const sumLabel = summaryRow.getCell(1);
  sumLabel.value = `جمع کل: ${total} پروژه | میانگین کل پیشرفت: ${avgProgress}%`;
  sumLabel.font = { name: 'Tahoma', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
  sumLabel.alignment = { vertical: 'middle', horizontal: 'center' };
  sumLabel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };

  for (let c = 6; c <= 10; c++) {
    const cell = summaryRow.getCell(c);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
  }
  summaryRow.height = 26;

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
