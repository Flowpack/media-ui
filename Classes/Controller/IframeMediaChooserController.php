<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\Controller;

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
use Neos\Fusion\View\FusionView;
use Neos\Neos\Controller\Module\AbstractModuleController;

/**
 * This is the entry point for choosing Media by opening an iframe. This is useful for
 * Flow applications or "traditional" non-React Neos Backend Modules.
 *
 * @Flow\Scope("singleton")
 */
class IframeMediaChooserController extends AbstractModuleController
{
    /**
     * @var FusionView
     */
    protected $view;

    /**
     * @var string
     */
    protected $defaultViewObjectName = FusionView::class;

    /**
     * @var array
     */
    protected $viewFormatToObjectNameMap = [
        'html' => FusionView::class,
    ];

    /**
     * Renders the media chooser
     */
    public function indexAction(): void
    {
    }
}
