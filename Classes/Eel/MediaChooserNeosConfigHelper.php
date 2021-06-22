<?php
declare(strict_types=1);

namespace Flowpack\Media\Ui\Eel;

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
use Neos\Eel\ProtectedContextAwareInterface;
use Neos\Neos\Service\UserService;
use Neos\Neos\Service\XliffService;

/**
 * This helper is used inside the view rendering of {@see IframeMediaChooserController},
 * to set up a HTML environment as close as possible to the the Fluid-based backend modules.
 *
 * This is a workaround and should NOT be relied upon externally.
 *
 * @internal
 */
class MediaChooserNeosConfigHelper implements ProtectedContextAwareInterface
{
    /**
     * @Flow\Inject
     * @var UserService
     */
    protected $userService;

    /**
     * @Flow\Inject
     * @var XliffService
     */
    protected $xliffService;

    public function allowsCallOfMethod($methodName)
    {
        return true;
    }

    public function backendInterfaceLanguage()
    {
        return $this->userService->getInterfaceLanguage();
    }

    public function backendXliffCacheVersion()
    {
        return $this->xliffService->getCacheVersion();
    }
}
