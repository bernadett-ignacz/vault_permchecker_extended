function clearAndHideTables() {
    // Get all table elements
    const tables = document.querySelectorAll('table');
    
    // Loop through each table and clear its rows (except for the header)
    tables.forEach(table => {
        const tbody = table.querySelector('tbody');
        if (tbody) {
            tbody.innerHTML = ''; // Remove all rows in the tbody
        }
    });

const exceptions = ["userTable", "userCompareTable", "objectTable", "objectCompareTable", "fieldsTable", "fieldsCompareTable", "allConfigTable", "domainTableAll", "operationsTableAll", "securityTableAll", "settingsTableAll", "vaultActionsTableAll", "tabCollections", "tabs", "pages", "mobileTabs", "compareAllConfigTable", "compareDomainTableAll", "compareOperationsTableAll", "compareSecurityTableAll", "compareSettingsTableAll", "compareVaultActionsTableAll", "compareTabCollections", "compareTabs", "comparePages", "compareMobileTabs"];  // List of table IDs to skip

document.querySelectorAll("table").forEach(table => {
// Skip tables with IDs in the exceptions list
if (exceptions.includes(table.id)) {
    return;  // Skip this table and move to the next
}

const rows = table.querySelectorAll("tbody tr");

// Check if the table is empty or all rows have only empty cells
const isTableEmpty = Array.from(rows).every(row => {
    return Array.from(row.querySelectorAll("td")).every(cell => cell.textContent.trim() === "");
});

if (isTableEmpty || rows.length === 0) {
    table.classList.add('table-hidden');  // Hide empty table
}
});
} 