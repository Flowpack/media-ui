import GraphQlEntity from './GraphQLEntity';

type IptcPropertyType = 'IptcProperty';

export default interface IptcProperty extends GraphQlEntity {
    __typename: IptcPropertyType;
    propertyName: string;
    value: string;
}
