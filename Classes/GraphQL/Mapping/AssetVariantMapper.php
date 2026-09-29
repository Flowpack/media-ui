<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Mapping;

use Flowpack\Media\Ui\GraphQL\Types\AssetVariants;
use Neos\ContentRepository\Core\Projection\ContentGraph\Node;
use Neos\ContentRepository\Core\Projection\ContentGraph\Nodes;
use Neos\Flow\Annotations as Flow;
use Flowpack\Media\Ui\GraphQL\Types;

use function Wwwision\Types\instantiate;

/**
 * @internal only for use within Flowpack.Media.Ui
 */
#[Flow\Scope('singleton')]
class AssetVariantMapper
{
    public function mapNodesToAssetVariants(Nodes $nodes): Types\AssetVariants
    {
        return AssetVariants::fromArray(
            $nodes->map(
                fn (Node $node): Types\AssetVariant => $this->mapNodeToAssetVariant($node)
            )
        );
    }

    public function mapNodeToAssetVariant(Node $node): Types\AssetVariant
    {
        return instantiate(
            Types\AssetVariant::class,
            [
                'id' => $node->aggregateId->value,
                'width' => null, // @todo implement me
                'height' => null, // @todo implement me
                'variantName' => $node->getProperty('variantName'),
                'presetIdentifier' => $node->getProperty('presetIdentifier'),
            ]
        );
    }
}
