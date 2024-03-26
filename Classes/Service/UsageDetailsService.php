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
use Flowpack\Media\Ui\Domain\Model\Dto\AssetUsageDetails;
use Flowpack\Media\Ui\Domain\Model\Dto\UsageMetadataSchema;
use Flowpack\Media\Ui\Exception;
use GuzzleHttp\Psr7\ServerRequest;
use GuzzleHttp\Psr7\Uri;
use Neos\ContentRepository\Domain\Model\Node;
use Neos\ContentRepository\Domain\Model\NodeInterface;
use Neos\ContentRepository\Domain\Repository\WorkspaceRepository;
use Neos\ContentRepository\Domain\Service\NodeTypeManager;
use Neos\ContentRepository\Exception\NodeConfigurationException;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Core\Bootstrap;
use Neos\Flow\Exception as FlowException;
use Neos\Flow\Http\Exception as HttpException;
use Neos\Flow\I18n\Translator;
use Neos\Flow\Mvc\ActionRequest;
use Neos\Flow\Mvc\Routing\Exception\MissingActionNameException;
use Neos\Flow\Mvc\Routing\UriBuilder;
use Neos\Flow\ObjectManagement\ObjectManagerInterface;
use Neos\Flow\Package\PackageManager;
use Neos\Flow\Reflection\ReflectionService;
use Neos\Media\Domain\Model\AssetInterface;
use Neos\Media\Domain\Model\AssetVariantInterface;
use Neos\Media\Domain\Service\AssetService;
use Neos\Media\Domain\Strategy\AssetUsageStrategyInterface;
use Neos\Neos\Controller\BackendUserTranslationTrait;
use Neos\Neos\Controller\CreateContentContextTrait;
use Neos\Neos\Domain\Model\Dto\AssetUsageInNodeProperties;
use Neos\Neos\Domain\Model\Site;
use Neos\Neos\Domain\Repository\SiteRepository;
use Neos\Neos\Domain\Service\UserService as DomainUserService;
use Neos\Neos\Domain\Strategy\AssetUsageInNodePropertiesStrategy;
use Neos\Neos\Service\LinkingService;
use Neos\Neos\Service\UserService;

/**
 * @Flow\Scope("singleton")
 */
class UsageDetailsService
{
    use CreateContentContextTrait;
    use BackendUserTranslationTrait;

    /**
     * @Flow\Inject
     * @var Bootstrap
     */
    protected $bootstrap;

    /**
     * @Flow\Inject
     * @var UserService
     */
    protected $userService;

    /**
     * @Flow\Inject
     * @var SiteRepository
     */
    protected $siteRepository;

    /**
     * @Flow\Inject
     * @var NodeTypeManager
     */
    protected $nodeTypeManager;

    /**
     * @Flow\Inject
     * @var WorkspaceRepository
     */
    protected $workspaceRepository;

    /**
     * @Flow\Inject
     * @var AssetService
     */
    protected $assetService;

    /**
     * @Flow\Inject
     * @var DomainUserService
     */
    protected $domainUserService;

    /**
     * @Flow\Inject
     * @var ObjectManagerInterface
     */
    protected $objectManager;

    /**
     * @Flow\Inject
     * @var LinkingService
     */
    protected $linkingService;

    /**
     * @Flow\Inject
     * @var ReflectionService
     */
    protected $reflectionService;

    /**
     * @Flow\Inject
     * @var EntityManagerInterface
     */
    protected $entityManager;

    /**
     * @Flow\Inject
     * @var PackageManager
     */
    protected $packageManager;

    /**
     * @Flow\InjectConfiguration(path="contentDimensions", package="Neos.ContentRepository")
     * @var array
     */
    protected $contentDimensionsConfiguration;

    /**
     * @Flow\Inject
     * @var Translator
     */
    protected $translator;

    private array $accessibleWorkspaces = [];

    /**
     * @return AssetUsageDetails[]
     */
    public function resolveUsagesForAsset(AssetInterface $asset): array
    {
        $includeSites = $this->siteRepository->countAll() > 1;
        $includeDimensions = count($this->contentDimensionsConfiguration) > 0;

        return array_filter(array_map(function ($strategy) use ($asset, $includeSites, $includeDimensions) {
            $usageByStrategy = [
                'serviceId' => get_class($strategy),
                'label' => get_class($strategy),
                'metadataSchema' => [],
                'usages' => [],
            ];

            if (!$strategy instanceof AssetUsageStrategyInterface) {
                return $usageByStrategy;
            }

            // Should be solved via an interface in the future
            if (method_exists($strategy, 'getLabel')) {
                $usageByStrategy['label'] = $strategy->getLabel();
            } elseif ($strategy instanceof AssetUsageInNodePropertiesStrategy) {
                $usageByStrategy['label'] = $this->translateById('assetUsage.assetUsageInNodePropertiesStrategy.label');
            }

            if ($strategy instanceof UsageDetailsProviderInterface) {
                $usageByStrategy['metadataSchema'] = $strategy->getUsageMetadataSchema()->toArray();
                $usageByStrategy['usages'] = $strategy->getUsageDetails($asset);
            } else {
                // If the strategy does not implement the UsageDetailsProviderInterface, we provide some default usage data
                try {
                    $usageReferences = $strategy->getUsageReferences($asset);
                    if (count($usageReferences) && $usageReferences[0] instanceof AssetUsageInNodeProperties) {
                        $usageByStrategy['metadataSchema'] = $this->getNodePropertiesUsageMetadataSchema($includeSites,
                            $includeDimensions)->toArray();
                        $usageByStrategy['usages'] = array_map(function (AssetUsageInNodeProperties $usage) use (
                            $includeSites,
                            $includeDimensions
                        ) {
                            return $this->getNodePropertiesUsageDetails($usage, $includeSites, $includeDimensions);
                        }, $usageReferences);
                    }
                } catch (NodeConfigurationException $e) {
                    // TODO: Handle error
                }
            }
            return $usageByStrategy;
        }, $this->getUsageStrategies()), static function ($usageByStrategy) {
            return count($usageByStrategy['usages']) > 0;
        });
    }

    protected function getNodePropertiesUsageMetadataSchema(
        bool $includeSites,
        bool $includeDimensions
    ): UsageMetadataSchema {
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
        AssetUsageInNodeProperties $usage,
        bool $includeSites,
        bool $includeDimensions
    ): AssetUsageDetails {
        /** @var Node $node */
        $node = $this->getNodeFrom($usage);
        $siteNode = $this->getSiteNodeFrom($node);
        $site = $siteNode ? $this->siteRepository->findOneByNodeName($siteNode->getName()) : null;
        $closestDocumentNode = $node ? $this->getClosestDocumentNode($node) : null;
        $accessible = $this->usageIsAccessible($usage->getWorkspaceName());
        $workspace = $this->workspaceRepository->findByIdentifier($usage->getWorkspaceName());
        $label = $accessible && $node ? $node->getLabel() : $this->translateById('assetUsage.assetUsageInNodePropertiesStrategy.inaccessibleNode');

        $url = $accessible && $closestDocumentNode ? $this->buildNodeUri($site, $closestDocumentNode) : '';

        $metadata = [
            [
                'name' => 'workspace',
                'value' => $workspace ? $workspace->getTitle() : $usage->getWorkspaceName(),
            ],
            [
                'name' => 'document',
                'value' => $closestDocumentNode ? $closestDocumentNode->getLabel() : $this->translateById('assetUsage.assetUsageInNodePropertiesStrategy.metadataNotAvailable'),
            ],
            [
                'name' => 'lastModified',
                'value' => $node && $node->getLastPublicationDateTime() ? $node->getLastModificationDateTime()->format(DATE_W3C) : null,
            ]
        ];

        if ($node) {
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
                    'value' => json_encode($this->resolveDimensionValuesForNode($node)),
                ];
            }
        }

        return new AssetUsageDetails($label, $url, $metadata);
    }

    protected function resolveDimensionValuesForNode(NodeInterface $node): array
    {
        $dimensionValues = [];
        foreach ($node->getDimensions() as $dimensionName => $dimensionValuesForName) {
            $dimensionValues[$this->contentDimensionsConfiguration[$dimensionName]['label'] ?? $dimensionName] = array_map(function (
                $dimensionValue
            ) use ($dimensionName) {
                return $this->contentDimensionsConfiguration[$dimensionName]['presets'][$dimensionValue]['label'] ?? $dimensionValue;
            }, $dimensionValuesForName);
        }
        return $dimensionValues;
    }

    protected function getNodeFrom(AssetUsageInNodeProperties $assetUsage): ?NodeInterface
    {
        $context = $this->_contextFactory->create(
            [
                'workspaceName' => $assetUsage->getWorkspaceName(),
                'dimensions' => $assetUsage->getDimensionValues(),
                'targetDimensions' => [],
                'invisibleContentShown' => true,
                'removedContentShown' => true
            ]
        );
        return $context->getNodeByIdentifier($assetUsage->getNodeIdentifier());
    }

    protected function getClosestDocumentNode(NodeInterface $node): ?NodeInterface
    {
        $parentNode = $node;
        while ($parentNode && !$parentNode->getNodeType()->isOfType('Neos.Neos:Document')) {
            $parentNode = $parentNode->getParent();
        }
        return $parentNode;
    }

    protected function usageIsAccessible(string $workspaceName): bool
    {
        if (array_key_exists($workspaceName, $this->accessibleWorkspaces)) {
            return $this->accessibleWorkspaces[$workspaceName];
        }
        $workspace = $this->workspaceRepository->findByIdentifier($workspaceName);
        $accessible = $this->domainUserService->currentUserCanReadWorkspace($workspace);
        $this->accessibleWorkspaces[$workspaceName] = $accessible;
        return $accessible;
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
    protected function buildNodeUri(?Site $site, NodeInterface $node): string
    {
        $serverRequest = $this->bootstrap->getActiveRequestHandler()->getHttpRequest();
        $domain = $site ? $site->getPrimaryDomain() : null;

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
     * @return array<AssetInterface>
     * @throws Exception
     */
    public function getUnusedAssets(int $limit = 20, int $offset = 0): array
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
            ->setParameter('assetSourceIdentifier', 'neos')
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
    protected function getSiteNodeFrom(NodeInterface $node): ?NodeInterface
    {
        // Take the first two path segments of the node path
        $sitePath = implode('/', array_slice(explode('/', $node->getPath(), 4), 0, 3));
        return $node->getContext()->getNode($sitePath);
    }
}
