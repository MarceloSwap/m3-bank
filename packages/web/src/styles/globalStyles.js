import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  html,
  body,
  #__next {
    margin: 0;
    min-height: 100vh;
    padding: 0;
  }

  body {
    font-family: 'Trebuchet MS', 'Segoe UI', sans-serif;
    /* Fundo escuro premium usando as cores da logo */
    background:
      radial-gradient(circle at top right, rgba(240, 208, 100, 0.15), transparent 30%),
      radial-gradient(circle at bottom left, rgba(26, 35, 56, 0.8), transparent 40%),
      linear-gradient(145deg, #0b1325 0%, #1A2338 50%, #101a33 100%);
    background-attachment: fixed;
    color: ${({ theme }) => theme.colors.ink};
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button,
  input {
    font: inherit;
  }

  img,
  svg {
    display: block;
  }
`;