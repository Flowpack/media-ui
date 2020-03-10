import * as React from 'react';
import { useMediaUi, createUseMediaUiStyles, useIntl } from '../../core';
import { MediaUiTheme, GridComponentProps } from '../../interfaces';
import { humanFileSize } from '../../helper/FileSize';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    listView: {
        '.neos &': {
            '& table': {
                width: '100%',
                '& tr': {
                    backgroundColor: theme.alternatingBackgroundColor,
                    '&:nth-of-type(2n)': {
                        backgroundColor: theme.alternatingBackgroundColor
                    },
                    '&:hover': {
                        backgroundColor: theme.primaryColor
                    }
                },
                '& td:first-child': {
                    padding: '0 !important' // Hack to solve issue with backend default css
                }
            }
        }
    },
    previewColumn: {
        width: '40px',
        '& picture': {
            display: 'block',
            width: '100%',
            height: '40px',
            '& img': {
                display: 'block',
                width: '100%',
                height: '100%',
                objectFit: 'cover'
            }
        }
    },
    actionsColumn: {}
}));

export default function ListView(props: GridComponentProps) {
    const classes = useStyles({ ...props });
    const { assetProxies, dummyImage, setSelectedAsset } = useMediaUi();
    const { translate } = useIntl();

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
                            <tr key={asset.identifier}>
                                <td className={classes.previewColumn}>
                                    <picture onClick={() => setSelectedAsset(asset)}>
                                        <img
                                            src={asset.thumbnailUri || dummyImage}
                                            alt={asset.label}
                                            width={40}
                                            height={36}
                                        />
                                    </picture>
                                </td>
                                <td>{asset.label}</td>
                                <td>{new Date(asset.lastModified).toLocaleString()}</td>
                                <td>{humanFileSize(asset.fileSize)}</td>
                                <td>{asset.mediaType}</td>
                                <td>{asset.localAssetData?.tags?.map(tag => tag).join(', ') || ''}</td>
                                <td className={classes.actionsColumn}>...</td>
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
