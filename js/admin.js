const apiPath = 'yiren';
const url = 'https://livejs-api.hexschool.io/api/livejs/v1';
const token = 'lcRXvpHZUEatPTWCoCIGzpW2KC82';
const headersToken = {
  headers: {
    'Authorization': token
  }
};
const orderList = document.querySelector('.orderPage-table');
const discartAllBtn = document.querySelector('.discartAllBtn');
const orderStatus = document.querySelector('.orderStatus');
const modal = document.querySelector('.modal');
const orderDetailList = document.querySelector('.orderDetailList');

discartAllBtn.addEventListener('click', delAllOrder);
orderList.addEventListener('click', delOneOrder);
orderList.addEventListener('click', changeOrderStatus);


let orderData = [];
let piePrimarDark = "#5434A7";
let piePrimaryLighter = "#6e5aa3";
let piePrimarylight = "#9D7FEA";
let piePrimary = "#DACBFF";
let pieChartColor = [piePrimarDark,piePrimaryLighter,piePrimarylight,piePrimary];


init();

//#region 初始化
function init() {
  getOrderList();
}
//#endregion

//#region  取得訂單清單
function getOrderList(){
  axios.get(`${url}/admin/${apiPath}/orders`,headersToken)
    .then(function(response){
      orderData = response.data.orders;
      showOrderList();
      productsPieChart();
      productTypePieChart();
    })
    .catch(function(error){
      console.error(error);
    })
}
//#endregion

//#region 顯示訂單清單
function showOrderList(){
  orderData = orderData.sort(function (a, b) {
    return a.createdAt < b.createdAt ? 1 : -1;
   });
  let orderItem = `
    <thead>
      <tr>
        <th>訂單編號</th>
        <th>聯絡人</th>
        <th>聯絡地址</th>
        <th>電子郵件</th>
        <th>訂單品項</th>
        <th>訂單日期</th>
        <th>訂單狀態</th>
        <th>操作</th>
      </tr>
    </thead>
  `;
  if(orderData.length == 0){
    orderItem += `<tr><td colspan="8" class="h5 text-center">目前沒有訂單呦</td></tr>`;
    orderList.innerHTML = orderItem;
    return;
  }
  orderData.forEach(function(item, index){
    // 訂單時間轉換
    let orderDate = new Date(Number(item.createdAt*1000));
    orderDate = orderDate.toLocaleDateString("zh-TW");
    // 訂單狀態
    let orderStatus = item.paid ? '已處理' : '未處理';
    let orderStatusColor = orderStatus == '已處理'? 'orderDone': 'orderUndone';
    // 訂購產品項目
    let orderProducts = '';
    item.products.forEach(function(product){
      orderProducts += `<p>${product.title}</p>`;
    });

    orderItem += `
      <tr>
        <td>${item.id}</td>
        <td>
          <p>${item.user.name}</p>
          <p>${item.user.tel}</p>
        </td>
        <td>${item.user.address}</td>
        <td>${item.user.email}</td>
        <td>
          <button type="button" class="OrderDetailsBtn btn btn-primary" data-bs-toggle="modal" data-bs-target="#order" data-id="${index}">訂單明細</button>
        </td>
        <td class="text-center">${orderDate}</td>
        <td>
          <a href="#" data-orderID = "${item.id}" data-orderPaid = ${item.paid} class="orderStatus ${orderStatusColor}">${orderStatus}</a>
        </td>
        <td>
          <input type="button" class="delSingleOrder-Btn" value="刪除" data-jsControll="jsDelOneOrder" data-orderId="${item.id}">
        </td>
      </tr>
    `;
    orderList.innerHTML = orderItem;
  });

  // 綁定 訂單明細 按鈕
  let orderDetailsBtn = document.querySelectorAll('.OrderDetailsBtn');
  orderDetailsBtn.forEach(function(item){
    item.addEventListener('click', function(e){
      showOrderDetails(e);
    });
  });
}
//#endregion

//#region 顯示訂單明細
function showOrderDetails(e){
  let index = e.target.dataset.id;
  modal.id = `order${index}`;
  let strModalLi = '';
  let strSumary = '';
  let totalPrice = 0;

  orderData[index].products.forEach(function(item){
    strModalLi += `
      <tr>
        <td>${item.title}</td>
        <td class="text-center">${item.quantity}</td>
        <td class="text-end">NT ${item.price.toLocaleString()}</td>
      </tr>
    `;
    totalPrice += parseInt(orderData[index].total);
  });
  strSumary = `      
    <tr>
      <td class="text-end border-top" colspan="3">NT ${totalPrice.toLocaleString()}</td>
    </tr>
  `;
  orderDetailList.innerHTML = strModalLi + strSumary;
}
//#endregion


//#region 刪除單一訂單
function delOneOrder(e){
  if(e.target.getAttribute('data-jsControll') == 'jsDelOneOrder'){
    axios.delete(`${url}/admin/${apiPath}/orders/${e.target.getAttribute('data-orderId')}`, headersToken)
      .then(function(response){
        getOrderList();
        alert(`[ 已刪除 ] 訂單編號: ${e.target.getAttribute('data-orderId')}`);
      })
      .catch(function(error){
        console.error(error)
      })
  }
}
//#endregion

//#region 刪除全部訂單
function delAllOrder(){
  if(orderData.length == 0){
    alert("目前沒有訂單呦");
    return;
  }
  
  axios.delete(`${url}/admin/${apiPath}/orders`,headersToken)
    .then(function(response){
      getOrderList();
    })
    .catch(function(error){
      console.error(error)
    })
}
//#endregion

//#region 訂單處理狀況
function changeOrderStatus(e){
  e.preventDefault();
  
  if(e.target.classList.contains('orderStatus')){
    let orderID = e.target.getAttribute('data-orderID');
    let originalStatus = e.target.getAttribute('data-orderPaid');
    let newStatus;
    if(originalStatus == 'true'){
      newStatus = false;
    }else{
      newStatus = true;
    }
    let putData = {
      data: {
        "id": orderID,
        "paid": newStatus
      }
    }
    axios.put(`${url}/admin/${apiPath}/orders`, putData, headersToken)
      .then(function(response){
        getOrderList();
        alert('[ 已修改 ] 訂單修改完成囉~');
      })
      .catch(function(error){
        console.error(error)
      })
  }
}
//#endregion

//#region 圓餅圖 - 全品項
function productsPieChart(){
  let sellProducts = {};
  orderData.forEach(function(order){
    // 計算每個品項的總銷售金額
    order.products.forEach(function(product){
      if(sellProducts[product.title] == undefined){
        sellProducts[product.title] = product.price;
      }else{
        sellProducts[product.title] += product.price;
      }
    })
  });
  // 整理每個品項的銷售資訊
  let sellProductsList = [];
  Object.keys(sellProducts).forEach(function(item){
    let productItem = {
      title: item,
      totalPrice: sellProducts[item]
    };
    sellProductsList.push(productItem);
  });
  // 按照總銷售金額排序
  sellProductsList.sort(function(a,b){
    return a.totalPrice < b.totalPrice ? 1 : -1;
  }); 
  // 判斷產品數量是否大於2項
  let newSellProductsList = '';
  if(sellProductsList.length < 4){
    newSellProductsList = sellProductsList;
  }else{
    newSellProductsList = sellProductsList.filter(function(item,index){
      return index < 3;
    });
    let otherTotalPrice = 0;
    sellProductsList.forEach(function(item,index){
      if(index >= 3){
        otherTotalPrice += item.totalPrice;
      }
    });
    let otherProduct = {
      title: "其他品項",
      totalPrice: otherTotalPrice
    }
    newSellProductsList.push(otherProduct);
  }
  // 統整需要pie chart 需要的資料陣列
  let pieChartArray = [];
  newSellProductsList.forEach(function(item){
    let chartArray = [item.title, item.totalPrice];
    pieChartArray.push(chartArray);
  });

  c3.generate({
    bindto: '#productChart',
    data: {
        type: "pie",
        columns: pieChartArray,
        
    },
    color:{
      pattern: pieChartColor
  }
  });
}
//#endregion

//#region 圓餅圖 - 全品項類別
function productTypePieChart(){
  let sellProductType = {};
  orderData.forEach(function(order){
    // 計算每個品項的總銷售金額
    order.products.forEach(function(product){
      if(sellProductType[product.category] == undefined){
        sellProductType[product.category] = product.price;
      }else{
        sellProductType[product.category] += product.price;
      }
    })
  });
  let sellProductTypeList = [];
  Object.keys(sellProductType).forEach(function(item){
    let productType = {
      category: item,
      totalPrice: sellProductType[item]
    };
    sellProductTypeList.push(productType);
  });
  // 按照總銷售金額排序
  sellProductTypeList.sort(function(a,b){
    return a.totalPrice < b.totalPrice ? 1 : -1;
  }); 
  // 統整需要pie chart 需要的資料陣列
  let productTypePieChartArr = [];
  sellProductTypeList.forEach(function(item){
    let chartArray = [item.category, item.totalPrice];
    productTypePieChartArr.push(chartArray);
  });

  c3.generate({
    bindto: '#productTypeChart',
    data: {
        type: "pie",
        columns: productTypePieChartArr,
        
    },
    color:{
      pattern: pieChartColor
  }
  });
}
//#endregion