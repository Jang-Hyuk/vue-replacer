for %%i in (%~dp0..) do set ParrentPath=%%~fi
start chrome %ParrentPath%/docs-util/index.html
start chrome %ParrentPath%/docs-db/index.html
start chrome %ParrentPath%/docs-work/index.html