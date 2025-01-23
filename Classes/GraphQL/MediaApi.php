<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL;

use Flowpack\Media\Ui\Domain\Model\HierarchicalAssetCollectionInterface;
use Flowpack\Media\Ui\Domain\Model\SearchTerm;
use Flowpack\Media\Ui\Exception as MediaUiException;
use Flowpack\Media\Ui\GraphQL\Context\AssetSourceContext;
use Flowpack\Media\Ui\GraphQL\Types\AssetSource;
use Flowpack\Media\Ui\Infrastructure\Neos\Media\AssetProxyIteratorBuilder;
use Flowpack\Media\Ui\Service\AssetChangeLog;
use Flowpack\Media\Ui\Service\AssetCollectionService;
use Flowpack\Media\Ui\Service\SimilarityService;
use Flowpack\Media\Ui\Service\UsageDetailsService;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Persistence\PersistenceManagerInterface;
use Neos\Flow\Security\Authorization\PrivilegeManagerInterface;
use Neos\Media\Domain\Model\AssetInterface;
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
use Wwwision\TypesGraphQL\Attributes\Query;

use function Wwwision\Types\instantiate;

#[Flow\Scope('singleton')]
final class MediaApi
{
    #[Flow\InjectConfiguration]
    protected array $settings = [];

    public function __construct(
        private readonly LoggerInterface $logger,
        private readonly AssetProxyIteratorBuilder $assetProxyIteratorBuilder,
        private readonly AssetCollectionRepository $assetCollectionRepository,
        private readonly AssetSourceContext $assetSourceContext,
        private readonly UsageDetailsService $usageDetailsService,
        private readonly PersistenceManagerInterface $persistenceManager,
        private readonly TagRepository $tagRepository,
        private readonly AssetCollectionService $assetCollectionService,
        private readonly PrivilegeManagerInterface $privilegeManager,
        private readonly AssetService $assetService,
        private readonly AssetChangeLog $assetChangeLog,
        private readonly SimilarityService $similarityService,
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
        return instantiate(
            Types\AssetCollections::class,
            array_map(function (HierarchicalAssetCollectionInterface $assetCollection) {
                return instantiate(Types\AssetCollection::class, [
                    'id' => $this->persistenceManager->getIdentifierByObject($assetCollection),
                    'title' => $assetCollection->getTitle(),
                    'path' => $assetCollection->getPath(),
                ]);
            }, $this->assetCollectionRepository->findAll()->toArray())
        );
    }

    #[Description('All configured asset sources (by default only the "neos" source)')]
    #[Query]
    public function assetSources(): Types\AssetSources
    {
        return instantiate(
            Types\AssetSources::class,
            array_map(static function (AssetSourceInterface $assetSource) {
                return AssetSource::fromAssetSource($assetSource);
            }, $this->assetSourceContext->getAssetSources())
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
        return instantiate(
            Types\Tags::class,
            array_map(function (Tag $tag) {
                return instantiate(Types\Tag::class, [
                    'id' => $this->persistenceManager->getIdentifierByObject($tag),
                    'label' => $tag->getLabel(),
                ]);
            }, $this->tagRepository->findAll()->toArray())
        );
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
        $assetProxy = $this->assetSourceContext->getAssetProxy($id, $assetSourceId);

        if (!$assetProxy || !$assetProxy->getLocalAssetIdentifier()) {
            return Types\UsageDetailsGroups::empty();
        }

        $asset = $this->assetSourceContext->getAssetForProxy($assetProxy);

        if (!$asset) {
            return Types\UsageDetailsGroups::empty();
        }

        return $this->usageDetailsService->resolveUsagesForAsset($asset);
    }

    #[Description('Returns the total usage count for the given asset')]
    #[Query]
    public function assetUsageCount(Types\AssetId $id, Types\AssetSourceId $assetSourceId): int
    {
        $assetProxy = $this->assetSourceContext->getAssetProxy($id, $assetSourceId);
        if (!$assetProxy || !$assetProxy->getLocalAssetIdentifier()) {
            return 0;
        }

        $asset = $this->assetSourceContext->getAssetForProxy($assetProxy);
        if (!$asset) {
            return 0;
        }

        return $this->assetService->getUsageCount($asset);
    }

    #[Description('Provides a list of all unused assets in local asset source')]
    #[Query]
    public function unusedAssets(int $limit = 20, int $offset = 0): Types\Assets
    {
        /** @var AssetInterface[] $assetProxies */
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
            'lastModified' => $changes->getLastModified(),
            'changes' => instantiate(Types\AssetChanges::class, $changes),
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
        $asset = $this->assetSourceContext->getAssetByLocalIdentifier($assetProxy->getLocalAssetIdentifier());

        /** @var VariantSupportInterface $originalAsset */
        $originalAsset = ($asset instanceof AssetVariantInterface ? $asset->getOriginalAsset() : $asset);

        return instantiate(Types\AssetVariants::class, array_map(static function (AssetVariantInterface $assetVariant) {
            return Types\AssetVariant::fromAssetVariant($assetVariant);
        }, $originalAsset->getVariants()));
    }

    /**
     * Returns a list of similar asset to the given asset
     */
    #[Query]
    public function similarAssets(Types\AssetId $id, Types\AssetSourceId $assetSourceId): Types\Assets
    {
        $assetProxy = $this->assetSourceContext->getAssetProxy($id, $assetSourceId);
        if (!$assetProxy) {
            return Types\Assets::empty();
        }

        $asset = $this->assetSourceContext->getAssetForProxy($assetProxy);
        if (!$asset) {
            return Types\Assets::empty();
        }

        $similarAssets = $this->similarityService->getSimilarAssets($asset);
        return Types\Assets::fromAssets($similarAssets);
    }
}
