import { gql } from '@apollo/client';

export const typeDefs = gql`
    extend type Query {
        includeUsage: Boolean!
    }

    extend type Mutation {
        includeUsage: Boolean!
    }
`;
