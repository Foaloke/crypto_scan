export type CsvEntry = {
  label: string;
  value: string;
};

export function csvEscape(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export function buildCsv(entries: CsvEntry[]): string {
  const headers = entries.map((entry) => entry.label);
  const row = entries.map((entry) => entry.value);

  return `${headers.join(",")}\n${row.map(csvEscape).join(",")}\n`;
}
