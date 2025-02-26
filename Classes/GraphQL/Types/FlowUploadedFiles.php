<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Neos\Http\Factories\FlowUploadedFile;
use Wwwision\Types\Attributes\ListBased;

#[Flow\Proxy(false)]
#[ListBased(itemClassName: FlowUploadedFile::class)]
final class FlowUploadedFiles implements \IteratorAggregate
{
    private function __construct(public readonly array $values)
    {
    }

    /**
     * @return \Traversable<FlowUploadedFile>
     */
    public function getIterator(): \Traversable
    {
        yield from $this->values;
    }
}
