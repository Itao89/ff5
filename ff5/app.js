// Estado da aplicação
const state = {
    charLimit: 280,
    users: {
      '@voce': {
        name: 'Ítalo Paulo',
        handle: '@voce',
        initials: 'IP',
        color: ['from-purple-500', 'to-cyan-500'],
        bio: 'Olá! Acabei de chegar no SocialHub.',
        followers: 0,
        following: false
      }
    },
    posts: [],
    globalPosts: [],
    suggestions: [],
    notifications: [],
    unread: 0,
    messages: [],
    explore: {
      allHandles: [],
      filtered: [],
      page: 0,
      pageSize: 36
    }
  };
  
  // Função auxiliar
  const el = (s, r = document) => r.querySelector(s);
  
  // Atualizar contadores da sidebar
  function updateSidebarCounts() {
    const me = state.users['@voce'];
    el('#sidebarFollowersCount').textContent = new Intl.NumberFormat('pt-BR').format(me.followers || 0);
    const followingCount = Object.entries(state.users).filter(([h, u]) => h !== '@voce' && u.following).length;
    el('#sidebarFollowingCount').textContent = new Intl.NumberFormat('pt-BR').format(followingCount);
    el('#sidebarPostsCount').textContent = new Intl.NumberFormat('pt-BR').format(state.posts.length);
  }
  
  function updateFollowersUI() {
    const me = state.users['@voce'];
    const count = me?.followers || 0;
    const sidebarFollowers = el('#sidebarFollowersCount');
    if (sidebarFollowers) sidebarFollowers.textContent = new Intl.NumberFormat('pt-BR').format(count);
    const profileView = el('#profileView');
    if (profileView && !profileView.classList.contains('hidden') && el('#profileHandle')?.textContent === '@voce') {
      const pf = el('#profileFollowers');
      if (pf) pf.textContent = new Intl.NumberFormat('pt-BR').format(count);
    }
  }
  
  // Renderizar Feed
  function renderFeed() {
    const feed = el('#feed');
    feed.innerHTML = '';
  
    const followed = Object.entries(state.users).filter(([h, u]) => h !== '@voce' && u.following).map(([h]) => h);
    if (!followed.includes('@voce')) followed.push('@voce');
  
    const external = state.globalPosts.filter(p => followed.includes(p.author.handle));
    const all = [...state.posts, ...external];
  
    el('#feedNotice').classList.toggle('hidden', followed.length <= 1);
  
    if (all.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'text-center text-white/80 bg-white/5 rounded-xl p-6';
      empty.textContent = 'Seu feed está vazio. Siga pessoas e/ou publique algo para ver novidades!';
      feed.appendChild(empty);
      return;
    }
  
    all.forEach(post => {
      const likedClass = post.liked ? 'bg-white/20 text-white' : 'bg-white/10 text-white/90';
      const likeIcon = post.liked ? '❤️' : '🤍';
      const card = document.createElement('article');
      card.className = 'card rounded-2xl p-5 bg-slate-900/60 fade-in';
      card.setAttribute('data-id', post.id);
      card.innerHTML = `
        <div class="flex items-start gap-3">
          <button data-action="open-profile" data-handle="${post.author.handle}" class="w-11 h-11 rounded-full bg-gradient-to-br ${post.author.color.join(' ')} grid place-items-center text-white font-bold">${post.author.initials}</button>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-semibold text-white"><button data-action="open-profile" data-handle="${post.author.handle}" class="hover:underline">${post.author.name}</button></p>
                <p class="text-xs text-white/60"><button data-action="open-profile" data-handle="${post.author.handle}" class="hover:underline">${post.author.handle}</button> • ${post.time}</p>
              </div>
              <button class="px-2 py-1 rounded-lg hover:bg-white/10">•••</button>
            </div>
            <p class="mt-3 text-white/90 whitespace-pre-line">${post.text}</p>
            <div class="mt-4 flex items-center gap-2">
              <button data-action="like" class="px-3 py-1.5 rounded-lg ${likedClass} hover:bg-white/20 transition">${likeIcon} <span class="ml-1" data-like-count>${post.likes}</span></button>
              <button data-action="comment-toggle" class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white/90 transition">💬 Comentários <span class="ml-1 text-white/70">(${post.comments.length})</span></button>
              <button class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white/90 transition">🔗 Compartilhar</button>
            </div>
            <div class="mt-4 ${post.commentsOpen ? '' : 'hidden'}" data-comments>
              <div class="space-y-3" data-comments-list></div>
              <div class="flex items-center gap-2 mt-3">
                <input type="text" placeholder="Escreva um comentário..." class="flex-1 bg-white/10 text-white placeholder-white/60 rounded-xl py-2 px-3 border border-white/10 focus:border-white/20 ring-brand" data-comment-input>
                <button data-action="add-comment" class="brand-gradient text-white font-semibold px-3 py-2 rounded-xl hover:brightness-110 active:brightness-95 transition">Enviar</button>
              </div>
            </div>
          </div>
        </div>`;
      feed.appendChild(card);
    });
  }
  
  // Renderizar Explorar
  function renderExplore(reset = false) {
    const grid = el('#exploreGrid');
    if (reset) {
      grid.innerHTML = '';
      state.explore.page = 0;
    }
    const list = (state.explore.filtered.length ? state.explore.filtered : state.explore.allHandles);
    const start = state.explore.page * state.explore.pageSize;
    const items = list.slice(start, start + state.explore.pageSize);
  
    items.forEach(handle => {
      const u = state.users[handle];
      if (!u) return;
      const card = document.createElement('div');
      card.className = 'bg-white/5 rounded-xl p-3 flex items-center gap-3';
      card.innerHTML = `
        <button data-action="open-profile" data-handle="${u.handle}" class="w-10 h-10 rounded-full bg-gradient-to-br ${u.color.join(' ')} grid place-items-center text-white font-bold text-sm">${u.initials}</button>
        <div class="min-w-0 flex-1">
          <p class="font-semibold text-white truncate"><button data-action="open-profile" data-handle="${u.handle}" class="hover:underline">${u.name}</button></p>
          <p class="text-xs text-white/60 truncate"><button data-action="open-profile" data-handle="${u.handle}" class="hover:underline">${u.handle}</button></p>
        </div>
        <button data-action="follow-user" data-handle="${u.handle}" class="px-3 py-1.5 rounded-lg ${u.following ? 'bg-white/20 text-white' : 'brand-gradient text-white'} font-semibold hover:brightness-110 active:brightness-95 transition">${u.following ? 'Seguindo' : 'Seguir'}</button>
      `;
      grid.appendChild(card);
    });
  
    state.explore.page++;
    const btnMore = el('#exploreLoadMore');
    btnMore.disabled = (start + items.length) >= list.length;
    btnMore.classList.toggle('opacity-50', btnMore.disabled);
  }
  
  // Renderizar Sugestões
  function renderSuggestions() {
    const wrap = el('#suggestions');
    wrap.innerHTML = '';
    const pool = state.explore.allHandles.slice(0).sort(() => Math.random() - 0.5).slice(0, 6);
    pool.forEach(handle => {
      const u = state.users[handle];
      if (!u) return;
      const row = document.createElement('div');
      row.className = 'flex items-center gap-3 bg-white/5 rounded-xl p-3';
      row.innerHTML = `
        <button data-action="open-profile" data-handle="${u.handle}" class="w-10 h-10 rounded-full bg-gradient-to-br ${u.color.join(' ')} grid place-items-center text-white font-bold text-sm">${u.initials}</button>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-white truncate"><button data-action="open-profile" data-handle="${u.handle}" class="hover:underline">${u.name}</button></p>
          <p class="text-xs text-white/60 truncate"><button data-action="open-profile" data-handle="${u.handle}" class="hover:underline">${u.handle}</button></p>
        </div>
        <button data-action="follow-user" data-handle="${u.handle}" class="px-3 py-1.5 rounded-lg ${u.following ? 'bg-white/20 text-white' : 'brand-gradient text-white'} font-semibold hover:brightness-110 active:brightness-95 transition">${u.following ? 'Seguindo' : 'Seguir'}</button>
      `;
      wrap.appendChild(row);
    });
  }
  
  // Renderizar Notificações
  function renderNotifications() {
    renderFollowersToFollow();
    const list = el('#notificationsList');
    list.innerHTML = '';
    const hint = document.createElement('div');
    hint.className = 'text-sm text-white/70 bg-white/5 rounded-xl p-3 mb-3';
    hint.textContent = 'Dica: toque em uma notificação para marcar como lida. Use "Seguir todos" para ver os posts dessas pessoas no seu feed.';
    list.appendChild(hint);
  
    if (state.notifications.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'text-center text-white/70 bg-white/5 rounded-xl p-6';
      empty.textContent = 'Sem notificações no momento.';
      list.appendChild(empty);
    } else {
      state.notifications.forEach(n => {
        const item = document.createElement('div');
        item.className = `flex items-start gap-3 bg-white/5 rounded-xl p-3 ${n.read ? 'opacity-70' : ''}`;
        item.setAttribute('data-id', n.id);
        item.innerHTML = `
          <div class="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 grid place-items-center">🔔</div>
          <div class="flex-1">
            <p class="text-sm text-white/90">${n.text}</p>
            <p class="text-xs text-white/60 mt-1">${n.time}</p>
          </div>
          <button data-action="read-toggle" class="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-xs">
            ${n.read ? 'Marcar não lida' : 'Marcar lida'}
          </button>`;
        list.appendChild(item);
      });
    }
  
    const badge = el('#notificationBadge');
    badge.textContent = state.unread;
    badge.style.display = state.unread > 0 ? 'grid' : 'none';
  }
  
  function renderFollowersToFollow() {
    const box = el('#followersList');
    if (!box) return;
    box.innerHTML = '';
    const followerNotifs = state.notifications.filter(n => n.text.includes('começou a seguir você'));
    const seen = new Set();
    followerNotifs.forEach(n => {
      const who = n.text.replace(' começou a seguir você', '').trim();
      if (seen.has(who)) return;
      seen.add(who);
      const user = Object.values(state.users).find(u => u.name === who);
      if (!user) return;
      const row = document.createElement('div');
      row.className = 'flex items-center gap-3';
      row.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-gradient-to-br ${user.color.join(' ')} grid place-items-center text-white text-xs font-bold">${user.initials}</div>
        <div class="flex-1">
          <p class="text-sm text-white/90">${user.name} <span class="text-white/50">${user.handle}</span></p>
        </div>
        <button data-handle="${user.handle}" class="px-3 py-1.5 rounded-lg ${user.following ? 'bg-white/20 text-white' : 'brand-gradient text-white'} font-semibold hover:brightness-110 active:brightness-95 transition" data-action="follow-back">${user.following ? 'Seguindo' : 'Seguir'}</button>
      `;
      box.appendChild(row);
    });
  
    box.onclick = (e) => {
      const btn = e.target.closest('button[data-action="follow-back"]');
      if (!btn) return;
      const handle = btn.getAttribute('data-handle');
      const u = state.users[handle];
      if (!u) return;
      u.following = !u.following;
      btn.textContent = u.following ? 'Seguindo' : 'Seguir';
      btn.className = `px-3 py-1.5 rounded-lg ${u.following ? 'bg-white/20 text-white' : 'brand-gradient text-white'} font-semibold hover:brightness-110 active:brightness-95 transition`;
      updateSidebarCounts();
      renderFeed();
    };
  }
  
  // Toggle de Painéis
  function togglePanel(id, force) {
    const panel = el('#' + id);
    const shown = panel.classList.contains('translate-x-0');
    const shouldShow = typeof force === 'boolean' ? force : !shown;
    panel.classList.toggle('translate-x-0', shouldShow);
    panel.classList.toggle('translate-x-full', !shouldShow);
  }
  
  // Abrir Perfil
  function openProfile(handle) {
    const u = state.users[handle];
    if (!u) return;
    el('#exploreView').classList.add('hidden');
    el('#profileView').classList.remove('hidden');
    el('#composerCard').classList.add('hidden');
    el('#feed').classList.add('hidden');
    el('#backArrow').classList.remove('hidden');
  
    const avatar = el('#profileAvatar');
    avatar.className = `w-16 h-16 rounded-full grid place-items-center text-white font-bold bg-gradient-to-br ${u.color.join(' ')}`;
    avatar.textContent = u.initials;
    el('#profileName').textContent = u.name;
    el('#profileHandle').textContent = u.handle;
    el('#profileBio').textContent = u.bio || 'Sem bio ainda.';
    el('#profileFollowers').textContent = new Intl.NumberFormat('pt-BR').format(u.followers || 0);
    el('#profileFollowing').textContent = u.following ? 'Você segue' : 'Não segue';
  
    const postsWrap = el('#profilePosts');
    postsWrap.innerHTML = '';
    const userPosts = [
      ...state.posts.filter(p => p.author.handle === handle),
      ...state.globalPosts.filter(p => p.author.handle === handle)
    ];
    el('#profilePostsCount').textContent = userPosts.length;
    if (userPosts.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'text-center text-white/70 bg-white/5 rounded-xl p-6';
      empty.textContent = 'Ainda sem postagens.';
      postsWrap.appendChild(empty);
    } else {
      userPosts.forEach(p => {
        const card = document.createElement('article');
        card.className = 'card rounded-2xl p-5 bg-slate-900/60 fade-in';
        card.innerHTML = `<p class='text-sm text-white/60 mb-2'>${p.time}</p><p class='text-white/90 whitespace-pre-line'>${p.text}</p>`;
        postsWrap.appendChild(card);
      });
    }
  
    const btn = el('#profileFollowBtn');
    btn.textContent = u.following ? 'Seguindo' : 'Seguir';
    btn.className = `${u.following ? 'bg-white/20 text-white' : 'brand-gradient text-white'} font-semibold px-4 py-2 rounded-xl hover:brightness-110 active:brightness-95 transition`;
    btn.onclick = () => {
      u.following = !u.following;
      btn.textContent = u.following ? 'Seguindo' : 'Seguir';
      btn.className = `${u.following ? 'bg-white/20 text-white' : 'brand-gradient text-white'} font-semibold px-4 py-2 rounded-xl hover:brightness-110 active:brightness-95 transition`;
      updateSidebarCounts();
      renderFeed();
    };
  
    el('#backToFeed').onclick = () => {
      el('#profileView').classList.add('hidden');
      el('#composerCard').classList.remove('hidden');
      el('#feed').classList.remove('hidden');
      el('#backArrow').classList.add('hidden');
    };
  }
  
  // Funções auxiliares para gerar dados aleatórios
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  
  // Gerar usuários aleatórios
  function generateRandomUsers(count = 2000) {
    const firstNames = ['Ana', 'Bruno', 'Camila', 'Diego', 'Eduarda', 'Felipe', 'Gabriela', 'Henrique', 'Isabela', 'João', 'Katia', 'Lucas', 'Marina', 'Nina', 'Otávio', 'Paula', 'Rafael', 'Sofia', 'Tiago', 'Vitória', 'Yuri', 'Zélia'];
    const lastNames = ['Almeida', 'Barbosa', 'Cardoso', 'Dias', 'Esteves', 'Ferreira', 'Gomes', 'Henrique', 'Ivo', 'Jardim', 'Leal', 'Mendes', 'Nascimento', 'Oliveira', 'Prado', 'Queiroz', 'Rocha', 'Souza', 'Teixeira', 'Uchoa', 'Vieira', 'Xavier', 'Zanine'];
    const colors = [
      ['from-blue-500', 'to-cyan-500'],
      ['from-emerald-500', 'to-teal-500'],
      ['from-indigo-500', 'to-purple-500'],
      ['from-pink-500', 'to-rose-500'],
      ['from-amber-500', 'to-orange-500'],
      ['from-sky-500', 'to-blue-500'],
      ['from-lime-500', 'to-emerald-500'],
      ['from-violet-500', 'to-fuchsia-500']
    ];
    const bios = [
      'Amante de café e boas conversas.',
      'Design, música e livros.',
      'Tecnologia e curiosidades.',
      'Fotografia e viagens.',
      'Dev front-end em construção.',
      'Minimalismo e produtividade.',
      'UX/UI e animações sutis.',
      'Esportes e saúde.'
    ];
    const sampleTexts = [
      'Testando ideias novas para 2025. 🚀',
      'Começando a semana com café forte! ☕',
      'Alguém indica um bom livro?',
      'Organizando minha rotina com blocos de tempo. ⏱️',
      'Novo app de notas favorito! 📝',
      'Dia lindo para aprender algo novo. 🌤️',
      'Explorando micro interações no design. ✨',
      'Foco e constância. 💪'
    ];
  
    for (let i = 0; i < count; i++) {
      const fn = pick(firstNames);
      const ln = pick(lastNames);
      const name = `${fn} ${ln}`;
      const handle = '@' + (fn + ln + randomInt(10, 9999)).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
      if (state.users[handle]) {
        i--;
        continue;
      }
      const initials = (fn[0] + ln[0]).toUpperCase();
      const color = pick(colors);
      state.users[handle] = {
        name,
        handle,
        initials,
        color,
        bio: pick(bios),
        followers: randomInt(0, 5000),
        following: false
      };
    }
  
    state.explore.allHandles = Object.keys(state.users).filter(h => h !== '@voce');
  
    let gid = 1;
    state.explore.allHandles.forEach(h => {
      const postCount = Math.random() < 0.25 ? 1 : (Math.random() < 0.07 ? 2 : 0);
      for (let p = 0; p < postCount; p++) {
        const u = state.users[h];
        state.globalPosts.push({
          id: 'g' + (gid++),
          author: {
            name: u.name,
            handle: u.handle,
            initials: u.initials,
            color: u.color
          },
          time: randomInt(1, 59) + ' min',
          text: pick(sampleTexts),
          likes: randomInt(0, 120),
          liked: false,
          commentsOpen: false,
          comments: []
        });
      }
    });
  
    renderSuggestions();
  }
  
  // Configurar eventos
  function setupEvents() {
    el('#btnMessages').addEventListener('click', () => togglePanel('panelMessages'));
    el('#btnNotifications').addEventListener('click', () => togglePanel('panelNotifications'));
    el('#btnExplore').addEventListener('click', () => {
      el('#exploreView').classList.remove('hidden');
      el('#profileView').classList.add('hidden');
      el('#feed').classList.remove('hidden');
      el('#composerCard').classList.remove('hidden');
      el('#backArrow').classList.add('hidden');
      renderExplore(true);
    });
    el('#shortcutExplore').addEventListener('click', () => el('#btnExplore').click());
  
    el('#exploreSearch').addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (!q) {
        state.explore.filtered = [];
        renderExplore(true);
        return;
      }
      state.explore.filtered = state.explore.allHandles.filter(h => {
        const u = state.users[h];
        return (u.name + ' ' + u.handle).toLowerCase().includes(q);
      });
      renderExplore(true);
    });
    el('#exploreClear').addEventListener('click', () => {
      el('#exploreSearch').value = '';
      state.explore.filtered = [];
      renderExplore(true);
    });
    el('#exploreLoadMore').addEventListener('click', () => renderExplore(false));
  
    function showSearchResults(query) {
      const q = (query || '').toLowerCase().trim();
      const box = el('#searchResults');
      if (!box) return;
      if (!q) {
        box.innerHTML = '<div class="p-3 text-sm text-white/60">Digite para encontrar pessoas…</div>';
        box.classList.remove('hidden');
        return;
      }
      const profiles = Object.values(state.users)
        .filter(u => (u.name + ' ' + u.handle).toLowerCase().includes(q))
        .slice(0, 12);
      box.classList.remove('hidden');
      box.innerHTML = profiles.length ? '' : '<div class="p-3 text-sm text-white/60">Nenhum perfil encontrado</div>';
      profiles.forEach(u => {
        const row = document.createElement('button');
        row.type = 'button';
        row.className = 'w-full text-left p-3 hover:bg-white/10 flex items-center gap-3';
        row.setAttribute('data-handle', u.handle);
        row.innerHTML = `
          <div class='w-9 h-9 rounded-full bg-gradient-to-br ${u.color.join(' ')} grid place-items-center text-white font-bold text-xs'>${u.initials}</div>
          <div class='min-w-0'>
            <p class='font-semibold text-white truncate'>${u.name}</p>
            <p class='text-xs text-white/60 truncate'>${u.handle}</p>
          </div>
          <div class='ml-auto ${u.following ? 'text-emerald-400' : 'text-white/60'} text-xs'>${u.following ? 'Seguindo' : ''}</div>
        `;
        row.addEventListener('click', () => {
          box.classList.add('hidden');
          openProfile(u.handle);
        });
        box.appendChild(row);
      });
    }
    el('#searchInput')?.addEventListener('input', (e) => showSearchResults(e.target.value));
    el('#searchIconBtn')?.addEventListener('click', () => showSearchResults(el('#searchInput')?.value || ''));
    document.addEventListener('click', (e) => {
      const box = el('#searchResults');
      const input = el('#searchInput');
      const btn = el('#searchIconBtn');
      if (!box || !input) return;
      if (!box.contains(e.target) && e.target !== input && e.target !== btn) box.classList.add('hidden');
    });
  
    document.addEventListener('click', (e) => {
      const open = e.target.closest('button[data-action="open-profile"]');
      if (open) {
        openProfile(open.getAttribute('data-handle'));
        return;
      }
  
      const followBtn = e.target.closest('button[data-action="follow-user"]');
      if (followBtn) {
        const handle = followBtn.getAttribute('data-handle');
        const u = state.users[handle];
        if (!u) return;
        u.following = !u.following;
        followBtn.textContent = u.following ? 'Seguindo' : 'Seguir';
        followBtn.className = `px-3 py-1.5 rounded-lg ${u.following ? 'bg-white/20 text-white' : 'brand-gradient text-white'} font-semibold hover:brightness-110 active:brightness-95 transition`;
        updateSidebarCounts();
        renderFeed();
        return;
      }
    });
  
    const composer = el('#composer');
    const btnPublish = el('#btnPublish');
    const charCount = el('#charCount');
    composer.addEventListener('input', () => {
      const len = composer.value.trim().length;
      charCount.textContent = `${len}/${state.charLimit}`;
      btnPublish.disabled = len === 0 || len > state.charLimit;
    });
    btnPublish.addEventListener('click', () => {
      const text = composer.value.trim();
      if (!text || text.length > state.charLimit) return;
      state.posts.unshift({
        id: 'p' + Date.now(),
        author: {
          name: 'Ítalo Paulo',
          handle: '@voce',
          initials: 'IP',
          color: ['from-purple-500', 'to-cyan-500']
        },
        time: 'agora',
        text,
        likes: 0,
        liked: false,
        commentsOpen: false,
        comments: []
      });
      composer.value = '';
      charCount.textContent = `0/${state.charLimit}`;
      btnPublish.disabled = true;
      updateSidebarCounts();
      renderFeed();
    });
  
    el('#feed').addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const card = e.target.closest('article[data-id]');
      const action = btn.getAttribute('data-action');
  
      if (action === 'like') {
        const id = card.getAttribute('data-id');
        const post = state.posts.find(p => p.id === id) || state.globalPosts.find(p => p.id === id);
        if (!post) return;
        post.liked = !post.liked;
        post.likes += post.liked ? 1 : -1;
        btn.className = `px-3 py-1.5 rounded-lg ${post.liked ? 'bg-white/20 text-white' : 'bg-white/10 text-white/90'} hover:bg-white/20 transition`;
        btn.innerHTML = `${post.liked ? '❤️' : '🤍'} <span class="ml-1" data-like-count>${post.likes}</span>`;
      }
  
      if (action === 'comment-toggle') {
        const id = card.getAttribute('data-id');
        const post = state.posts.find(p => p.id === id) || state.globalPosts.find(p => p.id === id);
        if (!post) return;
        post.commentsOpen = !post.commentsOpen;
        card.querySelector('[data-comments]').classList.toggle('hidden', !post.commentsOpen);
      }
  
      if (action === 'add-comment') {
        const id = card.getAttribute('data-id');
        const post = state.posts.find(p => p.id === id) || state.globalPosts.find(p => p.id === id);
        const input = card.querySelector('[data-comment-input]');
        const txt = input.value.trim();
        if (!txt) return;
        post.comments.push({
          id: 'c' + Date.now(),
          author: 'Você',
          text: txt
        });
        input.value = '';
        const list = card.querySelector('[data-comments-list]');
        const item = document.createElement('div');
        item.className = 'flex items-start gap-3';
        item.innerHTML = `
          <div class="w-8 h-8 rounded-full bg-white/10 grid place-items-center text-white/80 text-xs">👤</div>
          <div class="flex-1 bg-white/5 rounded-xl p-3">
            <p class="text-sm"><span class="font-semibold">Você</span> ${txt}</p>
          </div>`;
        list.appendChild(item);
        const toggleBtn = card.querySelector('button[data-action="comment-toggle"]');
        toggleBtn.innerHTML = `💬 Comentários <span class="ml-1 text-white/70">(${post.comments.length})</span>`;
      }
    });
  
    el('#notificationsList').addEventListener('click', (e) => {
      const row = e.target.closest('[data-id]');
      if (!row) return;
      const id = row.getAttribute('data-id');
      const n = state.notifications.find(x => x.id === id);
      const toggleBtn = e.target.closest('button[data-action="read-toggle"]');
      if (toggleBtn) n.read = !n.read;
      else if (!n.read) n.read = true;
      state.unread = state.notifications.filter(x => !x.read).length;
      renderNotifications();
    });
    el('#markAllRead').addEventListener('click', () => {
      state.notifications.forEach(n => n.read = true);
      state.unread = 0;
      renderNotifications();
    });
    el('#btnFollowBackAll').addEventListener('click', () => {
      const followerNotifs = state.notifications.filter(n => n.text.includes('começou a seguir você'));
      followerNotifs.forEach(n => {
        const whoName = n.text.replace(' começou a seguir você', '').trim();
        const u = Object.values(state.users).find(x => x.name === whoName);
        if (u && !u.following) u.following = true;
      });
      updateSidebarCounts();
      renderFollowersToFollow();
      renderFeed();
    });
  
    el('#viewOwnProfile').addEventListener('click', () => openProfile('@voce'));
    el('#btnProfileAvatar').addEventListener('click', () => openProfile('@voce'));
    el('#btnProfile').addEventListener('click', (e) => {
      const target = e.target.closest('[data-action="open-profile"]');
      if (target) openProfile(target.getAttribute('data-handle'));
    });
    el('#backArrow').addEventListener('click', () => {
      el('#profileView').classList.add('hidden');
      el('#exploreView').classList.add('hidden');
      el('#composerCard').classList.remove('hidden');
      el('#feed').classList.remove('hidden');
      el('#backArrow').classList.add('hidden');
    });
  
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        togglePanel('panelMessages', false);
        togglePanel('panelNotifications', false);
      }
    });
  }
  
  // Inicialização
  function init() {
    generateRandomUsers(2000);
    renderFeed();
    renderSuggestions();
    renderNotifications();
    updateSidebarCounts();
    setupEvents();
  
    setInterval(() => {
      const candidates = Object.values(state.users).filter(u => u.handle !== '@voce');
      if (candidates.length === 0) return;
      const who = candidates[Math.floor(Math.random() * candidates.length)];
      state.users['@voce'].followers = Math.max(0, (state.users['@voce'].followers || 0) + 1);
      state.notifications.unshift({
        id: 'n' + Date.now(),
        text: `${who.name} começou a seguir você`,
        time: 'agora',
        read: false
      });
      state.unread++;
      renderNotifications();
      renderFollowersToFollow();
      updateFollowersUI();
    }, 30000);
  }
  
  init();