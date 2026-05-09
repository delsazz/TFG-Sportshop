/* csv.js - Converted from csv.ts */

function escapeCsvValue(value) {
    if (value === null || value === undefined) {
        return '';
    }
    const normalized = String(value).replace(/\r?\n/g, ' ');
    return `"${normalized.replace(/"/g, '""')}"`;
}

function formatTimestamp(date) {
    const pad = (value) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
}

export function downloadCsv(options) {
    const { filenamePrefix, rows, columns } = options;
    const lines = [
        columns.map((column) => escapeCsvValue(column.header)).join(';'),
        ...rows.map((row) => columns.map((column) => escapeCsvValue(column.value(row))).join(';')),
    ];

    const csv = `\uFEFF${lines.join('\r\n')}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `${filenamePrefix}_${formatTimestamp(new Date())}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
