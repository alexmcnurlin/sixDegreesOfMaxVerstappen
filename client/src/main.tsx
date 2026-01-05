import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { CssBaseline, CssVarsProvider } from "@mui/joy";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import config from "../config.json";
import App from "./App.tsx";

const client = new ApolloClient({
  link: new HttpLink({
    uri: config["gqlApi"],
  }),
  cache: new InMemoryCache(),
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <title>6 Degrees of Max Verstappen</title>
    <ApolloProvider client={client}>
      <CssVarsProvider defaultMode="system" disableNestedContext>
        <CssBaseline />
        <App />
      </CssVarsProvider>
    </ApolloProvider>
  </StrictMode>
);
