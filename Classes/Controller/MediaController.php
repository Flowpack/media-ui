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

use Flowpack\Media\Ui\Exception;
use Flowpack\Media\Ui\GraphQL\Context\AssetSourceContext;
use Flowpack\Media\Ui\GraphQL\Mutator\AssetMutator;
use Flowpack\Media\Ui\GraphQL\Types\AssetId;
use Flowpack\Media\Ui\GraphQL\Types\AssetIdentity;
use Flowpack\Media\Ui\GraphQL\Types\AssetSourceId;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Mvc\Exception\StopActionException;
use Neos\Fusion\View\FusionView;
use Neos\Media\Domain\Model\AssetInterface;
use Neos\Neos\Controller\Module\AbstractModuleController;

#[Flow\Scope('singleton')]
class MediaController extends AbstractModuleController
{
    #[Flow\Inject]
    protected AssetSourceContext $assetSourceContext;

    #[Flow\Inject]
    protected AssetMutator $assetMutator;


    /**
     * @var FusionView
     */
    protected $view;

    /**
     * @inheritdoc
     */
    protected $defaultViewObjectName = FusionView::class;

    /**
     * @inheritdoc
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

    public function editMetadataAction(
        AssetId $assetId,
        AssetSourceId $assetSourceId,
    ): void
    {
        $assetIdentity = new AssetIdentity($assetId, $assetSourceId);
        $asset = $this->assetSourceContext->getAsset($assetIdentity->assetId, $assetIdentity->assetSourceId);
        $this->view->assign('asset', $asset);
        $this->view->assign('formSchema', [
            'title' => [
                'type' => 'string',
                'label' => 'Title',
            ],
            'caption' => [
                'type' => 'string',
                'label' => 'Caption',
            ],
            'copyrightNotice' => [
                'type' => 'string',
                'editor' => 'textarea',
                'label' => 'Copyright Notice',
            ],
            'number' => [
                'type' => 'number',
                'label' => 'Number',
            ],
            'boolean' => [
                'type' => 'boolean',
                'label' => 'Boolean',
            ],
        ]);
    }

    /**
     * @param string[] $postData
     * @throws Exception
     * @throws StopActionException
     */
    public function updateMetadataAction(
        AssetInterface $asset,
        array $postData,
    ): void
    {
        $assetIdentity = new AssetIdentity(
            AssetId::fromString($this->persistenceManager->getIdentifierByObject($asset)),
            new AssetSourceId($asset->getAssetSourceIdentifier())
        );
        $this->assetMutator->updateAsset(
            $assetIdentity->assetId,
            $assetIdentity->assetSourceId,
            $postData['title'],
            $postData['caption'],
            $postData['copyrightNotice'],

        );
        $this->redirect('index');
    }
}
