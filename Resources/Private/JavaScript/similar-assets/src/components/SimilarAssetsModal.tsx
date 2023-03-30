import * as React from 'react';
import { useCallback } from 'react';
import { useRecoilState } from 'recoil';

import { Button, Dialog } from '@neos-project/react-ui-components';

import { useIntl, createUseMediaUiStyles, MediaUiTheme } from '@media-ui/core';
import { useSelectedAsset } from '@media-ui/core/src/hooks';

import similarAssetsModalState from '../state/similarAssetsModalState';
import useSimilarAssetsQuery from '../hooks/useSimilarAssets';
import SimilarAsset from './SimilarAsset';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    assetUsage: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gridGap: theme.spacing.full,
        padding: theme.spacing.full,
    },
}));

const SimilarAssetsModal: React.FC = () => {
    const classes = useStyles();
    const { translate } = useIntl();
    const [isOpen, setIsOpen] = useRecoilState(similarAssetsModalState);
    const asset = useSelectedAsset();
    const { similarAssets, loading } = useSimilarAssetsQuery(
        asset ? { assetId: asset.id, assetSourceId: asset.assetSource.id } : null
    );

    const handleRequestClose = useCallback(() => setIsOpen(false), [setIsOpen]);

    return (
        <Dialog
            isOpen={isOpen}
            title={translate('similarAssetsModal.title', `Similar assets to ${asset.label}`, { asset: asset.label })}
            onRequestClose={handleRequestClose}
            style="wide"
            actions={[
                <Button key="cancel" style="neutral" hoverStyle="darken" onClick={handleRequestClose}>
                    {translate('similarAssetsModal.cancel', 'Cancel')}
                </Button>,
            ]}
        >
            <div className={classes.assetUsage}>
                {similarAssets?.length > 0 ? (
                    similarAssets.map((asset, index) => <SimilarAsset key={index} asset={asset} />)
                ) : (
                    <span>
                        {loading
                            ? translate('similarAssetsModal.loading', 'Loading...')
                            : translate('similarAssetsModal.noResults', 'No results')}
                    </span>
                )}
            </div>
        </Dialog>
    );
};

export default React.memo(SimilarAssetsModal);
