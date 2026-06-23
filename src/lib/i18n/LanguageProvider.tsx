"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  LOCALE_STORAGE_KEY,
  exactTranslations,
  localeLabels,
  phraseTranslations,
  regexTranslations,
  type Locale,
} from "./translations";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (text: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

type TranslationState = {
  original: string;
  translated: string;
};

const textStates = new WeakMap<Text, TranslationState>();
const attrStates = new WeakMap<Element, Map<string, TranslationState>>();
const translatableAttributes = ["aria-label", "title", "placeholder", "alt"];

function getStoredLocale(): Locale {
  if (typeof window === "undefined") return "de";

  try {
    const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return storedLocale === "en" || storedLocale === "de" ? storedLocale : "de";
  } catch {
    return "de";
  }
}

function preserveSpacing(original: string, translated: string) {
  const leading = original.match(/^\s*/u)?.[0] ?? "";
  const trailing = original.match(/\s*$/u)?.[0] ?? "";
  return `${leading}${translated}${trailing}`;
}

let cachedPhraseEntries: Array<[string, string]> | null = null;

function translateText(text: string, locale: Locale): string {
  if (locale === "de") return text;

  const trimmed = text.trim();
  if (!trimmed) return text;

  const exact = exactTranslations[trimmed];
  if (exact) return preserveSpacing(text, exact);

  for (const [pattern, replacement] of regexTranslations) {
    if (pattern.test(trimmed)) {
      return preserveSpacing(text, trimmed.replace(pattern, replacement));
    }
  }

  let translated = trimmed;
  const phrases =
    cachedPhraseEntries ??
    (cachedPhraseEntries = Object.entries(phraseTranslations).sort(
      ([left], [right]) => right.length - left.length,
    ));

  for (const [source, target] of phrases) {
    translated = translated.split(source).join(target);
  }

  return preserveSpacing(text, translated);
}

function shouldSkipTextNode(node: Text) {
  const parent = node.parentElement;
  if (!parent) return true;

  const tagName = parent.tagName.toLowerCase();
  return (
    tagName === "script" ||
    tagName === "style" ||
    tagName === "textarea" ||
    parent.closest("[data-no-translate]") !== null
  );
}

function getTextState(textNode: Text): TranslationState {
  const current = textNode.nodeValue ?? "";
  const existing = textStates.get(textNode);

  if (!existing || (current !== existing.original && current !== existing.translated)) {
    const nextState = { original: current, translated: current };
    textStates.set(textNode, nextState);
    return nextState;
  }

  return existing;
}

function getAttributeState(
  element: Element,
  attr: string,
  value: string,
): TranslationState {
  const states = attrStates.get(element) ?? new Map<string, TranslationState>();
  const existing = states.get(attr);

  if (!existing || (value !== existing.original && value !== existing.translated)) {
    const nextState = { original: value, translated: value };
    states.set(attr, nextState);
    attrStates.set(element, states);
    return nextState;
  }

  return existing;
}

function translateAttributes(element: Element, locale: Locale) {
  for (const attr of translatableAttributes) {
    const current = element.getAttribute(attr);
    if (!current) continue;

    const state = getAttributeState(element, attr, current);
    const nextValue =
      locale === "de" ? state.original : translateText(state.original, locale);
    state.translated = nextValue;

    if (current !== nextValue) {
      element.setAttribute(attr, nextValue);
    }
  }
}

function translateNodeTree(root: Node, locale: Locale) {
  if (root.nodeType === Node.TEXT_NODE) {
    const textNode = root as Text;
    if (shouldSkipTextNode(textNode)) return;

    const state = getTextState(textNode);
    const nextValue =
      locale === "de" ? state.original : translateText(state.original, locale);
    state.translated = nextValue;

    if (textNode.nodeValue !== nextValue) {
      textNode.nodeValue = nextValue;
    }
    return;
  }

  if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) {
    return;
  }

  if (root.nodeType === Node.ELEMENT_NODE) {
    translateAttributes(root as Element, locale);
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let current = walker.nextNode();

  while (current) {
    if (current.nodeType === Node.TEXT_NODE) {
      const textNode = current as Text;
      if (!shouldSkipTextNode(textNode)) {
        const state = getTextState(textNode);
        const nextValue =
          locale === "de" ? state.original : translateText(state.original, locale);
        state.translated = nextValue;

        if (textNode.nodeValue !== nextValue) {
          textNode.nodeValue = nextValue;
        }
      }
    } else if (current.nodeType === Node.ELEMENT_NODE) {
      translateAttributes(current as Element, locale);
    }

    current = walker.nextNode();
  }
}

function useDomTranslations(locale: Locale) {
  useEffect(() => {
    document.documentElement.lang = locale;
    translateNodeTree(document.body, locale);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
          translateNodeTree(node, locale);
        }

        if (mutation.type === "characterData") {
          translateNodeTree(mutation.target, locale);
        }

        if (mutation.type === "attributes") {
          translateNodeTree(mutation.target, locale);
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: translatableAttributes,
    });

    return () => observer.disconnect();
  }, [locale]);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => getStoredLocale());

  useDomTranslations(locale);

  const setLocale = useCallback((nextLocale: Locale) => {
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
    } catch {
      // Keep the in-memory language switch working even when storage is disabled.
    }
    setLocaleState(nextLocale);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "de" ? "en" : "de");
  }, [locale, setLocale]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale,
      toggleLocale,
      t: (text: string) => translateText(text, locale),
    }),
    [locale, setLocale, toggleLocale],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider.");
  }
  return context;
}

export function LanguageSelect({ className }: { className?: string }) {
  const { locale, setLocale } = useLanguage();

  return (
    <label
      className={className}
      title="Sprache"
      aria-label="Sprache"
      data-no-translate
    >
      <span className="sr-only">Sprache</span>
      <select
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        className="h-8 rounded-lg border border-border bg-background px-2 text-xs font-semibold text-foreground outline-none transition-colors hover:bg-muted focus:border-brand-red focus:ring-2 focus:ring-brand-red/20"
        aria-label="Sprache auswählen"
      >
        {(Object.keys(localeLabels) as Locale[]).map((option) => (
          <option key={option} value={option}>
            {localeLabels[option]}
          </option>
        ))}
      </select>
    </label>
  );
}
