// 初学者导读：学习/研究类知识内容数据源；保持声明式内容结构，渲染与搜索由独立模块处理。
export const STUDY_KNOWLEDGE = {
  statistics: {
    zh: {
      summary: "统计学公式页用于集中保存描述统计、抽样分布、估计、检验、回归与方差分析中的核心公式，并标注适用条件。",
      sections: [
        { title: "描述统计", code: "样本均值: x̄ = (1/n) Σxᵢ\n样本方差: s² = [1/(n-1)] Σ(xᵢ-x̄)²\n样本标准差: s = √s²\n变异系数: CV = s/x̄" },
        { title: "区间估计", bullets: ["总体方差已知的均值区间使用标准正态分位数。", "总体方差未知且总体近似正态时，使用 t 分布。", "比例区间要检查 np 与 n(1-p) 是否足够大，不能机械套正态近似。"] },
        { title: "假设检验", bullets: ["先写 H0/H1，再确定统计量与拒绝域。", "p-value 是在 H0 成立条件下得到当前或更极端样本的概率，不是 H0 为真的概率。", "第一类错误 α：错拒真 H0；第二类错误 β：未拒绝假 H0。"] },
        { title: "回归", code: "简单线性回归: y = β₀ + β₁x + ε\nR² = 1 - SSE/SST\n残差 eᵢ = yᵢ - ŷᵢ" }
      ]
    },
    en: {
      summary: "Core formulas for descriptive statistics, estimation, testing, regression, and ANOVA, with attention to assumptions.",
      sections: [
        { title: "Descriptive statistics", code: "x̄=(1/n)Σxᵢ\ns²=[1/(n-1)]Σ(xᵢ-x̄)²\nCV=s/x̄" },
        { title: "Inference", bullets: ["Choose z or t procedures based on assumptions.", "Interpret p-values conditionally on H0.", "Track Type I and Type II errors."] },
        { title: "Regression", code: "y=β₀+β₁x+ε\nR²=1-SSE/SST" }
      ]
    }
  },
  probability: {
    zh: {
      summary: "概率论页重点保存事件运算、条件概率、全概率、贝叶斯、随机变量分布、期望方差与常用极限定理。",
      sections: [
        { title: "事件与概率", code: "P(Aᶜ)=1-P(A)\nP(A∪B)=P(A)+P(B)-P(A∩B)\n若 A,B 独立: P(A∩B)=P(A)P(B)" },
        { title: "条件概率与贝叶斯", code: "P(A|B)=P(A∩B)/P(B)\nP(B)=Σ P(B|Aᵢ)P(Aᵢ)\nP(Aᵢ|B)=P(B|Aᵢ)P(Aᵢ)/P(B)" },
        { title: "随机变量", bullets: ["离散型用 PMF，连续型用 PDF；连续变量单点概率为 0。", "分布函数 F(x)=P(X≤x) 对所有随机变量都适用。", "E(aX+b)=aE(X)+b；Var(aX+b)=a²Var(X)。"] },
        { title: "常见分布", bullets: ["二项分布：固定 n 次独立 Bernoulli。", "泊松分布：一定时间/区域内稀有事件计数。", "正态分布：大量统计推断和近似的核心分布。", "指数分布：泊松过程相邻事件等待时间。"] }
      ]
    },
    en: {
      summary: "Probability rules, conditioning, Bayes, random variables, expectation/variance, and common distributions.",
      sections: [
        { title: "Rules", code: "P(Aᶜ)=1-P(A)\nP(A∪B)=P(A)+P(B)-P(A∩B)" },
        { title: "Bayes", code: "P(A|B)=P(A∩B)/P(B)\nP(Aᵢ|B)=P(B|Aᵢ)P(Aᵢ)/P(B)" },
        { title: "Random variables", bullets: ["PMF for discrete variables, PDF for continuous variables.", "E(aX+b)=aE(X)+b.", "Var(aX+b)=a²Var(X)."] }
      ]
    }
  },
  calculus: {
    zh: {
      summary: "高数页作为微积分、偏导、多元函数、积分与级数的快速复习入口，重点保留推导时最容易混淆的符号和条件。",
      sections: [
        { title: "导数", code: "(xⁿ)' = nxⁿ⁻¹\n(eˣ)'=eˣ\n(ln x)'=1/x\n(sin x)'=cos x\n(cos x)'=-sin x" },
        { title: "链式与隐函数", bullets: ["复合函数逐层求导：dy/dx=(dy/du)(du/dx)。", "隐函数先对等式两侧对 x 求导，再整理 y'。", "多元链式法则注意每条依赖路径都要计入。"] },
        { title: "偏导与全微分", code: "z=f(x,y)\n∂z/∂x: 把 y 当常数\n∂z/∂y: 把 x 当常数\ndz = fₓ dx + fᵧ dy" },
        { title: "积分", bullets: ["不定积分结果要加常数 C。", "定积分换元时上下限也要变，或最后换回原变量。", "分部积分：∫u dv = uv - ∫v du。"] }
      ]
    },
    en: {
      summary: "A quick calculus reference covering derivatives, partial derivatives, multivariable rules, and integration.",
      sections: [
        { title: "Derivatives", code: "(xⁿ)'=nxⁿ⁻¹\n(eˣ)'=eˣ\n(ln x)'=1/x" },
        { title: "Partial derivatives", code: "dz=fₓdx+fᵧdy" },
        { title: "Integration", bullets: ["Add C for indefinite integrals.", "Transform limits during substitution.", "Use ∫u dv = uv - ∫v du for integration by parts."] }
      ]
    }
  },
  "python-labs": {
    zh: {
      summary: "Python 上机页用于整理课堂常见题型：输入输出、分支、循环、列表、函数、随机数、文件和简单数据处理。",
      sections: [
        { title: "输入与类型", code: "name = input('name: ')\nage = int(input('age: '))\nscore = float(input('score: '))" },
        { title: "循环与控制", code: "total = 0\nfor n in range(1, 101):\n    if n % 3 != 0:\n        continue\n    total += n" },
        { title: "随机数", code: "import random\nanswer = random.randint(1, 100)\nfor attempt in range(1, 6):\n    guess = int(input('guess: '))\n    if guess == answer:\n        print('正确', attempt)\n        break\nelse:\n    print('游戏结束')" },
        { title: "上机检查", bullets: ["确认 range 右端点是否包含。", "输入转 int/float 后再计算。", "break 和 continue 的作用层级要看清。", "for...else 的 else 在循环未被 break 时执行。", "测试边界：最小值、最大值、空输入、恰好第 5 次猜中等。"] }
      ]
    },
    en: {
      summary: "Common Python lab patterns: input/output, branching, loops, lists, functions, randomness, and basic data processing.",
      sections: [
        { title: "Types", code: "age=int(input())\nscore=float(input())" },
        { title: "Loops", code: "for n in range(1,101):\n    if n%3!=0: continue" },
        { title: "Checks", bullets: ["Remember range excludes the stop value.", "Test boundaries and loop termination."] }
      ]
    }
  },
  excel: {
    zh: {
      summary: "Excel 页保存课程和日常统计处理中高频公式、数据验证、条件统计与查找思路。",
      sections: [
        { title: "常用公式", code: "=SUM(B2:B20)\n=AVERAGE(B2:B20)\n=MAX(B2:B20)\n=MIN(B2:B20)\n=COUNT(B2:B20)\n=COUNTA(A2:A20)" },
        { title: "条件统计", code: "=COUNTIF(C:C,\">=60\")\n=COUNTIFS(B:B,\"一班\",C:C,\">=60\")\n=SUMIF(A:A,\"苹果\",B:B)\n=AVERAGEIF(B:B,\"一班\",C:C)" },
        { title: "逻辑与查找", code: "=IF(C2>=60,\"及格\",\"不及格\")\n=XLOOKUP(A2,Sheet2!A:A,Sheet2!B:B,\"未找到\")\n=IFERROR(formula,\"\")" },
        { title: "成绩表注意", bullets: ["缓考/缺考等文本不要强行参与平均分。", "引用范围固定时使用 $。", "图表数据源先处理空值和文本状态。", "难度系数、及格率等指标要先确认老师使用的定义。"] }
      ]
    },
    en: {
      summary: "Frequently used Excel formulas for coursework and statistical summaries.",
      sections: [
        { title: "Core", code: "=SUM(B2:B20)\n=AVERAGE(B2:B20)\n=COUNTIF(C:C,\">=60\")" },
        { title: "Logic", code: "=IF(C2>=60,\"Pass\",\"Fail\")\n=XLOOKUP(A2,Sheet2!A:A,Sheet2!B:B,\"Not found\")" },
        { title: "Data quality", bullets: ["Do not coerce absence/deferred-exam text into numeric averages.", "Validate metric definitions before calculating them."] }
      ]
    }
  },
  "course-summaries": {
    zh: {
      summary: "课程总结不是抄教材目录，而是把一门课压缩成“概念主线 + 高频公式 + 典型题型 + 易错点 + 复习顺序”。",
      sections: [
        { title: "建议模板", bullets: ["课程目标：这门课解决什么问题。", "章节主线：概念之间怎么依赖。", "公式表：写适用条件，不只写公式。", "题型表：看到什么关键词想到什么方法。", "易错点：记录自己真实犯过的错误。", "期末前：按重要性和掌握程度排复习顺序。"] },
        { title: "一页压缩法", paragraphs: ["每章最后尝试压缩成一张 A4：左侧概念，右侧公式，下方典型题。如果压不下，说明还没有抓住结构。"] },
        { title: "更新规则", bullets: ["上完一章后补第一次。", "作业/上机暴露错误后补第二次。", "考前只更新高频错误，不重新抄完整笔记。"] }
      ]
    },
    en: {
      summary: "A course summary should compress the subject into concept flow, formulas with conditions, problem types, mistakes, and a review order.",
      sections: [
        { title: "Template", bullets: ["Purpose", "Concept dependency map", "Formula sheet with assumptions", "Problem-type triggers", "Personal mistakes", "Review priority"] },
        { title: "One-page compression", paragraphs: ["If a chapter cannot be summarized on one page, its structure may not yet be clear."] }
      ]
    }
  },
  "exam-mistakes": {
    zh: {
      summary: "考试易错点要记录“错误模式”，而不是只保存某一道题答案。这样换一道题仍然能识别同类陷阱。",
      sections: [
        { title: "记录格式", code: "错误类型：条件漏看 / 符号 / 公式条件 / 计算 / 概念\n触发关键词：……\n当时为什么错：……\n正确判断规则：……\n下一次检查动作：……" },
        { title: "高频模式", bullets: ["补集与并集混淆。", "条件概率分母选错。", "奇偶项符号交替写反。", "求偏导时没有把其他变量当常数。", "Excel 文本状态参与数值统计。", "Python range 上界少 1 或多 1。"] },
        { title: "复盘", paragraphs: ["每次测验后不要只统计分数，至少挑 3 个最值得避免的错误模式写入这里。重复出现两次的错误应该升级成个人检查清单。"] }
      ]
    },
    en: {
      summary: "Record error patterns, not just individual answers, so the same trap can be recognized in new questions.",
      sections: [
        { title: "Template", code: "type / trigger / why wrong / correct rule / next check" },
        { title: "Patterns", bullets: ["Complement vs union confusion.", "Wrong denominator in conditional probability.", "Sign errors in alternating terms.", "Range endpoint mistakes in Python."] }
      ]
    }
  },
  "worked-examples": {
    zh: {
      summary: "例题页保存自己真正理解过的代表题。每题至少包含题目、识别线索、方法、完整步骤、检查和可迁移结论。",
      sections: [
        { title: "概率例题模板", code: "题目：已知事件条件，求目标概率\n1. 定义事件\n2. 判断是否条件概率/全概率/贝叶斯\n3. 写公式再代数值\n4. 检查结果是否在 [0,1]\n5. 总结：下一次看到什么关键词直接想到该方法" },
        { title: "统计例题模板", bullets: ["先写总体/样本与参数。", "判断单样本、双样本、比例、方差还是回归问题。", "检查独立性、正态性/大样本等条件。", "写统计量和分布，再计算结论。"] },
        { title: "编程例题模板", bullets: ["输入是什么。", "输出是什么。", "核心状态变量是什么。", "循环何时停止。", "边界怎么测。", "把运行结果截图/样例与代码一起保留。"] }
      ]
    },
    en: {
      summary: "Keep representative problems you truly understand. Each example should include cues, method, steps, checks, and a transferable rule.",
      sections: [
        { title: "Math template", bullets: ["Define variables/events.", "Identify the theorem or model.", "Write the formula before substitution.", "Check the numerical range and units."] },
        { title: "Programming template", bullets: ["Inputs", "Outputs", "State", "Termination", "Boundary tests"] }
      ]
    }
  }
};
