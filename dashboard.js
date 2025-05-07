document.addEventListener('DOMContentLoaded', function() {
    // Set Chart.js default configuration for dark theme
    Chart.defaults.color = '#a0a0a0';
    Chart.defaults.borderColor = '#333333';
    
    // Initialize Product Distribution Chart
    const productCtx = document.getElementById('productChart').getContext('2d');
    const productChart = new Chart(productCtx, {
        type: 'doughnut',
        data: {
            labels: ['Product A', 'Product B', 'Product C', 'Product D'],
            datasets: [{
                data: [400, 300, 200, 100],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)'
                ],
                borderColor: '#242424',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#a0a0a0',
                        padding: 20,
                        font: {
                            family: 'Inter'
                        }
                    }
                }
            }
        }
    });

    // Event Listeners for Filters
    document.getElementById('dateRange').addEventListener('change', updateDashboard);
    document.getElementById('metric').addEventListener('change', updateDashboard);

    function updateDashboard() {
        // Add your dashboard update logic here
        // This function will be called when filters change
        console.log('Dashboard updated');
    }

    // Initialize with default data
    updateDashboard();

    // Initialize the map with proper sizing
    let map = L.map('geologicalMap', {
        center: [-8.8383, 13.2344], // Angola's coordinates
        zoom: 6,
        zoomControl: false, // We'll add custom controls
        minZoom: 4,
        maxZoom: 18
    });

    // Add zoom control to the top right
    L.control.zoom({
        position: 'topright'
    }).addTo(map);

    // Add the base map layer with a more professional style
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors, © CARTO',
        maxZoom: 19
    }).addTo(map);

    // Force map to resize after initialization
    setTimeout(() => {
        map.invalidateSize();
    }, 100);

    // Sample data for wells (replace with real data)
    const wells = [
        { id: 1, lat: -8.8383, lng: 13.2344, production: 5000, depth: 2500, formation: 'Tertiary', status: 'active' },
        { id: 2, lat: -9.5, lng: 14.5, production: 3000, depth: 1800, formation: 'Cretaceous', status: 'active' },
        { id: 3, lat: -7.5, lng: 12.5, production: 4000, depth: 2200, formation: 'Jurassic', status: 'maintenance' },
        { id: 4, lat: -8.2, lng: 13.8, production: 3500, depth: 2100, formation: 'Tertiary', status: 'active' },
        { id: 5, lat: -9.1, lng: 13.2, production: 4200, depth: 2300, formation: 'Cretaceous', status: 'active' }
    ];

    // Create octagon markers for wells with status-based styling
    const wellMarkers = wells.map(well => {
        const marker = L.polygon(createOctagon(well.lat, well.lng, 0.1), {
            color: well.status === 'active' ? '#28a745' : '#ffc107',
            fillColor: well.status === 'active' ? '#28a745' : '#ffc107',
            fillOpacity: 0.7,
            weight: 2
        });

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

    // Add markers to map
    const wellLayer = L.layerGroup(wellMarkers).addTo(map);

    // Create heatmap data
    const heatmapData = wells.map(well => ({
        lat: well.lat,
        lng: well.lng,
        intensity: well.production / 1000 // Normalize for heatmap
    }));

    // Initialize heatmap layer
    let heatmapLayer = L.heatLayer(heatmapData, {
        radius: 25,
        blur: 15,
        maxZoom: 10,
        gradient: {
            0.4: '#ffc107',
            0.6: '#ff9800',
            0.8: '#ff5722',
            1.0: '#f44336'
        }
    });

    // Function to create octagon points
    function createOctagon(lat, lng, size) {
        const points = [];
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            points.push([
                lat + size * Math.sin(angle),
                lng + size * Math.cos(angle)
            ]);
        }
        return points;
    }

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            map.invalidateSize();
        }, 250);
    });

    // Map control event listeners
    document.getElementById('toggleHeatmap').addEventListener('click', function() {
        if (map.hasLayer(heatmapLayer)) {
            map.removeLayer(heatmapLayer);
            this.classList.remove('active');
        } else {
            map.addLayer(heatmapLayer);
            this.classList.add('active');
        }
    });

    document.getElementById('toggleWells').addEventListener('click', function() {
        if (map.hasLayer(wellLayer)) {
            map.removeLayer(wellLayer);
            this.classList.remove('active');
        } else {
            map.addLayer(wellLayer);
            this.classList.add('active');
        }
    });

    // Initialize Chart.js for production trends
    const ctx = document.getElementById('productionChart').getContext('2d');
    const productionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Daily Production (bbl)',
                data: [4500, 4800, 5200, 4900, 5100, 5300],
                borderColor: '#0066cc',
                backgroundColor: 'rgba(0, 102, 204, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });

    // Update statistics
    function updateStats() {
        document.getElementById('activeWells').textContent = wells.length;
        document.getElementById('totalProduction').textContent = 
            wells.reduce((sum, well) => sum + well.production, 0) + ' bbl';
        document.getElementById('avgDepth').textContent = 
            Math.round(wells.reduce((sum, well) => sum + well.depth, 0) / wells.length) + ' m';
        document.getElementById('successRate').textContent = '85%';
    }

    // Initialize the dashboard
    updateStats();
}); 