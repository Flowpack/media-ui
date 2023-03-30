import * as React from 'react';

import { useIntl, createUseMediaUiStyles, MediaUiTheme } from '@media-ui/core';

import { FilesUploadState, FileUploadResult } from '../interfaces';
import FilePreview from './FilePreview';

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
}));

interface PreviewSectionProps {
    files: FilesUploadState;
    loading: boolean;
    uploadState: FileUploadResult[];
}

const PreviewSection: React.FC<PreviewSectionProps> = ({ files, loading, uploadState }: PreviewSectionProps) => {
    const { translate } = useIntl();
    const classes = useStyles();

    // FIXME: Mapping the uploadState to the files name is not the best solution as the same filename might be used multiple times

    return (
        <aside className={classes.fileList}>
            {files.selected.length > 0 && (
                <>
                    <h4 className={classes.fileListHeader}>
                        {translate('uploadDialog.fileList.header', 'Selected files')}
                    </h4>
                    {files.selected.map((file) => (
                        <FilePreview
                            file={file}
                            loading={loading}
                            fileState={uploadState.find((result) => result.filename === file.name)}
                            key={file.id}
                        />
                    ))}
                </>
            )}
            {files.rejected.length > 0 && (
                <>
                    <h4 className={classes.fileListHeader}>
                        {translate('uploadDialog.fileList.uploadedHeader', 'Failed uploads')}
                    </h4>
                    {files.rejected.map((file) => (
                        <FilePreview
                            file={file}
                            fileState={uploadState.find((result) => result.filename === file.name)}
                            key={file.id}
                        />
                    ))}
                </>
            )}
            {files.finished.length > 0 && (
                <>
                    <h4 className={classes.fileListHeader}>
                        {translate('uploadDialog.fileList.uploadedHeader', 'Successful uploads')}
                    </h4>
                    {files.finished.map((file) => (
                        <FilePreview
                            file={file}
                            fileState={uploadState.find((result) => result.filename === file.name)}
                            key={file.id}
                        />
                    ))}
                </>
            )}
        </aside>
    );
};

export default React.memo(PreviewSection);
