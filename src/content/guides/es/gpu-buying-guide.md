---
slug: gpu-buying-guide
lang: es
title: "Guía de compra de GPU: rendimiento, VRAM y cargas de trabajo"
seoTitle: "Guía de compra de GPU: rendimiento y VRAM"
description: "Cómo elegir una tarjeta gráfica según resolución, VRAM, carga de trabajo, consumo y espacio, sin fiarse solo del nombre del modelo."
category: "Buying advice"
tags:
  - gpu
  - tarjeta gráfica
  - gaming
  - vram
  - estación de trabajo
published: 2026-11-01
updated: 2026-11-02
author: AppKitX Editorial
related:
  - how-to-choose-a-cpu
  - how-to-check-pc-component-compatibility
  - how-to-choose-the-right-power-supply
references:
  - title: "Tarjetas gráficas NVIDIA GeForce"
    publisher: "NVIDIA"
    url: "https://www.nvidia.com/en-us/geforce/graphics-cards/"
  - title: "Tarjetas gráficas AMD Radeon"
    publisher: "AMD"
    url: "https://www.amd.com/en/products/graphics/desktops/radeon.html"
  - title: "Especificaciones PCI Express"
    publisher: "PCI-SIG"
    url: "https://pcisig.com/specifications"
  - title: "Descripción general de DisplayPort"
    publisher: "VESA"
    url: "https://www.displayport.org/"
---

La tarjeta gráfica es el componente que más probablemente determine el rendimiento en juegos, pero la caja no lo cuenta todo. El mismo procesador gráfico puede aparecer en varias tarjetas con disipadores, límites de potencia, configuraciones de memoria y overclocks de fábrica diferentes. Dos tarjetas con nombres parecidos pueden diferir en longitud, tipo de conector, ruido y garantía.

Esta guía explica cómo evaluar una tarjeta por lo que afecta a tu carga de trabajo: la GPU, la capacidad y el ancho de banda de la memoria, la refrigeración, la entrega de energía, las salidas de vídeo y el encaje físico. No recomienda modelos concretos, porque los precios y la disponibilidad varían por región.

## Separa la GPU de la tarjeta

La **GPU** es el chip gráfico. La **tarjeta gráfica** es el producto completo: el chip, la memoria, la regulación de tensión, el disipador, los ventiladores, la placa posterior (backplate), el soporte y las salidas de vídeo. Los ensambladores pueden construir tarjetas distintas alrededor de la misma GPU.

Al comparar productos, comprueba:

- el modelo exacto de GPU y el tamaño de memoria;
- el nombre y la referencia del modelo del ensamblador;
- la frecuencia de fábrica y el límite de potencia, si la tarjeta los expone;
- el diseño del disipador y el grosor de la tarjeta;
- los conectores de alimentación y la fuente recomendada;
- las salidas de vídeo y su resolución y frecuencia máximas;
- la garantía y el servicio regional.

Una tarjeta "overclockeada de fábrica" puede ser un poco más rápida que una de referencia, pero también puede ser más ruidosa o más cara. El disipador y la garantía suelen importar más que el aumento de frecuencia.

## Ajusta la tarjeta a tu resolución y frecuencia de refresco

La resolución y la frecuencia de refresco determinan cuánto trabajo debe hacer la GPU. Una tarjeta cómoda a 1080p puede quedarse corta a 1440p con ajustes altos, y una pantalla 4K multiplica de nuevo el número de píxeles.

La tabla siguiente es un punto de partida aproximado para juegos actuales con ajustes altos. No es una garantía: algunos juegos son mucho más pesados que otros, y el trazado de rayos, la generación de fotogramas y los ajustes de texturas cambian los requisitos.

| Objetivo                                      | Punto de partida de VRAM | Qué esperar                                                                                 |
| --------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------- |
| 1080p, 60–144 Hz                              | 8 GB                     | Suficiente para muchos juegos actuales, pero algunos ya superan los 8 GB con texturas altas |
| 1440p, 60–165 Hz                              | 12 GB                    | Una base más segura para texturas de alta resolución y margen futuro                        |
| 4K, 60 Hz o más                               | 16 GB                    | Más memoria y ancho de banda ayudan con texturas grandes y posprocesado pesado              |
| Realidad virtual y visores de alta resolución | 12–16 GB                 | La resolución por ojo y el supersampling aumentan la presión de memoria                     |
| Renderizado 3D, simulación e IA               | Depende de la aplicación | La capacidad puede ser un límite duro; consulta los requisitos del software                 |

La capacidad de VRAM no es lo mismo que el rendimiento. Una tarjeta con más memoria pero una GPU más lenta no será automáticamente más rápida. La capacidad importa cuando la carga necesita mantener más datos en la tarjeta; cuando se agota, el rendimiento puede caer bruscamente o la aplicación puede negarse a ejecutarse.

El **ancho de banda** de la memoria también importa, sobre todo a resoluciones altas. Dos tarjetas con la misma capacidad pueden tener bus y velocidad de memoria distintos. Los análisis que miden tus cargas son más útiles que cualquiera de los dos números por separado.

## Rasterización, trazado de rayos y escalado

La mayoría de los juegos siguen dependiendo en gran medida de la rasterización: dibujar geometría y sombrear píxeles directamente. El trazado de rayos añade iluminación y reflejos más realistas, pero es mucho más costoso desde el punto de vista computacional. Una tarjeta fuerte en rasterización no es automáticamente fuerte en trazado de rayos.

Las tecnologías de escalado renderizan a una resolución interna menor y reconstruyen una imagen de mayor resolución. Pueden mejorar la tasa de fotogramas, pero la calidad de imagen y la latencia varían según el juego, el ajuste y la implementación. La generación de fotogramas inserta fotogramas adicionales; puede mejorar la fluidez, pero añade latencia y requiere soporte del juego. Trata estas funciones como herramientas, no como sustituto del rendimiento base.

Al leer un análisis, separa:

- rendimiento a resolución nativa;
- rendimiento con escalado;
- rendimiento con trazado de rayos;
- rendimiento con generación de fotogramas;
- observaciones de calidad de imagen y latencia.

Una tasa de fotogramas de titular con todas las mejoras activadas no te dice cómo rinde la tarjeta a resolución nativa en un juego que no tiene esas funciones.

## Comprueba alimentación, conectores y comportamiento transitorio

Las tarjetas gráficas pueden consumir mucha energía y pueden tener picos por encima de su valor sostenido durante periodos cortos. La fuente debe soportar tanto la carga sostenida como los picos, y debe tener los conectores adecuados.

Comprueba:

- la potencia recomendada de fuente, como punto de partida y no como cálculo exacto;
- el número y tipo de conectores de alimentación;
- si la tarjeta usa un conector de estilo 12V-2x6 y qué adaptador o cable exige el fabricante;
- el soporte nativo de la fuente y la capacidad de sus cables;
- el espacio de la caja para el conector y el radio de curvatura del cable;
- el consumo del resto del sistema, incluida la CPU.

No uses un cable de una fuente modular con otro modelo de fuente. Los cables modulares no son universales, aunque los conectores parezcan iguales. Usa los cables suministrados con la fuente y sigue los manuales de la GPU y de la fuente.

Una fuente de más vatios no es automáticamente mejor. La calidad, las protecciones, la respuesta transitoria y la integridad de los conectores importan más que un número grande en la caja.

## Mide la tarjeta antes de comprar

Las tarjetas gráficas se han vuelto grandes. Comprueba las dimensiones del fabricante, no solo el número de ranuras:

- **Longitud:** compárala con la longitud máxima de GPU de la caja, incluidos los ventiladores frontales o el radiador.
- **Grosor:** una tarjeta de 2,5 o 3 ranuras puede bloquear otras ranuras o presionar el panel lateral.
- **Altura:** algunas tarjetas sobresalen por encima del soporte PCIe y pueden chocar con un radiador superior o una jaula de discos.
- **Espacio para cables:** un cable 12V-2x6 rígido necesita espacio para curvarse sin hacer fuerza sobre el conector.
- **Soporte:** las tarjetas pesadas pueden necesitar un soporte para evitar que se comben.

Comprueba también el flujo de aire de la caja. Una tarjeta que expulsa calor dentro de la caja necesita suficiente entrada y salida de aire para evacuarlo. Una tarjeta con turbina (blower) y una de ventiladores abiertos se comportan de forma distinta en una caja pequeña.

## Salidas de vídeo y monitores

Las salidas de la tarjeta determinan qué monitores puedes conectar y a qué resolución y frecuencia. Comprueba la versión exacta de cada salida:

- Las versiones de HDMI y DisplayPort admiten distintas resoluciones máximas, frecuencias y funciones.
- El soporte de sincronización adaptativa depende del monitor, la tarjeta y la conexión.
- Una tarjeta puede admitir una frecuencia alta solo por DisplayPort, no por HDMI.
- Las configuraciones multimonitor necesitan suficientes puertos y suficiente ancho de banda.

Si piensas usar un monitor de alta frecuencia, verifica la combinación de tarjeta, cable y monitor. Un cable que venía con un monitor antiguo puede no soportar todo el ancho de banda.

## Emparejamiento con la CPU y equilibrio del sistema

Una GPU muy rápida puede estar limitada por la CPU en algunos juegos, sobre todo a 1080p y ajustes bajos. Una CPU muy rápida puede estar limitada por la GPU a alta resolución y ajustes altos. El equilibrio depende del juego, la resolución, los ajustes y el objetivo de tasa de fotogramas.

No existe una "calculadora de cuello de botella" universal que prediga esto con exactitud. Los análisis que prueban CPU y GPU juntas en los juegos que usas son más útiles. Si actualizas primero la GPU, comprueba que la CPU y la fuente pueden seguir el ritmo; si actualizas primero la CPU, comprueba que la GPU no es ya el límite.

## Nuevas, usadas y consideraciones regionales

Una tarjeta gráfica usada puede ser buena relación calidad-precio, pero conlleva riesgos: historial de minería, ventiladores desgastados, accesorios ausentes, garantía acortada y estado desconocido. Si compras de segunda mano, pruébala bajo carga, revisa temperaturas y comportamiento de los ventiladores y confirma el modelo exacto y el tamaño de memoria.

Las diferencias regionales también importan:

- el mismo modelo puede tener límites de potencia o diseños de disipador distintos en diferentes mercados;
- el servicio de garantía puede estar ligado a la región de compra;
- una tarjeta vendida como "nueva" puede ser una variante regional con otro pack;
- los precios y la disponibilidad cambian rápido, así que una recomendación de otro país puede no aplicarse.

La calculadora de descuentos puede ayudarte a comparar un precio rebajado con uno anterior, pero no puede decirte si la tarjeta encaja bien en tu sistema.

## Un proceso de selección práctico

1. **Fija una resolución y un objetivo de frecuencia.** Sé realista con los juegos y ajustes que usas.
2. **Comprueba VRAM y ancho de banda para ese objetivo.** Usa análisis que midan juegos con mucha memoria, no solo la capacidad.
3. **Compara primero el rendimiento nativo.** Después valora el trazado de rayos y el escalado como funciones separadas.
4. **Comprueba el modelo exacto de tarjeta.** Confirma disipador, dimensiones, conectores y garantía.
5. **Verifica el espacio y el flujo de aire de la caja.** Mide longitud, grosor, altura y espacio para cables.
6. **Comprueba la fuente.** Confirma vatios, conectores, tipo de cables y comportamiento transitorio.
7. **Comprueba las salidas de vídeo.** Confirma la resolución, la frecuencia y el soporte de cable que necesitas.
8. **Comprueba la política de devolución y la garantía.** Sobre todo en tarjetas usadas o importadas.

## Errores comunes

- **Comprar solo por el nombre del modelo.** La misma GPU puede aparecer en tarjetas muy distintas.
- **Suponer que más VRAM significa más rendimiento.** La capacidad es un límite, no una medida de velocidad.
- **Ignorar el grosor de la tarjeta.** Puede caber a lo largo pero bloquear una ranura o el panel lateral.
- **Reutilizar cables de una fuente modular.** Los pines no son universales.
- **Usar un conector en cadena por encima de su capacidad.** Sigue la documentación de la GPU y de la fuente.
- **Comparar tasas de fotogramas con escalados distintos.** Los resultados nativos y escalados no son la misma medición.
- **Olvidar el monitor.** Una tarjeta rápida se desaprovecha en una pantalla de 60 Hz si querías más frecuencia.

## Límites de esta guía

Esta guía no puede predecir el rendimiento en un juego o una aplicación concretos. Las versiones de controladores, los parches, la resolución, los ajustes, la CPU, la memoria y la refrigeración cambian el resultado. Las especificaciones del fabricante describen las capacidades de la tarjeta, no su rendimiento en tu sistema. Usa análisis independientes para tu carga de trabajo y consulta la documentación exacta del producto antes de comprar.

La mejor tarjeta gráfica es la que alcanza tu objetivo de rendimiento a un precio que puedes justificar, cabe en tu caja, funciona con tu fuente y alimenta el monitor que realmente tienes.
