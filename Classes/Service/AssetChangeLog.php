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

use Neos\Cache\Exception as CacheException;
use Neos\Cache\Exception\InvalidDataException;
use Neos\Cache\Exception\NotSupportedByBackendException;
use Neos\Cache\Frontend\StringFrontend;
use Neos\Flow\Annotations as Flow;

/**
 * Logs changes to assets
 * TODO: Make more generic to also capture changes to tags & collections
 *
 * @Flow\Scope("singleton")
 */
final class AssetChangeLog
{

    /**
     * @var StringFrontend
     */
    private $cache;

    /**
     * @var int
     */
    private $cacheLifetime;

    public function __construct(StringFrontend $cache, int $cacheLifetime)
    {
        $this->cache = $cache;
        $this->cacheLifetime = $cacheLifetime;
    }

    /**
     * Stores the asset id and the current timestamp in the cache.
     * The hash for the last change is also updated.
     *
     * @param string $assetId
     * @param \DateTimeInterface $lastModified
     * @param string $type
     * @throws CacheException
     * @throws InvalidDataException
     */
    public function add(string $assetId, \DateTimeInterface $lastModified, string $type): void
    {
        $this->cache->set(md5($assetId), json_encode([
            'assetId' => $assetId,
            'lastModified' => $lastModified->format(DATE_W3C),
            'type' => $type,
        ]), ['changedAssets'], $this->cacheLifetime);
    }

    /**
     * @return array<array> the assetId and timestamp for each change
     */
    public function getChanges(): array
    {
        try {
            $cachedChanges = $this->cache->getByTag('changedAssets');
        } catch (NotSupportedByBackendException $e) {
            return [];
        }
        return array_map(static function ($entry) {
            return json_decode($entry, true);
        }, array_filter(array_values($cachedChanges)));
    }
}
