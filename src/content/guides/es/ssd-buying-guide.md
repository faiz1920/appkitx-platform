---
slug: ssd-buying-guide
lang: es
title: "Guía de compra de SSD: SATA vs NVMe"
seoTitle: "Guía de compra de SSD: SATA vs NVMe"
description: "Cómo elegir un SSD por interfaz, formato, NAND, resistencia, temperatura y carga real, no solo por velocidad secuencial."
category: "Buying advice"
tags:
  - ssd
  - almacenamiento
  - nvme
  - sata
  - m2
published: 2026-11-01
updated: 2026-11-02
author: AppKitX Editorial
related:
  - how-to-check-pc-component-compatibility
  - a-practical-guide-to-building-your-first-desktop-pc
  - how-to-choose-a-compatible-motherboard
references:
  - title: "Especificaciones NVM Express"
    publisher: "NVM Express"
    url: "https://nvme.org/"
  - title: "Especificaciones SATA-IO"
    publisher: "SATA-IO"
    url: "https://sata-io.org/"
  - title: "Especificaciones PCI Express"
    publisher: "PCI-SIG"
    url: "https://pcisig.com/specifications"
  - title: "Descripción general de DirectStorage"
    publisher: "Microsoft Learn"
    url: "https://learn.microsoft.com/gaming/gdk/docs/features/console/storage/directstorage/directstorage-overview"
---

El almacenamiento es fácil de simplificar: compra el SSD más grande que puedas permitirte y sigue adelante. Pero la interfaz, el formato, el controlador, el tipo de NAND, la resistencia y el comportamiento térmico afectan a cómo rinde una unidad en la práctica. Una unidad con una cifra enorme de velocidad secuencial puede seguir sintiéndose lenta en cargas aleatorias, calentarse en un portátil o desgastarse antes de lo esperado.

Esta guía explica las diferencias entre unidades SATA y NVMe, los formatos que encontrarás y las especificaciones que importan en un equipo de sobremesa.

## SATA frente a NVMe

SATA y NVMe son interfaces distintas con cuellos de botella distintos.

- **SATA** usa la interfaz SATA y suele limitarse a unos 6 Gb/s de ancho de banda de enlace. El rendimiento secuencial real suele quedarse en unos 500–560 MB/s, y el protocolo se diseñó para discos duros y los primeros SSD.
- **NVMe** usa el bus PCI Express y un protocolo diseñado para memoria flash. Puede alcanzar velocidades secuenciales mucho más altas y, más importante, mucha más profundidad de cola y menor latencia.

Para el uso diario de sobremesa, la diferencia entre un buen SSD SATA y un buen SSD NVMe suele ser menor de lo que sugieren los números secuenciales. Los tiempos de arranque, la apertura de aplicaciones y las cargas de juegos dependen de lecturas aleatorias, latencia y el resto del sistema. NVMe resulta más claramente útil en transferencias de archivos grandes, cargas de DirectStorage y multitarea pesada.

| Interfaz        | Formatos típicos         | Puntos fuertes prácticos                    | Advertencias                                                        |
| --------------- | ------------------------ | ------------------------------------------- | ------------------------------------------------------------------- |
| SATA            | 2,5 pulgadas, M.2 (SATA) | Muy compatible, económico, fácil de añadir  | Techo más bajo; el formato de 2,5 pulgadas necesita cables y bahía  |
| NVMe (PCIe 3.0) | M.2                      | Buen rendimiento diario, maduro y asequible | Reparto de ranuras y carriles; comprueba la placa                   |
| NVMe (PCIe 4.0) | M.2                      | Mayor rendimiento secuencial y aleatorio    | Calor; necesita flujo de aire o disipador                           |
| NVMe (PCIe 5.0) | M.2                      | Rendimiento secuencial muy alto             | Calor significativo; comprueba refrigeración y carriles de la placa |

Una unidad PCIe 5.0 no hace más rápida una ranura PCIe 4.0. La unidad y la ranura negocian la generación más alta que ambas admiten, así que una unidad más rápida puede funcionar a una generación inferior en una ranura antigua.

## Formatos y encaje físico

### M.2

M.2 es un formato de tarjeta pequeña que usan tanto unidades SATA como NVMe. La muesca del conector es distinta y la longitud importa. Las longitudes comunes incluyen 2280 (22 mm de ancho, 80 mm de largo), 2242 y 2230. Comprueba las longitudes admitidas por la placa y el separador de montaje.

Las ranuras M.2 pueden:

- compartir carriles con puertos SATA o ranuras PCIe;
- admitir solo PCIe o solo SATA;
- tener un disipador o exigir que lo compres;
- estar debajo de la tarjeta gráfica, lo que afecta al flujo de aire y al acceso.

Lee la tabla de reparto de carriles del manual de la placa antes de ocupar todas las ranuras.

### SATA de 2,5 pulgadas

Un SSD SATA de 2,5 pulgadas necesita un cable de datos SATA y un cable de alimentación, además de una bahía o punto de montaje. Es una buena opción para añadir almacenamiento a un sistema antiguo o para un equipo con bahías libres. Comprueba las opciones de montaje y el cableado de la caja.

### Otros formatos

Existen SSD U.2, EDSFF y de tarjeta de ampliación para servidores y estaciones de trabajo. No son piezas típicas de sobremesa de consumo. No supongas que una placa de consumo los admite.

## Qué significan las cifras de velocidad

Los fabricantes anuncian velocidades secuenciales de lectura y escritura, normalmente medidas con colas profundas y condiciones favorables. Esas cifras son útiles para transferencias grandes, pero no describen:

- el rendimiento aleatorio de lectura y escritura con colas poco profundas, que afecta a la respuesta diaria;
- la velocidad de escritura sostenida después de agotar la caché de la unidad;
- el rendimiento cuando la unidad está llena;
- la limitación térmica bajo carga sostenida;
- la latencia.

Busca análisis que midan cargas reales: carga de juegos, apertura de aplicaciones, copias de archivos y escrituras sostenidas. Una unidad rápida en ráfaga pero que se frena mucho después de unos gigabytes puede ser mala elección para edición de vídeo o instalaciones grandes de juegos.

## NAND, controladores y DRAM

Los SSD usan memoria flash NAND y un controlador. El controlador gestiona el desgaste, la corrección de errores y la caché de la unidad. El tipo de NAND afecta a la resistencia y al coste.

- **TLC** (triple-level cell) es común en unidades de consumo y ofrece un buen equilibrio entre resistencia y precio.
- **QLC** (quad-level cell) puede ser más barata por gigabyte, pero suele tener menor resistencia y escrituras sostenidas más lentas.
- **MLC** es menos común en unidades de consumo y generalmente más cara.
- **SLC** se usa para caché y cargas empresariales, no para capacidad típica de consumo.

Algunas unidades incluyen **caché DRAM**; otras usan **Host Memory Buffer (HMB)** para tomar prestada una pequeña cantidad de memoria del sistema. Una unidad sin DRAM puede seguir siendo buena para uso diario, pero puede frenarse en escrituras sostenidas o cuando se agota la caché SLC. Consulta análisis del modelo concreto.

No juzgues una unidad por una sola especificación. El firmware del controlador, la calidad de la NAND y el diseño térmico importan.

## Resistencia y garantía

La resistencia suele expresarse como **TBW** (terabytes escritos) o **DWPD** (escrituras de unidad por día). Una calificación TBW más alta significa que el fabricante espera que la unidad soporte más datos escritos durante su garantía.

Para la mayoría de usuarios de sobremesa, la resistencia no es el factor limitante. Una carga típica de gaming u oficina escribe mucho menos que la calificación de la unidad a lo largo de su vida útil. La edición de vídeo, las máquinas virtuales y las cargas de registro escriben mucho más. Comprueba la TBW y la garantía para tu carga.

La duración de la garantía no es lo mismo que la resistencia. Una unidad puede tener una garantía larga pero un límite TBW más bajo, o al revés. Lee ambos.

## Calor y limitación térmica

Los SSD NVMe de alto rendimiento pueden generar bastante calor, sobre todo los PCIe 4.0 y 5.0. Muchas placas incluyen un disipador M.2; algunas unidades incluyen el suyo. Una unidad sin refrigeración adecuada puede limitarse bajo carga sostenida.

Comprueba:

- si el disipador M.2 de la placa cubre la unidad;
- si la unidad tiene su propio disipador y si cabe bajo la tapa de la placa;
- el flujo de aire alrededor de la ranura M.2, sobre todo debajo de una tarjeta gráfica;
- el rango de temperatura de funcionamiento y el comportamiento térmico en análisis.

Un disipador puede hacer que la unidad sea más gruesa, lo que puede chocar con una tarjeta gráfica o un panel lateral cercano. Comprueba el espacio.

## DirectStorage y carga de juegos

DirectStorage es una API de Microsoft que permite a los juegos transmitir datos desde almacenamiento NVMe de forma más eficiente. Requiere un SSD NVMe, una GPU compatible y un juego compatible. No hace que todos los juegos carguen más rápido ni convierte una unidad SATA en NVMe.

Si la carga de juegos es prioritaria, comprueba si el juego concreto admite DirectStorage y si la unidad cumple los requisitos. El resto del sistema, incluida la CPU y la GPU, sigue importando.

## Planificación de capacidad

La capacidad es un equilibrio entre presupuesto y comodidad. Ten en cuenta:

- el sistema operativo y las aplicaciones;
- los juegos que usas y sus tamaños de instalación;
- un espacio de trabajo para actualizaciones, archivos temporales y cachés;
- espacio libre para el rendimiento y el desgaste del SSD;
- una unidad separada para copias de seguridad, que no es opcional.

Una sola unidad grande es más sencilla. Dos unidades pueden separar el sistema operativo de los juegos y proyectos, pero añaden coste y complejidad. Mantén al menos un 10–20 % de espacio libre en un SSD para evitar degradación del rendimiento y amplificación de escritura excesiva.

## Un proceso de selección práctico

1. **Comprueba las ranuras M.2 de la placa y el reparto de carriles.** Confirma la interfaz, la longitud y la refrigeración.
2. **Elige la interfaz.** SATA por compatibilidad y presupuesto; NVMe por rendimiento y un equipo moderno.
3. **Elige la capacidad.** Deja espacio para el sistema operativo, los juegos y el espacio libre.
4. **Consulta análisis reales de la unidad.** Mira escrituras sostenidas, rendimiento aleatorio y comportamiento térmico.
5. **Comprueba resistencia y garantía.** Ajústalas a tu carga de trabajo.
6. **Planifica la refrigeración.** Usa el disipador de la placa o el de la unidad y comprueba el espacio.
7. **Planifica copias de seguridad.** Un SSD no es una copia de seguridad; guarda una copia separada de los datos importantes.

## Errores comunes

- **Comprar solo por velocidad secuencial.** La respuesta real depende de más que una cifra de titular.
- **Ignorar el reparto de carriles.** Ocupar una ranura M.2 puede desactivar un puerto SATA o reducir el ancho de banda PCIe.
- **Olvidar el disipador.** Las unidades de alto rendimiento pueden limitarse sin flujo de aire.
- **Comprar una unidad demasiado pequeña.** El espacio libre es necesario para el rendimiento y las actualizaciones.
- **Suponer que una unidad PCIe 5.0 funciona a 5.0 en cualquier ranura.** La ranura y la CPU deben admitirlo.
- **Tratar el SSD como copia de seguridad.** Las unidades fallan; mantén una copia separada.
- **Ignorar la garantía y la TBW.** La resistencia importa en cargas de escritura pesadas.

## Límites de esta guía

El rendimiento de un SSD varía según el modelo, el firmware, la capacidad y la carga. Las cifras secuenciales del fabricante no describen por completo el comportamiento real. Esta guía no recomienda una unidad concreta. Consulta los análisis, la resistencia, la garantía y la documentación M.2 de la placa antes de comprar.
