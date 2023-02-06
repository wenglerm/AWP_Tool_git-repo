var myChart = null;

var colors = ['red','blue','green','yellow','orange','purple','pink','brown','grey','black']
var colorIndex = 0;

function createLineChart(protocolData, chartLabels) {
  var chartDataArray = getLineChartData(protocolData)
  var ctxL = document.getElementById("lineChart").getContext('2d');
    myChart = new Chart(ctxL, {
      type: 'line',
      id: 'barChart',
      data: {
        labels: chartLabels,
        datasets: chartDataArray
      },
      options: {
        responsive: true,
      }
    })
}

function getLineChartData(protocolData){
  colorIndex = 0;
    var chartDataArray = new Array();
    protocolData.forEach((dataMap, num) => {
      var chartData = new Array();
      dataMap.forEach(value => {chartData.push(value)})
      chartDataArray.push({
        label: num,
        data: chartData,
        borderColor: colors[colorIndex++],
        borderWidth: 4
      })
    })
    colorIndex = 0;
    return chartDataArray;
  }

function hideLineChart() {
    if(document.getElementById('lineChart') != null){
        document.getElementById('lineChart').style.visibility = 'hidden';
    }
  }
  
  function showLineChart() {
    if(document.getElementById('lineChart') != null){
        document.getElementById('lineChart').style.visibility = 'visible';
    }
  }

  function deleteLineChart() {
    if(document.getElementById('lineChart')!= null){
        var elem = document.getElementById('lineChart');
        elem.remove();
    }
  }