/*
 * Conquistas demonstrativas.
 * A observação não grava notas, XP ou recompensas.
 */
(() => {
  'use strict';

  if (document.body.dataset.achievementsInitialized) return;

  document.body.dataset.achievementsInitialized = 'true';

  const $ = id => document.getElementById(id);

  const achievements = [
    {
      name: 'Primeira descoberta',
      criterion: 'Conclua sua primeira missão.',
      description:
        'O primeiro passo da sua jornada: transformar curiosidade em ação.',
      earned: true,
      current: 1,
      total: 1
    },
    {
      name: 'Mente investigadora',
      criterion: 'Finalize uma pesquisa.',
      description:
        'Observe, faça perguntas e registre as evidências que encontrou.',
      earned: true,
      current: 1,
      total: 1
    },
    {
      name: 'Criatividade em órbita',
      criterion: 'Entregue sua primeira criação.',
      description:
        'Ideias ganham vida quando você constrói, desenha e experimenta.',
      earned: true,
      current: 1,
      total: 1
    },
    {
      name: 'Explorador curioso',
      criterion: 'Complete 5 missões.',
      description:
        'Explore novos assuntos e amplie seu repertório de descobertas.',
      earned: false,
      current: 3,
      total: 5
    },
    {
      name: 'Engenheiro espacial',
      criterion: 'Conclua uma missão de robótica.',
      description:
        'Use tecnologia e investigação para resolver um desafio.',
      earned: false,
      current: 0,
      total: 1
    },
    {
      name: 'Tripulação unida',
      criterion: 'Conclua uma atividade em equipe.',
      description:
        'Esta conquista reconhece a colaboração em uma atividade coletiva. Missões individuais continuam valendo para as demais conquistas.',
      earned: false,
      current: 0,
      total: 1
    }
  ];

  const facts = [
    {
      title: 'Anéis de gelo e rocha',
      text:
        'Os anéis de Saturno são formados por incontáveis fragmentos de gelo e rocha.'
    },
    {
      title: 'Um ano bem longo',
      text:
        'Saturno leva cerca de 29,4 anos terrestres para completar uma volta ao redor do Sol.'
    },
    {
      title: 'Um gigante gasoso',
      text:
        'Saturno é formado principalmente por hidrogênio e hélio. Ele não tem uma superfície sólida onde uma nave possa pousar.'
    }
  ];

  let filter = 'all';

  const openers = new WeakMap();
  const scope = $('telescope');

  function element(tag, text = '', className = '') {
    const node = document.createElement(tag);

    node.textContent = text;
    node.className = className;

    return node;
  }

  function state(achievement) {
    return achievement.earned
      ? 'Conquistada'
      : achievement.current > 0
        ? 'Em progresso'
        : 'Bloqueada';
  }

  function show(dialog, trigger) {
    openers.set(
      dialog,
      trigger || document.activeElement
    );

    if (!dialog.open) {
      dialog.showModal();
    }

    dialog.querySelector('button')?.focus();
  }

  function detail(index, trigger) {
    const achievement = achievements[index];

    $('detailTitle').textContent = achievement.name;

    $('detailBadge').className =
      'badge badge-' + index;

    $('detailBadge').style.filter =
      !achievement.earned && !achievement.current
        ? 'grayscale(1)'
        : '';

    $('detailStatus').textContent =
      state(achievement).toUpperCase() + ' · EXEMPLO';

    $('detailDescription').textContent =
      achievement.description;

    $('detailCriterion').textContent =
      achievement.criterion;

    $('detailProgress').textContent = achievement.earned
      ? 'Objetivo alcançado neste exemplo.'
      : `${achievement.current} de ${achievement.total} etapas concluídas neste exemplo.`;

    show($('details'), trigger);
  }

  function render() {
    const grid = $('collection');

    grid.replaceChildren();

    let count = 0;

    achievements.forEach((achievement, index) => {
      if (
        filter === 'earned' &&
        !achievement.earned
      ) {
        return;
      }

      if (
        filter === 'progress' &&
        (
          achievement.earned ||
          !achievement.current
        )
      ) {
        return;
      }

      count++;

      const status = state(achievement);

      const card = element(
        'button',
        '',
        'achievement ' + (
          achievement.earned
            ? 'earned'
            : achievement.current
              ? 'in-progress'
              : 'locked'
        )
      );

      card.type = 'button';

      card.setAttribute(
        'aria-label',
        `${achievement.name}. ${status}. Ver critérios demonstrativos.`
      );

      const badge = element(
        'span',
        '',
        'badge badge-' + index
      );

      badge.setAttribute('aria-hidden', 'true');

      const copy = element(
        'span',
        '',
        'achievement-copy'
      );

      const pill = element('span', '', 'state');

      const icon = element(
        'span',
        achievement.earned
          ? '✓'
          : achievement.current
            ? '↗'
            : '⌑'
      );

      icon.setAttribute('aria-hidden', 'true');

      pill.append(
        icon,
        element('span', status)
      );

      copy.append(
        element('strong', achievement.name),
        element(
          'span',
          achievement.criterion,
          'achievement-description'
        ),
        pill
      );

      if (
        !achievement.earned &&
        achievement.current
      ) {
        const progress = element(
          'span',
          '',
          'card-progress'
        );

        const bar = document.createElement('progress');

        bar.value = achievement.current;
        bar.max = achievement.total;

        bar.setAttribute(
          'aria-label',
          `Progresso demonstrativo de ${achievement.name}`
        );

        progress.append(
          element(
            'span',
            `${achievement.current} / ${achievement.total}`
          ),
          bar
        );

        copy.append(progress);
      }

      card.append(badge, copy);

      card.addEventListener('click', () => {
        detail(index, card);
      });

      grid.append(card);
    });

    $('resultCount').textContent =
      `${count} conquistas exibidas.`;
  }

  const next = achievements[3];

  $('earnedCount').textContent =
    `${achievements.filter(a => a.earned).length} conquistas desbloqueadas`;

  $('nextTitle').textContent = next.name;
  $('nextCriterion').textContent = next.criterion;

  $('nextProgressLabel').textContent =
    `${next.current} de ${next.total} missões`;

  $('goalProgress').value = next.current;
  $('goalProgress').max = next.total;

  document.querySelectorAll('[data-filter]').forEach(button => {
    button.addEventListener('click', () => {
      filter = button.dataset.filter;

      document.querySelectorAll('[data-filter]').forEach(item => {
        item.setAttribute(
          'aria-pressed',
          String(item === button)
        );
      });

      render();
    });
  });

  document.querySelectorAll('[data-close]').forEach(button => {
    button.addEventListener('click', () => {
      button.closest('dialog').close();
    });
  });

  [$('details'), scope].forEach(dialog => {
    dialog.addEventListener('close', () => {
      const opener = openers.get(dialog);

      if (opener?.isConnected) {
        opener.focus({ preventScroll: true });
      }
    });
  });

  $('details').addEventListener('click', event => {
    if (event.target !== $('details')) return;

    const rect = $('details').getBoundingClientRect();

    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    ) {
      $('details').close();
    }
  });

  /*
   * Observação ilustrativa.
   * O zoom não representa ampliação astronômica calibrada.
   */
  function setZoom(value) {
    const zoom = Math.max(
      80,
      Math.min(145, Number(value) || 100)
    );

    $('scopeZoom').value = zoom;

    $('zoomValue').textContent =
      (zoom / 100).toLocaleString('pt-BR', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 2
      }) + '×';

    $('scopeZoom').setAttribute(
      'aria-valuetext',
      $('zoomValue').textContent
    );

    scope.style.setProperty(
      '--scope-zoom',
      zoom / 100
    );
  }

  function selectFact(index) {
    const fact = facts[index];

    if (!fact) return;

    $('factTitle').textContent = fact.title;
    $('factText').textContent = fact.text;

    scope.querySelectorAll('[data-fact]').forEach(button => {
      button.setAttribute(
        'aria-pressed',
        String(Number(button.dataset.fact) === index)
      );
    });
  }

  $('scopeZoom').addEventListener('input', event => {
    setZoom(event.target.value);
  });

  $('resetZoom').addEventListener('click', () => {
    setZoom(100);
    $('scopeZoom').focus();
  });

  scope.querySelectorAll('[data-fact]').forEach(button => {
    button.addEventListener('click', () => {
      selectFact(Number(button.dataset.fact));
    });
  });

  $('openTelescope').addEventListener('click', () => {
    setZoom(100);
    selectFact(0);

    show(scope, $('openTelescope'));

    document.body.classList.add('scope-open');

    resize();
    sync();
  });

  $('closeTelescope').addEventListener('click', () => {
    scope.close();
  });

  scope.addEventListener('close', () => {
    document.body.classList.remove('scope-open');

    pointer.x = pointer.y = -999;

    sync();
  });

  const image = $('saturnImage');

  function imageError() {
    $('scopeIntro').textContent =
      'A ilustração não carregou. Verifique a imagem saturno-observacao.png; as curiosidades continuam disponíveis.';
  }

  image.addEventListener('error', imageError);

  if (image.complete && !image.naturalWidth) {
    imageError();
  }

  /* Uma única animação para os dois campos de estrelas. */

  const media = matchMedia(
    '(prefers-reduced-motion: reduce)'
  );

  const pointer = {
    x: -999,
    y: -999
  };

  const pageCanvas = $('achievementStars');
  const scopeCanvas = $('scopeStars');

  const pageCtx = pageCanvas.getContext('2d');
  const scopeCtx = scopeCanvas.getContext('2d');

  let frame = 0;
  let last = 0;
  let pageWidth = 0;
  let pageHeight = 0;
  let scopeWidth = 0;
  let scopeHeight = 0;

  const points = [];
  const scopePoints = [];

  const stopped = () =>
    media.matches ||
    document.body.classList.contains('astro-motion-off') ||
    document.hidden;

  function point(
    width,
    height,
    x = Math.random() * width,
    y = Math.random() * height,
    born = false
  ) {
    return {
      x,
      y,
      r: .45 + Math.random() * 1.15,
      vx: 0,
      vy: 0,
      speed: 5 + Math.random() * 9,
      age: 0,
      born,
      pin: born ? .8 : 0
    };
  }

  function size(canvas, ctx, width, height) {
    if (!ctx) return;

    const dpr = Math.min(
      devicePixelRatio || 1,
      1.5
    );

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function resize() {
    pageWidth = innerWidth;
    pageHeight = innerHeight;

    size(
      pageCanvas,
      pageCtx,
      pageWidth,
      pageHeight
    );

    points.length = 0;

    const count = innerWidth < 600 ? 24 : 42;

    for (let i = 0; i < count; i++) {
      points.push(point(pageWidth, pageHeight));
    }

    if (scope.open) {
      const rect = scopeCanvas.getBoundingClientRect();

      scopeWidth = rect.width;
      scopeHeight = rect.height;

      size(
        scopeCanvas,
        scopeCtx,
        scopeWidth,
        scopeHeight
      );

      scopePoints.length = 0;

      for (let i = 0; i < 110; i++) {
        scopePoints.push(
          point(scopeWidth, scopeHeight)
        );
      }
    }

    draw(0);
  }

  function field(
    ctx,
    list,
    width,
    height,
    dt,
    observation
  ) {
    if (!ctx || !width || !height) return;

    ctx.clearRect(0, 0, width, height);

    for (let i = list.length - 1; i >= 0; i--) {
      const particle = list[i];

      particle.age += dt;

      if (particle.born && particle.age > 12) {
        list.splice(i, 1);
        continue;
      }

      if (dt && particle.pin <= 0) {
        if (!observation) {
          const dx = particle.x - pointer.x;
          const dy = particle.y - pointer.y;
          const distance = Math.hypot(dx, dy);

          if (distance < 130 && distance > 0) {
            const force =
              (1 - distance / 130) * 175;

            particle.vx +=
              dx / distance * force * dt;

            particle.vy +=
              dy / distance * force * dt;
          }
        }

        particle.vx *= Math.exp(-3 * dt);
        particle.vy *= Math.exp(-3 * dt);

        particle.x += (
          particle.speed * (observation ? .3 : 1) +
          particle.vx
        ) * dt;

        particle.y += (
          -particle.speed * .12 +
          particle.vy
        ) * dt;

        if (particle.x > width + 5) {
          particle.x = -5;
        }

        if (particle.x < -10) {
          particle.x = width + 5;
        }

        if (particle.y < -5) {
          particle.y = height + 5;
        }

        if (particle.y > height + 10) {
          particle.y = -5;
        }
      } else {
        particle.pin -= dt;
      }

      const alpha = particle.born
        ? Math.min(.9, (12 - particle.age) / 3)
        : observation
          ? .3 + .3 * Math.sin(particle.age * .7 + i) ** 2
          : .4;

      ctx.fillStyle =
        observation || particle.born
          ? `rgba(246,237,220,${alpha})`
          : `rgba(173,154,191,${alpha * .45})`;

      ctx.beginPath();

      ctx.arc(
        particle.x,
        particle.y,
        particle.r,
        0,
        Math.PI * 2
      );

      ctx.fill();

      if (particle.born) {
        ctx.strokeStyle =
          `rgba(239,218,255,${alpha})`;

        ctx.lineWidth = .7;

        ctx.beginPath();

        ctx.moveTo(particle.x - 4, particle.y);
        ctx.lineTo(particle.x + 4, particle.y);

        ctx.moveTo(particle.x, particle.y - 4);
        ctx.lineTo(particle.x, particle.y + 4);

        ctx.stroke();
      }
    }
  }

  function draw(dt) {
    if (scope.open) {
      field(
        scopeCtx,
        scopePoints,
        scopeWidth,
        scopeHeight,
        dt,
        true
      );
    } else {
      field(
        pageCtx,
        points,
        pageWidth,
        pageHeight,
        dt,
        false
      );
    }
  }

  function tick(now) {
    frame = 0;

    if (stopped()) return;

    const dt = last
      ? Math.min((now - last) / 1000, .04)
      : 0;

    last = now;

    draw(dt);

    frame = requestAnimationFrame(tick);
  }

  function sync() {
    cancelAnimationFrame(frame);

    frame = 0;
    last = 0;

    draw(0);

    if (!stopped() && (pageCtx || scopeCtx)) {
      frame = requestAnimationFrame(tick);
    }
  }

  addEventListener('pointermove', event => {
    if (
      event.pointerType === 'touch' ||
      scope.open ||
      stopped()
    ) {
      return;
    }

    pointer.x = event.clientX;
    pointer.y = event.clientY;
  }, { passive: true });

  document.documentElement.addEventListener(
    'pointerleave',
    () => {
      pointer.x = pointer.y = -999;
    }
  );

  document.addEventListener('click', event => {
    if (
      stopped() ||
      scope.open ||
      event.target.closest(
        'a,button,input,label,dialog,.sidebar,astro-assistente,#astroAccountTools'
      )
    ) {
      return;
    }

    if (points.length >= 80) {
      points.shift();
    }

    points.push(
      point(
        pageWidth,
        pageHeight,
        event.clientX,
        event.clientY,
        true
      )
    );

    draw(0);
  });

  addEventListener('resize', () => {
    resize();
    sync();
  });

  document.addEventListener(
    'visibilitychange',
    sync
  );

  document.addEventListener(
    'astrolearn:motion',
    sync
  );

  media.addEventListener('change', sync);

  new MutationObserver(sync).observe(
    document.body,
    {
      attributes: true,
      attributeFilter: ['class']
    }
  );

  addEventListener('pagehide', () => {
    cancelAnimationFrame(frame);
    frame = 0;
  });

  addEventListener('pageshow', () => {
    resize();
    sync();
  });

  render();
  setZoom(100);
  resize();
  sync();
})();