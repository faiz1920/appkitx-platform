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
 * status, and doc/TRANSLATION-REVIEWS.md tracks the outstanding review. Automated
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
  consent: {
    title: "Cookies y analítica",
    description:
      "AppKitX usa cookies de Google Analytics para entender cómo se usan las herramientas. El almacenamiento analítico permanece desactivado hasta que lo aceptes, y puedes cambiar tu elección cuando quieras.",
    accept: "Aceptar analítica",
    reject: "Rechazar analítica",
    privacyLink: "Leer la política de privacidad",
    settings: "Configuración de cookies",
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
          "Calculadoras gratis de porcentajes, descuentos, préstamos, EMI, interés compuesto, objetivos de ahorro, jubilación y expresiones científicas: variaciones, amortización, crecimiento de inversiones y trigonometría en grados o radianes.",
        toolsHeading: "Calculadoras online gratis",
        intro: [
          "Las calculadoras cubren las cuentas del día a día y las expresiones científicas: calcula el X % de un número, averigua qué porcentaje representa un valor de otro, mide aumentos y disminuciones porcentuales, comprueba cuánto ahorras con un descuento y su precio final, estima la cuota mensual, los intereses totales y el coste total de un préstamo, consulta un calendario de amortización año a año con el desglose de principal e intereses, proyecta el crecimiento de una inversión con interés compuesto y aportes mensuales opcionales, calcula el ahorro mensual necesario para alcanzar un objetivo, proyecta un capital para la jubilación según tu edad o el ahorro mensual necesario para alcanzarlo, y evalúa expresiones con paréntesis, potencias, raíces, logaritmos y trigonometría.",
          "Funcionan por completo en tu navegador, muestran la fórmula o la expresión de cada resultado y permiten copiarlo con un clic. Los importes se tratan tal como los escribes —las calculadoras de descuentos, préstamos, EMI, interés compuesto, objetivos de ahorro y jubilación son neutrales respecto a la moneda— y la calculadora científica respeta el modo de grados o radianes seleccionado.",
        ],
      },
    },
    Converters: {
      name: "Conversores",
      page: {
        title: "Conversores de unidades y velocidad gratis — AppKitX",
        metaDescription:
          "Conversores online gratis de longitud, peso, temperatura, superficie, volumen y velocidad, con resultados exactos en tu navegador.",
        toolsHeading: "Conversores online gratis",
        intro: [
          "Los conversores cubren las medidas que más se cambian en el día a día: longitud y distancia, peso, temperatura, superficie, volumen y velocidad. Elige las unidades de origen y destino y obtén el resultado con la misma conversión escrita completa.",
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
          "Herramientas gratis de fecha y hora: cuenta días entre dos fechas, suma o resta días, semanas, meses y años, calcula tu edad y convierte una fecha y hora entre zonas horarias.",
        toolsHeading: "Herramientas de fecha y hora gratis",
        intro: [
          "Herramientas en el navegador para cuentas con el calendario: cuenta los días entre dos fechas con un desglose en años, meses y días, o suma y resta días, semanas, meses y años con ajuste de fin de mes.",
          "La calculadora de edad convierte una fecha de nacimiento en años, meses y días, además de los días vividos totales, contados a fecha del calendario local de tu dispositivo. Las herramientas de fecha y edad usan fechas de calendario simples, mientras que el conversor de zonas horarias trabaja con instantes reales, desfases UTC y cambios de horario de verano. Nada se sube y todos los resultados se pueden copiar con un clic.",
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
        "financiación",
        "préstamo personal",
        "préstamo de coche",
        "capital",
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
            "La calculadora es neutral respecto a la moneda: usa la moneda en la que escribas el importe y nunca convierte entre divisas. Si además quieres ver año a año cómo se reparte cada cuota entre principal e intereses, la [calculadora de EMI](/emi-calculator) añade ese calendario. Todo se ejecuta en tu navegador.",
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
            "El tipo se mantiene fijo durante todo el plazo y los intereses se cobran cada mes sobre el saldo pendiente. No se incluyen préstamos a tipo variable, comisiones, seguros ni impuestos. Para ahorros que crecen en lugar de una deuda que se devuelve, usa la [calculadora de interés compuesto](/compound-interest-calculator).",
            "El plazo debe estar entre un mes y 1.200 meses (100 años). Los plazos fuera de ese rango se rechazan con un mensaje en línea en lugar de ajustarse en silencio.",
            "Los resultados se calculan con precisión completa y solo se redondean a dos decimales para mostrarlos. La última cuota de un préstamo real puede diferir en unos céntimos porque los prestamistas redondean cada plazo.",
            "La calculadora es neutral respecto a la moneda y no asume nada sobre la divisa, la fecha de pago ni las reglas de redondeo del prestamista.",
          ],
        },
      ],
    },
    emiCalculator: {
      title: "Calculadora de EMI — AppKitX",
      metaDescription:
        "Calculadora de EMI gratis con calendario de amortización completo: cuota mensual, desglose de principal e intereses, saldo pendiente y totales anuales.",
      name: "Calculadora de EMI",
      description:
        "Calcula la cuota mensual (EMI), el desglose de principal e intereses, el saldo pendiente y un calendario de devolución año a año.",
      cardDescription:
        "Cuota mensual, desglose de principal e intereses y calendario de amortización.",
      keywords: [
        "emi",
        "calculadora de emi",
        "cuota mensual",
        "calendario de amortización",
        "tabla de amortización",
        "principal e intereses",
        "saldo pendiente",
        "cuota de préstamo",
        "devolución de préstamo",
        "hipoteca",
        "préstamo personal",
      ],
      amountLabel: "Importe del préstamo",
      amountHint:
        "El importe prestado, en cualquier moneda. No se aplica conversión de divisas.",
      rateLabel: "Tipo de interés anual (%)",
      rateHint:
        "El tipo nominal anual aplicado al saldo decreciente. Escribe 0 si el préstamo no tiene intereses.",
      tenureLabel: "Plazo del préstamo",
      tenureHint:
        "El periodo de devolución. Debe resolverse en un número entero de meses entre 1 y 1.200.",
      tenureUnitLabel: "Unidad del plazo",
      tenureUnits: {
        years: "Años",
        months: "Meses",
      },
      emiLabel: "Cuota mensual (EMI)",
      principalLabel: "Principal",
      interestLabel: "Intereses totales",
      totalLabel: "Total a devolver",
      breakdownHeading: "Principal e intereses",
      principalShare: "{amount} ({percent} % del total)",
      interestShare: "{amount} ({percent} % del total)",
      scheduleHeading: "Calendario de amortización",
      scheduleHint:
        "Agrupado por año del préstamo. Despliega un año para ver las cuotas mensuales y el saldo pendiente.",
      scheduleEmpty:
        "Calcula un préstamo para ver el calendario de devolución año a año.",
      yearLabel: "Año {year}",
      openingBalanceLabel: "Saldo inicial",
      principalPaidLabel: "Principal pagado",
      interestPaidLabel: "Intereses pagados",
      totalPaidLabel: "Total pagado",
      closingBalanceLabel: "Saldo final",
      monthlyTableCaption: "Cuotas mensuales del año {year}",
      scheduleScrollLabel:
        "Tabla desplazable de cuotas mensuales del año {year}",
      tableHeaders: {
        paymentNumber: "Cuota",
        openingBalance: "Saldo inicial",
        payment: "Cuota / pago",
        interest: "Intereses",
        principal: "Principal",
        closingBalance: "Saldo final",
      },
      copySummary: "Copiar resumen",
      copyText:
        "Importe del préstamo: {amount}\nCuota mensual (EMI): {emi}\nPrincipal: {principal}\nIntereses totales: {interest}\nTotal a devolver: {total}\nPlazo: {months} meses",
      caption: "{amount} al {rate} % durante {months} meses.",
      formulas: {
        template: "EMI = P × r ÷ (1 − (1 + r)⁻ⁿ)",
        describe: "{rate} % ÷ 12 = {monthlyRate} % al mes",
      },
      errors: {
        amount: "Escribe un importe de préstamo mayor que cero.",
        rate: "Escribe un tipo de interés de 0 o más.",
        tenure: "Escribe un plazo de entre 1 y 1.200 meses enteros.",
        fractionalTenure:
          "El plazo debe resolverse en un número entero de meses.",
        overflow:
          "El resultado está fuera del rango numérico admitido. Prueba con valores más pequeños.",
      },
      sections: [
        {
          heading: "Cómo funciona",
          paragraphs: [
            "Introduce el importe prestado, el tipo de interés nominal anual y el plazo de devolución. Indica si el plazo está en años o en meses y pulsa Calcular. El resumen muestra la cuota mensual fija (EMI), el principal, los intereses totales, el total a devolver y el reparto entre principal e intereses.",
            "El calendario agrupa las cuotas por año del préstamo. Despliega cualquier año para ver cada pago mensual, sus componentes de intereses y principal, y el saldo pendiente después de ese pago. Si solo necesitas la cuota mensual y los intereses totales, la [calculadora de préstamos](/loan-calculator) es una vía más directa. Todo se ejecuta en tu navegador.",
          ],
        },
        {
          heading: "Fórmula de EMI con saldo decreciente",
          paragraphs: [
            "Esta calculadora usa solo EMI de saldo decreciente: `EMI = P × r ÷ (1 − (1 + r)⁻ⁿ)`, donde `P` es el principal, `r` es el tipo nominal anual dividido entre 12 y entre 100, y `n` es el número entero de cuotas mensuales.",
            "Con tipo cero, la EMI es simplemente `principal ÷ meses` y los intereses totales son cero. No se modelan préstamos de interés plano: los intereses siempre se calculan sobre el saldo pendiente, no sobre el principal original durante todo el plazo.",
          ],
        },
        {
          heading: "Calendario y redondeo",
          paragraphs: [
            "Cada mes se cobran intereses sobre el saldo inicial, se aplica la EMI y el resto reduce el principal. La última cuota se ajusta para que el saldo pendiente cierre exactamente en cero; puede diferir de la EMI habitual en unos céntimos.",
            "Los cálculos conservan la precisión completa internamente. El resumen, los totales anuales y la tabla mensual solo se redondean a dos decimales para mostrarlos, así que las filas mostradas pueden diferir del total exacto en un pequeño ajuste de redondeo.",
          ],
        },
        {
          heading: "Supuestos y límites",
          items: [
            "El tipo anual es nominal, fijo durante todo el plazo y se divide entre 12. No se incluyen tipos anuales efectivos, tipos variables, convenciones de días, comisiones, seguros ni impuestos.",
            "El plazo debe resolverse en un número entero de meses entre 1 y 1.200 (100 años). Los totales de meses fraccionarios se rechazan en lugar de redondearse.",
            "No se modelan pagos anticipados, cuotas impagadas, periodos de carencia ni cambios en la frecuencia de pago.",
            "Los importes son neutrales respecto a la moneda y nunca se convierten. Los resultados usan los separadores decimales y de miles del idioma de la página.",
          ],
        },
        {
          heading: "Privacidad",
          paragraphs: [
            "Todo se calcula en tu navegador. Los valores del préstamo y el calendario nunca se suben, se guardan en el almacenamiento del navegador ni se envían a un servicio de terceros.",
          ],
        },
      ],
    },
    compoundInterest: {
      title: "Calculadora de interés compuesto — AppKitX",
      metaDescription:
        "Calculadora de interés compuesto gratis: proyecta el crecimiento de una inversión con aportes mensuales opcionales, compara frecuencias de capitalización y consulta el desglose anual.",
      name: "Calculadora de interés compuesto",
      description:
        "Calcula el valor futuro de una inversión, los aportes totales y los intereses generados con capitalización anual, semestral, trimestral, mensual o diaria.",
      cardDescription:
        "Crecimiento de una inversión con capitalización y aportes mensuales.",
      keywords: [
        "interés compuesto",
        "calculadora de interés compuesto",
        "crecimiento compuesto",
        "crecimiento de la inversión",
        "valor futuro",
        "crecimiento del ahorro",
        "aportes mensuales",
        "frecuencia de capitalización",
        "intereses generados",
        "crecimiento anual",
        "capitalización diaria",
        "capitalización trimestral",
      ],
      principalLabel: "Inversión inicial",
      principalHint:
        "El importe inicial, en cualquier moneda. No se aplica conversión de divisas.",
      rateLabel: "Tipo de interés anual (%)",
      rateHint: "El tipo nominal anual. Escribe 0 si no hay intereses.",
      durationLabel: "Duración de la inversión",
      durationHint:
        "El periodo de proyección. Debe resolverse en un número entero de meses entre 1 y 1.200.",
      durationUnitLabel: "Unidad de duración",
      durationUnits: {
        years: "Años",
        months: "Meses",
      },
      frequencyLabel: "Frecuencia de capitalización",
      frequencyHint:
        "Con qué frecuencia se capitalizan los intereses. La capitalización diaria usa un año de 365 días.",
      frequencies: {
        annual: "Anual",
        semiannual: "Semestral",
        quarterly: "Trimestral",
        monthly: "Mensual",
        daily: "Diaria",
      },
      contributionLabel: "Aporte mensual",
      contributionHint:
        "Opcional. Déjalo vacío o escribe 0 si no hay aportes mensuales.",
      timingLabel: "Aportar al inicio de cada mes",
      timingHint: "Desactivado: los aportes se añaden al final de cada mes.",
      finalValueLabel: "Valor final",
      initialLabel: "Inversión inicial",
      contributionsLabel: "Aportes totales",
      investedLabel: "Total invertido",
      interestLabel: "Intereses generados",
      breakdownHeading: "Invertido e intereses",
      investedShare: "Total invertido: {amount} ({percent} % del valor final)",
      interestShare:
        "Intereses generados: {amount} ({percent} % del valor final)",
      growthHeading: "Crecimiento anual",
      growthHint:
        "Cada fila cubre 12 meses; la última fila puede cubrir un año parcial.",
      growthEmpty: "Calcula una inversión para ver el crecimiento anual.",
      growthScrollLabel: "Tabla desplazable de crecimiento anual",
      tableCaption: "Crecimiento anual de la inversión",
      tableHeaders: {
        year: "Año",
        openingBalance: "Saldo inicial",
        contributions: "Aportes",
        interest: "Intereses generados",
        closingBalance: "Saldo final",
      },
      yearLabel: "Año {year}",
      partialYearLabel: "Año {year} ({duration})",
      monthSingular: "mes",
      monthPlural: "meses",
      copySummary: "Copiar resumen",
      copyText:
        "Inversión inicial: {initial}\nTipo de interés anual: {rate} %\nCapitalización: {frequency}\nDuración: {duration}\nValor final: {final}\nTotal invertido: {invested}\nIntereses generados: {interest}",
      copyTextWithContributions:
        "Inversión inicial: {initial}\nAporte mensual: {contribution}\nAportes totales: {contributions}\nMomento del aporte: {timing}\nTipo de interés anual: {rate} %\nCapitalización: {frequency}\nDuración: {duration}\nValor final: {final}\nTotal invertido: {invested}\nIntereses generados: {interest}",
      caption: "{amount} al {rate} % durante {duration}.",
      captionWithContributions:
        "{amount} al {rate} % durante {duration}, con {contribution} mensuales.",
      formulas: {
        template: "A = P × (1 + r/m)^(m×t)",
        describe:
          "{rate} % nominal = {monthlyRate} % al mes tras la capitalización.",
      },
      timingValues: {
        end: "Fin de mes",
        beginning: "Inicio de mes",
      },
      errors: {
        principal: "Escribe una inversión inicial de 0 o más.",
        noInvestment:
          "Escribe una inversión inicial o un aporte mensual mayor que cero.",
        rate: "Escribe un tipo de interés de 0 o más.",
        duration: "Escribe una duración de entre 1 y 1.200 meses enteros.",
        fractionalDuration:
          "La duración debe resolverse en un número entero de meses.",
        contribution: "Escribe un aporte mensual de 0 o más.",
        frequency: "Elige una frecuencia de capitalización admitida.",
        timing: "Elige un momento de aporte admitido.",
        overflow:
          "El resultado está fuera del rango numérico admitido. Prueba con valores más pequeños.",
      },
      sections: [
        {
          heading: "Cómo funciona",
          paragraphs: [
            "Introduce la inversión inicial, el tipo nominal anual, la duración y la frecuencia de capitalización. Si quieres, añade un aporte mensual e indica si se realiza al inicio o al final de cada mes. Pulsa Calcular para ver el valor final, el total invertido, los intereses generados y una tabla de crecimiento anual.",
            "Todo se ejecuta en tu navegador. Al cambiar cualquier dato se borra el resultado anterior para que las cifras en pantalla siempre correspondan a los valores actuales. Para una proyección a largo plazo con edades e inflación, usa la [calculadora de jubilación](/retirement-calculator).",
          ],
        },
        {
          heading: "Qué es el interés compuesto",
          paragraphs: [
            "El interés compuesto es el interés que se gana tanto sobre el importe inicial como sobre los intereses acumulados. Con el tiempo, el saldo crece más rápido que con el interés simple porque los intereses de cada periodo pasan a formar parte de la base del siguiente. Para trabajar hacia atrás desde una meta de ahorro, usa la [calculadora de objetivo de ahorro](/savings-goal-calculator).",
          ],
        },
        {
          heading: "Fórmula del interés compuesto",
          paragraphs: [
            "La proyección usa `A = P × (1 + r/m)^(m×t)`, donde `P` es la inversión inicial, `r` es el tipo nominal anual, `m` es el número de periodos de capitalización por año y `t` es la duración en años.",
            "La frecuencia de capitalización elegida define un factor mensual equivalente `g = (1 + r/m)^(m/12)`. Los intereses se acumulan mensualmente a `i = g − 1`, de modo que los aportes mensuales y las filas anuales usan el mismo tipo. Es una convención de proyección, no un extracto bancario ni un modelo exacto de la fecha de abono de intereses.",
          ],
        },
        {
          heading: "Aportes y momento del aporte",
          paragraphs: [
            "Los aportes mensuales usan la fórmula del valor futuro de una anualidad ordinaria: `FV = C × ((g^N − 1) ÷ i)`. Con aportes al inicio de cada mes, cada aporte gana un mes adicional de crecimiento, así que el resultado se multiplica por `g`.",
            "El valor predeterminado es el final de mes. Si no introduces ningún aporte, el resultado es una proyección de solo capital inicial.",
          ],
        },
        {
          heading: "Frecuencia de capitalización",
          paragraphs: [
            "La capitalización anual, semestral, trimestral, mensual y diaria usa `m = 1, 2, 4, 12 y 365`. Para un mismo tipo nominal, una frecuencia más alta produce un rendimiento anual efectivo ligeramente mayor. La capitalización diaria usa un año fijo de 365 días; los años bisiestos se ignoran intencionadamente.",
            "Los periodos parciales se expresan en meses enteros. La tabla anual agrupa 12 meses cada vez y la última fila puede cubrir menos de 12 meses.",
          ],
        },
        {
          heading: "Supuestos y límites",
          items: [
            "El tipo anual es nominal, fijo durante toda la duración y se capitaliza con la frecuencia elegida.",
            "Los aportes son solo mensuales y se realizan al inicio o al final de cada mes. No se modelan retiradas, aumentos de aporte, aportes impagados, comisiones, impuestos, seguros ni inflación.",
            "La calculadora es neutral respecto a la moneda. No convierte divisas ni añade símbolos de moneda.",
            "Los resultados usan precisión completa internamente y solo se redondean a dos decimales para mostrarlos, así que los componentes mostrados pueden diferir del total exacto en un pequeño ajuste de redondeo.",
            "La duración debe resolverse en un número entero de meses entre 1 y 1.200 (100 años).",
          ],
        },
        {
          heading: "Privacidad",
          paragraphs: [
            "Todo se calcula en tu navegador. Los valores de la inversión y la tabla de crecimiento nunca se suben, se guardan en el almacenamiento del navegador ni se envían a un servicio de terceros.",
          ],
        },
      ],
    },
    savingsGoal: {
      title: "Calculadora de objetivo de ahorro — AppKitX",
      metaDescription:
        "Calculadora de objetivo de ahorro gratis: calcula cuánto necesitas ahorrar cada mes para alcanzar una meta, con intereses opcionales y un plan anual.",
      name: "Calculadora de objetivo de ahorro",
      description:
        "Calcula el ahorro mensual necesario para alcanzar un objetivo financiero, con intereses opcionales y un plan anual.",
      cardDescription: "Ahorro mensual necesario para alcanzar un objetivo.",
      keywords: [
        "calculadora de objetivo de ahorro",
        "meta de ahorro",
        "calculadora de ahorro mensual",
        "cuánto ahorrar al mes",
        "plan de ahorro",
        "alcanzar meta de ahorro",
        "objetivo de ahorro",
        "ahorro mensual",
        "ahorro objetivo",
        "ahorro mensual necesario",
      ],
      targetLabel: "Objetivo de ahorro",
      targetHint:
        "El importe que quieres alcanzar, en cualquier moneda. No se aplica conversión de divisas.",
      currentLabel: "Ahorros actuales",
      currentHint:
        "Lo que ya tienes reservado. Déjalo vacío si empiezas desde cero.",
      rateLabel: "Tipo de interés anual (%)",
      rateHint:
        "El tipo nominal anual. Déjalo vacío o escribe 0 si tus ahorros no generan intereses.",
      durationLabel: "Plazo del objetivo",
      durationHint:
        "Cuánto tiempo tienes para alcanzar el objetivo. Debe resolverse en un número entero de meses entre 1 y 1.200.",
      durationUnitLabel: "Unidad del plazo",
      durationUnits: {
        years: "Años",
        months: "Meses",
      },
      frequencyLabel: "Frecuencia de capitalización",
      frequencyHint:
        "Con qué frecuencia se capitalizan los intereses. La capitalización diaria usa un año de 365 días.",
      frequencies: {
        annual: "Anual",
        semiannual: "Semestral",
        quarterly: "Trimestral",
        monthly: "Mensual",
        daily: "Diaria",
      },
      timingLabel: "Aportar al inicio de cada mes",
      timingHint: "Desactivado: los aportes se añaden al final de cada mes.",
      requiredMonthlyLabel: "Ahorro mensual necesario",
      targetResultLabel: "Importe objetivo",
      currentResultLabel: "Ahorros actuales",
      contributionsLabel: "Aportes totales",
      interestLabel: "Intereses generados",
      finalLabel: "Ahorro final proyectado",
      remainingLabel: "Importe restante",
      progressLabel: "Progreso del ahorro",
      successAlreadyReached: "Tus ahorros actuales ya alcanzan este objetivo.",
      successInterestOnly:
        "No se requiere ahorro mensual: tus ahorros actuales alcanzarán el objetivo solo con los intereses.",
      growthHeading: "Plan de ahorro anual",
      growthHint:
        "Cada fila cubre 12 meses; la última fila puede cubrir un año parcial.",
      growthEmpty: "Calcula un plan de ahorro para ver el desglose anual.",
      growthScrollLabel: "Tabla desplazable del plan de ahorro anual",
      tableCaption: "Plan de ahorro anual",
      tableHeaders: {
        year: "Año",
        openingBalance: "Saldo inicial",
        contributions: "Aportes",
        interest: "Intereses generados",
        closingBalance: "Saldo final",
        progress: "Progreso",
      },
      yearLabel: "Año {year}",
      partialYearLabel: "Año {year} ({duration})",
      monthSingular: "mes",
      monthPlural: "meses",
      copySummary: "Copiar resumen",
      copyText:
        "Objetivo de ahorro: {target}\nAhorros actuales: {current}\nTipo de interés anual: {rate} %\nCapitalización: {frequency}\nDuración: {duration}\nMomento del aporte: {timing}\nAhorro mensual necesario: {required}\nAportes totales: {contributions}\nIntereses generados: {interest}\nAhorro final proyectado: {final}",
      caption: "{amount} de objetivo en {duration}.",
      formulas: {
        template: "C = (FV − P × g^N) × i ÷ (g^N − 1)",
        describe:
          "{rate} % nominal = {monthlyRate} % al mes tras la capitalización.",
      },
      timingValues: {
        end: "Final de mes",
        beginning: "Inicio de mes",
      },
      errors: {
        target: "Escribe un objetivo de ahorro mayor que cero.",
        current: "Escribe ahorros actuales de 0 o más.",
        rate: "Escribe un tipo de interés de 0 o más.",
        duration: "Escribe un plazo de entre 1 y 1.200 meses enteros.",
        fractionalDuration:
          "El plazo debe resolverse en un número entero de meses.",
        frequency: "Elige una frecuencia de capitalización admitida.",
        timing: "Elige un momento de aporte admitido.",
        overflow:
          "El resultado está fuera del rango numérico admitido. Prueba con valores más pequeños.",
      },
      sections: [
        {
          heading: "Cómo funciona",
          paragraphs: [
            "Introduce tu objetivo de ahorro, los ahorros actuales, el tipo nominal anual, el plazo del objetivo y la frecuencia de capitalización. Indica si los ahorros mensuales se añaden al inicio o al final de cada mes y pulsa Calcular. La calculadora muestra el ahorro mensual necesario, el saldo final proyectado y un plan año a año.",
            "Todo se ejecuta en tu navegador. Al cambiar cualquier dato se borra el resultado anterior para que las cifras en pantalla siempre correspondan a los valores actuales. Si el objetivo es la jubilación, la [calculadora de jubilación](/retirement-calculator) añade edades e inflación.",
          ],
        },
        {
          heading: "Cómo se calcula el ahorro mensual necesario",
          paragraphs: [
            "El objetivo se reduce con el valor futuro de tus ahorros actuales, `FV_initial = P × g^N`. El resto se divide entre el factor de valor futuro de una anualidad mensual. Los aportes al final del mes usan `((g^N − 1) ÷ i)`; los aportes al inicio del mes usan el mismo factor multiplicado por `g`.",
            "Cuando el tipo de interés es cero, el importe necesario es simplemente `(FV − P) ÷ N`.",
            "Si tus ahorros actuales ya alcanzan el objetivo, el ahorro mensual necesario es cero. Si se prevé que lo alcancen solo con intereses, no se requiere ahorro mensual y el plan anual se sigue mostrando.",
          ],
        },
        {
          heading: "Intereses, capitalización y momento del aporte",
          paragraphs: [
            "La frecuencia de capitalización elegida define un factor mensual equivalente `g = (1 + r/m)^(m/12)`. Los intereses se acumulan mensualmente a `i = g − 1`, igual que en la [calculadora de interés compuesto](/compound-interest-calculator). La capitalización diaria usa un año fijo de 365 días; los años bisiestos se ignoran.",
            "Los aportes al inicio del mes generan intereses en el mismo mes. Los aportes al final del mes empiezan a generar intereses en el mes siguiente.",
          ],
        },
        {
          heading: "Redondeo y alcance del objetivo",
          paragraphs: [
            "El ahorro mensual necesario se redondea hacia arriba al siguiente céntimo. Después se reconstruye el plan anual con ese importe redondeado, de modo que el saldo final proyectado alcanza o supera ligeramente el objetivo. Nunca se queda corto por el redondeo.",
            "Un saldo proyectado por encima del objetivo es un pequeño excedente del redondeo, no un error.",
          ],
        },
        {
          heading: "Supuestos y límites",
          items: [
            "El tipo anual es nominal, fijo durante todo el plazo y se capitaliza con la frecuencia elegida.",
            "Los ahorros son solo mensuales y se realizan al inicio o al final de cada mes. No se modelan retiradas, ahorros impagados, aumentos de aporte, comisiones, impuestos, seguros ni inflación.",
            "La calculadora es neutral respecto a la moneda. No convierte divisas ni añade símbolos de moneda.",
            "Los resultados usan precisión completa internamente. El dinero se muestra con dos decimales, así que las filas anuales pueden diferir de los totales exactos en un pequeño ajuste de redondeo.",
            "El plazo debe resolverse en un número entero de meses entre 1 y 1.200 (100 años).",
          ],
        },
        {
          heading: "Privacidad",
          paragraphs: [
            "Todo se calcula en tu navegador. Tu objetivo de ahorro, tus ahorros actuales y el plan anual nunca se suben, se guardan en el almacenamiento del navegador ni se envían a un servicio de terceros.",
          ],
        },
      ],
    },
    retirementCalculator: {
      title: "Calculadora de jubilación — AppKitX",
      metaDescription:
        "Calculadora de jubilación gratis: proyecta tu capital para la jubilación a partir de tus ahorros y aportes mensuales, o calcula el ahorro mensual necesario para alcanzar un objetivo.",
      name: "Calculadora de jubilación",
      description:
        "Proyecta tu capital para la jubilación con tus ahorros actuales y aportes mensuales, o calcula el ahorro mensual necesario para alcanzar un objetivo.",
      cardDescription:
        "Capital proyectado para la jubilación y ahorro mensual necesario.",
      keywords: [
        "calculadora de jubilación",
        "calculadora de retiro",
        "retiro",
        "capital para la jubilación",
        "ahorro para la jubilación",
        "cuánto ahorrar para la jubilación",
        "proyección de jubilación",
        "ahorro mensual para la jubilación",
        "capital objetivo",
        "planificación de la jubilación",
        "ahorro necesario para la jubilación",
        "calculadora de jubilación por edad",
      ],
      modeLegend: "Modo de cálculo",
      modes: {
        projection: {
          optionLabel: "Capital proyectado",
          hint: "Estima el capital que podrías acumular hasta la jubilación.",
        },
        required: {
          optionLabel: "Ahorro mensual necesario",
          hint: "Calcula el importe mensual necesario para alcanzar un capital objetivo.",
        },
      },
      currentAgeLabel: "Edad actual",
      currentAgeHint: "Tu edad hoy en años enteros, entre 18 y 99.",
      retirementAgeLabel: "Edad de jubilación",
      retirementAgeHint:
        "La edad a la que prevés dejar de ahorrar para la jubilación, en años enteros. Debe ser posterior a tu edad actual.",
      currentSavingsLabel: "Ahorros actuales para la jubilación",
      currentSavingsHint:
        "Lo que ya tienes reservado para la jubilación, en cualquier moneda. Déjalo vacío si empiezas desde cero.",
      contributionLabel: "Aporte mensual",
      contributionHint:
        "El importe que añades cada mes, en cualquier moneda. Déjalo vacío si no aportas cada mes.",
      targetLabel: "Capital objetivo para la jubilación",
      targetHint:
        "El importe nominal que quieres alcanzar al jubilarte, en cualquier moneda. No se aplica conversión de divisas.",
      rateLabel: "Rentabilidad anual esperada (%)",
      rateHint:
        "Una rentabilidad nominal anual que asumes, no un tipo garantizado. Déjalo vacío o escribe 0 para no suponer crecimiento.",
      inflationLabel: "Inflación anual esperada (%)",
      inflationHint:
        "Opcional. Añade una estimación ajustada por inflación en dinero de hoy; la proyección nominal no cambia. Déjalo vacío para omitirla.",
      assumptionsHeading: "Supuestos",
      frequencyLabel: "Frecuencia de capitalización",
      frequencyHint:
        "Con qué frecuencia se capitaliza la rentabilidad. La capitalización diaria usa un año de 365 días.",
      frequencies: {
        annual: "Anual",
        semiannual: "Semestral",
        quarterly: "Trimestral",
        monthly: "Mensual",
        daily: "Diaria",
      },
      timingLabel: "Aportar al inicio de cada mes",
      timingHint: "Desactivado: los aportes se añaden al final de cada mes.",
      projectedCorpusLabel: "Capital proyectado para la jubilación",
      requiredMonthlyLabel: "Ahorro mensual necesario",
      targetResultLabel: "Capital objetivo nominal",
      currentResultLabel: "Ahorros actuales para la jubilación",
      contributionsLabel: "Aportes futuros totales",
      investedLabel: "Total invertido",
      interestLabel: "Crecimiento proyectado de la inversión",
      projectedResultLabel: "Capital proyectado al jubilarte",
      realValueLabel: "Valor ajustado por inflación",
      realTargetLabel: "Objetivo ajustado por inflación",
      yearsLabel: "Años hasta la jubilación",
      yearsValue: "{count} años",
      yearValue: "{count} año",
      successAlreadyCovered:
        "Tus ahorros actuales para la jubilación ya alcanzan el objetivo. No se requiere aporte mensual con estos supuestos.",
      successInterestOnly:
        "No se requiere aporte mensual: tus ahorros actuales alcanzarán el objetivo solo con el crecimiento.",
      growthHeading: "Proyección anual de la jubilación",
      growthHint:
        "Cada fila cubre 12 meses y muestra la edad alcanzada al final de ese año. Los valores son nominales.",
      growthEmpty: "Calcula una proyección para ver el desglose anual.",
      growthScrollLabel:
        "Tabla desplazable de la proyección anual de la jubilación",
      tableCaption: "Proyección anual de la jubilación",
      tableHeaders: {
        age: "Edad",
        year: "Año",
        openingBalance: "Saldo inicial",
        contributions: "Aportes",
        interest: "Crecimiento de la inversión",
        closingBalance: "Saldo final",
      },
      ageLabel: "Edad {age}",
      copySummary: "Copiar resumen",
      copyTextProjection:
        "Proyección de jubilación\nEdad actual: {currentAge}\nEdad de jubilación: {retirementAge}\nAhorros actuales para la jubilación: {current}\nAporte mensual: {contribution}\nRentabilidad anual esperada: {rate} %\nCapitalización: {frequency}\nMomento del aporte: {timing}\nAños hasta la jubilación: {duration}\nCapital proyectado para la jubilación: {corpus}\nTotal invertido: {invested}\nCrecimiento proyectado de la inversión: {growth}",
      copyTextRequired:
        "Plan de ahorro para la jubilación\nEdad actual: {currentAge}\nEdad de jubilación: {retirementAge}\nAhorros actuales para la jubilación: {current}\nCapital objetivo nominal: {target}\nRentabilidad anual esperada: {rate} %\nCapitalización: {frequency}\nMomento del aporte: {timing}\nAños hasta la jubilación: {duration}\nAhorro mensual necesario: {required}\nAportes futuros totales: {contributions}\nTotal invertido: {invested}\nCrecimiento proyectado de la inversión: {growth}\nCapital proyectado al jubilarte: {corpus}",
      copyRealLine: "Valor ajustado por inflación: {value}",
      copyRealTargetLine: "Objetivo ajustado por inflación: {value}",
      captionProjection: "Capital proyectado de {corpus} a los {age} años.",
      captionRequired:
        "{required} al mes para alcanzar {target} a los {age} años.",
      formulas: {
        projection: {
          template: "FV = P × g^N + C × ((g^N − 1) ÷ i) × k",
          describe:
            "{rate} % nominal = {monthlyRate} % al mes tras la capitalización.",
        },
        required: {
          template: "C = (T − P × g^N) × i ÷ ((g^N − 1) × k)",
          describe:
            "{rate} % nominal = {monthlyRate} % al mes tras la capitalización.",
        },
      },
      timingValues: {
        end: "Final de mes",
        beginning: "Inicio de mes",
      },
      errors: {
        currentAge: "Escribe una edad actual entre 18 y 99.",
        retirementAge: "Escribe una edad de jubilación entre 19 y 100.",
        retirementOrder:
          "La edad de jubilación debe ser posterior a la edad actual.",
        savings: "Escribe ahorros actuales para la jubilación de 0 o más.",
        contribution: "Escribe un aporte mensual de 0 o más.",
        target:
          "Escribe un capital objetivo para la jubilación mayor que cero.",
        rate: "Escribe una rentabilidad anual esperada de 0 o más.",
        inflation: "Escribe una inflación anual esperada de 0 o más.",
        frequency: "Elige una frecuencia de capitalización admitida.",
        timing: "Elige un momento de aporte admitido.",
        noInvestment:
          "Escribe ahorros actuales para la jubilación o un aporte mensual mayor que cero.",
        overflow:
          "El resultado está fuera del rango numérico admitido. Prueba con valores más pequeños.",
      },
      sections: [
        {
          heading: "Cómo funciona",
          paragraphs: [
            "Introduce tu edad actual, la edad de jubilación y tus ahorros actuales para la jubilación. En el modo de capital proyectado, añade un aporte mensual y observa cuánto podrías acumular hasta la jubilación. En el modo de ahorro mensual necesario, escribe un capital objetivo nominal y observa el importe mensual necesario para alcanzarlo.",
            "Todo se ejecuta en tu navegador. Al cambiar cualquier dato se borra el resultado anterior para que las cifras en pantalla siempre correspondan a los valores actuales. Para un objetivo a más corto plazo, usa la [calculadora de objetivo de ahorro](/savings-goal-calculator).",
          ],
        },
        {
          heading: "Capital proyectado y ahorro mensual necesario",
          paragraphs: [
            "El horizonte es el número entero de años entre tu edad actual y la edad de jubilación, convertido a meses: `N = (retirementAge − currentAge) × 12`. Tus ahorros actuales crecen durante todo el horizonte: `FV_existing = P × g^N`.",
            "En el modo de capital proyectado, el capital es `FV = P × g^N + C × ((g^N − 1) ÷ i) × k`, donde `C` es el aporte mensual y `k` vale 1 para aportes al final del mes o `g` para aportes al inicio del mes.",
            "En el modo de ahorro mensual necesario, el objetivo se reduce con el valor futuro de los ahorros actuales y se divide entre el mismo factor de anualidad: `C = (T − P × g^N) × i ÷ ((g^N − 1) × k)`. Cuando la rentabilidad es cero, el importe necesario es simplemente `(T − P) ÷ N`.",
          ],
        },
        {
          heading: "Rentabilidad, capitalización y momento del aporte",
          paragraphs: [
            "La frecuencia de capitalización elegida define un factor mensual equivalente `g = (1 + r/m)^(m/12)`. Los intereses se acumulan mensualmente a `i = g − 1`, igual que en la [calculadora de interés compuesto](/compound-interest-calculator). La capitalización diaria usa un año fijo de 365 días; los años bisiestos se ignoran.",
            "Los aportes al inicio del mes generan crecimiento en el mismo mes. Los aportes al final del mes empiezan a generarlo en el mes siguiente.",
          ],
        },
        {
          heading: "Valores ajustados por inflación",
          paragraphs: [
            "Los valores ajustados por inflación son estimaciones del poder de compra de hoy. La proyección nominal se calcula por separado.",
            "Introducir una inflación no cambia la rentabilidad nominal, la proyección nominal ni el objetivo. Solo añade `nominal ÷ (1 + inflación)^años` como segunda vista. La tabla anual sigue siendo nominal.",
            "El capital objetivo es siempre nominal. El objetivo ajustado por inflación muestra cuánto vale ese importe nominal en dinero de hoy, no un objetivo que cambie automáticamente.",
          ],
        },
        {
          heading: "Supuestos y límites",
          items: [
            "La rentabilidad anual esperada es un supuesto nominal que introduces. No es una garantía, una previsión ni asesoramiento financiero personalizado.",
            "Los aportes son solo mensuales y constantes durante todo el horizonte. No se modelan aumentos anuales del aporte, retiradas, aportes impagados, comisiones, impuestos, seguros, pensiones, prestaciones públicas ni gastos sanitarios.",
            "Las edades son años enteros. El horizonte de proyección va de 1 a 82 años (12 a 984 meses).",
            "El ahorro mensual necesario se redondea hacia arriba al siguiente céntimo y la proyección se reconstruye con ese importe, de modo que el saldo final alcanza o supera ligeramente el objetivo.",
            "La calculadora es neutral respecto a la moneda. No convierte divisas ni añade símbolos de moneda.",
            "Los resultados usan precisión completa internamente. El dinero se muestra con dos decimales, así que las filas anuales pueden diferir de los totales exactos en un pequeño ajuste de redondeo.",
          ],
        },
        {
          heading: "Privacidad",
          paragraphs: [
            "Todo se calcula en tu navegador. Tus edades, ahorros, aportes y proyección anual nunca se suben, se guardan en el almacenamiento del navegador ni se envían a un servicio de terceros.",
          ],
        },
      ],
    },
    scientificCalculator: {
      title: "Calculadora científica — AppKitX",
      metaDescription:
        "Calculadora científica gratis: evalúa expresiones con paréntesis, potencias, raíces, logaritmos, trigonometría y constantes, en grados o radianes.",
      name: "Calculadora científica",
      description:
        "Evalúa expresiones científicas con paréntesis, potencias, raíces, logaritmos, trigonometría y constantes, en grados o radianes.",
      cardDescription: "Expresiones, trigonometría, logaritmos y constantes.",
      keywords: [
        "calculadora científica",
        "científica",
        "trigonometría",
        "seno",
        "coseno",
        "tangente",
        "logaritmo",
        "factorial",
        "potencia",
        "raíz",
        "paréntesis",
        "grados",
        "radianes",
        "calculadora matemática",
      ],
      angleModeLegend: "Modo angular",
      angleModes: {
        degrees: "Grados",
        radians: "Radianes",
      },
      angleModeHint:
        "Las funciones trigonométricas y los resultados inversos usan el modo angular seleccionado.",
      expressionLabel: "Expresión",
      expressionHint:
        "Usa + − × ÷, paréntesis, funciones y constantes. El porcentaje es posfijo: 50 % = 0,5. ± cambia el signo de toda la expresión.",
      expressionPlaceholder: "p. ej. sin(30) + 2^3",
      keypadLabel: "Teclado de la calculadora",
      functionKeys: {
        sin: { label: "sin", ariaLabel: "Seno" },
        cos: { label: "cos", ariaLabel: "Coseno" },
        tan: { label: "tan", ariaLabel: "Tangente" },
        asin: { label: "sin⁻¹", ariaLabel: "Seno inverso" },
        acos: { label: "cos⁻¹", ariaLabel: "Coseno inverso" },
        atan: { label: "tan⁻¹", ariaLabel: "Tangente inversa" },
        sinh: { label: "sinh", ariaLabel: "Seno hiperbólico" },
        cosh: { label: "cosh", ariaLabel: "Coseno hiperbólico" },
        tanh: { label: "tanh", ariaLabel: "Tangente hiperbólica" },
        ln: { label: "ln", ariaLabel: "Logaritmo natural" },
        log: { label: "log", ariaLabel: "Logaritmo en base 10" },
        exp: { label: "eˣ", ariaLabel: "Exponencial" },
        sqrt: { label: "√", ariaLabel: "Raíz cuadrada" },
        cbrt: { label: "∛", ariaLabel: "Raíz cúbica" },
        root: { label: "ⁿ√", ariaLabel: "Raíz n-ésima" },
        abs: { label: "|x|", ariaLabel: "Valor absoluto" },
        reciprocal: { label: "1/x", ariaLabel: "Recíproco" },
        square: { label: "x²", ariaLabel: "Cuadrado" },
        cube: { label: "x³", ariaLabel: "Cubo" },
        power: { label: "xʸ", ariaLabel: "Potencia" },
        factorial: { label: "n!", ariaLabel: "Factorial" },
        percent: { label: "%", ariaLabel: "Porcentaje" },
        pi: { label: "π", ariaLabel: "Pi" },
        e: { label: "e", ariaLabel: "Número de Euler" },
      },
      controlKeys: {
        add: { label: "+", ariaLabel: "Sumar" },
        subtract: { label: "−", ariaLabel: "Restar" },
        multiply: { label: "×", ariaLabel: "Multiplicar" },
        divide: { label: "÷", ariaLabel: "Dividir" },
        openParenthesis: { label: "(", ariaLabel: "Abrir paréntesis" },
        closeParenthesis: { label: ")", ariaLabel: "Cerrar paréntesis" },
        comma: { label: ",", ariaLabel: "Coma" },
        decimal: { label: ".", ariaLabel: "Punto decimal" },
        sign: { label: "±", ariaLabel: "Cambiar signo" },
        clear: { label: "C", ariaLabel: "Borrar todo" },
        backspace: { label: "⌫", ariaLabel: "Retroceso" },
        equals: { label: "=", ariaLabel: "Igual" },
      },
      resultCaption: "{expression} = {result}",
      historyHeading: "Historial",
      historyHint:
        "Hasta 20 cálculos, guardados solo en esta sesión del navegador.",
      historyEmpty: "Aún no hay cálculos.",
      historyResultLabel: "Resultado",
      useExpression: "Usar expresión",
      useResult: "Usar resultado",
      keyboardHelp:
        "Escribe una expresión, pulsa Intro para calcular y Esc para borrar.",
      errors: {
        empty: "Introduce una expresión.",
        invalid: "Revisa la expresión e inténtalo de nuevo.",
        limits: "La expresión es demasiado larga o tiene demasiados niveles.",
        "division-by-zero": "La división por cero no está definida.",
        domain: "Esta operación no está definida para esos valores.",
        overflow: "El resultado está fuera del rango numérico admitido.",
        "factorial-range":
          "El factorial solo está definido para números enteros de 0 a 170.",
      },
      sections: [
        {
          heading: "Cómo funciona",
          paragraphs: [
            "Escribe una expresión o usa el teclado. La calculadora respeta la precedencia habitual: primero los paréntesis, después las potencias, luego la multiplicación y la división, y por último la suma y la resta.",
            "Pulsa Igual o Intro para evaluar. Los cálculos correctos se añaden a un historial que dura solo esta sesión del navegador, y cualquier resultado guardado se puede reutilizar en una expresión nueva.",
          ],
        },
        {
          heading: "Operaciones científicas y modo angular",
          paragraphs: [
            "Usa potencias con `^`, raíces con `sqrt`, `cbrt` o `root(n, x)`, y funciones como `sin`, `ln`, `abs` y `exp`. El factorial usa el posfijo `!`; el porcentaje también es posfijo, así que `50%` significa 0,5.",
            "La entrada trigonométrica y la salida trigonométrica inversa siguen el modo angular seleccionado. Las funciones hiperbólicas no dependen del modo angular.",
          ],
        },
        {
          heading: "Precisión y límites",
          paragraphs: [
            "Los cálculos usan la precisión completa de coma flotante. Los resultados mostrados se redondean a 12 dígitos significativos y pasan a notación científica para valores muy grandes o muy pequeños; el historial reutiliza 15 dígitos significativos.",
            "El factorial se limita a números enteros de 0 a 170. Las expresiones se limitan a 500 caracteres y 32 niveles de anidamiento. La división por cero, los dominios no válidos y los resultados no finitos se rechazan con un mensaje en línea.",
          ],
        },
        {
          heading: "Historial y teclado",
          paragraphs: [
            "El historial se guarda en memoria solo mientras dura esta página. Reutiliza una expresión guardada para editarla o inserta su resultado en un cálculo nuevo.",
            "El campo de expresión acepta entrada de teclado: Intro evalúa, Esc borra y Retroceso edita como de costumbre.",
          ],
        },
        {
          heading: "Privacidad",
          paragraphs: [
            "Todo se calcula en tu navegador. Las expresiones y el historial nunca se suben, se guardan en el almacenamiento del navegador ni se envían a un servicio de terceros.",
          ],
        },
      ],
    },
    unitConverter: {
      title: "Conversor de unidades — AppKitX",
      metaDescription:
        "Conversor de unidades gratis para longitud, peso, temperatura, superficie y volumen: convierte metros a pies, kilos a libras, metros cuadrados a pies cuadrados, litros a galones estadounidenses y más.",
      name: "Conversor de unidades",
      description:
        "Convierte longitud, peso, temperatura, superficie y volumen con cálculos precisos en el navegador.",
      cardDescription:
        "Conversiones de longitud, peso, temperatura, superficie y volumen.",
      keywords: [
        "conversor",
        "unidades",
        "longitud",
        "peso",
        "masa",
        "temperatura",
        "superficie",
        "volumen",
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
        "metros cuadrados",
        "pies cuadrados",
        "hectáreas",
        "litros",
        "mililitros",
        "galones estadounidenses",
        "tazas",
        "onzas líquidas",
      ],
      categoryLegend: "Conversión",
      categories: {
        length: "Longitud",
        weight: "Peso",
        temperature: "Temperatura",
        area: "Superficie",
        volume: "Volumen",
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
        area: {
          cm2: "Centímetro cuadrado",
          m2: "Metro cuadrado",
          km2: "Kilómetro cuadrado",
          ft2: "Pie cuadrado",
          yd2: "Yarda cuadrada",
          ac: "Acre",
          ha: "Hectárea",
        },
        volume: {
          ml: "Mililitro",
          l: "Litro",
          m3: "Metro cúbico",
          tsp: "Cucharadita estadounidense",
          tbsp: "Cucharada estadounidense",
          floz: "Onza líquida estadounidense",
          cup: "Taza estadounidense",
          pt: "Pinta estadounidense",
          qt: "Cuarto de galón estadounidense",
          gal: "Galón estadounidense",
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
            "Elige una de las cinco categorías de conversión —longitud, peso, temperatura, superficie o volumen—, escribe el valor y selecciona las unidades en ambos lados. Pulsa Calcular para ver el valor convertido y la misma conversión escrita completa.",
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
          heading: "Superficie",
          paragraphs: [
            "La superficie usa unidades cuadradas, así que cada factor es la definición lineal correspondiente elevada al cuadrado: `1 ft² = 0,3048² m² = 0,09290304 m²` y `1 yd² = 0,9144² m² = 0,83612736 m²`.",
            "`1 hectárea = 10.000 m²` y `1 acre = 4840 yd² = 4046,8564224 m²` con la yarda internacional. El acre y la hectárea son medidas de tierra; ninguno es un prefijo métrico del otro.",
          ],
        },
        {
          heading: "Volumen",
          paragraphs: [
            "El volumen usa metros cúbicos internamente: `1 L = 0,001 m³` y `1 mL = 0,000001 m³`. Los litros y mililitros son subdivisiones exactas del metro cúbico.",
            "Las unidades de volumen estadounidenses son del sistema consuetudinario de EE. UU., no imperiales británicas. `1 galón estadounidense = 231 in³ = 3,785411784 L`; la onza líquida, la taza, la pinta, el cuarto y las cucharadas estadounidenses son fracciones exactas de ese galón. Una taza estadounidense son 236,5882365 mL, no la taza legal estadounidense de 240 mL ni la taza métrica de 250 mL.",
            "Los galones, pintas y onzas líquidas imperiales británicos no se incluyen en esta versión, y tampoco las medidas secas estadounidenses. El calificador `US` aparece en el nombre y el símbolo de cada unidad de EE. UU. para que ninguna conversión se confunda con la imperial.",
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
            "Los cálculos usan números de coma flotante IEEE-754. Los valores mostrados se redondean para facilitar la lectura y no son una afirmación de aritmética decimal exacta para cada resultado.",
            "El conversor solo admite longitud, peso, temperatura, superficie y volumen; para la velocidad, usa el [conversor de velocidad](/speed-converter). Tampoco admite presión, energía ni divisas, y nunca adivina la unidad a partir del valor.",
            "Las unidades de volumen estadounidenses llevan `US` en el nombre y en el símbolo. Se evitan términos sin calificar como «galón» o «taza» porque designan volúmenes distintos en otros sistemas.",
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
            "Todo se ejecuta en tu navegador. El conversor conserva la precisión completa internamente y solo redondea el resultado que se muestra. Para longitud, peso, temperatura, superficie y volumen, usa el [conversor de unidades](/unit-converter).",
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
            "Base64 es una codificación, no un cifrado: cualquiera puede descodificarla, así que no debe usarse para proteger datos. Si el contenido codificado es JSON, el [formateador JSON](/json-formatter) puede validarlo y darle formato tras descodificarlo.",
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
            "Una cadena Base64 corta es texto sin formato, así que puede llevarse en un [código QR](/qr-code-generator); los contenidos más largos superan la capacidad del QR.",
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
            "Minimizar elimina todos los espacios insignificantes y produce el texto más pequeño que representa los mismos datos: útil antes de pegar JSON en archivos de configuración o cargas de API. Si el resultado debe viajar por un canal de solo texto, codifícalo con el [codificador Base64](/base64-encoder).",
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
            "El Wi-Fi usa el formato `WIFI:` con el SSID, el tipo de seguridad y la contraseña. Los contactos vCard usan `BEGIN:VCARD` con el nombre, teléfono, correo, organización y sitio web que indiques. El texto plano se codifica tal como se escribe; si debe contener datos binarios o estructurados, codifícalo primero con el [codificador Base64](/base64-encoder).",
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
            "Las palabras se cuentan como secuencias Unicode de letras, marcas combinantes, dígitos y números. Los apóstrofos internos y los separadores decimales permanecen dentro de una palabra; los guiones separan palabras; el contenido formado solo por puntuación o emoji cuenta como cero. Las mayúsculas y minúsculas nunca cambian un recuento; para cambiarlas, usa el [conversor de mayúsculas y minúsculas](/case-converter).",
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
            "Pega o escribe en el panel de entrada y elige una conversión. El resultado se actualiza al momento y es de solo lectura, así que cambiar de modo siempre parte de tu texto original. Usa Copiar resultado para reutilizarlo. Para medir la longitud o el tiempo de lectura del resultado, usa el [contador de palabras](/word-counter).",
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
    timeZoneConverter: {
      title: "Conversor de zonas horarias — AppKitX",
      metaDescription:
        "Conversor de zonas horarias gratis: convierte una fecha y hora entre las principales zonas horarias IANA, con desfases UTC, cambios de fecha y avisos de horario de verano.",
      name: "Conversor de zonas horarias",
      description:
        "Convierte una fecha y hora entre zonas horarias, con desfases UTC precisos, cambios de fecha y avisos de horario de verano.",
      cardDescription:
        "Convierte una fecha y hora entre zonas horarias con desfases UTC y avisos de horario de verano.",
      keywords: [
        "conversor de zonas horarias",
        "calculadora de zonas horarias",
        "diferencia horaria entre ciudades",
        "convertir hora entre países",
        "horario de verano",
        "cambio de hora",
        "hora UTC",
        "conversor horario",
        "reunión entre zonas horarias",
        "hora en nueva york",
        "hora en tokio",
      ],
      dateLabel: "Fecha",
      dateHint:
        "La fecha en la zona horaria de origen. Por defecto, la de hoy en este dispositivo.",
      timeLabel: "Hora",
      timeHint:
        "La hora local en la zona horaria de origen. Por defecto, la hora actual de este dispositivo.",
      sourceZoneLabel: "Zona horaria de origen",
      sourceZoneHint:
        "La zona horaria en la que se introducen la fecha y la hora.",
      targetZoneLabel: "Zona horaria de destino",
      targetZoneHint: "La zona horaria a la que quieres convertir.",
      useCurrentTime: "Usar la hora actual",
      convertedTimeLabel: "Hora convertida",
      convertedDateLabel: "Fecha convertida",
      weekdayLabel: "Día de la semana",
      sourceOffsetLabel: "Desfase UTC de origen",
      targetOffsetLabel: "Desfase UTC de destino",
      differenceLabel: "Diferencia horaria",
      dayChangeLabel: "Cambio de día",
      sourceSummaryLabel: "Origen",
      targetSummaryLabel: "Destino",
      summaryLine: "{time}, {date} — {label} ({zone})",
      deviceZoneSuffix: "dispositivo",
      zoneLabels: {
        UTC: "UTC",
        "America/New_York": "Nueva York",
        "America/Los_Angeles": "Los Ángeles",
        "America/Chicago": "Chicago",
        "America/Toronto": "Toronto",
        "Europe/London": "Londres",
        "Europe/Madrid": "Madrid",
        "Europe/Paris": "París",
        "Europe/Berlin": "Berlín",
        "Asia/Kolkata": "Calcuta",
        "Asia/Kathmandu": "Katmandú",
        "Asia/Dubai": "Dubái",
        "Asia/Singapore": "Singapur",
        "Asia/Tokyo": "Tokio",
        "Asia/Shanghai": "Shanghái",
        "Australia/Sydney": "Sídney",
        "Pacific/Auckland": "Auckland",
        "Pacific/Chatham": "Chatham",
        "Africa/Johannesburg": "Johannesburgo",
        "America/Sao_Paulo": "São Paulo",
      },
      sameDay: "Mismo día",
      nextDay: "Día siguiente",
      previousDay: "Día anterior",
      daysAhead: "{count} días después",
      daysBehind: "{count} días antes",
      sameTime: "Misma hora",
      differenceAhead: "{duration} por delante",
      differenceBehind: "{duration} por detrás",
      durationHours: "{hours} h",
      durationMinutes: "{minutes} min",
      durationHoursMinutes: "{hours} h {minutes} min",
      dstGap:
        "Esa hora local no existe en {zone} porque los relojes se adelantan {duration} por el horario de verano. Elige una hora local válida.",
      dstAmbiguous:
        "Esa hora local ocurre dos veces en {zone} porque los relojes se atrasan por el horario de verano. Se seleccionó la primera ocurrencia ({offset}).",
      dataNote:
        "Los desfases y las reglas de horario de verano provienen de los datos de zonas horarias de tu navegador. Las fechas admitidas van de 1900 a 2100.",
      comparisonHeading: "Principales zonas horarias",
      comparisonHint:
        "El mismo instante en zonas de referencia fijas. Las horas son locales y pueden caer en otra fecha.",
      comparisonEmpty:
        "Introduce una fecha y hora válidas para ver la comparación.",
      comparisonScrollLabel:
        "Tabla desplazable de comparación de zonas horarias",
      comparisonCaption: "Comparación de zonas horarias",
      comparisonHeaders: {
        zone: "Zona horaria",
        date: "Fecha",
        time: "Hora",
        offset: "Desfase UTC",
        day: "Día",
      },
      copySummary: "Copiar resumen",
      copyText:
        "Conversión de zona horaria\n{sourceTime}, {sourceDate} — {sourceLabel} ({sourceZone})\n→ {targetTime}, {targetDate} — {targetLabel} ({targetZone})\nDesfase de origen: {sourceOffset}\nDesfase de destino: {targetOffset}\nDiferencia horaria: {difference}",
      copyAmbiguousLine:
        "Horario de verano: esta hora local ocurre dos veces; se seleccionó la primera ocurrencia ({offset}).",
      caption:
        "Convertido desde las {sourceTime} del {sourceDate} en {sourceLabel}.",
      errors: {
        date: "Escribe una fecha válida.",
        dateRange: "Escribe una fecha entre 1900 y 2100.",
        time: "Escribe una hora válida.",
        sourceZone: "Elige una zona horaria de origen admitida.",
        targetZone: "Elige una zona horaria de destino admitida.",
        unexpected:
          "No se pudo completar la conversión. Revisa la fecha, la hora y las zonas horarias.",
      },
      sections: [
        {
          heading: "Cómo funciona",
          paragraphs: [
            "Elige la fecha, la hora y la zona horaria de origen, y después la zona de destino. El conversor interpreta la fecha y la hora como una hora local en la zona de origen y encuentra el instante UTC correspondiente. Luego muestra ese instante en la zona de destino, con ambos desfases UTC.",
            "Al cambiar cualquier dato se borra el resultado anterior para que las cifras en pantalla siempre correspondan a los valores actuales. Todo se ejecuta en tu navegador.",
          ],
        },
        {
          heading: "Horario de verano: huecos y repeticiones",
          paragraphs: [
            "Cuando los relojes se adelantan, algunas horas locales nunca ocurren. Por ejemplo, las 02:30 del 8 de marzo de 2026 no existen en Nueva York. El conversor rechaza una hora dentro de ese hueco y te pide que elijas una hora local válida; nunca desplaza el resultado en silencio.",
            "Cuando los relojes se atrasan, algunas horas locales ocurren dos veces. Por ejemplo, las 01:30 del 1 de noviembre de 2026 ocurren dos veces en Nueva York. El conversor selecciona la primera ocurrencia, muestra qué desfase UTC se usó y te avisa de que la hora local era ambigua.",
          ],
        },
        {
          heading: "Desfases y tabla de comparación",
          paragraphs: [
            "Los desfases se calculan para el instante convertido, no para hoy, así que las fechas de verano e invierno pueden mostrar desfases distintos. Se admiten desfases de media hora y de cuarto de hora como UTC+05:30, UTC+05:45 y UTC+12:45.",
            "La tabla de comparación muestra el mismo instante en zonas de referencia fijas. Una fila puede caer en el día anterior o siguiente respecto a tu fecha de origen.",
          ],
        },
        {
          heading: "Supuestos y límites",
          items: [
            "Las reglas y los desfases de las zonas horarias provienen de los datos IANA del navegador. El conversor no incluye su propia base de datos de zonas horarias.",
            "Las fechas admitidas van de 1900 a 2100. No se puede garantizar la exactitud histórica anterior a los datos disponibles en el navegador.",
            "La herramienta convierte un instante cada vez. No planifica reuniones, no resalta horas laborables, no crea eventos de calendario ni convierte horarios recurrentes.",
            "La lista seleccionada cubre zonas principales y la zona de tu dispositivo. Los identificadores IANA se usan internamente; abreviaturas como EST o IST no se tratan como nombres únicos de zona.",
          ],
        },
        {
          heading: "Privacidad",
          paragraphs: [
            "Todo se calcula en tu navegador. Tus fechas, horas y zonas horarias seleccionadas nunca se suben, se guardan en el almacenamiento del navegador ni se envían a un servicio de terceros.",
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
