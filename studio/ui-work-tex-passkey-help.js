import { PASSKEY_GUIDE_SCREENSHOTS } from "./ui-work-tex-passkey-guide-images.js";

export function enhanceWorkTexPasskeyHelp(markup, zh) {
  const t = (cn, en) => zh ? cn : en;
  const steps = [
    {
      number: "01",
      title: t("在项目聊天中点击「验证此项目的 Passkey」", "Choose “Verify project Passkey” in the project chat"),
      detail: t("此帮助链接仅在该项目已创建通行密钥后出现。", "The help link appears only if this project already has a Passkey."),
      image: PASSKEY_GUIDE_SCREENSHOTS.verify,
      alt: t("项目聊天验证按钮，项目名称已遮盖", "Project chat verification button; project name redacted")
    },
    {
      number: "02",
      title: t("在 Windows 安全中心点击「选择其他通行密钥」", "In Windows Security, select “Choose another passkey”"),
      detail: t("默认显示的通行密钥不一定属于当前项目；不要直接选择不确定的项目密钥。旧版本创建的密钥可能仍显示「独立文件聊天」，不代表它在项目之间通用。", "The default passkey may belong to another project. Do not select a key you cannot identify."),
      image: PASSKEY_GUIDE_SCREENSHOTS.windows,
      alt: t("Windows 安全中心的「选择其他通行密钥」操作", "Windows Security passkey dialog showing Choose another passkey")
    },
    {
      number: "03",
      title: t("选择当前项目对应的通行密钥，再完成系统验证", "Select the Passkey for this project, then finish Windows Hello verification"),
      detail: t("多个项目可能都显示 work.qsseda.com。请记住每个项目和通行密钥的对应关系；选择错误的密钥不会解锁其他项目。若密钥保存在手机或安全密钥中，可按系统提示选择对应设备。", "Multiple projects may display work.qsseda.com. Keep track of which credential belongs to each project. A wrong credential will not unlock another project. Choose your phone or hardware security key only if the correct credential is stored there."),
      image: PASSKEY_GUIDE_SCREENSHOTS.choose,
      alt: t("Windows 安全中心的通行密钥选择界面，密钥名称已遮盖", "Windows Security passkey picker with the credential name redacted")
    }
  ];
  const stepMarkup = steps.map(step =>
    '<section class="passkey-help-step"><span class="passkey-help-number">' + step.number + '</span>' +
    '<strong>' + step.title + '</strong><p>' + step.detail + '</p>' +
    (step.image ? '<img loading="lazy" decoding="async" alt="' + step.alt +
      '" src="data:image/webp;base64,' + step.image + '">' : '') + '</section>'
  ).join("");
  const copy = {
    link: t("不会验证？", "Need help verifying?"),
    back: t("返回验证", "Back to verification"),
    title: t("Windows Passkey 验证教程", "Windows Passkey verification guide"),
    note: t("安全提醒：每个项目的 Passkey 必须匹配本项目。即使误选了其他项目的通行密钥，浏览器或服务器也会拒绝验证；不会因此进入该项目的聊天。", "Security: each project Passkey must match this project. Choosing a key from another project is rejected by the browser or server, and cannot unlock this chat.")
  };

  return String(markup || "") + `
  <style id="aertex-project-passkey-help-style">
    .aertex-filechat .passkey-help-link {
      display:block; margin:0 auto; padding:3px 8px;
      border:0; border-radius:5px; background:transparent;
      color:var(--primary,#627ee6); font-size:12px; font-weight:600;
      text-decoration:underline; text-underline-offset:3px; cursor:pointer;
      min-height:28px; max-width:100%;
    }
    .aertex-filechat .passkey-help-link:hover { opacity:.8 }
    .aertex-filechat .passkey-help-link:focus-visible,
    .aertex-filechat .passkey-help-back:focus-visible {
      outline:2px solid var(--primary,#839bf4); outline-offset:3px
    }
    .aertex-filechat .passkey-help-view {
      display:flex; flex:1 1 auto; flex-direction:column;
      min-height:0; overflow:hidden; background:var(--surface,#fff)
    }
    .aertex-filechat .passkey-help-heading {
      display:flex; flex:0 0 auto; align-items:center;
      justify-content:space-between; gap:8px; padding:11px 13px;
      border-bottom:1px solid var(--border,#e6e7eb)
    }
    .aertex-filechat .passkey-help-heading strong {
      font-size:13px; min-width:0; overflow-wrap:anywhere
    }
    .aertex-filechat .passkey-help-back {
      flex:0 0 auto; background:transparent; color:var(--primary,#627ee6);
      border:0; padding:6px 4px; font:inherit; font-size:12px; font-weight:600;
      cursor:pointer
    }
    .aertex-filechat .passkey-help-scroll {
      flex:1 1 auto; overflow-y:auto; overscroll-behavior:contain;
      padding:14px 13px 25px; min-height:0;
      scrollbar-width:thin
    }
    .aertex-filechat .passkey-help-step {
      border:1px solid var(--border,#e5e6ec);
      border-radius:11px; padding:10px 11px 12px; margin-bottom:12px;
      background:color-mix(in srgb,var(--surface,#fff) 90%,var(--fill,#f0f1f8))
    }
    .aertex-filechat .passkey-help-number {
      display:inline-flex; align-items:center; justify-content:center;
      min-width:24px; height:24px; padding:0 5px; margin-bottom:8px;
      border-radius:7px; background:color-mix(in srgb,var(--primary,#839bf4) 16%,transparent);
      color:var(--primary,#627ee6); font-weight:700; font-size:11px
    }
    .aertex-filechat .passkey-help-step>strong {
      display:block; font-size:12px; line-height:1.55; font-weight:650
    }
    .aertex-filechat .passkey-help-step>p {
      color:var(--muted,#676b72); font-size:11px; line-height:1.65;
      margin:5px 0 10px
    }
    .aertex-filechat .passkey-help-step img {
      display:block; max-width:100%; width:100%; height:auto;
      border:1px solid var(--border,#ddd); border-radius:9px;
      background:#fff; object-fit:contain
    }
    .aertex-filechat .passkey-help-note {
      border:1px solid color-mix(in srgb,var(--primary,#839bf4) 22%,var(--border,#ddd));
      border-radius:10px; padding:11px; font-size:11px; line-height:1.7;
      background:color-mix(in srgb,var(--primary,#839bf4) 6%,var(--surface,#fff));
      color:var(--text,#24252b)
    }
    .aertex-filechat .body:has(>.passkey-help-view:not([hidden]))>.banner { display:none!important }
  </style>
  <script id="aertex-project-passkey-help-script">
    (() => {
      const panel = document.getElementById('aertex-filechat');
      const button = document.getElementById('aertex-chat-passkey');
      const unlock = document.getElementById('aertex-chat-unlock-view');
      const conversation = document.getElementById('aertex-chat-conversation');
      if (!panel || !button || !unlock || !conversation) return;
      const link = document.createElement('button');
      link.id = 'aertex-chat-help-link';
      link.type = 'button'; link.className = 'passkey-help-link';
      link.textContent = ${JSON.stringify(copy.link)};
      link.hidden = true;
      button.insertAdjacentElement('afterend', link);
      const guide = document.createElement('section');
      guide.className = 'passkey-help-view';
      guide.id = 'aertex-chat-help-view';
      guide.hidden = true;
      guide.setAttribute('aria-label', ${JSON.stringify(copy.title)});
      guide.innerHTML = '<div class="passkey-help-heading"><strong>' +
        ${JSON.stringify(copy.title)} + '</strong><button type="button" class="passkey-help-back" id="aertex-chat-help-back">' +
        ${JSON.stringify(copy.back)} + '</button></div>' +
        '<div class="passkey-help-scroll">' + ${JSON.stringify(stepMarkup)} +
        '<p class="passkey-help-note">' + ${JSON.stringify(copy.note)} + '</p></div>';
      panel.querySelector('.body').append(guide);
      let registered = false;
      const close = () => {
        guide.hidden = true; unlock.hidden = false;
      };
      link.addEventListener('click', () => {
        if (!registered || !conversation.hidden) return;
        unlock.hidden = true; guide.hidden = false;
        guide.querySelector('.passkey-help-scroll').scrollTop = 0;
      });
      guide.querySelector('#aertex-chat-help-back').addEventListener('click', () => {
        close(); link.focus();
      });
      window.__aertexPasskeyHelp = {
        setRegistered(value) {
          registered = value === true;
          if (!registered) close();
          link.hidden = !registered;
        },
        reset() {
          registered = false;
          link.hidden = true;
          close();
        }
      };
    })();
  </script>`;
}
