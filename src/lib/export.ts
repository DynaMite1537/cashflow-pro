export interface ExportData {
  rules: any[];
  transactions: any[];
  currentBalance: number;
  exportDate: string;
}

export async function exportToCSV(data: ExportData, filename: string): Promise<void> {
  // Create CSV content
  let csv = '';

  // Add metadata
  csv += '# CashFlow Pro Data Export\n';
  csv += `# Exported: ${data.exportDate}\n`;
  csv += `# Current Balance: $${data.currentBalance.toFixed(2)}\n\n`;

  // Budget Rules section
  csv += '# Budget Rules\n';
  csv += 'Name,Type,Category,Amount,Frequency,Recurrence Day,Start Date,End Date,Active\n';

  for (const rule of data.rules) {
    csv += [
      `"${rule.name}"`,
      rule.type,
      rule.category,
      rule.amount.toFixed(2),
      rule.frequency,
      rule.recurrence_day || '',
      rule.start_date ? new Date(rule.start_date).toLocaleDateString() : '',
      rule.end_date ? new Date(rule.end_date).toLocaleDateString() : '',
      rule.is_active,
    ].join(',') + '\n';
  }

  csv += '\n';

  // Transactions section
  csv += '# Transactions\n';
  csv += 'Date,Description,Amount,Type,Reconciled\n';

  for (const transaction of data.transactions) {
    csv += [
      transaction.date ? new Date(transaction.date).toLocaleDateString() : '',
      `"${transaction.description || ''}"`,
      transaction.amount.toFixed(2),
      transaction.type,
      transaction.is_reconciled,
    ].join(',') + '\n';
  }

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToJSON(data: ExportData, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
