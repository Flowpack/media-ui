<?php

/** @noinspection PhpUnusedParameterInspection */

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
use Neos\Media\Domain\Model\Asset;
use Neos\Media\Domain\Model\AssetInterface;
use Neos\Media\Domain\Model\AssetSource\AssetProxy\AssetProxyInterface;
use Neos\Media\Domain\Model\AssetCollection;
use Neos\Media\Domain\Model\Tag;
use Neos\Media\Domain\Repository\AssetCollectionRepository;
use Neos\Media\Domain\Repository\AssetRepository;
use Neos\Media\Domain\Repository\TagRepository;
use Neos\Media\Domain\Service\AssetService;
use Neos\Media\Domain\Strategy\AssetModelMappingStrategyInterface;
use Neos\Media\Exception\AssetServiceException;
use Neos\Neos\Domain\Repository\SiteRepository;
use Neos\Utility\MediaTypes;
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
     * @Flow\Inject
     * @var AssetService
     */
    protected $assetService;

    /**
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

        if ($asset instanceof Asset) {
            if ($caption !== null) {
                $asset->setCaption($caption);
            }

            if ($copyrightNotice !== null) {
                $asset->setCopyrightNotice($copyrightNotice);
            }
        }

        try {
            $this->assetRepository->update($asset);
        } catch (IllegalObjectTypeException $e) {
            throw new Exception('Failed to update asset', 1590659063);
        }

        return $assetProxy;
    }

    /**
     * @throws Exception
     */
    public function tagAsset($_, array $variables, AssetSourceContext $assetSourceContext): ?AssetProxyInterface
    {
        [
            'id' => $id,
            'assetSourceId' => $assetSourceId,
            'tagId' => $tagId
        ] = $variables;

        $assetProxy = $assetSourceContext->getAssetProxy($id, $assetSourceId);
        if (!$assetProxy) {
            return null;
        }
        $asset = $assetSourceContext->getAssetForProxy($assetProxy);

        if (!$asset) {
            throw new Exception('Cannot tag asset that was never imported', 1591561758);
        }

        if (!$asset instanceof Asset) {
            throw new Exception('Asset type does not support tagging', 1619081662);
        }

        /** @var Tag $tag */
        $tag = $this->tagRepository->findByIdentifier($tagId);

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
     * @throws Exception
     */
    public function setAssetTags($_, array $variables, AssetSourceContext $assetSourceContext): ?AssetProxyInterface
    {
        [
            'id' => $id,
            'assetSourceId' => $assetSourceId,
            'tagIds' => $tagIds
        ] = $variables;
        $assetProxy = $assetSourceContext->getAssetProxy($id, $assetSourceId);
        if (!$assetProxy) {
            return null;
        }
        $asset = $assetSourceContext->getAssetForProxy($assetProxy);

        if (!$asset) {
            throw new Exception('Cannot tag asset that was never imported', 1594621322);
        }

        if (!$asset instanceof Asset) {
            throw new Exception('Asset type does not support tagging', 1619081714);
        }

        $tags = new ArrayCollection();
        foreach ($tagIds as $tagId) {
            $tag = $this->tagRepository->findByIdentifier($tagId);
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

        if (!$asset instanceof Asset) {
            throw new Exception('Asset type does not support collections', 1619081722);
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
     * @throws Exception
     */
    public function untagAsset($_, array $variables, AssetSourceContext $assetSourceContext): ?AssetProxyInterface
    {
        [
            'id' => $id,
            'assetSourceId' => $assetSourceId,
            'tagId' => $tagId
        ] = $variables;

        $assetProxy = $assetSourceContext->getAssetProxy($id, $assetSourceId);
        if (!$assetProxy) {
            return null;
        }
        $asset = $assetSourceContext->getAssetForProxy($assetProxy);

        if (!$asset) {
            throw new Exception('Cannot untag asset that was never imported', 1591561930);
        }

        if (!$asset instanceof Asset) {
            throw new Exception('Asset type does not support tagging', 1619081740);
        }

        /** @var Tag $tag */
        $tag = $this->tagRepository->findByIdentifier($tagId);

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
     * @return array{filename: string, success: bool, result: string}
     */
    public function uploadFile($_, array $variables): array
    {
        /** @var FlowUploadedFile $file */
        $file = $variables['file'];
        $tagId = $variables['tagId'] ?? null;
        $assetCollectionId = $variables['assetCollectionId'] ?? null;

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
                    /** @var Asset $asset */
                    $asset = new $className($resource);

                    if ($this->persistenceManager->isNewObject($asset)) {
                        if ($tagId) {
                            /** @var Tag $tag */
                            $tag = $this->tagRepository->findByIdentifier($tagId);
                            if ($tag) {
                                $asset->addTag($tag);
                            }
                        }
                        if ($assetCollectionId) {
                            /** @var AssetCollection $assetCollection */
                            $assetCollection = $this->assetCollectionRepository->findByIdentifier($assetCollectionId);
                            if ($assetCollection) {
                                $asset->setAssetCollections(new ArrayCollection([$assetCollection]));
                            }
                        }

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

        // FIXME: The filename is not unique enough for multiple uploads, we need an id instead
        return [
            'filename' => $filename,
            'success' => $success,
            'result' => $result,
        ];
    }

    /**
     * Stores all given files and returns an array of results for each upload
     *
     * @return array<array{filename: string, success: bool, result: string}>
     */
    public function uploadFiles($_, array $variables): array
    {
        /** @var array<FlowUploadedFile> $files */
        $files = $variables['files'];
        $tagId = $variables['tagId'] ?? null;
        $assetCollectionId = $variables['assetCollectionId'] ?? null;

        $results = [];
        foreach ($files as $file) {
            $results[$file->getClientFilename()] = $this->uploadFile($_, [
                'file' => $file,
                'tagId' => $tagId,
                'assetCollectionId' => $assetCollectionId,
            ]);
        }
        return $results;
    }

    /**
     * Replaces an asset and its usages
     *
     * @return array{filename: string, success: bool, result: string}
     * @throws Exception
     */
    public function replaceAsset($_, array $variables, AssetSourceContext $assetSourceContext): array
    {
        /** @var FlowUploadedFile $file */
        [
            'id' => $id,
            'assetSourceId' => $assetSourceId,
            'file' => $file,
            'options' => [
                'generateRedirects' => $generateRedirects,
                'keepOriginalFilename' => $keepOriginalFilename
            ]
        ] = $variables;

        $assetProxy = $assetSourceContext->getAssetProxy($id, $assetSourceId);
        if (!$assetProxy) {
            throw new Exception('No proxy found for asset', 1678113903);
        }
        $asset = $assetSourceContext->getAssetForProxy($assetProxy);

        if (!$asset) {
            throw new Exception('Cannot replace asset that was never imported', 1648046173);
        }

        if (!$asset instanceof Asset) {
            throw new Exception('Asset type does not support replacing', 1648046186);
        }

        $success = false;
        $result = 'ERROR';
        $sourceMediaType = MediaTypes::parseMediaType($asset->getMediaType());
        $replacementMediaType = MediaTypes::parseMediaType($file->getClientMediaType());
        $filename = $file->getClientFilename();

        // Prevent replacement of image, audio and video by a different mimetype because of possible rendering issues.
        if ($sourceMediaType['type'] !== $replacementMediaType['type'] && in_array($sourceMediaType['type'], ['image', 'audio', 'video'])) {
            $this->systemLogger->error(sprintf('Cannot replace asset of mimetype %s with mimetype %s', $sourceMediaType['type'], $replacementMediaType['type']));
            return [
                'filename' => $filename,
                'success' => false,
                'result' => $result,
            ];
        }

        try {
            $resource = $this->resourceManager->importResource($file->getStream()->detach());
        } catch (\Neos\Flow\ResourceManagement\Exception $e) {
            $this->systemLogger->error('Could not import uploaded file');
            $resource = null;
        }

        if ($resource) {
            $resource->setFilename($filename);
            $resource->setMediaType($file->getClientMediaType());

            try {
                $this->assetService->replaceAssetResource($asset, $resource, [
                    'generateRedirects' => $generateRedirects,
                    'keepOriginalFilename' => $keepOriginalFilename
                ]);
                $success = true;
                $result = 'REPLACED';
            } catch (\Exception $exception) {
                $this->systemLogger->error(sprintf('Asset %s could not be replaced', $asset->getIdentifier()), [$exception]);
            }
        }

        return [
            'filename' => $filename,
            'success' => $success,
            'result' => $result,
        ];
    }

    /**
     * @throws Exception|\Neos\Flow\ResourceManagement\Exception
     */
    public function editAsset($_, array $variables, AssetSourceContext $assetSourceContext): array
    {
        [
            'id' => $id,
            'assetSourceId' => $assetSourceId,
            'filename' => $filename,
            'options' => [
                'generateRedirects' => $generateRedirects,
            ]
        ] = $variables;

        $filename = trim($filename);
        if (!$filename) {
            throw new Exception('Filename was empty', 1678156902);
        }

        $assetProxy = $assetSourceContext->getAssetProxy($id, $assetSourceId);
        if (!$assetProxy) {
            throw new Exception('No proxy found for asset', 1678113903);
        }
        $asset = $assetSourceContext->getAssetForProxy($assetProxy);

        if (!$asset) {
            throw new Exception('Cannot rename asset that was never imported', 1678155884);
        }

        if (!$asset instanceof Asset) {
            throw new Exception('Asset type does not support renaming', 1678155887);
        }

        // Make sure the filename has the same extension as before
        if (!strpos($filename, $asset->getFileExtension())) {
            $filename .= '.' . $asset->getFileExtension();
        }

        $success = false;

        // Copy the resource to a new one with the new filename
        $originalResource = $asset->getResource();
        $originalResourceStream = $originalResource->getStream();
        $resource = $this->resourceManager->importResource($originalResourceStream, $originalResource->getCollectionName());
        fclose($originalResourceStream);
        $resource->setFilename($filename);
        $resource->setMediaType($originalResource->getMediaType());

        try {
            $this->assetService->replaceAssetResource($asset, $resource, [
                'generateRedirects' => $generateRedirects,
            ]);
            $success = true;
        } catch (\Exception $exception) {
            $this->systemLogger->error(sprintf('Asset %s could not be replace with the renamed copy', $asset->getIdentifier()), [$exception]);
        }

        return [
            'success' => $success,
        ];
    }

    /**
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
     * @throws Exception|IllegalObjectTypeException
     */
    public function updateAssetCollection($_, array $variables): ?AssetCollection
    {
        [
            'id' => $id,
            'title' => $title,
            'tagIds' => $tagIds
        ] = $variables + ['title' => null, 'tagIds' => null];

        /** @var AssetCollection $assetCollection */
        $assetCollection = $this->assetCollectionRepository->findByIdentifier($id);

        if (!$assetCollection) {
            throw new Exception('Asset collection not found', 1590659045);
        }

        if ($title !== null) {
            $assetCollection->setTitle($title);
        }

        if ($tagIds !== null) {
            $tags = new ArrayCollection();
            foreach ($tagIds as $tagId) {
                $tag = $this->tagRepository->findByIdentifier($tagId);
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
     * @throws Exception|IllegalObjectTypeException
     */
    public function createTag($_, array $variables): Tag
    {
        [
            'label' => $label,
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
     * @throws Exception|IllegalObjectTypeException
     */
    public function updateTag($_, array $variables): ?Tag
    {
        [
            'id' => $id,
            'label' => $label,
        ] = $variables + ['label' => null];

        /** @var Tag $tag */
        $tag = $this->tagRepository->findByIdentifier($id);

        if (!$tag) {
            throw new Exception('Tag not found', 1590659046);
        }

        if ($label !== null) {
            $tag->setLabel($label);
        }

        $this->tagRepository->update($tag);

        return $tag;
    }

    /**
     * @throws Exception|IllegalObjectTypeException|InvalidQueryException
     */
    public function deleteTag($_, array $variables): bool
    {
        [
            'id' => $id,
        ] = $variables;

        /** @var Tag $tag */
        $tag = $this->tagRepository->findByIdentifier($id);

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
