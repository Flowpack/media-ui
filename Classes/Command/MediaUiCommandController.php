<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\Command;

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
use Flowpack\Media\Ui\GraphQL\Middleware\GraphQLMiddleware;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Cli\CommandController;
use Neos\Flow\Package\PackageManager;
use Neos\Utility\Files;
use Wwwision\TypesGraphQL\GraphQLGenerator;

#[Flow\Scope('singleton')]
class MediaUiCommandController extends CommandController
{

    #[Flow\Inject]
    protected PackageManager $packageManager;

    /**
     * @var GraphQLMiddleware
     */
    #[Flow\Inject('Flowpack.Media.Ui:GraphQLMiddleware')]
    protected $mediaApiMiddleware;

    public function createSchemaCommand(): void
    {
        $this->outputLine('Creating GraphQL schema...');

        $generator = new GraphQLGenerator();
        $schema = $generator->generate(
            MediaApi::class,
            $this->mediaApiMiddleware->getCustomResolvers(),
        )->render();

        $path = Files::concatenatePaths([
            $this->packageManager->getPackage('Flowpack.Media.Ui')->getPackagePath(),
            'Resources',
            'Private',
            'GraphQL',
            'schema.root.graphql',
        ]);

        file_put_contents($path, $schema);

        $this->outputFormatted('GraphQL schema created at: %s', [$path]);
    }
}
