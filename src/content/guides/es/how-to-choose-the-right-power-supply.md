---
slug: how-to-choose-the-right-power-supply
lang: es
title: "Cómo elegir la fuente de alimentación adecuada"
seoTitle: "Cómo elegir la fuente de alimentación"
description: "Vatios, conectores, eficiencia, protecciones y cargas transitorias: cómo elegir una fuente segura y estable para tu equipo."
category: "Choosing components"
tags:
  - fuente
  - alimentación
  - vatios
  - eficiencia
  - seguridad
published: 2026-11-01
updated: 2026-11-02
author: AppKitX Editorial
related:
  - how-to-check-pc-component-compatibility
  - gpu-buying-guide
  - pc-cooling-explained
references:
  - title: "Certificación 80 PLUS"
    publisher: "CLEAResult"
    url: "https://www.clearesult.com/80plus/"
  - title: "Pruebas y certificación de fuentes Cybenetics"
    publisher: "Cybenetics"
    url: "https://www.cybenetics.com/"
  - title: "Especificaciones PCI Express"
    publisher: "PCI-SIG"
    url: "https://pcisig.com/specifications"
---

La fuente de alimentación es el componente que puede dañar todo lo demás si falla mal. También es el que más a menudo se elige solo por vatios. Un número grande en la caja no garantiza tensión estable, buenas protecciones ni cables seguros.

Esta guía explica cómo dimensionar una fuente, qué significan y qué no significan las certificaciones de eficiencia, qué protecciones importan y cómo comprobar conectores y encaje físico.

## Empieza con una estimación realista de consumo

Una fuente debe suministrar suficiente energía a todo el sistema bajo carga sostenida, con margen para picos transitorios y futuras ampliaciones. La estimación debe incluir:

- la CPU bajo carga sostenida;
- la GPU bajo carga sostenida y sus picos transitorios;
- la placa base, la memoria, el almacenamiento, los ventiladores y la bomba;
- dispositivos USB y tarjetas de ampliación;
- un margen para el envejecimiento y futuras actualizaciones.

Las calculadoras de vatios online son un punto de partida, no una medición precisa. Suelen usar supuestos genéricos y pueden sobreestimar o subestimar componentes concretos. Usa la potencia recomendada por el fabricante de la GPU como comprobación rápida y añade el resto del sistema.

| Tipo de sistema                                | Rango típico de fuente | Notas                                                     |
| ---------------------------------------------- | ---------------------- | --------------------------------------------------------- |
| Oficina o multimedia, gráficos integrados      | 300–450 W              | La calidad importa más que los vatios                     |
| PC gaming de entrada, GPU de gama media        | 500–650 W              | Comprueba el conector y la potencia recomendada de la GPU |
| PC gaming convencional, GPU de gama alta       | 750–850 W              | Deja margen para picos transitorios                       |
| Entusiasta o estación de trabajo, GPU muy alta | 1000 W o más           | Comprueba conectores, capacidad de cables y espacio       |

Estos rangos no son universales. Una CPU de bajo consumo y una GPU eficiente pueden necesitar mucho menos; un sistema con overclocking fuerte o una estación de trabajo con muchas unidades puede necesitar más.

## El raíl de 12 V es el importante

Los PC modernos toman la mayor parte de la energía del raíl de 12 V, sobre todo la CPU y la GPU. La potencia total de una fuente es menos útil que su **capacidad de salida en 12 V** y cómo se reparte entre los raíles.

Comprueba:

- la salida continua de 12 V en amperios y vatios;
- si el raíl de 12 V es único o dividido;
- la capacidad por conector de los cables de CPU y PCIe;
- si la fuente usa cables independientes o conectores en cadena;
- la respuesta transitoria y el tiempo de retención en análisis.

Una fuente que anuncia muchos vatios totales pero tiene un raíl de 12 V débil puede no manejar bien una GPU moderna.

## Versiones ATX y conectores de GPU

ATX 3.0 introdujo el conector 12VHPWR y requisitos más estrictos para la entrega transitoria de potencia. ATX 3.1 revisó ese conector como 12V-2x6 y ajustó algunos requisitos relacionados. Si compras una fuente nueva para una GPU moderna de gama alta, comprueba:

- si la fuente está diseñada conforme a ATX 3.0 o ATX 3.1;
- si incluye un cable 12V-2x6 nativo o un adaptador aprobado por el fabricante;
- la capacidad del cable y los requisitos de la GPU;
- el espacio del conector y el radio de curvatura en tu caja;
- si la documentación de la fuente cubre tu modelo exacto de GPU.

No uses un cable de una fuente modular con otro modelo. Los cables modulares no son universales. Usa los cables suministrados con la fuente y sigue los manuales de la GPU y de la fuente. Si necesitas un adaptador, usa el suministrado o aprobado por el fabricante; no improvises.

## Las certificaciones de eficiencia no son certificaciones de calidad

80 PLUS y Cybenetics miden la eficiencia a distintos niveles de carga. Una certificación más alta significa que se desperdicia menos energía en forma de calor en las condiciones probadas. No garantiza:

- buena regulación de tensión;
- bajo rizado;
- respuesta transitoria rápida;
- protecciones adecuadas;
- condensadores de calidad;
- un ventilador silencioso;
- una garantía larga.

Una fuente Gold de un fabricante reputado puede ser mejor que una Platinum con malas protecciones. Usa la eficiencia como un factor, no como toda la decisión. Los análisis independientes que miden rizado, respuesta transitoria y protecciones son más informativos.

La eficiencia también varía con la carga. Una fuente suele ser más eficiente alrededor del 40–60 % de su carga nominal. Una fuente muy sobredimensionada puede trabajar por debajo de su rango eficiente en reposo, aunque la diferencia suele ser pequeña comparada con el consumo del resto del sistema.

## Protecciones que importan

Una buena fuente incluye protecciones contra modos de fallo habituales:

- **OCP** — protección contra sobrecorriente;
- **OVP** — protección contra sobretensión;
- **UVP** — protección contra subtensión;
- **SCP** — protección contra cortocircuito;
- **OTP** — protección contra sobretemperatura;
- **OPP** — protección contra sobrepotencia.

Que una protección aparezca en la hoja de especificaciones no demuestra que funcione correctamente. Los análisis independientes que prueban las protecciones son más útiles. Una fuente que se apaga de forma segura ante un fallo es mejor que una que intenta continuar y daña otros componentes.

## Modular, semimodular y cables fijos

- **Totalmente modular:** todos los cables se desconectan. Facilita la gestión de cables, pero hay más conectores que asentar.
- **Semimodular:** los cables esenciales de placa y CPU son fijos; el resto se desconecta.
- **Cables fijos:** todos los cables van unidos. Una fuente con cables fijos suele ser más barata, pero hay que gestionar los cables sobrantes.

La modularidad no afecta al rendimiento por sí misma. Afecta a la comodidad del montaje y al flujo de aire. Comprueba que los cables incluidos son suficientemente largos para tu caja, sobre todo el EPS de CPU y los cables de GPU.

## Comportamiento del ventilador y ruido

El ventilador de la fuente puede ser la pieza más ruidosa de un equipo silencioso. Comprueba:

- si el ventilador se detiene a baja carga (modo semipasivo);
- la curva del ventilador y la velocidad mínima;
- el tipo de rodamiento;
- las mediciones de ruido en análisis independientes;
- si la entrada de aire de la fuente está bloqueada por la caja o un filtro.

Un ventilador grande y lento suele ser más silencioso que uno pequeño y rápido. No supongas que una eficiencia más alta significa una unidad más silenciosa.

## Encaje físico y flujo de aire

Comprueba la longitud de la fuente con la especificación de la caja. Las unidades de más vatios suelen ser más largas, y una fuente larga puede chocar con una jaula de discos o con el espacio de cableado.

Comprueba también:

- la orientación de montaje (ventilador arriba o abajo);
- si la caja tiene filtro de polvo y suficiente espacio debajo de la fuente;
- la dirección de salida de los cables y el espacio detrás de la bandeja;
- la distancia a los conectores de GPU y CPU.

Una fuente que cabe pero bloquea el flujo de aire o fuerza curvas cerradas en los cables puede causar problemas.

## Envejecimiento, temperatura y reducción de potencia

La salida máxima de una fuente suele estar especificada a una temperatura concreta, a menudo 40 °C o 50 °C. En una caja caliente, la potencia disponible puede ser menor. Los condensadores también se degradan con el tiempo. Dejar margen ayuda a que la fuente trabaje más fría y dure más.

Si vives en un clima cálido o tienes poco flujo de aire, elige una fuente con una calificación conservadora y buen comportamiento térmico. No la hagas trabajar al máximo de forma continua.

## Un proceso de selección práctico

1. **Estima la carga sostenida y transitoria del sistema.** Usa especificaciones de componentes y análisis independientes.
2. **Elige una potencia con margen.** Normalmente un 20–30 % por encima de la carga sostenida estimada, más en GPU de gama alta.
3. **Comprueba la salida de 12 V y la capacidad de los conectores.** Confirma que los cables de CPU y GPU pueden suministrar la energía necesaria.
4. **Comprueba el tipo de conector de la GPU.** Usa el cable nativo correcto o un adaptador aprobado.
5. **Comprueba protecciones y análisis independientes.** Busca OCP, OVP, UVP, SCP, OTP y buenos resultados de rizado y transitorios.
6. **Comprueba eficiencia y ruido.** Usa 80 PLUS/Cybenetics como un factor, no como el único.
7. **Comprueba el encaje físico y la longitud de los cables.** Confirma que la fuente cabe y llega a los conectores.
8. **Comprueba la garantía y el vendedor.** Compra a un vendedor reputado y confirma la garantía regional.

La calculadora de porcentajes puede ayudarte a comparar cuánto del presupuesto se lleva la fuente, pero no puede decirte si la unidad es segura.

## Errores comunes

- **Comprar solo por vatios.** Una potencia alta no garantiza calidad.
- **Usar una fuente sin marca con componentes caros.** Un fallo puede dañar todo el sistema.
- **Reutilizar cables modulares de otra fuente.** Los pines no son universales.
- **Ignorar los picos transitorios.** Las GPU modernas pueden superar mucho su valor sostenido.
- **Usar un cable de GPU en cadena por encima de su capacidad.** Usa cables separados cuando sea necesario.
- **Sobredimensionar sin comprobar el espacio.** Una fuente larga puede no caber.
- **Suponer que 80 PLUS Platinum significa silencio o fiabilidad.** La eficiencia es solo una propiedad.

## Límites de esta guía

Los requisitos de potencia varían según el componente, la carga, el firmware y el overclocking. Las potencias recomendadas por el fabricante son puntos de partida conservadores, no mediciones de tu sistema concreto. Esta guía no recomienda una fuente concreta. Consulta análisis independientes, la documentación exacta de GPU y CPU y las capacidades de conectores y cables antes de comprar.
