<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\ListBased;

use function Wwwision\Types\instantiate;

#[Flow\Proxy(false)]
#[ListBased(itemClassName: Asset::class)]
final class Assets implements \IteratorAggregate
{
    private function __construct(public readonly array $assets)
    {
    }

    public static function empty(): self
    {
        return instantiate(self::class, []);
    }

    public function getIterator(): \Traversable
    {
        yield from $this->assets;
    }
}
