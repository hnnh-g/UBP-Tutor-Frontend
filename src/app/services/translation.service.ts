import { Injectable, signal, computed } from '@angular/core';
import { Language } from '../models';
import { en, de, Translations } from '../i18n';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly _language = signal<Language>('en');

  readonly language = this._language.asReadonly();

  readonly t = computed<Translations>(() => (this._language() === 'de' ? de : en));

  setLanguage(lang: Language): void {
    this._language.set(lang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }

  toggle(): void {
    this.setLanguage(this._language() === 'en' ? 'de' : 'en');
  }

  translate(key: string): string {
    const keys = key.split('.');
    let current: any = this.t();
    for (const k of keys) {
      current = current?.[k];
      if (current === undefined) return key;
    }
    return typeof current === 'string' ? current : key;
  }
}
