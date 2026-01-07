export interface ParsedBudgetRule {
  name: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  frequency: 'weekly' | 'bi-weekly' | 'monthly' | 'yearly';
  recurrence_day: number | null;
  start_date: string;
  end_date: string | null;
}

export interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
}

export interface ImportResult {
  rules: ParsedBudgetRule[];
  transactions: ParsedTransaction[];
  errors: string[];
}

export function parseExcelData(file: File): Promise<ImportResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      const data = e.target?.result;
      if (!data) {
        resolve({ rules: [], transactions: [], errors: ['Failed to read file'] });
        return;
      }

      // Split by lines and parse CSV-like format
      // This handles both actual CSV and tab-delimited Excel exports
      const lines = (data as string).split('\n').filter(line => line.trim());
      
      const result: ImportResult = {
        rules: [],
        transactions: [],
        errors: [],
      };

      if (lines.length < 2) {
        result.errors.push('File appears to be empty');
        resolve(result);
        return;
      }

      // Detect delimiter
      const firstLine = lines[0];
      const hasCommas = (firstLine.match(/,/g) || []).length > (firstLine.match(/\t/g) || []).length;
      const delimiter = hasCommas ? ',' : '\t';

      // Parse header
      const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase());

      // Look for budget rules section
      let sectionStart = 1;
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(delimiter).map(v => v.trim());
        
        // Skip if not enough values
        if (values.length < 3) {
          if (values[0] && values[0].toLowerCase() === 'name') {
            sectionStart = i + 1;
          }
          continue;
        }

        // Map values to fields
        const record: Record<string, string> = {};
        headers.forEach((header, index) => {
          if (values[index]) {
            record[header] = values[index];
          }
        });

        // Check if this looks like a budget rule
        const nameIndex = headers.indexOf('name');
        const amountIndex = headers.indexOf('amount');
        const typeIndex = headers.indexOf('type');
        const frequencyIndex = headers.indexOf('frequency');

        if (nameIndex >= 0 && amountIndex >= 0 && typeIndex >= 0) {
          const rule: ParsedBudgetRule = {
            name: record['name'] || '',
            amount: parseFloat(record['amount'] || '0'),
            type: (record['type']?.toLowerCase() || 'expense') === 'income' ? 'income' : 'expense',
            category: record['category'] || 'other',
            frequency: parseFrequency(record['frequency']),
            recurrence_day: parseRecurrenceDay(record['recurrence_day'], record['frequency']),
            start_date: parseDate(record['start_date']) || new Date().toISOString().split('T')[0],
            end_date: record['end_date'] ? parseDate(record['end_date']) : null,
          };

          // Validate
          if (rule.name && rule.amount > 0) {
            result.rules.push(rule);
          } else {
            result.errors.push(`Invalid rule on line ${i + 1}: ${line}`);
          }
        }

        // Check if this looks like a transaction
        const dateIndex = headers.indexOf('date');
        const descIndex = headers.indexOf('description');

        if (dateIndex >= 0 && amountIndex >= 0) {
          const transaction: ParsedTransaction = {
            date: parseDate(record['date']) || new Date().toISOString().split('T')[0],
            description: record['description'] || '',
            amount: parseFloat(record['amount'] || '0'),
            type: (record['type']?.toLowerCase() || 'expense') === 'income' ? 'income' : 'expense',
          };

          if (transaction.amount > 0) {
            result.transactions.push(transaction);
          } else {
            result.errors.push(`Invalid transaction on line ${i + 1}: ${line}`);
          }
        }
      }

      resolve(result);
    };

    reader.onerror = () => {
      resolve({ rules: [], transactions: [], errors: ['Failed to read file'] });
    };

    reader.readAsText(file);
  });
}

function parseFrequency(freq: string | undefined): 'weekly' | 'bi-weekly' | 'monthly' | 'yearly' {
  const lower = (freq || '').toLowerCase().trim();
  if (lower.includes('week')) {
    return lower.includes('bi') ? 'bi-weekly' : 'weekly';
  }
  if (lower.includes('month')) return 'monthly';
  if (lower.includes('year')) return 'yearly';
  return 'monthly'; // Default
}

function parseRecurrenceDay(dayStr: string | undefined, frequency: string | undefined): number | null {
  if (!dayStr) return null;
  const day = parseInt(dayStr);
  if (isNaN(day) || day < 0 || day > 31) return null;
  return day;
}

function parseDate(dateStr: string | undefined): string {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  
  // Try common date formats
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }

  // Try Excel serial date (number)
  const serialDate = parseFloat(dateStr);
  if (!isNaN(serialDate) && serialDate > 0 && serialDate < 100000) {
    const excelDate = new Date((serialDate - 25569) * 24 * 60 * 60 * 1000);
    return excelDate.toISOString().split('T')[0];
  }

  return new Date().toISOString().split('T')[0];
}

export function validateImportResult(result: ImportResult): {
  valid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  
  // Check for duplicate rule names
  const ruleNames = result.rules.map(r => r.name.toLowerCase());
  const duplicates = ruleNames.filter((name, index) => ruleNames.indexOf(name) !== index);
  if (duplicates.length > 0) {
    warnings.push(`Duplicate rule names: ${Array.from(new Set(duplicates)).join(', ')}`);
  }

  // Check for future dates
  const now = new Date();
  result.rules.forEach(rule => {
    if (rule.end_date) {
      const endDate = new Date(rule.end_date);
      if (endDate < now) {
        warnings.push(`Rule "${rule.name}" has already ended`);
      }
    }
  });

  // Check for reasonable amounts
  result.rules.forEach(rule => {
    if (rule.amount > 1000000) {
      warnings.push(`Suspiciously large amount for "${rule.name}": $${rule.amount.toLocaleString()}`);
    }
  });

  return {
    valid: warnings.length === 0 || (result.rules.length > 0 || result.transactions.length > 0),
    warnings,
  };
}
