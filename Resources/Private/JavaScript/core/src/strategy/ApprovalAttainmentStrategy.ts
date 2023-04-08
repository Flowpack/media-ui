import { AssetCollection } from '@media-ui/feature-asset-collections';
import { Tag } from '@media-ui/feature-asset-tags';

import { Asset } from '../interfaces';
import { I18nRegistry, Interaction } from '../provider';

export interface ApprovalAttainmentStrategy {
    obtainApprovalToUpdateAsset: (given: { asset: Asset }) => Promise<boolean>;
    obtainApprovalToSetAssetTags: (given: { asset: Asset; newTags: Tag[] }) => Promise<boolean>;
    obtainApprovalToSetAssetCollections: (given: {
        asset: Asset;
        newAssetCollections: AssetCollection[];
    }) => Promise<boolean>;
    obtainApprovalToDeleteAsset: (given: { asset: Asset }) => Promise<boolean>;
    obtainApprovalToDeleteAssetCollection: (given: { assetCollection: AssetCollection }) => Promise<boolean>;
    obtainApprovalToDeleteTag: (given: { tag: Tag }) => Promise<boolean>;
    obtainApprovalToReplaceAsset: (given: { asset: Asset }) => Promise<boolean>;
    obtainApprovalToEditAsset: (given: { asset: Asset }) => Promise<boolean>;
}

const assumeApproval = () => Promise.resolve(true);

export const AssumeApprovalForEveryAction: ApprovalAttainmentStrategy = {
    obtainApprovalToUpdateAsset: assumeApproval,
    obtainApprovalToSetAssetTags: assumeApproval,
    obtainApprovalToSetAssetCollections: assumeApproval,
    obtainApprovalToDeleteAsset: assumeApproval,
    obtainApprovalToDeleteAssetCollection: assumeApproval,
    obtainApprovalToDeleteTag: assumeApproval,
    obtainApprovalToReplaceAsset: assumeApproval,
    obtainApprovalToEditAsset: assumeApproval,
};

export interface ApprovalAttainmentStrategyFactory {
    (deps: { interaction: Interaction; intl: I18nRegistry }): ApprovalAttainmentStrategy;
}

export const DefaultApprovalAttainmentStrategyFactory: ApprovalAttainmentStrategyFactory = (deps) => ({
    ...AssumeApprovalForEveryAction,
    obtainApprovalToDeleteAsset: ({ asset }) =>
        deps.interaction.confirm({
            title: deps.intl.translate('actions.deleteAsset.confirm.title', 'Delete Asset', [asset.label]),
            message: deps.intl.translate(
                'action.deleteAsset.confirm.message',
                `Do you really want to delete the asset "${asset.label}"`,
                [asset.label]
            ),
            buttonLabel: deps.intl.translate(
                'actions.deleteAsset.confirm.buttonLabel',
                'Yes, proceed with deleting the asset',
                [asset.label]
            ),
        }),
    obtainApprovalToDeleteAssetCollection: ({ assetCollection }) =>
        deps.interaction.confirm({
            title: deps.intl.translate('actions.deleteAssetCollection.confirm.title', 'Delete collection', [
                assetCollection.title,
            ]),
            message: deps.intl.translate(
                'action.deleteAssetCollection.confirm.message',
                `Do you really want to delete the collection "${assetCollection.title}"`,
                [assetCollection.title]
            ),
            buttonLabel: deps.intl.translate(
                'actions.deleteAssetCollection.confirm.buttonLabel',
                'Yes, proceed with deleting the collection',
                [assetCollection.title]
            ),
        }),
    obtainApprovalToDeleteTag: ({ tag }) =>
        deps.interaction.confirm({
            title: deps.intl.translate('actions.deleteTag.confirm.title', 'Delete tag', [tag.label]),
            message: deps.intl.translate(
                'action.deleteTag.confirm.message',
                `Do you really want to delete the tag "${tag.label}"`,
                [tag.label]
            ),
            buttonLabel: deps.intl.translate(
                'actions.deleteTag.confirm.buttonLabel',
                'Yes, proceed with deleting the tag',
                [tag.label]
            ),
        }),
});
