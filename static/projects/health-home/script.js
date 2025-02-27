let isSearching = false;

// Function to validate Canadian postal codes
function isValidPostalCode(postalCode) {
    const regex = /^[A-Za-z]\d[A-Za-z][ ]?\d[A-Za-z]\d$/; // Regex to match a full Canadian postal code with an optional space
    return regex.test(postalCode);
}

// Function to perform the search
function performSearch() {
    if (isSearching) return; // Exit if a search is already in progress
    isSearching = true; // Set the flag to indicate a search is in progress

    const searchTerm = $('#search-input').val().toUpperCase().replace(/\s+/g, ''); // Convert search term to uppercase and remove spaces
    const errorMessageElement = $('#error-message');
    const ul = $('#response-list');
    const spinner = $('#spinner');

    ul.empty(); // Clear the previous results
    errorMessageElement.text(''); // Clear any previous error message

    if (isValidPostalCode(searchTerm)) {
        $('#search-button').prop('disabled', true); // Disable the search button
        spinner.show(); // Show the spinner

        fetch('data.json', {
            cache: 'default' // Github pages files are considered fresh for 10 minutes, after that will check for updates
        })
            .then(response => response.json()) // Get the response as JSON
            .then(data => {
                const clinicIds = data.postal_codes[searchTerm];
                if (!clinicIds) {
                    // Display an error message if no clinics are found for the postal code
                    errorMessageElement.text('No clinics found for this postal code.');
                } else {
                    // Display the clinic details
                    clinicIds.split(', ').forEach(clinicId => {
                        const clinic = data.clinics[clinicId];
                        if (clinic) {
                            const li = $('<li>').html(`<strong>${clinic.name}</strong><br>${clinic.address}<br>${clinic.phone}`);
                            ul.append(li);
                        }
                        else {
                            // Should only get here if data is corrupt, eg. a clinic ID is out of range
                            console.error('Clinic not found: ', clinicId);
                        }
                    });
                }
                $('#search-button').prop('disabled', false); // Re-enable the search button
                isSearching = false; // Reset the flag
                spinner.hide(); // Hide the spinner
            })
            .catch(error => {
                console.error('Error fetching data: ', error);
                errorMessageElement.text('Error fetching clinics. Please try again later.');
                $('#search-button').prop('disabled', false); // Re-enable the search button
                isSearching = false; // Reset the flag
                spinner.hide(); // Hide the spinner
            });
    } else {
        errorMessageElement.text('Please enter a valid Canadian postal code (e.g., K7L 1A1)');
        isSearching = false; // Reset the flag
    }
}

// Event listeners for search button click and Enter key press
$('#search-button').click(function() {
    performSearch();
});

$('#search-input').keypress(function(event) {
    if (event.keyCode === 13) { // 13 is the Enter key code
        performSearch();
    }
});
