<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\Description;

#[Description('Representation of an image that can be rendered to the browser')]
#[Flow\Proxy(false)]
final class Image
{
    private function __construct(
        public readonly int $width,
        public readonly int $height,
        public readonly Url $url,
        public readonly string $alt,
    ) {
    }

    /**
     * @param array<string,mixed> $fields
     */
    public static function fromArray(array $fields): self
    {
        $url = $fields['url'] ?? null;
        if (is_string($url)) {
            $fields['url'] = Url::fromString($url);
        } elseif (!$url instanceof Url) {
            throw new \InvalidArgumentException('The "url" field must be a string or an instance of Url', 1776411039);
        }
        return new self($fields['width'], $fields['height'], $fields['url'], $fields['alt']);
    }
}
