import type { Dictionary } from "../dictionary";

/*
 * Spanish (es-ES) dictionary — the M4 pilot locale. Complete translation of
 * every user-facing string; the compiler enforces completeness through the
 * Dictionary type in src/i18n/config.ts.
 *
 * Conventions: figures and the percent sign keep the typographic space
 * recommended by RAE ("25 %"), numbers in prose use the Spanish decimal
 * comma and thousands point, and inline code in prose is marked with
 * backticks. A native-speaker review is a merge gate — see the PR.
 */
export const es: Dictionary = {
  layout: {
    defaultTitle: "AppKitX — Herramientas online gratuitas",
    defaultDescription:
      "Calculadoras, conversores y utilidades para desarrolladores, gratis y en un solo lugar.",
    skipToContent: "Saltar al contenido",
  },
  nav: {
    ariaLabel: "Global",
    tools: "Herramientas",
    categories: "Categorías",
    about: "Acerca de",
    searchLabel: "Buscar",
    searchShortcut: "⌘K",
    menuAriaLabel: "Menú",
  },
  language: {
    label: "Idioma",
    ariaLabel: "Idioma",
  },
  footer: {
    columns: {
      tools: {
        heading: "Herramientas",
        percentageCalculator: "Calculadora de porcentajes",
        discountCalculator: "Calculadora de descuentos",
        unitConverter: "Conversor de unidades",
        loanCalculator: "Calculadora de préstamos",
        dateCalculator: "Calculadora de fechas",
      },
      categories: {
        heading: "Categorías",
        calculators: "Calculadoras",
        converters: "Conversores",
        developerTools: "Herramientas de desarrollo",
      },
      company: {
        heading: "Empresa",
        about: "Acerca de",
        contact: "Contacto",
      },
      legal: {
        heading: "Legal",
        privacy: "Privacidad",
        terms: "Términos",
      },
    },
    copyright: "© 2026 AppKitX",
  },
  search: {
    label: "Buscar herramientas",
    placeholder: "Buscar herramientas…",
    pagePlaceholder: "Buscar herramientas gratis…",
    escapeKey: "Esc",
    resultsLabel: "Herramientas",
    noResults: "Ninguna herramienta coincide con «{query}»",
    noResultsStatus: "Ninguna herramienta coincide con {query}",
    suggestion: "Prueba con otra palabra o",
    browseAll: "explora todas las herramientas",
    countOne: "{count} herramienta",
    countMany: "{count} herramientas",
  },
  notFound: {
    title: "Página no encontrada — AppKitX",
    metaDescription:
      "La página que buscas no existe. Busca una herramienta o explora las calculadoras de AppKitX.",
    heading: "Página no encontrada",
    body: "La página que buscas no existe o puede que se haya movido.",
    goHome: "Ir a la página de inicio",
  },
  home: {
    heroTitle: "Herramientas gratis para el día a día.",
    heroSubline:
      "Calculadoras, conversores y utilidades para desarrolladores, todo en un solo lugar.",
    browseByCategory: "Explorar por categoría",
    exploreHeading: "Explora el conjunto de herramientas.",
    placeholderTools: {
      unitConverter: {
        title: "Conversor de unidades",
        description: "Longitud, peso, temperatura y más.",
      },
      loanCalculator: {
        title: "Calculadora de préstamos",
        description: "Cuotas mensuales, intereses y coste total.",
      },
      dateCalculator: {
        title: "Calculadora de fechas",
        description: "Días entre fechas, sumar o restar tiempo.",
      },
      base64Encoder: {
        title: "Codificador Base64",
        description: "Codifica y descodifica Base64 en tu navegador.",
      },
      jsonFormatter: {
        title: "Formateador JSON",
        description: "Formatea, valida e inspecciona JSON.",
      },
    },
  },
  categories: {
    Calculators: {
      name: "Calculadoras",
      page: {
        title: "Calculadoras online gratis — AppKitX",
        metaDescription:
          "Calculadoras gratis de porcentajes y descuentos: calcula el X % de un número, la variación porcentual o el precio final tras un descuento.",
        toolsHeading: "Calculadoras online gratis",
        intro: [
          "Dos calculadoras cubren las cuentas de porcentajes del día a día: calcula el X % de un número, averigua qué porcentaje representa un valor de otro, mide aumentos y disminuciones porcentuales y comprueba cuánto ahorras con un descuento y el precio final.",
          "Ambas funcionan por completo en tu navegador, muestran la fórmula de cada resultado y permiten copiarlo con un clic. Los importes se tratan tal como los escribes: la calculadora de descuentos es neutral respecto a la moneda y los resultados solo se redondean para mostrarlos.",
        ],
      },
    },
    Converters: { name: "Conversores" },
    "Developer tools": { name: "Herramientas de desarrollo" },
    "Date & time": { name: "Fecha y hora" },
    "Text tools": { name: "Herramientas de texto" },
  },
  toolLayout: {
    breadcrumbLabel: "Ruta de navegación",
    breadcrumbHome: "Inicio",
    relatedTools: "Herramientas relacionadas",
    seeAll: "Ver todas",
  },
  categoryLayout: {
    breadcrumbLabel: "Ruta de navegación",
  },
  toolCard: {
    openTool: "Abrir herramienta",
  },
  calculator: {
    calculate: "Calcular",
    reset: "Restablecer",
    resultLabel: "Resultado",
    resultsPlaceholder: "Los resultados aparecen aquí",
    formulaLabel: "Fórmula:",
    invalidNumber: "Introduce un número válido.",
    copyResult: "Copiar resultado",
    copied: "Copiado al portapapeles.",
    copyFailed:
      "No se pudo copiar: selecciona el texto del resultado y cópialo manualmente.",
  },
  tools: {
    percentage: {
      title: "Calculadora de porcentajes — AppKitX",
      metaDescription:
        "Calculadora de porcentajes gratis: calcula el X % de Y, qué porcentaje es un número de otro y el aumento o la disminución porcentual.",
      name: "Calculadora de porcentajes",
      description:
        "Calcula un porcentaje de un número, qué porcentaje es un número de otro o la variación entre dos valores.",
      cardDescription:
        "Porcentajes, propinas, descuentos y variación porcentual.",
      keywords: [
        "porcentaje",
        "por ciento",
        "tanto por ciento",
        "propina",
        "aumento",
        "disminución",
        "variación",
        "cambio",
        "parte",
        "de",
      ],
      modeLegend: "Modo",
      modes: {
        "percent-of": {
          optionLabel: "X % de Y",
          labelA: "Porcentaje (X %)",
          hintA: "El porcentaje que se aplica.",
          labelB: "Valor (Y)",
          hintB: "El número del que se calcula el porcentaje.",
        },
        "what-percent": {
          optionLabel: "¿Qué %?",
          labelA: "Parte (X)",
          hintA: "El número que estás comparando.",
          labelB: "Total (Y)",
          hintB: "El número con el que lo comparas.",
        },
        "percent-change": {
          optionLabel: "% de cambio",
          labelA: "De (valor original)",
          hintA: "El valor inicial. Debe ser mayor que cero.",
          labelB: "A (nuevo valor)",
          hintB: "El valor después del cambio.",
        },
      },
      undefinedResult: "Indefinido",
      captions: {
        percentOf: "{percent} % de {value}.",
        whatPercent: "{part} de {whole}.",
        noChange: "Sin cambios de {from} a {to}.",
        change: "De {from} a {to}.",
        divideByZero:
          "No se puede dividir entre 0: el total no puede ser cero.",
        changeFromZero:
          "No se puede calcular la variación porcentual desde 0: el valor original no puede ser cero.",
        changeFromNegative:
          "La variación porcentual no está definida para un valor original negativo: usa un valor inicial positivo.",
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
          template: "((A − De) ÷ De) × 100",
          describe: "(({b} − {a}) ÷ {a}) × 100 = {result}",
        },
      },
      results: {
        plain: "{value}",
        percent: "{value} %",
        increase: "{value} % de aumento",
        decrease: "{value} % de disminución",
        zero: "0 %",
      },
      sections: [
        {
          heading: "Cómo funciona",
          paragraphs: [
            "La calculadora cubre tres problemas comunes con porcentajes. Elige un modo, introduce dos números y pulsa Calcular. Los resultados se actualizan al momento, sin recargar la página, y puedes copiarlos con un solo clic.",
          ],
        },
        {
          heading: "Calcula el X % de Y",
          paragraphs: [
            "Multiplica el valor por el porcentaje y divide entre 100: la forma estándar de calcular un porcentaje de un número.",
            "Fórmula: `(X ÷ 100) × Y`. Ejemplo: el 25 % de 80 es `(25 ÷ 100) × 80 = 20`.",
          ],
        },
        {
          heading: "¿Qué porcentaje es X de Y?",
          paragraphs: [
            "Divide el primer número entre el segundo y multiplica por 100 para expresarlo como parte del total.",
            "Fórmula: `(X ÷ Y) × 100`. Ejemplo: 20 de 80 es `(20 ÷ 80) × 100 = 25 %`.",
          ],
        },
        {
          heading: "Variación porcentual",
          paragraphs: [
            "Mide el aumento o la disminución de un valor original a un valor nuevo, como porcentaje del original.",
            "Fórmula: `((A − De) ÷ De) × 100`. Ejemplo: de 80 a 100 es `((100 − 80) ÷ 80) × 100 = 25 %`, un aumento del 25 %.",
          ],
        },
        {
          heading: "Supuestos y casos límite",
          items: [
            "Los resultados se calculan con precisión completa y solo se redondean para mostrarlos: hasta seis decimales y sin ceros finales.",
            "Se admiten entradas negativas y decimales, y se aplican tal cual; no se ajusta ningún valor.",
            "Dividir entre cero es indefinido: el modo «¿Qué %?» requiere un total distinto de cero. La variación porcentual requiere un valor original positivo: una base cero divide entre cero y una base negativa produciría un aumento o una disminución engañosos. La calculadora explica estos casos en lugar de mostrar Infinity, NaN o un porcentaje engañoso.",
            "Un aumento y una disminución de la misma cantidad no son simétricos: pasar de 80 a 100 es un aumento del 25 %, pero volver de 100 a 80 es una disminución del 20 %, porque la variación siempre es relativa al valor original.",
          ],
        },
      ],
    },
    discount: {
      title: "Calculadora de descuentos — AppKitX",
      metaDescription:
        "Calculadora de descuentos gratis: calcula cuánto ahorras y el precio final tras un descuento porcentual, en cualquier moneda.",
      name: "Calculadora de descuentos",
      description:
        "Calcula cuánto ahorras y el precio final tras un descuento, en cualquier moneda.",
      cardDescription: "Ahorro y precio final tras un descuento.",
      keywords: [
        "descuento",
        "oferta",
        "ahorro",
        "precio",
        "rebaja",
        "reducción",
        "precio final",
        "liquidación",
      ],
      priceLabel: "Precio original",
      priceHint: "El precio antes del descuento, en cualquier moneda.",
      percentLabel: "Porcentaje de descuento (%)",
      percentHint: "Un porcentaje entre 0 y 100.",
      finalPriceLabel: "Precio final",
      savingsLabel: "Ahorras",
      errors: {
        negativePrice: "Introduce un precio de 0 o más.",
        percentRange: "Introduce un descuento entre 0 y 100.",
      },
      caption: "{percent} % de descuento sobre {price}.",
      copyText: "Precio final: {price}\nAhorras: {savings}",
      formulas: {
        template:
          "descuento = (precio × porcentaje) ÷ 100 · final = precio − descuento",
        describe:
          "descuento = ({price} × {percent}) ÷ 100 = {savings} · final = {price} − {savings} = {final}",
      },
      sections: [
        {
          heading: "Cómo funciona",
          paragraphs: [
            "Introduce el precio original y el porcentaje de descuento, y pulsa Calcular. La calculadora muestra el importe ahorrado y el precio final. Ambos resultados usan las mismas unidades monetarias que el precio que introduces: la calculadora nunca asume una moneda.",
          ],
        },
        {
          heading: "Las fórmulas",
          paragraphs: [
            "Importe del descuento: `precio × porcentaje ÷ 100`. Precio final: `precio − importe del descuento`.",
          ],
        },
        {
          heading: "Ejemplos resueltos",
          paragraphs: [
            "Un descuento del 20 % sobre un precio de 100 ahorra `(100 × 20) ÷ 100 = 20`, así que el precio final es `100 − 20 = 80`.",
            "Un descuento del 15 % sobre un precio de 19,99 ahorra `(19,99 × 15) ÷ 100 ≈ 3`, así que el precio final es unos `16,99`.",
          ],
        },
        {
          heading: "Supuestos y casos límite",
          items: [
            "El precio original puede ser cero o más; el porcentaje de descuento debe estar entre 0 y 100, ambos incluidos. Los valores fuera de estos rangos se rechazan con un mensaje en línea en lugar de ajustarse en silencio.",
            "Se admiten precios y porcentajes decimales. Los resultados se calculan con precisión completa y solo se redondean para mostrarlos: como máximo dos decimales y sin ceros finales.",
            "Un descuento del 100 % deja el precio final en cero, y un descuento del 0 % deja el precio sin cambios.",
            "Ambos resultados usan las mismas unidades monetarias que el precio introducido; la calculadora es neutral respecto a la moneda y no hace conversión de divisas.",
          ],
        },
      ],
    },
  },
};
