/**
 * 【初学者导读】
 * 文件：studio/ui-wishes.js
 * 这是 AERTEX 前端 UI 模块（wishes）：负责页面结构、状态、事件和 API 数据的展示。
 * 阅读顺序：先通过可见文字定位 render/模板，再追 state、事件监听和 fetch/API，最后去后端找同一路径。
 * 初学者重点：把“结构、样式、交互、数据”分开理解；一个页面 bug 往往只属于其中一层。
 * 修改注意：已有 class/id/data-* 可能被其他模块和自动测试依赖；不要因为当前页面能显示就随意删除。动态用户内容继续保持转义。
 * 响应式：涉及布局的修改至少检查宽屏、普通笔记本、平板和手机，避免只在一个尺寸上看起来正确。
 */
import { normalizeSupportedLocale } from "./locale.js";

const WISHES_COPY = {
  "en-us":{title:"Wish Links · AERTEX",heading:"Send a wish to someone.",lead:"Choose a greeting page. A name is optional; AERTEX creates a clean share route and redirects it to the selected greeting.",choose:"Choose a wish",birthday:"Happy Birthday",birthdayNote:"For birthdays.",midAutumn:"Happy Mid-Autumn Festival",midAutumnNote:"For the Mid-Autumn Festival.",recipient:"Who is this for?",optional:"Optional",placeholder:"Enter a name or leave it blank",share:"Share route",destination:"Destination",open:"Open wish",copy:"Copy link",copied:"Copied",failed:"Copy failed. Press and hold the link to copy it.",note:"Leave the name blank for a generic link. Adding a name automatically appends ?name=xxx."},
  "zh-cn":{title:"祝福链接 · AERTEX",heading:"把祝福发给想祝福的人。",lead:"选择一个祝福页面。名字可以填写，也可以留空；AERTEX 会生成一条简洁的分享路由，再自动导向对应的祝福。",choose:"选择祝福",birthday:"生日快乐",birthdayNote:"适合生日当天发送。",midAutumn:"中秋快乐",midAutumnNote:"适合中秋节发送。",recipient:"要祝福谁？",optional:"可选",placeholder:"输入名字，也可以留空",share:"分享路由",destination:"实际导向",open:"打开祝福",copy:"复制链接",copied:"已复制",failed:"复制失败，请长按链接复制。",note:"留空时会生成不带 ?name= 的通用祝福链接；填写名字后会自动附加 ?name=xxx。"},
  "zh-tw":{title:"祝福連結 · AERTEX",heading:"把祝福送給想祝福的人。",lead:"選擇一個祝福頁面。姓名可填也可留空；AERTEX 會產生簡潔的分享路由，再導向對應的祝福。",choose:"選擇祝福",birthday:"生日快樂",birthdayNote:"適合生日當天傳送。",midAutumn:"中秋快樂",midAutumnNote:"適合中秋節傳送。",recipient:"要祝福誰？",optional:"選填",placeholder:"輸入名字，也可以留空",share:"分享路由",destination:"實際導向",open:"開啟祝福",copy:"複製連結",copied:"已複製",failed:"複製失敗，請長按連結複製。",note:"留空時會產生不含 ?name= 的通用祝福連結；填寫姓名後會自動加入 ?name=xxx。"},
  "ja-jp":{title:"グリーティングリンク · AERTEX",heading:"大切な人にメッセージを贈りましょう。",lead:"グリーティングページを選びます。名前は任意です。AERTEX がシンプルな共有ルートを作成し、選んだページへ案内します。",choose:"グリーティングを選択",birthday:"お誕生日おめでとう",birthdayNote:"誕生日に送るメッセージ。",midAutumn:"中秋節おめでとう",midAutumnNote:"中秋節に送るメッセージ。",recipient:"誰に贈りますか？",optional:"任意",placeholder:"名前を入力するか空欄のままにします",share:"共有ルート",destination:"移動先",open:"グリーティングを開く",copy:"リンクをコピー",copied:"コピーしました",failed:"コピーできませんでした。リンクを長押ししてコピーしてください。",note:"名前を空欄にすると汎用リンクになります。名前を入れると ?name=xxx が自動で追加されます。"},
  "ko-kr":{title:"축하 링크 · AERTEX",heading:"축하하고 싶은 사람에게 마음을 보내세요.",lead:"축하 페이지를 선택하세요. 이름은 선택 사항이며 AERTEX가 간단한 공유 경로를 만들어 해당 축하 페이지로 연결합니다.",choose:"축하 선택",birthday:"생일 축하합니다",birthdayNote:"생일에 보내기 좋습니다.",midAutumn:"즐거운 중추절",midAutumnNote:"중추절에 보내기 좋습니다.",recipient:"누구에게 보낼까요?",optional:"선택",placeholder:"이름을 입력하거나 비워 두세요",share:"공유 경로",destination:"이동 대상",open:"축하 열기",copy:"링크 복사",copied:"복사됨",failed:"복사하지 못했습니다. 링크를 길게 눌러 복사하세요.",note:"이름을 비워 두면 일반 링크를 만들고, 이름을 입력하면 ?name=xxx가 자동으로 추가됩니다."},
  "fr-fr":{title:"Liens de vœux · AERTEX",heading:"Envoyez un vœu à quelqu’un.",lead:"Choisissez une page de vœux. Le nom est facultatif ; AERTEX crée un lien de partage simple puis redirige vers la page choisie.",choose:"Choisir un vœu",birthday:"Joyeux anniversaire",birthdayNote:"À envoyer pour un anniversaire.",midAutumn:"Bonne fête de la mi-automne",midAutumnNote:"À envoyer pour la fête de la mi-automne.",recipient:"Pour qui ?",optional:"Facultatif",placeholder:"Saisissez un nom ou laissez vide",share:"Lien de partage",destination:"Destination",open:"Ouvrir le vœu",copy:"Copier le lien",copied:"Copié",failed:"Échec de la copie. Maintenez le lien pour le copier.",note:"Laissez le nom vide pour un lien générique. Ajouter un nom ajoute automatiquement ?name=xxx."},
  "es-es":{title:"Enlaces de felicitación · AERTEX",heading:"Envía una felicitación a alguien.",lead:"Elige una página de felicitación. El nombre es opcional; AERTEX crea una ruta sencilla para compartir y redirige a la felicitación seleccionada.",choose:"Elegir felicitación",birthday:"Feliz cumpleaños",birthdayNote:"Para cumpleaños.",midAutumn:"Feliz Festival del Medio Otoño",midAutumnNote:"Para el Festival del Medio Otoño.",recipient:"¿Para quién es?",optional:"Opcional",placeholder:"Escribe un nombre o déjalo vacío",share:"Ruta para compartir",destination:"Destino",open:"Abrir felicitación",copy:"Copiar enlace",copied:"Copiado",failed:"No se pudo copiar. Mantén pulsado el enlace para copiarlo.",note:"Deja el nombre vacío para un enlace genérico. Añadir un nombre agrega automáticamente ?name=xxx."},
  "el-gr":{title:"Σύνδεσμοι ευχών · AERTEX",heading:"Στείλτε μια ευχή σε κάποιον.",lead:"Επιλέξτε μια σελίδα ευχών. Το όνομα είναι προαιρετικό· το AERTEX δημιουργεί έναν καθαρό σύνδεσμο κοινοποίησης και οδηγεί στην επιλεγμένη ευχή.",choose:"Επιλέξτε ευχή",birthday:"Χρόνια πολλά",birthdayNote:"Για γενέθλια.",midAutumn:"Χαρούμενη Γιορτή του Μεσοφθινοπώρου",midAutumnNote:"Για τη Γιορτή του Μεσοφθινοπώρου.",recipient:"Για ποιον είναι;",optional:"Προαιρετικό",placeholder:"Γράψτε όνομα ή αφήστε κενό",share:"Σύνδεσμος κοινοποίησης",destination:"Προορισμός",open:"Άνοιγμα ευχής",copy:"Αντιγραφή συνδέσμου",copied:"Αντιγράφηκε",failed:"Η αντιγραφή απέτυχε. Πατήστε παρατεταμένα τον σύνδεσμο.",note:"Αφήστε το όνομα κενό για γενικό σύνδεσμο. Με όνομα προστίθεται αυτόματα ?name=xxx."},
  "ar-sa":{title:"روابط التهاني · AERTEX",heading:"أرسل تهنئة إلى من تريد.",lead:"اختر صفحة تهنئة. الاسم اختياري؛ ينشئ AERTEX رابط مشاركة بسيطًا ثم يوجّه إلى التهنئة المختارة.",choose:"اختر تهنئة",birthday:"عيد ميلاد سعيد",birthdayNote:"مناسبة لأعياد الميلاد.",midAutumn:"مهرجان منتصف الخريف السعيد",midAutumnNote:"مناسبة لمهرجان منتصف الخريف.",recipient:"لمن هذه التهنئة؟",optional:"اختياري",placeholder:"أدخل اسمًا أو اتركه فارغًا",share:"رابط المشاركة",destination:"الوجهة",open:"فتح التهنئة",copy:"نسخ الرابط",copied:"تم النسخ",failed:"تعذر النسخ. اضغط مطولًا على الرابط لنسخه.",note:"اترك الاسم فارغًا لإنشاء رابط عام. عند إضافة اسم يُلحق ?name=xxx تلقائيًا."}
};
WISHES_COPY["en-gb"]=WISHES_COPY["en-us"]; WISHES_COPY["en-au"]=WISHES_COPY["en-us"];



const WISH_CATEGORY_COPY = {
  "zh-cn":{
    hubTitle:"选择祝福分类",
    hubLead:"祝福中心已经拆成独立分类页。这里仅保留分类入口，不再把所有节日堆在同一个长页面里。",
    enter:"进入分类", available:"已开放", planned:"准备中", festivalCount:"个节日", availableCount:"个可用模板",
    festivalsTitle:"节日与场景", festivalsLead:"每个节日都保留独立说明；已经开放的模板可以直接生成分享链接。",
    guideTitle:"分类说明", audience:"适合对象", theme:"表达重点", builderTitle:"生成祝福链接", builderLead:"当前已开放模板可以直接填写姓名并生成分享地址。",
    noBuilder:"这个分类暂时没有开放的祝福模板。节日结构、用途和文案方向已经先整理完成，后续再逐个接入。",
    categories:{
      "new-year":{title:"新年与团圆",mark:"春",description:"跨年、团聚与传统年节祝福。",theme:"新开始 · 团圆 · 平安",audience:"家人、亲友、同事",guidance:"适合从跨年到团圆节日的问候。表达重点放在新开始、团聚、平安和节庆氛围，避免所有节日都使用同一套拜年文案。",items:[
        {name:"元旦",mark:"元",state:"planned",description:"新年第一天，适合朋友、同事和公开场景的简洁问候。"},
        {name:"除夕",mark:"夕",state:"planned",description:"围绕团圆、守岁和年夜氛围，适合家人和亲友。"},
        {name:"春节",mark:"春",state:"planned",description:"正式的新春拜年场景，适合亲友、长辈、同事与群体祝福。"},
        {name:"元宵节",mark:"灯",state:"planned",description:"适合灯会、团圆和春节收尾阶段的节庆问候。"},
        {name:"中秋节",mark:"秋",state:"mid-autumn",description:"围绕月圆与团聚，适合家人、朋友和远距离问候。"}
      ]},
      traditions:{title:"传统与节气",mark:"节",description:"传统节日与季节节点，强调贴合场景的表达。",theme:"传统 · 节令 · 安康",audience:"亲友、长辈、熟人",guidance:"传统节日的语气应该跟随节日本身。清明以追思与克制为主，端午更适合安康和节令问候，不使用统一的热闹祝词。",items:[
        {name:"清明节",mark:"清",state:"planned",description:"以追思、缅怀和春日问候为主，避免过度喜庆的措辞。"},
        {name:"端午节",mark:"舟",state:"planned",description:"适合安康、节令与传统文化主题，可用于亲友和工作场景。"}
      ]},
      family:{title:"家庭与成长",mark:"家",description:"面向家人、孩子与成长节点的祝福主题。",theme:"陪伴 · 感谢 · 成长",audience:"家人、孩子、亲密亲友",guidance:"这组祝福更强调具体关系。生日关注个人节点，母亲节和父亲节突出感谢，儿童节偏向成长和快乐，妇女节则避免模板化标签。",items:[
        {name:"生日",mark:"生",state:"birthday",description:"个人成长节点，适合家人、朋友、同事等不同关系。"},
        {name:"妇女节",mark:"她",state:"planned",description:"适合表达尊重、感谢与关怀，避免刻板化或过度标签化文案。"},
        {name:"儿童节",mark:"童",state:"planned",description:"以快乐、好奇和成长为核心，适合孩子与家庭场景。"},
        {name:"母亲节",mark:"母",state:"planned",description:"围绕感谢、陪伴与关怀，适合更私人和具体的表达。"},
        {name:"父亲节",mark:"父",state:"planned",description:"围绕感谢、支持与陪伴，适合家庭和个人表达。"}
      ]},
      relationships:{title:"关系与表达",mark:"爱",description:"用于爱意、亲密关系与轻松互动场景。",theme:"爱意 · 陪伴 · 趣味",audience:"伴侣、朋友、亲密关系",guidance:"这组文案更依赖关系距离。七夕和情人节适合明确表达爱意，愚人节则应保持轻松并避免让对方感到冒犯。",items:[
        {name:"七夕节",mark:"夕",state:"planned",description:"偏向含蓄、浪漫和陪伴感，适合伴侣与亲密关系。"},
        {name:"情人节",mark:"爱",state:"planned",description:"适合直接表达爱意、感谢与关系纪念。"},
        {name:"愚人节",mark:"趣",state:"planned",description:"适合朋友间轻松互动，文案以有趣但不过界为原则。"}
      ]},
      society:{title:"社会与自然",mark:"地",description:"公共纪念、劳动、自然与节日问候。",theme:"公共 · 自然 · 致意",audience:"同事、朋友、社群",guidance:"这组适合更公开、更简洁的表达。植树节和地球日偏自然主题，劳动节适合致意与假期问候，国庆节以节日和假期问候为主。",items:[
        {name:"植树节",mark:"树",state:"planned",description:"围绕植树、绿色与行动，可用于校园、团队和公共场景。"},
        {name:"地球日",mark:"球",state:"planned",description:"围绕环境、资源与生活方式，适合简洁的自然主题表达。"},
        {name:"劳动节",mark:"劳",state:"planned",description:"适合劳动致意、休息和假期问候，可覆盖同事与朋友。"},
        {name:"国庆节",mark:"国",state:"planned",description:"适合节日与假期问候，可用于朋友、同事和公开场景。"}
      ]}
    }
  },
  "zh-tw":{
    hubTitle:"選擇祝福分類",hubLead:"祝福中心已拆成獨立分類頁。這裡只保留分類入口，不再把所有節日堆在同一個長頁面裡。",
    enter:"進入分類",available:"已開放",planned:"準備中",festivalCount:"個節日",availableCount:"個可用範本",
    festivalsTitle:"節日與情境",festivalsLead:"每個節日都保留獨立說明；已開放的範本可直接建立分享連結。",
    guideTitle:"分類說明",audience:"適合對象",theme:"表達重點",builderTitle:"建立祝福連結",builderLead:"目前已開放範本可直接填寫姓名並產生分享網址。",
    noBuilder:"這個分類暫時沒有開放的祝福範本。節日結構、用途與文案方向已先整理完成，之後再逐一接入。",
    categories:{
      "new-year":{title:"新年與團圓",mark:"春",description:"跨年、團聚與傳統年節祝福。",theme:"新開始 · 團圓 · 平安",audience:"家人、親友、同事",guidance:"適合從跨年到團圓節日的問候。表達重點放在新開始、團聚、平安與節慶氛圍。",items:[
        {name:"元旦",mark:"元",state:"planned",description:"新年第一天，適合朋友、同事與公開情境的簡潔問候。"},
        {name:"除夕",mark:"夕",state:"planned",description:"圍繞團圓、守歲與年夜氛圍，適合家人與親友。"},
        {name:"春節",mark:"春",state:"planned",description:"正式的新春拜年情境，適合親友、長輩、同事與群體祝福。"},
        {name:"元宵節",mark:"燈",state:"planned",description:"適合燈會、團圓與春節收尾階段的節慶問候。"},
        {name:"中秋節",mark:"秋",state:"mid-autumn",description:"圍繞月圓與團聚，適合家人、朋友與遠距離問候。"}
      ]},
      traditions:{title:"傳統與節氣",mark:"節",description:"傳統節日與季節節點，強調貼合情境的表達。",theme:"傳統 · 節令 · 安康",audience:"親友、長輩、熟人",guidance:"傳統節日的語氣應跟隨節日本身。清明以追思與克制為主，端午更適合安康與節令問候。",items:[
        {name:"清明節",mark:"清",state:"planned",description:"以追思、緬懷與春日問候為主，避免過度喜慶措辭。"},
        {name:"端午節",mark:"舟",state:"planned",description:"適合安康、節令與傳統文化主題，可用於親友和工作情境。"}
      ]},
      family:{title:"家庭與成長",mark:"家",description:"面向家人、孩子與成長節點的祝福主題。",theme:"陪伴 · 感謝 · 成長",audience:"家人、孩子、親密親友",guidance:"這組祝福更強調具體關係。生日關注個人節點，母親節和父親節突出感謝，兒童節偏向成長與快樂。",items:[
        {name:"生日",mark:"生",state:"birthday",description:"個人成長節點，適合家人、朋友、同事等不同關係。"},
        {name:"婦女節",mark:"她",state:"planned",description:"適合表達尊重、感謝與關懷，避免刻板化或過度標籤化文案。"},
        {name:"兒童節",mark:"童",state:"planned",description:"以快樂、好奇與成長為核心，適合孩子與家庭情境。"},
        {name:"母親節",mark:"母",state:"planned",description:"圍繞感謝、陪伴與關懷，適合更私人與具體的表達。"},
        {name:"父親節",mark:"父",state:"planned",description:"圍繞感謝、支持與陪伴，適合家庭和個人表達。"}
      ]},
      relationships:{title:"關係與表達",mark:"愛",description:"用於愛意、親密關係與輕鬆互動情境。",theme:"愛意 · 陪伴 · 趣味",audience:"伴侶、朋友、親密關係",guidance:"這組文案更依賴關係距離。七夕與情人節適合明確表達愛意，愚人節則應保持輕鬆並避免冒犯。",items:[
        {name:"七夕節",mark:"夕",state:"planned",description:"偏向含蓄、浪漫與陪伴感，適合伴侶與親密關係。"},
        {name:"情人節",mark:"愛",state:"planned",description:"適合直接表達愛意、感謝與關係紀念。"},
        {name:"愚人節",mark:"趣",state:"planned",description:"適合朋友間輕鬆互動，文案以有趣但不過界為原則。"}
      ]},
      society:{title:"社會與自然",mark:"地",description:"公共紀念、勞動、自然與節日問候。",theme:"公共 · 自然 · 致意",audience:"同事、朋友、社群",guidance:"這組適合較公開、簡潔的表達。植樹節與地球日偏自然主題，勞動節適合致意與假期問候，國慶節以節日與假期問候為主。",items:[
        {name:"植樹節",mark:"樹",state:"planned",description:"圍繞植樹、綠色與行動，可用於校園、團隊與公共情境。"},
        {name:"地球日",mark:"球",state:"planned",description:"圍繞環境、資源與生活方式，適合簡潔的自然主題表達。"},
        {name:"勞動節",mark:"勞",state:"planned",description:"適合勞動致意、休息與假期問候，可涵蓋同事與朋友。"},
        {name:"國慶節",mark:"國",state:"planned",description:"適合節日與假期問候，可用於朋友、同事與公開情境。"}
      ]}
    }
  },
  "en-us":{
    hubTitle:"Choose a wish category",hubLead:"Wish Center is now split into dedicated category pages. This hub only routes you to a category instead of stacking every occasion into one long page.",
    enter:"Open category",available:"Available",planned:"Planned",festivalCount:"occasions",availableCount:"available templates",
    festivalsTitle:"Occasions & context",festivalsLead:"Each occasion has its own guidance. Available templates can create share links immediately.",
    guideTitle:"Category guidance",audience:"Best for",theme:"Writing focus",builderTitle:"Create a wish link",builderLead:"Use the currently available template to add an optional name and create a share URL.",
    noBuilder:"No greeting template is live in this category yet. The occasion structure, context, and writing direction are ready for future pages.",
    categories:{
      "new-year":{title:"New Year & Reunion",mark:"NY",description:"Year-end, reunion, and traditional new-year greetings.",theme:"fresh starts · reunion · well-being",audience:"family, friends, colleagues",guidance:"Use this group for year-end and reunion occasions. Keep the wording tied to each festival instead of reusing one generic new-year message.",items:[
        {name:"New Year's Day",mark:"NY",state:"planned",description:"A concise first-day-of-the-year greeting for friends, colleagues, and public contexts."},
        {name:"Lunar New Year's Eve",mark:"E",state:"planned",description:"Reunion, family, and year-end wording for close relationships."},
        {name:"Spring Festival",mark:"春",state:"planned",description:"Traditional new-year greetings for family, elders, colleagues, and groups."},
        {name:"Lantern Festival",mark:"灯",state:"planned",description:"Reunion and lantern-festival greetings near the close of the Spring Festival period."},
        {name:"Mid-Autumn Festival",mark:"秋",state:"mid-autumn",description:"Moon, reunion, and long-distance greetings for family and friends."}
      ]},
      traditions:{title:"Traditions & Seasons",mark:"T",description:"Traditional and seasonal occasions with context-specific wording.",theme:"tradition · season · well-being",audience:"family, elders, acquaintances",guidance:"Let the occasion determine the tone. Qingming should stay restrained and reflective; Dragon Boat greetings can focus on well-being and seasonal tradition.",items:[
        {name:"Qingming Festival",mark:"Q",state:"planned",description:"Reflective and respectful wording; avoid overly celebratory language."},
        {name:"Dragon Boat Festival",mark:"D",state:"planned",description:"Well-being, season, and tradition for family, friends, and work contexts."}
      ]},
      family:{title:"Family & Growth",mark:"F",description:"Family, childhood, and personal milestones.",theme:"care · gratitude · growth",audience:"family, children, close friends",guidance:"Use relationship-specific wording. Birthday marks the individual; Mother's Day and Father's Day emphasize gratitude; Children's Day centers on joy and growth.",items:[
        {name:"Birthday",mark:"BD",state:"birthday",description:"A personal milestone that works across family, friendship, and workplace relationships."},
        {name:"Women's Day",mark:"W",state:"planned",description:"Respect, appreciation, and care without relying on stereotypes."},
        {name:"Children's Day",mark:"C",state:"planned",description:"Joy, curiosity, and growth for children and family contexts."},
        {name:"Mother's Day",mark:"M",state:"planned",description:"Gratitude, care, and personal appreciation."},
        {name:"Father's Day",mark:"F",state:"planned",description:"Gratitude, support, and companionship in family contexts."}
      ]},
      relationships:{title:"Relationships",mark:"R",description:"Affection, close relationships, and playful occasions.",theme:"affection · companionship · play",audience:"partners, friends, close relationships",guidance:"Relationship distance matters here. Qixi and Valentine's Day can be direct and affectionate; April Fools' Day should stay playful without crossing boundaries.",items:[
        {name:"Qixi Festival",mark:"Q",state:"planned",description:"Romantic, understated affection and companionship."},
        {name:"Valentine's Day",mark:"V",state:"planned",description:"Direct affection, gratitude, and relationship milestones."},
        {name:"April Fools' Day",mark:"!",state:"planned",description:"Playful messages for friends that remain considerate."}
      ]},
      society:{title:"Society & Nature",mark:"S",description:"Public observances, work, nature, and holiday greetings.",theme:"public · nature · appreciation",audience:"colleagues, friends, communities",guidance:"Keep this group concise and broadly usable. Arbor Day and Earth Day are nature-focused; Labour Day works for appreciation and holiday greetings; National Day is kept to general holiday greetings.",items:[
        {name:"Arbor Day",mark:"A",state:"planned",description:"Trees, greenery, and action for schools, teams, and public contexts."},
        {name:"Earth Day",mark:"E",state:"planned",description:"Environment, resources, and everyday sustainability."},
        {name:"Labour Day",mark:"L",state:"planned",description:"Appreciation, rest, and holiday greetings for colleagues and friends."},
        {name:"National Day",mark:"N",state:"planned",description:"General holiday greetings for friends, colleagues, and public contexts."}
      ]}
    }
  }
};
WISH_CATEGORY_COPY["en-gb"]=WISH_CATEGORY_COPY["en-us"]; WISH_CATEGORY_COPY["en-au"]=WISH_CATEGORY_COPY["en-us"];

const WISH_CATEGORY_ORDER=["new-year","traditions","family","relationships","society"];

function wishStyles(){
  return `<style>
    .wishes-view{display:grid;gap:16px;min-width:0}
    .wish-hub-intro,.wish-category-overview,.wish-festival-section,.wish-builder,.wish-empty-builder{border:1px solid color-mix(in srgb,var(--border) 82%,transparent);border-radius:22px;background:linear-gradient(160deg,color-mix(in srgb,#f5a623 3%,var(--card)),var(--card));box-shadow:inset 0 1px 0 color-mix(in srgb,#fff 16%,transparent),0 12px 34px rgba(0,0,0,.04)}
    .wish-hub-intro{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:22px;align-items:end;padding:24px}
    .wish-eyebrow{display:block;color:#f5a623;font-size:10px;font-weight:760;letter-spacing:.12em}
    .wish-hub-intro h2,.wish-category-overview h2{margin:6px 0 8px;font-size:clamp(26px,3vw,38px);line-height:1.03;letter-spacing:-.045em}
    .wish-hub-intro p,.wish-category-overview p{max-width:760px;margin:0;color:var(--muted);font-size:12px;line-height:1.6}
    .wish-hub-mark,.wish-category-mark{display:grid;place-items:center;width:68px;height:68px;border-radius:20px;background:color-mix(in srgb,#f5a623 12%,var(--fill));color:#f5a623;box-shadow:inset 0 0 0 1px color-mix(in srgb,#f5a623 20%,var(--border));font-size:19px;font-weight:760}
    .wish-hub-list{display:grid;gap:10px}
    .wish-category-link{position:relative;display:grid;grid-template-columns:50px minmax(0,1fr) auto;gap:14px;align-items:center;min-height:92px;padding:15px 17px;border:1px solid var(--border);border-radius:18px;background:var(--card);color:var(--text);text-decoration:none;transition:transform .16s ease,border-color .16s ease,background .16s ease,box-shadow .16s ease}
    .wish-category-link:hover{transform:translateY(-1px);border-color:color-mix(in srgb,#f5a623 30%,var(--border));background:color-mix(in srgb,#f5a623 3%,var(--card));box-shadow:0 10px 26px rgba(0,0,0,.045)}
    .wish-category-link-mark{display:grid;place-items:center;width:50px;height:50px;border-radius:15px;background:color-mix(in srgb,#f5a623 10%,var(--fill));color:#f5a623;font-size:14px;font-weight:760;box-shadow:inset 0 0 0 1px color-mix(in srgb,#f5a623 16%,var(--border))}
    .wish-category-link-copy{min-width:0}.wish-category-link-copy strong{display:block;font-size:16px;letter-spacing:-.025em}.wish-category-link-copy p{margin:5px 0 0;color:var(--muted);font-size:11px;line-height:1.45}
    .wish-category-link-meta{display:flex;align-items:center;gap:8px;color:var(--quiet);font-size:10px;white-space:nowrap}.wish-category-link-meta span{padding:5px 8px;border-radius:9px;background:var(--fill)}
    .wish-category-link::after{content:"›";color:var(--quiet);font-size:20px;margin-left:4px}
    .wish-category-overview{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:22px;padding:24px}
    .wish-category-facts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin-top:18px}.wish-category-fact{padding:11px 12px;border-radius:13px;background:var(--fill);box-shadow:inset 0 0 0 1px var(--border)}.wish-category-fact small,.wish-category-fact strong{display:block}.wish-category-fact small{color:var(--muted);font-size:9px}.wish-category-fact strong{margin-top:4px;font-size:11px;line-height:1.4}
    .wish-festival-section{padding:20px}.wish-section-head{display:flex;align-items:end;justify-content:space-between;gap:16px;margin-bottom:14px}.wish-section-head h3{margin:4px 0 0;font-size:20px;letter-spacing:-.035em}.wish-section-head p{max-width:640px;margin:5px 0 0;color:var(--muted);font-size:10.5px;line-height:1.5}
    .wish-festival-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-auto-rows:112px;gap:9px}
    .wish-festival-card{box-sizing:border-box;position:relative;display:grid;grid-template-columns:44px minmax(0,1fr) auto;gap:12px;align-items:center;width:100%;height:100%;min-width:0;margin:0!important;padding:13px 14px;border:1px solid var(--border);border-radius:15px;background:var(--fill);color:var(--text);text-align:left}
    button.wish-festival-card{appearance:none;font:inherit;cursor:pointer}.wish-festival-card.is-available{border-color:color-mix(in srgb,#f5a623 25%,var(--border));background:color-mix(in srgb,#f5a623 6%,var(--fill));transition:transform .15s ease,border-color .15s ease,background .15s ease}.wish-festival-card.is-available:hover{transform:translateY(-1px);border-color:color-mix(in srgb,#f5a623 46%,var(--border))}
    .wish-festival-card-mark{display:grid;place-items:center;width:44px;height:44px;border-radius:13px;background:var(--surface);color:#f5a623;font-size:13px;font-weight:760;box-shadow:inset 0 0 0 1px var(--border)}
    .wish-festival-card-copy{min-width:0}.wish-festival-card-copy strong{display:block;font-size:14px;letter-spacing:-.02em}.wish-festival-card-copy p{margin:5px 0 0;color:var(--muted);font-size:10px;line-height:1.45}.wish-festival-card-status{align-self:start;padding:5px 7px;border-radius:8px;background:var(--surface);color:var(--quiet);font-size:8.5px;font-weight:700}.wish-festival-card.is-available .wish-festival-card-status{color:#f5a623}
    .wish-builder{overflow:hidden}.wish-builder-head{padding:20px;border-bottom:1px solid var(--hairline);background:linear-gradient(180deg,color-mix(in srgb,#f5a623 3%,var(--card)),transparent)}.wish-builder-head h3{margin:4px 0 6px;font-size:20px;letter-spacing:-.03em}.wish-builder-head p{margin:0;color:var(--muted);font-size:10.5px;line-height:1.5}
    .wish-builder-section{padding:20px}.wish-builder-section+.wish-builder-section{border-top:1px solid var(--hairline)}.wish-builder-label{display:flex;align-items:center;gap:7px;margin-bottom:11px;color:var(--muted);font-size:11px;font-weight:650}.wish-builder-label span{padding:3px 6px;border-radius:999px;background:var(--fill);font-size:8.5px}
    .wish-builder-choice{display:grid!important;grid-template-columns:42px minmax(0,1fr)!important;gap:12px!important;align-items:center!important;width:100%!important;min-height:76px!important;margin:0!important;padding:12px!important;border:1px solid color-mix(in srgb,#f5a623 28%,var(--border))!important;border-radius:14px!important;background:color-mix(in srgb,#f5a623 6%,var(--surface))!important;color:var(--text)!important;text-align:left!important;box-shadow:none!important}.wish-builder-choice-mark{display:grid;place-items:center;width:42px;height:42px;border-radius:12px;background:var(--fill);color:#f5a623;font-size:12px;font-weight:760}.wish-builder-choice strong,.wish-builder-choice small{display:block}.wish-builder-choice strong{font-size:14px}.wish-builder-choice small{margin-top:4px;color:var(--muted);font-size:10px}
    .wish-builder-name{box-sizing:border-box;width:100%!important;height:46px!important;min-height:46px!important;margin:0!important;padding:0 13px!important;border:1px solid var(--border)!important;border-radius:13px!important;background:var(--surface)!important;color:var(--text)!important;box-shadow:none!important;outline:none!important}.wish-builder-name:focus{border-color:color-mix(in srgb,#f5a623 50%,var(--border))!important;box-shadow:0 0 0 4px color-mix(in srgb,#f5a623 9%,transparent)!important}
    .wish-builder-results{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.wish-builder-result{min-width:0;padding:12px;border-radius:13px;background:var(--fill);box-shadow:inset 0 0 0 1px var(--border)}.wish-builder-result small{display:block;margin-bottom:5px;color:var(--muted);font-size:9px}.wish-builder-result a{display:block;overflow:hidden;color:var(--text);font:600 11px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;text-decoration:none;text-overflow:ellipsis;white-space:nowrap}
    .wish-builder-actions{display:flex;gap:8px;margin-top:11px}.wish-builder-action{display:inline-flex!important;align-items:center;justify-content:center;width:auto!important;min-height:38px!important;margin:0!important;padding:0 13px!important;border:0!important;border-radius:11px!important;background:var(--fill)!important;color:var(--text)!important;text-decoration:none;font-size:11px!important;font-weight:700!important}.wish-builder-action.is-primary{background:#f5a623!important;color:#171106!important}.wish-builder-note{margin:10px 0 0;color:var(--muted);font-size:10px;line-height:1.5}.wish-builder-status{min-height:16px;margin-top:7px;color:var(--muted);font-size:10px}
    .wish-empty-builder{padding:18px 20px;color:var(--muted);font-size:11px;line-height:1.6}
    @media(max-width:860px){.wish-category-facts{grid-template-columns:1fr}.wish-festival-grid{grid-template-columns:1fr}.wish-hub-intro,.wish-category-overview{grid-template-columns:1fr}.wish-hub-mark,.wish-category-mark{width:58px;height:58px;border-radius:17px}.wish-category-link{grid-template-columns:46px minmax(0,1fr)}.wish-category-link-meta{grid-column:2}.wish-category-link::after{position:absolute;right:16px;top:50%;transform:translateY(-50%)}}
    @media(max-width:620px){.wish-hub-intro,.wish-category-overview,.wish-festival-section{padding:17px}.wish-category-link{padding:12px 14px}.wish-category-link-meta{display:none}.wish-builder-results{grid-template-columns:1fr}.wish-builder-actions{display:grid;grid-template-columns:1fr 1fr}.wish-builder-action{width:100%!important}}
  </style>`;
}

function wishBuilder(prefix,text,copy,availableKinds){
  if(!availableKinds.length) return `<div class="wish-empty-builder">${copy.noBuilder}</div>`;
  const kind=availableKinds[0];
  const label=kind==="birthday"?text.birthday:text.midAutumn;
  const note=kind==="birthday"?text.birthdayNote:text.midAutumnNote;
  const mark=kind==="birthday"?"生":"秋";
  return `
    <section class="wish-builder" id="wish-builder" data-wish-builder data-allowed-kinds="${availableKinds.join(",")}">
      <div class="wish-builder-head"><span class="wish-eyebrow">AERTEX WISH BUILDER</span><h3>${copy.builderTitle}</h3><p>${copy.builderLead}</p></div>
      <div class="wish-builder-section">
        <div class="wish-builder-choice"><span class="wish-builder-choice-mark">${mark}</span><span><strong>${label}</strong><small>${note}</small></span></div>
      </div>
      <div class="wish-builder-section">
        <div class="wish-builder-label">${text.recipient}<span>${text.optional}</span></div>
        <input id="wish-name" class="wish-builder-name" type="text" maxlength="36" autocomplete="off" placeholder="${text.placeholder}" aria-label="${text.recipient}">
      </div>
      <div class="wish-builder-section">
        <div class="wish-builder-results">
          <div class="wish-builder-result"><small>${text.share}</small><a id="share-link" href="${prefix}/wish/${kind}">${prefix}/wish/${kind}</a></div>
          <div class="wish-builder-result"><small>${text.destination}</small><a id="destination-link" href="${prefix}/${kind}">${prefix}/${kind}</a></div>
        </div>
        <div class="wish-builder-actions"><a id="open-link" class="wish-builder-action is-primary" href="${prefix}/wish/${kind}">${text.open}</a><button id="copy-link" class="wish-builder-action" type="button">${text.copy}</button></div>
        <p class="wish-builder-note">${text.note}</p><div id="copy-status" class="wish-builder-status" role="status" aria-live="polite"></div>
      </div>
    </section>`;
}

function wishClientScript(prefix,text,defaultKind,allowedKinds){
  if(!allowedKinds.length) return "";
  return `<script>
    (()=>{const root=document.querySelector("[data-wishes-category]");const builder=document.querySelector("[data-wish-builder]");if(!root||!builder)return;
    const prefix=${JSON.stringify(prefix)},allowed=${JSON.stringify(allowedKinds)},copyLabel=${JSON.stringify(text.copy)},copiedLabel=${JSON.stringify(text.copied)},failedLabel=${JSON.stringify(text.failed)};
    const nameInput=document.querySelector("#wish-name"),shareLink=document.querySelector("#share-link"),destinationLink=document.querySelector("#destination-link"),openLink=document.querySelector("#open-link"),copyButton=document.querySelector("#copy-link"),status=document.querySelector("#copy-status");
    let kind=allowed.includes(new URLSearchParams(location.search).get("type"))?new URLSearchParams(location.search).get("type"):${JSON.stringify(defaultKind)};
    const cleanName=value=>String(value||"").replace(/[\\u0000-\\u001f\\u007f]/g," ").replace(/\\s+/g," ").trim().slice(0,36);
    const paint=()=>{const name=cleanName(nameInput?.value),suffix=name?"?name="+encodeURIComponent(name):"",shortPath=prefix+"/wish/"+kind+suffix,targetPath=prefix+"/"+kind+suffix,shortUrl=location.origin+shortPath;
      shareLink.href=shortUrl;shareLink.textContent=shortPath;shareLink.title=shortUrl;destinationLink.href=location.origin+targetPath;destinationLink.textContent=targetPath;openLink.href=shortUrl;
      const state=new URLSearchParams();state.set("type",kind);if(name)state.set("name",name);history.replaceState(null,"",location.pathname+"?"+state.toString());
    };
    root.querySelectorAll("[data-template-kind]").forEach(button=>button.addEventListener("click",()=>{const next=button.dataset.templateKind;if(!allowed.includes(next))return;kind=next;status.textContent="";copyButton.textContent=copyLabel;paint();builder.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"})}));
    const initialName=cleanName(new URLSearchParams(location.search).get("name"));if(initialName&&nameInput)nameInput.value=initialName;nameInput?.addEventListener("input",()=>{status.textContent="";copyButton.textContent=copyLabel;paint()});
    copyButton?.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(shareLink.href);copyButton.textContent=copiedLabel;status.textContent=copiedLabel;setTimeout(()=>copyButton.textContent=copyLabel,1600)}catch{status.textContent=failedLabel}});
    paint();})();
  <\/script>`;
}

function wishesHub(prefix,copy){
  const cards=WISH_CATEGORY_ORDER.map(id=>{const category=copy.categories[id],available=category.items.filter(item=>item.state!=="planned").length;
    return `<a class="wish-category-link" href="${prefix}/wishes/${id}"><span class="wish-category-link-mark">${category.mark}</span><span class="wish-category-link-copy"><strong>${category.title}</strong><p>${category.description}</p></span><span class="wish-category-link-meta"><span>${category.items.length} ${copy.festivalCount}</span><span>${available} ${copy.availableCount}</span></span></a>`;
  }).join("");
  return `<section class="wishes-view" data-wishes-hub><div class="wish-hub-intro"><div><span class="wish-eyebrow">AERTEX · WISHES</span><h2>${copy.hubTitle}</h2><p>${copy.hubLead}</p></div><div class="wish-hub-mark" aria-hidden="true">祝</div></div><div class="wish-hub-list">${cards}</div></section>${wishStyles()}`;
}

function wishesCategory(prefix,text,copy,id){
  const category=copy.categories[id]; if(!category) return wishesHub(prefix,copy);
  const availableKinds=category.items.filter(item=>item.state!=="planned").map(item=>item.state);
  const cards=category.items.map(item=>{
    const available=item.state!=="planned";
    const inner=`<span class="wish-festival-card-mark">${item.mark}</span><span class="wish-festival-card-copy"><strong>${item.name}</strong><p>${item.description}</p></span><span class="wish-festival-card-status">${available?copy.available:copy.planned}</span>`;
    return available?`<button class="wish-festival-card is-available" type="button" data-template-kind="${item.state}">${inner}</button>`:`<article class="wish-festival-card is-planned">${inner}</article>`;
  }).join("");
  return `
    <section class="wishes-view" data-wishes-category="${id}">
      <section class="wish-category-overview">
        <div><span class="wish-eyebrow">AERTEX · WISHES · ${category.title}</span><h2>${category.title}</h2><p>${category.guidance}</p>
          <div class="wish-category-facts">
            <div class="wish-category-fact"><small>${copy.theme}</small><strong>${category.theme}</strong></div>
            <div class="wish-category-fact"><small>${copy.audience}</small><strong>${category.audience}</strong></div>
            <div class="wish-category-fact"><small>${copy.festivalsTitle}</small><strong>${category.items.length} ${copy.festivalCount}</strong></div>
          </div>
        </div><div class="wish-category-mark" aria-hidden="true">${category.mark}</div>
      </section>
      <section class="wish-festival-section"><div class="wish-section-head"><div><span class="wish-eyebrow">${copy.guideTitle}</span><h3>${copy.festivalsTitle}</h3><p>${copy.festivalsLead}</p></div></div><div class="wish-festival-grid">${cards}</div></section>
      ${wishBuilder(prefix,text,copy,availableKinds)}
    </section>
    ${wishStyles()}
    ${wishClientScript(prefix,text,availableKinds[0]||"",availableKinds)}
  `;
}

export function wishesContent(path = "/wishes", locale = "en-us") {
  if (!String(path).startsWith("/wishes")) { locale=path || "en-us"; path="/wishes"; }
  const code=normalizeSupportedLocale(locale)||(locale==="zh"?"zh-cn":"en-us");
  const prefix="/"+code;
  const text=WISHES_COPY[code]||WISHES_COPY["en-us"];
  const copy=WISH_CATEGORY_COPY[code]||WISH_CATEGORY_COPY["en-us"];
  const id=String(path).replace(/^\/wishes\/?/,"").split("/")[0];
  return id?wishesCategory(prefix,text,copy,id):wishesHub(prefix,copy);
}
