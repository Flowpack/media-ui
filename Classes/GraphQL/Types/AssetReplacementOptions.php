<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\Description;
use Wwwision\Types\Attributes\StringBased;

#[Description('Options for asset replacement')]
#[Flow\Proxy(false)]
final class AssetReplacementOptions implements \JsonSerializable
{
    private function __construct(
        public readonly bool $generateRedirects,
        public readonly bool $keepOriginalFilename,
    )
    {
    }

    public function toArray(): array
    {
        return [
            'generateRedirects' => $this->generateRedirects,
            'keepOriginalFilename' => $this->keepOriginalFilename,
        ];
    }

    public function jsonSerialize(): array
    {
        return $this->toArray();
    }
}
