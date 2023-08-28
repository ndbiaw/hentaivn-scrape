const fs = require('fs');
const puppeteer = require('puppeteer');
const fetch = require('node-fetch');

// Hàm chờ một khoảng thời gian
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function waitForImagesToLoad(page) {
        await page.waitForFunction(() => {
            const images = Array.from(document.querySelectorAll('.MuiBox-root.css-1bw3vem img'));
            return images.every(img => img.complete);
        });
    }
    (async () => {
        try {
            // Lặp qua các giá trị từ 28 đến 33333
            for (let numData = 1002; numData >= 1; numData--) {
                // Fetch thông tin manga từ API
                let response;
                try {
                    // Fetch thông tin manga từ API
                    response = await fetch(`http://127.0.0.1:4567/api/v1/manga/${numData}/?onlineFetch=false`);
                    const contentType = response.headers.get('content-type');
                    if (!contentType.includes('application/json')) {
                        console.log(`Bỏ qua truyện có ID ${numData} vì lỗi JSon.`);
                        continue;
                    }
                } catch (fetchError) {
                    console.error(`Lỗi khi xử lý truyện có ID ${numData}:`, fetchError);
                    continue;
                }
                const mangaData = await response.json();

                // Tạo thư mục dựa trên trường "title"
                const titleFolderName = mangaData.title.replace(/[/\\?%*:|"<>]/g, '-');
                fs.mkdirSync(titleFolderName, {
                    recursive: true
                });

                // Lọc thông tin cần thiết vào tệp !info.json
                const infoData = {
                    title: mangaData.title,
                    author: mangaData.author,
                    description: mangaData.description,
                    genre: mangaData.genre,
                    status: mangaData.status,
                };
                fs.writeFileSync(`${titleFolderName}/!info.json`, JSON.stringify(infoData, null, 2));

                const thumbnailResponse = await fetch(`http://127.0.0.1:4567/api/v1/manga/${numData}/thumbnail?useCache=false`);
                const thumbnailBuffer = await thumbnailResponse.buffer();
                fs.writeFileSync(`${titleFolderName}/thumbnail.jpg`, thumbnailBuffer);

                // Fetch thông tin các chapters từ API
                const chaptersResponse = await fetch(`http://127.0.0.1:4567/api/v1/manga/${numData}/chapters?onlineFetch=false`);
                if (!chaptersResponse.ok) {
                    console.log(`Truyện với ID ${numData} không có chương. Bỏ qua...`);
                    continue; // Chuyển đến id truyện tiếp theo
                }

                const contentType = chaptersResponse.headers.get('content-type');
                let chaptersData;

                if (contentType.includes('application/json')) {
                    chaptersData = await chaptersResponse.json();
                } else {
                    console.log(`Truyện với ID ${numData} không có dữ liệu. Bỏ qua...`);
                    continue; // Chuyển đến id truyện tiếp theo
                }

                // Khởi tạo trình duyệt Puppeteer
                const browser = await puppeteer.launch({
                    headless: "new",
                    defaultViewport: null, // Tùy chỉnh lại theo yêu cầu
                    timeout: 0, // Tăng thời gian chờ không giới hạn
                    args: ['--start-maximized'], // Tùy chỉnh lại theo yêu cầu
                });

                const page = await browser.newPage();

                // Lặp qua các chapter để tải hình ảnh
                for (let chapterIndex = 0; chapterIndex < chaptersData.length; chapterIndex++) {
                    const chapterInfo = chaptersData[chapterIndex];
                    const chapter = chapterInfo.index;

                    // Truy cập trang chapter
                    await page.goto(`http://127.0.0.1:4567/manga/${numData}/chapter/${chapter}`);

                    // Scroll xuống cuối trang để tải toàn bộ hình ảnh
                    await page.evaluate(async () => {
                        await new Promise((resolve) => {
                            let totalHeight = 0;
                            const distance = 1000;
                            const timer = setInterval(() => {
                                const scrollHeight = document.body.scrollHeight;
                                window.scrollBy(0, distance);
                                totalHeight += distance;

                                if (totalHeight >= scrollHeight) {
                                    clearInterval(timer);
                                    resolve();
                                }
                            }, 10);
                        });
                    });

                    // Đợi một khoảng thời gian để hình ảnh tải hoàn chỉnh
                    await waitForImagesToLoad(page);

                    // Fetch thông tin pageCount từ API
                    const chapterResponse = await fetch(`http://127.0.0.1:4567/api/v1/manga/${numData}/chapter/${chapter}`);
                    const chapterData = await chapterResponse.json();
                    const pageCount = chapterData.pageCount;

                    // Lưu hình ảnh vào thư mục tương ứng
                    const chapterName = chapterInfo.name.replace(/[/\\?%*:|"<>]/g, '-');
                    fs.mkdirSync(`${titleFolderName}/${chapterName}`, {
                        recursive: true
                    });

                    // Lặp qua từng trang để tải hình ảnh
                    for (let page = 0; page < pageCount; page++) {
                        const imageUrl = `http://127.0.0.1:4567/api/v1/manga/${numData}/chapter/${chapter}/page/${page}?useCache=true`;
                        const imageResponse = await fetch(imageUrl);
                        const imageBuffer = await imageResponse.buffer();
                        fs.writeFileSync(`${titleFolderName}/${chapterName}/${page}.jpg`, imageBuffer);
                    }
                    console.log(`${titleFolderName} ${chapterName} tải thành công!`);
                }

                // Đóng trình duyệt Puppeteer
                await browser.close();
            }
        } catch (error) {
            console.error('Lỗi:', error);
        }
    })();