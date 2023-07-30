---
layout: post
title: 基于机器学习的HTTPS流量的恶意DNS检测
tags:
  - DNS检测
  - DoH
categories:
  - paper阅读笔记
date: 2021-01-17 14:08:00
---
会议：2020 International Conference on Innovation and Intelligence for Informatics, Computing and Technologies (3ICT) 

2位作者，分别来自维亚普大学计算机科学与工程学院、印度信息技术学院计算机科学与工程系。

### 背景及目的



​	互联网发展迅速，DNS(域名系统)是很重要的一个部分。DNS的主要任务是 通过映射IP和域名，将用户引导到正确的计算机、应用程序和文件上。DNS存在一定的缺陷，所以常被攻击。

​	本文主要通过不同的机器学习方法 来检测DoH环境中DNS级别的恶意活动。

### 前人工作



#### DNS相关知识



​	DoT和DoH都是标准的协议，是通过加密DNS流量，来保护隐私和安全性。

​	DNS的三个基本服务器：根DNS、TLD、权威DNS。TLD由通用域名组成，如gov、edu、com和org。TLD服务器将这个记录给权威DNS server，权威DNS服务器负责维护域。最后，权威DNS服务器返回网站的IP地址。

​	在处理任何应用程序时，DoH都会绕过传统的DNS。下图是一个DNS请求的完整DoH过程。(其实最左边的step-2实际上应该为step-1)


![upload successful](/images/pasted-157.png)

​	在美国，Mozilla在2020年2月启用了DoH并为用户设置了默认值。目前，大多数流行的浏览器都支持这个DoH，如Google Chrome、Edge、Firefox等。



#### DoH的主要安全问题：



* 它绕过了防火墙、IDS等本地安全措施
* 无法审计DNS流量
* DNS名称可能无法保密
* 检测威胁变得更为复杂
* 技术支持和故障排除 [因应用程序和DNS解析器的不同] 发生重大变化
* 无法执行DNS blocking



#### 研究发展



* [10]开发了一种DoT指纹方法来分析DoT流量。该方法 通过区分真实用户和敌手 来确定是否是DNS的真实请求。得出结论，即使在加密的DoT中，信息泄漏也是可能的。

* [11] 在研究中讨论了 基于DoH的安全性和隐私性的 性能分析。它主要讨论DoH的安全问题和隐私策略，没有对网络层面的加密进行分析。
* [12]提出了一个新的特征集，来执行与DoH相关的攻击。他们的分析声称 填充方法是有效的，但是当攻击者更加智能的时候这是不够的。

* [13]通过应用真实的情报威胁分析框架，提供了DoH探测的完整细节。在实验室学习期间，他曾多次测试DoH的基本安全控制。

* [14]对加密的DoH流量进行了研究和识别。他们使用了一些重要的特征向量来发现对分类的性能。它还试图识别DoH的内容，但这只能通过流行服务的已知IP地址来实现。

* [15]使用ML分类模型 来对DoH请求和非DoH请求进行分类。他们使用了5个ML分类器，检测DoH的准确率达到99.9%。但是 它仅对DoH流量和传统DNS流量进行了区分。



据我们所知，还没有研究工作来检测DoH流量的恶意活动。

### 本文方法



​	本研究的目的是在对数据集进行训练后，利用不同的ML分类器对DoH中的恶意和良性DNS请求进行预测。整体的流程如下图：


![upload successful](/images/pasted-158.png)

1、数据集

使用的是https://www.unb.ca/cic/datasets/dohbrw-2020.html  中共享的数据集，包含两个文件：良性.csv和恶意.csv。我们把它合并成一个组合文件。



2、预处理

对合并后的数据进行预处理，去除空属性。在删除空属性之后，总共有269299个样本。



3、特征提取

使用了https://github.com/ahlashkari/DoHlyzer 中提到的DoHMeter工具，从数据集中提取重要而有效的特征。所选特征如下：


![upload successful](/images/pasted-159.png)

为了检测模型的性能，把数据集按3:1分成训练集和测试集。(实验证明3:1的分类比例效果更好。)



4、模型开发

在模型开发阶段，本文主要使用了五种分类器，即

i）朴素贝叶斯（NB）

ii）逻辑回归（LR）

iii）随机森林（RF）

iv）K近邻（KNN）

v）梯度增强（GB）



5、 模型性能评估

使用了Precision、recall、FI-Score 三个指标来评估模型的性能。其计算公式如下：


![upload successful](/images/pasted-160.png)

6、实验结果分析

i）朴素贝叶斯（NB）


![upload successful](/images/pasted-161.png)

混淆metrics如下：


![upload successful](/images/pasted-162.png)
ii）其他分类器

从下图中可以看出：RF的效果最好。


![upload successful](/images/pasted-163.png)

混淆metrics如下图：


![upload successful](/images/pasted-164.png)



AUC值如下：


![upload successful](/images/pasted-165.png)

GB分类器的效果和RF类似，都比较好。

综上所述，基于集成学习（Bagging或Boosting）的分类器，如RF和GB是解决上述问题的最佳选择。KNN和LR效果次之，NB效果最差。



7、未来方向

我们将尝试使用DoH和non-DoH捕获一些新的数据，并尝试预测恶意和正常的DNS或DoH DNS请求。



### 资源整合



1、DoH数据集

https://www.unb.ca/cic/datasets/dohbrw-2020.html



2、DoH特征提取工具

https://github.com/ahlashkari/DoHlyzer