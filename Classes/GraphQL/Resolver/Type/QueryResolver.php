<?php
declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Resolver\Type;

use Neos\Flow\Annotations as Flow;
use Neos\Flow\Persistence\Exception\InvalidQueryException;
use Neos\Media\Domain\Model\Asset;
use Neos\Media\Domain\Model\Tag;
use Neos\Media\Domain\Repository\AssetRepository;
use Neos\Media\Domain\Repository\TagRepository;
use t3n\GraphQL\ResolverInterface;

class QueryResolver implements ResolverInterface
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
     * @param $_
     * @param array $variables
     * @return array<Asset>
     * @throws InvalidQueryException
     */
    public function assets($_, array $variables): array
    {
        if (array_key_exists('tag', $variables) && !empty($variables['tag'])) {
            $tag = $this->tagRepository->findOneByLabel($variables['tag']);
            return $tag ? $this->assetRepository->findByTag($tag)->toArray() : [];
        }
        return $this->assetRepository->findAll()->toArray();
    }

    /**
     * @param $_
     * @param array $variables
     * @return array<Tag>
     */
    public function tags($_, array $variables): array
    {
        return $this->tagRepository->findAll()->toArray();
    }

    /**
     * @param $_
     * @param array $variables
     * @return Asset|null
     */
    public function asset($_, array $variables): ?Asset
    {
        $identifier = $variables['identifier'];
        return $this->assetRepository->findByIdentifier($identifier);
    }
}
