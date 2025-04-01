<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\Description;
use Wwwision\Types\Attributes\ListBased;

#[Flow\Proxy(false)]
#[Description('A list of uploaded files')]
#[ListBased(itemClassName: UploadedFile::class)]
final class UploadedFiles implements \IteratorAggregate
{
    private function __construct(public readonly ?array $files = null)
    {
    }

    /**
     * @return \Traversable<UploadedFile>
     */
    public function getIterator(): \Traversable
    {
        yield from $this->files;
    }

    public static function empty(): self
    {
        return new self([]);
    }
}
