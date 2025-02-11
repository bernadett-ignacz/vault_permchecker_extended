import { processTheAllTables, processVaultOwnerActions, processSubTablesData, augmentPermissions, populateTable } from "./fillTables.js";
window.addEventListener('compareDataStored', function() {
    // Retrieve data from sessionStorage
    const permissionsDataCompare = JSON.parse(sessionStorage.getItem('permissionsDataCompare'));
    const userDataCompare = JSON.parse(sessionStorage.getItem('userDataCompare'));
    const combinedComparePermissions = JSON.parse(sessionStorage.getItem('combinedComparePermissions'));

    // Debugging: Log permissionsData to check its structure
    //console.log('permissionsDataCompare:', permissionsDataCompare);
    //console.log(combinedComparePermissions);

     //------------------------------FILL TABLES------------------------------

    if (permissionsDataCompare) {
        const { objectNames, fieldCompareMap, objectCompareMap } = permissionsDataCompare;

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
                    populateCompareTablesForObject(name, objectCompareMap, fieldCompareMap);
                }
            });

            // Event listener for when a user selects an object name
            objectNamesDropdown.addEventListener('change', () => {
                const selectedObject = objectNamesDropdown.value;

                // Clear previous table data
                clearTableData();

                if (selectedObject) {
                    // Populate Object Permissions table for selected object
                    populateCompareObjectPermissionsTable(selectedObject, objectCompareMap);

                    // Populate Field Permissions table for selected object
                    populateCompareFieldPermissionsTable(selectedObject, fieldCompareMap);
                }
            });
        } else {
            //console.error('Error: objectNames is not an array or is undefined.');
        }

        // Populate User Data table if userData exists
        if (userDataCompare) {
            const userTableBody = document.getElementById('userCompareTable').getElementsByTagName('tbody')[0];
            userTableBody.innerHTML = "";
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${userDataCompare.fullName || 'N/A'}</td>
                <td>${userDataCompare.username || 'N/A'}</td>
                <td>${userDataCompare.email || 'N/A'}</td>
                <td>${userDataCompare.securityProfile || 'N/A'}</td>
            `;
            userTableBody.appendChild(row);
        }
    } else {
        console.error('Error: permissionsData is missing or malformed.');
    }

    if (combinedComparePermissions) {
    
        //------------------------------POPULATING THE TABS AND PAGE TABLES------------------------------
        compareTabsAndPages(combinedComparePermissions);
        // Function to populate tables
        function compareTabsAndPages(combinedComparePermissions) {
            // Log the permissions to verify
            //console.log("Using Combined Permissions:", combinedComparePermissions);
        
            //----------TABLE CONSTANTS---------
        
            // Get table bodies
            const tabCollectionsTable = document.querySelector("#compareTabCollections tbody");
            const tabsTable = document.querySelector("#compareTabs tbody");
            const pageTable = document.querySelector("#comparePages tbody");
            const mobileTable = document.querySelector("#compareMobileTabs tbody");
            
        
            //Processed Data for SubTables
            const processedCompareData = processSubTablesData(combinedComparePermissions);
        
            // Populate tables based on permissions
            combinedComparePermissions.forEach(permission => {
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
                    const TABLE_ID = "compareAllConfigTable"; // ID of the table
                    const NAME_COLUMN_TEXT = "configuration";
                    const ALL_PERMISSION = "all_configuration";
                    const READ_PERMISSION = "all_configuration_read";
                        
                    processTheAllTables(combinedComparePermissions, TABLE_ID, NAME_COLUMN_TEXT, ALL_PERMISSION, READ_PERMISSION);
                    populateCompareConfigurationSubTables(processedCompareData);
        
                //ADMIN TAB - DOMAIN ADMINISTRATION
                } else if (firstPart === "domain_administration") {
                    const TABLE_ID = "compareDomainTableAll"; // ID of the table
                    const NAME_COLUMN_TEXT = "domain_administration";
                    const ALL_PERMISSION = "all_domain_admin";
                    const READ_PERMISSION = "all_domain_admin_read";
                    const RESET_PASSWORD = "reset_all_passwords";

                    processTheAllTables(combinedComparePermissions, TABLE_ID, NAME_COLUMN_TEXT, ALL_PERMISSION, READ_PERMISSION, RESET_PASSWORD);
                    populateCompareDomainSubTables(processedCompareData);

                //ADMIN TAB - OPERATIONS
                } else if (firstPart === "operations") {
                    const TABLE_ID = "compareOperationsTableAll"; // ID of the table
                    const NAME_COLUMN_TEXT = "operations";
                    const ALL_PERMISSION = "all_operations";
                    const READ_PERMISSION = "all_operations_read";
        
                    processTheAllTables(combinedComparePermissions, TABLE_ID, NAME_COLUMN_TEXT, ALL_PERMISSION, READ_PERMISSION);
                    populateCompareOperationSubTables(processedCompareData);
        
                //ADMIN TAB - SECURITY
                } else if (firstPart === "security") {
                    const TABLE_ID = "compareSecurityTableAll"; // ID of the table
                    const NAME_COLUMN_TEXT = "security";
                    const ALL_PERMISSION = "all_security_admin";
                    const READ_PERMISSION = "all_security_read";
        
                    processTheAllTables(combinedComparePermissions, TABLE_ID, NAME_COLUMN_TEXT, ALL_PERMISSION, READ_PERMISSION);
                    populateCompareSecuritySubTables(processedCompareData);
        
                //ADMIN TAB - SETTINGS
                } else if (firstPart === "settings") {
                    const TABLE_ID = "compareSettingsTableAll"; // ID of the table
                    const NAME_COLUMN_TEXT = "settings";
                    const ALL_PERMISSION = "all_settings";
                    const READ_PERMISSION = "all_settings_read";
        
                    processTheAllTables(combinedComparePermissions, TABLE_ID, NAME_COLUMN_TEXT, ALL_PERMISSION, READ_PERMISSION);
                    populateCompareSettingsSubTables(processedCompareData);
        
                //ADMIN TAB - ABOUT
                } else if (firstPart === "about") {
                    populateCompareAboutSubTables(processedCompareData);
        
                //ADMIN TAB - DEPLOYMENT
                } else if (firstPart === "deployment") {
                    populateCompareDeploymentSubTables(processedCompareData);
        
                //APPLICATION TAB - VAULT ACTIONS
                } else if (firstPart === "vault_actions") {
                    const TABLE_ID = "compareVaultActionsTableAll"; // ID of the table
                    const NAME_COLUMN_TEXT = "vault_actions";
                    const ALL_PERMISSION = "all_vault_actions";
                        
                    processTheAllTables(combinedComparePermissions, TABLE_ID, NAME_COLUMN_TEXT, ALL_PERMISSION);
                    populateCompareVActionsSubTables(processedCompareData);

                //APPLICATION TAB - VAULT OWNER ACTIONS
                } else if (firstPart === "vault_owner_actions") {
                    const TABLE_ID = "compareVOActionsTableOne"; // ID of the table
                    const NAME_COLUMN_TEXT = "vault_owner_actions";
                    const columnOne = "rerender";
                    const columnTwo = "power_delete";
                    const columnThree = "vault_loader";
                    const columnFour = "record_migration";
                    const columnFive = "document_migration";
        
                    processVaultOwnerActions(combinedComparePermissions, TABLE_ID, NAME_COLUMN_TEXT, columnOne, columnTwo, columnThree, columnFour, columnFive);
                    populateCompareVOwnerActionsSubTables(processedCompareData);
        
                //APPLICATION TAB - CLIENT APPLICATIONS
                } else if (firstPart === "vault_client_applications") {
                    populateCompareClientAppsSubTables(processedCompareData);
                }
            });
        }
    }
    // Dispatch a custom event to notify the other script
    window.dispatchEvent(new Event('compareTablesFilled'));
    });


//------------------------------FUNCTIONS--------------------------------

// Function to clear table data
function clearTableData() {
    const objectTableCompareBody = document.getElementById('objectCompareTable').getElementsByTagName('tbody')[0];
    const fieldsTableCompareBody = document.getElementById('fieldsCompareTable').getElementsByTagName('tbody')[0];

    // Clear both tables
    objectTableCompareBody.innerHTML = '';
    fieldsTableCompareBody.innerHTML = '';
}

// Function to populate Object Permissions table
export function populateCompareObjectPermissionsTable(objectName, objectCompareMap) {
    const objectTableCompareBody = document.getElementById('objectCompareTable').getElementsByTagName('tbody')[0];

    if (objectCompareMap[objectName]) {
        objectCompareMap[objectName].forEach(permission => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${permission.objectType}</td>
                <td>${permission.read ? '✔️' : ''}</td>
                <td>${permission.create ? '✔️' : ''}</td>
                <td>${permission.edit ? '✔️' : ''}</td>
                <td>${permission.delete ? '✔️' : ''}</td>
            `;
            objectTableCompareBody.appendChild(row);
        });
    } else {
    }
}

// Function to populate Field Permissions table
export function populateCompareFieldPermissionsTable(objectName, fieldCompareMap) {
    const fieldsTableCompareBody = document.getElementById('fieldsCompareTable').getElementsByTagName('tbody')[0];

    if (fieldCompareMap[objectName]) {
        fieldCompareMap[objectName].forEach(field => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${field.fieldCompareName}</td>
                <td>${field.read ? '✔️' : ''}</td>
                <td>${field.edit ? '✔️' : ''}</td>
            `;
            fieldsTableCompareBody.appendChild(row);
        });
    } else {
        //console.error(`Error: No field permissions found for ${objectName}`);
    }
}

// Function to populate tables for the default object
function populateCompareTablesForObject(objectName, objectCompareMap, fieldCompareMap) {
    // Populate Object Permissions table for the first object
    populateCompareObjectPermissionsTable(objectName, objectCompareMap);

    // Populate Field Permissions table for the first object
    populateCompareFieldPermissionsTable(objectName, fieldCompareMap);
}

// CONFIGURATION - Function to handle dynamic table population
function populateCompareConfigurationSubTables(processedCompareData) {
    processedCompareData.forEach(({ firstPart, secondPart, permissions }) => {
        let stopProcessing = false;
        // If processing is already stopped, exit early
        if (stopProcessing) return;

        const tableName = "compareAllConfigTable"; 
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
                    "compareConfigTableOne",
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
                    "compareConfigTableTwo",
                    ["Read", "Create", "Edit", "Delete"], // Expected columns
                    firstPart,
                    secondPart,
                    augmentedPermissions,
                    ["read", "create", "edit", "delete"]
                );
                break;

            case ["business_admin_objects"].includes(secondPart):
                populateTable(
                    "compareConfigTableThree",
                    ["Read"], // Expected columns
                    firstPart,
                    secondPart,
                    permissions,
                    ["read"]
                );
                break;

            case ["logs"].includes(secondPart):
                populateTable(
                    "compareConfigTableFour",
                    ["All Audit", "System Audit", "Login Audit", "Document Audit", "Object Record Audit", "Domain Audit", "Vault Java SDK", "API Usage", "Collab Auth Error Logs"], // Expected columns
                    firstPart,
                    secondPart,
                    permissions,
                    ["all_audit", "system_audit", "login_audit", "document_audit", "object_record_audit", "domain_audit", "debug_log", "api_usage", "collab_auth_error_logs"]
                );
                break;

            case ["queues"].includes(secondPart):
                populateTable(
                    "compareConfigTableFive",
                    ["Read", "Create", "Edit", "Delete", "Queue Log"], // Expected columns
                    firstPart,
                    secondPart,
                    permissions,
                    ["read", "create", "edit", "delete", "queue_logs"]
                );
                break;
            
            case ["inbound_email_address"].includes(secondPart):
                populateTable(
                    "compareConfigTableSix",
                    ["Read", "Create", "Edit", "Delete", "Email Log", "Reprocess Emails", "Delete Emails"], // Expected columns
                    firstPart,
                    secondPart,
                    permissions,
                    ["read", "create", "edit", "delete", "view_email_log", "reprocess_email", "delete_email"]
                );
                break;

            case ["mobile_setup"].includes(secondPart):
                populateTable(
                    "compareConfigTableSeven",
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
function populateCompareDomainSubTables(processedCompareData) {
    processedCompareData.forEach(({ firstPart, secondPart, permissions }) => {
        let stopProcessing = false;
        // If processing is already stopped, exit early
        if (stopProcessing) return;

        const tableName = "compareDomainTableAll"; 
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
                    "compareDomainTableOne",
                    ["Read", "Edit"], // Expected columns
                    firstPart,
                    secondPart,
                    permissions,
                    ["read", "edit"]
                );
                break;

            case ["security_policies"].includes(secondPart):
                populateTable(
                    "compareDomainTableTwo",
                    ["Read", "Create", "Edit"], // Expected columns
                    firstPart,
                    secondPart,
                    permissions,
                    ["read", "create", "edit"]
                );
                break;

            case ["network_access_rules"].includes(secondPart):
                populateTable(
                    "compareDomainTableThree",
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
function populateCompareOperationSubTables(processedCompareData) {
    processedCompareData.forEach(({ firstPart, secondPart, permissions }) => {
        let stopProcessing = false;
        // If processing is already stopped, exit early
        if (stopProcessing) return;

        const tableName = "compareOperationsTableAll"; 
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
                    "compareOperationsTableOne",
                    ["Read", "Create", "Edit", "Delete", "Interact", "Manage SDK Job Metadata"], // Expected columns
                    firstPart,
                    secondPart,
                    permissions,
                    ["read", "create", "edit", "delete", "interact", "manage_sdk_job_metadata"]
                );
                break;

            case ["renditions"].includes(secondPart):
                populateTable(
                    "compareOperationsTableTwo",
                    ["Read"], // Expected columns
                    firstPart,
                    secondPart,
                    permissions,
                    ["read"]
                );
                break;

            case ["sdk_job_queues"].includes(secondPart):
                populateTable(
                    "compareOperationsTableThree",
                    ["Read", "Create", "Edit", "Delete"], // Expected columns
                    firstPart,
                    secondPart,
                    permissions,
                    ["read", "create", "edit", "delete"]
                );
                break;

            case ["email_notification_status"].includes(secondPart):
                populateTable(
                    "compareOperationsTableFour",
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
function populateCompareSecuritySubTables(processedCompareData) {
    processedCompareData.forEach(({ firstPart, secondPart, permissions }) => {
        let stopProcessing = false;
        // If processing is already stopped, exit early
        if (stopProcessing) return;

        const tableName = "compareSecurityTableAll"; 
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
                    "compareSecurityTableOne",
                    ["Read", "Edit"], // Expected columns
                    firstPart,
                    secondPart,
                    permissions,
                    ["read", "edit"]
                );
                break;

            case ["users"].includes(secondPart):
                populateTable(
                    "compareSecurityTableTwo",
                    ["Read", "Create", "Edit", "Assign Group", "Grant Support Login", "Delegate Admin", "Add Cross-Domain Users", "Manage User Object"], // Expected columns
                    firstPart,
                    secondPart,
                    permissions,
                    ["read", "create", "edit", "assign_group", "grant_login_as", "grant_delegate_access", "add_cross_domain_users", "manage_user_object"]
                );
                break;

            case ["groups", "security_profiles"].includes(secondPart):
                populateTable(
                    "compareSecurityTableThree",
                    ["Read", "Create", "Edit", "Delete", "Assign Users"], // Expected columns
                    firstPart,
                    secondPart,
                    permissions,
                    ["read", "create", "edit", "delete", "assign_users"]
                );
                break;

            case ["permission_sets"].includes(secondPart):
                populateTable(
                    "compareSecurityTableFour",
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
function populateCompareSettingsSubTables(processedCompareData) {
    processedCompareData.forEach(({ firstPart, secondPart, permissions }) => {
        let stopProcessing = false;
        // If processing is already stopped, exit early
        if (stopProcessing) return;

        const tableName = "compareSettingsTableAll"; 
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
                    "compareSettingsTableOne",
                    ["Read", "Edit"], // Expected columns
                    firstPart,
                    secondPart,
                    permissions,
                    ["read", "edit"]
                );
                break;

            case ["renditions"].includes(secondPart):
                populateTable(
                    "compareSettingsTableTwo",
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
function populateCompareAboutSubTables(processedCompareData) {
    processedCompareData.forEach(({ firstPart, secondPart, permissions }) => {
        if (firstPart !== "about") {
            return; // Skip entries with unexpected firstPart
        }

        // Handle tables based on the secondPart
        switch (true) {
            case ["general_information", "domain_information"].includes(secondPart):
                populateTable(
                    "compareAboutTable",
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
function populateCompareDeploymentSubTables(processedCompareData) {
    processedCompareData.forEach(({ firstPart, secondPart, permissions }) => {
        if (firstPart !== "deployment") {
            return; // Skip entries with unexpected firstPart
        }

        // Handle tables based on the secondPart
        switch (true) {
            case ["migration_packages"].includes(secondPart):
                populateTable(
                    "compareDeploymentTableOne",
                    ["Create", "Deploy"], // Expected columns
                    firstPart,
                    secondPart,
                    permissions,
                    ["create", "deploy"]
                );
                break;

            case ["environment"].includes(secondPart):
                populateTable(
                    "compareDeploymentTableTwo",
                    ["Vault Configuration Report", "Vault Comparison"], // Expected columns
                    firstPart,
                    secondPart,
                    permissions,
                    ["config_report", "vault_compare"]
                );
                break;

            case ["sandbox_self_service", "sandbox_snapshot"].includes(secondPart):
                populateTable(
                    "compareDeploymentTableThree",
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
function populateCompareVActionsSubTables(processedCompareData) {

    processedCompareData.forEach(({ firstPart, secondPart, permissions }) => {
        let stopProcessing = false; // Flag to stop all further processing
        // If processing is already stopped, exit early
        if (stopProcessing) return;

        const tableName = "compareVaultActionsTableAll"; 
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
                    "compareVaultActionsTableOne",
                    ["All", "Read Dashboards and Reports", "Create Dashboards", "Delete Dashboards", "Share Dashboards", "Schedule Reports", "Administer Dashboards", "Display API Name Dashboards", "Read Group Membership"], // Expected columns
                    firstPart,
                    secondPart,
                    permissions,
                    ["all_reports", "read_run_reports", "create", "delete", "share", "schedule", "administer", "display_public_key","read_group_membership"]
                );
                break;

            case ["workflow"].includes(secondPart):
                populateTable(
                    "compareVaultActionsTableTwo",
                    ["All Workflow", "Start", "Participate", "Read and Understand", "eSignature", "Query"], // Expected columns
                    firstPart,
                    secondPart,
                    permissions,
                    ["all_workflow", "start", "participate", "read_understand", "e_sig", "query"]
                );
                break;

            case ["workflow_administration"].includes(secondPart):
                populateTable(
                    "compareVaultActionsTableThree",
                    ["All Workflow Admin", "Cancel", "View Active", "Reassign", "Update Participants", "Email Participants", "Update Workflow Dates", "Replace Workflow Owner"], // Expected columns
                    firstPart,
                    secondPart,
                    permissions,
                    ["all_workflow_admin", "cancel", "view_active", "reassign", "add_participant", "email_participants", "update_workflow_dates", "replace_workflow_owner"]
                );
                break;

            case ["api"].includes(secondPart):
                populateTable(
                    "compareVaultActionsTableFour",
                    ["All API", "Access API", "Events API", "Metadata API"], // Expected columns
                    firstPart,
                    secondPart,
                    permissions,
                    ["all_api", "access_api", "events_api", "metadata_api"]
                );
                break;

            case ["crosslink"].includes(secondPart):
                populateTable(
                    "compareVaultActionsTableFive",
                    ["Create CrossLink"], // Expected columns
                    firstPart,
                    secondPart,
                    permissions,
                    ["create_crosslink"]
                );
                break;

            case ["viewer_administration"].includes(secondPart):
                populateTable(
                    "compareVaultActionsTableSix",
                    ["Manage Tags", "Merge Anchors", "Remove Annotations", "Manage Anchors"], // Expected columns
                    firstPart,
                    secondPart,
                    permissions,
                    ["manage_tags", "merge_anchors", "remove_annotations", "manage_anchors"]
                );
                break;

            case ["document"].includes(secondPart):
                populateTable(
                    "compareVaultActionsTableSeven",
                    ["Cancel Checkout", "Download Document", "Download Rendition", "Bulk Delete", "Bulk Update", "Always Allow Unclassified", "Vault File Manager", "Download Non-Protected Rendition"], // Expected columns
                    firstPart,
                    secondPart,
                    permissions,
                    ["cancel_checkout", "download_document", "download_rendition", "bulk_delete", "bulk_update", "upload_unclassified", "checkout_to_client", "download_non_protected_rendition"]
                );
                break;

            case ["object"].includes(secondPart):
                populateTable(
                    "compareVaultActionsTableEight",
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
                    "compareVaultActionsRIMOne",
                    ["XEVMPD Bulk Update", "XEVPRM Bulk Submit"], // Expected columns
                    firstPart,
                    secondPart,
                    permissions,
                    ["xevmpd_bulk_update", "xevprm_bulk_submit"]
                );
                break;   

            case ["user"].includes(secondPart):
                populateTable(
                    "compareVaultActionsTableNine",
                    ["Allow As A Delegate", "View User Information", "View User Profile"], // Expected columns
                    firstPart,
                    secondPart,
                    permissions,
                    ["allow_as_delegate", "view_user_identities", "view_user_profile"]
                );
                break;

            case ["search"].includes(secondPart):
                populateTable(
                    "compareVaultActionsTableTen",
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
                    "compareVaultActionsPromomats",
                    ["Send to CDN", "Approved Email", "Multichannel Loader"], // Expected columns
                    firstPart,
                    secondPart,
                    permissions,
                    ["send_to_cdn", "approved_email", "multichannel_loader"]
                );
                break;

            case ["views"].includes(secondPart):
                populateTable(
                    "compareVaultActionsTableEleven",
                    ["Share Views", "Make Mandatory"], // Expected columns
                    firstPart,
                    secondPart,
                    permissions,
                    ["share_views", "make_share_mandatory"]
                );
                break;

            case ["audit_trail"].includes(secondPart):
                populateTable(
                    "compareVaultActionsTableTwelve",
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
                    "compareVaultActionsRIMTwo",
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
                    "compareVaultActionsRIMThree",
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
                    "compareVaultActionsRIMFour",
                    ["Bulk Registration History Report"], // Expected columns
                    firstPart,
                    secondPart,
                    permissions,
                    ["bulk_registration_history_report"]
                );
                break;

            case ["ftp_staging"].includes(secondPart):
                populateTable(
                    "compareVaultActionsTableThirteen",
                    ["Access", "Access via Vault File Manager"], // Expected columns
                    firstPart,
                    secondPart,
                    permissions,
                    ["ftp_access", "fsa_vaultfilemanager"]
                );
                break;

            case ["edl_matching"].includes(secondPart):
                populateTable(
                    "compareVaultActionsTableFourteen",
                    ["Run", "Edit Match Fields", "Edit Document Matches"], // Expected columns
                    firstPart,
                    secondPart,
                    permissions,
                    ["edl_run", "edl_edit_match_fields", "edl_edit_document_matches"]
                );
                break;

            case ["connections"].includes(secondPart):
                populateTable(
                    "compareVaultActionsTableFifteen",
                    ["Manage Connections"], // Expected columns
                    firstPart,
                    secondPart,
                    permissions,
                    ["manage_connections"]
                );
                break;

            case ["integrations"].includes(secondPart):
                populateTable(
                    "compareVaultActionsTableSixteen",
                    ["Manage Integrations"], // Expected columns
                    firstPart,
                    secondPart,
                    permissions,
                    ["manage_integrations"]
                );
                break;

            case ["create_button"].includes(secondPart):
                populateTable(
                    "compareVaultActionsTableSeventeen",
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
function populateCompareVOwnerActionsSubTables(processedCompareData) {
    processedCompareData.forEach(({ firstPart, secondPart, permissions }) => {
        if (firstPart !== "vault_owner_actions") {
            return; // Skip entries with unexpected firstPart
        }

        // Handle tables based on the secondPart
        switch (true) {
            case ["all_documents"].includes(secondPart):
                populateTable(
                    "compareVOActionsTableTwo",
                    ["All Document Actions", "All Document Read", "All Document Create"], // Expected columns
                    firstPart,
                    secondPart,
                    permissions,
                    ["all_document_actions", "all_document_read", "all_document_create"]
                );
                break;

            case ["all_object_records"].includes(secondPart):
                populateTable(
                    "compareVOActionsTableThree",
                    ["All Object Record Actions", "All Object Record Read", "All Object Record Edit", "All Object Record Delete"], // Expected columns
                    firstPart,
                    secondPart,
                    permissions,
                    ["all_object_record_actions", "all_object_record_read", "all_object_record_edit", "all_object_record_delete"]
                );
                break;

            case ["legal_hold"].includes(secondPart):
                populateTable(
                    "compareVOActionsTableFour",
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
function populateCompareClientAppsSubTables(processedCompareData) {
    processedCompareData.forEach(({ firstPart, secondPart, permissions }) => {
        if (firstPart !== "vault_client_applications") {
            return; // Skip entries with unexpected firstPart
        }

        // Handle tables based on the secondPart
        switch (true) {
            case ["veeva_snap"].includes(secondPart):
                populateTable(
                    "compareCAActionsTableOne",
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
