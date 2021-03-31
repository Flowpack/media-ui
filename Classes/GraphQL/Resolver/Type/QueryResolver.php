<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Resolver\Type;

/*
 * This file is part of the Flowpack.Media.Ui package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use Flowpack\Media\Ui\Exception as MediaUiException;
use Flowpack\Media\Ui\GraphQL\Context\AssetSourceContext;
use Flowpack\Media\Ui\Service\AssetChangeLog;
use Flowpack\Media\Ui\Service\SimilarityService;
use Flowpack\Media\Ui\Service\UsageDetailsService;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Persistence\Doctrine\PersistenceManager;
use Neos\Media\Domain\Model\AssetCollection;
use Neos\Media\Domain\Model\AssetSource\AssetProxy\AssetProxyInterface;
use Neos\Media\Domain\Model\AssetSource\AssetProxyQueryInterface;
use Neos\Media\Domain\Model\AssetSource\AssetProxyQueryResultInterface;
use Neos\Media\Domain\Model\AssetSource\AssetSourceInterface;
use Neos\Media\Domain\Model\AssetSource\AssetTypeFilter;
use Neos\Media\Domain\Model\AssetSource\Neos\NeosAssetProxy;
use Neos\Media\Domain\Model\AssetSource\Neos\NeosAssetSource;
use Neos\Media\Domain\Model\AssetSource\SupportsCollectionsInterface;
use Neos\Media\Domain\Model\AssetSource\SupportsTaggingInterface;
use Neos\Media\Domain\Model\Tag;
use Neos\Media\Domain\Repository\AssetCollectionRepository;
use Neos\Media\Domain\Repository\TagRepository;
use Neos\Media\Domain\Service\AssetService;
use Neos\Utility\Exception\FilesException;
use Neos\Utility\Files;
use Psr\Log\LoggerInterface;
use t3n\GraphQL\ResolverInterface;

/**
 * @Flow\Scope("singleton")
 */
class QueryResolver implements ResolverInterface
{

    /**
     * @Flow\Inject
     * @var TagRepository
     */
    protected $tagRepository;

    /**
     * @Flow\Inject
     * @var AssetCollectionRepository
     */
    protected $assetCollectionRepository;

    /**
     * @Flow\Inject
     * @var AssetService
     */
    protected $assetService;

    /**
     * @Flow\Inject
     * @var LoggerInterface
     */
    protected $systemLogger;

    /**
     * @Flow\Inject
     * @var UsageDetailsService
     */
    protected $assetUsageService;

    /**
     * @Flow\Inject
     * @var AssetChangeLog
     */
    protected $assetChangeLog;

    /**
     * @Flow\Inject
     * @var SimilarityService
     */
    protected $similarityService;

    /**
     * @Flow\Inject
     * @var PersistenceManager
     */
    protected $persistenceManager;

    /**
     * Returns total count of asset proxies in the given asset source
     *
     * @param $_
     * @param array $variables
     * @param AssetSourceContext $assetSourceContext
     * @return int
     * @noinspection PhpUnusedParameterInspection
     */
    public function assetCount($_, array $variables, AssetSourceContext $assetSourceContext): int
    {
        $query = $this->createAssetProxyQuery($variables, $assetSourceContext);

        if (!$query) {
            $this->systemLogger->error('Could not build asset query for given variables', $variables);
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
     * Helper to create a asset proxy query for other methods
     *
     * @param array $variables
     * @param AssetSourceContext $assetSourceContext
     * @return AssetProxyQueryInterface|null
     */
    protected function createAssetProxyQuery(
        array $variables,
        AssetSourceContext $assetSourceContext
    ): ?AssetProxyQueryInterface {
        [
            'assetSourceId' => $assetSourceId,
            'tagId' => $tagId,
            'assetCollectionId' => $assetCollectionId,
            'mediaType' => $mediaType,
            'searchTerm' => $searchTerm,
        ] = $variables + [
            'assetSourceId' => 'neos',
            'tagId' => null,
            'assetCollectionId' => null,
            'mediaType' => null,
            'searchTerm' => null
        ];

        $activeAssetSource = $assetSourceContext->getAssetSource($assetSourceId);
        if (!$activeAssetSource) {
            return null;
        }
        $assetProxyRepository = $activeAssetSource->getAssetProxyRepository();

        if (is_string($mediaType) && !empty($mediaType)) {
            try {
                $assetTypeFilter = new AssetTypeFilter(ucfirst($mediaType));
                $assetProxyRepository->filterByType($assetTypeFilter);
            } catch (\InvalidArgumentException $e) {
                $this->systemLogger->warning('Ignoring invalid mediatype when filtering assets ' . $mediaType);
            }
        }

        if ($assetCollectionId && $assetProxyRepository instanceof SupportsCollectionsInterface) {
            /** @var AssetCollection $assetCollection */
            $assetCollection = $this->assetCollectionRepository->findByIdentifier($assetCollectionId);
            if ($assetCollection) {
                $assetProxyRepository->filterByCollection($assetCollection);
            }
        }

        // TODO: Implement sorting via `SupportsSortingInterface`

        if ($tagId && $assetProxyRepository instanceof SupportsTaggingInterface) {
            /** @var Tag $tag */
            $tag = $this->tagRepository->findByIdentifier($tagId);
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
     * Returns a list of accessible and inaccessible relations for the given asset
     *
     * @param $_
     * @param array $variables
     * @param AssetSourceContext $assetSourceContext
     * @return array
     */
    public function assetUsageDetails($_, array $variables, AssetSourceContext $assetSourceContext): array
    {
        [
            'id' => $id,
            'assetSourceId' => $assetSourceId,
        ] = $variables + ['id' => null, 'assetSourceId' => null];

        $assetProxy = $assetSourceContext->getAssetProxy($id, $assetSourceId);

        if (!$assetProxy || !$assetProxy->getLocalAssetIdentifier()) {
            return [];
        }

        $asset = $assetSourceContext->getAssetForProxy($assetProxy);

        if (!$asset) {
            return [];
        }

        return $this->assetUsageService->resolveUsagesForAsset($asset);
    }

    /**
     * Returns the total usage count for the given asset
     *
     * @param $_
     * @param array $variables
     * @param AssetSourceContext $assetSourceContext
     * @return int
     */
    public function assetUsageCount($_, array $variables, AssetSourceContext $assetSourceContext): int
    {
        [
            'id' => $id,
            'assetSourceId' => $assetSourceId,
        ] = $variables + ['id' => null, 'assetSourceId' => null];

        $assetProxy = $assetSourceContext->getAssetProxy($id, $assetSourceId);

        if (!$assetProxy || !$assetProxy->getLocalAssetIdentifier()) {
            return 0;
        }

        $asset = $assetSourceContext->getAssetForProxy($assetProxy);

        if (!$asset) {
            return 0;
        }

        return $this->assetService->getUsageCount($asset);
    }

    /**
     * Returns an array with helpful configurations for interacting with the API
     *
     * @param $_
     * @return array
     */
    public function config($_): array
    {
        return [
            'uploadMaxFileSize' => $this->getMaximumFileUploadSize(),
            'currentServerTime' => (new \DateTime())->format(DATE_W3C),
        ];
    }

    /**
     * Returns the lowest configured maximum upload file size
     *
     * @return int
     */
    protected function getMaximumFileUploadSize(): int
    {
        try {
            return (int)min(
                Files::sizeStringToBytes(ini_get('post_max_size')),
                Files::sizeStringToBytes(ini_get('upload_max_filesize'))
            );
        } catch (FilesException $e) {
            return 0;
        }
    }

    /**
     * Provides a filterable list of asset proxies. These are the main entities for media management.
     *
     * @param $_
     * @param array $variables
     * @param AssetSourceContext $assetSourceContext
     * @return AssetProxyQueryResultInterface|null
     */
    public function assets(
        $_,
        array $variables,
        AssetSourceContext $assetSourceContext
    ): ?AssetProxyQueryResultInterface {
        ['limit' => $limit, 'offset' => $offset] = $variables + ['limit' => 20, 'offset' => 0];
        $query = $this->createAssetProxyQuery($variables, $assetSourceContext);

        if (!$query) {
            $this->systemLogger->error('Could not build assets query for given variables', $variables);
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
     * Provides a list of all unused assets in local asset source
     *
     * @param $_
     * @param array $variables
     * @param AssetSourceContext $assetSourceContext
     * @return array<AssetProxyInterface>
     * @throws MediaUiException
     */
    public function unusedAssets($_, array $variables, AssetSourceContext $assetSourceContext): array
    {
        ['limit' => $limit, 'offset' => $offset] = $variables + ['limit' => 20, 'offset' => 0];

        /** @var NeosAssetSource $neosAssetSource */
        $neosAssetSource = $assetSourceContext->getAssetSource('neos');

        return array_map(static function ($asset) use ($neosAssetSource) {
            return new NeosAssetProxy($asset, $neosAssetSource);
        }, $this->assetUsageService->getUnusedAssets($limit, $offset));
    }

    /**
     * Provides number of unused assets in local asset source
     *
     * @return int
     * @throws MediaUiException
     */
    public function unusedAssetCount(): int
    {
        return $this->assetUsageService->getUnusedAssetCount();
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
     * @param $_
     * @param array $variables
     * @return Tag|null
     */
    public function tag($_, array $variables): ?Tag
    {
        $id = $variables['id'] ?? null;
        /** @var Tag $tag */
        $tag = $id ? $this->tagRepository->findByIdentifier($id) : null;
        return $tag;
    }

    /**
     * Returns the list of all registered asset sources. By default the asset source `neos` should always exist.
     *
     * @param $_
     * @param array $variables
     * @param AssetSourceContext $assetSourceContext
     * @return array<AssetSourceInterface>
     */
    public function assetSources($_, array $variables, AssetSourceContext $assetSourceContext): array
    {
        return $assetSourceContext->getAssetSources();
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
     * @param $_
     * @param array $variables
     * @return AssetCollection|null
     */
    public function assetCollection($_, array $variables): ?AssetCollection
    {
        $id = $variables['id'] ?? null;
        /** @var AssetCollection $assetCollection */
        $assetCollection = $id ? $this->assetCollectionRepository->findByIdentifier($id) : null;
        return $assetCollection;
    }

    /**
     * @param $_
     * @param array $variables
     * @param AssetSourceContext $assetSourceContext
     * @return AssetProxyInterface|null
     */
    public function asset($_, array $variables, AssetSourceContext $assetSourceContext): ?AssetProxyInterface
    {
        [
            'id' => $id,
            'assetSourceId' => $assetSourceId,
        ] = $variables + ['id' => null, 'assetSourceId' => null];

        return $assetSourceContext->getAssetProxy($id, $assetSourceId);
    }

    /**
     * @param $_
     * @param array $variables
     * @return array
     */
    public function changedAssets($_, array $variables): array
    {
        /** @var string $since */
        $since = $variables['since'] ?? null;
        $changes = $this->assetChangeLog->getChanges();

        $filteredChanges = [];
        $lastModified = null;
        foreach ($changes as $change) {
            if ($since !== null && $change['lastModified'] <= $since) {
                continue;
            }
            if ($lastModified === null || $change['lastModified'] > $lastModified) {
                $lastModified = $change['lastModified'];
            }
            $filteredChanges[] = $change;
        }

        return [
            'lastModified' => $lastModified,
            'changes' => $filteredChanges,
        ];
    }

    public function similarAssets($_, array $variables, AssetSourceContext $assetSourceContext): array
    {
        [
            'id' => $id,
            'assetSourceId' => $assetSourceId,
        ] = $variables + ['id' => null, 'assetSourceId' => null];

        $assetProxy = $assetSourceContext->getAssetProxy($id, $assetSourceId);

        if (!$assetProxy) {
            return [];
        }

        $asset = $assetSourceContext->getAssetForProxy($assetProxy);

        if (!$asset) {
            return [];
        }

        $similarAssets = $this->similarityService->getSimilarAssets($asset);
        return array_map(function ($asset) use ($assetSourceContext) {
            $assetId = $this->persistenceManager->getIdentifierByObject($asset);
            return $assetSourceContext->getAssetProxy($assetId, $asset->getAssetSourceIdentifier());
        }, $similarAssets);
    }
}
