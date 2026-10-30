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
      "Calculadoras, utilidades para desarrolladores y herramientas de fecha y hora, gratis y en un solo lugar.",
    socialImageAlt:
      "AppKitX — herramientas online gratuitas: calculadoras, utilidades para desarrolladores y herramientas de fecha y hora.",
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
      "Calculadoras, utilidades para desarrolladores y herramientas de fecha y hora, todo en un solo lugar.",
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
          "Las calculadoras cubren las cuentas de porcentajes del día a día: calcula el X % de un número, averigua qué porcentaje representa un valor de otro, mide aumentos y disminuciones porcentuales y comprueba cuánto ahorras con un descuento y el precio final.",
          "Funcionan por completo en tu navegador, muestran la fórmula de cada resultado y permiten copiarlo con un clic. Los importes se tratan tal como los escribes: la calculadora de descuentos es neutral respecto a la moneda y los resultados solo se redondean para mostrarlos.",
        ],
      },
    },
    Converters: { name: "Conversores" },
    "Developer tools": {
      name: "Herramientas de desarrollo",
      page: {
        title: "Herramientas de desarrollo gratis — AppKitX",
        metaDescription:
          "Herramientas de desarrollo gratis en tu navegador: codifica y descodifica Base64 y formatea, minimiza o valida JSON. Nada de lo que pegas se sube.",
        toolsHeading: "Herramientas de desarrollo gratis",
        intro: [
          "Utilidades en el navegador para el trabajo diario de desarrollo: convierte texto a Base64 y viceversa, y formatea, minimiza o valida JSON.",
          "Se ejecutan por completo en tu navegador: nada de lo que pegas se sube a ningún sitio. Cada herramienta documenta su comportamiento y sus casos límite, y todos los resultados se pueden copiar con un clic.",
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
        amountRange: "Introduce un número entero.",
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
            "Solo se cuentan días completos: no intervienen horas, minutos ni zonas horarias, así que el resultado nunca depende de dónde estés.",
            "El cálculo se hace por completo en tu navegador; la fecha que introduces no se sube nunca.",
          ],
        },
      ],
    },
  },
};
