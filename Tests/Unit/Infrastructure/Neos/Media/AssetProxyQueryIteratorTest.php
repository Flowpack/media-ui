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

use Flowpack\Media\Ui\Infrastructure\Neos\Media\AssetProxyQueryIterator;
use Flowpack\Media\Ui\Tests\Helper\ApplyArrayIteratorMixinToStubTrait;
use Neos\Media\Domain\Model\AssetSource\AssetProxy\AssetProxyInterface;
use Neos\Media\Domain\Model\AssetSource\AssetProxyQueryInterface;
use Neos\Media\Domain\Model\AssetSource\AssetProxyQueryResultInterface;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\MockObject\Stub;
use PHPUnit\Framework\TestCase;

final class AssetProxyQueryIteratorTest extends TestCase
{
    use ApplyArrayIteratorMixinToStubTrait;

    /**
     * @param AssetProxyInterface[] $assetProxies
     * @return AssetProxyQueryInterface
     */
    private function getAssetProxyQueryResultingInAGivenSetOfItems(array $assetProxies): AssetProxyQueryInterface
    {
        /** @var Stub&AssetProxyQueryInterface $assetProxyQueryStub */
        $assetProxyQueryStub = $this->createStub(AssetProxyQueryInterface::class);
        /** @var Stub&AssetProxyQueryResultInterface $assetProxyQueryResultStub */
        $assetProxyQueryResultStub = $this->createStub(AssetProxyQueryResultInterface::class);

        $assetProxyQueryStub
            ->method('execute')
            ->willReturn($assetProxyQueryResultStub);
        $assetProxyQueryStub
            ->method('count')
            ->willReturn(count($assetProxies));

        $assetProxyQueryResultStub
            ->method('getQuery')
            ->willReturn($assetProxyQueryStub);
        $assetProxyQueryResultStub
            ->method('getFirst')
            ->willReturn($assetProxies[0] ?? null);
        $assetProxyQueryResultStub
            ->method('toArray')
            ->willReturn($assetProxies);
        $this->applyArrayIteratorMixinToStub(
            $assetProxyQueryResultStub,
            new \ArrayIterator($assetProxies)
        );

        return $assetProxyQueryStub;
    }

    /**
     * @test
     * @return void
     */
    public function canBeCreatedFromAssetProxyQuery(): void
    {
        $this->assertInstanceOf(
            AssetProxyQueryIterator::class,
            AssetProxyQueryIterator::from(
                $this->getAssetProxyQueryResultingInAGivenSetOfItems([])
            )
        );
    }

    /**
     * @test
     * @return void
     */
    public function providesCountFromAssetProxyQuery(): void
    {
        $this->assertCount(
            0,
            AssetProxyQueryIterator::from(
                $this->getAssetProxyQueryResultingInAGivenSetOfItems([])
            )
        );
        $this->assertCount(
            1,
            AssetProxyQueryIterator::from(
                $this->getAssetProxyQueryResultingInAGivenSetOfItems([
                    $this->createMock(AssetProxyInterface::class),
                ])
            )
        );
        $this->assertCount(
            10,
            AssetProxyQueryIterator::from(
                $this->getAssetProxyQueryResultingInAGivenSetOfItems([
                    $this->createMock(AssetProxyInterface::class),
                    $this->createMock(AssetProxyInterface::class),
                    $this->createMock(AssetProxyInterface::class),
                    $this->createMock(AssetProxyInterface::class),
                    $this->createMock(AssetProxyInterface::class),
                    $this->createMock(AssetProxyInterface::class),
                    $this->createMock(AssetProxyInterface::class),
                    $this->createMock(AssetProxyInterface::class),
                    $this->createMock(AssetProxyInterface::class),
                    $this->createMock(AssetProxyInterface::class),
                ])
            )
        );
    }

    /**
     * @test
     * @return void
     */
    public function providesEmptyIteratorIfQueryResultsInZeroItems(): void
    {
        $assetProxyQuery = $this->getAssetProxyQueryResultingInAGivenSetOfItems([]);
        $assetProxyQueryIterator = AssetProxyQueryIterator::from($assetProxyQuery);

        $items = iterator_to_array($assetProxyQueryIterator);

        $this->assertEmpty($items);
    }

    /**
     * @test
     * @return void
     */
    public function providesIteratorWithExactlyOneItemIfQueryResultsInOneItem(): void
    {
        $assetProxies = [$this->createMock(AssetProxyInterface::class)];
        $assetProxyQuery = $this->getAssetProxyQueryResultingInAGivenSetOfItems($assetProxies);
        $assetProxyQueryIterator = AssetProxyQueryIterator::from($assetProxyQuery);

        $items = iterator_to_array($assetProxyQueryIterator);

        $this->assertCount(1, $items);
        $this->assertSame($assetProxies[0], $items[0]);
    }

    /**
     * @test
     * @return void
     */
    public function providesIteratorWithExactlyTwoItemsIfQueryResultsInTwoItems(): void
    {
        $assetProxies = [
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class)
        ];
        $assetProxyQuery = $this->getAssetProxyQueryResultingInAGivenSetOfItems($assetProxies);
        $assetProxyQueryIterator = AssetProxyQueryIterator::from($assetProxyQuery);

        $items = iterator_to_array($assetProxyQueryIterator);

        $this->assertCount(2, $items);
        $this->assertSame($assetProxies[0], $items[0]);
        $this->assertSame($assetProxies[1], $items[1]);
    }

    /**
     * @test
     * @return void
     */
    public function providesIteratorWithExactlyThreeItemsIfQueryResultsInThreeItems(): void
    {
        $assetProxies = [
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
        ];
        $assetProxyQuery = $this->getAssetProxyQueryResultingInAGivenSetOfItems($assetProxies);
        $assetProxyQueryIterator = AssetProxyQueryIterator::from($assetProxyQuery);

        $items = iterator_to_array($assetProxyQueryIterator);

        $this->assertCount(3, $items);
        $this->assertSame($assetProxies[0], $items[0]);
        $this->assertSame($assetProxies[1], $items[1]);
        $this->assertSame($assetProxies[2], $items[2]);
    }

    /**
     * @test
     * @return void
     */
    public function setOffsetDelegatesToAssetProxyQuery(): void
    {
        /** @var MockObject&AssetProxyQueryInterface $assetProxyQuery */
        $assetProxyQuery = $this->getAssetProxyQueryResultingInAGivenSetOfItems([
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
        ]);

        $assetProxyQuery
            ->expects($this->once())
            ->method('setOffset')
            ->with(4);

        $assetProxyQueryIterator = AssetProxyQueryIterator::from($assetProxyQuery);
        $assetProxyQueryIterator->setOffset(4);
    }

    /**
     * @test
     * @return void
     */
    public function setOffsetFallsBackToZeroIfOffsetIsOutOfBounds(): void
    {
        /** @var MockObject&AssetProxyQueryInterface $assetProxyQuery */
        $assetProxyQuery = $this->getAssetProxyQueryResultingInAGivenSetOfItems([
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
            $this->createMock(AssetProxyInterface::class),
        ]);

        $assetProxyQuery
            ->expects($this->once())
            ->method('setOffset')
            ->with(0);

        $assetProxyQueryIterator = AssetProxyQueryIterator::from($assetProxyQuery);
        $assetProxyQueryIterator->setOffset(5);
    }

    /**
     * @test
     * @return void
     */
    public function setLimitDelegatesToAssetProxyQuery(): void
    {
        /** @var MockObject&AssetProxyQueryInterface $assetProxyQuery */
        $assetProxyQuery = $this->createMock(AssetProxyQueryInterface::class);

        $assetProxyQuery
            ->expects($this->once())
            ->method('setLimit')
            ->with(5);

        $assetProxyQueryIterator = AssetProxyQueryIterator::from($assetProxyQuery);
        $assetProxyQueryIterator->setLimit(5);
    }
}
