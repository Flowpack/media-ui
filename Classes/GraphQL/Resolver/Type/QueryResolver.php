<?php
declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Resolver\Type;

use Neos\Flow\Annotations as Flow;
use Neos\Flow\Persistence\Exception\InvalidQueryException;
use Neos\Media\Domain\Model\Asset;
use Neos\Media\Domain\Model\AssetCollection;
use Neos\Media\Domain\Model\AssetSource\AssetProxy\AssetProxyInterface;
use Neos\Media\Domain\Model\AssetSource\AssetProxyQueryInterface;
use Neos\Media\Domain\Model\AssetSource\AssetProxyQueryResultInterface;
use Neos\Media\Domain\Model\AssetSource\AssetSourceInterface;
use Neos\Media\Domain\Model\AssetSource\AssetTypeFilter;
use Neos\Media\Domain\Model\AssetSource\SupportsCollectionsInterface;
use Neos\Media\Domain\Model\AssetSource\SupportsTaggingInterface;
use Neos\Media\Domain\Model\Tag;
use Neos\Media\Domain\Repository\AssetCollectionRepository;
use Neos\Media\Domain\Repository\AssetRepository;
use Neos\Media\Domain\Repository\TagRepository;
use Neos\Media\Domain\Service\AssetSourceService;
use Psr\Log\LoggerInterface;
use t3n\GraphQL\ResolverInterface;

/**
 * @Flow\Scope("singleton")
 */
class QueryResolver implements ResolverInterface
{
    /**
     * @Flow\Inject
     * @var AssetRepository
     */
    protected $assetRepository;

    /**
     * @Flow\Inject
     * @var TagRepository
     */
    protected $tagRepository;

    /**
     * @Flow\Inject
     * @var AssetSourceService
     */
    protected $assetSourceService;

    /**
     * @var array<AssetSourceInterface>
     */
    protected $assetSources;

    /**
     * @Flow\Inject
     * @var AssetCollectionRepository
     */
    protected $assetCollectionRepository;

    /**
     * @Flow\Inject
     * @var LoggerInterface
     */
    protected $systemLogger;

    /**
     * @return void
     */
    public function initializeObject(): void
    {
        $this->assetSources = $this->assetSourceService->getAssetSources();
    }

    /**
     * Returns total count of asset proxies in the given asset source
     *
     * @param $_
     * @param array $variables
     * @return int
     */
    public function assetCount($_, array $variables): int
    {
        $query = $this->createAssetProxyQuery($variables);

        if (!$query) {
            // TODO: Add logging
            return 0;
        }

        try {
            return $query->execute()->count();
        } catch (\Exception $e) {
            // TODO: Handle that not every asset source implements the count method => Introduce countable interface?
        }
        return 0;
    }

    /**
     * Provides a filterable list of asset proxies. These are the main entities for media management.
     *
     * @param $_
     * @param array $variables
     * @return AssetProxyQueryResultInterface
     */
    public function assetProxies($_, array $variables): AssetProxyQueryResultInterface
    {
        $limit = array_key_exists('limit', $variables) ? $variables['limit'] : 20;
        $offset = array_key_exists('offset', $variables) ? $variables['offset'] : 0;

        $query = $this->createAssetProxyQuery($variables);

        if (!$query) {
            // TODO: Add logging
            return null;
        }

        try {
            // TODO: Check if it's an issue to execute the query a second time just to get the correct number of results?
            $offset = $offset < $query->execute()->count() ? $offset : 0;
        } catch (\Exception $e) {
            // TODO: Handle that not every asset source implements the count method => Introduce countable interface?
        }

        $query->setOffset($offset);
        $query->setLimit($limit);

        // TODO: It's not possible to use `toArray` here as not all asset sources implement it
        return $query->execute();
    }

    /**
     * Helper to create a asset proxy query for other methods
     *
     * @param array $variables
     * @return AssetProxyQueryInterface|null
     */
    protected function createAssetProxyQuery(array $variables = []): ?AssetProxyQueryInterface {
        $assetSourceName = $variables['assetSource'] ?? 'neos';
        $tag = $variables['tag'] ?? null;
        $assetCollection = $variables['assetCollection'] ?? null;
        $assetType = $variables['assetType'] ?? null;
        $searchTerm = $variables['searchTerm'] ?? null;
        $localOnly = $variables['localOnly'] ?? false;

        if (array_key_exists($assetSourceName, $this->assetSources)) {
            /** @var AssetSourceInterface $activeAssetSource */
            $activeAssetSource = $this->assetSources[$assetSourceName];
        } else {
            return null;
        }

        $assetProxyRepository = $activeAssetSource->getAssetProxyRepository();

        if (is_string($assetType) && !empty($assetType)) {
            // TODO: Catch possible errors with wrong types
            $assetProxyRepository->filterByType(new AssetTypeFilter($assetType));
        }

        if ($assetCollection && $assetProxyRepository instanceof SupportsCollectionsInterface) {
            /** @var AssetCollection $assetCollection */
            /** @noinspection PhpUndefinedMethodInspection */
            $assetCollection = $this->assetCollectionRepository->findOneByTitle($assetCollection);
            if ($assetCollection) {
                $assetProxyRepository->filterByCollection($assetCollection);
            }
        }

        // TODO: Implement sorting via `SupportsSortingInterface`

        if ($tag && $assetProxyRepository instanceof SupportsTaggingInterface) {
            /** @var Tag $tag */
            /** @noinspection PhpUndefinedMethodInspection */
            $tag = $this->tagRepository->findOneByLabel($tag);
            if ($tag) {
                return $assetProxyRepository->findByTag($tag)->getQuery();
            }
        }

        if (is_string($searchTerm) && !empty($searchTerm)) {
            return $assetProxyRepository->findBySearchTerm($searchTerm)->getQuery();
        }

        return $assetProxyRepository->findAll()->getQuery();
    }

    /**
     * Provides a filterable list of assets.
     * The asset proxies are the preferred entity as they provide more information and include thumbnail uris, etc...
     * You can access the asset also vie the asset proxy.
     *
     * @param $_
     * @param array $variables
     * @return array<Asset>
     * @throws InvalidQueryException
     */
    public function assets($_, array $variables): array
    {
        if (array_key_exists('tag', $variables) && !empty($variables['tag'])) {
            /** @noinspection PhpUndefinedMethodInspection */
            $tag = $this->tagRepository->findOneByLabel($variables['tag']);
            return $tag ? $this->assetRepository->findByTag($tag)->toArray() : [];
        }

        // TODO: Discuss whether to remove this whole method (and the schema) and only allow access to assets via AssetProxies or add more filter/limit methods if it should stay
        return $this->assetRepository->findAll()->toArray();
    }

    /**
     * Provides a list of all tags
     *
     * @param $_
     * @param array $variables
     * @return array<Tag>
     */
    public function tags($_, array $variables): array
    {
        return $this->tagRepository->findAll()->toArray();
    }

    /**
     * Returns the list of all registered asset sources. By default the asset source `neos` should always exist.
     *
     * @param $_
     * @param array $variables
     * @return array<AssetSourceInterface>
     */
    public function assetSources($_, array $variables): array
    {
        return $this->assetSources;
    }

    /**
     * @param $_
     * @param array $variables
     * @return array<AssetCollection>
     */
    public function assetCollections($_, array $variables): array
    {
        return $this->assetCollectionRepository->findAll()->toArray();
    }

    /**
     * Returns a list of asset types which can be used for filtering in the assetProxy query
     *
     * @param $_
     * @param array $variables
     * @return array<string>
     */
    public function assetTypes($_, array $variables): array
    {
        // TODO: These types are currently privately defined in `NeosAssetProxyRepository` and should be available for the API as constants
        return [
            ['label' => 'All'],
            ['label' => 'Image'],
            ['label' => 'Document'],
            ['label' => 'Video'],
            ['label' => 'Audio']
        ];
    }

    /**
     * @param $_
     * @param array $variables
     * @return Asset|null
     */
    public function asset($_, array $variables)
    {
        $identifier = $variables['identifier'];
        /** @var Asset $asset */
        $asset = $this->assetRepository->findByIdentifier($identifier);
        return $asset;
    }
}
