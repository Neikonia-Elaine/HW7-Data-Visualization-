# HW7 - D3.js Retail Analytics Dashboard


## Features

- **Interactive Scatter Plot**: Visualize the relationship between product prices and various performance metrics
- **Dynamic Filters**: Filter data by country and Y-axis metrics
- **Tooltip Information**: Hover over points to see detailed product information
- **Selection Tool**: Use brush tool to select specific data points for detailed analysis

## Available Y-Axis Metrics

- **Total Quantity**: Number of units sold per product
- **Total Sales**: Total revenue generated per product
- **Recency**: Days since the last purchase (RFM analysis)
- **Frequency**: Number of purchase transactions (RFM analysis)


## File Structure

```
HW7/
├── index.html                 # Main HTML file
├── script.js                  # D3.js visualization logic
├── styles.css                 # CSS styling
├── data_processing.py         # Data processing script
├── data/
│   ├── processed_retail_data.csv  # Processed dataset
│   ├── Online Retail.xlsx         # Original dataset
│   └── online+retail.zip          # Compressed original data
├── material/                  # Learning materials
│   ├── d3.md.pdf             # D3.js documentation
│   └── interactiveVisualization.pdf
├── requirements.txt           # Python dependencies
└── README.md                 # This file
```

## Installation and Setup

### Method 1: Using Python HTTP Server

```bash
# Install Python dependencies
pip install -r requirements.txt

# Start HTTP server
python3 -m http.server 8000

# Access the application
http://localhost:8000/index.html
```

## Data Source

The dashboard uses an online retail dataset containing:
- **Product Information**: Stock codes, descriptions, unit prices
- **Sales Data**: Quantities sold, total revenue
- **Customer Information**: Countries, purchase patterns
- **Temporal Data**: Purchase dates for RFM analysis


## Usage Guide

### Basic Navigation
1. **Y-Axis Selection**: Choose different metrics to analyze price relationships
2. **Country Filter**: Focus on specific markets or regions
3. **Price Filter**: Analyze products by price categories
4. **Density Control**: Adjust point density for better visualization

### Interactive Features
- **Hover**: View detailed product information
- **Brush Selection**: Select specific data points for analysis


### Analytical Insights
The dashboard provides contextual analysis based on selected metrics:
- **Price-Quantity Analysis**: Identify volume vs. price strategies
- **Price-Sales Analysis**: Revenue optimization insights
- **Price-Recency Analysis**: Inventory and marketing recommendations
- **Price-Frequency Analysis**: Customer behavior patterns


