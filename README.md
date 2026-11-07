# 竹巴噶举妙法如意宝藏（དཔལ་འབྲུག་པའི་དམ་ཆོས་ནོར་བུའི་བང་མཛོད།）

纯藏文网站。以竹巴噶举网站（drukpa-library）为底本修改：VitePress 1.6.4 + Cloudflare Pages + PWA。

## 本地运行

    npm ci
    npm run docs:dev        # 本地预览
    npm run docs:build      # 构建，结果在 .vitepress/dist

## 目录结构（路径用短英文，避免藏文网址过长）

    index.md                    首页：七大类（写在 frontmatter 的 catalog.items）
    chos-mdzod/                 དཔལ་འབྲུག་པའི་ཆོས་མཛོད་ཆེན་མོ།（四层）
      index.md                  第二层：函号圆章（style: medallion）
      ka/ index.md              第三层：本函各篇（style: list）
      ka/chos-byung/index.md    第四层：正文（目前是 PDF 转码样张）
    gsung-bum/                  གསུང་འབུམ་གྱི་སྡེ་ཚན།
    rnam-thar/                  དཀར་བརྒྱུད་གོང་མའི་རྣམ་ཐར་སྐོར།
    phyogs-bsgrigs/             ཕྱོགས་བསྒྲིགས་ཀྱི་སྡེ་ཚན།
    sgrub-thabs/                སྒྲུབ་ཐབས་དང་ཆོ་ག་ཆོས་སྤྱོད་སྐོར།
    chos-byung/                 ཆོས་འབྱུང་དང་ལོ་རྒྱུས་ཀྱི་སྡེ་ཚན།
    nyer-mkho/                  ཉེར་མཁོ་དང་རྒྱུན་ཤེས་ཀྱི་སྐོར།
    about/                      关于我们

新增目录项：在该目录 index.md 的 `catalog.items` 里加一行 title + link，并建好对应文件夹。
链接必须真实存在，否则构建失败（死链会使整站构建失败）。

## 图片与 Cloudflare R2

唐卡高清图、PDF 原件不进本仓库（Cloudflare Pages 单文件上限 25 MiB、免费版每站 20,000 个文件）。

1. 在 Cloudflare 建一个 R2 存储桶，开启公开访问并绑定子域名，如 `media.你的域名`。
2. 在 Cloudflare Pages 项目的环境变量里加：`VITE_MEDIA_BASE = https://media.你的域名`
3. 每幅图一个文件夹：`thangka/0001/thumb.webp`、`display.webp`、`original.jpg`（由图片处理脚本生成后上传）。
4. 页面里写：`<MediaImage id="thangka/0001" caption="……" />`

本地开发不设该变量时，图片从 `public/media/` 读取（该文件夹已排除在仓库之外）。
PWA 离线缓存只缓存网站本身，R2 的原图不缓存，缩略图最多缓存 300 张。
