---
slug: pc-cooling-explained
lang: en
title: "PC Cooling Explained: Air Cooling vs Liquid Cooling"
seoTitle: "PC Cooling Explained: Air vs Liquid Cooling"
description: "How CPU and case cooling work, when air or liquid cooling makes sense, and which clearances and noise trade-offs to check."
category: "Choosing components"
tags:
  - cooling
  - cpu cooler
  - airflow
  - aio
  - noise
published: 2026-11-01
updated: 2026-11-01
author: AppKitX Editorial
related:
  - how-to-check-pc-component-compatibility
  - how-to-choose-a-cpu
  - a-practical-guide-to-building-your-first-desktop-pc
references:
  - title: "Intel Core processors"
    publisher: "Intel"
    url: "https://www.intel.com/content/www/us/en/products/details/processors/core.html"
  - title: "AMD Ryzen desktop processors"
    publisher: "AMD"
    url: "https://www.amd.com/en/products/processors/desktops/ryzen.html"
  - title: "PCI Express specifications"
    publisher: "PCI-SIG"
    url: "https://pcisig.com/specifications"
---

Cooling is not a single component decision. The CPU cooler, case fans, airflow path, ambient temperature, and the heat produced by the GPU all interact. A cooler that performs well on a test bench can struggle in a closed case with poor intake, and a large radiator can be wasted if the case cannot supply it with cool air.

This guide explains the principles, compares air and liquid cooling, and lists the clearances and trade-offs to check before buying.

## How heat leaves the system

The CPU generates heat, which moves into the cooler's base and then into the air or liquid. The cooler transfers that heat to the surrounding air, and the case fans move the warmed air out of the case. If the case cannot exhaust heat, the internal temperature rises and every component runs hotter.

The chain is only as good as its weakest link:

1. **CPU to cooler:** contact pressure, thermal paste, and the cold plate or base.
2. **Cooler to air:** heatsink surface area, fan airflow, and radiator size.
3. **Air to outside:** case intake, exhaust, filters, and clearance.

A better CPU cooler cannot fix a case with no airflow. More case fans cannot fix a cooler that is not mounted correctly.

## TDP is not a standardised cooling rating

CPU and cooler manufacturers use "TDP" (thermal design power) in different ways. A CPU's TDP may describe a nominal power target, not the maximum sustained heat output. A cooler's "supports 250 W" claim may be based on a specific fan speed, ambient temperature, and test setup.

Do not match two TDP numbers and assume the cooler is adequate. Check independent reviews that measure temperature and noise with a comparable CPU and workload. Look for:

- the CPU used in the test;
- the power limit and workload;
- the ambient temperature;
- the fan speed and noise level;
- whether the test was open-bench or in a case.

A cooler that is adequate for a low-power CPU may be marginal for a high-core-count CPU under sustained load.

## Air cooling

Air coolers use a heatsink and one or more fans. They are simple, reliable, and often cheaper than liquid coolers. A good tower cooler can handle a wide range of CPUs.

Strengths:

- no pump to fail;
- usually lower cost;
- easy to install and maintain;
- no liquid leak risk;
- long service life if the fan is replaceable.

Trade-offs:

- large towers can block memory or the case side panel;
- height clearance matters;
- heat is dumped into the case, so case airflow matters;
- very high-end CPUs may need a larger cooler or a different approach;
- fan noise depends on the fan and the fan curve.

Check the cooler's height, memory clearance, socket mounting, and whether it includes the right bracket. Some coolers require a separate mounting kit for newer sockets.

## Liquid cooling

All-in-one (AIO) liquid coolers use a pump, tubes, a cold plate, and a radiator. Custom loops use separate components and require more maintenance.

Strengths:

- the radiator can be mounted away from the CPU socket, which helps in some small cases;
- large radiators can handle high heat loads;
- the CPU area can be less crowded;
- some builds prefer the appearance.

Trade-offs:

- the pump is a wear item and can fail;
- a leak can damage components, though failures are uncommon;
- radiators need space and airflow;
- the pump and fans add noise;
- installation is more complex;
- the radiator still needs cool air, so case airflow matters.

Check the radiator size and mounting locations, tube length and flexibility, pump orientation, and whether the case supports the radiator plus fans. A 360 mm radiator needs three 120 mm fan mounts and enough clearance; it is not automatically better than a good 240 mm radiator in a case that cannot supply airflow.

## Radiator size and fan configuration

A larger radiator has more surface area and can dissipate more heat at a given fan speed, but the benefit depends on the heat load and airflow. A 360 mm radiator with low-speed fans may perform similarly to a 280 mm radiator with good fans, and both can be limited by the case's intake.

Consider:

- **Radiator thickness:** thicker radiators need more static pressure and space.
- **Fan type:** static-pressure fans are usually better for radiators; airflow fans are better for open case ventilation.
- **Push vs pull vs push-pull:** push-pull can improve performance but adds thickness and noise.
- **Mounting location:** front intake, top exhaust, or side mount changes the airflow path.
- **Air bubbles:** mount the pump below the radiator's top or follow the manufacturer's guidance to avoid trapped air.

## Case airflow and pressure

Case airflow determines how quickly warm air leaves the system.

- **Positive pressure:** more intake than exhaust. Helps reduce dust ingress through unfiltered gaps, but can push warm air out through gaps.
- **Negative pressure:** more exhaust than intake. Can pull dust through unfiltered openings.
- **Balanced:** roughly equal intake and exhaust. Often a good starting point.

Use filtered intakes where possible, and clean the filters regularly. A restrictive front panel or a solid glass front can starve the fans. Check reviews that measure airflow and temperature in the actual case.

GPU heat is a major factor. A high-end GPU can dump hundreds of watts into the case. Ensure that intake air reaches the GPU and that exhaust has a path out. In small cases, a blower-style GPU or a well-ventilated side panel may matter more than the CPU cooler.

## Noise, fan curves, and ambient temperature

Noise is subjective, but the main factors are fan speed, bearing type, turbulence, and pump noise. A larger cooler can run its fans slower for the same temperature, which often makes it quieter.

Check:

- the fan curve in the motherboard BIOS or software;
- whether the fans stop at low load;
- the pump speed and whether it is adjustable;
- the case's sound damping or mesh panels;
- the ambient temperature in your room.

A cooler tested at 20 °C ambient may perform differently at 30 °C. If your room is warm, leave more thermal headroom.

## Mounting, paste, and contact

Installation quality matters as much as the cooler.

- Use the correct socket bracket and standoffs.
- Tighten screws in the recommended pattern and do not overtighten.
- Apply a sensible amount of thermal paste; too little or too much can hurt temperatures.
- Remove the protective film from the cold plate before mounting.
- Check that the cooler is seated evenly and does not rock.
- Connect the fan and pump headers correctly.
- Set the pump to a suitable speed; some pumps should not run at very low RPM.

If temperatures are unexpectedly high, check the mount before buying a new cooler.

## A practical selection process

1. **Identify the CPU's sustained heat output.** Use reviews, not just TDP.
2. **Check the case's cooler and radiator clearances.** Height, length, thickness, and memory clearance.
3. **Choose air or liquid based on the case and budget.** Air is simpler; liquid can help in some layouts.
4. **Check the socket mounting kit.** Confirm support for your exact socket and revision.
5. **Check fan and pump headers.** Ensure the board has enough headers and suitable control.
6. **Plan the airflow path.** Intake, exhaust, filters, and GPU heat.
7. **Check noise expectations.** Look for reviews with comparable fan speeds and ambient temperature.
8. **Install carefully and test.** Monitor temperatures under sustained load and adjust the fan curve.

## Common mistakes

- **Matching TDP numbers.** They are not standardised.
- **Buying a large radiator without checking case clearance.** Radiator plus fans can be thicker than expected.
- **Ignoring memory height.** A large air cooler can block tall memory.
- **Forgetting the protective film.** It is a common cause of high temperatures.
- **Using the wrong fan header.** Pump and fan headers may have different ratings.
- **Starving the radiator with warm case air.** A front radiator can recirculate GPU heat.
- **Setting fans too aggressively.** A quieter curve often performs nearly as well.

## Limits of this guidance

Cooling performance is system-specific. The same cooler can behave differently with a different CPU, case, ambient temperature, fan curve, and GPU. This guide does not recommend a specific cooler. Check independent reviews with a comparable setup, the case's clearance specifications, and the cooler's mounting documentation before buying.
