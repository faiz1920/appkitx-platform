---
slug: how-to-choose-a-compatible-motherboard
lang: es
title: "Cómo elegir una placa base compatible"
seoTitle: "Cómo elegir una placa base compatible"
description: "Zócalo, chipset, memoria, formato, BIOS, ampliación y espacio: cómo elegir una placa base que encaje en tu montaje."
category: "Choosing components"
tags:
  - placa base
  - chipset
  - zócalo
  - formato
  - compatibilidad
published: 2026-11-01
updated: 2026-11-02
author: AppKitX Editorial
related:
  - how-to-choose-a-cpu
  - ddr4-vs-ddr5
  - how-to-check-pc-component-compatibility
references:
  - title: "Procesadores AMD Ryzen para sobremesa"
    publisher: "AMD"
    url: "https://www.amd.com/en/products/processors/desktops/ryzen.html"
  - title: "Procesadores Intel Core"
    publisher: "Intel"
    url: "https://www.intel.com/content/www/us/en/products/details/processors/core.html"
  - title: "Estándar DDR5 SDRAM (JESD79-5)"
    publisher: "JEDEC"
    url: "https://www.jedec.org/standards-documents/docs/jesd79-5"
  - title: "Especificaciones PCI Express"
    publisher: "PCI-SIG"
    url: "https://pcisig.com/specifications"
---

La placa base es la pieza que une el montaje: debe aceptar la CPU, la memoria, la tarjeta gráfica, el almacenamiento, el disipador y la caja. Una placa que parece buena en una lista de funciones puede fallar en el montaje por una revisión de zócalo, un requisito de BIOS, una cabecera ausente o un problema de espacio.

Esta guía cubre las comprobaciones que importan antes de comprar. No recomienda placas concretas, porque la disponibilidad, el firmware y los precios varían por región.

## Empieza por el zócalo de la CPU

La CPU y la placa base deben compartir zócalo. Es la primera regla dura de compatibilidad. El zócalo también determina el montaje del disipador, la generación de memoria y la ruta de actualización de la plataforma.

Consulta la lista de CPU compatibles del fabricante para el modelo y la revisión de hardware exactos. Una placa puede admitir una CPU solo después de actualizar la BIOS, y algunas no pueden actualizarse sin una CPU compatible instalada. Busca una función de actualización USB de BIOS si piensas instalar una CPU lanzada después de la placa.

Comprueba también:

- el **chipset**, que determina funciones como overclocking de CPU, reparto de carriles PCIe, soporte M.2, puertos USB y red;
- la **generación de memoria y la capacidad máxima**;
- el **número de ranuras de memoria** y si la placa admite el kit que piensas usar;
- el diseño de **entrega de energía** y los disipadores, sobre todo con CPU de muchos núcleos;
- el **formato** y la compatibilidad con la caja.

## Entiende el chipset, no solo el precio

Los chipsets se sitúan por debajo de la CPU en la jerarquía de la plataforma. Añaden o limitan funciones y pueden afectar a cuántos dispositivos puedes conectar a la vez.

Las diferencias típicas incluyen:

- si la CPU se puede overclockear;
- cuántos carriles PCIe hay para tarjetas gráficas y unidades M.2;
- cuántos puertos USB se ofrecen y a qué velocidad;
- si la placa admite RAID, puertos SATA adicionales o más ranuras M.2;
- si incluye Wi-Fi y de qué versión;
- cuántas cabeceras de ventilador y bomba hay.

Un chipset premium no es automáticamente la elección correcta. Si no necesitas los carriles, puertos u overclocking extra, un chipset de gama media puede dejar más presupuesto para la CPU, la GPU o el almacenamiento.

## Elige un formato que quepa en la caja

Los formatos de placa base son tamaños estandarizados, pero los detalles varían. La especificación de la caja indica los formatos admitidos; compruébala antes de comprar.

| Formato   | Uso típico                                              | Qué comprobar                                                                            |
| --------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| ATX       | Montajes de tamaño completo con más ranuras y cabeceras | Soporte de la caja, espacio para GPU, gestión de cables                                  |
| Micro-ATX | Montajes más pequeños con la mayoría de funciones       | Número de ranuras, distribución M.2, cabeceras, espacio                                  |
| Mini-ITX  | Montajes de formato pequeño                             | Una sola ranura PCIe, número de ranuras de memoria, altura del disipador, tipo de fuente |
| E-ATX     | Estaciones de trabajo o montajes de gama alta           | Soporte de la caja, distribución de separadores, cableado, espacio para GPU              |

Una placa más pequeña puede ahorrar espacio, pero puede tener menos cabeceras, menos ranuras de memoria, una sola ranura M.2 o una distribución que choque con un disipador o una tarjeta gráfica grandes. Comprueba la distribución física, no solo el nombre del formato.

## Memoria: generación, ranuras y validación

DDR4 y DDR5 tienen muescas físicas distintas y no son intercambiables. La placa determina qué generación necesitas. Dentro de una generación, comprueba:

- **Capacidad máxima:** la máxima oficial de la placa puede ser inferior a la de la CPU.
- **Número de ranuras:** dos ranuras pueden ser una ventaja para la integridad de la señal, pero limitan la ampliación.
- **Lista de compatibilidad:** la lista de proveedores cualificados (QVL) recoge kits probados, pero no es exhaustiva.
- **Velocidades admitidas:** una placa puede admitir una velocidad alta solo con una CPU, una BIOS o una configuración de dos módulos concretos.
- **Soporte EXPO/XMP:** activar un perfil de memoria es una forma de overclocking; no está garantizado en todas las combinaciones.

Para una comparación detallada de las dos generaciones, consulta [DDR4 vs DDR5](/es/guides/ddr4-vs-ddr5/).

## Ranuras de ampliación y distribución M.2

Las placas modernas comparten carriles entre dispositivos. Una ranura M.2 puede desactivar un puerto SATA, o una segunda ranura PCIe puede funcionar con menos carriles cuando se ocupa la primera. Lee el diagrama de bloques o la tabla de reparto de carriles del manual.

Comprueba:

- la longitud física y eléctrica de cada ranura PCIe;
- el número de ranuras M.2 y las longitudes de módulo admitidas;
- si una ranura M.2 tiene su propio disipador;
- si las ranuras M.2 comparten ancho de banda con puertos SATA o con la ranura gráfica;
- el número de puertos SATA y su orientación;
- si la placa incluye cabeceras Thunderbolt o USB4 y qué requieren.

Si piensas añadir una tarjeta de captura, una segunda GPU o varias unidades NVMe, el reparto de carriles importa más que el número de ranuras.

## Conectividad y cabeceras

El panel de E/S trasero es solo una parte de la conectividad. Las cabeceras frontales determinan qué puedes conectar a la caja.

Comprueba:

- los puertos USB del panel trasero y las cabeceras internas para USB frontal;
- la velocidad Ethernet y el controlador;
- la versión de Wi-Fi y Bluetooth, si están incluidos;
- el códec de audio y las salidas;
- las cabeceras de ventilador y bomba, incluida su capacidad de corriente;
- las cabeceras RGB/ARGB, si las usas;
- las cabeceras de audio, encendido y reinicio del panel frontal;
- LEDs de diagnóstico o pantalla de códigos POST, que ayudan a solucionar problemas.

Una placa con los puertos traseros correctos pero sin cabecera interna para el USB-C de tu caja puede obligarte a usar el panel trasero.

## Entrega de energía y refrigeración

El módulo regulador de tensión (VRM) convierte la energía para la CPU. Un VRM sólido con disipadores adecuados es más importante para CPU de muchos núcleos y cargas sostenidas. Un VRM básico puede bastar para una CPU de bajo consumo, pero puede limitar o calentarse demasiado con una exigente.

Busca:

- el número de fases y sus valores, si el fabricante los publica;
- el tamaño de los disipadores del VRM y el flujo de aire;
- si los límites de potencia de la placa son conservadores o agresivos;
- los conectores de alimentación de CPU (8 pines, 4 pines o ambos);
- el comportamiento de la placa bajo carga sostenida en análisis independientes.

La afirmación de una placa de "admite CPU de 200 W" no garantiza que mantenga esa carga en silencio dentro de una caja cerrada. Los análisis y la guía de potencia del manual son más útiles.

## BIOS, firmware y revisiones

Las placas reciben actualizaciones de firmware para compatibilidad de CPU, memoria, seguridad y corrección de errores. Antes de comprar:

- consulta la lista de CPU compatibles para tu procesador exacto;
- comprueba la versión mínima de BIOS;
- comprueba si la placa puede actualizar la BIOS sin CPU, memoria ni tarjeta gráfica;
- comprueba la revisión de hardware, que puede cambiar componentes o soporte;
- revisa la garantía y la política de actualizaciones del fabricante.

Una placa que exige una BIOS más nueva que la instalada puede no arrancar de fábrica. Si no puedes actualizarla tú, compra a un vendedor que confirme la versión instalada o elige una placa con una función de actualización adecuada.

## Espacio y encaje físico

Mide el espacio dentro de la caja:

- **Altura del disipador:** la altura máxima de la caja y la posición del zócalo en la placa.
- **Altura de la memoria:** los disipadores altos pueden chocar con un disipador de aire grande.
- **Longitud y grosor de la GPU:** la longitud máxima de la caja y el espaciado de ranuras de la placa.
- **Espacio para el radiador:** montaje superior, frontal y trasero, más el grosor de los ventiladores.
- **Cableado:** espacio detrás de la bandeja y holgura para los cables de 24 pines y EPS.
- **Longitud de la fuente:** sobre todo en cajas pequeñas.
- **Jaulas de discos:** si bloquean el flujo de aire o el espacio de la GPU.

Una placa puede caber en la caja y aun así dificultar la gestión de cables o el montaje del disipador. Consulta montajes similares o las dimensiones del manual si tienes dudas.

## Un proceso de selección práctico

1. **Elige primero la CPU.** El zócalo y las funciones de plataforma se derivan de ella.
2. **Enumera las funciones que necesitas.** Generación de memoria, número de M.2, USB, red, Wi-Fi y cabeceras.
3. **Elige un formato.** Confirma que la caja lo admite y tiene espacio para el disipador y la GPU.
4. **Preselecciona placas con el chipset adecuado.** Compara VRM, reparto de carriles y E/S trasera.
5. **Comprueba la lista de CPU y el requisito de BIOS.** Confirma la revisión exacta.
6. **Comprueba el soporte de memoria.** Usa la QVL y el soporte oficial de memoria de la CPU.
7. **Comprueba el espacio.** Disipador, GPU, radiador, fuente y cableado.
8. **Comprueba la garantía y el vendedor.** Confirma que la placa es nueva, que la revisión se conoce y que la política de devolución es aceptable.

## Errores comunes

- **Comprar una placa sin comprobar el requisito de BIOS.** Una CPU compatible puede no arrancar con firmware antiguo.
- **Suponer que todas las ranuras M.2 son independientes.** El reparto de carriles puede desactivar puertos SATA o reducir el ancho de banda PCIe.
- **Ignorar la QVL y el soporte de memoria de la CPU.** Los kits rápidos pueden no alcanzar su perfil nominal.
- **Elegir una placa solo por el nombre del chipset.** La implementación, el VRM y la distribución importan.
- **Olvidar las cabeceras frontales.** Un puerto USB-C de la caja necesita una cabecera compatible.
- **Ignorar las revisiones de hardware.** El mismo nombre de modelo puede venderse con componentes distintos.
- **Suponer que una placa pequeña es más barata.** Las placas de formato pequeño pueden tener sobreprecio.

## Límites de esta guía

Las funciones y el firmware de las placas cambian con las revisiones, y las listas de soporte del fabricante no siempre están completas. Esta guía no puede confirmar que una placa concreta admita una CPU, un kit de memoria o un disipador concretos. Consulta el manual, la lista de CPU, la QVL de memoria y la revisión del modelo exacto antes de comprar. Si la placa es usada, confirma su revisión y si la BIOS ha sido modificada.
