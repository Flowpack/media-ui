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

use Flowpack\Media\Ui\GraphQL\Types;
use Flowpack\Media\Ui\GraphQL\Types\MutationResponseMessage;
use Neos\ContentRepository\Core\NodeType\NodeType;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\I18n\Translator;
use Neos\Flow\ResourceManagement\Exception as ResourceManagementException;
use Neos\Flow\ResourceManagement\PersistentResource;
use Neos\Flow\ResourceManagement\ResourceManager;
use Neos\Flow\ResourceManagement\ResourceRepository;
use Neos\Utility\MediaTypes;
use Psr\Log\LoggerInterface;

#[Flow\Scope("singleton")]
class ResourceMutator
{
    public function __construct(
        private readonly ResourceManager $resourceManager,
        private readonly ResourceRepository $resourceRepository,
        private readonly LoggerInterface $logger,
        private readonly Translator $translator,
    ) {
    }

    public function importResource(
        Types\UploadedFile $file,
        ?NodeType $assetNodeType = null,
        string $resourceCollectionName = ResourceManager::DEFAULT_PERSISTENT_COLLECTION_NAME,
        ?string $overrideFilename = null,
    ): ?PersistentResource {
        if (!$file->clientMediaType) {
            $message = 'Cannot use file without a given target mimetype';
            $this->logger->error($message);
            throw new \Exception($message, 1776508363);
        }
        $replacementMediaType = MediaTypes::parseMediaType($file->clientMediaType);
        if (
            $assetNodeType
            && ConflictProneMediaType::tryFromNodeType($assetNodeType)
                ?->conflictsWith(ConflictProneMediaType::tryFromMediaType($file->clientMediaType))
        ) {
            $this->logAndThrow(
                sprintf(
                    'Cannot replace resource of asset of type %s with resource of mimetype %s',
                    $assetNodeType->name->value,
                    $replacementMediaType['type']
                ),
                1776510606,
            );
        }
        if (!$file->clientFilename) {
            $message = 'Cannot use file without a filename for replacement';
            $this->logger->error($message);
            throw new \Exception($message, 1776434397);
        }

        try {
            $resource = $this->resourceManager->importResourceFromContent(
                $file->streamOrFile,
                $overrideFilename ?: $file->clientFilename,
                $resourceCollectionName,
            );
            $resource->setMediaType($file->clientMediaType);
            $this->resourceRepository->update($resource);
            return $resource;
        } catch (ResourceManagementException $e) {
            $this->logger->error('Could not import uploaded file: ' . $e->getMessage());
            return null;
        }
    }

    public function renameResource(PersistentResource $originalResource, string $filename, string $assetLabel): PersistentResource
    {
        $originalResourceStream = $originalResource->getStream();
        if ($originalResourceStream) {
            $resource = $this->resourceManager->importResource(
                $originalResourceStream,
                $originalResource->getCollectionName()
            );
            fclose($originalResourceStream);
            $resource->setFilename($filename);
            $resource->setMediaType($originalResource->getMediaType());
            return $resource;
        }

        $message = $this->getLocalizedMessage(
            'actions.editAsset.cannotRename',
            sprintf('Asset "%s" could not be renamed', $assetLabel)
        )->value;
        $this->logger->error($message);
        throw new \Exception($message, 1776526202);
    }

    /**
     * @throws \Exception
     */
    private function logAndThrow(string $message, int $code): void
    {
        $this->logger->error($message);
        throw new \Exception($message, $code);
    }

    /**
     * @param array<mixed> $arguments
     */
    protected function getLocalizedMessage(string $id, string $fallback = '', array $arguments = []): MutationResponseMessage
    {
        try {
            $value = $this->translator->translateById(
                $id,
                $arguments,
                null,
                null,
                'Main',
                'Flowpack.Media.Ui'
            ) ?? $fallback;
        } catch (\Exception) {
            $value = $fallback ?: $id;
        }
        return MutationResponseMessage::fromString($value);
    }
}
