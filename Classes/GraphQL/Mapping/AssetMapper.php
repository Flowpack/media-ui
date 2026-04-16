<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Mapping;

use Neos\ContentRepository\Core\Projection\ContentGraph\Node;
use Neos\ContentRepository\Core\Projection\ContentGraph\Nodes;
use Neos\Flow\Annotations as Flow;
use Flowpack\Media\Ui\GraphQL\Types;

use function Wwwision\Types\instantiate;

/**
 * @internal only for use within Flowpack.Media.Ui
 */
#[Flow\Scope('singleton')]
class AssetMapper
{
    public function mapNodesToAssets(Nodes $nodes): Types\Assets
    {
        return Types\Assets::fromArray(
            $nodes->map(
                fn (Node $node): Types\Asset => $this->mapNodeToAsset($node)
            )
        );
    }

    public function mapNodeToAsset(Node $node): Types\Asset
    {
        return instantiate(
            Types\Asset::class,
            [
                'id' => $node->aggregateId->value,
                'filename' => 'TODO-implement-me.jpg',
                'assetSource' => 'cr:' . $node->contentRepositoryId->value,
                'width' => null, // @todo implement me
                'height' => null, // @todo implement me
                'localId' => null,
            ]
        );
    }
}
