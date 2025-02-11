document.getElementById('apiForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Submitter to differentiate if it's the 'Get Permissions' button or the 'Show My Permission' button
    const submitter = event.submitter;
    const userIdInput = document.getElementById('userId').value;
    const userIdCompareInput = document.getElementById('userIdCompare').value;

    // Get the loading icon and submit button elements
    const loadingIcon = document.getElementById("loadingIcon");
    const submitButton = document.getElementById("submitButton");
    const submitButtonCompare = document.getElementById("submitButtonCompare");
    const submitMyPermission = document.getElementById("submitMyPermission");

    if (submitter.id === 'submitButtonCompare') {

        if (!userIdCompareInput || !userIdInput) {
            return; // Stop form submission if at least one of the user fields are empty
        }

        // Check if userId and userIdCompare have the same value
        if (userIdInput === userIdCompareInput) {
            return; // Stop form submission if they are the same
        }
    } else if (submitter.id === 'submitButton') {
        
        if (!userIdInput) {
            alert('Error: User ID is required for this action.');
            return; // Stop form submission if the User ID is empty
        }
    }

    // Show the loading icon and disable the submit button
    loadingIcon.style.display = "inline";
    submitButton.disabled = true;
    submitButtonCompare.disabled = true;
    submitMyPermission.disabled = true;

    // Get values from the form
    const sessionId = document.getElementById('sessionId').value;
    const dns = document.getElementById('dns').value;
    const apiVersion = document.getElementById('apiVersion').value;

    let userId;
    // For "Show My Permission", the userId should be "me" to correctly call the API
    if (submitter.id === 'submitMyPermission') {
        userId = "me";
    } else {
        userId = document.getElementById('userId').value;
    }

    //------------------------------OLS-FLS PERMISSION------------------------------

    try {
        // Send POST request to the API proxy endpoint
        const response = await fetch('/api/proxy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionId, dns, apiVersion, userId })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseData = await response.json();
        //console.log('Received Data:', responseData);

        // Process permission data
        const items = responseData.data || [];
        const objectNames = new Set();
        const fieldMap = {};
        const objectMap = {};

        items.forEach(item => {
            const nameParts = item.name__v.split('.');
            if (nameParts.length >= 2) {
                const objectName = nameParts[1];
                const fieldName = nameParts[2];
                const actionNames = nameParts[3];
                const permissions = item.permissions;

                objectNames.add(objectName);

                if (actionNames === 'field_actions') {
                    if (!fieldMap[objectName]) {
                        fieldMap[objectName] = [];
                    }
                    fieldMap[objectName].push({
                        fieldName: fieldName,
                        read: permissions.read,
                        edit: permissions.edit
                    });
                } else if (actionNames === 'object_actions' || fieldName === 'object_actions' ) {
                    if (!objectMap[objectName]) {
                        objectMap[objectName] = [];
                    }
                    objectMap[objectName].push({
                        objectType: actionNames === 'object_actions' ? fieldName : objectName,
                        create: permissions.create || false,
                        read: permissions.read || false,
                        edit: permissions.edit || false,
                        delete: permissions.delete || false
                    });
                }
            }
        });

        //------------------------------USER DETAIL------------------------------
        // Send POST request to get user details
        const userResponse = await fetch('/api/getUserDetails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionId, dns, apiVersion, userId })
        });

        if (!userResponse.ok) {
            throw new Error(`HTTP error! Status: ${userResponse.status}`);
        }

        const userData = await userResponse.json();
        //console.log('Received User Data:', userData);

        const securityProfile = userData.securityProfile;
        //console.log(securityProfile);

        //------------------------------PERMISSION SETS------------------------------
        // Send POST request to get permission sets
        const permsetResponse = await fetch('/api/getPermissionSets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionId, dns, securityProfile })
        });

        if (!permsetResponse.ok) {
            throw new Error(`HTTP error! Status: ${permsetResponse.status}`);
        }

        const permsetData = await permsetResponse.json();
        //console.log('Received Security Profile Data:', permsetData);

        // Extracting permission sets using regex
        const matches = permsetData.match(/permission_sets\s*\(([^)]+)\)/);

        let permissionSetsArray = [];
        if (matches && matches[1]) {
            // Split the matched string into an array, removing quotes and spaces
            permissionSetsArray = matches[1]
                .split(',')
                .map(perm => perm.trim().replace(/['"]+/g, ''));
        }

        //console.log(permissionSetsArray);

        //------------------------------PERMISSIONS WITHOUT THE OBJECT------------------------------
        // Send POST request to get permissions from all the Permission Sets
        const responsePerm = await fetch('/api/getPermissions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId, dns, permissionSetsArray })
        });

        if (!responsePerm.ok) {
            throw new Error(`HTTP error! Status: ${responsePerm.status}`);
        }

        // Parse the JSON response
        const permissionsResults = await responsePerm.json();
        //console.log('Raw Permissions Results:', permissionsResults);

        // Combine permissions
        const combinedPermissionsSet = new Set(); // Use a Set to ensure uniqueness
        permissionsResults.forEach(({ permissions }) => {
            if (typeof permissions === 'string') {
                const splitPermissions = permissions
                    .replace(/\s*\n\s*/g, '') // Remove \n and extra spaces around it
                    .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
                    .split('),')
                    .map(permission => permission.trim() + (permission.endsWith(')') ? '' : ')'));
                splitPermissions.forEach(permission => combinedPermissionsSet.add(permission));
            } else if (Array.isArray(permissions)) {
                permissions.forEach(permission => combinedPermissionsSet.add(permission.trim()));
            }
        });

        // Convert Set to Array and filter out "object.*" entries
        const combinedPermissions = Array.from(combinedPermissionsSet).filter(permission => {
            return !permission.startsWith('object.');
        });

        const permissionsData = { 
            objectNames: Array.from(objectNames), 
            fieldMap, 
            objectMap 
        };

       //------------------------------SESSION STORAGE------------------------------

        // Store the data in sessionStorage for use on the next page
        sessionStorage.setItem('permissionsData', JSON.stringify({ objectNames: Array.from(objectNames), fieldMap, objectMap }));
        sessionStorage.setItem('userData', JSON.stringify(userData));
        sessionStorage.setItem('combinedPermissions', JSON.stringify(combinedPermissions));

        // Dispatch a custom event to notify the other script
         window.dispatchEvent(new Event('dataStored'));

    } catch (error) {
        console.error('Error:', error);
        alert(error);
        return;
    } finally {
        if (submitter.id !== 'submitButtonCompare') {
        // Hide the loading icon and re-enable the submit buttons
        loadingIcon.style.display = "none";
        submitButton.disabled = false;
        submitMyPermission.disabled = false;
        submitButtonCompare.disabled = false;
        }
    }
});