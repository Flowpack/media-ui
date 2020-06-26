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

use Flowpack\Media\Ui\GraphQL\Context\AssetSourceContext;
use Neos\Flow\Annotations as Flow;
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
     * @var AssetCollectionRepository
     */
    protected $assetCollectionRepository;

    /**
     * @Flow\Inject
     * @var LoggerInterface
     */
    protected $systemLogger;

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
            'tag' => $tag,
            'assetCollection' => $assetCollection,
            'mediaType' => $mediaType,
            'searchTerm' => $searchTerm,
        ] = $variables + [
            'assetSourceId' => 'neos',
            'tag' => null,
            'assetCollection' => null,
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
     * Returns an array with helpful configurations for interacting with the API
     *
     * @param $_
     * @return array
     */
    public function config($_): array
    {
        return [
            'uploadMaxFileSize' => $this->getMaximumFileUploadSize(),
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
            return (int)min(Files::sizeStringToBytes(ini_get('post_max_size')),
                Files::sizeStringToBytes(ini_get('upload_max_filesize')));
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
        $limit = array_key_exists('limit', $variables) ? $variables['limit'] : 20;
        $offset = array_key_exists('offset', $variables) ? $variables['offset'] : 0;

        $query = $this->createAssetProxyQuery($variables, $assetSourceContext);

        if (!$query) {
            $this->systemLogger->error('Could not build asset query for given variables', $variables);
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
     * @param AssetSourceContext $assetSourceContext
     * @return AssetProxyInterface|null
     */
    public function asset($_, array $variables, AssetSourceContext $assetSourceContext): ?AssetProxyInterface
    {
        [
            'id' => $id,
            'assetSourceId' => $assetSourceId,
        ] = $variables + ['id' => null, 'assetSourceId' => null];

        $activeAssetSource = $assetSourceContext->getAssetSource($assetSourceId);
        return $activeAssetSource ? $activeAssetSource->getAssetProxyRepository()->getAssetProxy($id) : null;
    }
}
