document.getElementById('apiForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Get values from the form
    const sessionId = document.getElementById('sessionId').value;
    const dns = document.getElementById('dns').value;
    const apiVersion = document.getElementById('apiVersion').value;
    const userIdCompare = document.getElementById('userIdCompare').value;

//COMPARE PERMISSIONS
//Submitter  to differentiate if it's the 'Get Permissions' button or the 'Compare Permissions'
    const submitter = event.submitter;
    const userIdInput = document.getElementById('userId').value;
    const userIdCompareInput = document.getElementById('userIdCompare').value;
    
    if (submitter.id === 'submitButtonCompare') {

        if (!userIdCompareInput || !userIdInput) {
            alert('Error: User IDs to compare are required for this action.');
            return; // Stop form submission if at least one of the user fields are empty
        }

        // Check if userId and userIdCompare have the same value
        if (userIdInput === userIdCompareInput) {
            alert('Error: User ID and User ID 2 cannot be the same.');
            return; // Stop form submission if they are the same
        }

        document.querySelectorAll('.compare-container').forEach(container => {
          container.classList.remove('d-none');
        });  

        try {
            // Send POST request to Express server's proxy endpoint
const response = await fetch("/api/proxySecondUser", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sessionId, dns, apiVersion, userIdCompare }),
  });

  // Parse the JSON response
  const responseData = await response.json();
  //console.log("Received Data:", responseData);

  // Extract 'data' from the response
  const items = responseData.data || [];

  // Separate data for object and field permissions
  const objectNames = new Set(); // Unique object names
  const fieldCompareMap = {}; // Field permissions for each object
  const objectCompareMap = {}; // Object permissions for each object

  items.forEach((item) => {
    const nameParts = item.name__v.split("."); // Split by dots
    if (nameParts.length >= 2) {
      const objectName = nameParts[1]; // Object name (e.g., account__v)
      const fieldCompareName = nameParts[2]; // Field name or object type
      const actionCompareNames = nameParts[3]; // Action type (field_actions or object_actions)
      const permissions = item.permissions;

      // Store unique object names
      objectNames.add(objectName);

      // Separate field permissions and object permissions
      if (actionCompareNames === "field_actions") {
        // Map field permissions to each object
        if (!fieldCompareMap[objectName]) {
          fieldCompareMap[objectName] = [];
        }
        fieldCompareMap[objectName].push({
          fieldCompareName: fieldCompareName,
          read: permissions.read,
          edit: permissions.edit,
        });
      } else if (actionCompareNames === "object_actions") {
        // If the objectName does not exist in the objectCompareMap, initialize an empty array
        if (!objectCompareMap[objectName]) {
          objectCompareMap[objectName] = [];
        }

        // Push a new object containing the fieldCompareName (objectType) and CRUD permissions into the array
        objectCompareMap[objectName].push({
          objectType: fieldCompareName,
          create: permissions.create || false,
          read: permissions.read || false,
          edit: permissions.edit || false,
          delete: permissions.delete || false,
        });
      }
    }
  });

  const userResponse = await fetch("/api/getSecondUserDetails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sessionId, dns, apiVersion, userIdCompare }), // Send the userId in the request body
  });

  // Check if the response is successful
  if (!userResponse.ok) {
    throw new Error(`HTTP error! Status: ${userResponse.status}`);
  }

  // Parse the JSON response
  const userData = await userResponse.json();
  //console.log("Received User Data:", userData);

  const securityProfileCompare = userData.securityProfile;
  //console.log(securityProfileCompare);

  //------------------------------PERMISSION SETS------------------------------
        // Send POST request to get permission sets
        const permsetResponse = await fetch('/api/getComparePermissionSets', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ sessionId, dns, securityProfileCompare })
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
          permissionSetsCompareArray = matches[1]
              .split(',')
              .map(perm => perm.trim().replace(/['"]+/g, ''));
      }

      //console.log(permissionSetsCompareArray);

    //------------------------------PERMISSIONS WITHOUT THE OBJECT------------------------------
        // Send POST request to get permissions from all the Permission Sets
        const responsePerm = await fetch('/api/getComparePermissions', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId, dns, permissionSetsCompareArray })
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
      const combinedComparePermissions = Array.from(combinedPermissionsSet).filter(permission => {
          return !permission.startsWith('object.');
      });

      const permissionsDataCompare = { 
          objectNames: Array.from(objectNames), 
          fieldCompareMap, 
          objectCompareMap 
      };

  //-----------------------SESSION STORAGE----------------------

  // Store the data in sessionStorage for use on the next page
  sessionStorage.setItem('permissionsDataCompare', JSON.stringify({ objectNames: Array.from(objectNames), fieldCompareMap, objectCompareMap }));
  sessionStorage.setItem('userDataCompare', JSON.stringify(userData));
  sessionStorage.setItem('combinedComparePermissions', JSON.stringify(combinedComparePermissions));

  // Dispatch a custom event to notify the other script
  window.dispatchEvent(new Event('compareDataStored'));

        } catch (error) {
            console.error('Error:', error);
            alert(error);
            return;
        } finally {
        }
  
} else {
  document.querySelectorAll('.compare-container').forEach(container => {
    container.classList.add('d-none');
  }); 
}
});

        