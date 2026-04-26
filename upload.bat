@echo off
cd /d %~dp0
git init
git add .
git commit -m "瓶胚全流程管理系统 - 标题栏和导航栏美化，参考GitHub Desktop风格，添加logo"
git remote add origin https://github.com/hucoke/code.git
git push -u origin master
pause