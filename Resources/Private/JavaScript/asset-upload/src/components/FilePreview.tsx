import React from 'react';
import cx from 'classnames';

import { Icon, TextArea, TextInput } from '@neos-project/react-ui-components';

import classes from './FilePreview.module.css';

interface FilePreviewProps {
    file: UploadedFile;
    loading?: boolean;
    fileState: FileUploadResult;
    dialogState: UploadDialogState;
    setFiles: Dispatch<SetStateAction<FilesUploadState>>;
    setUploadPossible: SetterOrUpdater<boolean>;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, loading = false, fileState }: FilePreviewProps) => {
    const success = fileState?.success;
    const error = fileState && !success;

    const setUploadProperty = (propertyName: string, propertyValue: UploadProperty) => {
        const files: UploadedFile[] = [...dialogState.files.selected];
        if (files.length === 0) {
            file[propertyName] = propertyValue;
            files.push(file);
        } else {
            files.forEach((selectedFile) => {
                if (selectedFile.name === file.name) {
                    file[propertyName] = propertyValue;
                }
            });
        }

        return files;
    };

    const getUploadPossibleValue = (files: UploadedFile[]) => {
        return !loading && files.length > 0;
    };

    const setCopyrightNotice = (copyrightNotice: string) => {
        const files = setUploadProperty('copyrightNotice', copyrightNotice);

        setFiles((prev) => {
            return { ...prev, selected: files };
        });

        setUploadPossible(getUploadPossibleValue(files));
    };


    const setTitle = (title: string) => {
        const files = setUploadProperty('title', title);

        setFiles((prev) => {
            return { ...prev, selected: files };
        });

        setUploadPossible(getUploadPossibleValue(files));
    };

    const setCaption = (caption: string) => {
        const files = setUploadProperty('caption', caption);

        setFiles((prev) => {
            return { ...prev, selected: files };
        });

        setUploadPossible(getUploadPossibleValue(files));
    };

    // TODO: Output helpful localised messages for results 'EXISTS', 'ADDED', 'ERROR'
    return (
        <div
            className={cx(
                classes.thumb,
                error ? classes.error : success ? classes.success : loading && classes.loading
            )}
            title={file.name}
        >
            <div className={classes.thumbInner}>
                <img src={file.preview} alt={file.name} className={classes.img} />
                {loading && <Icon icon="spinner" spin={true} />}
                {success && <Icon icon="check" />}
                {error && <Icon icon="exclamation-circle" />}
                {fileState?.result && <span>{fileState.result}</span>}
            </div>
        </div>
    );
};

export default React.memo(FilePreview);
