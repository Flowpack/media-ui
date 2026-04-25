<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\Description;
use Wwwision\Types\Attributes\ListBased;

#[Description('A list of asset identities')]
#[Flow\Proxy(false)]
#[ListBased(itemClassName: AssetIdentity::class)]
final class AssetIdentities implements \IteratorAggregate
{
    /**
     * @param AssetIdentity[] $identities
     */
    private function __construct(public readonly array $identities)
    {
    }

    /**
     * @param AssetIdentity[] $assetIdentities
     */
    public static function fromArray(array $assetIdentities): self
    {
        return new self($assetIdentities);
    }

    /**
     * @return \Traversable<AssetIdentity>
     */
    public function getIterator(): \Traversable
    {
        yield from $this->identities;
    }

    public static function empty(): self
    {
        return new self([]);
    }
}
