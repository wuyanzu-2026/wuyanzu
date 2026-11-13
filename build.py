"""Publish dated static projects and generate the project navigation page."""
from pathlib import Path
from urllib.parse import quote
import html
import shutil
import subprocess

ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / 'public'
TEMPLATES = ROOT / 'navigation'
PROJECT_ORDER = {'sdk': 0, 'chalofit': 1, 'factsurvey': 2, 'rupeemint': 3}
EXCLUDED = {'public', 'navigation', 'node_modules', '__pycache__', 'work', 'scripts', 'tests'}


def project_sort_key(path):
    return PROJECT_ORDER.get(path.name, len(PROJECT_ORDER)), path.name.casefold()


def version_sort_key(path):
    """Order versions by their latest Git update, not their folder spelling."""
    result = subprocess.run(
        ['git', 'log', '-1', '--format=%ct', '--', path.relative_to(ROOT).as_posix()],
        cwd=ROOT, capture_output=True, text=True, check=False,
    )
    timestamp = result.stdout.strip()
    return (int(timestamp) if timestamp.isdigit() else 0, path.name.casefold())


def collect_projects():
    """Copy publishable versions, keeping folder names as URL segments."""
    projects = []
    for folder in sorted(ROOT.iterdir(), key=project_sort_key):
        if (not folder.is_dir() or folder.is_symlink()
                or folder.name.startswith('.') or folder.name in EXCLUDED):
            continue
        versions = []
        for version in sorted(folder.iterdir(), key=version_sort_key, reverse=True):
            if (not version.is_dir() or version.is_symlink()
                    or version.name.startswith('.') or not (version / 'index.html').is_file()):
                continue
            shutil.copytree(version, OUTPUT / folder.name / version.name)
            url = f'/{quote(folder.name, safe="")}/{quote(version.name, safe="")}/'
            versions.append((version.name, url))
        projects.append((folder.name, versions))
    return projects


def render_project(index, name, versions):
    """Use escaped names and native buttons for accessible disclosure cards."""
    title = html.escape(name)
    links = []
    for date, url in versions:
        links.append(f'''<li class="version-item">
          <a href="{html.escape(url, quote=True)}">
            <span class="version-date">{html.escape(date)}</span>
            <span class="open-label">打开版本 <span aria-hidden="true">↗</span></span>
          </a>
        </li>''')
    content = ('<ul class="version-list">\n' + '\n'.join(links) + '\n</ul>'
               if versions else '<p class="empty-state">暂无日期版本<br><span>添加日期文件夹及 index.html 后，这里会自动更新。</span></p>')
    badge = f'{len(versions)} 个版本' if versions else '待添加版本'
    return f'''<section class="project-card" data-project="{html.escape(name, quote=True)}">
      <h2>
        <button class="project-toggle" type="button" aria-expanded="false" aria-controls="versions-{index}">
          <span class="project-icon" aria-hidden="true">{html.escape(name[:1].upper())}</span>
          <span class="project-info"><span class="project-name">{title}</span><span class="project-caption">项目文件夹 / {title}</span></span>
          <span class="version-count">{badge}</span>
          <span class="chevron" aria-hidden="true">⌄</span>
        </button>
      </h2>
      <div class="versions" id="versions-{index}" hidden>{content}</div>
    </section>'''


def main():
    if OUTPUT.exists():
        shutil.rmtree(OUTPUT)
    OUTPUT.mkdir()
    projects = collect_projects()
    total_versions = sum(len(versions) for _, versions in projects)
    cards = '\n'.join(render_project(i, name, versions) for i, (name, versions) in enumerate(projects))
    page = (TEMPLATES / 'index.html').read_text(encoding='utf-8')
    page = page.replace('{{PROJECT_COUNT}}', str(len(projects)))
    page = page.replace('{{VERSION_COUNT}}', str(total_versions))
    page = page.replace('{{PROJECT_CARDS}}', cards or '<p class="empty-state">暂无项目。</p>')
    navigation_output = OUTPUT / 'wuyanzu'
    navigation_output.mkdir(exist_ok=True)
    for asset in ('styles.css', 'app.js'):
        shutil.copyfile(TEMPLATES / asset, navigation_output / asset)
    (navigation_output / 'index.html').write_text(page, encoding='utf-8')
    (OUTPUT / 'index.html').write_text(page, encoding='utf-8')
    (OUTPUT / '404.html').write_text(
        '<!doctype html><meta charset="utf-8"><title>404</title>'
        '<h1>页面不存在</h1><a href="/wuyanzu/">返回项目导航</a>', encoding='utf-8')
    print(f'Generated navigation: {len(projects)} projects, {total_versions} versions')


if __name__ == '__main__':
    main()
