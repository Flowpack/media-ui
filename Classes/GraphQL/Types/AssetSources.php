<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\Description;
use Wwwision\Types\Attributes\ListBased;

use function Wwwision\Types\instantiate;

#[Description('All asset sources')]
#[Flow\Proxy(false)]
#[ListBased(itemClassName: AssetSource::class)]
final class AssetSources implements \IteratorAggregate
{
    private function __construct(public readonly array $collections)
    {
    }

    /**
     * @return \Traversable<AssetSource>
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
