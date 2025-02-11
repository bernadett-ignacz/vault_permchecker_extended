window.addEventListener('dataStored', function() {
    // Retrieve data from sessionStorage
    const permissionsData = JSON.parse(sessionStorage.getItem('permissionsData'));
    const userData = JSON.parse(sessionStorage.getItem('userData'));
    const combinedPermissions = JSON.parse(sessionStorage.getItem('combinedPermissions'));

    // Debugging: Log permissionsData to check its structure
    //console.log('permissionsData:', permissionsData);
    //console.log(combinedPermissions);


        //------------------------------FILL TABLES------------------------------

        if (permissionsData) {
            const { objectNames, fieldMap, objectMap } = permissionsData;
    
            // Check if objectNames is an array
            if (objectNames && Array.isArray(objectNames)) {
                // Populate Object Names Dropdown
                const objectNamesDropdown = document.getElementById("objectNames");
    
                // Clear previous options
                objectNamesDropdown.innerHTML = '';
    
                // Populate the dropdown with object names
                objectNames.forEach((name, index) => {
                    const option = document.createElement("option");
                    option.value = name;
                    option.textContent = name;
                    objectNamesDropdown.appendChild(option);
    
                    // Set the first object as the default selected value
                    if (index === 0) {
                        option.selected = true;
                        // Trigger change event to load the corresponding data
                        populateTablesForObject(name, objectMap, fieldMap);
                    }
                });
    
                // Event listener for when a user selects an object name
                objectNamesDropdown.addEventListener('change', () => {
                    const selectedObject = objectNamesDropdown.value;
    
                    // Clear previous table data
                    clearTableData();
    
                    if (selectedObject) {
                        // Populate Object Permissions table for selected object
                        populateObjectPermissionsTable(selectedObject, objectMap);
    
                        // Populate Field Permissions table for selected object
                        populateFieldPermissionsTable(selectedObject, fieldMap);
                    }
                });
            } else {
                console.error('Error: objectNames is not an array or is undefined.');
            }
    
            // Populate User Data table if userData exists
            if (userData) {
                const userTableBody = document.getElementById('userTable').getElementsByTagName('tbody')[0];
                userTableBody.innerHTML = "";
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${userData.fullName || 'N/A'}</td>
                    <td>${userData.username || 'N/A'}</td>
                    <td>${userData.email || 'N/A'}</td>
                    <td>${userData.securityProfile || 'N/A'}</td>
                `;
                userTableBody.appendChild(row);
            }
        } else {
            console.error('Error: permissionsData is missing or malformed.');
        }
    
        if (combinedPermissions) {
    
    //------------------------------POPULATING THE TABS AND PAGE TABLES------------------------------
    tabsAndPages(combinedPermissions);
    // Function to populate tables
    function tabsAndPages(combinedPermissions) {
        // Log the permissions to verify
        //console.log("Using Combined Permissions:", combinedPermissions);
    
        //----------TABLE CONSTANTS---------
    
        // Get table bodies
        const tabCollectionsTable = document.querySelector("#tabCollections tbody");
        const tabsTable = document.querySelector("#tabs tbody");
        const pageTable = document.querySelector("#pages tbody");
        const mobileTable = document.querySelector("#mobileTabs tbody");
        
    
        //Processed Data for SubTables
        const processedData = processSubTablesData(combinedPermissions);
    
        // Populate tables based on permissions
        combinedPermissions.forEach(permission => {
            const [firstPart, secondPart = '', thirdPart = ''] = permission.split('.').map(part => part.split('(')[0]);
    
            //TABS TAB
            if (firstPart === "tab_collection") {
                if (secondPart === "tab_collection_actions") {
                    // Clear the table and show only the "All Tab Collections" row
                    tabCollectionsTable.innerHTML = ""; // Remove all existing rows
            
                    const tabcolRow = document.createElement("tr");
                    const tabcolNameCell = document.createElement("td");
                    const tabcolViewCell = document.createElement("td");
            
                    // Populate the "All Tab Collections" row
                    tabcolNameCell.textContent = "All Tab Collections";
                    tabcolViewCell.textContent = "✔️";
            
                    tabcolRow.appendChild(tabcolNameCell);
                    tabcolRow.appendChild(tabcolViewCell);
                    tabCollectionsTable.appendChild(tabcolRow);
            
                    return; // Stop further processing for this iteration
                }
            
                // If secondPart is NOT "tab_collection_actions", populate the rest
                const tabcolRow = document.createElement("tr");
                const tabcolNameCell = document.createElement("td");
                const tabcolViewCell = document.createElement("td");
            
                // Populate rows for other secondPart values
                tabcolNameCell.textContent = secondPart;
                tabcolViewCell.textContent = "✔️";
            
                tabcolRow.appendChild(tabcolNameCell);
                tabcolRow.appendChild(tabcolViewCell);
                tabCollectionsTable.appendChild(tabcolRow);
            }
            else if (firstPart === "tab") {
                // If secondPart is "tab_actions", show only the "All Tabs" row and ignore others
                if (secondPart === "tab_actions") {
                    tabsTable.innerHTML = ""; // Clear the table
            
                    const mainRow = document.createElement("tr");
                    const mainNameCell = document.createElement("td");
                    const mainViewCell = document.createElement("td");
            
                    // Set the "All Tabs" row
                    mainNameCell.textContent = "All Tabs";
                    mainViewCell.textContent = "✔️";
                    mainRow.appendChild(mainNameCell);
                    mainRow.appendChild(mainViewCell);
                    tabsTable.appendChild(mainRow);
            
                    return; // Exit to ignore other rows
                }
            
                // Logic for other secondPart values
                const mainRow = document.createElement("tr");
                const mainNameCell = document.createElement("td");
                const mainViewCell = document.createElement("td");
            
                // Check if thirdPart is "tab_actions"
                if (thirdPart === "tab_actions") {
                    // If the thirdPart is "tab_actions", the secondPart gets an '✔️'
                    mainNameCell.textContent = secondPart;
                    mainViewCell.textContent = "✔️";
                    mainRow.appendChild(mainNameCell);
                    mainRow.appendChild(mainViewCell);
                    tabsTable.appendChild(mainRow);
                } else if (secondPart !== "tab_actions" && thirdPart !== "tab_actions") {
                    // If thirdPart is not "tab_actions", the secondPart doesn't get an '✔️'
                    mainNameCell.textContent = secondPart + "." + thirdPart;
                    mainViewCell.textContent = "✔️";
                    mainRow.appendChild(mainNameCell);
                    mainRow.appendChild(mainViewCell);
                    tabsTable.appendChild(mainRow);
            
                }
            //PAGES TAB
            } else if (firstPart === "page") {
                // If secondPart is "page_actions", show only the "All" row and ignore others
                if (secondPart === "page_actions") {
                    pageTable.innerHTML = ""; // Clear the table
            
                    const pageRow = document.createElement("tr");
                    const pageNameCell = document.createElement("td");
                    const pageViewCell = document.createElement("td");
            
                    // Set the "All" row
                    pageNameCell.textContent = "All";
                    pageViewCell.textContent = "✔️";
                    pageRow.appendChild(pageNameCell);
                    pageRow.appendChild(pageViewCell);
                    pageTable.appendChild(pageRow);
            
                    return; // Exit to ignore other rows
                }
            
                // Logic for other secondPart values
                const pageRow = document.createElement("tr");
                const pageNameCell = document.createElement("td");
                const pageViewCell = document.createElement("td");
            
                // Populate rows for other secondPart values
                pageNameCell.textContent = secondPart === "page_actions" ? "All" : secondPart;
                pageViewCell.textContent = "✔️";
                pageRow.appendChild(pageNameCell);
                pageRow.appendChild(pageViewCell);
                pageTable.appendChild(pageRow);
            
            //MOBILE TAB
            } else if (firstPart === "mobile_action") {
                // If secondPart is "mobile_tab_actions", show only the "All Mobile Tabs" row and ignore others
                if (secondPart === "mobile_tab_actions") {
                    mobileTable.innerHTML = ""; // Clear the table
            
                    const mobileRow = document.createElement("tr");
                    const mobileNameCell = document.createElement("td");
                    const mobileViewCell = document.createElement("td");
            
                    // Set the "All Mobile Tabs" row
                    mobileNameCell.textContent = "All Mobile Tabs";
                    mobileViewCell.textContent = "✔️";
                    mobileRow.appendChild(mobileNameCell);
                    mobileRow.appendChild(mobileViewCell);
                    mobileTable.appendChild(mobileRow);
            
                    return; // Exit to ignore other rows
                }
            
                // Logic for other secondPart values
                const mobileRow = document.createElement("tr");
                const mobileNameCell = document.createElement("td");
                const mobileViewCell = document.createElement("td");
            
                // Populate rows for other secondPart values
                mobileNameCell.textContent = secondPart === "mobile_tab_actions" ? "All Mobile Tabs" : secondPart;
                mobileViewCell.textContent = "✔️";
                mobileRow.appendChild(mobileNameCell);
                mobileRow.appendChild(mobileViewCell);
                mobileTable.appendChild(mobileRow);
            
    
            //ADMIN TAB
            //ADMIN TAB - CONFIGURATION
            } else if (firstPart === "configuration") {
                const TABLE_ID = "allConfigTable"; // ID of the table
                const NAME_COLUMN_TEXT = "configuration";
                const ALL_PERMISSION = "all_configuration";
                const READ_PERMISSION = "all_configuration_read";
                
                processTheAllTables(combinedPermissions, TABLE_ID, NAME_COLUMN_TEXT, ALL_PERMISSION, READ_PERMISSION);
                populateConfigurationSubTables(processedData);
                
    
            //ADMIN TAB - DOMAIN ADMINISTRATION
            } else if (firstPart === "domain_administration") {
                const TABLE_ID = "domainTableAll"; // ID of the table
                const NAME_COLUMN_TEXT = "domain_administration";
                const ALL_PERMISSION = "all_domain_admin";
                const READ_PERMISSION = "all_domain_admin_read";
                const RESET_PASSWORD = "reset_all_passwords";
                    
                processTheAllTables(combinedPermissions, TABLE_ID, NAME_COLUMN_TEXT, ALL_PERMISSION, READ_PERMISSION, RESET_PASSWORD);
                populateDomainSubTables(processedData);
    
            //ADMIN TAB - OPERATIONS
            } else if (firstPart === "operations") {
                const TABLE_ID = "operationsTableAll"; // ID of the table
                const NAME_COLUMN_TEXT = "operations";
                const ALL_PERMISSION = "all_operations";
                const READ_PERMISSION = "all_operations_read";
    
                processTheAllTables(combinedPermissions, TABLE_ID, NAME_COLUMN_TEXT, ALL_PERMISSION, READ_PERMISSION);
                populateOperationSubTables(processedData);
    
            //ADMIN TAB - SECURITY
            } else if (firstPart === "security") {
                const TABLE_ID = "securityTableAll"; // ID of the table
                const NAME_COLUMN_TEXT = "security";
                const ALL_PERMISSION = "all_security_admin";
                const READ_PERMISSION = "all_security_read";
    
                processTheAllTables(combinedPermissions, TABLE_ID, NAME_COLUMN_TEXT, ALL_PERMISSION, READ_PERMISSION);
                populateSecuritySubTables(processedData);
    
            //ADMIN TAB - SETTINGS
            } else if (firstPart === "settings") {
                const TABLE_ID = "settingsTableAll"; // ID of the table
                const NAME_COLUMN_TEXT = "settings";
                const ALL_PERMISSION = "all_settings";
                const READ_PERMISSION = "all_settings_read";
    
                processTheAllTables(combinedPermissions, TABLE_ID, NAME_COLUMN_TEXT, ALL_PERMISSION, READ_PERMISSION);
                populateSettingsSubTables(processedData);
    
            //ADMIN TAB - ABOUT
            } else if (firstPart === "about") {
                populateAboutSubTables(processedData);
    
            //ADMIN TAB - DEPLOYMENT
            } else if (firstPart === "deployment") {
                populateDeploymentSubTables(processedData);
    
            //APPLICATION TAB - VAULT ACTIONS
            } else if (firstPart === "vault_actions") {
                const TABLE_ID = "vaultActionsTableAll"; // ID of the table
                const NAME_COLUMN_TEXT = "vault_actions";
                const ALL_PERMISSION = "all_vault_actions";
                
                    processTheAllTables(combinedPermissions, TABLE_ID, NAME_COLUMN_TEXT, ALL_PERMISSION);
                    populateVActionsSubTables(processedData);

            //APPLICATION TAB - VAULT OWNER ACTIONS
            } else if (firstPart === "vault_owner_actions") {
                const TABLE_ID = "VOActionsTableOne"; // ID of the table
                const NAME_COLUMN_TEXT = "vault_owner_actions";
                const columnOne = "rerender";
                const columnTwo = "power_delete";
                const columnThree = "vault_loader";
                const columnFour = "record_migration";
                const columnFive = "document_migration";
    
                processVaultOwnerActions(combinedPermissions, TABLE_ID, NAME_COLUMN_TEXT, columnOne, columnTwo, columnThree, columnFour, columnFive);
                populateVOwnerActionsSubTables(processedData);
    
            //APPLICATION TAB - CLIENT APPLICATIONS
            } else if (firstPart === "vault_client_applications") {
                populateClientAppsSubTables(processedData);
            }
        });
    }
}
// Dispatch a custom event to notify the other script
window.dispatchEvent(new Event('tablesFilled'));
});

//------------------------------FUNCTIONS--------------------------------
        // Function to clear table data
        function clearTableData() {
            const objectTableBody = document.getElementById('objectTable').getElementsByTagName('tbody')[0];
            const fieldsTableBody = document.getElementById('fieldsTable').getElementsByTagName('tbody')[0];
        
            // Clear both tables
            objectTableBody.innerHTML = '';
            fieldsTableBody.innerHTML = '';
        }

        function toggleTableVisibility(table, tablePopulated) {
            if (tablePopulated) {
                // If data is populated and the "table-hidden" class is present, remove it
                if (table.classList.contains('table-hidden')) {
                    table.classList.remove('table-hidden');
                }
                // Otherwise, do nothing (leave visibility as it is)
            } 
        }
        

        // Function to populate Object Permissions table
        export function populateObjectPermissionsTable(objectName, objectMap) {
            const objectTableBody = document.getElementById('objectTable').getElementsByTagName('tbody')[0];
        
            if (objectMap[objectName]) {
                objectMap[objectName].forEach(permission => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${permission.objectType}</td>
                        <td>${permission.read ? '✔️' : ''}</td>
                        <td>${permission.create ? '✔️' : ''}</td>
                        <td>${permission.edit ? '✔️' : ''}</td>
                        <td>${permission.delete ? '✔️' : ''}</td>
                    `;
                    objectTableBody.appendChild(row);
                });
            } else {
            }
        }
        
        // Function to populate Field Permissions table
        export function populateFieldPermissionsTable(objectName, fieldMap) {
            const fieldsTableBody = document.getElementById('fieldsTable').getElementsByTagName('tbody')[0];
        
            if (fieldMap[objectName]) {
                fieldMap[objectName].forEach(field => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${field.fieldName}</td>
                        <td>${field.read ? '✔️' : ''}</td>
                        <td>${field.edit ? '✔️' : ''}</td>
                    `;
                    fieldsTableBody.appendChild(row);
                });
            } else {
                //console.error(`Error: No field permissions found for ${objectName}`);
            }
        }
        
        // Function to populate tables for the default object
        function populateTablesForObject(objectName, objectMap, fieldMap) {
            // Populate Object Permissions table for the first object
            populateObjectPermissionsTable(objectName, objectMap);
        
            // Populate Field Permissions table for the first object
            populateFieldPermissionsTable(objectName, fieldMap);
        }
        
        // Function to process data and populate the tables with the All Permissions
        export function processTheAllTables(
            data,
            tableId,
            nameColumnText,
            allPermission,
            readPermission = null,
            fourthPermission = null
        ) {
            const tableBody = document.querySelector(`#${tableId} tbody`);
        
            // Clear the existing rows in the table body
            tableBody.innerHTML = "";
        
            let highestPermission = null; // To track the highest priority permission (allPermission > readPermission)
            let fourthPermissionFound = false; // To track if the fourth permission is found
        
            data.forEach((entry) => {
                // Match the entry using regex
                const match = entry.match(/([a-zA-Z_]+)\(([^)]+)\)/);
                if (!match) {
                    return;
                }
        
                const [_, basePart, permissions] = match;
        
                // Skip if the base part doesn't match the table's name column
                if (basePart !== nameColumnText.toLowerCase()) {
                    return;
                }
        
                //console.log(`Processing entry: ${entry}`); // Debugging
        
                // Split permissions string into an array
                const permissionList = permissions.split(",").map((p) => p.trim().replace(/['"]+/g, ""));
                //console.log(`Extracted permissions: ${permissionList}`); // Debugging
        
                // Check for allPermission and readPermission
                if (permissionList.includes(allPermission)) {
                    highestPermission = allPermission;
                } else if (readPermission && permissionList.includes(readPermission) && highestPermission !== allPermission) {
                    highestPermission = readPermission;
                } else {
                    highestPermission = null;
                }
        
                // Check for fourthPermission
                if (fourthPermission && permissionList.includes(fourthPermission)) {
                    fourthPermissionFound = true;
                }
            });
        
            // Create a new table row
            const row = document.createElement("tr");
        
            // Name column
            const nameCell = document.createElement("td");
            nameCell.textContent = nameColumnText;
            row.appendChild(nameCell);
        
            // Determine if the table has two, three, or four columns
            const columnCount = document.querySelector(`#${tableId} thead tr`).children.length;
        
            if (columnCount === 2) {
                // Only Name and All Permission columns
                const allCell = document.createElement("td");
                allCell.textContent = highestPermission === allPermission ? "✔" : "";
                row.appendChild(allCell);
            } else if (columnCount === 3) {
                // Name, All Permission, and Read Permission columns
                const allCell = document.createElement("td");
                allCell.textContent = highestPermission === allPermission ? "✔" : "";
                row.appendChild(allCell);
        
                const readCell = document.createElement("td");
                readCell.textContent = highestPermission === allPermission || highestPermission === readPermission ? "✔" : "";
                row.appendChild(readCell);
            } else if (columnCount === 4) {
                // Name, All Permission, Read Permission, and Fourth Permission columns
                const allCell = document.createElement("td");
                allCell.textContent = highestPermission === allPermission ? "✔" : "";
                row.appendChild(allCell);
        
                const readCell = document.createElement("td");
                readCell.textContent = highestPermission === allPermission || highestPermission === readPermission ? "✔" : "";
                row.appendChild(readCell);
        
                const fourthCell = document.createElement("td");
                fourthCell.textContent = (highestPermission === allPermission || fourthPermissionFound) ? "✔" : "";
                row.appendChild(fourthCell);
            }
        
            // Append the row to the table body
            tableBody.appendChild(row);
        }
        
        export function processVaultOwnerActions(
            data,
            tableId,
            nameColumnText,
            columnOne,
            columnTwo,
            columnThree,
            columnFour,
            columnFive
        ) {
            const table = document.querySelector(`#${tableId}`);
            const tableBody = document.querySelector(`#${tableId} tbody`);
            tableBody.innerHTML = "";
            let isDataPopulated = false;
        
            const populateAdditionalTable = (tableId, firstColumnText, columnCount) => {
                const additionalTable = document.querySelector(`#${tableId}`);
                const additionalBody = additionalTable.querySelector("tbody");
                additionalBody.innerHTML = "";
        
                const row = document.createElement("tr");
                const nameCell = document.createElement("td");
                nameCell.textContent = firstColumnText;
                row.appendChild(nameCell);
        
                for (let i = 1; i < columnCount; i++) {
                    const cell = document.createElement("td");
                    cell.textContent = "✔";
                    row.appendChild(cell);
                }
        
                additionalBody.appendChild(row);
                const hasData = Array.from(additionalTable.querySelectorAll("td")).some(td => td.textContent.trim() !== "");
                additionalTable.style.display = hasData ? "table" : "none";
            };
        
            data.forEach((entry) => {
                const match = entry.match(/([a-zA-Z_]+)\(([^)]+)\)/);
                if (!match) return;
        
                const [_, basePart, permissions] = match;
                if (basePart !== nameColumnText.toLowerCase()) return;
        
                const permissionList = permissions.split(",").map((p) => p.trim().replace(/['"]+/g, ""));
                const isVaultOwner = permissionList.includes("vault_owner");
        
                if (isVaultOwner) {
                    populateAdditionalTable("VOActionsTableTwo", "all_documents", 4);
                    populateAdditionalTable("VOActionsTableThree", "all_object_records", 5);
                    populateAdditionalTable("VOActionsTableFour", "legal_hold", 3);
                }
        
                const row = document.createElement("tr");
                const nameCell = document.createElement("td");
                nameCell.textContent = nameColumnText;
                row.appendChild(nameCell);
        
                [columnOne, columnTwo, columnThree, columnFour, columnFive].forEach((col) => {
                    const cell = document.createElement("td");
                    cell.textContent = isVaultOwner || permissionList.includes(col) ? "✔" : "";
                    row.appendChild(cell);
                });
        
                tableBody.appendChild(row);
                isDataPopulated = true;
            });
        
            toggleTableVisibility(table, isDataPopulated);
        }
        
        
        
        
        
        // Function to process the subtables
        export function processSubTablesData(data) {
            return data.map((entry) => {
                const match = entry.match(/([a-zA-Z_]+)\.([a-zA-Z_]+)\(([^)]+)\)/);
                if (!match) return null; // Skip invalid entries
                const [_, firstPart, secondPart, permissions] = match;
                const permissionList = permissions
                    .split(',')
                    .map((p) => p.trim().replace(/['"]+/g, '')); // Clean up quotes and whitespace
                return { firstPart, secondPart, permissions: permissionList };
            }).filter(Boolean); // Remove null values
        }
        
        // Define permission dependencies
        const permissionDependencies = {
            delete: ["read", "edit", "read_run_reports"],
            create: ["read", "edit", "read_run_reports"],
            edit: ["read"],
            share: ["read", "read_run_reports"],
            all_audit: ["system_audit", "login_audit", "document_audit", "object_record_audit", "domain_audit", "debug_log", "api_usage", "collab_auth_error_logs"],
            all_reports: ["read_run_reports", "create", "delete", "share", "schedule", "administer", "display_public_key","read_group_membership"],
            administer: ["read_run_reports", "create", "delete", "share"],
            display_public_key: ["read_run_reports"],
            read_group_membership: ["read_run_reports"],
            all_workflow: ["start", "participate", "read_understand", "e_sig", "query"],
            e_sig: ["participate"],
            query: ["participate"],
            all_workflow_admin: ["cancel", "view_active", "reassign", "add_participant", "email_participants", "update_workflow_dates", "replace_workflow_owner"],
            all_api: ["access_api", "events_api", "metadata_api"],
            events_api: ["access_api"],
            metadata_api: ["access_api"],
            make_share_mandatory: ["share_views"],
            export_audit_trail: ["view_audit_trail"],
            all_document_actions: ["all_document_read", "all_document_create"],
            all_object_record_actions: ["all_object_record_read", "all_object_record_edit", "all_object_record_delete"],
            all_object_record_edit: ["all_object_record_read"],
            all_object_record_delete: ["all_object_record_read", "all_object_record_edit"],
            import_from_vfm_rim_submission_archive: ["import_rim_submission_archive"],
            bulk_export_rim_submission_archive: ["export_rim_submission_submission"],
            archive: ["view_archive"]
        };
        
        // Special dependencies for "field_dependencies"
        const fieldDependenciesOverrides = {
            edit: ["read", "create", "delete"], // Override for "field_dependencies"
        };
        
        // Function to augment permissions with dependencies
        export function augmentPermissions(permissions, secondPart = null) {
            const augmentedPermissions = new Set(permissions);
        
            // Determine the dependencies to use
            const dependencies = secondPart === "field_dependencies" ? fieldDependenciesOverrides : permissionDependencies;
        
            // Add implied permissions based on the determined dependencies
            permissions.forEach((permission) => {
                if (dependencies[permission]) {
                    dependencies[permission].forEach((dep) => augmentedPermissions.add(dep));
                }
            });
        
            return Array.from(augmentedPermissions); // Return as an array
        }
        
        // Create a map to track processed firstPart and secondPart combinations
        const processedEntries = new Map();
        
        // Function to populate a table dynamically
        export function populateTable(tableId, columnHeaders, firstPart, secondPart, permissions, validPermissions) {
            const table = document.getElementById(tableId); // Get the table element
            const tableBody = table.querySelector("tbody"); // Get the table body
            tableBody.innerHTML = "";
        
            // Augment permissions with dependencies
            const augmentedPermissions = augmentPermissions(permissions);
        
            // Check if the firstPart exists in the processedEntries map
            if (!processedEntries.has(firstPart)) {
                processedEntries.set(firstPart, new Map()); // Initialize the map for each firstPart
            }
        
            const secondPartsMap = processedEntries.get(firstPart);
        
            // If this secondPart is not yet in the map, create a new entry for it
            if (!secondPartsMap.has(secondPart)) {
                secondPartsMap.set(secondPart, new Set());
            }
        
            // Merge permissions with the existing set for this secondPart
            const permissionSet = secondPartsMap.get(secondPart);
            augmentedPermissions.forEach(permission => permissionSet.add(permission));
        
            // Check if we already have a row for this secondPart
            let row = tableBody.querySelector(`[data-firstpart="${firstPart}"][data-secondpart="${secondPart}"]`);
        
            if (!row) {
                // If no row exists, create a new one for this secondPart
                row = document.createElement("tr");
                row.setAttribute("data-firstpart", firstPart);
                row.setAttribute("data-secondpart", secondPart);
        
                // Add secondPart as the first cell
                const secondPartCell = document.createElement("td");
                secondPartCell.textContent = secondPart;
                row.appendChild(secondPartCell);
        
                // Add empty cells for each column
                columnHeaders.forEach(() => {
                    const cell = document.createElement("td");
                    cell.textContent = ""; // Initialize empty
                    row.appendChild(cell);
                });
        
                // Append the row to the table body
                tableBody.appendChild(row);
            }
        
            // Update the cells for this row with merged permissions
            const cells = row.querySelectorAll("td");
            validPermissions.forEach((permission, index) => {
                const cellIndex = index + 1; // Skip the first column (secondPart)
                if (cells[cellIndex]) {
                    if (permissionSet.has(permission)) {
                        cells[cellIndex].textContent = "✔️"; // Mark the permission as present
                    }
                }
            });
        
            // Check if any row has meaningful data (non-empty cells)
            const hasData = Array.from(tableBody.querySelectorAll("tr")).some(row => {
                return Array.from(row.querySelectorAll("td")).some(td => td.textContent.trim() !== "");
            });
        
            toggleTableVisibility(table, hasData);
        }
        
        
        
        
        // CONFIGURATION - Function to handle dynamic table population
        function populateConfigurationSubTables(processedData) {
            processedData.forEach(({ firstPart, secondPart, permissions }) => {
                let stopProcessing = false;
                // If processing is already stopped, exit early
                if (stopProcessing) return;
        
                const tableName = "allConfigTable"; 
                const specificTable = document.querySelector(`#${tableName}`);
                const secondColumnValue = specificTable?.querySelector("tbody tr:first-child td:nth-child(2)")?.textContent;
        
                if (firstPart !== "configuration" || secondColumnValue === "✔") {
                    stopProcessing = true; // Set flag to true to stop processing further
                    return;
                }
        
                // Handle tables based on the secondPart
                switch (true) {
                    case ["email_settings", "login_message","picklists","user_account_emails","lifecycle_colors","pages","searchable_object_fields","content_tagging","configuration_embedded_metadata"].includes(secondPart):
                        populateTable(
                            "configTableOne",
                            ["Read", "Edit"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["read", "edit"]
                        );
                        break;
        
                    case ["configuration_tabs", "tab_collections","views","document_custom_actions","object_custom_actions","document_types","fields","field_dependencies","field_layouts","lifecycles_and_workflows","object_lifecycles","objects","overlays","rendition_types","report_types","signature_and_cover_pages","formatted_output_templates","configuration_pagelinks","custom_messages","templates","vault_java_sdk","vault_tokens","checklist_type","layout_profiles","application_profiles","outbound_email_domain"].includes(secondPart):
                        const augmentedPermissions = augmentPermissions(permissions, secondPart);
                        populateTable(
                            "configTableTwo",
                            ["Read", "Create", "Edit", "Delete"], // Expected columns
                            firstPart,
                            secondPart,
                            augmentedPermissions,
                            ["read", "create", "edit", "delete"]
                        );
                        break;
        
                    case ["business_admin_objects"].includes(secondPart):
                        populateTable(
                            "configTableThree",
                            ["Read"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["read"]
                        );
                        break;
        
                    case ["logs"].includes(secondPart):
                        populateTable(
                            "configTableFour",
                            ["All Audit", "System Audit", "Login Audit", "Document Audit", "Object Record Audit", "Domain Audit", "Vault Java SDK", "API Usage", "Collab Auth Error Logs"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["all_audit", "system_audit", "login_audit", "document_audit", "object_record_audit", "domain_audit", "debug_log", "api_usage", "collab_auth_error_logs"]
                        );
                        break;
        
                    case ["queues"].includes(secondPart):
                        populateTable(
                            "configTableFive",
                            ["Read", "Create", "Edit", "Delete", "Queue Log"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["read", "create", "edit", "delete", "queue_logs"]
                        );
                        break;
                    
                    case ["inbound_email_address"].includes(secondPart):
                        populateTable(
                            "configTableSix",
                            ["Read", "Create", "Edit", "Delete", "Email Log", "Reprocess Emails", "Delete Emails"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["read", "create", "edit", "delete", "view_email_log", "reprocess_email", "delete_email"]
                        );
                        break;
        
                    case ["mobile_setup"].includes(secondPart):
                        populateTable(
                            "configTableSeven",
                            ["Manage Sharing Actions", "Manage Mobile Tabs"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["manage_share_actions", "manage_mobile_tabs"]
                        );
                        break;
        
        
                    default:
                        break;
                }
            });
        }
        
        
        
        // DOMAIN ADMINISTRATION - Function to handle dynamic table population
        function populateDomainSubTables(processedData) {
            processedData.forEach(({ firstPart, secondPart, permissions }) => {
                let stopProcessing = false;
                // If processing is already stopped, exit early
                if (stopProcessing) return;
        
                const tableName = "domainTableAll"; 
                const specificTable = document.querySelector(`#${tableName}`);
                const secondColumnValue = specificTable?.querySelector("tbody tr:first-child td:nth-child(2)")?.textContent;
        
                if (firstPart !== "domain_administration" || secondColumnValue === "✔") {
                    stopProcessing = true; // Set flag to true to stop processing further
                    return;
                }
        
                // Handle tables based on the secondPart
                switch (true) {
                    case ["domain_settings", "sso_settings"].includes(secondPart):
                        populateTable(
                            "domainTableOne",
                            ["Read", "Edit"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["read", "edit"]
                        );
                        break;
        
                    case ["security_policies"].includes(secondPart):
                        populateTable(
                            "domainTableTwo",
                            ["Read", "Create", "Edit"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["read", "create", "edit"]
                        );
                        break;
        
                    case ["network_access_rules"].includes(secondPart):
                        populateTable(
                            "domainTableThree",
                            ["Read", "Create", "Edit", "Delete"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["read", "create", "edit", "delete"]
                        );
                        break;
        
        
                    default:
                        break;
                }
            });
        }
        
        
        // OPERATIONS - Function to handle dynamic table population
        function populateOperationSubTables(processedData) {
            processedData.forEach(({ firstPart, secondPart, permissions }) => {
                let stopProcessing = false;
                // If processing is already stopped, exit early
                if (stopProcessing) return;
        
                const tableName = "operationsTableAll"; 
                const specificTable = document.querySelector(`#${tableName}`);
                const secondColumnValue = specificTable?.querySelector("tbody tr:first-child td:nth-child(2)")?.textContent;
        
                if (firstPart !== "operations" || secondColumnValue === "✔") {
                    stopProcessing = true; // Set flag to true to stop processing further
                    return;
                }
        
                // Handle tables based on the secondPart
                switch (true) {
                    case ["jobs"].includes(secondPart):
                        populateTable(
                            "operationsTableOne",
                            ["Read", "Create", "Edit", "Delete", "Interact", "Manage SDK Job Metadata"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["read", "create", "edit", "delete", "interact", "manage_sdk_job_metadata"]
                        );
                        break;
        
                    case ["renditions"].includes(secondPart):
                        populateTable(
                            "operationsTableTwo",
                            ["Read"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["read"]
                        );
                        break;
        
                    case ["sdk_job_queues"].includes(secondPart):
                        populateTable(
                            "operationsTableThree",
                            ["Read", "Create", "Edit", "Delete"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["read", "create", "edit", "delete"]
                        );
                        break;
        
                    case ["email_notification_status"].includes(secondPart):
                        populateTable(
                            "operationsTableFour",
                            ["Read", "Delete"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["read", "delete"]
                        );
                        break;
        
        
                    default:
                        break;
                }
            });
        }
        
        
        // SECURITY - Function to handle dynamic table population
        function populateSecuritySubTables(processedData) {
            processedData.forEach(({ firstPart, secondPart, permissions }) => {
                let stopProcessing = false;
                // If processing is already stopped, exit early
                if (stopProcessing) return;
        
                const tableName = "securityTableAll"; 
                const specificTable = document.querySelector(`#${tableName}`);
                const secondColumnValue = specificTable?.querySelector("tbody tr:first-child td:nth-child(2)")?.textContent;
        
                if (firstPart !== "security" || secondColumnValue === "✔") {
                    stopProcessing = true; // Set flag to true to stop processing further
                    return;
                }
        
                // Handle tables based on the secondPart
                switch (true) {
                    case ["security_settings"].includes(secondPart):
                        populateTable(
                            "securityTableOne",
                            ["Read", "Edit"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["read", "edit"]
                        );
                        break;
        
                    case ["users"].includes(secondPart):
                        populateTable(
                            "securityTableTwo",
                            ["Read", "Create", "Edit", "Assign Group", "Grant Support Login", "Delegate Admin", "Add Cross-Domain Users", "Manage User Object"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["read", "create", "edit", "assign_group", "grant_login_as", "grant_delegate_access", "add_cross_domain_users", "manage_user_object"]
                        );
                        break;
        
                    case ["groups", "security_profiles"].includes(secondPart):
                        populateTable(
                            "securityTableThree",
                            ["Read", "Create", "Edit", "Delete", "Assign Users"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["read", "create", "edit", "delete", "assign_users"]
                        );
                        break;
        
                    case ["permission_sets"].includes(secondPart):
                        populateTable(
                            "securityTableFour",
                            ["Read", "Create", "Edit", "Delete"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["read", "create", "edit", "delete"]
                        );
                        break;
        
        
                    default:
                        break;
                }
            });
        }
        
        
        // SETTINGS - Function to handle dynamic table population
        function populateSettingsSubTables(processedData) {
            processedData.forEach(({ firstPart, secondPart, permissions }) => {
                let stopProcessing = false;
                // If processing is already stopped, exit early
                if (stopProcessing) return;
        
                const tableName = "settingsTableAll"; 
                const specificTable = document.querySelector(`#${tableName}`);
                const secondColumnValue = specificTable?.querySelector("tbody tr:first-child td:nth-child(2)")?.textContent;
        
                if (firstPart !== "settings" || secondColumnValue === "✔") {
                    stopProcessing = true; // Set flag to true to stop processing further
                    return;
                }
        
                // Handle tables based on the secondPart
                switch (true) {
                    case ["general_settings", "general_configuration", "checkout", "versioning", "branding", "search", "language", "application", "settings_file_staging"].includes(secondPart):
                        populateTable(
                            "settingsTableOne",
                            ["Read", "Edit"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["read", "edit"]
                        );
                        break;
        
                    case ["renditions"].includes(secondPart):
                        populateTable(
                            "settingsTableTwo",
                            ["Read", "Create", "Edit", "Delete"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["read", "create", "edit", "delete"]
                        );
                        break;
        
        
                    default:
                        break;
                }
            });
        }
        
        // ABOUT - Function to handle dynamic table population
        function populateAboutSubTables(processedData) {
            processedData.forEach(({ firstPart, secondPart, permissions }) => {
                if (firstPart !== "about") {
                    return; // Skip entries with unexpected firstPart
                }
        
                // Handle tables based on the secondPart
                switch (true) {
                    case ["general_information", "domain_information"].includes(secondPart):
                        populateTable(
                            "aboutTable",
                            ["Read"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["read"]
                        );
                        break;
        
                    default:
                        break;
                }
            });
        }
        
        // DEPLOYMENT - Function to handle dynamic table population
        function populateDeploymentSubTables(processedData) {
            processedData.forEach(({ firstPart, secondPart, permissions }) => {
                if (firstPart !== "deployment") {
                    return; // Skip entries with unexpected firstPart
                }
        
                // Handle tables based on the secondPart
                switch (true) {
                    case ["migration_packages"].includes(secondPart):
                        populateTable(
                            "deploymentTableOne",
                            ["Create", "Deploy"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["create", "deploy"]
                        );
                        break;
        
                    case ["environment"].includes(secondPart):
                        populateTable(
                            "deploymentTableTwo",
                            ["Vault Configuration Report", "Vault Comparison"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["config_report", "vault_compare"]
                        );
                        break;
        
                    case ["sandbox_self_service", "sandbox_snapshot"].includes(secondPart):
                        populateTable(
                            "deploymentTableThree",
                            ["Read", "Create", "Edit", "Delete"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["read", "create", "edit", "delete"]
                        );
                        break;
        
                    default:
                        break;
                }
            });
        }
        
        // VAULT ACTONS - Function to handle dynamic table population
        function populateVActionsSubTables(processedData) {
        
            processedData.forEach(({ firstPart, secondPart, permissions }) => {
                let stopProcessing = false; // Flag to stop all further processing
                // If processing is already stopped, exit early
                if (stopProcessing) return;
        
                const tableName = "vaultActionsTableAll"; 
                const specificTable = document.querySelector(`#${tableName}`);
                const secondColumnValue = specificTable?.querySelector("tbody tr:first-child td:nth-child(2)")?.textContent;

                if (firstPart !== "vault_actions" || secondColumnValue === "✔") {
                    stopProcessing = true; // Set flag to true to stop processing further
                    return;
                }
        
                // Handle tables based on the secondPart
                switch (true) {
                    case ["reporting"].includes(secondPart):
                        populateTable(
                            "vaultActionsTableOne",
                            ["All", "Read Dashboards and Reports", "Create Dashboards", "Delete Dashboards", "Share Dashboards", "Schedule Reports", "Administer Dashboards", "Display API Name Dashboards", "Read Group Membership"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["all_reports", "read_run_reports", "create", "delete", "share", "schedule", "administer", "display_public_key","read_group_membership"]
                        );
                        break;
        
                    case ["workflow"].includes(secondPart):
                        populateTable(
                            "vaultActionsTableTwo",
                            ["All Workflow", "Start", "Participate", "Read and Understand", "eSignature", "Query"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["all_workflow", "start", "participate", "read_understand", "e_sig", "query"]
                        );
                        break;
        
                    case ["workflow_administration"].includes(secondPart):
                        populateTable(
                            "vaultActionsTableThree",
                            ["All Workflow Admin", "Cancel", "View Active", "Reassign", "Update Participants", "Email Participants", "Update Workflow Dates", "Replace Workflow Owner"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["all_workflow_admin", "cancel", "view_active", "reassign", "add_participant", "email_participants", "update_workflow_dates", "replace_workflow_owner"]
                        );
                        break;
        
                    case ["api"].includes(secondPart):
                        populateTable(
                            "vaultActionsTableFour",
                            ["All API", "Access API", "Events API", "Metadata API"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["all_api", "access_api", "events_api", "metadata_api"]
                        );
                        break;
        
                    case ["crosslink"].includes(secondPart):
                        populateTable(
                            "vaultActionsTableFive",
                            ["Create CrossLink"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["create_crosslink"]
                        );
                        break;
        
                    case ["viewer_administration"].includes(secondPart):
                        populateTable(
                            "vaultActionsTableSix",
                            ["Manage Tags", "Merge Anchors", "Remove Annotations", "Manage Anchors"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["manage_tags", "merge_anchors", "remove_annotations", "manage_anchors"]
                        );
                        break;
        
                    case ["document"].includes(secondPart):
                        populateTable(
                            "vaultActionsTableSeven",
                            ["Cancel Checkout", "Download Document", "Download Rendition", "Bulk Delete", "Bulk Update", "Always Allow Unclassified", "Vault File Manager", "Download Non-Protected Rendition"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["cancel_checkout", "download_document", "download_rendition", "bulk_delete", "bulk_update", "upload_unclassified", "checkout_to_client", "download_non_protected_rendition"]
                        );
                        break;
        
                    case ["object"].includes(secondPart):
                        populateTable(
                            "vaultActionsTableEight",
                            ["Bulk Action", "Merge Records"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["bulk_action", "merge_records"]
                        );
                        break;
                    //RIM TABLE 1
                    case ["xevmpd_bulk_actions"].includes(secondPart):
                        populateTable(
                            "vaultActionsRIMOne",
                            ["XEVMPD Bulk Update", "XEVPRM Bulk Submit"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["xevmpd_bulk_update", "xevprm_bulk_submit"]
                        );
                        break;   
        
                    case ["user"].includes(secondPart):
                        populateTable(
                            "vaultActionsTableNine",
                            ["Allow As A Delegate", "View User Information", "View User Profile"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["allow_as_delegate", "view_user_identities", "view_user_profile"]
                        );
                        break;
        
                    case ["search"].includes(secondPart):
                        populateTable(
                            "vaultActionsTableTen",
                            ["Manage Archive", "User Filters", "View Archive"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["archive", "user_filter", "view_archive"]
                        );
                        break;
        
                    //PROMOMATS TABLE        
                    case ["application"].includes(secondPart):
                        populateTable(
                            "vaultActionsPromomats",
                            ["Send to CDN", "Approved Email", "Multichannel Loader"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["send_to_cdn", "approved_email", "multichannel_loader"]
                        );
                        break;
        
                    case ["views"].includes(secondPart):
                        populateTable(
                            "vaultActionsTableEleven",
                            ["Share Views", "Make Mandatory"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["share_views", "make_share_mandatory"]
                        );
                        break;
        
                    case ["audit_trail"].includes(secondPart):
                        populateTable(
                            "vaultActionsTableTwelve",
                            ["Share Views", "Make Mandatory"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["view_audit_trail", "export_audit_trail"]
                        );
                        break;
                    //RIM TABLE 2
                    case ["rim"].includes(secondPart):
                        populateTable(
                            "vaultActionsRIMTwo",
                            ["RIM Maintenance"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["rim_loader_load"]
                        );
                        break;
        
                    //RIM TABLE 3
                    case ["rim_submissions_archive"].includes(secondPart):
                        populateTable(
                            "vaultActionsRIMThree",
                            ["Import", "Export", "Bulk Export", "Import from Vault File Manager"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["import_rim_submission_archive", "export_rim_submission_submission", "bulk_export_rim_submission_archive", "import_from_vfm_rim_submission_archive"]
                        );
                        break;
        
                    //RIM TABLE 4
                    case ["rim_registrations"].includes(secondPart):
                        populateTable(
                            "vaultActionsRIMFour",
                            ["Bulk Registration History Report"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["bulk_registration_history_report"]
                        );
                        break;
        
                    case ["ftp_staging"].includes(secondPart):
                        populateTable(
                            "vaultActionsTableThirteen",
                            ["Access", "Access via Vault File Manager"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["ftp_access", "fsa_vaultfilemanager"]
                        );
                        break;
        
                    case ["edl_matching"].includes(secondPart):
                        populateTable(
                            "vaultActionsTableFourteen",
                            ["Run", "Edit Match Fields", "Edit Document Matches"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["edl_run", "edl_edit_match_fields", "edl_edit_document_matches"]
                        );
                        break;
        
                    case ["connections"].includes(secondPart):
                        populateTable(
                            "vaultActionsTableFifteen",
                            ["Manage Connections"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["manage_connections"]
                        );
                        break;
        
                    case ["integrations"].includes(secondPart):
                        populateTable(
                            "vaultActionsTableSixteen",
                            ["Manage Integrations"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["manage_integrations"]
                        );
                        break;
        
                    case ["create_button"].includes(secondPart):
                        populateTable(
                            "vaultActionsTableSeventeen",
                            ["Show Create Button"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["show_create_button"]
                        );
                        break;
        
                    default:
                        break;
                }
            });
        }
        
        // VAULT OWNER ACTIONS - Function to handle dynamic table population
        function populateVOwnerActionsSubTables(processedData) {
            processedData.forEach(({ firstPart, secondPart, permissions }) => {
                if (firstPart !== "vault_owner_actions") {
                    return; // Skip entries with unexpected firstPart
                }
        
                // Handle tables based on the secondPart
                switch (true) {
                    case ["all_documents"].includes(secondPart):
                        populateTable(
                            "VOActionsTableTwo",
                            ["All Document Actions", "All Document Read", "All Document Create"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["all_document_actions", "all_document_read", "all_document_create"]
                        );
                        break;
        
                    case ["all_object_records"].includes(secondPart):
                        populateTable(
                            "VOActionsTableThree",
                            ["All Object Record Actions", "All Object Record Read", "All Object Record Edit", "All Object Record Delete"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["all_object_record_actions", "all_object_record_read", "all_object_record_edit", "all_object_record_delete"]
                        );
                        break;
        
                    case ["legal_hold"].includes(secondPart):
                        populateTable(
                            "VOActionsTableFour",
                            ["Apply", "Remove"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["apply_legal_hold", "remove_legal_hold"]
                        );
                        break;
        
        
                    default:
                        break;
                }
            });
        }
        
        // CLIENT APPLICATIONS - Function to handle dynamic table population
        function populateClientAppsSubTables(processedData) {
            processedData.forEach(({ firstPart, secondPart, permissions }) => {
                if (firstPart !== "vault_client_applications") {
                    return; // Skip entries with unexpected firstPart
                }
        
                // Handle tables based on the secondPart
                switch (true) {
                    case ["veeva_snap"].includes(secondPart):
                        populateTable(
                            "CAActionsTableOne",
                            ["Enable", "Enable Direct Installation"], // Expected columns
                            firstPart,
                            secondPart,
                            permissions,
                            ["enable", "enable_appstore"]
                        );
                        break;
        
        
                    default:
                        break;
                }
            });
        }
