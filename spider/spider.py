from urllib import request
import re

'''
python注释一般是用这张类型如何写在函数内部
函数一般10-20行左右不要超过30行


爬虫经常使用的库： 
   BeautifulSoup (简化代码)
   Scrapy (多线程/分布式)
   爬虫/反爬虫/反反爬虫
   ip 封 不要太频繁爬取
   代理ip 因为封你 只能封IP
'''


# 断点调试

# 改成面向对象，比如要改成其他的的想要就能用

class Spider():
    url = 'https://www.panda.tv/cate/lol'

    # 问号是非贪婪模式 不加问号是贪婪模式
    root_pattern = '<div class="video-info">([\s\S]*?)</div>'  # 匹配整个
    name_pattern = '</i>([\s\S]*?)</span>'  # 匹配主播名称
    number_pattern = '<span class="video-number">[\s\S]*?</span>'  # 匹配观看人数
    num_pattern = '</i>([\s\S]*?)</span>'  # 匹配观战人数里面的组

    def __fetch_content(self):
        r = request.urlopen(Spider.url)
        htmls = r.read()
        htmls = str(htmls, encoding='utf-8')

        return htmls
        # print(htmls)

    def __analysis(self, htmls):
        root_html = re.findall(Spider.root_pattern, htmls)
        anchors = []
        for html in root_html:
            name = re.findall(Spider.name_pattern, html)
            number = re.findall(Spider.number_pattern, html)
            num = re.findall(Spider.num_pattern, number[0])
            # print(name[0])
            anchor = {'name': name[0], 'number': num[0]}
            anchors.append(anchor)

        return anchors

    # 精炼数据 1、
    def __refine(self, anchors):
        # strip():python 的内置函数 处理前后的空格

        l = lambda anchors: {'name': anchors['name'].strip(),
                             'number': anchors['number']
                             }

        # map函数可以遍历使用
        return map(l, anchors)

    # 排序函数
    def __sort(self, anchors):
        # filter
        anchors = sorted(anchors, key=self.__sort_seed, reverse=True)  # reverse函数可以让排序颠倒

        return anchors

    # 排序种子，设置排序转换成数字
    def __sort_seed(self, anchor):
        # 可以用正则表达式来提取数字
        r = re.findall('\d*', anchor['number'])
        number = float(r[0])
        if '万' in anchor['number']:
            number *= 10000

        return number

    # 展示函数
    def __show(self, anchors):
        for rank in range(0, len(anchors)):
            print(str(rank + 1)
                  + '、' + anchors[rank]['name']
                  + '  |   关注人数：' + anchors[rank]['number'])

    def go(self):
        htmls = self.__fetch_content()
        anchors = self.__analysis(htmls)
        new_anchors = list(self.__refine(anchors))  # 注意列表转换
        anchors = self.__sort(new_anchors)
        self.__show(anchors)


spider = Spider()
spider.go()
