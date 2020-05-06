import * as React from 'react';
import { useMediaUi, createUseMediaUiStyles, useIntl } from '../../core';
import { MediaUiTheme, GridComponentProps, AssetProxy } from '../../interfaces';
import { humanFileSize } from '../../helper/FileSize';
import { IconButton } from '@neos-project/react-ui-components';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    listView: {
        gridArea: props => props.gridPosition,
        overflow: 'scroll',
        '& table': {
            borderSpacing: '0 1px',
            width: '100%',
            '& tbody tr': {
                cursor: 'pointer',
                backgroundColor: theme.mainBackgroundColor,
                '&:nth-of-type(2n)': {
                    backgroundColor: theme.alternatingBackgroundColor
                },
                '&:hover': {
                    backgroundColor: theme.primaryColor
                }
            },
            '& th': {
                textAlign: 'left',
                lineHeight: theme.spacing.goldenUnit
            },
            '& td, & th': {
                padding: `0 ${theme.spacing.half}`,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                userSelect: 'none'
            },
            '& td:first-child': {
                minWidth: theme.spacing.goldenUnit,
                padding: '0 !important' // Hack to solve issue with backend default css
            },
            '& td:last-child': {
                paddingRight: '0 !important' // Hack to solve issue with backend default css
            }
        }
    },
    previewColumn: {
        width: theme.spacing.goldenUnit,
        '& picture': {
            display: 'block',
            width: '100%',
            height: theme.spacing.goldenUnit,
            '& img': {
                display: 'block',
                width: '100%',
                height: '100%',
                objectFit: 'contain'
            }
        }
    },
    labelColumn: {
        userSelect: 'text'
    },
    actionsColumn: {
        textAlign: 'right'
    },
    tagsColumn: {
        '& span': {
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            display: 'block',
            maxWidth: '200px'
        }
    }
}));

export default function ListView(props: GridComponentProps) {
    const classes = useStyles({ ...props });
    const { assetProxies, dummyImage, setSelectedAsset, notify } = useMediaUi();
    const { translate } = useIntl();

    const handleDeleteAction = (asset: AssetProxy) => {
        notify('info', 'This action has not been implemented yet');
    };

    return (
        <section className={classes.listView}>
            {assetProxies.length ? (
                <table>
                    <thead>
                        <tr>
                            <th />
                            <th>{translate('thumbnailView.header.name', 'Name')}</th>
                            <th>{translate('thumbnailView.header.lastModified', 'Last Modified')}</th>
                            <th>{translate('thumbnailView.header.fileSize', 'File size')}</th>
                            <th>{translate('thumbnailView.header.mediaType', 'Type')}</th>
                            <th>{translate('thumbnailView.header.tags', 'Tags')}</th>
                            <th />
                        </tr>
                    </thead>
                    <tbody>
                        {assetProxies.map(asset => (
                            <tr key={asset.identifier} onClick={() => setSelectedAsset(asset)}>
                                <td className={classes.previewColumn}>
                                    <picture>
                                        <img
                                            src={asset.thumbnailUri || dummyImage}
                                            alt={asset.label}
                                            width={40}
                                            height={36}
                                        />
                                    </picture>
                                </td>
                                <td className={classes.labelColumn}>{asset.label}</td>
                                <td>{new Date(asset.lastModified).toLocaleString()}</td>
                                <td>{humanFileSize(asset.fileSize)}</td>
                                <td>{asset.mediaType}</td>
                                <td
                                    className={classes.tagsColumn}
                                    title={asset.localAssetData?.tags?.map(({ label }) => label).join(', ') || ''}
                                >
                                    <span>
                                        {asset.localAssetData?.tags?.map(({ label }) => label).join(', ') || ''}
                                    </span>
                                </td>
                                <td className={classes.actionsColumn}>
                                    <IconButton
                                        icon="trash"
                                        size="regular"
                                        style="transparent"
                                        hoverStyle="error"
                                        onClick={() => handleDeleteAction(asset)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div>{translate('assetList', 'No assets found')}</div>
            )}
        </section>
    );
}
