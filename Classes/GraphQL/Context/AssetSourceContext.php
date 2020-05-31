<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Context;

/*
 * This file is part of the Flowpack.Media.Ui package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use Neos\Flow\Annotations as Flow;
use Neos\Media\Domain\Model\AssetSource\AssetSourceInterface;
use Neos\Media\Domain\Service\AssetSourceService;
use t3n\GraphQL\Context as BaseContext;

class AssetSourceContext extends BaseContext
{

    /**
     * @Flow\Inject
     * @var AssetSourceService
     */
    protected $assetSourceService;

    /**
     * @var array<AssetSourceInterface>
     */
    protected array $assetSources;

    /**
     * @return void
     */
    public function initializeObject(): void
    {
        $this->assetSources = $this->assetSourceService->getAssetSources();
    }

    /**
     * @param string $assetSourceName
     * @return AssetSourceInterface|null
     */
    public function getAssetSource(string $assetSourceName): ?AssetSourceInterface
    {
        return $this->assetSources[$assetSourceName] ?? null;
    }

    /**
     * @return array<AssetSourceInterface>
     */
    public function getAssetSources(): array
    {
        return $this->assetSources;
    }
}
