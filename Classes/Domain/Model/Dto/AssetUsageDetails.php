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
final class AssetUsageDetails implements \JsonSerializable
{

    private string $label;
    /**
     * @var array<string, string>
     */
    private array $metadata;
    private string $url;

    public function __construct(string $label, string $url, array $metadata)
    {
        $this->label = $label;
        $this->url = $url;
        $this->metadata = $metadata;
    }

    public function getLabel(): string
    {
        return $this->label;
    }

    /**
     * @return array<string, string>
     */
    public function getMetadata(): array
    {
        return $this->metadata;
    }

    public function getUrl(): string
    {
        return $this->url;
    }

    public function jsonSerialize(): array
    {
        return [
            'label' => $this->label,
            'url' => $this->url,
            'metadata' => $this->metadata,
        ];
    }
}
