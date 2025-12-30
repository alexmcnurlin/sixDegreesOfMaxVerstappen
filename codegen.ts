import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "shared/schema.graphql",
  documents: "client/src/**/*.tsx",
  generates: {
    "client/src/gql/": {
      preset: "client",
    },
    "server/src/gql.ts": {
      plugins: ["typescript", "typescript-resolvers"],
    },
  },
};

export default config;
