<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\Infrastructure\Neos\Media;

use Doctrine\ORM\Query;
use Neos\Media\Domain\Model\AssetSource\AssetProxyQueryInterface;
use Neos\Media\Domain\Model\AssetSource\AssetProxyQueryResultInterface;
use Neos\Media\Domain\Model\AssetSource\Neos\NeosAssetSource;

/**
 * A re-runnable AssetProxyQueryInterface implementation that is backed by a
 * Doctrine ORM Query instead of Flow's persistence QueryInterface.
 */
final class NeosAssetQuery implements AssetProxyQueryInterface
{
    private ?string $searchTerm = null;

    public function __construct(
        private readonly Query $query,
        private readonly Query $countQuery,
        private readonly NeosAssetSource $assetSource,
    ) {
    }

    public function setOffset(int $offset): void
    {
        $this->query->setFirstResult($offset);
    }

    public function getOffset(): int
    {
        return (int)$this->query->getFirstResult();
    }

    public function setLimit(int $limit): void
    {
        $this->query->setMaxResults($limit);
    }

    public function getLimit(): int
    {
        return (int)$this->query->getMaxResults();
    }

    public function setSearchTerm(string $searchTerm)
    {
        $this->searchTerm = $searchTerm;
    }

    public function getSearchTerm()
    {
        return $this->searchTerm;
    }

    public function execute(): AssetProxyQueryResultInterface
    {
        return new NeosAssetProxyQueryResult($this->query, $this->countQuery, $this->assetSource);
    }

    public function count(): int
    {
        return (int)$this->countQuery->getSingleScalarResult();
    }
}
