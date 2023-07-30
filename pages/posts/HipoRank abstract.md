---
layout: post
title: HipoRank抽取式无监督长文本摘要
categories:
  - nlp
tags: []
date: 2022-06-28 11:12:00
---
项目地址：https://github.com/mirandrom/HipoRank



本文使用一个简单的基于图的算法，将文本分为两个层次，分别是section和sentence，以发现句子间的丰富的结构。本方法没有深度学习模型训练的过程，只使用了一种重要性排序的算法来计算。数据集中的train.txt也并没有使用到。

![upload successful](/images/pasted-337.png)

上图显示了一个例子，文章由两个段落组成，每个段落有3个句子。实线表示内部连接，是双向的，虚线表示外部连接，是有方向的。V代表节点，表示句子。E表示边，用来衡量句子的相似度。



需要思考的问题 🤔 ❓⌛️

1、本文基于这样的假设：与其他句子相似性更大的句子，更加重要，就被选取为摘要了。但是这个思想本身是正确的吗？

2、section的表示，使用所有句子表示向量的平均，是否合理？



# 数据预处理

论文使用了两种数据集，分别是：arXiv (没下载) / PubMed (下载使用了，train.txt 4.4G，val.txt 251MB)。但是我需要迁移到我自己的数据集上来使用。



给出的Pubmed的数据组织形式如下：

```python
{ 
  'article_id': str,
  'abstract_text': List[str],
  'article_text': List[str],
  'section_names': List[str],
  'sections': List[List[str]]
}
```

更具体地说，是如下格式

```python
{

"article_id": "XXX" ,
"article_text": ["第一句话", "第二句话", "......"] ,
"abstract_text": ["\<S>bchdbch.\</S> ", "\<S>vbvbsvnjksf.\</S>"] ,  【这个后面被当成人工标记的摘要的结果啦】
"labels" : null
"section_names", ["1. Introduction", "2. Methods", "3. Results", "4. Discussion"]
"sections": [ ["chjdsna", "cdsnkcd", "cjsfgeuybc" ], [XXX] , [XXX], [XXX] ]
}
```

自己的数据集是纯文本的形式，需要把它处理成上文的格式。



1、编写了article2txt()函数，用于将文本按句子划分，每个句子一行，保存为txt格式。

```python
内容：
	读取文本
	判断是否英文，英文才写入
  使用('. ') 划分为一句一句。
	写入txt
```

一个bug，如下格式的内容被分开了，需要后续手工调整

```python
Update (Oct. 30, 2019): Talos is disclosing two additional
```



2、手工标记段落

每个section的开头是段落标题；

手工调整段落，每个section之间以3个换行符分割。

![upload successful](/images/pasted-338.png)

保存在当前的txt文档中



3、txt转为json文件

定义了txt2json函数，用于将一句一句的txt转为模型可以直接读取的json文件。

随后定义了exclude_n函数，用于将产生的json文件的换行符删掉。



4、将多个txt文档合并为一个

需要保证每个txt后面都有一个换行符～

```python
cat *.txt > test.txt
```



# 文本读取

处理读取文档内容的函数位于`dataset_iterators/pubmed.py`

1、在pubmed.py中，使用dataclass来装饰PubmedDoc，作用是无需定义\__init__函数，定义参数属性时更加方便且易读。具体可参考[这篇](https://zhuanlan.zhihu.com/p/59657729)。



2、读取文本内容

在PubmedDataset的\__init__函数中，读取txt文档的内容，txt的每一行包含了一篇文章。将每一行都解析成 PubmedDoc 的格式。

如果有长度限制，使用_filter_doc_len函数进行过滤。会直接把长度不符合的文本给过滤掉，也就是不会对他们进行摘要，而不是进行padding操作。



3、封装数据

生成Document格式的数据。在punned.py中有`from hipo_rank import Document, Section`，在hipo_rank文件夹下的 \__init__.py 中找到了如下定义。

```python
@dataclass
class Section:
    # dataclass wrapper for section in a document and associated text (split into sentences)
    id: str # section name
    sentences: List[str]
    meta: Optional[Dict] = None

@dataclass
class Document:
    # dataclass wrapper for documents yielded by a dataset iterator
    sections: List[Section]
    reference: List[str]
    meta: Optional[Dict] = None
```



exp3_run.py中调用的格式为

```python
DataSet = dataset(**dataset_args)

In [4]: dataset_id
Out[4]: 'pubmed_test'

In [5]: dataset
Out[5]: hipo_rank.dataset_iterators.pubmed.PubmedDataset

In [6]: dataset_args
Out[6]: {'file_path': 'data/pubmed-release/test4.txt'}
```



# 词嵌入

有四种模型可选，分别是`rand` 、`bert`、`w2v`和`sent_transformers`。

以[sentence-transformers](https://github.com/UKPLab/sentence-transformers) 为例来说明调用过程，(因为其他的几个模型都有点太大了)

安装：pip install -U sentence-transformers

使用示例如下：

```python
from sentence_transformers import SentenceTransformer
model = SentenceTransformer('all-MiniLM-L6-v2')
'''
最开始在本机加载model失败，在服务器运行成功，可能是环境问题导致的。
'''
sentences = ['This framework generates embeddings for each input sentence',
    'Sentences are passed as a list of string.', 
    'The quick brown fox jumps over the lazy dog.']
sentence_embeddings = model.encode(sentences)
```



1、导入数据类型

```python
from hipo_rank import Document, Embeddings, SectionEmbedding, SentenceEmbeddings
```

其定义如下

```python
@dataclass
class Document:
    # dataclass wrapper for documents yielded by a dataset iterator
    sections: List[Section]
    reference: List[str]
    meta: Optional[Dict] = None

@dataclass
class SentenceEmbeddings:
    # dataclass wrapper for section in a document and associated sentence embeddings
    id: str # section name
    embeddings: ndarray # first dim = number of sentences
    meta: Optional[Dict] = None
      
@dataclass
class SectionEmbedding:
    # dataclass wrapper for section in a document and associated embedding
    id: str # section name
    embedding: ndarray
    meta: Optional[Dict] = None
      
@dataclass
class Embeddings:
    # dataclass wrapper for section in a document and associated sentence embeddings
    sentence: List[SentenceEmbeddings]
    section: List[SectionEmbedding]
    meta: Optional[Dict] = None
```



2、embedding计算

sentence是较为常规的计算方式

```python
np.stack(self.model.encode(sentences, show_progress_bar=False))
```

section的计算如下：

```python
section_embeddings = [SectionEmbedding(id=se.id, embedding=np.mean(se.embeddings, axis=0))
                              for se in sentence_embeddings]
```

将一个section的所有sentence取平均值，就是一个section的embedding的值。



# 边的权重及方向计算

图的连接形式分为两类：内部连接和外部连接

内部连接：一个section里面的所有sentence都两两相连。

外部连接，只允许让某一个section里的一个top节点 指向另外的section的节点。目的是减少边的数量。



1、余弦相似度计算

hipo_rank下的similarities用来计算句子间的相似度，本文使用的是余弦相似度，`CosSimilarity`类传入的参数是阈值。

该类下的`get_similarities`计算了sentence和sentence、sentence和section、section和section之间的相似度。

在cos.py文件中设置的边都是undirected的。

```python
directions = ["undirected" for _ in pair_indices]
```



2、方向计算

基本思想：最重要的句子都在开头和结尾出现。定义了指标db来衡量这种重要性。

![upload successful](/images/pasted-339.png)

directions下的edge.py定义了EdgeBased类。

python代码实现如下

```python
    def _get_direction(self,  node1_index: int, node2_index: int, num_nodes: int) -> str:
        dist_i = min(node1_index, self.u * (num_nodes - node1_index - 1))
        dist_j = min(node2_index, self.u * (num_nodes - node2_index - 1))
        if dist_i > dist_j:
            return "forward"
        elif dist_i < dist_j:
            return "backward"
        else:
            return "undirected"
```

箭头的方向是从权重大的指向权重较小的。forward代表第一个节点的位置权重比第二个节点大。



引入了

```python
@dataclass
class Similarities:
    # dataclass wrapper for similarities in a document
    sent_to_sent: List[SentenceSimilarities]
    sect_to_sect: SectionSimilarities
    sent_to_sect: List[SentenceSimilarities]
    meta: Optional[Dict] = None
```



随后在edge中还有定义的update_directions函数，用来更新边的权重信息。

order.py的构造和edge.py差不多～但是其位置信息只使用了绝对距离。

undirected.py，函数内部进行循环，标注是undirected的～



3、score计算

随后在`hipo_rank/scorers`目录下进行权重的最终计算

从\__init__.py引入如下内容

```python
score = float
section_idx = int
local_idx = int
global_idx = int

Scores = List[Tuple[score,section_idx,local_idx,global_idx]]
```



定义了MultiplyScorer类

```python
class MultiplyScorer:
  def __init__:
    '''
    所需参数：
    forward_weight: float = 0.,
    backward_weight: float = 1.,
    section_weight: float = 1.,
    '''
    self.forward_sent_to_sent_weight = forward_weight #前向的 一个section之间，句子到句子的权重。这里其实就是参数λ1
    self.backward_sent_to_sent_weight = backward_weight
    
    
  	self.forward_sect_to_sect_weight = forward_weight * section_weight #section的权重值是两者相乘
  	self.backward_sect_to_sect_weight = backward_weight * section_weight
  
  
  def get_scores():
    '''
    用来计算score的得分
    '''
    wI=λ1 ∗sim(vI,vI), ifdb(vI)≥db(vI),
    或 wI=λ2∗sim(vjI,viI), ifdb(viI)<db(vjI)
    
    scores[sect_index][i] += self.forward_sent_to_sent_weight * sim / norm_factor
    scores[sect_index][j] += self.backward_sent_to_sent_weight * sim / norm_factor
    
```



随后计算每个句子总共的权重，是其内部连接和外部连接的和。

在add.py中，先计算sent_to_sent的score值，再计算sent_to_sect的值，两者相加，求的和的值存储在`scores[sect_index][i]` 中。

```python

        # add sent_to_sent scores
        for sect_index, sent_to_sent in enumerate(similarities.sent_to_sent):
            pids = sent_to_sent.pair_indices
            dirs = sent_to_sent.directions
            sims = sent_to_sent.similarities
            norm_factor = len(scores[sect_index]) - 1
            for ((i,j), dir, sim) in zip(pids, dirs, sims):
                if dir == "forward":
                    scores[sect_index][i] += self.forward_sent_to_sent_weight * sim / norm_factor * self.sent_to_sent_weight
                    scores[sect_index][j] += self.backward_sent_to_sent_weight * sim / norm_factor * self.sent_to_sent_weight
                elif dir == "backward":
                    scores[sect_index][j] += self.forward_sent_to_sent_weight * sim / norm_factor * self.sent_to_sent_weight
                    scores[sect_index][i] += self.backward_sent_to_sent_weight * sim / norm_factor * self.sent_to_sent_weight
                else:
                    scores[sect_index][j] += self.backward_sent_to_sent_weight * sim / norm_factor * self.sent_to_sent_weight
                    scores[sect_index][i] += self.backward_sent_to_sent_weight * sim / norm_factor * self.sent_to_sent_weight

        # add sent_to_sect scores
        for sect_index, sent_to_sect in enumerate(similarities.sent_to_sect):
            pids = sent_to_sect.pair_indices
            dirs = sent_to_sect.directions
            sims = sent_to_sect.similarities
            norm_factor = len(scores)
            for ((i,j), dir, sim) in zip(pids, dirs, sims):
                if dir == "forward":
                    scores[sect_index][i] += self.forward_sent_to_sect_weight * sim / norm_factor * self.sent_to_sect_weight
                elif dir == "backward" or dir == "undirected":
                    scores[sect_index][i] += self.backward_sent_to_sect_weight * sim / norm_factor * self.sent_to_sect_weight

```



随后将结果存储在ranked_scores中，并按照相似度的值进行从高到低排序，代码如下：

```python
        ranked_scores = []
        sect_global_idx = 0
        for sect_idx, sect_scores in enumerate(scores):
            for sent_idx, sent_score in enumerate(sect_scores):
                ranked_scores.append(
                    (sent_score,
                     sect_idx,
                     sent_idx,
                     sect_global_idx + sent_idx
                     )
                )
            sect_global_idx += len(sect_scores)
        ranked_scores.sort(key=lambda x: x[0], reverse=True)
```



文中给出的计算公式如下图，这里只给了add的计算方式，没有给出相乘的要如何计算。

![upload successful](/images/pasted-340.png)

multiply的方法与其大致相同，但是计算了乘积，而不是求和。sent_to_sent的值存储在`scores[sect_index][i]`中，sect_to_sect的值值存储在`sect_scores[i]`中。随后将

```python
        for i, score in enumerate(sect_scores):
            scores[i] = [score*s for s in scores[i]]
```

将原本的`scores[sect_index][i]`中的每个sentence乘上 其所在的section对应的sect_scores的值。



# 生成摘要

在 `hipo_rank/summarizers` 文件下。

default.py 中的DefaultSummarizer 按照rank后的顺序，来组织挑选出的句子。





# 实验结果



1、ROUGE 安装使用

将ROUGE-1.5.5文件夹上传



由于之前在另一个文件夹下安装过，直接使用会报错

`PermissionError: [Errno 13] Permission denied: 'xxx/acl18/ROUGE-1.5.5/ROUGE-1.5.5.pl'`



参考 https://blog.csdn.net/qingjuanzhao/article/details/106076323， 进行如下设置

`pyrouge_set_rouge_path ~/mayue/hipo/ROUGE-1.5.5`

但是使用时还是有报错，`PermissionError: [Errno 13] Permission denied: '/home/g3/mayue/hipo/ROUGE-1.5.5/ROUGE-1.5.5.pl'`

再参考 https://github.com/lancopku/Global-Encoding/issues/13，运行`chmod 777 ROUGE-1.5.5.pl`，即可解决该问题。



2、exp1.py

使用PubMed的验证集 来微调超参数，并且进行消融实验。

![upload successful](/images/pasted-341.png)


作者得出超参数结果：

λ1 = 0.0, λ2 = 1.0, α = 1.0, with μ1 = 0.5

α 控制开始位置和结尾的位置 哪个更重要。



3、运行exp3，生成摘要

进行测试，生成摘要，并且计算ROUGE值。

词嵌入部分选取了5个模型来实验，分别如下

```python
rand_200
biomed_w2v
pacsum_bert
st_bert_base
st_roberta_large
```



使用Embedder.get_embeddings(doc)，为每个文档生成一个embed

![upload successful](/images/pasted-342.png)

根据定义的计算相似性的方式，得到sims

sentence-sentence

section-sentence

sect_to_sect

使用余弦相似度，并且是不对称的，句子间的不对称。

![upload successful](/images/pasted-343.png)

再根据DIRECTIONS，得到是edge还是order还是undirected

更新sims的方向

计算得分，得到摘要，保存。保存的结果如下图所示

![upload successful](/images/pasted-344.png)

每个句子后面跟着的四个数字分别如下：

```python
                ranked_scores.append(
                    (sent_score, #句子的得分
                     sect_idx, #所在section的索引
                     sent_idx, #所在句子的索引
                     sect_global_idx + sent_idx #全局索引
                     )
```



4、baseline比较

评估指标：ROUGE F1 / ROUGE- 1 / ROUGE-2 / ROUGE-L



无监督抽取式：SumBasic(2007)、LSA(2004)、LexRank(2004)、PACSUM(2019) (PACSUM，基于图的无监督模型，利用了基于BERT的句子表示。)

有监督神经网络抽取式：vanilla encoder-decoder模型(2016)、SummaRuNNer(2017)、GlobalLocalCont(2019)、Sent-CLF(2019)和Sent-PTR(2019)

神经网络生成式：Attn-Seq2Seq(2016)、Pntr- Gen-Seq2Seq(2017)、Discourse- aware(2018)

其他：first k tokens(no paper)、Oracle(2017)



5、人工评估

之前没有工作做个这个方面。



# 使用手册



## 数据爬虫

待做

既然有那些数据，说明之前肯定有人爬取过了，我没必要再重复造轮子辽~



## 文本内容解析

运行parsefile_1.py，将目录下的文本进行解析。

运行parsefile_2.py，将文本改为模型可以处理的模式。



`cat *.txt >text4.txt`



## 模型运行



对于安全文章来说，一般最开始的位置更加重要，所以a设置为1.2，就使得末尾位置的权重更大了，末尾位置就会变得更加不重要。修改`directions/edge.py`



将上文得到的text4.txt 放入服务器中，运行exp3_run.py，得到的结果存储在 `results/exp3`中。



## 解析summary

虽然上文生成了摘要文档，但是句子是以 score的得分顺序来组织的，并且也不是人直接可读的形式。以如下方式进行排序

```python
pubmed_test_hiporank_path = '/Users/my/Documents/blog/source/_postsresults/exp3/pubmed_test-st_bert_base-cos-edge-add_f=0.0_b=1.0_s=0.5/summaries.json'
pubmed_test_hiporank_ori = json.loads(Path(pubmed_test_hiporank_path).read_text())

pubmed_test_hiporank_txt = ["\n".join([s[0].replace("\n", "") for s in sorted(x['summary'], key=lambda x:x[4])]) for x in pubmed_test_hiporank_ori]
```



此外，为了增加可读性，需要将文章的标题加上。

在init.py的`Document`中加入title，加入后其数据格式如下：

```python
@dataclass
class Document:
    # dataclass wrapper for documents yielded by a dataset iterator
    sections: List[Section]
    reference: List[str]
    title: str
    meta: Optional[Dict] = None
```

在pubmed.py中加入title

```python
	title = [doc.article_id for doc in docs]
	return [Document(sections=s, reference=r, title=t) for s,r,t in zip(sections, references, title)]
```

最后在运行exp3_run.py的部分，将title写入

```python
results.append({
	"num_sects": len(doc.sections),
  "num_sents": sum([len(s.sentences) for s in doc.sections]),
	"summary": summary,
	"title": doc.title
	})
```



最终每篇文章得到的结果如下图所示

![upload successful](/images/pasted-345.png)

可以看出仍然有较多的IOC指标或URL参考链接，后续需要将其删除。





# TODO ⌛️



1、测试时，分别使用add和multiply的方法来进行尝试，查看结果



2、不以一个完整的句子来判断相似度，而是用含有标点符号的片段。比如遇到了一个逗号，就将其进行切割。



3、仍然手工标记section！！！



4、先提取IOC，将提取出的IOC从文本中删除掉，再进行摘要



5、将英文转为中文