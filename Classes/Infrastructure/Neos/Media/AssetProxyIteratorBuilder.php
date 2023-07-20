<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\Infrastructure\Neos\Media;

use Flowpack\Media\Ui\Domain\Model\AssetProxyIteratorAggregate;
use Flowpack\Media\Ui\Domain\Model\AssetSource\NeosAssetProxyRepository;
use Flowpack\Media\Ui\Domain\Model\SearchTerm;
use Flowpack\Media\Ui\GraphQL\Context\AssetSourceContext;
use Neos\Flow\Annotations as Flow;
use Neos\Media\Domain\Model\AssetCollection;
use Neos\Media\Domain\Model\AssetSource\AssetProxyQueryInterface;
use Neos\Media\Domain\Model\AssetSource\AssetProxyRepositoryInterface;
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

        $this->sort($sortBy, $assetProxyRepository, $sortDirection);

        $this->filterByAssetType($assetType, $assetProxyRepository);
        $this->filterByMediaType($mediaType, $assetProxyRepository);
        $this->filterByAssetCollection($assetCollectionId, $assetProxyRepository);

        // The tag filter operates differently on normal assets sources than our modified one that allows combining filters.
        // Therefore, we have to return a new query iterator here and cannot add the search term filter.
        $queryResult = $this->filterByTag($tagId, $assetProxyRepository);
        if ($queryResult) {
            return AssetProxyQueryIterator::from($queryResult);
        }

        if ($searchTerm = SearchTerm::from($searchTerm)) {
            return $this->applySearchTerm($searchTerm, $assetProxyRepository);
        }

        return AssetProxyQueryIterator::from(
            $assetProxyRepository->findAll()->getQuery()
        );
    }

    protected function filterByAssetType(?string $assetType, AssetProxyRepositoryInterface $assetProxyRepository): void
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

    protected function filterByMediaType($mediaType, AssetProxyRepositoryInterface $assetProxyRepository): void
    {
        if (is_string($mediaType) && !empty($mediaType) && $assetProxyRepository instanceof NeosAssetProxyRepository) {
            try {
                $assetProxyRepository->filterByMediaType($mediaType);
            } catch (\InvalidArgumentException $e) {
                $this->systemLogger->warning('Ignoring invalid media-type when filtering assets ' . $mediaType);
            }
        }
    }

    protected function filterByAssetCollection($assetCollectionId, AssetProxyRepositoryInterface $assetProxyRepository): void
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

    protected function sort(?string $sortBy, AssetProxyRepositoryInterface $assetProxyRepository, ?string $sortDirection): void
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

    /**
     * This method is a bit of a hack, as it adds additional filters to our own NeosAssetProxyRepository,
     * but returns a new query in case of other AssetProxyRepositories as their interface does not allow
     * combining all filters.
     */
    protected function filterByTag(?string $tagId, AssetProxyRepositoryInterface $assetProxyRepository): ?AssetProxyQueryInterface
    {
        if (!$tagId || !$assetProxyRepository instanceof SupportsTaggingInterface) {
            return null;
        }

        if ($assetProxyRepository instanceof NeosAssetProxyRepository) {
            // Add our custom filter
            if ($tagId === 'UNTAGGED') {
                $assetProxyRepository->filterUntagged();
            } else {
                /** @var Tag $tag */
                $tag = $this->tagRepository->findByIdentifier($tagId);
                if ($tag) {
                    $assetProxyRepository->filterByTag($tag);
                }
            }
        } else {
            // Return a new query for other AssetProxyRepositories
            if ($tagId === 'UNTAGGED') {
                return $assetProxyRepository->findUntagged()->getQuery();
            }

            /** @var Tag $tag */
            $tag = $this->tagRepository->findByIdentifier($tagId);
            if ($tag) {
                return $assetProxyRepository->findByTag($tag)->getQuery();
            }
        }
        return null;
    }

    protected function applySearchTerm(SearchTerm $searchTerm, AssetProxyRepositoryInterface $assetProxyRepository): AssetProxyIteratorAggregate
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
