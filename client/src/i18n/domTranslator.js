import { translateDynamicText } from './index'

const ATTRIBUTE_NAMES = ['placeholder', 'title', 'aria-label', 'label']
const SKIP_TAG_NAMES = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'TEXTAREA'])

const textOriginalMap = new WeakMap()
const attrOriginalMap = new WeakMap()

const toTranslatedText = (value, locale) => {
  if (locale !== 'en') return value
  return translateDynamicText(value, locale)
}

const processTextNode = (node, locale) => {
  if (!node || node.nodeType !== Node.TEXT_NODE) return
  if (node.parentElement && SKIP_TAG_NAMES.has(node.parentElement.tagName)) return

  if (!textOriginalMap.has(node)) {
    textOriginalMap.set(node, node.nodeValue)
  }

  let original = textOriginalMap.get(node)
  const current = node.nodeValue
  const translatedFromOriginal = toTranslatedText(original, 'en')

  // DOM text can be changed by Vue after initial rendering. In that case,
  // refresh the original source text before applying translation.
  if (current !== original && current !== translatedFromOriginal) {
    original = current
    textOriginalMap.set(node, original)
  }

  const translated = toTranslatedText(original, locale)
  if (node.nodeValue !== translated) {
    node.nodeValue = translated
  }
}

const processAttributes = (element, locale) => {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) return
  if (SKIP_TAG_NAMES.has(element.tagName)) return

  let originalAttrs = attrOriginalMap.get(element)
  if (!originalAttrs) {
    originalAttrs = {}
    attrOriginalMap.set(element, originalAttrs)
  }

  ATTRIBUTE_NAMES.forEach((attr) => {
    if (!element.hasAttribute(attr)) return

    const current = element.getAttribute(attr)
    if (!Object.prototype.hasOwnProperty.call(originalAttrs, attr)) {
      originalAttrs[attr] = current
    }

    const translatedFromOriginal = toTranslatedText(originalAttrs[attr], 'en')
    if (current !== originalAttrs[attr] && current !== translatedFromOriginal) {
      originalAttrs[attr] = current
    }

    const translated = toTranslatedText(originalAttrs[attr], locale)
    if (current !== translated) {
      element.setAttribute(attr, translated)
    }
  })
}

const processSubtree = (root, locale) => {
  if (!root) return

  if (root.nodeType === Node.TEXT_NODE) {
    processTextNode(root, locale)
    return
  }

  if (root.nodeType !== Node.ELEMENT_NODE) return

  processAttributes(root, locale)

  const textWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  while (textWalker.nextNode()) {
    processTextNode(textWalker.currentNode, locale)
  }

  ATTRIBUTE_NAMES.forEach((attr) => {
    root.querySelectorAll(`[${attr}]`).forEach((element) => {
      processAttributes(element, locale)
    })
  })
}

export const initDomTranslator = (app) => {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !app) return

  const applyTranslation = () => {
    processSubtree(document.body, app.$i18n.locale)
  }

  app.$watch(() => app.$i18n.locale, () => {
    window.requestAnimationFrame(applyTranslation)
  })

  const observer = new MutationObserver((mutations) => {
    const locale = app.$i18n.locale

    mutations.forEach((mutation) => {
      if (mutation.type === 'characterData') {
        processTextNode(mutation.target, locale)
        return
      }

      if (mutation.type === 'attributes') {
        processAttributes(mutation.target, locale)
        return
      }

      mutation.addedNodes.forEach((node) => {
        processSubtree(node, locale)
      })
    })
  })

  observer.observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ATTRIBUTE_NAMES
  })

  window.requestAnimationFrame(applyTranslation)
}
