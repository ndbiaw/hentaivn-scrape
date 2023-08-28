# hentaivn-scrape
Tải tự động toàn bộ truyện của trang web HentaiVN với meta-data (có thể sử dụng với các trang khác). Tập lệnh sử dụng API của Tachidesk.
# Chuẩn bị trước
Máy chủ Tachidesk và Plugin HentaiVN.
# Thư viện cần cài đặt
`
node-fetch@2.6.1 
puppeteer
`
# Cách sử dụng
- Sử dụng buildData để xây dựng cơ sở dữ liệu. (Có thể sử dụng buildDatabyGenre nếu chỉ muốn xây dựng cơ sở dữ liệu theo thể loại yêu thích)
- Sử dụng downloader.js

# Ví dụ
```sh
npm i node-fetch@2.6.1 puppeteer
node buildData.js
node downloader.js
```
