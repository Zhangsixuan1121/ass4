// static/searchscript.js
let chart = null;


function updateChart(clusteringResults) {
    const ctx = document.getElementById('barChart').getContext('2d');

    if (chart) {
        chart.destroy();
    }

    // 准备用于饼图的数据
    const data = {
        labels: [],
        datasets: [{
            data: [],
            backgroundColor: [],
            borderColor: [],
            borderWidth: 1
        }]
    };

    const citiesListByCluster = {}; // 建立一个对象来存储每个聚类的城市列表

    // 颜色数组，确保这个数组至少与聚类的个数相等
    const backgroundColors = [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)'
        // ...根据聚类数量扩展颜色
    ];
    const borderColors = [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
        // ...根据聚类数量扩展颜色
    ];

    // 遍历聚类结果，填充饼图数据
    Object.entries(clusteringResults).forEach(([clusterId, clusterInfo], index) => {
        const label = "spiritual word" + clusterId + "：" + clusterInfo.popular_words[0];
        data.labels.push(label);
        data.datasets[0].data.push(clusterInfo.total_population);
        // data.datasets[0].data.push(clusterInfo.total_population);
        // 根据索引给每个饼图部分分配颜色
        data.datasets[0].backgroundColor.push(backgroundColors[index % backgroundColors.length]);
        data.datasets[0].borderColor.push(borderColors[index % borderColors.length]);

        citiesListByCluster[label] = clusterInfo.cities_list;
    });

    // 创建饼图实例
    chart = new Chart(ctx, {
        type: 'pie',
        data: data,
        options: {
            responsive: true,  // 确保饼图响应式
            plugins: {
                legend: {
                    display: true  // 显示图例
                },
                tooltip: {
                    enabled: true,
                    callbacks: {
                        // 修改此处的回调函数以显示城市列表
                        afterLabel: function(context) {
                            const clusterLabel = context.label;
                            const citiesList = citiesListByCluster[clusterLabel];
                            const weightedAverageScore = clusteringResults[context.dataIndex].weighted_average_score;
                            const centerCity = clusteringResults[context.dataIndex].center_city;
                            // const index = context.dataIndex;
                            // // 从城市列表对象中获取城市数组
                            // const clusterId = context.chart.data.labels[index].split("：")[0].split(" ")[2];
                            // const citiesList = citiesListByCluster[clusterId];
                            // 显示前10个城市，后面加上省略号，如果列表超过10个
                            let tooltipText = [];
                            // 添加城市列表
                            tooltipText.push('Cities_list：' + citiesList.slice(0, 10).concat(citiesList.length > 10 ? ['...'] : []).join(', '));
                            // 添加权重平均分数
                            tooltipText.push('Weighted Average Score: ' + weightedAverageScore.toFixed(2)); // 保留两位小数
                            tooltipText.push('Center City: ' + centerCity);
                            return tooltipText;
                        }
                    }
                }
            }
        }
    });
}

function submitForm() {
    const classes = document.getElementById('classesInput').value;
    const k = document.getElementById('kInput').value;
    const words = document.getElementById('wordsInput').value;
    const responseTimeElement = document.getElementById('responseTime');
    const form = document.getElementById('searchForm');
    const searchData = new URLSearchParams(new FormData(form));

    fetch('/search3', {
        method: 'POST',
        body: searchData
    })
    .then(response => response.json())
    .then(data => {
        responseTimeElement.textContent = data.elapsed_time_ms;
        updateChart(data.clustering_results);
        updatePaginationControls(); // 更新分页控件状态
    });
}


// function updatePaginationControls() {
//     document.getElementById('prevPage').disabled = currentPage === 0;
//     document.getElementById('nextPage').disabled = currentPage >= total_pages - 1;
// }
//
//
// // Implement pagination buttons
// document.getElementById('prevPage').addEventListener('click', function() {
//     if (currentPage > 0) {
//         currentPage -= 1;
//         submitForm();  // 提交表单以获取上一页数据
//     }
// });
//
// document.getElementById('nextPage').addEventListener('click', function() {
//     if (currentPage < total_pages - 1) {
//         currentPage += 1;
//         submitForm();  // 提交表单以获取下一页数据
//     }
// });


document.getElementById('searchForm').addEventListener('submit', function(e) {
    e.preventDefault();
    submitForm();
});


// 页面加载完成后，获取第一页的数据
document.addEventListener('DOMContentLoaded', function() {
    submitForm();
});