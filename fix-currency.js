const fs = require('fs');

function fixFile(file) {
    let content = fs.readFileSync(file, 'utf8');

    // Add currency to useApp destructuring if not exists
    if (!content.includes('currency') && content.includes('useApp()')) {
        content = content.replace(/const \{([^}]+)\} = useApp\(\);/, (match, group1) => {
            return `const {${group1}, currency} = useApp();`;
        });
    }

    // Replace static text ₹ with currency symbol wait we only have `currency` function. 
    // Sometimes it's inside template literals like `₹${...}`
    // Replace `₹${val.toLocaleString('en-IN')}` with `${currency(val)}`
    content = content.replace(/`₹\$\{([^.}]+)\.toLocaleString\('en-IN'(, \{[^}]+\})?\)\}`/g, 'currency($1)');
    content = content.replace(/`₹\$\{\(([^\)]+)\)\.toLocaleString\('en-IN'(, \{[^}]+\})?\)\}`/g, 'currency($1)');

    // Replace ₹{val} with {currency(val)}
    content = content.replace(/>₹\{([^}]+)\}</g, '>{currency($1)}<');

    // In Dashboard or others maybe `₹${`
    content = content.replace(/`₹\$\{([^}]+)\}`/g, 'currency($1)');

    // Inside single quotes like '₹8,010'
    content = content.replace(/'₹([0-9,]+)'/g, (match, numb) => {
        let n = parseInt(numb.replace(/,/g, ''));
        return `currency(${n})`;
    });

    content = content.replace(/>₹([0-9,]+)</g, (match, numb) => {
        let n = parseInt(numb.replace(/,/g, ''));
        return `>{currency(${n})}<`;
    });

    fs.writeFileSync(file, content);
}

['src/pages/Reports.jsx', 'src/pages/Inventory.jsx', 'src/pages/Customers.jsx'].forEach(fixFile);

