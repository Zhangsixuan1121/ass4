// static/searchscript.js
let currentPage = 0;
const pageSize = 50;
let chart = null;
let total_pages = 0; // 声明此变量来储存总页数


function updateChart(cities, averageScores) {
    const ctx = document.getElementById('lineChart').getContext('2d');

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: cities,
            datasets: [{
                label: 'Average Score',
                data: averageScores,
                fill: false,
                borderColor: 'rgba(0, 123, 255, 1)',
                tension: 0.1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function submitForm() {
    const city = document.getElementById('cityName').value;
    const state = document.getElementById('stateName').value;
    const responseTimeElement = document.getElementById('responseTime');
    const form = document.getElementById('searchForm');
    const searchData = new URLSearchParams(new FormData(form));
    searchData.append('page', currentPage);  // 添加当前页码到表单数据中
    // JavaScript Fetch API 来异步获取数据
    fetch('/search2', {
        method: 'POST',
        body: searchData
    })
    .then(response => response.json())
    .then(data => {
        total_pages = data.total_pages; // 更新总页数
        // 更新响应时间
        responseTimeElement.textContent = data.elapsed_time_ms;
        // 获取当前页的城市名和对应的距离
        // const currentPageCities = data.cities.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
        // const currentPageDistances = data.distances.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
        // 调用函数来显示图表
        updateChart(data.cities, data.average_scores);
        updatePaginationControls(); // 更新分页控件状态
    });
}


function updatePaginationControls() {
    document.getElementById('prevPage').disabled = currentPage === 0;
    document.getElementById('nextPage').disabled = currentPage >= total_pages - 1;
}


// Implement pagination buttons
document.getElementById('prevPage').addEventListener('click', function() {
    if (currentPage > 0) {
        currentPage -= 1;
        submitForm();  // 提交表单以获取上一页数据
    }
});

document.getElementById('nextPage').addEventListener('click', function() {
    if (currentPage < total_pages - 1) {
        currentPage += 1;
        submitForm();  // 提交表单以获取下一页数据
    }
});


document.getElementById('searchForm').addEventListener('submit', function(e) {
    e.preventDefault();
    submitForm();
});


// 页面加载完成后，获取第一页的数据
document.addEventListener('DOMContentLoaded', function() {
    submitForm();
});