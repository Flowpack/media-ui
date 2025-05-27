type IptcPropertyType = 'IptcProperty';

interface IptcProperty extends GraphQlEntity {
    __typename: IptcPropertyType;
    propertyName: string;
    value: string;
}
