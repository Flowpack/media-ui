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

use Flowpack\Media\Ui\Exception;
use Flowpack\Media\Ui\GraphQL\Types;
use Flowpack\Media\Ui\GraphQL\Types\MutationResult;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\I18n\Translator;
use Neos\Flow\Persistence\Exception\IllegalObjectTypeException;
use Neos\Flow\Persistence\Exception\InvalidQueryException;
use Neos\Flow\Persistence\PersistenceManagerInterface;
use Neos\Media\Domain\Model\Tag;
use Neos\Media\Domain\Repository\AssetCollectionRepository;
use Neos\Media\Domain\Repository\AssetRepository;
use Neos\Media\Domain\Repository\TagRepository;

#[Flow\Scope("singleton")]
class TagMutator
{
    public function __construct(
        private readonly AssetCollectionRepository $assetCollectionRepository,
        private readonly AssetRepository $assetRepository,
        private readonly PersistenceManagerInterface $persistenceManager,
        private readonly TagRepository $tagRepository,
        private readonly Translator $translator,
    ) {
    }

    protected function localizedMessage(string $id, string $fallback = '', array $arguments = []): string
    {
        try {
            return $this->translator->translateById(
                $id,
                $arguments,
                null,
                null,
                'Main',
                'Flowpack.Media.Ui'
            ) ?? $fallback;
        } catch (\Exception) {
            return $fallback ?: $id;
        }
    }

    /**
     * @throws Exception|IllegalObjectTypeException
     */
    public function createTag(
        Types\TagLabel $label,
        Types\AssetSourceId $assetSourceId,
        Types\AssetCollectionId $assetCollectionId = null,
    ): ?Types\Tag {
        if ($assetSourceId->value !== 'neos') {
            // We currently only support managing tags in the neos asset source
            throw new Exception(
                $this->localizedMessage('actions.assetSourceNotSupported', 'Asset source not supported'),
                1776332600
            );
        }

        $tag = $this->tagRepository->findOneByLabel($label->value);
        if ($tag === null) {
            $tag = new Tag($label);
            $this->tagRepository->add($tag);
        } else {
            throw new Exception('Tag already exists', 1603921233);
        }

        if ($assetCollectionId) {
            $assetCollection = $this->assetCollectionRepository->findByIdentifier($assetCollectionId->value);
            if ($assetCollection) {
                $assetCollection->addTag($tag);
                $this->assetCollectionRepository->update($assetCollection);
            } else {
                throw new Exception('Asset collection not found', 1603921193);
            }
        }
        return Types\Tag::create(
            Types\TagId::fromString($this->persistenceManager->getIdentifierByObject($tag)),
            $assetSourceId,
            Types\TagLabel::fromString($tag->getLabel()),
        );
    }

    /**
     * @throws Exception|IllegalObjectTypeException
     */
    public function updateTag(
        Types\TagId $id,
        Types\AssetSourceId $assetSourceId,
        Types\TagLabel $label = null
    ): ?Types\Tag {
        if ($assetSourceId->value !== 'neos') {
            // We currently only support managing tags in the neos asset source
            return null;
        }

        /** @var Tag $tag */
        $tag = $this->tagRepository->findByIdentifier($id->value);
        if (!$tag) {
            throw new Exception('Tag not found', 1590659046);
        }

        if ($label !== null) {
            $tag->setLabel($label->value);
        }

        $this->tagRepository->update($tag);

        return Types\Tag::create(
            Types\TagId::fromString($this->persistenceManager->getIdentifierByObject($tag)),
            $assetSourceId,
            Types\TagLabel::fromString($tag->getLabel()),
        );
    }

    /**
     * @throws Exception|IllegalObjectTypeException|InvalidQueryException
     */
    public function deleteTag(
        Types\TagId $id,
        Types\AssetSourceId $assetSourceId
    ): MutationResult {
        if ($assetSourceId->value !== 'neos') {
            // We currently only support managing tags in the neos asset source
            return MutationResult::fromError([
                $this->localizedMessage('actions.assetSourceNotSupported', 'Asset source not supported')
            ]);
        }

        /** @var Tag $tag */
        $tag = $this->tagRepository->findByIdentifier($id->value);
        if (!$tag) {
            return MutationResult::fromError([
                $this->localizedMessage('actions.deleteTag.notFound', 'Tag not found')
            ]);
        }

        $taggedAssets = $this->assetRepository->findByTag($tag);
        foreach ($taggedAssets as $asset) {
            $asset->removeTag($tag);
            $this->assetRepository->update($asset);
        }
        $this->tagRepository->remove($tag);
        return MutationResult::fromSuccess();
    }
}
