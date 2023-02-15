<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\Tests\Unit\Infrastructure\Neos\Media;

/*
 * This file is part of the Flowpack.Media.Ui package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use Flowpack\Media\Ui\Infrastructure\Neos\Media\AssetProxyListIterator;
use Neos\Media\Domain\Model\AssetSource\AssetProxy\AssetProxyInterface;
use PHPUnit\Framework\TestCase;

final class AssetProxyListIteratorTest extends TestCase
{
    /**
     * @test
     * @return void
     */
    public function canBeCreatedFromAssetInterface(): void
    {
        $this->assertInstanceOf(
            AssetProxyListIterator::class,
            AssetProxyListIterator::of(
                $this->createMock(AssetProxyInterface::class)
            )
        );
    }

    /**
     * @test
     * @return void
     */
    public function providesCorrectCount(): void
    {
        $this->assertCount(
            0,
            AssetProxyListIterator::of()
        );
        $this->assertCount(
            1,
            AssetProxyListIterator::of(
                $this->createMock(AssetProxyInterface::class)
            )
        );
        $this->assertCount(
            10,
            AssetProxyListIterator::of(
                $this->createMock(AssetProxyInterface::class),
                $this->createMock(AssetProxyInterface::class),
                $this->createMock(AssetProxyInterface::class),
                $this->createMock(AssetProxyInterface::class),
                $this->createMock(AssetProxyInterface::class),
                $this->createMock(AssetProxyInterface::class),
                $this->createMock(AssetProxyInterface::class),
                $this->createMock(AssetProxyInterface::class),
                $this->createMock(AssetProxyInterface::class),
                $this->createMock(AssetProxyInterface::class)
            )
        );
    }

    /**
     * @test
     * @return void
     */
    public function providesEmptyIteratorIfNoItemWasGiven(): void
    {
        $assetProxyListIterator = AssetProxyListIterator::of();

        $items = iterator_to_array($assetProxyListIterator);

        $this->assertEmpty($items);
    }

    /**
     * @test
     * @return void
     */
    public function providesIteratorWithExactlyOneItemIfOnlyOneItemWasGiven(): void
    {
        $assetProxy = $this->createMock(AssetProxyInterface::class);
        $assetProxyListIterator = AssetProxyListIterator::of($assetProxy);

        $items = iterator_to_array($assetProxyListIterator);

        $this->assertCount(1, $items);
        $this->assertSame($assetProxy, $items[0]);
    }

    /**
     * @test
     * @return void
     */
    public function providesIteratorWithExactlyTwoItemsIfOnlyTwoItemsWereGiven(): void
    {
        $assetProxy1 = $this->createMock(AssetProxyInterface::class);
        $assetProxy2 = $this->createMock(AssetProxyInterface::class);
        $assetProxyListIterator = AssetProxyListIterator::of($assetProxy1, $assetProxy2);

        $items = iterator_to_array($assetProxyListIterator);

        $this->assertCount(2, $items);
        $this->assertSame($assetProxy1, $items[0]);
        $this->assertSame($assetProxy2, $items[1]);
    }

    /**
     * @test
     * @return void
     */
    public function providesIteratorWithExactlyThreeItemsIfOnlyThreeItemsWereGiven(): void
    {
        $assetProxy1 = $this->createMock(AssetProxyInterface::class);
        $assetProxy2 = $this->createMock(AssetProxyInterface::class);
        $assetProxy3 = $this->createMock(AssetProxyInterface::class);
        $assetProxyListIterator = AssetProxyListIterator::of($assetProxy1, $assetProxy2, $assetProxy3);

        $items = iterator_to_array($assetProxyListIterator);

        $this->assertCount(3, $items);
        $this->assertSame($assetProxy1, $items[0]);
        $this->assertSame($assetProxy2, $items[1]);
        $this->assertSame($assetProxy3, $items[2]);
    }

    /**
     * @test
     * @return void
     */
    public function setOffsetDoesNothingIfGivenZero(): void
    {
        $assetProxies = [
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class)
        ];
        $assetProxyListIterator = AssetProxyListIterator::of(...$assetProxies);

        $assetProxyListIterator->setOffset(0);

        $items = iterator_to_array($assetProxyListIterator);

        $this->assertCount(10, $items);
        $this->assertSame($assetProxies[0], $items[0]);
        $this->assertSame($assetProxies[1], $items[1]);
        $this->assertSame($assetProxies[2], $items[2]);
        $this->assertSame($assetProxies[3], $items[3]);
        $this->assertSame($assetProxies[4], $items[4]);
        $this->assertSame($assetProxies[5], $items[5]);
        $this->assertSame($assetProxies[6], $items[6]);
        $this->assertSame($assetProxies[7], $items[7]);
        $this->assertSame($assetProxies[8], $items[8]);
        $this->assertSame($assetProxies[9], $items[9]);
    }

    /**
     * @test
     * @return void
     */
    public function setOffsetEffectivelyPushesTheStartingIndexOfTheProvidedIterator(): void
    {
        $assetProxies = [
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class)
        ];
        $assetProxyListIterator = AssetProxyListIterator::of(...$assetProxies);

        $assetProxyListIterator->setOffset(3);

        $items = iterator_to_array($assetProxyListIterator);

        $this->assertCount(7, $items);
        $this->assertSame($assetProxies[3], $items[0]);
        $this->assertSame($assetProxies[4], $items[1]);
        $this->assertSame($assetProxies[5], $items[2]);
        $this->assertSame($assetProxies[6], $items[3]);
        $this->assertSame($assetProxies[7], $items[4]);
        $this->assertSame($assetProxies[8], $items[5]);
        $this->assertSame($assetProxies[9], $items[6]);
    }

    /**
     * @test
     * @return void
     */
    public function setOffsetMayGoBeyondTheTotalNumberOfItemsInWhichCaseTheProvidedIteratorWillBeEmpty(): void
    {
        $assetProxies = [
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class)
        ];
        $assetProxyListIterator = AssetProxyListIterator::of(...$assetProxies);

        $assetProxyListIterator->setOffset(20);

        $items = iterator_to_array($assetProxyListIterator);

        $this->assertCount(0, $items);
    }

    /**
     * @test
     * @return void
     */
    public function setLimitDoesNothingIfGivenNull(): void
    {
        $assetProxies = [
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class)
        ];
        $assetProxyListIterator = AssetProxyListIterator::of(...$assetProxies);

        $assetProxyListIterator->setLimit(null);

        $items = iterator_to_array($assetProxyListIterator);

        $this->assertCount(10, $items);
        $this->assertSame($assetProxies[0], $items[0]);
        $this->assertSame($assetProxies[1], $items[1]);
        $this->assertSame($assetProxies[2], $items[2]);
        $this->assertSame($assetProxies[3], $items[3]);
        $this->assertSame($assetProxies[4], $items[4]);
        $this->assertSame($assetProxies[5], $items[5]);
        $this->assertSame($assetProxies[6], $items[6]);
        $this->assertSame($assetProxies[7], $items[7]);
        $this->assertSame($assetProxies[8], $items[8]);
        $this->assertSame($assetProxies[9], $items[9]);
    }

    /**
     * @test
     * @return void
     */
    public function setLimitEffectivelyLimitsTheNumberOfItemsYieldedByTheProvidedIterator(): void
    {
        $assetProxies = [
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class)
        ];
        $assetProxyListIterator = AssetProxyListIterator::of(...$assetProxies);

        $assetProxyListIterator->setLimit(5);

        $items = iterator_to_array($assetProxyListIterator);

        $this->assertCount(5, $items);
        $this->assertSame($assetProxies[0], $items[0]);
        $this->assertSame($assetProxies[1], $items[1]);
        $this->assertSame($assetProxies[2], $items[2]);
        $this->assertSame($assetProxies[3], $items[3]);
        $this->assertSame($assetProxies[4], $items[4]);
    }

    /**
     * @test
     * @return void
     */
    public function setLimitMyGoBeyondTheTotalNumberOfItemsInWhichCaseTheProvidedIteratorWillYieldAllItems(): void
    {
        $assetProxies = [
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class)
        ];
        $assetProxyListIterator = AssetProxyListIterator::of(...$assetProxies);

        $assetProxyListIterator->setLimit(20);

        $items = iterator_to_array($assetProxyListIterator);

        $this->assertCount(10, $items);
        $this->assertSame($assetProxies[0], $items[0]);
        $this->assertSame($assetProxies[1], $items[1]);
        $this->assertSame($assetProxies[2], $items[2]);
        $this->assertSame($assetProxies[3], $items[3]);
        $this->assertSame($assetProxies[4], $items[4]);
        $this->assertSame($assetProxies[5], $items[5]);
        $this->assertSame($assetProxies[6], $items[6]);
        $this->assertSame($assetProxies[7], $items[7]);
        $this->assertSame($assetProxies[8], $items[8]);
        $this->assertSame($assetProxies[9], $items[9]);
    }

    /**
     * @test
     * @return void
     */
    public function setOffsetAndSetLimitEffectivelySliceTheItemsYieldedByTheProvidedIterator(): void
    {
        $assetProxies = [
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class)
        ];
        $assetProxyListIterator = AssetProxyListIterator::of(...$assetProxies);

        $assetProxyListIterator->setOffset(6);
        $assetProxyListIterator->setLimit(3);

        $items = iterator_to_array($assetProxyListIterator);

        $this->assertCount(3, $items);
        $this->assertSame($assetProxies[6], $items[0]);
        $this->assertSame($assetProxies[7], $items[1]);
        $this->assertSame($assetProxies[8], $items[2]);
    }
}
