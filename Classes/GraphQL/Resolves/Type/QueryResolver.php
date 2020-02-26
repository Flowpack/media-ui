<?php
declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Resolver;

use Neos\Flow\Annotations as Flow;
use Neos\Flow\Persistence\Exception\InvalidQueryException;
use Neos\Media\Domain\Model\Asset;
use Neos\Media\Domain\Repository\AssetRepository;

class QueryResolver implements ResolverInterface
{
    /**
     * @Flow\Inject
     * @var AssetRepository
     */
    protected $assetRepository;

    /**
     * @param $_
     * @param array $variables
     * @return array
     * @throws InvalidQueryException
     */
    public function products($_, array $variables): array
    {
        return $this->assetRepository->findAll();
    }

    /**
     * @param $_
     * @param array $variables
     * @return Asset|null
     */
    public function product($_, array $variables): ?Asset
    {
        $identifier = $variables['identifier'];
        return $this->assetRepository->findByIdentifier($identifier);
    }
}
