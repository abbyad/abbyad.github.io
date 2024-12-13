$(document).ready(function() {
    const spreadsheetId = '1MAmWpY-p7cWdz6lYLSlfsLUjquvF35v6xBq-H-x2gpo';
    const sheetName = 'Sheet1'; // Change to the name of your sheet if different
    const range = 'A:C'; // Make sure to include columns A to C

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!${range}?key=AIzaSyADzxdIXWxhGVbTMhhnAsmgFfUryaPo8oQ`;

    // Function to validate the postal code
    function isValidPostalCode(postalCode) {
        const regex1 = /^[A-Za-z]\d[A-Za-z]$/; // Regex to match the first three characters of a Canadian postal code
        const regex2 = /^[A-Za-z]\d[A-Za-z][ ]?\d[A-Za-z]\d$/; // Regex to match a full Canadian postal code with an optional space
        return regex1.test(postalCode) || regex2.test(postalCode);
    }

    $('#search-button').click(function() {
        const searchTerm = $('#search-input').val().toUpperCase().replace(/\s+/g, ''); // Convert search term to uppercase and remove spaces
        const errorMessageElement = $('#error-message');
        const ul = $('#response-list');
        const headerElement = $('#search-header');
        ul.empty(); // Clear the previous results
        headerElement.text(''); // Clear the previous header
        errorMessageElement.text(''); // Clear any previous error message

        if (isValidPostalCode(searchTerm)) {
            headerElement.text(`Results for postal code: ${searchTerm}`);
            const searchPrefix = searchTerm.slice(0, 3); // Use the first three characters for the search
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    const values = data.values;
                    let found = false;
                    values.forEach(row => {
                        if (row[1] && row[1].toUpperCase().includes(searchPrefix)) { // Check if column B contains the search prefix
                            const li = $('<li>').html(row[2]); // Use .html() to insert HTML content
                            ul.append(li);
                            found = true;
                        }
                    });
                    if (!found) {
                        ul.append('<li>No clinics found for the specified postal code.</li>');
                    }
                })
                .catch(error => console.error('Error fetching data: ', error));
        } else {
            errorMessageElement.text('Please enter a valid Canadian postal code (e.g., K7L or K7L 1A1)');
        }
    });
});
