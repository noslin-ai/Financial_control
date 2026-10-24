(() => {
  "use strict";

  const STORAGE_KEY = "caizhi-mvp-state-v1";
  const ROUTES = {
    dashboard: { eyebrow: "个人财务中心", title: "财务总览" },
    accounts: { eyebrow: "资产与负债", title: "账户资产" },
    transactions: { eyebrow: "本月现金流", title: "收支账单" },
    budgets: { eyebrow: "消费计划", title: "月度预算" },
    investments: { eyebrow: "持仓与收益", title: "投资组合" },
    goals: { eyebrow: "为未来做准备", title: "财务目标" },
    settings: { eyebrow: "隐私与偏好", title: "数据与设置" },
  };

  const CATEGORY_META = {
    工资: { icon: "wallet", color: "#277354", soft: "#e4f1e9" },
    奖金: { icon: "trend", color: "#277354", soft: "#e4f1e9" },
    理财收益: { icon: "trend", color: "#6d55b0", soft: "#f0ebfb" },
    餐饮: { icon: "receipt", color: "#d5654f", soft: "#fff0eb" },
    居住: { icon: "bank", color: "#6c91d8", soft: "#eaf0fc" },
    交通: { icon: "card", color: "#e0a442", soft: "#fff5df" },
    购物: { icon: "cash", color: "#9273ce", soft: "#f0ebfb" },
    娱乐: { icon: "target", color: "#dc785f", soft: "#fff0eb" },
    医疗: { icon: "shield", color: "#4f8aa3", soft: "#e8f4f8" },
    教育: { icon: "receipt", color: "#5879bf", soft: "#eaf0fc" },
    其他: { icon: "more", color: "#78847d", soft: "#eef0ed" },
    转账: { icon: "arrow-right", color: "#78847d", soft: "#eef0ed" },
  };

  const ACCOUNT_META = {
    checking: { label: "银行卡", icon: "bank" },
    savings: { label: "储蓄账户", icon: "cash" },
    cash: { label: "现金账户", icon: "wallet" },
    credit: { label: "信用账户", icon: "card" },
    investment: { label: "投资账户", icon: "trend" },
    other: { label: "其他账户", icon: "wallet" },
  };

  const COLORS = ["#23684c", "#6c91d8", "#e7ad52", "#9378d1", "#ef8b72", "#4f8aa3"];
  const ui = { transactionFilter: "all", transactionSearch: "", trendRange: 6 };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const icon = (name) => `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const uid = (prefix) => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const sum = (items) => items.reduce((total, value) => total + Number(value || 0), 0);
  const round = (value, digits = 2) => Number(Number(value).toFixed(digits));

  function escapeHTML(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function toISODate(date) {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  function daysAgo(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return toISODate(date);
  }

  function monthsAhead(months, day = 1) {
    const date = new Date();
    date.setMonth(date.getMonth() + months, day);
    return toISODate(date);
  }

  function createDefaultState() {
    return {
      version: 1,
      profile: { name: "林晓", currency: "CNY" },
      accounts: [
        { id: "acc_cmb", name: "招商银行", type: "checking", balance: 45280, color: "#23684c" },
        { id: "acc_alipay", name: "支付宝", type: "cash", balance: 8360, color: "#6c91d8" },
        { id: "acc_emergency", name: "应急储备", type: "savings", balance: 60000, color: "#e7ad52" },
        { id: "acc_broker", name: "证券账户现金", type: "investment", balance: 12600, color: "#9378d1" },
        { id: "acc_credit", name: "信用卡", type: "credit", balance: -3280, color: "#ef8b72" },
      ],
      transactions: [
        { id: "tx_salary", type: "income", accountId: "acc_cmb", category: "工资", amount: 22000, date: daysAgo(18), note: "本月工资" },
        { id: "tx_rent", type: "expense", accountId: "acc_cmb", category: "居住", amount: 5200, date: daysAgo(17), note: "房租" },
        { id: "tx_market", type: "expense", accountId: "acc_alipay", category: "餐饮", amount: 286, date: daysAgo(2), note: "周末采购" },
        { id: "tx_coffee", type: "expense", accountId: "acc_alipay", category: "餐饮", amount: 36, date: daysAgo(1), note: "咖啡" },
        { id: "tx_subway", type: "expense", accountId: "acc_alipay", category: "交通", amount: 120, date: daysAgo(4), note: "交通卡充值" },
        { id: "tx_book", type: "expense", accountId: "acc_credit", category: "教育", amount: 168, date: daysAgo(5), note: "专业书籍" },
        { id: "tx_movie", type: "expense", accountId: "acc_credit", category: "娱乐", amount: 96, date: daysAgo(6), note: "周末电影" },
        { id: "tx_clothes", type: "expense", accountId: "acc_credit", category: "购物", amount: 860, date: daysAgo(8), note: "换季服饰" },
        { id: "tx_interest", type: "income", accountId: "acc_emergency", category: "理财收益", amount: 386, date: daysAgo(10), note: "存款利息" },
        { id: "tx_transfer", type: "transfer", accountId: "acc_cmb", toAccountId: "acc_broker", category: "转账", amount: 5000, date: daysAgo(12), note: "转入证券账户" },
      ],
      budgets: [
        { category: "餐饮", limit: 3000, color: "#ef8b72" },
        { category: "居住", limit: 5500, color: "#6c91d8" },
        { category: "交通", limit: 1200, color: "#e7ad52" },
        { category: "购物", limit: 2500, color: "#9378d1" },
        { category: "娱乐", limit: 1500, color: "#4f8aa3" },
        { category: "教育", limit: 1200, color: "#23684c" },
      ],
      holdings: [
        { id: "hold_300", name: "沪深300ETF", symbol: "510300", type: "指数基金", units: 8500, cost: 3.72, price: 4.06, color: "#23684c" },
        { id: "hold_bond", name: "中短债基金", symbol: "债券基金", type: "债券基金", units: 30000, cost: 1.02, price: 1.061, color: "#6c91d8" },
        { id: "hold_gold", name: "黄金ETF", symbol: "518880", type: "商品基金", units: 4200, cost: 4.65, price: 5.08, color: "#e7ad52" },
        { id: "hold_stock", name: "价值精选组合", symbol: "自建组合", type: "股票", units: 1, cost: 28600, price: 30280, color: "#9378d1" },
      ],
      goals: [
        { id: "goal_emergency", name: "12个月应急储备", target: 90000, current: 60000, deadline: monthsAhead(8), color: "#23684c", icon: "shield" },
        { id: "goal_trip", name: "新西兰旅行", target: 30000, current: 18600, deadline: monthsAhead(6), color: "#6c91d8", icon: "target" },
        { id: "goal_home", name: "购房首付", target: 600000, current: 168000, deadline: monthsAhead(36), color: "#e7ad52", icon: "bank" },
      ],
      settings: { theme: "light" },
    };
  }

  function normalizeState(input) {
    const fallback = createDefaultState();
    if (!input || typeof input !== "object") return fallback;
    return {
      version: 1,
      profile: { ...fallback.profile, ...(input.profile || {}) },
      accounts: Array.isArray(input.accounts) ? input.accounts : fallback.accounts,
      transactions: Array.isArray(input.transactions) ? input.transactions : fallback.transactions,
      budgets: Array.isArray(input.budgets) ? input.budgets : fallback.budgets,
      holdings: Array.isArray(input.holdings) ? input.holdings : fallback.holdings,
      goals: Array.isArray(input.goals) ? input.goals : fallback.goals,
      settings: { ...fallback.settings, ...(input.settings || {}) },
    };
  }

  function loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? normalizeState(JSON.parse(stored)) : createDefaultState();
    } catch (error) {
      console.warn("无法读取本地数据，已加载演示状态。", error);
      return createDefaultState();
    }
  }

  let state = loadState();

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    renderSideInsight();
  }

  function money(value, compact = false) {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: state.profile.currency || "CNY",
      notation: compact ? "compact" : "standard",
      maximumFractionDigits: compact ? 1 : 0,
    }).format(Number(value || 0));
  }

  function number(value, digits = 2) {
    return new Intl.NumberFormat("zh-CN", { maximumFractionDigits: digits }).format(Number(value || 0));
  }

  function price(value) {
    return `¥${new Intl.NumberFormat("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(Number(value || 0))}`;
  }

  function formatDate(value, short = false) {
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("zh-CN", short
      ? { month: "short", day: "numeric" }
      : { year: "numeric", month: "short", day: "numeric" }).format(date);
  }

  function monthKey(value) {
    const date = value ? new Date(`${value}T00:00:00`) : new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }

  function currentMonthTransactions() {
    const key = monthKey();
    return state.transactions.filter((transaction) => monthKey(transaction.date) === key);
  }

  function accountById(id) {
    return state.accounts.find((account) => account.id === id);
  }

  function getMetrics() {
    const investmentValue = sum(state.holdings.map((holding) => holding.units * holding.price));
    const investmentCost = sum(state.holdings.map((holding) => holding.units * holding.cost));
    const accountAssets = sum(state.accounts.filter((account) => account.balance > 0).map((account) => account.balance));
    const liabilities = Math.abs(sum(state.accounts.filter((account) => account.balance < 0).map((account) => account.balance)));
    const assets = accountAssets + investmentValue;
    const netWorth = assets - liabilities;
    const monthly = currentMonthTransactions();
    const income = sum(monthly.filter((item) => item.type === "income").map((item) => item.amount));
    const expense = sum(monthly.filter((item) => item.type === "expense").map((item) => item.amount));
    const balance = income - expense;
    const savingsRate = income > 0 ? (balance / income) * 100 : 0;
    return { investmentValue, investmentCost, accountAssets, liabilities, assets, netWorth, income, expense, balance, savingsRate };
  }

  function spentForCategory(category) {
    return sum(currentMonthTransactions()
      .filter((item) => item.type === "expense" && item.category === category)
      .map((item) => item.amount));
  }

  function budgetMetrics() {
    const total = sum(state.budgets.map((budget) => budget.limit));
    const spent = sum(state.budgets.map((budget) => spentForCategory(budget.category)));
    return { total, spent, percent: total > 0 ? (spent / total) * 100 : 0 };
  }

  function healthScore() {
    const metrics = getMetrics();
    const budget = budgetMetrics();
    const monthlyCoreExpense = Math.max(metrics.expense, 8000);
    const emergency = state.accounts.find((account) => account.type === "savings")?.balance || 0;
    const emergencyMonths = emergency / monthlyCoreExpense;
    const debtRatio = metrics.assets > 0 ? metrics.liabilities / metrics.assets : 1;
    const largestHolding = metrics.investmentValue > 0
      ? Math.max(0, ...state.holdings.map((holding) => holding.units * holding.price)) / metrics.investmentValue
      : 1;
    let score = 20;
    score += clamp(metrics.savingsRate, 0, 30) / 30 * 22;
    score += clamp(emergencyMonths, 0, 6) / 6 * 22;
    score += (1 - clamp(debtRatio / 0.5, 0, 1)) * 16;
    score += (1 - clamp(budget.percent > 100 ? 1 : budget.percent / 150, 0, 1)) * 10;
    score += (1 - clamp((largestHolding - 0.25) / 0.75, 0, 1)) * 10;
    return Math.round(clamp(score, 0, 100));
  }

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 6) return "夜深了";
    if (hour < 11) return "早上好";
    if (hour < 14) return "中午好";
    if (hour < 18) return "下午好";
    return "晚上好";
  }

  function currentRoute() {
    const route = location.hash.replace(/^#\/?/, "");
    return ROUTES[route] ? route : "dashboard";
  }

  function navigate(route) {
    if (!ROUTES[route]) route = "dashboard";
    if (currentRoute() === route) {
      renderApp();
      return;
    }
    location.hash = route;
  }

  function setPageHeader(route) {
    const meta = ROUTES[route];
    $("#page-eyebrow").textContent = meta.eyebrow;
    $("#page-title").textContent = route === "dashboard"
      ? `${getGreeting()}，${state.profile.name}`
      : meta.title;
    $$(".nav-item").forEach((item) => item.classList.toggle("is-active", item.dataset.route === route));
    document.title = `${meta.title} · 财智管家`;
  }

  function renderSideInsight() {
    const host = $("#side-insight");
    if (!host) return;
    const score = healthScore();
    const message = score >= 85 ? "财务状态稳健，继续保持当前节奏。" : score >= 70 ? "基础良好，可继续补足应急储备。" : "建议优先降低负债并控制预算。";
    host.innerHTML = `
      <div class="insight-score"><span>财务健康度</span><strong>${score}</strong></div>
      <div class="tiny-progress"><span style="width:${score}%"></span></div>
      <p>${message}</p>
    `;
  }

  function trendChart(values) {
    const width = 660;
    const height = 220;
    const padding = 16;
    const min = Math.min(...values) * 0.98;
    const max = Math.max(...values) * 1.02;
    const range = max - min || 1;
    const points = values.map((value, index) => {
      const x = padding + (index / Math.max(1, values.length - 1)) * (width - padding * 2);
      const y = height - padding - ((value - min) / range) * (height - padding * 2);
      return { x: round(x), y: round(y) };
    });
    const line = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");
    const area = `${line} L${points.at(-1).x},${height - padding} L${points[0].x},${height - padding} Z`;
    const grid = [0.25, 0.5, 0.75].map((ratio) => `<line class="grid-line" x1="${padding}" y1="${height * ratio}" x2="${width - padding}" y2="${height * ratio}"/>`).join("");
    const last = points.at(-1);
    return `
      <svg class="trend-chart" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img" aria-label="净资产趋势图">
        <defs><linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#398264" stop-opacity=".23"/><stop offset="1" stop-color="#398264" stop-opacity="0"/></linearGradient></defs>
        ${grid}<path class="trend-area" d="${area}"/><path class="trend-line" d="${line}"/>
        <circle class="trend-dot" cx="${last.x}" cy="${last.y}" r="5"/>
      </svg>
    `;
  }

  function accountIcon(account) {
    const meta = ACCOUNT_META[account.type] || ACCOUNT_META.other;
    return `<span class="account-icon" style="background:${account.color}1f;color:${account.color}">${icon(meta.icon)}</span>`;
  }

  function transactionIcon(transaction) {
    const meta = CATEGORY_META[transaction.category] || CATEGORY_META.其他;
    return `<span class="transaction-icon" style="background:${meta.soft};color:${meta.color}">${icon(meta.icon)}</span>`;
  }

  function transactionAmount(transaction) {
    if (transaction.type === "income") return `<span class="transaction-amount positive">+${money(transaction.amount)}</span>`;
    if (transaction.type === "expense") return `<span class="transaction-amount negative">−${money(transaction.amount)}</span>`;
    return `<span class="transaction-amount muted">${money(transaction.amount)}</span>`;
  }

  function recentTransactionRows(limit = 5) {
    const transactions = [...state.transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
    if (!transactions.length) return `<div class="empty-state"><div>${icon("receipt")}<h3>还没有账单</h3><p>记录第一笔收支后，现金流会显示在这里。</p><button class="primary-button" data-action="add-transaction">记一笔</button></div></div>`;
    return transactions.map((transaction) => {
      const account = accountById(transaction.accountId);
      return `
        <div class="transaction-row">
          ${transactionIcon(transaction)}
          <span class="transaction-copy"><strong>${escapeHTML(transaction.note || transaction.category)}</strong><span>${escapeHTML(transaction.category)} · ${formatDate(transaction.date, true)}</span></span>
          <span class="transaction-account">${escapeHTML(account?.name || "已删除账户")}</span>
          ${transactionAmount(transaction)}
        </div>`;
    }).join("");
  }

  function renderDashboard() {
    const metrics = getMetrics();
    const budget = budgetMetrics();
    const recentAccounts = [...state.accounts].sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance)).slice(0, 4);
    const baseFactors = ui.trendRange === 12
      ? [0.71, 0.73, 0.75, 0.74, 0.78, 0.79, 0.82, 0.84, 0.87, 0.89, 0.94, 1]
      : [0.82, 0.84, 0.87, 0.89, 0.94, 1];
    const trendValues = baseFactors.map((factor) => metrics.netWorth * factor);
    const monthLabels = ui.trendRange === 12
      ? ["11月", "12月", "1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "本月"]
      : ["5月", "6月", "7月", "8月", "9月", "本月"];
    const topBudgets = state.budgets.slice(0, 4);

    return `
      <div class="section-stack view-enter">
        <section class="hero-balance">
          <div class="hero-copy">
            <span>当前净资产</span>
            <div class="hero-amount">${money(metrics.netWorth)}</div>
            <div class="hero-meta"><span>本月净结余 <strong>${metrics.balance >= 0 ? "+" : ""}${money(metrics.balance)}</strong></span><span>数据更新于刚刚</span></div>
          </div>
          <div class="hero-side">
            <div class="hero-mini-row"><span>总资产</span><strong>${money(metrics.assets)}</strong></div>
            <div class="hero-mini-row"><span>总负债</span><strong>${money(metrics.liabilities)}</strong></div>
            <div class="hero-mini-row"><span>投资资产</span><strong>${money(metrics.investmentValue)}</strong></div>
          </div>
        </section>

        <section class="grid grid-4">
          <article class="card metric-card"><div class="metric-top"><span>本月收入</span><span class="metric-icon positive">${icon("arrow-down")}</span></div><div class="metric-value">${money(metrics.income)}</div><div class="metric-foot positive">稳定现金流</div></article>
          <article class="card metric-card"><div class="metric-top"><span>本月支出</span><span class="metric-icon negative">${icon("arrow-up")}</span></div><div class="metric-value">${money(metrics.expense)}</div><div class="metric-foot">占收入 ${metrics.income ? Math.round(metrics.expense / metrics.income * 100) : 0}%</div></article>
          <article class="card metric-card"><div class="metric-top"><span>结余率</span><span class="metric-icon positive">${icon("trend")}</span></div><div class="metric-value">${Math.round(metrics.savingsRate)}%</div><div class="metric-foot ${metrics.savingsRate >= 20 ? "positive" : "negative"}">${metrics.savingsRate >= 20 ? "高于建议基线" : "低于建议基线"}</div></article>
          <article class="card metric-card"><div class="metric-top"><span>待偿负债</span><span class="metric-icon">${icon("card")}</span></div><div class="metric-value">${money(metrics.liabilities)}</div><div class="metric-foot">记得按期还款</div></article>
        </section>

        <section class="grid grid-main">
          <article class="card card-pad">
            <div class="section-head"><div><h2>净资产趋势</h2><p>${ui.trendRange}个月资产变化</p></div><div class="segmented"><button data-range="6" class="${ui.trendRange === 6 ? "is-active" : ""}">6个月</button><button data-range="12" class="${ui.trendRange === 12 ? "is-active" : ""}">12个月</button></div></div>
            <div class="chart-wrap">${trendChart(trendValues)}<div class="chart-labels">${monthLabels.map((label) => `<span>${label}</span>`).join("")}</div></div>
          </article>
          <article class="card card-pad">
            <div class="section-head"><div><h2>预算进度</h2><p>本月分类预算</p></div><button class="ghost-button" data-route="budgets">详情${icon("arrow-right")}</button></div>
            <div class="budget-summary"><div class="ring" style="--progress:${Math.min(100, budget.percent)}"><div class="ring-copy"><strong>${Math.round(budget.percent)}%</strong><span>已使用</span></div></div></div>
            <div class="budget-legend">${topBudgets.map((item) => `<div class="budget-legend-row"><span><i class="dot" style="background:${item.color}"></i>${escapeHTML(item.category)}</span><strong>${money(spentForCategory(item.category))} / ${money(item.limit)}</strong></div>`).join("")}</div>
          </article>
        </section>

        <section class="grid grid-halves">
          <article class="card card-pad">
            <div class="section-head"><div><h2>我的账户</h2><p>${state.accounts.length} 个账户已纳入统计</p></div><button class="ghost-button" data-route="accounts">全部${icon("arrow-right")}</button></div>
            <div class="list-card">${recentAccounts.map((account) => `<div class="account-row">${accountIcon(account)}<span class="account-copy"><strong>${escapeHTML(account.name)}</strong><span>${ACCOUNT_META[account.type]?.label || "其他账户"}</span></span><span class="account-amount ${account.balance < 0 ? "negative" : ""}">${money(account.balance)}</span></div>`).join("")}</div>
          </article>
          <article class="card card-pad">
            <div class="section-head"><div><h2>最近账单</h2><p>最新的资金变动</p></div><button class="ghost-button" data-route="transactions">全部${icon("arrow-right")}</button></div>
            <div class="list-card">${recentTransactionRows(5)}</div>
          </article>
        </section>
      </div>`;
  }

  function allocationDonut(items, centerValue, centerLabel) {
    const total = sum(items.map((item) => Math.max(0, item.value)));
    let cursor = 0;
    const segments = items.map((item, index) => {
      const percent = total > 0 ? Math.max(0, item.value) / total * 100 : 0;
      const start = cursor;
      cursor += percent;
      return `${item.color || COLORS[index % COLORS.length]} ${start}% ${cursor}%`;
    }).join(", ");
    return `<div class="allocation-donut" style="background:conic-gradient(${segments || `${COLORS[0]} 0 100%`})"><div class="allocation-center"><strong>${centerValue}</strong><span>${centerLabel}</span></div></div>`;
  }

  function renderAccounts() {
    const metrics = getMetrics();
    const groups = [
      { label: "现金与活期", value: sum(state.accounts.filter((a) => ["checking", "cash"].includes(a.type) && a.balance > 0).map((a) => a.balance)), color: COLORS[0] },
      { label: "储蓄资金", value: sum(state.accounts.filter((a) => a.type === "savings" && a.balance > 0).map((a) => a.balance)), color: COLORS[2] },
      { label: "投资资产", value: metrics.investmentValue + sum(state.accounts.filter((a) => a.type === "investment" && a.balance > 0).map((a) => a.balance)), color: COLORS[3] },
      { label: "其他资产", value: sum(state.accounts.filter((a) => a.type === "other" && a.balance > 0).map((a) => a.balance)), color: COLORS[1] },
    ].filter((item) => item.value > 0);
    const total = sum(groups.map((group) => group.value));

    return `
      <div class="section-stack view-enter">
        <section class="page-intro"><div><h2>集中管理每一个账户</h2><p>手动维护账户余额，所有变动都会汇总到净资产。正式版可在用户授权后接入自动同步。</p></div><button class="primary-button" data-action="add-account">${icon("plus")}新增账户</button></section>
        <section class="grid grid-4">
          <article class="card metric-card"><div class="metric-top"><span>账户资产</span><span class="metric-icon positive">${icon("wallet")}</span></div><div class="metric-value">${money(metrics.accountAssets)}</div><div class="metric-foot">不含投资持仓</div></article>
          <article class="card metric-card"><div class="metric-top"><span>投资市值</span><span class="metric-icon positive">${icon("trend")}</span></div><div class="metric-value">${money(metrics.investmentValue)}</div><div class="metric-foot">${state.holdings.length} 项持仓</div></article>
          <article class="card metric-card"><div class="metric-top"><span>待偿负债</span><span class="metric-icon negative">${icon("card")}</span></div><div class="metric-value">${money(metrics.liabilities)}</div><div class="metric-foot">${state.accounts.filter((a) => a.balance < 0).length} 个负债账户</div></article>
          <article class="card metric-card"><div class="metric-top"><span>净资产</span><span class="metric-icon positive">${icon("shield")}</span></div><div class="metric-value">${money(metrics.netWorth)}</div><div class="metric-foot positive">已纳入全部账户</div></article>
        </section>
        <section class="grid grid-main">
          <article class="card card-pad"><div class="section-head"><div><h2>账户列表</h2><p>余额为负的账户计入负债</p></div></div><div class="account-grid">${state.accounts.map((account) => `<article class="card account-tile"><div class="account-tile-head">${accountIcon(account)}<span class="tag">${ACCOUNT_META[account.type]?.label || "其他账户"}</span></div><h3>${escapeHTML(account.name)}</h3><p>${account.balance < 0 ? "待还金额" : "可用余额"}</p><strong class="account-balance ${account.balance < 0 ? "negative" : ""}">${money(account.balance)}</strong></article>`).join("")}</div></article>
          <article class="card card-pad"><div class="section-head"><div><h2>资产分布</h2><p>按资产用途归类</p></div></div><div class="allocation-layout">${allocationDonut(groups, money(total, true), "总资产")}<div class="allocation-list">${groups.map((group) => `<div class="allocation-row"><span><i class="dot" style="background:${group.color}"></i>${group.label}</span><strong>${total ? Math.round(group.value / total * 100) : 0}%</strong></div>`).join("")}</div></div></article>
        </section>
      </div>`;
  }

  function filteredTransactions() {
    const search = ui.transactionSearch.trim().toLowerCase();
    return [...state.transactions]
      .filter((transaction) => ui.transactionFilter === "all" || transaction.type === ui.transactionFilter)
      .filter((transaction) => {
        if (!search) return true;
        const account = accountById(transaction.accountId);
        return [transaction.note, transaction.category, account?.name].some((value) => String(value || "").toLowerCase().includes(search));
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  function transactionTableRows() {
    const rows = filteredTransactions();
    if (!rows.length) return `<tr><td colspan="6"><div class="empty-state"><div>${icon("search")}<h3>没有找到相关账单</h3><p>试试切换筛选条件或搜索其他关键词。</p></div></div></td></tr>`;
    return rows.map((transaction) => {
      const account = accountById(transaction.accountId);
      const typeLabel = transaction.type === "income" ? "收入" : transaction.type === "expense" ? "支出" : "转账";
      return `<tr>
        <td>${formatDate(transaction.date)}</td>
        <td><div class="table-primary">${transactionIcon(transaction)}<span><strong>${escapeHTML(transaction.note || transaction.category)}</strong><small>${escapeHTML(transaction.category)}</small></span></div></td>
        <td>${escapeHTML(account?.name || "已删除账户")}</td>
        <td><span class="tag">${typeLabel}</span></td>
        <td>${transactionAmount(transaction)}</td>
        <td><button class="icon-button" data-action="delete-transaction" data-id="${transaction.id}" aria-label="删除账单">${icon("close")}</button></td>
      </tr>`;
    }).join("");
  }

  function updateTransactionTable() {
    const body = $("#transaction-table-body");
    const count = $("#transaction-count");
    if (body) body.innerHTML = transactionTableRows();
    if (count) count.textContent = `共 ${filteredTransactions().length} 笔`;
  }

  function renderTransactions() {
    const metrics = getMetrics();
    return `
      <div class="section-stack view-enter">
        <section class="page-intro"><div><h2>看懂每一笔资金流向</h2><p>收入、支出与转账使用不同口径；账户间转账只改变资金位置，不影响本月结余。</p></div><button class="primary-button" data-action="add-transaction">${icon("plus")}新增账单</button></section>
        <section class="grid grid-3">
          <article class="card metric-card"><div class="metric-top"><span>本月收入</span><span class="metric-icon positive">${icon("arrow-down")}</span></div><div class="metric-value positive">+${money(metrics.income)}</div><div class="metric-foot">不含账户间转账</div></article>
          <article class="card metric-card"><div class="metric-top"><span>本月支出</span><span class="metric-icon negative">${icon("arrow-up")}</span></div><div class="metric-value negative">−${money(metrics.expense)}</div><div class="metric-foot">已计入预算统计</div></article>
          <article class="card metric-card"><div class="metric-top"><span>本月结余</span><span class="metric-icon positive">${icon("wallet")}</span></div><div class="metric-value">${money(metrics.balance)}</div><div class="metric-foot ${metrics.balance >= 0 ? "positive" : "negative"}">${metrics.balance >= 0 ? "现金流为正" : "现金流需关注"}</div></article>
        </section>
        <section class="card">
          <div class="toolbar"><div class="search-box">${icon("search")}<input id="transaction-search" type="search" placeholder="搜索备注、分类或账户" value="${escapeHTML(ui.transactionSearch)}" /></div><div class="filter-chips"><button class="filter-chip ${ui.transactionFilter === "all" ? "is-active" : ""}" data-filter="all">全部</button><button class="filter-chip ${ui.transactionFilter === "income" ? "is-active" : ""}" data-filter="income">收入</button><button class="filter-chip ${ui.transactionFilter === "expense" ? "is-active" : ""}" data-filter="expense">支出</button><button class="filter-chip ${ui.transactionFilter === "transfer" ? "is-active" : ""}" data-filter="transfer">转账</button></div></div>
          <div class="table-wrap"><table class="data-table"><thead><tr><th>日期</th><th>账单</th><th>账户</th><th>类型</th><th>金额</th><th></th></tr></thead><tbody id="transaction-table-body">${transactionTableRows()}</tbody></table></div>
          <div class="toolbar"><span class="muted" id="transaction-count">共 ${filteredTransactions().length} 笔</span><button class="ghost-button" data-action="export-data">${icon("download")}导出全部数据</button></div>
        </section>
      </div>`;
  }

  function renderBudgets() {
    const metrics = budgetMetrics();
    const remaining = metrics.total - metrics.spent;
    const overspent = state.budgets.filter((budget) => spentForCategory(budget.category) > budget.limit).length;
    return `
      <div class="section-stack view-enter">
        <section class="page-intro"><div><h2>让每一笔支出都有计划</h2><p>预算不是限制生活，而是提前决定钱要流向哪里。分类支出会从账单自动汇总。</p></div></section>
        <section class="grid grid-3">
          <article class="card metric-card"><div class="metric-top"><span>本月总预算</span><span class="metric-icon">${icon("budget")}</span></div><div class="metric-value">${money(metrics.total)}</div><div class="metric-foot">${state.budgets.length} 个分类</div></article>
          <article class="card metric-card"><div class="metric-top"><span>已经使用</span><span class="metric-icon ${metrics.percent > 90 ? "negative" : "positive"}">${icon("receipt")}</span></div><div class="metric-value">${money(metrics.spent)}</div><div class="metric-foot">总预算的 ${Math.round(metrics.percent)}%</div></article>
          <article class="card metric-card"><div class="metric-top"><span>${remaining >= 0 ? "可用余额" : "超支金额"}</span><span class="metric-icon">${icon("wallet")}</span></div><div class="metric-value ${remaining < 0 ? "negative" : "positive"}">${money(Math.abs(remaining))}</div><div class="metric-foot">${overspent ? `${overspent} 个分类已超支` : "所有分类均在计划内"}</div></article>
        </section>
        <section class="budget-grid">${state.budgets.map((budget) => {
          const spent = spentForCategory(budget.category);
          const percent = budget.limit > 0 ? spent / budget.limit * 100 : 0;
          const status = percent >= 100 ? "is-danger" : percent >= 80 ? "is-warning" : "";
          return `<article class="card budget-card"><div class="budget-card-head"><div class="budget-category"><i class="dot" style="background:${budget.color}"></i>${escapeHTML(budget.category)}</div><button class="icon-button" data-action="edit-budget" data-category="${escapeHTML(budget.category)}" aria-label="调整${escapeHTML(budget.category)}预算">${icon("edit")}</button></div><div class="budget-numbers"><strong>${money(spent)}</strong><span>预算 ${money(budget.limit)}</span></div><div class="progress-track ${status}"><span style="width:${Math.min(100, percent)}%"></span></div><div class="budget-foot"><span>已使用 ${Math.round(percent)}%</span><span>${budget.limit - spent >= 0 ? `剩余 ${money(budget.limit - spent)}` : `超出 ${money(spent - budget.limit)}`}</span></div></article>`;
        }).join("")}</section>
        <section class="card health-banner"><div class="health-banner-copy"><span class="health-badge">${healthScore()}</span><div><h3>本月财务节奏${metrics.percent <= 85 ? "良好" : "需要关注"}</h3><p>${metrics.percent <= 85 ? `预算仍有 ${money(Math.max(0, remaining))} 可用，继续保持有意识的消费。` : "部分分类接近或超过预算，建议检查非必要支出。"}</p></div></div><button class="secondary-button" data-route="transactions">查看账单${icon("arrow-right")}</button></section>
      </div>`;
  }

  function renderInvestments() {
    const metrics = getMetrics();
    const gain = metrics.investmentValue - metrics.investmentCost;
    const gainRate = metrics.investmentCost > 0 ? gain / metrics.investmentCost * 100 : 0;
    const allocationMap = new Map();
    state.holdings.forEach((holding) => allocationMap.set(holding.type, (allocationMap.get(holding.type) || 0) + holding.units * holding.price));
    const allocation = [...allocationMap.entries()].map(([label, value], index) => ({ label, value, color: COLORS[index % COLORS.length] }));
    const largest = [...state.holdings].sort((a, b) => b.units * b.price - a.units * a.price)[0];
    const largestShare = largest && metrics.investmentValue ? largest.units * largest.price / metrics.investmentValue * 100 : 0;
    return `
      <div class="section-stack view-enter">
        <section class="page-intro"><div><h2>用组合视角理解投资</h2><p>当前价格和份额由用户手动维护，收益仅用于资产记录，不构成任何投资建议。</p></div><button class="primary-button" data-action="add-holding">${icon("plus")}添加持仓</button></section>
        <section class="grid grid-4">
          <article class="card metric-card"><div class="metric-top"><span>持仓市值</span><span class="metric-icon positive">${icon("trend")}</span></div><div class="metric-value">${money(metrics.investmentValue)}</div><div class="metric-foot">${state.holdings.length} 项持仓</div></article>
          <article class="card metric-card"><div class="metric-top"><span>持仓成本</span><span class="metric-icon">${icon("wallet")}</span></div><div class="metric-value">${money(metrics.investmentCost)}</div><div class="metric-foot">手动录入成本</div></article>
          <article class="card metric-card"><div class="metric-top"><span>浮动盈亏</span><span class="metric-icon ${gain >= 0 ? "positive" : "negative"}">${icon(gain >= 0 ? "arrow-up" : "arrow-down")}</span></div><div class="metric-value ${gain >= 0 ? "positive" : "negative"}">${gain >= 0 ? "+" : ""}${money(gain)}</div><div class="metric-foot">收益率 ${gainRate >= 0 ? "+" : ""}${gainRate.toFixed(1)}%</div></article>
          <article class="card metric-card"><div class="metric-top"><span>最大持仓占比</span><span class="metric-icon">${icon("budget")}</span></div><div class="metric-value">${Math.round(largestShare)}%</div><div class="metric-foot">${escapeHTML(largest?.name || "暂无持仓")}</div></article>
        </section>
        <section class="grid grid-main">
          <article class="card"><div class="card-pad"><div class="section-head"><div><h2>持仓明细</h2><p>价格更新后市值和收益自动计算</p></div></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>资产</th><th>类型</th><th>份额</th><th>成本价</th><th>当前价</th><th>市值</th><th>盈亏</th><th></th></tr></thead><tbody>${state.holdings.length ? state.holdings.map((holding) => {
            const value = holding.units * holding.price;
            const cost = holding.units * holding.cost;
            const holdingGain = value - cost;
            return `<tr><td><div class="holding-name"><strong>${escapeHTML(holding.name)}</strong><span>${escapeHTML(holding.symbol)}</span></div></td><td><span class="tag">${escapeHTML(holding.type)}</span></td><td>${number(holding.units)}</td><td>${price(holding.cost)}</td><td>${price(holding.price)}</td><td><strong>${money(value)}</strong></td><td class="${holdingGain >= 0 ? "positive" : "negative"}">${holdingGain >= 0 ? "+" : ""}${money(holdingGain)}</td><td><button class="icon-button" data-action="delete-holding" data-id="${holding.id}" aria-label="删除持仓">${icon("close")}</button></td></tr>`;
          }).join("") : `<tr><td colspan="8"><div class="empty-state"><div>${icon("trend")}<h3>还没有投资持仓</h3><p>添加第一项持仓来查看组合分析。</p><button class="primary-button" data-action="add-holding">添加持仓</button></div></div></td></tr>`}</tbody></table></div></article>
          <article class="card card-pad"><div class="section-head"><div><h2>资产配置</h2><p>按资产类型归类</p></div></div><div class="allocation-layout">${allocationDonut(allocation, money(metrics.investmentValue, true), "投资市值")}<div class="allocation-list">${allocation.map((item) => `<div class="allocation-row"><span><i class="dot" style="background:${item.color}"></i>${escapeHTML(item.label)}</span><strong>${metrics.investmentValue ? Math.round(item.value / metrics.investmentValue * 100) : 0}%</strong></div>`).join("") || "<span class='muted'>添加持仓后显示配置</span>"}</div></div></article>
        </section>
        <section class="card health-banner"><div class="health-banner-copy"><span class="health-badge">i</span><div><h3>投资数据说明</h3><p>当前版本不连接交易账户或实时行情；市值由“份额 × 当前价”计算，未计入交易费用与税费。</p></div></div></section>
      </div>`;
  }

  function monthsUntil(value) {
    const now = new Date();
    const target = new Date(`${value}T00:00:00`);
    return Math.max(1, Math.ceil((target - now) / (1000 * 60 * 60 * 24 * 30.44)));
  }

  function renderGoals() {
    const totalTarget = sum(state.goals.map((goal) => goal.target));
    const totalCurrent = sum(state.goals.map((goal) => goal.current));
    return `
      <div class="section-stack view-enter">
        <section class="page-intro"><div><h2>把长期愿望变成月度行动</h2><p>设置金额和日期后，系统会根据剩余时间估算每月需要投入的金额。</p></div><button class="primary-button" data-action="add-goal">${icon("plus")}新建目标</button></section>
        <section class="grid grid-3">
          <article class="card metric-card"><div class="metric-top"><span>目标总额</span><span class="metric-icon">${icon("target")}</span></div><div class="metric-value">${money(totalTarget)}</div><div class="metric-foot">${state.goals.length} 个进行中目标</div></article>
          <article class="card metric-card"><div class="metric-top"><span>已经积累</span><span class="metric-icon positive">${icon("shield")}</span></div><div class="metric-value">${money(totalCurrent)}</div><div class="metric-foot">整体完成 ${totalTarget ? Math.round(totalCurrent / totalTarget * 100) : 0}%</div></article>
          <article class="card metric-card"><div class="metric-top"><span>尚需积累</span><span class="metric-icon">${icon("wallet")}</span></div><div class="metric-value">${money(Math.max(0, totalTarget - totalCurrent))}</div><div class="metric-foot">按优先级逐步推进</div></article>
        </section>
        <section class="goal-grid">${state.goals.length ? state.goals.map((goal) => {
          const percent = goal.target > 0 ? goal.current / goal.target * 100 : 0;
          const months = monthsUntil(goal.deadline);
          const monthly = Math.max(0, goal.target - goal.current) / months;
          return `<article class="card goal-card"><div class="goal-head"><div class="goal-title"><span class="goal-icon" style="background:${goal.color}1f;color:${goal.color}">${icon(goal.icon || "target")}</span><div><h3>${escapeHTML(goal.name)}</h3><span>${formatDate(goal.deadline)} 前完成</span></div></div><button class="icon-button" data-action="edit-goal" data-id="${goal.id}" aria-label="编辑目标">${icon("edit")}</button></div><div class="goal-amount"><strong>${money(goal.current)}</strong><span> / ${money(goal.target)}</span></div><div class="progress-track"><span style="width:${Math.min(100, percent)}%;background:${goal.color}"></span></div><div class="goal-meta"><span>已完成 <strong>${Math.round(percent)}%</strong></span><span>建议每月 <strong>${money(monthly)}</strong></span></div></article>`;
        }).join("") : `<article class="card empty-state"><div>${icon("target")}<h3>还没有财务目标</h3><p>从应急储备或下一次旅行开始。</p><button class="primary-button" data-action="add-goal">新建目标</button></div></article>`}</section>
      </div>`;
  }

  function renderSettings() {
    const dataSize = new Blob([JSON.stringify(state)]).size;
    const lastExport = localStorage.getItem(`${STORAGE_KEY}-last-export`);
    return `
      <div class="section-stack view-enter">
        <section class="page-intro"><div><h2>你的数据，由你掌控</h2><p>本 MVP 不创建云端账户。请定期导出备份，清除浏览器数据会同时删除本地记录。</p></div></section>
        <section class="settings-layout">
          <article class="card"><div class="card-pad"><div class="section-head"><div><h2>数据与偏好</h2><p>管理本地数据和界面设置</p></div></div></div><div class="settings-group">
            <div class="setting-row"><span class="setting-copy"><strong>界面主题</strong><span>在浅色与深色外观之间切换</span></span><button class="secondary-button compact" data-action="toggle-theme">${icon(state.settings.theme === "dark" ? "sun" : "moon")}${state.settings.theme === "dark" ? "使用浅色" : "使用深色"}</button></div>
            <div class="setting-row"><span class="setting-copy"><strong>导出数据</strong><span>${lastExport ? `上次导出：${escapeHTML(lastExport)}` : "尚未创建备份"}</span></span><button class="secondary-button compact" data-action="export-data">${icon("download")}导出 JSON</button></div>
            <div class="setting-row"><span class="setting-copy"><strong>导入备份</strong><span>导入会替换当前浏览器中的全部数据</span></span><button class="secondary-button compact" data-action="import-data">${icon("upload")}选择文件</button></div>
            <div class="setting-row"><span class="setting-copy"><strong>恢复演示数据</strong><span>删除当前修改并回到首次打开时的状态</span></span><button class="danger-button compact" data-action="reset-data">恢复默认</button></div>
          </div></article>
          <article class="card local-card">${icon("shield")}<h3>本地优先</h3><p>当前 ${number(dataSize / 1024, 1)} KB 数据只存储在这台设备的当前浏览器中，不会发送到任何服务器。</p><span class="status-chip"><i class="dot" style="background:#dff3a8"></i>本地存储工作正常</span></article>
        </section>
        <section class="card health-banner"><div class="health-banner-copy"><span class="health-badge">01</span><div><h3>下一阶段：安全账户与云端同步</h3><p>正式版将加入身份认证、加密数据库、操作审计、备份恢复和跨设备同步。</p></div></div></section>
      </div>`;
  }

  function renderApp() {
    const route = currentRoute();
    setPageHeader(route);
    renderSideInsight();
    const views = {
      dashboard: renderDashboard,
      accounts: renderAccounts,
      transactions: renderTransactions,
      budgets: renderBudgets,
      investments: renderInvestments,
      goals: renderGoals,
      settings: renderSettings,
    };
    $("#main-content").innerHTML = views[route]();
    closeMobileMenu();
  }

  function accountOptions(selected = "") {
    return state.accounts.map((account) => `<option value="${account.id}" ${account.id === selected ? "selected" : ""}>${escapeHTML(account.name)}（${money(account.balance)}）</option>`).join("");
  }

  function categoryOptions(selected = "") {
    return Object.keys(CATEGORY_META).filter((category) => !["转账"].includes(category)).map((category) => `<option value="${category}" ${category === selected ? "selected" : ""}>${category}</option>`).join("");
  }

  function openDialog(kind, payload = {}) {
    const dialog = $("#entity-dialog");
    const form = $("#entity-form");
    const body = $("#dialog-body");
    const title = $("#dialog-title");
    const eyebrow = $("#dialog-eyebrow");
    const submit = $("#dialog-submit");
    form.dataset.kind = kind;
    form.dataset.id = payload.id || "";
    eyebrow.textContent = "财智管家";
    submit.textContent = "保存";

    if (kind === "transaction") {
      title.textContent = "记录一笔账单";
      eyebrow.textContent = "快速记账";
      body.innerHTML = `
        <div class="form-row"><div class="field"><label for="tx-type">账单类型</label><select id="tx-type" name="type" required><option value="expense">支出</option><option value="income">收入</option><option value="transfer">账户转账</option></select></div><div class="field"><label for="tx-amount">金额</label><input id="tx-amount" name="amount" type="number" min="0.01" step="0.01" inputmode="decimal" placeholder="0.00" required autofocus /></div></div>
        <div class="form-row"><div class="field"><label id="tx-account-label" for="tx-account">付款账户</label><select id="tx-account" name="accountId" required>${accountOptions()}</select></div><div class="field" id="tx-to-field" hidden><label for="tx-to-account">转入账户</label><select id="tx-to-account" name="toAccountId">${accountOptions(state.accounts[1]?.id)}</select></div><div class="field" id="tx-category-field"><label for="tx-category">分类</label><select id="tx-category" name="category">${categoryOptions("餐饮")}</select></div></div>
        <div class="form-row"><div class="field"><label for="tx-date">日期</label><input id="tx-date" name="date" type="date" value="${toISODate(new Date())}" required /></div><div class="field"><label for="tx-note">备注</label><input id="tx-note" name="note" maxlength="40" placeholder="例如：午餐" /></div></div>
        <div class="form-note">${icon("info")}<span>账户间转账只调整两个账户的余额，不会计入本月收入或支出。</span></div>`;
    } else if (kind === "account") {
      title.textContent = "新增账户";
      eyebrow.textContent = "资产账户";
      body.innerHTML = `
        <div class="field"><label for="account-name">账户名称</label><input id="account-name" name="name" maxlength="30" placeholder="例如：工资卡" required autofocus /></div>
        <div class="form-row"><div class="field"><label for="account-type">账户类型</label><select id="account-type" name="type" required>${Object.entries(ACCOUNT_META).map(([value, meta]) => `<option value="${value}">${meta.label}</option>`).join("")}</select></div><div class="field"><label for="account-balance">当前余额</label><input id="account-balance" name="balance" type="number" step="0.01" value="0" required /></div></div>
        <p class="field-help">信用账户的待还金额请输入负数，例如 -3200。</p>`;
    } else if (kind === "budget") {
      const budget = state.budgets.find((item) => item.category === payload.category);
      if (!budget) return;
      form.dataset.id = budget.category;
      title.textContent = `调整${budget.category}预算`;
      eyebrow.textContent = "月度预算";
      body.innerHTML = `<div class="field"><label for="budget-limit">每月预算金额</label><input id="budget-limit" name="limit" type="number" min="0" step="100" value="${budget.limit}" required autofocus /></div><div class="form-note">${icon("info")}<span>修改后会立即根据本月已记录的账单重新计算使用比例。</span></div>`;
    } else if (kind === "holding") {
      title.textContent = "添加投资持仓";
      eyebrow.textContent = "投资组合";
      body.innerHTML = `
        <div class="form-row"><div class="field"><label for="holding-name">资产名称</label><input id="holding-name" name="name" maxlength="30" placeholder="例如：沪深300ETF" required autofocus /></div><div class="field"><label for="holding-symbol">代码或说明</label><input id="holding-symbol" name="symbol" maxlength="20" placeholder="例如：510300" required /></div></div>
        <div class="field"><label for="holding-type">资产类型</label><select id="holding-type" name="type"><option>指数基金</option><option>股票</option><option>债券基金</option><option>商品基金</option><option>定期存款</option><option>其他</option></select></div>
        <div class="form-row"><div class="field"><label for="holding-units">持有份额</label><input id="holding-units" name="units" type="number" min="0.0001" step="0.0001" required /></div><div class="field"><label for="holding-cost">平均成本价</label><input id="holding-cost" name="cost" type="number" min="0" step="0.0001" required /></div></div>
        <div class="field"><label for="holding-price">当前价格</label><input id="holding-price" name="price" type="number" min="0" step="0.0001" required /></div>
        <div class="form-note">${icon("info")}<span>当前版本不连接实时行情；更新价格后，持仓市值与浮动盈亏会自动重算。</span></div>`;
    } else if (kind === "goal") {
      const goal = payload.id ? state.goals.find((item) => item.id === payload.id) : null;
      title.textContent = goal ? "编辑财务目标" : "新建财务目标";
      eyebrow.textContent = "目标计划";
      body.innerHTML = `
        <div class="field"><label for="goal-name">目标名称</label><input id="goal-name" name="name" maxlength="30" value="${escapeHTML(goal?.name || "")}" placeholder="例如：6个月应急储备" required autofocus /></div>
        <div class="form-row"><div class="field"><label for="goal-target">目标金额</label><input id="goal-target" name="target" type="number" min="1" step="100" value="${goal?.target || ""}" required /></div><div class="field"><label for="goal-current">已经积累</label><input id="goal-current" name="current" type="number" min="0" step="100" value="${goal?.current || 0}" required /></div></div>
        <div class="field"><label for="goal-deadline">目标日期</label><input id="goal-deadline" name="deadline" type="date" min="${toISODate(new Date())}" value="${goal?.deadline || monthsAhead(12)}" required /></div>`;
    }

    if (!dialog.open) dialog.showModal();
  }

  function closeDialog() {
    const dialog = $("#entity-dialog");
    if (dialog.open) dialog.close();
  }

  function updateTransactionForm() {
    const type = $("#tx-type")?.value;
    if (!type) return;
    const toField = $("#tx-to-field");
    const categoryField = $("#tx-category-field");
    const label = $("#tx-account-label");
    toField.hidden = type !== "transfer";
    categoryField.hidden = type === "transfer";
    label.textContent = type === "income" ? "收款账户" : type === "transfer" ? "转出账户" : "付款账户";
  }

  function adjustAccount(id, amount) {
    const account = accountById(id);
    if (account) account.balance = round(Number(account.balance) + Number(amount));
  }

  function handleFormSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const kind = form.dataset.kind;

    if (kind === "transaction") {
      const amount = Number(values.amount);
      if (!(amount > 0)) return toast("请输入有效金额");
      if (values.type === "transfer" && values.accountId === values.toAccountId) return toast("转出账户和转入账户不能相同");
      const transaction = {
        id: uid("tx"), type: values.type, accountId: values.accountId,
        category: values.type === "transfer" ? "转账" : values.category,
        amount, date: values.date, note: values.note.trim() || (values.type === "transfer" ? "账户转账" : values.category),
      };
      if (values.type === "income") adjustAccount(values.accountId, amount);
      if (values.type === "expense") adjustAccount(values.accountId, -amount);
      if (values.type === "transfer") {
        transaction.toAccountId = values.toAccountId;
        adjustAccount(values.accountId, -amount);
        adjustAccount(values.toAccountId, amount);
      }
      state.transactions.push(transaction);
      saveState(); closeDialog(); renderApp(); toast("账单已记录，相关指标已更新");
    } else if (kind === "account") {
      state.accounts.push({ id: uid("acc"), name: values.name.trim(), type: values.type, balance: Number(values.balance), color: COLORS[state.accounts.length % COLORS.length] });
      saveState(); closeDialog(); renderApp(); toast("新账户已加入资产统计");
    } else if (kind === "budget") {
      const budget = state.budgets.find((item) => item.category === form.dataset.id);
      if (budget) budget.limit = Math.max(0, Number(values.limit));
      saveState(); closeDialog(); renderApp(); toast("预算金额已更新");
    } else if (kind === "holding") {
      state.holdings.push({ id: uid("hold"), name: values.name.trim(), symbol: values.symbol.trim(), type: values.type, units: Number(values.units), cost: Number(values.cost), price: Number(values.price), color: COLORS[state.holdings.length % COLORS.length] });
      saveState(); closeDialog(); renderApp(); toast("持仓已添加，组合收益已重算");
    } else if (kind === "goal") {
      const existing = form.dataset.id ? state.goals.find((item) => item.id === form.dataset.id) : null;
      const data = { name: values.name.trim(), target: Number(values.target), current: Number(values.current), deadline: values.deadline };
      if (data.current > data.target) data.current = data.target;
      if (existing) Object.assign(existing, data);
      else state.goals.push({ id: uid("goal"), ...data, color: COLORS[state.goals.length % COLORS.length], icon: "target" });
      saveState(); closeDialog(); renderApp(); toast(existing ? "目标进度已更新" : "新的财务目标已建立");
    }
  }

  function reverseTransaction(transaction) {
    if (transaction.type === "income") adjustAccount(transaction.accountId, -transaction.amount);
    if (transaction.type === "expense") adjustAccount(transaction.accountId, transaction.amount);
    if (transaction.type === "transfer") {
      adjustAccount(transaction.accountId, transaction.amount);
      adjustAccount(transaction.toAccountId, -transaction.amount);
    }
  }

  function deleteTransaction(id) {
    const transaction = state.transactions.find((item) => item.id === id);
    if (!transaction) return;
    if (!confirm(`确定删除“${transaction.note || transaction.category}”这笔账单吗？账户余额会同步还原。`)) return;
    reverseTransaction(transaction);
    state.transactions = state.transactions.filter((item) => item.id !== id);
    saveState(); renderApp(); toast("账单已删除，账户余额已还原");
  }

  function deleteHolding(id) {
    const holding = state.holdings.find((item) => item.id === id);
    if (!holding || !confirm(`确定删除持仓“${holding.name}”吗？`)) return;
    state.holdings = state.holdings.filter((item) => item.id !== id);
    saveState(); renderApp(); toast("持仓已删除");
  }

  function exportData() {
    const payload = JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2);
    const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `财智管家备份-${toISODate(new Date())}.json`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    const time = new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date());
    localStorage.setItem(`${STORAGE_KEY}-last-export`, time);
    if (currentRoute() === "settings") renderApp();
    toast("数据备份已下载");
  }

  async function importData(file) {
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const required = ["accounts", "transactions", "budgets", "holdings", "goals"];
      if (!required.every((key) => Array.isArray(parsed[key]))) throw new Error("文件结构不完整");
      if (!confirm("导入会替换当前全部数据，确定继续吗？")) return;
      state = normalizeState(parsed);
      saveState(); applyTheme(); renderApp(); toast("备份已成功导入");
    } catch (error) {
      console.error(error);
      toast("无法导入：请选择财智管家导出的 JSON 备份");
    } finally {
      $("#import-input").value = "";
    }
  }

  function resetData() {
    if (!confirm("确定恢复演示数据吗？当前账户、账单、预算、持仓和目标都会被替换。")) return;
    const theme = state.settings.theme;
    state = createDefaultState();
    state.settings.theme = theme;
    saveState(); renderApp(); toast("已恢复演示数据");
  }

  function applyTheme() {
    document.documentElement.dataset.theme = state.settings.theme;
    const themeMeta = $('meta[name="theme-color"]');
    if (themeMeta) themeMeta.content = state.settings.theme === "dark" ? "#101713" : "#f3f4ee";
  }

  function toggleTheme() {
    state.settings.theme = state.settings.theme === "dark" ? "light" : "dark";
    saveState(); applyTheme(); renderApp();
  }

  function toast(message) {
    const region = $("#toast-region");
    const item = document.createElement("div");
    item.className = "toast";
    item.innerHTML = `${icon("shield")}<span>${escapeHTML(message)}</span>`;
    region.append(item);
    setTimeout(() => item.remove(), 3600);
  }

  function openMobileMenu() {
    $("#sidebar").classList.add("is-open");
    $("#sidebar-scrim").classList.add("is-open");
  }

  function closeMobileMenu() {
    $("#sidebar").classList.remove("is-open");
    $("#sidebar-scrim").classList.remove("is-open");
  }

  document.addEventListener("click", (event) => {
    const routeTarget = event.target.closest("[data-route]");
    if (routeTarget) {
      navigate(routeTarget.dataset.route);
      return;
    }

    const rangeTarget = event.target.closest("[data-range]");
    if (rangeTarget) {
      ui.trendRange = Number(rangeTarget.dataset.range);
      renderApp();
      return;
    }

    const filterTarget = event.target.closest("[data-filter]");
    if (filterTarget) {
      ui.transactionFilter = filterTarget.dataset.filter;
      $$("[data-filter]").forEach((item) => item.classList.toggle("is-active", item === filterTarget));
      updateTransactionTable();
      return;
    }

    const actionTarget = event.target.closest("[data-action]");
    if (!actionTarget) return;
    const { action, id, category } = actionTarget.dataset;
    const actions = {
      "add-transaction": () => openDialog("transaction"),
      "add-account": () => openDialog("account"),
      "add-holding": () => openDialog("holding"),
      "add-goal": () => openDialog("goal"),
      "edit-goal": () => openDialog("goal", { id }),
      "edit-budget": () => openDialog("budget", { category }),
      "close-dialog": closeDialog,
      "delete-transaction": () => deleteTransaction(id),
      "delete-holding": () => deleteHolding(id),
      "export-data": exportData,
      "import-data": () => $("#import-input").click(),
      "reset-data": resetData,
      "toggle-theme": toggleTheme,
      "show-notifications": () => {
        const over = state.budgets.filter((budget) => spentForCategory(budget.category) > budget.limit);
        toast(over.length ? `${over.length} 个预算分类已经超支` : "目前没有需要处理的财务提醒");
      },
    };
    actions[action]?.();
  });

  document.addEventListener("input", (event) => {
    if (event.target.id === "transaction-search") {
      ui.transactionSearch = event.target.value;
      updateTransactionTable();
    }
  });

  document.addEventListener("change", (event) => {
    if (event.target.id === "tx-type") updateTransactionForm();
  });

  $("#entity-form").addEventListener("submit", handleFormSubmit);
  $("#import-input").addEventListener("change", (event) => importData(event.target.files[0]));
  $("#mobile-menu").addEventListener("click", openMobileMenu);
  $("#sidebar-scrim").addEventListener("click", closeMobileMenu);
  $("#entity-dialog").addEventListener("click", (event) => {
    if (event.target === event.currentTarget) closeDialog();
  });
  window.addEventListener("hashchange", renderApp);
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      state = normalizeState(JSON.parse(event.newValue));
      applyTheme(); renderApp();
    }
  });

  applyTheme();
  renderApp();
})();

