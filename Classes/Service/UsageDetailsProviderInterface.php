<?php
declare(strict_types=1);

namespace Flowpack\Media\Ui\Service;

use Flowpack\Media\Ui\Domain\Model\Dto\AssetUsageDetails;
use Flowpack\Media\Ui\Domain\Model\Dto\UsageMetadataSchema;
use Neos\Media\Domain\Model\AssetInterface;

interface UsageDetailsProviderInterface
{
    public function getLabel(): string;

    /**
     * @return AssetUsageDetails[]
     */
    public function getUsageDetails(AssetInterface $asset): array;

    public function getUsageMetadataSchema(): UsageMetadataSchema;
}
