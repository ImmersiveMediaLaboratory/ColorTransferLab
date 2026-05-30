/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

/******************************************************************************************************************
 ** Function to sort a table based on the column index
 ******************************************************************************************************************/
function sortTable(columnIndex) {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    // Get the table element
    table = document.getElementById("clientsTable"); 
    // Set the switching flag to true to start the loop
    switching = true; 
    // Set the initial sorting direction to ascending
    dir = "asc"; 

    // Loop until no switching is needed
    while (switching) {
        // Reset the switching flag
        switching = false; 
        // Get all the rows in the table
        rows = table.rows; 

        // Loop through all table rows (except the first, which contains table headers)
        for (i = 1; i < (rows.length - 1); i++) {
            // Reset the shouldSwitch flag
            shouldSwitch = false; 
            // Get the current cell
            x = rows[i].getElementsByTagName("TD")[columnIndex]; 
            // Get the next cell
            y = rows[i + 1].getElementsByTagName("TD")[columnIndex]; 

            // Check if the two rows should switch place based on the direction
            if (dir == "asc") {
                // If the current cell is greater than the next cell, mark as a switch
                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            } else if (dir == "desc") {
                // If the current cell is less than the next cell, mark as a switch
                if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            }
        }

        // If a switch has been marked, perform the switch and mark that a switch has been done
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchcount++;
        } else {
            if (switchcount == 0 && dir == "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }
}