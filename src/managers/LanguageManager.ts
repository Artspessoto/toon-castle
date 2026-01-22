type Lang = "pt-br" | "en";

export class LanguageManager {
  private static instance: LanguageManager;
  public currentLanguage: Lang = "pt-br";

  private constructor() {}

  public static getInstance(): LanguageManager {
    if (!LanguageManager.instance) {
      LanguageManager.instance = new LanguageManager();
    }

    return LanguageManager.instance;
  }

  get currentLang(): Lang {
    return this.currentLanguage;
  }

  public setLanguage(lang: Lang) {
    this.currentLanguage = lang;
  }
}
