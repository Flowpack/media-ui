<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Mutator;

/*
 * This file is part of the Flowpack.Media.Ui package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use Doctrine\Common\Collections\ArrayCollection;
use Flowpack\Media\Ui\Domain\Model\HierarchicalAssetCollectionInterface;
use Flowpack\Media\Ui\Exception;
use Flowpack\Media\Ui\GraphQL\Context\AssetSourceContext;
use Flowpack\Media\Ui\GraphQL\Resolver\ContentRepositoryIdExtractor;
use Flowpack\Media\Ui\GraphQL\Resolver\ContentRepositoryResolver;
use Flowpack\Media\Ui\GraphQL\Types;
use Flowpack\Media\Ui\GraphQL\Types\MutationResponseMessage;
use Flowpack\Media\Ui\GraphQL\Types\MutationResult;
use Flowpack\Media\Ui\Service\AssetCollectionService;
use Neos\ContentRepository\Core\DimensionSpace\OriginDimensionSpacePoint;
use Neos\ContentRepository\Core\Feature\NodeModification\Dto\PropertyValuesToWrite;
use Neos\ContentRepository\Core\NodeType\NodeType;
use Neos\ContentRepository\Core\NodeType\NodeTypeManager;
use Neos\ContentRepository\Core\Projection\ContentGraph\Node;
use Neos\ContentRepository\Core\SharedModel\Node\NodeAggregateId;
use Neos\ContentRepository\Core\SharedModel\Node\NodeAggregateIds;
use Neos\ContentRepository\Core\SharedModel\Workspace\WorkspaceName;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\I18n\Translator;
use Neos\Flow\Persistence\Exception\IllegalObjectTypeException;
use Neos\Media\Domain\Model\AssetCollection;
use Neos\Media\Domain\Repository\AssetCollectionRepository;
use Neos\Media\Domain\Repository\TagRepository;
use Neos\Neos\Domain\Repository\SiteRepository;
use Neos\Utility\MediaTypes;


enum ConflictProneMediaType: string
{
    case MEDIA_TYPE_AUDIO = 'audio';
    case MEDIA_TYPE_IMAGE = 'image';
    case MEDIA_TYPE_VIDEO = 'video';

    /**
     * @return array<int,string>
     */
    public static function toStringArray(): array
    {
        return array_map(
            static fn (self $type): string  => $type->value,
            self::cases(),
        );
    }

    public static function tryFromNodeType(NodeType $nodeType): ?self
    {
        if ($nodeType->isOfType('Neos.Media:Audio')) {
            return self::MEDIA_TYPE_AUDIO;
        }
        if (
            $nodeType->isOfType('Neos.Media:Image')
            || $nodeType->isOfType('Neos.Media:ImageVariant')
        ) {
            return self::MEDIA_TYPE_IMAGE;
        }
        if ($nodeType->isOfType('Neos.Media:Video')) {
            return self::MEDIA_TYPE_VIDEO;
        }

        return null;
    }

    public static function tryFromMediaType(string $mediaType): ?self
    {
        return self::tryFrom(MediaTypes::parseMediaType($mediaType)['type']);
    }

    public function conflictsWith(?self $other): bool
    {
        return $this->value !== $other?->value;
    }
}
