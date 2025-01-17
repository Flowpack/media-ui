<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\Service;

/*
 * This file is part of the Flowpack.Media.Ui package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\NonUniqueResultException;
use Doctrine\ORM\NoResultException;
use Flowpack\Media\Ui\Domain\Model\Dto\AssetUsageDetails;
use Flowpack\Media\Ui\Domain\Model\Dto\UsageMetadataSchema;
use Flowpack\Media\Ui\Exception;
use Flowpack\Media\Ui\GraphQL\Types;
use GuzzleHttp\Psr7\ServerRequest;
use GuzzleHttp\Psr7\Uri;
use Neos\ContentRepository\Core\NodeType\NodeTypeNames;
use Neos\ContentRepository\Core\Projection\ContentGraph\Filter\FindAncestorNodesFilter;
use Neos\ContentRepository\Core\Projection\ContentGraph\Filter\FindClosestNodeFilter;
use Neos\ContentRepository\Core\Projection\ContentGraph\Filter\NodeType\NodeTypeCriteria;
use Neos\ContentRepository\Core\Projection\ContentGraph\Node;
use Neos\ContentRepository\Core\Projection\ContentGraph\VisibilityConstraints;
use Neos\ContentRepositoryRegistry\ContentRepositoryRegistry;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Core\Bootstrap;
use Neos\Flow\Exception as FlowException;
use Neos\Flow\Http\Exception as HttpException;
use Neos\Flow\Http\HttpRequestHandlerInterface;
use Neos\Flow\I18n\Translator;
use Neos\Flow\Mvc\ActionRequest;
use Neos\Flow\Mvc\Routing\Exception\MissingActionNameException;
use Neos\Flow\Mvc\Routing\UriBuilder;
use Neos\Flow\ObjectManagement\ObjectManagerInterface;
use Neos\Flow\Package\PackageManager;
use Neos\Flow\Reflection\ReflectionService;
use Neos\Flow\Security\Context as SecurityContext;
use Neos\Media\Domain\Model\AssetInterface;
use Neos\Media\Domain\Model\AssetVariantInterface;
use Neos\Media\Domain\Service\AssetService;
use Neos\Media\Domain\Strategy\AssetUsageStrategyInterface;
use Neos\Neos\AssetUsage\AssetUsageStrategy;
use Neos\Neos\AssetUsage\Dto\AssetUsageReference;
use Neos\Neos\Controller\BackendUserTranslationTrait;
use Neos\Neos\Domain\Model\Site;
use Neos\Neos\Domain\Model\SiteNodeName;
use Neos\Neos\Domain\NodeLabel\NodeLabelGeneratorInterface;
use Neos\Neos\Domain\Repository\SiteRepository;
use Neos\Neos\Domain\Repository\WorkspaceMetadataAndRoleRepository;
use Neos\Neos\Domain\Service\NodeTypeNameFactory;
use Neos\Neos\Security\Authorization\ContentRepositoryAuthorizationService;
use Neos\Neos\Service\UserService;

use function Wwwision\Types\instantiate;

#[Flow\Scope('singleton')]
final class UsageDetailsService
{
    use BackendUserTranslationTrait;

    #[Flow\Inject]
    protected Bootstrap $bootstrap;

    #[Flow\Inject]
    protected UserService $userService;

    #[Flow\Inject]
    protected SiteRepository $siteRepository;

    #[Flow\Inject]
    protected AssetService $assetService;

    #[Flow\Inject]
    protected ObjectManagerInterface $objectManager;

    #[Flow\Inject]
    protected ReflectionService $reflectionService;

    #[Flow\Inject]
    protected EntityManagerInterface $entityManager;

    #[Flow\Inject]
    protected PackageManager $packageManager;

    #[Flow\Inject]
    protected Translator $translator;

    #[Flow\Inject]
    protected ContentRepositoryRegistry $contentRepositoryRegistry;

    #[Flow\Inject]
    protected NodeLabelGeneratorInterface $nodeLabelGenerator;

    #[Flow\Inject()]
    protected WorkspaceMetadataAndRoleRepository $workspaceMetadataAndRoleRepository;

    #[Flow\Inject()]
    protected SecurityContext $securityContext;

    #[Flow\Inject()]
    protected ContentRepositoryAuthorizationService $contentRepositoryAuthorizationService;

    private array $accessibleWorkspaces = [];

    public function __construct(
        protected readonly Translator $translator,
        protected readonly PackageManager $packageManager,
        protected readonly EntityManagerInterface $entityManager,
        protected readonly ReflectionService $reflectionService,
        protected readonly LinkingService $linkingService,
        protected readonly ObjectManagerInterface $objectManager,
        protected readonly DomainUserService $domainUserService,
        protected readonly AssetService $assetService,
        protected readonly WorkspaceRepository $workspaceRepository,
        protected readonly NodeTypeManager $nodeTypeManager,
        protected readonly SiteRepository $siteRepository,
        protected readonly UserService $userService,
        protected readonly Bootstrap $bootstrap,
    ) {
    }

    public function resolveUsagesForAsset(AssetInterface $asset): Types\UsageDetailsGroups
    {
        $includeSites = $this->siteRepository->countAll() > 1;
        return array_filter(array_map(function ($strategy) use ($asset, $includeSites) {
            $usageByStrategy = [
                'serviceId' => get_class($strategy),
                'label' => get_class($strategy),
                'metadataSchema' => [],
                'usages' => [],
            ];

            if (!$strategy instanceof AssetUsageStrategyInterface) {
                return instantiate(Types\UsageDetailsGroup::class, $usageByStrategy);
            }

            // Should be solved via an interface in the future
            if (method_exists($strategy, 'getLabel')) {
                $usageByStrategy['label'] = $strategy->getLabel();
            } elseif ($strategy instanceof AssetUsageStrategy) {
                $usageByStrategy['label'] = $this->translateById('assetUsage.assetUsageInNodePropertiesStrategy.label');
            }

            if ($strategy instanceof UsageDetailsProviderInterface) {
                $usageByStrategy['metadataSchema'] = $strategy->getUsageMetadataSchema()->toArray();
                $usageByStrategy['usages'] = $strategy->getUsageDetails($asset);
            } else {
                // If the strategy does not implement the UsageDetailsProviderInterface, we provide some default usage data
                $usageReferences = $strategy->getUsageReferences($asset);
                if (count($usageReferences) && $usageReferences[0] instanceof AssetUsageReference) {
                    $includeDimensions = $this->containtsContentReporitoryWithDimensions($usageReferences);
                    $usageByStrategy['metadataSchema'] = $this->getNodePropertiesUsageMetadataSchema(
                        $includeSites,
                        $includeDimensions
                    )->toArray();
                    $usageByStrategy['usages'] = array_map(function (AssetUsageReference $usage) use ($includeSites, $includeDimensions) {
                        return $this->getNodePropertiesUsageDetails($usage, $includeSites, $includeDimensions);
                    }, $usageReferences);
                }
            }
            // TODO: Already return a graphql compatible type before, so we don't have to map it here
            $usageByStrategy['usages'] = array_map(
                static function (AssetUsageDetails $usage) {
                    return Types\UsageDetails::fromUsage($usage);
                },
                $usageByStrategy['usages']
            );
            return instantiate(Types\UsageDetailsGroup::class, $usageByStrategy);
        }, $this->getUsageStrategies());

        $groups = array_filter($groups, static function (Types\UsageDetailsGroup $usageByStrategy) {
            return !$usageByStrategy->usages->isEmpty();
        });

        return Types\UsageDetailsGroups::fromArray($groups);
    }

    protected function getNodePropertiesUsageMetadataSchema(
        bool $includeSites,
        bool $includeDimensions
    ): UsageMetadataSchema
    {
        $schema = new UsageMetadataSchema();

        if ($includeSites) {
            $schema->withMetadata('site', $this->translateById('assetUsage.header.site'),
                UsageMetadataSchema::TYPE_TEXT);
        }

        $schema
            ->withMetadata('document', $this->translateById('assetUsage.header.document'),
                UsageMetadataSchema::TYPE_TEXT)
            ->withMetadata('workspace', $this->translateById('assetUsage.header.workspace'),
                UsageMetadataSchema::TYPE_TEXT)
            ->withMetadata('lastModified', $this->translateById('assetUsage.header.lastModified'),
                UsageMetadataSchema::TYPE_DATETIME);

        if ($includeDimensions) {
            $schema->withMetadata('contentDimensions', $this->translateById('assetUsage.header.contentDimensions'),
                UsageMetadataSchema::TYPE_JSON);
        }
        return $schema;
    }

    protected function getNodePropertiesUsageDetails(
        AssetUsageReference $usage,
        bool $includeSites,
        bool $includeDimensions
    ): AssetUsageDetails
    {
        $accessible = $this->usageIsAccessible($usage);

        $node = null;
        $site = null;
        $closestDocumentNode = null;
        if ($accessible) {
            /** @var Node $node */
            $node = $this->getNodeFrom($usage);
            $siteNode = $this->getSiteNodeFrom($node);
            $site = $siteNode ? $this->siteRepository->findSiteBySiteNode($siteNode) : null;
            $closestDocumentNode = $node ? $this->getClosestDocumentNode($node) : null;
        }

        $label = $accessible && $node ? $this->nodeLabelGenerator->getLabel($node) : $this->translateById('assetUsage.assetUsageInNodePropertiesStrategy.inaccessibleNode');

        $url = $accessible && $closestDocumentNode ? $this->buildNodeUri($site, $closestDocumentNode) : '';

        $workspaceMetadata = $this->workspaceMetadataAndRoleRepository->loadWorkspaceMetadata($usage->getContentRepositoryId(), $usage->getWorkspaceName());

        $metadata = [
            [
                'name' => 'workspace',
                'value' => $workspaceMetadata ? $workspaceMetadata->title->value : $usage->getWorkspaceName(),
            ],
            [
                'name' => 'document',
                'value' => $closestDocumentNode ? $this->nodeLabelGenerator->getLabel($closestDocumentNode) : $this->translateById('assetUsage.assetUsageInNodePropertiesStrategy.metadataNotAvailable'),
            ],
            [
                'name' => 'nodeExists',
                'value' => $node?->name->value,
            ],
            [
                'name' => 'lastModified',
                'value' => $node?->timestamps->lastModified?->format(DATE_W3C) ?? $node?->timestamps->created?->format(DATE_W3C),
            ]
        ];

        if ($includeSites) {
            $metadata[] = [
                'name' => 'site',
                'value' => $site ? $site->getName() : $this->translateById('assetUsage.assetUsageInNodePropertiesStrategy.metadataNotAvailable'),
            ];
        }

        // Only add content dimensions if they are configured
        if ($includeDimensions) {
            $metadata[] = [
                'name' => 'contentDimensions',
                'value' => json_encode($node ? ($this->resolveDimensionValuesForNode($node)) : []),
            ];
        }

        return new AssetUsageDetails($label, $url, $metadata);
    }

    protected function resolveDimensionValuesForNode(Node $node): array
    {
        $dimensionValues = [];
        $contentDimensions = $this->contentRepositoryRegistry->get($node->contentRepositoryId)->getContentDimensionSource()->getContentDimensionsOrderedByPriority();

        foreach ($node->originDimensionSpacePoint->coordinates as $nodeDimensionName => $nodeDimensionValue) {
            foreach ($contentDimensions as $contentDimensionName => $contentDimension) {
                if ($contentDimensionName === $nodeDimensionName) {
                    foreach ($contentDimension->values as $presetKey => $preset) {
                         if ($presetKey === $nodeDimensionValue) {
                             $dimensionValues[$contentDimension->getConfigurationValue('label')][] = $preset->getConfigurationValue('label');
                         }
                    }
                }
            }
        }

        return $dimensionValues;
    }

    protected function getNodeFrom(AssetUsageReference $assetUsage): ?Node
    {
        return $this->contentRepositoryRegistry
            ->get($assetUsage->getContentRepositoryId())
            ->getContentGraph($assetUsage->getWorkspaceName())
            ->getSubgraph(
                $assetUsage
                    ->getOriginDimensionSpacePoint()
                    ->toDimensionSpacePoint(), VisibilityConstraints::withoutRestrictions())
            ->findNodeById($assetUsage->getNodeAggregateId());
    }

    protected function getClosestDocumentNode(Node $node): ?Node
    {
        $parentNode = $node;
        $contentRepository = $this->contentRepositoryRegistry->get($parentNode->contentRepositoryId);
        while ($parentNode && !$contentRepository->getNodeTypeManager()->getNodeType($parentNode->nodeTypeName)->isOfType('Neos.Neos:Document')) {
            $subgraph = $this->contentRepositoryRegistry->subgraphForNode($parentNode);
            $parentNode = $subgraph->findParentNode($parentNode->aggregateId);
        }
        return $parentNode;
    }

    protected function usageIsAccessible(AssetUsageReference $usage): bool
    {
        $cacheKey = $usage->getWorkspaceName()->value;
        if (array_key_exists($cacheKey, $this->accessibleWorkspaces)) {
            return $this->accessibleWorkspaces[$cacheKey];
        }
        $workspacePermissions = $this->contentRepositoryAuthorizationService->getWorkspacePermissions($usage->getContentRepositoryId(), $usage->getWorkspaceName(), $this->securityContext->getRoles(), $this->userService->getBackendUser()?->getId());

        $this->accessibleWorkspaces[$cacheKey] = $workspacePermissions->read;
        return $workspacePermissions->read;
    }

    /**
     * This is a rather hacky way to build a URI for a node in a given site,
     * as the uriBuilder will always use the baseUri of the current request and ignores
     * the hostname defined in the provided ActionRequest.
     *
     * Therefore, we create a relative uri and prepend the scheme, hostname and port manually.
     *
     * @throws HttpException|MissingActionNameException
     */
    protected function buildNodeUri(?Site $site, Node $node): string
    {
        $requestHandler = $this->bootstrap->getActiveRequestHandler();

        if ($requestHandler instanceof HttpRequestHandlerInterface) {
            $serverRequest = $requestHandler->getHttpRequest();
        } else {
            $serverRequest = ServerRequest::fromGlobals();
        }

        $domain = $site?->getPrimaryDomain();

        // Build the URI with the correct scheme and hostname for the node in the given site
        if ($domain && $domain->getHostname() !== $serverRequest->getUri()->getHost()) {
            if (!$domain->getScheme()) {
                $domain->setScheme($serverRequest->getUri()->getScheme());
            }
            $serverRequest = $serverRequest->withUri(new Uri((string)$domain));
        }

        $request = ActionRequest::fromHttpRequest($serverRequest);//$this->getActionRequestForUriBuilder($domain ? $domain->getHostname() : null);

        $uriBuilder = new UriBuilder();
        $uriBuilder->setRequest($request);
        $uriBuilder->setCreateAbsoluteUri(false);

        $requestUri = $serverRequest->getUri();
        $relativeNodeBackendUri = $uriBuilder->uriFor(
            'index',
            ['node' => $node],
            'Backend',
            'Neos.Neos.Ui'
        );
        return sprintf(
            '%s://%s%s%s',
            $requestUri->getScheme(),
            $requestUri->getHost(),
            $requestUri->getPort() ? ':' . $requestUri->getPort() : '',
            $relativeNodeBackendUri
        );
    }

    /**
     * @return AssetUsageStrategyInterface[]
     */
    protected function getUsageStrategies(): array
    {
        $usageStrategies = [];
        $assetUsageStrategyImplementations = $this->reflectionService->getAllImplementationClassNamesForInterface(AssetUsageStrategyInterface::class);
        foreach ($assetUsageStrategyImplementations as $assetUsageStrategyImplementationClassName) {
            $usageStrategies[] = $this->objectManager->get($assetUsageStrategyImplementationClassName);
        }
        return $usageStrategies;
    }

    /**
     * Returns all assets which have no usage reference provided by `Flowpack.EntityUsage`
     *
     * @return AssetInterface[]
     * @throws Exception
     */
    public function getUnusedAssets(int $limit = 20, int $offset = 0, Types\AssetSourceId $assetSourceId = null): array
    {
        // TODO: This method has to be implemented in a more generic way at some point to increase support with other implementations
        $this->canQueryAssetUsage();

        return $this->entityManager->createQuery(sprintf(/** @lang DQL */ '
            SELECT a
            FROM Neos\Media\Domain\Model\Asset a
            WHERE
                a.assetSourceIdentifier = :assetSourceIdentifier AND
                %s AND
                NOT EXISTS (
                    SELECT e
                    FROM Flowpack\EntityUsage\DatabaseStorage\Domain\Model\EntityUsage e
                    WHERE a.Persistence_Object_Identifier = e.entityId
                )
            ORDER BY a.lastModified DESC
        ', $this->getAssetVariantFilterClause('a')))
            ->setParameter('assetSourceIdentifier', $assetSourceId->value ?? 'neos')
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->getResult();
    }

    /**
     * Checks for the presence of the
     *
     * @throws Exception
     */
    protected function canQueryAssetUsage(): void
    {
        try {
            $this->packageManager->getPackage('Flowpack.EntityUsage.DatabaseStorage');
        } catch (FlowException $e) {
            throw new Exception('This method requires "flowpack/entity-usage-databasestorage" to be installed.',
                1619178077);
        }
    }

    /**
     * Returns a DQL clause filtering any implementation of AssetVariantInterface
     */
    protected function getAssetVariantFilterClause(string $alias): string
    {
        $variantClassNames = $this->reflectionService->getAllImplementationClassNamesForInterface(AssetVariantInterface::class);

        return implode(' AND ', array_map(static function ($className) use ($alias) {
            return sprintf("%s NOT INSTANCE OF %s", $alias, $className);
        }, $variantClassNames));
    }

    /**
     * Returns number of assets which have no usage reference provided by `Flowpack.EntityUsage`
     *
     * @throws NoResultException
     * @throws NonUniqueResultException
     * @throws Exception
     */
    public function getUnusedAssetCount(): int
    {
        // TODO: This method has to be implemented in a more generic way at some point to increase support with other implementations
        $this->canQueryAssetUsage();

        return (int)$this->entityManager->createQuery(sprintf(/** @lang DQL */ '
            SELECT COUNT(a.Persistence_Object_Identifier)
            FROM Neos\Media\Domain\Model\Asset a
            WHERE
                a.assetSourceIdentifier = :assetSourceIdentifier AND
                %s AND
                NOT EXISTS (
                    SELECT e
                    FROM Flowpack\EntityUsage\DatabaseStorage\Domain\Model\EntityUsage e
                    WHERE a.Persistence_Object_Identifier = e.entityId
                )
            ORDER BY a.lastModified DESC
        ', $this->getAssetVariantFilterClause('a')))
            ->setParameter('assetSourceIdentifier', 'neos')
            ->getSingleScalarResult();
    }

    protected function translateById(string $id): ?string
    {
        return $this->translator->translateById($id, [], null, null, 'Main', 'Flowpack.Media.Ui') ?? $id;
    }

    /**
     * Resolve the site node in the context of the given node
     */
    protected function getSiteNodeFrom(Node $node): ?Node
    {
        $subgraph = $this->contentRepositoryRegistry->subgraphForNode($node);
        $siteNode = $subgraph->findClosestNode($node->aggregateId, FindClosestNodeFilter::create(
            NodeTypeCriteria::createWithAllowedNodeTypeNames(
                NodeTypeNames::with(
                    NodeTypeNameFactory::forSite()
                )
            )
        ));

        return $siteNode;
    }

    /**
     * @param array<AssetUsageReference> $usageReferences
     * @return bool
     */
    protected function containtsContentReporitoryWithDimensions(array $usageReferences): bool
    {
        foreach ($usageReferences as $usageReference) {
            if ($this->contentRepositoryRegistry->get($usageReference->getContentRepositoryId())->getContentDimensionSource()->getContentDimensionsOrderedByPriority()) {
                return true;
            }
        }
        return false;
    }
}
