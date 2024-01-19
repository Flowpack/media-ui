<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\Controller;

/*
 * This file is part of the Flowpack.Media.Ui package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use GraphQL\Error\SyntaxError;
use GraphQL\GraphQL;
use GraphQL\Language\AST\TypeDefinitionNode;
use GraphQL\Language\Parser;
use GraphQL\Type\Definition\ResolveInfo;
use GraphQL\Utils\BuildSchema;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Mvc\View\JsonView;
use Neos\Fusion\View\FusionView;
use Neos\Media\Domain\Model\Tag;
use Neos\Media\Domain\Repository\TagRepository;
use Neos\Neos\Controller\Module\AbstractModuleController;

/**
 * @Flow\Scope("singleton")
 */
class MediaController extends AbstractModuleController
{
    /**
     * @var FusionView
     */
    protected $view;

    /**
     * @var string
     */
    protected $defaultViewObjectName = FusionView::class;

    /**
     * @var array
     */
    protected $viewFormatToObjectNameMap = [
        'html' => FusionView::class,
        'json' => JsonView::class,
    ];

    /**
     * @Flow\InjectConfiguration(path="graphql.schema")
     * @var string
     */
    protected $schemaPath;

    /**
     * @Flow\Inject
     * @var TagRepository
     */
    protected $tagRepository;

    /**
     * Renders the media ui application
     */
    public function indexAction(): void
    {
    }

    /**
     * @Flow\SkipCsrfProtection
     * @throws SyntaxError|\JsonException
     */
    public function queryAction(): void {
        $input = $this->request->getHttpRequest()->getParsedBody();
        $query = $input['query'] ?? null;
        $variableValues = $input['variables'] ?? [];

        // TODO: Make sure the file exists
        $contents = file_get_contents($this->schemaPath);

        // TODO: Add resolvers
        $typeConfigDecorator = function (array $typeConfig, TypeDefinitionNode $typeDefinitionNode): array {
            $name = $typeConfig['name'];
            switch ($name) {
                case 'Query':
                    $typeConfig['resolveField'] = function ($source, $args, $context, ResolveInfo $info) {
                        if ($info->fieldName === 'tags') {
                            return $this->tagRepository->findAll()->toArray();
//                            return array_map(static fn (Tag $tag) => [
//                                'id' => $tag->getLabel(),
//                                'label' => $tag->getLabel(),
//                            ], $this->tagRepository->findAll()->toArray());
                        }
                        if ($info->fieldName === 'tag') {
                            $tag = $this->tagRepository->findByIdentifier($args['id']);
                            return [
                                'id' => $tag->getLabel(),
                                'label' => $tag->getLabel(),
                            ];
                        }
                    };
                    break;
            }
            return $typeConfig;
        };

//        // TODO: Add error handling
//        // TODO: Add caching
        $schema = BuildSchema::build($contents, $typeConfigDecorator);

        $ast = Parser::parse($query);

        $this->view->assign('value', GraphQL::executeQuery($schema, $ast));
    }
}
