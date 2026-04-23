import { ThemeProvider } from 'styled-components';
import { AuthProvider } from '../src/context/AuthContext';
import { GlobalStyles } from '../src/styles/globalStyles';
import { theme } from '../src/styles/theme';

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <GlobalStyles />
        <Component {...pageProps} />
      </AuthProvider>
    </ThemeProvider>
  );
}
