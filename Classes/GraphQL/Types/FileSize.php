<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\Description;
use Wwwision\Types\Attributes\IntegerBased;

#[Description('Size of a file in bytes')]
#[Flow\Proxy(false)]
#[IntegerBased(minimum: 0)]
final class FileSize implements \JsonSerializable
{
    private function __construct(public readonly int $value)
    {
    }

    public function jsonSerialize(): int
    {
        return $this->value;
    }
}
