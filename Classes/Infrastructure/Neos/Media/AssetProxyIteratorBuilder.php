<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\Infrastructure\Neos\Media;

use Flowpack\Media\Ui\Domain\Model\AssetProxyIteratorAggregate;
use Flowpack\Media\Ui\Domain\Model\AssetSource\NeosAssetProxyRepository;
use Flowpack\Media\Ui\Domain\Model\SearchTerm;
use Flowpack\Media\Ui\GraphQL\Context\AssetSourceContext;
use Flowpack\Media\Ui\GraphQL\Types;
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

#[Flow\Scope('singleton')]
class AssetProxyIteratorBuilder
{

    public function __construct(
        protected readonly AssetSourceContext $assetSourceContext,
        protected AssetCollectionRepository $assetCollectionRepository,
        protected TagRepository $tagRepository,
        protected LoggerInterface $logger,
    ) {
    }

    public function build(
        Types\AssetSourceId $assetSourceId = null,
        Types\TagId $tagId = null,
        Types\AssetCollectionId $assetCollectionId = null,
        Types\MediaType $mediaType = null,
        Types\AssetType $assetType = null,
        SearchTerm $searchTerm = null,
        Types\SortBy $sortBy = null,
        Types\SortDirection $sortDirection = null,
    ): ?AssetProxyIteratorAggregate {
        $assetSourceId = $assetSourceId ?: Types\AssetSourceId::default();

        $activeAssetSource = $this->assetSourceContext->getAssetSource($assetSourceId);
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

        $this->sort($sortBy, $assetProxyRepository, $sortDirection);

        // The tag filter operates differently on normal assets sources than our modified one that allows combining filters.
        // Therefore, we have to return a new query iterator here and cannot add the search term filter.
        $queryResult = $this->filterByTag($tagId, $assetProxyRepository);
        if ($queryResult) {
            return AssetProxyQueryIterator::from($queryResult);
        }

        if ($searchTerm) {
            return $this->applySearchTerm($searchTerm, $assetProxyRepository);
        }

        return AssetProxyQueryIterator::from(
            $assetProxyRepository->findAll()->getQuery()
        );
    }

    protected function filterByAssetType(
        ?Types\AssetType $assetType,
        AssetProxyRepositoryInterface $assetProxyRepository
    ): void {
        if ($assetType) {
            try {
                $assetTypeFilter = new AssetTypeFilter(ucfirst((string)$assetType));
                $assetProxyRepository->filterByType($assetTypeFilter);
            } catch (\InvalidArgumentException) {
                $this->logger->warning('Ignoring invalid asset type when filtering assets ' . $assetType);
            }
        }
    }

    protected function filterByMediaType(
        ?Types\MediaType $mediaType,
        AssetProxyRepositoryInterface $assetProxyRepository
    ): void {
        if ($mediaType && $assetProxyRepository instanceof NeosAssetProxyRepository) {
            try {
                $assetProxyRepository->filterByMediaType((string)$mediaType);
            } catch (\InvalidArgumentException) {
                $this->logger->warning('Ignoring invalid media-type when filtering assets ' . $mediaType);
            }
        }
    }

    protected function filterByAssetCollection(
        ?Types\AssetCollectionId $assetCollectionId,
        AssetProxyRepositoryInterface $assetProxyRepository
    ): void {
        if ($assetCollectionId && $assetProxyRepository instanceof SupportsCollectionsInterface) {
            if ($assetProxyRepository instanceof NeosAssetProxyRepository && $assetCollectionId->isUnassigned()) {
                $assetProxyRepository->filterUnassigned();
            } else {
                /** @var AssetCollection $assetCollection */
                $assetCollection = $this->assetCollectionRepository->findByIdentifier((string)$assetCollectionId);
                if ($assetCollection) {
                    $assetProxyRepository->filterByCollection($assetCollection);
                }
            }
        }
    }

    protected function sort(
        ?Types\SortBy $sortBy,
        AssetProxyRepositoryInterface $assetProxyRepository,
        ?Types\SortDirection $sortDirection
    ): void {
        if ($sortBy && $assetProxyRepository instanceof SupportsSortingInterface) {
            // TODO: Refactor when sortBy is a proper enum
            switch ($sortBy->value) {
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
    protected function filterByTag(
        ?Types\TagId $tagId,
        AssetProxyRepositoryInterface $assetProxyRepository
    ): ?AssetProxyQueryInterface {
        if (!$tagId || !$assetProxyRepository instanceof SupportsTaggingInterface) {
            return null;
        }

        if ($assetProxyRepository instanceof NeosAssetProxyRepository) {
            // Add our custom filter
            if ($tagId->isUntagged()) {
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
            if ($tagId->isUntagged()) {
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

    protected function applySearchTerm(
        SearchTerm $searchTerm,
        AssetProxyRepositoryInterface $assetProxyRepository
    ): AssetProxyIteratorAggregate {
        if ($identifier = $searchTerm->getAssetIdentifierIfPresent()) {
            // Reset the type filter as it prevents the asset from being found if it is not of the same type
            $assetProxyRepository->filterByType(null);
            return AssetProxyListIterator::of(
                $assetProxyRepository->getAssetProxy($identifier)
            );
        }
        return AssetProxyQueryIterator::from(
            $assetProxyRepository->findBySearchTerm((string)$searchTerm)->getQuery()
        );
    }
}
