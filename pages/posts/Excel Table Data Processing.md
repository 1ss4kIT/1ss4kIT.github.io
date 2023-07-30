---
layout: post
title: excel表格数据处理
tags: []
categories:
  - 杂记
date: 2020-11-11 10:57:00
---


### 0x00 前言

每天的工作是重复枯燥的复制粘贴表格信息，别人知道后骂我sb，痛定思痛我决定写一个程序来实现自动化复制粘贴工作。大致分析了一下有以下几个难点：

1、数据是钉钉直播导出的，而他们的备注和真实名字有一定差异，如原本叫姜子牙，备注为 塔城_姜子牙，并且有些类似[古力娜扎]的长名，匹配时复杂。

2、有些群成员是不需要统计的。



**使用工具：**

python

xlrd/xlwt/xlutils 

[原本计划使用：pandas(划掉)，h🐂建议使用openyxl，但是后来都没用]



### 0x01 步骤

**1、读取结果表中的人名**

**问题1:** 读取的时候直接使用xlrd的 `wb = xlrd.open_workbook("11.4密码学1.csv")`，报错 Unsupported format, or corrupt file: Expected BOF record; found '\xff\xfe\xf4v\x00\x00\xadd。

参考 https://blog.csdn.net/kisswife/article/details/76595876 说是文件内部格式不对。尝试使用pandas进行读取。



**问题2:** pandas可以正确读取，但是读出的内容是NaN，即非数。

解决方法：还是cvs文件读取处理的时候有问题，把cvs文件改为xlsx文件，并且用xlrd读取即可。



* 需要使用的是sheet1，使用语句 `sh1 = dd.sheet_by_index(0)`，之后都对sh1进行操作和读取。

获取某个单元格内的值 

```python
print( "第一行第二列的值为:")
print(sh1.cell_value(1, 0))
```

获取行的内容：`rows = sh1.row_values(0)`

获取列的内容：`cols = sh1.col_values(1)`

如果想要输出列中的某个内容，可以用row[0]输出，改变下标即可。



要读取第三列的姓名，`name_clos = sh1.col_values(2)`



求出所有名单的长度之后，用for循环进行遍历，即可遍历出所有的名字。

len()可以直接求出总共的长度。由于表前面是一些表头，不需要计入，所以range从2开始。



**2、与原始表中的进行匹配** 



在内层循环中将钉钉表内容中的id也读出来，匹配是为了找到所对应的行数，即所对应的index。

初步设想的匹配方法如下：

原始的名单中有3个人比较特殊，名字比较长，首先进行判断，如果是字符较长的，就截取前三个字作为他们用来匹配的名字。理论上是不会冲突的。

```python
if (len(name_cols1[i]) > 4):
        name_cols1[i] = name_cols1[i][0:3]
```



进行匹配查找的时候就是找他们真正的名字是否在id中。for循环一遍，一个一个查找即可。初步尝试用find()，如果找到了，就会返回第一次出现的下标，如果没找到就返回-1。

[尝试发现一个中文字符代表的位置长度为3，但其实并没有用到这个，真正用到的是j的值！]

```python
for j in range(7,name_length2):
        index = name_cols2[j].find(name_cols1[i])
        if(index >= 0):
            break
```



(一个思想：查找的时候为了方便起见，可以设定一个数组，用来标记这个人是否已经记录过了，如果没记录过，再进行字符串比较。如果记录过了就不比较了。但是由于数据量较少，就不实现它了，如果以后数据量大了可以再实现它。）

这一步结束之后，真正有价值的是j的值，j+1的数值就是表格上名字之前的序号。



**3、读出数据，填入相应的位置**

在i循环中，填入的位置是在i行，所填的内容是j+1处的信息。

首先读取 j+1处的信息

```python
message1 = sh2.cell_value(j,5)
message2 = sh2.cell_value(j,6)
```

这里本来写了个j+1，但是真实的表格和代码中的表格不同的地方在于：代码中表格索引是从0开始的，所以如果以+1的话会报错说超出索引。



如果想写数据的话，需要自己先创建一个表格，然后写入数据之后再保存。

```python
res=xlwt.Workbook(encoding="utf-8",style_compression=0)
sheet = res.add_sheet('考勤统计', cell_overwrite_ok=**True**)
res.save('jieguo.xlsx')
```



**问题3:** 读取的时长复制过去之后变成了浮点数，如0.095678338467854这样子的数。

在进行处理的时候，值有两种情况，一种是“未参与”，一种是时长。我们需要对时长进行处理。判断是否是浮点数是使用语句`type(sh2.cell_value(j,5)) == type(0.1)`

`date_hms = xlrd.xldate_as_datetime(sh2.cell_value(j,5), 1)`是将这个数字转为1904年1月1日0点开始经过了多少时间，后面加上.time()，就会输出时分秒的形式，用str()把它转换为str格式，就可以进行赋值了。



**问题4:** 编码问题。

list格式的内容，直接输出的内容都是unicode编码的

```txt
[u'\u76f4\u64ad\u6570\u636e\u7edf\u8ba1\u4ec5\u4f9b\u53c2\u8003\uff0c\u5982\u6709\u5f02\u5e38\u8bf7\u8054\u7cfb\u89c2\u4f17\u6838\u5b9e\uff0c\u656c\u8bf7\u8c05\u89e3\u3002', u'', u'', u'', u'', u'', u'', u'', u'']
```

将unicode转为中文输出。直接输出单个的字符，就可以在终端中显示出来。



### 0x02 测试

用某个较少的数据去进行测试，看看有无没发现的错误。

1、cvs与xlsx格式问题

发现不能直接在保存的时候把后缀改成xlsx，而是需要输出另存为xlsx。



2、读取name，不同的班是不同的，需要从name.xlsx中重新读取。



3、其他没有发现什么错误，可以正确执行！



### 0x03 总结

1、完整代码如下

```python 
# coding=utf-8

import xlwt #write
import xlrd #read
import datetime
from xlutils.copy import copy

result_table = xlrd.open_workbook("name.xlsx")
sh1_res = result_table.sheet_by_index(0)
name_cols1 = sh1_res.col_values(1)
name_length1 = len(name_cols1)

#上午数据
dd = xlrd.open_workbook("上午.xlsx")
sh2 = dd.sheet_by_index(0)
name_cols2 = sh2.col_values(2)
name_length2=len(name_cols2)

#for i in range(7,name_length2):
#    print(name_clos2[i])
# 上面这个可以输出钉钉表中的所有人名。结果是保存在name_col2中的

res=xlwt.Workbook(encoding="utf-8",style_compression=0)
sheet = res.add_sheet('考勤统计', cell_overwrite_ok=True)

for i in range(2,name_length1):
    if (len(name_cols1[i]) > 4):
        name_cols1[i] = name_cols1[i][0:3]
    for j in range(7,name_length2):
        index = name_cols2[j].find(name_cols1[i])
        if(index >= 0):
            break
    if(type(sh2.cell_value(j,5)) == type(0.1)):
        date_hms = xlrd.xldate_as_datetime(sh2.cell_value(j,5), 1).time()
        date_hms = str(date_hms)
        message1 = date_hms
    else:
        message1 = sh2.cell_value(j,5)
    sheet.write(i,3,message1)
    
    if(type(sh2.cell_value(j,6)) == type(0.1)):
        date_hms2 = xlrd.xldate_as_datetime(sh2.cell_value(j,6), 1).time()
        date_hms2 = str(date_hms2)
        message2 = date_hms2
    else:
        message2 = sh2.cell_value(j,6)
    sheet.write(i,4,message2)
    

#下午数据
dd2 = xlrd.open_workbook("下午.xlsx")
sh3 = dd2.sheet_by_index(0)
name_cols3 = sh3.col_values(2)
name_length3=len(name_cols3)

for i in range(2,name_length1):
    if (len(name_cols1[i]) > 4):
        name_cols1[i] = name_cols1[i][0:3]
    for j in range(7,name_length3):
        index = name_cols3[j].find(name_cols1[i])
        if(index >= 0):
            break

    if(type(sh3.cell_value(j,5)) == type(0.1)):
        date_hms = xlrd.xldate_as_datetime(sh3.cell_value(j,5), 1).time()
        date_hms = str(date_hms)
        message1 = date_hms
    else:
        message1 = sh3.cell_value(j,5)
    sheet.write(i,6,message1)
    
    if(type(sh3.cell_value(j,6)) == type(0.1)):
        date_hms2 = xlrd.xldate_as_datetime(sh3.cell_value(j,6), 1).time()
        date_hms2 = str(date_hms2)
        message2 = date_hms2
    else:
        message2 = sh3.cell_value(j,6)
    sheet.write(i,7,message2)

res.save('jieguo.xlsx')

```



2、h原本建议我用openyxl，我没听，后来格式出问题改了挺久。作为一个彩笔，以后还是多听听前人的意见比较好，应该能少走很多弯路。



3、自己作为一个计算机专业的学生，现在才开始这样做事是非常不好的，以后要学会把知识应用在生活中，去学一些真正有用的东西，而不是考高分而去读书看课本。不过这是一个开端，相信自己以后是可以做好的！



4、使用方法：

* 下载cvs格式的数据到桌面，另存格式为xlsx保存在kq中。两个文件分别改名为"上午.xlsx"和"下午.xlsx"。

* 如果新换了班，需要修改name里面的名字。
* 终端运行make.py即可，结果保存在"jieguo.xlsx"中。