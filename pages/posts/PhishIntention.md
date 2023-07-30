---
layout: post
title: 钓鱼检测(一)PhishIntention分析
author: 1ss4k
tags: []
categories:
  - 恶意URL检测
date: 2022-11-08 10:23:00
---

[项目代码地址](https://github.com/lindsey98/PhishIntention)


## 环境配置

使用colab；
[安装Detectron2](https://detectron2.readthedocs.io/en/latest/tutorials/install.html)


## 文章审判

### AWL

本质是目标检测+分类模型，使用9K的 Layout 标注数据进行训练。调用了`detectron2`框架，使用`Faster R-CNN模型`。

### 目标brand识别

`ResNet`使用模型：`ResNetV2-50`；

`OCR`使用模型：`ASTER`，使用公开数据集 `Synth90k` 和 `SynthText` 进行预训练。

本文提出的`OCR_aided_siamese`，其实就是将`ResNet`和`OCR` embedding后的结果串联起来，作者说这样可以同时使用文字和图像的信息，但是我怀疑该方法是否真正有效。【使用[logo2K](https://paperswithcode.com/dataset/logo-2k)进行预训练。】



### 找出登录框位置

将网页截图的RGB图像新扩展出几个通道，将AWL使用的数据再打一个CRP标签。再输入`ResNetV2-50`，找出登录框的位置。


### 动态交互

1、先使用基于HTML启发式的方法，找出比较明显的CRP。搜索HTML中可点击的DOM元素，查看是否有`Login、Sign Up`等关键词。如果有，就认为是找到了CRP。

2、若启发式方法未找到，则使用基于深度学习的方法。
Faster-RCNN模型，使用一些标注数据进行迁移学习。

但是这本质上还是深度学习模型进行预测，我觉得还是不够“动态”。



## 代码锐评


最有价值且创新性最大的部分是动态交互部分，文中叫做`crp_locator`。

```
1、
#基于规则的方法对html进行分析
cre_pred = html_heuristic(html_path)
	
2、
#深度学习模型，得到预测的CRP
cre_pred, cred_conf, _  = credential_classifier_mixed_al(img=screenshot_path, coords=pred_boxes, types=pred_classes, model=CRP_CLASSIFIER)

3、
#使用深度模型得到按钮的位置，使用helium 模拟点击行为
dynamic_analysis

```

## 我的疑惑
1、CRP Transition 定位

文中描述如下：
![upload successful](/images/pasted-357.png)

63CRP是什么意思？


2、

需要手工标注很多数据集，工作量太大，但是别人有💰就没关系。