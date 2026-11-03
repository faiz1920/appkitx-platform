---
slug: how-to-check-pc-component-compatibility
lang: es
title: "Cómo comprobar la compatibilidad de los componentes del PC"
seoTitle: "Cómo comprobar la compatibilidad del PC"
description: "Lista práctica para comprobar CPU, placa base, memoria, GPU, fuente, caja, disipador y almacenamiento antes de comprar."
category: "Compatibility"
tags:
  - compatibilidad
  - montaje
  - placa base
  - fuente
  - espacio
published: 2026-11-01
updated: 2026-11-02
author: AppKitX Editorial
related:
  - how-to-choose-a-cpu
  - how-to-choose-a-compatible-motherboard
  - a-practical-guide-to-building-your-first-desktop-pc
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
  - title: "Especificaciones y requisitos de Windows 11"
    publisher: "Microsoft"
    url: "https://www.microsoft.com/en-us/windows/windows-11-specifications"
---

La mayoría de los errores de compatibilidad no son exóticos. Son una CPU que no encaja en el zócalo, memoria de la generación equivocada, una GPU demasiado larga para la caja, un disipador que bloquea el panel lateral o una fuente sin el conector correcto. Una lista de comprobación los detecta antes de pedir las piezas.

Esta guía recorre las comprobaciones en el orden que tiene sentido: plataforma, memoria, ampliación, alimentación, encaje físico y software.

## La lista de compatibilidad

| Comprobación           | Qué comparar                                             | Dónde confirmarlo                                         |
| ---------------------- | -------------------------------------------------------- | --------------------------------------------------------- |
| Zócalo de CPU          | Zócalo de la CPU frente al de la placa                   | Lista de CPU compatibles de la placa                      |
| Soporte de BIOS        | Modelo de CPU frente a versión mínima de BIOS            | Página de soporte y manual de la placa                    |
| Generación de memoria  | DDR4 frente a DDR5                                       | Especificación de la placa y soporte de memoria de la CPU |
| Ranuras de memoria     | Configuración del kit frente a número de ranuras         | Manual y QVL de la placa                                  |
| Espacio para GPU       | Longitud, grosor y altura de la tarjeta                  | Especificación de la caja y dimensiones de la GPU         |
| Espacio para disipador | Altura, tamaño del radiador, altura de memoria           | Manuales de caja, disipador y placa                       |
| Potencia de fuente     | Carga sostenida más margen transitorio                   | Recomendaciones de GPU/CPU y análisis de la fuente        |
| Conectores de fuente   | EPS de CPU, PCIe, 12V-2x6                                | Lista de cables de la fuente y manual de la GPU           |
| Almacenamiento         | Longitud y muesca M.2, puertos SATA, reparto de carriles | Manual de la placa                                        |
| Formato de caja        | ATX, micro-ATX, mini-ITX, E-ATX                          | Especificación de la caja                                 |
| Panel frontal          | USB-C, audio, encendido/reinicio                         | Manual de la placa y cables de la caja                    |
| Salidas de vídeo       | Versión HDMI/DisplayPort, resolución, frecuencia         | Especificaciones de GPU y monitor                         |
| Sistema operativo      | TPM, Secure Boot, soporte de CPU                         | Requisitos del sistema y manual de la placa               |

## 1. Zócalo de CPU y placa base

La CPU debe encajar en el zócalo de la placa. Es una regla dura; los adaptadores no son una opción práctica para las CPU de sobremesa modernas.

Dentro de un zócalo, consulta la lista de CPU compatibles de la placa para el modelo exacto. Una placa puede admitir una CPU solo después de actualizar la BIOS, y algunas no pueden actualizarse sin una CPU compatible instalada. Si la placa tiene una función de actualización USB de BIOS, puede que puedas actualizarla sin arrancar.

Comprueba también la **revisión de hardware** de la placa. Los fabricantes a veces cambian componentes o soporte sin cambiar el nombre comercial.

## 2. Generación y configuración de memoria

DDR4 y DDR5 tienen muescas distintas y no son intercambiables. Confirma el tipo de memoria de la placa antes de comprar un kit.

Después comprueba:

- la capacidad máxima y el número de ranuras;
- la velocidad admitida para el número de módulos que piensas instalar;
- la lista de proveedores cualificados (QVL) de la placa;
- el soporte oficial de memoria de la CPU;
- la altura del módulo y el espacio del disipador;
- si el kit requiere EXPO/XMP y si la placa lo admite.

Dos módulos suelen ser más fáciles para el controlador de memoria que cuatro. Si piensas llenar las cuatro ranuras, consulta la guía de la placa para esa configuración.

## 3. Espacio y alimentación de la tarjeta gráfica

Comprueba la longitud, el grosor y la altura máximos de GPU que admite la caja. Compáralos con las dimensiones de la tarjeta, no solo con su número de ranuras. Comprueba también:

- el espacio para el cable de alimentación y su radio de curvatura;
- si un ventilador frontal o un radiador reducen la longitud disponible;
- si la tarjeta bloquea bahías de discos o el panel lateral;
- si hace falta un soporte;
- si la caja tiene suficiente flujo de aire para el calor de la tarjeta.

Para la alimentación, comprueba la potencia recomendada de la fuente y el tipo de conector de la GPU. Una tarjeta con conector 12V-2x6 necesita un cable compatible o un adaptador aprobado por el fabricante. No reutilices cables modulares de otra fuente.

## 4. Espacio para el disipador de CPU y la caja

Comprueba la altura del disipador con la altura máxima de la caja. Para refrigeración líquida, revisa el tamaño y las ubicaciones del radiador, además del grosor del radiador y los ventiladores.

Comprueba también:

- la altura de la memoria frente al voladizo del disipador;
- si el disipador bloquea la ranura PCIe superior;
- si los ventiladores del disipador chocan con el ventilador trasero;
- si el kit de montaje admite tu zócalo;
- si la caja tiene suficientes cabeceras de ventilador y bomba.

Un disipador puede caber en la caja y aun así dificultar la instalación de la memoria o el cableado.

## 5. Dimensionado y conectores de la fuente

Estima la carga sostenida del sistema y añade margen para picos transitorios. Comprueba la salida de 12 V de la fuente, no solo los vatios totales. Confirma los conectores EPS de CPU y de GPU, y revisa la longitud de los cables para tu caja.

Una fuente suficientemente potente pero sin el conector adecuado no es compatible. Una fuente con el conector correcto pero con pines equivocados puede ser peligrosa. Usa los cables suministrados con la fuente.

## 6. Almacenamiento y reparto de carriles

Comprueba las ranuras M.2 de la placa:

- longitudes admitidas (2280, 2242, 2230);
- soporte PCIe o SATA;
- reparto de carriles con puertos SATA o ranuras PCIe;
- espacio para el disipador;
- si la ranura es accesible debajo de la GPU.

Una unidad que cabe físicamente puede no funcionar a su velocidad nominal si la ranura es de una generación inferior o comparte carriles. Para unidades SATA, comprueba el número de puertos y si un dispositivo M.2 los desactiva.

## 7. Formato de la caja y panel frontal

Confirma que la caja admite el formato de la placa. Después comprueba:

- cabeceras USB-C y audio del panel frontal;
- montajes de ventiladores y radiadores;
- longitud de la fuente;
- bahías de discos;
- espacio para el cableado;
- filtros de polvo y flujo de aire.

Una caja puede admitir la placa pero no el disipador, la GPU o la fuente que elegiste. Revisa la lista completa de espacios, no solo el formato.

## 8. Salidas de vídeo y monitor

Comprueba las salidas de la GPU y las entradas del monitor. Confirma la versión de HDMI o DisplayPort, la resolución y frecuencia máximas y si la sincronización adaptativa se admite por esa conexión.

Un monitor de alta frecuencia puede necesitar DisplayPort en lugar de HDMI, y el cable debe soportar el ancho de banda necesario. Consulta el manual del monitor para el modo exacto.

## 9. Sistema operativo y firmware

Si piensas instalar Windows 11, comprueba los requisitos mínimos: un procesador de 64 bits compatible, 4 GB de RAM, 64 GB de almacenamiento, UEFI con capacidad Secure Boot, TPM 2.0 y una GPU compatible con DirectX 12. Son mínimos, no recomendaciones para un equipo cómodo.

Activa los ajustes de firmware correctos (UEFI, Secure Boot, TPM) y confirma que la placa los admite. Algunas placas vienen con Secure Boot desactivado o con un modo de firmware que hay que cambiar.

Para Linux u otro sistema, comprueba el soporte de controladores para GPU, Wi-Fi, Ethernet y el controlador de almacenamiento. Un componente que funciona en Windows puede necesitar un kernel más nuevo o un controlador propietario.

## 10. Comprobaciones físicas de montaje

Antes de montar, coloca las piezas y comprueba:

- que los separadores coinciden con los agujeros de la placa;
- que el escudo de E/S está instalado o que la placa lo integra;
- que la marca de orientación de la CPU coincide con el zócalo;
- que la memoria está asentada en las ranuras correctas;
- que has retirado la película protectora del disipador;
- que la GPU está en la ranura correcta y bien asentada;
- que todos los cables de alimentación están bien conectados;
- que las cabeceras de ventilador y bomba están conectadas.

Son comprobaciones sencillas, pero evitan la mayoría de los fallos de un primer montaje.

## Un orden de compra práctico

1. **CPU y placa base.** Confirma zócalo, chipset, BIOS y formato.
2. **Memoria.** Confirma generación, capacidad, ranuras y QVL.
3. **GPU.** Confirma objetivo de rendimiento, espacio en la caja y conectores.
4. **Fuente.** Confirma vatios, salida de 12 V, conectores y longitud de cables.
5. **Disipador.** Confirma soporte de zócalo, altura, espacio para radiador y memoria.
6. **Almacenamiento.** Confirma longitud M.2, interfaz, reparto de carriles y capacidad.
7. **Caja.** Confirma todos los espacios y las cabeceras del panel frontal.
8. **Monitor y cables.** Confirma salidas, versiones y ancho de banda.

## Errores comunes

- **Comprar memoria antes de confirmar la generación de la placa.** DDR4 y DDR5 no son intercambiables.
- **Suponer que una CPU funciona sin actualizar la BIOS.** Consulta la lista de soporte y la versión mínima.
- **Ignorar el grosor de la GPU y el espacio del cable.** La longitud no es la única dimensión.
- **Usar cables de fuente equivocados.** Los cables modulares no son universales.
- **Olvidar el kit de zócalo del disipador.** Los disipadores antiguos pueden necesitar un soporte nuevo.
- **Llenar todas las ranuras M.2 sin comprobar el reparto de carriles.** Algunos puertos pueden desactivarse.
- **Suponer que una caja admite un radiador porque tiene montajes de ventilador.** El grosor y el espacio importan.
- **Saltarse la comprobación de cabeceras frontales.** Un puerto USB-C de la caja puede necesitar una cabecera concreta.

## Límites de esta guía

La compatibilidad depende de modelos, revisiones, firmware y variantes regionales exactos. Esta lista no puede confirmar que una combinación concreta funcione. Consulta la documentación del fabricante de cada pieza, sobre todo la lista de CPU de la placa, la QVL de memoria, las especificaciones de espacio de la caja y la lista de cables de la fuente. Si una pieza es usada o importada, confirma su revisión y garantía antes de comprar.
