import * as React from 'react';

import { useIntl, createUseMediaUiStyles, MediaUiTheme } from '@media-ui/core/src';

import { UsageDetailsGroup } from '../interfaces/UsageDetails';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    usageSection: {
        '& h2': {
            fontSize: theme.fontSize.base,
            fontWeight: 'bold',
            margin: 0,
            padding: 0,
        },
    },
    usageTable: {
        width: '100%',
        marginTop: theme.spacing.full,
        lineHeight: 1.5,
        '& th': {
            fontWeight: 'bold',
            textAlign: 'left',
        },
        '& td, & th': {
            padding: theme.spacing.quarter,
            verticalAlign: 'baseline',
            '&:first-child': {
                paddingLeft: 0,
            },
            '&:last-child': {
                paddingRight: 0,
            },
        },
        // `&&` is for specificity, otherwise `.neos.neos-module a` would override
        // this link style in the backend module
        '&& a': {
            color: theme.colors.primary,
            '&:hover': {
                color: theme.colors.primary,
                textDecoration: 'underline',
            },
        },
        '& li': {
            listStyleType: 'disc',
            '& ul': {
                paddingLeft: '1rem',
                '& li': {
                    display: 'list-item',
                },
            },
        },
    },
}));

interface AssetUsageSectionProps {
    usageDetailsGroup: UsageDetailsGroup;
}

// Recursive function to render an object as a nested list
function renderObject(data: Record<string, any>) {
    return Array.isArray(data) ? (
        <ul>
            {data.map((item, index) => (
                <li key={index}>{renderObject(item)}</li>
            ))}
        </ul>
    ) : typeof data === 'object' ? (
        <ul>
            {Object.keys(data).map((key) => (
                <li key={key}>
                    <strong>{key}:</strong> {renderObject(data[key])}
                </li>
            ))}
        </ul>
    ) : typeof data === 'string' ? (
        data
    ) : (
        JSON.stringify(data)
    );
}

const AssetUsageSection: React.FC<AssetUsageSectionProps> = ({ usageDetailsGroup }: AssetUsageSectionProps) => {
    const classes = useStyles();
    const { translate } = useIntl();
    const { label, usages, metadataSchema } = usageDetailsGroup;

    return (
        <section className={classes.usageSection}>
            <h2>{label} ({usages.length})</h2>
            {usages.length > 0 && (
                <table className={classes.usageTable}>
                    <thead>
                        <tr>
                            <th>{translate('assetUsage.header.label', 'Label')}</th>
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
                                    const usage = assetUsage.metadata.find((usage) => usage.name == name);
                                    return usage ? (
                                        <td key={index}>
                                            {type == 'DATETIME' || type == 'DATE' ? (
                                                new Date(usage.value).toLocaleString()
                                            ) : type == 'URL' ? (
                                                <a href={usage.value} target="_blank" rel="noreferrer">
                                                    {name}
                                                </a>
                                            ) : type == 'JSON' ? (
                                                renderObject(JSON.parse(usage.value))
                                            ) : (
                                                usage.value
                                            )}
                                        </td>
                                    ) : null;
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
