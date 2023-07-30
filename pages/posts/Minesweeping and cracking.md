---
categories: 二进制
date: 2022-01-21 21:49:26
layout: post
tags: null
title: 扫雷破解
---

## 0. 破解

Ollydbg的存储位置为 C:\Program Files (x86)。



1、程序运行时输出flag

https://www.begin.re/hacking-minesweeper 这篇写的太详细太棒太好了，一定要看！每条指令每步操作都写的清清楚楚明明白白 [需要翻墙] & [post 3 years ago]。

ida将exe作为PE文件打开。

rand生成的随机数%9，保证了炸弹的坐标在9*9的矩阵内。

esi = 随机数+1，用于确定列

ecx =  (随机数 + 1) * 32，用于确定行的位置

根据行列找到相应的位置，与0x80做test，之后是jnz。即如果此处位置的第8位是1，就跳转回去，运行rand寻找下一个块。如果第8位是0，即跳出循环，运行之后的内容，将其改为8开头的。【这边没设置过的时候，所有位置上的值都是OF，表示没有放置炸弹，放置过之后变为8F。这边有个分支判断是为了防止之前防止过炸弹的地方重复放置。】

*dword_1005330*控制循环次数，即炸弹的个数。最开始设置的是0xA。

在内存某处下断点，单步调试，发现flag的值为0x0E。无数字的值为0x40，有数字再加上相应的数字的值。0x10代表墙壁。未点击时为0xf。

用XOR指令代替原来的OR指令，就能在放置炸弹的时候将0x8F变为0x8E。

修改之后的程序运行初始就标记出了所有雷区的位置，如下图所示。
![1-wirteflag](/Minesweeping and cracking/1-wirteflag.png)


文章还提到了一种破解的方法，即在输出时，将mine输出为flag。

此外还参考了一些其他文章。

【1】[2011年的这篇《用IDA Pro + OD 来分析扫雷》](https://pediy.com/kssd/pediy12/138855.html) 描述了从main函数找到rand函数的过程。

【2】[逆向-扫雷算法分析](https://blog.csdn.net/nightsay/article/details/45540129)，前半部分和【1】差不多，后半部分分析了生成雷区的函数。



2、让计时器停止

参考这篇来操作：https://www.twblogs.net/a/5b82117d2b71772165af7d11 。

最初关注SetTimer函数，后来发现其不是使得时间增加的关键。

使得时间增加的是`0x1003830`处的`INC DWORD PTR DS:[100579C]`，将其改为`NOP`。

随后保存操作如下：

```python
Click on "Assemble" and then hit Esc or choose "Cancel".
Right-click on the disassembly window and choose "Copy to executable" > "All modifications".
Click on "Copy all".
Right-click again, choose "Save file" and specify both location and name to the newly patched file.
Open the file from its location.
```

关于如何找到内存地址`100579C`，也可以使用CE。[CE破解参考教程](https://www.52pojie.cn/thread-1031125-1-1.html)

![2-CE](/Minesweeping and cracking/2-CE.png)


但是自己操作的时候发现不管是nop单个的一行还是nop一小段，都没有让时间停下来。

重新在`100579C`处下写断点，发现如果此时计数器的值不是0，就不是停在刚才说的`0x1003830`，而是断在`0x1002FF5`，将其改为nop。

![3-bp.png](/Minesweeping and cracking/3-bp.png)

时间停止在了1秒。可能因为最开始的从0到1秒和1秒之后的秒数增加不在同一个位置处理，那么合理推测，`0x1003830`处的INC是使得时间从0秒增加到1秒。将其也改为nop，此时时间就停在了0秒。

![4-timestop](/Minesweeping and cracking/4-timestop.png)


3、点到雷不会结束游戏

参考文章：https://www.52pojie.cn/thread-1174768-1-1.html

此处是时间增加的代码。时间增加的条件为`dword_1005164`不为0，且当前时间 < 999。

![5-0x1564](/Minesweeping and cracking/5-0x1564.jpg)

猜测`dword_1005164`用来记录游戏是否结束，若其值为0，则游戏结束。ollydbg调试验证，发现猜想是正确的。初始化后其值为0，用户点击之后游戏开始，值变为1，用户踩到雷区，值变为0。赋值语句如下图所示。[傻傻地直接将这句改为NOP，意料之中地失败了]

![6-gameover](/Minesweeping and cracking/6-gameover.jpg)



随后又参考这篇文章：https://www.dazhuanlan.com/jx0416/topics/1379548

这条指令往上追踪，到了`sub_1003512`函数。

再往上追踪，到了`sub_10037E1`函数。

再往上，到了`sub_1001BC9`函数。游戏的状态与`dword_1005000`处的值有关。游戏未开始时其值为0x18，开始之后为0x01，踩到雷之后变为0x10。在该地址处插入写入断点，踩到雷后跳转到0x010034D6。

![6-endchange](/Minesweeping and cracking/6-endchange.jpg)

将该段代码修改为NOP，踩到雷之后还能继续玩～

![7-afterboom](/Minesweeping and cracking/7-afterboom.jpg)

## 1. 自动玩游戏



1、内存中读取雷区布局

参考文章 https://www.dazhuanlan.com/jx0416/topics/1379548

代码见 https://github.com/gesijiang/cutemines

模拟鼠标点击事件，点击非雷区的块。

```c++
SendMessage(hWinmine,WM_LBUTTONDOWN,0,MAKELPARAM(xBegin-mSize/2+mSize*j,
                    yBegin+mSize/2+mSize*i));
SendMessage(hWinmine,WM_LBUTTONUP,0,MAKELPARAM(xBegin-mSize/2+mSize*j,
                    yBegin+mSize/2+mSize*i));
```



2、编写点击的规则，让机器像人一样去玩耍



3、机器学习解决方案



2022.1.24

原本还有以上两种思路，但是现在心情不好，并且看扫雷已经3天了有点厌烦了，就先做到这个程度吧。



其他可参考文章

https://yiwenzhe.com/2021/03/04/软件逆向之扫雷-二-：破解雷区/

https://bbs.pediy.com/user-home-939618.htm

https://github.com/gesijiang/cutemines/blob/master/pojie.cpp

https://www.freebuf.com/column/168450.html

https://bbs.pediy.com/thread-144908.htm

https://blog.csdn.net/qq_43013814/article/details/109218514?spm=1001.2014.3001.5502

https://blog.csdn.net/double_piga/article/details/120782717

https://github.com/repnz/ReversingMinesweeper