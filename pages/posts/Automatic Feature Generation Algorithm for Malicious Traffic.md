---
layout: post
title: 恶意流量的自动特征生成算法
tags:
  - 特征自动生成
categories:
  - paper阅读笔记
author: 1ss4k
date: 2021-02-21 14:56:00
---



本文作者来自于：绿盟科技、清华大学、哈尔滨工业大学。本文发表于2020 IEEE 19th International Conference on Trust, Security and Privacy in Computing and Communications (TrustCom)，属于CCF- C类会议。

### 一、背景及目的



​	ML在检测攻击行为时，可能有如下问题：虚假报警率过高；黑盒我们无法了解其内部机理。所以需要人工地去验证结果，花费较大。

​	解决方法如下：

(1) 设计了自动特征生成算法。利用数据挖掘的方法 提取出关键词和关键特征。

 (2) 可解释AI。 

​	本文提出了CMIRGen，来自动产生特征。用到了XAI的方法和聚类的方法。不像传统的聚类算法和最长公共子序列那样，本文方法从黑盒模型中学习到知识(即特征)，然后自动提取它。

### 二、前人工作



**1、最长公共子序列**

​	前人通常使用最长公共子序列(LCS)的方法。

​	它的缺点是：只有payload内容相同时，才可以使用 / 大规模数据时难以使用 / 没有考虑到普通的和恶意之间的差别。

**2、LARGen**

​	基于LDA，可以提取关键字符串，并且是无监督的。

​	缺点：算法的有效性依赖于手工标签的准确性，并且在不同的场景中难以保证性能的有效性。

**3、FIRMA**

​	基于协议parsing、聚类和tag提取。优点：分类的准确性高。

​	缺点：此方法的有效性依赖于协议parsing。

### 三、前置知识



1、黑盒模型的推断

(1)XAI：

改进点：一方面可以优化模型本身，另一方面可以将黑盒模型作为输入，通过输入扰动，推断模型内部的操作准则。



(2)基于推断：

起源于原始的ML，可以选择的应用范围更广。本文关注的是基于推断的方法，尤其是基于特征归属的方法。下面介绍了LIME：局部可解释模型不可知论的解释。

LIME过程：使用人类可理解的尺度来扰乱输入数据，产生一个新的变换数据集。并且使用变换数据集进行预测。然后再基于线性回归或决策树，来产生一个可解释的模型，它被视为黑盒模型的代理模型。



2、将模型推断应用于特征生成

payload和文本具有一定的相似性，所以可以应用相同的方法来处理，所以数据挖掘上的很多方法可以用于网络流量分析。

但是使用范围也有一定的限制。因为网络流量更加精密、以及动态变化。在网络流量中增加某个单词 通常不会产生显著的变化。并且同时存在 结构 和 语义内容。

网络内部结构中 可能包括：嵌入的内容、模糊的内容，甚至是加密的内容，增加了困难性。

完整的过程如下：


![upload successful](/images/pasted-237.png)

用文档来表示网络流，然后对其进行有监督的数据挖掘，就可以得到一个准确度很高的模型，然后就可以得到有分别力的词。

这个过程不需要花费什么，并且仅仅依赖于最开始有标签的数据。

### 四、CMIRGen框架及实现算法



本文提取到的rules是：恶意流量payload中可读的子字符串。

框架总体过程如下：

![upload successful](/images/pasted-238.png)



#### 1、预处理



目的是：从数据流中提取可读字符串。分析对象不同，提取的信息也会不同。

从csv中读取数据，标签有2类，数据共有6.1w条。

![upload successful](/images/pasted-239.png)

读取数据代码如下

```python
import warnings
warnings.simplefilter(action='ignore', category=FutureWarning)
%load_ext autoreload
%autoreload 2
import pandas as pd
DATASET = 'data/CSIC/csic-for-extractor.csv'
df = pd.read_csv(DATASET, sep=',', dtype={'text':str, 'type':str}, low_memory=False)
df.loc[df.type != '99999', 'type'] = 'malicious'
df.loc[df.type == '99999', 'type'] = 'normal'
df.rename(columns={"type": "target"},inplace=True)
```

结果如下：

![upload successful](/images/pasted-240.png)

其中恶意和良性的条数如下

```python
In [13]: df[df.target == 'malicious'].shape
Out[13]: (25065, 2)

In [14]: df[df.target == 'normal'].shape
Out[14]: (36000, 2)
```



预处理函数如下

```python
def text_preprocess(df, x_col='text', y_col='target'):
    """Preprocessing for texts.

    Some preprocssing procedure for text in a dataframe, such as unreadable character
    revomval, label encoding and so on.

    Args:
        df: datafame to be preprocessed.
        x_col: the text column for processing.
        y_col: the label column for processing.

    Returns:
        df: preprocessed dataframe
        label_map: the target label and encoding result mapping
    """

    # remove unreadable character
    df[x_col] = df[x_col].str.replace(r'[^\x00-\x7F]+', ' ')
    df = df.dropna()

    # reset index
    df.index = np.arange(1, len(df) + 1)

    # label encoding
    le = preprocessing.LabelEncoder()
    le.fit(df[y_col])
    df[y_col] = le.transform(df[y_col]) # example for binary classification {'malicious': 0, 'normal': 1}

    # get label and value mapping
    label_map = dict(zip(le.classes_, range(len(le.classes_))))
    
    return df, label_map
```

有如下几个作用

(1) 替换不可读的字符为空格，删除缺失数据

```python
df[x_col] = df[x_col].str.replace(r'[^\x00-\x7F]+', ' ')
#\x00-\x7f是ascii字符，^是取反，表示不在这个区间之内，即不可见字符。
#r表示 不再转义了，表示成原始字符。

df = df.dropna()
#删除缺失数据
```

(2) 插入索引

df由索引[0-61064] 变为 [1-61065]。

(3) 标签转化

恶意转为0，良性转为1。map结果如下

```python
In [6]: label_map
Out[6]: {'malicious': 0, 'normal': 1}
```



ipython中如下

```python
import sys
sys.path.append("..")
import lime
from tpe_model import text_preprocess
from tpe_model import text_model_generator #属于模型训练部分
df, label_map = text_preprocess(df)
print(label_map)
```

接下来训练模型

```python
tmg = text_model_generator(df)
model = tmg.model_trainer()
```

模型具体的定义如下

选用的模型是离散型朴素贝叶斯，预测的结果准确度为:

```txt
0.9371835739733735
```



由于加入了LIME，可以进行解释。

```python
def get_instance_explained(df, instance_i, model, label_map, refer_label, xcol_name='text'):
    """Explain instance in a dataframe

    Test functions. Show keyword based explainations from lime.

    Args:
        df: dataframe to be explained.
        instance_i: index location of the specific instance.
        model: model that can classify instances.
        label_map: label text and value mappings.
        refer_label: the reference label for lime.
        xcol_name: column name for content to be explained in df.

    Returns:
        None. Just printable information.
    """

    # Locate instance content 得到内容
    string = df[xcol_name].iloc[instance_i] #instance_i = 30633，即得到df中 30633行处 xcol_name处的值
    row = df[xcol_name].iloc[[instance_i]]
    print('Model predict result %s' % model.predict(row)) #输出数据及预测结果
    print(label_map)
    
    # Get explainations from LIME 得到解释
    labels = list(label_map.values())
    explainer = LimeTextExplainer(class_names=labels)
    exp = explainer.explain_instance(string, model.predict_proba, num_features=10, num_samples=200, labels=labels)
    print(exp.as_list(label=label_map[refer_label]))
```

其实没有进行操作，只是打印了一些信息。

测试例子及结果如下

```python
gethttp://localhost:8080/tienda1/miembros/imagenes/zarauz.jpg

In [75]: print(exp.as_list(label=label_map[refer_label]))
[('jpg', -0.021038973678323948), ('zarauz', -0.020156677036900415), ('imagenes', -0.017663788601498), ('miembros', -0.013590393963914255), ('gethttp', -0.004047875467937037), ('8080', -0.0025638794651593575), ('tienda1', -0.0018759405740022262), ('localhost', 0.00044111549956922427)]
```

ipython单步调用如下

```python
from tpe_core import get_instance_explained
from lime.lime_text import LimeTextExplainer

#注释掉的是直接打开之前训练好的模型的步骤
# Warning The pickle module is not secure. Only unpickle data you trust.Reference: https://docs.python.org/3/library/pickle.html
# import pickle
# with open("model.test", 'rb') as f:
#     model = pickle.load(f, encoding='bytes')

labels = list(label_map.values())
get_instance_explained(df, 30633, model, label_map, 'malicious')
```



#### 2、聚类



字符串相似度使用的是 Levenshtein distance，即字符编码距离。它使用动态规划的算法可以较快实现～

聚类算法使用的是DBSCAN，sklearn中可以直接调用。



#### 3、特征提取



对于扫描流量：可能有很大的数据是自动扫描产生的，我们进行聚类之后，这些数据被分在一个类中，有助于我们的处理，并且减少了特征的冗余。本文使用了递归的LCS算法，



对于非扫描流量：使用基于模型推断的方法。LIME可以给出每个词的置信度得分。它可以使相关人员更好的去理解为什么会得到这个结果。



代码大致实现过程如下

rule_matching_evaluation函数

单条语句分析

```python
#shuffle dataset 数据集置乱
df.sample(frac=1, random_state=1)
```

![upload successful](/images/pasted-241.png)


```python
df_for_seed = df[df['target'] == label_map['malicious']].sample(seed_num, random_state=2)
```

找到恶意的数据，取seed_num条，此处seed_num = 2000(后文提到，最大值可以是2500)

![upload successful](/images/pasted-242.png)

下面调用get_rules函数 去得到seed rules。



@先看 get_lime_rules 函数

```python
In [40]: df_lime
Out[40]:
                                                    text  target
7946   posthttp://localhost:8080/tienda1/publico/vaci...       0
24475  gethttp://localhost:8080/tienda1/publico/auten...       0
6574   gethttp://localhost:8080/tienda1/publico/vacia...       0
...
5279   posthttp://localhost:8080/tienda1/miembros/edi...       0
17915  gethttp://localhost:8080/tienda1/publico/regis...       0
```



核心代码如下，以第一条数据为例

```python
for index, row in df_lime.iterrows():
    print("index,row:",index,row)
    #index是索引，7946，row是含两列内容的数据
    exp = explainer.explain_instance(row[xcol_name]
                                    , model.predict_proba
                                    , num_features=10
                                    , num_samples=200
                                    , labels=labels)
    print("exp :",exp)
    #exp输出 <lime.explanation.Explanation object at 0x7fdd59938f60>
        # words that of length over 2 is confidential and the first n(n=6) words of higgest confidence are adopted
    exp_list = exp.as_list(label=label_map[refer_label])
    print("exp_list",exp_list)
    #exp_list [('b2a', 0.698051199119179), ('vaciar', 0.02219552222686937), ('8080', -0.0181900902571223), ('tienda1', -0.013191906047022592), ('posthttp', 0.013103121836744645), ('jsp', -0.006485941223079477), ('localhost', -0.005650881064500139), ('publico', -0.005266674440153708), ('carrito', -0.0004746814426690281)]
    
    sorted_list = sorted(exp_list, key=lambda d:d[1], reverse=True)
    print("sorted_list",sorted_list)
    #sorted_list [('b2a', 0.698051199119179), ('vaciar', 0.02219552222686937), ('posthttp', 0.013103121836744645), ('carrito', -0.0004746814426690281), ('publico', -0.005266674440153708), ('localhost', -0.005650881064500139), ('jsp', -0.006485941223079477), ('tienda1', -0.013191906047022592), ('8080', -0.0181900902571223)]
    
    tmp_list = [t[0] for t in sorted_list if (t[1] > MIN_WORD_CONFIDENCE and len(t[0]) >= MIN_WORD_LEN)][:MAX_WORDS_NUM]
    print("tmp_list",tmp_list)
    # tmp_list ['b2a', 'vaciar'] 。t是一个二元组，比如('b2a', 0.698051199119179)。
    
    # order strings for filtering and comparing
    if len(tmp_list) > 1:
        print("AAA")
        tmp_list.sort()
        print("tmp_list sort:",tmp_list)
        # tmp_list sort: ['b2a', 'vaciar']
        lime_rules.append(tmp_list)
        print("lime_rules",lime_rules)
        # lime_rules [['b2a', 'vaciar']]
```

tmp_list的选择条件为：t[1] > 最小置信度，t[0]的长度 > 最小长度，并且最多选取[MAX_WORDS_NUM]个。

最后的lime_rules结果如下

```python
[['b2a', 'vaciar'],
 ['buzzy', 'delay', 'impr37e4197d9', 'waitfor'],
 ['b2a', 'vaciar'],
 ['adir', 'anadir'],
 ['entrar', 'errormsga'],
 ['aexp4', 'htr', 'iisadmpwd'],
 ['ceguezuelo', 'pwda', 'yenmeng'],
 ['anadir', 'cantidad'],
 ['administrator', 'cfide', 'cfm', 'navserver']]
```

排好序之后

```python
[['adir', 'anadir'],
 ['administrator', 'cfide', 'cfm', 'navserver'],
 ['aexp4', 'htr', 'iisadmpwd'],
 ['anadir', 'cantidad'],
 ['b2a', 'vaciar'],
 ['b2a', 'vaciar'],
 ['buzzy', 'delay', 'impr37e4197d9', 'waitfor'],
 ['ceguezuelo', 'pwda', 'yenmeng'],
 ['entrar', 'errormsga']]

import itertools
lime_rules = list(k for k,_ in itertools.groupby(k))
#去除相同的元素

[['adir', 'anadir'],
 ['administrator', 'cfide', 'cfm', 'navserver'],
 ['aexp4', 'htr', 'iisadmpwd'],
 ['anadir', 'cantidad'],
 ['b2a', 'vaciar'],
 ['buzzy', 'delay', 'impr37e4197d9', 'waitfor'],
 ['ceguezuelo', 'pwda', 'yenmeng'],
 ['entrar', 'errormsga']]
```



@下面再看 get_lime_rules_parallel。

它的调用方法如下

```python
lime_rules = get_lime_rules_parallel(df, get_lime_rules, model, label_map, 'malicious')
```

将get_lime_rules 作为函数传入。

```python
df_split = np.array_split(df, n_cores)
#首先将数据分成n_cores组。原来设定的n_cores = 20，此处选用n_cores = 2
pool = Pool(n_cores)
```



然后去执行get_lime_rules函数。

```python
parallel_result = pool.map(partial(func, model=model, label_map=label_map, refer_label=refer_label), df_split)
```

pool.map可以看作是多核多线程执行，传入的参数是df_split，即分割后的结果。得到的结果保存在parallel_result中。

然后再去重、排序，返回的就是这些word。还需要释放池化的资源～



@上面是基于推断得到的rules，如果是基于扫描得到的，需要调用get_scan_rules函数。

首先定义一些参数

```python
max_payload_len = 50
payloads = df
```

根据content_direction是forward 还是 backward，进行分类操作。

```python
 if content_direction == 'forward':
        payloads[xcol_name] = payloads[xcol_name].apply(lambda x: x[:max_payload_len])
 elif content_direction == 'backward':
        max_payload_len = -1 * max_payload_len
        payloads[xcol_name] = payloads[xcol_name].apply(lambda x: x[max_payload_len:])

```

如原始若是`posthttp://localhost:8080/tienda1/publico/vaci..` ，backward 换成`8080/tienda1/publico/vaciar.jsp?b2a=vaciar+car...` (没有截取到前面的`posthttp://localhost:`)

主要目的是：正向的话就截断，payload最大长度为50。反向的话 就反向截断，不保留前面的～然后结果保存在sequence中。



下面调用函数求解距离矩阵

```python
from time import time
from tpe_distance_matrix import distance_matrix
```

其实计算的是pair-wise similarity相似度。核心代码如下

```python
for i in range(N):
        for j in range(N):

            if s_matrix[i][j] >= 0:
                continue

            seq1 = seq[i][1]
            seq2 = seq[j][1]
            minlen = min(len(seq1), len(seq2))
    
            len1 = len2 = sims = 0
            for x in range(minlen):
                if seq1[x] != 256:
                    len1 += 1.0

                    if seq1[x] == seq2[x]:
                        sims += 1.0

                if seq2[x] != 256:
                    len2 += 1.0

            maxlen = max(len1, len2)
            s_matrix[i][j] = sims / maxlen

```

大致的思路就是，遍历2个字符串，遇到相同的字符，sims的值就+1。如果两个字符串越相似，最后s_matrix的值就会越大。

```python
    # Get distance matrix
    for i in range(N):
        for j in range(N):
            d_matrix[i][j] = s_matrix[i][i] - s_matrix[i][j]
```

这个步骤可以看成是标准化。因为要求的是距离矩阵，所以求一个差值。值越小，越相近。



下面进行聚类

直接调用sklearn中的DBSCAN进行聚类，得到的标签保存在 skl_labels 中。

```python
    db = DBSCAN(eps=0.25, min_samples=10, metric='precomputed').fit(X)
    print( 'Finish clustering...')
    skl_labels = db.labels_
```

然后对标签进行规范化，值不是-1的，都+1。



@tpe_all_lcs

目的是求两个字符串的最长公共子串。

其中有一个最小长度限制，小于这个长度的是不被记录的。

而且前面找到公共子串后会继续往下寻找，知道找遍整个字符串，输出长度大于最小长度的所有公共字符串。

```python
    # search recursively and document the longest of the back part
    l2_forward = []
    if (x_longest < s1_len - 1) and (y_longest < s2_len - 1):
        l2_forward = lcs(s1_[x_longest:s1_len], s2_[y_longest:s2_len])

    if len(l2_forward) > 0:
        l_list.extend(l2_forward)

    return l_list
```

测试如下

```python
s1_ = 'aayydbbccc123456deqzwy'
s2_ = 'yydedede12345dezwy'
res = lcs(s1_, s2_)
```

输出

```python
res is : ['yyd', '12345', 'zwy']
```

注意到输出的是一个列表。



然后再从每个聚类中提取rules。此处引入了lcs，来计算最小公共子串。

```python
   # extract rules from each cluster
    scan_rules = []
    for label in se_df.label.unique():
        print("label:",label)
        if label != -1:
            re = se_df.loc[ss_df['label'] == label][['seq']]
            
            print("re:",re)
            target_array = re['seq'].tolist()
            print("target_array",target_array)
            
            # find seed sequence
            max_len = 0
            for l in target_array:
                if len(l) > max_len:
                    seed = l

            pattern_list = [seed]
            print("pattern_list1:",pattern_list)
            #先存入pattern_list中
            
            for l in target_array:
              	print("l is:",l)
                pattern_new = []
                for pattern in pattern_list:
                    print("pattern:",pattern)
                  	print("lcs:",lcs(pattern, l))
                    pattern_new.extend(lcs(pattern, l))
                pattern_list = pattern_new
                print("pattern_list2:",pattern_list)
            pattern_tup = (label, pattern_list)
						#本质就是 遍历各个payload，找到公共字符串，最后返回到pattern_tup中
            
            target_sequences_o = []
            for e in pattern_list:
                target_sequences_o.append("".join(e))
            if len(target_sequences_o) > 0:
                scan_rules.append(target_sequences_o)
    print(scan_rules)

```

输出提示如下：

```python
2  8080/tienda1/publico/vaciar.jsp?b2a=vaciar+car...
4  lico/entrar.jsp?errormsga=credenciales+incorre...
6  re=%2b&precio=100&cantidad=52&b1=a adir+al+car...
8  ogin=yenmeng&pwda=ceguezuelo&remember=on&b1=en...
target_array ['8080/tienda1/publico/vaciar.jsp?b2a=vaciar+carrito', 'lico/entrar.jsp?errormsga=credenciales+incorrectas', 're=%2b&precio=100&cantidad=52&b1=a adir+al+carrito', 'ogin=yenmeng&pwda=ceguezuelo&remember=on&b1=entrar']
pattern_list1: ['ogin=yenmeng&pwda=ceguezuelo&remember=on&b1=entrar']
pattern_list2: []
pattern_list2: []
pattern_list2: []
pattern_list2: []
[]
```

代码的核心思路就是去找多个url中同时存在的最小公共子串



然后返回到get_rules函数

@get_rules

得到了 lime_rules 和 scan_rules 两个list，然后调用fuse_lime_and_scan_rules 把他们联结起来。返回的是 dataframe 。

```python
s1 = pd.Series(scan_rules + lime_rules)
```

注意：连接的时候，scan_rules在前面！

然后！还调用了`rules = string_2_rule()` 这个函数，去进行格式转换

转换之后变成下面这种形式。

```python
In [123]: result
Out[123]:
  rule_strings  rule_type     regex
1            1          1  ^(?=.*1)
2            2          1  ^(?=.*2)
3            3          1  ^(?=.*3)
4            b          2  ^(?=.*b)
5            a          2  ^(?=.*a)
6            t          2  ^(?=.*t)
```



前面用到的get_rules函数如下：

```python
def get_rules(df, model, label_map, refer_label, lime_flag=True, scan_flag=False, content_direction='forward', xcol_name='text', n_cores=20):
    """Generate rules for given dataframe with LCS and inference based methods. 

    Take dataframe and classification model as inputs, extract global rules for
    texts or payloads classification.

    Args:
        df: dataframe to be explained.
        model: model that can classify instances.
        label_map: label text and value mappings.
        refer_label: the reference label for lime.
        lime_flag: on-off flag for lime based inference rules.
        scan_flag: on-off flag for LCS based scan rules.
        content_direction: cut out sequences from 'forward' or 'backward'
        xcol_name: column name for content to be explained in df.
        n_cores: number of cores to utilize.

    Returns:
        Classification rules based on list of keywords.
    """

    if lime_flag == True:
        lime_rules = get_lime_rules_parallel(df, get_lime_rules, model, label_map, 'malicious')
    else:
        lime_rules = []
    
    if scan_flag == True:
        scan_rules = get_scan_rules(df, xcol_name='text', content_direction=content_direction)
    else:
        scan_rules = []

    result = fuse_lime_and_scan_rules(lime_rules, scan_rules)
    result.columns = ['rule_strings', 'rule_type']

    # get regular expressions.
    rules = string_2_rule(result.copy())
    return rules

```



#### 4、rule压缩



各个rules之间可能会有重叠的部分。

使用loop循环去消除掉重复的rules。循环代码如下：

```python
    for i in range(0, max_iter_times):
        print('Reinforce iteration loop %d'% (i+1))
        print('Seed rules number: %d' % rules_tobe_validate.shape[0])
```



具体过程reinforce rules

```python
max_iter_times = 2
df_split = np.array_split(df, max_iter_times) #分割
```

调用rule_validation函数。

```python
 match_result, rules_tobe_validate = rule_validation(df_for_reinforce, rules_tobe_validate, n_cores=n_cores)
```



如果不是最后一次调用的话，代码如下

```python
        flag = 1
        ori_rules = rules

        # repeat the match process if there is rules of no use
        while flag == 1:
            flag = 0
            valid_df = parallelize_dataframe(df, match_func, ori_rules, n_cores=n_cores)

            # drop low acrruacy rate rules
            remove_list = refine_rules_by_metrics(valid_df)
            refined_rules = ori_rules.loc[~ori_rules.index.isin(remove_list)]
            if remove_list:
                flag = 1

                valid_df.loc[valid_df['rule_num'].isin(remove_list), ['match']] = 0
                valid_df.loc[valid_df['rule_num'].isin(remove_list), ['rule_num']] = 0
                ori_rules = refined_rules

        # validate duplicate removal of rules to improve later match efficiency 
        refined_rules = rule_deduplicate(refined_rules)
```

其中有match_func，其作用为：为df增加两列，分别为match 和 rule_num。

```python
            if search(rule['regex'], payload['text']):
                payloads_i.loc[p_index, 'match'] = rule['rule_type']
                payloads_i.loc[p_index, 'rule_num'] = r_index  
```

如果检查到rule的regex和payload的text相等，修改相应位置的match和rule_num。



调用了parallelize_dataframe函数，其实就是进行池化，多核处理。



然后去掉准确度较低的rules。使用的是refine_rules_by_metrics函数。其调用了get_metrics函数，它会计算分类的性能。具体见下节。

get_metrics返回的是一个list，list包含的是那些准确度较低的rules，我们要把它删掉。

```python
        metrics_for_rule = get_metrics(result_df[result_df.rule_num == rule_index])
        # define the lower bound for useful rules 
        if float(metrics_for_rule['acc']) < MIN_SINGLE_RULE_ACCURACY:
            rule_remove_list.append(rule_index)
```

通过语句`refined_rules = ori_rules.loc[~ori_rules.index.isin(remove_list)]`删除掉那些准确度低的rules。

再返回rule_validation函数，会调用rule_deduplicate函数，删除重复的rules。

核心代码如下：

```python
    # traverse rules in rule set.
    for rule_index, rule in rules.iterrows():
        for rule_s_index, rule_s in rules.iterrows():
            if rule_index == rule_s_index:
                    continue 
            string = ''.join(rule_s['rule_strings'])
            if search(rule['regex'], string):
                if rules.loc[rule_s_index, 'duplicate'] > 0:
                    # only reserve match result that hit for the first time 
                    continue
                if rules.loc[rule_index, 'duplicate'] == rule_s_index:
                    # skip to rules that have been matchee
                    continue
                else:
                    rules.loc[rule_s_index, 'duplicate'] = rule_index
```

思想就是：进行遍历，遇到重复的之后在duplicate列做一个标记，值为重复位置的索引。

```python
result_rules = rules.loc[rules['duplicate'] == 0]
```

如下语句选取出那些没有重复的rules。

至此，rule_validation函数结束，返回reinforce。

```python
 metrics = get_metrics(match_result)
```

计算一下准确度acc，如果<0.98，需要再次reinforce，但是操作的对象是如下数据：

```python
df_rein = match_result.loc[(match_result.match == 0) & (match_result.target == label_map['malicious'])][['text', 'target']] 
```

是选出刚才结果中match == 0并且target == 恶意的数据，即没有识别出的恶意数据流。

然后执行get rules。



然后再执行一次rule_validation，此时final_flag=True，执行的函数为

```python
        # If it is the final test, make duplicate removal first and guarantee the correspondance of hit results and rules index
        rules = rule_deduplicate(rules)
        refined_rules = rules
        valid_df = parallelize_dataframe(df, match_func, refined_rules, n_cores=n_cores)
```

先移除重复的，然后在执行parallelize_dataframe。如果不是最后一次，则先执行parallelize_dataframe，再移除重复的。



最后最后，调用get_final_rules函数去输出相应的结果。

```python
    rule_list = list(filter(lambda x: x > 0, list(match_result.rule_num.unique())))
    rule_list.sort()
    print('Matched rules total : %d' % (len(rule_list)))
    #去除负数，排序
    
    df_draw = match_result.loc[match_result.rule_num != 0].groupby(['rule_num'])['match'].count()
    df_draw.plot.bar(figsize=(15, 10), legend=True, fontsize=12)
    #画图
```



然后再返回rule_matching_evaluation函数，输出打印一些相关信息，结束！



#### 5、内部rule评价



主要关注的指标如下：恶意软件召回率、TPR、FPR、准确率。

get_metrics函数，

```python
match_result_stat = result_df.groupby(['match', 'target'])['text'].count()
```

结果如下：

![upload successful](/images/pasted-243.png)

最后mydict结果如下

```python
In [44]: mydict
Out[44]: {'v00': 361, 'v01': 264, 'v10': 668, 'v11': 49, 'v20': 622, 'v21': 36}
```

然后计算出相应的指标

```python
        # 0 for malicious and 1 for normal
        acc = float("{0:.6f}".format((mydict['v01']+mydict['v10'] +mydict['v20'])/result_df.shape[0]))
        fpr = float("{0:.6f}".format((mydict['v11']+mydict['v21'])/(mydict['v11']+mydict['v21']+mydict['v10']+mydict['v20'])))
        rec = float("{0:.6f}".format((mydict['v10']+mydict['v20'])/(mydict['v10']+mydict['v20']+mydict['v00'])))
        rec_scan = float("{0:.6f}".format(mydict['v10']/(mydict['v10']+mydict['v20'])))
        rec_lime = float("{0:.6f}".format(mydict['v20']/(mydict['v10']+mydict['v20'])))
        metrics = dict([('acc', acc), ('fpr', fpr), ('rec', rec), ('rec_scan', rec_scan), ('rec_lime', rec_lime)])
```

这里v11+v21是FP，v10+v20是TN，

即v21表示，真实的是2，预测的是1.

没懂这里的计算...感觉和普通的不太一样～



根据生成的指标，如果其没有达到设定的阈值，删除掉假阳性较高的数据，然后重新鉴别一下匹配错误的数据。

完整的算法如下：

![upload successful](/images/pasted-244.png)

### 五、实验评估



准则：较低的recall rate 会检测不出恶意行为，较高错误预警率会影响正常的使用，rules太多，会导致处理过慢。

1、数据集：webshell、Spam、CSIC。

spam数据集是从YouTube上爬取的评论，它虽然不是网络流量，但是符合文本的规则，可以在此处使用。

CSIC数据集是一个公共数据集，包含有各种攻击数据。



2、rule分类性能分析：

在提取特征的时候，应该从数据集中取例子sample。

在最后的阶段，要使用所有的流量进行特征匹配。

本文使用了两个模型：MLP和随机森林。还使用了格搜索算法。

不同数据集上的分类性能如下：

![upload successful](/images/pasted-245.png)

由图可知，在webshell数据集上的准确度最高。(文中对这种现象的原因作了解释)

基于字符的关键字特征提取方法 本质上是一个线性模型，所以如果数据不能被线性模型分类，那么性能就会变差。



3、参数敏感性分析

重点分析的参数： 随机种子的数量、最小字符串长度阈值、推断的置信度参数。

下图记录了产生rules的数量 以及总体的分类准确度(当SSN=2500的时候)。

![upload successful](/images/pasted-246.png)

由图可知，seed rule set增加，提取出的rules也增加，并且在seed rule se > 1500之后趋近稳定。

字符最小长度越大，对word的限制越严格，rules总数越小。但是它提高了模型的普遍性和覆盖率。但是也会造成更大的假阳性，分类准确度下降。

本文模型内部 会将性能较差的rules舍弃掉。



关于推断过程的置信度参数

![upload successful](/images/pasted-247.png)

由图可知：值越大，符合条件的rules越少，rules的质量越好。

有时，并不是分类越准确越好，有时候相比起来，rules越少 这个指标更加重要。有时，rules更少意味着rules的泛化能力更强，rules覆盖率更高。更加节约时间及资源。



**本文贡献如下：**

(1) 这是第一次在 网络流量特征生成中 利用模型推理的方法。并且对之进行加速。

(2) 实验证明了此方法的有效性。



**未来工作：**

1、对于不可读字符串的特征提取方法。

2、其他模型应用于推断算法



其他代码总结

需要先安装LIME

地址 https://github.com/marcotcr/lime

git clone ---> python setup.py build 即可 。(注意！需python3运行)



1、tpe_get_config

`import configparser` ConfigParser 是用来读取配置文件的包

```python
# -*- coding: utf-8 -*-

import configparser
import os

def getConfig(section, key):
    config = configparser.ConfigParser()
    path = os.path.split(os.path.realpath(__file__))[0] + '/tpe.conf'
    config.read(path)
    return config.get(section, key)
    
getConfig("rule_parameter", "min_single_rule_accuracy") #

```

输出各个内容，得到的结果如下

```python
root@VM-0-3-ubuntu:~/XGen/XAIGen# python test_get_config.py
<backports.configparser.ConfigParser object at 0x7f36e93a8a50> #config
/root/XGen/XAIGen/tpe.conf #path
['/root/XGen/XAIGen/tpe.conf'] #config.read(path)
0.85 #config.get(section, key)
```

值总结如下

```python
getConfig("rule_parameter", "min_single_rule_accuracy") #0.85
getConfig("rule_parameter", "min_word_len") #3
MIN_WORD_CONFIDENCE = float(tpe_get_config.getConfig("rule_parameter", "min_word_confidence")) #0.02
MAX_WORDS_NUM = int(tpe_get_config.getConfig("rule_parameter", "max_words_number")) #4
```



**收获：**

1、payload/UR L 同时存在结构和语义内容。

2、评价指标，如果数据集大小不一样，能否乘上系数？

3、本文模型 以及聚类，直接用了现成的，能否改进呢？用什么模型更加合适？