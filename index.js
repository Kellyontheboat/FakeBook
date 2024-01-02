const BASE_URL = "https://user-list.alphacamp.io";
const USER_URL = BASE_URL + "/api/v1/users/"; //response.data.results是一個陣列
const userCell = document.querySelector(".user-data"); //使用者清單
const modalCard = document.querySelector(".modal-content");
const paginator = document.querySelector(".pagination");
const searchInput = document.querySelector("#search-input");
const searchBtn = document.querySelector("#search-btn");
const USERS_PER_PAGE = 12;

let filteredUsers = [];
const users = []; //從axios中擷取出來到全域
//let rawUserListHTML = ''
// let rawModalHTML = '' 移至renderModal不然會顯示歷史曾按下Modal

//拿到資料之後給renderUserList
axios
  .get(USER_URL)
  .then(function (response) {
    //const userData = response.data.results;
    users.push(...response.data.results);
    console.log(users);
    renderPagination(users);
    renderUserList(dataByPage(1));
  })
  .catch(function (error) {
    console.log(error);
  });

//從dataByPage(page)拿到每頁的資料。。。render到頁面上
function renderUserList(data) {
  let rawUserListHTML = "";
  data.forEach((item) => {
    //card中的每個項目都加上data-user-id="${item.id}"，確保後續只要點到card都可以順利渲染Modal
    //button more 綁上Modal
    rawUserListHTML += `
    <div class="card" style="width: 10rem;"data-user-id="${item.id}">
      <img src="${item.avatar}" class="card-img-top" alt="..." data-user-id="${item.id}">
      <div class="card-body" data-user-id="${item.id}">
      <p class="name" data-user-id="${item.id}">${item.name}</p>
      <button class="btn btn-primary btn-show-user" data-bs-toggle="modal" data-bs-target="#user-modal" data-user-id="${item.id}">     
        More
      </button>
      <button class="btn btn-info btn-add-favorite" data-user-id="${item.id}">+</button> 
      </div>
    </div>
    `;
  });
  userCell.innerHTML = rawUserListHTML;
}

//輸入特定頁碼：取得該頁user資料。。。得到每頁有哪12個user資訊
function dataByPage(page) {
  const data = filteredUsers.length ? filteredUsers : users;
  let startIndex = (page - 1) * USERS_PER_PAGE;
  return data.slice(startIndex, startIndex + USERS_PER_PAGE);
}

//輸入api資料：看共有幾筆資料，需要幾頁來分。。。得到總頁數 + render頁尾分頁
function renderPagination(data) {
  let page = Math.ceil(data.length / USERS_PER_PAGE);
  let rawPaginationHTML = "";
  for (let i = 1; i <= page; i++) {
    rawPaginationHTML += `
      <li class="page-item"><a class="page-link" href="#" data-page="${i}">${i}</a></li>
    `;
  }
  paginator.innerHTML = rawPaginationHTML;
}

//點擊特定頁碼：取得該頁user資料。。。用renderUserList(dataByPage(page))render每一頁
paginator.addEventListener("click", function onClickevent(event) {
  if (event.target.tagName !== "A") return;
  let page = Number(event.target.dataset.page);
  renderUserList(dataByPage(page));
});

//在user list上綁定監聽事件以彈出Modal + 加入喜愛清單
userCell.addEventListener("click", function clickOnCard(event) {
  let id = Number(event.target.dataset.userId);
  console.log(id);
  //因card中的每個項目都加上data-user-id="${item.id}",如果event.target.userId存在,表示有點到card
  //注意dataset如何選中userId，html用kebab，js用camel case，data-*去掉值並camel case*
  axios
    .get(USER_URL + id) // + "/" + id
    .then((response) => {
      const data = response.data; //牽涉response的變數先在這裡宣告
      console.log(data);
      if (event.target.classList.contains("btn-show-user")) {
        renderModal(data);
      }
      //從array中的物件尋找一個物件，這個物件的 id=target的id
      if (event.target.classList.contains("btn-add-favorite")) {
        console.log(id);
        addToFavorite(id);
      }
    });
});

function renderModal(data) {
  //let pressedData = users.find((data) => data.id === id);
  //需要確認已有拿到pressData 不然會typeError影響其他代碼
  let rawModalHTML = "";
  rawModalHTML += `<div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">${data.name}</h5>
      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
   </div>
    <div class="modal-body">
      <img src="${data.avatar}" class="card-img-top" alt="...">
      <p class="card-text">${data.name + " " + data.surname}</p>
      <p class="card-text">${data.email}</p>
      <p class="card-text">${data.gender}</p>
      <p class="card-text">${data.age}</p>
      <p class="card-text">${data.region}</p>
      <p class="card-text">${data.birthday}</p>
      <p class="card-text">${data.created_at}</p>
      <p class="card-text">${data.updated_at}</p>
    </div>
    `;
  modalCard.innerHTML = rawModalHTML;
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteUsers")) || [];

  if (list.some((user) => user.id === id)) {
    return alert("此使用者已在最愛清單中！");
  } else {
    list.push(users.find((user) => user.id === id));
    //const newFriend = list[(list.length-1)].name
    alert("已加入最愛清單！");
  }
  localStorage.setItem("favoriteUsers", JSON.stringify(list));
  console.log(list);
}

//輸入關鍵字搜尋含有特定關鍵字的名字的users
searchBtn.addEventListener("click", function onClickedSearch(event) {
  event.preventDefault();
  let keyword = searchInput.value.trim().toLowerCase();
  filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(keyword),
  );
  if (!keyword) {
    alert("請輸入關鍵字！")
  }
  if (filteredUsers.length === 0) {
    alert("找不到符合的使用者！");
  }
  renderPagination(filteredUsers);
  renderUserList(dataByPage(1));
});
