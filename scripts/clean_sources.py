#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
清理 relationships.json 中的重复来源标识
只保留 "上海图书馆人名规范库" 和 "维基百科" 作为数据源标识
移除具体的文献来源标识如 "《中国近现代人物名号大辞典》" 等
"""

import json
import os
from typing import Dict, List, Any

def clean_person_sources(person: Dict[str, Any]) -> Dict[str, Any]:
    """清理单个人物的来源信息"""
    if 'sources' not in person or not isinstance(person['sources'], list):
        return person
    
    original_sources = person['sources']
    cleaned_sources = []
    
    # 检查是否有上海图书馆相关数据
    has_sh_library = any(
        source in original_sources 
        for source in ['上海图书馆', '上海图书馆人名规范库'] + 
        [s for s in original_sources if s.startswith('《') and s.endswith('》')]
    )
    
    # 检查是否有维基百科数据
    has_wikipedia = '维基百科' in original_sources
    
    # 重新构建来源列表
    if has_sh_library:
        cleaned_sources.append('上海图书馆人名规范库')
    
    if has_wikipedia:
        cleaned_sources.append('维基百科')
    
    # 保留其他非重复的来源（如"未知来源"等）
    for source in original_sources:
        if source not in ['上海图书馆', '上海图书馆人名规范库', '维基百科'] and \
           not (source.startswith('《') and source.endswith('》')) and \
           source not in cleaned_sources:
            cleaned_sources.append(source)
    
    person['sources'] = cleaned_sources
    return person

def clean_relationships_file(input_file: str, output_file: str = None) -> None:
    """清理 relationships.json 文件"""
    if output_file is None:
        output_file = input_file
    
    print(f"正在读取文件: {input_file}")
    
    # 读取原始数据
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # 检查文件格式
    if isinstance(data, dict) and 'persons' in data:
        persons_list = data['persons']
        print(f"检测到对象格式，persons数组包含 {len(persons_list)} 个人物记录")
    elif isinstance(data, list):
        persons_list = data
        print(f"检测到数组格式，总共 {len(persons_list)} 个人物记录")
    else:
        print("错误: 文件格式不正确")
        return
    
    # 统计信息
    stats = {
        'total': len(persons_list),
        'cleaned': 0,
        'original_sources': {},
        'cleaned_sources': {}
    }
    
    # 清理每个人物的来源信息
    for i, person in enumerate(persons_list):
        if not isinstance(person, dict):
            continue
            
        original_sources = person.get('sources', [])
        if isinstance(original_sources, list):
            # 统计原始来源
            for source in original_sources:
                stats['original_sources'][source] = stats['original_sources'].get(source, 0) + 1
        
        # 清理来源
        person = clean_person_sources(person)
        persons_list[i] = person
        
        cleaned_sources = person.get('sources', [])
        if isinstance(cleaned_sources, list):
            # 统计清理后的来源
            for source in cleaned_sources:
                stats['cleaned_sources'][source] = stats['cleaned_sources'].get(source, 0) + 1
        
        if original_sources != cleaned_sources:
            stats['cleaned'] += 1
            print(f"  清理 {person.get('name', 'Unknown')}: {original_sources} -> {cleaned_sources}")
    
    # 更新原始数据结构
    if isinstance(data, dict) and 'persons' in data:
        data['persons'] = persons_list
    else:
        data = persons_list
    
    # 备份原文件
    if output_file == input_file:
        backup_file = input_file + '.backup'
        print(f"创建备份文件: {backup_file}")
        with open(backup_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    
    # 保存清理后的数据
    print(f"保存清理后的数据到: {output_file}")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    # 输出统计信息
    print("\n=== 清理统计 ===")
    print(f"总记录数: {stats['total']}")
    print(f"已清理记录数: {stats['cleaned']}")
    
    print("\n原始来源分布:")
    for source, count in sorted(stats['original_sources'].items(), key=lambda x: x[1], reverse=True):
        print(f"  {source}: {count}")
    
    print("\n清理后来源分布:")
    for source, count in sorted(stats['cleaned_sources'].items(), key=lambda x: x[1], reverse=True):
        print(f"  {source}: {count}")

def main():
    """主函数"""
    input_file = '../frontend/public/data/json/relationships.json'
    
    if not os.path.exists(input_file):
        print(f"错误: 文件不存在 {input_file}")
        return
    
    clean_relationships_file(input_file)
    print("\n清理完成！")

if __name__ == '__main__':
    main()
