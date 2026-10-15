import React, { useCallback } from 'react';

import { useIntl, useNotify } from '@media-ui/core';
import { ActionButton } from '@media-ui/core/src/components';
import { useImportAsset } from '@media-ui/core/src/hooks';

interface ImportAssetButtonProps {
    asset: Asset;
    hideLabel?: boolean;
    className?: string;
}

const ImportAssetButton: React.FC<ImportAssetButtonProps> = ({ asset, hideLabel, className }) => {
    const { translate } = useIntl();
    const Notify = useNotify();
    const { importAsset } = useImportAsset();

    const onImportAsset = useCallback(() => {
        importAsset({ assetId: asset.id, assetSourceId: asset.assetSource.id })
            .then(() => {
                Notify.ok(translate('assetActions.import.success', 'Asset was successfully imported'));
            })
            .catch(() => {
                return;
            });
    }, [importAsset, asset, Notify, translate]);

    return (
        <ActionButton
            icon="cloud-download-alt"
            label={translate('itemActions.import', 'Import asset')}
            hideLabel={hideLabel}
            className={className}
            onClick={onImportAsset}
        />
    );
};

export default React.memo(ImportAssetButton);
