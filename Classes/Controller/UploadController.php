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
use Neos\Flow\Mvc\Controller\ActionController;
use Neos\Flow\Mvc\View\JsonView;
use Neos\Flow\Persistence\Exception\IllegalObjectTypeException;
use Neos\Flow\ResourceManagement\PersistentResource;
use Neos\Media\Domain\Repository\AssetRepository;
use Neos\Media\Domain\Strategy\AssetModelMappingStrategyInterface;

/**
 * @Flow\Scope("singleton")
 */
class UploadController extends ActionController
{
    /**
     * @var JsonView
     */
    protected $view;

    /**
     * @var string
     */
    protected $defaultViewObjectName = JsonView::class;

    /**
     * @var array
     */
    protected $supportedMediaTypes = ['application/json'];

    /**
     * @var array
     */
    protected $viewFormatToObjectNameMap = [
        'json' => JsonView::class,
    ];

    /**
     * @Flow\Inject
     * @var AssetRepository
     */
    protected $assetRepository;

    /**
     * @Flow\Inject
     * @var AssetModelMappingStrategyInterface
     */
    protected $mappingStrategy;

    /**
     * Allows uploading one or more assets
     * TODO: Remove this method when the upload via GraphQL is fully implemented
     * @param PersistentResource $file
     * @throws \Exception
     */
    public function uploadAction(PersistentResource $file): void
    {
        $success = false;
        $result = 'ERROR';

        // TODO: Find out why the propertymapper doesn't work here like it does in the Media browser and this has to be done manually. It should be possible to directly get an Asset via the initializeUpdateAction method and matching propertymapper config, but it doesn't :(
        if ($this->assetRepository->findOneByResourceSha1($file->getSha1())) {
            $result = 'EXISTS';
        } else {
            try {
                $className = $this->mappingStrategy->map($file);
                $asset = new $className($file);

                if ($this->persistenceManager->isNewObject($asset)) {
                    $this->assetRepository->add($asset);
                    $result = 'ADDED';
                    $success = true;
                } else {
                    $result = 'EXISTS';
                }
            } catch (IllegalObjectTypeException $e) {
            }
        }

        $this->view->assign('value', [
            'success' => $success,
            'result' => $result,
        ]);
    }
}
