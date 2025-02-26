<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\Description;
use Wwwision\Types\Attributes\StringBased;

#[Description('Options for asset editing')]
#[Flow\Proxy(false)]
#[StringBased]
final class AssetEditOptionsInput implements \JsonSerializable
{
    private function __construct(
        public readonly bool $generateRedirects,
    )
    {
    }

    public function toArray(): array
    {
        return [
            'generateRedirects' => $this->generateRedirects,
        ];
    }

    public function jsonSerialize(): array
    {
        return $this->toArray();
    }
}
