type IptcPropertyType = 'IptcProperty';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface IptcProperty extends GraphQlEntity {
    __typename: IptcPropertyType;
    propertyName: string;
    value: string;
}
