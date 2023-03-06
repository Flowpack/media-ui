<?php
declare(strict_types=1);

namespace Flowpack\Media\Ui\Domain\Model\Dto;

/*
 * This file is part of the Flowpack.Media.Ui package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use Neos\Flow\Annotations as Flow;

/**
 * @Flow\Proxy(false)
 * @api
 */
final class UsageMetadataSchema implements \JsonSerializable
{
    public const TYPE_TEXT = 'TEXT';
    public const TYPE_DATE = 'DATE';
    public const TYPE_DATETIME = 'DATETIME';
    public const TYPE_URL = 'URL';
    public const TYPE_JSON = 'JSON';
    public const VALID_TYPES = [self::TYPE_TEXT, self::TYPE_DATE, self::TYPE_DATETIME, self::TYPE_URL, self::TYPE_JSON];
    private array $metadata;

    public function withMetadata(string $name, string $label, string $type): self
    {
        if (!$name || !$label || !in_array($type, self::VALID_TYPES, true)) {
            throw new \InvalidArgumentException('Invalid metadata definition', 1678085489);
        }
        $this->metadata[$name] = [
            'name' => $name,
            'label' => $label,
            'type' => $type,
        ];
        return $this;
    }

    public function getMetadata(): array
    {
        return $this->metadata;
    }

    public function jsonSerialize(): array
    {
        return $this->toArray();
    }

    public function toArray(): array
    {
        return array_values($this->metadata);
    }
}
