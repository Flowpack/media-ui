import * as React from 'react';
import { useRecoilValue } from 'recoil';
import { uploadDialogVisibleState } from '../../state';
import { UPLOAD_TYPE } from '../../state/uploadDialogVisibleState';
import NewAssetDialog from './UploadDialogs/NewAssetDialog';
import ReplaceAssetDialog from './UploadDialogs/ReplaceAssetDialog';

const UploadDialog: React.FC = () => {
    const { visible, uploadType } = useRecoilValue(uploadDialogVisibleState);
    return (visible && (uploadType === UPLOAD_TYPE.update ? <ReplaceAssetDialog /> : <NewAssetDialog />)) || null;
};

export default React.memo(UploadDialog);
