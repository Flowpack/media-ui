import * as React from 'react';
import cx from 'classnames';

import { Icon } from '@neos-project/react-ui-components';

import { createUseMediaUiStyles, MediaUiTheme } from '@media-ui/core/src';

import { FileUploadResult, UploadedFile } from '../interfaces';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    fileList: {
        marginTop: theme.spacing.full,
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    fileListHeader: {
        flex: '1 1 100%',
        marginBottom: theme.spacing.full,
        fontSize: theme.fontSize,
    },
    thumb: {
        display: 'inline-flex',
        borderRadius: 2,
        border: '1px solid #eaeaea',
        marginBottom: theme.spacing.half,
        marginRight: theme.spacing.half,
        width: 100,
        height: 100,
        padding: theme.spacing.quarter,
        boxSizing: 'border-box',
    },
    thumbInner: {
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '& span': {
            marginLeft: theme.spacing.half,
            userSelect: 'none',
        },
    },
    img: {
        position: 'absolute',
        display: 'block',
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        left: 0,
        top: 0,
        zIndex: -1,
    },
    stateOverlay: {
        position: 'absolute',
        content: '""',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme.colors.alternatingBackground,
        opacity: 0.3,
        zIndex: -1,
    },
    loading: {
        borderColor: theme.colors.border,
        '& $thumbInner:after': {
            extend: 'stateOverlay',
        },
    },
    success: {
        borderColor: theme.colors.success,
        '& $thumbInner:after': {
            extend: 'stateOverlay',
            backgroundColor: theme.colors.success,
        },
    },
    error: {
        borderColor: theme.colors.error,
        '& $thumbInner:after': {
            extend: 'stateOverlay',
            backgroundColor: theme.colors.error,
        },
    },
    warning: {
        color: theme.colors.warn,
    },
}));

interface FilePreviewProps {
    file: UploadedFile;
    loading?: boolean;
    fileState: FileUploadResult;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, loading = false, fileState }: FilePreviewProps) => {
    const classes = useStyles();
    const success = fileState?.success;
    const error = fileState && !success;
    let stateClassName;

    if (error) stateClassName = classes.error;
    else if (success) stateClassName = classes.success;
    else if (loading) stateClassName = classes.loading;

    // TODO: Output helpful localised messages for results 'EXISTS', 'ADDED', 'ERROR'
    return (
        <div className={cx(classes.thumb, stateClassName)} title={file.name}>
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
