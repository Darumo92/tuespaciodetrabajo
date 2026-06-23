import type { CollectionEntry } from 'astro:content';
import type { Locale } from './locales';
import { articlePath } from './routes';

export type BaseArticle = CollectionEntry<'articulos'>;
export type I18nArticle = CollectionEntry<'articulosI18n'>;
export type AnyArticle = BaseArticle | I18nArticle;

export function baseArticlePath(article: BaseArticle): string {
  return articlePath({
    locale: 'es-ES',
    tipo: article.data.tipo ?? 'comparativa',
    categoriaSlug: article.data.categoria,
    slug: article.slug,
  });
}

export function i18nArticlePath(article: I18nArticle): string {
  return articlePath({
    locale: article.data.locale as Locale,
    tipo: article.data.tipo ?? 'comparativa',
    categoriaSlug: article.data.categoriaSlug,
    slug: article.data.localizedSlug,
  });
}

export function anyArticlePath(article: AnyArticle, locale: Locale): string {
  if ('translationOf' in article.data) return i18nArticlePath(article as I18nArticle);
  return baseArticlePath(article as BaseArticle);
}

export function getArticleTranslationKey(article: AnyArticle): string {
  return 'translationOf' in article.data ? article.data.translationOf : article.slug;
}
