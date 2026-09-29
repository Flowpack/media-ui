<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Mapping;

use Neos\ContentRepository\Core\Projection\ContentGraph\Node;
use Neos\ContentRepository\Core\Projection\ContentGraph\Nodes;
use Flowpack\Media\Ui\GraphQL\Types;

use function Wwwision\Types\instantiate;

class TagMapper
{
    public static function mapNodesToTags(Nodes $nodes): Types\Tags
    {
        return Types\Tags::fromArray($nodes->map(
            fn (Node $tag): Types\Tag => self::mapNodeToTag($tag)
        ));
    }

    public static function mapNodeToTag(Node $node): Types\Tag
    {
        return instantiate(
            Types\Tag::class,
            [
                'id' => $node->aggregateId->value,
                'label' => $node->getProperty('name') ?: '',
            ]
        );
    }
}
