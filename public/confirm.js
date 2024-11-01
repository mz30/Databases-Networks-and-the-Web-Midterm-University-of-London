/*
    Content-Security-Policy: The page’s settings blocked an event handler (script-src-attr) from being executed because it violates the following directive: “script-src-attr 'none'”
    Source: confirmAction(event, 'Are you sure you w…

    To avoid the above error messages, I will implement event listeners using JavaScript instead of 
    using inline event handlers (such as onclick in the HTML)
*/

// Wait for the DOM content to be fully loaded before executing the script
document.addEventListener('DOMContentLoaded', function () 
{
    // Select all elements with class 'publish-button' and store them in publishButtons array
    const publishButtons = document.querySelectorAll('.publish-button');
    
    // Select all elements with class 'delete-draft-button' and store them in deleteDraftButtons array
    const deleteDraftButtons = document.querySelectorAll('.delete-draft-button');
    
    // Select all elements with class 'delete-published-button' and store them in deletePublishedButtons array
    const deletePublishedButtons = document.querySelectorAll('.delete-published-button');
    
    // Get the confirmation modal element by its ID
    const confirmationModal = document.getElementById('confirmationModal');
    
    // Get the message element inside the confirmation modal
    const confirmationMessage = document.getElementById('confirmationMessage');
    
    // Get the 'Yes' button inside the confirmation modal
    const confirmYes = document.getElementById('confirmYes');
    
    // Get the 'No' button inside the confirmation modal
    const confirmNo = document.getElementById('confirmNo');

    // Function to show the confirmation modal with a specific message and a callback function
    function showConfirmationModal(message, callback) 
    {
        // Set the text content of the confirmation message
        confirmationMessage.textContent = message;
        
        // Display the confirmation modal (make it visible)
        confirmationModal.style.display = 'block';

        // Event listener for the 'Yes' button click
        confirmYes.onclick = function () 
        {
            // Invoke the callback with true when 'Yes' is clicked
            callback(true);
            // Hide the confirmation modal
            confirmationModal.style.display = 'none';
        };

        // Event listener for the 'No' button click
        confirmNo.onclick = function () 
        {
            // Invoke the callback with false when 'No' is clicked
            callback(false);
            // Hide the confirmation modal
            confirmationModal.style.display = 'none';
        };
    }

    // Loop through each publish button in the publishButtons array
    publishButtons.forEach(button => {
        // Add click event listener to each publish button
        button.addEventListener('click', function (event) 
        {
            // Prevent default form submission behavior
            event.preventDefault();
            
            // Get the form ID from the dataset attribute of the clicked button
            const formId = event.target.dataset.formId;
            
            // Display confirmation modal with message and define callback function
            showConfirmationModal('Are you sure you want to publish this draft?', function (confirmed) 
            {
                // If user confirms (callback returns true), submit the form with the corresponding ID
                if (confirmed) 
                {
                    document.getElementById(formId).submit();
                }
            });
        });
    });

    // Similar logic for delete draft buttons
    deleteDraftButtons.forEach(button => {
        button.addEventListener('click', function (event) 
        {
            event.preventDefault();
            const formId = event.target.dataset.formId;
            showConfirmationModal('Are you sure you want to delete this draft?', function (confirmed) 
            {
                if (confirmed) 
                {
                    document.getElementById(formId).submit();
                }
            });
        });
    });

    // Similar logic for delete published buttons
    deletePublishedButtons.forEach(button => {
        button.addEventListener('click', function (event) 
        {
            event.preventDefault();
            const formId = event.target.dataset.formId;
            showConfirmationModal('Are you sure you want to delete this article?', function (confirmed) 
            {
                if (confirmed) 
                {
                    document.getElementById(formId).submit();
                }
            });
        });
    });
});