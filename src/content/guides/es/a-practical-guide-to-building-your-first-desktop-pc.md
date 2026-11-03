---
slug: a-practical-guide-to-building-your-first-desktop-pc
lang: es
title: "Guía práctica para montar tu primer PC de sobremesa"
seoTitle: "Cómo montar tu primer PC de sobremesa"
description: "Guía paso a paso para un primer montaje: planificar piezas, preparar el espacio, montar con seguridad, primer arranque, BIOS y diagnóstico."
category: "Building & upgrades"
tags:
  - primer montaje
  - ensamblaje
  - bios
  - diagnóstico
  - seguridad
published: 2026-11-01
updated: 2026-11-02
author: AppKitX Editorial
related:
  - how-to-check-pc-component-compatibility
  - how-to-choose-a-cpu
  - how-to-choose-the-right-power-supply
references:
  - title: "Procesadores AMD Ryzen para sobremesa"
    publisher: "AMD"
    url: "https://www.amd.com/en/products/processors/desktops/ryzen.html"
  - title: "Procesadores Intel Core"
    publisher: "Intel"
    url: "https://www.intel.com/content/www/us/en/products/details/processors/core.html"
  - title: "Especificaciones y requisitos de Windows 11"
    publisher: "Microsoft"
    url: "https://www.microsoft.com/en-us/windows/windows-11-specifications"
  - title: "Especificaciones PCI Express"
    publisher: "PCI-SIG"
    url: "https://pcisig.com/specifications"
---

Montar un PC de sobremesa es sobre todo preparación cuidadosa y tornillos corrientes. La parte difícil no es el montaje; es elegir piezas compatibles y saber qué comprobar cuando el primer arranque no sale como esperabas.

Esta guía es una secuencia práctica para un primer montaje. Asume piezas de sobremesa estándar: una CPU con disipador de caja o de torre, una placa base, memoria, un SSD, una tarjeta gráfica, una fuente y una caja. No sustituye los manuales de tus piezas concretas. Léelos antes de empezar.

## Antes de empezar

### Confirma la compatibilidad

Usa la [lista de compatibilidad](/es/guides/how-to-check-pc-component-compatibility/) antes de pedir las piezas. Como mínimo, confirma:

- zócalo de CPU y soporte de BIOS de la placa;
- generación de memoria y configuración de ranuras;
- longitud, grosor y conectores de la GPU;
- altura del disipador y espacio del radiador;
- potencia, conectores y longitud de cables de la fuente;
- formato de la caja y cabeceras del panel frontal;
- interfaz de almacenamiento y longitud M.2.

### Prepara un espacio de trabajo

Necesitas una mesa limpia y bien iluminada, un destornillador que encaje en los tornillos de la caja, los manuales y un recipiente pequeño para tornillos. Evita las alfombras y no trabajes sobre una superficie conductora. Toca una parte metálica sin pintar de la caja antes de manipular componentes para descargar la electricidad estática; una pulsera antiestática es mejor si la tienes.

Mantén los líquidos lejos del espacio de trabajo. No forces un conector, una CPU ni un módulo de memoria. Si no encaja con facilidad, detente y comprueba la orientación.

### Lee los manuales

El manual de la placa es el documento más importante. Muestra:

- la orientación del zócalo de CPU;
- el orden de las ranuras de memoria;
- las ubicaciones de las ranuras M.2 y el reparto de carriles;
- la asignación de pines de la cabecera del panel frontal;
- las cabeceras de ventilador y bomba;
- el método de actualización de BIOS;
- el procedimiento de borrado de CMOS.

El manual de la caja muestra las ubicaciones de los separadores, los límites de espacio y el cableado. El manual del disipador muestra el hardware de montaje para tu zócalo.

## Un orden de montaje sensato

Puedes montar dentro de la caja desde el principio o ensamblar el núcleo sobre la caja de la placa. El segundo método suele ser más fácil para un primer montaje porque hay más espacio alrededor del zócalo.

1. **Instala la CPU.** Abre el zócalo, alinea la marca del triángulo y baja la CPU en vertical. No toques los pines ni las almohadillas. Cierra el mecanismo de retención como indica el manual.
2. **Instala la memoria.** Abre los pestillos, alinea la muesca y presiona ambos extremos hasta que hagan clic. Usa el orden de ranuras del manual, normalmente la segunda y la cuarta para dos módulos.
3. **Instala el SSD M.2.** Retira el disipador o el tornillo, inserta la unidad en el ángulo correcto y fíjala. Vuelve a colocar el disipador y retira cualquier película protectora.
4. **Instala el disipador de CPU.** Coloca la placa posterior (backplate) o el soporte, aplica pasta térmica, retira la película de la placa fría y aprieta en el orden recomendado. Conecta el ventilador a la cabecera de CPU.
5. **Prepara la caja.** Instala los separadores que coincidan con la placa, retira los paneles laterales y pasa los cables del panel frontal por las aberturas de gestión.
6. **Instala la placa base.** Bájala sobre los separadores, alinea la E/S trasera y empieza los tornillos a mano. Apriétalos poco a poco en cruz.
7. **Instala la fuente.** Móntala con la orientación del ventilador que recomienda la caja y pasa los cables de 24 pines, EPS de CPU y GPU por detrás de la bandeja.
8. **Instala almacenamiento y tarjetas.** Añade las unidades SATA y después la tarjeta gráfica. Confirma que la tarjeta está bien asentada y fija el tornillo del soporte.
9. **Conecta alimentación y panel frontal.** Conecta 24 pines, EPS de CPU, alimentación de GPU, alimentación SATA, USB/audio frontal, encendido/reinicio y cabeceras de ventilador. Comprueba que cada conector está bien asentado.
10. **Revisa antes de encender.** Confirma que no hay tornillos sueltos, cables tocando ventiladores, el disipador montado, la memoria bloqueada y la GPU asentada.

## Primer arranque

Conecta el monitor a la tarjeta gráfica, no a la placa, si instalaste una GPU dedicada. Conecta el teclado y el cable de alimentación. Enciende el interruptor de la fuente y pulsa el botón de encendido de la caja.

Qué esperar:

- los ventiladores pueden girar fuerte al principio y luego estabilizarse;
- la placa puede mostrar un logo o una pantalla POST;
- el primer arranque puede tardar más mientras se entrena la memoria;
- un LED de diagnóstico o un código POST puede mostrar un estado.

Si el sistema no muestra imagen, no entres en pánico. Comprueba la entrada del monitor, el asiento de la GPU, el cable EPS de CPU, el asiento de la memoria y la conexión de encendido del panel frontal. Muchas placas tienen LEDs de diagnóstico para CPU, DRAM, VGA y arranque; úsalos para acotar el problema.

## Configuración de la BIOS

Entra en la configuración de BIOS/UEFI con la tecla que muestra la pantalla POST (a menudo Supr o F2). Comprueba:

- que la CPU se detecta con el modelo esperado;
- que la capacidad y la velocidad de memoria se detectan;
- que la unidad de arranque se detecta;
- que las cabeceras de ventilador y bomba muestran velocidades sensatas;
- que la fecha y la hora son correctas;
- que la versión de firmware es la esperada.

Activa el perfil de memoria (EXPO o XMP) si quieres la velocidad nominal, guarda y reinicia. Si el sistema no arranca después de activar el perfil, borra CMOS y prueba una velocidad menor o otro perfil. La estabilidad de la memoria no está garantizada a la velocidad nominal.

Si piensas instalar Windows 11, activa el modo UEFI, Secure Boot y TPM 2.0 (a menudo una opción de TPM por firmware). Consulta el manual de la placa para los nombres exactos.

## Sistema operativo y controladores

Instala el sistema operativo desde una fuente de confianza. Para Windows, usa la herramienta oficial de creación de medios. Para Linux, usa la imagen oficial de la distribución y verifica su suma de comprobación.

Después de la instalación:

- instala los controladores del chipset desde la página de soporte del fabricante de la placa;
- instala el controlador gráfico del fabricante de la GPU;
- instala controladores de almacenamiento y red si el sistema no los incluye;
- ejecuta las actualizaciones del sistema operativo;
- comprueba el Administrador de dispositivos o el equivalente para controladores ausentes;
- confirma la velocidad de memoria y la salud del almacenamiento en la utilidad adecuada.

Evita descargar controladores de sitios espejo no oficiales. Usa la página de soporte del fabricante para tu modelo exacto.

## Pruebas y monitorización

Antes de poner el panel lateral, comprueba temperaturas y estabilidad:

- temperaturas de CPU y GPU en reposo;
- temperaturas bajo carga sostenida;
- velocidades y ruido de los ventiladores;
- estabilidad de memoria con una prueba de memoria;
- salud y firmware del almacenamiento;
- red y audio.

Una prueba de estrés corta no garantiza estabilidad a largo plazo, pero puede revelar un problema obvio de refrigeración o montaje. Si las temperaturas son altas, revisa el montaje del disipador, la pasta térmica, la curva de ventilador y el flujo de la caja antes de suponer que el disipador es insuficiente.

## Gestión de cables y flujo de aire

La gestión de cables no es solo estética. Los cables que bloquean ventiladores o la entrada de la GPU pueden subir las temperaturas. Pasa los cables por detrás de la bandeja cuando sea posible, usa los puntos de sujeción de la caja y evita curvas cerradas en los conectores de alimentación.

Comprueba que:

- el ventilador del disipador no está bloqueado por memoria o cables;
- los ventiladores de la GPU tienen espacio;
- la entrada frontal no está restringida;
- las salidas trasera y superior están despejadas;
- el ventilador de la fuente tiene flujo de aire;
- el panel lateral cierra sin presionar cables.

## Diagnóstico de un sistema que no arranca

Sigue lo básico en orden:

1. **Alimentación:** confirma que el interruptor de la fuente está encendido, que la toma funciona y que el conector de encendido del panel frontal está en los pines correctos.
2. **Imagen:** confirma la entrada y el cable del monitor, y conecta a la GPU si hay una instalada.
3. **Alimentación de CPU:** confirma que el cable EPS está bien asentado.
4. **Memoria:** vuelve a asentar los módulos, prueba uno solo en la ranura correcta y revisa el orden.
5. **GPU:** vuelve a asentar la tarjeta y confirma sus cables de alimentación.
6. **CPU:** revisa el zócalo por pines o almohadillas doblados y confirma que el disipador está montado.
7. **BIOS:** borra CMOS y prueba de nuevo.
8. **LEDs de diagnóstico:** usa los LEDs de CPU/DRAM/VGA/arranque para acotar el fallo.

Si el sistema enciende pero se apaga de inmediato, busca un cortocircuito, un separador suelto o un problema de montaje del disipador. Si arranca pero no detecta una unidad, revisa el asiento del M.2 y los cables SATA.

## Notas de seguridad

- No abras la fuente de alimentación. Sus condensadores pueden retener carga peligrosa.
- No forces conectores ni componentes.
- Mantén los líquidos lejos del montaje.
- Usa los cables suministrados con la fuente modular.
- No pongas el sistema en marcha sin el disipador.
- Comprueba que los separadores coinciden con la placa; un separador extra puede cortocircuitar la placa.
- Trabaja sobre una superficie estable y mantén los tornillos lejos de ventiladores y ranuras.

## Después del montaje

Actualiza el firmware y los controladores, crea un plan de copias de seguridad y limpia los filtros de la caja. Supervisa las temperaturas durante las primeras semanas. Si piensas actualizar más adelante, anota el margen de la fuente, los espacios de la caja y la ruta de actualización de CPU de la placa.

Un primer montaje es un proceso de aprendizaje. Si algo no funciona, cambia una variable a la vez y consulta el manual. La mayoría de los problemas tienen una causa simple: un conector no asentado, un módulo de memoria en la ranura equivocada, un cable de monitor en el puerto incorrecto o un ajuste de BIOS que hay que cambiar.

## Límites de esta guía

Esta guía describe prácticas generales de montaje de sobremesa. Tus piezas pueden tener requisitos específicos que difieran de la secuencia anterior. Sigue siempre los manuales del fabricante de la CPU, la placa, el disipador, la caja y la fuente. Esta guía no afirma haber probado físicamente ningún producto concreto y no sustituye el consejo profesional de reparación o seguridad.
