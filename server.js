const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

// Enable CORS for all routes
app.use(cors());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Parse JSON bodies
app.use(express.json());


// Proxy API endpoint
app.post("/api/proxy", async (req, res) => {
  const { sessionId, dns, apiVersion, userId } = req.body;

  // Construct the URL
  const url = `https://${dns}/api/${apiVersion}/objects/users/${userId}/permissions`;

  console.log(url);

  try {
    // Make the API request with axios
    const response = await axios.get(url, {
      headers: {
        Authorization: sessionId,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    // Send back the JSON response from the API
    res.json(response.data);
  } catch (error) {
    console.error("Error calling the API:", error.message);
    res.status(error.response ? error.response.status : 500).json({
      message: "Error calling the API",
      error: error.message,
    });
  }
});

// Proxy API endpoint
app.post("/api/getUserDetails", async (req, res) => {
  const { sessionId, dns, apiVersion, userId } = req.body;

  // Construct the URL
  const url = `https://${dns}/api/${apiVersion}/objects/users/${userId}`;

  console.log(url);

  try {
    // Make the API request with axios
    const response = await axios.get(url, {
      headers: {
        Authorization: sessionId,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    // Access the 'users' array from the response
    const users = response.data.users;

    // Check if users array exists
    if (!users || users.length === 0) {
      console.error("No user data found in API response.");
      return res.status(500).send("No user data found in API response.");
    }

    const user = users[0].user;

    const userDetails = {
      fullName:
        (user.user_first_name__v || "N/A") +
        " " +
        (user.user_last_name__v || "N/A"),
      username: user.user_name__v || "N/A",
      email: user.user_email__v || "N/A",
      securityProfile: user.security_profile__v || "N/A",
    };

    res.json(userDetails);
  } catch (error) {
    console.error("Error calling the API:", error.message);
    res.status(error.response ? error.response.status : 500).json({
      message: "Error calling the API",
      error: error.message,
    });
  }
});

  //GET PERMISSION SETS - MDL

  // Proxy API endpoint
app.post("/api/getPermissionSets", async (req, res) => {
  const { sessionId, dns, securityProfile } = req.body;

  // Construct the URL
  const url = `https://${dns}/api/mdl/components/Securityprofile.${securityProfile}`;

  console.log(url);

  try {
    // Make the API request with axios
    const response = await axios.get(url, {
      headers: {
        Authorization: sessionId,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    // Send back the JSON response from the API
    res.json(response.data);
  } catch (error) {
    console.error("Error calling the API:", error.message);
    res.status(error.response ? error.response.status : 500).json({
      message: "Error calling the API",
      error: error.message,
    });
  }
});

//GET PERMISSIONS FROM THE PERMISSION SETS

// Proxy API endpoint
app.post("/api/getPermissions", async (req, res) => {
  const { sessionId, dns, permissionSetsArray } = req.body;

  if (!sessionId || !dns || !Array.isArray(permissionSetsArray)) {
      return res.status(400).json({ message: "Invalid input" });
  }

  // Construct the URL
  const url = `https://${dns}/api/mdl/components/Permissionset`;
  const uniquePermissions = new Set();

  try {
  // Use a Set to store unique permissions
  const permissionsResults = [];

  // Loop through each permission set and make an API call
  for (const permissionSet of permissionSetsArray) {
      console.log(`Calling external API for permission set: ${permissionSet}`);
    // Make the API request with axios
    const response = await axios.get(`${url}.${permissionSet}`, {
      headers: {
        Authorization: sessionId,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    // Log the response data for debugging
    //console.log('API Response for', permissionSet, response.data);
    // Add the permission set data to the results
    permissionsResults.push({
      permissionSet,
      permissions: response.data || [],
  });
  }

   // Send the array of results for all permission sets back to the client
  //console.log('Final permissions data sent to client:', permissionsResults);
  res.json(permissionsResults);

  } catch (error) {
    console.error("Error calling the API:", error.message);
    res.status(error.response ? error.response.status : 500).json({
      message: "Error calling the API",
      error: error.message,
    });
  }
});


//---------------------------------------------------------------------------------
// COMPARISON

// Proxy API endpoint
app.post("/api/proxySecondUser", async (req, res) => {
  const { sessionId, dns, apiVersion, userIdCompare } = req.body;

  // Construct the URL
  const url = `https://${dns}/api/${apiVersion}/objects/users/${userIdCompare}/permissions`;

  console.log(url);

  try {
    // Make the API request with axios
    const response = await axios.get(url, {
      headers: {
        Authorization: sessionId,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    // Send back the JSON response from the API
    res.json(response.data);
  } catch (error) {
    console.error("Error calling the API:", error.message);
    res.status(error.response ? error.response.status : 500).json({
      message: "Error calling the API",
      error: error.message,
    });
  }
});

// Proxy API endpoint
app.post("/api/getSecondUserDetails", async (req, res) => {
  const { sessionId, dns, apiVersion, userIdCompare } = req.body;

  // Construct the URL
  const url = `https://${dns}/api/${apiVersion}/objects/users/${userIdCompare}`;

  console.log(url);

  try {
    // Make the API request with axios
    const response = await axios.get(url, {
      headers: {
        Authorization: sessionId,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    // Access the 'users' array from the response
    const users = response.data.users;

    // Check if users array exists
    if (!users || users.length === 0) {
      console.error("No user data found in API response.");
      return res.status(500).send("No user data found in API response.");
    }

    const user = users[0].user;

    const userDetails = {
      fullName:
        (user.user_first_name__v || "N/A") +
        " " +
        (user.user_last_name__v || "N/A"),
      username: user.user_name__v || "N/A",
      email: user.user_email__v || "N/A",
      securityProfile: user.security_profile__v || "N/A",
    };

    res.json(userDetails);
  } catch (error) {
    console.error("Error calling the API:", error.message);
    res.status(error.response ? error.response.status : 500).json({
      message: "Error calling the API",
      error: error.message,
    });
  }
});

//GET PERMISSION SETS - MDL - COMPARE

  // Proxy API endpoint
  app.post("/api/getComparePermissionSets", async (req, res) => {
    const { sessionId, dns, securityProfileCompare } = req.body;
  
    // Construct the URL
    const url = `https://${dns}/api/mdl/components/Securityprofile.${securityProfileCompare}`;
  
    console.log(url);
  
    try {
      // Make the API request with axios
      const response = await axios.get(url, {
        headers: {
          Authorization: sessionId,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
  
      // Send back the JSON response from the API
      res.json(response.data);
    } catch (error) {
      console.error("Error calling the API:", error.message);
      res.status(error.response ? error.response.status : 500).json({
        message: "Error calling the API",
        error: error.message,
      });
    }
  });

  //GET PERMISSIONS FROM THE PERMISSION SETS - COMPARE

// Proxy API endpoint
app.post("/api/getComparePermissions", async (req, res) => {
  const { sessionId, dns, permissionSetsCompareArray } = req.body;

  if (!sessionId || !dns || !Array.isArray(permissionSetsCompareArray)) {
      return res.status(400).json({ message: "Invalid input" });
  }

  // Construct the URL
  const url = `https://${dns}/api/mdl/components/Permissionset`;
  const uniquePermissions = new Set();

  try {
  // Use a Set to store unique permissions
  const permissionsResults = [];

  // Loop through each permission set and make an API call
  for (const permissionSet of permissionSetsCompareArray) {
      console.log(`Calling external API for permission set: ${permissionSet}`);
    // Make the API request with axios
    const response = await axios.get(`${url}.${permissionSet}`, {
      headers: {
        Authorization: sessionId,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    // Log the response data for debugging
    //console.log('API Response for', permissionSet, response.data);
    // Add the permission set data to the results
    permissionsResults.push({
      permissionSet,
      permissions: response.data || [],
  });
  }

   // Send the array of results for all permission sets back to the client
  //console.log('Final permissions data sent to client:', permissionsResults);
  res.json(permissionsResults);

  } catch (error) {
    console.error("Error calling the API:", error.message);
    res.status(error.response ? error.response.status : 500).json({
      message: "Error calling the API",
      error: error.message,
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
