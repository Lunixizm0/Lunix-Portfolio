import { createGlobalStyle, DefaultTheme } from "styled-components";
import { normalize } from "styled-normalize";

const GlobalStyle = createGlobalStyle<{ theme: DefaultTheme }>`
  ${normalize}
  
  *, ::before, ::after {
    border-width: 0;
    border-style: solid;
    border-color: theme('borderColor.DEFAULT', currentColor);
  }

  blockquote, dl, dd, h1, h2, h3,
  h4, h5, h6, hr, figure, p, pre {
    margin: 0;
  }

  h1, h2, h3, h4, h5, h6 {
    font-size: inherit;
    font-weight: inherit;
  }

  img, svg, video, canvas, audio, 
  iframe, embed, object {
    display: block;
  }

  html {
    ${({ theme }) =>
      theme.backgroundImage &&
      `
      background-color: #0c0c0c;
      background-image: url(${theme.backgroundImage});
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      background-attachment: fixed;
    `}
  }

  body {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 500;
    background-color: ${({ theme }) => (theme.backgroundImage ? "transparent" : theme.colors?.body)};
    color: ${({ theme }) => theme.colors?.text[100]};
  }

  /* background-attachment: fixed is unreliable/glitchy on mobile browsers
     (notably iOS Safari), so fall back to scroll on small screens.
     Also swap the desktop wallpaper for a colorful gradient on mobile. */
  @media (max-width: 768px) {
    html {
      background-attachment: scroll;
      background-color: #050508;
      background-image:
        radial-gradient(at 15% 5%, rgba(0, 212, 255, 0.12) 0, transparent 55%),
        radial-gradient(at 85% 15%, rgba(114, 9, 183, 0.2) 0, transparent 55%),
        radial-gradient(at 70% 95%, rgba(247, 37, 133, 0.16) 0, transparent 55%),
        linear-gradient(160deg, #050508 0%, #0a0a14 35%, #14061f 70%, #1c0818 100%);
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    }
  }

  /* iOS Safari: background-attachment on the root element is buggy and can fail
     to paint (white screen). Fall back to scroll on Apple touch devices. */
  @supports (-webkit-touch-callout: none) {
    html {
      background-attachment: scroll;
    }
  }

  /* ===== Custom Scroll Bar ===== */
  /* width */
  ::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }
  /* Track */
  ::-webkit-scrollbar-track {
    background: rgba(0,0,0,0.25);
  }
  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors?.scrollHandle};
    border-radius: 6px;
  }
  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors?.scrollHandleHover};
  }

  input[type=text] {
    background-color: transparent !important;
    color: ${({ theme }) => theme.colors?.text[100]};
    caret-color: ${({ theme }) => theme.colors?.primary};
    border: none;
    appearance: none;
    -webkit-appearance: none;
    box-shadow: none !important;
  }

  /* Remove browser autofill background and keep text color consistent */
  input[type=text]:-webkit-autofill,
  input[type=text]:-webkit-autofill:hover,
  input[type=text]:-webkit-autofill:focus {
    -webkit-text-fill-color: ${({ theme }) => theme.colors?.text[100]};
    box-shadow: 0 0 0px 1000px transparent inset;
    -webkit-box-shadow: 0 0 0px 1000px transparent inset;
    transition: background-color 9999s ease-in-out 0s;
  }

  /* Optional: subtle selection color that doesn't create a solid block */
  ::selection {
    background: rgba(255, 255, 255, 0.15);
  }
  input[type=text]:focus-visible {
    outline: none;
  }

  .sr-only {
    position: absolute;
    left: -10000px;
    top: auto;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }
`;

export default GlobalStyle;
