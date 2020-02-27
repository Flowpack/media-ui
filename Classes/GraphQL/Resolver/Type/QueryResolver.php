<?php
declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Resolver\Type;

use Neos\Flow\Annotations as Flow;
use Neos\Flow\Persistence\Exception\InvalidQueryException;
use Neos\Media\Domain\Model\Asset;
use Neos\Media\Domain\Model\AssetSource\AssetSourceInterface;
use Neos\Media\Domain\Model\Tag;
use Neos\Media\Domain\Repository\AssetRepository;
use Neos\Media\Domain\Repository\TagRepository;
use Neos\Media\Domain\Service\AssetSourceService;
use t3n\GraphQL\ResolverInterface;

/**
 * @Flow\Scope("singleton")
 */
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
     * @Flow\Inject
     * @var AssetSourceService
     */
    protected $assetSourceService;

    /**
     * @var array<AssetSourceInterface>
     */
    protected $assetSources;

    /**
     * @return void
     */
    public function initializeObject(): void
    {
        $this->assetSources = $this->assetSourceService->getAssetSources();
    }

    /**
     * @param $_
     * @param array $variables
     * @return array<Asset>
     */
    public function assetProxies($_, array $variables): array
    {
        $limit = array_key_exists('limit', $variables) ? $variables['limit'] : 20;
        $offset = array_key_exists('offset', $variables) ? $variables['offset'] : 0;

        if (array_key_exists('assetSource', $variables)) {
            $assetSourceLabel = strtolower($variables['assetSource']);
        } else {
            $assetSourceLabel = 'neos';
        }

        if (array_key_exists($assetSourceLabel, $this->assetSources)) {
            /** @var AssetSourceInterface $activeAssetSource */
            $activeAssetSource = $this->assetSources[$assetSourceLabel];
        } else {
            return [];
        }

        $assetProxyRepository = $activeAssetSource->getAssetProxyRepository();

        $query = null;

        if (array_key_exists('tag', $variables) && !empty($variables['tag'])) {
            /** @noinspection PhpUndefinedMethodInspection */
            $tag = $this->tagRepository->findOneByLabel($variables['tag']);
            if ($tag) {
                $query = $assetProxyRepository->findByTag($tag)->getQuery();
            }
        }

        if (!$query) {
            $query = $assetProxyRepository->findAll()->getQuery();
        }

        $query->setLimit($limit);
        $query->setOffset($offset);

        return $query->execute()->toArray();
    }

    /**
     * @param $_
     * @param array $variables
     * @return array<Asset>
     * @throws InvalidQueryException
     */
    public function assets($_, array $variables): array
    {
        if (array_key_exists('tag', $variables) && !empty($variables['tag'])) {
            /** @noinspection PhpUndefinedMethodInspection */
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
     * @return array<AssetSourceInterface>
     */
    public function assetSource($_, array $variables): array
    {
        return $this->assetSources;
    }

    /**
     * @param $_
     * @param array $variables
     * @return Asset|object|null
     */
    public function asset($_, array $variables)
    {
        $identifier = $variables['identifier'];
        return $this->assetRepository->findByIdentifier($identifier);
    }
}
