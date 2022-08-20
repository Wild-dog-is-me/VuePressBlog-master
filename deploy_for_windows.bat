yarn vuepress build docs
cd docs/.vuepress/dist || exit
echo microsoft.code-farmer.cloud > CNAME
git init
git add -A
git commit -m 'deploy'
git push -f git@github.com:Wild-dog-is-me/Wild-dog-is-me.github.io.git master
