# wuyanzu

项目导航：https://1618999.xyz/wuyanzu/index.html

## 添加项目和日期版本

目录结构：`项目名/YYYY-MM-DD/index.html`。每个日期目录放完整 HTML、CSS、JS、图片等静态资源，使用相对路径（例如 `./prototype.css`）。

示例：
```
sdk/
  2026-11-13/
    index.html
    prototype.css
    prototype.js
  2026-11-14/
    index.html
another-project/
  2026-11-14/
    index.html
```

提交到 main 分支后，Cloudflare 自动运行 `python3 build.py` 和 `npx wrangler deploy`。构建脚本扫描顶层项目文件夹，自动生成项目按钮；点击按钮展开日期链接，日期名称按倒序排列。只有包含 index.html 的日期目录才会发布。空项目可提交 `.gitkeep` 占位，导航显示“暂无日期版本”。

访问日期版本：`https://1618999.xyz/项目名/YYYY-MM-DD/`。

`public/` 为构建产物，无需手动上传或提交。不要删除 build.py 和 wrangler.jsonc。支持静态网站，不提供后端服务。所有发布资源均可公开访问，不要上传密钥或私人数据。
