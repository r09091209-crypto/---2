// ============ ДАННЫЕ ============
const initialLanguages = [
  { id:"python", name:"Python", icon:"🐍", blurb:"Скрипты, автоматизация, анализ данных.",
    lessons:[
      {id:"py-1", title:"Урок 1: Введение", description:"Знакомство с Python.", task:"Выведи 'Hello, Astro Koddi' через print().",
        content: `print() — встроенная функция Python для вывода текста в консоль.\nПример:\nprint('Hello, Astro Koddi')`},
      {id:"py-2", title:"Урок 2: Переменные", description:"Типы данных и переменные.", task:"Создай переменные с именем и возрастом."},
      {id:"py-3", title:"Урок 3: Циклы и списки", description:"Списки и циклы.", task:"Посчитай сумму чисел в списке."},
    ]},
  { id:"javascript", name:"JavaScript", icon:"⚡", blurb:"Веб, интерактив и фронтенд-магия.",
    lessons:[
      {id:"js-1", title:"Урок 1: Введение", description:"Что такое JS.", task:"Выведи console.log с приветствием.",
        content: `console.log() — функция для вывода в консоль в JavaScript.\nПример:\nconsole.log('Hello, Astro Koddi');`},
      {id:"js-2", title:"Урок 2: Функции", description:"let, const, функции.", task:"Напиши функцию суммы двух чисел."},
      {id:"js-3", title:"Урок 3: Массивы", description:"Работа с массивами.", task:"Отфильтруй чётные числа массива."},
    ]},
  { id:"bash", name:"Linux Bash", icon:"💻", blurb:"Терминал, скрипты, автоматизация.",
    lessons:[
      {id:"sh-1", title:"Урок 1: Введение", description:"Навигация по ФС.", task:"Выведи список файлов: ls -la.",
        content: `echo — команда для вывода текста в терминале.\nПример:\necho 'Hello, Astro Koddi'`},
      {id:"sh-2", title:"Урок 2: Файлы", description:"cp, mv, mkdir, rm.", task:"Создай папку и скопируй файл."},
      {id:"sh-3", title:"Урок 3: Скрипты", description:"Автоматизация.", task:"Напиши скрипт-бэкап папки."},
    ]},
  { id:"cpp", name:"C++", icon:"🚀", blurb:"Низкоуровневая мощь и скорость.",
    lessons:[
      {id:"cpp-1", title:"Урок 1: Введение", description:"Структура программы.", task:"Скомпилируй Hello World.",
        content: `В C++ вывод в консоль обычно через std::cout.\nПример:\ncout << "Hello, Astro Koddi" << endl;`},
      {id:"cpp-2", title:"Урок 2: Указатели", description:"Память и указатели.", task:"Измени значение через указатель."},
      {id:"cpp-3", title:"Урок 3: Массивы", description:"Работа с памятью.", task:"Реализуй работу с массивом."},
    ]},
];

const initialUsers = [
  {id:"u1", nickname:"n3o_runner", email:"neo@matrix.io", role:"user", status:"active"},
  {id:"u2", nickname:"ghost_shell", email:"ghost@deck.net", role:"user", status:"active"},
  {id:"u3", nickname:"cipher_x", email:"r09091209@gmail.com", role:"admin", status:"active"},
  {id:"u4", nickname:"byte_witch", email:"witch@hex.dev", role:"user", status:"active"},
];

const starters = {
  python: "# Python\nprint('Hello, Astro Koddi')",
  javascript: "// JavaScript\nconsole.log('Hello, Astro Koddi');",
  bash: "# Bash\necho 'Hello, Astro Koddi'",
  cpp: '#include <iostream>\nusing namespace std;\nint main(){\n  cout << "Hello, Astro Koddi" << endl;\n  return 0;\n}',
};

const XP_PER_LESSON = 100, XP_PER_LEVEL = 500, KEY = "astro-koddi-v1";

// Простые клиентские тесты для уроков. Для реальной проверки нужен backend.
const LESSON_TESTS = {
  'py-1': { lang: 'python', type: 'contains', pattern: /print\s*\(\s*['\"]\s*Hello\s*,?\s*Astro\s+Koddi\s*['\"]\s*\)/i },
  'js-1': { lang: 'javascript', type: 'output', expected: /Hello[,\s]*Astro\s+Koddi/i },
  'sh-1': { lang: 'bash', type: 'contains', pattern: /echo\s+['\"]?Hello[,\s]*Astro\s+Koddi['\"]?/i },
  'cpp-1': { lang: 'cpp', type: 'contains', pattern: /cout\s*<<\s*['\"]?Hello[,\s]*Astro\s+Koddi['\"]?/i },
};


// Админские учётные данные (локально, для демонстрации)
const ADMIN_EMAIL = "r09091209@gmail.com";
const ADMIN_PASSWORD = "Santana-20-10";

// ============ СОСТОЯНИЕ ============
let state = {
  user: null, xp: 0, completed: [],
  languages: structuredClone(initialLanguages),
  users: structuredClone(initialUsers),
  view: "home", selectedLang: null,
  query: "", filter: "all",
};

state._passed = state._passed || {};
state._learned = state._learned || {};

function load(){
  try{
    const r = localStorage.getItem(KEY);
    if(r){
      const parsed = JSON.parse(r);
      // Миграция: если в сохранённых данных ещё старый admin email, заменим его на новый
      const OLD_ADMIN_EMAIL = "cipher@void.org";
      const NEW_ADMIN_EMAIL = "r09091209@gmail.com";
      let changed = false;
      if(parsed.users && Array.isArray(parsed.users)){
        parsed.users = parsed.users.map(u => { if(u.email === OLD_ADMIN_EMAIL){ u.email = NEW_ADMIN_EMAIL; changed = true; } return u; });
      }
      if(parsed.user && parsed.user.email === OLD_ADMIN_EMAIL){ parsed.user.email = NEW_ADMIN_EMAIL; changed = true; }
      if(changed){ localStorage.setItem(KEY, JSON.stringify(parsed)); }
      Object.assign(state, parsed);
    }
  }catch(e){}
}
// Если посетитель не авторизован, показываем модалку входа при загрузке
window.addEventListener('DOMContentLoaded', ()=>{
  load();
  if(!state.user){ setTimeout(()=>{ openAuth(); render(); }, 120); }
  render();
});
function save(){ const {user,xp,completed,languages,users,_passed,_learned}=state; localStorage.setItem(KEY, JSON.stringify({user,xp,completed,languages,users,_passed,_learned})); }
const level = () => Math.floor(state.xp / XP_PER_LEVEL) + 1;
const isAdmin = () => state.user && state.users.find(u=>u.email===state.user.email)?.role==="admin";

// ============ ДЕЙСТВИЯ ============
function login(email, password, nickname){
  let existing = state.users.find(u=>u.email===email);
  // Если нет пользователя — создаём пользователя (по email может стать админом)
  if(!existing){ const role = (email === ADMIN_EMAIL) ? 'admin' : 'user'; existing={id:"u"+Date.now(), nickname:nickname||email.split("@")[0], email, role, status:"active", password:password||""}; state.users.push(existing); }
  if(existing.status==="banned"){ alert("Этот аккаунт заблокирован."); return; }

  // Если у существующего пользователя есть пароль — проверяем его
  if(existing.password && password && existing.password !== password){ alert('Неверный пароль.'); return; }

  // Специальная проверка: если email соответствует админскому — присваиваем роль admin
  if(email === ADMIN_EMAIL){ existing.role = 'admin'; }

  state.user = {nickname: existing.nickname, email};
  save(); closeAuth(); render();
}

function register(email, nickname, password){
  let existing = state.users.find(u=>u.email===email);
  const role = (email === ADMIN_EMAIL) ? 'admin' : 'user';
  if(existing){
    existing.nickname = nickname || existing.nickname;
    existing.password = password || existing.password;
    existing.role = role;
  }else{
    existing = {id:"u"+Date.now(), nickname:nickname||email.split("@")[0], email, role, status:"active", password:password||""};
    state.users.push(existing);
  }
  state.user = {nickname: existing.nickname, email};
  save(); closeAuth(); render();
}
function logout(){ state.user=null; state.view="home"; save(); render(); }
function completeLesson(id){
  if(!state.completed.includes(id)){ state.completed.push(id); state.xp+=XP_PER_LESSON; save(); render(); }
}
function banUser(id){ const u=state.users.find(x=>x.id===id); if(u){ u.status=u.status==="banned"?"active":"banned"; save(); render(); } }
function promoteUser(id){ const u=state.users.find(x=>x.id===id); if(u){ u.role=u.role==="admin"?"user":"admin"; save(); render(); } }
function deleteUser(id){
  const idx = state.users.findIndex(x=>x.id===id);
  if(idx===-1) return;
  const target = state.users[idx];
  // Предотвратить удаление себя (по email текущего пользователя)
  if(state.user && state.user.email === target.email){ alert('Нельзя удалить свою текущую сессию.'); return; }
  if(!confirm(`Удалить пользователя ${target.nickname} (${target.email})?`)) return;
  state.users.splice(idx,1);
  save(); render();
}
function impersonateUser(id){
  const u = state.users.find(x=>x.id===id);
  if(!u) return;
  // Сохраним текущую админскую сессию, чтобы можно было вернуться
  if(state.user && !state._adminBackup){ state._adminBackup = {nickname: state.user.nickname, email: state.user.email}; }
  state.user = {nickname: u.nickname, email: u.email};
  save(); render();
}
function restoreAdmin(){
  if(!state._adminBackup) return;
  state.user = {nickname: state._adminBackup.nickname, email: state._adminBackup.email};
  delete state._adminBackup;
  save(); render();
}
function addLesson(langId, title, description, task, content){
  const lang=state.languages.find(l=>l.id===langId);
  lang.lessons.push({id:langId+"-"+Date.now(), title, description, task, content: content||''}); save(); render();
}

function progress(langId){
  const lang=state.languages.find(l=>l.id===langId);
  const done=lang.lessons.filter(l=>state.completed.includes(l.id)).length;
  return Math.round(done/Math.max(lang.lessons.length,1)*100);
}

// ============ ЗАПУСК КОДА ============
function runJS(code){
  const logs=[];
  const c={log:(...a)=>logs.push(a.map(fmt).join(" ")),error:(...a)=>logs.push(a.map(fmt).join(" ")),warn:(...a)=>logs.push(a.map(fmt).join(" "))};
  try{ const fn=new Function("console","alert",'"use strict";\n'+code); const r=fn(c, m=>logs.push(String(m))); if(r!==undefined) logs.push(fmt(r)); }
  catch(e){ logs.push("Ошибка: "+e.message); }
  return logs.length?logs.join("\n"):"// Код выполнен (нет вывода)";
}
function fmt(v){ if(typeof v==="string") return v; try{return JSON.stringify(v);}catch{return String(v);} }

// ============ РЕНДЕР ============
const app = document.getElementById("app");

function render(){
  // навигация
  document.querySelectorAll(".auth-only").forEach(e=>e.classList.toggle("hidden", !state.user));
  document.querySelectorAll(".admin-only").forEach(e=>e.classList.toggle("hidden", !isAdmin()));
  document.querySelector(".login-btn").classList.toggle("hidden", !!state.user);
  document.querySelector(".logout-btn").classList.toggle("hidden", !state.user);
  const badge=document.querySelector(".user-badge");
  badge.classList.toggle("hidden", !state.user);
  if(state.user) badge.textContent = `@${state.user.nickname} · LVL ${level()} · ${state.xp} XP`;

  // Кнопка для возврата к админской сессии при имперсонации
  let restoreBtn = document.getElementById('restoreAdminBtn');
  if(!restoreBtn){
    restoreBtn = document.createElement('button');
    restoreBtn.id = 'restoreAdminBtn';
    restoreBtn.textContent = 'Вернуться как админ';
    restoreBtn.className = 'btn btn-ghost';
    restoreBtn.style.position = 'fixed';
    restoreBtn.style.right = '12px';
    restoreBtn.style.top = '12px';
    restoreBtn.style.zIndex = 9999;
    restoreBtn.addEventListener('click', restoreAdmin);
    document.body.appendChild(restoreBtn);
  }
  restoreBtn.style.display = state._adminBackup ? 'block' : 'none';

  if(state.view==="home") renderHome();
  else if(state.view==="languages") renderLanguages();
  else if(state.view==="profile") renderProfile();
  else if(state.view==="admin") renderAdmin();
}

function renderHome(){
  app.innerHTML = `
    <section class="hero">
      <h1>Войди в <span class="glow-p">кибер-академию</span><br>программирования</h1> 
      <p>Интерактивные уроки по Python, JavaScript, Bash и C++. Пиши код прямо в браузере, зарабатывай XP и качай уровень.</p>
      <button class="btn btn-primary" onclick="go('languages')">Начать обучение →</button>
    </section>
    <section class="container section">
      <h2 class="glow-t">Языки обучения</h2>
      <div class="grid cols-4">
        ${state.languages.map(l=>langCard(l)).join("")}
      </div>
    </section>`;
}

function langCard(l){
  return `<div class="card clickable" onclick="openLang('${l.id}')">
    <div class="icon">${l.icon}</div>
    <h3>${l.name}</h3>
    <p class="blurb">${l.blurb}</p>
    <p class="meta">${l.lessons.length} уроков · ${progress(l.id)}% пройдено</p>
    <div class="bar"><div style="width:${progress(l.id)}%"></div></div>
  </div>`;
}

function renderLanguages(){
  if(state.selectedLang){ renderLessons(); return; }
  const q=state.query.trim().toLowerCase();
  const filtered=state.languages.filter(l=>{
    const mq=!q || l.name.toLowerCase().includes(q) || l.blurb.toLowerCase().includes(q);
    const p=progress(l.id);
    const mf=state.filter==="all" || (state.filter==="new"&&p===0) || (state.filter==="started"&&p>0&&p<100) || (state.filter==="done"&&p===100);
    return mq&&mf;
  });
  const tabs=[["all","Все"],["new","Новые"],["started","В процессе"],["done","Завершённые"]];
  app.innerHTML = `
    <section class="container section">
      <h2 class="glow-p">Языки программирования</h2>
      <p class="blurb" style="margin-bottom:18px">Выбери направление и открой список уроков.</p>
      <div class="tools">
        <input class="search" id="searchInput" placeholder="Поиск по языкам..." value="${state.query}" />
        <div class="filters">
          ${tabs.map(([id,lab])=>`<button class="chip ${state.filter===id?'active':''}" onclick="setFilter('${id}')">${lab}</button>`).join("")}
        </div>
      </div>
      ${filtered.length? `<div class="grid cols-4">${filtered.map(langCard).join("")}</div>`
        : `<p class="card">Ничего не найдено. Измени поиск или фильтр.</p>`}
    </section>`;
  const si=document.getElementById("searchInput");
  si.addEventListener("input", e=>{ state.query=e.target.value; const pos=e.target.selectionStart; renderLanguages(); const n=document.getElementById("searchInput"); n.focus(); n.setSelectionRange(pos,pos); });
}

function renderLessons(){
  const l=state.languages.find(x=>x.id===state.selectedLang);
  app.innerHTML = `
    <section class="container section">
      <span class="back-link" onclick="backToLangs()">← Назад к языкам</span>
      <div style="display:flex;gap:14px;align-items:center;margin-bottom:18px">
        <span style="font-size:42px">${l.icon}</span>
        <div><h2 class="glow-p">${l.name}</h2><p class="blurb">${l.blurb}</p></div>
      </div>
      <div class="bar" style="margin-bottom:24px"><div style="width:${progress(l.id)}%"></div></div>
      ${l.lessons.map(les=>lessonBlock(l.id,les)).join("")}
    </section>`;
}

function lessonBlock(langId, les){
  const done=state.completed.includes(les.id);
  const learned = !!state._learned[les.id];
  return `<div class="lesson ${done?'done':''}">
    <h3>${done?'✅':'🔒'} ${les.title}</h3>
    <p class="desc">${les.description}</p>
    <div class="task">$ ${les.task}</div>
    <div class="learn">
      <h4>Учебный блок</h4>
      <p>${les.content? escapeHtml(les.content).replace(/\n/g,'<br/>') : 'В информатике принт (от англ. print — печатать) — это встроенная команда (функция) в языках программирования, которая выводит текст, числа или другие данные на экран монитора (в консоль или терминал).'}</p>
      <button class="btn btn-ghost" id="learn-${les.id}" onclick="markLearned('${les.id}')" ${learned? 'disabled':''}>Я прочитал(а)</button>
    </div>
    <div class="editor">
      <div class="editor-head">
        <span>editor.${langId}</span>
        <button class="btn btn-primary" id="run-${les.id}" onclick="runCode('${les.id}','${langId}')" ${learned? '':'disabled'}>▶ Запустить</button>
      </div>
      <textarea id="code-${les.id}">${escapeHtml(starters[langId]||"")}</textarea>
      <div class="output" id="out-${les.id}" style="display:none"></div>
    </div>
    <div style="margin-top:14px">
      ${done? `<span class="done-tag">✓ Пройдено (+100 XP)</span>`
        : state.user? `
          <button class="btn btn-primary" id="mark-${les.id}" onclick="completeLesson('${les.id}')" ${state._passed[les.id]? '':'disabled'}>Отметить как пройденный</button>
          <span id="check-${les.id}" style="margin-left:12px">${state._passed[les.id]? '✅ Код прошёл проверку':'⏳ Нажмите «▶ Запустить» для проверки'}</span>
        `
        : `<button class="btn btn-ghost" onclick="openAuth()">Войдите, чтобы проходить</button>`}
    </div>
  </div>`;
}

function runCode(lessonId, langId){
  const code=document.getElementById("code-"+lessonId).value;
  const out=document.getElementById("out-"+lessonId);
  // Проверим, прочитал ли пользователь учебный блок
  if(!state._learned[lessonId]){
    const chk = document.getElementById('check-'+lessonId);
    if(chk) chk.textContent = '❗ Сначала прочтите учебный блок и нажмите "Я прочитал(а)".';
    alert('Пожалуйста, сначала прочтите учебный блок и нажмите "Я прочитал(а)".');
    return;
  }
  out.style.display="block";
  if(langId==="javascript"){
    out.textContent = runJS(code);
  } else {
    out.textContent = `// Симуляция запуска (${langId})\n// «Живое» выполнение доступно для JavaScript.\n// Выполняется статическая проверка кода.`;
  }

  // Простая валидация по заранее заданным тестам
  const test = LESSON_TESTS[lessonId];
  let res = {ok:true, message:'Нет автоматической проверки для этого урока.'};
  if(test){
    if(test.type === 'contains'){
      const ok = test.pattern.test(code);
      res = {ok, message: ok? 'Код содержит ожидаемое выражение.' : 'Код не содержит ожидаемого выражения.'};
    } else if(test.type === 'output' && langId === 'javascript'){
      const logs = runJS(code);
      const ok = test.expected.test(logs);
      res = {ok, message: ok? 'Вывод соответствует ожидаемому.' : 'Вывод не соответствует ожидаемому.'};
    }
  }

  const chk = document.getElementById('check-'+lessonId);
  const markBtn = document.getElementById('mark-'+lessonId);
  if(chk) chk.textContent = (res.ok? '✅ ' : '❌ ') + res.message;
  if(markBtn) markBtn.disabled = !res.ok;
  state._passed[lessonId] = !!res.ok;

  // Если проверка успешна и пользователь авторизован — автоматически отмечаем урок как пройденный
  if(res.ok){
    if(!state.user){
      // Попросим войти перед сохранением прогресса
      setTimeout(()=>{ openAuth(); }, 200);
    } else {
      if(!state.completed.includes(lessonId)){
        // Небольшая задержка, чтобы пользователь увидел отметку ✅
        setTimeout(()=>{
          completeLesson(lessonId);
          // После рендера плавно прокрутим к следующему уроку
          setTimeout(()=>{
            const codeEl = document.getElementById('code-'+lessonId);
            if(codeEl){
              const lessonEl = codeEl.closest('.lesson');
              if(lessonEl && lessonEl.nextElementSibling){
                lessonEl.nextElementSibling.scrollIntoView({behavior:'smooth', block:'center'});
              }
            }
          }, 250);
        }, 600);
      }
    }
  }
}

function renderProfile(){
  if(!state.user){ openAuth(); state.view="home"; renderHome(); return; }
  const total=state.languages.reduce((s,l)=>s+l.lessons.length,0);
  app.innerHTML = `
    <section class="container section">
      <h2 class="glow-p">Профиль</h2>
      <div class="grid cols-2" style="margin-top:18px">
        <div class="card">
          <h3>@${state.user.nickname}</h3>
          <p class="blurb">${state.user.email}</p>
          <p class="meta">Уровень ${level()} · ${state.xp} XP</p>
          <div class="bar"><div style="width:${(state.xp%XP_PER_LEVEL)/XP_PER_LEVEL*100}%"></div></div>
        </div>
        <div class="card">
          <h3 class="glow-t">Статистика</h3>
          <p class="blurb">Пройдено уроков: ${state.completed.length} из ${total}</p>
          <p class="blurb">До следующего уровня: ${XP_PER_LEVEL-(state.xp%XP_PER_LEVEL)} XP</p>
          ${isAdmin()? '<p class="meta">🛡️ Статус: Администратор</p>':''}
        </div>
      </div>
    </section>`;
}

function renderAdmin(){
  if(!isAdmin()){ app.innerHTML=`<section class="container section"><div class="card">⛔ Доступ только для администраторов. </div></section>`; return; }
  app.innerHTML = `
    <section class="container section">
      <h2 class="glow-p">Панель администратора</h2>
      <h3 class="glow-t" style="margin:20px 0 10px">Пользователи</h3>
      <table>
        <tr><th>Никнейм</th><th>Email</th><th>Роль</th><th>Статус</th><th>Действия</th></tr>
        ${state.users.map(u=>`<tr>
          <td>@${u.nickname}</td><td>${u.email}</td>
          <td><span class="tag ${u.role}">${u.role}</span></td>
          <td><span class="tag ${u.status}">${u.status}</span></td>
          <td>
            <button class="btn btn-ghost" onclick="banUser('${u.id}')">${u.status==='banned'?'Разбанить':'Забанить'}</button>
            <button class="btn btn-ghost" onclick="promoteUser('${u.id}')">${u.role==='admin'?'Снять админа':'Сделать админом'}</button>
            <button class="btn btn-ghost" onclick="deleteUser('${u.id}')">Удалить</button>
            <button class="btn btn-ghost" onclick="impersonateUser('${u.id}')">Войти как</button>
          </td>
        </tr>`).join("")}
      </table>

      <h3 class="glow-t" style="margin:28px 0 10px">Добавить урок</h3>
      <div class="card">
        <div class="form-row">
          <select id="newLang">${state.languages.map(l=>`<option value="${l.id}">${l.name}</option>`).join("")}</select>
          <input id="newTitle" placeholder="Название урока" />
        </div>
        <div class="form-row">
          <input id="newDesc" placeholder="Описание" />
          <input id="newTask" placeholder="Задание (task)" />
        </div>
        <div class="form-row">
          <textarea id="newContent" placeholder="Учебный блок / объяснение (markdown-подобный текст)" style="width:100%;min-height:80px"></textarea>
        </div>
        <button class="btn btn-primary" style="margin-top:12px" onclick="submitLesson()">Добавить урок</button>
        <button class="btn btn-danger" style="margin-top:12px;margin-left:8px;background:#8b2a5f;border-color:#6a1b47" onclick="resetCurriculumPrompt()">Сбросить курсы</button>
        <button class="btn btn-warning" style="margin-top:12px;margin-left:8px;background:#6a5f2a;border-color:#5a4f1b" onclick="deleteAllLessonsPrompt()">Удалить все уроки</button>
      </div>
    </section>`;
}
function submitLesson(){
  const lang=document.getElementById("newLang").value;
  const t=document.getElementById("newTitle").value.trim();
  const d=document.getElementById("newDesc").value.trim();
  const k=document.getElementById("newTask").value.trim();
  const c=document.getElementById("newContent").value.trim();
  if(!t){ alert("Введите название урока"); return; }
  addLesson(lang, t, d||"Новый урок", k||"Выполни задание", c||"");
  alert("Урок добавлен! Проверь раздел «Языки».");
}

// ============ МОДАЛКА ============
let authMode="login";
function openAuth(){ document.getElementById("authModal").classList.remove("hidden"); }
function closeAuth(){ if(!state.user) return; document.getElementById("authModal").classList.add("hidden"); }
function switchMode(){
  authMode = authMode==="login"?"register":"login";
  const reg=authMode==="register";
  document.getElementById("authTitle").textContent = reg?"Регистрация":"Вход в систему";
  document.getElementById("authSubmit").textContent = reg?"Создать аккаунт":"Войти";
  document.getElementById("nickname").classList.toggle("hidden", !reg);
  document.getElementById("switchText").textContent = reg?"Уже есть аккаунт?":"Нет аккаунта?";
  document.getElementById("switchAuth").textContent = reg?"Войти":"Зарегистрироваться";
}

// ============ НАВИГАЦИЯ ============
function go(view){ state.view=view; state.selectedLang=null; render(); window.scrollTo(0,0); }
function openLang(id){ state.view="languages"; state.selectedLang=id; render(); window.scrollTo(0,0); }
function backToLangs(){ state.selectedLang=null; render(); }
function setFilter(f){ state.filter=f; renderLanguages(); }
function escapeHtml(s){ return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

// ============ ИНИЦИАЛИЗАЦИЯ ============
document.querySelectorAll("[data-nav]").forEach(el=>el.addEventListener("click",e=>{e.preventDefault(); go(el.dataset.nav);}));
document.getElementById("openAuthBtn").addEventListener("click", openAuth);
document.getElementById("closeAuthBtn").addEventListener("click", closeAuth);
document.getElementById("logoutBtn").addEventListener("click", logout);
document.getElementById("switchAuth").addEventListener("click", e=>{e.preventDefault(); switchMode();});
document.getElementById("authForm").addEventListener("submit", e=>{
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const nickname = document.getElementById("nickname").value.trim();
  if(authMode === "register"){
    register(email, nickname, password);
  } else {
    login(email, password, nickname);
  }
});
document.getElementById("authModal").addEventListener("click", e=>{ if(e.target.id==="authModal" && state.user) closeAuth(); });

// бегущая строка
document.getElementById("ticker").textContent = "ASTRO_KODD_SYS_CONNECTED... PORT_ACTIVE... CODE_COMPILER_READY... NODE_SYNC_OK... WELCOME_CODER... ".repeat(6);

load();
render();

// Мисалы, колдонуучу киргенде ушул функцияны чакырасыз
function onLoginSuccess() {
    document.getElementById('openAuthBtn').classList.add('hidden'); // 'Войти' жашырылат
    document.getElementById('logoutBtn').classList.remove('hidden'); // 'Выйти' көрсөтүлөт
    document.querySelector('.user-badge').classList.remove('hidden'); // Имя көрсөтүлөт
    
    // Профиль менен Админканы да ушинтип ачасыз
    document.querySelector('.auth-only').classList.remove('hidden');
}

function markLearned(lessonId){
  state._learned[lessonId] = true;
  save();
  // Перерисуем, чтобы включить кнопку Запустить
  render();
  // Слегка подсветим элемент
  setTimeout(()=>{
    const btn = document.getElementById('run-'+lessonId);
    if(btn) btn.focus();
  },120);
}

function resetCurriculumPrompt(){
  if(!isAdmin()){ alert('Только админ может выполнять эту операцию.'); return; }
  if(!confirm('Вы уверены? Это удалит все языки и прогресс учеников.\nЭто действие необратимо.')) return;
  resetCurriculum();
}

function resetCurriculum(){
  // Очистим языки и прогресс
  state.languages = [];
  state.completed = [];
  state.xp = 0;
  state._passed = {};
  state._learned = {};
  save();
  render();
  alert('Курсы и прогресс успешно очищены.');
}

function deleteAllLessonsPrompt(){
  if(!isAdmin()){ alert('Только админ может выполнять эту операцию.'); return; }
  if(!confirm('Вы уверены? Это удалит все уроки во всех языках и сбросит прогресс.\nЭто действие необратимо.')) return;
  deleteAllLessons();
}

function deleteAllLessons(){
  // Удаляем уроки внутри каждого языка, но сами языки оставляем
  state.languages = state.languages.map(l => ({ ...l, lessons: [] }));
  state.completed = [];
  state.xp = 0;
  state._passed = {};
  state._learned = {};
  save();
  render();
  alert('Все уроки удалены. Теперь вы можете добавлять новые уроки с нуля.');
}