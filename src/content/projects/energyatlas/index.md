---
title: EnergyAtlas.io
short_title: EnergyAtlas.io
summary:
  en: A city-scale utility digital twin and energy simulation platform that integrates building models, geospatial data, smart-meter observations, and physical simulation.
  zh: 面向公用事业的城市尺度数字孪生与能源仿真平台，整合建筑模型、地理空间数据、智能电表观测数据与物理仿真。
positioning:
  en: A city-scale utility digital twin and energy simulation platform, built in C#/.NET, whose simulation, geometry, data, and visualization architecture I lead.
  zh: 基于 C#/.NET 构建的城市尺度公用事业数字孪生与能源仿真平台；其仿真、几何、数据与可视化架构由我主导设计。
status: active
start_date: 2025-01
end_date: null
featured: true
published: true
home_order: 1
types: [simulation, software, engineering]
topics:
  - en: Energy Modeling
    zh: 能源建模
  - en: Machine Learning
    zh: 机器学习
  - en: Optimization
    zh: 优化
  - en: Digital twin
    zh: 数字孪生
  - en: Smart-meter data
    zh: 智能电表数据
  - SCADA
  - AMI
  - en: Load forecasting
    zh: 负荷预测
technologies: [C#, ASP.NET, Python, DuckDB]
affiliation: Environmental Systems Lab
hero_image: ./software-interface-cover.png
hero_alt:
  en: EnergyAtlas.io interface showing 3D city maps, building layers, scenario charts, and template-assignment controls.
  zh: EnergyAtlas.io 界面，展示三维城市地图、建筑图层、情景分析图表与模板分配控件。
hero_caption:
  en: EnergyAtlas.io software interface.
  zh: EnergyAtlas.io 软件界面。
videos:
  - url: https://www.energyatlas.io/assets/video/ArchetypeCombined.mp4
    title:
      en: Urban Digital Twin Builder
      zh: 城市数字孪生构建器
    caption:
      en: Combines tax records, parcels, zoning data, LiDAR, permits, and meter information in one workflow. Automated format conversion and attribute joins support localized archetypes and usage schedules, producing detailed urban models from individual buildings to city scale.
      zh: 在同一流程中整合税务记录、地块、区划数据、LiDAR、施工许可与电表信息。自动化的格式转换与属性关联支持本地化建筑原型与使用作息，生成从单体建筑到城市尺度的精细城市模型。
    autoplay: true
    fit: cover
  - url: https://www.energyatlas.io/assets/video/ResultSelection.mp4
    title:
      en: City-Scale Energy Simulation
      zh: 城市尺度能源仿真
    caption:
      en: Runs hourly, ISO-compliant 5R1C simulations 150 times faster than traditional baselines. The workflow forecasts energy demand and carbon emissions at building and district scales with minimal data requirements.
      zh: 以符合 ISO 标准的 5R1C 模型进行逐小时仿真，速度较传统基准快 150 倍。该流程在极低数据需求下预测建筑与片区尺度的能源需求与碳排放。
    autoplay: true
    fit: cover
  - url: https://www.energyatlas.io/assets/video/RadiationCesiumView.mp4
    title:
      en: Renewables Integration
      zh: 可再生能源集成
    caption:
      en: Models rooftop photovoltaics with voxel shading and ray marching, alongside geothermal systems and district-scale energy networks. The resulting views show how on-site and off-site resources contribute to urban energy supply.
      zh: 结合体素遮阳与光线步进方法对屋顶光伏建模，并涵盖地热系统与区域能源网络。可视化结果展示本地与外部资源如何共同支撑城市能源供应。
    autoplay: true
    fit: cover
related_project_ids: [inverse-calibration]
links:
  - label:
      en: Website
      zh: 网站
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
