$(document).ready(function() {
    const spreadsheetId = '1bdCU88bgCzukGH1GsNh7vwE7rG-c5mnn23zea4qFq54';
    const pcByClinicSheetName = 'PC by clinic'; // Change to the name of your sheet if different
    const clinicsSheetName = 'Clinics'; // Change to the name of your sheet if different
    const pcByClinicRange = 'A:I'; // Make sure to include columns A to I for PC by clinic sheet
    const clinicsRange = 'A:E'; // Make sure to include columns A to E for Clinics sheet

    const pcByClinicUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${pcByClinicSheetName}!${pcByClinicRange}?key=AIzaSyADzxdIXWxhGVbTMhhnAsmgFfUryaPo8oQ`;
    const clinicsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${clinicsSheetName}!${clinicsRange}?key=AIzaSyADzxdIXWxhGVbTMhhnAsmgFfUryaPo8oQ`;

    let isSearching = false; // Flag to indicate if a search is in progress

    // Function to validate the postal code
    function isValidPostalCode(postalCode) {
        const regex = /^[A-Za-z]\d[A-Za-z][ ]?\d[A-Za-z]\d$/; // Regex to match a full Canadian postal code with an optional space
        return regex.test(postalCode);
    }

    function performSearch() {
        if (isSearching) return; // Exit if a search is already in progress
        isSearching = true; // Set the flag to indicate a search is in progress

        const searchTerm = $('#search-input').val().toUpperCase().replace(/\s+/g, ''); // Convert search term to uppercase and remove spaces
        const errorMessageElement = $('#error-message');
        const ul = $('#response-list');
        ul.empty(); // Clear the previous results
        errorMessageElement.text(''); // Clear any previous error message

        if (isValidPostalCode(searchTerm)) {
            $('#search-button').prop('disabled', true); // Disable the search button
            fetch(pcByClinicUrl)
                .then(response => response.json())
                .then(data => {
                    const values = data.values;
                    let found = false;
                    let clinicIds = [];
                    values.forEach(row => {
                        if (row[0] && row[0].toUpperCase() === searchTerm) { // Check if column A matches the search term
                            clinicIds = row[8] ? row[8].split(',').map(id => id.trim()) : []; // Split the clinic IDs by comma and trim spaces, or set to an empty array if undefined
                            found = true;
                        }
                    });
                    if (found) {
                        if (clinicIds.length > 0) {
                            // Fetch data from the Clinics sheet using the clinic IDs
                            fetch(clinicsUrl)
                                .then(response => response.json())
                                .then(data => {
                                    const clinicValues = data.values;
                                    let clinicFound = false;
                                    clinicIds.forEach(clinicId => {
                                        clinicValues.forEach(clinicRow => {
                                            if (clinicRow[0] && clinicRow[0].toUpperCase() === clinicId.toUpperCase() && clinicRow[4] === 'Yes') { // Check if column A matches the clinic ID and column E is "Yes"
                                                const li = $('<li>').html(`<strong>${clinicRow[1]}</strong><br>${clinicRow[2]}<br>${clinicRow[3]}`); // Display the name (B), address (C), and phone number (D)
                                                ul.append(li);
                                                clinicFound = true;
                                            }
                                        });
                                    });
                                    if (!clinicFound) {
                                        errorMessageElement.text('No clinics found for the specified postal code.');
                                    }
                                    $('#search-button').prop('disabled', false); // Re-enable the search button
                                    isSearching = false; // Reset the flag
                                })
                                .catch(error => {
                                    console.error('Error fetching clinic data: ', error);
                                    errorMessageElement.text('Error fetching clinic data. Please try again later.');
                                    $('#search-button').prop('disabled', false); // Re-enable the search button
                                    isSearching = false; // Reset the flag
                                });
                        } else {
                            errorMessageElement.text('No clinic has been assigned for the specified postal code.');
                            $('#search-button').prop('disabled', false); // Re-enable the search button
                            isSearching = false; // Reset the flag
                        }
                    } else {
                        errorMessageElement.text('This postal code is not available for this search.');
                        $('#search-button').prop('disabled', false); // Re-enable the search button
                        isSearching = false; // Reset the flag
                    }
                })
                .catch(error => {
                    console.error('Error fetching data: ', error);
                    errorMessageElement.text('Error fetching clinics. Please try again later.');
                    $('#search-button').prop('disabled', false); // Re-enable the search button
                    isSearching = false; // Reset the flag
                });
        } else {
            errorMessageElement.text('Please enter a valid Canadian postal code (e.g., K7L 1A1)');
            isSearching = false; // Reset the flag
        }
    }

    $('#search-button').click(function() {
        performSearch();
    });

    $('#search-input').keypress(function(event) {
        if (event.keyCode === 13) { // 13 is the Enter key code
            performSearch();
        }
    });
});
