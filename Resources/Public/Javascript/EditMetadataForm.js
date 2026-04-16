window.addEventListener('load', () => {
    // When the cancel button is clicked, request closing the dialog.
    document.getElementById('cancelButton')?.addEventListener('click', (e) => {
        e.preventDefault();

        // Send message to parent window to close the dialog
        window.parent.postMessage({type: 'closeDialog'}, '*');
    });

    document.getElementById('changeDspHashForm')?.querySelector('select')?.addEventListener('change', (e) => {
        const form  = document.getElementById('changeDspHashForm');
        form.submit();
    });
    // When the form is successfully submitted, request closing the dialog and show a success message
    document.getElementById('editMetadataForm')?.addEventListener('submit', (e) => {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);

        fetch(form.action, {
            method: form.method,
            body: formData,
        }).then(response => {
            if (response.ok) {
                // Send message to parent window to close the dialog and show success message
                window.parent.postMessage({type: 'closeDialog', showSuccessMessage: true}, '*');
            } else {
                // Handle error response (e.g., show an error message)
                console.error('Failed to submit the form:', response.statusText);
            }
        }).catch(error => {
            console.error('Error submitting the form:', error);
        });
    });
});
