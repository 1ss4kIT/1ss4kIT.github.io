---
date: 2023-04-11 13:16:09
layout: post
tags: null
categories:
  - 杂记
title: 报销单图片下载
---

​	被安排协助财务小姐姐进行报销单自查，需要根据报销单号找到对应的发票图片。若在网站上操作需要每次手动输入报销单号，且每次查询需要等待数秒时间，故决定将图片下载批量到本地，本文记录实现过程。



## 解析文档

首先将原始xlsx文件转为csv文件，随后遍历每一行，获取报销单号。



## bp抓包


请求包结构

```html
POST /fin/arBillReport/getArBillReport HTTP/1.1
Host: 172.30.24.30
Content-Length: 410
Content-Type: application/json;charset=UTF-8
Accept: application/json, text/plain, */*
Finetoken: Bearer
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.50 Safari/537.36
ClientIP: 159.226.94.118
Authorization: Bearer XXXXXXXXXXXX
Origin: http://172.30.24.30
Referer: http://172.30.24.30/arp/index.html
Accept-Encoding: gzip, deflate
Accept-Language: zh-CN,zh;q=0.9
Cookie: Authorization=XXXXXXXXXX
Connection: close

{"searchCondition":{"billMoneyFrom":"","billMoneyEnd":"","startDate":null,"endDate":"","preparedStartDate":null,"preparedEndDate":"","orgCode":"","orgName":"","subjectCode":"","subjectName":"","financialAuditorName":"","recAccName":"","billStatus":"","billType":"","reportType":"FINANCIAL_STAFF_EXPENSE_MX_QUERY","searchLoanBillId":"","isExpLoan":"ALL","offset":1,"limit":10,"searchKeyWord":"BPT201911210139"}}
```



得到响应

```python
HTTP/1.1 200 
Server: nginx/1.20.1
Date: Tue, 11 Apr 2023 07:32:02 GMT
Content-Type: application/json;charset=UTF-8
Connection: close
Cache-Control: no-store
Pragma: no-cache
Content-Length: 2009

{"msg":"数据查询成功！","flag":"SUCCESS",
 ....
 ....
 ....
 navigatepageNums":[1]}}}
```



## 完整流程梳理



### getArBillReport

获得BILLID  AC1E181E0000000067AE525700008187。



### getDetialInfo

此处是为了得到每个报销单所对应的图片名及其索引，用于之后的下载操作。

```python
GET /fin/arBill/getArBill/AC1E181E0000000067AE525700008187/baseInfo/detailInfo HTTP/1.1
Host: 172.30.24.30
Accept: application/json, text/plain, */*
Finetoken: Bearer
ClientIP: 159.226.94.118
Authorization: Bearer diO7IzIfzmYATITk
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.50 Safari/537.36
Referer: http://172.30.24.30/arp/index.html
Accept-Encoding: gzip, deflate
Accept-Language: zh-CN,zh;q=0.9
Cookie: Authorization=diO7IzIfzmYATITk
Connection: close
```

得到图片的哈希值 7F0000010000000058FF8A13FFFFFFA3。

此处还可以获取收款人。



### GetFile

勾选显示图片数据包

请求数据包，将得到的图片保存到本地。



## 总结

1、机器能做的事情，就不要人工来做了。

2、报错解决

若页面返回如下结果

```python
<b>Description</b> The request has not been applied because it lacks valid authentication credentials for the target resource.</p><hr class="line" /><h3>Apache Tomcat/8.5.29</h3></body></html>
```

需要设置不走代理

若出现401错误，需要更新Authorization。



3、异步爬虫

目前图片下载速度很慢，若想加速可以考虑多线程异步爬虫。



4、cookie的值似乎有规律？
    每次首字母的变化是有规律的



​																						2023.4.13 by 1ss4k
​																						