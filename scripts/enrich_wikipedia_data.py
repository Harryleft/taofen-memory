#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
多源数据补充脚本
自动获取人物的肖像图片和生平描述信息
支持维基百科和上海图书馆数据源
"""

import json
import requests
import time
import re
from urllib.parse import quote, urlencode
from typing import Dict, Optional, List
try:
    from opencc import OpenCC
    cc_s2t = OpenCC('s2t')  # 简体转繁体
    cc_t2s = OpenCC('t2s')  # 繁体转简体
except ImportError:
    print("警告: 未安装 opencc-python-reimplemented，将跳过繁体转换功能")
    print("安装命令: pip install opencc-python-reimplemented")
    cc_s2t = None
    cc_t2s = None

class WikipediaEnricher:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        })
        self.base_url = 'https://zh.wikipedia.org/api/rest_v1'
        self.api_url = 'https://zh.wikipedia.org/w/api.php'
        # 上海图书馆API配置
        self.sh_library_api = 'https://data1.library.sh.cn/persons/data'
        self.sh_library_key = 'eca15f528602adb9480d04f286183d133f03f860'
        
    def clean_name(self, name: str) -> str:
        """清理姓名，去除空字符串和多余空白"""
        if not name:
            return ""
        # 去除前后空白和内部多余空白
        cleaned = re.sub(r'\s+', '', name.strip())
        return cleaned
    
    def convert_to_traditional(self, text: str) -> str:
        """将简体中文转换为繁体中文"""
        if cc_s2t and text:
            try:
                return cc_s2t.convert(text)
            except Exception as e:
                print(f"繁体转换失败: {e}")
                return text
        return text
    
    def convert_to_simplified(self, text: str) -> str:
        """将繁体中文转换为简体中文"""
        if cc_t2s and text:
            try:
                return cc_t2s.convert(text)
            except Exception as e:
                print(f"简体转换失败: {e}")
                return text
        return text
    
    def search_person(self, name: str) -> Optional[str]:
        """搜索人物页面标题，处理重定向，支持简繁体搜索"""
        # 清理姓名
        cleaned_name = self.clean_name(name)
        if not cleaned_name:
            print(f"  姓名为空，跳过")
            return None
            
        # 首先用简体搜索
        result = self._search_with_name(cleaned_name)
        if result:
            return result
            
        # 如果简体搜索无结果且支持繁体转换，尝试繁体搜索
        if cc_s2t:
            traditional_name = self.convert_to_traditional(cleaned_name)
            if traditional_name != cleaned_name:
                print(f"  简体搜索无结果，尝试繁体: {traditional_name}")
                result = self._search_with_name(traditional_name)
                if result:
                    return result
        
        return None
    
    def _search_with_name(self, name: str) -> Optional[str]:
        """使用指定姓名进行搜索"""
        try:
            params = {
                'action': 'query',
                'format': 'json',
                'list': 'search',
                'srsearch': name,
                'srlimit': 10,
                'srnamespace': 0
            }
            
            response = self.session.get(self.api_url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if 'query' in data and 'search' in data['query']:
                # 优先查找完全匹配
                for result in data['query']['search']:
                    title = result['title']
                    if title == name:
                        return self.resolve_redirect(title)
                
                # 查找包含完整姓名的标题
                for result in data['query']['search']:
                    title = result['title']
                    # 检查标题是否以人名开头，或者人名是标题的主要部分
                    if title.startswith(name) or (name in title and len(name) >= 2):
                        # 额外检查：避免匹配到明显不相关的页面
                        if not any(keyword in title for keyword in ['消歧义', '重定向', '列表']):
                            return self.resolve_redirect(title)
                
                # 如果没有找到好的匹配，返回第一个结果（如果存在）
                if data['query']['search']:
                    first_result = data['query']['search'][0]['title']
                    # 只有当第一个结果包含人名的主要字符时才返回
                    if len(name) >= 2 and any(char in first_result for char in name[:2]):
                        return self.resolve_redirect(first_result)
            
            return None
            
        except Exception as e:
            print(f"搜索 {name} 时出错: {e}")
            return None
    
    def resolve_redirect(self, title: str) -> str:
        """解析重定向，返回最终页面标题"""
        try:
            params = {
                'action': 'query',
                'format': 'json',
                'titles': title,
                'redirects': 1
            }
            
            response = self.session.get(self.api_url, params=params)
            response.raise_for_status()
            data = response.json()
            
            # 检查是否有重定向
            if 'query' in data and 'redirects' in data['query']:
                redirects = data['query']['redirects']
                if redirects:
                    return redirects[-1]['to']  # 返回最终重定向目标
            
            return title  # 如果没有重定向，返回原标题
            
        except Exception as e:
            print(f"解析重定向 {title} 时出错: {e}")
            return title
    
    def get_page_summary(self, title: str) -> Optional[str]:
        """获取页面摘要"""
        try:
            encoded_title = quote(title.encode('utf-8'))
            url = f"{self.base_url}/page/summary/{encoded_title}"
            
            response = self.session.get(url)
            response.raise_for_status()
            data = response.json()
            
            if 'extract' in data:
                extract = data['extract']
                # 清理文本，移除多余的空白和格式
                extract = re.sub(r'\s+', ' ', extract).strip()
                return extract
            
            return None
            
        except Exception as e:
            print(f"获取 {title} 摘要时出错: {e}")
            return None
    
    def get_page_image(self, title: str) -> Optional[str]:
        """获取页面主图片URL"""
        try:
            params = {
                'action': 'query',
                'format': 'json',
                'titles': title,
                'prop': 'pageimages',
                'pithumbsize': 300,
                'pilimit': 1
            }
            
            response = self.session.get(self.api_url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if 'query' in data and 'pages' in data['query']:
                pages = data['query']['pages']
                for page_id, page_data in pages.items():
                    if 'thumbnail' in page_data:
                        return page_data['thumbnail']['source']
            
            return None
            
        except Exception as e:
            print(f"获取 {title} 图片时出错: {e}")
            return None
    
    def search_sh_library(self, name: str) -> Optional[Dict]:
        """搜索上海图书馆人物数据"""
        try:
            # 上海图书馆API调用前延迟，避免请求过于频繁
            time.sleep(2.0)
            
            params = {
                'freetext': name,
                'key': self.sh_library_key
            }
            
            # 添加特定的请求头
            headers = {
                'Referer': 'https://www.library.sh.cn/',
                'Origin': 'https://www.library.sh.cn'
            }
            
            response = self.session.get(self.sh_library_api, params=params, headers=headers, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            if data.get('result') == '0' and 'data' in data and data['data']:
                # 返回第一个匹配结果，优先选择完全匹配的
                for item in data['data']:
                    if item.get('fname') == name:
                        return item
                # 如果没有完全匹配，返回第一个结果
                return data['data'][0]
            
            return None
            
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 403:
                print(f"搜索上海图书馆 {name} 时遇到403错误，可能需要更长的请求间隔")
            else:
                print(f"搜索上海图书馆 {name} 时HTTP错误: {e}")
            return None
        except Exception as e:
            print(f"搜索上海图书馆 {name} 时出错: {e}")
            return None
    
    def extract_sh_library_data(self, sh_data: Dict) -> Dict:
        """从上海图书馆数据中提取有用信息"""
        result = {}
        
        # 提取描述信息
        if 'briefBiography' in sh_data and sh_data['briefBiography']:
            biography = sh_data['briefBiography'].strip()
            # 清理描述文本
            biography = re.sub(r'\s+', ' ', biography)
            
            # 移除所有来源标注信息
            # 匹配（来源：《书名》）格式
            biography = re.sub(r'（来源：《[^》]+》）', '', biography)
            # 匹配其他可能的来源格式
            biography = re.sub(r'（来源：[^）]+）', '', biography)
            
            # 清理描述文本
            biography = re.sub(r'\s+', ' ', biography).strip()
            
            # 如果成功解析到描述内容
            if biography:
                result['desc'] = biography
        
        # 提取链接信息（改为数组格式）
        if 'uri' in sh_data and sh_data['uri']:
            result['links'] = [sh_data['uri']]
        
        # 统一添加"上海图书馆人名规范库"作为来源标识
        result['sources'] = ['上海图书馆人名规范库']
        
        return result
    
    def enrich_person_data(self, person: Dict) -> Dict:
        """补充单个人物数据"""
        name = person['name']
        print(f"正在处理: {name}")
        
        # 首先对name和desc进行繁简转换
        original_name = name
        simplified_name = self.convert_to_simplified(name)
        if simplified_name != original_name:
            person['name'] = simplified_name
            name = simplified_name
            print(f"  姓名繁简转换: {original_name} -> {simplified_name}")
        
        # 重新初始化数据结构（全部重新处理）
        person['sources'] = []
        person['link'] = []
        person['desc'] = ''  # 重置描述
        # img字段保持不变，但后续会被维基百科数据覆盖
        
        # 标记是否获取到了数据
        got_sh_data = False
        got_wiki_data = False
        
        # 1. 首先尝试上海图书馆数据源
        print(f"  尝试上海图书馆数据源...")
        sh_data = self.search_sh_library(name)
        if sh_data:
            print(f"  找到上海图书馆数据: {sh_data.get('fname', 'Unknown')}")
            sh_extracted = self.extract_sh_library_data(sh_data)
            
            # 检查是否成功解析到有效数据
            if sh_extracted:
                # desc优先使用上海图书馆数据
                if 'desc' in sh_extracted:
                    person['desc'] = sh_extracted['desc']
                    got_sh_data = True
                    print(f"  获取到描述: {sh_extracted['desc'][:50]}...")
                
                # 添加上海图书馆的链接
                if 'links' in sh_extracted:
                    for link in sh_extracted['links']:
                        if link not in person['link']:
                            person['link'].append(link)
                            got_sh_data = True
                            print(f"  获取到链接: {link}")
                
                # 添加上海图书馆的来源
                if 'sources' in sh_extracted:
                    sources_to_add = sh_extracted['sources']
                    if isinstance(sources_to_add, str):
                        sources_to_add = [sources_to_add]
                    
                    for source in sources_to_add:
                        if source not in person['sources']:
                            person['sources'].append(source)
                            got_sh_data = True
                            print(f"  添加来源: {source}")
            else:
                print(f"  上海图书馆数据解析失败")
        else:
            print(f"  上海图书馆未找到 {name} 的数据")
        
        # 2. 尝试维基百科数据源（无论上海图书馆是否有数据都尝试）
        print(f"  尝试维基百科数据源...")
        wiki_title = self.search_person(name)
        if wiki_title:
            print(f"  找到维基百科页面: {wiki_title}")
            
            # img优先使用维基百科数据
            image_url = self.get_page_image(wiki_title)
            if image_url:
                person['img'] = image_url
                got_wiki_data = True
                print(f"  获取到图片: {image_url}")
            
            # 如果上海图书馆没有提供描述，使用维基百科描述
            if not person.get('desc', '').strip():
                summary = self.get_page_summary(wiki_title)
                if summary:
                    person['desc'] = summary
                    got_wiki_data = True
                    print(f"  获取到描述: {summary[:50]}...")
            
            # 添加维基百科链接
            wiki_link = f'https://zh.wikipedia.org/wiki/{quote(wiki_title.encode("utf-8"))}'
            if wiki_link not in person['link']:
                person['link'].append(wiki_link)
                got_wiki_data = True
                print(f"  添加维基百科链接: {wiki_link}")
            
            # 添加维基百科作为来源标识
            if got_wiki_data and '维基百科' not in person['sources']:
                person['sources'].append('维基百科')
                print(f"  添加来源标识: 维基百科")
        else:
            print(f"  维基百科未找到 {name} 的页面")
        
        # 3. 处理没有获取到任何数据的情况
        if not got_sh_data and not got_wiki_data:
            print(f"  未从任何数据源获取到数据")
            # 如果有原始描述但没有来源，设置默认来源
            if person.get('desc', '').strip() != '' and not person.get('desc', '').startswith('Category:'):
                person['sources'] = ['未知来源']
                print(f"  设置默认来源: 未知来源")
        
        # 确保数据结构完整性
        if not isinstance(person.get('sources'), list):
            person['sources'] = []
        if not isinstance(person.get('link'), list):
            person['link'] = []
        
        print(f"  处理完成 - 来源: {person['sources']}, 链接数: {len(person['link'])}")
        
        # API调用间隔，避免过于频繁（增加到3秒以防止403错误）
        time.sleep(3.0)
        
        return person
    
    def process_relationships_file(self, file_path: str, output_path: str = None, test_limit: int = None):
        """处理relationships.json文件
        
        Args:
            file_path: 输入文件路径
            output_path: 输出文件路径，默认为输入文件路径
            test_limit: 测试模式下限制处理的人物数量，None表示处理全部
        """
        if output_path is None:
            output_path = file_path
        
        print(f"读取文件: {file_path}")
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except Exception as e:
            print(f"读取文件失败: {e}")
            return
        
        if 'persons' not in data:
            print("文件格式错误：未找到persons字段")
            return
        
        persons = data['persons']
        total = len(persons)
        
        if test_limit is not None:
            persons = persons[:test_limit]
            print(f"测试模式：处理前 {len(persons)} 个人物（共 {total} 个）")
        else:
            print(f"共找到 {total} 个人物")
        
        # 统计需要处理的人物数量
        need_processing = 0
        missing_stats = {'图片': 0, '描述': 0, '来源': 0, '链接': 0}
        
        for person in persons:
            has_image = person.get('img', '').strip() != ''
            current_desc = person.get('desc', '').strip()
            has_desc = current_desc != '' and not current_desc.startswith('Category:')
            
            # 支持数组格式的sources字段
            sources_field = person.get('sources', [])
            if isinstance(sources_field, str):
                has_sources = sources_field.strip() != ''
            else:
                has_sources = len(sources_field) > 0
            
            # 支持数组格式的link字段
            link_field = person.get('link', [])
            if isinstance(link_field, str):
                has_link = link_field.strip() != ''
            else:
                has_link = len(link_field) > 0
            
            person_needs_processing = False
            if not has_image:
                missing_stats['图片'] += 1
                person_needs_processing = True
            if not has_desc:
                missing_stats['描述'] += 1
                person_needs_processing = True
            if not has_sources:
                missing_stats['来源'] += 1
                person_needs_processing = True
            if not has_link:
                missing_stats['链接'] += 1
                person_needs_processing = True
                
            if person_needs_processing:
                need_processing += 1
        
        print(f"需要补充数据的人物: {need_processing} 个")
        print(f"缺失统计: 图片({missing_stats['图片']}) 描述({missing_stats['描述']}) 来源({missing_stats['来源']}) 链接({missing_stats['链接']})")
        
        if need_processing == 0:
            print("所有人物数据已完整，无需处理")
            return
        
        # 处理每个人物
        processed = 0
        for i, person in enumerate(persons):
            print(f"\n进度: {i+1}/{total}")
            
            try:
                enriched_person = self.enrich_person_data(person)
                persons[i] = enriched_person
                processed += 1
                
                # 每处理10个人物保存一次
                if processed % 10 == 0:
                    print(f"\n已处理 {processed} 个人物，保存中间结果...")
                    with open(output_path, 'w', encoding='utf-8') as f:
                        json.dump(data, f, ensure_ascii=False, indent=2)
                    
            except Exception as e:
                print(f"处理 {person.get('name', 'Unknown')} 时出错: {e}")
                continue
        
        # 保存最终结果
        print(f"\n处理完成，保存到: {output_path}")
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"成功保存 {total} 个人物数据")
            
            # 统计最终的数据源分布（支持数组格式）
            source_stats = {}
            complete_data_count = 0
            
            for person in persons:
                has_image = person.get('img', '').strip() != ''
                current_desc = person.get('desc', '').strip()
                has_desc = current_desc != '' and not current_desc.startswith('Category:')
                
                sources_field = person.get('sources', [])
                if isinstance(sources_field, str):
                    has_sources = sources_field.strip() != ''
                    sources_list = [sources_field.strip()] if has_sources else []
                else:
                    has_sources = len(sources_field) > 0
                    sources_list = sources_field
                
                link_field = person.get('link', [])
                if isinstance(link_field, str):
                    has_link = link_field.strip() != ''
                else:
                    has_link = len(link_field) > 0
                
                if has_image and has_desc and has_sources and has_link:
                    complete_data_count += 1
                
                # 统计来源（支持多个来源）
                if sources_list:
                    for source in sources_list:
                        # 确保source是字符串而不是其他可迭代对象
                        if isinstance(source, str):
                            source_stats[source] = source_stats.get(source, 0) + 1
                        else:
                            # 如果source不是字符串，转换为字符串
                            source_str = str(source)
                            source_stats[source_str] = source_stats.get(source_str, 0) + 1
                else:
                    source_stats['未知来源'] = source_stats.get('未知来源', 0) + 1
            
            print(f"\n=== 数据源统计 ===")
            for source, count in sorted(source_stats.items()):
                percentage = (count / total) * 100
                print(f"{source}: {count} 个人物 ({percentage:.1f}%)")
            
            print(f"\n完整数据覆盖率: {complete_data_count}/{total} ({(complete_data_count/total)*100:.1f}%)")
            
        except Exception as e:
            print(f"保存文件失败: {e}")

def main():
    enricher = WikipediaEnricher()
    
    input_file = '../frontend/public/data/json/relationships.json'
    output_file = '../frontend/public/data/json/relationships.json'
    
    print("=== 多源数据补充工具 ===")
    print("1. 完整处理")
    print("2. 测试模式（处理前10条数据）")
    
    choice = input("请选择模式 (1/2): ").strip()
    
    if choice == '2':
        print("\n启动测试模式...")
        print("支持数据源: 上海图书馆、维基百科")
        print(f"输入文件: {input_file}")
        print(f"输出文件: {output_file}")
        print()
        enricher.process_relationships_file(input_file, output_file, test_limit=10)
    else:
        print("\n启动完整处理模式...")
        print("支持数据源: 上海图书馆、维基百科")
        print(f"输入文件: {input_file}")
        print(f"输出文件: {output_file}")
        print()
        enricher.process_relationships_file(input_file, output_file)
    
    print("\n=== 处理完成 ===")

if __name__ == '__main__':
    main()
