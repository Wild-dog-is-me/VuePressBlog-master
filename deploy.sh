#! /bin/bash

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
yarn vuepress build docs

# 进入生成的文件夹
cd docs/.vuepress/dist

echo microsoft.code-farmer.cloud > CNAME

git init
git add -A
git commit -m 'deploy'


# 如果发布到 https://<USERNAME>.github.io  填写你刚刚创建的仓库地址
git push -f git@github.com:Wild-dog-is-me/Wild-dog-is-me.github.io.git master

cd -
