该功能参考idea官网：https://www.jetbrains.com/help/idea/template-variables.html

## 声明logger变量

实现：

1.在live template中新增名为logs的template group，然后新增live template

![image-20220820093206336](https://pic.imgdb.cn/item/630039bb16f2c2beb1919689.png)

2.abbreviation填入自己喜欢的缩写，我里是lf

![image-20220820093254682](https://pic.imgdb.cn/item/630039e416f2c2beb191a8b7.png)

3.Applicable context选择java -> statement&expression&declaration

![image-20220820094311862](https://pic.imgdb.cn/item/63003c4e16f2c2beb192960d.png)

4.Template text输入

![image-20220820094335511](https://pic.imgdb.cn/item/63003c6516f2c2beb1929f88.png)

```java
private static final Logger logger = LoggerFactory.getLogger($CLASS_NAME$.class);
```

5.点击Edit variable 设置被$$包裹的参数的值，这里CLASSNAME 设置为 className()

![image-20220820094421980](https://pic.imgdb.cn/item/63003c9416f2c2beb192b0eb.png)

6.apply–>OK结束，输入lf +回车即可打印声明log对象

![image-20220820094456255](https://pic.imgdb.cn/item/63003cb616f2c2beb192bfce.png)

## 打印日志语句

1.新增一个live template，缩写随意，我这里用lp。

Template text:

```java
logger.info("$METHOD_PAXKAGE$-->$METHOD_NAME$::$PLACE_HOLDERS$",$ARGUMENTS$);
```

2.参数设置

```java
PLACE_HOLDERS = groovyScript("_1.collect { it + ' = [{}]'}.join(', ') ", methodParameters())
ARGUMENTS = groovyScript("_1.collect { it }.join(', ') ", methodParameters())
METHOD_NAME = methodName()
METHOD_PAXKAGE = currentPackage()
```

![image-20220820094645386](https://pic.imgdb.cn/item/63003d2316f2c2beb192eace.png)

Apply --> OK 效果如下：
输入 lp+回车

![image-20220820094712780](https://pic.imgdb.cn/item/63003d3e16f2c2beb192f3b4.png)

## 实践使用

![image-20220820094905357](https://pic.imgdb.cn/item/63003daf16f2c2beb19323aa.png)

![image-20220820094934893](https://pic.imgdb.cn/item/63003dcd16f2c2beb1932f74.png)

