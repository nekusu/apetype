import type { NextFontWithVariable } from 'next/dist/compiled/@next/font';
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

export const firaCode = Fira_Code({
  variable: '--font',
  subsets: ['latin'],
  display: 'swap',
});
export const inconsolata = Inconsolata({
  variable: '--font',
  subsets: ['latin'],
  display: 'swap',
});
export const jetBrainsMono = JetBrains_Mono({
  variable: '--font',
  subsets: ['latin'],
  display: 'swap',
});
export const lato = Lato({
  variable: '--font',
  subsets: ['latin'],
  display: 'swap',
  weight: '400',
});
export const lexendDeca = Lexend_Deca({
  variable: '--font',
  subsets: ['latin'],
  display: 'swap',
  weight: '400',
});
export const montserrat = Montserrat({
  variable: '--font',
  subsets: ['latin'],
  display: 'swap',
});
export const nunito = Nunito({
  variable: '--font',
  subsets: ['latin'],
  display: 'swap',
});
export const oxygen = Oxygen({
  variable: '--font',
  subsets: ['latin'],
  display: 'swap',
  weight: '400',
});
export const roboto = Roboto({
  variable: '--font',
  subsets: ['latin'],
  display: 'swap',
  weight: '400',
});
export const robotoMono = Roboto_Mono({
  variable: '--font',
  subsets: ['latin'],
  display: 'swap',
});
export const sourceCodePro = Source_Code_Pro({
  variable: '--font',
  subsets: ['latin'],
  display: 'swap',
});
export const ubuntu = Ubuntu({
  variable: '--font',
  subsets: ['latin'],
  display: 'swap',
  weight: '400',
});
export const ubuntuMono = Ubuntu_Mono({
  variable: '--font',
  subsets: ['latin'],
  display: 'swap',
  weight: '400',
});
const fonts: Record<string, NextFontWithVariable> = {
  'Fira Code': firaCode,
  Inconsolata: inconsolata,
  'JetBrains Mono': jetBrainsMono,
  Lato: lato,
  'Lexend Deca': lexendDeca,
  Montserrat: montserrat,
  Nunito: nunito,
  Oxygen: oxygen,
  Roboto: roboto,
  'Roboto Mono': robotoMono,
  'Source Code Pro': sourceCodePro,
  Ubuntu: ubuntu,
  'Ubuntu Mono': ubuntuMono,
};

export default fonts;
