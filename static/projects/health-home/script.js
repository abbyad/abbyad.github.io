const webAppUrl = 'https://script.google.com/macros/s/AKfycbxLYtAHQ73OrBTRFkLOqt01927byIfwjTUGQoVsjt0K6J9YwT9LFUDRlKt7MTugwARTpA/exec';

let isSearching = false;

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
    const spinner = $('#spinner');

    ul.empty(); // Clear the previous results
    errorMessageElement.text(''); // Clear any previous error message

    if (isValidPostalCode(searchTerm)) {
        $('#search-button').prop('disabled', true); // Disable the search button
        spinner.show(); // Show the spinner

        fetch(`${webAppUrl}?postalCode=${encodeURIComponent(searchTerm)}`)
            .then(response => response.text()) // Get the response as text first
            .then(text => {
                console.log(`Response Text: ${text}`); // Log the response text
                const data = JSON.parse(text); // Parse the text to JSON
                console.log(data); // Log the parsed JSON data for debugging
                if (data.error) {
                    // Display the error message
                    errorMessageElement.text(data.error);
                } else {
                    // Display the clinic details
                    data.clinics.forEach(clinic => {
                        const li = $('<li>').html(`<strong>${clinic.name}</strong><br>${clinic.address}<br>${clinic.phone}`);
                        ul.append(li);
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

$('#search-button').click(function() {
    performSearch();
});

$('#search-input').keypress(function(event) {
    if (event.keyCode === 13) { // 13 is the Enter key code
        performSearch();
    }
});
