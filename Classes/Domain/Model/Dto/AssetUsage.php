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

/**
 * @internal
 */
final class AssetUsage
{

    /**
     * @var string
     */
    private $assetId;

    /**
     * @var string
     */
    private $serviceId;

    /**
     * @var array
     */
    private $metadata;

    public function __construct(string $assetId, string $serviceId, array $metadata)
    {
        $this->assetId = $assetId;
        $this->serviceId = $serviceId;
        $this->metadata = $metadata;
    }

    /**
     * @return string
     */
    public function getAssetId(): string
    {
        return $this->assetId;
    }

    /**
     * @return string
     */
    public function getServiceId(): string
    {
        return $this->serviceId;
    }

    /**
     * @return array
     */
    public function getMetadata(): array
    {
        return $this->metadata;
    }

}
