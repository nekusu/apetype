import { CommandLine } from 'components/command-line';
import { MainLayout } from 'components/layout';
import { GlobalProvider } from 'context/globalContext';
import { SettingsProvider } from 'context/settingsContext';
import { ThemeProvider } from 'context/themeContext';
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
} from 'next/font/google';
import { twJoin } from 'tailwind-merge';
import { STATIC_URL } from 'utils/monkeytype';
import { ThemeInfo } from 'utils/theme';
import { KeymapLayout } from 'utils/typingTest';
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

async function getLanguages() {
  const res = await fetch(`${STATIC_URL}/languages/_list.json`);
  const languages = (await res.json()) as string[];
  return languages.map((name) => name.replaceAll('_', ' '));
}
async function getLayouts() {
  const res = await fetch(`${STATIC_URL}/layouts/_list.json`);
  const layouts = (await res.json()) as Record<string, KeymapLayout>;
  return layouts;
}
async function getThemes() {
  const res = await fetch(`${STATIC_URL}/themes/_list.json`);
  const themes = (await res.json()) as ThemeInfo[];
  return themes
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(({ name, ...rest }) => ({ name: name.replaceAll('_', ' '), ...rest }));
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const languages = await getLanguages();
  const layouts = await getLayouts();
  const themes = await getThemes();

  return (
    <html lang='en' className={twJoin(fonts.map((font) => font.variable))}>
      <head />
      <body className='flex justify-center overflow-y-hidden bg-bg font transition-colors selection:bg-main selection:text-sub-alt'>
        <GlobalProvider languages={languages} layouts={layouts} themes={themes}>
          <SettingsProvider>
            <ThemeProvider previewDelay={250} themes={themes}>
              <MainLayout>{children}</MainLayout>
              <CommandLine />
            </ThemeProvider>
          </SettingsProvider>
        </GlobalProvider>
      </body>
    </html>
  );
}
