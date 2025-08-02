设计韬奋的时间线
思路如下：
- 采用分层叙事的方法：核心故事（韬奋的生平和主要成就），辅以背景故事（重要历史事件和社会背景）。
- 使用不同的颜色偏好来区分核心故事和背景故事。例如使用红色节点表示核心故事，灰色节点表示背景故事。
- 重点时间轴和完整时间轴的设计：重点时间轴突出韬奋的关键事件，完整时间轴则包含所有重要事件。（在首页放置重点时间轴，在详情界面放置完整时间轴）
- 我划分了12个核心故事节点，分别对应韬奋生平的不同阶段和成就。如下：
  - 幼年生活
  - 求学时期
  - 毕业工作
  - 担任主编
  - 爱国救亡
  - 流亡海外
  - 毅然回国
  - 宣传抗日
  - 全民抗战
  - 离渝赴港
  - 辗转流亡
  - 与世长辞

数据来源：
- 路径： /frontend/src/assets/data/timeline.json
- 格式：JSON
- 示例：
```json
[
  {
    "core_event": "1. 幼年生活",
    "timeline": [
      {
        "time": "1895年",
        "experience": "11月5日，邹韬奋出生于福建省永安市。",
        "image": "public/data/images/timeline-image/zou-taofen-birthplace-yongan.jpg",
        "location": "福建, 永安"
      },
      {
        "time": "1900年",
        "experience": "父亲去福州任候补，全家迁往。由父亲亲自“发蒙”，教读《三字经》等。",
        "image": "public/data/images/timeline-image/fuzhou-private-school-1900s.jpg",
        "location": "福建, 福州"
      },
      {
        "time": "1900年",
        "experience": "八国联军侵华战争爆发（庚子国变），清政府与11国签订《辛丑条约》，民族危机空前深重。",
        "image": "public/data/images/timeline-image/eight-nation-alliance-war-1900.jpg",
        "location": "中国, 北京",
        "timespot": 1
      },
      {
        "time": "1908年",
        "experience": "随父亲前往江西余江奔丧，扶母亲灵柩归乡，并在老家居住四个月。",
        "image": "public/data/images/timeline-image/jiangxi-ancestral-home-1908.jpg",
        "location": "江西, 余江"
      }
    ]
  },
// ……
]
```
注意：
- 有`timespot`字段的节点表示背景故事，其他节点表示核心故事。
- 图片暂时使用占位符表示，实际使用时需要替换为真实图片路径。
- 交互方式为：用户点击第一个核心故事节点后，展开时间线，显示该核心故事节点和对应的背景故事节点。

设计风格参考：
- `/docs/timeline-example.png`
- `/docs/timeline-example02.png`

