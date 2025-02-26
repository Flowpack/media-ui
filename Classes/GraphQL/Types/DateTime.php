<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Neos\Flow\Utility\Now;
use Wwwision\Types\Attributes\Description;
use Wwwision\Types\Attributes\StringBased;
use Wwwision\Types\Schema\StringTypeFormat;

use function Wwwision\Types\instantiate;

#[Description('A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the date-time format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar')]
#[Flow\Proxy(false)]
#[StringBased(format: StringTypeFormat::date_time)]
final class DateTime implements \JsonSerializable
{
    private function __construct(public readonly string $value)
    {
    }

    public function jsonSerialize(): string
    {
        return $this->value;
    }

    public function __toString(): string
    {
        return $this->value;
    }

    public static function now(): self
    {
        return instantiate(self::class, (new Now())->format(DATE_W3C));
    }
}
