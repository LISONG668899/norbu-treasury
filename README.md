# PUNDARIKA（པདྨ་དཀར་པོ།）

纯藏文网站，收录不限于竹巴噶举。以竹巴噶举网站（drukpa-library）为底本修改：VitePress 1.6.4 + Cloudflare Pages + PWA。

## 本地运行

    npm ci
    npm run docs:dev        # 本地预览
    npm run docs:build      # 构建，结果在 .vitepress/dist

## 目录结构（路径用短英文，避免藏文网址过长）

    index.md                       首页：七大类（frontmatter 的 catalog.items）
    ka-bstan/                      བཀའ་དང་བསྟན་བཅོས་ཀྱི་སྐོར།
    gsung-bum/                     གསུང་འབུམ་སྣ་ཚོགས་ཀྱི་སྐོར།（两列按钮）
      kun-mkhyen/                  ཀུན་མཁྱེན་པདྨ་དཀར་པོའི་བཀའ་འབུམ།（经龛函号）
      rgya-ras/                    རྒྱ་རས་བཀའ་འབུམ།
    dpe-tshogs/                    དཔེ་ཚོགས་ཕྱོགས་བསྒྲིགས་སྐོར།
    chos-byung/                    ཆོས་འབྱུང་དང་ལོ་རྒྱུས་སྐོར།
      pad-dkar-chos-byung/         正文样张（text: true → 显示收藏按钮）
    rnam-thar/                     རྣམ་ཐར་གསེར་ཕྲེང་གི་སྐོར།
    sgrub-thabs/                   སྒྲུབ་ཐབས་དང་ཆོ་གའི་སྐོར།
    rig-gzhung/                    གནའ་དེང་རིག་གཞུང་གི་སྐོར།
    saved/                         收藏页（存在读者本机浏览器，不上传）
    message/                       留言页
    functions/api/message.js       留言接口（Cloudflare Pages Function）

目录样式：`catalog.style` 填 list（长条）、grid（两列）或 shrine（经龛）。
没有 link 的项目显示为暂不可点；内容做好后补上 link 并建对应文件夹。
界面多语言：藏文 / 简体 / 繁體 / English，词条在 `.vitepress/theme/i18n.ts`；
目录标题译名写在 frontmatter 的 `title_i18n` 和每项的 `i18n`。

## 多语言网址

藏文在根目录 `/`；简体 `/zh/`、繁體 `/zh-hant/`、English `/en/` 只翻译网站结构（标题、目录、按钮），
由 `scripts/gen-locales.mjs` 在 `npm run docs:dev` / `docs:build` 时根据藏文目录页自动生成，不必手写，也不进仓库。
经文页只有藏文一份；目录里指向经文的链接在各语言网址下都指回藏文页。
译名写在藏文页 frontmatter 的 `title_i18n` 和每项的 `i18n`；界面词条在 `.vitepress/theme/i18n.ts`。

## 段落翻译（Claude Haiku 5.5）

接口：`functions/api/translate.js`。开通时在 Cloudflare 本项目 Settings 里：
Variables and Secrets 添加 Secret `ANTHROPIC_API_KEY`；Bindings 添加 KV namespace，变量名 `TRANSLATIONS`。
可选：`DAILY_LIMIT_USD`（每日费用上限，默认 1 美元）、`TRANSLATE_MODEL`（默认 claude-haiku-5-5）。
未设置密钥时网页显示“翻译功能尚未开通”，不影响其他功能。

## 留言功能的一次性设置

Cloudflare → Workers & Pages → 本项目 → Settings → Bindings → Add → KV namespace，
变量名 `MESSAGES`，新建一个命名空间（如 pundarika-messages）。保存后重新部署一次。
查看留言：Cloudflare → Storage & Databases → Workers KV → 该命名空间。

## 防爬

`public/robots.txt` 只允许主要搜索引擎，其余（含 AI 训练爬虫）一律禁止；
另在 Cloudflare 后台开启 AI 爬虫拦截与 Bot Fight Mode。复制粘贴不受限制。

## 图片与 Cloudflare R2

唐卡高清图、PDF 原件不进本仓库（Cloudflare Pages 单文件上限 25 MiB、免费版每站 20,000 个文件）。

1. 在 Cloudflare 建一个 R2 存储桶，开启公开访问并绑定子域名，如 `media.你的域名`。
2. 在 Cloudflare Pages 项目的环境变量里加：`VITE_MEDIA_BASE = https://media.你的域名`
3. 每幅图一个文件夹：`thangka/0001/thumb.webp`、`display.webp`、`original.jpg`（由图片处理脚本生成后上传）。
4. 页面里写：`<MediaImage id="thangka/0001" caption="……" />`

本地开发不设该变量时，图片从 `public/media/` 读取（该文件夹已排除在仓库之外）。
PWA 离线缓存只缓存网站本身，R2 的原图不缓存，缩略图最多缓存 300 张。
