import React from 'react';
import cx from 'classnames';

import { Icon } from '@neos-project/react-ui-components';

import classes from './FilePreview.module.css';
import { useIntl } from '@media-ui/core';

interface FilePreviewProps {
    file: UploadedFile;
    loading?: boolean;
    fileState: FileUploadResult;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, loading = false, fileState }: FilePreviewProps) => {
    const { translate } = useIntl();
    const success = fileState?.success;
    const error = fileState && !success;

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
                {fileState?.result && (
                    <span>{translate(`uploadDialog.fileList.${fileState.result.toLowerCase()}`)}</span>
                )}
            </div>
        </div>
    );
};

export default React.memo(FilePreview);
