import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { CssVarsProvider, extendTheme } from "@mui/joy";
import config from "../config.json";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const client = new ApolloClient({
  link: new HttpLink({
    uri: config["gqlApi"],
  }),
  cache: new InMemoryCache(),
});

const theme = extendTheme({
  // colorSchemeSelector: "media",
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <title>6 Degrees of Max Verstappen</title>
    <ApolloProvider client={client}>
      <CssVarsProvider theme={theme}>
        <App />
      </CssVarsProvider>
    </ApolloProvider>
  </StrictMode>
);
