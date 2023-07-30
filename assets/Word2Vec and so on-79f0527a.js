import{_ as C}from"./ValaxyMain.vue_vue_type_style_index_0_lang-fe952921.js";import{_ as y,p as D,c as i,w as o,o as A,a as s,b as l,d as t,r as n,e as F}from"./app-a51598bf.js";import"./YunFooter.vue_vue_type_script_setup_true_lang-9cc900c2.js";import"./YunCard.vue_vue_type_script_setup_true_lang-fac3e250.js";import"./YunPageHeader.vue_vue_type_script_setup_true_lang-e8684ee8.js";const d="/images/pasted-379.png",As=JSON.parse('{"title":"Word2Vec及其各种变形总结","description":"","frontmatter":{"date":"2023-03-04T19:35:00.000Z","layout":"post","tags":null,"categories":["未写完"],"title":"Word2Vec及其各种变形总结"},"headers":[{"level":2,"title":"0x00 Word2Vec","slug":"_0x00-word2vec","link":"#_0x00-word2vec","children":[{"level":3,"title":"1. Google代码实现","slug":"_1-google代码实现","link":"#_1-google代码实现","children":[]}]},{"level":2,"title":"0x00 DynamicWord2Vec","slug":"_0x00-dynamicword2vec","link":"#_0x00-dynamicword2vec","children":[{"level":3,"title":"1. PMI计算","slug":"_1-pmi计算","link":"#_1-pmi计算","children":[]},{"level":3,"title":"2. 模型训练","slug":"_2-模型训练","link":"#_2-模型训练","children":[]}]},{"level":2,"title":"0x01 Attack2Vec","slug":"_0x01-attack2vec","link":"#_0x01-attack2vec","children":[]}],"relativePath":"pages/posts/Word2Vec and so on.md","path":"/home/runner/work/1ss4kIT.github.io/1ss4kIT.github.io/pages/posts/Word2Vec and so on.md","lastUpdated":1690730773000}'),c=JSON.parse('{"title":"Word2Vec及其各种变形总结","description":"","frontmatter":{"date":"2023-03-04T19:35:00.000Z","layout":"post","tags":null,"categories":["未写完"],"title":"Word2Vec及其各种变形总结"},"headers":[{"level":2,"title":"0x00 Word2Vec","slug":"_0x00-word2vec","link":"#_0x00-word2vec","children":[{"level":3,"title":"1. Google代码实现","slug":"_1-google代码实现","link":"#_1-google代码实现","children":[]}]},{"level":2,"title":"0x00 DynamicWord2Vec","slug":"_0x00-dynamicword2vec","link":"#_0x00-dynamicword2vec","children":[{"level":3,"title":"1. PMI计算","slug":"_1-pmi计算","link":"#_1-pmi计算","children":[]},{"level":3,"title":"2. 模型训练","slug":"_2-模型训练","link":"#_2-模型训练","children":[]}]},{"level":2,"title":"0x01 Attack2Vec","slug":"_0x01-attack2vec","link":"#_0x01-attack2vec","children":[]}],"relativePath":"pages/posts/Word2Vec and so on.md","path":"/home/runner/work/1ss4kIT.github.io/1ss4kIT.github.io/pages/posts/Word2Vec and so on.md","lastUpdated":1690730773000}'),_={name:"pages/posts/Word2Vec and so on.md",data(){return{data:c,frontmatter:c.frontmatter,$frontmatter:c.frontmatter}},setup(){D("pageData",c)}},h=s("p",null,"​ 我在本科毕设阶段 (2020年末) 就接触到了Word2Vec等nlp模型，但当时并没有学习过机器学习、深度学习相关的知识，对于该模型及其变型Doc2Vec的理解都不够深刻。近期 (2023年) 阅读了一篇对Word2Vec添加时间特性、并将其应用于威胁情报领域的文章，感触颇深，故决定将该部分的文章、代码进行梳理总结，一方面可以在学习时梳理知识点，另一方面便于日后复习回忆。若此篇文章能为其它学习该知识的同学提供一些帮助，那便是再好不过的事了。",-1),m=s("p",null,"​ 该文章重点关注各种模型的代码实现，因为我很喜欢的一位老师说过一句话：“如果你想知道你是不是真的把一个内容搞懂了，你就去试试把它的代码写出来。” 我对自己的要求是：把开源的代码看明白，并且能根据自己的需求做一些修改。",-1),u={id:"_0x00-word2vec",tabindex:"-1"},g=s("p",null,[s("strong",null,"文章1:"),l(" Tomas Mikolov et al: Efficient Estimation of Word Representations")],-1),f=s("p",null,"in Vector Space",-1),v=s("p",null,"文章重点：",-1),E=s("div",{class:"language-tex"},[s("span",{class:"copy"}),s("pre",{class:"shiki material-theme-palenight"},[s("code",null,[s("span",{class:"line"},[s("span",{style:{color:"#A6ACCD"}},"1、规模")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#A6ACCD"}},"本文考虑词汇表的大小：数亿级的词汇中")]),l(`
`),s("span",{class:"line"}),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#A6ACCD"}},"2、复杂度")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#A6ACCD"}},"模型复杂度：参数数量。")]),l(`
`),s("span",{class:"line"}),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#A6ACCD"}},"3、已有模型结构")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#A6ACCD"}},"（1）NNLM：前向神经网络语言模型。其模型复杂度为：Q = N × D + N × D × H + H × V（主要项）。使用层次化softmax，词汇被表示为Huffman二叉树，使得H × V的复杂度降为 log2(Unigram perplexity(V ))；")]),l(`
`),s("span",{class:"line"}),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#A6ACCD"}},"（2）RNNLM：循环神经网络语言模型。其模型复杂度为：H × H + H × V（主要项，可化简）；")]),l(`
`),s("span",{class:"line"}),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#A6ACCD"}},"4、新型模型结构")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#A6ACCD"}},"（1）CBOW：连续词袋模型，使用四个历史词和四个未来词，正确猜到中间的单词。类似NNLM，但是去除掉了非线性隐藏层，并且投影层对所有单词共享。")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#A6ACCD"}},"训练复杂度：Q = N × D + D × log2(V ).")]),l(`
`),s("span",{class:"line"}),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#A6ACCD"}},"（2）Skip-gram：正确预测中心词周围的词。")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#A6ACCD"}},"复杂度：Q = C × (D + D × log2(V)) 。C是距离范围")]),l(`
`),s("span",{class:"line"}),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#A6ACCD"}},"5、实验")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#A6ACCD"}},"（1）单词对称问题；")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#A6ACCD"}},"（2）数据集：词汇表大小为100w个最常见的单词。")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#A6ACCD"}},"（3）在一系列任务上进行实验，评价本模型的效果。")])])])],-1),b=s("p",null,[s("strong",null,"文章2:"),l(" Tomas Mikolov et al: Distributed Representations of Words")],-1),k=s("p",null,"and Phrases and their Compositionality",-1),x={id:"_1-google代码实现",tabindex:"-1"},w=s("p",null,"首先使用 word2vec.c 构建 word2vec 二进制文件。",-1),V=s("div",{class:"language-bash"},[s("span",{class:"copy"}),s("pre",{class:"shiki material-theme-palenight"},[s("code",null,[s("span",{class:"line"},[s("span",{style:{color:"#FFCB6B"}},"gcc"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#C3E88D"}},"word2vec.c"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#C3E88D"}},"-o"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#C3E88D"}},"word2vec"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#C3E88D"}},"-lm"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#C3E88D"}},"-pthread"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#C3E88D"}},"-O3"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#C3E88D"}},"-march=native"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#C3E88D"}},"-Wall"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#C3E88D"}},"-funroll-loops"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#C3E88D"}},"-Wno-unused-result")]),l(`
`),s("span",{class:"line"}),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#FFCB6B"}},"word2vec:"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#C3E88D"}},"ELF"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#F78C6C"}},"64"),s("span",{style:{color:"#C3E88D"}},"-bit"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#C3E88D"}},"LSB"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#C3E88D"}},"executable,"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#C3E88D"}},"x86-64,"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#C3E88D"}},"version"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#F78C6C"}},"1"),s("span",{style:{color:"#A6ACCD"}}," (SYSV), dynamically linked, interpreter /lib64/l, "),s("span",{style:{color:"#89DDFF","font-style":"italic"}},"for"),s("span",{style:{color:"#A6ACCD"}}," GNU/Linux 2.6.32, BuildID"),s("span",{style:{color:"#89DDFF"}},"["),s("span",{style:{color:"#A6ACCD"}},"sha1"),s("span",{style:{color:"#89DDFF"}},"]"),s("span",{style:{color:"#A6ACCD"}},"=354e302a932a3ad7c6e97ff98aedcc9a98b14c79, not stripped")])])])],-1),W=s("p",null,"使用gdb进行调试",-1),N=s("div",{class:"language-bash"},[s("span",{class:"copy"}),s("pre",{class:"shiki material-theme-palenight"},[s("code",null,[s("span",{class:"line"},[s("span",{style:{color:"#FFCB6B"}},"gdb"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#C3E88D"}},"word2vec")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#FFCB6B"}},"start"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#C3E88D"}},"-train"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#C3E88D"}},"text8"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#C3E88D"}},"-output"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#C3E88D"}},"vectors.bin"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#C3E88D"}},"-cbow"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#F78C6C"}},"1"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#C3E88D"}},"-size"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#F78C6C"}},"200"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#C3E88D"}},"-window"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#F78C6C"}},"8"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#C3E88D"}},"-negative"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#F78C6C"}},"25"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#C3E88D"}},"-hs"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#F78C6C"}},"0"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#C3E88D"}},"-sample"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#F78C6C"}},"1"),s("span",{style:{color:"#C3E88D"}},"e-4"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#C3E88D"}},"-threads"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#F78C6C"}},"20"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#C3E88D"}},"-binary"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#F78C6C"}},"1"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#C3E88D"}},"-iter"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#F78C6C"}},"15")])])])],-1),M=s("div",{class:"language-c"},[s("span",{class:"copy"}),s("pre",{class:"shiki material-theme-palenight"},[s("code",null,[s("span",{class:"line"},[s("span",{style:{color:"#89DDFF","font-style":"italic"}},"#define"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#82AAFF"}},"MAX_STRING"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#F78C6C"}},"100")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#89DDFF","font-style":"italic"}},"#define"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#82AAFF"}},"EXP_TABLE_SIZE"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#F78C6C"}},"1000")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#89DDFF","font-style":"italic"}},"#define"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#82AAFF"}},"MAX_EXP"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#F78C6C"}},"6")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#89DDFF","font-style":"italic"}},"#define"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#82AAFF"}},"MAX_SENTENCE_LENGTH"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#F78C6C"}},"1000")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#89DDFF","font-style":"italic"}},"#define"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#82AAFF"}},"MAX_CODE_LENGTH"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#F78C6C"}},"40")]),l(`
`),s("span",{class:"line"}),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#C792EA"}},"const"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#C792EA"}},"int"),s("span",{style:{color:"#A6ACCD"}}," vocab_hash_size "),s("span",{style:{color:"#89DDFF"}},"="),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#F78C6C"}},"30000000"),s("span",{style:{color:"#89DDFF"}},";"),s("span",{style:{color:"#676E95","font-style":"italic"}},"  // Maximum 30 * 0.7 = 21M words in the vocabulary")]),l(`
`),s("span",{class:"line"}),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#F78C6C"}},"typedef"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#C792EA"}},"float"),s("span",{style:{color:"#A6ACCD"}}," real"),s("span",{style:{color:"#89DDFF"}},";"),s("span",{style:{color:"#676E95","font-style":"italic"}},"                    // Precision of float numbers")]),l(`
`),s("span",{class:"line"}),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#C792EA"}},"struct"),s("span",{style:{color:"#A6ACCD"}}," vocab_word "),s("span",{style:{color:"#89DDFF"}},"{")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#F07178"}},"  "),s("span",{style:{color:"#C792EA"}},"long"),s("span",{style:{color:"#F07178"}}," "),s("span",{style:{color:"#C792EA"}},"long"),s("span",{style:{color:"#F07178"}}," cn"),s("span",{style:{color:"#89DDFF"}},";"),s("span",{style:{color:"#676E95","font-style":"italic"}}," // 出现的次数")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#F07178"}},"  "),s("span",{style:{color:"#C792EA"}},"int"),s("span",{style:{color:"#F07178"}}," "),s("span",{style:{color:"#89DDFF"}},"*"),s("span",{style:{color:"#F07178"}},"point"),s("span",{style:{color:"#89DDFF"}},";"),s("span",{style:{color:"#676E95","font-style":"italic"}}," //用于二叉树")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#F07178"}},"  "),s("span",{style:{color:"#C792EA"}},"char"),s("span",{style:{color:"#F07178"}}," "),s("span",{style:{color:"#89DDFF"}},"*"),s("span",{style:{color:"#F07178"}},"word"),s("span",{style:{color:"#89DDFF"}},","),s("span",{style:{color:"#F07178"}}," "),s("span",{style:{color:"#89DDFF"}},"*"),s("span",{style:{color:"#F07178"}},"code"),s("span",{style:{color:"#89DDFF"}},","),s("span",{style:{color:"#F07178"}}," codelen"),s("span",{style:{color:"#89DDFF"}},";")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#89DDFF"}},"};")]),l(`
`),s("span",{class:"line"}),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#C792EA"}},"char"),s("span",{style:{color:"#A6ACCD"}}," train_file"),s("span",{style:{color:"#89DDFF"}},"["),s("span",{style:{color:"#A6ACCD"}},"MAX_STRING"),s("span",{style:{color:"#89DDFF"}},"],"),s("span",{style:{color:"#A6ACCD"}}," output_file"),s("span",{style:{color:"#89DDFF"}},"["),s("span",{style:{color:"#A6ACCD"}},"MAX_STRING"),s("span",{style:{color:"#89DDFF"}},"];")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#C792EA"}},"char"),s("span",{style:{color:"#A6ACCD"}}," save_vocab_file"),s("span",{style:{color:"#89DDFF"}},"["),s("span",{style:{color:"#A6ACCD"}},"MAX_STRING"),s("span",{style:{color:"#89DDFF"}},"],"),s("span",{style:{color:"#A6ACCD"}}," read_vocab_file"),s("span",{style:{color:"#89DDFF"}},"["),s("span",{style:{color:"#A6ACCD"}},"MAX_STRING"),s("span",{style:{color:"#89DDFF"}},"];")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#C792EA"}},"struct"),s("span",{style:{color:"#A6ACCD"}}," vocab_word "),s("span",{style:{color:"#89DDFF"}},"*"),s("span",{style:{color:"#A6ACCD"}},"vocab"),s("span",{style:{color:"#89DDFF"}},";")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#C792EA"}},"int"),s("span",{style:{color:"#A6ACCD"}}," binary "),s("span",{style:{color:"#89DDFF"}},"="),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#F78C6C"}},"0"),s("span",{style:{color:"#89DDFF"}},","),s("span",{style:{color:"#A6ACCD"}}," cbow "),s("span",{style:{color:"#89DDFF"}},"="),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#F78C6C"}},"1"),s("span",{style:{color:"#89DDFF"}},","),s("span",{style:{color:"#A6ACCD"}}," debug_mode "),s("span",{style:{color:"#89DDFF"}},"="),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#F78C6C"}},"2"),s("span",{style:{color:"#89DDFF"}},","),s("span",{style:{color:"#A6ACCD"}}," window "),s("span",{style:{color:"#89DDFF"}},"="),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#F78C6C"}},"5"),s("span",{style:{color:"#89DDFF"}},","),s("span",{style:{color:"#A6ACCD"}}," min_count "),s("span",{style:{color:"#89DDFF"}},"="),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#F78C6C"}},"5"),s("span",{style:{color:"#89DDFF"}},","),s("span",{style:{color:"#A6ACCD"}}," num_threads "),s("span",{style:{color:"#89DDFF"}},"="),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#F78C6C"}},"12"),s("span",{style:{color:"#89DDFF"}},",")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#C792EA"}},"int"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#89DDFF"}},"*"),s("span",{style:{color:"#A6ACCD"}},"vocab_hash"),s("span",{style:{color:"#89DDFF"}},";")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#C792EA"}},"long"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#C792EA"}},"long"),s("span",{style:{color:"#A6ACCD"}}," vocab_max_size "),s("span",{style:{color:"#89DDFF"}},"="),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#F78C6C"}},"1000"),s("span",{style:{color:"#89DDFF"}},","),s("span",{style:{color:"#A6ACCD"}}," vocab_size "),s("span",{style:{color:"#89DDFF"}},"="),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#F78C6C"}},"0"),s("span",{style:{color:"#89DDFF"}},","),s("span",{style:{color:"#A6ACCD"}}," layer1_size "),s("span",{style:{color:"#89DDFF"}},"="),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#F78C6C"}},"100"),s("span",{style:{color:"#89DDFF"}},";")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#C792EA"}},"long"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#C792EA"}},"long"),s("span",{style:{color:"#A6ACCD"}}," train_words "),s("span",{style:{color:"#89DDFF"}},"="),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#F78C6C"}},"0"),s("span",{style:{color:"#89DDFF"}},","),s("span",{style:{color:"#A6ACCD"}}," word_count_actual "),s("span",{style:{color:"#89DDFF"}},"="),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#F78C6C"}},"0"),s("span",{style:{color:"#89DDFF"}},","),s("span",{style:{color:"#A6ACCD"}}," iter "),s("span",{style:{color:"#89DDFF"}},"="),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#F78C6C"}},"5"),s("span",{style:{color:"#89DDFF"}},","),s("span",{style:{color:"#A6ACCD"}}," classes "),s("span",{style:{color:"#89DDFF"}},"="),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#F78C6C"}},"0"),s("span",{style:{color:"#89DDFF"}},";")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#A6ACCD"}},"real alpha "),s("span",{style:{color:"#89DDFF"}},"="),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#F78C6C"}},"0.025"),s("span",{style:{color:"#89DDFF"}},","),s("span",{style:{color:"#A6ACCD"}}," starting_alpha"),s("span",{style:{color:"#89DDFF"}},","),s("span",{style:{color:"#A6ACCD"}}," sample "),s("span",{style:{color:"#89DDFF"}},"="),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#F78C6C"}},"1e"),s("span",{style:{color:"#89DDFF"}},"-"),s("span",{style:{color:"#F78C6C"}},"3"),s("span",{style:{color:"#89DDFF"}},";")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#A6ACCD"}},"real "),s("span",{style:{color:"#89DDFF"}},"*"),s("span",{style:{color:"#A6ACCD"}},"syn1neg"),s("span",{style:{color:"#89DDFF"}},","),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#89DDFF"}},"*"),s("span",{style:{color:"#A6ACCD"}},"expTable"),s("span",{style:{color:"#89DDFF"}},";")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#C792EA"}},"clock_t"),s("span",{style:{color:"#A6ACCD"}}," start"),s("span",{style:{color:"#89DDFF"}},";")]),l(`
`),s("span",{class:"line"}),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#C792EA"}},"int"),s("span",{style:{color:"#A6ACCD"}}," hs "),s("span",{style:{color:"#89DDFF"}},"="),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#F78C6C"}},"0"),s("span",{style:{color:"#89DDFF"}},","),s("span",{style:{color:"#A6ACCD"}}," negative "),s("span",{style:{color:"#89DDFF"}},"="),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#F78C6C"}},"5"),s("span",{style:{color:"#89DDFF"}},";")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#C792EA"}},"const"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#C792EA"}},"int"),s("span",{style:{color:"#A6ACCD"}}," table_size "),s("span",{style:{color:"#89DDFF"}},"="),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#F78C6C"}},"1e8"),s("span",{style:{color:"#89DDFF"}},";")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#C792EA"}},"int"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#89DDFF"}},"*"),s("span",{style:{color:"#A6ACCD"}},"table"),s("span",{style:{color:"#89DDFF"}},";")])])])],-1),T=s("p",null,"若设置了cbow，则alpha=0.05",-1),I=s("p",null,"vocab_word的结构如下",-1),S=s("div",{class:"language-c"},[s("span",{class:"copy"}),s("pre",{class:"shiki material-theme-palenight"},[s("code",null,[s("span",{class:"line"},[s("span",{style:{color:"#C792EA"}},"struct"),s("span",{style:{color:"#A6ACCD"}}," vocab_word "),s("span",{style:{color:"#89DDFF"}},"{")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#F07178"}},"  "),s("span",{style:{color:"#C792EA"}},"long"),s("span",{style:{color:"#F07178"}}," "),s("span",{style:{color:"#C792EA"}},"long"),s("span",{style:{color:"#F07178"}}," cn"),s("span",{style:{color:"#89DDFF"}},";")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#F07178"}},"  "),s("span",{style:{color:"#C792EA"}},"int"),s("span",{style:{color:"#F07178"}}," "),s("span",{style:{color:"#89DDFF"}},"*"),s("span",{style:{color:"#F07178"}},"point"),s("span",{style:{color:"#89DDFF"}},";")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#F07178"}},"  "),s("span",{style:{color:"#C792EA"}},"char"),s("span",{style:{color:"#F07178"}}," "),s("span",{style:{color:"#89DDFF"}},"*"),s("span",{style:{color:"#F07178"}},"word"),s("span",{style:{color:"#89DDFF"}},","),s("span",{style:{color:"#F07178"}}," "),s("span",{style:{color:"#89DDFF"}},"*"),s("span",{style:{color:"#F07178"}},"code"),s("span",{style:{color:"#89DDFF"}},","),s("span",{style:{color:"#F07178"}}," codelen"),s("span",{style:{color:"#89DDFF"}},";")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#89DDFF"}},"};")])])])],-1),$=s("p",null,"发现其构建了哈夫曼树。哈夫曼编码的思想是：出现频率最高的词采用最短的长度去进行编码，是数据压缩的一种方式。",-1),B=s("p",null,[l("此处树的节点结构： "),s("img",{src:d,alt:"pasted-379"})],-1),G=s("p",null,"其实现方式如下：",-1),L=s("div",{class:"language-c"},[s("span",{class:"copy"}),s("pre",{class:"shiki material-theme-palenight"},[s("code",null,[s("span",{class:"line"},[s("span",{style:{color:"#A6ACCD"}},"#"),s("span",{style:{color:"#F78C6C"}},"1."),s("span",{style:{color:"#A6ACCD"}}," 出现频率排序")])])])],-1),X=s("div",{class:"language-c"},[s("span",{class:"copy"}),s("pre",{class:"shiki material-theme-palenight"},[s("code",null,[s("span",{class:"line"},[s("span",{style:{color:"#82AAFF"}},"main"),s("span",{style:{color:"#89DDFF"}},"()")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#A6ACCD"}},"  "),s("span",{style:{color:"#82AAFF"}},"import_file"),s("span",{style:{color:"#89DDFF"}},"("),s("span",{style:{color:"#A6ACCD"}},"fp_in"),s("span",{style:{color:"#89DDFF"}},","),s("span",{style:{color:"#A6ACCD"}},"freq"),s("span",{style:{color:"#89DDFF"}},");"),s("span",{style:{color:"#676E95","font-style":"italic"}}," //fp_in 是要打开的文件，freq[50]是每个单词出现的频率数组。")])])])],-1),H=s("p",null,"此处参考Gensim的代码实现。",-1),P=s("p",null,"Word2Vec的模型可以分为两类：skip-gram（分层softmax） 和 CBOW（词袋模型）（负采样）。",-1),O={id:"_0x00-dynamicword2vec",tabindex:"-1"},R=s("p",null,"​ 此处将加入了时间特性的动态模型放在最开始的位置，因为我近期刚读过这篇文章，印象比较深刻，最重要的是，作者将代码开源了。实践出真知，请开始接受我的检验。",-1),z={id:"_1-pmi计算",tabindex:"-1"},U=s("p",null,"已经计算过pmi。",-1),Q={id:"_2-模型训练",tabindex:"-1"},Z=s("p",null,"导入初始化 emb，有多少年的数据，就把emb复制多少次。",-1),q=s("div",{class:"language-python"},[s("span",{class:"copy"}),s("pre",{class:"shiki material-theme-palenight"},[s("code",null,[s("span",{class:"line"},[s("span",{style:{color:"#A6ACCD"}},"In "),s("span",{style:{color:"#89DDFF"}},"["),s("span",{style:{color:"#F78C6C"}},"6"),s("span",{style:{color:"#89DDFF"}},"]:"),s("span",{style:{color:"#A6ACCD"}}," emb"),s("span",{style:{color:"#89DDFF"}},"."),s("span",{style:{color:"#F07178"}},"shape")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#A6ACCD"}},"Out"),s("span",{style:{color:"#89DDFF"}},"["),s("span",{style:{color:"#F78C6C"}},"6"),s("span",{style:{color:"#89DDFF"}},"]:"),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#89DDFF"}},"("),s("span",{style:{color:"#F78C6C"}},"20936"),s("span",{style:{color:"#89DDFF"}},","),s("span",{style:{color:"#A6ACCD"}}," "),s("span",{style:{color:"#F78C6C"}},"50"),s("span",{style:{color:"#89DDFF"}},")")])])])],-1),J=s("p",null,"置乱年份时间",-1),Y=s("p",null,"![image-20230313145900634](/Users/my/Library/Application Support/typora-user-images/image-20230313145900634.png)",-1),j=s("p",null,"选择一个年份，使用getmat函数，得到pmi。",-1),K=s("div",{class:"language-python"},[s("span",{class:"copy"}),s("pre",{class:"shiki material-theme-palenight"},[s("code",null,[s("span",{class:"line"},[s("span",{style:{color:"#A6ACCD"}},"In "),s("span",{style:{color:"#89DDFF"}},"["),s("span",{style:{color:"#F78C6C"}},"36"),s("span",{style:{color:"#89DDFF"}},"]:"),s("span",{style:{color:"#A6ACCD"}}," data "),s("span",{style:{color:"#89DDFF"}},"="),s("span",{style:{color:"#A6ACCD"}}," pd"),s("span",{style:{color:"#89DDFF"}},"."),s("span",{style:{color:"#82AAFF"}},"read_csv"),s("span",{style:{color:"#89DDFF"}},"("),s("span",{style:{color:"#82AAFF"}},"f"),s("span",{style:{color:"#89DDFF"}},")")]),l(`
`),s("span",{class:"line"}),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#A6ACCD"}},"In "),s("span",{style:{color:"#89DDFF"}},"["),s("span",{style:{color:"#F78C6C"}},"37"),s("span",{style:{color:"#89DDFF"}},"]:"),s("span",{style:{color:"#A6ACCD"}}," data")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#A6ACCD"}},"Out"),s("span",{style:{color:"#89DDFF"}},"["),s("span",{style:{color:"#F78C6C"}},"37"),s("span",{style:{color:"#89DDFF"}},"]:")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#A6ACCD"}},"           word  context       pmi")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#F78C6C"}},"0"),s("span",{style:{color:"#A6ACCD"}},"             "),s("span",{style:{color:"#F78C6C"}},"0"),s("span",{style:{color:"#A6ACCD"}},"      "),s("span",{style:{color:"#F78C6C"}},"433"),s("span",{style:{color:"#A6ACCD"}},"  "),s("span",{style:{color:"#F78C6C"}},"7.215922")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#F78C6C"}},"1"),s("span",{style:{color:"#A6ACCD"}},"             "),s("span",{style:{color:"#F78C6C"}},"0"),s("span",{style:{color:"#A6ACCD"}},"     "),s("span",{style:{color:"#F78C6C"}},"2302"),s("span",{style:{color:"#A6ACCD"}},"  "),s("span",{style:{color:"#F78C6C"}},"6.821267")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#F78C6C"}},"2"),s("span",{style:{color:"#A6ACCD"}},"             "),s("span",{style:{color:"#F78C6C"}},"0"),s("span",{style:{color:"#A6ACCD"}},"     "),s("span",{style:{color:"#F78C6C"}},"4158"),s("span",{style:{color:"#A6ACCD"}},"  "),s("span",{style:{color:"#F78C6C"}},"5.574735")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#F78C6C"}},"3"),s("span",{style:{color:"#A6ACCD"}},"             "),s("span",{style:{color:"#F78C6C"}},"0"),s("span",{style:{color:"#A6ACCD"}},"     "),s("span",{style:{color:"#F78C6C"}},"6300"),s("span",{style:{color:"#A6ACCD"}},"  "),s("span",{style:{color:"#F78C6C"}},"7.529013")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#F78C6C"}},"4"),s("span",{style:{color:"#A6ACCD"}},"             "),s("span",{style:{color:"#F78C6C"}},"0"),s("span",{style:{color:"#A6ACCD"}},"     "),s("span",{style:{color:"#F78C6C"}},"7318"),s("span",{style:{color:"#A6ACCD"}},"  "),s("span",{style:{color:"#F78C6C"}},"8.322763")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#A6ACCD"}},"...         ...      ...       ...")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#F78C6C"}},"11069150"),s("span",{style:{color:"#A6ACCD"}},"  "),s("span",{style:{color:"#F78C6C"}},"20935"),s("span",{style:{color:"#A6ACCD"}},"    "),s("span",{style:{color:"#F78C6C"}},"20930"),s("span",{style:{color:"#A6ACCD"}},"  "),s("span",{style:{color:"#F78C6C"}},"0.000000")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#F78C6C"}},"11069151"),s("span",{style:{color:"#A6ACCD"}},"  "),s("span",{style:{color:"#F78C6C"}},"20935"),s("span",{style:{color:"#A6ACCD"}},"    "),s("span",{style:{color:"#F78C6C"}},"20931"),s("span",{style:{color:"#A6ACCD"}},"  "),s("span",{style:{color:"#F78C6C"}},"0.000000")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#F78C6C"}},"11069152"),s("span",{style:{color:"#A6ACCD"}},"  "),s("span",{style:{color:"#F78C6C"}},"20935"),s("span",{style:{color:"#A6ACCD"}},"    "),s("span",{style:{color:"#F78C6C"}},"20932"),s("span",{style:{color:"#A6ACCD"}},"  "),s("span",{style:{color:"#F78C6C"}},"0.030654")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#F78C6C"}},"11069153"),s("span",{style:{color:"#A6ACCD"}},"  "),s("span",{style:{color:"#F78C6C"}},"20935"),s("span",{style:{color:"#A6ACCD"}},"    "),s("span",{style:{color:"#F78C6C"}},"20933"),s("span",{style:{color:"#A6ACCD"}},"  "),s("span",{style:{color:"#F78C6C"}},"0.027181")]),l(`
`),s("span",{class:"line"},[s("span",{style:{color:"#F78C6C"}},"11069154"),s("span",{style:{color:"#A6ACCD"}},"  "),s("span",{style:{color:"#F78C6C"}},"20935"),s("span",{style:{color:"#A6ACCD"}},"    "),s("span",{style:{color:"#F78C6C"}},"20934"),s("span",{style:{color:"#A6ACCD"}},"  "),s("span",{style:{color:"#F78C6C"}},"0.000000")])])])],-1),ss=s("p",null,"并不是每个词都有自己本身和其他词的pmi，只存储了部分的，总个数为1亿多。",-1),ls=s("p",null,"![image-20230313151355435](/Users/my/Library/Application Support/typora-user-images/image-20230313151355435.png)",-1),os=s("p",null,"使用 ss.coo_matrix 将其变成数组，并且使用csr_matrix 进行压缩。",-1),es={id:"_0x01-attack2vec",tabindex:"-1"};function ns(e,as,ts,cs,r,rs){const a=F,p=C;return A(),i(p,{frontmatter:r.frontmatter,data:r.data},{"main-content-md":o(()=>[h,m,s("h2",u,[l("0x00 Word2Vec "),t(a,{class:"header-anchor",href:"#_0x00-word2vec","aria-hidden":"true"},{default:o(()=>[l("#")]),_:1})]),g,f,s("p",null,[t(a,{href:"https://arxiv.org/pdf/1301.3781.pdf",target:"_blank",rel:"noreferrer"},{default:o(()=>[l("https://arxiv.org/pdf/1301.3781.pdf")]),_:1})]),v,E,b,k,s("p",null,[t(a,{href:"https://arxiv.org/abs/1310.4546",target:"_blank",rel:"noreferrer"},{default:o(()=>[l("https://arxiv.org/abs/1310.4546")]),_:1})]),s("h3",x,[l("1. Google代码实现 "),t(a,{class:"header-anchor",href:"#_1-google代码实现","aria-hidden":"true"},{default:o(()=>[l("#")]),_:1})]),w,V,W,N,M,T,I,S,$,s("p",null,[l("参考文章："),t(a,{href:"https://medium.com/@asavinda/c-program-for-text-compression-using-huffman-coding-6625d31d9e43",target:"_blank",rel:"noreferrer"},{default:o(()=>[l("https://medium.com/@asavinda/c-program-for-text-compression-using-huffman-coding-6625d31d9e43")]),_:1})]),B,G,L,X,H,P,s("h2",O,[l("0x00 DynamicWord2Vec "),t(a,{class:"header-anchor",href:"#_0x00-dynamicword2vec","aria-hidden":"true"},{default:o(()=>[l("#")]),_:1})]),R,s("p",null,[l("论文地址："),t(a,{href:"https://arxiv.org/abs/1703.00607",target:"_blank",rel:"noreferrer"},{default:o(()=>[l("https://arxiv.org/abs/1703.00607")]),_:1})]),s("p",null,[l("代码地址："),t(a,{href:"https://github.com/yifan0sun/DynamicWord2Vec",target:"_blank",rel:"noreferrer"},{default:o(()=>[l("https://github.com/yifan0sun/DynamicWord2Vec")]),_:1})]),s("h3",z,[l("1. PMI计算 "),t(a,{class:"header-anchor",href:"#_1-pmi计算","aria-hidden":"true"},{default:o(()=>[l("#")]),_:1})]),U,s("h3",Q,[l("2. 模型训练 "),t(a,{class:"header-anchor",href:"#_2-模型训练","aria-hidden":"true"},{default:o(()=>[l("#")]),_:1})]),Z,q,J,Y,j,K,ss,ls,os,s("h2",es,[l("0x01 Attack2Vec "),t(a,{class:"header-anchor",href:"#_0x01-attack2vec","aria-hidden":"true"},{default:o(()=>[l("#")]),_:1})])]),"main-header":o(()=>[n(e.$slots,"main-header")]),"main-header-after":o(()=>[n(e.$slots,"main-header-after")]),"main-nav":o(()=>[n(e.$slots,"main-nav")]),"main-content":o(()=>[n(e.$slots,"main-content")]),"main-content-after":o(()=>[n(e.$slots,"main-content-after")]),"main-nav-before":o(()=>[n(e.$slots,"main-nav-before")]),"main-nav-after":o(()=>[n(e.$slots,"main-nav-after")]),comment:o(()=>[n(e.$slots,"comment")]),footer:o(()=>[n(e.$slots,"footer")]),aside:o(()=>[n(e.$slots,"aside")]),"aside-custom":o(()=>[n(e.$slots,"aside-custom")]),default:o(()=>[n(e.$slots,"default")]),_:3},8,["frontmatter","data"])}const Fs=y(_,[["render",ns]]);export{As as __pageData,Fs as default};