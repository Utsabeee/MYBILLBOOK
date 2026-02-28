const fs = require('fs');

function fixFile(file) {
    let content = fs.readFileSync(file, 'utf8');

    // Make sure we have `currency` from useApp()
    if (!content.includes('currency') && content.includes('useApp();')) {
        content = content.replace(/const \{([^}]+)\} = useApp\(\);/, (match, group1) => {
            return `const {${group1}, currency } = useApp();`;
        });
    }

    // `₹${val.toLocaleString('en-IN')}` --> currency(val)
    content = content.replaceAll(/`₹\$\{([^.}]+)\.toLocaleString\('en-IN'(, \{[^}]+\})?\)\}`/g, 'currency($1)');
    content = content.replaceAll(/`₹\$\{\(([^\)]+)\)\.toLocaleString\('en-IN'(, \{[^}]+\})?\)\}`/g, 'currency($1)');

    // >₹{val.toLocaleString('en-IN')}< --> >{currency(val)}<
    content = content.replaceAll(/>₹\{([^.}]+)\.toLocaleString\('en-IN'(, \{[^}]+\})?\)\}</g, '>{currency($1)}<');
    content = content.replaceAll(/>₹\{\(([^\)]+)\)\.toLocaleString\('en-IN'(, \{[^}]+\})?\)\}</g, '>{currency($1)}<');

    // >₹{val}< --> >{currency(val)}<
    content = content.replaceAll(/>₹\{([^}]+)\}</g, '>{currency($1)}<');

    // `₹${val}` --> currency(val)
    content = content.replaceAll(/`₹\$\{([^}]+)\}`/g, 'currency($1)');

    // '₹8,010' --> currency(8010)
    content = content.replaceAll(/'₹([0-9,]+)'/g, (match, numb) => {
        let n = parseInt(numb.replace(/,/g, ''));
        return `currency(${n})`;
    });

    // >₹8010< --> >{currency(8010)}<
    content = content.replaceAll(/>₹([0-9,]+)</g, (match, numb) => {
        let n = parseInt(numb.replace(/,/g, ''));
        return `>{currency(${n})}<`;
    });

    // In Inventory.jsx, we have >Sale Price (₹)<
    content = content.replaceAll(/>Sale Price \(₹\)/g, '>Sale Price (currency)');
    content = content.replaceAll(/>Purchase Price \(₹\)/g, '>Purchase Price (currency)');

    // In Reports.jsx, we have <th>Sales (₹)</th>
    content = content.replaceAll(/<th>([a-zA-Z\s]+) \(₹\)<\/th>/g, '<th>$1</th>');

    // Fix other hardcoded strings containing ₹
    content = content.replaceAll(/₹/g, ''); // just remove lingering symbols

    fs.writeFileSync(file, content);
    console.log(`Fixed ${file}`);
}

['src/pages/Reports.jsx', 'src/pages/Inventory.jsx', 'src/pages/Customers.jsx'].forEach(fixFile);
