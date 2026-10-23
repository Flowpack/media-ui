const CHANGED_FIELD_CLASS = 'metadata-field-changed';

/**
 * WAI-ARIA tab pattern for the batch edit metadata dialog: the tablist lives in the
 * left column, the tab panels in the right one. All panels are rendered by the server,
 * this only toggles `aria-selected` / `hidden` and implements roving tabindex plus the
 * arrow key navigation expected for a tablist.
 */
const setupTablist = (tablist) => {
    const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));

    const selectTab = (tab, moveFocus) => {
        tabs.forEach((candidate) => {
            const selected = candidate === tab;
            const panel = document.getElementById(candidate.getAttribute('aria-controls'));

            candidate.setAttribute('aria-selected', selected ? 'true' : 'false');
            candidate.tabIndex = selected ? 0 : -1;

            if (panel) {
                panel.hidden = !selected;
            }
        });

        if (moveFocus) {
            tab.focus();
        }
    };

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => selectTab(tab, false));

        tab.addEventListener('keydown', (e) => {
            // Only handle keys while focus is inside the tablist (tabIndex -1 tabs are
            // only reachable this way, but guard anyway so nested inputs are unaffected).
            if (!tablist.contains(e.target)) {
                return;
            }

            const lastIndex = tabs.length - 1;
            const nextIndexByKey = {
                ArrowDown: index === lastIndex ? 0 : index + 1,
                ArrowRight: index === lastIndex ? 0 : index + 1,
                ArrowUp: index === 0 ? lastIndex : index - 1,
                ArrowLeft: index === 0 ? lastIndex : index - 1,
                Home: 0,
                End: lastIndex,
            };

            if (!(e.key in nextIndexByKey)) {
                return;
            }

            e.preventDefault();
            selectTab(tabs[nextIndexByKey[e.key]], true);
        });
    });
};

// Concatenation of all editable values of a control group, used to detect changes.
const readFieldGroupValue = (group) =>
    Array.from(group.querySelectorAll('input[name], textarea[name], select[name]'))
        .map((field) => {
            if (field.type === 'checkbox' || field.type === 'radio') {
                return `${field.name}:${field.checked}`;
            }

            return `${field.name}:${field.value}`;
        })
        .join('|');

// Highlight every control group whose value differs from the initially rendered one.
const trackChangedFields = (form) => {
    form.querySelectorAll('.neos-control-group').forEach((group) => {
        const initialValue = readFieldGroupValue(group);

        if (initialValue === '') {
            return;
        }

        const update = () => {
            group.classList.toggle(CHANGED_FIELD_CLASS, readFieldGroupValue(group) !== initialValue);
        };

        group.addEventListener('input', update);
        group.addEventListener('change', update);
    });
};

// Send message to parent window to close the dialog. The parent opens us in a native
// <dialog>, but while the focus is inside this iframe the Escape key is handled here and
// never reaches the parent's own Escape-to-close behaviour, so we forward it explicitly.
const requestDialogClose = () => {
    window.parent.postMessage({ type: 'closeDialog' }, '*');
};

window.addEventListener('load', () => {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            requestDialogClose();
        }
    });

    // When the cancel button is clicked, request closing the dialog.
    document.getElementById('cancelButton')?.addEventListener('click', (e) => {
        e.preventDefault();

        requestDialogClose();
    });

    document
        .getElementById('changeDspHashForm')
        ?.querySelector('select')
        ?.addEventListener('change', (e) => {
            const form = document.getElementById('changeDspHashForm');
            form.submit();
        });
    // When the form is successfully submitted, request closing the dialog and show a success message
    document.querySelectorAll('.metadata-editor-tablist').forEach(setupTablist);

    const editMetadataForm = document.getElementById('editMetadataForm');

    if (editMetadataForm) {
        trackChangedFields(editMetadataForm);
    }

    editMetadataForm?.addEventListener('submit', (e) => {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);

        fetch(form.action, {
            method: form.method,
            body: formData,
        })
            .then((response) => {
                if (response.ok) {
                    // Send message to parent window to close the dialog and show success message
                    window.parent.postMessage({ type: 'closeDialog', showSuccessMessage: true }, '*');
                } else {
                    // Handle error response (e.g., show an error message)
                    console.error('Failed to submit the form:', response.statusText);
                }
            })
            .catch((error) => {
                console.error('Error submitting the form:', error);
            });
    });
});
