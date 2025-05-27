import { ApprovalAttainmentStrategyFactory, AssumeApprovalForEveryAction } from '@media-ui/core/src/strategy';

export const MediaDetailsScreenApprovalAttainmentStrategyFactory: ApprovalAttainmentStrategyFactory = (deps) => ({
    ...AssumeApprovalForEveryAction,
    obtainApprovalToUpdateAsset: ({ asset }) =>
        deps.interaction.confirm({
            title: deps.intl.translate('actions.updateAsset.confirm.title', 'Update Asset', [asset.label]),
            message: deps.intl.translate(
                'actions.updateAsset.confirm.message',
                `Please be aware that updating asset "${asset.label}" will affect all of its occurrences on every page. Do you still wish to proceed?`,
                [asset.label]
            ),
            buttonLabel: deps.intl.translate(
                'actions.updateAsset.confirm.buttonLabel',
                'Yes, proceed with updating the asset',
                [asset.label]
            ),
        }),
    obtainApprovalToSetAssetTags: ({ asset }) =>
        deps.interaction.confirm({
            title: deps.intl.translate('actions.setAssetTags.confirm.title', 'Set Asset Tags', [asset.label]),
            message: deps.intl.translate(
                'actions.setAssetTags.confirm.message',
                `Please be aware that changing the asset tags of asset "${asset.label}" will affect all of its occurrences on every page. Do you still wish to proceed?`,
                [asset.label]
            ),
            buttonLabel: deps.intl.translate(
                'actions.setAssetTags.confirm.buttonLabel',
                'Yes, proceed with setting the asset tags',
                [asset.label]
            ),
        }),
    obtainApprovalToSetAssetCollections: ({ asset }) =>
        deps.interaction.confirm({
            title: deps.intl.translate('actions.setAssetCollections.confirm.title', 'Set Asset Collections', [
                asset.label,
            ]),
            message: deps.intl.translate(
                'actions.setAssetCollections.confirm.message',
                `Please be aware that changing the asset collections of asset "${asset.label}" will affect all of its occurrences on every page. Do you still wish to proceed?`,
                [asset.label]
            ),
            buttonLabel: deps.intl.translate(
                'actions.setAssetCollections.confirm.buttonLabel',
                'Yes, proceed with setting the asset collections',
                [asset.label]
            ),
        }),
    obtainApprovalToDeleteAsset: ({ asset }) =>
        deps.interaction.confirm({
            title: deps.intl.translate('actions.deleteAsset.confirm.title', 'Delete Asset', [asset.label]),
            message: deps.intl.translate(
                'action.deleteAsset.confirm.message',
                `Do you really want to delete the asset "${asset.label}"?`,
                [asset.label]
            ),
            buttonLabel: deps.intl.translate(
                'actions.deleteAsset.confirm.buttonLabel',
                'Yes, proceed with deleting the asset',
                [asset.label]
            ),
        }),
    obtainApprovalToReplaceAsset: ({ asset }) =>
        deps.interaction.confirm({
            title: deps.intl.translate('actions.replaceAsset.confirm.title', 'Replace Asset', [asset.label]),
            message: deps.intl.translate(
                'action.replaceAsset.confirm.message',
                `Do you really want to replace the asset "${asset.label}"?`,
                [asset.label]
            ),
            buttonLabel: deps.intl.translate(
                'actions.replaceAsset.confirm.buttonLabel',
                'Yes, proceed with replacing the asset',
                [asset.label]
            ),
        }),
});
