>
>
>前言：在开发一个小项目时，想使用一些独特的字体来提升用户体验，这时就需要引入外部字体，配合css设置样式。注：本文基于vue框架对字体引入。

## 字体库推荐

http://fonts.mobanwang.com/

## 实现步骤

### 下载所需字体

在上述链接中搜索你需要的字体，点击下载

![image-20220722221701818](https://pic.imgdb.cn/item/62dab164f54cd3f937942e2c.png)

下载完成后会得到一个压缩包，也有可能是一个文件。重点是找到ttf文件

![image-20220722221836148](https://pic.imgdb.cn/item/62dab1bdf54cd3f937969279.png)

### 在工程中新建fonts文件夹,并将刚下载的ttf文件放入

![在这里插入图片描述](https://pic.imgdb.cn/item/62dab1e3f54cd3f93797a01a.png)

### 在fonts文件夹中新建font.css文件进行配置

```css
@font-face {
  font-family: "HYXJ";
  src: url("./mnhyxj.ttf") format("truetype");
}
```

### 在main.js中引入或在需要的文件中进行引入

```js
import './assets/fonts/font.css'
```

```css
<style  src=''../../assets/fonts/font.css'></style>
<style>
  @import '../../assets/fonts/font.css';
</style>
<style>
  @import url('../../assets/fonts/font.css');
</style>
```

### 最后直接使用即可

若为主字体，则可以直接在app.vue下设置

```js
#app {
  * {
    font-family:"FZRouSJW";
  }
}
```

若个别页面，单独配置即可

```css
@import "../assets/fonts/icon/font.css";
h1 {
  text-align: center;
  font-family: FZZJ;
}
```

