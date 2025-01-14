<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\Service;

/*
 * This file is part of the Flowpack.Media.Ui package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use Flowpack\Media\Ui\GraphQL\Types;
use Neos\Cache\Exception as CacheException;
use Neos\Cache\Exception\InvalidDataException;
use Neos\Cache\Exception\NotSupportedByBackendException;
use Neos\Cache\Frontend\StringFrontend;
use Neos\Flow\Annotations as Flow;

use function Wwwision\Types\instantiate;

/**
 * Logs changes to assets
 * TODO: Make more generic to also capture changes to tags & collections
 */
#[Flow\Scope("singleton")]
final class AssetChangeLog
{

    public function __construct(
        private readonly StringFrontend $cache,
        private readonly int $cacheLifetime,
    ) {
    }

    /**
     * Stores the asset id and the current timestamp in the cache.
     * The hash for the last change is also updated.
     *
     * @throws CacheException|InvalidDataException|\JsonException
     */
    public function add(string $assetId, \DateTimeInterface $lastModified, string $type): void
    {
        $change = instantiate(
            Types\AssetChange::class,
            [
                'assetId' => $assetId,
                'lastModified' => $lastModified->format(DATE_W3C),
                'type' => $type,
            ]
        );
        $this->cache->set(
            md5($assetId),
            json_encode($change, JSON_THROW_ON_ERROR),
            ['changedAssets'],
            $this->cacheLifetime
        );
    }

    public function getChanges(): Types\AssetChanges
    {
        try {
            $cachedChanges = $this->cache->getByTag('changedAssets');
        } catch (NotSupportedByBackendException) {
            return Types\AssetChanges::empty();
        }
        return array_map(static function (array $entry) {
            try {
                $changeData = json_decode($entry, true, 512, JSON_THROW_ON_ERROR);
            } catch (\JsonException) {
                return null;
            }
            return instantiate(Types\AssetChange::class, $changeData);
        }, array_filter(array_values($cachedChanges)));
    }
}
