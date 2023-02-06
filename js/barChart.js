var myChart = null;

//make rgb color
var colors = ['red','blue','green','yellow','orange','purple','pink','brown','grey','black']
var colorIndex = 0;

function createBarChart(protocolData, chartLabels) {
  var chartDataArray = getBarChartData(protocolData)
  var ctxB = document.getElementById("barChart").getContext('2d');
    myChart = new Chart(ctxB, {
      type: 'bar',
      data: {
        labels: chartLabels,
        datasets: chartDataArray
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    })
}

function addData(data, dataNr) {
  colorIndex = myChart.data.datasets.length;
  if(myChart.data.datasets[0].backgroundColor != null){
    myChart.data.datasets.push({
      label: dataNr,
      data: data,
      backgroundColor: colors[colorIndex++],
      borderWidth: 2
    })
  }
  else{
    myChart.data.datasets.push({
      label: dataNr,
      data: data,
      borderColor : colors[colorIndex++],
      borderWidth: 4
    })
  }
  myChart.update()
}

function getBarChartData(protocolData){
  colorIndex = 0;
  var chartDataArray = new Array();
  protocolData.forEach((dataMap, num) => {
    var chartData = new Array();
    dataMap.forEach(value => {chartData.push(value)})
    chartDataArray.push({
      label: num,
      data: chartData,
      backgroundColor: colors[colorIndex++],
      borderWidth: 2
    })
  })
  colorIndex = 0;
  return chartDataArray;
}

  function deleteRubric(properties){
    var propsToDelete = getPropsToDelete(properties)
    propsToDelete.forEach(prop => {
      if(myChart.data.labels.indexOf(prop) == -1) return;
      for(var i = 0; i < myChart.data.datasets.length; i++){
        myChart.data.datasets[i].data.splice(myChart.data.labels.indexOf(prop),1)
      }
      myChart.data.labels.splice(myChart.data.labels.indexOf(prop),1)
    })
    myChart.update()
  }

function addRubric(properties, data) {
  loadData(`http://localhost:${port}/files/${data}`).then(data => {
    var propsToAdd = getPropsToAdd(properties)
    var orderedData = parseDataInCorrOrder(data)
    var dataToAdd = getDataToAdd(propsToAdd, orderedData)
    propsToAdd.forEach(prop => {
      if (myChart.data.labels.indexOf(prop) != -1) return;
      myChart.data.labels.push(prop)
    })
    for (var i = 0; i < myChart.data.datasets.length; i++) {
      dataToAdd[i].forEach(value => {
        myChart.data.datasets[i].data.push(value)
      })
    }
    myChart.update()
  })
}

  function getPropsToDelete(properties){
    var propsToDelete = new Array();
    properties.split(',').forEach(prop => {
      if (!document.getElementById(prop).checked) {
        propsToDelete.push(prop);
      }
    })
    return propsToDelete;
  }

  function getPropsToAdd(properties){
    var propsToAdd = new Array();
    properties.split(',').forEach(prop => {
      if (document.getElementById(prop).checked && myChart.data.labels.indexOf(prop) == -1) {
        propsToAdd.push(prop);
      }
    })
    return propsToAdd;
  }

function getDataToAdd(propsToAdd, data) {
  var dataToAdd = new Array();
  data.forEach(dataset => {
    var dataSetToAdd  = new Array();
    dataset.forEach((valueMap, index) => {
      valueMap.forEach((value, key) => {
        propsToAdd.forEach(prop => {
          if (key == prop) {
            dataSetToAdd.push(value)
          }
        })
      })
    })
    dataToAdd.push(dataSetToAdd)
  })
  return dataToAdd;
}

  function hideBarChart() {
    if(document.getElementById('barChart') != null){
      document.getElementById('barChart').style.visibility = 'hidden';
    }
  }
  
  function showBarChart() {
    if(document.getElementById('barChart') != null){
      document.getElementById('barChart').style.visibility = 'visible';
    }
  }

  function deleteBarChart() {
    if(document.getElementById('barChart') != null){
      var elem = document.getElementById('barChart');
    elem.remove();
    }
  }