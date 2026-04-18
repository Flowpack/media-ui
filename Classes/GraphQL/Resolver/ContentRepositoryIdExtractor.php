<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Resolver;

use Flowpack\Media\Ui\GraphQL\Types\AssetSourceId;
use Neos\ContentRepository\Core\SharedModel\ContentRepository\ContentRepositoryId;

final class ContentRepositoryIdExtractor
{
    public static function tryFromAssetSourceId(?AssetSourceId $assetSourceId): ?ContentRepositoryId
    {
        if ($assetSourceId === null) {
            return null;
        }
        if (str_starts_with($assetSourceId->value, 'cr:')) {
            return ContentRepositoryId::fromString(\mb_substr($assetSourceId->value, 3));
        }

        return null;
    }
}
