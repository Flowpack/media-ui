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

use Neos\Flow\Annotations as Flow;
use Neos\Flow\Log\Utility\LogEnvironment;
use Neos\Flow\ResourceManagement\Exception;
use Neos\Flow\ResourceManagement\ResourceManager;
use Neos\Media\Domain\Repository\AssetRepository;
use Neos\Media\Domain\Service\AssetService;
use Neos\Media\Domain\Strategy\AssetModelMappingStrategyInterface;
use Neos\Utility\Files;
use Psr\Log\LoggerInterface;
use TusPhp\Events\TusEvent;

class TusEventHandler
{

    /**
     * @Flow\Inject
     * @var ResourceManager
     */
    protected $resourceManager;

    /**
     * @Flow\Inject
     * @var AssetModelMappingStrategyInterface
     */
    protected $assetModelMappingStrategy;

    /**
     * @Flow\Inject
     * @var AssetService
     */
    protected $assetService;

    /**
     * @Flow\Inject
     * @var AssetRepository
     */
    protected $assetRepository;

    /**
     * @Flow\Inject
     * @var LoggerInterface
     */
    protected $logger;

    /**
     * @param TusEvent $event
     * @throws Exception
     */
    public function processUploadedFile(TusEvent $event): void
    {
        $persistentResource = $this->resourceManager->importResource($event->getFile()->getFilePath());
        $event->getFile()->deleteFiles([$event->getFile()->getFilePath()]);

        if ($this->assetRepository->findOneByResourceSha1($persistentResource->getSha1())) {
            $this->logger->info(sprintf('The uploaded file "%s" (Sha1: %s) already existed in the resource management.', $persistentResource->getFilename(), $persistentResource->getSha1()), LogEnvironment::fromMethodName(__METHOD__));
            return;
        }

        $targetType = $this->assetModelMappingStrategy->map($persistentResource);
        $asset = new $targetType($persistentResource);
        $this->assetService->getRepository($asset)->add($asset);

        $this->logger->info(sprintf('The uploaded file "%s" (Sha1: %s) was successfully imported.', $persistentResource->getFilename(), $persistentResource->getSha1()), LogEnvironment::fromMethodName(__METHOD__));
    }
}
