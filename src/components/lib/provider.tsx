"use client";
import { config, queryClient } from "../../app/config";
import { AlchemyClientState } from "@account-kit/core";
import { AlchemyAccountProvider } from "@account-kit/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import React from "react";
import {
  Web3ReactHooks,
  Web3ReactProvider,
  initializeConnector,
} from "@web3-react/core";
import { MetaMask } from "@web3-react/metamask";
const [metaMask, hooks] = initializeConnector<MetaMask>(
  (actions) =>
    new MetaMask({
      actions: {
        startActivation: actions.startActivation,
        update: actions.update,
        resetState: actions.resetState,
      },
    })
);
const connectors: [MetaMask, Web3ReactHooks][] = [[metaMask, hooks]];

export const Providers = (
  props: PropsWithChildren<{ initialState?: AlchemyClientState }>
) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AlchemyAccountProvider
        config={config}
        queryClient={queryClient}
        initialState={props.initialState}
      >
        <Web3ReactProvider connectors={connectors}>
          {props.children}
        </Web3ReactProvider>
      </AlchemyAccountProvider>
    </QueryClientProvider>
  );
};
