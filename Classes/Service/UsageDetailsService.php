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
use Flowpack\Media\Ui\Exception;
use GuzzleHttp\Psr7\ServerRequest;
use Neos\ContentRepository\Domain\Model\Node;
use Neos\ContentRepository\Domain\Model\NodeInterface;
use Neos\ContentRepository\Domain\Repository\WorkspaceRepository;
use Neos\ContentRepository\Domain\Service\NodeTypeManager;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Exception as FlowException;
use Neos\Flow\Mvc\ActionRequest;
use Neos\Flow\Mvc\Routing\UriBuilder;
use Neos\Flow\ObjectManagement\ObjectManagerInterface;
use Neos\Flow\Package\PackageManager;
use Neos\Flow\Reflection\ReflectionService;
use Neos\Media\Domain\Model\AssetInterface;
use Neos\Media\Domain\Model\AssetVariantInterface;
use Neos\Media\Domain\Service\AssetService;
use Neos\Media\Domain\Strategy\AssetUsageStrategyInterface;
use Neos\Neos\Controller\CreateContentContextTrait;
use Neos\Neos\Domain\Model\Dto\AssetUsageInNodeProperties;
use Neos\Neos\Domain\Repository\SiteRepository;
use Neos\Neos\Domain\Service\ContentContext;
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
     * @var UriBuilder
     */
    protected $uriBuilder;

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

    private $accessibleWorkspaces = [];

    public function resolveUsagesForAsset(AssetInterface $asset): array
    {
        return array_filter(array_map(function ($strategy) use ($asset) {
            // TODO: At some point the strategy should be able to create the AssetUsageDetails DTO and headers for us, until then we build them manually for the strategies we know
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
            } else {
                if ($strategy instanceof AssetUsageInNodePropertiesStrategy) {
                    $usageByStrategy['label'] = 'Neos documents and content';
                }
            }

            $usageReferences = $strategy->getUsageReferences($asset);
            if (count($usageReferences) && $usageReferences[0] instanceof AssetUsageInNodeProperties) {
                $usageByStrategy['metadataSchema'] = $this->getNodePropertiesUsageMetadataSchema();
                $usageByStrategy['usages'] = array_map(function (AssetUsageInNodeProperties $usage) {
                    return $this->getNodePropertiesUsageDetails($usage);
                }, $usageReferences);
            }
            return $usageByStrategy;
        }, $this->getUsageStrategies()), static function ($usageByStrategy) {
            return count($usageByStrategy['usages']) > 0;
        });
    }

    protected function getNodePropertiesUsageMetadataSchema(): array
    {
        // TODO: Translate headers
        return [
            [
                'name' => 'site',
                'label' => 'Site',
                'type' => 'TEXT',
            ],
            [
                'name' => 'workspace',
                'label' => 'Workspace',
                'type' => 'TEXT',
            ],
            [
                'name' => 'contentDimensions',
                'label' => 'Content Dimensions',
                'type' => 'TEXT',
            ],
            [
                'name' => 'lastModified',
                'label' => 'Last modified',
                'type' => 'DATETIME',
            ],
        ];
    }

    protected function getNodePropertiesUsageDetails(AssetUsageInNodeProperties $usage): AssetUsageDetails
    {
        /** @var Node $node */
        $node = $this->getNodeFrom($usage);
        $closestDocumentNode = $node ? $this->getClosestDocumentNode($node) : null;
        $accessible = $this->usageIsAccessible($usage->getWorkspaceName());

        $label = $accessible && $node ? $node->getLabel() : 'n/a';
        $metadata = [];

        $url = $accessible && $closestDocumentNode ? $this->getUriBuilder()->uriFor(
            'preview',
            ['node' => $closestDocumentNode],
            'Frontend\\Node',
            'Neos.Neos'
        ) : '';

        if ($node && $closestDocumentNode) {
            /** @var ContentContext $context */
            $context = $node->getContext();
            $site = $context->getCurrentSite();
            $metadata = [
                [
                    'name' => 'workspace',
                    'value' => $usage->getWorkspaceName(),
                ],
                [
                    'name' => 'site',
                    'value' => $site ? $site->getName() : 'n/a',
                ],
                [
                    'name' => 'lastModified',
                    'value' => $node->getLastPublicationDateTime() ? $node->getLastModificationDateTime()->format(DATE_W3C) : null,
                ],
                [
                    'name' => 'contentDimensions',
                    'value' => json_encode(array_values($node->getDimensions())),
                ],
            ];
        }

        return new AssetUsageDetails($label, $url, $metadata);
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

    protected function getUriBuilder(): UriBuilder
    {
        if ($this->uriBuilder) {
            return $this->uriBuilder;
        }
        $request = ActionRequest::fromHttpRequest(ServerRequest::fromGlobals());

        $uriBuilder = new UriBuilder();
        $uriBuilder->setRequest($request);
        $uriBuilder->setCreateAbsoluteUri(true);
        $uriBuilder->setFormat('html');

        return $this->uriBuilder = $uriBuilder;
    }

    /**
     * @return array<AssetUsageStrategyInterface>
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
     * @param int $limit
     * @param int $offset
     * @return array<AssetInterface>
     * @throws Exception
     */
    public function getUnusedAssets(int $limit = 20, int $offset = 0): array
    {
        // TODO: This method has to be implemented in a more generic way at some point to increase support with other implementations
        $this->canQueryAssetUsage();

        $variantClassNames = $this->reflectionService->getAllImplementationClassNamesForInterface(AssetVariantInterface::class);

        return $this->entityManager->createQuery(/** @lang DQL */ '
            SELECT a
            FROM Neos\Media\Domain\Model\Asset a
            WHERE
                a.assetSourceIdentifier = :assetSourceIdentifier AND
                a NOT INSTANCE OF :variantClassName AND
                NOT EXISTS (
                    SELECT e
                    FROM Flowpack\EntityUsage\DatabaseStorage\Domain\Model\EntityUsage e
                    WHERE a.Persistence_Object_Identifier = e.entityId
                )
            ORDER BY a.lastModified DESC
        ')
            ->setParameter('assetSourceIdentifier', 'neos')
            ->setParameter('variantClassName', $variantClassNames)
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->getResult();
    }

    /**
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
     * Returns number of assets which have no usage reference provided by `Flowpack.EntityUsage`
     *
     * @return int
     * @throws Exception
     */
    public function getUnusedAssetCount(): int
    {
        // TODO: This method has to be implemented in a more generic way at some point to increase support with other implementations
        $this->canQueryAssetUsage();

        $variantClassNames = $this->reflectionService->getAllImplementationClassNamesForInterface(AssetVariantInterface::class);

        return (int)$this->entityManager->createQuery(/** @lang DQL */ '
            SELECT COUNT(a)
            FROM Neos\Media\Domain\Model\Asset a
            WHERE
                a.assetSourceIdentifier = :assetSourceIdentifier AND
                a NOT INSTANCE OF :variantClassName AND
                NOT EXISTS (
                    SELECT e
                    FROM Flowpack\EntityUsage\DatabaseStorage\Domain\Model\EntityUsage e
                    WHERE a.Persistence_Object_Identifier = e.entityId
                )
            ORDER BY a.lastModified DESC
        ')
            ->setParameter('assetSourceIdentifier', 'neos')
            ->setParameter('variantClassName', $variantClassNames)
            ->getSingleScalarResult();
    }
}
