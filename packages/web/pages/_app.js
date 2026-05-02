import { AuthProvider } from '../src/context/AuthContext';
import '../src/styles/app.css';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
