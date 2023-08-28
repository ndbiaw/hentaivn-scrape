const fetch = require('node-fetch');

const baseUrl = 'http://localhost:4567/api/v1/source/7173390495455323659/lastest/';
let num = 1;

async function fetchData() {
  while (true) {
    const url = `${baseUrl}${num}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Fetch không thành công cho trang num=${num}: ${response.status} ${response.statusText}`);
      break;
    }
    
    const data = await response.json();
    
    if (Object.keys(data).length === 0) {
      console.log(`Fetch dữ liệu rỗng cho trang num=${num}. Kết thúc.`);
      break;
    }
    
    console.log(`Đã nhận dữ liệu cho trang num=${num}`);
    num++;
  }
}

fetchData().catch(error => console.error('An error occurred:', error));
