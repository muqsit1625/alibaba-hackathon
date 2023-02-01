export interface LanguageSelectorProps {}

type LanguageTypes = 'en' | 'ar';

export type Languages = {
  [key in LanguageTypes]: {
    label: string;
    value: LanguageTypes;
  };
};
