---
layout: post
title: 水印大修
tags: []
categories:
  - 杂记
author: 1ss4k
date: 2021-04-09 11:45:00
---
记录下来过程，希望自己不再痛苦...🙏

## Zernike旋转角度检测

1、图像截取

​	经过实验，截取原来左上角的最好，所以还用原来的。

2、重新实验

```matlab
0.1---0.0950
0.2---0.1955
0.3---0.2739
0.4---0.4106
0.5---0.4815
0.6---0.6132
0.7---0.6835
0.8---0.7861
0.9---0.8796
1---0.9969
1.1---1.1049
1.2---1.1829
1.3---1.2899
1.4---1.4225
1.5---1.5167
1.6---1.5953
1.7---1.7030
1.8---1.8189
1.9---1.9150
2.0---2.0351
2.1---2.1443
2.2---2.2291
2.3---2.3617
2.4---2.4388
2.5---2.5171
2.6---2.6090
2.7---2.7349
2.8---2.8175
2.9---2.9041
3.0---2.9956

4.0---3.9561

5.0---4.9969

6.0---5.9583

7.0---7.0020

8.0---7.9866

9.0---8.9673

10.0---9.9460
```



## 整体的代码



1、如何处理逆变换之后在[0,255]范围之外的像素值？

用一个local map 去记录。



2、鲁棒性测试的整体流程

​	图像输出显示的时候要uint8一下。

​	运行的时候发现存在着问题，BER一直在0.5左右，检查代码发现是提取的时候边界设置错了。应该是之前测试的时候修改了一下然后忘记改回来了！

![upload successful](/images/pasted-330.png)

​	现在发现不管怎么做，提取出的水印和原来相比总是有50个不一样！发现是没有处理超过255的像素值...我怎么能这么粗心啊啊啊！！！(应该是我后来改过了，总觉得自己之前不至于把这个忘记)。修改之后，代码正常了～



3、测试提出的正常的方法鲁棒性如何

保存在main_em2_attack.m和main_ex2_attack.m文件中

效果比较差



## HVS

参考 https://github.com/t2ac32/PSNR-HVS-M-for-python

在服务器中运行。

No module named 'torch' ---> pip3 install torchvision

使用方法

```python
from PIL import Image
import numpy as np
from psnrhvsm import psnrhvsm
img1 = Image.open("5.jpg")
img2 = Image.open("6.jpg")
imask = np.array(img1)
noise = np.array(img2)
print(imask.shape)
[p_hvs_m, p_hvs] = psnrhvsm(noise,imask,wstep=8)
```

出现错误`'int' object is not callable`，原因在下面

![upload successful](/images/pasted-331.png)

上面的语句，不能直接使用 .size()，直接img1.size即可。



啊啊啊啊我傻了我傻了！这是他为了改成python去用，文件中直接有.m文件，在Matlab中直接调用即可！



## 攻击手法更新

原来用的JPEG、JPEG2000有点过时。



* X264

http://www.videolan.org/developers/x264.html

下载源码

编译 参考http://www.xin.at/x264/x264-guide-macosx-en.htm

```python
./configure --disable-asm
make
make install

x264 --help
```

结果如下

![upload successful](/images/pasted-332.png)

​	然后看实现过程发现，它适用于视频编码，并不适用于图片编码压缩。在实际情况中常用的还是JPEG等。



* X265、Daala

同样都是适用于视频编码！



修改完成～暂时告一段落嘻嘻～棒棒滴！