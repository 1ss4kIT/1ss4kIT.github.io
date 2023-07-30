---
date: 2023-03-04 19:35:00
layout: post
tags: null
categories:
  - 未写完
title: Word2Vec及其各种变形总结
---

​	我在本科毕设阶段 (2020年末) 就接触到了Word2Vec等nlp模型，但当时并没有学习过机器学习、深度学习相关的知识，对于该模型及其变型Doc2Vec的理解都不够深刻。近期 (2023年) 阅读了一篇对Word2Vec添加时间特性、并将其应用于威胁情报领域的文章，感触颇深，故决定将该部分的文章、代码进行梳理总结，一方面可以在学习时梳理知识点，另一方面便于日后复习回忆。若此篇文章能为其它学习该知识的同学提供一些帮助，那便是再好不过的事了。

​	该文章重点关注各种模型的代码实现，因为我很喜欢的一位老师说过一句话：“如果你想知道你是不是真的把一个内容搞懂了，你就去试试把它的代码写出来。”  我对自己的要求是：把开源的代码看明白，并且能根据自己的需求做一些修改。



## 0x00 Word2Vec



**文章1:** Tomas Mikolov et al: Efficient Estimation of Word Representations

in Vector Space 

https://arxiv.org/pdf/1301.3781.pdf

文章重点：

```tex
1、规模
本文考虑词汇表的大小：数亿级的词汇中

2、复杂度
模型复杂度：参数数量。

3、已有模型结构
（1）NNLM：前向神经网络语言模型。其模型复杂度为：Q = N × D + N × D × H + H × V（主要项）。使用层次化softmax，词汇被表示为Huffman二叉树，使得H × V的复杂度降为 log2(Unigram perplexity(V ))；

（2）RNNLM：循环神经网络语言模型。其模型复杂度为：H × H + H × V（主要项，可化简）；

4、新型模型结构
（1）CBOW：连续词袋模型，使用四个历史词和四个未来词，正确猜到中间的单词。类似NNLM，但是去除掉了非线性隐藏层，并且投影层对所有单词共享。
训练复杂度：Q = N × D + D × log2(V ).

（2）Skip-gram：正确预测中心词周围的词。
复杂度：Q = C × (D + D × log2(V)) 。C是距离范围

5、实验
（1）单词对称问题；
（2）数据集：词汇表大小为100w个最常见的单词。
（3）在一系列任务上进行实验，评价本模型的效果。
```



**文章2:** Tomas Mikolov et al: Distributed Representations of Words

and Phrases and their Compositionality 

https://arxiv.org/abs/1310.4546











### 1. Google代码实现

首先使用 word2vec.c 构建 word2vec 二进制文件。

```bash
gcc word2vec.c -o word2vec -lm -pthread -O3 -march=native -Wall -funroll-loops -Wno-unused-result

word2vec: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/l, for GNU/Linux 2.6.32, BuildID[sha1]=354e302a932a3ad7c6e97ff98aedcc9a98b14c79, not stripped
```



使用gdb进行调试

```bash
gdb word2vec
start -train text8 -output vectors.bin -cbow 1 -size 200 -window 8 -negative 25 -hs 0 -sample 1e-4 -threads 20 -binary 1 -iter 15
```









```c
#define MAX_STRING 100
#define EXP_TABLE_SIZE 1000
#define MAX_EXP 6
#define MAX_SENTENCE_LENGTH 1000
#define MAX_CODE_LENGTH 40

const int vocab_hash_size = 30000000;  // Maximum 30 * 0.7 = 21M words in the vocabulary

typedef float real;                    // Precision of float numbers

struct vocab_word {
  long long cn; // 出现的次数
  int *point; //用于二叉树
  char *word, *code, codelen;
};

char train_file[MAX_STRING], output_file[MAX_STRING];
char save_vocab_file[MAX_STRING], read_vocab_file[MAX_STRING];
struct vocab_word *vocab;
int binary = 0, cbow = 1, debug_mode = 2, window = 5, min_count = 5, num_threads = 12,
int *vocab_hash;
long long vocab_max_size = 1000, vocab_size = 0, layer1_size = 100;
long long train_words = 0, word_count_actual = 0, iter = 5, classes = 0;
real alpha = 0.025, starting_alpha, sample = 1e-3;
real *syn1neg, *expTable;
clock_t start;

int hs = 0, negative = 5;
const int table_size = 1e8;
int *table;
```





若设置了cbow，则alpha=0.05



vocab_word的结构如下

```c
struct vocab_word {
  long long cn;
  int *point;
  char *word, *code, codelen;
};
```



发现其构建了哈夫曼树。哈夫曼编码的思想是：出现频率最高的词采用最短的长度去进行编码，是数据压缩的一种方式。

参考文章：https://medium.com/@asavinda/c-program-for-text-compression-using-huffman-coding-6625d31d9e43

此处树的节点结构：
![pasted-379](/images/pasted-379.png)


其实现方式如下：

```c
#1. 出现频率排序




```



```c


main()
  import_file(fp_in,freq); //fp_in 是要打开的文件，freq[50]是每个单词出现的频率数组。





```





















此处参考Gensim的代码实现。



Word2Vec的模型可以分为两类：skip-gram（分层softmax） 和 CBOW（词袋模型）（负采样）。









## 0x00 DynamicWord2Vec

​	此处将加入了时间特性的动态模型放在最开始的位置，因为我近期刚读过这篇文章，印象比较深刻，最重要的是，作者将代码开源了。实践出真知，请开始接受我的检验。

论文地址：https://arxiv.org/abs/1703.00607

代码地址：https://github.com/yifan0sun/DynamicWord2Vec





### 1. PMI计算



已经计算过pmi。



### 2. 模型训练



导入初始化 emb，有多少年的数据，就把emb复制多少次。

```python
In [6]: emb.shape
Out[6]: (20936, 50)
```

置乱年份时间

![image-20230313145900634](/Users/my/Library/Application Support/typora-user-images/image-20230313145900634.png)



选择一个年份，使用getmat函数，得到pmi。

```python
In [36]: data = pd.read_csv(f)

In [37]: data
Out[37]:
           word  context       pmi
0             0      433  7.215922
1             0     2302  6.821267
2             0     4158  5.574735
3             0     6300  7.529013
4             0     7318  8.322763
...         ...      ...       ...
11069150  20935    20930  0.000000
11069151  20935    20931  0.000000
11069152  20935    20932  0.030654
11069153  20935    20933  0.027181
11069154  20935    20934  0.000000
```

并不是每个词都有自己本身和其他词的pmi，只存储了部分的，总个数为1亿多。



![image-20230313151355435](/Users/my/Library/Application Support/typora-user-images/image-20230313151355435.png)



使用 ss.coo_matrix 将其变成数组，并且使用csr_matrix 进行压缩。





























































## 0x01 Attack2Vec