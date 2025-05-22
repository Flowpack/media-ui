<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Mutator;

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
use Flowpack\Media\Ui\Domain\Model\Dto\MutationResult;
use Flowpack\Media\Ui\Exception as MediaUiException;
use Flowpack\Media\Ui\GraphQL\Context\AssetSourceContext;
use Flowpack\Media\Ui\GraphQL\Types;
use Flowpack\Media\Ui\Service\AssetCollectionService;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\I18n\Translator;
use Neos\Flow\Persistence\Exception\IllegalObjectTypeException;
use Neos\Flow\Persistence\PersistenceManagerInterface;
use Neos\Flow\ResourceManagement\Exception as ResourceManagementException;
use Neos\Flow\ResourceManagement\ResourceManager;
use Neos\Media\Domain\Model\Asset;
use Neos\Media\Domain\Model\AssetCollection;
use Neos\Media\Domain\Model\Tag;
use Neos\Media\Domain\Repository\AssetCollectionRepository;
use Neos\Media\Domain\Repository\AssetRepository;
use Neos\Media\Domain\Repository\TagRepository;
use Neos\Media\Domain\Service\AssetService;
use Neos\Media\Domain\Strategy\AssetModelMappingStrategyInterface;
use Neos\Media\Exception\AssetServiceException;
use Neos\Utility\MediaTypes;
use Psr\Log\LoggerInterface;

use function Wwwision\Types\instantiate;

#[Flow\Scope("singleton")]
class AssetMutator
{
    protected const STATE_ADDED = 'ADDED';
    protected const STATE_EXISTS = 'EXISTS';
    protected const STATE_ERROR = 'ERROR';

    public function __construct(
        private readonly AssetCollectionRepository $assetCollectionRepository,
        private readonly AssetCollectionService $assetCollectionService,
        private readonly AssetRepository $assetRepository,
        private readonly AssetService $assetService,
        private readonly AssetSourceContext $assetSourceContext,
        private readonly LoggerInterface $logger,
        private readonly AssetModelMappingStrategyInterface $mappingStrategy,
        private readonly PersistenceManagerInterface $persistenceManager,
        private readonly ResourceManager $resourceManager,
        private readonly TagRepository $tagRepository,
        private readonly Translator $translator,
    ) {
    }

    protected function localizedMessage(string $id, string $fallback = '', array $arguments = []): string
    {
        return $this->translator->translateById($id, $arguments, null, null, 'Main', 'Flowpack.Media.Ui') ?? $fallback;
    }

    protected function localizedMessageFromException(\Exception $exception): string
    {
        $labelIdentifier = 'errors.' . $exception->getCode() . '.message';
        return $this->localizedMessage($labelIdentifier, $exception->getMessage());
    }

    /**
     * @throws MediaUiException
     */
    public function updateAsset(
        Types\AssetId $id,
        Types\AssetSourceId $assetSourceId,
        string $label = null,
        string $caption = null,
        string $copyrightNotice = null
    ): ?Types\Asset {
        $asset = $this->assetSourceContext->getAsset($id, $assetSourceId);
        if (!$asset) {
            throw new MediaUiException('Cannot update asset that was never imported', 1590659044);
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
            throw new MediaUiException('Failed to update asset: ' . $e->getMessage(), 1590659063);
        }

        return Types\Asset::fromAssetProxy($asset->getAssetProxy());
    }

    /**
     * @throws MediaUiException
     */
    public function tagAsset(Types\AssetId $id, Types\AssetSourceId $assetSourceId, Types\TagId $tagId): ?Types\Asset
    {
        $asset = $this->assetSourceContext->getAsset($id, $assetSourceId);
        if (!$asset) {
            throw new MediaUiException('Cannot tag asset that was never imported', 1591561758);
        }

        if (!$asset instanceof Asset) {
            throw new MediaUiException('Asset type does not support tagging', 1619081662);
        }

        /** @var Tag $tag */
        $tag = $this->tagRepository->findByIdentifier($tagId->value);
        if (!$tag) {
            throw new MediaUiException('Cannot tag asset with tag that does not exist', 1591561845);
        }

        $asset->addTag($tag);

        try {
            $this->assetRepository->update($asset);
        } catch (IllegalObjectTypeException $e) {
            $this->logger->error('Failed to update asset', [$e->getMessage()]);
            throw new MediaUiException('Failed to update asset', 1591561868);
        }
        return Types\Asset::fromAssetProxy($asset->getAssetProxy());
    }

    /**
     * @throws MediaUiException
     */
    public function deleteAsset(Types\AssetId $id, Types\AssetSourceId $assetSourceId): MutationResult
    {
        $assetProxy = $this->assetSourceContext->getAssetProxy($id, $assetSourceId);
        if (!$assetProxy) {
            return instantiate(MutationResult::class, [
                'success' => false,
                'messages' => [
                    $this->localizedMessage(
                        'actions.deleteAssets.noProxy',
                        'Asset could not be resolved'
                    )
                ]
            ]);
        }
        $asset = $this->assetSourceContext->getAssetForProxy($assetProxy);

        if (!$asset) {
            return instantiate(MutationResult::class, [
                'success' => false,
                'messages' => [
                    $this->localizedMessage(
                        'actions.deleteAssets.noImportExists',
                        'Cannot delete asset that was never imported'
                    )
                ]
            ]);
        }

        try {
            $this->assetRepository->remove($asset);
        } catch (AssetServiceException $e) {
            return instantiate(MutationResult::class, [
                'success' => false,
                'messages' => [$this->localizedMessageFromException($e)],
            ]);
        } catch (\Exception $e) {
            throw new MediaUiException('Failed to delete asset: ' . $e->getMessage(), 1591537315);
        }

        return instantiate(MutationResult::class, [
            'success' => true,
            'messages' => [
                $this->localizedMessage(
                    'actions.deleteAssets.success',
                    'Asset deleted'
                )
            ]
        ]);
    }

    /**
     * @throws MediaUiException
     */
    public function setAssetTags(
        Types\AssetId $id,
        Types\AssetSourceId $assetSourceId,
        Types\TagIds $tagIds
    ): ?Types\Asset {
        $asset = $this->assetSourceContext->getAssetProxy($id, $assetSourceId);
        if (!$asset) {
            throw new MediaUiException('Cannot tag asset that was never imported', 1594621322);
        }
        if (!$asset instanceof Asset) {
            throw new MediaUiException('Asset type does not support tagging', 1619081714);
        }

        $tags = new ArrayCollection();
        foreach ($tagIds as $tagId) {
            $tag = $this->tagRepository->findByIdentifier($tagId->value);
            if (!$tag) {
                throw new MediaUiException('Cannot tag asset with tag that does not exist', 1594621318);
            }
            $tags->add($tag);
        }
        $asset->setTags($tags);

        try {
            $this->assetRepository->update($asset);
        } catch (IllegalObjectTypeException $e) {
            throw new MediaUiException('Failed to set asset tags: ' . $e->getMessage(), 1594621296);
        }

        return Types\Asset::fromAssetProxy($asset->getAssetProxy());
    }

    /**
     * @throws MediaUiException
     */
    public function setAssetCollections(
        Types\AssetId $id,
        Types\AssetSourceId $assetSourceId,
        Types\AssetCollectionIds $assetCollectionIds
    ): MutationResult {
        $asset = $this->assetSourceContext->getAssetProxy($id, $assetSourceId);
        if (!$asset) {
            throw new MediaUiException('Cannot assign collections to asset that was never imported', 1594621322);
        }
        if (!$asset instanceof Asset) {
            throw new MediaUiException('Asset type does not support collections', 1619081722);
        }

        $assetCollections = new ArrayCollection();
        foreach ($assetCollectionIds as $assetCollectionId) {
            $collection = $this->assetCollectionRepository->findByIdentifier($assetCollectionId->value);
            if (!$collection) {
                throw new MediaUiException('Cannot assign non existing assign collection to asset', 1594621318);
            }
            $assetCollections->add($collection);
        }
        $asset->setAssetCollections($assetCollections);

        try {
            $this->assetRepository->update($asset);
        } catch (IllegalObjectTypeException $e) {
            throw new MediaUiException('Failed to assign asset collections: ' . $e->getMessage(), 1594621296);
        }

        return MutationResult::success();
    }

    /**
     * @throws MediaUiException
     */
    public function untagAsset(Types\AssetId $id, Types\AssetSourceId $assetSourceId, Types\TagId $tagId): ?Types\Asset
    {
        $asset = $this->assetSourceContext->getAssetProxy($id, $assetSourceId);
        if (!$asset) {
            throw new MediaUiException('Cannot untag asset that was never imported', 1591561930);
        }
        if (!$asset instanceof Asset) {
            throw new MediaUiException('Asset type does not support tagging', 1619081740);
        }

        /** @var Tag $tag */
        $tag = $this->tagRepository->findByIdentifier($tagId->value);
        if (!$tag) {
            throw new MediaUiException('Cannot untag asset from tag that does not exist', 1591561934);
        }

        $asset->removeTag($tag);

        try {
            $this->assetRepository->update($asset);
        } catch (IllegalObjectTypeException $e) {
            throw new MediaUiException('Failed to update asset: ' . $e->getMessage(), 1591561938);
        }

        return Types\Asset::fromAssetProxy($asset->getAssetProxy());
    }

    /**
     * Replaces an asset and its usages
     *
     * @throws MediaUiException
     */
    public function replaceAsset(
        Types\AssetId $id,
        Types\AssetSourceId $assetSourceId,
        Types\UploadedFile $file,
        Types\AssetReplacementOptions $options,
    ): Types\FileUploadResult {
        $asset = $this->assetSourceContext->getAsset($id, $assetSourceId);
        if (!$asset) {
            throw new MediaUiException('Cannot replace asset that was never imported', 1648046173);
        }
        if (!$asset instanceof Asset) {
            throw new MediaUiException('Asset type "' . $asset::class . '" does not support replacing', 1648046186);
        }

        $success = false;
        $result = self::STATE_ERROR;
        $sourceMediaType = MediaTypes::parseMediaType($asset->getMediaType());
        $replacementMediaType = MediaTypes::parseMediaType($file->clientMediaType);
        $filename = $file->clientFilename;

        // Prevent replacement of image, audio and video by a different mimetype because of possible rendering issues.
        if ($sourceMediaType['type'] !== $replacementMediaType['type'] && in_array($sourceMediaType['type'],
                ['image', 'audio', 'video'])) {
            $this->logger->error(sprintf('Cannot replace asset of mimetype %s with mimetype %s',
                $sourceMediaType['type'], $replacementMediaType['type']));
            return instantiate(Types\FileUploadResult::class, [
                'filename' => $filename,
                'success' => false,
                'result' => $result,
            ]);
        }

        try {
            $resource = $this->resourceManager->importResourceFromContent(
                $file->streamOrFile,
                $filename
            );
        } catch (ResourceManagementException $e) {
            $this->logger->error('Could not import uploaded file: ' . $e->getMessage());
            $resource = null;
        }

        if ($resource) {
            $resource->setFilename($filename);
            $resource->setMediaType($file->clientMediaType);

            try {
                $this->assetService->replaceAssetResource(
                    $asset,
                    $resource,
                    $options->toArray()
                );
                $success = true;
                $result = 'REPLACED';
            } catch (\Exception $e) {
                $this->logger->error(sprintf(
                    'Asset %s could not be replaced: %s', $asset->getIdentifier(), $e->getMessage()
                ));
            }
        }

        return instantiate(Types\FileUploadResult::class, [
            'filename' => $filename,
            'success' => $success,
            'result' => $result,
        ]);
    }

    /**
     * @throws MediaUiException|ResourceManagementException
     */
    public function editAsset(
        Types\AssetId $id,
        Types\AssetSourceId $assetSourceId,
        string $filename,
        Types\AssetEditOptionsInput $options,
    ): MutationResult {
        $filename = trim($filename);
        if (!$filename) {
            throw new MediaUiException('Filename was empty', 1678156902);
        }

        $asset = $this->assetSourceContext->getAsset($id, $assetSourceId);
        if (!$asset) {
            throw new MediaUiException('Cannot rename asset that was never imported', 1678155884);
        }
        if (!$asset instanceof Asset) {
            throw new MediaUiException('Asset type does not support renaming', 1678155887);
        }

        // Make sure the filename has the same extension as before
        if (!strpos($filename, $asset->getFileExtension())) {
            $filename .= '.' . $asset->getFileExtension();
        }

        $success = false;

        // Copy the resource to a new one with the new filename
        $originalResource = $asset->getResource();
        $originalResourceStream = $originalResource->getStream();
        $resource = $this->resourceManager->importResource($originalResourceStream,
            $originalResource->getCollectionName());
        fclose($originalResourceStream);
        $resource->setFilename($filename);
        $resource->setMediaType($originalResource->getMediaType());

        try {
            $this->assetService->replaceAssetResource($asset, $resource, $options->toArray());
            $success = true;
        } catch (\Exception $exception) {
            $this->logger->error(sprintf('Asset %s could not be replace with the renamed copy',
                $asset->getIdentifier()), [$exception]);
        }

        return MutationResult::success();
    }

    /**
     * @throws MediaUiException
     */
    public function importAsset(Types\AssetId $id, Types\AssetSourceId $assetSourceId): ?Types\Asset
    {
        $importedAsset = $this->assetSourceContext->importAsset($assetSourceId, $id);
        if (!$importedAsset) {
            throw new MediaUiException('Could not import asset', 1591972264);
        }
        return Types\Asset::fromAssetProxy($importedAsset);
    }

    /**
     * Stores the given file and returns an array with the result
     */
    public function uploadFile(
        Types\UploadedFile $file,
        Types\TagId $tagId = null,
        Types\AssetCollectionId $assetCollectionId = null
    ): Types\FileUploadResult {
        $success = false;
        $result = self::STATE_ERROR;

        $filename = $file->clientFilename;
        try {
            $resource = $this->resourceManager->importResourceFromContent(
                $file->streamOrFile,
                $filename,
            );
        } catch (ResourceManagementException $e) {
            $this->logger->error('Could not import uploaded file: ' . $e->getMessage());
            $resource = null;
        }

        if ($resource) {
            $resource->setFilename($filename);
            $resource->setMediaType($file->clientMediaType);

            if ($this->assetRepository->findOneByResourceSha1($resource->getSha1())) {
                $result = self::STATE_EXISTS;
            } else {
                try {
                    $className = $this->mappingStrategy->map($resource);
                    /** @var Asset $asset */
                    $asset = new $className($resource);

                    if ($this->persistenceManager->isNewObject($asset)) {
                        if ($tagId) {
                            /** @var Tag $tag */
                            $tag = $this->tagRepository->findByIdentifier($tagId->value);
                            if ($tag) {
                                $asset->addTag($tag);
                            }
                        }
                        if ($assetCollectionId) {
                            /** @var AssetCollection $assetCollection */
                            $assetCollection = $this->assetCollectionRepository->findByIdentifier($assetCollectionId->value);
                        } else {
                            // Assign the asset to the asset collection of the site it has been uploaded to
                            $assetCollection = $this->assetCollectionService->getDefaultCollectionForCurrentSite();
                        }
                        if ($assetCollection) {
                            $asset->setAssetCollections(new ArrayCollection([$assetCollection]));
                        }

                        $this->assetRepository->add($asset);
                        $result = self::STATE_ADDED;
                        $success = true;
                    } else {
                        $result = self::STATE_EXISTS;
                    }
                } catch (IllegalObjectTypeException $e) {
                    $this->logger->error('Type of uploaded file cannot be stored: ' . $e->getMessage());
                }
            }
        }

        // FIXME: The filename is not unique enough for multiple uploads, we need an id instead or use the sha1
        return instantiate(Types\FileUploadResult::class, [
            'filename' => $filename,
            'success' => $success,
            'result' => $result,
        ]);
    }

    /**
     * Stores all given files and returns an array of results for each upload
     */
    public function uploadFiles(
        Types\UploadedFiles $files = null,
        Types\TagId $tagId = null,
        Types\AssetCollectionId $assetCollectionId = null
    ): Types\FileUploadResults {
        if (!$files) {
            return Types\FileUploadResults::empty();
        }
        $results = [];
        foreach ($files as $file) {
            $results[$file->clientFilename] = $this->uploadFile(
                $file,
                $tagId,
                $assetCollectionId,
            );
        }
        return Types\FileUploadResults::fromArray($results);
    }
}
