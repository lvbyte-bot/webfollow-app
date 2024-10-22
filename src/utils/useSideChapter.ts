import { onMounted } from "vue";

export function useSideChapter(markdownContent: string, el: any, tocEl: any) {
    const lines = markdownContent.split('\n');
    const toc = lines.reduce((acc: string[], line, index, array) => {
        if (line.match(/^#+\s/)) {
            // 处理 #、##、### 等格式的标题
            const g = line.match(/^#+/)
            const level = g ? g[0].length : 1;
            const title = line.replace(/^#+\s/, '');
            acc.push(`<li style="margin-left: ${level - 1}em;" class="toc-link" data-id="chapter${acc.length}">
                        ${title}
                      </li>`);
        } else if (line.match(/^-{2,}$/) && index > 0 && !array[index - 1].match(/^#+\s/)) {
            // 处理 --- 格式的标题（前一行为标题文本）
            const title = array[index - 1].replace(/\\/g, '').replace("**", "").replace("**", "");
            acc.push(`<li style="margin-left: 0em;" class="toc-link" data-id="chapter${acc.length}">
                        ${title}
                      </li>`);
        }
        return acc;
    }, []).join('');

    onMounted(() => {

        setTimeout(() => {
            const container = el.value
            const tocConainer = tocEl.value()
            tocConainer.innerHTML = '<ul>' + toc + '</ul>'
            // 为每个章节添加 id
            const headings = container.querySelectorAll(' h1, h2, h3');
            headings.forEach((heading: any, index: number) => {
                heading.id = `chapter${index}`;
            });
            // 点击链接时平滑滚动到对应章节
            tocConainer.querySelectorAll('.toc-link').forEach((link: Element) => {
                link.addEventListener('click', function (this: any, e: any) {
                    e.preventDefault();
                    const targetId = '#' + (this as HTMLAnchorElement).getAttribute('data-id');
                    if (targetId) {
                        const targetElement = container.querySelector(targetId);
                        if (targetElement) {
                            const targetElementHeight = targetElement.offsetTop;
                            container.scrollTo({
                                top: targetElementHeight - 70,
                                behavior: 'smooth'
                            });
                        }
                        setTimeout(() => {
                            tocConainer.querySelectorAll('.toc-link').forEach((link: any) => link.classList.remove('active'));
                            this.classList.add('active');
                        }, 300);

                    }
                });
            });

            // 监听滚动事件以激活对应章节
            container.addEventListener('scroll', () => {
                let scrollPosition = container.scrollTop + 80;
                headings.forEach((heading: any, index: number) => {
                    const headingTop = heading.offsetTop;
                    const headingEnd = index == headings.length - 1 ? container.scrollHeight : headings[index + 1].offsetTop;
                    console.log(scrollPosition, headingTop, headingEnd)
                    if (scrollPosition >= headingTop && scrollPosition < headingEnd) {
                        tocConainer.querySelectorAll('.toc-link').forEach((link: any) => link.classList.remove('active'));
                        tocConainer.querySelectorAll('.toc-link')[index].classList.add('active');
                    }
                });
            });
        }, 1000);
    })
}
