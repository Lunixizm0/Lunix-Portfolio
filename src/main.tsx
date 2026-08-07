import React from "react";
import ReactDOM from "react-dom/client";
import { StyleSheetManager } from "styled-components";
import App from "./App";

const CUSTOM_PROPS = new Set([
  "mobileExpanded",
  "active",
  "maximized",
  "isTransforming",
  "zIndex",
  "variant",
  "pos",
  "delay",
  "renk",
  "ust",
  "bos",
  "calisma",
  "tatil",
  "bugun",
  "secili",
  "dolu",
  "marginY",
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <StyleSheetManager shouldForwardProp={(prop) => !CUSTOM_PROPS.has(prop)}>
      <App />
    </StyleSheetManager>
  </React.StrictMode>
);
