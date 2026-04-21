type TagType = 'Tag';

type TagId = string;
type TagLabel = string;

interface Tag extends GraphQlEntity {
    __typename: TagType;
    id: TagId;
    assetSourceId: AssetSourceId;
    label: TagLabel;
}
