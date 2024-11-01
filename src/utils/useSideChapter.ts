import { onMounted, onUnmounted } from "vue";
import { md2html } from "./mdUtils";

export function useSideChapter(markdownContent: string, el: any, chapterEl: any) {
    const lines = markdownContent.split('\n');
    const levels: number[] = lines.map(line => {
        if (line.match(/^#+\s/)) {
            const g = line.match(/^#+/)
            return g ? g[0].length : 1
        } else {
            return 6
        }
    })
    let topLevel = 1
    // console.log('topLevel', topLevel)
    if (levels) {
        topLevel = Math.min(...levels)
    }
    const chapters = lines.reduce((acc: string[], line, index, array) => {
        if (line.match(/^#+\s/)) {
            // 处理 #、##、### 等格式的标题
            const g = line.match(/^#+/)
            const level = g ? g[0].length : 1;
            const title = line.replace(/^#+\s/, '');
            acc.push(`<li style="margin-left: ${level - topLevel}rem;" class="toc-link " data-id="chapter${acc.length}">
                        ${getInnerText(title)}
                      </li>`);
        } else if (line.match(/^-{2,}$/) && index > 0 && !array[index - 1].match(/^#+\s/)) {
            // 处理 --- 格式的标题（前一行为标题文本）
            const title = array[index - 1];
            acc.push(`<li style="margin-left: 0em;" class="toc-link " data-id="chapter${acc.length}">
                        ${getInnerText(title)}
                      </li>`);
        }
        return acc;
    }, []).join('');

    let scroll: any = null
    let container: any = null

    onMounted(() => {
        const chapterContainer = chapterEl.value()
        if (chapters) {
            setTimeout(() => {
                container = el.value
                chapterContainer.innerHTML = '<ul>' + chapters + '</ul>'
                // 为每个章节添加 id
                const headings = container.querySelectorAll(' h1, h2, h3');
                headings.forEach((heading: any, index: number) => {
                    heading.id = `chapter${index}`;
                });
                // 点击链接时平滑滚动到对应章节
                chapterContainer.querySelectorAll('.toc-link').forEach((link: Element) => {
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
                                chapterContainer.querySelectorAll('.toc-link').forEach((link: any) => link.classList.remove('active'));
                                this.classList.add('active');
                            }, 1000);

                        }
                    });
                });
                scroll = () => {
                    let scrollPosition = container.scrollTop + 80;
                    headings.forEach((heading: any, index: number) => {
                        const headingTop = heading.offsetTop;
                        const headingEnd = index == headings.length - 1 ? container.scrollHeight : headings[index + 1].offsetTop;
                        // console.log(scrollPosition, headingTop, headingEnd)
                        if (scrollPosition >= headingTop && scrollPosition < headingEnd) {
                            chapterContainer.querySelectorAll('.toc-link').forEach((link: any) => link.classList.remove('active'));
                            chapterContainer.querySelectorAll('.toc-link')[index].classList.add('active');
                        }
                    });
                }
                // 监听滚动事件以激活对应章节
                container.addEventListener('scroll', scroll);
            }, 300);
        } else {
            chapterContainer.style['display'] = 'none'
        }
    })

    onUnmounted(() => {
        if (chapters) {
            container.removeEventListener('scroll', scroll)
        }
    })
}


function getInnerText(mdstr: string): string {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = md2html(mdstr);
    return tempDiv.innerText
}