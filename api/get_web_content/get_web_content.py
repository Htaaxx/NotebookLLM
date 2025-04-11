from urllib.parse import urlparse
import re
from crawl4ai import *
import asyncio


def get_page_name(url):
    path = urlparse(url).path
    path = path.split('#')[0]
    
    if not path:
        return None

    page_name = path.split('/')[-1]
    
    if page_name.isdigit():
        page_name = path.split('/')[-2]

    page_name = page_name.rstrip('/')

    if re.search(r'[a-zA-Z]', page_name):
        page_name = page_name.replace('-', ' ')
        return page_name
    else:
        domain = urlparse(url).netloc
        return domain


async def web_crawler(url):
    web_name = get_page_name(url)
    
    async with AsyncWebCrawler() as crawler:
        result = await crawler.arun(url=url)
        
    md_filename = f"{web_name}.md"

    try:
        with open(md_filename, "w", encoding="utf-8") as file:
            file.write(result.markdown)

    except Exception as e:
        print(f"Đã xảy ra lỗi khi lưu file: {e}")
        
    
    return {
        "web_name": web_name,
        "text": result.markdown
    }

# import asyncio
# from your_module_name import web_crawler  # Đổi tên module nếu không phải là your_module_name

async def main():
    url = input("Nhập URL trang web cần crawl: ").strip()
    
    if not url.startswith("http"):
        url = "https://" + url

    try:
        result = await web_crawler(url)
        print(f"\n✅ Crawl xong trang: {result['web_name']}")
        print(f"📝 Nội dung markdown đã được lưu vào file `{result['web_name']}.md`")
    except Exception as e:
        print(f"❌ Có lỗi xảy ra khi crawl: {e}")

if __name__ == "__main__":
    asyncio.run(main())
