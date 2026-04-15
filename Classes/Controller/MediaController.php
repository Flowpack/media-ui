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

use Flowpack\Media\Ui\GraphQL\Context\AssetSourceContext;
use Flowpack\Media\Ui\GraphQL\Mutator\AssetMutator;
use Flowpack\Media\Ui\GraphQL\Types\AssetId;
use Flowpack\Media\Ui\GraphQL\Types\AssetIdentity;
use Flowpack\Media\Ui\GraphQL\Types\AssetSourceId;
use Neos\Flow\Annotations as Flow;
use Neos\Fusion\View\FusionView;
use Neos\Media\Domain\Model\AssetInterface;
use Neos\Neos\Controller\Module\AbstractModuleController;

#[Flow\Scope('singleton')]
class MediaController extends AbstractModuleController
{
    /**
     * @var AssetSourceContext
     * @Flow\Inject
     */
    protected AssetSourceContext $assetSourceContext;

    /**
     * @Flow\Inject
     */
    protected AssetMutator $assetMutator;


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
     * Renders the media ui application
     */
    public function indexAction(): void
    {
    }

    public function editMetadataAction(
        string $id,
        string $assetSourceId,
    ): void
    {
        $assetIdentity = AssetIdentity::fromArray(['id' => AssetId::fromString($id), 'assetSourceId' => new AssetSourceId($assetSourceId)]);
        $asset = $this->assetSourceContext->getAsset($assetIdentity->id, $assetIdentity->assetSourceId);
        $this->view->assign('asset', $asset);
        $this->view->assign('formSchema', json_encode([
            'title' => [
                'type' => 'string',
                'label' => 'Title',
            ],
            'number' => [
                'type' => 'number',
                'label' => 'Number',
            ],
            'boolean' => [
                'type' => 'boolean',
                'label' => 'Boolean',
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
        ]));
    }

    /**
     * @param AssetInterface $asset
     * @param string[] $postData
     */
    public function updateMetadataAction(
        AssetInterface $asset,
        array $postData,
    ): void
    {
        $assetIdentity = AssetIdentity::fromArray([
            'id' => AssetId::fromString($this->persistenceManager->getIdentifierByObject($asset)),
            'assetSourceId' => new AssetSourceId($asset->getAssetSourceIdentifier()),
        ]);
        $this->assetMutator->updateAsset(
            $assetIdentity->id,
            $assetIdentity->assetSourceId,
            $postData['title'],
            $postData['caption'],
            $postData['copyright'],

        );
        $this->redirect('index');
    }
}
