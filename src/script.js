// Global variables
let data = [];
let filteredData = [];
let currentYAxis = 'totalQty';
let currentCountryFilter = 'ALL';
let selectedPoints = [];
let currentDensity = 3;

// Chart dimensions - much larger chart
const margin = {top: 30, right: 200, bottom: 120, left: 100};
const width = 1400 - margin.left - margin.right; // Much wider
const height = 800 - margin.top - margin.bottom; // Much taller

// Color scale for countries
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

// Load and process data
d3.csv("../data/processed_retail_data.csv").then(function(csvData) {
    console.log("Data loaded successfully:", csvData.length, "rows");
    // Process the data
    data = csvData.map(d => ({
        StockCode: d.StockCode,
        Description: d.Description || 'N/A',
        avgPrice: +d.avgPrice,
        totalQty: +d.totalQty,
        totalSales: +d.totalSales,
        mainCountry: d.mainCountry,
        Recency: +d.Recency,
        frequency: +d.frequency,
        Monetary: +d.Monetary,
        firstPurchase: d.firstPurchase,
        lastPurchase: d.lastPurchase,
        uniqueCustomers: +d.uniqueCustomers
    }));
    
    // Populate country filter
    const countries = [...new Set(data.map(d => d.mainCountry))].sort();
    const countrySelect = d3.select("#countryFilter");
    countries.forEach(country => {
        countrySelect.append("option")
            .attr("value", country)
            .text(country);
    });
    
    // Initial render
    console.log("Starting initial render with", data.length, "data points");
    updateVisualization();
    
    // Set up event listeners
    d3.select("#yAxisSelect").on("change", function() {
        currentYAxis = this.value;
        updateVisualization();
        updateAnalyticalNotes();
    });
    
    d3.select("#countryFilter").on("change", function() {
        currentCountryFilter = this.value;
        updateVisualization();
    });
    
    // Density slider control
    d3.select("#densitySlider").on("input", function() {
        currentDensity = +this.value;
        d3.select("#densityValue").text(
            currentDensity === 1 ? "All points" : `Every ${currentDensity}${currentDensity === 2 ? 'nd' : currentDensity === 3 ? 'rd' : 'th'} point`
        );
        updateVisualization();
    });
    
    // Clear selection on Esc key
    d3.select("body").on("keydown", function(event) {
        if (event.key === "Escape") {
            clearSelection();
        }
    });
});

function updateVisualization() {
    console.log("updateVisualization called");
    // Filter data by country
    let baseData = currentCountryFilter === 'ALL' ? 
        data : data.filter(d => d.mainCountry === currentCountryFilter);
    
    // Sample data based on density slider
    if (currentDensity === 1) {
        filteredData = baseData; // Show all points
    } else {
        filteredData = baseData.filter((d, i) => i % currentDensity === 0);
    }
    
    console.log("Filtered data length:", filteredData.length);
    
    // Clear previous chart
    d3.select("#scatter-plot").selectAll("*").remove();
    
    // Create SVG
    const svg = d3.select("#scatter-plot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);
    
    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Add clipping path to ensure points stay within chart area
    svg.append("defs").append("clipPath")
        .attr("id", "chart-clip")
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height);
    
    // Set up scales - using linear scale with percentile-based domain
    const xExtent = d3.extent(filteredData, d => d.avgPrice);
    const yExtent = d3.extent(filteredData, d => d[currentYAxis]);
    
    // Use 95th percentile as max to avoid extreme outliers
    const xData = filteredData.map(d => d.avgPrice).sort((a,b) => a-b);
    const yData = filteredData.map(d => d[currentYAxis]).sort((a,b) => a-b);
    const x95 = d3.quantile(xData, 0.95);
    const y95 = d3.quantile(yData, 0.95);
    
    const xScale = d3.scaleLinear()
        .domain([0, x95])
        .range([0, width])
        .nice();
    
    const yScale = d3.scaleLinear()
        .domain([0, y95])
        .range([height, 0])
        .nice();
    
    // Fixed point size for all circles
    const fixedPointSize = 3;
    
    // Create axes with simple formatting for linear scale
    const xAxis = d3.axisBottom(xScale)
        .tickFormat(d => `$${d.toFixed(1)}`)
        .ticks(10);
    const yAxis = d3.axisLeft(yScale)
        .tickFormat(d => {
            if (d >= 1000) return `${(d/1000).toFixed(1)}k`;
            return Math.round(d).toString();
        })
        .ticks(10);
    
    g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis)
        .selectAll("text")
        .style("font-size", "12px");
    
    g.append("g")
        .call(yAxis)
        .selectAll("text")
        .style("font-size", "12px");
    
    // Add axis labels
    g.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + 80)
        .text("Average Unit Price ($)");
    
    const yLabels = {
        'totalQty': 'Total Quantity Sold',
        'totalSales': 'Total Sales ($)',
        'Recency': 'Recency - Days Since Last Purchase',
        'frequency': 'Purchase Frequency',
        'Monetary': 'Monetary Value ($)'
    };
    
    g.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -50)
        .text(yLabels[currentYAxis]);
    
    // Create brush
    const brush = d3.brush()
        .extent([[0, 0], [width, height]])
        .on("end", brushended);
    
    const brushGroup = g.append("g")
        .attr("class", "brush")
        .call(brush);
    
    // Create circles with controlled jitter to reduce overlap
    const circleContainer = g.append("g")
        .attr("clip-path", "url(#chart-clip)");
    
    const circles = circleContainer.selectAll(".dot")
        .data(filteredData)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => {
            // Add small random jitter but keep within bounds
            const baseX = xScale(d.avgPrice);
            const jitter = (Math.random() - 0.5) * 6;
            return Math.max(fixedPointSize, Math.min(width - fixedPointSize, baseX + jitter));
        })
        .attr("cy", d => {
            // Add small random jitter but keep within bounds
            const baseY = yScale(d[currentYAxis]);
            const jitter = (Math.random() - 0.5) * 6;
            return Math.max(fixedPointSize, Math.min(height - fixedPointSize, baseY + jitter));
        })
        .attr("r", fixedPointSize)
        .style("fill", d => colorScale(d.mainCountry))
        .style("fill-opacity", 0.4) // Even more transparent
        .style("stroke", "#333")
        .style("stroke-width", 0.2) // Even thinner stroke
        .style("stroke-opacity", 0.6)
        .on("mouseover", function(event, d) {
            showTooltip(event, d);
        })
        .on("mouseout", function() {
            hideTooltip();
        });
    
    // Update chart title
    d3.select("#chartTitle")
        .text(`Product Analysis: Average Price vs ${yLabels[currentYAxis]} (95th Percentile View)`);
    
    // Create legend
    const countries = [...new Set(filteredData.map(d => d.mainCountry))];
    const legend = g.selectAll(".legend")
        .data(countries)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(${width + 20}, ${i * 20 + 20})`);
    
    legend.append("circle")
        .attr("r", 6)
        .style("fill", d => colorScale(d));
    
    legend.append("text")
        .attr("x", 15)
        .attr("y", 0)
        .attr("dy", "0.35em")
        .style("font-size", "12px")
        .text(d => d);
    
    function brushended(event) {
        const selection = event.selection;
        if (!selection) {
            clearSelection();
            return;
        }
        
        const [[x0, y0], [x1, y1]] = selection;
        selectedPoints = filteredData.filter(d => {
            const x = xScale(d.avgPrice);
            const y = yScale(d[currentYAxis]);
            return x >= x0 && x <= x1 && y >= y0 && y <= y1;
        });
        
        updateSelectionInfo();
    }
}

function showTooltip(event, d) {
    const tooltip = d3.select("#tooltip");
    tooltip.transition()
        .duration(200)
        .style("opacity", 1);
    
    tooltip.html(`
        <strong>${d.StockCode}</strong><br/>
        ${d.Description}<br/>
        Country: ${d.mainCountry}<br/>
        Avg Price: $${d.avgPrice.toFixed(2)}<br/>
        ${getCurrentYAxisLabel()}: ${formatValue(d[currentYAxis])}<br/>
        Total Sales: $${d.totalSales.toFixed(2)}
    `)
    .style("left", (event.pageX + 10) + "px")
    .style("top", (event.pageY - 28) + "px");
}

function hideTooltip() {
    d3.select("#tooltip").transition()
        .duration(500)
        .style("opacity", 0);
}

function getCurrentYAxisLabel() {
    const labels = {
        'totalQty': 'Total Qty',
        'totalSales': 'Total Sales',
        'Recency': 'Recency',
        'frequency': 'Frequency',
        'Monetary': 'Monetary'
    };
    return labels[currentYAxis];
}

function formatValue(value) {
    if (currentYAxis === 'totalSales' || currentYAxis === 'Monetary') {
        return `$${value.toFixed(2)}`;
    }
    return value.toString();
}

function updateSelectionInfo() {
    const selectionInfo = d3.select("#selectionInfo");
    if (selectedPoints.length > 0) {
        selectionInfo.style("display", "block")
            .html(`<p><strong>${selectedPoints.length} products selected</strong> - Press Esc or click empty space to clear selection</p>`);
    } else {
        selectionInfo.style("display", "none");
    }
}

function clearSelection() {
    selectedPoints = [];
    updateSelectionInfo();
    d3.select(".brush").call(d3.brush().clear);
}

function updateAnalyticalNotes() {
    const notes = d3.select("#analyticalNotes");
    
    let content = "";
    if (currentYAxis === 'Recency') {
        content = `
            <h4>Price-Recency Analysis</h4>
            <p><strong>Upper Left:</strong> Low price, high recency → Outdated items, consider discontinuing or promoting</p>
            <p><strong>Upper Right:</strong> High price, high recency → Pricey niche items, consider markdown or limited editions</p>
            <p><strong>Lower Left:</strong> Low price, recent sales → Staples and essentials, good for bundling or cross-selling</p>
            <p><strong>Lower Right:</strong> High price, recent sales → Premium stars, exploit exclusivity or FOMO marketing</p>
        `;
    } else if (currentYAxis === 'frequency') {
        content = `
            <h4>Price-Frequency Analysis</h4>
            <p><strong>High frequency & low price:</strong> Replenishment staples, ideal for subscription models</p>
            <p><strong>High frequency & high price:</strong> Customers rely on pricey essentials, enhance VIP perks</p>
            <p><strong>Low frequency:</strong> Occasional purchases, target with seasonal or event-based promotions</p>
        `;
    } else if (currentYAxis === 'Monetary') {
        content = `
            <h4>Price-Monetary Analysis</h4>
            <p><strong>Low price, high revenue:</strong> Mass market winners, focus on volume and efficiency</p>
            <p><strong>High price, high revenue:</strong> Luxury cash cows, require careful inventory and experience management</p>
            <p><strong>High price, low revenue:</strong> One-off splurges, consider bundling or targeted marketing</p>
        `;
    } else if (currentYAxis === 'totalQty') {
        content = `
            <h4>Price-Quantity Analysis</h4>
            <p>Identify high price-low volume vs. low price-high volume items for pricing and promotion strategies.</p>
            <p>Compare country-wise clusters to infer market preferences and price sensitivity.</p>
        `;
    } else if (currentYAxis === 'totalSales') {
        content = `
            <h4>Price-Sales Analysis</h4>
            <p>Visualize the relationship between pricing strategy and revenue generation.</p>
            <p>Identify optimal price points for maximizing sales volume.</p>
        `;
    }
    
    notes.html(content);
}

// Initialize analytical notes
updateAnalyticalNotes();