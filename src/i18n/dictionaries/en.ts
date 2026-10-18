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
    "Developer tools": {
      name: "Developer tools",
      page: {
        title: "Free Developer Tools — AppKitX",
        metaDescription:
          "Free browser-based developer tools: encode and decode Base64, and format, minify, or validate JSON. Nothing you paste is uploaded.",
        toolsHeading: "Free developer tools",
        intro: [
          "Two browser-based utilities for everyday developer work: convert text to Base64 and back, and format, minify, or validate JSON.",
          "Both run entirely in your browser — nothing you paste is uploaded anywhere. Each tool documents its behavior and edge cases, and every result can be copied with one click.",
        ],
      },
    },
    "Date & time": {
      name: "Date & time",
      page: {
        title: "Free Date & Time Tools — AppKitX",
        metaDescription:
          "Free date and age calculators: count the days between two dates, add or subtract days, weeks, months, and years, and work out your age in years, months, and days.",
        toolsHeading: "Free date & time tools",
        intro: [
          "Two browser-based tools for calendar math: count the days between two dates with a years, months, and days breakdown, or add and subtract days, weeks, months, and years with month-end clamping.",
          "The age calculator turns a date of birth into years, months, and days plus total days lived, counted as of your device's local calendar date. Both tools work with plain calendar dates — no timezones, nothing uploaded, and every result can be copied with one click.",
        ],
      },
    },
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
            "When the input is invalid, the message shows the line and column where parsing stopped when the browser reports one, and the last valid output stays in the output pane.",
            "The input is only parsed as data — never evaluated — and results are rendered as plain text.",
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
        amountRange: "Enter a whole number.",
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
            "Nothing is uploaded: the calculation runs entirely in your browser.",
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
            "Only whole days are counted — no hours, minutes, or timezones are involved, so the result never depends on where you are.",
            "The calculation is done entirely in your browser; the date you enter is never uploaded.",
          ],
        },
      ],
    },
  },
};
