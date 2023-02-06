const searchWrapper = document.querySelector(".search-input");
const inputBox = searchWrapper.querySelector("input");
const suggBox = searchWrapper.querySelector(".autocom-box");
 
loadData(`http://localhost:${port}/files`).then(data => {
  var fileArray = Object.keys(data)
  inputBox.onkeyup = (e) => {
    let userData = e.target.value; //user enetered data
    let emptyArray = [];
    if (userData.length > 1) {
      emptyArray = fileArray.filter((data) => {
        return data.toLocaleLowerCase().includes(userData.toLocaleLowerCase());
      });
      emptyArray = emptyArray.map((data) => {
        return (data = `<li>${data}</li>`);
      });
      searchWrapper.classList.add("active");
      showSuggestions(emptyArray);
      let allList = suggBox.querySelectorAll("li");
      for (let i = 0; i < allList.length; i++) {
        allList[i].setAttribute("onclick", "select(this)");
      }
    }
    else {
      searchWrapper.classList.remove("active");
    }
  }
})

function select(element) {
  let selectData = element.textContent;
  inputBox.value = selectData;
  searchWrapper.classList.remove("active");
}

function showSuggestions(list) {
  let listData;
  if (!list.length) {
    listData = '<li>Keine Enträge gefunden!</li>';
  } else {
    listData = list.join('');
  }
  suggBox.innerHTML = listData;
}

