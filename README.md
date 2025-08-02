# HW7 - D3.js Retail Analytics Dashboard

## Project Description

This is an interactive retail analytics dashboard created with D3.js for visualizing online retail data. The dashboard provides comprehensive insights into product performance, customer behavior, and sales patterns through dynamic scatter plots and interactive filtering capabilities.

## Features

- **Interactive Scatter Plot**: Visualize the relationship between product prices and various performance metrics
- **Dynamic Filters**: Filter data by country and Y-axis metrics
- **Tooltip Information**: Hover over points to see detailed product information
- **Selection Tool**: Use brush tool to select specific data points for detailed analysis
- **Responsive Design**: Adapts to different screen sizes
- **Analytical Insights**: Real-time analytical notes based on selected metrics

## Available Y-Axis Metrics

- **Total Quantity**: Number of units sold per product
- **Total Sales**: Total revenue generated per product
- **Recency**: Days since the last purchase (RFM analysis)
- **Frequency**: Number of purchase transactions (RFM analysis)

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **Visualization**: D3.js v7
- **Data Processing**: Python (pandas, numpy)
- **Data Format**: CSV

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

### Method 2: Using Any HTTP Server

Place the files in any static file web server to run the application.

## Data Source

The dashboard uses an online retail dataset containing:
- **Product Information**: Stock codes, descriptions, unit prices
- **Sales Data**: Quantities sold, total revenue
- **Customer Information**: Countries, purchase patterns
- **Temporal Data**: Purchase dates for RFM analysis

## Key Learning Objectives

1. **D3.js Fundamentals**: Selectors, data binding, scales, and axes
2. **Interactive Design**: Event handling, animations, and transitions
3. **Data Visualization**: Scatter plots, tooltips, and legends
4. **Responsive Design**: Adapting visualizations to different devices
5. **RFM Analysis**: Understanding customer value through Recency, Frequency metrics

## Usage Guide

### Basic Navigation
1. **Y-Axis Selection**: Choose different metrics to analyze price relationships
2. **Country Filter**: Focus on specific markets or regions
3. **Price Filter**: Analyze products by price categories
4. **Density Control**: Adjust point density for better visualization

### Interactive Features
- **Hover**: View detailed product information
- **Brush Selection**: Select specific data points for analysis
- **Escape Key**: Clear current selection
- **Dynamic Updates**: Real-time chart updates based on filter changes

### Analytical Insights
The dashboard provides contextual analysis based on selected metrics:
- **Price-Quantity Analysis**: Identify volume vs. price strategies
- **Price-Sales Analysis**: Revenue optimization insights
- **Price-Recency Analysis**: Inventory and marketing recommendations
- **Price-Frequency Analysis**: Customer behavior patterns

## Technical Implementation

### D3.js Components
- **Scales**: Linear scales with percentile-based domains
- **Axes**: Custom formatting for better readability
- **Brushes**: Interactive selection tools
- **Transitions**: Smooth animations for better UX
- **Color Scales**: Categorical color mapping for countries

### Data Processing
- **Aggregation**: Product-level data aggregation
- **Filtering**: Dynamic data filtering based on user selections
- **Sampling**: Density-based data sampling for performance
- **RFM Calculation**: Customer value metrics computation

## Performance Features

- **95th Percentile View**: Focuses on main data distribution, excluding extreme outliers
- **Dynamic Sampling**: Adjustable point density for optimal performance
- **Efficient Rendering**: Optimized D3.js rendering for large datasets
- **Responsive Updates**: Smooth transitions between different views

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Future Enhancements

- Additional visualization types (bar charts, heatmaps)
- Export functionality for selected data
- Advanced filtering options
- Real-time data integration
- Mobile-optimized interface

## Author

[Your Name]
[Course Code] - [Course Name]
[Date]

## License

This project is created for educational purposes as part of a data visualization course assignment. 