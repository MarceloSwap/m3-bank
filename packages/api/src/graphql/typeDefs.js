module.exports = `#graphql
  type OwnerAddress {
    street: String!
    neighborhood: String!
    city: String!
    state: String!
    zipCode: String!
  }

  type Owner {
    name: String!
    email: String!
    cpf: String!
    address: OwnerAddress!
  }

  type Account {
    id: ID!
    number: String!
    digit: String!
    balance: Float!
    active: Boolean!
    owner: Owner!
  }

  type StatementEntry {
    id: ID!
    date: String!
    type: String!
    description: String!
    amount: Float!
    direction: String!
    relatedAccount: String
  }

  type StatementPage {
    page: Int!
    limit: Int!
    total: Int!
    periodDays: Int!
    balance: Float!
    entries: [StatementEntry!]!
  }

  type LoginUser {
    id: ID!
    name: String!
    email: String!
  }

  type LoginAccount {
    id: ID!
    number: String!
    digit: String!
    balance: Float!
  }

  type LoginResponse {
    token: String!
    expiresIn: Int!
    user: LoginUser!
    account: LoginAccount!
  }

  type RegisterResponse {
    message: String!
    accountNumber: String!
    accountDigit: String!
    initialBalance: Float!
  }

  type MutationResponse {
    message: String!
    balance: Float!
  }

  input AddressInput {
    street: String
    neighborhood: String
    city: String
    state: String
    zipCode: String
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String!
    confirmPassword: String!
    cpf: String!
    createWithBalance: Boolean!
    address: AddressInput
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input TransferInput {
    accountNumber: String!
    accountDigit: String!
    amount: Float!
    description: String!
    authorizationToken: String
  }

  input PixInput {
    amount: Float!
    description: String
  }

  type Query {
    me: Account!
    statement(page: Int, limit: Int, periodDays: Int): StatementPage!
  }

  type Mutation {
    login(input: LoginInput!): LoginResponse!
    register(input: RegisterInput!): RegisterResponse!
    transfer(input: TransferInput!): MutationResponse!
    simulatePix(input: PixInput!): MutationResponse!
  }
`;
