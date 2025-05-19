<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL;

/*
 * This file is part of the Flowpack.Media.Ui package.
 *
 * It is based on the wwwision/neos-graphql package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use BackedEnum;
use GraphQL\Language\AST\EnumTypeDefinitionNode;
use GraphQL\Language\AST\InputObjectTypeDefinitionNode;
use GraphQL\Language\AST\InterfaceTypeDefinitionNode;
use GraphQL\Language\AST\TypeDefinitionNode;
use GraphQL\Server\RequestError;
use GraphQL\Type\Definition\Argument;
use GraphQL\Type\Definition\FieldDefinition;
use GraphQL\Type\Definition\ListOfType;
use GraphQL\Type\Definition\NonNull;
use GraphQL\Type\Definition\ResolveInfo;
use InvalidArgumentException;
use UnitEnum;
use Wwwision\Types\Exception\CoerceException;
use Wwwision\Types\Parser;
use Wwwision\Types\Schema\EnumCaseSchema;
use Wwwision\Types\Schema\EnumSchema;
use Wwwision\Types\Schema\ShapeSchema;
use Wwwision\TypesGraphQL\Types\CustomResolvers;

use function Wwwision\Types\instantiate;

class Resolver
{
    private readonly CustomResolvers $customResolvers;

    /**
     * @param array<class-string> $typeNamespaces
     */
    public function __construct(
        private readonly object $api,
        private readonly array $typeNamespaces,
        CustomResolvers $customResolvers = null,
    ) {
        $this->customResolvers = $customResolvers ?? CustomResolvers::create();
    }

    /**
     * @param array<string, string|bool|int|array<string, mixed>|null> $args
     */
    public function __invoke(
        object|string|null $objectValue,
        array $args,
        mixed $contextValue,
        ResolveInfo $info
    ): mixed {
        $fieldName = $info->fieldName;
        $objectValue ??= $this->api;

        $customResolver = $this->customResolvers->get($info->parentType->name, $fieldName);
        if ($customResolver !== null) {
            $objectValue = ($customResolver->callback)($objectValue, ...
                $this->convertArguments($args, $info->fieldDefinition));
        } elseif (method_exists($objectValue, $fieldName)) {
            $objectValue = $objectValue->{$fieldName}(...$this->convertArguments($args, $info->fieldDefinition));
        } elseif (property_exists($objectValue, $fieldName)) {
            $objectValue = $objectValue->{$fieldName};
        } else {
            return null;
        }
        if ($objectValue instanceof BackedEnum) {
            $objectValue = $objectValue->value;
        }
        # TODO: Automatically convert primitive types to their respective PHP types without the need implement JsonSerializable
//        if (is_object($objectValue)) {
//            $objectValue = (new Normalizer())->normalize($objectValue->value);
//        }
        return $objectValue;
    }

    public function typeConfigDecorator(array $typeConfig, TypeDefinitionNode $typeDefinitionNode): array
    {
        if ($typeDefinitionNode instanceof InterfaceTypeDefinitionNode) {
            $typeConfig['resolveType'] = static fn(
                $value,
                $context,
                ResolveInfo $info
            ) => $info->schema->getType(substr($value::class, strrpos($value::class, '\\') + 1));
        }
        if ($typeDefinitionNode instanceof EnumTypeDefinitionNode) {
            $className = $this->resolveClassName($typeConfig['name']);
            $schema = Parser::getSchema($className);
            if ($schema instanceof EnumSchema) {
                $typeConfig['values'] = array_map(static fn(EnumCaseSchema $caseSchema
                ) => $caseSchema->instantiate(null), $schema->caseSchemas);
            }
        }
        if ($typeDefinitionNode instanceof InputObjectTypeDefinitionNode) {
            $className = $this->resolveClassName(rtrim($typeConfig['name'], 'Input'));
            $schema = Parser::getSchema($className);
            if ($schema instanceof ShapeSchema) {
                $typeConfig['parseValue'] = static function(array $values) use ($schema) {
                    return $schema->instantiate($values);
                };
            }
        }
        return $typeConfig;
    }

    /**
     * @param array<string, string|bool|int|array<string, mixed>|null> $arguments
     * @return array<string, string|bool|int|array<string, mixed>|object|null>
     * @throws RequestError
     */
    private function convertArguments(array $arguments, FieldDefinition $fieldDefinition): array
    {
        $result = [];
        foreach ($arguments as $name => $value) {
            $argumentDefinition = $fieldDefinition->getArg($name);
            $result[$name] = $this->convertArgument($value, $argumentDefinition);
        }
        return $result;
    }

    /**
     * @param string|bool|int|UnitEnum|array<string, mixed>|null $argument
     * @return string|bool|int|array<string, mixed>|object|null
     */
    private function convertArgument(
        string|bool|int|UnitEnum|array|null $argument,
        ?Argument $argumentDefinition
    ): string|bool|int|array|object|null {
        if ($argument === null) {
            return null;
        }
        $type = $argumentDefinition?->getType();
        if ($type instanceof NonNull) {
            $type = $type->getWrappedType();
        }
        if ($type instanceof ListOfType) {
            $type = $type->getWrappedType();
            if ($type instanceof NonNull) {
                $type = $type->getWrappedType();
            }
            $argumentType = $type->name . 's';
        } else {
            $argumentType = $type->name;
        }
        if (str_ends_with($argumentType, 'Input')) {
            $argumentType = substr($argumentType, 0, -5);
        } elseif (str_ends_with($argumentType, 'Inputs')) {
            $argumentType = substr($argumentType, 0, -6) . 's';
        }

        $className = $this->resolveClassName($argumentType);
        if ($className !== null) {
            try {
                return instantiate($className, $argument);
            } catch (CoerceException $e) {
                throw new RequestError($e->getMessage(), 1688654808, $e);
            } catch (InvalidArgumentException $e) {
                throw new RequestError(sprintf('Validation error for %s: %s', $argumentType, $e->getMessage()),
                    1688654808, $e);
            }
        }
        return $argument;
    }

    /**
     * @param string $argumentType
     * @return class-string|null
     */
    private function resolveClassName(string $argumentType): ?string
    {
        foreach ($this->typeNamespaces as $namespace) {
            $className = rtrim($namespace, '\\') . '\\' . $argumentType;
            if (class_exists($className)) {
                return $className;
            }
        }
        return null;
    }
}
