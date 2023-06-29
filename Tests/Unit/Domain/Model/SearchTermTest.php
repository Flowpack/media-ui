<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\Tests\Unit\Domain\Model;

/*
 * This file is part of the Flowpack.Media.Ui package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use Flowpack\Media\Ui\Domain\Model\SearchTerm;
use Neos\Flow\Tests\UnitTestCase;

final class SearchTermTest extends UnitTestCase
{
    /**
     * @test
     * @return void
     */
    public function canBeCreatedFromString(): void
    {
        $this->assertInstanceOf(
            SearchTerm::class,
            SearchTerm::from('Hello World!')
        );
    }

    /**
     * @test
     * @return void
     */
    public function ignoresEmptyStrings(): void
    {
        $this->assertNull(
            SearchTerm::from('')
        );
    }

    /**
     * @return array<mixed>
     */
    public function nonStringValueExamples(): array
    {
        return [
            'null' => [null],
            'boolean(true)' => [true],
            'boolean(false)' => [false],
            'integer' => [42],
            'float' => [47.11],
            'array' => [[1, 2, 3, 4]],
            '\\stdClass' => [new \stdClass],
        ];
    }

    /**
     * @dataProvider nonStringValueExamples
     * @test
     * @param mixed $nonStringValue
     * @return void
     */
    public function ignoresNonStringValues($nonStringValue): void
    {
        $this->assertNull(
            SearchTerm::from($nonStringValue)
        );
    }

    /**
     * @test
     * @return void
     */
    public function providesTheGivenAssetIdentifierIfPresent(): void
    {
        $searchTerm = SearchTerm::from('id:68610fa2-bdd1-4d84-80eb-27db56f2889f');

        $this->assertEquals(
            '68610fa2-bdd1-4d84-80eb-27db56f2889f',
            $searchTerm->getAssetIdentifierIfPresent()
        );
    }

    /**
     * @test
     * @return void
     */
    public function canBeConvertedToString(): void
    {
        $searchTerm = SearchTerm::from('Hello World!');

        $this->assertEquals(
            'Hello World!',
            (string) $searchTerm
        );

        $searchTerm = SearchTerm::from('id:68610fa2-bdd1-4d84-80eb-27db56f2889f');

        $this->assertEquals(
            'id:68610fa2-bdd1-4d84-80eb-27db56f2889f',
            (string) $searchTerm
        );
    }
}
