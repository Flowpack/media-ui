<?php
declare(strict_types=1);

namespace Flowpack\Media\Ui\Service;

/*
 * This file is part of the Flowpack.Media.Ui package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use Neos\Flow\Annotations as Flow;
use Neos\Utility\Exception\FilesException;
use Neos\Utility\Files;

class ConfigurationService
{
    /**
     * @Flow\InjectConfiguration(package="Flowpack.Media.Ui")
     * @var array
     */
    protected $configuration;

    /**
     * Returns the maximum size of files that can be uploaded
     *
     * @return int
     */
    public function getMaximumUploadFileSize(): int
    {
        try {
            return (int)Files::sizeStringToBytes($this->configuration['maximumUploadFileSize'] ?? '100MB');
        } catch (FilesException $e) {
            return 0;
        }
    }

    /**
     * Returns the maximum of server capable upload size and configured maximum chunk size
     *
     * @return int
     */
    public function getMaximumUploadChunkSize(): int
    {
        try {
            return min(
                (int)(Files::sizeStringToBytes($this->configuration['maximumUploadChunkSize']) ?? '5MB'),
                (int)Files::sizeStringToBytes(ini_get('post_max_size')),
                (int)Files::sizeStringToBytes(ini_get('upload_max_filesize'))
            );
        } catch (FilesException $e) {
            return 5 * 1024 * 1024;
        }
    }

    /**
     * Returns the maximum number of files that can be uploaded
     *
     * @return int
     */
    public function getMaximumUploadFileCount(): int
    {
        return (int)($this->configuration['maximumUploadFileCount'] ?? 10);
    }
}
