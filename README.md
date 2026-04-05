# FinancesPlanning — Smart Budget Allocation

A web application for budget visualization and planning with dynamic category distribution, dark theme support, and URL state persistence.

## Project Structure

The project is decomposed into modules following semantic markup to ensure modularity and readability:

```text
FinancesPlanning/
├── index.html              # Main document structure and script entry points
├── AppGraph.xml            # Dependency map and module architecture
├── static/
│   ├── css/
│   │   └── style.css       # Global styles, theme variables, and responsiveness
│   └── js/
│       ├── state.js        # State management (totalAmount, categories) and URL Persistence
│       ├── chart-engine.js  # Chart.js integration (Doughnut and Bar charts)
│       ├── ui-renderer.js  # Dynamic rendering of category list and legend
│       ├── theme-manager.js # Theme switching and link copying functionality
│       └── main.js         # Entry point, app initialization, and event listeners
└── README.md               # Project documentation
```

## Key Features

- **Dynamic Charts:** Choose between a doughnut chart and a stacked bar chart.
- **URL State Persistence:** All changes are instantly saved in the URL hash (Base64), allowing you to share a link to your configured budget.
- **Interactivity:** Sliders and input fields are synchronized in real-time.
- **Theme Support:** Light and dark themes with automatic chart adaptation.
- **Responsiveness:** Optimized for mobile devices.

## Technologies

- **Frontend:** Pure JavaScript (ES6+), HTML5, CSS3.
- **Libraries:** [Chart.js](https://www.chartjs.org/) (via CDN).
- **Fonts:** [Inter](https://fonts.google.com/specimen/Inter) (Google Fonts).

## How to Run

The application is a pure client-side SPA and does not require a server for basic operation.

1. Clone the repository or download the files.
2. Open `index.html` in any modern browser.
3. (Optional) For link copying and certain browser APIs to function correctly, it is recommended to open via a local server (e.g., Live Server extension in VS Code or `python -m http.server`).

---
Developed using semantic markup and Log Driven Development (LDD) principles.
