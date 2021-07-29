<?php
declare(strict_types=1);

namespace Flowpack\Media\Ui;

/*
 * This file is part of the Flowpack.Media.Ui package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use Flowpack\Media\Ui\Service\AssetChangeLog;
use Neos\Flow\Core\Bootstrap;
use Neos\Flow\Package\Package as BasePackage;
use Neos\Flow\Persistence\PersistenceManagerInterface;
use Neos\Media\Domain\Model\Asset;
use Neos\Media\Domain\Model\AssetInterface;
use Neos\Media\Domain\Service\AssetService;

class Package extends BasePackage
{

    public function boot(Bootstrap $bootstrap): void
    {
        $dispatcher = $bootstrap->getSignalSlotDispatcher();

        $logAssetChangeClosure = static function (AssetInterface $asset, \DateTimeInterface $lastModified, string $type) use ($bootstrap) {
            $assetProxy = $asset->getAssetProxy();
            if ($assetProxy) {
                $assetProxyId = $assetProxy->getIdentifier();
            } elseif ($asset->getAssetSourceIdentifier() === 'neos') {
                // FIXME: This is only necessary until https://github.com/neos/neos-development-collection/pull/2924 is merged as local assets don't return a proxy without the patch
                $assetProxyId = $bootstrap->getObjectManager()->get(PersistenceManagerInterface::class)->getIdentifierByObject($asset);
            } else {
                return;
            }

            /** @var AssetChangeLog $assetChangeLog */
            $assetChangeLog = $bootstrap->getObjectManager()->get(AssetChangeLog::class);
            $assetChangeLog->add($assetProxyId, $lastModified, $type);
        };
        $dispatcher->connect(AssetService::class, 'assetCreated',
            function (AssetInterface $asset) use ($logAssetChangeClosure) {
                if ($asset instanceof Asset) {
                    $logAssetChangeClosure($asset, $asset->getLastModified(), 'ASSET_CREATED');
                }
            });
        $dispatcher->connect(AssetService::class, 'assetUpdated',
            function (AssetInterface $asset) use ($logAssetChangeClosure) {
                if ($asset instanceof Asset) {
                    $logAssetChangeClosure($asset, $asset->getLastModified(), 'ASSET_UPDATED');
                }
            });
        $dispatcher->connect(AssetService::class, 'assetRemoved',
            function (AssetInterface $asset) use ($logAssetChangeClosure) {
                if ($asset instanceof Asset) {
                    $logAssetChangeClosure($asset, new \DateTime(), 'ASSET_REMOVED');
                }
            });
        $dispatcher->connect(AssetService::class, 'assetResourceReplaced',
            function (AssetInterface $asset) use ($logAssetChangeClosure) {
                if ($asset instanceof Asset) {
                    $logAssetChangeClosure($asset, $asset->getLastModified(), 'ASSET_REPLACED');
                }
            });
    }
}
