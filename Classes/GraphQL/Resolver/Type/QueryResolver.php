<?php
declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Resolver\Type;

use Neos\Flow\Annotations as Flow;
use Neos\Flow\Persistence\Exception\InvalidQueryException;
use Neos\Flow\Persistence\QueryResultInterface;
use Neos\Media\Domain\Model\Asset;
use Neos\Media\Domain\Model\AssetCollection;
use Neos\Media\Domain\Model\AssetSource\AssetProxyQueryInterface;
use Neos\Media\Domain\Model\AssetSource\AssetProxyQueryResultInterface;
use Neos\Media\Domain\Model\AssetSource\AssetSourceInterface;
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
        $query = $this->createAssetProxyQuery($variables['assetSource'], $variables['tag'],
            $variables['assetCollection']);

        try {
            return $query->count();
        } catch (\Exception $e) {
            // TODO: Handle that not every asset source implements the count method => Introduce countable interface?
        }
        return 0;
    }

    /**
     * @param $_
     * @param array $variables
     * @return AssetProxyQueryResultInterface
     */
    public function assetProxies($_, array $variables): AssetProxyQueryResultInterface
    {
        $limit = array_key_exists('limit', $variables) ? $variables['limit'] : 20;
        $offset = array_key_exists('offset', $variables) ? $variables['offset'] : 0;

        $query = $this->createAssetProxyQuery($variables['assetSource'], $variables['tag'],
            $variables['assetCollection']);

        try {
            $offset = $offset < $query->count() ? $offset : 0;
        } catch (\Exception $e) {
            // TODO: Handle that not every asset source implements the count method => Introduce countable interface?
        }

        $query->setOffset($offset);
        $query->setLimit($limit);

        return $query->execute();
    }

    /**
     * @param string $assetSourceName
     * @param string|null $tag
     * @param string|null $assetCollection
     * @return AssetProxyQueryInterface|null
     */
    protected function createAssetProxyQuery(
        string $assetSourceName = 'neos',
        string $tag = null,
        string $assetCollection = null
    ): ?AssetProxyQueryInterface {
        if (array_key_exists($assetSourceName, $this->assetSources)) {
            /** @var AssetSourceInterface $activeAssetSource */
            $activeAssetSource = $this->assetSources[$assetSourceName];
        } else {
            return null;
        }

        $assetProxyRepository = $activeAssetSource->getAssetProxyRepository();

        if ($assetCollection && $assetProxyRepository instanceof SupportsCollectionsInterface) {
            /** @var AssetCollection $assetCollection */
            /** @noinspection PhpUndefinedMethodInspection */
            $assetCollection = $this->assetCollectionRepository->findOneByTitle($assetCollection);
            if ($assetCollection) {
                $assetProxyRepository->filterByCollection($assetCollection);
            }
        }

        // TODO: Implement sorting via `SupportsSortingInterface`

        // TODO: Implement filtering by type

        if ($tag && $assetProxyRepository instanceof SupportsTaggingInterface) {
            /** @var Tag $tag */
            /** @noinspection PhpUndefinedMethodInspection */
            $tag = $this->tagRepository->findOneByLabel($tag);
            if ($tag) {
                return $assetProxyRepository->findByTag($tag)->getQuery();
            }
        }

        return $assetProxyRepository->findAll()->getQuery();
    }

    /**
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

        // TODO: Remove this method (and the schema) and only allow access to assets via AssetProxies or add more filter methods

        return $this->assetRepository->findAll()->toArray();
    }

    /**
     * @param $_
     * @param array $variables
     * @return array<Tag>
     */
    public function tags($_, array $variables): array
    {
        return $this->tagRepository->findAll()->toArray();
    }

    /**
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
     * @return QueryResultInterface
     */
    public function assetCollections($_, array $variables): QueryResultInterface
    {
        return $this->assetCollectionRepository->findAll();
    }

    /**
     * @param $_
     * @param array $variables
     * @return Asset|object|null
     */
    public function asset($_, array $variables)
    {
        $identifier = $variables['identifier'];
        return $this->assetRepository->findByIdentifier($identifier);
    }
}
