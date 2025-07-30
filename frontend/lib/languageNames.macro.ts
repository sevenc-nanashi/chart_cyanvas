const translations = import.meta.glob<Record<string, string | unknown>>(
  "~/i18n/*.yml",
  {
    import: "default",
    eager: true,
  },
);

export const languageNames = Object.fromEntries(
  Object.entries(translations).map(([key, value]) => {
    const lang = key.match(/\/([a-z]{2})\.yml$/)?.[1];
    if (!lang) {
      throw new Error(`Invalid language file: ${key}`);
    }
    return [lang, value.language as string];
  }),
);
