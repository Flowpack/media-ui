<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\Infrastructure\Neos\Media;

/*
 * This file is part of the Flowpack.Media.Ui package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use Flowpack\Media\Ui\Domain\Model\AssetProxyIteratorAggregate;
use Neos\Flow\Annotations as Flow;
use Neos\Media\Domain\Model\AssetSource\AssetProxy\AssetProxyInterface;
use Neos\Media\Domain\Model\AssetSource\AssetProxyQueryInterface;

/**
 * @Flow\Proxy(false)
 * @internal
 */
final class AssetProxyQueryIterator implements AssetProxyIteratorAggregate
{
    /**
     * @var AssetProxyQueryInterface $assetProxyQuery
     */
    private $assetProxyQuery;

    private function __construct(AssetProxyQueryInterface $assetProxyQuery)
    {
        $this->assetProxyQuery = $assetProxyQuery;
    }

    public static function from(AssetProxyQueryInterface $assetProxyQuery): self
    {
        return new self($assetProxyQuery);
    }

    public function setOffset(int $offset): void
    {
        try {
            // TODO: Check if it's an issue to execute the query a second time just to get the correct number of results?
            $offset = $offset < $this->assetProxyQuery->execute()->count() ? $offset : 0;
        } catch (\Exception $e) {
            // TODO: Handle that not every asset source implements the count method => Introduce countable interface?
        }

        $this->assetProxyQuery->setOffset($offset);
    }

    public function setLimit(?int $limit): void
    {
        // Unfortunately, AssetProxyQueryInterface::setLimit does not accept
        // `null` as a value, so we must filter it first.
        //
        // TODO: This check can be removed, once the following issue has been solved:
        // https://github.com/neos/neos-development-collection/issues/3962
        if ($limit === null) {
            throw new \RuntimeException(
                'Not supported: AssetProxyQueryInterface::setLimit does not accept `null`.',
                1669221347
            );
        }

        $this->assetProxyQuery->setLimit($limit);
    }

    public function count(): int
    {
        try {
            return $this->assetProxyQuery->execute()->count();
        } catch (\Exception $e) {
            // TODO: Handle that not every asset source implements the count method => Introduce countable interface?
            return 0;
        }
    }

    /**
     * @return \Traversable<AssetProxyInterface>
     */
    public function getIterator(): \Traversable
    {
        // TODO: It's not possible to use `toArray` here as not all asset sources implement it
        yield from $this->assetProxyQuery->execute();
    }
}
