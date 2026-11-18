const fs=require('node:fs');const path=require('node:path');const root=__dirname;
const read=f=>fs.readFileSync(path.join(root,f),'utf8');const write=(f,s)=>fs.writeFileSync(path.join(root,f),s,'utf8');
let source=read('compatibility.js');source=source.replace('<dl><dt>客户端 / 素材</dt>','<dl><dt>接口通道</dt><dd data-api-channel>原接口 · 素材跳转字段</dd><dt>客户端 / 素材</dt>');write('compatibility.js',source);
let prd=read('build-prd.cjs');
prd=prd.replace("const screenshots=[[", "const screenshots=[['compatibility-v4.2.jpg','v4.2 兼容演示：原接口下发新素材，读取已安装 TG 地址组，重复点击复用已下发地址。'],[");
write('build-prd.cjs',prd);
console.log('Added protocol channel to legacy results and compatibility screenshot to PRD');
