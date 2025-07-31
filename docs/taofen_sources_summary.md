# 上海图书馆开放数据竞赛——邹韬奋

## 项目目标

- 时间限制：8月15-9月23日期间需要提交作品
- 上海图书馆开放数据竞赛中的数字人文产品
- 考虑如何结合AI Agent完成数据的组织和交互



## 当前有哪些数据？



| 序号 | 资源名称                                                     | 描述                                                         | 来源                | 链接                                                         | 是否获取 | 备注         |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------- | ------------------------------------------------------------ | -------- | ------------ |
| 1    | persons.json                                                 | 邹韬奋的人物事件年表                                         | 上海图书开放数据API | /                                                            | 已抓     | /            |
| 2    | organizations.json                                           | 商务印书馆和生活书店的机构年表                               | 上海图书开放数据API | /                                                            | 已抓     | /            |
| 3    | books.json                                                   | 商务印书馆和生活书店相关的图书列表                           | 上海图书开放数据API | /                                                            | 已抓     | /            |
| 4    | relationships.json                                           | 邹韬奋的关系表                                               | 上海图书开放数据API | /                                                            | 已抓     | /            |
| 5    | api_results/images                                           | 相关人物、图书、手稿图片                                     | 上海图书开放数据API | /                                                            | 已抓     | /            |
| 6    | 韬奋的照片集（包括各时期的韬奋像、韬奋与家人、韬奋与朋友、韬奋在狱中） | 图像                                                         | 韬奋纪念馆          | https://www.zoutaofen.com/resource/show/93.html              | 待抓     | 可以手动抓取 |
| 7    | 韬奋相关的视频资料                                           | 4个视频                                                      | 韬奋纪念馆          | [韬奋在上海](https://www.zoutaofen.com/resource/videodetail?menu_id=94&id=R04153)<br />[七君子出狱](https://www.zoutaofen.com/resource/videodetail?menu_id=94&id=R00645#)<br />[燃烧自己 传播光明--韬奋记略](https://www.zoutaofen.com/resource/videodetail?menu_id=94&id=R02977)<br /><br />[韬奋人生](https://www.zoutaofen.com/resource/videodetail?menu_id=94&id=R01470) | 待抓     | 可以手动抓取 |
| 8    | 邹韬奋的家世信息                                             | 家族树                                                       | 韬奋纪念馆          | https://www.zoutaofen.com/living-Household/50.html           | 待抓     | 可以手动抓取 |
| 9    | 与邹韬奋相关的人物信息                                       | 主要字段：名称、图片、简介                                   | 韬奋纪念馆          | https://www.zoutaofen.com/person/show/86.html                | 待抓     | 自动         |
| 10   | 主要事件                                                     | 七君子事件和新生事件                                         | 韬奋纪念馆          | https://www.zoutaofen.com/page/60.html<br />https://www.zoutaofen.com/page/61.html | 待抓     | 自动         |
| 11   | 韬奋手迹                                                     | 主要字段：名称、原文、时间、图片、注释（可选）               | 韬奋纪念馆          | https://www.zoutaofen.com/resource/show/97.html              | 待抓     | 自动         |
| 12   | 韬奋的主要著作                                               | 与3 book.json中的内容存在重叠                                | 韬奋纪念馆          | https://www.zoutaofen.com/resource/show/98.html              | 待抓     | /            |
| 13   | 韬奋图书馆-图书                                              | 主要字段：标题、作者、出版单位、出版年月、作者、页数、开本<br />可能与3 book.json中的内容存在重叠 | 韬奋纪念馆          | https://www.zoutaofen.com/book/show/99.html                  | 待抓     | /            |
| 14   | 韬奋图书馆-报刊                                              | 共有7种刊物：<br />生活周刊<br />大众生活周刊<br />生活日报<br />生活星期刊<br />抗战三日刊<br />全民抗战<br />《大众生活》复刊<br />—<br />主要字段包括：刊名、创刊时间、出版期数、报刊简介、各期列表（PDF格式，可批量下载） | 韬奋纪念馆          | https://www.zoutaofen.com/resource/show/101.html<br />https://www.zoutaofen.com/resource/show/102.html<br />https://www.zoutaofen.com/resource/show/103.html<br />https://www.zoutaofen.com/resource/show/104.html<br />https://www.zoutaofen.com/resource/show/105.html<br />https://www.zoutaofen.com/resource/show/106.html<br />https://www.zoutaofen.com/resource/show/107.html | 待抓     | 自动         |
| 15   | 生活书店-总介                                                | 文本、图像                                                   | 韬奋纪念馆          | https://www.zoutaofen.com/page/56.html                       | 待抓     | 自动         |
| 16   | 生活书店-店务通讯                                            | 文本；PDF                                                    | 韬奋纪念馆          | https://www.zoutaofen.com/livingbookstore/57.html            | 待抓     | 自动         |
| 17   | 生活书店-书目                                                | 与【3 book.json】中的内容存在重叠                            | 韬奋纪念馆          | https://www.zoutaofen.com/book/show/120.html                 | 待抓     | /            |
| 18   | 生活书店-人物群像                                            | 文本、图像                                                   | 韬奋纪念馆          | https://www.zoutaofen.com/person/show/121.html               | 待抓     | 自动         |
| 19   | 生活书店-大事记                                              | 文本                                                         | 韬奋纪念馆          | https://www.zoutaofen.com/resource/show/122.html             | 待抓     | 自动         |
| 20   | 生活书店-机构沿革                                            | 文本、图片                                                   | 韬奋纪念馆          | https://www.zoutaofen.com/page/66.html                       | 待抓     | 自动         |
| 21   | 韬奋研究-研究著作                                            | 书名、作者、出版单位、出版时间                               | 韬奋纪念馆          | https://www.zoutaofen.com/resource/show/124.html             | 待抓     | 自动         |
| 22   | 韬奋研究-研究文章                                            | 篇名、作者；PDF                                              | 韬奋纪念馆          | https://www.zoutaofen.com/resource/show/125.html             | 待抓     | 自动         |
| 23   | 韬奋纪念题词                                                 | 文本、图像                                                   | 韬奋纪念馆          | https://www.zoutaofen.com/resource/show/126.html             | 待抓     | 自动         |
| 24   | 馆藏珍品                                                     | 名称、年代、质地；文本、图像                                 | 韬奋纪念馆          | https://www.zoutaofen.com/residencelist.html                 | 待抓     | 自动         |



注意：

- 韬奋纪念馆的robots.txt的内容如下：

    ```
    User-agent: *
    Disallow:
    ```

- 【是否获取】列的字段：“已抓 ∣ 待抓 ∣ 放弃”





## 资源利用的优先级分类





## 拟采用的技术栈

- 数字化资源（图像、视频）：IIIF

- 语义模型：Linked Art

