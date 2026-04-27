---
name: "tech-skill"
description: "Analyze tech stack and write comprehensive project README. Invoke when user asks to summarize/edit project README or document tech stack."
---

# Tech Stack Documentation Skill

This skill analyzes a project's source code, dependencies, and architecture to generate a comprehensive, professional README.md in Chinese.

## When to Invoke

- User asks to "edit/summarize project README"
- User wants to document project tech stack
- User requests project overview or documentation

## Workflow

1. **Analyze package.json** — Extract all dependencies, devDependencies, and scripts
2. **Review source structure** — Identify key directories, components, and architecture patterns
3. **Identify core technologies** — Framework, UI library, state management, build tools, etc.
4. **Summarize features** — Based on components and code structure
5. **Generate README** — Write in Chinese with the following sections:
   - 项目简介 (Project Overview)
   - 技术栈 (Tech Stack) — with version badges
   - 功能特性 (Features)
   - 项目结构 (Project Structure)
   - 快速开始 (Quick Start)
   - 核心依赖 (Core Dependencies)
   - 开发脚本 (Scripts)

## README Format

Use markdown with:
- Badges for key technologies (shields.io style)
- Emoji icons for sections
- Code blocks for commands
- Table for dependencies
- Tree-like structure for directories

## Rules

- Write in Chinese
- Be accurate about versions from package.json
- Highlight unique/custom features
- Include all major dependencies
- Keep it professional and concise
