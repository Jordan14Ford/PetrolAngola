/*
* ANGOLAN OIL DASHBOARD JAVASCRIPT
* This file contains all the interactive functionality for the oil dashboard.
* It handles the map, charts, and data updates.
*/

// Wait for the page to fully load before running any code
document.addEventListener('DOMContentLoaded', function() {
    // Set up Chart.js with a dark theme for better visibility
    Chart.defaults.color = '#a0a0a0';  // Light gray text
    Chart.defaults.borderColor = '#333333';  // Dark borders
    
    // Create the product distribution chart (doughnut chart)
    const productCtx = document.getElementById('productChart').getContext('2d');
    const productChart = new Chart(productCtx, {
        type: 'doughnut',  // Circular chart with a hole in the middle
        data: {
            labels: ['Product A', 'Product B', 'Product C', 'Product D'],  // Product names
            datasets: [{
                data: [400, 300, 200, 100],  // Amount of each product
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',   // Pink
                    'rgba(54, 162, 235, 0.8)',   // Blue
                    'rgba(255, 206, 86, 0.8)',   // Yellow
                    'rgba(75, 192, 192, 0.8)'    // Teal
                ],
                borderColor: '#242424',  // Dark border
                borderWidth: 2  // Border thickness
            }]
        },
        options: {
            responsive: true,  // Chart will resize with window
            maintainAspectRatio: false,  // Allow custom height
            plugins: {
                legend: {
                    position: 'bottom',  // Legend at bottom
                    labels: {
                        color: '#a0a0a0',  // Light gray text
                        padding: 20,  // Space around labels
                        font: {
                            family: 'Inter'  // Use Inter font
                        }
                    }
                }
            }
        }
    });

    // Set up event listeners for the filter controls
    document.getElementById('dateRange').addEventListener('change', updateDashboard);
    document.getElementById('metric').addEventListener('change', updateDashboard);

    // Function to update the dashboard when filters change
    function updateDashboard() {
        // This function will update all charts and data when filters change
        console.log('Dashboard updated');
    }

    // Initialize the dashboard with default data
    updateDashboard();

    // Set up the map centered on Angola
    let map = L.map('geologicalMap', {
        center: [-8.8383, 13.2344],  // Angola's coordinates
        zoom: 6,  // Initial zoom level
        zoomControl: false,  // We'll add custom controls
        minZoom: 4,  // Can't zoom out too far
        maxZoom: 18  // Can't zoom in too close
    });

    // Add zoom controls to the top right of the map
    L.control.zoom({
        position: 'topright'
    }).addTo(map);

    // Add the base map layer (light theme for better visibility)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors, © CARTO',  // Required attribution
        maxZoom: 19  // Maximum zoom level
    }).addTo(map);

    // Force the map to resize after initialization
    // This fixes any sizing issues
    setTimeout(() => {
        map.invalidateSize();
    }, 100);

    // Sample data for oil wells (replace with real data later)
    const wells = [
        { 
            id: 1, 
            lat: -8.8383, 
            lng: 13.2344, 
            production: 5000,  // barrels per day
            depth: 2500,      // meters
            formation: 'Tertiary', 
            status: 'active' 
        },
        { 
            id: 2, 
            lat: -9.5, 
            lng: 14.5, 
            production: 3000, 
            depth: 1800, 
            formation: 'Cretaceous', 
            status: 'active' 
        },
        { 
            id: 3, 
            lat: -7.5, 
            lng: 12.5, 
            production: 4000, 
            depth: 2200, 
            formation: 'Jurassic', 
            status: 'maintenance' 
        },
        { 
            id: 4, 
            lat: -8.2, 
            lng: 13.8, 
            production: 3500, 
            depth: 2100, 
            formation: 'Tertiary', 
            status: 'active' 
        },
        { 
            id: 5, 
            lat: -9.1, 
            lng: 13.2, 
            production: 4200, 
            depth: 2300, 
            formation: 'Cretaceous', 
            status: 'active' 
        }
    ];

    // Create octagon markers for each well
    const wellMarkers = wells.map(well => {
        // Create an octagon shape for the well marker
        const marker = L.polygon(createOctagon(well.lat, well.lng, 0.1), {
            color: well.status === 'active' ? '#28a745' : '#ffc107',  // Green for active, yellow for maintenance
            fillColor: well.status === 'active' ? '#28a745' : '#ffc107',
            fillOpacity: 0.7,  // Slightly transparent
            weight: 2  // Border thickness
        });

        // Add a popup with well information
        marker.bindPopup(`
            <div class="well-popup">
                <h3>Well #${well.id}</h3>
                <div class="well-details">
                    <p><strong>Production:</strong> ${well.production} bbl/day</p>
                    <p><strong>Depth:</strong> ${well.depth}m</p>
                    <p><strong>Formation:</strong> ${well.formation}</p>
                    <p><strong>Status:</strong> <span class="status-${well.status}">${well.status}</span></p>
                </div>
            </div>
        `);

        return marker;
    });

    // Add all well markers to the map
    const wellLayer = L.layerGroup(wellMarkers).addTo(map);

    // Create data for the heatmap
    const heatmapData = wells.map(well => ({
        lat: well.lat,
        lng: well.lng,
        intensity: well.production / 1000  // Normalize production for heatmap
    }));

    // Create the heatmap layer
    let heatmapLayer = L.heatLayer(heatmapData, {
        radius: 25,  // Size of heat spots
        blur: 15,    // Blur effect
        maxZoom: 10, // Maximum zoom level for heatmap
        gradient: {  // Color gradient for heat intensity
            0.4: '#ffc107',  // Yellow
            0.6: '#ff9800',  // Orange
            0.8: '#ff5722',  // Deep Orange
            1.0: '#f44336'   // Red
        }
    });

    // Function to create octagon points for well markers
    function createOctagon(lat, lng, size) {
        const points = [];
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;  // Divide circle into 8 parts
            points.push([
                lat + size * Math.sin(angle),  // Calculate latitude
                lng + size * Math.cos(angle)   // Calculate longitude
            ]);
        }
        return points;
    }

    // Handle window resize to keep map working properly
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            map.invalidateSize();  // Update map size
        }, 250);  // Wait 250ms after resize stops
    });

    // Set up map control buttons
    document.getElementById('toggleHeatmap').addEventListener('click', function() {
        if (map.hasLayer(heatmapLayer)) {
            map.removeLayer(heatmapLayer);  // Hide heatmap
            this.classList.remove('active');
        } else {
            map.addLayer(heatmapLayer);  // Show heatmap
            this.classList.add('active');
        }
    });

    document.getElementById('toggleWells').addEventListener('click', function() {
        if (map.hasLayer(wellLayer)) {
            map.removeLayer(wellLayer);  // Hide well markers
            this.classList.remove('active');
        } else {
            map.addLayer(wellLayer);  // Show well markers
            this.classList.add('active');
        }
    });

    // Create the production trends chart
    const ctx = document.getElementById('productionChart').getContext('2d');
    const productionChart = new Chart(ctx, {
        type: 'line',  // Line chart
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],  // Months
            datasets: [{
                label: 'Daily Production (bbl)',  // Chart title
                data: [4500, 4800, 5200, 4900, 5100, 5300],  // Production data
                borderColor: '#0066cc',  // Blue line
                backgroundColor: 'rgba(0, 102, 204, 0.1)',  // Light blue fill
                tension: 0.4,  // Smooth line
                fill: true  // Fill area under line
            }]
        },
        options: {
            responsive: true,  // Chart will resize with window
            maintainAspectRatio: false,  // Allow custom height
            plugins: {
                legend: {
                    position: 'top',  // Legend at top
                }
            },
            scales: {
                y: {
                    beginAtZero: true,  // Start y-axis at 0
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'  // Light grid lines
                    }
                },
                x: {
                    grid: {
                        display: false  // No vertical grid lines
                    }
                }
            }
        }
    });

    // Function to update statistics on the dashboard
    function updateStats() {
        // Update active wells count
        document.getElementById('activeWells').textContent = wells.length;
        
        // Calculate and update total production
        document.getElementById('totalProduction').textContent = 
            wells.reduce((sum, well) => sum + well.production, 0) + ' bbl';
        
        // Calculate and update average depth
        document.getElementById('avgDepth').textContent = 
            Math.round(wells.reduce((sum, well) => sum + well.depth, 0) / wells.length) + ' m';
        
        // Update success rate (hardcoded for now)
        document.getElementById('successRate').textContent = '85%';
    }

    // Initialize the dashboard with current statistics
    updateStats();
}); 