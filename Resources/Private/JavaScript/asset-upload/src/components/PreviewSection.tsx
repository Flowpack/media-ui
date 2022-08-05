import * as React from 'react';
import { useMemo } from 'react';

import { useIntl, createUseMediaUiStyles, MediaUiTheme } from '@media-ui/core/src';

import { FileUploadResult, UploadedFile } from '../interfaces';
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
    files: UploadedFile[];
    loading: boolean;
    uploadState: FileUploadResult[];
}

const PreviewSection: React.FC<PreviewSectionProps> = ({ files, loading, uploadState }: PreviewSectionProps) => {
    const { translate } = useIntl();
    const classes = useStyles();

    const filesByState = useMemo(() => {
        return {
            uploaded: files.filter((file: UploadedFile) =>
                uploadState.some((state) => state.success && state.filename === file.name)
            ),
            failed: files.filter((file) => uploadState.some((state) => !state.success && state.filename === file.name)),
            ready: files.filter((file) => !uploadState.some((state) => state.filename === file.name)),
        };
    }, [files, uploadState]);

    if (files.length === 0) {
        return null;
    }

    return (
        <aside className={classes.fileList}>
            {filesByState.ready.length > 0 && (
                <>
                    <h4 className={classes.fileListHeader}>
                        {translate('uploadDialog.fileList.header', 'Selected files')}
                    </h4>
                    {filesByState.ready.map((file) => (
                        <FilePreview
                            file={file}
                            loading={loading}
                            fileState={uploadState.find((result) => result.filename === file.name)}
                            key={file.name}
                        />
                    ))}
                </>
            )}
            {filesByState.failed.length > 0 && (
                <>
                    <h4 className={classes.fileListHeader}>
                        {translate('uploadDialog.fileList.uploadedHeader', 'Failed uploads')}
                    </h4>
                    {filesByState.failed.map((file) => (
                        <FilePreview
                            file={file}
                            fileState={uploadState.find((result) => result.filename === file.name)}
                            key={file.name}
                        />
                    ))}
                </>
            )}
            {filesByState.uploaded.length > 0 && (
                <>
                    <h4 className={classes.fileListHeader}>
                        {translate('uploadDialog.fileList.uploadedHeader', 'Successful uploads')}
                    </h4>
                    {filesByState.uploaded.map((file) => (
                        <FilePreview
                            file={file}
                            fileState={uploadState.find((result) => result.filename === file.name)}
                            key={file.name}
                        />
                    ))}
                </>
            )}
        </aside>
    );
};

export default React.memo(PreviewSection);
