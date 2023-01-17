import { Lexend_Deca } from '@next/font/google';
import clsx from 'clsx';
import { Content } from 'components/layout';
import './globals.css';

const lexendDeca = Lexend_Deca({ variable: '--font-lexend-deca', subsets: ['latin'] });
const fonts = [lexendDeca];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className={clsx(fonts.map((font) => font.variable))}>
      <head />
      <body className='bg-bg font transition-colors'>
        <div className='flex justify-center'>
          <Content>{children}</Content>
        </div>
      </body>
    </html>
  );
}
