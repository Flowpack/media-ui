import * as React from 'react';
import { useRecoilValue } from 'recoil';

import NewAssetDialog from './NewAssetDialog';
import ReplaceAssetDialog from './ReplaceAssetDialog';
import { UPLOAD_TYPE, uploadDialogState } from '../../state/uploadDialogState';

const UploadDialog: React.FC = () => {
    const { visible, uploadType } = useRecoilValue(uploadDialogState);
    return (visible && (uploadType === UPLOAD_TYPE.update ? <ReplaceAssetDialog /> : <NewAssetDialog />)) || null;
};

export default React.memo(UploadDialog);
