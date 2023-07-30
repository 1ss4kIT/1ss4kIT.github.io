---
layout: post
title: 恶意URL检测(六)钓鱼检测
tags: []
categories:
  - 恶意URL检测
author: 1ss4k
date: 2021-03-30 08:45:00
---
## 十六、PhishStack:钓鱼URL检测中堆叠泛化的评估

1、会议等级

ICCIDS 2019，全称International Conference on Computational Intelligence and Data Science，作者来自孟加拉国达夫多迪国际大学公共科学与工程系。



2、文章贡献

A. 提出了一种多层次的方法 PhishStack，并在真实的数据集上进行评估

B. PhishStack可以结合机器学习、集成学习等各种分类器，甚至基于神经网络的技术作为基础分类器。

C. PhickStack使用stacked泛化器执行，准则是使得泛化器的错误率最小。



3、前人工作

前人达到的检测率水平：[6]---97.98%，[7]---90%，[9]---95%，[11]---95.8%，

[8]提出随机森林的处理时间最短。



4、数据集

数据集1: https://archive.ics.uci.edu/ml/datasets/phishing+websites

![upload successful](/images/pasted-319.png)

数据集2：https://archive.ics.uci.edu/ml/datasets/phishing+websites

数据集3：https://data.mendeley.com/datasets/h3cgnj8hft/1



5、机器学习算法

level1：使用的机器学习算法：RF、决策树、MLP、SVM、SGD、GND(Gaussian Naive Bayes)。之后使用了10-fold 交叉验证。

level2：使用了XGBoost分类器。



6、stacking的概念

![upload successful](/images/pasted-320.png)
为了避免训练集过拟合，使用N-fold交叉验证，他可以预测每个fold中out-of-fold的数据。

在Level1:训练之后，由于用了多个算法，需要投票来决定最终的结果。并且为了得到更多特征用于level2的训练和预测，level1需要重复循环训练。即level 1的输出是下一个level的特征。



7、实验结果

用到的评价指标：混淆矩阵、PRC、AUC- ROC Curve、MAE、准确度。

(1) Case 1: 

随机森林的准确度最高，达95.61%，且错误率最小。

在PRC、AUC- ROC曲线方面，栈泛化只提供了很少的作用，而RF、MLP的表现更好。但是最终的预测准确度，栈泛化达到了97.44%，比其他单个分类器的效果都要好。

(2) Case 2:

GNB效果不好。

level 1：随机森林准确度达到了96.72%，是最大的，并且错误率也最低。

最终：stacked generalization准确度最高，达到了96.77%，比单个的分类器效果高一点点。

stacked generalization在PRC方面效果差一点，但是在ROC曲线方面，stacked generalization、RF、MLP和SVM的AUC效果相同，都是99%。

(3) Case 3:

level 1: RF效果最好，97.63%。

总体，stacked generalization效果最好，准确率97.86%。PRC和AUC- ROC也是stacked效果最好。

收获：

1、这里提出了3个数据集，可供自己用。做实验的时候，也可以像本文一样，三个数据集分开实验，分别论述，能够增加篇幅...(凑字数专用)

2、其实说白了，本文方法就是：把多个分类器的预测结果结合一下，得到最终的结果。最终的分类结果可能比单个分类器的效果要好。但是总觉得创新不算太大，很多地方叙述的不是很清楚。

3、本文的参考文章，有几篇可以之后看一下的

```txt
[13] Chiew, K. L., Tan, C. L., Wong, K., Yong, K. S., and Tiong, W. K. (2019). A new hybrid ensemble feature selection framework for machine learning-based phishing detection system. *Information Sciences*, 484, 153-166.

[14] Ding, Y., Luktarhan, N., Li, K., and Slamu, W. (2019). A Keyword-based Combination Approach for Detecting Phishing Webpages. *Computers and Security*.

[16] Rao, R. S., and Ali, S. T. (2015, April). A computer vision technique to detect phishing attacks. *In 2015 Fifth International Conference on Communication Systems and Network Technologies* (pp. 596-601). IEEE
```



## 十七、基于机器学习钓鱼检测系统的新型混合总体特征选择框架



1、文章发表期刊：information science。属于ccf b类，计算机类一区。但是知乎上也有人说不算太好，比较水(甚至和access放在一起)。作者来自马来西亚Sarawak大学、马来西亚Monash大学。



2、选择特征

主要有如下两种方案：

(1)wrapper: 反复迭代，每个迭代过程产生一个特征子集，并且通过分类来评估它。当特征集更大的时候，迭代次数将会指数增加。

(2)filter measure: 是统计学和信息理论计算得到的metrics，与特定的算法无关，本文关注这种方法，它的计算复杂度较低。他会将特征进行排序。



3、CDF-g ---> HEFS

​	本文提出了卷积分布函数梯度(CDF-g)算法，作为自动特征cut-off rank识别器。他利用filter measure值的分布模式，来确定最优的cut-off rank。目的是得到高效且简洁的base line特征。

​	为了进一步提高基线特征的稳定性且减少过拟合，本文将CDF-g算法扩展为由**数据扰动**和**函数扰动**技术组成的混合集成结构。数据扰动需要将数据集细分为多个分区，而函数扰动则需要对同一数据集应用不同的过滤措施。

​	完整的特征选择框架就叫做HEFS。



4、相关工作

​	[28]使用IG(不是小IG)将特征排序，三个数据集的top 10特征取交集，最后得到了9个特征。但是，为什么要取10呢？还是从人类的习惯出发。并且filter measure只使用了IG，没用其他方法。

​	[14]显示，wrapper和best- first 搜索算法一起使用效果最好，然后是IG和Relief- F，CFS(Correlation- Based Feature Selection)效果最差。分类器中：RF效果最好。

​	[21]收集了总共47个特征，使用IG、卡方、CFS的方法去排序。观察到用IG和卡方排序的特征，20和21的filter Measure值之间都有一个较大的差值。因此选用了20个特征。

​	[27]提出了使用IG和卡方去确定cut-off rank的一种系统的方法。定义了IG和卡方的两个最小值，如果最后的结果都小于这两个值，就舍弃。



5、本文方法

整体框架如下图

![upload successful](/images/pasted-321.png)

数据扰动：对多个数据子集应用相同的特征扰动技术。

函数扰动：对相同的数据集应用多个特征选择技术。

[12]认为，数据分类可以减少分类器的复杂度。

上图，Pj是代表第j个数据分区，FMk表示第k个filter Measure。

对每个数据分区执行FM、CDF-g算法，并求交集，产生FS，接下来进行数据扰动和函数扰动。函数扰动是求并集，得到baseline 特征集。



6、CDF-g算法，一个自动特征cut-off rank识别器

Cumulative Distribution Function(CDF)的理论背景：函数概率曲线。

![upload successful](/images/pasted-322.png)

7、不使用额外特征(如第三方查询、WHOIS信息、域名注册 等)的原因

文中列出了如下三点(写的很有道理，就不翻译了)

```python
(a) The webpage URL and HTML source code is the most basic data available in phishing datasets. Using commonly accessible features ensures that our study is relevant to most anti-phishing researchers.
(b) External data are highly volatile. For example, the results of search engines change frequently.
(c) Access to external resources is unstable and unpredictable. For example, the public API for querying the Google PageR- ank metric was officially deprecated in 2016, thus affecting many phishing detection techniques [10,23,30] that depend
on the PageRank feature.
```



8、selenium

https://www.selenium.dev/projects/

一个基于script的浏览器自动框架，用于提取特征(和之前看到的爬虫方法类似)



9、48个特征

![upload successful](/images/pasted-323.png)

![upload successful](/images/pasted-324.png)


10、数据集

​	搜集私有数据，加入phishTank、openphish的钓鱼数据，以及从Alexa和common crawl收集到的5000个合法数据。



11、实验设置

​	用Weka进行实验，分类器的参数都是默认的。

​	CDF-g是使用python中的Numpy包来实现的。

​	设定 J=10，保证每一个部分的数据仍然能够正确地训练一个分类器。

​	在函数扰动阶段用到的filter Measure的数量，设定K=3，



12、实验结果

(1)不同分类器在不同特征子集上的性能评价

选取了多个分类器，并且选取的filter measures是：information gain(IG)，relief- F，Symmetrical Uncertainty, Chi-Square, Gain Ratio, 和 Pearson Correlation Coefficient.

RF分类器的准确度最好，超过95%。

(2)选择的分类器的filter measure的fitness

找到最适合RF的filter measure。此处是用top 1st特征的准确度来衡量的，并且在加入其他特征的时候，哪个达到了最快的平衡。实验得到，IG和卡方效果最好，然后是Symmetrical Uncertainty。

(3)baseline特征的性能

最终的baseline特征包含10个特征

![upload successful](/images/pasted-325.png)

(4)运行时间分析

(5)在其他数据集上进行实验

[11]提出了一种新的分类算法，叫FACA。

[17]有一个数据集，常用。



代码：

1、CDF-g算法

主要用到的算法就是这个CDF-g算法，可以直接在numpy中调用。

参考 https://stackoverflow.com/questions/24788200/calculate-the-cumulative-distribution-function-cdf-in-python

```python
import matplotlib.pyplot as plt
import numpy as np

# create some randomly ddistributed data:
data = np.random.randn(10000)

# sort the data:
data_sorted = np.sort(data)

# calculate the proportional values of samples
p = 1. * np.arange(len(data)) / (len(data) - 1)

# plot the sorted data:
fig = plt.figure()
ax1 = fig.add_subplot(121)
ax1.plot(p, data_sorted)
ax1.set_xlabel('$p$')
ax1.set_ylabel('$x$')

ax2 = fig.add_subplot(122)
ax2.plot(data_sorted, p)
ax2.set_xlabel('$x$')
ax2.set_ylabel('$p$')

```



收获：

1、这篇其实还是基于网页内容了，本来这个方向是不是研究重点，但是看到一半才发现。但是使用selenium提取特征也不是那么麻烦，如果只提取一些固定的特征如URL文本特征，以及HTML代码的话。

2、有一个钓鱼的数据集的论文

```python
C.L. Tan, Phishing Dataset for Machine Learning: Feature Evaluation, Mendeley Data, v1, 2018, Retrieved from https://doi.org/10.17632/h3cgnj8hft.1,
accessed 20.05.18.
```

3、钓鱼方法在不断进步，所以其实特征也在不断改变～所以本文说的特征和之前文章中的不一样，是很正常的。

4、04.06，心理受挫，要加快进度了啊啊啊啊啊啊啊！5月之前一定要搞完，不吃饭不睡觉也要弄完！



## 十八、基于关键字混合的钓鱼检测方法

1、作者来自新疆大学、纽约州立大学，发表于computers&security，中科院二区。关键字：启发式规则、URL混淆技术。



2、混合：本文提出的混合是：搜索(S)、启发式规则(H)、逻辑回归(LR) (SHLR)。



3、大致过程：

网页title tag作为输入，到百度中去搜索(CANTINA搜索的是网页内容 TF- IDF排序 的前M个词，本文搜索的是tag)，如果与搜索结果的前10个域名中有匹配的，则认为是合法的。否则需要再进行评估。需要根据character特征定义的启发式规则去进行进一步判别。最后，再使用逻辑回归分类器，处理剩下的pages，目的是增强检测方法的适应性和准确度。



4、钓鱼攻击可以分为如下三类：

(1)普通的攻击，没有特定的目标群体。成功率较低。

(2)对特定类别的人的攻击。

(3)攻击CEO或leader。

如何把钓鱼🎣链接发给受害者呢？有以下三点：

(1)e-mail

(2)SMS

(3)声音钓鱼(理解成电话即可)



5、前人工作

2008年，Seifert分析DNS、web servers、webpages之间的关系。



6、一部分笔记记在纸上了

![upload successful](/images/pasted-326.png)

Rule3：模式1分割，若没有单独发现钓鱼target word，而是word前面有数字，则这个URL被认为是恶意的。

Rule4：模式1分割，没有发现phishing target word，再将URL以模式2分割，得到的部分再以模式3分割，连续位置的word去构造出新的words，生成新的URL list。如果list包含target word，或者包含其他身份识别字符的字串部分，则这个URL被认为是恶意的。(下图是一个例子，可以较好解释)

![upload successful](/images/pasted-327.png)

Rule5：直接使用IP地址，则视为恶意的。

Rule6：协议出现在不该出现的地方，则视为恶意的。

Rule7：TLD(top level domains)出现在不该出现的地方，则认为是恶意的。

这种方式能够避免特征提取。



7、LR分类器

使用的特征：DNS、Whois、与词汇表的相似度、词汇特征和HTML

每个类别又包括好几个特征，总共应该有好几百个特征了...啊这



* 注意：文中提到，与KL距离、编辑距离相比，Jaccard相似度最适用于钓鱼检测。

* 用LR检测的时候，用到了10-交叉验证的方法。且具体使用的是L1(实验得到的)

  

后面的内容没有太多技术性的东西了，草草看过



收获：

1、本文贡献如下：

```python
1. To detect escaping technology, which inserts many unrelated words in the phishing webpage, we use the title tag content of the webpage as keywords and filter legal webpages quickly with the help of the search engine.
2. Seven heuristic rules are proposed for detecting URL obfuscation technology, which can quickly identify phishing websites.
3. A combination approach based on keywords that can achieve good detection performance and meet the needs of real-time detection is proposed.
```

2、本文用到的启发式规则，其实可以看成是模式匹配。但是由于本文主要是去检测钓鱼攻击，太注重钓鱼URL的特性了(比如混淆，加个数字等等)，如果整体的识别URL，是不适用的。

3、通过Jaccard相似度来计算合法url和钓鱼url之间的相似度，也是一个思路！

4、文章的实验，本别把SHLR分开来检测单个方法的性能，或者混合，与总体的比较。可以借鉴这种思路。



## 十九、一种检测网络钓鱼攻击的计算机视觉技术

1、会议名称：2015 Fifth International Conference on Communication Systems and Network Technologies(CSNT)，会议地点：印度，不算太好的会议，发表时间2015年，作者共两位，来自印度哈里亚纳邦计算机工程系。



2、前面introduction和related work部分 匆匆看过，总结了一些重点如下

[9]尝试登陆，根据网站的相应来判别是否是钓鱼网站。

[11]比较合法网站和可疑网站的文档对象模型（DOM）来检测网络钓鱼，是通过寻找最长的相似子树来度量相似性。

现有的基于视觉的方法，有比较网页图片的外观特征的，也有比较内部文本结构特征的，总之很多。



3、所用的技术：

* 白名单(提高速度)
* 计算机视觉技术的视觉相似性，即SURF，从可疑网站和目标网站中提取关键点特征。然后计算合法页面和可疑页面之间的相似度。

总体的框架如下：

![upload successful](/images/pasted-328.png)
SURF：找到图片上的兴趣点，每个兴趣点的邻域由特征向量表示，所以具有比较好的鲁棒性。SURF采用基于Hessian矩阵逼近的快速Hessian检测器来识别兴趣点。它计算x和y方向的Haar小波响应，在x和y方向的响应之和的输出给出了每个兴趣点的特征向量。将这些特征向量在两幅图像（可疑网站图像和合法网站图像）之间进行相似度比较，确定是否是钓鱼网站。

具体原理及实现可参考[这篇文章](https://blog.csdn.net/weixin_30536513/article/details/97292062)

本文是在Matlab上实现的，



收获：

1、如果能结合计算机视觉，再结合水印...那就太好了...多考虑新的方法，不要墨守成规！

2、本文用的数据集还是太太小啦，不过类似处理图像也不能用那么多的数据吧，不然所占用的内存大且速度慢...这也是视觉处理的缺陷。

3、本文的原理是：钓鱼网站一般直接套用合法网站的内容，所以如果一个网站与已知的某个合法网站相似度太高，就认为是复制的这个网站的内容，是钓鱼的。但是存在的问题是：和哪个网站去进行比较？以及，不能存在任何相似度比较高的网站吗？如果一个教务系统好几个地方都用，那岂不是都被判定为钓鱼网站？

4、本文说到的SURF可以抵抗缩放和旋转攻击，旋转不常见，缩放还是有一定作用的。

5、总的来说这篇还是有点粗糙，然后提出的改进是：不仅使用图像，而且考虑CSS样式。然后文章的内容也有点违背了自己方案的大致方向。不过思考：能否单单对URL运用这种方法？



## 二十、用于检测钓鱼页面的基于计算机视觉的框架

1、文章会议：2020年RoEduNet网络教育与研究会议，不怎么样，有两位作者，都来自罗马尼亚布加勒斯特理工大学。

2、在前人工作部分，有人使用直方图、有人使用DOM，总之很多方法。

3、计算机视觉用于钓鱼检测，假阳率较高。所以需要和其他方法结合起来。

文中还提出了几个这种方法的困难之处(与现实生活不符的地方)，用到的时候再看原文好了。

4、总体结构如下：

​	先在登陆界面截一张图，创建一个HTML界面，在JavaScript界面创建一个hash结构。然后去与数据库中的进行比较，如果截图与数据库中的匹配，就继续比较HTML页面和JavaScript页面，如果完全相同就是同一个页面，是良性的。因为攻击者总要在页面中插入C&C，所以总该有些不一样的。

​	可以将登陆页面的直方图与其他页面的直方图进行比较。

​	将JavaScript代码转为伪代码，然后得到树形结构，然后得到md5哈希。



收获：

1、本文贡献如下

![upload successful](/images/pasted-329.png)

2、还是 思想要活跃！大胆假设！



## 总结：

​	前几天还是浪费太多时间了，时不我待！！看的这五篇文章质量不算太高，而且内容都是注重钓鱼检测攻击，我还是想检测总体的恶意URL，因为真实环境中钓鱼还只是占了一小部分。

​	这几天非常焦虑，不知道自己到底能做个什么东西出来，而且每天有各种各样的事情来扰乱自己，很烦躁。还是要静下心来一步一个脚印，多看多思考，还有20天！加油！！

​	接下来的重点是看NLP相关的内容，一定要看优秀文章，不要看水文！！考虑有哪些方法是能够用在URL分析上的！加油加油冲冲冲！