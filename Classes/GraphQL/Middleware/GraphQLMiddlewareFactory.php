<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Middleware;

/*
 * This file is part of the Flowpack.Media.Ui package.
 *
 * It is based on the wwwision/neos-graphql package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use Flowpack\Media\Ui\GraphQL\Resolver\CustomResolversFactory;
use Neos\Cache\Frontend\VariableFrontend;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Log\ThrowableStorageInterface;
use Neos\Flow\ObjectManagement\ObjectManagerInterface;
use Neos\Flow\Persistence\PersistenceManagerInterface;
use Neos\Flow\Security\Context;
use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\StreamFactoryInterface;

#[Flow\Scope('singleton')]
final class GraphQLMiddlewareFactory
{
    public function __construct(
        private readonly bool $debugMode,
        private readonly string $corsOrigin,
        private readonly VariableFrontend $schemaCache,
        private readonly StreamFactoryInterface $streamFactory,
        private readonly ResponseFactoryInterface $responseFactory,
        private readonly ThrowableStorageInterface $throwableStorage,
        private readonly Context $securityContext,
        private readonly ObjectManagerInterface $objectManager,
        private readonly CustomResolversFactory $customResolversFactory,
        private readonly PersistenceManagerInterface $persistenceManager,
    ) {
    }

    public function create(
        string $uriPath,
        string $apiObjectName,
        array $typeNamespaces = [],
        string $simulateControllerObjectName = null,
        array $customResolversSettings = null,
    ): GraphQLMiddleware {
        return new GraphQLMiddleware(
            $uriPath,
            $apiObjectName,
            $typeNamespaces,
            $simulateControllerObjectName,
            $this->debugMode,
            $this->corsOrigin,
            $this->streamFactory,
            $this->responseFactory,
            $this->schemaCache,
            $this->throwableStorage,
            $this->securityContext,
            $this->objectManager,
            $this->customResolversFactory->create($customResolversSettings ?? []),
            $this->persistenceManager,
        );
    }
}
