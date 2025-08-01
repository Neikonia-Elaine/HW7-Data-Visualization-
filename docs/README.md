## Project Structure

```
HW7/
├── src/                        # Source files
│   ├── index_separated.html    # Main HTML structure
│   ├── script.js              # D3.js visualization logic
│   └── styles.css             # CSS styling
├── data/                      # Data files
│   ├── processed_retail_data.csv  # Processed dataset (3,665 products)
│   ├── Online Retail.xlsx     # Original dataset
│   └── online+retail.zip      # Dataset archive
├── docs/                      # Documentation
│   └── README.md              # This file
├── material/                  # Course materials
│   ├── d3.md.pdf             # D3.js requirements
│   └── interactiveVisualization.pdf  # Assignment requirements
├── backup/                    # Backup files
│   ├── index.html            # Original monolithic version
│   ├── data_processing.py    # Data preprocessing script
│   └── requirements.txt      # Python dependencies
└── Summary.docx              # Project summary
```

##  Getting Started

### Step 1: Setup Local Server
```bash
# Navigate to the project directory
cd /path/to/your/project_folder

# Start HTTP server
python3 -m http.server 8000
```

### Step 2: Open the Dashboard
Open your web browser and navigate to:
```
http://localhost:8000/index.html
```

## Dashboard Features

### 📊 Interactive Scatter Plot
- **X-axis**: Average Unit Price ($)
- **Y-axis**: Switchable metrics (see controls below)
- **Color coding**: Different countries
- **Point size**: Fixed 3px radius for clarity

###  Control Panel

#### 1. Y-Axis Metric Selector
Switch between different analytical views:
- **Total Quantity**: Volume of products sold
- **Total Sales**: Revenue generated ($)
- **Recency**: Days since last purchase (lower = more recent)
- **Frequency**: Number of purchase transactions
- **Monetary**: Total monetary value per product


#### 2. Point Density Slider
Control data point density to reduce visual clutter:
- **Slider range**: 1-10
- **"All points"**: Shows every data point
- **"Every 3rd point"**: Shows 1 out of every 3 points (default)
- **"Every 10th point"**: Shows 1 out of every 10 points

## Interactive Features

### Brush Selection

### Hover Tooltips



