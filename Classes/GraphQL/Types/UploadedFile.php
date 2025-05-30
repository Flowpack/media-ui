<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Psr\Http\Message\StreamInterface;
use Psr\Http\Message\UploadedFileInterface;
use Wwwision\Types\Attributes\Description;

#[Description('An uploaded file')]
#[Flow\Proxy(false)]
final class UploadedFile implements UploadedFileInterface
{
    private function __construct(
        public int $size,
        public int $errorStatus,
        public ?string $streamOrFile = null,
        public ?string $clientFilename = null,
        public ?string $clientMediaType = null
    )
    {
    }

    public function getStream(): StreamInterface|string
    {
        return $this->streamOrFile;
    }

    public function moveTo(string $targetPath): void
    {
    }

    public function getSize(): ?int
    {
        return $this->size;
    }

    public function getError(): int
    {
        return $this->errorStatus;
    }

    public function getClientFilename(): ?string
    {
        return $this->clientFilename;
    }

    public function getClientMediaType(): ?string
    {
        return $this->clientMediaType;
    }
}
