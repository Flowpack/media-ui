<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\Transform;

use GraphQL\Error\Error;
use GraphQL\Executor\ExecutionResult;
//use GraphQLTools\Transforms\Transform;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Log\ThrowableStorageInterface;

/**
 * This transform is used to convert exceptions to errors in the GraphQL response.
 * To be able to localize error messages we extend the FlowErrorTransform from the t3n.GraphQL package.
 */
class FlowErrorTransform
{
    public function transformResult(ExecutionResult $result): ExecutionResult
    {
        $result->errors = array_map(function (Error $error) {
            $previousError = $error->getPrevious();
            if (!$previousError instanceof Error) {
                $message = $this->throwableStorage->logThrowable($previousError);

                if (!$this->includeExceptionMessageInOutput) {
                    $message = preg_replace('/.* - See also: (.+)\.txt$/s', 'Internal error ($1)', $message);
                }

                $errorExtendedInformation = $error->getExtensions();
                $errorExtendedInformation['errorCode'] = $previousError->getCode();

                return new Error(
                    $message,
                    $error->getNodes(),
                    $error->getSource(),
                    $error->getPositions(),
                    $error->getPath(),
                    $previousError,
                    $errorExtendedInformation
                );
            }

            return $error;
        }, $result->errors);

        return $result;
    }
}
