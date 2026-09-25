export function midAutumnPage(locale = "zh") {
  const zh = locale === "zh";
  const lang = zh ? "zh-CN" : "en";
  const title = zh ? "中秋快乐 · AERTEX" : "Happy Mid-Autumn Festival · AERTEX";
  const blessing = zh ? "祝你中秋快乐" : "Happy Mid-Autumn Festival";
  const lead = zh
    ? "愿今夜月光所至，都是平安、团圆与好心情。"
    : "May tonight bring you peace, reunion, and a little more joy.";
  const action = zh ? "点亮今夜" : "Light up the night";
  const hint = zh ? "点击按钮，开启全屏中秋动画" : "Tap to open the full-screen Mid-Autumn animation";
  const stageTitle = zh ? "中秋快乐" : "Happy Mid-Autumn";
  const stageCopy = zh ? "月满 · 人安 · 事事圆满" : "Full moon · Peace · Everything comes together";
  const replay = zh ? "再看一次" : "Replay";
  const close = zh ? "关闭" : "Close";
  const openingTitle = zh ? "有一封中秋祝福" : "A Mid-Autumn wish for you";
  const openingCopy = zh ? "来自 AERTEX 的一封月光来信" : "A moonlit note from AERTEX";
  const openingAction = zh ? "打开祝福" : "Open the wish";
  const openingLoading = zh ? "正在展开月光…" : "Unfolding the moonlight…";
  const otherHref = zh ? "/en/mid-autumn" : "/zh-cn/mid-autumn";
  const otherLabel = zh ? "EN" : "ZH";

  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="theme-color" content="#090713">
  <title>${title}</title>
  <style>
    :root{
      color-scheme:dark;
      --bg:#090713;
      --bg2:#160d26;
      --ink:#fff9eb;
      --muted:rgba(255,249,235,.68);
      --gold:#f5d78c;
      --gold2:#ffefb7;
      --line:rgba(255,238,190,.16);
      --glass:rgba(20,12,35,.46);
    }
    *{box-sizing:border-box}
    html,body{margin:0;min-height:100%;background:var(--bg);color:var(--ink)}
    html{scroll-behavior:smooth}
    body{
      min-height:100svh;
      overflow-x:hidden;
      font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","SF Pro Text","PingFang SC","Microsoft YaHei",system-ui,sans-serif;
      background:
        radial-gradient(circle at 72% 22%,rgba(244,207,120,.12),transparent 28rem),
        radial-gradient(circle at 28% 90%,rgba(101,55,145,.22),transparent 34rem),
        linear-gradient(155deg,#080711 0%,#100b1d 48%,#170d28 100%);
    }
    body.stage-open{overflow:hidden;touch-action:none}
    button,a{font:inherit}
    a{color:inherit;text-decoration:none}
    .shell{
      min-height:100svh;
      width:min(1180px,calc(100% - 34px));
      margin:0 auto;
      padding:max(18px,env(safe-area-inset-top)) 0 max(22px,env(safe-area-inset-bottom));
      display:flex;
      flex-direction:column;
      position:relative;
      isolation:isolate;
    }
    .shell::before{
      content:"";
      position:absolute;
      inset:4% -10% auto auto;
      width:min(68vw,700px);
      aspect-ratio:1;
      border-radius:50%;
      background:radial-gradient(circle,rgba(255,223,146,.08),rgba(255,223,146,.025) 42%,transparent 70%);
      filter:blur(4px);
      z-index:-1;
    }
    .topbar{
      min-height:58px;
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:18px;
    }
    .brand{