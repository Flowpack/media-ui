<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\Domain\Model;

/*
 * This file is part of the Flowpack.Media.Ui package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

 /**
  * @internal
  */
final class SearchTerm
{
    const ASSET_IDENTIFIER_PATTERN = '/id:([0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12})/';

    /**
     * @var string
     */
    private $value;

    /**
     * @var null|string
     */
    private $assetIdentifier = null;

    private function __construct(string $value)
    {
        $this->value = $value;

        if (preg_match(self::ASSET_IDENTIFIER_PATTERN, $value, $matches) !== false) {
            if ($assetIdentifier = $matches[1] ?? null) {
                $this->assetIdentifier = $assetIdentifier;
            }
        }
    }

    /**
     * @param mixed $any
     * @return null|self
     */
    public static function from($any): ?self
    {
        if (is_string($any) && !empty($any)) {
            return new self($any);
        }

        return null;
    }

    public function getAssetIdentifierIfPresent(): ?string
    {
        return $this->assetIdentifier;
    }

    public function __toString(): string
    {
        return $this->value;
    }
}
