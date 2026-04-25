import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px) rotate(0deg);
    }
    33% {
      transform: translateY(-20px) rotate(1deg);
    }
    66% {
      transform: translateY(-10px) rotate(-1deg);
    }
  }

  @keyframes shimmer {
    0% {
      opacity: 0.2;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 0.2;
    }
  }

  @keyframes gradientShift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
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
    background-color: #0b1325;
    background-image: 
      /* Gradiente base com animação */
      linear-gradient(-45deg, #0b1325 0%, #1A2338 25%, #101a33 50%, #1A2338 75%, #0b1325 100%),
      /* Efeito blob 1 - topo direito */
      radial-gradient(circle at 85% 10%, rgba(240, 208, 100, 0.25) 0%, transparent 35%),
      /* Efeito blob 2 - centro esquerda */
      radial-gradient(circle at 15% 60%, rgba(26, 35, 56, 0.8) 0%, transparent 40%),
      /* Efeito blob 3 - rodapé direita */
      radial-gradient(circle at 90% 85%, rgba(240, 208, 100, 0.15) 0%, transparent 30%),
      /* Efeito glow sutil */
      radial-gradient(ellipse at 50% 50%, rgba(240, 208, 100, 0.05) 0%, transparent 50%);
    
    background-size: 400% 400%, 100% 100%, 100% 100%, 100% 100%, 100% 100%;
    background-attachment: fixed;
    background-position: center;
    
    position: relative;
    color: #F8F8F8;
    overflow-x: hidden;
  }

  /* Pseudo-elemento para animar o gradiente */
  body::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 50%, rgba(240, 208, 100, 0.08) 0%, transparent 20%),
      radial-gradient(circle at 80% 30%, rgba(240, 208, 100, 0.06) 0%, transparent 25%);
    pointer-events: none;
    animation: shimmer 4s ease-in-out infinite;
    z-index: -1;
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