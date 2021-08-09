const apiPath = 'yiren';
const url = 'https://livejs-api.hexschool.io/api/livejs/v1';

const productList = document.querySelector('.jsProductList');
const productSelect = document.querySelector('.jsProductSelect');
const cartList = document.querySelector('.jsCartList');
const orderInfoBtn = document.querySelector('.jsOrderInfoBtn'); 
const addminLogin = document.querySelector('.jsAdminLogin');


productSelect.addEventListener('change',filterProduct);
productList.addEventListener('click',addToCart);
cartList.addEventListener('click', delAllCartList);
cartList.addEventListener('click', delCartItem);
cartList.addEventListener('click', updateItemCount);
orderInfoBtn.addEventListener('click', sendOrder);
addminLogin.addEventListener('click', adminValiation);


let productData = [];
let cartData = [];
let totalPrice = '';

init();

function init(){
  getProductList();
  getCartList();
}

//#region 取得產品列表
function getProductList(){
  axios.get(`${url}/customer/${apiPath}/products`)
    .then(function (response) {
      productData = response.data.products;
      showProductList();
    })
    .catch(function(error){
      console.error(error);
    })
}
//#endregion

//#region 顯示產品列表
function showProductList(){
  let productItem = '';
  productData.forEach(function(item){
    productItem += `
      <li class="productCard col-md-3">
        <h4 class="productType">新品</h4>
        <img src="${item.images}" alt="">
        <input class="addCardBtn" type="submit" value="加入購物車" data-productId="${item.id}">
        <h3 class="fontSizeM">${item.title}</h3>
        <del class="fontSizeM">NT$${(item.origin_price).toLocaleString()}</del>
        <p class="fontSizeXL fw-bold">NT$${(item.price).toLocaleString()}</p>
      </li>
    `;
  });
  productList.innerHTML = productItem;
}
//#endregion

//#region 篩選產品列表
function filterProduct(e){
  let category = e.target.value;
  if(category == '全部'){
    showProductList();
  }else{
    let productItem = '';
    productData.forEach(function(item){
      if(item.category == category){
        console.log(category);
        productItem += `
        <li class="productCard col-md-3">
          <h4 class="productType">新品</h4>
          <img src="${item.images}" alt="">
          <input class="addCardBtn" type="submit" value="加入購物車" data-productId="${item.id}">
          <h3 class="fontSizeM">${item.title}</h3>
          <del class="fontSizeM">NT$${(item.origin_price).toLocaleString()}</del>
          <p class="fontSizeXL fw-bold">NT$${(item.price.toLocaleString())}</p>
        </li>
        `;
      }
    });
    productList.innerHTML = productItem;
  }
}
//#endregion

//#region 取得購物車品項
function getCartList(){
  axios.get(`${url}/customer/${apiPath}/carts`)
    .then(function(response){
      cartData = response.data.carts;
      totalPrice = (response.data.finalTotal).toLocaleString();
      showCartList();
    })
    .catch(function(error){
      console.error(error);
    })
}
//#endregion

//#region 顯示購物車品項
function showCartList(){
  if(cartData.length == 0){
    let cartItems = `<p class="text-center">您的購物車是空的呦~</p>`;
    cartList.innerHTML = cartItems;
    return;
  }
  let cartItems = `
    <tr>
      <th width="45%">品項</th>
      <th width="15%">單價</th>
      <th width="20%">數量</th>
      <th width="10%">金額</th>
      <th width="10%"></th>
    </tr>
  `;
  cartData.forEach(function(item){
    cartItems += `
    <tr>
      <td>
        <div class="cardItem-title">
          <img src="${item.product.images}" alt="">
          <p>${item.product.title}</p>
        </div>
      </td>
      <td>NT$${(item.product.price.toLocaleString())}</td>
      <td>
        <div class="d-flex align-itmes-center mr-3">
        ${item.quantity == 1? `<button type="button" data-cartId="${item.id}" data-btn="delItemCountBtn" class="ItemCountBtn" disabled>–</button>`:`<button type="button" data-cartId="${item.id}" data-btn="delItemCountBtn" class="ItemCountBtn">–</button>`}
        <p class="mx-2 p-2" id="${item.id}">${item.quantity}</p>
        <button type="submit" data-cartId="${item.id}" data-btn="addItemCountBtn" class="ItemCountBtn">+</button>
      </div>
      </td>
      <td>NT$${(item.quantity*item.product.price).toLocaleString()}</td>
      <td class="text-end">
        <button class="delCartItemBtn" data-productId="${item.id}" data-jsControll="jsDelCartItemBtn">X</button>
      </td>
    </tr>
    `;

  });
  cartItems += `
    <tr>
      <td>
        <button class="delAllCartItemBtn" data-jsControll="jsDelAllCartItemBtn">刪除所有品項</button>
      </td>
      <td></td>
      <td></td>
      <td>
        <p>總金額</p>
      </td>
      <td>NT$${totalPrice}</td>
    </tr>
  `;
  cartList.innerHTML = cartItems; 
}
//#endregion

//#region 加入購物車
function addToCart(e){
  if(e.target.getAttribute('class') == 'addCardBtn'){
    let addItemQuantity = 1;
    cartData.forEach(function(item){
      if(e.target.getAttribute('data-productId') == item.product.id){
        addItemQuantity += item.quantity;
        alert('[ 商品數量修改成功 ] 購物車商品數量已修改~');
      }
    });
    
    let addItem = {
      data: {
        "productId": e.target.getAttribute('data-productId'),
        "quantity": addItemQuantity
      }
    };
    axios.post(`${url}/customer/${apiPath}/carts` , addItem)
      .then(function(response){
        getCartList();
      })
  }
}
//#endregion

//#region 修改購物車商品數量
function updateItemCount(e){
  let itemId = e.target.getAttribute('data-cartId');
  let itemQuantity = Number(document.getElementById(`${itemId}`).textContent);

  // 增加產品數量
  if(e.target.getAttribute('data-btn') == 'addItemCountBtn'){
    itemQuantity += 1;
  }
  // 減少產品數量
  if(e.target.getAttribute('data-btn') == 'delItemCountBtn'){
    if(itemQuantity > 1){
      itemQuantity -= 1;
    }   
  }
  // patch 資料
  let updateItem = {
    data: {
      "id": itemId,
      "quantity": itemQuantity
    }
  };
  axios.patch(`${url}/customer/${apiPath}/carts` , updateItem)
  .then(function(response){
    getCartList();    
  }) 
}
//#endregion


//#region 刪除購物車單品項
function delCartItem(e){
  if(e.target.getAttribute('data-jsControll') == 'jsDelCartItemBtn'){
    axios.delete(`${url}/customer/${apiPath}/carts/${e.target.getAttribute('data-productId')}`)
      .then(function(response){
        getCartList();
      })
      .catch(function(error){
        console.error(error)
      })
  }
}

//#endregion

//#region 刪除購物車所有品項
function delAllCartList(e){
  if(e.target.getAttribute('data-jsControll') == 'jsDelAllCartItemBtn'){
    if(cartData.length == 0){
      alert('您的購物車是空的呦');
      return;
    }
    axios.delete(`${url}/customer/${apiPath}/carts`)
      .then(function(response){
        getCartList();
        alert('[ 已清空購物車 ] 購物車商品已全部移除~ ');
      })
      .catch(function(error){
        console.error(error)
      })
  }
}
//#endregion

//#region 送出訂單
function sendOrder(){
  if(cartData.length == 0){
    alert('購物車還是空的呦!');
    return;
  };
  formValiation();
  let customerName = document.querySelector('#customerName').value;
  let customerPhone = document.querySelector('#customerPhone').value;
  let customerEmail = document.querySelector('#customerEmail').value;
  let customerAddress = document.querySelector('#customerAddress').value;
  let customerPayment = document.querySelector('#customerPayment').value;
  
  let customerOrder = {
    "data": {
      "user": {
        "name": customerName,
        "tel": customerPhone,
        "email": customerEmail,
        "address": customerAddress,
        "payment": customerPayment
      }
    }
  };
  alert('訂單建立成功囉!');
  axios.post(`${url}/customer/${apiPath}/orders`, customerOrder)
    .then(function(response){
      window.location.reload();
    })
}
//#endregion

//#region 表單驗證
function formValiation(){
  const customerInputs = document.querySelectorAll("input[name],select[data=payment]");
  const customerForm = document.querySelector(".orderInfo-form");
  const constraints = {
    姓名: {
      presence: {
        message: "必填"
      }
    },
    手機號碼: {
      presence: {
        message: "必填"
      },
      length: {
        is: 10,
        message: "輸入錯誤"
      }
    },
    信箱: {
      presence: {
        message: "必填"
      },
      email: {
        message: "格式錯誤"
      }
    },
    寄送地址: {
      presence: {
        message: "必填"
      }
    },
    付款方式: {
      presence: {
        message: "必填"
      }
    },
  };
  customerInputs.forEach((item) => {
    item.nextElementSibling.textContent = '';
      let errors = validate(customerForm, constraints) || '';
      if (errors) {
        Object.keys(errors).forEach(function (keys) {
          document.querySelector(`[data-message="${keys}"]`).textContent = errors[keys];
        })
      }
  });
}
//#endregion

//#region 管理員登入驗證
function adminValiation(){
  const adminAccountKey = 'adminAccount@gmail.com';
  const adminPwdKey = 'adminPwd';
  let adminAccount = document.querySelector('#adminAccount').value;
  let adminPassword = document.querySelector('#adminPassword').value;

  if(adminAccount == adminAccountKey && adminPassword == adminPwdKey){
    location.href = 'https://yiren-liou.github.io/customerServerSide/admin';
  }else{
    const adminError = document.querySelector('.adminError');
    adminError.textContent = '請按找指示輸入帳號密碼呦';
  }
}
//#endregion 