---
title: "Schedule Page Updated – Ukraine Timezone & New Backend"
date: 2026-05-01
tags: [schedule, timezone, web, liquidsoap]
---

# Schedule Page Updated – Ukraine Timezone & New Backend

We've just pushed a major update to the **ZamRock Radio schedule page** at https://zamrock.net/schedule/

## What's New

### 🇺🇦 Ukraine Timezone Support
Listeners in Ukraine can now select **"Ukraine (EET)"** from the timezone dropdown. The schedule will automatically adjust to local Kyiv time.

### 🔧 New JSON-Driven Schedule Backend
The schedule display is now powered by a clean JSON file (`zamrock-schedule.json`) generated directly from our **Liquidsoap config**. 

- The LS repo parses `ls-config-section_2.ls` (our Liquidsoap settings)
- Extracts playlist names, times, and day-of-week rules
- Outputs a clean JSON consumed by the web frontend
- **One change in Liquidsoap → auto-updates the website schedule**

### ✅ Code Quality
- Full `standardjs` lint compliance
- Removed dead code (unused vars, duplicate logic)
- Fixed overnight show handling (22:00-06:00 "Endless Mixtapes" now displays correctly)
- Day-of-week filtering works properly (e.g., "Cloud Pants" only shows Mon/Wed/Fri)

## For Listeners
Just pick your timezone from the dropdown at https://zamrock.net/schedule/ and see what's playing now + what's coming up next.

**Playing now:** Fresh Fish (15:30-19:00 daily) 🎵
**Overnight:** Endless Mixtapes (22:00-06:00) 🌙

#ZamRockRadio #WebUpdate #LiquidSoap #Ukraine #Schedule
