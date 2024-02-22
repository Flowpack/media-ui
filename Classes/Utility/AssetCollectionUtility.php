<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\Utility;

/*
 * This file is part of the Flowpack.Media.Ui package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use Behat\Transliterator\Transliterator;
use Flowpack\Media\Ui\Domain\Model\HierarchicalAssetCollectionInterface;
use Neos\Flow\Annotations as Flow;

/**
 * @Flow\Proxy(false)
 */
class AssetCollectionUtility
{
    /**
     * Transforms an AssetCollection title into a valid path segment by removing invalid characters and
     * transliterating special characters if possible.
     */
    public static function renderValidPath(HierarchicalAssetCollectionInterface $assetCollection): string
    {
        $name = $assetCollection->getTitle();
        $originalName = $name;

        // Transliterate (transform 北京 to 'Bei Jing')
        $name = Transliterator::transliterate($name);

        // Urlization (replace spaces with dash, special characters)
        $name = Transliterator::urlize($name);

        // Ensure only allowed characters are left
        $name = preg_replace('/[^a-z0-9\-]/', '', $name);

        // Make sure we don't have an empty string left.
        if ($name === '') {
            throw new \RuntimeException('Could not render a valid path for AssetCollection with title "' . $originalName . '".');
        }

        $name = '/' . $name;

        // Add path of the parent collection
        /** @var HierarchicalAssetCollectionInterface $parent */
        $parent = $assetCollection->getParent();
        if ($parent !== null) {
            // Recursively build parent path without reusing the stored parent path to ensure correct paths
            // independent of the order of updates
            $name = self::renderValidPath($parent) . $name;
        }

        return $name;
    }
}
