import pathlib,shutil,html
root=pathlib.Path(__file__).parent
out=root/"public"
if out.exists(): shutil.rmtree(out)
out.mkdir()
links=[]
for project in sorted(root.iterdir()):
 if not project.is_dir() or project.name.startswith(".") or project.name in {"public","node_modules","__pycache__"}: continue
 for date in sorted(project.iterdir(),reverse=True):
  if date.is_dir() and (date/"index.html").is_file():
   target=out/project.name/date.name
   shutil.copytree(date,target)
   path=project.name+"/"+date.name+"/"
   links.append("<li><a href=\"/"+html.escape(path,quote=True)+"\">"+html.escape(project.name+" / "+date.name)+"</a></li>")
(out/"index.html").write_text("<!doctype html><html lang=zh-CN><meta charset=utf-8><meta name=viewport content=\"width=device-width,initial-scale=1\"><title>wuyanzu 项目目录</title><style>body{max-width:800px;margin:60px auto;padding:24px;font:18px system-ui;line-height:1.8}a{color:#2563eb}</style><h1>wuyanzu 项目目录</h1><p>按项目与日期访问归档版本。</p><ul>"+"".join(links)+"</ul></html>",encoding="utf-8")
(out/"404.html").write_text("<!doctype html><meta charset=utf-8><title>404</title><h1>页面不存在</h1><a href=/>返回项目目录</a>",encoding="utf-8")
