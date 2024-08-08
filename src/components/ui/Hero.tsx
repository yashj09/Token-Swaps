"use client";

import React from "react";
import dynamic from "next/dynamic";

const SwapSDK = dynamic(() => import("../Swap"), {
  ssr: false,
});

function Hero() {
  return (
    <div className="h-[100dvh] py-8 overflow-hidden ">
      <div className="w-full flex justify-center items-center">
        <SwapSDK />
      </div>
    </div>
  );
}

export default Hero;
