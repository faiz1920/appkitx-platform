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
  language: {
    label: "Language",
    ariaLabel: "Language",
    provisional: "Provisional translation",
  },
  footer: {
    columns: {
      tools: {
        heading: "Tools",
      },
      categories: {
        heading: "Categories",
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
  home: {
    heroTitle: "Free tools for everyday work.",
    heroSubline:
      "Calculators, converters, and developer utilities — all in one place.",
    browseByCategory: "Browse by category",
    exploreHeading: "Explore the toolkit.",
    placeholderTools: {
      unitConverter: {
        title: "Unit Converter",
        description: "Length, weight, temperature, and more.",
      },
      loanCalculator: {
        title: "Loan Calculator",
        description: "Monthly payments, interest, and total cost.",
      },
      dateCalculator: {
        title: "Date Calculator",
        description: "Days between dates, add or subtract time.",
      },
      base64Encoder: {
        title: "Base64 Encoder",
        description: "Encode and decode Base64 in your browser.",
      },
      jsonFormatter: {
        title: "JSON Formatter",
        description: "Format, validate, and inspect JSON.",
      },
    },
  },
  categories: {
    Calculators: {
      name: "Calculators",
      page: {
        title: "Free Online Calculators — AppKitX",
        metaDescription:
          "Free calculators for percentages and discounts: find a percentage of a number, work out percent change, or see the final price after a discount.",
        toolsHeading: "Free online calculators",
        intro: [
          "Two calculators cover the everyday percentage math: find X% of a number, work out what percent one value is of another, measure a percentage increase or decrease, and see what a discount saves and its final price.",
          "Both run entirely in your browser, show the formula behind each result, and let you copy it with one click. Amounts are treated exactly as you enter them — the discount calculator is currency-neutral, and results are rounded only for display.",
        ],
      },
    },
    Converters: { name: "Converters" },
    "Developer tools": { name: "Developer tools" },
    "Date & time": { name: "Date & time" },
    "Text tools": { name: "Text tools" },
  },
  toolLayout: {
    breadcrumbLabel: "Breadcrumb",
    breadcrumbHome: "Home",
    relatedTools: "Related tools",
    seeAll: "See all",
  },
  categoryLayout: {
    breadcrumbLabel: "Breadcrumb",
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
    ambiguousNumber:
      "Check the number format: use one decimal separator, for example 19.99.",
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
      cardDescription: "Percentages, tips, discounts, and percent change.",
      keywords: [
        "percentage",
        "percent",
        "tip",
        "increase",
        "decrease",
        "change",
        "share",
        "of",
      ],
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
      formulas: {
        "percent-of": {
          template: "(X ÷ 100) × Y",
          describe: "({a} ÷ 100) × {b} = {result}",
        },
        "what-percent": {
          template: "(X ÷ Y) × 100",
          describe: "({a} ÷ {b}) × 100 = {result}",
        },
        "percent-change": {
          template: "((To − From) ÷ From) × 100",
          describe: "(({b} − {a}) ÷ {a}) × 100 = {result}",
        },
      },
      results: {
        plain: "{value}",
        percent: "{value}%",
        increase: "{value}% increase",
        decrease: "{value}% decrease",
        zero: "0%",
      },
      sections: [
        {
          heading: "How it works",
          paragraphs: [
            "The calculator covers three common percentage problems. Pick a mode, enter two numbers, and select Calculate. Results update in place — no page reload — and can be copied with one click.",
          ],
        },
        {
          heading: "Find X% of Y",
          paragraphs: [
            "Multiplies the value by the percentage and divides by 100 — the standard way to take a percentage of a number.",
            "Formula: `(X ÷ 100) × Y`. Example: 25% of 80 is `(25 ÷ 100) × 80 = 20`.",
          ],
        },
        {
          heading: "X is what percentage of Y?",
          paragraphs: [
            "Divides the first number by the second and multiplies by 100 to express it as a share of the whole.",
            "Formula: `(X ÷ Y) × 100`. Example: 20 out of 80 is `(20 ÷ 80) × 100 = 25%`.",
          ],
        },
        {
          heading: "Percentage change",
          paragraphs: [
            "Measures the increase or decrease from an original value to a new value, as a percentage of the original.",
            "Formula: `((To − From) ÷ From) × 100`. Example: from 80 to 100 is `((100 − 80) ÷ 80) × 100 = 25%`, a 25% increase.",
          ],
        },
        {
          heading: "Assumptions and edge cases",
          items: [
            "Results are calculated at full precision and rounded only for display — up to six decimal places, with trailing zeros removed.",
            "Negative and decimal inputs are allowed and applied literally; nothing is clamped.",
            'Dividing by zero is undefined: the "What %" mode requires a non-zero whole. Percentage change requires a positive original value — a zero baseline divides by zero, and a negative baseline would produce a misleading increase or decrease. The calculator explains these cases instead of showing Infinity, NaN, or a misleading percentage.',
            "An increase and a decrease of the same amount are not symmetrical — going from 80 to 100 is a 25% increase, but going back from 100 to 80 is a 20% decrease, because the change is always relative to the original value.",
          ],
        },
      ],
    },
    discount: {
      title: "Discount Calculator — AppKitX",
      metaDescription:
        "Free discount calculator: work out how much you save and the final price after a percentage discount, in any currency.",
      name: "Discount Calculator",
      description:
        "Work out how much you save and the final price after a discount — in any currency.",
      cardDescription: "Savings and final price after a discount.",
      keywords: [
        "discount",
        "sale",
        "savings",
        "price",
        "off",
        "markdown",
        "reduction",
        "final",
      ],
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
      formulas: {
        template:
          "discount = (price × percent) ÷ 100 · final = price − discount",
        describe:
          "discount = ({price} × {percent}) ÷ 100 = {savings} · final = {price} − {savings} = {final}",
      },
      sections: [
        {
          heading: "How it works",
          paragraphs: [
            "Enter the original price and the discount percentage, then select Calculate. The calculator shows the amount saved and the final price. Both outputs use the same currency units as the price you entered — the calculator never assumes a currency.",
          ],
        },
        {
          heading: "The formulas",
          paragraphs: [
            "Discount amount: `price × percent ÷ 100`. Final price: `price − discount amount`.",
          ],
        },
        {
          heading: "Worked examples",
          paragraphs: [
            "A 20% discount on a price of 100 saves `(100 × 20) ÷ 100 = 20`, so the final price is `100 − 20 = 80`.",
            "A 15% discount on a price of 19.99 saves `(19.99 × 15) ÷ 100 ≈ 3`, so the final price is about `16.99`.",
          ],
        },
        {
          heading: "Assumptions and edge cases",
          items: [
            "The original price can be zero or more; the discount percentage must be between 0 and 100 inclusive. Values outside these ranges are rejected with an inline message rather than being silently adjusted.",
            "Decimal prices and percentages are fully supported. Results are calculated at full precision and rounded only for display — capped at two decimal places, with trailing zeros removed.",
            "A 100% discount makes the final price zero, and a 0% discount leaves the price unchanged.",
            "Both outputs use the same currency units as the entered price; the calculator is currency-neutral and does no currency conversion.",
          ],
        },
      ],
    },
  },
};
