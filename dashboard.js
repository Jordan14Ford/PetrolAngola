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
}); 