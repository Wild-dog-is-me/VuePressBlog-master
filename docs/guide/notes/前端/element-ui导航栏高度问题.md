### 问题描述

一开始，使用如下css样式，侧边栏高度设为```100%```铺满，但是只显示了一部分

```css
<style lang="less" scoped>
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}

.el-menu {
  height: 100%;
  border: none;
  h3 {
    color: #fff;
    text-align: center;
    line-height: 48px;
  }
}
</style>
```

![image-20220506013113738](https://pic.imgdb.cn/item/627409e20947543129ef20f5.png)

### 解决方案

具体什么原因并未了解，只提供解决方案。部分代码如下：

```css
<el-menu
    default-active="1-4-1"
    class="el-menu-vertical-demo"
    @open="handleOpen"
    @close="handleClose"
    :collapse="isCollapse"
    background-color="#545c64"
    text-color="#fff"
    active-text-color="#ffd04b"
    :style="containerHeight"	# 设置高度
  >
      
data() {
    return {
      containerHeight: {
        height: "",		
      },
  }
}

created() {
  //动态调整左侧菜单栏高度
  var docHeight = document.documentElement.clientHeight;
  this.containerHeight.height = docHeight + "px";
}
```

![image-20220506013643723](https://pic.imgdb.cn/item/62740b2c0947543129f157b9.png)