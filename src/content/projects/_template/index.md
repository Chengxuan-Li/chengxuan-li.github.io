---
# Copy this folder to src/content/projects/<slug>/ (lowercase words joined by hyphens). The folder name is
# the project id used in cross-references and the URL /projects/<slug>/. Remove comments you do not need.
title:
  en: Project title
  # zh: 项目标题                   # optional; Chinese pages fall back to en when omitted
short_title:                       # optional; used where space is tight
  en: Short title
  # zh: 简短标题
summary:
  en: One sentence stating the problem and the contribution.
  # zh: 用一句话说明问题和贡献。
# positioning:
#   en: Slightly longer framing shown under the title on the project page.
#   zh: 项目页面标题下显示的较长介绍。
status: active                      # active | completed | paused | archived
start_date: 2026-01                 # YYYY, YYYY-MM, or YYYY-MM-DD
end_date: null                      # null while ongoing
published: true                     # false hides cards, cross-links, and the generated project route
featured: false                     # true to show on the home page (then home_order is required)
# home_order: 1                     # position among featured projects on the home page
types: [research, software]         # research | software | simulation | engineering | teaching
topics:
  - en: Topic label
    # zh: 主题标签
  - en: Another topic
    # zh: 另一主题
technologies: [Python]
# affiliation:                     # optional
#   en: Cornell University
#   zh: 康奈尔大学
# hero_image: ./hero.png            # (optional) image placed next to this file; 1600px wide or more
# hero_alt:                        # required when hero_image is informative; en may be "" if decorative
#   en: What the figure shows.
#   zh: 图片所展示的内容。
# hero_caption:                    # optional
#   en: Caption under the hero figure.
#   zh: 图片说明。
# videos:                            # optional external videos shown after the case-study body
#   - url: https://youtu.be/...      # HTTPS YouTube, Vimeo, or direct .mp4 URL; never store video files here
#     title: Visible and accessible video title
#     caption: Caption under the video. # optional
#     poster: ./video-poster.png     # optional co-located image used for direct .mp4 playback
#     autoplay: false               # direct .mp4 only; plays muted while visible and pauses off-screen
#     fit: contain                  # direct .mp4 only; use cover to fill and crop the 16:9 frame
related_project_ids: []             # other project folder names (2–4 at most are shown)
links: []
# links:
#   - label:
#       en: Code
#       zh: 代码
#     url: https://github.com/...
#     kind: code                    # code | demo | paper | docs | data | other
---

## Problem

State the technical or research problem before describing the implementation.

## System / Method

Describe the approach. Show architecture or data flow before detailed prose. Add figures with
`![What the figure shows](./figure.png)`; every project image lives next to this file and is optimized at build time.

## My Contribution

Make individual ownership legible for collaborative work. Use first person only where the sources support it.

## Technical Details

Use project-specific subsections (for example "Simulation engine", "Data architecture") rather than a fixed list.

## Results

Verified outputs, figures, and numbers only. Publications, software links, talks, activity, and related
projects are generated automatically from the structured records that reference this project.

<!-- To translate this narrative, copy index.zh.md from this template folder into the project folder.
     If index.zh.md is absent, the Chinese route displays this English body. -->
