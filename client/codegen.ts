import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "../shared/schema.graphql",
  documents: "src/**/*.tsx",
  generates: {
    "./src/gql/": {
      preset: "client",
    },
    "../server/gql.ts": {
      plugins: ["typescript", "typescript-resolvers"],
    },
  },
};

export default config;
