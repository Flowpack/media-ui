<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\Domain\Model\Dto;

use Neos\Flow\Annotations as Flow;

/**
 * @Flow\Proxy(false)
 */
class MutationResult implements \JsonSerializable
{

    private bool $success;
    private ?array $messages;
    private ?array $data;

    public function __construct(bool $success, array $messages = null, array $data = null)
    {
        $this->success = $success;
        $this->messages = $messages;
        $this->data = $data;
    }

    public function isSuccess(): bool
    {
        return $this->success;
    }

    public function getMessages(): ?array
    {
        return $this->messages;
    }

    public function getData(): ?array
    {
        return $this->data;
    }

    public function toArray(): array
    {
        return [
            'success' => $this->success,
            'messages' => $this->messages,
            'data' => $this->data,
        ];
    }

    public function jsonSerialize(): array
    {
        return $this->toArray();
    }
}
