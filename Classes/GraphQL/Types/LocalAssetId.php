<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Neos\Media\Domain\Model\AssetSource\AssetProxy\AssetProxyInterface;
use Wwwision\Types\Attributes\Description;
use Wwwision\Types\Attributes\StringBased;

use function Wwwision\Types\instantiate;

#[Description('Unique identifier (UUID) of an imported Asset')]
#[Flow\Proxy(false)]
#[StringBased]
final class LocalAssetId implements \JsonSerializable
{
    private function __construct(public readonly string $value)
    {
    }

    public function jsonSerialize(): string
    {
        return $this->value;
    }

    public static function fromAssetProxy(AssetProxyInterface $assetProxy): ?self
    {
        return $assetProxy->getLocalAssetIdentifier() ? instantiate(
            self::class,
            $assetProxy->getLocalAssetIdentifier()
        ) : null;
    }
}
