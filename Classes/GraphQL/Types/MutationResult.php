<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\Description;

#[Description('Result of a mutation, containing success status and optional messages')]
#[Flow\Proxy(false)]
final class MutationResult
{

    private function __construct(
        public readonly bool $success,
        public readonly ?MutationResponseMessages $messages = null,
    ) {
    }

    /**
     * @param array<MutationResponseMessage>|null $messages
     */
    public static function fromSuccess(?array $messages = null): self
    {
        return new self(true, $messages ? MutationResponseMessages::fromArray($messages) : null);
    }

    /**
     * @param array<MutationResponseMessage> $messages
     */
    public static function fromError(array $messages): self
    {
        return new self(false, MutationResponseMessages::fromArray($messages));
    }

    public function getMessages(): MutationResponseMessages
    {
        return $this->messages ?? MutationResponseMessages::empty();
    }
}
