const CHANGED_FIELD_CLASS = 'metadata-field-changed';
const CHANGED_ASSET_CLASS = 'metadata-asset-changed';

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

/**
 * Flags the tab of every asset whose metadata was modified, so the tab list gives an
 * overview of which assets are actually changed before saving.
 */
const trackChangedAssets = (form) => {
    form.querySelectorAll('.metadata-editor-panel').forEach((panel) => {
        const tab = document.getElementById(panel.getAttribute('aria-labelledby') || '');

        if (!tab) {
            return;
        }

        const groups = panel.querySelectorAll('.neos-control-group');
        const initialValues = new Map();

        groups.forEach((group) => {
            initialValues.set(group, readFieldGroupValue(group));
        });

        const update = () => {
            const hasChanges = Array.from(initialValues).some(
                ([group, initialValue]) => initialValue !== '' && readFieldGroupValue(group) !== initialValue
            );

            tab.classList.toggle(CHANGED_ASSET_CLASS, hasChanges);
        };

        groups.forEach((group) => {
            group.addEventListener('input', update);
            group.addEventListener('change', update);
        });
    });
};

/**
 * "Apply to all": copies the value of the edited property to the same property of every
 * other asset in the batch. The values are copied into the other assets' own form fields,
 * so saving the form persists them like any other change.
 */
const setupApplyToAll = (form) => {
    form.querySelectorAll('.metadata-editor-apply-to-all').forEach((button) => {
        button.addEventListener('click', () => {
            const group = button.closest('.neos-control-group');

            if (!group) {
                return;
            }

            // Restrict to the actual property control. The group also contains the
            // global-scope tooltip, whose checkbox has no name and would otherwise be
            // picked up first, and boolean fields render a hidden transfer input.
            const source = group.querySelector(
                '.neos-controls > input[name], .neos-controls > textarea[name], .neos-controls > select[name]'
            );

            if (!source) {
                return;
            }

            const isBoolean = source.type === 'checkbox';

            // Field names are "assets[<index>][postData][<propertyName>]"; only the
            // asset index differs between the panels, so match on the trailing
            // "[postData][<propertyName>]" part.
            const propertySuffix = source.name.slice(source.name.indexOf('[postData]'));
            const isCounterpart = (field) => field.name.endsWith(propertySuffix) && field.name !== source.name;
            const fields = form.querySelectorAll('input[name], textarea[name], select[name]');
            const counterparts = Array.from(fields).filter(isCounterpart);

            counterparts.forEach((field) => {
                // Skip the source field, hidden transfer inputs and read-only controls.
                if (field === source || field.type === 'hidden' || field.disabled) {
                    return;
                }

                if (isBoolean) {
                    field.checked = source.checked;
                } else {
                    field.value = source.value;
                }

                // Programmatic updates fire neither input nor change, so notify the
                // change tracking manually to keep the "changed" highlight in sync.
                field.dispatchEvent(new Event('input', { bubbles: true }));
                field.dispatchEvent(new Event('change', { bubbles: true }));
            });
        });
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
        trackChangedAssets(editMetadataForm);
        setupApplyToAll(editMetadataForm);
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
