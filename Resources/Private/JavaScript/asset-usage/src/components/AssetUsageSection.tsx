import * as React from 'react';

import { useIntl, createUseMediaUiStyles, MediaUiTheme } from '@media-ui/core/src';

import { UsageDetailsGroup } from '../interfaces/UsageDetails';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    usageSection: {
        '& h2': {
            fontWeight: 'bold',
        },
    },
    usageTable: {
        width: '100%',
        marginTop: theme.spacing.full,
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

interface AssetUsageSectionProps {
    usageDetailsGroup: UsageDetailsGroup;
}

const AssetUsageSection: React.FC<AssetUsageSectionProps> = ({ usageDetailsGroup }: AssetUsageSectionProps) => {
    const classes = useStyles();
    const { translate } = useIntl();
    const { label, usages, metadataSchema } = usageDetailsGroup;

    return (
        <section className={classes.usageSection}>
            <h2>{label}</h2>
            {usages.length > 0 && (
                <table className={classes.usageTable}>
                    <thead>
                        <tr>
                            <th>{translate('assetUsageSection.label', 'Label')}</th>
                            {metadataSchema.map((schema, index) => (
                                <th key={index}>{schema.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {usages.map((assetUsage, index) => (
                            <tr key={index}>
                                <td>
                                    <a href={assetUsage.url} target="_blank" rel="noreferrer">
                                        {assetUsage.label}
                                    </a>
                                </td>
                                {metadataSchema.map(({ name, type }, index) => {
                                    const { value } = assetUsage.metadata.find((usage) => usage.name == name);
                                    return (
                                        <td key={index}>
                                            {type == 'DATETIME' || type == 'DATE' ? (
                                                new Date(value).toLocaleString()
                                            ) : type == 'URL' ? (
                                                <a href={value} target="_blank" rel="noreferrer">
                                                    {name}
                                                </a>
                                            ) : (
                                                value
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </section>
    );
};

export default React.memo(AssetUsageSection);
