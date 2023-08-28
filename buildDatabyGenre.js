const fetch = require('node-fetch');

async function fetchData(url) {
  try {
    let num = 1;
    let hasNextPage = true;

    while (hasNextPage) {
      const response = await fetch(`${url}/${num}`);
      const data = await response.json();

      hasNextPage = data.hasNextPage;
      num++;
	  console.log(`Đã fetch data thành công cho trang số ${num}`);
    }
  } catch (error) {
    console.error('Lỗi khi fetch dữ liệu:', error);
  }
}

const apiUrl = 'http://127.0.0.1:4567/api/v1/source/7173390495455323659/search?searchTerm=&pageNum=';
fetchData(apiUrl);
