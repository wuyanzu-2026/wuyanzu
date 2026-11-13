from pathlib import Path
import shutil
import html
import re
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'public'
EXCLUDED = {'public', 'node_modules', '__pycache__', 'work', 'scripts', 'tests'}
if OUT.exists():
    shutil.rmtree(OUT)
OUT.mkdir()
projects = []
for project in sorted(ROOT.iterdir(), key=lambda p: p.name.casefold()):
    if not project.is_dir() or project.is_symlink() or project.name.startswith('.') or project.name in EXCLUDED:
        continue
    versions = []
    for version in sorted(project.iterdir(), key=lambda p: p.name, reverse=True):
        if version.is_symlink() or not version.is_dir() or version.name.startswith('.'):
            continue
        # A date directory becomes a published version when it contains index.html.
        if not (version / 'index.html').is_file():
            continue
        shutil.copytree(version, OUT / project.name / version.name)
        url = '/' + quote(project.name, safe='') + '/' + quote(version.name, safe='') + '/'
        versions.append((version.name, url))
    # Show a project button even before its first publishable version is added.
    projects.append((project.name, versions))

cards = []
for i, (name, versions) in enumerate(projects):
    links = ''.join('<li><a href="' + html.escape(url, quote=True) + '"><span>' + html.escape(date) + '</span><span aria-hidden="true">打开 ↗</span></a></li>' for date, url in versions)
    body = '<ul>' + links + '</ul>' if versions else '<p class="empty">暂无日期版本，请在日期文件夹内添加 index.html。</p>'
    cards.append('<section class="project"><h2><button type="button" aria-expanded="false" aria-controls="versions-' + str(i) + '"><span class="folder" aria-hidden="true">▣</span><span>' + html.escape(name) + '</span><span class="count">' + str(len(versions)) + ' 个版本</span><span class="arrow" aria-hidden="true">⌄</span></button></h2><div class="versions" id="versions-' + str(i) + '" hidden>' + body + '</div></section>')
page = '''<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>wuyanzu · 项目导航</title>
<style>
:root{color-scheme:light;font-family:system-ui,-apple-system,"PingFang SC",sans-serif;color:#18243b;background:#f5f7fb}*{box-sizing:border-box}body{margin:0}main{max-width:960px;margin:0 auto;padding:64px 24px}header{margin-bottom:32px}.eyebrow{color:#4f6cec;font-size:13px;font-weight:700;letter-spacing:.15em}h1{font-size:34px;letter-spacing:-1px;margin:12px 0}header p{color:#64748b;line-height:1.8;margin:0}.summary{margin-top:20px;font-size:14px;color:#64748b}.project{background:white;border:1px solid #dfe5ef;border-radius:16px;margin-bottom:16px;overflow:hidden;box-shadow:0 4px 18px #17255405}h2{margin:0;font-size:18px}button{width:100%;border:0;background:white;display:flex;align-items:center;gap:14px;text-align:left;padding:24px;color:inherit;font:inherit;font-weight:650;cursor:pointer}button:hover{background:#f8faff}button:focus-visible,a:focus-visible{outline:3px solid #5678f0;outline-offset:-3px}.folder{color:#4f6cec;font-size:25px}.count{margin-left:auto;font-size:13px;color:#64748b;font-weight:400;white-space:nowrap}.arrow{color:#64748b;transition:transform .15s}button[aria-expanded=true] .arrow{transform:rotate(180deg)}.versions{border-top:1px solid #edf0f6;padding:8px 24px 16px}ul{list-style:none;padding:0;margin:0}li+li{border-top:1px solid #f0f3f8}li a{display:flex;justify-content:space-between;gap:12px;padding:16px 0;color:#315ad8;text-decoration:none;font-size:15px}li a:hover{text-decoration:underline}.empty{color:#64748b;font-size:14px;line-height:1.8}footer{margin-top:36px;color:#7b879a;font-size:13px;line-height:1.8}@media(max-width:520px){main{padding:36px 16px}h1{font-size:28px}button{padding:20px 16px;gap:10px}.versions{padding-left:16px;padding-right:16px}.count{font-size:12px}}
</style></head><body><main><header><span class="eyebrow">WUYANZU / PROJECTS</span><h1>项目导航</h1><p>选择项目，展开查看不同日期的版本。</p><div class="summary">__SUMMARY__</div></header><div id="projects">__CARDS__</div><footer>项目与日期版本由仓库目录自动生成。<br>提交到 main 分支并部署成功后，此页面自动更新。</footer></main>
<script>document.querySelectorAll('button[aria-controls]').forEach(button=>{button.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')==='true';button.setAttribute('aria-expanded',String(!open));document.getElementById(button.getAttribute('aria-controls')).hidden=open;});});</script></body></html>'''
page = page.replace('__SUMMARY__', f'{len(projects)} 个项目 · {sum(len(v) for _, v in projects)} 个日期版本').replace('__CARDS__', ''.join(cards) or '<p class="empty">暂无项目，请添加项目文件夹。</p>')
# Preserve the original root entry and provide the requested canonical navigation URL.
(OUT / 'wuyanzu').mkdir(exist_ok=True)
(OUT / 'wuyanzu' / 'index.html').write_text(page, encoding='utf-8')
(OUT / 'index.html').write_text(page, encoding='utf-8')
(OUT / '404.html').write_text('<!doctype html><meta charset="utf-8"><title>404</title><h1>页面不存在</h1><a href="/wuyanzu/index.html">返回项目导航</a>', encoding='utf-8')
print(f'Generated navigation: {len(projects)} projects, {sum(len(v) for _, v in projects)} versions')
