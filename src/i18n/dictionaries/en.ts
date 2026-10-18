import type { Dictionary } from "../dictionary";

/*
 * English source dictionary — the reference every future locale is built
 * against. Wording is copied verbatim from the shipped UI; editing an entry
 * changes product copy and must be reviewed as copy, not as a refactor.
 */
export const en: Dictionary = {
  layout: {
    defaultTitle: "AppKitX — Free Online Tools",
    defaultDescription:
      "Free calculators, converters, and developer utilities, all in one place.",
    skipToContent: "Skip to content",
  },
  nav: {
    ariaLabel: "Global",
    tools: "Tools",
    categories: "Categories",
    about: "About",
    searchLabel: "Search",
    searchShortcut: "⌘K",
    menuAriaLabel: "Menu",
  },
  footer: {
    columns: {
      tools: {
        heading: "Tools",
        percentageCalculator: "Percentage Calculator",
        discountCalculator: "Discount Calculator",
        unitConverter: "Unit Converter",
        loanCalculator: "Loan Calculator",
        dateCalculator: "Date Calculator",
      },
      categories: {
        heading: "Categories",
        calculators: "Calculators",
        converters: "Converters",
        developerTools: "Developer tools",
      },
      company: {
        heading: "Company",
        about: "About",
        contact: "Contact",
      },
      legal: {
        heading: "Legal",
        privacy: "Privacy",
        terms: "Terms",
      },
    },
    copyright: "© 2026 AppKitX",
  },
  search: {
    label: "Search tools",
    placeholder: "Search tools…",
    pagePlaceholder: "Search free tools…",
    escapeKey: "Esc",
    resultsLabel: "Tools",
    noResults: "No tools match “{query}”",
    noResultsStatus: "No tools match {query}",
    suggestion: "Try a different word, or",
    browseAll: "browse all tools",
    countOne: "{count} tool",
    countMany: "{count} tools",
  },
  notFound: {
    title: "Page not found — AppKitX",
    metaDescription:
      "The page you are looking for does not exist. Search for a tool or browse the AppKitX calculators.",
    heading: "Page not found",
    body: "The page you're looking for doesn't exist or may have moved.",
    goHome: "Go to homepage",
  },
  toolLayout: {
    breadcrumbLabel: "Breadcrumb",
    breadcrumbHome: "Home",
    relatedTools: "Related tools",
  },
  toolCard: {
    openTool: "Open tool",
  },
  calculator: {
    calculate: "Calculate",
    reset: "Reset",
    resultLabel: "Result",
    resultsPlaceholder: "Results appear here",
    formulaLabel: "Formula:",
    invalidNumber: "Enter a valid number.",
    copyResult: "Copy result",
    copied: "Copied to clipboard.",
    copyFailed: "Copy failed — select the result text and copy it manually.",
  },
  tools: {
    percentage: {
      title: "Percentage Calculator — AppKitX",
      metaDescription:
        "Free percentage calculator: find X% of Y, work out what percent one number is of another, and calculate percentage increase or decrease.",
      name: "Percentage Calculator",
      description:
        "Find a percentage of a number, work out what percent one number is of another, or measure the change between two values.",
      modeLegend: "Mode",
      modes: {
        "percent-of": {
          optionLabel: "X% of Y",
          labelA: "Percentage (X%)",
          hintA: "The percentage to apply.",
          labelB: "Value (Y)",
          hintB: "The number to take the percentage of.",
        },
        "what-percent": {
          optionLabel: "What %",
          labelA: "Part (X)",
          hintA: "The number you are comparing.",
          labelB: "Whole (Y)",
          hintB: "The number to compare it against.",
        },
        "percent-change": {
          optionLabel: "% change",
          labelA: "From (original value)",
          hintA: "The starting value. Must be greater than zero.",
          labelB: "To (new value)",
          hintB: "The value after the change.",
        },
      },
      undefinedResult: "Undefined",
      captions: {
        percentOf: "{percent}% of {value}.",
        whatPercent: "{part} out of {whole}.",
        noChange: "No change from {from} to {to}.",
        change: "From {from} to {to}.",
        divideByZero: "Can't divide by 0 — the whole must not be zero.",
        changeFromZero:
          "Can't compute a percentage change from 0 — the original value must not be zero.",
        changeFromNegative:
          "Percentage change is undefined for a negative original value — use a positive starting value.",
      },
    },
    discount: {
      title: "Discount Calculator — AppKitX",
      metaDescription:
        "Free discount calculator: work out how much you save and the final price after a percentage discount, in any currency.",
      name: "Discount Calculator",
      description:
        "Work out how much you save and the final price after a discount — in any currency.",
      priceLabel: "Original price",
      priceHint: "The price before the discount, in any currency.",
      percentLabel: "Discount percentage (%)",
      percentHint: "A percentage between 0 and 100.",
      finalPriceLabel: "Final price",
      savingsLabel: "You save",
      errors: {
        negativePrice: "Enter a price of 0 or more.",
        percentRange: "Enter a discount between 0 and 100.",
      },
      caption: "{percent}% off {price}.",
      copyText: "Final price: {price}\nYou save: {savings}",
    },
  },
};
