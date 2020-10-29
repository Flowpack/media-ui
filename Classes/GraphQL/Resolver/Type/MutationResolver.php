<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Resolver\Type;

/*
 * This file is part of the Flowpack.Media.Ui package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use Doctrine\Common\Collections\ArrayCollection;
use Flowpack\Media\Ui\Exception;
use Flowpack\Media\Ui\GraphQL\Context\AssetSourceContext;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Persistence\Exception\IllegalObjectTypeException;
use Neos\Flow\Persistence\Exception\InvalidQueryException;
use Neos\Flow\Persistence\PersistenceManagerInterface;
use Neos\Flow\ResourceManagement\ResourceManager;
use Neos\Http\Factories\FlowUploadedFile;
use Neos\Media\Domain\Model\AssetSource\AssetProxy\AssetProxyInterface;
use Neos\Media\Domain\Model\AssetCollection;
use Neos\Media\Domain\Model\Tag;
use Neos\Media\Domain\Repository\AssetCollectionRepository;
use Neos\Media\Domain\Repository\AssetRepository;
use Neos\Media\Domain\Repository\TagRepository;
use Neos\Media\Domain\Strategy\AssetModelMappingStrategyInterface;
use Neos\Media\Exception\AssetServiceException;
use Neos\Neos\Domain\Repository\SiteRepository;
use Psr\Log\LoggerInterface;
use t3n\GraphQL\ResolverInterface;

/**
 * @Flow\Scope("singleton")
 */
class MutationResolver implements ResolverInterface
{
    /**
     * @Flow\Inject
     * @var AssetRepository
     */
    protected $assetRepository;

    /**
     * @Flow\Inject
     * @var TagRepository
     */
    protected $tagRepository;

    /**
     * @Flow\Inject
     * @var ResourceManager
     */
    protected $resourceManager;

    /**
     * @Flow\Inject
     * @var AssetModelMappingStrategyInterface
     */
    protected $mappingStrategy;

    /**
     * @Flow\Inject
     * @var PersistenceManagerInterface
     */
    protected $persistenceManager;

    /**
     * @Flow\Inject
     * @var LoggerInterface
     */
    protected $systemLogger;

    /**
     * @Flow\Inject
     * @var AssetCollectionRepository
     */
    protected $assetCollectionRepository;


    /**
     * @Flow\Inject
     * @var SiteRepository
     */
    protected $siteRepository;

    /**
     * @param $_
     * @param array $variables
     * @param AssetSourceContext $assetSourceContext
     * @return bool
     * @throws Exception
     * @throws AssetServiceException
     */
    public function deleteAsset($_, array $variables, AssetSourceContext $assetSourceContext): bool
    {
        [
            'id' => $id,
            'assetSourceId' => $assetSourceId,
        ] = $variables;

        $assetProxy = $assetSourceContext->getAssetProxy($id, $assetSourceId);
        if (!$assetProxy) {
            return false;
        }
        $asset = $assetSourceContext->getAssetForProxy($assetProxy);

        if (!$asset) {
            throw new Exception('Cannot delete asset that was never imported', 1591553708);
        }

        try {
            $this->assetRepository->remove($asset);
        } catch (IllegalObjectTypeException $e) {
            throw new Exception('Failed to delete asset', 1591537315);
        }

        return true;
    }

    /**
     * @param $_
     * @param array $variables
     * @param AssetSourceContext $assetSourceContext
     * @return AssetProxyInterface|null
     * @throws Exception
     */
    public function updateAsset($_, array $variables, AssetSourceContext $assetSourceContext): ?AssetProxyInterface
    {
        [
            'id' => $id,
            'assetSourceId' => $assetSourceId,
            'label' => $label,
            'caption' => $caption,
            'copyrightNotice' => $copyrightNotice
        ] = $variables + ['label' => null, 'caption' => null, 'copyrightNotice' => 'nix'];

        $assetProxy = $assetSourceContext->getAssetProxy($id, $assetSourceId);
        if (!$assetProxy) {
            return null;
        }
        $asset = $assetSourceContext->getAssetForProxy($assetProxy);

        if (!$asset) {
            throw new Exception('Cannot update asset that was never imported', 1590659044);
        }

        if ($label !== null) {
            $asset->setTitle($label);
        }

        if ($caption !== null) {
            $asset->setCaption($caption);
        }

        if ($copyrightNotice !== null) {
            $asset->setCopyrightNotice($copyrightNotice);
        }

        try {
            $this->assetRepository->update($asset);
        } catch (IllegalObjectTypeException $e) {
            throw new Exception('Failed to update asset', 1590659063);
        }

        return $assetProxy;
    }

    /**
     * @param $_
     * @param array $variables
     * @param AssetSourceContext $assetSourceContext
     * @return AssetProxyInterface|null
     * @throws Exception
     */
    public function tagAsset($_, array $variables, AssetSourceContext $assetSourceContext): ?AssetProxyInterface
    {
        [
            'id' => $id,
            'assetSourceId' => $assetSourceId,
            'tag' => $tagName
        ] = $variables;

        $assetProxy = $assetSourceContext->getAssetProxy($id, $assetSourceId);
        if (!$assetProxy) {
            return null;
        }
        $asset = $assetSourceContext->getAssetForProxy($assetProxy);

        if (!$asset) {
            throw new Exception('Cannot tag asset that was never imported', 1591561758);
        }

        $tag = $this->tagRepository->findOneByLabel($tagName);

        if (!$tag) {
            throw new Exception('Cannot tag asset with tag that does not exist', 1591561845);
        }

        $asset->addTag($tag);

        try {
            $this->assetRepository->update($asset);
        } catch (IllegalObjectTypeException $e) {
            throw new Exception('Failed to update asset', 1591561868);
        }

        return $assetProxy;
    }

    /**
     * @param $_
     * @param array $variables
     * @param AssetSourceContext $assetSourceContext
     * @return AssetProxyInterface|null
     * @throws Exception
     */
    public function setAssetTags($_, array $variables, AssetSourceContext $assetSourceContext): ?AssetProxyInterface
    {
        [
            'id' => $id,
            'assetSourceId' => $assetSourceId,
            'tags' => $tagNames
        ] = $variables;
        $assetProxy = $assetSourceContext->getAssetProxy($id, $assetSourceId);
        if (!$assetProxy) {
            return null;
        }
        $asset = $assetSourceContext->getAssetForProxy($assetProxy);

        if (!$asset) {
            throw new Exception('Cannot tag asset that was never imported', 1594621322);
        }

        $tags = new ArrayCollection();
        foreach ($tagNames as $tagName) {
            $tag = $this->tagRepository->findOneByLabel($tagName);
            if (!$tag) {
                throw new Exception('Cannot tag asset with tag that does not exist', 1594621318);
            }
            $tags->add($tag);
        }
        $asset->setTags($tags);

        try {
            $this->assetRepository->update($asset);
        } catch (IllegalObjectTypeException $e) {
            throw new Exception('Failed to set asset tags', 1594621296);
        }

        return $assetProxy;
    }

    /**
     * @param $_
     * @param array $variables
     * @param AssetSourceContext $assetSourceContext
     * @return AssetProxyInterface|null
     * @throws Exception
     */
    public function setAssetCollections($_, array $variables, AssetSourceContext $assetSourceContext): ?AssetProxyInterface
    {
        [
            'id' => $id,
            'assetSourceId' => $assetSourceId,
            'assetCollectionIds' => $assetCollectionIds
        ] = $variables;
        $assetProxy = $assetSourceContext->getAssetProxy($id, $assetSourceId);
        if (!$assetProxy) {
            return null;
        }
        $asset = $assetSourceContext->getAssetForProxy($assetProxy);

        if (!$asset) {
            throw new Exception('Cannot assign collections to asset that was never imported', 1594621322);
        }

        $assetCollections = new ArrayCollection();
        foreach ($assetCollectionIds as $assetCollectionId) {
            $collection = $this->assetCollectionRepository->findByIdentifier($assetCollectionId);
            if (!$collection) {
                throw new Exception('Cannot assign non existing assign collection to asset', 1594621318);
            }
            $assetCollections->add($collection);
        }
        $asset->setAssetCollections($assetCollections);

        try {
            $this->assetRepository->update($asset);
        } catch (IllegalObjectTypeException $e) {
            throw new Exception('Failed to assign asset collections', 1594621296);
        }

        return $assetProxy;
    }

    /**
     * @param $_
     * @param array $variables
     * @param AssetSourceContext $assetSourceContext
     * @return AssetProxyInterface|null
     * @throws Exception
     */
    public function untagAsset($_, array $variables, AssetSourceContext $assetSourceContext): ?AssetProxyInterface
    {
        [
            'id' => $id,
            'assetSourceId' => $assetSourceId,
            'tag' => $tagName
        ] = $variables;

        $assetProxy = $assetSourceContext->getAssetProxy($id, $assetSourceId);
        if (!$assetProxy) {
            return null;
        }
        $asset = $assetSourceContext->getAssetForProxy($assetProxy);

        if (!$asset) {
            throw new Exception('Cannot untag asset that was never imported', 1591561930);
        }

        $tag = $this->tagRepository->findOneByLabel($tagName);

        if (!$tag) {
            throw new Exception('Cannot untag asset from tag that does not exist', 1591561934);
        }

        $asset->removeTag($tag);

        try {
            $this->assetRepository->update($asset);
        } catch (IllegalObjectTypeException $e) {
            throw new Exception('Failed to update asset', 1591561938);
        }

        return $assetProxy;
    }

    /**
     * Stores the given file and returns an array with the result
     *
     * @param $_
     * @param array $variables
     * @return array
     */
    public function uploadFile($_, array $variables): array
    {
        /** @var FlowUploadedFile $file */
        $file = $variables['file'];

        $success = false;
        $result = 'ERROR';

        $filename = $file->getClientFilename();
        try {
            $resource = $this->resourceManager->importResource($file->getStream()->detach());
        } catch (\Neos\Flow\ResourceManagement\Exception $e) {
            $this->systemLogger->error('Could not import uploaded file');
            $resource = null;
        }

        if ($resource) {
            $resource->setFilename($filename);
            $resource->setMediaType($file->getClientMediaType());

            if ($this->assetRepository->findOneByResourceSha1($resource->getSha1())) {
                $result = 'EXISTS';
            } else {
                try {
                    $className = $this->mappingStrategy->map($resource);
                    $asset = new $className($resource);

                    if ($this->persistenceManager->isNewObject($asset)) {
                        $this->assetRepository->add($asset);
                        $result = 'ADDED';
                        $success = true;
                    } else {
                        $result = 'EXISTS';
                    }
                } catch (IllegalObjectTypeException $e) {
                    $this->systemLogger->error('Type of uploaded file cannot be stored');
                }
            }
        }

        return [
            'filename' => $filename,
            'success' => $success,
            'result' => $result,
        ];
    }

    /**
     * Stores all given files and returns an array of results for each upload
     *
     * @param $_
     * @param array $variables
     * @return array<array>
     */
    public function uploadFiles($_, array $variables): array
    {
        /** @var array<FlowUploadedFile> $files */
        $files = $variables['files'];

        $results = [];
        foreach ($files as $file) {
            $results[$file->getClientFilename()] = $this->uploadFile($_, ['file' => $file]);
        }
        return $results;
    }

    /**
     * @param $_
     * @param array $variables
     * @param AssetSourceContext $assetSourceContext
     * @return AssetProxyInterface|null
     * @throws Exception
     */
    public function importAsset($_, array $variables, AssetSourceContext $assetSourceContext): ?AssetProxyInterface
    {
        [
            'id' => $id,
            'assetSourceId' => $assetSourceId,
        ] = $variables;

        $importedAsset = $assetSourceContext->importAsset($assetSourceId, $id);

        if (!$importedAsset) {
            throw new Exception('Could not import asset', 1591972264);
        }
        return $importedAsset;
    }

    /**
     * @param $_
     * @param array $variables
     * @return AssetCollection
     * @throws IllegalObjectTypeException
     */
    public function createAssetCollection($_, array $variables): AssetCollection
    {
        [
            'title' => $title,
        ] = $variables;

        $newAssetCollection = new AssetCollection($title);

        // FIXME: Multiple asset collections with the same title can exist, but do we want that?

        $this->assetCollectionRepository->add($newAssetCollection);

        return $newAssetCollection;
    }

    /**
     * @param $_
     * @param array $variables
     * @return array
     * @throws Exception|IllegalObjectTypeException
     */
    public function deleteAssetCollection($_, array $variables): array
    {
        [
            'id' => $id,
        ] = $variables;

        $assetCollection = $this->assetCollectionRepository->findByIdentifier($id);

        if (!$assetCollection) {
            throw new Exception('Asset collection not found', 1591972269);
        }

        /** @noinspection PhpUndefinedMethodInspection */
        foreach ($this->siteRepository->findByAssetCollection($assetCollection) as $site) {
            $site->setAssetCollection(null);
            $this->siteRepository->update($site);
        }

        $this->assetCollectionRepository->remove($assetCollection);

        return [
            'success' => true,
        ];
    }

    /**
     * @param $_
     * @param array $variables
     * @return AssetCollection|null
     * @throws Exception
     */
    public function updateAssetCollection($_, array $variables): AssetCollection
    {
        [
            'id' => $id,
            'title' => $title,
            'tagNames' => $tagNames
        ] = $variables + ['title' => null, 'tagNames' => null];

        $assetCollection = $this->assetCollectionRepository->findByIdentifier($id);

        if (!$assetCollection) {
            throw new Exception('Asset collection not found', 1590659045);
        }

        if ($title !== null) {
            $assetCollection->setTitle($title);
        }

        if ($tagNames !== null) {
            $tags = new ArrayCollection();
            foreach ($tagNames as $tagName) {
                $tag = $this->tagRepository->findOneByLabel($tagName);
                if (!$tag) {
                    throw new Exception('Cannot tag asset collection with tag that does not exist', 1594621319);
                }
                $tags->add($tag);
            }
            $assetCollection->setTags($tags);
        }

        $this->assetCollectionRepository->update($assetCollection);

        return $assetCollection;
    }

    /**
     * @param $_
     * @param array $variables
     * @return Tag
     * @throws Exception|IllegalObjectTypeException
     */
    public function createTag($_, array $variables): Tag
    {
        [
            'tag' => $label,
            'assetCollectionId' => $assetCollectionId
        ] = $variables + ['assetCollectionId' => null];

        $tag = $this->tagRepository->findOneByLabel($label);
        if ($tag === null) {
            $tag = new Tag($label);
            $this->tagRepository->add($tag);
        } else {
            throw new Exception('Tag already exists', 1603921233);
        }

        if ($assetCollectionId) {
            $assetCollection = $this->assetCollectionRepository->findByIdentifier($assetCollectionId);
            if ($assetCollection) {
                $assetCollection->addTag($tag);
                $this->assetCollectionRepository->update($assetCollection);
            } else {
                throw new Exception('Asset collection not found', 1603921193);
            }
        }
        return $tag;
    }

    /**
     * @param $_
     * @param array $variables
     * @return bool
     * @throws Exception|IllegalObjectTypeException|InvalidQueryException
     */
    public function deleteTag($_, array $variables): bool
    {
        [
            'tag' => $label,
        ] = $variables;

        $tag = $this->tagRepository->findOneByLabel($label);

        if (!$tag) {
            throw new Exception('Tag not found', 1591553709);
        }

        $taggedAssets = $this->assetRepository->findByTag($tag);
        foreach ($taggedAssets as $asset) {
            $asset->removeTag($tag);
            $this->assetRepository->update($asset);
        }
        $this->tagRepository->remove($tag);

        return true;
    }
}
