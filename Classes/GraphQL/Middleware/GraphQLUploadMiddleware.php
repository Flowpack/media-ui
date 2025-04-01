<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Middleware;

/*
 * This file is part of the Flowpack.Media.Ui package.
 *
 * It is based on the t3n/graphql-upload package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use Neos\Flow\Http\Helper\UploadedFilesHelper;
use Neos\Http\Factories\FlowUploadedFile;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

use function Wwwision\Types\instantiate;

class GraphQLUploadMiddleware implements MiddlewareInterface
{
    /**
     * @throws \Exception
     */
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        if ($this->isGraphQLRequest($request)
            && str_starts_with($request->getHeader('Content-Type')[0], 'multipart/form-data')) {
            $request = $this->parseUploadedFiles($request);
        }
        return $handler->handle($request);
    }

    /**
     * @throws \JsonException
     */
    protected function parseUploadedFiles(ServerRequestInterface $request): ServerRequestInterface
    {
        $arguments = $request->getParsedBody();
        if (!is_array($arguments) || !isset($arguments['map'])) {
            throw new \RuntimeException('The request must define a "map"');
        }

        $map = json_decode($arguments['map'], true, 512, JSON_THROW_ON_ERROR);
        $result = json_decode($arguments['operations'], true, 512, JSON_THROW_ON_ERROR);

//        if (isset($result['operationName'])) {
//            $result['operation'] = $result['operationName'];
//            unset($result['operationName']);
//        }

        foreach ($map as $fileKey => $locations) {
            foreach ($locations as $location) {
                /** @var FlowUploadedFile[] $uploadedFiles */
                $uploadedFiles = UploadedFilesHelper::upcastUploadedFiles([$request->getUploadedFiles()[$fileKey]], []);
                $firstFile = $uploadedFiles[0] ?? null;
                if (!$firstFile) {
                    continue;
                }
//                $result = Arrays::setValueByPath($result, $location, $uploadedFiles[0]);

                $parts = explode('.', $location);
                $result[$parts[0]][$parts[1]] = [
                    [
                        'streamOrFile' => $firstFile->getStream()?->getContents(),
                        'size' => $firstFile->getSize(),
                        'errorStatus' => $firstFile->getError(),
                        'clientFilename' => $firstFile->getClientFilename(),
                        'clientMediaType' => $firstFile->getClientMediaType(),
                    ]
                ];
            }
        }

        $request = $request->withAddedHeader('Content-Type', 'application/json');
        return $request->withParsedBody($result);
    }

    protected function isGraphQLRequest(ServerRequestInterface $request): bool
    {
//        $routingMatchResults = $request->getAttribute('routingResults') ?? [];
        // FIXME: Properly check if the request is a GraphQL request
        return true;
    }
}
