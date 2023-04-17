import * as React from 'react';
import { useRecoilValue } from 'recoil';
import { uploadDialogState } from '../../state';
import { UPLOAD_TYPE } from '../../state/uploadDialogState';
import NewAssetDialog from './NewAssetDialog';
import ReplaceAssetDialog from './ReplaceAssetDialog';

const UploadDialog: React.FC = () => {
    const { visible, uploadType } = useRecoilValue(uploadDialogState);
    return (visible && (uploadType === UPLOAD_TYPE.update ? <ReplaceAssetDialog /> : <NewAssetDialog />)) || null;
};

export default React.memo(UploadDialog);
