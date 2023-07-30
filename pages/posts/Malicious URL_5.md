---
layout: post
title: 恶意URL检测(五)又是五篇文章
tags: []
categories:
  - 恶意URL检测
author: 1ss4k
date: 2021-03-06 21:59:00
---


## 十一、卷积神经网络的方法实现准确且快速的URL钓鱼检测



1、作者来自 西电、陕西省网络计算与安全技术重点实验室、西北工业大学、捷克斯托乔瓦理工大学、西里西亚理工大学。发表期刊是 Elsevier-computer network-2020年4月。

2、本文的目的是检测钓鱼网站的URL地址，且只分析URL text。

3、前人工作

可以分为 基于list的 和 基于机器学习的。

一个比较好的应用是ad-hot(点对点网络)

4、本文方法

![upload successful](/images/pasted-284.png)

* text coding

使用如图所示的 one-hot，编码为图像。(与常规的语言不同，所以编码，看作图像来处理。)

![upload successful](/images/pasted-285.png)

得到的结果是稀疏的，所以用到一个嵌入层，目的是将输入转换为一个数字来表示的简洁的矩阵。

使用t-SNE方法，可以更加直观地看相似性。

5、实验结果

与LSTM比较[9]。得出的结果是：CNN在各方面的处理效果都比LSTM好。



6、代码测试

参考 https://www.activestate.com/blog/phishing-url-detection-with-python-and-ml/

使用的模型是决策树。数据集使用 https://archive.ics.uci.edu/ml/datasets/Phishing+Websites#

如下：

![upload successful](/images/pasted-286.png)

使用weka，将.arff格式的文件转为csv格式，便于后续操作。

根据数据集的划分方法，可以学到一些知识，如：

使用@，会忽略前面的地址，只转到后面的地址。

//表示重定向。

特征具体的解释见文件：Phishing Websites Features.docx



* 安装seaborn 

```python
sudo pip install seaborn

#python
import seaborn as sns
```

执行脚本如下

```python
# To perform operations on dataset
import pandas as pd
import numpy as np

# Machine learning model
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

# Visualization
from sklearn import metrics
from sklearn.metrics import confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.tree import export_graphviz

df = pd.read_csv('data/dataset.csv')
#dot_file = '.../tree.dot'
#confusion_matrix_file = '.../confusion_matrix.png'

X = df.iloc[:, :-1] #特征空间
y = df.iloc[:, -1] #结果集合
Xtrain, Xtest, ytrain, ytest = train_test_split(X, y, random_state=0)

model = DecisionTreeClassifier()
model.fit(Xtrain, ytrain)

ypred = model.predict(Xtest)
print(metrics.classification_report(ypred, ytest))

print("\n\nAccuracy Score:", metrics.accuracy_score(ytest, ypred).round(2)*100, "%")

```

测试结果如下

![upload successful](/images/pasted-287.png)

结果还可以噢！但是具体本文的方法没有实现，因为木有找到源码1551



收获：

1、CNN适用于处理图像。

2、本文用到了嵌入层，提高了实验效果。

3、与LSTM相比，CNN训练简单，时间短。

## 十二、URLdeepDetect: 使用语义矢量的用于检测恶意URL的深度学习模型





1、作者将现有的工作大致分为三类：

(1)使用推特的特征和机器行为的数据

(2)使用词汇、域名/主机名、URL特征

(3)使用神经网络和矢量模型。

但是他们存在如下的问题：(1)没有考虑URL分割得到的token的**序列**、(2)只出现了一次的词，不能提供有用的信息、(3)训练集中没有出现的词不能被正确预测。

基于此，本文提出了一个深度学习模型，有两种实现方法。

一：使用word embedding 获取URL分割成的token的语义序列，计算语义相似性得分，再得到矢量。并将其输入到LSTM模型中，并且使用到了k-means聚类。

二：使用加密和k-means聚类的方法进行无监督的学习。



2、word2vec的本质

参考 https://zhuanlan.zhihu.com/p/26306795，有如下总结

```txt
举个简单例子，判断一个词的词性，是动词还是名词。用机器学习的思路，我们有一系列样本(x,y)，这里 x 是词语，y 是它们的词性，我们要构建 f(x)->y 的映射，但这里的数学模型 f（比如神经网络、SVM）只接受数值型输入，而 NLP 里的词语，是人类的抽象总结，是符号形式的（比如中文、英文、拉丁文等等），所以需要把他们转换成数值形式，或者说——嵌入到一个数学空间里，这种嵌入方式，就叫词嵌入（word embedding)，而 Word2vec，就是词嵌入（ word embedding) 的一种
```



3、LSTM

​	LSTM是RNN的微调版本，其与embedding配合使用，效果最好。将上文产生的vector输入到LSTM中，用于训练。它可以解决内存不够的问题。



4、数据集

从https://www.kaggle.com/siddharthkumar25/malicious-and-benign-urls获取数据集，其来源有多个，例如PhisTank，大小35.4MB。



**代码实践**

1、tokenization

需要使用NLTK。

```python
pip install nltk
import nltk
```



测试如下

```python
import nltk
nltk.download('punkt')

text="I love China!And this is used to test. And you?"
sens = nltk.sent_tokenize(text)
#sens = ['I love China!And this is used to test.', 'And you?']

words = [nltk.word_tokenize(sentence) for sentence in sens]
#words: ['I', 'love', 'China', '!', 'And', 'this', 'is', 'used', 'to', 'test', '.']
```



2、Word2Vec

参考文章 

https://medium.com/@pocheng0118/word2vec-from-scratch-skip-gram-cbow-98fd17385945

https://www.jianshu.com/p/52ee8c5739b6

```python
pip install -U gensim
pip install --upgrade gensim

from gensim.models import word2vec
class MySentences(object):
    def __init__(self, fname):
        self.fname = fname    
    def __iter__(self):
      for line in open(self.fname,'r'): 	yield line.split()

def w2vTrain(f_input, model_output):         
    sentences = MySentences(DataDir+f_input)
    w2v_model = word2vec.Word2Vec(sentences, 
                                  min_count = MIN_COUNT, 
                                  workers = CPU_NUM, 
                                  size = VEC_SIZE,
                                  window = CONTEXT_WINDOW
                                 )
    w2v_model.save(ModelDir+model_output)

# 训练
DataDir = ""
ModelDir = ""
MIN_COUNT = 4
CPU_NUM = 2 # 需要预先安装 Cython 以支持并行
VEC_SIZE = 20
CONTEXT_WINDOW = 5 # 提取目标词上下文距离最长5个词
f_input = "bioCorpus_5000.txt"
model_output = "test_w2v_model"
w2vTrain(f_input, model_output)
```

训练完之后多了这个模型

![upload successful](/images/pasted-288.png)


```python
w2v_model = word2vec.Word2Vec.load(ModelDir+model_output) #加载模型

In [22]: w2v_model.most_similar('heart')
/usr/local/bin/ipython:1: DeprecationWarning: Call to deprecated `most_similar` (Method will be removed in 4.0.0, use self.wv.most_similar() instead).
  #!/usr/bin/python3
Out[22]:
[('protein', 0.9994245767593384),
 ('pH', 0.9993844032287598),
 ('synthesis', 0.9993616342544556),
 ('A', 0.9992623329162598),
 ('from', 0.9992424249649048),
 ('by', 0.9992324113845825),
 ('high', 0.9992194175720215),
 ('or', 0.9992164373397827),
 ('and', 0.999205470085144),
 ('myocardial', 0.9992042779922485)]

```



收获：

1、语义序列。本文及下篇文章都考虑到了序列的问题。本文考虑的是URL的token之间的序列，另一篇APT检测考虑的是主机发送的DNS请求之间的序列关系。

2、word2vec是参考nlp中的内容，它的本质是把词语转换成数值形式。除了 Word2vec之外，还有基于共现矩阵分解的 GloVe 等等词嵌入方法。(已证明了 Skip-gram 模型和 GloVe 的 cost fucntion 本质上是一样的)

3、本文提出了两种方法，分别是有监督的和无监督的，最终的效果都比较好。如果考虑到现实中无标签的数据比较多，无监督的方法应用的范围更大一些。

## 十三、McPAD：准确的payload自动检测多分类器



1、时间：2008年，较早

2、2v-grams

​	相当于跳着字符编码，对于字符串abcdefg...，如果v=1，结果就是 ac,bd,eg....等等

3、文章笔记手写

![upload successful](/images/pasted-289.png)


![upload successful](/images/pasted-290.png)


![upload successful](/images/pasted-291.png)


![upload successful](/images/pasted-292.png)

4、降维

使用聚类的方法进行降维。

5、分类

使用的是SVM分类器，训练好多个模型之后最终采用投票的方法决定最后的结果。

6、复杂度分析

模型的训练阶段是可以离线做的，所以此处只分析[分析阶段]。

```txt
假设payload的长度为n，2v-grams的频率为*O(n)*，而特征提取是2^16，是一个定值。特征聚类可查表得到，而总共的操作数always < 2^16，降维：O(1)。
...
```

总体复杂度：O(nm)

7、实验结果

实验主要检测HTTP流量。并且将本文的McPAD与[35]的PAYL进行了对比。

数据集：

* DARPA(HTTP请求)，但是过时了。
* GATECH(大学的真实请求)，但是不能保证它都是合法的数据。
* [17]列出了非polymorphic的HTTP攻击，但是找不到polymorphic攻击的数据集，作者自己创造了一个，见网站 http://roberto.perdisci.googlepages.com/mcpad。攻击可以分为如下几类：(Generic Attack、Shell-code Attacks、CLET Attacks、PBAs)

ROC：假阳率和检测率之间的平衡。

AUC：用来衡量恶性和良性的是否易于区分。通常来说，值越高，越易于区分，分类效果更好。



(1)2v-grams

![upload successful](/images/pasted-293.png)

可以得到数据的平均相关信息。结果v=0时提取到的信息最多。



(2)McPAD准确度

执行了交叉验证，计算了AUC。

使用数据集，分别对两个模型进行训练。



(3)对PBAs的鲁棒性

​	PBAs 主要是用来逃避检测的。一个攻击所包含的包较少时，本文的检测方法较好。但是当一个攻击涉及的包很多时，本文和对比的方法都不能较好地检测出攻击。



(4)计算开销分析

过滤掉了没有TCP的包。结果如下：

![upload successful](/images/pasted-294.png)

与对比文章相比，本文效果咩有它好，速度较慢，但是本文的方法容易并行计算，方便优化，预期速度还可以再提高。



(5)Bayesian检测率

定义：P(intrusion|Alarm)

---



找到了之前作者发布的代码，写于2006、2007年，用的java。

![upload successful](/images/pasted-295.png)

由于不会java，就不仔细看辽。





8、收获：

* SVM对文本分类的效果较好。
* 使用2v-gram算法，不会损失信息，也不会使得运算很复杂。
* 参考本文的思路，可以使用一个不易被检测到的数据集，来评价所提出方法的鲁棒性。
* McPAD在检测可执行代码方面，效果较好，且假阳率较低。
* 本文使用到了one-class分类器，只需要使用良性数据即可。
* 文章的评价指标用了Bayesian detection rate P(Intrusion|Alarm)，思考有什么作用？能反映出什么？

* 文章年代还是比较久远了，姚老师说还是尽量少看这么早的文章。

## 十四、利用线性和非线性空间转换的方法，借由特征来提升恶意URL的检测效果



1、2020年文章，期刊名称：Information Systems，影响因子：2.466，SCI二区。

2、一点笔记!

![upload successful](/images/pasted-296.png)

目前的方法中，很少有关注特征转换的。

并且本文还用到了：cutting-edge技术，如：分布cache、Map减少映射和NoSQL数据库。



3、文章摘要说的系统 打不开。



4、相关工作

主要分为四类：

(1)黑名单

(2)基于内容

(3)基于URL：比方法[2]更有效。[20]常规方法。 [4]提出了一种轻权重的方法，并且说自己的效果很好。

(4)特征工程feature engineering approach：[8]使用遗传算法，先将特征分为决定性的和非决定性的，将非决定性的转换为新的特征。特征转换中，主要分为线性和非线性。线性：矩阵因数分解，如PCA、SVD、NMF[26]。非线形：深度神经网络，AE。

(一个小细节：图2，黑名单和基于URL的描述写反了)



5、数据收集

数据来自PhishTank和 360 Safety Center。



6、特征提取

主要分为四类特征

(1)基于域名的特征：TLDs、Expire days、Register days、Domain and its server sections

(2)基于主机的特征：国家、主机的赞助者、使用的技术

(3)基于声望的特征：即在公共数据集上查看排名等。

(4)基于词汇的特征：URL字符特征、关键字、



7、此数据集的特征

(1)数据的模式 随时间改变

(2)URL的结构存在差异

(3)数据规模很大

文中提及，使用s-SNE将数据的维度降低到2。具体的原理先不看了，这里只用知道它是一种非线性降维算法，非常适用于高维数据降维到2维或者3维，进行可视化。

![upload successful](/images/pasted-297.png)

8、恶意URL检测的困难点/挑战

下图是原始数据集的相关图，它显示了URL特征的部分内部关联。

![upload successful](/images/pasted-298.png)

分析，认为主要有如下三个问题：

(1)特征之间存在线形关联。---> SVD

对于k-NN模型和SVM模型有影响。本文用SVD消除特征之间的相关性。

(2)人工选择的某些特征可能不合适 ---> 使用基于LP距离metric学习的方法，为正交转换过的特征分配权重。

本文提出了一个新的Distance Metric Learning(DML)算法，

(3)数据集过大，不能应用线形kernel方法。---> Nyström method

实际上，数据集过大，对很多模型来说，都会造成计算开销过大。



9、本文方法

(1)线形方法：

* 使用LSH去搜索临近点

* 执行SVD，此时列是正交的

* 学习一个斜对角矩阵，它会为独立的特征分配权重。

* 投射得到Pa Pb
* 使用一些简单的方法，如k-NN即可解决。



(2)非线形方法

* Nyström method

[49]给出了结果有效性的证明。本文提出了SOFM做为聚类算法。

它的时间cost较低。



10、完整的线形和非线性转换

Pb是线形无监督的方法，Pa是线形有监督的方法。Φ ̃ n (x)是非线性无监督的方法。

(1)DML for Radial Basis Function in Nyström method

RBF是kernel方法中最常使用的，形式如下：

![upload successful](/images/pasted-299.png)

(2)Kernelized DML: DML after Nyström method

缺点：转换之后维度可能过高。



(3)Integrated space transformation framework

整体的框架图如下：

![upload successful](/images/pasted-300.png)

11、格搜索kernel函数中优化的参数

通过kernelized SVM去评估参数，效果如下图所示

![upload successful](/images/pasted-301.png)
由图可知，最好的参数值是2^(-6)。



12、实验结果

(1) TPR and accuracy evaluation based on 16 classifiers

运用了3-fold交叉验证，TPR和准确度结果如下：

![upload successful](/images/pasted-302.png)

(2)TPR and accuracy comparison with other feature selection models

(3) TPR and accuracy comparison with feature transformation models

VAE效果不好，将大多数URL都识别为良性的。

(4) Time cost evaluation of classifiers

结果如下图：

![upload successful](/images/pasted-303.png)

13、结论

(1) Difference between TPR and overall accuracy

TPR比准确度更有价值。

如果良性URL的数据集很大，会造成准确度虚高。

(2) 计算复杂度

(3) 用多个标准去比较分类器的性能

结果统计如下表：

![upload successful](/images/pasted-304.png)

(4)所提出的特征工程的方法在深度学习中的重要性



14、模型

![upload successful](/images/pasted-306.png)

收获：

1、用到了SVD？？？这么牛？那是不是能用DWT、DFT、DCT？

2、自己的方法要重点考虑到大规模的数据。

3、神经网络过于强大

4、SVM可以自动学习特征的权重，而k-NN和Radial Basis Function不能学习权重。

5、本文数学公式较多，看的时候不能理解其深入内涵(我太菜了)

6、网上没有找到代码，所以并没有实际运行。

## 十五、大规模在线学习的应用：定位可疑的URLs



1、这篇是上一篇参考文献里引用到的，时间较早，2009年，当时发表于ICML，算是顶会了，CCF- A。

2、特征：URL的语义和主机特征。并且使用mail服务新提供的含有标签的URL去更新系统，是online算法，比batch算法效果好。

3、文中写了不使用[基于内容]的方法的优点，列了4点。

4、特征还是用的bag-of-words，但是考虑到了所在的地方不同。比如在TLD中的.com和在其他地方的是不一样的。

5、前人方法中，有人用VM访问网站，再检测机器是否受感染。但是我认为这样不能及时发现一些隐藏起来的攻击。

6、在线算法：

(1)SGD

(2)PA：此算法尽可能地将模型改变的少一点。

(3)CW：每个特征有自己的系数测量方法。效果最好，假阳率最低。

7、创新点是：系统是实时的，不断接受新的URL进来。并且使用的特征是随着数据变化的。

8、结论：

(1)online 学习 ，效果比批量学习好

(2)在线学习算法中，CW效果最好

(3)持续训练比间隔着训练效果要好，添加新出现的特征比使用固定的特征效果好。