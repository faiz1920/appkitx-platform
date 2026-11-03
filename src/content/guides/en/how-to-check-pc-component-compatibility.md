---
slug: how-to-check-pc-component-compatibility
lang: en
title: "How to Check PC Component Compatibility"
seoTitle: "How to Check PC Component Compatibility"
description: "A practical checklist for CPU, motherboard, memory, GPU, PSU, case, cooler, and storage compatibility before you buy."
category: "Compatibility"
tags:
  - compatibility
  - build planning
  - motherboard
  - psu
  - clearance
published: 2026-11-01
updated: 2026-11-01
author: AppKitX Editorial
related:
  - how-to-choose-a-cpu
  - how-to-choose-a-compatible-motherboard
  - a-practical-guide-to-building-your-first-desktop-pc
references:
  - title: "AMD Ryzen desktop processors"
    publisher: "AMD"
    url: "https://www.amd.com/en/products/processors/desktops/ryzen.html"
  - title: "Intel Core processors"
    publisher: "Intel"
    url: "https://www.intel.com/content/www/us/en/products/details/processors/core.html"
  - title: "DDR5 SDRAM standard (JESD79-5)"
    publisher: "JEDEC"
    url: "https://www.jedec.org/standards-documents/docs/jesd79-5"
  - title: "PCI Express specifications"
    publisher: "PCI-SIG"
    url: "https://pcisig.com/specifications"
  - title: "Windows 11 specifications and system requirements"
    publisher: "Microsoft"
    url: "https://www.microsoft.com/en-us/windows/windows-11-specifications"
---

Most compatibility mistakes are not exotic. They are a CPU that does not fit the socket, memory of the wrong generation, a GPU that is too long for the case, a cooler that blocks the side panel, or a power supply without the right connector. A checklist catches these before you order.

This guide walks through the checks in the order that makes sense: platform, memory, expansion, power, physical fit, and software.

## The compatibility checklist

| Check                | What to compare                                    | Where to confirm                                 |
| -------------------- | -------------------------------------------------- | ------------------------------------------------ |
| CPU socket           | CPU socket vs motherboard socket                   | Motherboard CPU support list                     |
| BIOS support         | CPU model vs minimum BIOS version                  | Motherboard support page and manual              |
| Memory generation    | DDR4 vs DDR5                                       | Motherboard specification and CPU memory support |
| Memory slots         | Kit configuration vs slot count                    | Motherboard manual and QVL                       |
| GPU clearance        | Card length, thickness, height                     | Case specification and GPU dimensions            |
| CPU cooler clearance | Cooler height, radiator size, memory height        | Case, cooler, and motherboard manuals            |
| PSU power            | Sustained load plus transient headroom             | GPU/CPU recommendations and PSU review           |
| PSU connectors       | CPU EPS, PCIe, 12V-2x6                             | PSU cable list and GPU manual                    |
| Storage              | M.2 length/key, SATA ports, lane sharing           | Motherboard manual                               |
| Case form factor     | ATX, micro-ATX, mini-ITX, E-ATX                    | Case specification                               |
| Front panel          | USB-C, audio, power/reset headers                  | Motherboard manual and case cable list           |
| Display outputs      | HDMI/DisplayPort version, resolution, refresh rate | GPU and monitor specifications                   |
| Operating system     | TPM, Secure Boot, CPU support                      | OS requirements and motherboard manual           |

## 1. CPU and motherboard socket

The CPU must fit the motherboard's socket. This is a hard rule; adapters are not a practical option for modern desktop CPUs.

Within a socket, check the motherboard's CPU support list for the exact model. A board may support a CPU only after a BIOS update, and some boards cannot update without a supported CPU installed. If the board has a USB BIOS-flash feature, you may be able to update it without booting.

Also check the **hardware revision** of the board. Vendors sometimes change components or support without changing the marketing name.

## 2. Memory generation and configuration

DDR4 and DDR5 are keyed differently and are not interchangeable. Confirm the motherboard's memory type before buying a kit.

Then check:

- the maximum capacity and the number of slots;
- the supported speed for the number of modules you plan to install;
- the motherboard's qualified-vendor list;
- the CPU's official memory support;
- module height and cooler clearance;
- whether the kit requires EXPO/XMP and whether the board supports it.

Two modules are usually easier on the memory controller than four. If you plan to fill all four slots, check the board's guidance for that configuration.

## 3. Graphics card clearance and power

Measure the case's maximum GPU length, thickness, and height. Compare them with the card's dimensions, not just its slot count. Also check:

- space for the power cable and its bend radius;
- whether a front fan or radiator reduces the available length;
- whether the card blocks drive bays or the side panel;
- whether a support bracket is needed;
- whether the case has enough airflow for the card's heat output.

For power, check the GPU's recommended PSU wattage and connector type. A card with a 12V-2x6 connector needs a compatible PSU cable or a manufacturer-approved adapter. Do not reuse modular cables from a different PSU.

## 4. CPU cooler and case clearance

Check the cooler's height against the case's maximum CPU cooler height. For liquid cooling, check the radiator size and mounting locations, plus the thickness of the radiator and fans.

Also check:

- memory height versus the cooler's overhang;
- whether the cooler blocks the top PCIe slot;
- whether the cooler's fans conflict with the rear exhaust fan;
- whether the mounting kit supports your socket;
- whether the case has enough fan and pump headers.

A cooler can fit the case but still make memory installation or cable routing difficult.

## 5. Power supply sizing and connectors

Estimate the system's sustained load and add headroom for transient spikes. Check the PSU's 12 V output, not just the total wattage. Confirm the CPU EPS and GPU connectors, and check the cable lengths for your case.

A PSU that is powerful enough but lacks the right connector is not compatible. A PSU with the right connector but the wrong cable pinout can be dangerous. Use the cables supplied with the PSU.

## 6. Storage and lane sharing

Check the motherboard's M.2 slots:

- supported lengths (2280, 2242, 2230);
- PCIe versus SATA support;
- lane sharing with SATA ports or PCIe slots;
- heatsink clearance;
- whether the slot is accessible under the GPU.

A drive that fits physically may not run at its rated speed if the slot is a lower generation or shares lanes. For SATA drives, check the number of ports and whether they are disabled by an M.2 device.

## 7. Case form factor and front panel

Confirm the case supports the motherboard form factor. Then check:

- front-panel USB-C and audio headers;
- fan and radiator mounts;
- PSU length;
- drive bays;
- cable routing space;
- dust filters and airflow.

A case can support the board but not the cooler, GPU, or PSU you chose. Check the complete list of clearances, not just the form factor.

## 8. Display outputs and monitor

Check the GPU's outputs and the monitor's inputs. Confirm the version of HDMI or DisplayPort, the maximum resolution and refresh rate, and whether adaptive sync is supported over that connection.

A high-refresh monitor may need DisplayPort rather than HDMI, and the cable must support the required bandwidth. Check the monitor's manual for the exact mode.

## 9. Operating system and firmware

If you plan to install Windows 11, check the minimum requirements: a compatible 64-bit processor, 4 GB of RAM, 64 GB of storage, UEFI with Secure Boot capability, TPM 2.0, and a DirectX 12-compatible GPU. These are minimums, not recommendations for a comfortable build.

Enable the correct firmware settings (UEFI, Secure Boot, TPM) and confirm the motherboard supports them. Some boards ship with Secure Boot disabled or with a firmware mode that needs changing.

For Linux or another OS, check driver support for the GPU, Wi-Fi, Ethernet, and storage controller. A component that works in Windows may need a newer kernel or a proprietary driver.

## 10. Physical assembly checks

Before assembling, lay out the parts and check:

- standoffs match the motherboard's mounting holes;
- the I/O shield is installed or the board has an integrated shield;
- the CPU orientation marker matches the socket;
- memory is seated in the correct slots;
- the cooler's protective film is removed;
- the GPU is in the correct slot and fully seated;
- all power cables are fully seated;
- fan and pump headers are connected.

These checks are simple, but they prevent most first-build failures.

## A practical buying order

1. **CPU and motherboard.** Confirm socket, chipset, BIOS, and form factor.
2. **Memory.** Confirm generation, capacity, slots, and QVL.
3. **GPU.** Confirm performance target, case clearance, and power connectors.
4. **PSU.** Confirm wattage, 12 V output, connectors, and cable lengths.
5. **Cooler.** Confirm socket support, height, radiator space, and memory clearance.
6. **Storage.** Confirm M.2 length, interface, lane sharing, and capacity.
7. **Case.** Confirm all clearances and front-panel headers.
8. **Monitor and cables.** Confirm outputs, versions, and bandwidth.

## Common mistakes

- **Buying memory before confirming the motherboard's generation.** DDR4 and DDR5 are not interchangeable.
- **Assuming a CPU works without a BIOS update.** Check the support list and minimum version.
- **Ignoring GPU thickness and cable clearance.** Length is not the only dimension.
- **Using the wrong PSU cables.** Modular cables are not universal.
- **Forgetting the cooler's socket kit.** Older coolers may need a new bracket.
- **Filling every M.2 slot without checking lane sharing.** Some ports may be disabled.
- **Assuming a case supports a radiator because it has fan mounts.** Thickness and clearance matter.
- **Skipping the front-panel header check.** A USB-C case port may need a specific header.

## Limits of this guidance

Compatibility depends on exact models, revisions, firmware, and regional SKUs. This checklist cannot confirm that a specific combination will work. Check the manufacturer's documentation for each part, especially the motherboard CPU support list, memory QVL, case clearance specifications, and PSU cable list. If a part is used or imported, confirm its revision and warranty before buying.
