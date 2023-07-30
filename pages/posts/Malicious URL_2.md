---
layout: post
title: 恶意URL检测(二)用户角度SVM
tags:
  - 恶意url检测
categories:
  - 恶意URL检测
date: 2021-01-23 16:37:00
---
# 一、机器学习实现恶意URL检测

文章3地址 https://coldwave96.github.io/2019/11/08/MaliciousURLs/



1、处理数据

POST请求，URL要加上请求的主体内容。



2、改进点

* 细分攻击类型
* 优化TF-IDF，如考虑词袋+TF-IDF，或利用TF- IDF将URL中不重要的部分进行泛化处理。
* 使用深度学习



3、词袋+TF-IDF+cnn

文章3给出的参考代码中(https://github.com/Coldwave96/MaliciousURLs)，给出了第二/三个改进点的代码，大致思路如下

```python
#get_features_by_wordbag_tfidf()
    x = vectorizer.fit_transform(queries)
    x = x.toarray()
    transformer = TfidfTransformer(smooth_idf=False)
    tfidf = transformer.fit_transform(x)
    x = tfidf.toarray()
    return x, y

  #分割数据集
 x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.4, random_state=0)

#do_cnn_wordbag_tfidf(x_train, x_test, y_train, y_test)
    trainX = pad_sequences(trainX, value=0.) 
    testX = pad_sequences(testX, value=0.) #填充

    trainY = to_categorical(trainY, nb_classes=2)
    testY = to_categorical(testY, nb_classes=2)#将类别向量转换为二进制（只有0和1）的矩阵类型表示

    network = input_data(name='input')
    network = tflearn.embedding(network, input_dim=1000000, output_dim=128)
    branch1 = conv_1d(network, 128, 3, padding='valid', activation='relu', regularizer="L2")
    branch2 = conv_1d(network, 128, 4, padding='valid', activation='relu', regularizer="L2")
    branch3 = conv_1d(network, 128, 5, padding='valid', activation='relu', regularizer="L2")
    network = merge([branch1, branch2, branch3], mode='concat', axis=1)
    network = tf.expand_dims(network, 2)
    network = global_max_pool(network)
    network = dropout(network, 0.8)
    network = fully_connected(network, 2, activation='softmax')
    network = regression(network, optimizer='adam', learning_rate=0.001, loss='categorical_crossentropy', name='target')

    model = tflearn.DNN(network, tensorboard_verbose=0)
    model.fit(trainX, trainY, n_epoch=5, shuffle=True, validation_set=(testX, testY), show_metric=True, batch_size=100, run_id="url")

```

代码不太能看懂，是使用了tflearn训练CNN模型，具体可参考 https://blog.csdn.net/luoyexuge/article/details/78243117



4、改进版本1---从pcap中提取数据

随后作者提出了改进版本，文章4地址 https://coldwave96.github.io/2020/04/20/MaliciousURLs2/ 代码4地址https://github.com/Coldwave96/MaliciousUrls_Part2

第一个改进的点是 从pcap中提取url。核心代码如下

```python
def get_url(pkt):
    if not pkt.haslayer(http.HTTPRequest):
        # This packet doesn't contain an HTTP request so we skip it
        return
    http_layer = pkt[http.HTTPRequest].fields
    req_url = http_layer['Path'].decode() + '\n'
    req_list.append(req_url)
```



5、改进2---扩展了新的数据集

从安全设备上收集了部分数据集，虽然覆盖面不是很广，但也算是一个小小的进展。

模型还用到kmeans进行降维，但是我之前已经看过了，此处不再记录。



# 二、基于URL的恶意访问检测方法



文章地址 https://www.doc88.com/p-0428451872060.html

发表于 通信学报



1、特征

**(1)时间窗口内域名访问相似度D，来剔除大部分规律频发流量，即良性的访问**。D为欧式距离。

参考https://www.cnblogs.com/gegemu/p/9968014.html 欧式距离计算如下

```python
import numpy as np
x=np.random.random(10)
y=np.random.random(10)
 
#方法一：根据公式求解
d1=np.sqrt(np.sum(np.square(x-y)))
 
#方法二：根据scipy库求解
from scipy.spatial.distance import pdist
X=np.vstack([x,y])           #将x,y两个一维数组合并成一个2D数组 ；[[x1,x2,x3...],[y1,y2,y3...]]
d2=pdist(X)                  #d2=np.sqrt(（x1-y1)
```

![upload successful](/images/pasted-232.png)

D越小，访问约有规律，越可能是良性数据。



**(2)URI参数信息熵H**

攻击的URI一般需要携带很多参数，熵就会较大。

文中用到了Levenshtein算法。算法原理见文章 https://blog.csdn.net/lijieshare/article/details/84832984

代码如下

```python
#python2

def minDistance(word1, word2):
    if not word1:
        return len(word2 or '') or 0

    if not word2:
        return len(word1 or '') or 0

    size1 = len(word1)
    size2 = len(word2)

    last = 0
    tmp = range(size2 + 1)
    value = None

    for i in range(size1):
        tmp[0] = i + 1
        last = i
        # print word1[i], last, tmp
        for j in range(size2):
            if word1[i] == word2[j]:
                value = last
            else:
                value = 1 + min(last, tmp[j], tmp[j + 1])
                # print(last, tmp[j], tmp[j + 1], value)
            last = tmp[j+1]
            tmp[j+1] = value
        # print tmp
    return value

print(minDistance('intention','execution'))

```

它用来衡量两个文本之间的相似度，值越大，说明越不相似。求出ld。

字符串S与T的相似度求解如下：LCS是最长公共子串。

![upload successful](/images/pasted-233.png)

下面进行聚类，分成K类。最后信息熵计算如下：

![upload successful](/images/pasted-234.png)

熵越大，越可能是恶意数据。



**(3)异常时间访问频发度P**

(即功率谱密度)

此处用到随机过程的知识。可以得到时间序列x(t)的异常时间频发度。

值越大，越有可能是恶意数据。



**(4)设备类型异样性P**

设备种类越多，P值越大

![upload successful](/images/pasted-235.png)

**(5)网站标签分类**

目的是剔除：高频善意流量。

方法：深度包检测。

结合应用协议的特征，判断流量所属的应用。此处指找出是否是HTTP应用。



提取出以上5个特征之后，将日志向量化。



2、模型

模型使用 混合高斯聚类算法。

步骤如下：

​	求出样本集的各个参数 ---> 求出样本的后验概率 ---> 迭代确定模型的参数，确定簇的划分 ---> 得到新的特征向量。 



3、实验

角度：用户访问行为是否恶意。数据是以用户为单位，输出其7天内的访问数据集.cvs文件。

实验发现：网站标签分类效果不好，可能原因是 还无法Https等加密流量。

参数选择：根据下图

![upload successful](/images/pasted-236.png)

可以看出，当聚类数目K=2时，参数选择 完全协方差矩阵，效果最好～



收获及启发

1、恶意访问不仅包括一些普通攻击，也包括恶意爬虫，恶意软件访问等。此处最好还是专注于研究一个：恶意URL。

2、有人提出基于URL词汇特征 和 wHOIS信息的静态挖掘模型。

3、本文用到的几个特征都挺有道理的，具有参考性。

4、之前看到的文章用了Kmeans，是用来预处理的时候对数据进行降维处理的。此处的聚类模型就是我们的分类模型，用来划分良性和恶意数据。

5、本文的检测角度不是再针对于单个URL了，而是分析用户的行为，看是否属于恶意访问。

# 三、基于URL的恶意访问识别系统的设计与实现

​	本文是一篇硕士毕业论文，也是前一篇文章的超长扩展版，作者来自于北京邮电大学，时间为2019年，较新。笔记也按照作者的写作思路来记录。



**1、绪论**

本文选用人工标记与聚类相结合的方法，人工校正一部分比较模糊的结果。

采用S4VM模型



**2、相关技术**

1、Levenshtein距离

P5有个小错误，应该是值越大，字符串的相似度越小。

2、深度包检测 DPI

但是，加密数据不可见

3、信息熵

量化了不确定性

4、层次聚类

是聚类的一种。

...(省略了几个，因为去上厕所了没做笔记)

5、平均功率谱密度

定义：随机过程的自相关函数的傅立叶变换。

6、半监督分类算法

可以使用未标记的数据

7、半监督支持向量机

软间隔：允许在一些样本上出错。

8、评估指标

混淆矩阵

准确率：预测对了的/总共的 (但是有可能存在准确度悖论)

ROC曲线：真阳性为纵坐标，假阳性为横坐标

AUC：ROC曲线围成的面积



**3、模型**

恶意访问的特性：

[非规律高频性、大量访问参数、时间异常性、访问设备多样性、应用类型未知性]

为了结果有更高的准确性，将模型输出结果中：恶意概率为[0.3,0.7]区间内的结果重新进行人工划分。

具体求解的时候采用了模拟退火方法。

评估：训练集与测试集 9:1，还选取了模型参数。实验发现选择数据集D5效果最好，RBF核函数优于线性函数，并且选择的参数，C1=40，C2=10，gamma=0.2



**4、5、6恶意访问识别系统设计**

之前说的内容大部分都在小论文中包含了，这里是系统设计的步骤。

输入的数据来源于网络日志，并且是以用户为单位的。

前面的才是比较重要的内容，感觉后面的都是凑字数的...



然后写了各个模块的功能，用Django框架，以及各个模块怎么实现。



**7、总结与展望**

总结不说了，展望如下：

(1)设计的系统， 引入对系统的鉴权，明确各个角色的不同权限。阻止他们对超过自己权限的访问。

(2)优化前端页面

...对我没什么用处



收获：

1、可以用人工标记的方法配合模型。

2、对于用哪部分数据 以及参数如何选择，可以提前进行一下小测验，选出我们最优的参数。

3、写毕业论文的时候，如果字数不够，可以用系统设计的步骤来凑字数，就是什么什么模块的功能之类的。