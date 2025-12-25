import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "../shared/schema.graphql",
  generates: {
    "./src/types.ts": {
      plugins: ["typescript"],
    },
    "../server/gql.ts": {
      plugins: ["typescript", "typescript-resolvers"],
    },
  },
};

export default config;
