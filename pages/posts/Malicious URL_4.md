---
layout: post
title: 恶意URL检测(四)五篇机器学习文章
tags: []
categories:
  - 恶意URL检测
author: 1ss4k
date: 2021-02-09 13:03:00
---
### 六、使用机器学习的恶意URL检测综述



文章标题：Malicious URL Detection using Machine Learning:A Survey，三位作者来自新加坡管理大学



1、特征分类

**(1)黑名单特征：**(改变一点就检测不到了)

**(2)词汇特征：**

传统的方法如下：

URL字符串的静态属性(如URL长度，每个属性的长度，特殊字符串的数量)、词袋、n-gram



[35]从URL中提取单词，生成字典，每个单词都成了一个特征，也就是词袋。但是它会丢失词的顺序。

[12] [28]在URL的各个部分之间做了区分。这会保留一些词的位置信息。

[36]不考虑单个的词，2个词为一组。

[37]考虑了特征的权重，基于 某个词是在一类中出现，还是在两类中都出现。

[38]认为 算法产生的域名 和人产生的域名，在字母与数字上有本质差别。字符的数量小，得到的特征也会少。他们计算了 KL-divergence，Jaccard系数，编辑距离。



高级方法如下：

[39]提出了5种特征，URL相关(关键词、长度等) ，域特征(域名长度，IP是否作为域名)，Directory相关的特征(长度、token数量)，文件名特征(文件名长度，分隔符的数量)，argument特征(argument长度、变量的数量)。

[40]基于Kolmogorov 复杂度。但是不适合大范围使用。

[41] [42] 定义了URL内部的相关性，

[43] 基于韵律，提出了新的距离：域名距离 和 路径名距离。



**(3)主机特征：**

这个特征是从URL的主机名属性中得到的。可以得到恶意主机的位置、身份、管理方式和属性等。



[12] [28] 提出了几个基于主机的特征：IP地址、WHO IS 信息、位置、域名属性、连接速度。

[44] 提出IP地址较难改变，可以作为重要特征。然而它难以直接利用，需要再提取一下特征。

[45] [46]检测了DNS流量特征，检测了通过代理隐藏身份的恶意URL。

[47] 提取HTTP响应头的头部特征，并且从时间戳中得到age信息。

[48] 提出了应用层的特征 和 网络层的特征，

[49] 从DNS log中 得到域名。



**(4)基于内容的特征：**

它需要下载整个网页。[50] 将网页内容分成以下5个部分

1) 词汇特征

2) HTML：[50] 提出了几个特征  

3) JavaScript：[50] 使用JavaScript中的函数作为特征。[19]提出了额外的启发式特征，

4) 视觉特征：计算与良性网站在视觉上的相似度。[59] 提出内容对比直方图。

5) 其他内容特征，如 active X

6) 特征总结：

主要从收集困难性、安全性，需要额外信息、需要花费的时间、特征的维度 这几个方面来考虑。汇总如下图：

![upload successful](/images/pasted-250.png)

2、ML算法

**(1)batch learning**

在训练之前可得完整的训练数据。

如SVM、逻辑回归、朴素贝叶斯、决策树、以及一些其他方法。



**(2)Online algorithms**

将数据作为流， 因此大小规模是可变的。可以分为一阶和二阶的以及花费敏感的。



**(3)Representation learning**

重点关注特征选择。



**(4)Others**

similarity learning：视觉 -> 图像，比较URL与良性URL的相似性。

string pattern matching：匹配特定字符。



3、可借鉴方法

可以借鉴"爬虫"和“网页分类”相关的研究技术。

此文章是一篇综述，让我对此方向的研究分类及进展有了一个大致的了解。

### 七、基于威胁情报和多分类器投票机制的恶意URL检测模型



1、特征选取

​	URL字符串中的点数、URL字符串的长度、URL字符串中包含的大写字母、字符串中包含的特殊字符、包含的IP地址。

​	数目需要进行一定的"归一化"处理。

2、敏感词汇

​	从威胁情报平台中，得到16个恶意URL常用的敏感词。

3、多分类器投票模型

​	用3个分类模型：决策树、朴素贝叶斯、SVM。

​	投票时不是一人一票，而是使用混淆矩阵(数学公式没懂)，

### 八、基于特征分析的URL检测

文章标题：Intelligent Malicious URL Detection with Feature Analysis，发表会议还行。

作者来自湾湾。



1、drive-by download攻击过程

![upload successful](/images/pasted-251.png)

2、现有技术分类

基于web的网络流量、URL关键字、web主机信息、web内容。



3、爬取数据

爬取Alexa上的url(具体过程见爬虫文章)。

但是我只能从[排行榜]得到共2000条url，此文章说可以选取了13027条，有的文章说爬取了100万条，不知道怎么操作的。

https://www.kaggle.com/cheedcheed/top1m?select=top-1m.csv 有数据集，100万条，直接下载，大小为22MB。

恶意数据 文中来自[11]的urlquery打不开，后面的倒是可以打开。文中选取的良性和恶意的比例是1:1。

本文用以下两个数据集

[1]https://github.com/foospidy/payloads 

个人感觉 ctf比赛中收集的数据不恰当，应该很大一部分没有攻击成功。除此之外，还有很多其他内容都不适合作为url。从中选取了几个比较恰当的文件进行合并为all.txt，约1.2万条数据。

[2] kaggle 一个文件，其中包含了bad数据约4.2万，good数据约37.7万。



4、特征(41个)

本文收集了41个特征，分别是从域信息、Alexa和混淆技术的特征得到的。

![upload successful](/images/pasted-252.png)


基于域的特征如下

![upload successful](/images/pasted-253.png)
...

还有很多，用到的时候直接看文章。

还有基于Alexa的特征、和基于混淆的。混淆特征都是从JavaScript中提取的。



5、预处理

使用ANOVA 和  XGBoost重要性 去选取最有用的特征。41个里面选取了17个，选取的结果如下


![upload successful](/images/pasted-254.png)

6、机器学习算法

使用XGboost，然后去调整 分类错误的特征的权重。

训练模型过程中还用到了10倍交叉验证。

文章比较了四种机器学习算法，发现还是XGboost的效果最好。



损失函数：大致就是差方的公式。



可以参考 https://www.cnblogs.com/techengin/p/8955781.html 安装xgboost。



收获：

1、本文通过ANOVA 和  XGBoost，来选取有用的特征。

2、本文选取了17个最有效的特征，自己可以直接用。

3、文中说基于树的算法效果比其他的要好。

4、这个还是没实现，因为它需要的特征比较多，不仅仅是url了，而且使用的xgboost没有安装成功。

### 九、基于Kolmogorov复杂度分析的恶意URL检测



会议级别：2012 IEEE/WIC/ACM International Conferences on Web Intelligence and Intelligent Agent Technology(2012年，时间很早了)

作者还是来自湾湾。



1、检测对象

本文不关注网页内容了，只关注url字符串！和我的目标是一样的～

通常恶意URL是批量产生的，有一定的规则。



2、数据来源

使用的数据来自于Trend Micro公司。 以及一些其他的数据集。

良性URL还是比恶意的多太多了～



3、kolmogorov复杂度

可以用来描述对象的熵或复杂度，定义为：能够输出改字符串的最小程序的长度s。

![upload successful](/images/pasted-255.png)

U是一般的图灵机，|p|表示程序的长度。

直觉上认为：产生循环重复的数字 比随机数字更加容易。

定义了有条件的Kol复杂度

![upload successful](/images/pasted-256.png)

他不方便直接计算，通常通过比较的方法来获得。

![upload successful](/images/pasted-257.png)

4、压缩器

本文使用了Deflate算法。

参考 https://blog.csdn.net/u013948858/article/details/53303052，由于文章比较老，使用的deflate算法基本已经被淘汰了。

初步实现编码解码的算法如下：

```python
import zlib
import base64

def decode_base64_and_inflate( b64string ):
    decoded_data = base64.b64decode( b64string )
    return zlib.decompress( decoded_data , -15)

def deflate_and_base64_encode( string_val ):
    zlibbed_str = zlib.compress( string_val )
    compressed_string = zlibbed_str[2:-4]
    return base64.b64encode( compressed_string )

text = b'okkkkk'

dec = deflate_and_base64_encode(text)
print(dec)

res = decode_base64_and_inflate(dec)
print(res)

```

结果如下
![upload successful](/images/pasted-258.png)

还有一种方法：

```python
import zlib

def deflate(data, compresslevel=9):
    compress = zlib.compressobj(
            compresslevel,        # level: 0-9
            zlib.DEFLATED,        # method: must be DEFLATED
            -zlib.MAX_WBITS,      # window size in bits:
                                  #   -15..-8: negate, suppress header
                                  #   8..15: normal
                                  #   16..30: subtract 16, gzip header
            zlib.DEF_MEM_LEVEL,   # mem level: 1..8/9
            0                     # strategy:
                                  #   0 = Z_DEFAULT_STRATEGY
                                  #   1 = Z_FILTERED
                                  #   2 = Z_HUFFMAN_ONLY
                                  #   3 = Z_RLE
                                  #   4 = Z_FIXED
    )
    deflated = compress.compress(data)
    deflated += compress.flush()
    return deflated

def inflate(data):
    decompress = zlib.decompressobj(
            -zlib.MAX_WBITS  # see above
    )
    inflated = decompress.decompress(data)
    inflated += decompress.flush()
    return inflated


text = b'okkkkk'
dec = deflate(text)
print(dec)

res = inflate(dec)
print(res)

```

结果如下：

![upload successful](/images/pasted-259.png)

注意！传入需要编码的需要是二进制流～ str.encode() 即可



5、完整流程

* 读取数据库中的url，以及要测试的s

* 连接字符串 并压缩

* 计算g及M

初始代码如下：

```python
#python3
#!/usr/bin/python
# -*- coding: UTF-8 -*-
import urllib
import urllib.parse
import sys
import zlib

def readurl(filename):
    filepath = 'data/' + filename
    data = open(filepath,'r').readlines()
    query_list = ''
    for d in data:
        d_encode = str(urllib.parse.unquote(d)).strip('\n')
        query_list += d_encode
    return query_list

def deflate(data, compresslevel=9):
    compress = zlib.compressobj(
            compresslevel,        # level: 0-9
            zlib.DEFLATED,        # method: must be DEFLATED
            -zlib.MAX_WBITS,      # window size in bits:
                                  #   -15..-8: negate, suppress header
                                  #   8..15: normal
                                  #   16..30: subtract 16, gzip header
            zlib.DEF_MEM_LEVEL,   # mem level: 1..8/9
            0                     # strategy:
                                  #   0 = Z_DEFAULT_STRATEGY
                                  #   1 = Z_FILTERED
                                  #   2 = Z_HUFFMAN_ONLY
                                  #   3 = Z_RLE
                                  #   4 = Z_FIXED
    )
    deflated = compress.compress(data)
    deflated += compress.flush()
    return deflated

def inflate(data):
    decompress = zlib.decompressobj(
            -zlib.MAX_WBITS  # see above
    )
    inflated = decompress.decompress(data)
    inflated += decompress.flush()
    return inflated


good_list = ''
bad_list = ''
good_list = readurl('test_goodqueries.txt')
bad_list = readurl('test_badqueries.txt')
dec_good1 = deflate(good_list.encode())
dec_bad1 = deflate(bad_list.encode())

s = "?id = 1' and '1' = 1"
good_list += s
bad_list += s


dec_good2 = deflate(good_list.encode())
dec_bad2 = deflate(bad_list.encode())
bad = len(dec_bad2) - len(dec_bad1)
good = len(dec_good2) - len(dec_good1)
print("g_bad is:",bad)
print("g_good is:",good)
M = (bad - good)/(bad+good)
print("M is:",M)
if M <= 0:
    print('bad_url')
else:
    print('good_url')

```

用20条数据去进行测试，发现能够初步识别出良性还是恶意的url！



然后选取了良性和恶意的分别60072条数据～

差不多10秒中之内就能判断出！



但是！用一个收集的恶意url去判断，判断出的所有恶意url都是良性的了...

但是M的值计算出的大多都是0.01～0.02 

如果用真正的良性url去判断，计算出的M值基本上都>0.15。

后续可以把M值的选取公式当做一个改进点～

恶意URL

![upload successful](/images/pasted-260.png)

真正的良性URL
![upload successful](/images/pasted-261.png)
然后本文将Kol...作为一个特征，结合机器学习算法去进行检验。

最后实验证明：使用Kol...作为预处理条件，删掉那些很明显可以分类的数据，然后再选取其他特征用机器学习算法进行分类，效果更好～

而且实验发现，Kol...的速度真的非常非常快～



收获：

1、Kol...可以作为一个特征，也可以预处理的时候使用

2、Kol...的改进方法在：计算的方法不单单使用length，而用更加复杂准确的东西。以及M的计算公式，阈值的选择～

### 十、加入自动特征生成 和 可解释方法(LIME)



直接用数据集测试，查看生成的结果。

有时会有报错

![upload successful](/images/pasted-262.png)
解决过程如下：

1、参考 https://blog.csdn.net/qq_34192019/article/details/100011839

```python
echo 3 > /proc/sys/vm/drop_caches 
```

无效



2、

修改代码线程部分，n_cores=20 改为n_cores=1。

还是错误🙅



3、swap

参考https://stackoverflow.com/questions/1367373/python-subprocess-popen-oserror-errno-12-cannot-allocate-memory 

```python
$sudo dd if=/dev/zero of=/swapfile bs=1024 count=1024k
$sudo mkswap /swapfile
$sudo swapon /swapfile
```

成功！



```python
get_scan_rules
scan directoin: backward
Found 2000 sequences
Creating distance matrix start.
Distance matrix complete.
matrix done in 69.239s.
Start clustering...
Finish clustering...
[['8080/tienda1/publico/vaciar.jsp?b2a=vaciar+carrito'], ['&precio', '&cantidad', '&b1', '=a adir+al+carrito'], ['lico/entrar.jsp?errormsga=credenciales+incorrectas'], ['gethttp://localhost:8080'], ['0aset-cookie%3a+tamper%3d1041264011025374727%0d%0a'], ['tp://localhost:8080/tienda1/'], ['&precio', '&cantidad', '&b1', '=a adir+al+carrito'], ['/pagar.jsp?modo', '=insertar', '&precio', '&b1', '=confirmar'], ['set-cookie%3a+tamper%3d1041264011025374727'], ['r.jsp?modo=insertar&precio=', '&b1=pasar+por+caja/'], ["','0','0');waitfor+delay+'0:0:15';--"], ['r.jsp?modo=insertar', '&precio', '&b1', '=pasar+por+caja'], ['t%3ealert%28paros%29%3c%2fscript%3e.parosproxy.org'], ['&precio=', '&cantidad=', '&b1=a adir+al+carrito'], ['ost:8080/tienda1/publico/caracteristicas.jsp?id'], ['r.jsp?modoa=insertar&precio=', '&b1=pasar+por+caja'], ['<!--#exec+cmd="rm+-rf+/;cat+/etc/passwd"+-->'], ['aurl%28javascript%3aalert%28%27paros%27%29%29&id=2'], ['ny%', '%0aset-cookie%3a+tamper%3d5765205567234876235']]
~~~~~~~~~~~~~scan rule~~~~~~~~~~~~~~~~
Dataframe len: 2000
Before dupicated removal: 19
After dupicated removal: 18
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                                          rule_strings  rule_type                                              regex
1        [&precio, &cantidad, &b1, =a adir+al+carrito]          1  ^(?=.*&precio)(?=.*&cantidad)(?=.*&b1)(?=.*=a ...
2        [&precio=, &cantidad=, &b1=a adir+al+carrito]          1  ^(?=.*&precio=)(?=.*&cantidad=)(?=.*&b1=a adir...
3               [','0','0');waitfor+delay+'0:0:15';--]          1     ^(?=.*','0','0'\);waitfor\+delay\+'0:0:15';--)
4    [/pagar.jsp?modo, =insertar, &precio, &b1, =co...          1  ^(?=.*/pagar\.jsp\?modo)(?=.*=insertar)(?=.*&p...
5    [0aset-cookie%3a+tamper%3d1041264011025374727%...          1  ^(?=.*0aset-cookie%3a\+tamper%3d10412640110253...
..                                                 ...        ...                                                ...
672                                [patient, register]          2                       ^(?=.*patient)(?=.*register)
673                                 [posthttp, vaciar]          2                        ^(?=.*posthttp)(?=.*vaciar)
674                                  [puthttp, vaciar]          2                         ^(?=.*puthttp)(?=.*vaciar)
675                           [servlet, simpleservlet]          2                  ^(?=.*servlet)(?=.*simpleservlet)
676                              [tracam, unda, wendi]          2                 ^(?=.*tracam)(?=.*unda)(?=.*wendi)

[676 rows x 3 columns]
--------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------
Reinforce iteration loop 1
Seed rules number: 676
Rule matching start...
before compress 670
after compress 412
Rule matching finished...
{'acc': 0.7725, 'fpr': 0.062225, 'rec': 0.775893, 'rec_scan': 0.521468, 'rec_lime': 0.478532}
get_scan_rules
scan directoin: backward
Found 370 sequences
Creating distance matrix start.
Distance matrix complete.
matrix done in 2.038s.
Start clustering...
Finish clustering...
[['gethttp://localhost:8080']]
~~~~~~~~~~~~~scan rule~~~~~~~~~~~~~~~~
Dataframe len: 370
Before dupicated removal: 1
After dupicated removal: 1
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
New rein rules number: 149
--------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------
Reinforce iteration loop 2
Seed rules number: 561
Rule matching start...
before compress 538
after compress 535
Rule matching finished...
{'acc': 1.0, 'fpr': 0, 'rec': 0, 'rec_scan': 0, 'rec_lime': 0}  #!!!这么强！
Validation finished, metrics is fine.
Rule matching start...
before compress 535
after compress 535
Rule matching finished...
The final results are:
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
Matched rules total : 86
{'acc': 0.7735, 'fpr': 0.002611, 'rec': 0.458034, 'rec_scan': 0.007853, 'rec_lime': 0.992147}
                                          rule_strings  rule_type                                              regex  duplicate
3    [r.jsp?modoa=insertar&precio=, &b1=pasar+por+c...          1  ^(?=.*r\.jsp\?modoa=insertar&precio=)(?=.*&b1=...          0
4               [066empe0a6c0a, burch, login, tienda1]          2  ^(?=.*066empe0a6c0a)(?=.*burch)(?=.*login)(?=....          0
6    [0aset, 3d1041264011025374727, carritoany, tam...          2  ^(?=.*0aset)(?=.*3d1041264011025374727)(?=.*ca...          0
7                                      [0aset, cookie]          2                           ^(?=.*0aset)(?=.*cookie)          0
10                                      [100, nombrea]          2                            ^(?=.*100)(?=.*nombrea)          0
..                                                 ...        ...                                                ...        ...
526                 [entrar, modo, muletillera, vivek]          2  ^(?=.*entrar)(?=.*modo)(?=.*muletillera)(?=.*v...          0
530                       [examples, hitcount, webapp]          2          ^(?=.*examples)(?=.*hitcount)(?=.*webapp)          0
539                           [htm, samples, sampsite]          2              ^(?=.*htm)(?=.*samples)(?=.*sampsite)          0
545                                       [inc, pagar]          2                              ^(?=.*inc)(?=.*pagar)          0
546                           [injected_param, vaciar]          2                  ^(?=.*injected_param)(?=.*vaciar)          0

[86 rows x 4 columns]
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
Final validation finished
```

结果如下：

```python
match_res:                                                     text  ...  rule_num
47192  gethttp://localhost:8080/tienda1/miembros/imag...  ...         0
58771  posthttp://localhost:8080/tienda1/publico/entr...  ...         0
41799  gethttp://localhost:8080/tienda1/miembros/sali...  ...         0
40562  gethttp://localhost:8080/tienda1/publico/vacia...  ...         0
48933  gethttp://localhost:8080/tienda1/imagenes/nues...  ...         0
...                                                  ...  ...       ...
33022         gethttp://localhost:8080/tienda1/index.jsp  ...         0
1641   posthttp://localhost:8080/tienda1/publico/aute...  ...         0
8874   posthttp://localhost:8080/tienda1/publico/vaci...  ...       312
6705   gethttp://localhost:8080/tienda1/publico/pagar...  ...         0
47296  gethttp://localhost:8080/tienda1/global/credit...  ...         0
[2000 rows x 4 columns]

rules_tobe_validate                                           rule_strings  ...  duplicate
1    [ny%, %0aset-cookie%3a+tamper%3d57652055672348...  ...          0
4    [r.jsp?modoa=insertar&precio=, &b1=pasar+por+c...  ...          0
5             [066empe0a6c0a, autenticar, burch, modo]  ...          0
6                     [0ara7s5o, 8080, gethttp, login]  ...          0
7          [0aset, 3d5765205567234876235, manchegoany]  ...          0
..                                                 ...  ...        ...
581                               [monstruosidad, nn8]  ...          0
582                 [muletillera, pwd, tienda1, vivek]  ...          0
583                       [pazguat5, remember, vander]  ...          0
584                                        [pugh, rba]  ...          0
585                             [savoie, tienda1, uni]  ...          0
[560 rows x 4 columns]

matched_rules                                           rule_strings  ...  duplicate
1    [ny%, %0aset-cookie%3a+tamper%3d57652055672348...  ...          0
4    [r.jsp?modoa=insertar&precio=, &b1=pasar+por+c...  ...          0
5             [066empe0a6c0a, autenticar, burch, modo]  ...          0
15                         [1252, insertar, jsp, modo]  ...          0
18                                   [1331, confirmar]  ...          0
..                                                 ...  ...        ...
546                     [dsnform, exe, scripts, tools]  ...          0
554                       [examples, hitcount, webapp]  ...          0
569                                       [inc, pagar]  ...          0
570                 [injected_param, posthttp, vaciar]  ...          0
582                 [muletillera, pwd, tienda1, vivek]  ...          0

[96 rows x 4 columns]
```



目前还不知道这些检测结果要怎么用，先保存下来。

```python
import pandas as pd
import numpy as np
#要保存的是：match_result、rules_tobe_validate、matched_rules
match_result.to_csv('match_result.csv', sep=',', header=True, index=True)
rules_tobe_validate.to_csv('rules_tobe_validate.csv', sep=',', header=True, index=True)
matched_rules.to_csv('matched_rules.csv', sep=',', header=True, index=True)
```

保存结果如下：

![upload successful](/images/pasted-263.png)