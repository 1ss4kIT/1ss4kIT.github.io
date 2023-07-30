---
layout: post
title: 恶意URL检测(七)小记两篇
tags: []
categories:
  - 恶意URL检测
author: 1ss4k
date: 2021-04-21 11:28:00
---
## 二十一、恶意URL检测的综合比较研究

原名：Malicious URL Detection: A Comparative Study

1、会议ICAIS2021(第一个给我人生希望的会议)，后发表于IEEE，作者来自中科院计算所。



2、数据集，来自Kaggle，包含450000个URL。

是预处理完提取特征之后的。

![upload successful](/images/pasted-336.png)

3、模型训练用的是sklearn

* 逻辑回归LR

  用sigmod函数

```python
from sklearn.linear_model import LogisticRegression
lr = LogisticRegression(max_iter=100)
lr.fit(X_train,t_train)
lr_y_pred = lr.predict(X_test)
```

* 随机梯度下降SGD

线性模型，对是否标准化较为敏感

```python
from sklearn.linear_model import SGDClassifier
sgd = SGDClassifier(n_jobs = -1)
sgd.fit(X_train,y_train)
sgd_y_pred = sgd.predict(X_test)
```

* 朴素贝叶斯NB

一般是线性，学习速度快，需要的数据量少，但分类精度较低

如下代码使用的是高斯模型

```python
from sklearn.naive_bayes import GaussianNB
nb = GaussianNB()
nb.fit(X_train,y_train)
nb_y_pred = nb.predict(X_test)
```

* K临近 KNN

非参数模型，确定k的数目。如下是K=5

```python
from sklearn.neighbors import KNeighborsClassifier
knn = KNeighborsClassifier(n_neighbors=5,n_jobs=-1)
knn.fit(X_train,y_train)
knn_y_pred = knn.predict(X_test)
```

* 决策树DT

数据过多可能会过拟合

```python
from sklearn.tree import DecisionTreeClassofoer
dt = DecisionTreeClassofoer(random_state=14)
dt.fit(X_train, y_train)
dt_y_pred = dt.predict(X_test)
```

* 随机森林RF

最终的值取决于各种决策树的平均值，其性能优于决策树，且解决了过拟合的问题。

但是训练计算较为复杂

```python
from sklearn.ensemble import RandomForestClassifier
rfc = RandomForestClassifier(n_estimators=500)
rfc.fit(X_train, y_train)
rfc_y_pred = rfc.predict(X_test)
```

* 支持向量机SVM

有监督学习的分类算法

```python
from sklearn.svm import SVC
svc = SVC()
svc.fit(X_train,y_train)
svc_y_pred = svc.predict(X_test)
```



4、特征Scaling

常用的两种技术是：标准化和归一化

让训练结果不因数值的大小而有较大的偏差。



5、实验结果

随机森林效果最好。



收获：

1、传统方法不好的原因(写论文可能会用到)

由于其体积庞大、模式随时间变化、特征间复杂关系等原因，都面临着挑战。

2、下载了一个数据集，已经提取好了各种特征。

3、本文没什么太新的东西，就是用几个模型去比较了一下，作者应该也没有太走心，图都很糊。



## 二十二、基于AI的botnet检测模型

本文是检测botnet的，不是检测AI的，但是看看能不能有什么借鉴的地方～

1、作者来自China Mobile Research Institute，2019年IEEE DSC



2、botnet检测分类

总体可以分为3类：基于行为的检测、基于网络流量的检测和基于DNS的检测。

基于行为：检测已知的攻击。

网络流量：大部分使用DPI(深度包检查)方法。

基于DNS：分析DNS的特征。有时也分析域名解析。



3、特征选择

选择了9类71个特征。以下细说各个类别。

(1) 域名熵，可区分行较大

(2) 辅音特征，区分性还行

(3) 元音特征，一般来说元音只有5个，出现的次数少。但是这个区分性不强，因为DGA生成域名的时候也可以少生成一些元音。

(4) 数字特征，区分行还行，大部分正常的域名都没有数字。

(5) 长度特征，域名长度，区分性较好。

(6) N-gram特征，区分性很好很好。

(7) 词素特征，一般包括根和词缀。可区分行较大。

(8) 发音特征，改进metaphone算法，以读音去进行编码。最后使用tri-gram去计算概率，作为输出。效果还行，能不能改进呢？

https://github.com/dracos/double-metaphone/blob/master/metaphone.py

以上是代码实现。

使用方法参考 https://pypi.org/project/Metaphone/

(9) TLD特征，TLD是top level domain，分别计算在两个类别中的概率，用以区分。

安装 `pip install tldextract`

使用参考 https://pypi.org/project/tldextract/



4、预处理

分析了second- level 域名，使用工具tldextract，

只考虑了域名长度>6的。



5、特征提取



6、模型训练——基于AI的方法

模型:	SVM、ET、RF、CNN。 

RF效果最好。



7、交叉验证

可以用来评价选择的数据集对结果的影响。关键代码如下

```python
param_test = {'max_depth': range(3,18,2),'min_samples_split':range(20,201,20)}
gsearch = GridSearchCV(estimator=RandomForestClassifier(n_estimators=40,
                                                       max_features=None,oob_score=True,
                                                       random_state=10,n_jobs=-1),
                      param_grid=param_test, scoring='roc_auc',iid=False,cv=10)
gsearch.fit(feature,target)
```



8、数据

良性域名：Alexa top 1,000,000

恶意：1,100,359 DGA



收获：

1、本文使用了读音的特征和TLD的特征，并且是去检测核心C&C服务器的域名。