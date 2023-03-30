import * as React from 'react';

import { useIntl } from '@media-ui/core';

import { UsageDetailsGroup } from '../interfaces/UsageDetails';

import classes from './AssetUsageSection.module.css';

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
    const { translate } = useIntl();
    const { label, usages, metadataSchema } = usageDetailsGroup;

    return (
        <section className={classes.usageSection}>
            <h2>
                {label} ({usages.length})
            </h2>
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
