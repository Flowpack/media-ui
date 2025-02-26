<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Flowpack\Media\Ui\Domain\Model\Dto\AssetUsageDetails;
use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\Description;

use function Wwwision\Types\instantiate;

#[Flow\Proxy(false)]
#[Description('A tag to which assets can be assigned')]
final class UsageDetails
{
    private function __construct(
        public readonly string $label,
        public readonly Url $url,
        public readonly UsageDetailsMetadataList $metadata,
    ) {
    }

    public static function fromUsage(AssetUsageDetails $usage): self
    {
        return instantiate(self::class, [
            'label' => $usage->getLabel(),
            'url' => $usage->getUrl(),
            // TODO: Simplify this instantiation
            'metadata' => instantiate(
                UsageDetailsMetadataList::class,
                array_map(static function (array $metadata) {
                    return instantiate(
                        UsageDetailsMetadata::class,
                        $metadata,
                    );
                }, $usage->getMetadata())
            ),
        ]);
    }
}
