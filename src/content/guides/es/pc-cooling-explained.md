---
slug: pc-cooling-explained
lang: es
title: "Refrigeración del PC: aire frente a líquido"
seoTitle: "Refrigeración del PC: aire vs líquido"
description: "Cómo funcionan la refrigeración de CPU y caja, cuándo tiene sentido aire o líquido y qué espacios y compromisos de ruido comprobar."
category: "Choosing components"
tags:
  - refrigeración
  - disipador
  - flujo de aire
  - aio
  - ruido
published: 2026-11-01
updated: 2026-11-02
author: AppKitX Editorial
related:
  - how-to-check-pc-component-compatibility
  - how-to-choose-a-cpu
  - a-practical-guide-to-building-your-first-desktop-pc
references:
  - title: "Procesadores Intel Core"
    publisher: "Intel"
    url: "https://www.intel.com/content/www/us/en/products/details/processors/core.html"
  - title: "Procesadores AMD Ryzen para sobremesa"
    publisher: "AMD"
    url: "https://www.amd.com/en/products/processors/desktops/ryzen.html"
  - title: "Especificaciones PCI Express"
    publisher: "PCI-SIG"
    url: "https://pcisig.com/specifications"
---

La refrigeración no es una decisión de un solo componente. El disipador de la CPU, los ventiladores de la caja, el recorrido del aire, la temperatura ambiente y el calor que genera la GPU interactúan. Un disipador que rinde bien en un banco de pruebas puede quedarse corto en una caja cerrada con poca entrada de aire, y un radiador grande puede desperdiciarse si la caja no le suministra aire fresco.

Esta guía explica los principios, compara refrigeración por aire y líquida y enumera los espacios y compromisos que hay que comprobar antes de comprar.

## Cómo sale el calor del sistema

La CPU genera calor, que pasa a la base del disipador y luego al aire o al líquido. El disipador transfiere ese calor al aire que lo rodea, y los ventiladores de la caja sacan el aire caliente. Si la caja no puede evacuar el calor, la temperatura interior sube y todos los componentes trabajan más calientes.

La cadena es tan fuerte como su eslabón más débil:

1. **CPU al disipador:** presión de contacto, pasta térmica y placa fría o base.
2. **Disipador al aire:** superficie del disipador, flujo de los ventiladores y tamaño del radiador.
3. **Aire al exterior:** entrada, salida, filtros y espacio libre.

Un disipador mejor no arregla una caja sin flujo de aire. Más ventiladores no arreglan un disipador mal montado.

## TDP no es una medida estandarizada de refrigeración

Los fabricantes de CPU y de disipadores usan "TDP" (potencia de diseño térmico) de formas distintas. El TDP de una CPU puede describir un objetivo de potencia nominal, no el calor máximo sostenido. La afirmación de un disipador de "soporta 250 W" puede basarse en una velocidad de ventilador, una temperatura ambiente y una configuración de prueba concretas.

No emparejes dos números TDP y des por hecho que el disipador basta. Consulta análisis independientes que midan temperatura y ruido con una CPU y una carga comparables. Fíjate en:

- la CPU usada en la prueba;
- el límite de potencia y la carga;
- la temperatura ambiente;
- la velocidad y el ruido del ventilador;
- si la prueba fue en mesa abierta o en caja.

Un disipador adecuado para una CPU de bajo consumo puede ser justo para una CPU de muchos núcleos bajo carga sostenida.

## Refrigeración por aire

Los disipadores de aire usan un bloque de aletas y uno o más ventiladores. Son sencillos, fiables y a menudo más baratos que la refrigeración líquida. Un buen disipador de torre puede cubrir una amplia gama de CPU.

Puntos fuertes:

- no hay bomba que pueda fallar;
- suele ser más barato;
- fácil de instalar y mantener;
- sin riesgo de fugas de líquido;
- larga vida útil si el ventilador es reemplazable.

Compromisos:

- las torres grandes pueden bloquear la memoria o el panel lateral;
- la altura libre importa;
- el calor se expulsa dentro de la caja, así que el flujo de aire importa;
- las CPU de gama muy alta pueden necesitar un disipador mayor u otro enfoque;
- el ruido depende del ventilador y de su curva.

Comprueba la altura del disipador, el espacio para la memoria, el montaje del zócalo y si incluye el soporte correcto. Algunos disipadores necesitan un kit de montaje aparte para zócalos nuevos.

## Refrigeración líquida

Los refrigeradores líquidos todo en uno (AIO) usan una bomba, tubos, una placa fría y un radiador. Los bucles personalizados usan componentes separados y requieren más mantenimiento.

Puntos fuertes:

- el radiador puede montarse lejos del zócalo, lo que ayuda en algunas cajas pequeñas;
- los radiadores grandes pueden manejar cargas térmicas altas;
- la zona de la CPU puede quedar menos saturada;
- algunos montajes prefieren su estética.

Compromisos:

- la bomba es una pieza de desgaste y puede fallar;
- una fuga puede dañar componentes, aunque los fallos no son frecuentes;
- los radiadores necesitan espacio y flujo de aire;
- la bomba y los ventiladores añaden ruido;
- la instalación es más compleja;
- el radiador sigue necesitando aire fresco, así que el flujo de la caja importa.

Comprueba el tamaño del radiador y las ubicaciones de montaje, la longitud y flexibilidad de los tubos, la orientación de la bomba y si la caja admite el radiador más los ventiladores. Un radiador de 360 mm necesita tres montajes de 120 mm y suficiente espacio; no es automáticamente mejor que un buen radiador de 240 mm en una caja que no puede suministrar flujo de aire.

## Tamaño del radiador y configuración de ventiladores

Un radiador más grande tiene más superficie y puede disipar más calor a una velocidad de ventilador dada, pero el beneficio depende de la carga térmica y del flujo de aire. Un radiador de 360 mm con ventiladores lentos puede rendir de forma similar a uno de 280 mm con buenos ventiladores, y ambos pueden estar limitados por la entrada de aire de la caja.

Ten en cuenta:

- **Grosor del radiador:** los radiadores gruesos necesitan más presión estática y espacio.
- **Tipo de ventilador:** los de presión estática suelen ser mejores para radiadores; los de flujo, para ventilación abierta.
- **Empuje, succión o empuje-succión:** la configuración de empuje-succión puede mejorar el rendimiento, pero añade grosor y ruido.
- **Ubicación:** entrada frontal, salida superior o montaje lateral cambian el recorrido del aire.
- **Burbujas:** monta la bomba por debajo de la parte superior del radiador o sigue las indicaciones del fabricante para evitar aire atrapado.

## Flujo de aire y presión en la caja

El flujo de aire de la caja determina la rapidez con la que sale el aire caliente.

- **Presión positiva:** más entrada que salida. Ayuda a reducir la entrada de polvo por rendijas sin filtro, pero puede empujar aire caliente por las rendijas.
- **Presión negativa:** más salida que entrada. Puede aspirar polvo por aberturas sin filtro.
- **Equilibrada:** entrada y salida aproximadamente iguales. Suele ser un buen punto de partida.

Usa entradas filtradas cuando sea posible y limpia los filtros con regularidad. Un panel frontal restrictivo o un frontal de cristal pueden dejar sin aire a los ventiladores. Consulta análisis que midan flujo y temperatura en la caja real.

El calor de la GPU es un factor importante. Una GPU de gama alta puede liberar cientos de vatios dentro de la caja. Asegúrate de que el aire de entrada llega a la GPU y de que la salida tiene camino. En cajas pequeñas, una GPU con turbina (blower) o un panel lateral bien ventilado pueden importar más que el disipador de la CPU.

## Ruido, curvas de ventilador y temperatura ambiente

El ruido es subjetivo, pero los factores principales son la velocidad del ventilador, el tipo de rodamiento, la turbulencia y el ruido de la bomba. Un disipador más grande puede girar más despacio para la misma temperatura, lo que suele hacerlo más silencioso.

Comprueba:

- la curva de ventilador en la BIOS o el software de la placa;
- si los ventiladores se detienen a baja carga;
- la velocidad de la bomba y si es ajustable;
- los paneles de insonorización o de malla de la caja;
- la temperatura ambiente de tu habitación.

Un disipador probado a 20 °C puede comportarse distinto a 30 °C. Si tu habitación es cálida, deja más margen térmico.

## Montaje, pasta y contacto

La calidad del montaje importa tanto como el disipador.

- Usa el soporte y los separadores correctos para el zócalo.
- Aprieta los tornillos en el orden recomendado y no aprietes en exceso.
- Aplica una cantidad sensata de pasta térmica; una cantidad demasiado pequeña o demasiado grande puede empeorar las temperaturas.
- Retira la película protectora de la placa fría antes de montar.
- Comprueba que el disipador asienta de forma uniforme y no se balancea.
- Conecta el ventilador y la bomba a las cabeceras correctas.
- Ajusta la bomba a una velocidad adecuada; algunas no deben funcionar a muy bajas rpm.

Si las temperaturas son inesperadamente altas, revisa el montaje antes de comprar otro disipador.

## Un proceso de selección práctico

1. **Identifica el calor sostenido de la CPU.** Usa análisis, no solo el TDP.
2. **Comprueba el espacio para el disipador y el radiador.** Altura, longitud, grosor y espacio para la memoria.
3. **Elige aire o líquido según la caja y el presupuesto.** El aire es más sencillo; el líquido puede ayudar en algunas distribuciones.
4. **Comprueba el kit de montaje del zócalo.** Confirma el soporte para tu zócalo y revisión exactos.
5. **Comprueba las cabeceras de ventilador y bomba.** Asegúrate de que la placa tiene suficientes y un control adecuado.
6. **Planifica el recorrido del aire.** Entrada, salida, filtros y calor de la GPU.
7. **Comprueba las expectativas de ruido.** Busca análisis con velocidades de ventilador y temperatura ambiente comparables.
8. **Monta con cuidado y prueba.** Supervisa temperaturas bajo carga sostenida y ajusta la curva.

## Errores comunes

- **Emparejar números TDP.** No están estandarizados.
- **Comprar un radiador grande sin comprobar el espacio.** El radiador más los ventiladores puede ser más grueso de lo esperado.
- **Ignorar la altura de la memoria.** Un disipador de aire grande puede bloquear módulos altos.
- **Olvidar la película protectora.** Es una causa habitual de temperaturas altas.
- **Usar la cabecera equivocada.** Las cabeceras de bomba y ventilador pueden tener capacidades distintas.
- **Alimentar el radiador con aire caliente de la caja.** Un radiador frontal puede recircular el calor de la GPU.
- **Configurar los ventiladores de forma demasiado agresiva.** Una curva más silenciosa suele rendir casi igual.

## Límites de esta guía

El rendimiento de la refrigeración depende del sistema. El mismo disipador puede comportarse distinto con otra CPU, caja, temperatura ambiente, curva de ventilador y GPU. Esta guía no recomienda un disipador concreto. Consulta análisis independientes con una configuración comparable, las especificaciones de espacio de la caja y la documentación de montaje del disipador antes de comprar.
