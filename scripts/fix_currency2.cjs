const fs = require('fs');

function cleanFile(file) {
    let content = fs.readFileSync(file, 'utf8');

    // Remove .toLocaleString(...) from inside currency()
    // e.g. currency(currentMonth.sales.toLocaleString('en-IN'))
    // It could be .toLocaleString('en-IN', { maximumFractionDigits: 0 })
    // Regex: currency\(([^)]+)\.toLocaleString\([^)]+\)\)
    content = content.replace(/currency\((.*?)\.toLocaleString\([^\)]*\)\)/g, 'currency($1)');

    // In Customers.jsx, there's `currency(Math.abs(balance).toLocaleString('en-IN', ...))`
    // This string has `currency(Math.abs(balance).toLocaleString('en-IN', ...))` which is correctly matched above.

    // Also remove any remaining ₹ literals, like inside `<td style="...">₹{...}</td>`
    content = content.replace(/>₹/g, '>');

    // Re-check <Tooltip formatter={v => `₹${v.toLocaleString('en-IN')}`} />
    // It might be <Tooltip formatter={v => currency(v.toLocaleString('en-IN'))} />
    content = content.replace(/currency\(v\.toLocaleString\([^\)]*\)\)/g, 'currency(v)');

    // Replace tickFormatter={v => currency((v / 1000).toFixed(0))}
    // Oh wait, `₹${(v / 1000).toFixed(0)}k` became `currency((v / 1000).toFixed(0))` + `k`?
    // Let's manually fix that specific one if it's there.

    fs.writeFileSync(file, content);
}
['src/pages/Reports.jsx', 'src/pages/Inventory.jsx', 'src/pages/Customers.jsx'].forEach(cleanFile);
