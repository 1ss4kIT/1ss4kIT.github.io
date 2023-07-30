---
layout: post
title: 钓鱼检测(二)PhishInPattern分析
author: 1ss4k
tags: []
categories:
  - 恶意URL检测
date: 2022-11-21 11:27:00
---
## 文章阅读

1、文章等级：2022年IMC (CCF-B)



2、探索了超过5w个钓鱼网站，得出如下结论：

* 外观模仿某一目标，但不一定和目标一模一样
* 通常有多步操作
* 有验证步骤


3、受害者提交完信息之后，网站反应如下：

钓鱼网站：

* 重定向到错误页面

* 重定向到合法页面
* 输出success的信息，告诉用户他的数据仍是安全的
* 密码错误【分为有验证和无验证】

良性网站：

* 密码错误









## 环境配置


1、**钓鱼URL来源：PhishTank**

原文使用的库是`OpenPhish` API，我尝试发邮件联系，对方未回复。故尝试使用Phishtank数据库。



2、**数据库使用：sqlalchemy**

Mysql安装5.0版本 [教程](https://juejin.cn/post/6903070115823419399)

mysql [报错解决](https://www.jianshu.com/p/1f0c8e3c438b#:~:text=解决Django执行manage.py%20提示%20NameError%3A%20name%20%27_mysql%27%20is%20not%20defined,解决办法：%20使用pymysql代替MySQLdb%20步骤：%20安装pymysql：pip%20install%20pymysql%20打开项目在setting.py的%20init.py%2C或直接在当前py文件最开头添加如下：)


**创建表：**运行phish_db_schema.py


**3、sklearn**

出现如下错误
```
No module named 'sklearn.linear_model.stochastic_gradient
```
尝试`
pip install scikit-learn --upgrade`

无法解决，随后在ubuntu系统上实验

```python
pip3 install playwright
pip3 install -U scikit-learn==0.21.3
mysql
```

**❌ 4、交互软件：pypeteer**

原文使用 pypeteer，但遇到较多错误，后来也没人维护了，故使用更新的 playwright

 pypeteer Chromium [安装教程](https://blog.51cto.com/u_15127666/4157760)
[下载地址](https://mirrors.huaweicloud.com/chromium-browser-snapshots/Mac/588429/)

仍然启动失败

[查看动态链接库是否有安装失败](https://blog.csdn.net/lovechris00/article/details/81561627)，无果

太难用了...一直报错
```
  File "/Users/my/opt/anaconda3/lib/python3.9/site-packages/pyppeteer/launcher.py", line 307, in launch
    return await Launcher(options, **kwargs).launch()
  File "/Users/my/opt/anaconda3/lib/python3.9/site-packages/pyppeteer/launcher.py", line 168, in launch
    self.browserWSEndpoint = get_ws_endpoint(self.url)
  File "/Users/my/opt/anaconda3/lib/python3.9/site-packages/pyppeteer/launcher.py", line 227, in get_ws_endpoint
    raise BrowserError('Browser closed unexpectedly:\n')
pyppeteer.errors.BrowserError: Browser closed unexpectedly:
```

这个项目现在也没人维护了，官方建议使用`Playwright-python`。

**✅ 5、playwright-python**

[项目地址](https://github.com/microsoft/playwright-python)

pip安装后，只安装了playwright，但是没有下载chromium

输出命令 playwright install，即可下载浏览器。

Downloading Chromium 108.0.5359.29 (playwright build v1033)


代码中的 asyncio 表示异步操作。


## SeedCollector

```
pip install mysqlclient #创建数据库

```

1、`get_openphish_feeds.py` 从 `Open_Phish`获取url，存储在AWS中。 

2、`get_phishtank_valid_urls.py` 从 `PhishTank` 爬取验证过的url，存储在 `phish_db_layer` 结构中；从`OpenPhish`爬取url，也存储在`phish_db_layer`中。

创建了表：`Open_Phish_Links`


3、得到alexa中网站合法的登陆url，一个网站可能对应多个url。

到database文件下，运行python3 phish_db_schema.py，就可以自动创建好所需要的表～

最开始运行的时候可能会有外键约束错误

参考[这篇文章](https://stackoverflow.com/questions/21659691/error-1452-cannot-add-or-update-a-child-row-a-foreign-key-constraint-fails)，
设置：SET GLOBAL FOREIGN_KEY_CHECKS=0;



## Crawler

0、依赖包下载

```
pip install pyenchant
pip3 install pyppeteer
pip3 install textblob
pip3 install faker
pip3 install pyautogui #安装失败，先不管了

apt-get install chromium-chromedriver
安装google-chrome：https://www.cnblogs.com/myvic/p/10324531.html

brew install enchant brew更新时间很长
```

输入参数

```
url
--phish_id
--timeout
```

定义了 `crawl_web_page`函数，其处理流程如下：


1、使用`pyppeteer`设置`browser.newPage`
```
temp = None 
samePage = 0
count=phish_id
page_count = 0
res_page_count = 0
page_requests = []
page_responses = []
```

定义如下函数：
（1）handle_request

存储请求，对于重定向`redirectChain`的url，迭代递归处理


（2）handle_response

存储页面内容


❌（3）evaluateOnNewDocument

换成 evaluateHandle，仍然不行，需要找到一个合适的函数。

extra_scripts.js_add_event_override



（4）log_events_helper

记录[CONSOLE LOG]


2、访问页面

需要修改一些函数的名称，参考官方文档即可，两者命名有很大的相似性。

continue_ 修改
[参考教程 ](https://dev.to/checkly/request-interception-with-puppeteer-and-playwright-1503)



JJ 换为 query_selector_all

J 换为 query_selector

JJeval 换为 eval_on_selector_all

Jeval 换为 eval_on_selector

[参考：](https://www.lambdatest.com/automation-testing-advisor/python/playwright-python-eval_on_selector_all)

isIntersectingViewport 直接删掉，我还需要处理不可见的内容


## 收获总结

1、这篇文章对我有很大的鼓舞，证明了这种交互的方法是可行的，并且开源了一个交互的代码框架！近期各种文章似乎都在朝这个方向发展，像是冰面下涌动的河流。我也一定要抓紧时间赶快做实验，赶上时代的列车。

作者似乎本意是想做钓鱼网站检测的，但是从交互到钓鱼网站检测仍有很多难题需要突破，故文章第二部分就进行了统计性分析。

2、如果网站做了防护，真实的用户可以访问到，而爬虫不会访问到，一直停留在

https://www-bitkub-login.com/?camp=jozao

![upload successful](/images/pasted-378.png)


3、截至2023年1月4日，代码复现基本完成，但在实际场景中效果较差，目前暂不清楚应该收集哪些数据，使用什么样的模型。下一步计划阅读其他论文找寻灵感。