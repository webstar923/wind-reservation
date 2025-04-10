import { NextIntlClientProvider } from 'next-intl';
import { ToastContainer } from 'react-toastify';
import ClientQueryClientProvider from '@shared/components/ClientQueryClientProvider';
import TokenRefresh from '@shared/components/TokenRefresh';
import './globals.css';
import 'react-toastify/dist/ReactToastify.css';

export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <head>
        <title>weing</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/assets/images/auth/logo.png" type="image/png" />
        {/* Corrected crossorigin to crossOrigin */}
        <link
          rel="preload"
          href="/assets/fonts/Onest-Bold.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <NextIntlClientProvider>
          <ClientQueryClientProvider>
            <TokenRefresh />
            {children}
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              closeOnClick
              pauseOnHover
              className="text-white"
              draggable
            />
          </ClientQueryClientProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
