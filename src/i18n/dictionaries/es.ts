import type { Dictionary } from "../dictionary";

/*
 * Spanish (es-ES) dictionary — the M4 pilot locale. Complete translation of
 * every user-facing string; the compiler enforces completeness through the
 * Dictionary type in src/i18n/config.ts and the parity tests compare tokens
 * and inline-code markers against English.
 *
 * TRANSLATION STATUS: provisional. The copy was compared against the English
 * source using an online translation service, but it has not received
 * native-speaker review. src/i18n/config.ts records the machine-readable
 * status, and TRANSLATION-REVIEWS.md tracks the outstanding review. Automated
 * tests prove structural completeness, never linguistic quality.
 *
 * Conventions: figures and the percent sign keep the typographic space
 * recommended by RAE ("25 %"), numbers in prose use the Spanish decimal
 * comma and thousands point, and inline code in prose is marked with
 * backticks.
 */
export const es: Dictionary = {
  layout: {
    defaultTitle: "AppKitX — Herramientas online gratuitas",
    defaultDescription:
      "Calculadoras, conversores de unidades, utilidades para desarrolladores, herramientas de texto y herramientas de fecha y hora, gratis y en un solo lugar.",
    socialImageAlt:
      "AppKitX — herramientas online gratuitas: calculadoras, conversores de unidades, utilidades para desarrolladores, herramientas de texto y herramientas de fecha y hora.",
    skipToContent: "Saltar al contenido",
  },
  nav: {
    ariaLabel: "Global",
    tools: "Herramientas",
    categories: "Categorías",
    guides: "Guías",
    about: "Acerca de",
    searchLabel: "Buscar",
    searchShortcut: "⌘K",
    menuAriaLabel: "Menú",
  },
  language: {
    label: "Idioma",
    ariaLabel: "Idioma",
    provisional: "Traducción provisional",
  },
  footer: {
    columns: {
      tools: {
        heading: "Herramientas",
      },
      categories: {
        heading: "Categorías",
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
        affiliateDisclosure: "Divulgación de afiliados",
      },
    },
    guides: "Guías de hardware",
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
      "Calculadoras, conversores de unidades, utilidades para desarrolladores, herramientas de texto y herramientas de fecha y hora, todo en un solo lugar.",
    browseByCategory: "Explorar por categoría",
    exploreHeading: "Explora el conjunto de herramientas.",
  },
  categories: {
    Calculators: {
      name: "Calculadoras",
      page: {
        title: "Calculadoras online gratis — AppKitX",
        metaDescription:
          "Calculadoras gratis de porcentajes, descuentos y préstamos: calcula variaciones, el precio final de un descuento y la cuota e intereses de un préstamo.",
        toolsHeading: "Calculadoras online gratis",
        intro: [
          "Las calculadoras cubren las cuentas del día a día: calcula el X % de un número, averigua qué porcentaje representa un valor de otro, mide aumentos y disminuciones porcentuales, comprueba cuánto ahorras con un descuento y su precio final y estima la cuota mensual, los intereses totales y el coste total de un préstamo.",
          "Funcionan por completo en tu navegador, muestran la fórmula de cada resultado y permiten copiarlo con un clic. Los importes se tratan tal como los escribes: las calculadoras de descuentos y préstamos son neutrales respecto a la moneda y los resultados solo se redondean para mostrarlos.",
        ],
      },
    },
    Converters: {
      name: "Conversores",
      page: {
        title: "Conversores de unidades y velocidad gratis — AppKitX",
        metaDescription:
          "Conversores online gratis de longitud, peso, temperatura y velocidad: cambia entre unidades métricas e imperiales, km/h y mph, m/s, pies/s y nudos.",
        toolsHeading: "Conversores online gratis",
        intro: [
          "Los conversores cubren las medidas que más se cambian en el día a día: longitud y distancia, peso, temperatura y velocidad. Elige las unidades de origen y destino y obtén el resultado con la misma conversión escrita completa.",
          "Todo se ejecuta en tu navegador, los resultados conservan la precisión completa internamente y solo se redondean para mostrarlos, y cada conversión se puede copiar con un clic. Los números siguen el idioma de la página, incluido el separador decimal.",
        ],
      },
    },
    "Developer tools": {
      name: "Herramientas de desarrollo",
      page: {
        title: "Herramientas de desarrollo gratis — AppKitX",
        metaDescription:
          "Herramientas de desarrollo gratis en tu navegador: codifica y descodifica Base64, formatea y valida JSON y genera códigos QR personalizables. Nada de lo que escribes se sube.",
        toolsHeading: "Herramientas de desarrollo gratis",
        intro: [
          "Utilidades en el navegador para el trabajo diario de desarrollo: convierte texto a Base64 y viceversa, formatea, minimiza o valida JSON y genera códigos QR para enlaces, texto, datos de contacto, Wi-Fi y más.",
          "Se ejecutan por completo en tu navegador: nada de lo que pegas o escribes se sube a ningún sitio. Cada herramienta documenta su comportamiento y sus casos límite, y todos los resultados se pueden copiar o descargar.",
        ],
      },
    },
    "Date & time": {
      name: "Fecha y hora",
      page: {
        title: "Herramientas de fecha y hora gratis — AppKitX",
        metaDescription:
          "Calculadoras de fechas y de edad gratis: cuenta los días entre dos fechas, suma o resta días, semanas, meses y años y calcula la edad en años, meses y días.",
        toolsHeading: "Herramientas de fecha y hora gratis",
        intro: [
          "Herramientas en el navegador para cuentas con el calendario: cuenta los días entre dos fechas con un desglose en años, meses y días, o suma y resta días, semanas, meses y años con ajuste de fin de mes.",
          "La calculadora de edad convierte una fecha de nacimiento en años, meses y días, además de los días vividos totales, contados a fecha del calendario local de tu dispositivo. Las herramientas trabajan con fechas de calendario simples: sin zonas horarias, sin subir nada y con todos los resultados copiables con un clic.",
        ],
      },
    },
    "Text tools": {
      name: "Herramientas de texto",
      page: {
        title: "Herramientas de texto gratis — AppKitX",
        metaDescription:
          "Herramientas de texto gratis en tu navegador: cuenta palabras, caracteres, frases y tiempo de lectura, y convierte texto a mayúsculas, minúsculas, tipo título, tipo oración y casos de programación. Nada de lo que escribes se sube.",
        toolsHeading: "Herramientas de texto gratis",
        intro: [
          "Las herramientas de texto cubren las tareas de escritura y edición del día a día: mide las palabras, caracteres, frases, párrafos y el tiempo estimado de lectura o de habla de un borrador, o cambia el texto entre mayúsculas, minúsculas, tipo título, tipo oración y casos de programación.",
          "Funcionan por completo en tu navegador: nada de lo que pegas o escribes se sube, se almacena ni se envía a un servicio de terceros. Cada herramienta documenta sus reglas de recuento y conversión, incluido lo que cambia en escrituras no latinas, y el texto convertido se puede copiar con un clic.",
        ],
      },
    },
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
    comingSoon: "Próximamente",
  },
  calculator: {
    calculate: "Calcular",
    reset: "Restablecer",
    resultLabel: "Resultado",
    resultsPlaceholder: "Los resultados aparecen aquí",
    formulaLabel: "Fórmula:",
    invalidNumber: "Introduce un número válido.",
    ambiguousNumber:
      "Revisa el formato del número: usa un solo separador decimal, por ejemplo 19,99.",
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
    loanCalculator: {
      title: "Calculadora de préstamos — AppKitX",
      metaDescription:
        "Calculadora de préstamos gratis: calcula la cuota mensual, los intereses totales y el total a devolver para cualquier importe, tipo anual y plazo.",
      name: "Calculadora de préstamos",
      description:
        "Calcula la cuota mensual, los intereses totales y el coste total de un préstamo a partir del importe, el tipo anual y el plazo.",
      cardDescription: "Cuotas mensuales, intereses y coste total.",
      keywords: [
        "préstamo",
        "hipoteca",
        "cuota",
        "interés",
        "amortización",
        "financiación",
        "préstamo personal",
        "préstamo de coche",
        "capital",
        "emi",
      ],
      amountLabel: "Importe del préstamo",
      amountHint:
        "El importe prestado antes de intereses, en cualquier moneda.",
      rateLabel: "Tipo de interés anual (%)",
      rateHint:
        "El tipo anual aplicado al saldo. Escribe 0 si el préstamo no tiene intereses.",
      termLabel: "Plazo del préstamo",
      termHint:
        "El tiempo para devolverlo. El plazo debe estar entre un mes y 100 años.",
      termUnitLabel: "Unidad del plazo",
      termUnits: {
        years: "Años",
        months: "Meses",
      },
      monthlyLabel: "Cuota mensual",
      interestLabel: "Intereses totales",
      totalLabel: "Total a devolver",
      errors: {
        amount: "Escribe un importe de préstamo mayor que cero.",
        rate: "Escribe un tipo de interés de 0 o más.",
        term: "Escribe un plazo de entre 1 y 1.200 meses (100 años).",
      },
      caption: "{amount} al {rate} % durante {months} meses.",
      copyText:
        "Cuota mensual: {monthly}\nIntereses totales: {interest}\nTotal a devolver: {total}",
      formulas: {
        template: "EMI = P × r × (1 + r)ⁿ ÷ ((1 + r)ⁿ − 1)",
        describe: "{rate} % ÷ 12 = {monthlyRate} % al mes",
      },
      sections: [
        {
          heading: "Cómo funciona",
          paragraphs: [
            "Introduce el importe prestado, el tipo de interés anual y el plazo de devolución. Indica si el plazo está en años o en meses y pulsa Calcular. La calculadora muestra la cuota mensual fija, los intereses totales durante la vida del préstamo y el importe total devuelto.",
            "La calculadora es neutral respecto a la moneda: usa la moneda en la que escribas el importe y nunca convierte entre divisas. Todo se ejecuta en tu navegador.",
          ],
        },
        {
          heading: "La fórmula",
          paragraphs: [
            "La cuota mensual sigue la fórmula estándar de anualidad: `EMI = P × r × (1 + r)ⁿ ÷ ((1 + r)ⁿ − 1)`, donde `P` es el capital, `r` es el tipo anual dividido entre 12 y entre 100, y `n` es el número de cuotas mensuales.",
            "Un tipo cero se trata aparte: la cuota mensual es simplemente `capital ÷ meses` y los intereses totales son cero.",
          ],
        },
        {
          heading: "Ejemplo resuelto",
          paragraphs: [
            "Un préstamo de 100.000 al 6 % anual a 30 años tiene `r = 6 ÷ 12 ÷ 100 = 0,005` y `n = 30 × 12 = 360` cuotas mensuales. La cuota mensual es de unos `599,55`, el total devuelto ronda `215.838` y los intereses totales, `115.838`.",
          ],
        },
        {
          heading: "Supuestos y casos límite",
          items: [
            "El tipo se mantiene fijo durante todo el plazo y los intereses se cobran cada mes sobre el saldo pendiente. No se incluyen préstamos a tipo variable, comisiones, seguros ni impuestos.",
            "El plazo debe estar entre un mes y 1.200 meses (100 años). Los plazos fuera de ese rango se rechazan con un mensaje en línea en lugar de ajustarse en silencio.",
            "Los resultados se calculan con precisión completa y solo se redondean a dos decimales para mostrarlos. La última cuota de un préstamo real puede diferir en unos céntimos porque los prestamistas redondean cada plazo.",
            "La calculadora es neutral respecto a la moneda y no asume nada sobre la divisa, la fecha de pago ni las reglas de redondeo del prestamista.",
          ],
        },
      ],
    },
    unitConverter: {
      title: "Conversor de unidades — AppKitX",
      metaDescription:
        "Conversor de unidades gratis para longitud, peso y temperatura: convierte metros a pies, kilos a libras, grados Celsius a Fahrenheit y más.",
      name: "Conversor de unidades",
      description:
        "Convierte longitud, peso y temperatura entre unidades métricas e imperiales.",
      cardDescription: "Conversiones de longitud, peso y temperatura.",
      keywords: [
        "conversor",
        "unidades",
        "longitud",
        "peso",
        "masa",
        "temperatura",
        "métrico",
        "imperial",
        "metros",
        "pies",
        "kilos",
        "libras",
        "celsius",
        "fahrenheit",
        "pulgadas",
        "millas",
        "onzas",
        "kelvin",
      ],
      categoryLegend: "Conversión",
      categories: {
        length: "Longitud",
        weight: "Peso",
        temperature: "Temperatura",
      },
      units: {
        length: {
          mm: "Milímetro",
          cm: "Centímetro",
          m: "Metro",
          km: "Kilómetro",
          in: "Pulgada",
          ft: "Pie",
          yd: "Yarda",
          mi: "Milla",
        },
        weight: {
          mg: "Miligramo",
          g: "Gramo",
          kg: "Kilogramo",
          t: "Tonelada métrica",
          oz: "Onza",
          lb: "Libra",
          st: "Piedra",
        },
        temperature: {
          c: "Celsius",
          f: "Fahrenheit",
          k: "Kelvin",
        },
      },
      valueLabel: "Valor",
      valueHint: "El número que quieres convertir.",
      fromLabel: "De",
      toLabel: "A",
      errors: {
        belowAbsoluteZero:
          "La temperatura debe ser igual o superior al cero absoluto (−273,15 °C, −459,67 °F o 0 K).",
      },
      caption: "{value} {from} = {result} {to}",
      copyText: "{value} {from} = {result} {to}",
      sections: [
        {
          heading: "Cómo funciona",
          paragraphs: [
            "Elige una categoría de conversión, escribe el valor y selecciona las unidades en ambos lados. Pulsa Calcular para ver el valor convertido y la misma conversión escrita completa.",
            "Todo se ejecuta en tu navegador. Los valores se convierten tal como se escriben, así que los números negativos funcionan como diferencias; en temperatura se comprueba el cero absoluto.",
          ],
        },
        {
          heading: "Longitud y peso",
          paragraphs: [
            "Las conversiones de longitud y peso multiplican por definiciones exactas: `1 in = 2,54 cm`, `1 ft = 0,3048 m`, `1 mi = 1,609344 km`, `1 lb = 0,45359237 kg` y `1 oz = 28,349523125 g`. Las unidades métricas usan los prefijos habituales y `1 st = 14 lb`.",
          ],
        },
        {
          heading: "Temperatura",
          paragraphs: [
            "La temperatura es afín, no una simple proporción: `°F = °C × 9/5 + 32` y `K = °C + 273,15`. Por eso duplicar un valor en grados Celsius no duplica el calor. Los valores por debajo del cero absoluto se rechazan en lugar de producir un resultado imposible.",
          ],
        },
        {
          heading: "Precisión y supuestos",
          items: [
            "Los resultados conservan la precisión completa internamente y se muestran con hasta 10 dígitos significativos, de modo que los valores pequeños siguen siendo legibles y las definiciones exactas no acumulan ruido de redondeo.",
            "El conversor solo admite longitud, peso y temperatura, no superficie, volumen, velocidad ni divisas, y nunca adivina la unidad a partir del valor.",
            "Los números mostrados siguen el idioma de la página: coma decimal en español y punto decimal en inglés.",
          ],
        },
      ],
    },
    speedConverter: {
      title: "Conversor de velocidad — AppKitX",
      metaDescription:
        "Conversor de velocidad gratis para kilómetros por hora, millas por hora, metros por segundo, pies por segundo y nudos, con resultados exactos en tu navegador.",
      name: "Conversor de velocidad",
      description:
        "Convierte velocidades entre kilómetros por hora, millas por hora, metros por segundo, pies por segundo y nudos.",
      cardDescription: "Conversiones de km/h, mph, m/s, pies/s y nudos.",
      keywords: [
        "velocidad",
        "conversor de velocidad",
        "km/h",
        "kph",
        "mph",
        "m/s",
        "pies por segundo",
        "nudos",
        "kilómetros por hora",
        "millas por hora",
        "metros por segundo",
      ],
      units: {
        kmh: "Kilómetro por hora",
        mph: "Milla por hora",
        ms: "Metro por segundo",
        fts: "Pie por segundo",
        kn: "Nudo",
      },
      valueLabel: "Velocidad",
      valueHint: "La velocidad que quieres convertir.",
      fromLabel: "De",
      toLabel: "A",
      caption: "{value} {from} = {result} {to}",
      copyText: "{value} {from} = {result} {to}",
      resultOverflow:
        "El valor convertido está fuera del rango numérico admitido. Prueba con un valor más cercano a cero.",
      sections: [
        {
          heading: "Cómo funciona",
          paragraphs: [
            "Escribe la velocidad, elige la unidad de origen y la de destino, y pulsa Calcular. El resultado aparece con la misma conversión escrita completa y puedes copiarlo con un clic.",
            "Todo se ejecuta en tu navegador. El conversor conserva la precisión completa internamente y solo redondea el resultado que se muestra.",
          ],
        },
        {
          heading: "Definiciones exactas",
          paragraphs: [
            "Las cinco unidades son lineales, así que cada conversión es una sola multiplicación: `1 m/s = 3,6 km/h`, `1 mph = 1,609344 km/h`, `1 ft/s = 1,09728 km/h` y `1 kn = 1,852 km/h`.",
            "Un nudo es una milla náutica por hora, no una milla terrestre por hora; por eso `1 kn = 1,150779448 mph`.",
          ],
        },
        {
          heading: "Precisión y supuestos",
          items: [
            "Los resultados conservan la precisión completa internamente y se muestran con hasta 10 dígitos significativos, de modo que los valores pequeños siguen siendo legibles y las definiciones exactas no acumulan ruido de redondeo.",
            "Los valores negativos se tratan como velocidades con signo: se convierten con normalidad en lugar de rechazarse.",
            "Los números mostrados siguen el idioma de la página: coma decimal en español y punto decimal en inglés.",
          ],
        },
      ],
    },
    base64: {
      title: "Codificador Base64 — AppKitX",
      metaDescription:
        "Codificador y descodificador Base64 gratis: convierte texto a Base64 y descodifica Base64 a texto, con soporte UTF-8, todo en tu navegador.",
      name: "Codificador Base64",
      description:
        "Convierte texto a Base64 y descodifica Base64 a texto: compatible con UTF-8, con relleno opcional y entrada URL-safe.",
      cardDescription: "Codifica texto a Base64 y descodifica Base64 a texto.",
      keywords: [
        "base64",
        "codificar",
        "descodificar",
        "codificador",
        "descodificador",
        "convertir",
        "texto",
      ],
      modeLegend: "Modo",
      modes: {
        encode: {
          optionLabel: "Codificar",
          inputLabel: "Texto",
          inputHint:
            "El texto se codifica en UTF-8 antes de convertirlo a Base64.",
          outputLabel: "Base64",
          action: "Codificar",
        },
        decode: {
          optionLabel: "Descodificar",
          inputLabel: "Base64",
          inputHint:
            "Base64 estándar o URL-safe; el relleno es opcional y los espacios se ignoran.",
          outputLabel: "Texto",
          action: "Descodificar",
        },
      },
      clear: "Limpiar",
      errors: {
        emptyEncode: "Introduce el texto que quieres codificar.",
        emptyDecode: "Introduce el Base64 que quieres descodificar.",
        invalid: "No es Base64 válido: revisa los caracteres y el relleno.",
      },
      statusIn: "Entrada: {count} caracteres",
      statusOut: "Salida: {count} caracteres",
      sections: [
        {
          heading: "Cómo funciona",
          paragraphs: [
            "Pega o escribe en el panel de entrada, elige Codificar o Descodificar y pulsa la acción. El resultado aparece en el panel de salida y puedes copiarlo con un clic.",
            "Todo se ejecuta en tu navegador: el texto que pegas no se envía a ningún servidor.",
          ],
        },
        {
          heading: "Qué es Base64",
          paragraphs: [
            "Base64 representa datos como 64 caracteres imprimibles — `A–Z`, `a–z`, `0–9`, `+` y `/` — para que el contenido binario pueda viajar por formatos solo de texto como JSON, XML, el correo electrónico y las URL.",
            "Base64 es una codificación, no un cifrado: cualquiera puede descodificarla, así que no debe usarse para proteger datos.",
          ],
        },
        {
          heading: "Codificar texto de forma segura",
          paragraphs: [
            "El texto se convierte primero en bytes UTF-8 y luego en Base64, de modo que los caracteres acentuados, el texto CJK y los emoji se convierten correctamente.",
            "La descodificación convierte los bytes de vuelta como UTF-8. La entrada cuyos bytes no son UTF-8 válido se rechaza en lugar de producir caracteres corruptos.",
          ],
        },
        {
          heading: "Supuestos y casos límite",
          items: [
            "Los espacios y los saltos de línea de la entrada Base64 se ignoran, así que el texto dividido en líneas por otras herramientas se descodifica tal cual.",
            "El relleno es opcional: tanto `aGVsbG8=` como `aGVsbG8` descodifican al mismo texto.",
            "El alfabeto URL-safe sustituye `+` y `/` por `-` y `_`; se acepta al descodificar, mientras que la salida codificada siempre usa el alfabeto estándar con relleno.",
            "Los caracteres fuera del alfabeto, el relleno mal colocado y las secuencias de bytes que no son UTF-8 válido se rechazan con un mensaje en línea.",
            "No se comprime, cifra ni sube nada: el texto se convierte por completo en tu navegador.",
          ],
        },
      ],
    },
    json: {
      title: "Formateador JSON — AppKitX",
      metaDescription:
        "Formateador JSON gratis: formatea JSON con sangría de dos espacios, minimízalo y obtén errores claros con línea y columna cuando la entrada no es válida.",
      name: "Formateador JSON",
      description:
        "Formatea JSON con sangría de dos espacios, minimízalo o comprueba si tiene errores con la línea y la columna.",
      cardDescription: "Formatea, minimiza y valida JSON en tu navegador.",
      keywords: [
        "json",
        "formatear",
        "formateador",
        "minimizar",
        "validar",
        "formato",
        "embellecer",
      ],
      modeLegend: "Modo",
      modes: {
        format: { optionLabel: "Formatear", action: "Formatear" },
        minify: { optionLabel: "Minimizar", action: "Minimizar" },
      },
      inputLabel: "JSON",
      inputHint:
        "Pega o escribe JSON; la entrada no válida se indica con una posición cuando está disponible.",
      outputLabel: "Resultado",
      clear: "Limpiar",
      errors: {
        empty: "Introduce JSON para formatear.",
        invalid:
          "El JSON no es válido: revisa las comillas, las comas o las llaves.",
        invalidAt: "JSON no válido en la línea {line}, columna {column}.",
      },
      statusIn: "Entrada: {count} caracteres",
      statusOut: "Salida: {count} caracteres",
      statusValid: "JSON válido",
      statusInvalid: "JSON no válido",
      sections: [
        {
          heading: "Cómo funciona",
          paragraphs: [
            "Pega o escribe JSON en el panel de entrada, elige Formatear o Minimizar y pulsa la acción. El resultado aparece en el panel de salida, listo para copiar.",
            "Todo se ejecuta en tu navegador: el JSON que pegas no se envía a ningún servidor.",
          ],
        },
        {
          heading: "Formatear",
          paragraphs: [
            "Formatear vuelve a imprimir el documento con sangría de dos espacios y saltos de línea, para que los objetos y arrays anidados se lean con facilidad. Las claves conservan su orden original.",
          ],
        },
        {
          heading: "Minimizar",
          paragraphs: [
            "Minimizar elimina todos los espacios insignificantes y produce el texto más pequeño que representa los mismos datos: útil antes de pegar JSON en archivos de configuración o cargas de API.",
          ],
        },
        {
          heading: "Supuestos y casos límite",
          items: [
            "Solo cambian los espacios: las claves, los valores y su orden se conservan exactamente como se han analizado.",
            "Sirve cualquier valor JSON válido: objetos, arrays, cadenas, números, booleanos y `null`.",
            "Los números se analizan como números de JavaScript, así que los enteros muy grandes pueden perder precisión al volver a imprimirlos.",
            "Las claves duplicadas conservan el último valor, igual que el comportamiento de `JSON.parse` en los navegadores.",
            "Cuando la entrada no es válida, el mensaje muestra la línea y la columna donde se detuvo el análisis cuando esa posición se puede determinar, y el último resultado válido permanece en el panel de salida.",
            "La entrada solo se analiza como datos (nunca se evalúa) y los resultados se muestran como texto sin formato.",
          ],
        },
      ],
    },
    qrCodeGenerator: {
      title: "Generador de códigos QR — AppKitX",
      metaDescription:
        "Generador de códigos QR gratis y local para URL, texto, correo, teléfono, SMS, Wi-Fi y contactos vCard. Personaliza colores y tamaño y descarga PNG o SVG.",
      name: "Generador de códigos QR",
      description:
        "Genera códigos QR personalizables para enlaces, texto, contactos, Wi-Fi y más, todo en tu navegador.",
      cardDescription:
        "Genera códigos QR personalizables para enlaces, texto, contactos y Wi-Fi.",
      keywords: [
        "qr",
        "código qr",
        "generador de qr",
        "generar qr",
        "wifi qr",
        "vcard",
        "contacto qr",
        "sms qr",
        "url qr",
        "descargar qr",
      ],
      contentTypeLabel: "Tipo de contenido",
      contentTypes: {
        url: "URL / Sitio web",
        text: "Texto plano",
        email: "Correo electrónico",
        phone: "Número de teléfono",
        sms: "SMS",
        wifi: "Red Wi-Fi",
        vcard: "Contacto vCard",
      },
      fields: {
        url: {
          label: "URL del sitio web",
          hint: "Incluye https:// o lo añadiremos nosotros.",
          placeholder: "https://ejemplo.com",
        },
        text: {
          label: "Texto",
          hint: "Cualquier texto, incluidos los saltos de línea.",
          placeholder: "Hola desde AppKitX",
        },
        email: {
          label: "Correo electrónico",
          hint: "Codifica un enlace mailto: que abre la aplicación de correo.",
          placeholder: "nombre@ejemplo.com",
        },
        phone: {
          label: "Número de teléfono",
          hint: "Dígitos y un + inicial opcional. Se eliminan espacios, guiones y paréntesis.",
          placeholder: "+34 600 123 456",
        },
        sms: {
          phone: {
            label: "Número de teléfono",
            hint: "Dígitos y un + inicial opcional. Se eliminan espacios, guiones y paréntesis.",
            placeholder: "+34 600 123 456",
          },
          message: {
            label: "Mensaje (opcional)",
            hint: "Déjalo vacío para abrir la aplicación de mensajes sin borrador.",
            placeholder: "Hola",
          },
        },
        wifi: {
          ssid: {
            label: "Nombre de la red (SSID)",
            hint: "El nombre exacto que aparece en los ajustes de tu dispositivo.",
            placeholder: "Wi-Fi de casa",
          },
          password: {
            label: "Contraseña",
            hint: "Se codifica en el QR. Déjala vacía para una red abierta.",
            placeholder: "Contraseña de la red",
          },
          passwordShow: "Mostrar contraseña de Wi-Fi",
          passwordHide: "Ocultar contraseña de Wi-Fi",
          securityLabel: "Seguridad",
          securityHint: "WPA incluye WPA2 y WPA3.",
          securityOptions: {
            WPA: "WPA/WPA2/WPA3",
            WEP: "WEP",
            nopass: "Ninguna (red abierta)",
          },
          hiddenLabel: "Red oculta",
          hiddenHint: "Actívalo si la red no emite su SSID.",
        },
        vcard: {
          name: {
            label: "Nombre",
            hint: "El nombre visible del contacto.",
            placeholder: "Ada Lovelace",
          },
          phone: {
            label: "Teléfono (opcional)",
            hint: "Dígitos y un + inicial opcional.",
            placeholder: "+34 600 123 456",
          },
          email: {
            label: "Correo electrónico (opcional)",
            hint: "Añade el correo del contacto.",
            placeholder: "ada@ejemplo.com",
          },
          organization: {
            label: "Organización (opcional)",
            hint: "Nombre de la empresa o del grupo.",
            placeholder: "Analytical Engines",
          },
          website: {
            label: "Sitio web (opcional)",
            hint: "Incluye https:// o lo añadiremos nosotros.",
            placeholder: "https://ejemplo.com",
          },
        },
      },
      customization: {
        heading: "Personalizar",
        foregroundLabel: "Color de primer plano",
        backgroundLabel: "Color de fondo",
        sizeLabel: "Tamaño",
        sizeHint: "El PNG y el SVG se exportan a 256, 512 o 1024 px.",
        sizeOptions: {
          small: "Pequeño",
          medium: "Mediano",
          large: "Grande",
        },
        eccLabel: "Corrección de errores",
        eccHint:
          "Los niveles altos resisten más daño pero admiten menos datos.",
        eccOptions: {
          L: "L — Baja (7 %)",
          M: "M — Media (15 %)",
          Q: "Q — Cuartil (25 %)",
          H: "H — Alta (30 %)",
        },
        quietZoneLabel: "Incluir zona de silencio",
        quietZoneHint:
          "Añade el margen estándar de 4 módulos que esperan los escáneres.",
      },
      preview: {
        heading: "Vista previa",
        placeholder: "Escribe contenido para generar un código QR.",
        alt: "Código QR del contenido introducido en el formulario.",
        downloadPng: "Descargar PNG",
        downloadSvg: "Descargar SVG",
        copyImage: "Copiar imagen",
        copied: "Código QR copiado al portapapeles.",
        copyFailed: "No se pudo copiar la imagen. Descarga el PNG.",
        copyUnsupported:
          "Este navegador no puede copiar imágenes. Descarga el PNG.",
        capacityError:
          "El contenido es demasiado largo para un código QR. Acórtalo o elige un nivel de corrección más bajo.",
        privacyTitle: "Generado en tu navegador",
        privacyBody:
          "Tu contenido se codifica localmente y nunca se sube, se almacena ni se envía a un servicio de QR.",
        warnings: {
          inverted:
            "Este código parece invertido. Para escanearlo con fiabilidad, usa un primer plano oscuro sobre un fondo claro.",
          lowContrast:
            "El contraste es bajo y el código puede costar de escanear. Elige un primer plano más oscuro o un fondo más claro.",
        },
      },
      validation: {
        required: "Este campo es obligatorio.",
        invalidEmail: "Introduce un correo electrónico válido.",
        invalidUrl: "Introduce una URL válida.",
        invalidPhone:
          "Introduce un teléfono válido (3–15 dígitos, con + inicial opcional).",
        wifiPasswordRequired:
          "Introduce la contraseña de la red o elige «Ninguna» para una red abierta.",
      },
      sections: [
        {
          heading: "Cómo funciona",
          paragraphs: [
            "Elige un tipo de contenido, rellena los campos y la vista previa se actualiza mientras escribes. Escoge colores, tamaño y corrección de errores, y descarga el PNG o el SVG.",
            "Todo se genera en tu navegador. Prueba el código con tu teléfono antes de imprimirlo o publicarlo.",
          ],
        },
        {
          heading: "Qué codifica cada tipo",
          paragraphs: [
            "Las URL se convierten en una dirección web (se añade `https://` si falta). El correo abre un enlace `mailto:`, el teléfono usa `tel:` y el SMS usa un enlace `sms:` con un mensaje codificado opcional.",
            "El Wi-Fi usa el formato `WIFI:` con el SSID, el tipo de seguridad y la contraseña. Los contactos vCard usan `BEGIN:VCARD` con el nombre, teléfono, correo, organización y sitio web que indiques.",
          ],
        },
        {
          heading: "Consejos de escaneo",
          items: [
            "Usa un primer plano oscuro sobre un fondo claro. El azul pizarra predeterminado sobre blanco tiene un contraste alto.",
            "Mantén la zona de silencio: los escáneres esperan un margen alrededor de los módulos.",
            "Una corrección de errores alta resiste más daño pero admite menos datos; M es un buen valor predeterminado.",
            "Prueba el código descargado con más de un escáner antes de imprimirlo a gran escala.",
          ],
        },
        {
          heading: "Privacidad",
          paragraphs: [
            "Ningún contenido se sube, se almacena ni se envía a un servicio de QR de terceros. El generador funciona por completo en esta página y ningún evento de analítica incluye lo que escribes.",
          ],
        },
      ],
    },
    wordCounter: {
      title: "Contador de palabras — AppKitX",
      metaDescription:
        "Contador de palabras gratis: cuenta palabras, caracteres, frases, párrafos y líneas mientras escribes, con tiempo estimado de lectura y de habla. Nada se sube.",
      name: "Contador de palabras",
      description:
        "Cuenta palabras, caracteres, frases, párrafos y líneas mientras escribes, con tiempo estimado de lectura y de habla, todo en tu navegador.",
      cardDescription:
        "Cuenta palabras, caracteres, frases y tiempo de lectura mientras escribes.",
      keywords: [
        "contador de palabras",
        "contar palabras",
        "recuento de palabras",
        "palabras",
        "contador de caracteres",
        "contar caracteres",
        "frases",
        "párrafos",
        "tiempo de lectura",
        "tiempo de habla",
        "estadísticas de texto",
      ],
      inputLabel: "Tu texto",
      inputHint:
        "Pega o escribe texto; las estadísticas se actualizan al momento.",
      inputPlaceholder: "Pega o escribe tu texto aquí…",
      copyText: "Copiar texto",
      copySuccess: "Texto copiado al portapapeles.",
      copyFailure:
        "No se pudo copiar el texto. Selecciónalo y cópialo manualmente.",
      statsHeading: "Estadísticas",
      statsHint:
        "Las palabras cuentan secuencias Unicode de letras, marcas y números; los caracteres cuentan caracteres percibidos por el usuario, no bytes.",
      emptyHint:
        "Empieza a escribir o pega texto para ver los recuentos en vivo.",
      stats: {
        characters: "Caracteres",
        charactersNoSpaces: "Caracteres (sin espacios)",
        words: "Palabras",
        sentences: "Frases",
        paragraphs: "Párrafos",
        lines: "Líneas",
        readingTime: "Tiempo de lectura",
        speakingTime: "Tiempo de habla",
      },
      duration: {
        seconds: "{seconds} s",
        minutes: "{minutes} min",
        minutesSeconds: "{minutes} min {seconds} s",
      },
      privacyTitle: "Contado en tu navegador",
      privacyBody:
        "Tu texto se analiza localmente y nunca se sube, se almacena ni se envía a un servicio de terceros.",
      sections: [
        {
          heading: "Cómo se cuenta",
          paragraphs: [
            "Las palabras se cuentan como secuencias Unicode de letras, marcas combinantes, dígitos y números. Los apóstrofos internos y los separadores decimales permanecen dentro de una palabra; los guiones separan palabras; el contenido formado solo por puntuación o emoji cuenta como cero.",
            "Los caracteres son caracteres percibidos por el usuario, así que un emoji o una letra acentuada cuenta una vez aunque use varias unidades de código. El recuento sin espacios excluye espacios, tabulaciones y saltos de línea. Los navegadores sin `Intl.Segmenter` usan una alternativa integrada para marcas combinantes, selectores de variación, modificadores de emoji, secuencias con zero-width joiner, banderas de indicadores regionales, secuencias de etiquetas y pares CRLF; secuencias poco frecuentes como la composición de jamo hangul aún pueden diferir de la segmentación Unicode completa.",
          ],
        },
        {
          heading: "Frases, párrafos y líneas",
          paragraphs: [
            "Una frase termina en `.`, `!`, `?`, `…`, `।`, `॥` o `۔` cuando va seguido de un espacio o del final de un párrafo. Los puntos y los signos de exclamación e interrogación CJK (`。`, `！`, `？`) también terminan una frase aunque no haya un espacio después. Los signos consecutivos cuentan una vez y los puntos decimales o la puntuación dentro de una URL no dividen la frase. Las abreviaturas como `Dr.` se tratan como final de frase porque no se pueden detectar con fiabilidad.",
            "Los párrafos se separan con líneas en blanco; los saltos de línea simples permanecen dentro de un párrafo. Las líneas solo cuentan si no están vacías.",
          ],
        },
        {
          heading: "Tiempo de lectura y de habla",
          paragraphs: [
            "El tiempo de lectura supone 200 palabras por minuto y el de habla, 130 palabras por minuto. Ambos se redondean al segundo más cercano, con un mínimo de un segundo para texto no vacío. Son estimaciones para planificar, no mediciones de una persona concreta.",
          ],
        },
        {
          heading: "Notas multilingües",
          paragraphs: [
            "Los acentos y los signos de apertura del español no necesitan un tratamiento especial. Las palabras en hindi separadas por espacios se cuentan individualmente y `।` termina una frase. Las escrituras que no separan palabras con espacios, como el chino y el japonés, se cuentan como secuencias entre espacios y puntuación; los límites exactos de palabra en esas escrituras son una decisión lingüística, así que el recuento es una aproximación coherente y no una segmentación de diccionario.",
            "Los emoji son caracteres, pero no palabras. La herramienta nunca trata un símbolo o una puntuación como palabra solo porque sea visible.",
          ],
        },
        {
          heading: "Privacidad",
          paragraphs: [
            "El recuento ocurre por completo en esta página. Nada de lo que pegas se sube, se guarda en el almacenamiento del navegador ni se incluye en un evento de analítica.",
          ],
        },
      ],
    },
    caseConverter: {
      title: "Conversor de mayúsculas y minúsculas — AppKitX",
      metaDescription:
        "Conversor de mayúsculas y minúsculas gratis: cambia texto a MAYÚSCULAS, minúsculas, tipo título, tipo oración, camelCase, PascalCase, snake_case, kebab-case y más, en tu navegador.",
      name: "Conversor de mayúsculas y minúsculas",
      description:
        "Convierte texto a mayúsculas, minúsculas, tipo título, tipo oración, camelCase, PascalCase, snake_case, kebab-case y más al instante, en tu navegador.",
      cardDescription:
        "Convierte texto a mayúsculas, minúsculas, tipo título, camelCase y más.",
      keywords: [
        "conversor de mayúsculas",
        "mayúsculas",
        "minúsculas",
        "tipo título",
        "tipo oración",
        "tipo capitalizado",
        "camelcase",
        "pascalcase",
        "snake case",
        "kebab case",
        "constant case",
        "alternado",
        "cambiar mayúsculas",
        "formato de texto",
      ],
      inputLabel: "Tu texto",
      inputHint: "Pega o escribe texto; el resultado se actualiza al momento.",
      inputPlaceholder: "Pega o escribe el texto que quieres convertir…",
      modeLabel: "Conversión",
      modeHint: "Cambiar de modo nunca modifica tu texto original.",
      modes: {
        uppercase: "MAYÚSCULAS",
        lowercase: "minúsculas",
        title: "Tipo título",
        sentence: "Tipo oración",
        capitalized: "Tipo capitalizado",
        camel: "camelCase",
        pascal: "PascalCase",
        snake: "snake_case",
        kebab: "kebab-case",
        constant: "CONSTANT_CASE",
        alternating: "Alternado",
      },
      outputLabel: "Texto convertido",
      outputHint:
        "Resultado de solo lectura. Cópialo o cambia de modo sin modificar tu texto.",
      outputPlaceholder: "El texto convertido aparece aquí.",
      copyOutput: "Copiar resultado",
      copySuccess: "Resultado copiado al portapapeles.",
      copyFailure:
        "No se pudo copiar el resultado. Selecciónalo y cópialo manualmente.",
      privacyTitle: "Convertido en tu navegador",
      privacyBody:
        "Tu texto se convierte localmente y nunca se sube, se almacena ni se envía a un servicio de terceros.",
      sections: [
        {
          heading: "Cómo funciona",
          paragraphs: [
            "Pega o escribe en el panel de entrada y elige una conversión. El resultado se actualiza al momento y es de solo lectura, así que cambiar de modo siempre parte de tu texto original. Usa Copiar resultado para reutilizarlo.",
          ],
        },
        {
          heading: "Modos de texto",
          paragraphs: [
            "El tipo oración pasa el texto a minúsculas y pone en mayúscula la primera letra de cada línea y de cada frase. El tipo capitalizado pone en mayúscula todas las palabras, incluidas las cortas como «de» y «la». El tipo título mantiene en minúscula una lista breve de artículos, conjunciones y preposiciones del inglés y del español, salvo que sean la primera o la última palabra de una línea o sigan a dos puntos o al final de una frase.",
            "El modo alternado cambia las mayúsculas y minúsculas de cada letra por turno; los espacios y la puntuación no cuentan como letras.",
          ],
        },
        {
          heading: "Modos de programación",
          paragraphs: [
            "camelCase, PascalCase, snake_case, kebab-case y CONSTANT_CASE dividen el texto en palabras y las unen con la convención elegida. Se eliminan la puntuación y los saltos de línea, se descartan los apóstrofos y los límites de camel/Pascal como `helloWorld` o `HTTPServer` se separan antes de convertir.",
          ],
        },
        {
          heading: "Unicode y limitaciones",
          paragraphs: [
            "Las mayúsculas y minúsculas usan las asignaciones Unicode predeterminadas del navegador. Las letras acentuadas del español, el cirílico y el griego cambian de caja; las escrituras sin mayúsculas, como el devanagari, el chino y el árabe, no cambian con los modos de texto. Los modos de programación siguen eliminando sus espacios al unir palabras.",
            "Los nombres propios y las siglas no se deducen: los modos título y capitalizado pasan el resto de cada palabra a minúsculas, así que `AppKitX` se convierte en `Appkitx`. La `i` con punto y sin punto del turco siguen la asignación Unicode predeterminada, no las reglas locales del turco.",
            "El tipo oración trata abreviaturas como `Dr.` como final de frase porque no se pueden detectar con fiabilidad.",
          ],
        },
        {
          heading: "Privacidad",
          paragraphs: [
            "La conversión ocurre por completo en esta página. Nada de lo que pegas se sube, se guarda en el almacenamiento del navegador ni se incluye en un evento de analítica.",
          ],
        },
      ],
    },
    dateCalculator: {
      title: "Calculadora de fechas — AppKitX",
      metaDescription:
        "Calculadora de fechas gratis: cuenta los días entre dos fechas o suma y resta días, semanas, meses y años, con ajuste de fin de mes y el día de la semana.",
      name: "Calculadora de fechas",
      description:
        "Cuenta los días entre dos fechas o suma y resta días, semanas, meses y años.",
      cardDescription: "Días entre fechas, sumar o restar tiempo.",
      keywords: [
        "fecha",
        "días entre",
        "diferencia",
        "sumar",
        "restar",
        "semanas",
        "meses",
        "años",
        "duración",
      ],
      modeLegend: "Modo",
      modes: {
        difference: { optionLabel: "Diferencia" },
        shift: { optionLabel: "Sumar o restar" },
      },
      startLabel: "Fecha de inicio",
      endLabel: "Fecha de fin",
      dateLabel: "Fecha",
      amountLabel: "Cantidad",
      amountHint: "Un número entero; las cantidades negativas restan.",
      unitLabel: "Unidad",
      units: {
        days: "Días",
        weeks: "Semanas",
        months: "Meses",
        years: "Años",
      },
      daysLabel: "Días entre",
      breakdownLabel: "Años, meses y días",
      resultDateLabel: "Fecha resultante",
      weekdayLabel: "Día de la semana",
      errors: {
        emptyStart: "Introduce una fecha de inicio.",
        emptyEnd: "Introduce una fecha de fin.",
        emptyDate: "Introduce una fecha.",
        invalidStart: "Introduce una fecha de inicio válida.",
        invalidEnd: "Introduce una fecha de fin válida.",
        invalidDate: "Introduce una fecha válida.",
        amountRange: "Introduce un número entero.",
        resultRange:
          "La fecha resultante está fuera del rango admitido. Ajusta la fecha o la cantidad.",
      },
      differenceCaption: "De {from} a {to}.",
      shiftAddCaption: "Resultado de sumar {amount} a {date}.",
      shiftSubtractCaption: "Resultado de restar {amount} a {date}.",
      differenceCopy:
        "{days} entre {from} y {to}.\nAños, meses y días: {breakdown}",
      shiftCopy: "{date} ({weekday})",
      sections: [
        {
          heading: "Cómo funciona",
          paragraphs: [
            "Elige Diferencia para contar los días entre dos fechas, o Sumar o restar para desplazar una fecha en días, semanas, meses o años. Introduce las fechas, pulsa Calcular y el resultado aparece debajo: todo se ejecuta en tu navegador.",
          ],
        },
        {
          heading: "Contar los días entre fechas",
          paragraphs: [
            "La diferencia es un recuento exclusivo de días: del 1 de enero al 2 de enero hay un día, y la misma fecha son cero. Si inviertes las fechas, la respuesta es la misma: el recuento siempre es absoluto.",
            "Bajo el recuento de días, el resultado también desglosa el intervalo en años, meses y días de calendario completos, con la misma aritmética de meses que el modo de sumar o restar.",
          ],
        },
        {
          heading: "Sumar y restar tiempo",
          paragraphs: [
            "Los días y las semanas suman recuentos exactos de días, así que no les afectan las longitudes de los meses. Los meses y los años avanzan meses de calendario completos y se ajustan al último día válido del mes de destino: `31 de enero + 1 mes` es `28 de febrero`, o `29 de febrero` en un año bisiesto.",
            "Introduce una cantidad negativa para restar: `31 de marzo − 1 mes` es `28 de febrero`, o `29 de febrero` en un año bisiesto, con el mismo ajuste aplicado hacia atrás.",
          ],
        },
        {
          heading: "Supuestos y casos límite",
          items: [
            "Las fechas se tratan como fechas de calendario simples — `2026-03-01` — sin hora del día ni zona horaria, así que los cambios de horario de verano nunca desplazan un resultado.",
            "Las cantidades son números enteros; las cantidades negativas restan. Las cantidades fraccionarias se rechazan con un mensaje en línea.",
            "El resultado incluye el día de la semana de la fecha resultante en el modo de sumar o restar.",
            "El ajuste de fin de mes se aplica siempre que se mueven meses o años: `31 de agosto + 1 mes` es `30 de septiembre`, y `29 de febrero de 2024 + 1 año` es `28 de febrero de 2025`.",
            "Las fechas admitidas van del `0001-01-01` al `275759-12-31`; los resultados fuera de ese rango se rechazan con un mensaje en línea en lugar de una fecha no válida.",
            "No se sube nada: el cálculo se ejecuta por completo en tu navegador.",
          ],
        },
      ],
    },
    ageCalculator: {
      title: "Calculadora de edad — AppKitX",
      metaDescription:
        "Calculadora de edad gratis: calcula la edad en años, meses y días a partir de la fecha de nacimiento, además de los días vividos, a fecha de hoy.",
      name: "Calculadora de edad",
      description:
        "Calcula la edad en años, meses y días a partir de una fecha de nacimiento, además de los días vividos.",
      cardDescription:
        "Edad en años, meses y días desde la fecha de nacimiento.",
      keywords: [
        "edad",
        "cumpleaños",
        "fecha de nacimiento",
        "cuántos años",
        "años",
        "meses",
        "días",
      ],
      birthLabel: "Fecha de nacimiento",
      birthHint:
        "La edad se calcula a fecha de hoy. Los nacidos el 29 de febrero cumplen el 28 de febrero en años no bisiestos.",
      ageLabel: "Edad",
      totalDaysLabel: "Días vividos",
      caption: "A fecha de {date}.",
      copyText: "Edad: {age}\nDías vividos: {days}",
      errors: {
        empty: "Introduce una fecha de nacimiento.",
        invalid: "Introduce una fecha de nacimiento válida.",
        future: "La fecha de nacimiento no puede ser futura.",
      },
      sections: [
        {
          heading: "Cómo funciona",
          paragraphs: [
            "Introduce la fecha de nacimiento y pulsa Calcular. El resultado muestra la edad en años, meses y días a fecha de hoy, además del número total de días vividos: todo se ejecuta en tu navegador.",
          ],
        },
        {
          heading: "Cómo se calcula la edad",
          paragraphs: [
            "La edad se mide en años, meses y días de calendario completos: aumenta el día del cumpleaños, así que el día del nacimiento cuenta como cero. El total de días es un recuento exacto desde la fecha de nacimiento hasta hoy.",
            "Hoy significa la fecha del calendario local de tu dispositivo, no un reloj de servidor: la leyenda bajo el resultado muestra la fecha exacta utilizada.",
          ],
        },
        {
          heading: "Cumpleaños el 29 de febrero",
          paragraphs: [
            "Para quien nace un 29 de febrero, el cumpleaños se cuenta el 28 de febrero en los años no bisiestos. Esta es la convención que usa esta herramienta: no es una regla legal universal para la edad oficial.",
          ],
        },
        {
          heading: "Supuestos y casos límite",
          items: [
            "La fecha de nacimiento no puede ser futura; se rechaza con un mensaje en línea.",
            "Las fechas admitidas van del `0001-01-01` al `275759-12-31`; las fechas fuera de ese rango se rechazan con un mensaje en línea.",
            "Solo se cuentan días completos: no intervienen horas, minutos ni zonas horarias, así que el resultado nunca depende de dónde estés.",
            "El cálculo se hace por completo en tu navegador; la fecha que introduces no se sube nunca.",
          ],
        },
      ],
    },
  },
};
