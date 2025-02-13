<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\Domain\Model\Dto;

use Flowpack\Media\Ui\GraphQL\Types\MutationResponseMessages;
use Neos\Flow\Annotations as Flow;

#[Flow\Proxy(false)]
class MutationResult implements \JsonSerializable
{

    public function __construct(
        private bool $success,
        private ?MutationResponseMessages $messages = null,
    )
    {
        if ($messages === null) {
            $this->messages = MutationResponseMessages::empty();
        }
    }

    public function isSuccess(): bool
    {
        return $this->success;
    }

    public function getMessages(): ?MutationResponseMessages
    {
        return $this->messages;
    }

    public function toArray(): array
    {
        return [
            'success' => $this->success,
            'messages' => $this->messages,
        ];
    }

    public function jsonSerialize(): array
    {
        return $this->toArray();
    }
}
