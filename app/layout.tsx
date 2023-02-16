import {
  Fira_Code,
  Inconsolata,
  JetBrains_Mono,
  Lato,
  Lexend_Deca,
  Montserrat,
  Nunito,
  Oxygen,
  Roboto,
  Roboto_Mono,
  Source_Code_Pro,
  Ubuntu,
  Ubuntu_Mono,
} from '@next/font/google';
import clsx from 'clsx';
import { Content } from 'components/layout';
import './globals.css';

const firaCode = Fira_Code({ variable: '--font-fira-code', subsets: ['latin'] });
const inconsolata = Inconsolata({ variable: '--font-inconsolata', subsets: ['latin'] });
const jetBrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
});
const lato = Lato({ variable: '--font-lato', subsets: ['latin'], weight: '400' });
const lexendDeca = Lexend_Deca({
  variable: '--font-lexend-deca',
  subsets: ['latin'],
  weight: '400',
});
const montserrat = Montserrat({ variable: '--font-montserrat', subsets: ['latin'] });
const nunito = Nunito({ variable: '--font-nunito', subsets: ['latin'] });
const oxygen = Oxygen({ variable: '--font-oxygen', subsets: ['latin'], weight: '400' });
const roboto = Roboto({ variable: '--font-roboto', subsets: ['latin'], weight: '400' });
const robotoMono = Roboto_Mono({ variable: '--font-roboto-mono', subsets: ['latin'] });
const sourceCodePro = Source_Code_Pro({
  variable: '--font-source-code-pro',
  subsets: ['latin'],
});
const ubuntu = Ubuntu({ variable: '--font-ubuntu', subsets: ['latin'], weight: '400' });
const ubuntuMono = Ubuntu_Mono({
  variable: '--font-ubuntu-mono',
  subsets: ['latin'],
  weight: '400',
});
const fonts = [
  firaCode,
  inconsolata,
  jetBrainsMono,
  lato,
  lexendDeca,
  montserrat,
  nunito,
  oxygen,
  roboto,
  robotoMono,
  sourceCodePro,
  ubuntu,
  ubuntuMono,
];

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
