var globalEntryCounter = 10;

/***************Displaying Data functions- Begin***************/

function displayAllProtocols(numberOfEntriesToShow) {
  loadData(`http://localhost:${port}/files`).then(data => {
    deleteBarChart();
    deleteLineChart();
    deleteChartDiv();
    clearTabs();
    clearBtns();
    numberOfEntriesToShow == undefined ? numberOfEntriesToShow = globalEntryCounter : numberOfEntriesToShow = numberOfEntriesToShow;
    var protocolID = 0;
    dataMap = new Map(Object.entries(data));
    var htmlString = `<h2>Liste der verfügbaren Protokolle: </h2>`+`<a><input type="checkbox" style="margin: 0rem 1.3rem;width:20px;height:20px" id="checkbox_allBoxes"` +
      `onclick="for(c in document.getElementsByName('box')) document.getElementsByName('box').item(c).checked = this.checked ">Alle Protokolle auswählen</a>`
    dataMap.forEach((key,value) => {
      htmlString += `<a id="protocol_${protocolID}" class="list-group-item list-group-item-danger">` +
        `<input type="checkbox" style="margin-right: 1rem;width:20px;height:20px" id="checkbox_${value}"` +
        ` name="box" value="${value}">${value}</a>`
      protocolID++;
    });
    htmlString += `<div style="margin-bottom: 70px;display:flex;justify-content:space-evenly"><button style="margin-right: 10px" type="button" class="btn btn-danger" onclick="getDataToDisplay('allProtocols')">Anzeigen</button>`+
      `<button style="margin-right:10px" type="button" class="btn btn-danger" onclick="showMoreEntries()">Mehr Einträge laden</button>`+
      `<button type="button" class="btn btn-danger" onclick="showLessEntries()">Weniger Einträge anzeigen</button>`
    document.getElementById('tableContent').innerHTML = htmlString;
    showNEntries(numberOfEntriesToShow)
  })
}

function displayModelsForClass(className, buttonId) {
  loadData(`http://localhost:${port}/awpClasses`).then(data => {
    var model = data[0][className];
    var htmlString = ''
    for (var i = 0; i < Object.keys(model).length; i++) {
      htmlString += `<a class="collapse-item border-bottom-success"` +
        `onclick="displayAllProtocolsForModel('${Object.keys(model)[i]}','${className}')">${Object.keys(model)[i]}</a>`
    }
    document.getElementById(buttonId).innerHTML = htmlString;
  })
}

function displayAllProtocolsForModel(modelName, className) {
  loadData(`http://localhost:${port}/files`).then(data => {
    loadData(`http://localhost:${port}/awpClasses`).then(regExr => {
      clearTable();
      deleteBarChart();
      clearBtns();
      deleteChartDiv();
      clearTabs();
      var htmlString = getProtocolsForModel(modelName,className, regExr,data)[0];
      var htmlHeadingString = getProtocolsForModel(modelName,className, regExr,data)[1];
      htmlString = checkIfProtocolsExistsForModel(modelName, className,htmlString);
      document.getElementById("tableContent").innerHTML = htmlString;
      document.getElementById('heading').innerHTML = htmlHeadingString;
      showNEntries(globalEntryCounter);
    })
  })
}

function displayCompareTable(dataToDisplay, fnToCall, tabNr, modelName, className) {
  loadData(`http://localhost:${port}/files/${dataToDisplay}`).then(data => {
    loadData(`http://localhost:${port}/properties`).then(props => {
      clearCompareTable();
      //clearTabs();
      document.getElementById('tableContent').style.display = 'block';
      var arrayOfdataMaps = parseDataInCorrOrder(data);
      var htmlString = `<thead id="tableHead"><tr id="properties">`
      htmlString += getRowNamesAndChartLabels(htmlString,props,tabNr)[0];
      htmlString += `</tr></thead><tbody id="tableBody">`
      htmlString = getTableAndChartData(htmlString, arrayOfdataMaps, tabNr)[0];
      var chartData = getTableAndChartData(htmlString, arrayOfdataMaps, tabNr)[1];
      var chartLabels = getRowNamesAndChartLabels(htmlString,props,tabNr)[1];
      var arrToSend = (new Array('Nr')).concat(Array.from(arrayOfdataMaps[0].get(tabNr).keys()));
      htmlString = addCheckboxesToTable(arrToSend, htmlString)[0];
      var numericProps = addCheckboxesToTable(arrToSend, htmlString)[1];
      createChartContainer(arrayOfdataMaps, tabNr, chartData, chartLabels);
      fnToCall == 'allProtocols' ? checkFnToCall(fnToCall, dataToDisplay, tabNr, numericProps) : checkFnToCall(fnToCall, dataToDisplay, tabNr, numericProps, modelName, className);
      checkIfExcelDataExists(arrayOfdataMaps, tabNr, htmlString);
      document.getElementById('tableContent').scrollWidth <= document.getElementById('tableContent').clientWidth ? document.getElementById('tableContent').style.display = 'inline-table' : null;
    })
  })
}

function showNEntries(numberOfEntriesToShow){
  for(var i = 0; i < document.getElementById('tableContent').children.length-3; i++){
    i < numberOfEntriesToShow ? document.getElementById(`protocol_${i}`).style.visibility = 'visible' : document.getElementById(`protocol_${i}`).style.display = 'none';
    document.getElementById(`protocol_${i}`).setAttribute('value','visible')
  }

}

function displayDropdownData(tabNr,numericProps) {
  loadData(`http://localhost:${port}/files`).then(data => {
    var htmlString = '';
    dataMap = new Map(Object.entries(data));
    var allFiles = Array.from(dataMap.keys());
    allFiles.forEach(key => {
      document.getElementById(`tr_${key}`) != null ? htmlString += `<li><a class="dropdown-item disabled">`+
      `<input type="checkbox"style="margin: 0rem 1.3rem;width:20px;height:20px" id="addDatasetBox_${key}">${key}</a></li>` :
      htmlString += `<li><a class="dropdown-item"><input type="checkbox"style="margin: 0rem 1.3rem;width:20px;height:20px"`+
      ` id="addDatasetBox_${key}">${key}</a></li>`
    })
    htmlString += `<button id="displayNewDataset" type="button" class="btn btn-info" onclick="addDatasetToTable('${tabNr}','${allFiles}','${numericProps}')">Hinzufügen</button>`
    document.getElementById('dropdownMenu').innerHTML = htmlString;
  })
}

/***************Displaying Data functions - End***************/

/***************Getting Data functions- Start***************/

function getDataToDisplay(fnToCall, modelName, className) {
  loadData(`http://localhost:${port}/files`).then(data => {
    if(document.querySelectorAll('input[name="box"]:checked').length == 0){
      alert('Bitte mindestens ein Protokoll auswählen!')
      return;
    }
    dataMap = new Map(Object.entries(data));
    var dataToDisplay = new Array();
    var checkedBoxes = document.querySelectorAll('input[name="box"]:checked');
    checkedBoxes.forEach(box => {
      box.offsetParent != null ? dataToDisplay.push(dataMap.get(box.value)) : null;
    })
    fnToCall == 'allProtocols' ? displayCompareTable(dataToDisplay.join(','),fnToCall,0) : displayCompareTable(dataToDisplay.join(','),fnToCall,0,modelName,className);
    addTabs(dataToDisplay.join(','),fnToCall, modelName,className);
  })
}

function getDataFromSearchBar(dataToDisplay) {
  checkJson(dataToDisplay) ? displayCompareTable(dataToDisplay, 'allProtocols', 0) : alert('Bitte gültige JSON-Datei eingeben!');
  clearTabs();
  addTabs(dataToDisplay,'allProtocols');
}

function getProtocolsForModel(modelName, className, regexp,data) {
  var classMap = new Map(Object.entries(regexp[0]))
  var htmlString = '<h2>Bitte wählen Sie eine Version aus der Liste</h2>' +
    `<a><input type="checkbox"style="margin: 0rem 1.3rem;width:20px;height:20px" id="checkbox_allBoxes"` +
    `onclick="for(c in document.getElementsByName('box')) document.getElementsByName('box').item(c).checked = this.checked">Alle Protokolle auswählen</a>`
  var htmlHeadingString = `<div id="pageContent" class="d-sm-flex align-items-center justify-content-between mb-4">` +
    `<h1 class="h3 mb-0 text-gray-800">Dashboard - ${className}</h1></div>`;
  htmlString = addCheckboxesToStr(classMap, htmlString,data,modelName,className);
  return [htmlString, htmlHeadingString];
}

function getExcelDataLength(arrayOfDataMaps){
  for(var i = 0; i < arrayOfDataMaps.length; i++){
    if(arrayOfDataMaps[i].get(0).size != 0){
      return arrayOfDataMaps[i].get(0).size;
    }
  }
}

function getTableAndChartData(htmlString,arrayOfdataMaps, tabNr){
  var chartData = new Map();
  arrayOfdataMaps.forEach(dataset => {
    var interruptBool = false;
    dataset.forEach((value, key) => {value.size==0 && tabNr == 0 ? interruptBool = true : null})
    htmlString += `<tr id="tr_${dataset.get(dataset.size - 1).get('modelNr')}"><td><b>${dataset.get(dataset.size - 1).get('modelNr')}<b></td>`
    var dataArray = new Array();
    if(interruptBool){
      for(var j = 0; j < getExcelDataLength(arrayOfdataMaps)-1; j++) htmlString += `<td> - </td>`;
    }
    else{
      dataset.get(tabNr).forEach((value, key) => {
        if (key == 'Nummer') return;
          htmlString += `<td>${value}</td>`
          key != 'Nummer' && key != 'Kunde' && key != 'LKW-Hersteller und Typ' && key != 'Wiegeart' && key != 'Datum' ? dataArray.push(value) : null;
      })
    }
    chartData.set(dataset.get(dataset.size-1).get('modelNr'), dataArray);
    if(htmlString == `<tr id="tr_${dataset.get(dataset.size - 1).get('modelNr')}"><td><b>${dataset.get(dataset.size - 1).get('modelNr')}<b></td>`){
      return [htmlString = '', chartData]
    }
    htmlString += `</tr>`
  })
  return [htmlString, chartData]
}

function getRowNamesAndChartLabels(htmlString, props, tabNr) {
  var chartLabels = new Array();
  var propMap = new Map();
  tabNr == 0 ? propMap = new Map(Object.entries(props[tabNr][0])) : propMap = props[tabNr]
  htmlString += `<th scope="col">Nr</th>`
  propMap.forEach((value, key) => {
    if (key == 'Nummer') return;
    if(isNaN(key)){
      value != '' && isNaN(key) ? htmlString += `<th scope="col">${key} [${value}]</th>` : htmlString += `<th scope="col">${key}</th>`
      key != 'Nummer' && key != 'Kunde' && key != 'LKW-Hersteller und Typ' && key != 'Wiegeart' && key != 'Datum' ? chartLabels.push(key) : null;
    }
    else{
      htmlString += `<th scope="col">${value}</th>`;
      key != 'Nummer' && key != 'Kunde' && key != 'LKW-Hersteller und Typ' && key != 'Wiegeart' && key != 'Datum' ? chartLabels.push(value) : null;
    } 
  })
  return [htmlString, chartLabels];
} 

function getNumericPropsFromArray(arr) {
  var numericProps = new Array();
  arr.forEach(value=>{
    if(!isNaN(value)){
      numericProps.push(value);
    }
  })
  return numericProps;
}

/***************Getting Data functions - End***************/

/***************Check functions - Start***************/

function checkFnToCall(fnToCall, data, tabNr, numericProps, modelName, className) {
  if (fnToCall == "allProtocols") {
    document.getElementById("pageContent").innerHTML += `<div id="btnContainer" style="display: flex;justify-content: center;">`+
    `<button style="margin: 2rem 2rem 2rem 0rem" type="button" id="deleteData" class="btn btn-info" onclick="deleteRubric('${numericProps}')">nicht markierte Daten löschen</button>` +
    `<button style="margin: 2rem 2rem 2rem 0rem" id="addData" type="button" class="btn btn-info" onclick="addRubric('${numericProps}','${data}')">markierte Daten einfügen</button>` +
      `<button id="reload" style="margin: 2rem 2rem 2rem 0rem;" type="button" class="btn btn-info" onclick="displayCompareTable('${data}','${fnToCall}',${tabNr})">reload Chart</button>` +
      `<button class="btn btn-info dropdown-toggle" type="button" id="dropdownMenuButton" onclick="displayDropdownData('${tabNr}','${numericProps}')" data-toggle="dropdown"`+
       `aria-haspopup="true" aria-expanded="false" style="margin: 2rem 2rem 2rem 0rem">Neuen Datensatz einfügen</button><ul id="dropdownMenu"`+
       `data-target="#dropdownMenu" class="dropdown-menu" aria-labelledby="dropdownMenuButton" style="overflow-y: scroll;max-height: 400px;"></ul>`+
      `<button style="margin: 2rem 2rem 2rem 0rem" id="backToHP" type="button" class="btn btn-info" onclick="displayAllProtocols()">zurück zur Startseite</button>`;
  }
  else if (fnToCall == "protocolsForModel") {
    document.getElementById("pageContent").innerHTML += `<div id="btnContainer" style="display: flex;justify-content: center;">`+
    `<button style="margin: 2rem 2rem 2rem 0rem" type="button" id="deleteData" class="btn btn-info" onclick="deleteRubric('${numericProps}')">nicht markierte Daten löschen</button>` +
    `<button style="margin: 2rem 2rem 2rem 0rem" id="addData" type="button" class="btn btn-info" onclick="addRubric('${numericProps}','${data}')">markierte Daten einfügen</button>` +
      `<button id="reload" style="margin: 2rem 2rem 2rem 0rem;" type="button" class="btn btn-info" onclick="displayCompareTable('${data}','${fnToCall}',${tabNr},'${modelName}','${className}')">reload Chart</button>` +
      `<button class="btn btn-info dropdown-toggle" type="button" id="dropdownMenuButton" onclick="displayDropdownData('${tabNr}','${numericProps}')" data-toggle="dropdown"`+
       `aria-haspopup="true" aria-expanded="false" style="margin: 2rem 2rem 2rem 0rem">Neuen Datensatz einfügen</button><ul id="dropdownMenu"`+
       `data-target="#dropdownMenu" class="dropdown-menu" aria-labelledby="dropdownMenuButton" style="overflow-y: scroll;max-height: 400px;"></ul>`+
      `<button style="margin: 2rem 2rem 2rem 0rem" id="backToHP" type="button" class="btn btn-info" onclick="displayAllProtocols('${modelName}','${className}')">zurück zu den Modellen</button>`;
  }
}

function checkIfBoxIsChecked(id) {
  return document.getElementById(id).checked;
}

function checkJson(input){
  try {
    JSON.parse(input);
    return true;
  } catch (error) {
    return false;
  }
}

function checkIfMapHasNumericKey(map){
  var bool = true
  map.forEach((value,key) => {
    var res = key.match(/(\d+)/)
    res == null ? bool = false : null;
  })
  return bool;
}

function checkIfProtocolsExistsForModel(modelName, className,htmlString) {
  return htmlString == '<h2>Bitte wählen Sie eine Version aus der Liste</h2>' +
  `<a><input type="checkbox"style="margin: 0rem 1.3rem;width:20px;height:20px" id="checkbox_allBoxes"` +
  `onclick="for(c in document.getElementsByName('box')) document.getElementsByName('box').item(c).checked = this.checked">Alle Protokolle auswählen</a>`
   ? htmlString = '<h4>Keine Protokolle für diese Bühne gefunden!</h4>' :
    htmlString += `<div style="margin-bottom: 70px;display:flex;justify-content:space-evenly"><button type="button" class="btn btn-danger" style="margin-right:10px" ` +
    `onclick="getDataToDisplay('protocolsForModel','${modelName}','${className}')">Anzeigen</button>`+
    `<button style="margin-right:10px" type="button" class="btn btn-danger" onclick="appendEntries()">Mehr Einträge laden</button>`+
    `<button type="button" class="btn btn-danger" onclick="removeEntries()">Weniger Einträge anzeigen</button></div>`
}

function checkIfExcelDataExists(arrayOfdataMaps,tabNr,htmlString){
  if (arrayOfdataMaps[0].get(0).size == 0 && tabNr == 0) {
    clearTable();
    clearNoDataFoundMsg();
    clearReloadBtn();
    clearDeleteDataBtn();
    clearAddDataBtn();
    deleteChartDiv();
    cleardropdownMenuButton();
    document.getElementById('tableContent').innerHTML = '<h4 id="noDataFound">Keine Excel-Daten gefunden!</h4>';
  }
  else {
    document.getElementById('tableContent').innerHTML = htmlString;
    document.getElementById('allBoxesBox').checked = true;
  }
}

function checkPropTypes(map){
  var bool = true;
  map.forEach((value,key) => {
    isNaN(value) ? bool = false : null;
  })
  return bool;
}

/***************Check functions - End***************/

/***************Add/Create functions - Start***************/

function addDatasetToTable(tabNr, allFiles, numericProps) {
  loadData(`http://localhost:${port}/files/${allFiles}`).then(data => {
    loadData(`http://localhost:${port}/properties`).then(props => {
      clearCompareTableCheckboxes();
      clearCompareTableCheckboxes();
      var htmlString = '';
      var checkedData = new Array();
      var checkedFiles = new Array();
      var excelDataLength = 0;
      var checkBoxesHtml = '';
      var orderedData = parseDataInCorrOrder(data);
      orderedData.forEach(dataset => {
        dataset.forEach((map, idx) => { parseMapKeysToNumber(map) });
        if (document.getElementById(`tr_${dataset.get(dataset.size - 1).get('modelNr')}`) != null) {
          checkedFiles.push(dataset.get(dataset.size - 1).get('modelNr'));
        }
        if (checkIfBoxIsChecked(`addDatasetBox_${dataset.get(dataset.size - 1).get('modelNr')}`)) {
          checkedData.push(dataset);
          checkedFiles.push(dataset.get(dataset.size - 1).get('modelNr'));
        }
      })
      htmlString = getTableAndChartData(htmlString, checkedData, parseInt(tabNr))[0];
      if (htmlString == '') {
        allFiles.split(',').forEach(file => { document.getElementById(`tr_${file}`) != null ? excelDataLength = document.getElementById(`tr_${file}`).childElementCount - 1 : null; })
        checkedData.forEach(dataset => {
          htmlString += `<tr id="tr_${dataset.get(dataset.size - 1).get('modelNr')}">`;
          for (var i = 0; i < excelDataLength; i++) {
            i == 0 ? htmlString += `<td><b>${dataset.get(dataset.size - 1).get('modelNr')}</b></td>` : htmlString += `<td> - </td>`;
          }
          htmlString += '</tr>';
        })
        tabNr == 0 ? htmlString = addCheckboxesToTable(Array.from(new Map(Object.entries(props[tabNr][0])).keys()), htmlString)[0] :
          htmlString = addCheckboxesToTable(props[tabNr], htmlString)[0];
      }
      else {
        checkBoxesHtml += addCheckboxesToTable(Array.from(checkedData[0].get(parseInt(tabNr)).keys()), checkBoxesHtml)[0];
      }
      document.getElementById('tableBody').innerHTML += htmlString;
      checkedData.forEach(dataset => {
        var dataNr = dataset.get(dataset.size - 1).get('modelNr');
        if (dataset.get(parseInt(tabNr)).has('Nummer')) dataset.get(parseInt(tabNr)).delete('Nummer');
        var numericData = getNumericPropsFromArray(Array.from(dataset.get(parseInt(tabNr)).values()));
        numericData.length != 0 ? addData(numericData, dataNr) : null;
      })
      document.getElementById('tableBody').innerHTML += checkBoxesHtml;
      clearBtns();
      getNumericPropsFromArray
      checkFnToCall('allProtocols', checkedFiles, tabNr, numericProps);
    })
  })
}

function addCheckboxesToTable(propData, htmlString) {
  var numericProps = new Array()
  propData.forEach(prop => { prop != 'Nummer' && prop != 'Kunde' && prop != 'LKW-Hersteller und Typ' && prop != 'Wiegeart' && prop != 'Datum' && prop != 'Nr' ? numericProps.push(prop) : null; })
  document.getElementById('table_checkboxes') == null ?  htmlString += `<tr id="table_checkboxes"><td><a><input  id="allBoxesBox"  type="checkbox" style="margin: 0rem 1.3rem;width:20px;height:20px"`+
  `onclick="for(c in document.getElementsByName('table_checkbox')) document.getElementsByName('table_checkbox').item(c).checked = this.checked">`+
  `check all</a></td>` : htmlString += `<tr id="table_checkboxes">`;
  propData.indexOf('Nr') != -1 ?  propData.splice(propData.indexOf('Nr'),1) : null;
  propData.indexOf('Nummer')!=-1 ? propData.splice(propData.indexOf('Nummer'),1) : null;
  propData.forEach(prop => {
    if (prop != 'Nummer' && prop != 'Kunde' && prop != 'LKW-Hersteller und Typ' && prop != 'Wiegeart' && prop != 'Datum') {
      htmlString += `<td><input type="checkbox" checked=true style="margin-right: 1rem;width:25px;height:25px" id="${prop}"`+
      ` name="table_checkbox" value=""></td>`
    }
    else {
      htmlString += `<td></td>`
    }
  })
  htmlString += `</tr>`
  return [htmlString, numericProps];
}

function addTabs(dataToDisplay, fnToCall, modelName, className) {
  loadData(`http://localhost:${port}/files/${dataToDisplay}`).then(data => {
    loadData(`http://localhost:${port}/tabNames`).then(tabNames => {
      var htmlString = `<ul class="nav nav-tabs" id="tabs_nav" role="tablist">`;
      htmlString += createTabs(data,dataToDisplay,fnToCall,modelName,className,tabNames,htmlString) + `</ul>`
      document.getElementById('tabs_nav_div').innerHTML += htmlString;
    })
  })
}

function addCheckboxesToStr(classMap, htmlString,data,modelName,className){
  var protocolID = 0;
  classMap.forEach((classValue, key) => {
    if (key == className) {
      var modelMap = new Map(Object.entries(classValue))                                         //convert matching class to map to make it iterable
      modelMap.forEach((modelValue, key) => {                                                     //iterate through models              
        if (key == modelName) {
          Object.values(data).forEach(file => {                                                              //iterate through files of the matching model               
            if (file.match(RegExp(modelValue)) != null) {
              htmlString += `<a id="protocol_${protocolID}" class="list-group-item list-group-item-danger">` +
                `<input type="checkbox" style="margin-right: 1rem;width:20px;height:20px" id="checkbox_${file.match(modelValue)[0]}"` +
                ` name="box" value="${file.match(modelValue)[0]}">${file.match(modelValue)[0]}</a>`
              protocolID++;
            }
          })
        }
      })
    }
  })
  return htmlString;
}

function createChartContainer(arrayOfdataMaps, tabNr, chartData, chartLabels){
  var chartContainer = document.getElementById('content').appendChild(document.createElement('div'));
  chartContainer.id = 'chartDiv';
  chartContainer.style = 'width: 60%; height: 60%;margin: 0 auto;';
  if (checkPropTypes(arrayOfdataMaps[0].get(tabNr))) {
    chartData.forEach((value, key) => { value == 0 ? chartData.delete(key) : null; })
    document.getElementById('chartDiv').innerHTML = `<canvas id="lineChart"></canvas>`;
    createLineChart(chartData, chartLabels);
    showLineChart();
  }
  else {
    chartData.forEach((value, key) => { value == 0 ? chartData.delete(key) : null; })
    document.getElementById('chartDiv').innerHTML = `<canvas id="barChart"></canvas>`;
    createBarChart(chartData, chartLabels);
    showBarChart();
  }
}

function createTabHTML(dataToDisplay, fnToCall, modelName, className, tabNr, tabName) {
  return fnToCall == 'allProtocols' ? `<li class="nav-item"><a class="nav-link" id="tab_${tabNr}" data-toggle="tab" onclick="displayCompareTable('${dataToDisplay}','allProtocols',${tabNr})" `+
  `role="tab" aria-controls="tabContent_${tabNr}" aria-selected="false">${tabName}</a></li>` : `<li class="nav-item"><a class="nav-link" id="tab_${tabNr}" data-toggle="tab"`+
  ` onclick="displayCompareTable('${dataToDisplay}','protocolsForModel',${tabNr},'${modelName}','${className}')" role="tab" aria-controls="tabContent_1" aria-selected="false">${tabName}</a></li>`
}

function createTabs(data, dataToDisplay, fnToCall, modelName, className,tabNames,htmlString) {
  var diverseTabsCnt = 0;
  htmlString += createTabHTML(dataToDisplay, fnToCall, modelName, className,0, 'EXCEL_PARAMS')
  for (var i = 1; i < data[0].length-1; i++) {
    var tabExpr = ''
    tabNames.forEach(tabName => {
      Object.keys(data[0][i])[0].match(tabName) ? tabExpr = tabName : null;
    })
    if(tabExpr == ''){
      diverseTabsCnt++;
      tabExpr = `Diverse ${diverseTabsCnt}`;
    }
    htmlString += createTabHTML(dataToDisplay, fnToCall, modelName, className, i, tabExpr);
  }
  return htmlString;
}

function showMoreEntries() {
  globalEntryCounter += 10;
  displayAllProtocols(globalEntryCounter);
}

function showLessEntries() {
  globalEntryCounter != 10 ? globalEntryCounter -= 10 : null;
  displayAllProtocols(globalEntryCounter);
}

/***************Add/Create functions - End***************/


/***************Manipulate data functions - Start***************/

function sortMap(a,b){
  var resA = a[0].match(/(\d+)/)
  var resB = b[0].match(/(\d+)/)
  if(resA[0] == null || resB[0] == null) return 0;
  return resA[0] - resB[0]
}

function parseDataInCorrOrder(data) {
  var dataMap = new Map(Object.entries(data));
  var arrayOfOrderedMaps = new Array();
  for(var i = 0; i < dataMap.size;i++){
    var orderedMap = new Map();
    orderedMap.set(0, new Map(Object.entries(dataMap.get(i.toString())[0])))
    for (var j = 1; j < dataMap.get(i.toString()).length; j++) {
      var tempMap = new Map(Object.entries(dataMap.get(i.toString())[j]));
      if (checkIfMapHasNumericKey(tempMap)) {
        tempMap = new Map([...tempMap.entries()].sort(sortMap));
      }
      orderedMap.set(j, tempMap);
    }
    arrayOfOrderedMaps.push(orderedMap)
  }
  return arrayOfOrderedMaps;
} 

function parseMapKeysToNumber(map) {
  var newMap = new Map();
  map.forEach((value, key) => {
    newMap.set(parseInt(key), value);
  })
  return newMap;
}

/***************Manipulate data functions - End***************/

/***************Clear/Delete functions - Start***************/

function clearTable() {
  document.getElementById('tableContent').innerHTML = '';
}

function deleteChartDiv() {
  if(document.getElementById('chartDiv') != null){
    document.getElementById('chartDiv').remove();
  }
}

function clearBtns(){
  clearDeleteDataBtn();
  clearReloadBtn();
  clearBackToHPBtn();
  clearAddDataBtn();
  cleardropdownMenuButton();
}

function clearDeleteDataBtn() {
  if(document.getElementById('deleteData') != null){
    document.getElementById('deleteData').remove();
  }
}

function clearReloadBtn() {
  if(document.getElementById('reload') != null){
    document.getElementById('reload').remove();
  }
}

function clearBackToHPBtn() {
  if(document.getElementById('backToHP') != null){
    document.getElementById('backToHP').remove();
  }
}

function clearAddDataBtn(){
  if(document.getElementById('addData') != null){
    document.getElementById('addData').remove();
  }
}

function cleardropdownMenuButton() {
  if(document.getElementById('dropdownMenuButton') != null){
    document.getElementById('dropdownMenuButton').remove();
    document.getElementById('dropdownMenu').remove();
  }
}

function clearTabs() {
  if(document.getElementById('tabs_nav') != null){
    document.getElementById('tabs_nav').remove();
  }
}

function clearNoDataFoundMsg() {
  if(document.getElementById('noDataFound') != null){
    document.getElementById('noDataFound').remove();
  }
}

function clearCompareTableCheckboxes(){
  if(document.getElementById('table_checkboxes') != null){
    document.getElementById('table_checkboxes').remove();
  }
}

function clearDropDownData(){
  if(document.getElementById('dropdownMenu') != null){
    document.getElementById('dropdownMenu').remove();
  }
}

function clearCompareTable() {
  clearTable();
  deleteBarChart();
  clearBtns();
  deleteChartDiv();
  clearNoDataFoundMsg();
}

/***************Clear/Delete functions - Start***************/

/***************Loading Data functions - Start***************/

function loadData(url){
  return fetch(url)
    .then(response => response.json())
}

/***************Loading Data functions - End***************/