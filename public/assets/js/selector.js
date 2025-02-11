//This script is for the object selector to fill the two tables in the compare page simultaneously

import { populateObjectPermissionsTable, populateFieldPermissionsTable } from "./fillTables.js";
import { populateCompareObjectPermissionsTable, populateCompareFieldPermissionsTable } from "./fillCompareTables.js";

let fillTablesTriggered = false;
let fillCompareTablesTriggered = false;

function checkBothEvents() {
  if (fillTablesTriggered && fillCompareTablesTriggered) {
  const objectNamesDropdown = document.getElementById("objectNames");

  // Retrieve data from sessionStorage for both sets
  const permissionsData = JSON.parse(sessionStorage.getItem("permissionsData"));
  const permissionsDataCompare = JSON.parse(sessionStorage.getItem("permissionsDataCompare"));

  if (permissionsData && permissionsDataCompare) {
    const { objectNames, fieldMap, objectMap } = permissionsData;
    const { fieldCompareMap, objectCompareMap } = permissionsDataCompare;

    if (Array.isArray(objectNames) && objectNames.length) {
      // Populate dropdown options
      objectNamesDropdown.innerHTML = "";

      objectNames.forEach((name, index) => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        objectNamesDropdown.appendChild(option);

        if (index === 0) option.selected = true;
      });

      // Function to clear specific tables
      function clearTableData(tableId) {
        const tableBody = document.getElementById(tableId).getElementsByTagName("tbody")[0];
        tableBody.innerHTML = ''; // Clear all rows in specified table body
      }


      // Listen for dropdown changes to update both table sets
      objectNamesDropdown.addEventListener("change", () => {
        const selectedObject = objectNamesDropdown.value;
        if (selectedObject) {
          clearTableData('objectTable');
          clearTableData('fieldsTable');
          clearTableData('objectCompareTable');
          clearTableData('fieldsCompareTable');

          populateObjectPermissionsTable(selectedObject, objectMap);
          populateFieldPermissionsTable(selectedObject, fieldMap);
          populateCompareObjectPermissionsTable(selectedObject, objectCompareMap);
          populateCompareFieldPermissionsTable(selectedObject, fieldCompareMap);

          highlightDifferencesInTables([
            { primaryTableId: 'objectTable', compareTableId: 'objectCompareTable' },
            { primaryTableId: 'fieldsTable', compareTableId: 'fieldsCompareTable' }
          ],1
          );
        }
      });

    }
  } else {
    console.error("Error: permissionsData or permissionsDataCompare is missing or malformed.");
  }

  // Function to highlight differences between paired tables
function highlightDifferencesInTables(tablePairs, startColumn = 1) {
  // Check if any compare-container has the 'd-none' class
  const compareContainers = document.querySelectorAll('.compare-container');
  const isHidden = Array.from(compareContainers).some(container => container.classList.contains('d-none'));

  if (isHidden) {
    return; // Exit the function if any compare-container is hidden
  }

  tablePairs.forEach(pair => {
    const primaryTable = document.getElementById(pair.primaryTableId);
    const compareTable = document.getElementById(pair.compareTableId);

    if (!primaryTable || !compareTable) {
      return;
    }

    const primaryRows = primaryTable.getElementsByTagName("tr");
    const compareRows = compareTable.getElementsByTagName("tr");

    const primaryFirstValue = primaryRows[0].cells[0]?.textContent.trim();
    const compareFirstValue = compareRows[0].cells[0]?.textContent.trim();

    // Only proceed if the very first values of both tables are the same
    if (primaryFirstValue !== compareFirstValue) {
      return;
    }

    // Loop through rows, skipping the header row (index 0)
    for (let i = 1; i < primaryRows.length; i++) {
      const primaryRow = primaryRows[i];
      const compareRow = compareRows[i];

      if (!primaryRow || !compareRow) {
        continue;
      }

      // Loop through columns
      const cellCount = Math.max(primaryRow.cells.length, compareRow.cells.length);
      for (let colIndex = startColumn; colIndex < cellCount; colIndex++) {
        const primaryCell = primaryRow.cells[colIndex];
        const compareCell = compareRow.cells[colIndex];

        if (!primaryCell || !compareCell) {
          continue;
        }

        // Compare cell contents
        const primaryValue = primaryCell.textContent.trim();
        const compareValue = compareCell.textContent.trim();

        if (primaryValue !== compareValue) {
          primaryCell.style.backgroundColor = "#fadbd8";
          compareCell.style.backgroundColor = "#fadbd8";
        } else {
          primaryCell.style.backgroundColor = ""; // Reset if identical
          compareCell.style.backgroundColor = ""; // Reset if identical
        }
      }
    }
  });
}

//Highlight the Differences
highlightDifferencesInTables(
  [
    { primaryTableId: 'allConfigTable', compareTableId: 'compareAllConfigTable' },
    { primaryTableId: 'configTableOne', compareTableId: 'compareConfigTableOne' },
    { primaryTableId: 'configTableTwo', compareTableId: 'compareConfigTableTwo' },
    { primaryTableId: 'configTableThree', compareTableId: 'compareConfigTableThree' },
    { primaryTableId: 'configTableFour', compareTableId: 'compareConfigTableFour' },
    { primaryTableId: 'configTableFive', compareTableId: 'compareConfigTableFive' },
    { primaryTableId: 'configTableSix', compareTableId: 'compareConfigTableSix' },
    { primaryTableId: 'configTableSeven', compareTableId: 'compareConfigTableSeven' },

    { primaryTableId: 'domainTableAll', compareTableId: 'compareDomainTableAll' },
    { primaryTableId: 'domainTableOne', compareTableId: 'compareDomainTableOne' },
    { primaryTableId: 'domainTableTwo', compareTableId: 'compareDomainTableTwo' },
    { primaryTableId: 'domainTableThree', compareTableId: 'compareDomainTableThree' },

    { primaryTableId: 'operationsTableAll', compareTableId: 'compareOperationsTableAll' },
    { primaryTableId: 'operationsTableOne', compareTableId: 'compareOperationsTableOne' },
    { primaryTableId: 'operationsTableTwo', compareTableId: 'compareOperationsTableTwo' },
    { primaryTableId: 'operationsTableThree', compareTableId: 'compareOperationsTableThree' },
    { primaryTableId: 'operationsTableFour', compareTableId: 'compareOperationsTableFour' },

    { primaryTableId: 'securityTableAll', compareTableId: 'compareSecurityTableAll' },
    { primaryTableId: 'securityTableOne', compareTableId: 'compareSecurityTableOne' },
    { primaryTableId: 'securityTableTwo', compareTableId: 'compareSecurityTableTwo' },
    { primaryTableId: 'securityTableThree', compareTableId: 'compareSecurityTableThree' },
    { primaryTableId: 'securityTableFour', compareTableId: 'compareSecurityTableFour' },

    { primaryTableId: 'settingsTableAll', compareTableId: 'compareSettingsTableAll' },
    { primaryTableId: 'settingsTableOne', compareTableId: 'compareSettingsTableOne' },
    { primaryTableId: 'settingsTableTwo', compareTableId: 'compareSettingsTableTwo' },

    { primaryTableId: 'aboutTable', compareTableId: 'compareAboutTable' },

    { primaryTableId: 'deploymentTableOne', compareTableId: 'compareDeploymentTableOne' },
    { primaryTableId: 'deploymentTableTwo', compareTableId: 'compareDeploymentTableTwo' },
    { primaryTableId: 'deploymentTableThree', compareTableId: 'compareDeploymentTableThree' },

    { primaryTableId: 'vaultActionsTableAll', compareTableId: 'compareVaultActionsTableAll' },
    { primaryTableId: 'vaultActionsTableOne', compareTableId: 'compareVaultActionsTableOne' },
    { primaryTableId: 'vaultActionsTableTwo', compareTableId: 'compareVaultActionsTableTwo' },
    { primaryTableId: 'vaultActionsTableThree', compareTableId: 'compareVaultActionsTableThree' },
    { primaryTableId: 'vaultActionsTableFour', compareTableId: 'compareVaultActionsTableFour' },
    { primaryTableId: 'vaultActionsTableFive', compareTableId: 'compareVaultActionsTableFive' },
    { primaryTableId: 'vaultActionsTableSix', compareTableId: 'compareVaultActionsTableSix' },
    { primaryTableId: 'vaultActionsTableSeven', compareTableId: 'compareVaultActionsTableSeven' },
    { primaryTableId: 'vaultActionsTableEight', compareTableId: 'compareVaultActionsTableEight' },

    { primaryTableId: 'vaultActionsRIMOne', compareTableId: 'compareVaultActionsRIMOne' },

    { primaryTableId: 'vaultActionsTableNine', compareTableId: 'compareVaultActionsTableNine' },
    { primaryTableId: 'vaultActionsTableTen', compareTableId: 'compareVaultActionsTableTen' },

    { primaryTableId: 'vaultActionsPromomats', compareTableId: 'compareVaultActionsPromomats' },

    { primaryTableId: 'vaultActionsTableEleven', compareTableId: 'compareVaultActionsTableEleven' },
    { primaryTableId: 'vaultActionsTableTwelve', compareTableId: 'compareVaultActionsTableTwelve' },

    { primaryTableId: 'vaultActionsRIMTwo', compareTableId: 'compareVaultActionsRIMTwo' },
    { primaryTableId: 'vaultActionsRIMThree', compareTableId: 'compareVaultActionsRIMThree' },
    { primaryTableId: 'vaultActionsRIMFour', compareTableId: 'compareVaultActionsRIMFour' },

    { primaryTableId: 'vaultActionsTableThirteen', compareTableId: 'compareVaultActionsTableThirteen' },
    { primaryTableId: 'vaultActionsTableFourteen', compareTableId: 'compareVaultActionsTableFourteen' },
    { primaryTableId: 'vaultActionsTableFifteen', compareTableId: 'compareVaultActionsTableFifteen' },
    { primaryTableId: 'vaultActionsTableSixteen', compareTableId: 'compareVaultActionsTableSixteen' },
    { primaryTableId: 'vaultActionsTableSeventeen', compareTableId: 'compareVaultActionsTableSeventeen' },

    { primaryTableId: 'VOActionsTableOne', compareTableId: 'compareVOActionsTableOne' },
    { primaryTableId: 'VOActionsTableTwo', compareTableId: 'compareVOActionsTableTwo' },
    { primaryTableId: 'VOActionsTableThree', compareTableId: 'compareVOActionsTableThree' },
    { primaryTableId: 'VOActionsTableFour', compareTableId: 'compareVOActionsTableFour' },

    { primaryTableId: 'CAActionsTableOne', compareTableId: 'compareCAActionsTableOne' },

    { primaryTableId: 'objectTable', compareTableId: 'objectCompareTable' },
    { primaryTableId: 'fieldsTable', compareTableId: 'fieldsCompareTable' }

  ],
  1
);

// Get the loading icon and submit button elements
const loadingIcon = document.getElementById("loadingIcon");
const submitButton = document.getElementById("submitButton");
const submitButtonCompare = document.getElementById("submitButtonCompare");
const submitMyPermission = document.getElementById("submitMyPermission");

loadingIcon.style.display = "none";
submitButton.disabled = false;
submitMyPermission.disabled = false;
submitButtonCompare.disabled = false;

}
}

window.addEventListener('tablesFilled', function() {
  fillTablesTriggered = true;
  checkBothEvents();
});

window.addEventListener('compareTablesFilled', function() {
  fillCompareTablesTriggered = true;
  checkBothEvents();
});
