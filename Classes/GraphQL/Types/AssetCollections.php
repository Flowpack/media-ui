<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Wwwision\Types\Attributes\Description;
use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\ListBased;

use function Wwwision\Types\instantiate;

#[Description('All asset collections')]
#[Flow\Proxy(false)]
#[ListBased(itemClassName: AssetCollection::class)]
final class AssetCollections implements \IteratorAggregate
{
    private function __construct(public readonly array $collections)
    {
    }

    /**
     * @return \Traversable<AssetCollection>
     */
    public function getIterator(): \Traversable
    {
        yield from $this->collections;
    }

    public static function empty(): self
    {
        return instantiate(self::class, []);
    }
}
