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
      "Free calculators, unit converters, developer utilities, text tools, and date and time tools, all in one place.",
    socialImageAlt:
      "AppKitX — free online tools for calculators, unit converters, developer utilities, text tools, and date and time tools.",
    skipToContent: "Skip to content",
  },
  nav: {
    ariaLabel: "Global",
    tools: "Tools",
    categories: "Categories",
    guides: "Guides",
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
        affiliateDisclosure: "Affiliate disclosure",
      },
    },
    guides: "PC hardware guides",
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
      "Calculators, unit converters, developer utilities, text tools, and date and time tools — all in one place.",
    browseByCategory: "Browse by category",
    exploreHeading: "Explore the toolkit.",
  },
  categories: {
    Calculators: {
      name: "Calculators",
      page: {
        title: "Free Online Calculators — AppKitX",
        metaDescription:
          "Free calculators for percentages, discounts, loans, EMIs, compound interest, savings goals, retirement projections, and scientific expressions: percent change, amortization, investment growth, and trigonometry in degrees or radians.",
        toolsHeading: "Free online calculators",
        intro: [
          "The calculators cover everyday money math and scientific expressions: find X% of a number, work out what percent one value is of another, measure a percentage increase or decrease, see what a discount saves and its final price, estimate a loan's monthly payment, total interest, and total cost, inspect a year-by-year EMI repayment schedule with principal and interest balances, project investment growth with compound interest and optional monthly contributions, work out the monthly savings needed to reach a goal, project a retirement corpus by age or the monthly savings needed to reach one, and evaluate expressions with parentheses, powers, roots, logarithms, and trigonometry.",
          "They run entirely in your browser, show the formula or expression behind each result, and let you copy it with one click. Money amounts are treated exactly as you enter them — the discount, loan, EMI, compound interest, savings goal, and retirement calculators are currency-neutral — and the scientific calculator respects the selected degrees or radians mode.",
        ],
      },
    },
    Converters: {
      name: "Converters",
      page: {
        title: "Free Unit and Speed Converters — AppKitX",
        metaDescription:
          "Free online converters for length, weight, temperature, and speed: switch between metric and imperial units, km/h and mph, m/s, ft/s, and knots.",
        toolsHeading: "Free online converters",
        intro: [
          "The converters cover the measurements people switch between most often: length and distance, weight, temperature, and speed. Pick the source and target units, and get the result with the same calculation written out in full.",
          "Everything runs in your browser, results keep full precision internally and are rounded only for display, and every conversion can be copied with one click. Numbers follow the page language, including the decimal separator.",
        ],
      },
    },
    "Developer tools": {
      name: "Developer tools",
      page: {
        title: "Free Developer Tools — AppKitX",
        metaDescription:
          "Free browser-based developer tools: encode and decode Base64, format and validate JSON, and generate customizable QR codes. Nothing you enter is uploaded.",
        toolsHeading: "Free developer tools",
        intro: [
          "Browser-based utilities for everyday developer work: convert text to Base64 and back, format, minify, or validate JSON, and generate QR codes for links, text, contact details, Wi-Fi, and more.",
          "They run entirely in your browser — nothing you paste or type is uploaded anywhere. Each tool documents its behavior and edge cases, and every result can be copied or downloaded.",
        ],
      },
    },
    "Date & time": {
      name: "Date & time",
      page: {
        title: "Free Date & Time Tools — AppKitX",
        metaDescription:
          "Free date and time tools: count days between dates, add or subtract days, weeks, months, and years, work out your age, and convert a date and time between time zones.",
        toolsHeading: "Free date & time tools",
        intro: [
          "Browser-based tools for calendar math: count the days between two dates with a years, months, and days breakdown, or add and subtract days, weeks, months, and years with month-end clamping.",
          "The age calculator turns a date of birth into years, months, and days plus total days lived, counted as of your device's local calendar date. The date and age tools use plain calendar dates, while the time zone converter works with real instants, UTC offsets, and daylight-saving changes. Nothing is uploaded, and every result can be copied with one click.",
        ],
      },
    },
    "Text tools": {
      name: "Text tools",
      page: {
        title: "Free Text Tools — AppKitX",
        metaDescription:
          "Free browser-based text tools: count words, characters, sentences, and reading time, and convert text between uppercase, lowercase, title, sentence, and programming cases. Nothing you type is uploaded.",
        toolsHeading: "Free text tools",
        intro: [
          "The text tools cover the writing and editing jobs that come up every day: measure a draft's words, characters, sentences, paragraphs, and estimated reading or speaking time, or switch text between uppercase, lowercase, title, sentence, and programming-style cases.",
          "They run entirely in your browser — nothing you paste or type is uploaded, stored, or sent to a third-party service. Each tool documents its counting and conversion rules, including what changes for non-Latin scripts, and the converted text can be copied with one click.",
        ],
      },
    },
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
    comingSoon: "Coming soon",
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
    loanCalculator: {
      title: "Loan Calculator — AppKitX",
      metaDescription:
        "Free loan calculator: estimate the monthly payment, total interest, and total payable for any loan amount, annual rate, and term.",
      name: "Loan Calculator",
      description:
        "Estimate the monthly payment, total interest, and total cost of a loan from the amount, annual rate, and term.",
      cardDescription: "Monthly payments, interest, and total cost.",
      keywords: [
        "loan",
        "mortgage",
        "repayment",
        "interest",
        "monthly payment",
        "principal",
        "home loan",
        "car loan",
        "personal loan",
      ],
      amountLabel: "Loan amount",
      amountHint: "The amount borrowed before interest, in any currency.",
      rateLabel: "Annual interest rate (%)",
      rateHint:
        "The yearly rate charged on the balance. Enter 0 for an interest-free loan.",
      termLabel: "Loan term",
      termHint:
        "How long you have to repay. The term must be between one month and 100 years.",
      termUnitLabel: "Term unit",
      termUnits: {
        years: "Years",
        months: "Months",
      },
      monthlyLabel: "Monthly payment",
      interestLabel: "Total interest",
      totalLabel: "Total payable",
      errors: {
        amount: "Enter a loan amount greater than zero.",
        rate: "Enter an interest rate of 0 or more.",
        term: "Enter a term between 1 month and 1,200 months (100 years).",
      },
      caption: "{amount} at {rate}% over {months} months.",
      copyText:
        "Monthly payment: {monthly}\nTotal interest: {interest}\nTotal payable: {total}",
      formulas: {
        template: "EMI = P × r × (1 + r)ⁿ ÷ ((1 + r)ⁿ − 1)",
        describe: "{rate}% ÷ 12 = {monthlyRate}% per month",
      },
      sections: [
        {
          heading: "How it works",
          paragraphs: [
            "Enter the amount borrowed, the annual interest rate, and the repayment term. Select whether the term is in years or months, then choose Calculate. The calculator shows the fixed monthly payment, the total interest over the life of the loan, and the total amount repaid.",
            "The calculator is currency-neutral: it uses whatever currency the amount is entered in and never converts between currencies. Everything runs in your browser.",
          ],
        },
        {
          heading: "The formula",
          paragraphs: [
            "The monthly payment is the standard annuity formula: `EMI = P × r × (1 + r)ⁿ ÷ ((1 + r)ⁿ − 1)`, where `P` is the principal, `r` is the annual rate divided by 12 and by 100, and `n` is the number of monthly payments.",
            "A zero rate is handled separately: the monthly payment is simply `principal ÷ months`, and the total interest is zero.",
          ],
        },
        {
          heading: "Worked example",
          paragraphs: [
            "A loan of 100,000 at 6% a year over 30 years has `r = 6 ÷ 12 ÷ 100 = 0.005` and `n = 30 × 12 = 360` monthly payments. The monthly payment is about `599.55`, the total repaid is about `215,838`, and the total interest is about `115,838`.",
          ],
        },
        {
          heading: "Assumptions and edge cases",
          items: [
            "The rate stays fixed for the whole term and interest is charged monthly on the outstanding balance. Variable-rate loans, fees, insurance, and taxes are not included.",
            "The term must be between one month and 1,200 months (100 years). Terms outside that range are rejected with an inline message rather than silently adjusted.",
            "Results are calculated at full precision and rounded to two decimal places only for display. The last payment on a real loan may differ by a few cents because lenders round each instalment.",
            "The calculator is currency-neutral and makes no assumptions about the currency, the payment date, or the lender's own rounding rules.",
          ],
        },
      ],
    },
    emiCalculator: {
      title: "EMI Calculator — AppKitX",
      metaDescription:
        "Free EMI calculator with a full amortization schedule: monthly payment, principal and interest breakdown, outstanding balance, and annual repayment totals.",
      name: "EMI Calculator",
      description:
        "Calculate the monthly EMI, principal and interest split, outstanding balance, and a year-by-year repayment schedule.",
      cardDescription:
        "Monthly EMI, principal/interest split, and amortization schedule.",
      keywords: [
        "emi",
        "emi calculator",
        "loan emi",
        "amortization schedule",
        "repayment schedule",
        "principal and interest",
        "outstanding balance",
        "monthly installment",
        "loan repayment",
        "home loan",
        "car loan",
      ],
      amountLabel: "Loan amount",
      amountHint:
        "The amount borrowed, in any currency. No currency conversion is applied.",
      rateLabel: "Annual interest rate (%)",
      rateHint:
        "The nominal annual rate charged on the reducing balance. Enter 0 for an interest-free loan.",
      tenureLabel: "Loan tenure",
      tenureHint:
        "The repayment period. It must resolve to a whole number of months between 1 and 1,200.",
      tenureUnitLabel: "Tenure unit",
      tenureUnits: {
        years: "Years",
        months: "Months",
      },
      emiLabel: "Monthly EMI",
      principalLabel: "Principal",
      interestLabel: "Total interest",
      totalLabel: "Total repayment",
      breakdownHeading: "Principal vs interest",
      principalShare: "{amount} ({percent}% of total)",
      interestShare: "{amount} ({percent}% of total)",
      scheduleHeading: "Repayment schedule",
      scheduleHint:
        "Grouped by loan year. Expand a year to see monthly installments and the outstanding balance.",
      scheduleEmpty:
        "Calculate a loan to see the year-by-year repayment schedule.",
      yearLabel: "Year {year}",
      openingBalanceLabel: "Opening balance",
      principalPaidLabel: "Principal paid",
      interestPaidLabel: "Interest paid",
      totalPaidLabel: "Total paid",
      closingBalanceLabel: "Closing balance",
      monthlyTableCaption: "Monthly installments for year {year}",
      scheduleScrollLabel:
        "Scrollable monthly installment table for year {year}",
      tableHeaders: {
        paymentNumber: "Payment",
        openingBalance: "Opening balance",
        payment: "EMI / payment",
        interest: "Interest",
        principal: "Principal",
        closingBalance: "Closing balance",
      },
      copySummary: "Copy summary",
      copyText:
        "Loan amount: {amount}\nMonthly EMI: {emi}\nPrincipal: {principal}\nTotal interest: {interest}\nTotal repayment: {total}\nTenure: {months} months",
      caption: "{amount} at {rate}% over {months} months.",
      formulas: {
        template: "EMI = P × r ÷ (1 − (1 + r)⁻ⁿ)",
        describe: "{rate}% ÷ 12 = {monthlyRate}% per month",
      },
      errors: {
        amount: "Enter a loan amount greater than zero.",
        rate: "Enter an interest rate of 0 or more.",
        tenure: "Enter a tenure between 1 and 1,200 whole months.",
        fractionalTenure:
          "The tenure must resolve to a whole number of months.",
        overflow:
          "The result is outside the supported numeric range. Try smaller values.",
      },
      sections: [
        {
          heading: "How it works",
          paragraphs: [
            "Enter the amount borrowed, the nominal annual interest rate, and the repayment tenure. Choose whether the tenure is in years or months, then select Calculate. The summary shows the fixed monthly EMI, the principal, total interest, total repayment, and the principal-versus-interest split.",
            "The repayment schedule groups installments by loan year. Expand any year to see each monthly payment, its interest and principal components, and the outstanding balance after that payment. Everything runs in your browser.",
          ],
        },
        {
          heading: "Reducing-balance EMI formula",
          paragraphs: [
            "This calculator uses reducing-balance EMI only: `EMI = P × r ÷ (1 − (1 + r)⁻ⁿ)`, where `P` is the principal, `r` is the nominal annual rate divided by 12 and by 100, and `n` is the whole number of monthly installments.",
            "For a zero rate, the EMI is simply `principal ÷ months` and the total interest is zero. Flat-interest loans are not modelled: interest is always charged on the outstanding balance, not on the original principal for the whole term.",
          ],
        },
        {
          heading: "Schedule and rounding",
          paragraphs: [
            "Each month, interest is charged on the opening balance, the EMI is applied, and the remainder reduces the principal. The final installment is adjusted so the outstanding balance closes at exactly zero; it can differ from the regular EMI by a few cents.",
            "Calculations keep full precision internally. The summary, annual totals, and monthly table are rounded to two decimal places only for display, so the displayed rows can differ from the exact total by a small rounding amount.",
          ],
        },
        {
          heading: "Assumptions and limits",
          items: [
            "The annual rate is nominal, fixed for the whole term, and divided by 12. Effective annual rates, variable rates, day-count conventions, fees, insurance, and taxes are not included.",
            "The tenure must resolve to a whole number of months between 1 and 1,200 (100 years). Fractional month totals are rejected rather than rounded.",
            "No prepayments, missed payments, moratoriums, or payment-frequency changes are modelled.",
            "Amounts are currency-neutral and are never converted. Results use the page locale's decimal and thousands separators.",
          ],
        },
        {
          heading: "Privacy",
          paragraphs: [
            "Everything is calculated in your browser. The loan values and schedule are never uploaded, stored in browser storage, or sent to a third-party service.",
          ],
        },
      ],
    },
    compoundInterest: {
      title: "Compound Interest Calculator — AppKitX",
      metaDescription:
        "Free compound interest calculator: project investment growth with optional monthly contributions, compare compounding frequencies, and see year-by-year interest and balances.",
      name: "Compound Interest Calculator",
      description:
        "Calculate the future value of an investment, total contributions, and interest earned with annual, quarterly, monthly, or daily compounding.",
      cardDescription:
        "Investment growth with compounding and monthly contributions.",
      keywords: [
        "compound interest",
        "compound interest calculator",
        "compound growth",
        "investment growth",
        "future value",
        "savings growth",
        "monthly contributions",
        "compounding frequency",
        "interest earned",
        "annual growth",
        "daily compounding",
        "quarterly compounding",
      ],
      principalLabel: "Initial investment",
      principalHint:
        "The starting amount, in any currency. No currency conversion is applied.",
      rateLabel: "Annual interest rate (%)",
      rateHint: "The nominal annual rate. Enter 0 for no interest.",
      durationLabel: "Investment duration",
      durationHint:
        "The projection period. It must resolve to a whole number of months between 1 and 1,200.",
      durationUnitLabel: "Duration unit",
      durationUnits: {
        years: "Years",
        months: "Months",
      },
      frequencyLabel: "Compounding frequency",
      frequencyHint:
        "How often interest is compounded. Daily compounding uses a 365-day year.",
      frequencies: {
        annual: "Annually",
        semiannual: "Semiannually",
        quarterly: "Quarterly",
        monthly: "Monthly",
        daily: "Daily",
      },
      contributionLabel: "Monthly contribution",
      contributionHint:
        "Optional. Leave blank or enter 0 for no monthly contributions.",
      timingLabel: "Contribute at the start of each month",
      timingHint: "Off means contributions are added at the end of each month.",
      finalValueLabel: "Final value",
      initialLabel: "Initial investment",
      contributionsLabel: "Total contributions",
      investedLabel: "Total invested",
      interestLabel: "Interest earned",
      breakdownHeading: "Invested vs interest",
      investedShare: "Total invested: {amount} ({percent}% of final value)",
      interestShare: "Interest earned: {amount} ({percent}% of final value)",
      growthHeading: "Year-by-year growth",
      growthHint:
        "Each row covers 12 months; the final row may cover a partial year.",
      growthEmpty: "Calculate an investment to see the year-by-year growth.",
      growthScrollLabel: "Scrollable year-by-year growth table",
      tableCaption: "Year-by-year investment growth",
      tableHeaders: {
        year: "Year",
        openingBalance: "Opening balance",
        contributions: "Contributions",
        interest: "Interest earned",
        closingBalance: "Closing balance",
      },
      yearLabel: "Year {year}",
      partialYearLabel: "Year {year} ({duration})",
      monthSingular: "month",
      monthPlural: "months",
      copySummary: "Copy summary",
      copyText:
        "Initial investment: {initial}\nAnnual interest rate: {rate}%\nCompounding: {frequency}\nDuration: {duration}\nFinal value: {final}\nTotal invested: {invested}\nInterest earned: {interest}",
      copyTextWithContributions:
        "Initial investment: {initial}\nMonthly contribution: {contribution}\nTotal contributions: {contributions}\nContribution timing: {timing}\nAnnual interest rate: {rate}%\nCompounding: {frequency}\nDuration: {duration}\nFinal value: {final}\nTotal invested: {invested}\nInterest earned: {interest}",
      caption: "{amount} at {rate}% over {duration}.",
      captionWithContributions:
        "{amount} at {rate}% over {duration}, with {contribution} monthly.",
      formulas: {
        template: "A = P × (1 + r/m)^(m×t)",
        describe:
          "{rate}% nominal = {monthlyRate}% per month after compounding.",
      },
      timingValues: {
        end: "End of month",
        beginning: "Beginning of month",
      },
      errors: {
        principal: "Enter an initial investment of 0 or more.",
        noInvestment:
          "Enter an initial investment or a monthly contribution greater than zero.",
        rate: "Enter an interest rate of 0 or more.",
        duration: "Enter a duration between 1 and 1,200 whole months.",
        fractionalDuration:
          "The duration must resolve to a whole number of months.",
        contribution: "Enter a monthly contribution of 0 or more.",
        frequency: "Choose a supported compounding frequency.",
        timing: "Choose a supported contribution timing.",
        overflow:
          "The result is outside the supported numeric range. Try smaller values.",
      },
      sections: [
        {
          heading: "How it works",
          paragraphs: [
            "Enter the initial investment, nominal annual rate, duration, and compounding frequency. Optionally add a monthly contribution and choose whether it is made at the start or end of each month. Select Calculate to see the final value, total invested, interest earned, and a year-by-year growth table.",
            "Everything runs in your browser. Changing any input clears the previous result so the numbers on screen always match the current inputs.",
          ],
        },
        {
          heading: "What compound interest means",
          paragraphs: [
            "Compound interest is interest earned on both the original amount and the interest already accumulated. Over time, the balance grows faster than with simple interest because each period's interest becomes part of the base for the next period.",
          ],
        },
        {
          heading: "Compound interest formula",
          paragraphs: [
            "The projection uses `A = P × (1 + r/m)^(m×t)`, where `P` is the initial investment, `r` is the nominal annual rate, `m` is the number of compounding periods per year, and `t` is the duration in years.",
            "The selected compounding frequency defines an equivalent monthly growth factor `g = (1 + r/m)^(m/12)`. Interest is accrued monthly at `i = g − 1`, so monthly contributions and annual rows use the same rate. This is a projection convention, not a bank statement or an exact interest-credit-date model.",
          ],
        },
        {
          heading: "Contributions and timing",
          paragraphs: [
            "Monthly contributions use the future-value formula for an ordinary annuity: `FV = C × ((g^N − 1) ÷ i)`. With beginning-of-month timing, each contribution earns one extra month of growth, so the result is multiplied by `g`.",
            "End-of-month is the default. If you enter no contribution, the result is a pure lump-sum projection.",
          ],
        },
        {
          heading: "Compounding frequency",
          paragraphs: [
            "Annual, semiannual, quarterly, monthly, and daily compounding use `m = 1, 2, 4, 12, and 365`. For the same nominal rate, a higher frequency produces a slightly higher effective annual yield. Daily compounding uses a fixed 365-day year; leap years are intentionally ignored.",
            "Partial years are expressed as whole months. The annual table groups 12 months at a time, and the final row may cover fewer than 12 months.",
          ],
        },
        {
          heading: "Assumptions and limits",
          items: [
            "The annual rate is nominal, fixed for the whole duration, and compounded at the selected frequency.",
            "Contributions are monthly only and are made at the start or end of each month. No withdrawals, step-ups, missed contributions, fees, taxes, insurance, or inflation are modelled.",
            "The calculator is currency-neutral. It does not convert currencies or add a currency symbol.",
            "Results use full precision internally and are rounded to two decimal places only for display, so displayed components may differ from the exact total by a small rounding amount.",
            "The duration must resolve to a whole number of months between 1 and 1,200 (100 years).",
          ],
        },
        {
          heading: "Privacy",
          paragraphs: [
            "Everything is calculated in your browser. Your investment values and growth table are never uploaded, stored in browser storage, or sent to a third-party service.",
          ],
        },
      ],
    },
    savingsGoal: {
      title: "Savings Goal Calculator — AppKitX",
      metaDescription:
        "Free savings goal calculator: find the monthly amount you need to save to reach a target, with optional interest and a year-by-year savings plan.",
      name: "Savings Goal Calculator",
      description:
        "Calculate the monthly savings required to reach a financial goal, with optional interest and a year-by-year plan.",
      cardDescription: "Monthly savings needed to reach a target.",
      keywords: [
        "savings goal calculator",
        "savings target calculator",
        "monthly savings calculator",
        "how much to save monthly",
        "savings plan calculator",
        "reach savings goal",
        "calculate savings target",
        "savings goal",
        "monthly savings",
        "target savings",
        "required monthly savings",
      ],
      targetLabel: "Savings goal",
      targetHint:
        "The amount you want to reach, in any currency. No currency conversion is applied.",
      currentLabel: "Current savings",
      currentHint:
        "What you have already set aside. Leave blank if you are starting from zero.",
      rateLabel: "Annual interest rate (%)",
      rateHint:
        "The nominal annual rate. Leave blank or enter 0 if your savings do not earn interest.",
      durationLabel: "Target duration",
      durationHint:
        "How long you have to reach the goal. It must resolve to a whole number of months between 1 and 1,200.",
      durationUnitLabel: "Duration unit",
      durationUnits: {
        years: "Years",
        months: "Months",
      },
      frequencyLabel: "Compounding frequency",
      frequencyHint:
        "How often interest is compounded. Daily compounding uses a 365-day year.",
      frequencies: {
        annual: "Annually",
        semiannual: "Semiannually",
        quarterly: "Quarterly",
        monthly: "Monthly",
        daily: "Daily",
      },
      timingLabel: "Contribute at the start of each month",
      timingHint: "Off means contributions are added at the end of each month.",
      requiredMonthlyLabel: "Required monthly savings",
      targetResultLabel: "Target amount",
      currentResultLabel: "Current savings",
      contributionsLabel: "Total contributions",
      interestLabel: "Interest earned",
      finalLabel: "Projected final savings",
      remainingLabel: "Remaining amount",
      progressLabel: "Savings progress",
      successAlreadyReached: "Your current savings already meet this goal.",
      successInterestOnly:
        "No monthly savings required — your current savings are projected to reach the goal through interest alone.",
      growthHeading: "Annual savings plan",
      growthHint:
        "Each row covers 12 months; the final row may cover a partial year.",
      growthEmpty: "Calculate a savings plan to see the annual breakdown.",
      growthScrollLabel: "Scrollable annual savings plan table",
      tableCaption: "Annual savings plan",
      tableHeaders: {
        year: "Year",
        openingBalance: "Opening balance",
        contributions: "Contributions",
        interest: "Interest earned",
        closingBalance: "Closing balance",
        progress: "Progress",
      },
      yearLabel: "Year {year}",
      partialYearLabel: "Year {year} ({duration})",
      monthSingular: "month",
      monthPlural: "months",
      copySummary: "Copy summary",
      copyText:
        "Savings goal: {target}\nCurrent savings: {current}\nAnnual interest rate: {rate}%\nCompounding: {frequency}\nDuration: {duration}\nContribution timing: {timing}\nRequired monthly savings: {required}\nTotal contributions: {contributions}\nInterest earned: {interest}\nProjected final savings: {final}",
      caption: "{amount} goal over {duration}.",
      formulas: {
        template: "C = (FV − P × g^N) × i ÷ (g^N − 1)",
        describe:
          "{rate}% nominal = {monthlyRate}% per month after compounding.",
      },
      timingValues: {
        end: "End of month",
        beginning: "Beginning of month",
      },
      errors: {
        target: "Enter a savings goal greater than zero.",
        current: "Enter current savings of 0 or more.",
        rate: "Enter an interest rate of 0 or more.",
        duration: "Enter a target duration between 1 and 1,200 whole months.",
        fractionalDuration:
          "The duration must resolve to a whole number of months.",
        frequency: "Choose a supported compounding frequency.",
        timing: "Choose a supported contribution timing.",
        overflow:
          "The result is outside the supported numeric range. Try smaller values.",
      },
      sections: [
        {
          heading: "How it works",
          paragraphs: [
            "Enter your savings goal, current savings, nominal annual rate, target duration, and compounding frequency. Choose whether monthly savings are added at the start or end of each month, then select Calculate. The calculator shows the required monthly savings, the projected final balance, and a year-by-year plan.",
            "Everything runs in your browser. Changing any input clears the previous result so the figures on screen always match the current inputs.",
          ],
        },
        {
          heading: "How required monthly savings are calculated",
          paragraphs: [
            "The target is reduced by the future value of your current savings, `FV_initial = P × g^N`. The remainder is divided by the future-value factor of a monthly annuity. End-of-month savings use `((g^N − 1) ÷ i)`; beginning-of-month savings use the same factor multiplied by `g`.",
            "When the interest rate is zero, the required amount is simply `(FV − P) ÷ N`.",
            "If your current savings already meet the goal, the required monthly amount is zero. If they are projected to reach the goal through interest alone, no monthly savings are required and the annual projection is still shown.",
          ],
        },
        {
          heading: "Interest, compounding, and timing",
          paragraphs: [
            "The selected compounding frequency defines an equivalent monthly growth factor `g = (1 + r/m)^(m/12)`. Interest is accrued monthly at `i = g − 1`, matching the Compound Interest Calculator. Daily compounding uses a fixed 365-day year; leap years are ignored.",
            "Beginning-of-month savings earn interest in the month they are added. End-of-month savings begin earning in the following month.",
          ],
        },
        {
          heading: "Rounding and reaching the target",
          paragraphs: [
            "The required monthly amount is rounded up to the next cent. The annual plan is then rebuilt with that rounded amount, so the projected final balance reaches or slightly exceeds the target. It never falls short because of rounding.",
            "A projected balance above the target is a small surplus from rounding up, not an error.",
          ],
        },
        {
          heading: "Assumptions and limits",
          items: [
            "The annual rate is nominal, fixed for the whole duration, and compounded at the selected frequency.",
            "Savings are monthly only and are made at the start or end of each month. No withdrawals, missed savings, step-ups, fees, taxes, insurance, or inflation are modelled.",
            "The calculator is currency-neutral. It does not convert currencies or add a currency symbol.",
            "Results use full precision internally. Money is shown with two decimal places, so the annual rows can differ from the exact totals by a small rounding amount.",
            "The duration must resolve to a whole number of months between 1 and 1,200 (100 years).",
          ],
        },
        {
          heading: "Privacy",
          paragraphs: [
            "Everything is calculated in your browser. Your savings goal, current savings, and annual plan are never uploaded, stored in browser storage, or sent to a third-party service.",
          ],
        },
      ],
    },
    retirementCalculator: {
      title: "Retirement Calculator — AppKitX",
      metaDescription:
        "Free retirement calculator: project your retirement corpus from current savings and monthly contributions, or find the monthly savings needed to reach a target.",
      name: "Retirement Calculator",
      description:
        "Project your retirement corpus from current savings and monthly contributions, or calculate the monthly savings needed to reach a target.",
      cardDescription:
        "Projected retirement corpus and required monthly savings.",
      keywords: [
        "retirement calculator",
        "retirement corpus calculator",
        "retirement savings calculator",
        "how much to save for retirement",
        "retirement projection",
        "retirement corpus",
        "monthly retirement savings",
        "required retirement savings",
        "retirement planning calculator",
        "projected retirement savings",
        "savings needed for retirement",
        "retirement calculator by age",
      ],
      modeLegend: "Calculation mode",
      modes: {
        projection: {
          optionLabel: "Projected corpus",
          hint: "Estimate the corpus you could accumulate by retirement.",
        },
        required: {
          optionLabel: "Required monthly savings",
          hint: "Find the monthly amount needed to reach a target corpus.",
        },
      },
      currentAgeLabel: "Current age",
      currentAgeHint: "Your age today in whole years, between 18 and 99.",
      retirementAgeLabel: "Retirement age",
      retirementAgeHint:
        "The age you plan to stop saving for retirement, in whole years. It must be later than your current age.",
      currentSavingsLabel: "Current retirement savings",
      currentSavingsHint:
        "What you have already set aside for retirement, in any currency. Leave blank if you are starting from zero.",
      contributionLabel: "Monthly contribution",
      contributionHint:
        "The amount you add each month, in any currency. Leave blank if you do not contribute monthly.",
      targetLabel: "Target retirement corpus",
      targetHint:
        "The nominal amount you want to reach by retirement, in any currency. No currency conversion is applied.",
      rateLabel: "Expected annual return (%)",
      rateHint:
        "A nominal annual return you assume, not a guaranteed rate. Leave blank or enter 0 to assume no growth.",
      inflationLabel: "Expected annual inflation (%)",
      inflationHint:
        "Optional. Adds an inflation-adjusted estimate in today's money; the nominal projection does not change. Leave blank to skip it.",
      assumptionsHeading: "Assumptions",
      frequencyLabel: "Compounding frequency",
      frequencyHint:
        "How often the return is compounded. Daily compounding uses a 365-day year.",
      frequencies: {
        annual: "Annually",
        semiannual: "Semiannually",
        quarterly: "Quarterly",
        monthly: "Monthly",
        daily: "Daily",
      },
      timingLabel: "Contribute at the start of each month",
      timingHint: "Off means contributions are added at the end of each month.",
      projectedCorpusLabel: "Projected retirement corpus",
      requiredMonthlyLabel: "Required monthly savings",
      targetResultLabel: "Nominal target corpus",
      currentResultLabel: "Current retirement savings",
      contributionsLabel: "Total future contributions",
      investedLabel: "Total invested",
      interestLabel: "Projected investment growth",
      projectedResultLabel: "Projected corpus at retirement",
      realValueLabel: "Inflation-adjusted value",
      realTargetLabel: "Inflation-adjusted target",
      yearsLabel: "Years to retirement",
      yearsValue: "{count} years",
      yearValue: "{count} year",
      successAlreadyCovered:
        "Your current retirement savings already meet the target. No monthly contribution is required under these assumptions.",
      successInterestOnly:
        "No monthly contribution required — your current savings are projected to reach the target through growth alone.",
      growthHeading: "Annual retirement projection",
      growthHint:
        "Each row covers 12 months and shows the age reached at the end of that year. Values are nominal.",
      growthEmpty: "Calculate a projection to see the annual breakdown.",
      growthScrollLabel: "Scrollable annual retirement projection table",
      tableCaption: "Annual retirement projection",
      tableHeaders: {
        age: "Age",
        year: "Year",
        openingBalance: "Opening balance",
        contributions: "Contributions",
        interest: "Investment growth",
        closingBalance: "Closing balance",
      },
      ageLabel: "Age {age}",
      copySummary: "Copy summary",
      copyTextProjection:
        "Retirement projection\nCurrent age: {currentAge}\nRetirement age: {retirementAge}\nCurrent retirement savings: {current}\nMonthly contribution: {contribution}\nExpected annual return: {rate}%\nCompounding: {frequency}\nContribution timing: {timing}\nYears to retirement: {duration}\nProjected retirement corpus: {corpus}\nTotal invested: {invested}\nProjected investment growth: {growth}",
      copyTextRequired:
        "Retirement savings plan\nCurrent age: {currentAge}\nRetirement age: {retirementAge}\nCurrent retirement savings: {current}\nNominal target corpus: {target}\nExpected annual return: {rate}%\nCompounding: {frequency}\nContribution timing: {timing}\nYears to retirement: {duration}\nRequired monthly savings: {required}\nTotal future contributions: {contributions}\nTotal invested: {invested}\nProjected investment growth: {growth}\nProjected corpus at retirement: {corpus}",
      copyRealLine: "Inflation-adjusted value: {value}",
      copyRealTargetLine: "Inflation-adjusted target: {value}",
      captionProjection: "Projected corpus of {corpus} at age {age}.",
      captionRequired: "{required} per month to reach {target} by age {age}.",
      formulas: {
        projection: {
          template: "FV = P × g^N + C × ((g^N − 1) ÷ i) × k",
          describe:
            "{rate}% nominal = {monthlyRate}% per month after compounding.",
        },
        required: {
          template: "C = (T − P × g^N) × i ÷ ((g^N − 1) × k)",
          describe:
            "{rate}% nominal = {monthlyRate}% per month after compounding.",
        },
      },
      timingValues: {
        end: "End of month",
        beginning: "Beginning of month",
      },
      errors: {
        currentAge: "Enter a current age between 18 and 99.",
        retirementAge: "Enter a retirement age between 19 and 100.",
        retirementOrder: "Retirement age must be later than current age.",
        savings: "Enter current retirement savings of 0 or more.",
        contribution: "Enter a monthly contribution of 0 or more.",
        target: "Enter a target retirement corpus greater than zero.",
        rate: "Enter an expected annual return of 0 or more.",
        inflation: "Enter an expected annual inflation rate of 0 or more.",
        frequency: "Choose a supported compounding frequency.",
        timing: "Choose a supported contribution timing.",
        noInvestment:
          "Enter current retirement savings or a monthly contribution greater than zero.",
        overflow:
          "The result is outside the supported numeric range. Try smaller values.",
      },
      sections: [
        {
          heading: "How it works",
          paragraphs: [
            "Enter your current age, retirement age, and current retirement savings. In projected corpus mode, add a monthly contribution and see what you could accumulate by retirement. In required monthly savings mode, enter a nominal target corpus and see the monthly amount needed to reach it.",
            "Everything runs in your browser. Changing any input clears the previous result so the figures on screen always match the current inputs.",
          ],
        },
        {
          heading: "Projected corpus and required monthly savings",
          paragraphs: [
            "The horizon is the whole number of years between your current age and retirement age, converted to months: `N = (retirementAge − currentAge) × 12`. Current savings grow for the full horizon: `FV_existing = P × g^N`.",
            "In projected corpus mode, the corpus is `FV = P × g^N + C × ((g^N − 1) ÷ i) × k`, where `C` is the monthly contribution and `k` is 1 for end-of-month contributions or `g` for beginning-of-month contributions.",
            "In required monthly savings mode, the target is reduced by the future value of current savings and divided by the same annuity factor: `C = (T − P × g^N) × i ÷ ((g^N − 1) × k)`. When the return is zero, the required amount is simply `(T − P) ÷ N`.",
          ],
        },
        {
          heading: "Return, compounding, and timing",
          paragraphs: [
            "The selected compounding frequency defines an equivalent monthly growth factor `g = (1 + r/m)^(m/12)`. Interest is accrued monthly at `i = g − 1`, matching the Compound Interest Calculator. Daily compounding uses a fixed 365-day year; leap years are ignored.",
            "Beginning-of-month contributions earn growth in the month they are added. End-of-month contributions begin earning in the following month.",
          ],
        },
        {
          heading: "Inflation-adjusted values",
          paragraphs: [
            "Inflation-adjusted values are estimates of today's purchasing power. The nominal projection is calculated separately.",
            "Entering an inflation rate does not change the nominal return, the nominal projection, or the target. It only adds `nominal ÷ (1 + inflation)^years` as a second view. The annual table stays nominal.",
            "The target corpus is always nominal. The inflation-adjusted target shows what that nominal amount is worth in today's money, not a target that changes automatically.",
          ],
        },
        {
          heading: "Assumptions and limits",
          items: [
            "The expected annual return is a nominal assumption you enter. It is not a guarantee, a forecast, or personalized investment advice.",
            "Contributions are monthly only and constant for the whole horizon. No annual contribution increases, withdrawals, missed contributions, fees, taxes, insurance, pensions, government benefits, or healthcare costs are modelled.",
            "Ages are whole years. The projection horizon is 1 to 82 years (12 to 984 months).",
            "The required monthly amount is rounded up to the next cent and the projection is rebuilt with that amount, so the final balance reaches or slightly exceeds the target.",
            "The calculator is currency-neutral. It does not convert currencies or add a currency symbol.",
            "Results use full precision internally. Money is shown with two decimal places, so annual rows can differ from exact totals by a small rounding amount.",
          ],
        },
        {
          heading: "Privacy",
          paragraphs: [
            "Everything is calculated in your browser. Your ages, savings, contributions, and annual projection are never uploaded, stored in browser storage, or sent to a third-party service.",
          ],
        },
      ],
    },
    scientificCalculator: {
      title: "Scientific Calculator — AppKitX",
      metaDescription:
        "Free scientific calculator: evaluate expressions with parentheses, powers, roots, logarithms, trigonometry, and constants, in degrees or radians.",
      name: "Scientific Calculator",
      description:
        "Evaluate scientific expressions with parentheses, powers, roots, logarithms, trigonometry, and constants — in degrees or radians.",
      cardDescription: "Expressions, trigonometry, logarithms, and constants.",
      keywords: [
        "scientific calculator",
        "scientific",
        "trigonometry",
        "sine",
        "cosine",
        "tangent",
        "logarithm",
        "factorial",
        "power",
        "root",
        "parentheses",
        "degrees",
        "radians",
        "math calculator",
      ],
      angleModeLegend: "Angle mode",
      angleModes: {
        degrees: "Degrees",
        radians: "Radians",
      },
      angleModeHint:
        "Trigonometric functions and inverse results use the selected angle mode.",
      expressionLabel: "Expression",
      expressionHint:
        "Use + − × ÷, parentheses, functions, and constants. Percent is postfix: 50% = 0.5. ± negates the whole expression.",
      expressionPlaceholder: "e.g. sin(30) + 2^3",
      keypadLabel: "Calculator keypad",
      functionKeys: {
        sin: { label: "sin", ariaLabel: "Sine" },
        cos: { label: "cos", ariaLabel: "Cosine" },
        tan: { label: "tan", ariaLabel: "Tangent" },
        asin: { label: "sin⁻¹", ariaLabel: "Inverse sine" },
        acos: { label: "cos⁻¹", ariaLabel: "Inverse cosine" },
        atan: { label: "tan⁻¹", ariaLabel: "Inverse tangent" },
        sinh: { label: "sinh", ariaLabel: "Hyperbolic sine" },
        cosh: { label: "cosh", ariaLabel: "Hyperbolic cosine" },
        tanh: { label: "tanh", ariaLabel: "Hyperbolic tangent" },
        ln: { label: "ln", ariaLabel: "Natural logarithm" },
        log: { label: "log", ariaLabel: "Base-10 logarithm" },
        exp: { label: "eˣ", ariaLabel: "Exponential" },
        sqrt: { label: "√", ariaLabel: "Square root" },
        cbrt: { label: "∛", ariaLabel: "Cube root" },
        root: { label: "ⁿ√", ariaLabel: "Nth root" },
        abs: { label: "|x|", ariaLabel: "Absolute value" },
        reciprocal: { label: "1/x", ariaLabel: "Reciprocal" },
        square: { label: "x²", ariaLabel: "Square" },
        cube: { label: "x³", ariaLabel: "Cube" },
        power: { label: "xʸ", ariaLabel: "Power" },
        factorial: { label: "n!", ariaLabel: "Factorial" },
        percent: { label: "%", ariaLabel: "Percent" },
        pi: { label: "π", ariaLabel: "Pi" },
        e: { label: "e", ariaLabel: "Euler's number" },
      },
      controlKeys: {
        add: { label: "+", ariaLabel: "Add" },
        subtract: { label: "−", ariaLabel: "Subtract" },
        multiply: { label: "×", ariaLabel: "Multiply" },
        divide: { label: "÷", ariaLabel: "Divide" },
        openParenthesis: { label: "(", ariaLabel: "Open parenthesis" },
        closeParenthesis: { label: ")", ariaLabel: "Close parenthesis" },
        comma: { label: ",", ariaLabel: "Comma" },
        decimal: { label: ".", ariaLabel: "Decimal point" },
        sign: { label: "±", ariaLabel: "Toggle sign" },
        clear: { label: "C", ariaLabel: "Clear" },
        backspace: { label: "⌫", ariaLabel: "Backspace" },
        equals: { label: "=", ariaLabel: "Equals" },
      },
      resultCaption: "{expression} = {result}",
      historyHeading: "History",
      historyHint:
        "Up to 20 calculations, stored only in this browser session.",
      historyEmpty: "No calculations yet.",
      historyResultLabel: "Result",
      useExpression: "Use expression",
      useResult: "Use result",
      keyboardHelp:
        "Type an expression, press Enter to calculate, and press Esc to clear.",
      errors: {
        empty: "Enter an expression.",
        invalid: "Check the expression and try again.",
        limits: "The expression is too long or too deeply nested.",
        "division-by-zero": "Division by zero is undefined.",
        domain: "This operation is undefined for those values.",
        overflow: "The result is outside the supported numeric range.",
        "factorial-range":
          "Factorial is defined only for whole numbers from 0 to 170.",
      },
      sections: [
        {
          heading: "How it works",
          paragraphs: [
            "Type an expression or use the keypad. The calculator follows standard precedence: parentheses first, then powers, then multiplication and division, then addition and subtraction.",
            "Press Equals or Enter to evaluate. Successful calculations are added to a history that lasts for this browser session, and any stored result can be reused in a new expression.",
          ],
        },
        {
          heading: "Scientific operations and angle mode",
          paragraphs: [
            "Use powers with `^`, roots with `sqrt`, `cbrt`, or `root(n, x)`, and functions such as `sin`, `ln`, `abs`, and `exp`. Factorial uses the postfix `!`; percent is also postfix, so `50%` means 0.5.",
            "Trigonometric input and inverse trigonometric output follow the selected angle mode. Hyperbolic functions are independent of the angle mode.",
          ],
        },
        {
          heading: "Precision and limits",
          paragraphs: [
            "Calculations use full double precision. Displayed results are rounded to 12 significant digits and switch to scientific notation for very large or very small values; history reuse stores 15 significant digits.",
            "Factorials are limited to whole numbers from 0 to 170. Expressions are limited to 500 characters and 32 nested levels. Division by zero, invalid domains, and non-finite results are rejected with an inline message.",
          ],
        },
        {
          heading: "History and keyboard",
          paragraphs: [
            "History is kept in memory for the current page session only. Reuse a stored expression to edit it, or insert its result into a new calculation.",
            "The expression field accepts keyboard input: Enter evaluates, Esc clears, and Backspace edits as usual.",
          ],
        },
        {
          heading: "Privacy",
          paragraphs: [
            "Everything is calculated in your browser. Expressions and history are never uploaded, stored in browser storage, or sent to a third-party service.",
          ],
        },
      ],
    },
    unitConverter: {
      title: "Unit Converter — AppKitX",
      metaDescription:
        "Free unit converter for length, weight, and temperature: convert metres to feet, kilograms to pounds, Celsius to Fahrenheit, and more.",
      name: "Unit Converter",
      description:
        "Convert length, weight, and temperature between metric and imperial units.",
      cardDescription: "Length, weight, and temperature conversions.",
      keywords: [
        "unit converter",
        "length",
        "weight",
        "mass",
        "temperature",
        "metric",
        "imperial",
        "meters",
        "feet",
        "kilograms",
        "pounds",
        "celsius",
        "fahrenheit",
        "inches",
        "miles",
        "ounces",
        "kelvin",
      ],
      categoryLegend: "Conversion",
      categories: {
        length: "Length",
        weight: "Weight",
        temperature: "Temperature",
      },
      units: {
        length: {
          mm: "Millimeter",
          cm: "Centimeter",
          m: "Meter",
          km: "Kilometer",
          in: "Inch",
          ft: "Foot",
          yd: "Yard",
          mi: "Mile",
        },
        weight: {
          mg: "Milligram",
          g: "Gram",
          kg: "Kilogram",
          t: "Metric ton",
          oz: "Ounce",
          lb: "Pound",
          st: "Stone",
        },
        temperature: {
          c: "Celsius",
          f: "Fahrenheit",
          k: "Kelvin",
        },
      },
      valueLabel: "Value",
      valueHint: "The number you want to convert.",
      fromLabel: "From",
      toLabel: "To",
      errors: {
        belowAbsoluteZero:
          "Temperature must be at or above absolute zero (−273.15 °C, −459.67 °F, or 0 K).",
      },
      caption: "{value} {from} = {result} {to}",
      copyText: "{value} {from} = {result} {to}",
      sections: [
        {
          heading: "How it works",
          paragraphs: [
            "Choose a conversion category, enter the value, and pick the units on both sides. Select Calculate to see the converted value and the same conversion written out in full.",
            "Everything runs in your browser. Values are converted as entered, so negative numbers work as expected for differences; for temperature they are checked against absolute zero.",
          ],
        },
        {
          heading: "Length and weight",
          paragraphs: [
            "Length and weight conversions multiply by exact definitions: `1 in = 2.54 cm`, `1 ft = 0.3048 m`, `1 mi = 1.609344 km`, `1 lb = 0.45359237 kg`, and `1 oz = 28.349523125 g`. Metric units use the standard prefixes, and `1 st = 14 lb`.",
          ],
        },
        {
          heading: "Temperature",
          paragraphs: [
            "Temperature is affine, not a simple ratio: `°F = °C × 9/5 + 32` and `K = °C + 273.15`. That is why doubling a Celsius value does not double the heat. Values below absolute zero are rejected instead of producing an impossible result.",
          ],
        },
        {
          heading: "Precision and assumptions",
          items: [
            "Results keep full precision internally and are shown with up to 10 significant digits, so small values stay readable and exact definitions do not collect rounding noise.",
            "The converter handles length, weight, and temperature only — not area, volume, speed, or currency — and it never guesses a unit from the input.",
            "Displayed numbers follow the page language: a decimal comma in Spanish and a decimal point in English.",
          ],
        },
      ],
    },
    speedConverter: {
      title: "Speed Converter — AppKitX",
      metaDescription:
        "Free speed converter for kilometers per hour, miles per hour, meters per second, feet per second, and knots — with exact results in your browser.",
      name: "Speed Converter",
      description:
        "Convert speeds between kilometers per hour, miles per hour, meters per second, feet per second, and knots.",
      cardDescription: "Convert between km/h, mph, m/s, ft/s, and knots.",
      keywords: [
        "speed",
        "velocity",
        "speed converter",
        "km/h",
        "kph",
        "mph",
        "m/s",
        "ft/s",
        "knots",
        "kilometers per hour",
        "miles per hour",
        "meters per second",
        "feet per second",
        "convert speed",
      ],
      units: {
        kmh: "Kilometer per hour",
        mph: "Mile per hour",
        ms: "Meter per second",
        fts: "Foot per second",
        kn: "Knot",
      },
      valueLabel: "Speed",
      valueHint: "The speed you want to convert.",
      fromLabel: "From",
      toLabel: "To",
      caption: "{value} {from} = {result} {to}",
      copyText: "{value} {from} = {result} {to}",
      resultOverflow:
        "The converted value is outside the supported numeric range. Try a value closer to zero.",
      sections: [
        {
          heading: "How it works",
          paragraphs: [
            "Enter the speed, choose the unit it is in and the unit you want, then select Calculate. The result appears with the same conversion written out in full, and you can copy it with one click.",
            "Everything runs in your browser. The converter keeps full precision internally and rounds only the displayed result.",
          ],
        },
        {
          heading: "Exact definitions",
          paragraphs: [
            "All five units are linear, so each conversion is a single multiplication: `1 m/s = 3.6 km/h`, `1 mph = 1.609344 km/h`, `1 ft/s = 1.09728 km/h`, and `1 kn = 1.852 km/h`.",
            "A knot is one nautical mile per hour, not a statute mile per hour, which is why `1 kn = 1.150779448 mph`.",
          ],
        },
        {
          heading: "Precision and assumptions",
          items: [
            "Results keep full precision internally and are shown with up to 10 significant digits, so small values stay readable and exact definitions do not collect rounding noise.",
            "Negative values are treated as signed velocities: they convert normally instead of being rejected.",
            "Displayed numbers follow the page language: a decimal comma in Spanish and a decimal point in English.",
          ],
        },
      ],
    },
    base64: {
      title: "Base64 Encoder — AppKitX",
      metaDescription:
        "Free Base64 encoder and decoder: convert text to Base64 and decode Base64 back to text, with UTF-8 support — everything runs in your browser.",
      name: "Base64 Encoder",
      description:
        "Convert text to Base64 and decode Base64 back to text — UTF-8 safe, with optional padding and URL-safe input.",
      cardDescription: "Encode text to Base64 and decode Base64 back to text.",
      keywords: [
        "base64",
        "encode",
        "decode",
        "encoder",
        "decoder",
        "convert",
        "text",
      ],
      modeLegend: "Mode",
      modes: {
        encode: {
          optionLabel: "Encode",
          inputLabel: "Text",
          inputHint: "Text is encoded as UTF-8 before converting to Base64.",
          outputLabel: "Base64",
          action: "Encode",
        },
        decode: {
          optionLabel: "Decode",
          inputLabel: "Base64",
          inputHint:
            "Standard or URL-safe Base64; padding is optional and whitespace is ignored.",
          outputLabel: "Text",
          action: "Decode",
        },
      },
      clear: "Clear",
      errors: {
        emptyEncode: "Enter the text you want to encode.",
        emptyDecode: "Enter the Base64 you want to decode.",
        invalid: "This isn't valid Base64 — check the characters and padding.",
      },
      statusIn: "Input: {count} characters",
      statusOut: "Output: {count} characters",
      sections: [
        {
          heading: "How it works",
          paragraphs: [
            "Paste or type into the input pane, choose Encode or Decode, and select the action. The result appears in the output pane and can be copied with one click.",
            "Everything runs in your browser: the text you paste is never sent to a server.",
          ],
        },
        {
          heading: "What Base64 is",
          paragraphs: [
            "Base64 represents data as 64 printable characters — `A–Z`, `a–z`, `0–9`, `+`, and `/` — so binary content can travel through text-only formats such as JSON, XML, email, and URLs.",
            "Base64 is an encoding, not encryption: anyone can decode it, so it must not be used to protect data.",
          ],
        },
        {
          heading: "Encoding text safely",
          paragraphs: [
            "Text is first converted to UTF-8 bytes and then to Base64, so accented characters, CJK text, and emoji convert correctly.",
            "Decoding converts the bytes back as UTF-8. Input whose bytes are not valid UTF-8 is rejected instead of producing garbled characters.",
          ],
        },
        {
          heading: "Assumptions and edge cases",
          items: [
            "Whitespace and line breaks in Base64 input are ignored, so wrapped output from other tools decodes as-is.",
            "Padding is optional: both `aGVsbG8=` and `aGVsbG8` decode to the same text.",
            "The URL-safe alphabet replaces `+` and `/` with `-` and `_`; it is accepted when decoding, while encoded output always uses the standard alphabet with padding.",
            "Characters outside the alphabet, misplaced padding, and byte sequences that are not valid UTF-8 are rejected with an inline message.",
            "Nothing is compressed, encrypted, or uploaded: text is converted entirely in your browser.",
          ],
        },
      ],
    },
    json: {
      title: "JSON Formatter — AppKitX",
      metaDescription:
        "Free JSON formatter: format JSON with two-space indentation, minify it, and get clear errors with line and column when the input is invalid.",
      name: "JSON Formatter",
      description:
        "Format JSON with two-space indentation, minify it, or check it for errors with line and column positions.",
      cardDescription: "Format, minify, and validate JSON in your browser.",
      keywords: [
        "json",
        "format",
        "formatter",
        "minify",
        "validate",
        "pretty print",
        "beautify",
      ],
      modeLegend: "Mode",
      modes: {
        format: { optionLabel: "Format", action: "Format" },
        minify: { optionLabel: "Minify", action: "Minify" },
      },
      inputLabel: "JSON",
      inputHint:
        "Paste or type JSON; invalid input is reported with a position when available.",
      outputLabel: "Output",
      clear: "Clear",
      errors: {
        empty: "Enter JSON to format.",
        invalid:
          "This isn't valid JSON — check for missing quotes, commas, or brackets.",
        invalidAt: "Invalid JSON at line {line}, column {column}.",
      },
      statusIn: "Input: {count} characters",
      statusOut: "Output: {count} characters",
      statusValid: "Valid JSON",
      statusInvalid: "Invalid JSON",
      sections: [
        {
          heading: "How it works",
          paragraphs: [
            "Paste or type JSON into the input pane, choose Format or Minify, and select the action. The result appears in the output pane, ready to copy.",
            "Everything runs in your browser: the JSON you paste is never sent to a server.",
          ],
        },
        {
          heading: "Formatting",
          paragraphs: [
            "Format re-prints the document with two-space indentation and line breaks, so nested objects and arrays are easy to read. Keys keep their original order.",
          ],
        },
        {
          heading: "Minifying",
          paragraphs: [
            "Minify removes all insignificant whitespace and produces the smallest text that represents the same data — useful before pasting JSON into configuration files or API payloads.",
          ],
        },
        {
          heading: "Assumptions and edge cases",
          items: [
            "Only whitespace changes: keys, values, and their order are preserved exactly as parsed.",
            "Any valid JSON value works — objects, arrays, strings, numbers, booleans, and `null`.",
            "Numbers are parsed as JavaScript numbers, so very large integers may lose precision when the result is re-printed.",
            "Duplicate keys keep the last value, matching `JSON.parse` behavior in browsers.",
            "When the input is invalid, the message shows the line and column where parsing stopped when that position can be determined, and the last valid output stays in the output pane.",
            "The input is only parsed as data — never evaluated — and results are rendered as plain text.",
          ],
        },
      ],
    },
    qrCodeGenerator: {
      title: "QR Code Generator — AppKitX",
      metaDescription:
        "Free client-side QR code generator for links, text, email, phone, SMS, Wi-Fi, and vCard contacts. Customize colors and size, then download PNG or SVG.",
      name: "QR Code Generator",
      description:
        "Generate customizable QR codes for links, text, contacts, Wi-Fi, and more — entirely in your browser.",
      cardDescription:
        "Generate customizable QR codes for links, text, contacts, and Wi-Fi.",
      keywords: [
        "qr",
        "qr code",
        "qr code generator",
        "generate qr",
        "wifi qr",
        "vcard",
        "contact qr",
        "sms qr",
        "url qr",
        "download qr",
      ],
      contentTypeLabel: "Content type",
      contentTypes: {
        url: "URL / Website",
        text: "Plain text",
        email: "Email address",
        phone: "Phone number",
        sms: "SMS",
        wifi: "Wi-Fi network",
        vcard: "vCard contact",
      },
      fields: {
        url: {
          label: "Website URL",
          hint: "Include https://, or we'll add it for you.",
          placeholder: "https://example.com",
        },
        text: {
          label: "Text",
          hint: "Any text, including line breaks.",
          placeholder: "Hello from AppKitX",
        },
        email: {
          label: "Email address",
          hint: "Encodes a mailto: link that opens the visitor's email app.",
          placeholder: "name@example.com",
        },
        phone: {
          label: "Phone number",
          hint: "Digits and an optional leading +. Spaces, dashes, and parentheses are removed.",
          placeholder: "+1 555 123 4567",
        },
        sms: {
          phone: {
            label: "Phone number",
            hint: "Digits and an optional leading +. Spaces, dashes, and parentheses are removed.",
            placeholder: "+1 555 123 4567",
          },
          message: {
            label: "Message (optional)",
            hint: "Leave empty to open the messaging app without a draft.",
            placeholder: "Hello!",
          },
        },
        wifi: {
          ssid: {
            label: "Network name (SSID)",
            hint: "The network name exactly as it appears in your device settings.",
            placeholder: "Studio Wi-Fi",
          },
          password: {
            label: "Password",
            hint: "Encoded in the QR code. Leave empty for an open network.",
            placeholder: "Network password",
          },
          passwordShow: "Show Wi-Fi password",
          passwordHide: "Hide Wi-Fi password",
          securityLabel: "Security",
          securityHint: "WPA covers WPA2 and WPA3.",
          securityOptions: {
            WPA: "WPA/WPA2/WPA3",
            WEP: "WEP",
            nopass: "None (open network)",
          },
          hiddenLabel: "Hidden network",
          hiddenHint: "Turn on if the network does not broadcast its SSID.",
        },
        vcard: {
          name: {
            label: "Name",
            hint: "The contact's display name.",
            placeholder: "Ada Lovelace",
          },
          phone: {
            label: "Phone number (optional)",
            hint: "Digits and an optional leading +.",
            placeholder: "+1 555 123 4567",
          },
          email: {
            label: "Email address (optional)",
            hint: "Adds the contact's email address.",
            placeholder: "ada@example.com",
          },
          organization: {
            label: "Organization (optional)",
            hint: "Company or group name.",
            placeholder: "Analytical Engines",
          },
          website: {
            label: "Website (optional)",
            hint: "Include https://, or we'll add it for you.",
            placeholder: "https://example.com",
          },
        },
      },
      customization: {
        heading: "Customize",
        foregroundLabel: "Foreground color",
        backgroundLabel: "Background color",
        sizeLabel: "Size",
        sizeHint: "PNG and SVG export at 256, 512, or 1024 px.",
        sizeOptions: {
          small: "Small",
          medium: "Medium",
          large: "Large",
        },
        eccLabel: "Error correction",
        eccHint: "Higher levels survive more damage but hold less data.",
        eccOptions: {
          L: "L — Low (7%)",
          M: "M — Medium (15%)",
          Q: "Q — Quartile (25%)",
          H: "H — High (30%)",
        },
        quietZoneLabel: "Include quiet zone",
        quietZoneHint: "Adds the standard 4-module margin scanners expect.",
      },
      preview: {
        heading: "Preview",
        placeholder: "Enter content to generate a QR code.",
        alt: "QR code for the content entered in the form.",
        downloadPng: "Download PNG",
        downloadSvg: "Download SVG",
        copyImage: "Copy image",
        copied: "QR code copied to the clipboard.",
        copyFailed: "Couldn't copy the image. Download the PNG instead.",
        copyUnsupported:
          "This browser can't copy images. Download the PNG instead.",
        capacityError:
          "This content is too long to fit in a QR code. Shorten it or choose a lower error-correction level.",
        privacyTitle: "Generated in your browser",
        privacyBody:
          "Your content is encoded locally and never uploaded, stored, or sent to a QR service.",
        warnings: {
          inverted:
            "This looks inverted. For reliable scanning, use a dark foreground on a light background.",
          lowContrast:
            "Low contrast may make this QR code hard to scan. Choose a darker foreground or a lighter background.",
        },
      },
      validation: {
        required: "This field is required.",
        invalidEmail: "Enter a valid email address.",
        invalidUrl: "Enter a valid website URL.",
        invalidPhone:
          "Enter a valid phone number (3–15 digits, optional leading +).",
        wifiPasswordRequired:
          "Enter the network password, or choose “None” for an open network.",
      },
      sections: [
        {
          heading: "How it works",
          paragraphs: [
            "Choose a content type, fill in the fields, and the preview updates as you type. Pick colors, size, and error correction, then download the PNG or SVG.",
            "Everything is generated in your browser. Test the code with your phone before printing or publishing it.",
          ],
        },
        {
          heading: "What each type encodes",
          paragraphs: [
            "URLs become a web address (`https://` is added when missing). Email opens a `mailto:` link, phone numbers use `tel:`, and SMS uses an `sms:` link with an optional encoded message.",
            "Wi-Fi uses the `WIFI:` format with the SSID, security type, and password. vCard contacts use `BEGIN:VCARD` with the name, phone, email, organization, and website you provide.",
          ],
        },
        {
          heading: "Scanning tips",
          items: [
            "Use a dark foreground on a light background. The default slate on white has strong contrast.",
            "Keep the quiet zone on: scanners expect a margin around the modules.",
            "Higher error correction survives more damage but fits less data; M is a good default.",
            "Test the downloaded code with more than one scanner before printing it at scale.",
          ],
        },
        {
          heading: "Privacy",
          paragraphs: [
            "No content is uploaded, stored, or sent to a third-party QR service. The generator runs entirely in this page, and no analytics event includes what you type.",
          ],
        },
      ],
    },
    wordCounter: {
      title: "Word Counter — AppKitX",
      metaDescription:
        "Free word counter: count words, characters, sentences, paragraphs, and lines as you type, with estimated reading and speaking time. Nothing is uploaded.",
      name: "Word Counter",
      description:
        "Count words, characters, sentences, paragraphs, and lines as you type, with estimated reading and speaking time — entirely in your browser.",
      cardDescription:
        "Count words, characters, sentences, and reading time as you type.",
      keywords: [
        "word counter",
        "word count",
        "character counter",
        "character count",
        "count words",
        "count characters",
        "sentence counter",
        "paragraph counter",
        "reading time",
        "speaking time",
        "text statistics",
      ],
      inputLabel: "Your text",
      inputHint: "Paste or type text; the statistics update as you go.",
      inputPlaceholder: "Paste or type your text here…",
      copyText: "Copy text",
      copySuccess: "Text copied to the clipboard.",
      copyFailure: "Couldn't copy the text. Select it and copy manually.",
      statsHeading: "Statistics",
      statsHint:
        "Words count Unicode letter, mark, and number runs; characters count user-perceived characters, not bytes.",
      emptyHint: "Start typing or paste text to see live counts.",
      stats: {
        characters: "Characters",
        charactersNoSpaces: "Characters (no spaces)",
        words: "Words",
        sentences: "Sentences",
        paragraphs: "Paragraphs",
        lines: "Lines",
        readingTime: "Reading time",
        speakingTime: "Speaking time",
      },
      duration: {
        seconds: "{seconds} s",
        minutes: "{minutes} min",
        minutesSeconds: "{minutes} min {seconds} s",
      },
      privacyTitle: "Counted in your browser",
      privacyBody:
        "Your text is analyzed locally and never uploaded, stored, or sent to a third-party service.",
      sections: [
        {
          heading: "How counting works",
          paragraphs: [
            "Words are counted as runs of Unicode letters, combining marks, digits, and numbers. Internal apostrophes and decimal separators stay inside a word; hyphens split words; punctuation-only and emoji-only content counts as zero.",
            "Characters are user-perceived characters, so an emoji or an accented letter counts once even when it uses several code units. The no-spaces count excludes spaces, tabs, and line breaks. Browsers without `Intl.Segmenter` use a built-in fallback for combining marks, variation selectors, emoji modifiers, zero-width joiner sequences, regional-indicator flags, tag sequences, and CRLF pairs; rare sequences such as Hangul jamo composition may still differ from full Unicode segmentation.",
          ],
        },
        {
          heading: "Sentences, paragraphs, and lines",
          paragraphs: [
            "A sentence ends at `.`, `!`, `?`, `…`, `।`, `॥`, or `۔` when followed by whitespace or the end of a paragraph. CJK full stops and exclamation/question marks (`。`, `！`, `？`) also end a sentence even without a following space. Consecutive endings count once, and decimal points or punctuation inside a URL do not split a sentence. Abbreviations such as `Dr.` are treated as sentence ends because they cannot be detected reliably.",
            "Paragraphs are separated by blank lines; single line breaks stay inside a paragraph. Lines count only non-empty lines.",
          ],
        },
        {
          heading: "Reading and speaking time",
          paragraphs: [
            "Reading time assumes 200 words per minute and speaking time assumes 130 words per minute. Both are rounded to the nearest second, with a one-second minimum for non-empty text. They are estimates for planning, not measurements of a specific reader or speaker.",
          ],
        },
        {
          heading: "Multilingual notes",
          paragraphs: [
            "Spanish accents and inverted punctuation need no special handling. Hindi words separated by spaces are counted individually, and `।` ends a sentence. Scripts that do not separate words with spaces, such as Chinese and Japanese, are counted as runs between spaces and punctuation; exact word boundaries in those scripts are a linguistic judgement, so the count is a consistent approximation rather than a dictionary segmentation.",
            "Emoji are characters but not words. The tool never treats symbols or punctuation as a word just because they are visible.",
          ],
        },
        {
          heading: "Privacy",
          paragraphs: [
            "Counting happens entirely in this page. Nothing you paste is uploaded, saved in browser storage, or included in an analytics event.",
          ],
        },
      ],
    },
    caseConverter: {
      title: "Case Converter — AppKitX",
      metaDescription:
        "Free case converter: switch text between uppercase, lowercase, title case, sentence case, camelCase, PascalCase, snake_case, kebab-case, and more — in your browser.",
      name: "Case Converter",
      description:
        "Convert text to uppercase, lowercase, title case, sentence case, camelCase, PascalCase, snake_case, kebab-case, and more — instantly, in your browser.",
      cardDescription:
        "Convert text to uppercase, lowercase, title case, camelCase, and more.",
      keywords: [
        "case converter",
        "uppercase",
        "lowercase",
        "title case",
        "sentence case",
        "capitalized case",
        "camelcase",
        "pascalcase",
        "snake case",
        "kebab case",
        "constant case",
        "alternating case",
        "change case",
        "text case",
      ],
      inputLabel: "Your text",
      inputHint: "Paste or type text; the result updates as you go.",
      inputPlaceholder: "Paste or type the text you want to convert…",
      modeLabel: "Conversion",
      modeHint: "Switching modes never changes your input.",
      modes: {
        uppercase: "UPPERCASE",
        lowercase: "lowercase",
        title: "Title Case",
        sentence: "Sentence case",
        capitalized: "Capitalized Case",
        camel: "camelCase",
        pascal: "PascalCase",
        snake: "snake_case",
        kebab: "kebab-case",
        constant: "CONSTANT_CASE",
        alternating: "Alternating case",
      },
      outputLabel: "Converted text",
      outputHint:
        "Read-only output. Copy it or switch modes without changing your input.",
      outputPlaceholder: "Converted text appears here.",
      copyOutput: "Copy output",
      copySuccess: "Output copied to the clipboard.",
      copyFailure: "Couldn't copy the output. Select it and copy manually.",
      privacyTitle: "Converted in your browser",
      privacyBody:
        "Your text is converted locally and never uploaded, stored, or sent to a third-party service.",
      sections: [
        {
          heading: "How it works",
          paragraphs: [
            "Paste or type into the input pane and choose a conversion. The output updates immediately and stays read-only, so switching modes always starts from your original text. Use Copy output to reuse the result.",
          ],
        },
        {
          heading: "Text cases",
          paragraphs: [
            "Sentence case lowercases the text and capitalizes the first letter of each line and each sentence. Capitalized Case capitalizes every word, including short words such as “of” and “the”. Title Case keeps a short list of English and Spanish articles, conjunctions, and prepositions lowercase unless they are the first or last word of a line or follow a colon or sentence ending.",
            "Alternating case changes the case of every letter in turn; spaces and punctuation do not count as letters.",
          ],
        },
        {
          heading: "Programming cases",
          paragraphs: [
            "camelCase, PascalCase, snake_case, kebab-case, and CONSTANT_CASE split the text into words, then join them with the chosen convention. Punctuation and line breaks are removed, apostrophes are dropped, and camel/Pascal boundaries such as `helloWorld` or `HTTPServer` are split before converting.",
          ],
        },
        {
          heading: "Unicode and limitations",
          paragraphs: [
            "Casing uses the browser's default Unicode mappings. Accented Spanish letters, Cyrillic, and Greek change case; scripts without case, such as Devanagari, Chinese, and Arabic, are unchanged by the text case modes. Programming modes still remove their spaces when joining words.",
            "Proper nouns and acronyms are not inferred: title and capitalized modes lowercase the rest of each word, so `AppKitX` becomes `Appkitx`. Turkish dotted and dotless `i` follow the default Unicode mapping rather than Turkish locale rules.",
            "Sentence case treats abbreviations such as `Dr.` as sentence ends because abbreviations cannot be detected reliably.",
          ],
        },
        {
          heading: "Privacy",
          paragraphs: [
            "Conversion happens entirely in this page. Nothing you paste is uploaded, saved in browser storage, or included in an analytics event.",
          ],
        },
      ],
    },
    dateCalculator: {
      title: "Date Calculator — AppKitX",
      metaDescription:
        "Free date calculator: count the days between two dates, or add and subtract days, weeks, months, and years — with month-end clamping and the resulting weekday.",
      name: "Date Calculator",
      description:
        "Count the days between two dates, or add and subtract days, weeks, months, and years.",
      cardDescription: "Days between dates, and add or subtract time.",
      keywords: [
        "date",
        "days between",
        "difference",
        "add",
        "subtract",
        "weeks",
        "months",
        "years",
        "duration",
      ],
      modeLegend: "Mode",
      modes: {
        difference: { optionLabel: "Difference" },
        shift: { optionLabel: "Add or subtract" },
      },
      startLabel: "Start date",
      endLabel: "End date",
      dateLabel: "Date",
      amountLabel: "Amount",
      amountHint: "A whole number; negative amounts subtract.",
      unitLabel: "Unit",
      units: {
        days: "Days",
        weeks: "Weeks",
        months: "Months",
        years: "Years",
      },
      daysLabel: "Days between",
      breakdownLabel: "Years, months, days",
      resultDateLabel: "Resulting date",
      weekdayLabel: "Weekday",
      errors: {
        emptyStart: "Enter a start date.",
        emptyEnd: "Enter an end date.",
        emptyDate: "Enter a date.",
        invalidStart: "Enter a valid start date.",
        invalidEnd: "Enter a valid end date.",
        invalidDate: "Enter a valid date.",
        amountRange: "Enter a whole number.",
        resultRange:
          "The resulting date is outside the supported range. Adjust the date or amount.",
      },
      differenceCaption: "From {from} to {to}.",
      shiftAddCaption: "Result of adding {amount} to {date}.",
      shiftSubtractCaption: "Result of subtracting {amount} from {date}.",
      differenceCopy:
        "{days} between {from} and {to}.\nYears, months, days: {breakdown}",
      shiftCopy: "{date} ({weekday})",
      sections: [
        {
          heading: "How it works",
          paragraphs: [
            "Pick Difference to count the days between two dates, or Add or subtract to shift a date by days, weeks, months, or years. Enter the dates, select Calculate, and the result appears below — everything runs in your browser.",
          ],
        },
        {
          heading: "Counting the days between dates",
          paragraphs: [
            "The difference is an exclusive day count: January 1 to January 2 is one day, and the same date is zero. Reversed dates give the same answer — the count is always absolute.",
            "Below the day count, the result also breaks the span into whole calendar years, months, and days, using the same month arithmetic as the add or subtract mode.",
          ],
        },
        {
          heading: "Adding and subtracting time",
          paragraphs: [
            "Days and weeks add exact day counts, so they are unaffected by month lengths. Months and years move whole calendar months and clamp to the last valid day of the target month: `January 31 + 1 month` is `February 28`, or `February 29` in a leap year.",
            "Enter a negative amount to subtract: `March 31 − 1 month` is `February 28`, or `February 29` in a leap year, with the same clamping applied backwards.",
          ],
        },
        {
          heading: "Assumptions and edge cases",
          items: [
            "Dates are treated as plain calendar dates — `2026-03-01` — with no time of day and no timezone, so daylight-saving changes can never shift a result.",
            "Amounts are whole numbers; negative amounts subtract. Fractional amounts are rejected with an inline message.",
            "The result includes the weekday of the resulting date in the add or subtract mode.",
            "Month-end clamping applies wherever months or years are moved: `August 31 + 1 month` is `September 30`, and `February 29, 2024 + 1 year` is `February 28, 2025`.",
            "Supported dates run from `0001-01-01` to `275759-12-31`; results outside that range are rejected with an inline message instead of an invalid date.",
            "Nothing is uploaded: the calculation runs entirely in your browser.",
          ],
        },
      ],
    },
    timeZoneConverter: {
      title: "Time Zone Converter — AppKitX",
      metaDescription:
        "Free time zone converter: convert a date and time between major IANA time zones, with UTC offsets, date changes, and daylight-saving warnings.",
      name: "Time Zone Converter",
      description:
        "Convert a date and time between time zones, with accurate UTC offsets, date changes, and daylight-saving warnings.",
      cardDescription:
        "Convert a date and time between time zones with UTC offsets and DST warnings.",
      keywords: [
        "time zone converter",
        "timezone converter",
        "time difference between cities",
        "convert time zones",
        "world clock converter",
        "time zone calculator",
        "daylight saving time converter",
        "utc time converter",
        "meeting time across time zones",
        "new york to london time",
        "est to ist",
      ],
      dateLabel: "Date",
      dateHint:
        "The date in the source time zone. Defaults to today on this device.",
      timeLabel: "Time",
      timeHint:
        "The local time in the source time zone. Defaults to the current time on this device.",
      sourceZoneLabel: "From time zone",
      sourceZoneHint: "The time zone the date and time are entered in.",
      targetZoneLabel: "To time zone",
      targetZoneHint: "The time zone to convert to.",
      useCurrentTime: "Use current time",
      convertedTimeLabel: "Converted time",
      convertedDateLabel: "Converted date",
      weekdayLabel: "Weekday",
      sourceOffsetLabel: "Source UTC offset",
      targetOffsetLabel: "Target UTC offset",
      differenceLabel: "Time difference",
      dayChangeLabel: "Day change",
      sourceSummaryLabel: "Source",
      targetSummaryLabel: "Target",
      summaryLine: "{time}, {date} — {label} ({zone})",
      deviceZoneSuffix: "device",
      zoneLabels: {
        UTC: "UTC",
        "America/New_York": "New York",
        "America/Los_Angeles": "Los Angeles",
        "America/Chicago": "Chicago",
        "America/Toronto": "Toronto",
        "Europe/London": "London",
        "Europe/Madrid": "Madrid",
        "Europe/Paris": "Paris",
        "Europe/Berlin": "Berlin",
        "Asia/Kolkata": "Kolkata",
        "Asia/Kathmandu": "Kathmandu",
        "Asia/Dubai": "Dubai",
        "Asia/Singapore": "Singapore",
        "Asia/Tokyo": "Tokyo",
        "Asia/Shanghai": "Shanghai",
        "Australia/Sydney": "Sydney",
        "Pacific/Auckland": "Auckland",
        "Pacific/Chatham": "Chatham",
        "Africa/Johannesburg": "Johannesburg",
        "America/Sao_Paulo": "São Paulo",
      },
      sameDay: "Same day",
      nextDay: "Next day",
      previousDay: "Previous day",
      daysAhead: "{count} days later",
      daysBehind: "{count} days earlier",
      sameTime: "Same time",
      differenceAhead: "{duration} ahead",
      differenceBehind: "{duration} behind",
      durationHours: "{hours} h",
      durationMinutes: "{minutes} min",
      durationHoursMinutes: "{hours} h {minutes} min",
      dstGap:
        "That local time does not exist in {zone} because the clocks move forward by {duration} for daylight saving. Choose a valid local time.",
      dstAmbiguous:
        "That local time occurs twice in {zone} because the clocks move back for daylight saving. The first occurrence ({offset}) was selected.",
      dataNote:
        "Offsets and daylight-saving rules come from your browser's time zone data. Supported dates run from 1900 to 2100.",
      comparisonHeading: "Major time zones",
      comparisonHint:
        "The same instant in fixed reference zones. Times are local and may fall on a different date.",
      comparisonEmpty: "Enter a valid date and time to see the comparison.",
      comparisonScrollLabel: "Scrollable time zone comparison table",
      comparisonCaption: "Time zone comparison",
      comparisonHeaders: {
        zone: "Time zone",
        date: "Date",
        time: "Time",
        offset: "UTC offset",
        day: "Day",
      },
      copySummary: "Copy summary",
      copyText:
        "Time zone conversion\n{sourceTime}, {sourceDate} — {sourceLabel} ({sourceZone})\n→ {targetTime}, {targetDate} — {targetLabel} ({targetZone})\nSource offset: {sourceOffset}\nTarget offset: {targetOffset}\nTime difference: {difference}",
      copyAmbiguousLine:
        "Daylight saving: this local time occurs twice; the first occurrence ({offset}) was selected.",
      caption: "Converted from {sourceTime} on {sourceDate} in {sourceLabel}.",
      errors: {
        date: "Enter a valid date.",
        dateRange: "Enter a date between 1900 and 2100.",
        time: "Enter a valid time.",
        sourceZone: "Choose a supported source time zone.",
        targetZone: "Choose a supported target time zone.",
        unexpected:
          "The conversion could not be completed. Check the date, time, and time zones.",
      },
      sections: [
        {
          heading: "How it works",
          paragraphs: [
            "Choose the date, time, and source time zone, then the target time zone. The converter treats the entered date and time as a wall-clock time in the source zone and finds the matching UTC instant. It then shows that instant in the target zone, with both UTC offsets.",
            "Changing any input clears the previous result so the figures on screen always match the current inputs. Everything runs in your browser.",
          ],
        },
        {
          heading: "Daylight saving: gaps and overlaps",
          paragraphs: [
            "When clocks move forward, some local times never occur. For example, 02:30 on 8 March 2026 does not exist in New York. The converter rejects a time inside that gap and asks you to choose a valid local time; it never silently shifts the result.",
            "When clocks move back, some local times occur twice. For example, 01:30 on 1 November 2026 occurs twice in New York. The converter selects the first occurrence, shows which UTC offset was used, and tells you the local time was ambiguous.",
          ],
        },
        {
          heading: "Offsets and the comparison table",
          paragraphs: [
            "Offsets are calculated for the converted instant, not for today, so summer and winter dates can show different offsets. Half-hour and quarter-hour offsets such as UTC+05:30, UTC+05:45, and UTC+12:45 are supported.",
            "The comparison table shows the same instant in fixed reference zones. A row can fall on the previous or next day relative to your source date.",
          ],
        },
        {
          heading: "Assumptions and limits",
          items: [
            "Time zone rules and offsets come from the browser's IANA time zone data. The converter does not ship its own time zone database.",
            "Supported dates run from 1900 to 2100. Historical accuracy before the browser's available data cannot be guaranteed.",
            "The tool converts one instant at a time. It does not plan meetings, highlight working hours, create calendar events, or convert recurring schedules.",
            "The curated list covers major zones plus your device zone. IANA identifiers are used internally; abbreviations such as EST or IST are not treated as unique zone names.",
          ],
        },
        {
          heading: "Privacy",
          paragraphs: [
            "Everything is calculated in your browser. Your dates, times, and selected time zones are never uploaded, stored in browser storage, or sent to a third-party service.",
          ],
        },
      ],
    },
    ageCalculator: {
      title: "Age Calculator — AppKitX",
      metaDescription:
        "Free age calculator: work out age in years, months, and days from a date of birth, plus total days lived — calculated as of your local calendar date.",
      name: "Age Calculator",
      description:
        "Work out age in years, months, and days from a date of birth, plus total days lived.",
      cardDescription: "Age in years, months, and days from a birth date.",
      keywords: [
        "age",
        "birthday",
        "date of birth",
        "how old",
        "years",
        "months",
        "days",
      ],
      birthLabel: "Date of birth",
      birthHint:
        "Age is calculated as of today. Feb 29 birthdays count on Feb 28 in non-leap years.",
      ageLabel: "Age",
      totalDaysLabel: "Total days lived",
      caption: "As of {date}.",
      copyText: "Age: {age}\nTotal days lived: {days}",
      errors: {
        empty: "Enter a date of birth.",
        invalid: "Enter a valid date of birth.",
        future: "Date of birth can't be in the future.",
      },
      sections: [
        {
          heading: "How it works",
          paragraphs: [
            "Enter the date of birth and select Calculate. The result shows the age in years, months, and days as of today, plus the total number of days lived — everything runs in your browser.",
          ],
        },
        {
          heading: "How age is counted",
          paragraphs: [
            "The age is measured in whole calendar years, months, and days: it increments on the birthday itself, so the day of birth counts as zero. The total days figure is an exact day count from the date of birth to today.",
            "Today means your device's local calendar date, not a server clock — the caption under the result shows the exact date used.",
          ],
        },
        {
          heading: "Leap day birthdays",
          paragraphs: [
            "For someone born on February 29, the birthday is counted on February 28 in non-leap years. This is the convention this tool uses — it is not a universal legal rule for official age.",
          ],
        },
        {
          heading: "Assumptions and edge cases",
          items: [
            "The date of birth must not be in the future; it is rejected with an inline message.",
            "Supported dates run from `0001-01-01` to `275759-12-31`; dates outside that range are rejected with an inline message.",
            "Only whole days are counted — no hours, minutes, or timezones are involved, so the result never depends on where you are.",
            "The calculation is done entirely in your browser; the date you enter is never uploaded.",
          ],
        },
      ],
    },
  },
};
