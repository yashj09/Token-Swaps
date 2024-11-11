"use client";
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

const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <Web3ReactProvider connectors={connectors}>
        <main>{children}</main>
      </Web3ReactProvider>
    </div>
  );
};

export default Provider;
