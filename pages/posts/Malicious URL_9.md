---
title: 恶意URL检测(九)一些比较杂的文章
date: 2021-04-27 08:02:42
tags:
categories:
    恶意URL检测
---

## 二十四、训练Transformers

1、发表于火眼上的一篇文章，地址https://www.fireeye.com/blog/threat-research/2021/01/training-transformers-for-cyber-security-tasks-malicious-url-prediction.html，
时间2021年1月。


2、前人工作

GPT-3模型可以产生语法正确的长segments

...等等等

但是危害是：可能产生并传播很多无意义的信息



3、操作是在字符level，每一个字符与一个input token相关。

整体流程如下：

![image-20210422085212777](/Malicious_URL_9/image-20210422085212777.png)



4、损失函数 & 训练Regimes

Transformers允许自监督训练(可以看成是无监督的学习)，可以将transformer看作是特征提取器。

regimes:

(1) Direct Label Prediction (Decode-To-Label):   transformwes提取特征，然后输入到分类器计算。使用二值交叉熵损失。

(2) Next-Character Prediction Pre-Training and Fine-Tuning：类似预测下一个单词，可以利用无标签的数据。由于是多分类，必须用softmax函数。

(3) Balanced Mixed-Objective Training：使用到更多的知识。本文同时训练二值分类和下个特征分类。损失函数也是二者的集合。



5、实验结果

实验发现，Balanced Mixed-Objective Training效果最好，Direct Label Prediction次之。

由与其他模型如RF、CNN、LSTM等。

结果是CNN效果最好，得出结论Transformer可能不是那么适用于恶意URL检测。。。啊这 =。=



收获：

1、借鉴这种：同时使用二值分类和下个特征分类的思想。

但是本文得出的结论是：下个特征分类其实和恶意URL检测没有太大关系，所以可以考虑一些其他合适的方法。但是损失函数中引入他，却提高了性能。



## 二十五、区块链 钓鱼检测

原文题目：Phishing Scam Detection on Ethereum: Towards Financial Security for Blockchain.

(其实本文不是太NLP)

1、文章发表于IJCAI2020，属于CCF- A类会议。作者来自中山大学。

2、在区块链领域，不仅有窃取隐私数据，还有诱骗用户往特定账户赚钱。非法加密的货币需要通过交易才能变成合法货币。公共区块链的交易记录是可以公开访问的，可能造成钓鱼攻击。

3、区块链中定位钓鱼账户存在的问题：

1) 只有交易记录，对账户的信息了解较少。

2) 钓鱼地址较少，而其他地址非常多，定位钓鱼地址就显得比较困难。

4、本文方法：

![frame](/Malicious_URL_9/frame.jpg)

本文是基于对区块链的处理去检测钓鱼用户。提出了一种基于图的瀑布特征提取方法，以及一种基于lightGBM的双采样嵌入算法去构建模型。



5、瀑布特征提取方法

基于交易记录创建一个有向图TG。边有两个属性：blocknumber和amout，表示边出现的时间 和 交易的数量。

![2fig2](/Malicious_URL_9/2fig2.jpg)

提取A的2阶朋友的特征，有如下3个步骤：

(1) 使用交易记录，计算2阶朋友的统计特征。

(2) 使用(1)的结果，计算1阶朋友的统计特征。而不是用1阶朋友本身的数据来计算的。

(3) 使用(2)的结果计算A节点的统计信息。

此处没有考虑边的方向～但是边的信息是很重要的，所以在两个方向上分别提取特征。



**结点特征：**是这个节点的统计数据。有两种类型的数据：交易数量和交易时间。特征的命名格式：direction_type_method。例如：direction: in / out，type: block / ，method：std

最后一共得到了19个特征：

交易时间：

span: ptp

standard deviation: sd

交易数量：

sum

max

min

mean

standard deviation

交易不相关信息

count(交易数量)

unique(交易双方)

以上特征都是在in/out方向上分别计算，就是2*(2+5+2)=19

最后再算一个unique_ratio = unique/count。共19个特征

**朋友节点特征**

本文只计算一阶朋友节点。命名如下:friend_direction_statistic2_statistic1。
最后得到2*2 *2 * 5 *5= 200个特征。

6、双采样嵌入算法框架

(1) 基础模型

gradient boosting decision tree (GBDT)，包括XGBoost 和 lightGBM。本文发现在钓鱼检测方面，lightGBM更加有效，选择它作为基础模型。

具体模型的一些实现此处不总结了，也看不懂 TT

从训练集中移除掉较小的梯度samples。参考GOSS。

构建 CART regression tree的时候，lightGBM绑定互斥的特征，可以减少特征的数量。



(2)双采样嵌入

本人的启发思想来自[2008]EasyEnsemble，目的是解决分类不均衡的问题。伪代码如下：

![2fig3precode](/Malicious_URL_9/2fig3precode.png)

主要的思想就是：主要在数据量大大数据集上取样。本文的差异是，也在训练集上取样。


7、数据

钓鱼网站(1683个)：https://etherscan.io/accounts/label/phish-hack 

合法数据：https://www.parity.io/ethereum/



由于两者数据量差别较大，需要进行数据清洗。将一些很明显的良性数据删除掉，不进行训练。

本文1)过滤掉了智能合约的地址，2) 过滤掉少于10个或多于1000条交易记录的账户 3) 忽视掉在block height 2百万之前的记录。

原因是：1) 智能合约通常逻辑复杂，不易执行钓鱼检测，并且智能合约中只有很小一部分(2.6%)在钓鱼检测中，通常与tokens相关。2)  交易记录过少，不易评价，过多，则账户可能是wallet 或其他账户类型。事实上，有超过70%的账户都有超过1000条交易记录，但是只有1个是被标记为钓鱼的。 3) 分析发现钓鱼地址的活动时间都在2016-08-02之后，可能是早期钓鱼账户较少，记录就更少了。



最终选取了534，820个地址，其中323个是钓鱼地址。



8、实验结果

采用了k-fold交叉验证，其中k = 5

采用4个指标评价：precision / recall / F1 / AUC。



模型比较：比较lightGBM、SVM、DT和双采样嵌入模型(DE+)。设定特征采样率为70%，基础模型的数量为1600，结果如下。其中SVM效果最差。加入DE+之后，这三个模型效果都提升了。

![2fig4resultmodel](/Malicious_URL_9/2fig4resultmodel.png)

采样的有效性分析：
基模型的数量对结果的影响。

![2fig5](/Malicious_URL_9/2fig5.png)

特征采样评估

设定不同的采样率，且基模型的数量设为1600。

![2fig6](/Malicious_URL_9/2fig6.png)

0.8效果最好。说明并不是特征却多越好。如果特征太多，特征采样的方法可能会提高性能。这可能是因为 feature sampling can make different base models view the object from different angles,

这个因素有一定影响，但影响没有上一个因素那么大。



9、特征分析

top 15特征如下：

![2fig7](/Malicious_URL_9/2fig7.png)

in_block_std：反应了某个特定地址的in交易的强度。钓鱼网站的in交易突然增加。然而当钓鱼网站被披露之后，in交易会变少甚至消失。这导致钓鱼网站的in交易基本上都集中在某一个时间段内。

to_out_sum_median：median可以看成指代着经济strength，对于钓鱼地址，to 朋友是钓鱼网址的受害者，这个特征指代的是受害者基经济水平。

from_in_sum_min：钓鱼网站通常需要洗钱，这个特征通常作为过渡的地址，行为与正常地址很不一样。



收获：

1、代码开源！--- 没找到代码，借鉴这种思想吧！

2、针对恶意样本较少的问题，能否采用本文的双采样方法？如果为了平衡数据，可以选择良性里面看起来不那么良的，以增加模型的识别能力。

3、如果特征太多，可以采用采样的方法。考虑能否用到n-grams里面。


## 二十六、XLNet：语言理解的广义回归预训练

1、arXiv上的文章，作者来自卡内基梅隆大学，谷歌人工智能大脑团队。



2、预训练

AR：自回归，用一个回归模型来估计文本语料库的概率分布。其只被训练为编码单向上下文（向前或向后）

AE：自动编码，从损坏的输入重建原始数据。例如BERT。可以双向。

本文用到了AR和AE的优点。



3、本文方法：

pretraining objective：

(1)AR中，没有使用固定的因式分解阶，而是最大化一个序列的期望对数似然，也就是 所有可能的因子分解顺序排列。

(2)且本文的XLNet不依赖于数据损坏。同时，自回归目标还提供了一种自然的方法 来使用乘积规则分解预测令牌的联合概率，消除了BERT中的独立性假设。

architectural designs for pretraining：

(1) XLNet将Transformer XL的段递归机制和相关编码方案[9]集成到预训练中。

(2) 单纯地将Transformer（-XL）体系结构应用于基于置换的语言建模是行不通的，因为分解顺序是任意的，目标是不明确的。解决方案是：重新为Transformer设定参数。



收获：

1、能否理解URL的含义？

2、之前没了解过nlp，这篇文章基本都看不懂，代码开源，但是也没去看。感觉方向还不太重合，没有找到太多可以借鉴的思想。



## 二十七、Universal Sentence Encoder 通用句子编码器

1、arXiv上的文章，作者来自谷歌。



2、可用的数据集不够，许多模型通过使用预先训练好的单词嵌入（如word2vec（Mikolov et al.，2013）或GloVe（Pennington et al.，2014）生成的单词嵌入，通过隐式形成有限的迁移学习来解决这个问题。



3、文章中还有较多内容，但是先不看了，重点看一下模型怎么使用



代码实现

参考https://colab.research.google.com/github/tensorflow/hub/blob/50bbebaa248cff13e82ddf0268ed1b149ef478f2/examples/colab/semantic_similarity_with_tf_hub_universal_encoder.ipynb#scrollTo=MSeY-MUQo2Ha

ipython中

```python
#导入库
from absl import logging

#import tensorflow as tf
import tensorflow.compat.v1 as tf
tf.disable_v2_behavior( )
import tensorflow_hub as hub
import matplotlib.pyplot as plt
import numpy as np
import os
import pandas as pd
import re
import seaborn as sns

#载入模型
module_url = "https://tfhub.dev/google/universal-sentence-encoder/4"
model = hub.load(module_url)
print ("module %s loaded" % module_url)
def embed(input):
  return model(input)
```

url载入模型失败，总显示时间超时。

想要下载.pb模型以及变量文件然后导入，但是还是有点问题再加上服务器传不了很大的文件。

```python
from tensorflow.python.platform import gfile
 
#sess = tf.Session()
sess = tf.compat.v1.InteractiveSession()
with gfile.FastGFile('saved_model.pb', 'rb') as f:
    graph_def = tf.compat.v1.GraphDef.FromString(file_handle.read())
    graph_def.ParseFromString(f.read())
    sess.graph.as_default()
    tf.import_graph_def(graph_def, name='')

```



在colab中运行吧～

以下主要体现的是不管长句子还是短句子都可以～

```python
#@title Compute a representation for each message, showing various lengths supported.
word = "Elephant"
sentence = "I am a sentence for which I would like to get its embedding."
paragraph = (
    "Universal Sentence Encoder embeddings also support short paragraphs. "
    "There is no hard limit on how long the paragraph is. Roughly, the longer "
    "the more 'diluted' the embedding will be.")
messages = [word, sentence, paragraph]

# Reduce logging output.
logging.set_verbosity(logging.ERROR)

message_embeddings = embed(messages)

#message_embeddings结果如下
tf.Tensor(
[[ 0.00834449  0.00048082  0.06595246 ... -0.03266348  0.02640911
  -0.0606688 ]
 [ 0.05080861 -0.01652431  0.01573779 ...  0.00976659  0.03170122
   0.01788117]
 [-0.0283327  -0.05586218 -0.01294146 ... -0.05133027  0.01178872
   0.00579202]], shape=(3, 512), dtype=float32)


for i, message_embedding in enumerate(np.array(message_embeddings).tolist()):
  print("Message: {}".format(messages[i]))
  print("Embedding size: {}".format(len(message_embedding)))
  message_embedding_snippet = ", ".join(
      (str(x) for x in message_embedding[:3]))
  print("Embedding: [{}, ...]\n".format(message_embedding_snippet))
```

结果如下

```python
Message: Elephant
Embedding size: 512
Embedding: [0.008344488218426704, 0.00048081763088703156, 0.06595246493816376, ...]

Message: I am a sentence for which I would like to get its embedding.
Embedding size: 512
Embedding: [0.0508086122572422, -0.016524313017725945, 0.015737786889076233, ...]

Message: Universal Sentence Encoder embeddings also support short paragraphs. There is no hard limit on how long the paragraph is. Roughly, the longer the more 'diluted' the embedding will be.
Embedding size: 512
Embedding: [-0.02833268605172634, -0.055862169712781906, -0.012941470369696617, ...]
```

以下可以计算两个句子的相似度

```python
def plot_similarity(labels, features, rotation):
  corr = np.inner(features, features)	#计算内积，以行为单位来进行计算的
  sns.set(font_scale=1.2)
  g = sns.heatmap(
      corr,
      xticklabels=labels,
      yticklabels=labels,
      vmin=0,	#设定最小值和最大值
      vmax=1,	
      cmap="YlOrRd")
  g.set_xticklabels(labels, rotation=rotation)
  g.set_title("Semantic Textual Similarity")

def run_and_plot(messages_):
  message_embeddings_ = embed(messages_)	#进行嵌入
  plot_similarity(messages_, message_embeddings_, 90)	#画图
```

其实本质上就是把原来的式子计算内积，相应的位置内积的值越大，说明相关性越强



semantic textual 相似性(STS) 基准评估

```python

#sts_dev如下：
sts_data :         sim  ...                                             sent_2
0     5.00  ...               A man wearing a hard hat is dancing.
1     4.75  ...                         A child is riding a horse.
2     5.00  ...           The man is feeding a mouse to the snake.
3     2.40  ...                           A man is playing guitar.
4     2.75  ...                          A man is playing a flute.
...    ...  ...                                                ...
1465  2.00  ...                 Has Nasa discovered water on Mars?
1466  0.00  ...     WTO: India regrets action of developed nations
1467  2.00  ...  Volkswagen's "gesture of goodwill" to diesel o...'
1468  0.00  ...  Obama waiting for midterm to name attorney gen...
1469  0.00  ...  New York police officer critically wounded in ...

[1468 rows x 3 columns]

#dev_scores如下：
dev_scores: [5.0, 4.75, 5.0, 2.4, 2.75, 2.615, 5.0, 2.333, 3.75, 5.0, 3.2, 1.5830000000000002, 5.0, 5.0, 4.909, 0.8, 2.4, 5.0, 4.0, 0.636, 3.0, 1.714, 3.2, 2.167, 1.0, 1.9169999999999998, 4.25, 3.0, 1.0, 0.6, 2.6, 5.0, 4.6, 5.0, 4.8, 3.8, 5.0, 5.0, 4.2, 1.4, 3.6, 2.8, 1.6, 3.0, 1.4, 0.25, 0.25, 0.0, 4.0, 4.5, 0.5, 3.8, 4.8, 5.0, 0.25, 1.2, 0.6, 0.8, 3.8, 0.0, 3.5, 4.5, 2.8, 3.8, 3.8, 0.0, 4.0, 4.25, 2.812, 4.25, 3.0, 1.0, 3.75, 0.0, 0.4, 4.0, 2.6, 0.8, 2.4, 1.0, 0.2, 0.6, 3.6, 0.2, 0.2, 0.0, 0.0, 1.2, 0.0, 0.4, 0.4, 3.0, 4.4, 3.2, 3.4, 3.4, 3.6, 0.8, 0.8, 1.0, 1.6, 1.0, 3.2, 2.0, 0.0, 0.6, 0.0, 1.4, 2.0, 2.6, 4.2, 2.8, 0.0, 0.0.6, 0.0, 0.0, 0.0, 0.0, 2.2, 0.0, 0.4, 0.0, 2.6, 0.8, 0.4, 3.0, 2.2, 0.6, 3.4, 2.2, 1.8, 0.8, 
             ......
4.6, 3.8, 1.4, 3.8, 0.0, 1.6, 5.0, 0.4, 2.4, 3.2, 3.8, 2.6, 1.0, 4.0, 2.0, 2.2, 4.6, 4.4, 1.8, 0.0, 0.0, 2.0, 3.4, 0.2, 2.4, 0.0, 0.4, 1.8, 0.8, 0.4, 2.2, 1.8, 4.6, 2.2, 1.0, 1.0, 4.2, 0.4, 0.2, 0.0, 0.0, 0.0, 0.6, 0.6, 4.0, 0.0, 0.8, 3.2, 4.8, 4.2, 2.2, 1.0, 3.6, 1.6, 3.0, 2.4, 0.4, 0.0, 5.0, 1.2, 1.4, 4.0, 4.6, 3.4, 0.4, 0.0, 4.8, 5.0, 4.0, 4.0, 3.0, 5.0, 2.0, 3.0, 3.0, 1.0, 5.0, 2.0, 2.0, 2.0, 5.0, 3.0, 3.0, 0.0, 2.0, 0.0, 2.0, 0.0, 0.0]
Pearson correlation coefficient = 0.8036389313002914
p-value = 0.0
```



```python
sts_data = sts_dev #@param ["sts_dev", "sts_test"] {type:"raw"}

def run_sts_benchmark(batch):
  sts_encode1 = tf.nn.l2_normalize(embed(tf.constant(batch['sent_1'].tolist())), axis=1)
  sts_encode2 = tf.nn.l2_normalize(embed(tf.constant(batch['sent_2'].tolist())), axis=1)
  cosine_similarities = tf.reduce_sum(tf.multiply(sts_encode1, sts_encode2), axis=1)
  clip_cosine_similarities = tf.clip_by_value(cosine_similarities, -1.0, 1.0)
  scores = 1.0 - tf.acos(clip_cosine_similarities) / math.pi
  """Returns the similarity scores"""
  return scores

dev_scores = sts_data['sim'].tolist()
scores = []
for batch in np.array_split(sts_data, 10):	#分成10份
  scores.extend(run_sts_benchmark(batch))

pearson_correlation = scipy.stats.pearsonr(scores, dev_scores)
print('Pearson correlation coefficient = {0}\np-value = {1}'.format(
    pearson_correlation[0], pearson_correlation[1]))
```


自己尝试用3个URL去编码，结果如下

![3fig1](/Malicious_URL_9/3fig1.png)

如果对URL进行以下预处理，.、/、等号、变空格，-和_直接删除

良性的结果好很多，恶意有点离谱～

![3fig2](/Malicious_URL_9/3fig2.png)



## 二十八、通过网页中的 6 个特征字段检测钓鱼网站

发表于嘶吼的公众号，链接https://mp.weixin.qq.com/s/qQUQLlrALkBz-adWz56BTg

1、检测网页的HTML片段。

攻击者复制网站的时候，可能复制了一些无用的信息，我们的目标就是检测出这些无意义、被复制进去了的信息。

这些无意义的文件可能是哈希、版本控制、SaaS的API密钥、CSRF令牌、内容安全策略(CSP)的随机数、子资源完整性哈希。



这种想法挺巧妙的！



## 二十九、使用词汇特征检测钓鱼网站

1、文章发表于Computer Communications，2021。



2、选取9个最重要的特征，使用算法Spearman correlation, K best, and Random forest计算特征权重，然后输入到机器学习算法中。

![4fig1](/Malicious_URL_9/4fig1.png)

特征如下：

(1) 域中的token数

百度发现这个可以直接用parse来实现

```python
from urllib.parse import urlparse
url = 'http://netloc/path;param?query=arg#frag'
parsed = urlparse(url)
print(parsed)
print(len(parsed))
```

结果如下

```python
url = 'http://netloc/path;param?query=arg#frag'

ParseResult(scheme='http', netloc='netloc', path='/path', params='param', query='query=arg', fragment='frag')

In [20]: len(parsed)
Out[20]: 6
```



(2) 顶级域名的数量 TLD

自己保存一个顶级域名列表，如果在这个列表中的才算做是顶级域名。

别的第三方库好像不能用，因为他们只能提取出一个顶级域，不能提取出多个。只能自己写个正则表达式的字符串匹配。

实现思路：

```python
.出现
匹配后面的字母
在库中搜索
```

...

```python
from urllib.parse import urlparse
import re


print("--"*40)
for url in urls:
  print
    parts = urlparse(url)
    host = parts.netloc
    m = pattern.search(host)
    res =  m.group() if m else host
    print("unkonw") if not res else res

```

库

```python
[a-z0-9-]{1,63}(.ab.ca|.bc.ca|.mb.ca|.nb.ca|.nf.ca|.nl.ca|.ns.ca|.nt.ca|.nu.ca|.on.ca|.pe.ca|.qc.ca|.sk.ca|.yk.ca|.co.cc|.com.cd|.net.cd|.org.cd|.co.ck|.ac.cn|.com.cn|.edu.cn|.gov.cn|.net.cn|.org.cn|.ah.cn|.bj.cn|.cq.cn|.fj.cn|.gd.cn|.gs.cn|.gz.cn|.gx.cn|.ha.cn|.hb.cn|.he.cn|.hi.cn|.hl.cn|.hn.cn|.jl.cn|.js.cn|.jx.cn|.ln.cn|.nm.cn|.nx.cn|.qh.cn|.sc.cn|.sd.cn|.sh.cn|.sn.cn|.sx.cn|.tj.cn|.xj.cn|.xz.cn|.yn.cn|.zj.cn|.us.com|.com.cu|.edu.cu|.org.cu|.net.cu|.gov.cu|.inf.cu|.gov.cx|.com.dz|.org.dz|.net.dz|.gov.dz|.edu.dz|.asso.dz|.pol.dz|.art.dz|.com.ec|.info.ec|.net.ec|
...                .win|.work|.wtf|.xxx|.XYZ|.kaufen|.desi|.shiksha|.moda|.futbol|.juegos|.uno|.africa|.asia|.krd|.taipei|.tokyo|.alsace|.amsterdam|.bcn|.barcelona|.berlin|.brussels|.bzh|.cat|.cymru|.eus|.frl|.gal|.gent|.irish|.istanbul|.istanbul|.london|.paris|.saarland|.scot|.swiss|.wales|.wien|.miami|.nyc|.quebec|.vegas|.kiwi|.melbourne|.sydney|.lat|.rio|.ru|.aaa|.abb|.aeg|.afl|.aig|.airtel|.bbc|.bentley|.example|.invalid|.local|.localhost|.onion|.testa)$
```



这个没写出来，在山穷水尽的时候发现github上有自动提取特征的代码！我又活了～

```python
import re
def count_tld(text):
    """Return amount of Top-Level Domains (TLD) present in the URL."""
    file = open('tlds.txt', 'r')
    count = 0
    pattern = re.compile("[a-zA-Z0-9.]")
    for line in file:
        i = (text.lower().strip()).find(line.strip())
        while i > -1:
            if ((i + len(line) - 1) >= len(text)) or not pattern.match(text[i + len(line) - 1]):
                count += 1
            i = text.find(line.strip(), i + 1)
    file.close()
    return count

url = "https://blog.csdn.net/weixin_42793426/article/details.xyz.cn/88545939.xyz"
count_tld(url)
```

大致思路就是从库中一个一个去比对，看看有没有出现过～太巧妙了！



(3) URL的长度

```python
def  length_url(text):
        return len(text)
```



(4) 查询中的数据

```python
from urllib.parse import urlparse
import re

def count_digit_in_query(text):
    content_query = urlparse(text).query
    print(content_query)
    count = 0
    return len(re.findall(r'=[1-9][^a-z]', content_query))

url = "https://blog.csdn.net/weixin_42793426/article?id=4/details.xyz.cn/88545939.xyz?id=3cdjdvjdfbv/csjhvufhgui?id=11"
res = count_digit_in_query(url)
if(res == 0): res = -1
```

这个也是自己写的，相当于在query中匹配 `=数字`，有一个缺陷就是?id=34bjsnfejrjv也会被匹配到，认为是数字查询。不过这种情况应该很少，就先不管他啦～



(5) URL中点的数量

```python
def count(text, character):
    """Return the amount of certain character in the text."""
    return text.count(character)

url = "http://127.0.0.1:800....0"
res = count(url, ".")
```



(6) 域中定界符的数量

因为在域中可能会做一些混淆，使得一个URL看起来像是合法的URL。

先找到所有的域，再分别找到每个域中的定界符。但是找到所有的域有点难度，直接用urlparse的netloc。

```python
from urllib.parse import urlparse
def count(text, character):
    """Return the amount of certain character in the text."""
    return text.count(character)
url = "https://bl-og.csdn.net/weixin_42793426/article?id=4/details.xyz.cn/88545939.xyz?id=3cdjdvjdfbv/csjhvufhgui?id=11"
domain = urlparse(url).netloc
count_res = 0;
delimiter_list = ['.','-','_','/','?','=','@','&','!',' ','~',',','+','*','#','$','%',';','{','|','(']
for symbol in delimiter_list:
  count_res += count(domain,symbol)
```

如果后续改进的话，借助count_tld。if count_tld > 1，后面再搜索一次



(7) path中定界符的数量

```python
from urllib.parse import urlparse
def count(text, character):
    """Return the amount of certain character in the text."""
    return text.count(character)
url = "https://bl-og.csdn.net/weixin_42793426/article?id=4/details.xyz.cn/88545939.xyz?id=3cdjdvjdfbv/csjhvufhgui?id=11"
path = urlparse(url).path
count_res = 0;
delimiter_list = ['.','-','_','/','?','=','@','&','!',' ','~',',','+','*','#','$','%',';','{','|','(']
for symbol in delimiter_list:
  count_res += count(path,symbol)
```



(8) 多个path中 最长的path的数量

原本应该找出来多个path，但是，还是不太好找，还是直接计算path的长度吧～

```python
from urllib.parse import urlparse
url = 'http://netloc/path;param?query=arg#frag'
path = urlparse(url).path
print(path)
print(len(path))
```



(9) 域名长度

```python
from urllib.parse import urlparse
url = "https://bl-og.csdn.net/weixin_42793426/article?id=4/details.xyz.cn/88545939.xyz?id=3cdjdvjdfbv/csjhvufhgui?id=11"
domain = urlparse(url).netloc
print(domain)
print(len(domain))
```



3、特征重要性

使用了三种算法，如特征相关、K-best和随机森林，来确定特征的重要性。

特征相关：Spearman和Pearson算法。1贡献性很大。

可以得出结论，路径中的分隔符、域中的分隔符、URL中的点数、URL的长度是其中最重要的特征。



4、特征预处理

删除无效的字符/数据值进行缩放/热编码/



5、机器学习算法：随机森林、KNN、LR、SVM。

对各个分类器赋予权值，投票得出最终结果。



但是目前到现在，还是不知道具体的要去如何实现。

用自己的数据库运行一下GitHub上的一个例子～

```python
import os
import sys
import re
import matplotlib
import pandas as pd
import numpy as np
from os.path import splitext
import ipaddress as ip
import tldextract
import whois
import datetime
from urllib.parse import urlparse

df = pd.read_csv("10data.csv")
df = df.sample(frac=1).reset_index(drop=True)	#取样
df.head()


#2016's top most suspicious TLD and words
Suspicious_TLD=['zip','cricket','link','work','party','gq','kim','country','science','tk']
Suspicious_Domain=['luckytime.co.kr','mattfoll.eu.interia.pl','trafficholder.com','dl.baixaki.com.br','bembed.redtube.comr','tags.expo9.exponential.com','deepspacer.com','funad.co.kr','trafficconverter.biz']


# Method to count number of dots
def countdots(url):  
    return url.count('.')

# Method to count number of delimeters
def countdelim(url):
    count = 0
    delim=[';','_','?','=','&']
    for each in url:
        if each in delim:
            count = count + 1
    return count

# Is IP addr present as th hostname, let's validate
import ipaddress as ip #works only in python 3

def isip(uri):
    try:
        if ip.ip_address(uri):
            return 1
    except:
        return 0

#method to check the presence of hyphens
def isPresentHyphen(url):
    return url.count('-')

def isPresentAt(url):
    return url.count('@')
  
def isPresentDSlash(url):
    return url.count('//')
  
def countSubDir(url):
    return url.count('/')
  
def get_ext(url):
    """Return the filename extension from url, or ''."""
    root, ext = splitext(url)
    return ext

def countSubDomain(subdomain):
    if not subdomain:
        return 0
    else:
        return len(subdomain.split('.'))

def countQueries(query):
    if not query:
        return 0
    else:
        return len(query.split('&'))

#特征集设置
featureSet = pd.DataFrame(columns=('url','no of dots','presence of hyphen','len of url','presence of at',\
'presence of double slash','no of subdir','no of subdomain','len of domain','no of queries','is IP','presence of Suspicious_TLD',\
'presence of suspicious domain','label'))

#XXX

for i in range(len(df.head(20000))):
    features = getFeatures(df["url"].loc[i], df["label"].loc[i])    
    featureSet.loc[i] = features
    print(i)
#上面这一步是特征提取，对于2万条URL，在cronlab中处理需要3分20秒
featureSet.head()

```



特征的矩阵信息如下，感觉提取的有点问题。

![4fig2](/Malicious_URL_9/4fig2.png)

下面就是测试的步骤了～



准确度说实话还是有点低了，而且假阳率过高，到70%左右了，可能是其中的步骤有问题了。

![4fig3](/Malicious_URL_9/4fig3.png)



检查发现可能是特征提取有问题。如下图：

![4fig4](/Malicious_URL_9/4fig4.png)

咋可能点数这么少呢～检查了一下，感觉数据集不是很好，没有前面的http://



使用桌面上的url data.csv文件进行测试，然后稍微更改了一些特征，让特征变得合理了一些～ 加入了TLD count

以下是用200个数据去测试。

![4fig5](/Malicious_URL_9/4fig5.png)

![4fig6](/Malicious_URL_9/4fig6.png)

准确度一下达到了0.9！！！从原来的0.89到了0.92！质的飞跃～

![4fig7](/Malicious_URL_9/4fig7.png)



![4fig8](/Malicious_URL_9/4fig8.png)

这结果也太好了叭！



然后用20000条数据去测试～

![4fig9](/Malicious_URL_9/4fig9.png)

咋差别不大啊

![4fig10](/Malicious_URL_9/4fig10.png)

![4fig11](/Malicious_URL_9/4fig11.png)

咋和预期的不太一样呢，这不太好区分啊...

结果如下：

![4fig12](/Malicious_URL_9/4fig12.png)

![4fig13](/Malicious_URL_9/4fig13.png)

如果用所有的42万条数据去测试～大概要2h左右，时间有点久哦😯

预测结果可能不会改进太多吧，可能稍微提高一些



后续改进的时候可以加入如下特征：

```python
def count_vowels(text):
    """Return the number of vowels."""
    vowels = ['a', 'e', 'i', 'o', 'u']
    count = 0
    for i in vowels:
        count += text.lower().count(i)
    return count
```



收获：

1、加入文中：为了逃避黑名单检测，攻击者可能对URL进行微小的修改。

2、加入文中：

URL格式

![4fig14](/Malicious_URL_9/4fig14.png)

3、本篇比较好的地方可能是：实验结果较好 + 使用了特征评判 + 多个TLD

​	如果有多个TLD，如何真实的数量？上文中已解决。



## 三十、从假新闻域中发现和度量恶意重定向活动

导师发的。

目标对象是：假新闻网站，重定向URL。



感觉和自己的方向不是很匹配，不再继续看了。



## 三十一、Doc2Vec代码实现

看学长之前比赛的wp，学习到了Word2Vec的改进方法Doc2Vec，下面来实现一下，看看其效果。

之前测试的时候一直有错，现在来尝试一下别人的Word2Vec的实现。



链接如下：https://github.com/ajinkyabhanudas/ML-in-network-security/blob/master/URL%20Classification%20using%20Word2Vec%20and%20FastText-Copy1.ipynb

```python
import pandas as pd
import keras
import matplotlib.pyplot as plt
import numpy as np
from keras.models import load_model
from urllib.parse import urlparse,urlsplit
import gensim
from gensim.models import Word2Vec, FastText
from multiprocessing.pool import ThreadPool
import tensorflow as tf
tf.get_logger().setLevel('ERROR')

def splitter(url_list):
    new_df=pd.DataFrame(columns=["scheme","netloc","path","query","fragment"])
    for url in url_list:
    #     test = [urlsplit(url).scheme, urlsplit(url).netloc, urlsplit(url).path, urlsplit(url).query, urlsplit(url).fragment]
        split_result=urlsplit(url)
        scheme = split_result.scheme
        netloc = split_result.netloc
        path = split_result.path
        query = split_result.query
        new_df =  new_df.append({'scheme': scheme, 'netloc': netloc, 'path': path, 'query': query}, ignore_index= True)
        new_df.fillna(0,inplace=True)
    return (new_df)

def vectorizer_netloc(new_df):
    
    model1 = Word2Vec.load("w2v_url")
    
    
    splitr1= new_df["netloc"]

    splitr1_1= [str(val).split(".") for val in splitr1.tolist()]
    
    model1.build_vocab(splitr1_1, update=True)
    model1.train(splitr1_1, total_examples=len(splitr1_1), epochs=1)

    
    holder1=[]
    vec_df1= pd.DataFrame()
    val=[0 for i in range(100)]
    for i in range(len(splitr1_1)):
        for j in range(len(splitr1_1[i])):
            val += model1[splitr1_1[i][j]]
        holder1.append(val.tolist())
        val *=0
    vec_df1=vec_df1.append(holder1)   
    
    
    return(vec_df1)


def vectorizer_path(new_df):
    
    model2 = Word2Vec.load("w2v_path")
    
    
    splitr2= new_df["path"]
    


    splitr2_1= [str(val).split("/") for val in splitr2.tolist()]
  

    model2.build_vocab(splitr2_1, update=True)
    model2.train(splitr2_1, total_examples=len(splitr2_1), epochs=1)
    

    holder2=[]
    vec_df2= pd.DataFrame()
    val=[0 for i in range(100)]
    for i in range(len(splitr2_1)):
        for j in range(len(splitr2_1[i])):
            val += model2[splitr2_1[i][j]]
        holder2.append(val.tolist())
        val *=0
    vec_df2=vec_df2.append(holder2) 
    
    
    return(vec_df2)


def vectorizer_query(new_df):
    
    model3 = Word2Vec.load("w2v_query")
    
    splitr3= new_df["query"]

    splitr3_1= [str(val).split("=") for val in splitr3.tolist()]


    model3.build_vocab(splitr3_1, update=True)
    model3.train(splitr3_1, total_examples=len(splitr3_1), epochs=1)

    holder3=[]
    vec_df3= pd.DataFrame()
    val=[0 for i in range(100)]
    for i in range(len(splitr3_1)):
        for j in range(len(splitr3_1[i])):
            val += model3[splitr3_1[i][j]]
        holder3.append(val.tolist())
        val *=0
    vec_df3=vec_df3.append(holder3) 
    
    
    return(vec_df3)

def convert_to_df(new_df):
    pool = ThreadPool(processes=2)
    new_df=new_df
    async_result1 = pool.apply_async(vectorizer_netloc, args=(new_df,))
    async_result2 = pool.apply_async(vectorizer_path, args=(new_df,))
    async_result3 = pool.apply_async(vectorizer_query, args=(new_df,))# tuple of args for foo

    vec_df1 = async_result1.get()
    vec_df2 = async_result2.get()
    vec_df3 = async_result3.get()
    
    tester_df_batch=pd.DataFrame()
    tester_df_batch=pd.concat([vec_df1,vec_df2,vec_df3], axis=1)
    return(tester_df_batch)

  def return_avg_for_updated_url_score (eps,model):
    switch = []
    for key in eps.keys():
        for val in range(len(eps[key])):
            switch+=[(eps[key][val],key,calc_endpoint_score(model.predict(convert_to_df(splitter(eps[key]))).tolist()))]

    y =pd.DataFrame(switch, columns=['url','ip','eps_score'])

    grouped_sum = y.groupby('url').sum()
    grouped_size = y.groupby('url').size()
    # grouped_size['a']


    unique_urls = list(y['url'].unique())
    avg_scores_of_endpoints_hitting_the_same_url =[]
    for url in unique_urls :
        avg_scores_of_endpoints_hitting_the_same_url += [{url:grouped_sum['eps_score'][url]/grouped_size[url]}]

    return(avg_scores_of_endpoints_hitting_the_same_url,unique_urls)
  


def calc_endpoint_score(score):
    day_score = float()
    bad_counter = int()
    for sc in score:

        if sc[0] > 0.5:
            day_score += sc[0]
            bad_counter += 1
        else:
            day_score += sc[0]

    bad_counter
    ep_w = (day_score/len(score))*(1.0-(1-(bad_counter/len(score))))
    return(ep_w)
  
def vector_relatedness(url):
    w_ = urlsplit(url)
    w_netloc = w_.netloc.split('.')
    w_path = w_.path.split('.')
    
    if(w_netloc[0]==''):

        related_word=w_path
        if(related_word[0] == 'www'):
            related_word_finder = related_word[1]

        else:
            related_word_finder = related_word[0]

    elif(w_netloc[0]=='www'):
        related_word_finder = w_netloc[1]

    else:
        related_word_finder = w_netloc[0]
        
        
    FastText_model = FastText.load('ft_.model')
    relatedness_vector = FastText_model.wv.most_similar_cosmul(related_word_finder)
    rv =np.mean([i[1] for i in relatedness_vector])
    return(rv)

  
def url_score_recalculator(val_avg, unique_urls, url_scores):
    val_avg = val_avg
    unique_urls = unique_urls
    url_scores = [url_scores[i][0] for i in range(len(url_scores))]
    avg_list = [float(str(*list(val_avg[i].values()))) for i in range(len(val_avg))]
    
    rv =[vector_relatedness(url) for url in unique_urls]
    m_rv_url_score = np.add(np.multiply(url_scores,0.85),np.multiply(rv,0.1))
    
    m_avg_list = np.multiply(avg_list,0.05)
    
    updated_scores = np.subtract(m_rv_url_score,m_avg_list)
    updated_url_score_dict = [{unique_urls[i]:updated_scores[i]} for i in range(len(unique_urls))]
    return(updated_url_score_dict)

  
eps = {'192.168.6.6.1':["https://www.yagle.com/abcd/?=123","https://www.google.com","www.bitsadmin.com/","https://www.yagle.com/abcd/?=123","https://www.google.com","www.bitsadmin.com/","http://zastapiony.piklamp.nl/military.xbel?face=jlthEvD&oil=70UfcEdppE&similar=0T9GXVd&plane=&never=XzUI&size=h-S&building=3NHL3LH4j&play=Ke9C4&over=&pattern=gKK","https://www.google.com"],
      '0.0.0.1':["https://www.yagle.com/abcd/?=123","https://www.google.com","www.bitsadmin.com/"]}

### on assuming an input of the above format to the code

model = load_model('current.best__std.hdf5')
val_avg, unique_urls = return_avg_for_updated_url_score(eps,model)

final_vec = convert_to_df(splitter(eps['192.168.6.6.1']))##
url_scores = model.predict(convert_to_df(splitter(unique_urls))).tolist()
updated_url_score_dict = url_score_recalculator(val_avg, unique_urls, url_scores)

score =  model.predict(final_vec).tolist()
ep_sc = calc_endpoint_score(score)

print("Endpoint Vectors for URLs of '192.168.6.6.1' (3 x 300) : ",final_vec)
print("\nScores for all unique URLs not bound by the endpoint: \n",url_scores)
print("\nUpdated URL scores to dict: \n",updated_url_score_dict)
print("\nScores for URLs of '192.168.6.6.1' endpoint: \n",score)
print("\nEndpoint ('192.168.6.6.1') score : ",ep_sc)

```



代码如上，需要载入模型才能实验，并且模型比较大，就不测试了。代码看懂了，觉得比较有意义的部分是转换成矩阵的两个for循环。自己可能会借鉴到。



----



下面看一个word2vec + CNN的实现，GitHub地址如右边，https://github.com/cwellszhang/DetectMaliciousURL，准确度据说达到了96%。

参考文章：https://blog.csdn.net/u011987514/article/details/71189491

我感觉如果把这个代码看懂了，其他不管多复杂的也就会了。这个应该是自己到目前为止见过最复杂的代码了～

由于需要使用tf的版本是1.0，所以在服务器中运行～

此时import pandas出现错误，参考 https://docs.microsoft.com/en-us/answers/questions/55489/modulenotfounderror-no-module-named-39pandas39-whe.html，使用语句：python2 -m pip install pandas

还需要安装gensim，`python2 -m pip install -U gensim`即可。

还有tf，`python2 -m pip install tensorflow==1.2.1`

至此环境安装完成～



设置参数，用到了tf.flags.DEFINE_XXX，可以帮助我们添加命令行的可选参数。具体参考https://blog.csdn.net/spring_willow/article/details/80111993



对于FLAGS.replicas == False的情况，

```python
if FLAGS.replicas==False:
 timestamp = str(int(time.time())) #时间戳
 out_dir = os.path.abspath(os.path.join(os.path.curdir, "runs", timestamp))#用时间戳命名一个文件
 print("Writing to {}\n".format(out_dir))
 if not os.path.exists(out_dir):
    os.makedirs(out_dir)
 # Checkpoint directory. Tensorflow assumes this directory already exists so we need to create it
 checkpoint_dir = os.path.abspath(os.path.join(out_dir, "checkpoints"))
 checkpoint_prefix = os.path.join(checkpoint_dir, "model")
 if not os.path.exists(checkpoint_dir):
        os.makedirs(checkpoint_dir)
```

其实就是创建目录。



对于FLAGS.replicas == True的情况：

```python
 # out_dir = os.path.abspath(os.path.join(os.path.curdir, "runs", "replicas"))
 out_dir = os.path.abspath(os.path.join(os.path.curdir,"runs","outputs"))
 print("Writing to {}\n".format(out_dir))
 if not os.path.exists(out_dir):
    os.makedirs(out_dir)
#创建out_dir文件。
    
    
 checkpoint_dir = os.path.abspath(os.path.join(out_dir, "checkpoints"))
 checkpoint_prefix = os.path.join(checkpoint_dir, "model")
 if not os.path.exists(checkpoint_dir):
        os.makedirs(checkpoint_dir)
 summary_dir= os.path.abspath(os.path.join(out_dir, "summary"))
 if not os.path.exists(summary_dir):
        os.makedirs(summary_dir)
 train_summary_dir = os.path.join(summary_dir,"train")
 dev_summary_dir= os.path.join(summary_dir,"dev")
 if not os.path.exists(train_summary_dir):
        os.makedirs(train_summary_dir)
 if not os.path.exists(dev_summary_dir):
        os.makedirs(dev_summary_dir)
```

也是创建目录


接下来定义了数据预处理

```python
def data_preprocess():
    # Data preprocess
    # =======================================================
    # Load data
    print("Loading data...")
    if not os.path.exists(os.path.join(out_dir,"data_x.npy")):
          x, y = data_helper.load_data_and_labels(FLAGS.data_file)
          # Get embedding vector
          x =x[:1000]
          y =y[:1000]
          sentences, max_document_length = data_helper.padding_sentences(x, '<PADDING>',padding_sentence_length=FLAGS.sequence_length)
          print(len(sentences[0]))
          if not os.path.exists(os.path.join(out_dir,"trained_word2vec.model")):
              x= np.array(word2vec_helpers.embedding_sentences(sentences, embedding_size = FLAGS.embedding_dim, file_to_save = os.path.join(out_dir, 'trained_word2vec.model')))
          else:
              print('w2v model found...')
              x = np.array(word2vec_helpers.embedding_sentences(sentences, embedding_size = FLAGS.embedding_dim, file_to_save = os.path.join(out_dir, 'trained_word2vec.model'),file_to_load=os.path.join(out_dir, 'trained_word2vec.model')))
          y = np.array(y)
          # np.save(os.path.join(out_dir,"data_x.npy"),x)
          # np.save(os.path.join(out_dir,"data_y.npy"),y)
          del sentences
    else:
          print('data found...')
          x= np.load(os.path.join(out_dir,"data_x.npy"))
          y= np.load(os.path.join(out_dir,"data_y.npy"))
    print("x.shape = {}".format(x.shape))
    print("y.shape = {}".format(y.shape))

    # Save params
    if not os.path.exists(os.path.join(out_dir,"training_params.pickle")):
        training_params_file = os.path.join(out_dir, 'training_params.pickle')
        params = {'num_labels' : FLAGS.num_labels, 'max_document_length' : max_document_length}
        data_helper.saveDict(params, training_params_file)

    # Shuffle data randomly
    # np.random.seed(10)
    # shuffle_indices = np.random.permutation(np.arange(len(y)))
    # x_shuffled = x[shuffle_indices]
    # y_shuffled = y[shuffle_indices]
    # del x,y

    # x_train, x_test, y_train, y_test = train_test_split(x_shuffled, y_shuffled, test_size=0.2, random_state=42)  # split into training and testing set 80/20 ratio
    x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=42)  # split into training and testing set 80/20 ratio
    del x,y
    return x_train, x_test, y_train, y_test
```

读取数据：

```python
    allurlscsv = pd.read_csv(path, ',', error_bad_lines=False)  # reading file
    allurlsdata = pd.DataFrame(allurlscsv)  # converting to a dataframe
    allurlsdata = np.array(allurlsdata)  # converting it into an array
    random.shuffle(allurlsdata)
```

![6fig1](/Malicious_URL_9/6fig1.png)

把标签替换成数字：

```python
    for i in range(0,len(y)):
        if y[i] =='bad':
            y[i]=0
        else:
            y[i]=1
```

但是函数to_categorical好像有点问题，标签读取的都是1。但是完整测试的时候好像又正常了～



下面padding_sentences函数，用于填充或者切除一定的长度。

下面看模型是否存在。如果不存在：调用embedding_sentences，嵌入句子。

```python
if not os.path.exists(os.path.join(out_dir,"trained_word2vec.model")):
  x= np.array(word2vec_helpers.embedding_sentences(sentences, embedding_size = FLAGS.embedding_dim, file_to_save = os.path.join(out_dir, 'trained_word2vec.model')))
```

如果存在，也是调用embedding_sentences，略微有些不同。



如果有data_x.npy,直接载入数据。



下面保存参数，可以置乱一下，但是文中后来删去了～然后划分为训练集和测试集。



然后判断，如果replicas == True，执行下面的操作。

主要就是预处理和CNN。CNN具体的结构比较复杂，现在就不看啦～～

---

看评价的代码

前面的主要就是加载参数，然后还是读取数据，词嵌入。后面的准确度是自己手动输入的～

代码看完了，比自己想象的要简单一些。

下面自己写一个word2vec + 传统机器学习的算法～

---



啊啊啊啊啊！原本word2vec嵌入之后维度还是有一点点的问题，使用语句`X = X.reshape(X.shape[0],-1)`，将三维的转为二维。



此时参数设置：max_sequence_length = 10，embedding_dim = 12

使用很少的几百条数据进行测试～模型使用LR，结果如下

![6fig2](/Malicious_URL_9/6fig2.png)

多用一些数据！

LR，结果如下：

![6fig3](/Malicious_URL_9/6fig3.png)



如果使用决策树，结果如下：

![6fig4](/Malicious_URL_9/6fig4.png)

啊啊啊 啊啊啊 啊结果这么好！决策树我爱你！



再使用随机森林，嗷嗷啊怎么会这么好？我开始怀疑自己了

![6fig5](/Malicious_URL_9/6fig5.png)



变换一下参数：max_sequence_length = 15，embedding_dim = 12

LR：直接killed了，可能是参数设置有点大了。



决策树：略略有些下降～

![6fig6](/Malicious_URL_9/6fig6.png)

随机森林，准确度略有提升～

![6fig7](/Malicious_URL_9/6fig7.png)



再变换一下参数：max_sequence_length = 12，embedding_dim = 12

LR：稍微有一点点提升～

![6fig8](/Malicious_URL_9/6fig8.png)



决策树：有一点点点小提升

![6fig9](/Malicious_URL_9/6fig9.png)



随机森林：

![6fig10](/Malicious_URL_9/6fig10.png)

矩阵变换那里尝试一下 一个url的矢量变成一维

X = X.reshape(len(X),max_sequence_length*embedding_dim)

其实没太大的差别啦～随机森林如下：

![6fig11](/Malicious_URL_9/6fig11.png)



使用Doc2vev

得到错误：'list' object has no attribute 'words'，这是因为word后面需要加上标签，标号。

参考 https://github.com/Microstrong0305/WeChat-zhihu-csdnblog-code/blob/master/NLP/Doc2vec/Doc2vec.py

不太清楚标签那边是怎么弄的。

先用 tagged_data = [TaggedDocument(words=_d, tags=[str(y[i])]) for i, _d in enumerate(sentences)]，标签是y的标签

使用随机森林，啊这，模型的准确度有点过高

![6fig12](/Malicious_URL_9/6fig12.png)



如果标签使用tagged_data = [TaggedDocument(words=_d, tags=[str(i)]) **for** i, _d **in** enumerate(sentences)]

数据好的有点可怕～

随机森林

![6fig13](/Malicious_URL_9/6fig13.png)



决策树

![6fig14](/Malicious_URL_9/6fig14.png)



如果使用逻辑回归，效果还是有一丝丝的差～

![6fig15](/Malicious_URL_9/6fig15.png)



下面是之前参考过的dord2vec，重点看人家的标签的部分



测试代码如下：

```python
#先安装
pip install gensim

#ipython中如下操作
import sys
import logging
import os
import gensim

# 引入doc2vec
from gensim.models import Doc2Vec
curPath = os.path.abspath(os.path.dirname('10.csv'))
rootPath = os.path.split(curPath)[0]
sys.path.append(rootPath)
#from utilties import ko_title2words
logging.basicConfig(format='%(asctime)s : %(levelname)s : %(message)s', level=logging.INFO)

# 加载数据
documents = []
# 使用count当做每个句子的“标签”，标签和每个句子是一一对应的
count = 0
with open('../data/titles/ko.video.corpus','r') as f:
    for line in f:
        title = unicode(line, 'utf-8')
        # 切词，返回的结果是列表类型
        words = ko_title2words(title)
        # 这里documents里的每个元素是二元组，具体可以查看函数文档
        documents.append(gensim.models.doc2vec.TaggedDocument(words, [str(count)]))
        count += 1
        if count % 10000 == 0:
            logging.info('{} has loaded...'.format(count))

# 模型训练
model = Doc2Vec(documents, dm=1, size=100, window=8, min_count=5, workers=4)
# 保存模型
model.save('models/ko_d2v.model')
curPath
```



先看没有预训练的，代码如下：

```python
import pandas as pd
import gensim.models as g
import logging

data = pd.read_csv("10data.csv")
y = data["label"]
url_list = data["url"]

vector_size = 300
window_size = 15
min_count = 1
sampling_threshold = 1e-5
negative_size = 5
train_epoch = 100
dm = 0 #0 = dbow; 1 = dmpv
worker_count = 1 #number of parallel processes
logging.basicConfig(format='%(asctime)s : %(levelname)s : %(message)s', level=logging.INFO)

docs = g.doc2vec.TaggedLineDocument(url_list)
trans_vector = g.Doc2Vec(docs, size=vector_size, window=window_size, min_count=min_count, sample=sampling_threshold, workers=worker_count, hs=0, dm=dm, negative=negative_size, dbow_words=1, dm_concat=1, iter=train_epoch)
```

出现如下报错

![6fig16](/Malicious_URL_9/6fig16.png)

因为TaggedLineDocument的参数需要时文件的地址。 

此处需要将url进行utf-8编码，然后合在一起。

```python
with open('../data/titles/ko.video.corpus','r') as f:
    for line in f:
        title = unicode(line, 'utf-8')
        # 切词，返回的结果是列表类型
        words = ko_title2words(title)
        # 这里documents里的每个元素是二元组，具体可以查看函数文档
        documents.append(gensim.models.doc2vec.TaggedDocument(words, [str(count)]))
        count += 1
        if count % 10000 == 0:
            logging.info('{} has loaded...'.format(count))

# 模型训练
model = Doc2Vec(documents, dm=1, size=100, window=8, min_count=5, workers=4)
```



到现在也还是没有实现...



先实现一个简单的～关于新闻的

停词表参考 https://github.com/goto456/stopwords 使用四川大学的。

代码实现如下

```python
from gensim import models,corpora,similarities
import jieba.posseg as pseg
from gensim.models.doc2vec import TaggedDocument,Doc2Vec
import os

def a_sub_b(a,b):
    ret = []
    for el in a:
        if el not in b:
            ret.append(el)
    return ret
stop = [line.strip().encode().decode('utf-8') for line in open('stopwords.txt').readlines() ]
```



stop是一个list，内容如下：

![6fig17](/Malicious_URL_9/6fig17.png)

然后还是有很多错误啊啊啊啊啊，主要是格式问题，不改了气死了！



自己也做钓鱼检测！！

再测试一下新的数据集，UNC大学2016年的URL，看看自己的效果是不是真的那么好

是的！

我他妈的都有点害怕，到底是不是过拟合了啊哈哈哈哈，要是都话那我真他妈完蛋了。



最后决定使用https://www.kaggle.com/siddharthkumar25/malicious-and-benign-urls/tasks的数据集进行测试





收获：

1、文中可以加入如下语句：

一般钓鱼的链接会在域名和主机名之间作文章，进行一些域名混淆的恶意行为

而恶意用户请求会从请求参数作文章，比如进行恶意SQL注入



2、突发奇想：能不能构建两个库，一个良性一个恶意，最后看查询的URL和哪个的相似度更高？

结论：这个和有监督学习其实就是一个思想。



3、各种方法比较

![6fig18](/Malicious_URL_9/6fig18.png)

![6fig19](/Malicious_URL_9/6fig19.png)



代码实现过程参考 https://github.com/Microstrong0305/WeChat-zhihu-csdnblog-code/blob/master/NLP/Doc2vec/Doc2vec.py

