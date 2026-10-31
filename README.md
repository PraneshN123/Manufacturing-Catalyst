# Manufacturing Catalyst

An enterprise-grade Material Master Standardization and Taxonomy Governance platform built with Zoho Catalyst.

## 🚀 Overview

**Manufacturing Catalyst** provides automated industrial MRO (Maintenance, Repair, and Operations) classification, noun-modifier standardization, attribute extraction, and probability-based AI taxonomy governance.

### Key Capabilities

- **Automated Taxonomy Classification**: Vector-indexed matching against 12,841 library master taxonomy records and 153 engineering noun-modifier dictionaries.
- **Top 10 AI Suggestions Engine**: Contextual accuracy scoring and inline suggestions drawer with smooth expandable animation and internal vertical scroll.
- **Dynamic OEM / NON-OEM Classification**: Instant dropdown selector and batch categorization.
- **Real-Time Data Decoupling**: Direct support for Zoho Catalyst Data Store, ZCQL (Zoho Catalyst Query Language), and Serverless API endpoints.
- **Batch Standardization Pipeline**: Continuous 60 FPS animated multi-phase pipeline for processing large-scale material catalogs.
- **Safety & State Management**: Unsaved changes protection with browser `beforeunload` confirmation dialogs.

## 📁 Project Structure

```
├── client/
│   ├── index.html            # Main UI presentation layer
│   ├── main.css              # Industrial design system & responsive styling
│   ├── main.js               # Reactive state engine, classification & table renderer
│   ├── library_data.json     # Catalyst Library Table master taxonomy dataset
│   ├── library_taxonomy.json # Noun-modifier attributes and governance dictionary
│   └── user_data.json        # 10,884 catalog items synchronized from Catalyst UserData
├── catalyst.json             # Zoho Catalyst configuration
├── .catalystrc               # Catalyst project environment settings
├── import_csv_to_catalyst.js # CSV data ingestion utility
└── README.md
```

## 🛠️ Local Development

1. Ensure the [Zoho Catalyst CLI](https://catalyst.zoho.com) is installed:
   ```bash
   npm install -g zcatalyst-cli
   ```
2. Start the local Catalyst development server:
   ```bash
   catalyst serve
   ```
3. Open your browser and navigate to:
   ```
   http://localhost:3000/app/index.html
   ```

## 📄 License
Proprietary & Confidential - Manufacturing Catalyst
