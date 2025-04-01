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
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Cli\CommandController;
use Wwwision\TypesGraphQL\GraphQLGenerator;

#[Flow\Scope('singleton')]
class MediaUiCommandController extends CommandController
{
    public function createSchemaCommand(): void
    {
        $this->outputLine('Creating GraphQL schema...');

        $generator = new GraphQLGenerator();
        $schema = $generator->generate(MediaApi::class)->render();

        $this->output($schema);
    }
}
