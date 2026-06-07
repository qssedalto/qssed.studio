# Git 恢复说明

这个文件夹已经初始化为 Git 仓库，并保存了一次当前状态的快照。

常用命令：

```powershell
git status
```

查看当前文件有没有被修改。

```powershell
git log --oneline
```

查看历史快照。每一行最前面的短编号就是提交编号。

```powershell
git restore 文件名
```

把某个文件恢复到最近一次提交时的状态。

```powershell
git restore .
```

把当前文件夹里所有已跟踪文件恢复到最近一次提交时的状态。

```powershell
git checkout 提交编号 -- .
```

把整个文件夹恢复到某个历史提交的内容。先用 `git log --oneline` 找到提交编号，再运行这条命令。

注意：Git 只能恢复已经提交过的历史。以后做完一轮重要修改，可以运行：

```powershell
git add .
git commit -m "说明这次修改"
```

这样之后就能回到这次修改前后的版本。
