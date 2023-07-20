<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\Infrastructure\Neos\Media;

use Flowpack\Media\Ui\Domain\Model\AssetProxyIteratorAggregate;
use Flowpack\Media\Ui\Domain\Model\AssetSource\NeosAssetProxyRepository;
use Flowpack\Media\Ui\Domain\Model\SearchTerm;
use Flowpack\Media\Ui\GraphQL\Context\AssetSourceContext;
use Neos\Flow\Annotations as Flow;
use Neos\Media\Domain\Model\AssetCollection;
use Neos\Media\Domain\Model\AssetSource\AssetTypeFilter;
use Neos\Media\Domain\Model\AssetSource\Neos\NeosAssetSource;
use Neos\Media\Domain\Model\AssetSource\SupportsCollectionsInterface;
use Neos\Media\Domain\Model\AssetSource\SupportsSortingInterface;
use Neos\Media\Domain\Model\AssetSource\SupportsTaggingInterface;
use Neos\Media\Domain\Model\Tag;
use Neos\Media\Domain\Repository\AssetCollectionRepository;
use Neos\Media\Domain\Repository\TagRepository;
use Psr\Log\LoggerInterface;

/**
 * @Flow\Scope("singleton")
 */
class AssetProxyIteratorBuilder
{

    /**
     * @Flow\Inject
     * @var LoggerInterface
     */
    protected $systemLogger;

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

    public function build(
        AssetSourceContext $assetSourceContext,
        array $variables
    ): ?AssetProxyIteratorAggregate
    {
        [
            'assetSourceId' => $assetSourceId,
            'tagId' => $tagId,
            'assetCollectionId' => $assetCollectionId,
            'mediaType' => $mediaType,
            'assetType' => $assetType,
            'searchTerm' => $searchTerm,
            'sortBy' => $sortBy,
            'sortDirection' => $sortDirection
        ] = $variables + [
            'assetSourceId' => 'neos',
            'tagId' => null,
            'assetCollectionId' => null,
            'mediaType' => null,
            'assetType' => null,
            'searchTerm' => null,
            'sortBy' => null,
            'sortDirection' => null,
        ];

        $activeAssetSource = $assetSourceContext->getAssetSource($assetSourceId);
        if (!$activeAssetSource) {
            return null;
        }

        // Use our custom patched repository for querying the Neos asset source
        if ($activeAssetSource instanceof NeosAssetSource) {
            $assetProxyRepository = new NeosAssetProxyRepository($activeAssetSource);
        } else {
            $assetProxyRepository = $activeAssetSource->getAssetProxyRepository();
        }

        $this->filterByAssetType($assetType, $assetProxyRepository);
        $this->filterByMediaType($mediaType, $assetProxyRepository);
        $this->filterByAssetCollection($assetCollectionId, $assetProxyRepository);
        $this->filterByTag($tagId, $assetProxyRepository);
        $this->sort($sortBy, $assetProxyRepository, $sortDirection);

        if ($searchTerm = SearchTerm::from($searchTerm)) {
            return $this->applySearchTerm($searchTerm, $assetProxyRepository);
        }

        return AssetProxyQueryIterator::from(
            $assetProxyRepository->findAll()->getQuery()
        );
    }

    protected function filterByAssetType($assetType, $assetProxyRepository): void
    {
        if (is_string($assetType) && !empty($assetType)) {
            try {
                $assetTypeFilter = new AssetTypeFilter(ucfirst($assetType));
                $assetProxyRepository->filterByType($assetTypeFilter);
            } catch (\InvalidArgumentException $e) {
                $this->systemLogger->warning('Ignoring invalid asset type when filtering assets ' . $assetType);
            }
        }
    }

    protected function filterByMediaType($mediaType, $assetProxyRepository): void
    {
        if (is_string($mediaType) && !empty($mediaType) && $assetProxyRepository instanceof NeosAssetProxyRepository) {
            try {
                $assetProxyRepository->filterByMediaType($mediaType);
            } catch (\InvalidArgumentException $e) {
                $this->systemLogger->warning('Ignoring invalid media-type when filtering assets ' . $mediaType);
            }
        }
    }

    protected function filterByAssetCollection($assetCollectionId, $assetProxyRepository): void
    {
        if ($assetCollectionId && $assetProxyRepository instanceof SupportsCollectionsInterface) {
            if ($assetProxyRepository instanceof NeosAssetProxyRepository && $assetCollectionId === 'UNASSIGNED') {
                $assetProxyRepository->filterUnassigned();
            } else {
                /** @var AssetCollection $assetCollection */
                $assetCollection = $this->assetCollectionRepository->findByIdentifier($assetCollectionId);
                if ($assetCollection) {
                    $assetProxyRepository->filterByCollection($assetCollection);
                }
            }
        }
    }

    protected function sort($sortBy, $assetProxyRepository, $sortDirection): void
    {
        if ($sortBy && $assetProxyRepository instanceof SupportsSortingInterface) {
            switch ($sortBy) {
                case 'name':
                    $assetProxyRepository->orderBy(['resource.filename' => $sortDirection]);
                    break;
                case 'size':
                    $assetProxyRepository->orderBy(['resource.fileSize' => $sortDirection]);
                    break;
                case 'lastModified':
                default:
                    $assetProxyRepository->orderBy(['lastModified' => $sortDirection]);
                    break;
            }
        }
    }

    protected function filterByTag($tagId, $assetProxyRepository): void
    {
        if ($tagId && $assetProxyRepository instanceof SupportsTaggingInterface) {
            if ($assetProxyRepository instanceof NeosAssetProxyRepository && $tagId === 'UNTAGGED') {
                $assetProxyRepository->filterUntagged();
            } else {
                /** @var Tag $tag */
                $tag = $this->tagRepository->findByIdentifier($tagId);
                if ($tag) {
                    $assetProxyRepository->filterByTag($tag);
                }
            }
        }
    }

    protected function applySearchTerm(SearchTerm $searchTerm, $assetProxyRepository): AssetProxyIteratorAggregate
    {
        if ($identifier = $searchTerm->getAssetIdentifierIfPresent()) {
            return AssetProxyListIterator::of(
                $assetProxyRepository->getAssetProxy($identifier)
            );
        }
        return AssetProxyQueryIterator::from(
            $assetProxyRepository->findBySearchTerm((string)$searchTerm)->getQuery()
        );
    }
}
