<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\Domain\Model\Dto;

use Flowpack\Media\Ui\GraphQL\Types\MutationResponseMessages;
use Neos\Flow\Annotations as Flow;

#[Flow\Proxy(false)]
class MutationResult implements \JsonSerializable
{

    public function __construct(
        public readonly bool $success,
        public readonly ?MutationResponseMessages $messages = null,
    )
    {
    }

    public static function success(): self
    {
        return new self(true);
    }

    public static function error(array $array): self
    {
        return new self(false, MutationResponseMessages::fromArray($array));
    }

    public function isSuccess(): bool
    {
        return $this->success;
    }

    public function getMessages(): ?MutationResponseMessages
    {
        return $this->messages ?? MutationResponseMessages::empty();
    }

    public function toArray(): array
    {
        return [
            'success' => $this->success,
            'messages' => $this->getMessages(),
        ];
    }

    public function jsonSerialize(): array
    {
        return $this->toArray();
    }
}
