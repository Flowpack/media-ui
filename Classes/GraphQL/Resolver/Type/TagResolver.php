<?php
declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Resolver\Type;

use Neos\Media\Domain\Model\Tag;
use t3n\GraphQL\ResolverInterface;

class TagResolver implements ResolverInterface
{
    /**
     * @param Tag $tag
     * @return string
     */
    public function label(Tag $tag): string
    {
        return $tag->getLabel();
    }
}
