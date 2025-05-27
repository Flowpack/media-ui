<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\ListBased;

#[Flow\Proxy(false)]
#[ListBased(itemClassName: FileUploadResult::class)]
final class FileUploadResults implements \IteratorAggregate, \JsonSerializable
{
    /**
     * @param FileUploadResult[] $values
     */
    private function __construct(public readonly array $values)
    {
    }

    /**
     * @param FileUploadResult[] $results
     */
    public static function fromArray(array $results): self
    {
        return new self($results);
    }

    /**
     * @return \Traversable<FileUploadResult>
     */
    public function getIterator(): \Traversable
    {
        yield from $this->values;
    }

    public static function empty(): self
    {
        return new self([]);
    }

    /**
     * @return FileUploadResult[]
     */
    public function jsonSerialize(): array
    {
        return $this->values;
    }
}
