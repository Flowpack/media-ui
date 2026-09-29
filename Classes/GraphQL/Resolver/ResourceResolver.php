<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Resolver;

/*
 * This file is part of the Flowpack.Media.Ui package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use Neos\Flow\Annotations as Flow;
use Neos\Flow\ResourceManagement\PersistentResource;
use Neos\Flow\ResourceManagement\ResourceRepository;
use Psr\Http\Message\UriInterface;

#[Flow\Scope("singleton")]
class ResourceResolver
{
    public function __construct(
        private readonly ResourceRepository $resourceRepository,
    ) {
    }

    public function getFilename(UriInterface $resourceUri): ?string
    {
        switch ($resourceUri->getScheme()) {
            case 'persistentResource':
                $resource = $this->resourceRepository->findByIdentifier($resourceUri->getPath());
                return $resource instanceof PersistentResource ? $resource->getFilename() : null;
            case 'resource':
                $pivot = \mb_strrpos($resourceUri->getPath(), '/');
                $lastSegment = \mb_substr($resourceUri->getPath(), $pivot ? $pivot + 1 : 0);
                return \str_contains($lastSegment, '.') ? $lastSegment : null;
            default:
                return null;
        }
    }

    public function findResource(UriInterface $resourceUri): ?PersistentResource
    {
        switch ($resourceUri->getScheme()) {
            case 'persistentResource':
                $resource = $this->resourceRepository->findByIdentifier($resourceUri->getPath());
                return $resource instanceof PersistentResource
                    ? $resource
                    : null;
            default:
                return null;
        }
    }
}
