<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\Description;

#[Description('The result of a single file upload')]
#[Flow\Proxy(false)]
final class FileUploadResult implements \JsonSerializable
{
    private function __construct(
        public readonly bool $success,
        public readonly string $result,
        public readonly ?Filename $filename = null,
    ) {
    }

    public function jsonSerialize(): array
    {
        return [
            'filename' => $this->filename,
            'success' => $this->success,
            'result' => $this->result,
        ];
    }
}
