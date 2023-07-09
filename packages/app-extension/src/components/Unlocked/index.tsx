import { ApolloProvider, SuspenseCache } from "@apollo/client";
import { createApolloClient } from "@coral-xyz/common";
import { Loading } from "@coral-xyz/react-common";
import { useAuthenticatedUser, useBootstrapFast } from "@coral-xyz/recoil";

import { Spotlight } from "../../spotlight/Spotlight";
import { Router } from "../common/Layout/Router";
import { WithTabBarBottom } from "../common/Layout/Tab";
import { WalletDrawerProvider } from "../common/WalletList";

import { ApproveTransactionRequest } from "./ApproveTransactionRequest";
import { PrimaryPubkeySelector } from "./PrimaryPubkeySelector";
import { WithVersion } from "./WithVersion";

const suspenseCache = new SuspenseCache();

//
// The main nav persistent stack.
//
export function Unlocked() {
  const apolloClient = createApolloClient(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiIxMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAiLCJleHAiOjE2MzI0NjQ0NzAsImlhdCI6MTYzMjQ2NDQ3MCwiaXNzIjoiY29ybWFuZCIsInN1YiI6ImNvcmFtYW5kIiwidHlwZSI6ImF1dG"
  );

  return (
    <ApolloProvider client={apolloClient} suspenseCache={suspenseCache}>
      <WithVersion>
        <WalletDrawerProvider>
          <Spotlight />
          <WithTabBarBottom>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <Router />
              <ApproveTransactionRequest />
              <PrimaryPubkeySelector />
            </div>
          </WithTabBarBottom>
        </WalletDrawerProvider>
      </WithVersion>
    </ApolloProvider>
  );
}
