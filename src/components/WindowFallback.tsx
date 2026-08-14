import React from "react";
import styled, { css } from "styled-components";

// Minimal placeholder shown while a lazy window chunk loads. Matches the
// window chrome geometry (position/size/z-index) so opening a window looks
// seamless instead of flashing a blank screen.

type Props = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  maximized?: boolean;
  zIndex?: number;
};

const Fallback = styled.div<Props>`
  position: fixed;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.65);
  border-radius: 12px;
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);

  ${({ maximized }) =>
    maximized &&
    css`
      inset: 0;
      margin: 0;
      max-width: none;
      width: 100vw;
      height: 100vh;
      height: 100dvh;
      border-radius: 0;
    `}

  ${({ maximized, x, y, width, height }) =>
    !maximized &&
    css`
      left: ${x ?? 0}px;
      top: ${y ?? 0}px;
      width: ${width ?? 960}px;
      height: ${height ?? 640}px;
    `}
  z-index: ${({ zIndex }) => zIndex ?? 300};
`;

const WindowFallback: React.FC<Props> = props => (
  <Fallback aria-hidden="true" {...props} />
);

export default WindowFallback;
