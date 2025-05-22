<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\Tests\Functional\GraphQL;

/*
 * This file is part of the Flowpack.Media.Ui package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use Flowpack\Media\Ui\GraphQL\MediaApi;
use Flowpack\Media\Ui\GraphQL\Types;
use Flowpack\Media\Ui\Tests\Functional\AbstractMediaTestCase;
use Neos\Flow\Persistence\Doctrine\PersistenceManager;

use Neos\Utility\Files;

use function Wwwision\Types\instantiate;

/**
 * Testcase for the Media.Ui API
 */
class AssetApiTest extends AbstractMediaTestCase
{
    /**
     * @var boolean
     */
    protected static $testablePersistenceEnabled = true;

    public function setUp(): void
    {
        parent::setUp();
        if (!$this->persistenceManager instanceof PersistenceManager) {
            static::markTestSkipped('Doctrine persistence is not enabled');
        }

        $this->mediaApi = $this->objectManager->get(MediaApi::class);
    }

    public function testUploadFile(): void
    {
        $fileContent = Files::getFileContents(__DIR__ . '/Fixtures/norman.svg');
        $file = instantiate(Types\UploadedFile::class, [
            'streamOrFile' => $fileContent,
            'size' => strlen($fileContent),
            'clientMediaType' => 'image/svg+xml',
            'clientFilename' => 'test.svg',
            'errorStatus' => 0,
        ]);

        $result = $this->mediaApi->uploadFiles(
            Types\UploadedFiles::fromArray([$file])
        );

        $this->assertCount(1, $result->values);
        $uploadedFile = $result->getIterator()->current();
        $this->assertInstanceOf(Types\FileUploadResult::class, $uploadedFile);
        $this->assertTrue($uploadedFile->success);
        $this->assertEquals('test.svg', $uploadedFile->filename->value);
    }
}
