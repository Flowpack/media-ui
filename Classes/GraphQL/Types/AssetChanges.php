<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\ListBased;

use function Wwwision\Types\instantiate;

#[Flow\Proxy(false)]
#[ListBased(itemClassName: AssetChange::class)]
final class AssetChanges implements \IteratorAggregate
{
    /**
     * @param AssetChange[] $changes
     */
    private function __construct(public readonly array $changes)
    {
    }

    public static function empty(): self
    {
        return instantiate(self::class, []);
    }

    /**
     * @return \Traversable<AssetChange>
     */
    public function getIterator(): \Traversable
    {
        yield from $this->changes;
    }

    public function getLastModified(): ?DateTime
    {
        $lastModified = null;
        foreach ($this->changes as $change) {
            if ($lastModified === null || $change->lastModified > $lastModified) {
                $lastModified = $change->lastModified;
            }
        }
        return $lastModified;
    }
}
