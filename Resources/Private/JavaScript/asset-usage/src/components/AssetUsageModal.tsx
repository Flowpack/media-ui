import * as React from 'react';
import { useCallback } from 'react';
import { useRecoilState } from 'recoil';

import { Button, Dialog } from '@neos-project/react-ui-components';

import { useIntl, createUseMediaUiStyles, MediaUiTheme } from '@media-ui/core/src';
import { useSelectedAsset } from '@media-ui/core/src/hooks';

import assetUsageModalState from '../state/assetUsageModalState';
import useAssetUsagesQuery from '../hooks/useAssetUsages';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    assetUsage: {
        padding: theme.spacing.full,
    },
    usageTable: {
        width: '100%',
        '& th': {
            fontWeight: 'bold',
        },
        '& td, & th': {
            padding: theme.spacing.quarter,
            '&:first-child': {
                paddingLeft: 0,
            },
            '&:last-child': {
                paddingRight: 0,
            },
        },
        '.neos & a': {
            color: theme.colors.primary,
            '&:hover': {
                color: theme.colors.primary,
                textDecoration: 'underline',
            },
        },
    },
}));

const AssetUsageModal: React.FC = () => {
    const classes = useStyles();
    const { translate } = useIntl();
    const [isOpen, setIsOpen] = useRecoilState(assetUsageModalState);
    const asset = useSelectedAsset();
    const { assetUsages, loading } = useAssetUsagesQuery(
        asset ? { assetId: asset.id, assetSourceId: asset.assetSource.id } : null
    );

    const handleRequestClose = useCallback(() => setIsOpen((prev) => !prev), [setIsOpen]);

    return (
        <Dialog
            isOpen={isOpen}
            title={translate('assetUsage.title', 'Asset usage for {asset}', { asset: asset.label })}
            onRequestClose={handleRequestClose}
            style="wide"
            actions={[
                <Button key="cancel" style="neutral" hoverStyle="darken" onClick={handleRequestClose}>
                    {translate('assetUsage.cancel', 'Cancel')}
                </Button>,
            ]}
        >
            <section className={classes.assetUsage}>
                {assetUsages?.length > 0 ? (
                    <table className={classes.usageTable}>
                        <tr>
                            <th>Document</th>
                            <th>Service</th>
                            <th>Dimensions</th>
                            <th>Workspace</th>
                            <th>Last modification</th>
                        </tr>
                        {assetUsages.map((assetUsage) => (
                            <tr key={assetUsage.assetId}>
                                <td>
                                    <a href={assetUsage.metadata.uri} target="_blank" rel="noreferrer">
                                        {assetUsage.label}
                                    </a>
                                </td>
                                <td>{assetUsage.serviceId}</td>
                                <td>{assetUsage.metadata.contentDimensions?.join(', ')}</td>
                                <td>{assetUsage.metadata.workspace}</td>
                                <td>{new Date(assetUsage.metadata.lastModified).toLocaleString()}</td>
                            </tr>
                        ))}
                    </table>
                ) : (
                    <span>
                        {loading
                            ? translate('assetUsageModal.loading', 'Loading...')
                            : translate('assetUsageModal.noResults', 'No results')}
                    </span>
                )}
            </section>
        </Dialog>
    );
};

export default React.memo(AssetUsageModal);
