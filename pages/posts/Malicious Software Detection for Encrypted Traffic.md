---
layout: post
title: 基于机器学习的加密流量恶意软件检测的综合性能研究
tags:
  - 恶意软件检测
  - ML&DL
categories:
  - paper阅读笔记
author: 1ss4k
date: 2021-01-01 11:34:00
---


### 0x00 发表刊物



会议论文 2020 7th International Conference on Networking, Systems and Security (NSysS)

Networking and Security



作者分别来自：马萨诸塞州洛威尔大学、宾夕法尼亚州伊丽莎白镇大学、因特尔公司。

暂时未找到会议等级(属于ACM？)

### 0x01 研究目的



​	网络流量中加密流量越来越多，黑客也用加密技术来来传播恶意软件。恶意软件会严重危害网络的安全，侵犯用户的隐私。

​	本文的目的是借助机器学习和深度学习的方法，去制造一款准确的、近实时的网络流量分析系统，用来识别TLS加密流量中的恶意软件。



专有名词：

NTA：Network Traffic Analysis 网络流量分析



### 0x02 前人工作

#### NTA(网络流量分析)技术的发展



* 基于端口 ---> 基于机器学习

* 基于端口的方法已经不可靠了，因为现代应用程序已经转为：动态端口分配。

* 随着加密流量的体量增加，深度包检查(deep packet inspection DPI)也变得无效了，因为大多数流量都加密了。并且由于速度较慢，他也不适用于实时分析。



#### 恶意软件检测系统的发展



* [23]收集了他们自己的数据，利用LSTM的skip-gram neural语言模型开发了基于HTTPS流量的检测系统。他们将他们的方法与使用工程特征作为输入的[4]随机森林分类器进行比较，然后说使用神经语言模型的LSTM达到了更高的精度。

  但是他们用自己的私有数据来进行实验是不科学的。

  

* [3]使用元数据流、包长度和时间序列、字节分布和未加密的TLS头信息，来检测TLS加密加密流量中的恶意软件



* [8,13,29]使用公开的数据集(KDD-Cup99和NSL-KDD)，去研究**集成模型**的精度，如C4.5算法、决策树、随机森林、SVM、AdaBoosr。



* 与集成分类器类似，[22]提出了不同的两级分类算法，第一级采用朴素贝叶斯作为主分类器，第二级采用名义二值滤波和交叉验证。



* [24]比较了各种浅层和深层网络，使用KDD-Cup99和NSL-KDD数据集，在二值检测和多分类检测的情况下，比较他们在入侵检测系统中的有效性。他们发现深度网络比浅层网络的精度更高。



* [25]创建了CICIDS2017数据集，并且通过比较KNN、RF、ID3几种机器学习技术，使用从CICFFlowMeter [11]得到的结果来介绍这个数据集。ID3得到了最好的F1值，为0.98，RF的F1值为0.97，但是它的执行时间只有ID3的1/3。



但是上述方法都没有考虑计算成本。



* [19]提出了一种称为显示距离搜索的分类搜索树方法，来加速FPGA上的流量分类。



综上，深度学习方法可以达到最先进的效果。但是之前的工作大多：要么关注恶意软件类型的分类，要么没有考虑到时间成本。



#### 加速器的发展



* [14] DAAL提供了对因特尔处理器的优化方法，DAAL函数通过平均每个处理器的[指令集、向量宽度、核数和内存体系结构]，来最大限度地提高处理速度。并且他支持很多机器学习算法。



* [15] Open VINO库由两个主要的组件组成：模型优化器和推理机。模型优化器负责从我们的普通的神经网络模型中获得预先训练好的模型，例如ANN，CNN，LSTM，CNN + LSTM。然后将这些模型转换成中间表示形式，OpenVINO可以利用这些中间形式来显著提高推理率。

### 0x03 本文研究方法



​	本文的目的是在客户端，使用[元数据]和[与TLS协议相关的流数据]，来检测TLS加密的恶意软件。

用一些广泛使用的机器学习和深度学习的算法，去测试他们检测恶意软件的能力。并且使用加速库如DAAL和OpenVINO去对系统进行加速。

#### 数据收集阶段

##### 数据准备



​	Stratosphere IPS 和 CIC 提供的`.pcap`格式的文件不能被大多数数据分析库利用，并且提供的恶意软件追踪 分散在不同的文件中。

​	所以我们先从Stratophere IPS中提取了20种不同类型的恶意软件，如Adload、PUA、TrickBot、Ramnit、Ransom等，并且配合良性数据，建立一套网络追踪数据集**dataset1**。

​	接着，我们使用CIC中的CICIDS2017来产生**dataset2**。要根据时间戳找出我们感兴趣的流量，并标记为“恶意软件”。我们只关注是否为恶意软件，而不关注他们的类型。

##### 数据预处理

​	我们的特征提取器派生自Cisco Joy(但是文中没有说对特征提取器做了哪些修改)，将数据集中得到的元数据输入到特征提取器中，提取超过200个流(flow)特征。

​	特征提取器首先会将原始数据流的大小分为200(>200的做切割，≤200的不变化)。

​	提取的特征存储为JOSN格式。

​	元数据特征 (如包数、流的持续时间、源端口、目标端口等 ) 不依赖于任何协议，所以每个流实例都可以提取。但是当流实例包含特定协议的包时，特定协议相关的特征才能够被提取 (如TLS、DNS、HTTP协议)。

​	提取完metadata，TLS ，DNS，HTTP特征之后，隐蔽了源IP和目的IP，来对数据进行匿名化处理，这也消除了收集网络流量的计算机的静态IP地址导致的数据集的偏差。

​	将开始时间、结束时间转换为 时间长度。这是为了消除模型可能会用“时间戳”而造成的预测偏差。

​	将每个流的id 和 label 添加到 JSON格式的特征文件输出中。

​	最后，我们通过检查流中是否有TLS加密的特征，来过滤出TLS加密的流。



​	实际过程中 过滤掉单向包、未确认的包。此时数据集1、2中分别保留大约 114000、75000个双向流。

##### TLS特征处理



​	元数据包括数字特征的数据以及非数字特征的数据，需要将可变大小的非数字特征需要被转换成为固定长度的数字特征，以便用输入数据矩阵中的元数据特征来表示TLS信息。

​	将TLS特征与元数据特征一起构建成数据矩阵。一些特征值是单个的整数值，他们直接占据数据矩阵的一列就可以，但是另一些是长度不固定的字符串，需要分析出前N个最常出现的值，例如我们选择N=13，然后分配13列，如果是这个特征值，相应的位置就标为1，否则标为0，最后再剩一列标示未在最常见的几个值里面的情况。

##### 基于卡方算法的特征选择



​	目的是选择数量更少的 更重要的特征。

​	可以根据特征与目标的相关性，选择出50个相关性最高的特征，存储到cvs文件中。选择的特征如图



图1

![upload successful](/images/pasted-17.png)


图2

![upload successful](/images/pasted-18.png)



#### 系统设计阶段

##### 数据标准化



选择出top50特征之后，对数据进行标准化，即减去平均值，再用标准差处以每个特征值。

##### 分类器



对模型进行比较和评价。

```txt

Logistic Regression: 
有监督分类模型。可以看作是 以输入变量的线性组合的sigmoid作为参数估计。它输出 [给定样本属于给定标签]的概率。
标准库或加速库都没有参数来训练此模型。

Random Forest
有监督分类。它由若干决策树组成，通过投票输出一个集成预测。
在本实验中，估计数被设定为100，决策树的最大深度被设定为10。

Support Vector Machines
SVM的目的是设立一个超平面，将两个支持向量分开，其中，支持向量是最接近决策边界的样本点。
SVM分类器的参数是正则化参数C 和 核函数，C设为1.0，核函数是线性核。

k-Nearest Neighborhood
通过比较它和[最邻近实例]之间的距离，并指定占多数的实例的标签。
本实验k设置为5，并使用(1)中的Minkowski距离计算公式。

```



图3

![upload successful](/images/pasted-19.png)


其中N是训练集中 流实例的数量，k表示最近实例的数量，这些实例将被测量，以对新实例进行分类。



```txt
Multi-Layer Perceptron 多层感知器
最简单的MLP分类器包括输入层、隐藏层和输出层，
本实验中，隐藏层是单层，实现了128个隐藏单元。
L2正则化因子设为0.0001，并且使用adam作为优化器。

Convolutional Nerual Network
内核大小被设置为3，每个卷积层用步幅为1.28的滤波器。128个隐藏单元用于完全连接层。
CNN模型由两个CNN层和两个完全连通层构建。
落差比(dropout)设为0.5，以防止overfitting。

Long Short-Term Memory Neural Network
LSTM层通过利用暂时信息对给定序列数据的表示进行编码。因此，LSTM层需要一个二维的输入数据。
维度是n x D，n设置为10第15。设置为10，D是5。
输出softmax层之后的两个LSTM层被用来构建RNN(递归神经网络)，隐藏单元的数量被设置为128，dropout率被设置为0.5。

CNN + LSTM
一些混合模型在早期使用CNN层来利用空间信息，在后期使用LSTM层从数据集中学习时间信息。
本混合模型包含：两个CNN层，一个LSTM层和两个完全链接层。
在本实验中，内核大小设置为4，每个卷基层的stride为1.32，为LSTM层和完全连接层设置200个隐藏单元。
dropout ratio = 0.5

```

深度学习中的超参数是在默认值附近手动搜索取得的。例如，学习率设为0.001，学习衰减率设为0.00001，batch size设为100，输出层的正则化参数设为0.0001。所有的模型都用Adam 优化器训练了100个epochs。

#### 未加速版本的模型的实现



使用Scikit学习库作为CPU上传统的机器学习分类器，有Tensorflow后端的Keras库作为GPU上的深度学习模型。

#### 加速模型



目的是加速CPU上模型的训练和推断。

我们使用DAAL加速逻辑回归，随机森林，SVM和KNN。

深度学习模型使用因特尔的Open VIMO库进行加速。

### 0x04 结果分析



​	评价指标包括：分类的准确度、运行时间、流预测时间、吞吐量、系统资源利用率(CPU RAM)，并评估了加速器实际部署的技术。	



**分类有效性**

ACC：accuracy in the validation split 有效分割的准确率

TPR：true positive rate 正确

FAR：false alarm 良性软件划分为恶意



PR：加速模型的吞吐量值 / 标准模型的吞吐量

图四

![upload successful](/images/pasted-20.png)


CPU的利用率是从python中的psutil库得到的，内存消耗是从memory_profiler模型得到的。

所有得到的结果都用10倍交叉验证进行平均。

#### 普通ML的性能结果



一些模型在数据集1上的测试结果如图所示。

图5

![upload successful](/images/pasted-21.png)


TPR和FAR是更加重要的指标，ACC的重要性次之。

RF的TPR为99.996%，最高，并且FAR最低，为0.0297%。

给出了训练阶段和预测阶段的吞吐量，计算方法是：给定阶段的数据流/该阶段的时间间隔。



数据显示，LR的预测速度较快，内存利用率也比较低，但是产生更高的误报率，过高的误报率是不可取的。

从图上可以看出，KNN的CPU利用率是100%，所以我们得到他使用的是单核。而最准确的RF要求超过10个核。

#### 普通DL的性能结果



训练时的吞吐量是在GPU上得到的，而预测阶段的是在CPU上。

由于提出的模型是在GPU上实现的，所以还测量了GPU的内存利用率。结果如下图所示：



图6

![upload successful](/images/pasted-22.png)


MLP的TPR最高，为99.995%，并且FAR最低，为0.1305%，并且RAM所需内存最低，为860MB，并且训练阶段和预测阶段速度都是最快的。 

所提出的这些所有模型都大约需要7-9个核，1.3-1.7GB的RAM内存。



​	深度学习较为复杂，需要大量的系统资源，总体性能不一定比简单的模型更好。在提取流特征的情况下，深度学习模型的精度不如轻加权的机器学习模型(如逻辑回归和随机森林)。并且对于深度学习模型来说，本文的输入数据相对还是小了些，所以结果也达不到我们想要的精度。

#### DAAL加速过的ML的性能



结果如图7所示，通常加速会降低准确性，增加CPU的利用率，如RF。

但是KNN在加速之后实现了更高的准确性，并且所需要的内存更少。



图7

![upload successful](/images/pasted-23.png)
SVM加速之后，训练阶段的吞吐量极大地降低了，所以速度更慢了，但是预测阶段吞吐量提高了，而且预测阶段更加重要。

#### Open VINO加速DL的性能



训练之后，只需要单核就可以完成预测。t_pr都大大提高了。



图8

![upload successful](/images/pasted-24.png)

#### 数据2测试



此外，用数据2进行实验，比较加速和未加速版本。

图9

![upload successful](/images/pasted-25.png)


SVM的加速率最高

LR有最高的吞吐量，但是他的准确率倒数第二低，1DCNN最低。

与数据集1的结果进行比较，没有哪个模型在两个数据集上都达到了较高的准确率。相对比较准确的是：SVM、RF、MLP。

### 0x05 未来方向



(1)计划使用加密流中头字段的原始字节来训练DL模型，以评估流特征的效果

(2)研究恶意软件检测其他阶段的资源利用率，包括特征提取阶段，

### 0x06 highlights && contribution





贡献：

(1)数据集：创建了一个加密网络流量数据集，有超过100个流特征。

从IPS data repository(https://www.stratosphereips.org/datasets-overview) 得到原数据

从CICIDS2017中得到另一些数据。

创建了一个有7种不同的恶意软件类型和良性数据的数据集。



(2)特征

从数据集中提取不同的流特征，对特征进行预处理，选择最重要的特征用于分析。



(3)综合性能研究

比较了一系列机器学习分类器和深度学习模型，目的是找到最佳分类精度。

### 0x07 数据集总结



文中提到的一些数据集

(1)KDD-Cup99，网络入侵检测

http://kdd.ics.uci.edu/databases/kddcup99/kddcup99.html

1999年，已过时。



(2)NSL-KDD

https://ieeexplore.ieee.org/document/5356528

是对(1)KDD-Cup的补充发展

2009年，已过时。



(3)CICIDS2017

TowardGener- ating a New Intrusion Detection Dataset and Intrusion Traffic Characterization. 108–116. https://doi.org/10.5220/0006639801080116



(4)Stratosphere IPS

https://www.stratosphereips.org/datasets-overview



(5)CIC

https://www.unb.ca/cic/datasets/index.html



### 存在问题：



1、发现图6给的数据和文中说的很不一样，即table4，不知道为什么...