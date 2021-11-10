<?php
declare(strict_types=1);

namespace Flowpack\Media\Ui\Tus;

/*
 * This file is part of the Flowpack.Media.Ui package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use Carbon\Carbon;
use Neos\Cache\Frontend\StringFrontend;
use Neos\Utility\Exception\PropertyNotAccessibleException;
use Neos\Utility\ObjectAccess;
use TusPhp\Cache\Cacheable;

class PartialUploadFileCacheAdapter implements Cacheable
{

    /**
     * @var StringFrontend
     */
    protected $partialUploadFileCache;

    /**
     * @param string $key
     * @param bool $withExpired
     * @return mixed|null
     * @throws \JsonException
     */
    public function get(string $key, bool $withExpired = false)
    {
        $contents = $this->partialUploadFileCache->get($key);
        if (!is_string($contents)) {
            return null;
        }

        $contents = json_decode($contents, true, 512, JSON_THROW_ON_ERROR);

        if ($withExpired) {
            return $contents;
        }

        if (!$contents) {
            return null;
        }

        $isExpired = Carbon::parse($contents['expires_at'])->lt(Carbon::now());

        return $isExpired ? null : $contents;
    }

    public function set(string $key, $value)
    {
        $contents = $this->get($key) ?? [];

        if (\is_array($value)) {
            $contents = $value + $contents;
        } else {
            $contents[] = $value;
        }

        $this->partialUploadFileCache->set($this->getPrefix() . $key, json_encode($contents));

        return true;
    }

    public function delete(string $key): bool
    {
        return $this->partialUploadFileCache->remove($key);
    }

    public function deleteAll(array $keys): bool
    {
        $this->partialUploadFileCache->flush();
        return true;
    }

    /**
     * @throws PropertyNotAccessibleException
     */
    public function getTtl(): int
    {
        return (int)ObjectAccess::getProperty($this->partialUploadFileCache->getBackend(), 'defaultLifetime', true);
    }

    public function keys(): array
    {
        // @todo implement a replacement for keys() for flow cache backends
        return [];
    }

    public function setPrefix(string $prefix): Cacheable
    {
        return $this;
    }

    public function getPrefix(): string
    {
        return '';
    }
}
