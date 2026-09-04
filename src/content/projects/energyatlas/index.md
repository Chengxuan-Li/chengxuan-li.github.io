---
title: EnergyAtlas.io
short_title: EnergyAtlas.io
summary: A city-scale utility digital twin and energy simulation platform that integrates building models, geospatial data, smart-meter observations, and physical simulation.
positioning: A city-scale utility digital twin and energy simulation platform, built in C#/.NET, whose simulation, geometry, data, and visualization architecture I lead.
status: active
start_date: 2025-01
end_date: null
featured: true
published: true
home_order: 1
types: [simulation, software, engineering]
topics: [Energy Modeling, Machine Learning, Optimization, Digital twin, Smart-meter data, SCADA, AMI, Load forecasting]
technologies: [C#, ASP.NET, Python, DuckDB]
affiliation: Environmental Systems Lab
hero_image: ./software-interface-cover.png
hero_alt: EnergyAtlas.io interface showing 3D city maps, building layers, scenario charts, and template-assignment controls.
hero_caption: EnergyAtlas.io software interface.
videos:
  - url: https://www.energyatlas.io/assets/video/ArchetypeCombined.mp4
    title: Urban Digital Twin Builder
    caption: Combines tax records, parcels, zoning data, LiDAR, permits, and meter information in one workflow. Automated format conversion and attribute joins support localized archetypes and usage schedules, producing detailed urban models from individual buildings to city scale.
    autoplay: true
    fit: cover
  - url: https://www.energyatlas.io/assets/video/ResultSelection.mp4
    title: City-Scale Energy Simulation
    caption: Runs hourly, ISO-compliant 5R1C simulations 150 times faster than traditional baselines. The workflow forecasts energy demand and carbon emissions at building and district scales with minimal data requirements.
    autoplay: true
    fit: cover
  - url: https://www.energyatlas.io/assets/video/RadiationCesiumView.mp4
    title: Renewables Integration
    caption: Models rooftop photovoltaics with voxel shading and ray marching, alongside geothermal systems and district-scale energy networks. The resulting views show how on-site and off-site resources contribute to urban energy supply.
    autoplay: true
    fit: cover
related_project_ids: [inverse-calibration]
links:
  - label: Website
    url: https://energyatlas.io/
    kind: other
---

## Problem

City-scale energy planning needs building-level detail at utility scale. Building models, geospatial
context, measured smart-meter observations, and physical simulation have to work together in one consistent
system rather than in separate tools.

## System / Method

EnergyAtlas.io is a city-scale utility digital twin and energy simulation platform built in C#/.NET. Its core
architecture has four parts:

- **Simulation** — physical building energy simulation at urban scale.
- **Geometry** — building models and the geometric processing they require.
- **Data** — geospatial data and smart-meter observations integrated with the models.
- **Visualization** — presentation of results across the city.

Scalable pipelines cover LiDAR processing, shading analysis, time-series processing, and large-scale urban
simulations.

![EnergyAtlas.io interface showing 3D city maps, building layers, scenario charts, and template-assignment controls.](./software-interface-cover.png)

## My Contribution

As Lead Developer since January 2025, I lead development of the platform, designed its core simulation,
geometry, data, and visualization architecture, and built the LiDAR, shading-analysis, time-series, and
large-scale simulation pipelines.

## Technical Details

Details of the simulation engine, data architecture, calibration workflow, and scalability are pending
source material; the sections above reflect the verified project description.
