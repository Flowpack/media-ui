<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Transform;

use GraphQL\Error\Error;
use GraphQL\Executor\ExecutionResult;
use GraphQLTools\Transforms\Transform;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Log\ThrowableStorageInterface;
use Neos\Flow\Exception;
use Neos\Flow\Security\Authentication\EntryPoint\WebRedirect;
use Neos\Flow\Security\Context;

class FlowErrorTransform implements Transform
{
    /**
     * @Flow\Inject
     *
     * @var ThrowableStorageInterface
     */
    protected $throwableStorage;

    /**
     * @Flow\InjectConfiguration("includeExceptionMessageInOutput")
     *
     * @var bool
     */
    protected $includeExceptionMessageInOutput;

    /**
     * @Flow\Inject
     * @var Context
     */
    protected $securityContext;

    public function transformResult(ExecutionResult $result): ExecutionResult
    {
        $result->errors = array_map(function (Error $error) {
            $previousError = $error->getPrevious();

            if (! $previousError instanceof Error) {
                $message = $this->throwableStorage->logThrowable($previousError);
                $extensions = [
                    'category' => 'internal',
                    'code' => 'INTERNAL_SERVER_ERROR',
                ];

                if (! $this->includeExceptionMessageInOutput) {
                    $message = preg_replace('/.* - See also: (.+)\.txt$/s', 'Internal error ($1)', $message);
                }

                // Map status codes to Apollo Graph Error codes (https://www.apollographql.com/docs/apollo-server/data/errors/#error-codes)
                if ($previousError instanceof Exception) {
                    $statusCode = $previousError->getStatusCode();
                    $extensions['statusCode'] = $statusCode;
                    $extensions['message'] = $previousError->getMessage();
                    $extensions['internalCode'] = $previousError->getReferenceCode();

                    switch ($statusCode) {
                        case 401:
                            $extensions['code'] = 'UNAUTHENTICATED';
                            foreach ($this->securityContext->getAuthenticationTokens() as $token) {
                                $entryPoint = $token->getAuthenticationEntryPoint();
                                if ($entryPoint instanceof WebRedirect) {
                                    // TODO: Get proper url from WebRedirect entrypoint
                                    $extensions['authenticationUrl'] = 'some login url';
                                }
                            }
                            break;
                        case 403:
                            $extensions['code'] = 'FORBIDDEN';
                            break;
                    }
                }

                return new Error(
                    $message,
                    $error->getNodes(),
                    $error->getSource(),
                    $error->getPositions(),
                    $error->getPath(),
                    $previousError,
                    $extensions,
                );
            }

            return $error;
        }, $result->errors);

        return $result;
    }
}
