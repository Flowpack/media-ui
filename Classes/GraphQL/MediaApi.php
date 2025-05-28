<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL;

/*
 * This file is part of the Flowpack.Media.Ui package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use Flowpack\Media\Ui\Domain\Model\Dto\MutationResult;
use Flowpack\Media\Ui\Domain\Model\HierarchicalAssetCollectionInterface;
use Flowpack\Media\Ui\Domain\Model\SearchTerm;
use Flowpack\Media\Ui\Exception;
use Flowpack\Media\Ui\Exception as MediaUiException;
use Flowpack\Media\Ui\GraphQL\Context\AssetSourceContext;
use Flowpack\Media\Ui\GraphQL\Mutator\AssetCollectionMutator;
use Flowpack\Media\Ui\GraphQL\Mutator\AssetMutator;
use Flowpack\Media\Ui\GraphQL\Mutator\TagMutator;
use Flowpack\Media\Ui\Infrastructure\Neos\Media\AssetProxyIteratorBuilder;
use Flowpack\Media\Ui\Service\AssetChangeLog;
use Flowpack\Media\Ui\Service\AssetCollectionService;
use Flowpack\Media\Ui\Service\SimilarityService;
use Flowpack\Media\Ui\Service\UsageDetailsService;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Persistence\Exception\IllegalObjectTypeException;
use Neos\Flow\Persistence\PersistenceManagerInterface;
use Neos\Flow\ResourceManagement\Exception as ResourceManagementException;
use Neos\Flow\Security\Authorization\PrivilegeManagerInterface;
use Neos\Media\Domain\Model\AssetSource\AssetSourceInterface;
use Neos\Media\Domain\Model\AssetSource\Neos\NeosAssetProxy;
use Neos\Media\Domain\Model\AssetVariantInterface;
use Neos\Media\Domain\Model\Tag;
use Neos\Media\Domain\Model\VariantSupportInterface;
use Neos\Media\Domain\Repository\AssetCollectionRepository;
use Neos\Media\Domain\Repository\TagRepository;
use Neos\Media\Domain\Service\AssetService;
use Neos\Utility\Exception\FilesException;
use Neos\Utility\Files;
use Psr\Log\LoggerInterface;
use Wwwision\Types\Attributes\Description;
use Wwwision\TypesGraphQL\Attributes\Mutation;
use Wwwision\TypesGraphQL\Attributes\Query;

use function Wwwision\Types\instantiate;

#[Flow\Scope('singleton')]
final class MediaApi
{
    #[Flow\InjectConfiguration]
    protected array $settings = [];

    public function __construct(
        private readonly AssetChangeLog $assetChangeLog,
        private readonly AssetCollectionRepository $assetCollectionRepository,
        private readonly AssetCollectionService $assetCollectionService,
        private readonly AssetCollectionMutator $assetCollectionMutator,
        private readonly AssetMutator $assetMutator,
        private readonly AssetProxyIteratorBuilder $assetProxyIteratorBuilder,
        private readonly AssetService $assetService,
        private readonly AssetSourceContext $assetSourceContext,
        private readonly LoggerInterface $logger,
        private readonly PersistenceManagerInterface $persistenceManager,
        private readonly PrivilegeManagerInterface $privilegeManager,
        private readonly SimilarityService $similarityService,
        private readonly TagMutator $tagMutator,
        private readonly TagRepository $tagRepository,
        private readonly UsageDetailsService $usageDetailsService,
    ) {
    }

    /**
     * Returns total count of asset proxies in the given asset source
     */
    #[Query]
    public function assetCount(
        Types\AssetSourceId $assetSourceId = null,
        Types\AssetCollectionId $assetCollectionId = null,
        Types\MediaType $mediaType = null,
        Types\AssetType $assetType = null,
        Types\TagId $tagId = null,
        string $searchTerm = null,
    ): int {
        $iterator = $this->assetProxyIteratorBuilder->build(
            $assetSourceId,
            $tagId,
            $assetCollectionId,
            $mediaType,
            $assetType,
            SearchTerm::from($searchTerm),
        );

        if (!$iterator) {
            $this->logger->error('Could not build asset query for given variables', func_get_args());
            return 0;
        }
        return count($iterator);
    }

    #[Description('Provides a filterable list of asset proxies. These are the main entities for media management.')]
    #[Query]
    public function assets(
        Types\AssetSourceId $assetSourceId = null,
        Types\AssetCollectionId $assetCollectionId = null,
        Types\MediaType $mediaType = null,
        Types\AssetType $assetType = null,
        Types\TagId $tagId = null,
        Types\SortBy $sortBy = null,
        Types\SortDirection $sortDirection = null,
        string $searchTerm = null,
        int $limit = 20,
        int $offset = 0,
    ): ?Types\Assets {
        $iterator = $this->assetProxyIteratorBuilder->build(
            $assetSourceId,
            $tagId,
            $assetCollectionId,
            $mediaType,
            $assetType,
            SearchTerm::from($searchTerm),
            $sortBy,
            $sortDirection,
        );

        if (!$iterator) {
            $this->logger->error('Could not build assets query for given variables', func_get_args());
            return null;
        }

        $iterator->setOffset($offset);
        $iterator->setLimit($limit);
        return Types\Assets::fromAssetProxies($iterator);
    }

    #[Description('All asset collections')]
    #[Query]
    public function assetCollections(): Types\AssetCollections
    {
        return Types\AssetCollections::fromArray(
            array_map(
                fn(HierarchicalAssetCollectionInterface $assetCollection) => instantiate(Types\AssetCollection::class, [
                    'id' => $this->persistenceManager->getIdentifierByObject($assetCollection),
                    'title' => $assetCollection->getTitle(),
                    'path' => $assetCollection->getPath(),
                ]), $this->assetCollectionRepository->findAll()->toArray()
            )
        );
    }

    #[Description('All configured asset sources (by default only the "neos" source)')]
    #[Query]
    public function assetSources(): Types\AssetSources
    {
        return Types\AssetSources::fromArray(array_map(
                static fn(AssetSourceInterface $assetSource) => Types\AssetSource::fromAssetSource($assetSource),
                $this->assetSourceContext->getAssetSources())
        );
    }

    /**
     * @throws MediaUiException
     */
    #[Description('Provides number of unused assets in local asset source')]
    #[Query]
    public function unusedAssetCount(): int
    {
        return $this->usageDetailsService->getUnusedAssetCount();
    }

    #[Description('Provides a list of all tags')]
    #[Query]
    public function tags(): Types\Tags
    {
        return Types\Tags::fromArray(array_map(
            fn(Tag $tag) => instantiate(Types\Tag::class, [
                'id' => $this->persistenceManager->getIdentifierByObject($tag),
                'label' => $tag->getLabel(),
            ]),
            $this->tagRepository->findAll()->toArray()
        ));
    }

    #[Description('Get tag by id')]
    #[Query]
    public function tag(?Types\TagId $id): ?Types\Tag
    {
        /** @var Tag $tag */
        $tag = $id ? $this->tagRepository->findByIdentifier($id->value) : null;
        return $tag ? instantiate(Types\Tag::class, [
            'id' => $id,
            'label' => $tag->getLabel(),
        ]) : null;
    }

    #[Description('Returns an asset collection by id')]
    #[Query]
    public function assetCollection(?Types\AssetCollectionId $id): ?Types\AssetCollection
    {
        /** @var HierarchicalAssetCollectionInterface $assetCollection */
        $assetCollection = $id ? $this->assetCollectionRepository->findByIdentifier($id->value) : null;
        return $assetCollection ? instantiate(Types\AssetCollection::class, [
            'id' => $id,
            'title' => $assetCollection->getTitle(),
            'path' => $assetCollection->getPath(),
        ]) : null;
    }

    #[Description('Returns an asset by id')]
    #[Query]
    public function asset(Types\AssetId $id, Types\AssetSourceId $assetSourceId): ?Types\Asset
    {
        $assetProxy = $this->assetSourceContext->getAssetProxy($id, $assetSourceId);
        return $assetProxy ? Types\Asset::fromAssetProxy($assetProxy) : null;
    }

    #[Description('Provides configuration values for interacting with the media API')]
    #[Query]
    public function config(): Types\Config
    {
        $defaultAssetCollection = $this->assetCollectionService->getDefaultCollectionForCurrentSite();

        return instantiate(Types\Config::class, [
            'uploadMaxFileSize' => $this->getMaximumFileUploadSize(),
            'uploadMaxFileUploadLimit' => $this->getMaximumFileUploadLimit(),
            'currentServerTime' => Types\DateTime::now(),
            'defaultAssetCollectionId' => $defaultAssetCollection ? $this->persistenceManager->getIdentifierByObject($defaultAssetCollection) : null,
            'canManageTags' => $this->privilegeManager->isPrivilegeTargetGranted('Flowpack.Media.Ui:ManageTags'),
            'canManageAssetCollections' => $this->privilegeManager->isPrivilegeTargetGranted('Flowpack.Media.Ui:ManageAssetCollections'),
            'canManageAssets' => $this->privilegeManager->isPrivilegeTargetGranted('Flowpack.Media.Ui:ManageAssets'),
        ]);
    }

    /**
     * Returns the lowest configured maximum upload file size
     */
    protected function getMaximumFileUploadSize(): int
    {
        try {
            return (int)min(
                Files::sizeStringToBytes(ini_get('post_max_size')),
                Files::sizeStringToBytes(ini_get('upload_max_filesize'))
            );
        } catch (FilesException) {
            return 0;
        }
    }

    /**
     * Returns the maximum number of files that can be uploaded
     */
    protected function getMaximumFileUploadLimit(): int
    {
        return (int)($this->settings['maximumFileUploadLimit'] ?? 10);
    }

    #[Description('Returns a list of accessible and inaccessible relations for the given asset')]
    #[QUERY]
    public function assetUsageDetails(Types\AssetId $id, Types\AssetSourceId $assetSourceId): Types\UsageDetailsGroups
    {
        $asset = $this->assetSourceContext->getAsset($id, $assetSourceId);
        return $asset ?
            $this->usageDetailsService->resolveUsagesForAsset($asset) : Types\UsageDetailsGroups::empty();
    }

    #[Description('Returns the total usage count for the given asset')]
    #[Query]
    public function assetUsageCount(Types\AssetId $id, Types\AssetSourceId $assetSourceId): int
    {
        $asset = $this->assetSourceContext->getAsset($id, $assetSourceId);
        return $asset ? $this->assetService->getUsageCount($asset) : 0;
    }

    #[Description('Provides a list of all unused assets in local asset source')]
    #[Query]
    public function unusedAssets(int $limit = 20, int $offset = 0): Types\Assets
    {
        $assets = [];
        try {
            $assets = $this->usageDetailsService->getUnusedAssets($limit, $offset, Types\AssetSourceId::default());
        } catch (MediaUiException $e) {
            $this->logger->error('Could not retrieve unused assets', ['exception' => $e]);
        }
        return Types\Assets::fromAssets($assets);
    }

    #[Description('Provides a list of changes to assets since a given timestamp')]
    #[Query]
    public function changedAssets(Types\DateTime $since = null): Types\ChangedAssetsResult
    {
        $changes = $this->assetChangeLog->getChanges($since);
        return instantiate(Types\ChangedAssetsResult::class, [
            'changes' => $changes,
            'lastModified' => $changes->getLastModified(),
        ]);
    }

    #[Description('Returns a list of variants for the given asset')]
    #[Query]
    public function assetVariants(Types\AssetId $id, Types\AssetSourceId $assetSourceId): Types\AssetVariants
    {
        $assetProxy = $this->assetSourceContext->getAssetProxy($id, $assetSourceId);
        if (!($assetProxy instanceof NeosAssetProxy) || !($assetProxy->getAsset() instanceof VariantSupportInterface)) {
            return Types\AssetVariants::empty();
        }
        $asset = $assetProxy->getAsset();

        /** @var VariantSupportInterface $originalAsset */
        $originalAsset = ($asset instanceof AssetVariantInterface ? $asset->getOriginalAsset() : $asset);

        return Types\AssetVariants::fromAssetVariants($originalAsset->getVariants());
    }

    /**
     * Returns a list of similar asset to the given asset
     */
    #[Query]
    public function similarAssets(Types\AssetId $id, Types\AssetSourceId $assetSourceId): Types\Assets
    {
        $asset = $this->assetSourceContext->getAsset($id, $assetSourceId);
        if (!$asset) {
            return Types\Assets::empty();
        }
        $similarAssets = $this->similarityService->getSimilarAssets($asset);
        return Types\Assets::fromAssets($similarAssets);
    }

    /**
     * @throws MediaUiException
     */
    #[Mutation]
    public function updateAsset(
        Types\AssetId $id,
        Types\AssetSourceId $assetSourceId,
        string $label = null,
        string $caption = null,
        string $copyrightNotice = null
    ): ?Types\Asset {
        return $this->assetMutator->updateAsset($id, $assetSourceId, $label, $caption, $copyrightNotice);
    }

    /**
     * @throws MediaUiException
     */
    #[Mutation]
    public function tagAsset(Types\AssetId $id, Types\AssetSourceId $assetSourceId, Types\TagId $tagId): ?Types\Asset
    {
        return $this->assetMutator->tagAsset($id, $assetSourceId, $tagId);
    }

    /**
     * @throws MediaUiException
     */
    #[Mutation]
    public function untagAsset(Types\AssetId $id, Types\AssetSourceId $assetSourceId, Types\TagId $tagId): ?Types\Asset
    {
        return $this->assetMutator->untagAsset($id, $assetSourceId, $tagId);
    }

    /**
     * @throws MediaUiException
     */
    #[Mutation]
    public function deleteAsset(Types\AssetId $id, Types\AssetSourceId $assetSourceId): MutationResult
    {
        return $this->assetMutator->deleteAsset($id, $assetSourceId);
    }

    /**
     * @throws MediaUiException
     */
    #[Mutation]
    public function setAssetTags(
        Types\AssetId $id,
        Types\AssetSourceId $assetSourceId,
        Types\TagIds $tagIds
    ): ?Types\Asset {
        return $this->assetMutator->setAssetTags($id, $assetSourceId, $tagIds);
    }

    /**
     * @throws MediaUiException
     */
    #[Mutation]
    public function setAssetCollections(
        Types\AssetId $id,
        Types\AssetSourceId $assetSourceId,
        Types\AssetCollectionIds $assetCollectionIds
    ): MutationResult {
        return $this->assetMutator->setAssetCollections($id, $assetSourceId, $assetCollectionIds);
    }

    /**
     * @throws IllegalObjectTypeException
     */
    #[Mutation]
    public function createAssetCollection(
        Types\AssetCollectionTitle $title,
        ?Types\AssetCollectionId $parent = null,
    ): ?Types\AssetCollection {
        return $this->assetCollectionMutator->createAssetCollection(
            $title,
            $parent,
        );
    }

    /**
     * @throws IllegalObjectTypeException
     * @throws MediaUiException
     */
    #[Mutation]
    public function deleteAssetCollection(
        Types\AssetCollectionId $id,
    ): MutationResult {
        return $this->assetCollectionMutator->deleteAssetCollection($id);
    }

    /**
     * @throws IllegalObjectTypeException
     * @throws MediaUiException
     */
    #[Mutation]
    public function updateAssetCollection(
        Types\AssetCollectionId $id,
        ?Types\AssetCollectionTitle $title = null,
        ?Types\TagIds $tagIds = null,
    ): MutationResult {
        return $this->assetCollectionMutator->updateAssetCollection($id, $title, $tagIds);
    }

    /**
     * @throws IllegalObjectTypeException
     */
    #[Mutation]
    public function setAssetCollectionParent(
        Types\AssetCollectionId $id,
        ?Types\AssetCollectionId $parent = null,
    ): MutationResult {
        return $this->assetCollectionMutator->setAssetCollectionParent($id, $parent);
    }

    /**
     * Replaces an asset and its usages
     *
     * @throws MediaUiException
     */
    #[Mutation]
    public function replaceAsset(
        Types\AssetId $id,
        Types\AssetSourceId $assetSourceId,
        Types\UploadedFile $file,
        Types\AssetReplacementOptions $options,
    ): Types\FileUploadResult {
        return $this->assetMutator->replaceAsset(
            $id,
            $assetSourceId,
            $file,
            $options
        );
    }

    /**
     * @throws MediaUiException|ResourceManagementException
     */
    #[Mutation]
    public function editAsset(
        Types\AssetId $id,
        Types\AssetSourceId $assetSourceId,
        Types\Filename $filename,
        Types\AssetEditOptions $options,
    ): MutationResult {
        return $this->assetMutator->editAsset($id, $assetSourceId, $filename, $options);
    }

    /**
     * @throws MediaUiException
     */
    #[Mutation]
    public function importAsset(Types\AssetId $id, Types\AssetSourceId $assetSourceId): ?Types\Asset
    {
        return $this->assetMutator->importAsset($id, $assetSourceId);
    }

    /**
     * Stores all given files and returns an array of results for each upload
     */
    #[Mutation]
    public function uploadFiles(
        Types\UploadedFiles $files = null,
        Types\TagId $tagId = null,
        Types\AssetCollectionId $assetCollectionId = null
    ): Types\FileUploadResults {
        return $this->assetMutator->uploadFiles(
            $files,
            $tagId,
            $assetCollectionId
        );
    }

    /**
     * @throws Exception|IllegalObjectTypeException
     */
    #[Mutation]
    public function createTag(Types\TagLabel $label, Types\AssetCollectionId $assetCollectionId = null): Types\Tag
    {
        return $this->tagMutator->createTag($label, $assetCollectionId);
    }

    /**
     * @throws Exception|IllegalObjectTypeException
     */
    #[Mutation]
    public function updateTag(Types\TagId $id, Types\TagLabel $label = null): Types\Tag
    {
        return $this->tagMutator->updateTag($id, $label);
    }

    /**
     * @throws Exception|IllegalObjectTypeException
     */
    #[Mutation]
    public function deleteTag(Types\TagId $id): MutationResult
    {
        return $this->tagMutator->deleteTag($id);
    }
}
