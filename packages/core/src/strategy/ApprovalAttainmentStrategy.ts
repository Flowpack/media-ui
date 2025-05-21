import { Interaction } from '../provider';

// TODO: Feature packages should be able to extend the ApprovalAttainmentStrategy with their own methods.
export interface ApprovalAttainmentStrategy {
    obtainApprovalToUpdateAsset: (given: { asset: Asset }) => Promise<boolean>;
    obtainApprovalToSetAssetTags: (given: { asset: Asset; newTags: Tag[] }) => Promise<boolean>;
    obtainApprovalToSetAssetCollections: (given: {
        asset: Asset;
        newAssetCollections: AssetCollection[];
    }) => Promise<boolean>;
    obtainApprovalToDeleteAsset: (given: { asset: Asset }) => Promise<boolean>;
    obtainApprovalToDeleteAssets: (given: { assets: AssetIdentity[] }) => Promise<boolean>;
    obtainApprovalToDeleteAssetCollection: (given: { assetCollection: AssetCollection }) => Promise<boolean>;
    obtainApprovalToDeleteTag: (given: { tag: Tag }) => Promise<boolean>;
    obtainApprovalToReplaceAsset: (given: { asset: Asset }) => Promise<boolean>;
    obtainApprovalToEditAsset: (given: { asset: Asset }) => Promise<boolean>;
    obtainApprovalToFlushClipboard: () => Promise<boolean>;
    obtainApprovalToMoveAssetCollection: (given: { assetCollection: AssetCollection }) => Promise<boolean>;
}

const assumeApproval = () => Promise.resolve(true);

export const AssumeApprovalForEveryAction: ApprovalAttainmentStrategy = {
    obtainApprovalToUpdateAsset: assumeApproval,
    obtainApprovalToSetAssetTags: assumeApproval,
    obtainApprovalToSetAssetCollections: assumeApproval,
    obtainApprovalToDeleteAsset: assumeApproval,
    obtainApprovalToDeleteAssets: assumeApproval,
    obtainApprovalToDeleteAssetCollection: assumeApproval,
    obtainApprovalToDeleteTag: assumeApproval,
    obtainApprovalToReplaceAsset: assumeApproval,
    obtainApprovalToEditAsset: assumeApproval,
    obtainApprovalToFlushClipboard: assumeApproval,
    obtainApprovalToMoveAssetCollection: assumeApproval,
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
                `Do you really want to delete the asset "${asset.label}"?`,
                [asset.label]
            ),
            buttonLabel: deps.intl.translate(
                'actions.deleteAsset.confirm.buttonLabel',
                'Yes, proceed with deleting the asset',
                [asset.label]
            ),
        }),
    obtainApprovalToDeleteAssets: ({ assets }) =>
        deps.interaction.confirm({
            title: deps.intl.translate('actions.deleteAssets.confirm.title', 'Delete Assets', [assets.length]),
            message: deps.intl.translate(
                'action.deleteAssets.confirm.message',
                `Do you really want to delete ${assets.length} assets?`,
                [assets.length]
            ),
            buttonLabel: deps.intl.translate(
                'actions.deleteAssets.confirm.buttonLabel',
                'Yes, proceed with deleting the assets',
                [assets.length]
            ),
        }),
    obtainApprovalToDeleteAssetCollection: ({ assetCollection }) =>
        deps.interaction.confirm({
            title: deps.intl.translate('actions.deleteAssetCollection.confirm.title', 'Delete collection', [
                assetCollection.title,
            ]),
            message: deps.intl.translate(
                'action.deleteAssetCollection.confirm.message',
                `Do you really want to delete the collection "${assetCollection.title}"?`,
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
                `Do you really want to delete the tag "${tag.label}"?`,
                [tag.label]
            ),
            buttonLabel: deps.intl.translate(
                'actions.deleteTag.confirm.buttonLabel',
                'Yes, proceed with deleting the tag',
                [tag.label]
            ),
        }),
    obtainApprovalToFlushClipboard: () =>
        deps.interaction.confirm({
            title: deps.intl.translate('actions.flushClipboard.confirm.title', 'Flush clipboard'),
            message: deps.intl.translate(
                'actions.flushClipboard.confirm.message',
                `Do you really want to remove all assets from the clipboard?`
            ),
            buttonLabel: deps.intl.translate(
                'actions.flushClipboard.confirm.buttonLabel',
                'Yes, proceed with flushing the clipboard'
            ),
        }),
    obtainApprovalToMoveAssetCollection: ({ assetCollection }) =>
        deps.interaction.confirm({
            title: deps.intl.translate('actions.moveAssetCollection.confirm.title', 'Move collection', [
                assetCollection.title,
            ]),
            message: deps.intl.translate(
                'action.moveAssetCollection.confirm.message',
                `Do you really want to move the collection "${assetCollection.title}" and its assets?`,
                [assetCollection.title]
            ),
            buttonLabel: deps.intl.translate(
                'actions.moveAssetCollection.confirm.buttonLabel',
                'Yes, proceed with moving the collection',
                [assetCollection.title]
            ),
        }),
});
