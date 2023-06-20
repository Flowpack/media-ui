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

use PHPUnit\Framework\MockObject\Stub;

trait ApplyArrayIteratorMixinToStubTrait
{
    protected function applyArrayIteratorMixinToStub(Stub $stub, \ArrayIterator $arrayIterator): void
    {
        if (!($stub instanceof \Iterator)) {
            throw new \Exception('Stub must implement \\Iterator!');
        }

        $stub
            ->method('rewind')
            ->willReturnCallback(function () use ($arrayIterator): void {
                $arrayIterator->rewind();
            });
        $stub
            ->method('current')
            ->willReturnCallback(function () use ($arrayIterator) {
                return $arrayIterator->current();
            });
        $stub
            ->method('key')
            ->willReturnCallback(function () use ($arrayIterator) {
                return $arrayIterator->key();
            });
        $stub
            ->method('next')
            ->willReturnCallback(function () use ($arrayIterator): void {
                $arrayIterator->next();
            });
        $stub
            ->method('valid')
            ->willReturnCallback(function () use ($arrayIterator): bool {
                return $arrayIterator->valid();
            });
    }
}
