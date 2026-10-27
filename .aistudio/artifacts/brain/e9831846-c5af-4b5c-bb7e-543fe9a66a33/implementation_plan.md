# Dale Automation Quality & Maintenance Reporting System: Advanced Check Sheets, Custom Inspection Builder, Dropdown Navigation & Reliability Trends Dashboard

A comprehensive upgrade to Dale Automation's heavy industrial equipment inspection platform, introducing new specialized machine check sheets, a pre-populated custom inspection builder, streamlined dropdown status evaluations, and an interactive equipment failure trends & reliability dashboard.

---

> [!IMPORTANT]
> **Key Architectural Alignments**:
> - **Pre-Populated Component Library**: Inspectors can assemble custom inspection forms in seconds using Dale Automation's categorized component repository (Spiral Drums, SEW Motors & Gearboxes, Festo Pneumatics, Omron/Siemens PLC & Safety, Flame Tubes & Burners, Belts & Wear Strips).
> - **Dropdown Status Control**: All checklist rows now feature standard, high-contrast, touch-accessible dropdown selection menus (`<select>`) alongside status badges for effortless one-tap field scoring.
> - **Equipment Failure & Root-Cause Trends**: The analytics dashboard identifies recurring wear patterns (e.g., oiler failures accelerating wear strip degradation) across client plants (Albany, Blue Ribbon, Sunbake, Goldi, Sasko) to drive proactive engineering improvements.

---

## 1. Overview & Core Concept

- **What It Does**:
  1. **New Industrial Check Sheets**: Prepares specialized Dale Automation check sheets for Prover Steam Trains & Conditioning Units, Tunnel Oven Gas Burner Trains, De-panners & Slat Infeeds, and Ammonia Evaporator Coils.
  2. **Custom Inspection Builder**: Gives field technicians a guided module to compose new inspection sheets using pre-populated machine assemblies, custom item additions, and customizable evaluation modes.
  3. **Streamlined Dropdown Evaluation**: Replaces cumbersome multi-button tapping with clean, reliable `<select>` dropdown controls that dynamically reflect Dale status standards (Good/Repair/Replace, Pass/Fail, Yes/No, OK/Faulty, Readings).
  4. **Engineering Trends & Areas of Improvement Dashboard**: Delivers visual metrics tracking component failure rates, high-risk plant assets, recurring defect clusters, and MTBF insights.
- **Target Audience**: Dale Automation field service technicians, commissioning engineers, plant maintenance managers, and SHEQ directors (`sheq@spiralsystems.co.za`).
- **Key Value**: Drastically accelerates on-site reporting speed, standardizes custom client machinery checklists, and arms engineering leadership with quantifiable data to fix recurring mechanical failure modes.

---

## 2. User Experience & Visual Design

### Key User Flows

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Top Navigation Bar                               │
│  Reports  │  Work Orders  │  Custom Builder  │  Trends & Stats  │  Review   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
     ┌─────────────────────────────────┼─────────────────────────────────┐
     ▼                                 ▼                                 ▼
┌─────────────────────────┐ ┌─────────────────────────┐ ┌─────────────────────────┐
│     All Reports         │ │ Custom Template Builder │ │ Reliability & Trends    │
│  • Double Drum Spiral   │ │ • Category Selection   │ │ • Component Failure Top │
│  • Prover Steam Train   │ │ • Pre-populated Library │ │ • Plant Risk Matrix     │
│  • Tunnel Oven Gas Train│ │ • Dropdown Type Picker  │ │ • Maintenance Backlog   │
│  • De-panner / Slat Conv│ │ • Save & Start Report   │ │ • Improvement Insights  │
└─────────────────────────┘ └─────────────────────────┘ └─────────────────────────┘
```

- **Custom Inspection Builder Flow**:
  1. Inspector clicks **"Custom Builder"** from the top bar or "Create Custom Sheet" in the reports view.
  2. Selects an industrial asset category (Spiral System, Industrial Oven, Prover, Refrigeration, Material Handling, Auxiliary).
  3. Browses or checks off items from the **Pre-Populated Component Catalog** (e.g., "Belt Oiler - Festo Piping", "Drum Center Shaft Bearing - Greased", "Flame Tube Refractory", "Main Drive SEW Motor Brake").
  4. Configures default status evaluation type (Dropdown: Good/Repair/Replace vs Pass/Fail vs Yes/No vs Quantitative Readings).
  5. Adds any site-specific custom items or custom notes.
  6. Saves template: instantly available in the Dale Automation library and ready to launch as an active inspection report.

- **Checklist Dropdown Evaluation Flow**:
  1. In the **Report Editor**, each checklist row features an intuitive `<select>` dropdown menu with color-coded feedback:
     - `Good` (Emerald) / `Repair` (Amber) / `Replace` (Rose) / `NA` (Slate)
     - `Pass` / `Fail` / `NA`
     - `Yes` / `No` / `NA`
     - `OK` / `Faulty` / `NA`
  2. Technicians can use keyboard arrow keys or native mobile touch dropdown rollers for instant, thumb-friendly scoring.
  3. Quick note inputs and camera attachments remain directly connected to each SN item.

- **Trends & Improvement Dashboard Flow**:
  1. Navigates to **"Trends & Stats"**.
  2. Views high-level KPI cards: Overall Asset Health %, Total Critical Defects, Most Frequent Failure Component, Mean Turnaround Time.
  3. Interactive Visual Charts:
     - **Defect Breakdown by Machine Subsystem**: Wear strips, drum bearings, flame tubes, oiler blocks, safety interlocks.
     - **Plant Reliability Matrix**: Defect count and safety status across Albany, Blue Ribbon, Sunbake, Goldi, Sasko, and Snackworks.
     - **Condition Severity Breakdown**: Pie/bar distribution of "Major Repair", "Minor Repair", and "Safe to Use".
     - **Engineering Action Items**: AI-powered or rule-based recommendations (e.g., "Flame tube refractory erosion detected across 3 oven inspections - schedule burner flame angle calibration").

---

## 3. Visual Identity & Design Tokens

- **Aesthetic Direction**: High-density industrial engineering SaaS matching Dale Automation corporate identity (Crisp white canvas, slate structural dividers, Dale crimson accent `#DC2626`, emerald `#16A34A` nominal states, amber `#D97706` repair warnings).
- **Typography**: Clean display sans (`Plus Jakarta Sans`), tabular figures (`font-mono tabular-nums`) for meter readings, temperatures, and defect counts.
- **Top Bar Contract**: Single-row top navigation compliant with design rules: Brand wordmark on the left, clear tab navigation links (`Reports`, `Work Orders`, `Custom Builder`, `Trends & Stats`, `Manager Review`), and 1 primary CTA button (`+ New Report`).

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Application Core                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  storageService (LocalStorage + In-Memory Sync Queue)                       │
│    ├── reports[] (includes custom & built-in inspection forms)             │
│    ├── customTemplates[] (persisted user-created inspection sheets)        │
│    ├── workOrders[] (urgent remedial tickets with push notifications)       │
│    └── currentUser (default: sheq@spiralsystems.co.za / Admin)              │
├─────────────────────────────────────────────────────────────────────────────┤
│  Pre-Populated Component Catalog (daleComponentLibrary.ts)                  │
│    ├── Belts & Drives (Ashworth blue/steel, edge drive links, sprockets)   │
│    ├── Drum & Tower (Center shaft bearings, Sputnik tabs, spokes, rings)    │
│    ├── Lubrication & Pneumatics (Festo piping, oiler blocks, ASU filters)   │
│    ├── Ovens & Combustion (Flame tubes, Belimo dampers, burners, LMV5)      │
│    ├── Provers & Conditioning (Steam lances, DP27 PRV, swing tilt proxies)  │
│    └── Safety & Controls (Fortress key lockout, tier lift switches, E-stops)│
├─────────────────────────────────────────────────────────────────────────────┤
│  Views & Modules                                                            │
│    ├── ReportsList (with template filtering & status chips)                 │
│    ├── ReportEditor (with dropdown status menus & photo uploads)            │
│    ├── CustomTemplateBuilder (searchable pre-populated field composer)      │
│    ├── AnalyticsTrendsDashboard (failure breakdown & plant insights)        │
│    └── ManagerDashboard & PDF Generator (full review & client signatures)   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Technical Sequences

1. **Pre-Populated Catalog Integration**:
   - `src/data/daleComponentLibrary.ts`: structured catalog of Dale equipment sub-assemblies with standardized descriptions, default status types, and recommended inspection notes.
2. **Custom Template Creation**:
   - `CustomTemplateBuilder.tsx`: Allows technicians to select preset categories, toggle component items with pre-filled technical notes, add custom items, and save into `storageService.saveCustomTemplate()`.
   - Custom templates seamlessly plug into `ReportEditor.tsx` and export full automated Dale Automation PDF reports.
3. **Dropdown Menu Upgrade**:
   - Update `ReportEditor.tsx` checklist table rows with responsive, styled `<select>` controls that support keyboard shortcuts and mobile touch wheels.
4. **Analytics & Improvement Engine**:
   - `AnalyticsTrendsDashboard.tsx`: Aggregates all completed and in-progress inspection reports to extract failure counts per component, plant performance ratings, and targeted recommendations for machine longevity.
