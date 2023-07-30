---
categories: 恶意URL检测
date: 2021-01-04 11:40:07
layout: post
tags: null
title: 恶意URL检测(一)
---

前言：毕设选择了这个题目，此文章来记录一下学习过程，希望自己能够设计出一个比较好的系统！

## 用机器学习玩转恶意URL检测

文章链接 https://www.freebuf.com/articles/network/131279.html



模型：逻辑回归



步骤：

1、分别拿到正常请求和恶意请求的数据集。

参考 https://github.com/Echo-Ws/UrlDetect

使用里面的文件(queries)，良性数量约130万，恶意数据约4.8万。


![upload successful](/images/pasted-215.png)

下文要用到scikit-learn，此处安装。

scikit-learn安装：参考 https://blog.csdn.net/qq_26192973/article/details/51925323

```python
#先安装numpy
pip3 install numpy scipy matplotlib -i https://pypi.tuna.tsinghua.edu.cn/simple
#使用numpy的时候要用python2.7版本，3版本不行呢。
#后来尝试3版本也可以了。

#安装scipy
pip安装的时候发现已经有了，提示如下
Requirement already satisfied: scipy in /usr/local/lib/python2.7/site-packages (1.2.2)
Requirement already satisfied: numpy>=1.8.2 in /usr/local/lib/python2.7/site-packages (from scipy) (1.16.6)

#安装scikit-learn
pip install -U scikit-learn
#要加-U，没有-U的话会安装失败
```

Sklearn中包含众多机器学习方法，功能较为强大。



2、对无规律的数据集进行处理得到特征矩阵。



首先进行分词处理，选择长度为3。长度后期可调

没有找到合适的工具(jieba分词也不合适)，自己写一个函数

```python
def cut(url_integrity,length):
	cut_url = ''
	while (len(url_integrity) >= 3 ): # >=3，即最后剩下3个一组，就不再往下划分了
		cut_url +=  url_integrity[0:3] + 'use_to_split' #用一个较为复杂的单词用来分组，如果用空格会有错误，url中本来可能就有空格。
		url_integrity = url_integrity[1:] 
	return cut_url
#输入单个url，分词长度

cut_length = 3
res_fenci = [] #list类型
f = open("test_badqueries.txt")
line = f.readline()
bad_queries = ''
while line:
	line = line.strip('\n')
	bad_queries = bad_queries + line
	res_cut = cut(line,cut_length) #分词
	res_cut = res_cut.split('use_to_split') #划分开
	res_cut = res_cut[0:len(res_cut)-1] #最后有一个空格，删掉
	res_fenci.extend(res_cut) #连接list
	line = f.readline()
f.close()
#print(bad_queries)

print(res_fenci)

```



需要找到文本的数字特征，用来训练我们的检测模型。

此处使用TF-IDF来作为文本的特征，并以数字矩阵的形式进行输出。

参考https://towardsdatascience.com/natural-language-processing-feature-engineering-using-tf-idf-e8b9d00e7e76



测试脚本

```python
#ipython

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer

documentA = 'the man went out for a walk'
documentB = 'the children sat around the fire'
bagOfWordsA = documentA.split(' ')
bagOfWordsB = documentB.split(' ')	#以空格为界限把内容分开，并且删除空格。
#bagOfWordsC = documentB.split('c') 可以用这句话来理解.split的作用

uniqueWords = set(bagOfWordsA).union(set(bagOfWordsB)) 

numOfWordsA = dict.fromkeys(uniqueWords, 0)
for word in bagOfWordsA:
    numOfWordsA[word] += 1
numOfWordsB = dict.fromkeys(uniqueWords, 0)
for word in bagOfWordsB:
    numOfWordsB[word] += 1
#创建字典并统计频数

```

在nlp中还有一个去除噪声词的操作，如去除'the'。此处由于对象是url，故不再去除。



TF- IDF计算


![upload successful](/images/pasted-216.png)

TF :

```python
def computeTF(wordDict, bagOfWords): #传入字典wordDict，bagOfWords
    tfDict = {}
    bagOfWordsCount = len(bagOfWords) #计算有效单词的个数
    for word, count in wordDict.items():
        tfDict[word] = count / float(bagOfWordsCount) 
    return tfDict
```

传入的`wordDict`记录的是频率，`bagOfWords`是 ‘ ’ 分后的所有单词。


![upload successful](/images/pasted-217.png)


A、B的tf计算如下：

```python
tfA = computeTF(numOfWordsA, bagOfWordsA)
tfB = computeTF(numOfWordsB, bagOfWordsB)
```



IDF:

```python
def computeIDF(documents):
    import math
    N = len(documents)
    
    idfDict = dict.fromkeys(documents[0].keys(), 0)
    for document in documents:
        for word, val in document.items():
            if val > 0: #检测是否包含该文档
                idfDict[word] += 1
    
    for word, val in idfDict.items():
        idfDict[word] = math.log(N / float(val))
    return idfDict
```



```python
idfs = computeIDF([numOfWordsA, numOfWordsB])
```



计算TF-IDF

```python
def computeTFIDF(tfBagOfWords, idfs):
    tfidf = {}
    for word, val in tfBagOfWords.items():
        tfidf[word] = val * idfs[word]
    return tfidf

tfidfA = computeTFIDF(tfA, idfs)
tfidfB = computeTFIDF(tfB, idfs)

df = pd.DataFrame([tfidfA, tfidfB])

```



以上是TF-IDF计算的内部机理，也可以直接用sklearn来实现。

```python
from sklearn.feature_extraction.text import CountVectorizer  

vectorizer = TfidfVectorizer()
vectors = vectorizer.fit_transform([documentA, documentB])
feature_names = vectorizer.get_feature_names()
dense = vectors.todense()
denselist = dense.tolist()
df = pd.DataFrame(denselist, columns=feature_names)

from sklearn.feature_extraction.text import TfidfTransformer
```



关于sk-learn，参考博客https://www.cnblogs.com/guofeng-1016/p/10873440.html



本篇文章源码参考 https://github.com/exp-db/AI-Driven-WAF



测试脚本代码如下

```python
import numpy as np
from sklearn.model_selection import train_test_split

X, y = np.arange(10).reshape((5, 2)), range(5)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.33, random_state=42)
```

可以在ipython中进行单步执行，但是在py脚本中` from sklearn.model_selection import train_test_split` 这句话会报错，不知道为什么(现在知道了，是因为版本问题，python3没安装成功，需要python2执行)。



读取txt中内容的代码如下：

```python
f = open("test_badqueries.txt")
line = f.readline()
bad_queries = ''
while line:
	bad_queries = bad_queries + line
	line = f.readline()
f.close()
print(bad_queries)
```

对数据集进行分割，取出一部分作为测试数据。使用scikit-learn

```python
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score
from sklearn import datasets

iris = datasets.load_iris() # 导入数据集
X = iris.data # 获得其特征向量
y = iris.target # 获得样本label
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

```



3、使用机器逻辑回归方式使用特征矩阵训练检测模型

sk-learn中得到数据之后，训练模型的方法。参考https://www.cnblogs.com/guofeng-1016/p/10873440.html

格式都差不多。



4、最后计算模型的准确度，并使用检测模型判断未知 URL 请求是恶意的还是正常的。

效果还可以，但是原来的文件给的模型都是5MB左右，自己可能是训练数据比较小。

代码实现如下

问题1：python3中安装了 sk-learn，但脚本中不能导入

可能是python3.8的版本问题，改为用python2。在运行脚本的时候也要用python2。

参考 https://www.jianshu.com/p/fcb7256fcbd5，再安装sklearn2pmml和sklearn_pandas库。

sklearn_pandas库安装版本 sklearn-pandas-1.8.0

其中还安装了 joblib-0.14.1



问题2: urllib.parse报错

    d = str(urllib.parse.unquote(d))

AttributeError: 'module' object has no attribute 'parse'

参考 https://stackoverflow.com/questions/41501638/attributeerror-module-urllib-has-no-attribute-parse 删除 .parse

失败...

改来改去真的很麻烦...还是参考人家的思路自己写一下。



### 读取数据



大致格式如下



```python
#读取数据
directory = str(os.getcwd()) + '/data/test'
filepath = directory + '/test2.txt'
data = io.open(filepath,'r',encoding='utf-8').readlines()
query_list = []
for d in data:
    d_encode = str(urllib.unquote(d))
    query_list.append(d_encode)
query_list = list(set(query_list))
```



一些小细节：

1、open函数里面，如果不加前面的io，就不能设置encoding='utf-8'

2、urllib.unquote是为了 解编码

3、list(set( )) 函数，是为了去重并且并按从小到大排序



并且由于字符编码问题，需要在脚本最前面加上如下语句

```python
import sys
reload(sys)
sys.setdefaultencoding("utf-8")
```

### 训练数据

包括了一些预处理操作，如加标签、分词等

```python
good_y = [0 for i in range(0, len(good_query_list))]
bad_y = [1 for i in range(0, len(bad_query_list))]

queries = good_query_list + bad_query_list
y = good_y + bad_y

vectorizer = TfidfVectorizer(tokenizer=get_ngrams)
X = vectorizer.fit_transform(queries)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=20, random_state=42)

```



注意：

1、`TfidfVectorizer(tokenizer=get_ngrams)` 中的`get_ngrams`是一个预先定义好的函数，用来进行分词操作。

```python
def get_ngrams(query):
    tempQuery = str(query)
    ngrams = []
    for i in range(0, len(tempQuery)-3):
        ngrams.append(tempQuery[i:i+3]) #添加到list的末尾
    return ngrams
```

### 保存模型

有以下两种方法, sklearn与java跨平台使用。自己用joblib保存即可。

```python
#sklearn2pmml(lgs, '.\lgs.pmml', with_repr=True)
joblib.dump(lgs, 'filename.pickle')
```

读取模型的时候使用语句 `lgs = joblib.load('filename.pickle')`

### 预测阶段

读取新的需要预测的数据，进行预测

```python
testurls = test_query_list('test2.txt')
pre_res = predict(testurls)
```

预测函数如下

```python
def predict(newQueries):
    newQueries = [urllib.unquote(url) for url in newQueries]
    X_predict = vectorizer.transform(newQueries)
    res = lgs.predict(X_predict)
    res_list = []
    for q,r in zip(newQueries, res):
        tmp = '0' if r == 0 else '1'
        q_entity = cgi.escape(q)
        res_list.append({'url':q_entity, 'res':tmp})
        res_list.append('\n')
        print("预测的结果",q_entity,tmp)
        print('\n')
    #print("预测的结果列表:{}".format(str(res_list))) 这样输出会一团乱
    return res_list
```



结束！然后训练了一下，模型大概	700KB，比原来的5MB小了很多。

预测的时候预测的所有的URL都是良性的。自己加了一条sql注入，检测出来了！完美！！

![upload successful](/images/pasted-179.png)

## 通过机器学习识别恶意url

此文章是上篇文章的改进版本，文章地址：https://blog.csdn.net/solo_ws/article/details/77095341

代码地址：https://github.com/Echo-Ws/UrlDetect



1、小问题：关于导入库

`**from** sklearn.feature_extraction.text **import** TfidfVectorizer`的时候报错

解决：

前面加上

```python
import os
import io
import urllib
import sys
reload(sys)
sys.setdefaultencoding("utf-8")
import cgi
```

即可



2、代码思路

初始化定义 ---> 读入数据 ---> 加上标签 ---> 确定分词的规则 ---> 定义vectorizer ---> 将不规律的文本字符转为规律的矩阵X ---> 对X降维 ---> 训练模型 ---> 测试模型的效果 ---> 输入预测数据进行预测



3、kmeans 降维

本文还使用了kmeans降维。之前没了解过，具体参考如下文章。

https://www.cnblogs.com/lliuye/p/9144312.html (基本思想)

收获：

* MinMaxScaler是进行归一化处理，默认范围是(0,1)



文中降维函数主要语句如下

```python
def kmeans(weight):
    printT('kmeans之前矩阵大小： ' + str(weight.shape))
    weight = weight.tolil().transpose() #读取系数矩阵是做的一个转换操作

#        # 同一组数据 同一个k值的聚类结果是一样的。保存结果避免重复运算
    try:
        with open('model/k' + str(k) + '.label', 'r') as input:
            printT('loading kmeans success')
            a = input.read().split(' ')
            label = [int(i) for i in a[:-1]]

    except IOError:
        printT('Start Kmeans ')
        clf = KMeans(n_clusters=k, precompute_distances=False )
        s = clf.fit(weight)
        printT(s)
        # 保存聚类的结果
        label = clf.labels_
            # with open('model/' + self.getname() + '.kmean', 'wb') as output:
#            #     pickle.dump(clf, output)
#            with open('model/k' + str(k) + '.label', 'w') as output:
#                for i in self.label:
#                    output.write(str(i) + ' ')
        printT('kmeans 完成,聚成 ' + str(k) + '类')
    return weight
#
#    #     转换成聚类后结果 输入转置后的矩阵 返回转置好的矩阵
```



原本的X矩阵如下


![upload successful](/images/pasted-218.png)

weight就是传入的X

`weight = weight.tolil().transpose() ` 这个语句是将系数矩阵做一个转换操作

转换前的X和转换后的weight的shape如下


![upload successful](/images/pasted-219.png)

最后得到的结果是label。但是return的是转换了一下的矩阵weight。



并且还用到了transform()函数。查看代码发现，只有用到了kmeans，才会用到此函数。所以估计此函数是用来对weight进行格式转换的。

```python
if use_k:
        X = transform(kmeans(X))
```



label如下

```python
#每行17个数
array([16, 20,  1, 33, 57, 78, 34, 34, 10, 45,  0, 24, 77,  0, 53,  0,  0,
        8, 10, 10,  9, 78, 47, 10, 19, 16, 53, 54,  0, 11, 34, 39,  9, 10,
       30, 15, 51, 30, 61, 22, 16, 57, 15, 61, 15, 15, 51,  9,  9, 16, 11,
       57, 15,  0, 53, 40,  0, 66, 46, 43, 68, 32,  0,  0,  0, 45,  0, 72,
        0, 10, 30, 63, 53, 48, 10, 47, 14, 10, 19,  0, 14, 39, 31, 19, 34,
       51, 31, 78, 16, 58,  0, 10, 47, 39, 78, 51, 78, 10,  6, 47, 11, 53,
       74, 48,  0, 10, 10,  2, 10, 10,  0,  0, 19,  6, 30, 10, 30, 10, 10,
       10, 11, 35, 21, 51, 30, 27, 21, 20, 18, 21, 20, 35, 13, 37,  7, 37,
       21, 21, 25, 41,  1, 22, 29, 20, 17, 34, 16, 34, 19, 35, 53,  1, 53,
       60,  0,  3, 22, 77, 22, 76, 77,  0,  3,  0,  0, 47, 34, 26, 34,  1,
       49, 34, 45, 17,  1, 39, 34,  0, 23,  0,  0, 35, 10, 78, 77, 34, 23,
       10, 67, 34, 50,  3,  9, 61, 70, 53, 19, 51, 12, 73, 71, 45,  1, 45,
       63, 63,  0, 60, 77,  0, 53, 15, 47,  3,  0,  0, 35,  0, 10, 63,  0,
       75,  0, 17,  0,  9, 11,  0, 24, 67,  1, 44, 24,  0, 14, 22, 63, 35,
        0,  3,  3, 24, 22, 31, 22, 45, 39, 73, 63, 69, 16, 60, 75, 47, 24,
       10,  0, 10,  0, 53, 19, 53, 10, 35, 17,  0, 72, 31, 77, 14, 19, 53,
       77, 72, 47, 72,  0,  0,  3,  0, 22, 34, 77, 67, 19,  0,  0, 44, 31,
       17, 22,  3,  3,  9,  9, 53, 53, 11,  0, 57, 39, 27, 16,  0, 24, 45,
       16, 77,  0, 16, 53, 58, 20, 22,  0,  0,  0,  0, 22, 17, 23, 64,  3,
       15, 15, 51, 15, 51, 35, 35, 16, 31, 35, 16, 35, 41, 58, 54, 72, 10,
       47, 10,  0, 10, 47,  0, 35, 79, 35,  3,  9, 17, 37,  8, 55, 12, 56,
       22,  3,  9,  0, 16, 23, 59, 35, 31,  3,  3,  0,  0, 16, 10, 53, 78,
       64, 36, 28,  1, 31, 50, 13,  7, 18, 21,  5, 52, 50,  8, 68, 10, 34,
        0, 27, 17, 16,  7, 66,  3, 68,  1, 53, 64, 43, 39,  0, 78,  0, 20,
       48, 30, 20, 20,  0, 20, 41, 29,  1,  1, 11, 65,  0, 25, 16,  4, 11,
       12, 41, 62, 16,  3,  0, 19, 10, 10, 41, 10,  3,  9, 47, 50, 20, 66,
        0, 54,  3, 40,  3, 35,  0, 10, 20, 50,  0,  0, 20,  1,  6, 26, 78,
        7, 58, 38, 45, 40,  0, 35, 21,  0,  0,  3, 72, 53, 27, 19, 62, 20,
        5, 26, 20,  1, 52, 41,  0, 66, 10, 37, 21,  3, 16,  0, 22, 21, 46,
       31, 50,  0, 29, 39, 27,  3,  3,  9, 23, 50, 11, 36, 56, 22,  3,  7,
       34, 39,  3,  3, 25, 39, 31, 37,  3,  3, 22, 47, 43, 20, 50, 21, 39,
       64, 18, 16,  3, 16,  3, 52,  3, 78, 16, 17, 13,  3, 17, 10, 58,  0,
        7,  8,  1, 23, 16, 50, 53,  1, 16,  3,  0,  3,  0,  4,  3,  0, 23,
        3, 23, 21,  0, 59, 63, 20,  3, 16, 22,  4, 27, 10,  7, 27, 58,  0,
       47, 36,  0, 10,  0, 11, 20,  3,  3, 20, 27, 54, 22, 16, 26, 46, 35,
        1, 39, 36, 18, 12, 20,  0,  3,  3,  0,  0,  0,  0,  0, 21,  9,  0,
       28, 12, 10, 56, 52, 25, 20,  3, 29, 10, 47, 16,  0, 16,  1,  1, 20,
       10, 41, 23, 64, 35, 41,  0, 26, 62, 42,  0, 45, 29, 11,  1, 12,  0,
       41, 20, 31, 62,  0, 11,  0, 10,  0, 12, 16, 48, 22, 64,  0, 12,  9,
        0, 34,  5, 22, 17, 36,  3, 20, 18, 16,  0,  0, 21, 53, 63, 39,  3,
       50, 21,  0, 20,  3, 52, 20,  3,  3, 20, 22,  3,  3,  0, 17, 68, 72,
        0, 36,  3, 50, 50, 40,  3,  9,  3, 34,  3, 40, 12, 10, 66, 10, 47,
       35, 48,  3,  3, 39, 23, 53, 50, 23,  9, 21,  0,  0,  3, 31, 22, 20,
        0,  0, 20, 29, 62, 37,  3,  3, 50, 25,  0, 10,  3,  0,  3, 53,  2,
        2], dtype=int32)
```



transform的执行流程如下

```python
In [146]: for j in range(i, len(label)):
     ...:     if label[j] == label[i]:
     ...:         temp = weight[j].rows[0]
     ...:         print('temp:')
     ...:         print(temp)
     ...:         col += temp
     ...:         print('col:')
     ...:         print(col)
     ...:         temp = [label[i] for t in range(len(temp))]
     ...:         print('temp:')
     ...:         print(temp)
     ...:         row += temp
     ...:         print('row:')
     ...:         print(row)
     ...:         data += weight[j].data[0]
     ...:         print('data')
     ...:         print(data)
     ...:

i = 0阶段
找到的第一个label[j] == label[i] 的 j = 25
In [149]: print weight[25]
  (0, 31)	0.131751750543

In [150]: print weight[25].rows[0]
[31]

temp:
[31]
col:
[31]
temp:
[16]
row:
[16]

#此时查看data
In [155]: print weight[25].data[0]
[0.13175175054301652]
data
[0.13175175054301652]

---
#然后继续往下找下一个label[j] == label[i] 的 j，找到j = 40
In [160]: print weight[j]
  (0, 31)	0.131751750543
temp:
[31]
col:
[31, 31]
temp:
[16]
row:
[16, 16]
data
[0.13175175054301652, 0.13175175054301652]

#....省略一部分

---
#继续往下找 j = 49
In [164]: print weight[49]
  (0, 31)	0.113412555235
  (0, 33)	0.207848983312
  (0, 79)	0.203936392935

temp:
[31, 33, 79]
col:
[31, 31, 31, 31, 33, 79]
temp:
[16, 16, 16]
row:
[16, 16, 16, 16, 16, 16]
data
[0.13175175054301652, 0.13175175054301652, 0.13175175054301652, 0.11341255523498507, 0.2078489833118825, 0.20393639293515622]


#中间经历很多很多循环...最终的执行结果如下

temp:
[27, 31]
col:
[31, 31, 31, 31, 33, 79, 31, 31, 31, 87, 88, 89, 31, 87, 88, 89, 31, 85, 90, 91, 92, 31, 74, 31, 31, 31, 31, 94, 31, 31, 48, 49, 50, 87, 88, 89, 31, 31, 31, 31, 31, 4, 31, 31, 31, 31, 31, 31, 31, 27, 31]
temp:
[16, 16]
row:
[16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16]
data
[0.13175175054301652, 0.13175175054301652, 0.13175175054301652, 0.11341255523498507, 0.2078489833118825, 0.20393639293515622, 0.13175175054301652, 0.13175175054301652, 0.10750865302770322, 0.06317658676802478, 0.06382543485238205, 0.0662254073023162, 0.10750865302770322, 0.06317658676802478, 0.06382543485238205, 0.0662254073023162, 0.1026848136863853, 0.15163698785334268, 0.04696945662881169, 0.04753970469128554, 0.04820006543737386, 0.12102400899441672, 0.11677307025855153, 0.13175175054301652, 0.13175175054301652, 0.13175175054301652, 0.12102400899441672, 0.09645697187664042, 0.13175175054301652, 0.19014671985390721, 0.05919524324795447, 0.059919514407615504, 0.06219467723257734, 0.05586908777663767, 0.056442885008067184, 0.05856525784152242, 0.13175175054301652, 0.13175175054301652, 0.13175175054301652, 0.13175175054301652, 0.13175175054301652, 0.12926098578774242, 0.12102400899441672, 0.13175175054301652, 0.13175175054301652, 0.13175175054301652, 0.13175175054301652, 0.13175175054301652, 0.13175175054301652, 0.13284322792237563, 0.24204801798883344]

```

分析一下，对于i = 0的循环，其实就是找出后面所有 与i=0位置相同的label，这个下标是j，然后把label[i]存储在row，weight[j].rows[0]存储在col，weight[j].data[0]存储在data中。

其实本质上就是让label值相同的聚合在一起。



然后都循环完成之后，有如下语句，目的是设置矩阵的shape，格式等。测试的时候k = 80，weight.shape[1] = 106

```python
newWeight = coo_matrix((data, (row, col)), shape=(k,weight.shape[1]))
print(newWeight)
```

结果如下


![upload successful](/images/pasted-220.png)

![upload successful](/images/pasted-221.png)
在return的时候调用了transpose()函数，如下语句

```python
return newWeight.transpose()
```

transpose()，简单来说，就相当于数学中的转置，可以看成把行和列相互转了一下。

如末尾的数据被转成了如下


![upload successful](/images/pasted-222.png)

4、接下来就是常规的步骤了

使用`train_test_split`来划分训练集和测试集

```python
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
```

训练分类器

```python
classifier.fit(X_train, y_train)
```

测试效果

```python
classifier.score(X_test, y_test))
```

![upload successful](/images/pasted-223.png)
接下来保存模型。



5、预测

```python
X_predict = vectorizer.transform(new_queries) #把查询的url转为向量
res = classifier.predict(X_predict) #预测
```



使用语句 `X_predict = vectorizer.transform(new_queries)` 报错如下

```python
  File "/usr/local/lib/python2.7/site-packages/sklearn/utils/validation.py", line 951, in check_is_fitted
    raise NotFittedError(msg % {'name': type(estimator).__name__})
sklearn.exceptions.NotFittedError: TfidfVectorizer - Vocabulary wasn't fitted.
```

参考 https://github.com/scikit-learn/scikit-learn/issues/10901 说是没有训练导致 vocabulary 不匹配？

解决方法：训练完之后把vectorizer传出来



将预测结果进行分类输出：

```python
for q, r in zip(new_queries, res):
    result[r].append(q)
printT('good query: '+str(len(result[0])))
printT('bad query: '+str(len(result[1])))
printT("预测的结果列表:{}".format(str(result)))
```



6、运行时的小问题

实际代码运行的时候有几个需要修改一下的小细节

* 传入vectorizer
* transform()函数需要weight，label两个函数

* 预测的时候，如果之前用到了kmeans，那么之后也需要使用kmeans进行降维，所以需要传入label。



7、运行结果

用几十个url去进行训练，结果如下

其中 0表示good url，1表示bad url。可以看到结果是非常准确！

![upload successful](/images/pasted-226.png)
但是自己后来在最后加了一个良性的url，没有检测出来。不过也在情理之中～因为训练集太小太小了～


![upload successful](/images/pasted-224.png)

使用与前文相同的数据集进行训练。但是在本机上训练时间过长，迟迟没有结果。在服务器上运行，killed？

所以先不运行了，知道思路就好～



本文还创建了新的数据集训练，数据集来源如下

```txt
收集某系统网络访问日志，随机选择一天的日志，对日志预处理：去重和提取状态码为200的url和参数，写入到good_fromE.txt作为监督学习的正样本。
而恶意攻击的url样本比较难获取，选择从互联网上收集。结合github上一些知名仓库的payload，一共整理出 48126 条恶意请求作为恶意的数据集。
```



8、收获

基于逻辑回归的恶意 URL 检测很依赖于训练数据集

SVM训练模型的正确率远远低于逻辑分类模型，训练时间也长于逻辑分类器。

降维是针对SVM的，逻辑回归可以不用kmeans降维。