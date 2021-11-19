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

use Flowpack\Media\Ui\Service\ConfigurationService;
use Flowpack\Media\Ui\Tus\PartialUploadFileCacheAdapter;
use Flowpack\Media\Ui\Tus\TusEventHandler;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Log\Utility\LogEnvironment;
use Neos\Flow\Utility\Environment;
use Neos\Flow\Utility\Exception;
use Neos\Fusion\View\FusionView;
use Neos\Neos\Controller\Module\AbstractModuleController;
use Neos\Utility\Exception\FilesException;
use Neos\Utility\Files;
use Psr\Log\LoggerInterface;
use TusPhp\Events\TusEvent;
use TusPhp\Tus\Server;

/**
 * @Flow\Scope("singleton")
 */
class MediaController extends AbstractModuleController
{
    /**
     * @Flow\Inject
     * @var TusEventHandler
     */
    protected $tusEventHandler;

    /**
     * @Flow\Inject
     * @var Environment
     */
    protected $environment;

    /**
     * @var FusionView
     */
    protected $view;

    /**
     * @var string
     */
    protected $defaultViewObjectName = FusionView::class;

    /**
     * @Flow\Inject
     * @var PartialUploadFileCacheAdapter
     */
    protected $partialUploadFileCacheAdapater;

    /**
     * @Flow\Inject
     * @var ConfigurationService
     */
    protected $configurationService;

    /**
     * @Flow\Inject
     * @var LoggerInterface
     */
    protected $logger;

    /**
     * @var array
     */
    protected $viewFormatToObjectNameMap = [
        'html' => FusionView::class,
    ];

    /**
     * Renders the media ui application
     */
    public function indexAction(): void
    {
    }

    /**
     * @throws Exception
     * @throws FilesException
     * @Flow\SkipCsrfProtection
     */
    public function uploadAction(): string
    {
        $uploadDirectory = Files::concatenatePaths([$this->environment->getPathToTemporaryDirectory(), 'TusUpload']);
        if (!file_exists($uploadDirectory)) {
            Files::createDirectoryRecursively($uploadDirectory);
        }

        $server = new Server($this->partialUploadFileCacheAdapater);
        $server->setApiPath($this->controllerContext->getRequest()->getHttpRequest()->getUri()->getPath())/** @phpstan-ignore-line */
        ->setUploadDir($uploadDirectory)
            ->setMaxUploadSize($this->configurationService->getMaximumUploadFileSize())
            ->event()
            ->addListener('tus-server.upload.complete', function (TusEvent $event) {
                $this->tusEventHandler->processUploadedFile($event);
            });

        $server->event()->addListener('tus-server.upload.created', function (TusEvent $event) {
            $this->logger->debug(sprintf('A new TUS file upload session was started for file "%s"', $event->getFile()->getName()), LogEnvironment::fromMethodName(__METHOD__));
        });

        $server->event()->addListener('tus-server.upload.progress', function (TusEvent $event) {
            $this->logger->debug(sprintf('Resumed TUS file upload for file "%s"', $event->getFile()->getName()), LogEnvironment::fromMethodName(__METHOD__));
        });

        $response = $server->serve();
        $this->controllerContext->getResponse()->setStatusCode($response->getStatusCode());

        $response->send();
        return '';
    }
}
