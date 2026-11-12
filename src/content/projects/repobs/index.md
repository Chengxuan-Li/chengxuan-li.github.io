---
title: repobs
short_title: repobs
summary:
  en: A local dashboard for Git worktrees and coding agents, connecting branch history, Claude Code / Codex
    sessions, and review notes in one view.
  zh: 面向 Git 工作树与编程智能体的本地仪表板，在同一视图中关联分支历史、Claude Code / Codex 会话及审阅记录。
positioning:
  en: Observe repositories and coding-agent activity on a shared timeline, track what needs attention, and keep
    review annotations locally without modifying Git repositories or agent files.
  zh: 在共享时间线上观察代码仓库与编程智能体的活动，跟踪待处理事项，并在本地保存审阅记录，不修改 Git 仓库或智能体文件。
status: active
start_date: 2026-10
end_date: null
published: true
featured: true
home_order: 2
types:
  - software
  - engineering
topics:
  - en: Developer Tools
    zh: 开发者工具
  - en: Git Worktrees
    zh: Git 工作树
  - en: Coding Agents
    zh: 编程智能体
  - en: Local Software
    zh: 本地软件
technologies:
  - TypeScript
  - React
  - Node.js
  - SQLite
  - Vite
hero_image: ./overview.png
hero_alt:
  en: Three rectangular repobs screenshots offset diagonally, showing the timeline, agent details, and review
    checklist with synthetic demo data.
  zh: 三张保持矩形的 repobs 界面截图沿对角线错位叠放，展示使用合成演示数据的时间线、智能体详情与审阅清单。
hero_caption:
  en: Timeline, agent details, and review tools, shown with synthetic demo data.
  zh: 时间线、智能体详情与审阅工具，使用合成演示数据。
show_hero_on_page: false
related_project_ids: []
links:
  - label: GitHub
    url: https://github.com/Chengxuan-Li/repobs
    kind: code
  - label:
      en: Website
      zh: 网站
    url: https://chengxuan-li.github.io/repobs/
    kind: docs
hero_stack:
  - light: ./screenshots/feature-review.png
    dark: ./screenshots/feature-review-dark.png
  - light: ./screenshots/feature-agent.png
    dark: ./screenshots/feature-agent-dark.png
  - light: ./screenshots/feature-timeline.png
    dark: ./screenshots/feature-timeline-dark.png
screenshots:
  - light: ./screenshots/feature-timeline.png
    dark: ./screenshots/feature-timeline-dark.png
    title:
      en: See Every Branch
      zh: 纵览每个分支
    description:
      en: Branches, commits, and worktrees share one timeline, so you can follow forks, merges, pending changes, and
        unpushed work together. Switch between commit order and calendar time, zoom into activity, or fold
        quiet history.
      zh: 在同一时间线上查看分支、提交与工作树，跟踪分叉、合并、未提交改动和未推送的工作。在提交顺序与日历时间之间切换，放大活动细节，或折叠活动较少的历史片段。
    alt:
      en: "The timeline: branches, commits and the agents that worked on them"
      zh: 共享时间线上的分支、提交与智能体
  - light: ./screenshots/feature-agent.png
    dark: ./screenshots/feature-agent-dark.png
    title:
      en: Follow Every Agent
      zh: 跟踪每个智能体
    description:
      en: Follow Claude Code and Codex sessions on the branches where they work. Inspect status evidence, spawned
        agents, recent messages, and step-by-step plans. Missing observations remain Unknown, rather than
        being treated as idle.
      zh: 在各自工作的分支上查看 Claude Code 与 Codex 会话，了解状态依据、子智能体、最近消息与分步计划。观测信息不足时显示为 Unknown，而非推断为空闲。
    alt:
      en: "An agent's details: its status, the evidence and the plan it keeps"
      zh: 智能体详情、状态依据与计划
  - light: ./screenshots/feature-review.png
    dark: ./screenshots/feature-review-dark.png
    title:
      en: Review on Your Terms
      zh: 按自己的方式审阅
    description:
      en: Keep review states, tags, notes, and personal checklists alongside each agent’s own plan. Annotation rules
        help surface sessions that need attention. Your review records stay in repobs, separate from source
        repositories and agent files.
      zh: 在智能体计划旁维护审阅状态、标签、笔记与个人清单，通过批注规则识别需要关注的会话。审阅记录保存在 repobs 中，与源代码仓库和智能体文件分开。
    alt:
      en: "An agent's checklist: the agent's plan first, then your own items"
      zh: 智能体计划与人工审阅清单
intro_video:
  url: https://chengxuan-li.github.io/repobs/assets/repobs-film.mp4
  title:
    en: repobs product film, an animated demonstration with invented repositories and agents
    zh: repobs 产品短片，使用虚构仓库与智能体的动画演示
  poster: ./film-poster.jpg
  autoplay: true
introduction:
  title:
    en: Problem
    zh: 问题
  text:
    en: When coding agents work across several branches and Git worktrees, repository history and session activity
      are scattered. It becomes difficult to tell which session belongs to which change, which agents need
      attention, and what still needs review.
    zh: 当编程智能体分散在多个分支与 Git 工作树中工作时，仓库历史和会话活动也随之分散。很难快速判断每个会话对应哪些改动、哪些智能体需要关注，以及哪些工作尚待审阅。
---

## Local by Design

Repository and agent files are observed without being modified. Review notes, annotations, and settings
live in repobs's own local database. Named views keep their filters and hidden items, and dockable panels
let you arrange the workspace around your review workflow.

## Technical Details

- **Shared contracts:** TypeScript and Zod define the boundary between the Node.js service and React UI.
- **Live observation:** file watchers and bounded polling feed a reconciled snapshot; Server-Sent Events
  deliver changes to the browser.
- **Local persistence:** Node.js's built-in SQLite support stores registered repositories, settings,
  annotations, and rules.
- **Source isolation:** Git inspection uses an allowlist of read-only commands. The service runs on
  `127.0.0.1`; a read-only GitHub pull-request overlay is optional and disabled by default.

## Availability

repobs is open source under the MIT license, with Windows-first release packages. The documentation
covers installation, a screenshot-based tutorial, status semantics, integrations, architecture, and the
HTTP API. The project also includes synthetic demo data for exploring the interface.
