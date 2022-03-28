import * as React from 'react';

import { useIntl, createUseMediaUiStyles, MediaUiTheme } from '@media-ui/core/src';

import { FileUploadResult } from 'Resources/Private/JavaScript/core/src/interfaces';
import FilePreview from './FilePreview';
import { UploadedFile } from './UploadSection';

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
    if (files.length === 0) {
        return;
    }

    return (
        <aside className={classes.fileList}>
            <h4 className={classes.fileListHeader}>{translate('uploadDialog.fileList.header', 'Selected files')}</h4>
            {files.map((file: UploadedFile) => (
                <FilePreview
                    file={file}
                    loading={loading}
                    fileState={uploadState.find((result) => result.filename === file.name)}
                    key={file.name}
                />
            ))}
        </aside>
    );
};

export default React.memo(PreviewSection);
