(() => {
  'use strict';

  /*
    THÊM BÀI VIẾT:
    Thêm một object vào POSTS và dùng slug duy nhất.

    category:
      "code"  = Lập trình
      "game"  = Game
      "notes" = Ghi chép

    cover:
      "code"  = Cửa sổ code
      "game"  = Creeper
      "notes" = Tờ ghi chú

    body là HTML do chính bạn biên soạn.
    Không dùng trực tiếp HTML do người lạ gửi vào.
  */

  const POSTS = [
    {
      slug: 'gamebot-cong-dong-game',
      category: 'game',
      label: 'GAME & CỘNG ĐỒNG',
      cover: 'game',

      title: 'GameBot: một cộng đồng game bắt đầu từ đâu?',

      excerpt:
        'Trước những tính năng và giao diện, có một câu hỏi nhỏ hơn: ' +
        'điều gì khiến người chơi muốn quay lại?',

      body: `
        <h2>Bắt đầu từ người chơi</h2>

        <p>
          GameBot là ý tưởng website cộng đồng game của tôi.
          Bản nháp này đặt ra một hướng tiếp cận: trước khi viết
          thêm tính năng, hãy làm rõ nơi này dành cho ai và giúp
          họ điều gì.
        </p>

        <p>
          Một người có thể vào để tìm bạn chơi cùng. Người khác
          muốn hỏi cách xử lý một lỗi, chia sẻ một bản mod hoặc
          kể về thế giới vừa xây. Những nhu cầu ấy có vẻ gần
          nhau, nhưng cần những cách tổ chức khác nhau.
        </p>

        <h2>Một vòng sử dụng thật đơn giản</h2>

        <p>
          Phiên bản đầu có thể bắt đầu bằng một vòng: tìm được
          chủ đề mình quan tâm, đọc một cuộc thảo luận hữu ích,
          rồi dễ dàng tham gia.
        </p>

        <ul>
          <li>
            Chủ đề rõ ràng để người mới biết nên bắt đầu từ đâu.
          </li>
          <li>
            Bài viết dễ đọc và phản hồi dễ theo dõi.
          </li>
          <li>
            Một cách báo cáo nội dung gây rối, cùng nguyên tắc
            ứng xử dễ hiểu.
          </li>
        </ul>

        <blockquote>
          Một cộng đồng cần lý do để quay lại, chứ không chỉ
          một lý do để đăng ký.
        </blockquote>

        <h2>Điều cần thử trước</h2>

        <p>
          Tôi muốn kiểm chứng vòng sử dụng ấy bằng một nhóm nhỏ
          trước khi mở rộng. Khi biết người chơi thực sự gặp
          vướng mắc ở đâu, việc chọn tính năng tiếp theo sẽ có
          cơ sở hơn.
        </p>

        <p>
          Đây là hướng phác thảo cho GameBot, chưa phải mô tả
          một sản phẩm đã hoàn thiện.
        </p>
      `
    },

    {
      slug: 'react-ecommerce-tu-giao-dien-den-he-thong',
      category: 'code',
      label: 'LẬP TRÌNH',
      cover: 'code',

      title: 'Từ một giao diện đến cả cửa hàng.',

      excerpt:
        'Ghi chép cho dự án Ecommerce bằng React: trang bán hàng, ' +
        'khu quản trị và câu hỏi về quyền truy cập.',

      body: `
        <h2>Giao diện chỉ là điểm bắt đầu</h2>

        <p>
          Dự án Ecommerce của tôi có cả phía khách mua hàng và
          khu quản trị. Nhìn ở phía người mua, đó là danh sách
          sản phẩm, giỏ hàng và thanh toán. Nhìn từ phía vận
          hành, đó còn là sản phẩm, đơn hàng, người dùng và
          nội dung cần quản lý.
        </p>

        <p>
          Bản nháp này không cố liệt kê mọi tính năng. Tôi muốn
          dùng nó để làm rõ cách chia trách nhiệm giữa các phần
          của hệ thống.
        </p>

        <h2>Chia route theo nhu cầu</h2>

        <p>
          Trang công khai cần dễ tiếp cận. Trang tài khoản cần
          xác định người dùng. Khu quản trị cần kiểm tra cả
          danh tính lẫn quyền thực hiện từng thao tác.
        </p>

        <p>
          Ở phía React, <code>RequireAuth</code> và
          <code>RequireAdmin</code> có thể giúp điều hướng và
          ẩn giao diện không phù hợp. Nhưng kiểm tra trên trình
          duyệt không đủ để bảo vệ dữ liệu: API vẫn phải xác
          thực và kiểm tra quyền trên máy chủ.
        </p>

        <h2>Đi hết một luồng trước</h2>

        <p>
          Thay vì chỉ hoàn thành nhiều màn hình rời rạc, một
          mục tiêu thử nghiệm có thể là đi hết luồng xem sản
          phẩm → thêm giỏ → tạo đơn → xem đơn trong khu quản trị.
        </p>

        <ul>
          <li>
            Dữ liệu thiếu hoặc không hợp lệ được xử lý thế nào?
          </li>
          <li>
            Người dùng nhìn thấy gì khi mạng lỗi?
          </li>
          <li>
            Nếu bấm gửi hai lần, hệ thống có tạo trùng đơn không?
          </li>
        </ul>

        <blockquote>
          Một luồng chạy trọn vẹn thường cho thấy nhiều vấn đề
          hơn một loạt màn hình đẹp đứng riêng.
        </blockquote>

        <h2>Những phần để làm tiếp</h2>

        <p>
          Phân quyền chi tiết, thanh toán, đánh giá và các công
          cụ quản trị cần được thiết kế theo nhu cầu thực tế.
          Đây là ghi chú định hướng cho dự án, chưa phải tuyên
          bố các chức năng đó đã triển khai xong.
        </p>
      `
    },

    {
      slug: 'y-tuong-chua-thanh-hinh',
      category: 'notes',
      label: 'GHI CHÉP',
      cover: 'notes',

      title: 'Chừa một chỗ cho ý tưởng chưa thành hình.',

      excerpt:
        'Không phải điều gì cũng cần thành một dự án ngay. ' +
        'Đôi khi, một ghi chú đủ rõ là bước đầu tiên.',

      body: `
        <h2>Một câu hỏi cũng đáng được giữ lại</h2>

        <p>
          Học cách tạo AI, xây một cộng đồng game, làm một
          website bán hàng: những hướng quan tâm ấy có thể
          dẫn tới rất nhiều câu hỏi. Blog này có thể là nơi
          giữ lại chúng trước khi có câu trả lời hoàn chỉnh.
        </p>

        <p>
          Bản nháp mở đầu này gợi ý một cách viết đơn giản:
          bắt đầu từ điều đang thắc mắc, ghi lại điều đã thử
          và nói rõ phần mình chưa biết.
        </p>

        <h2>Ghi lại cả phần chưa hiểu</h2>

        <p>
          Một bài ghi chép không cần đóng vai một hướng dẫn
          toàn diện. Nó có thể nhỏ hơn: hôm nay gặp lỗi gì,
          đã kiểm tra điều gì và tại sao cách sửa có vẻ hợp lý.
        </p>

        <ul>
          <li>Câu hỏi ban đầu là gì?</li>
          <li>Thông tin nào đã được kiểm chứng?</li>
          <li>Điều gì vẫn chỉ là phỏng đoán?</li>
          <li>Lần sau quay lại, nên thử bước nào?</li>
        </ul>

        <h2>Để việc học có dấu vết</h2>

        <p>
          Những ghi chú ngắn giúp nhìn lại cách mình suy nghĩ.
          Có bài sẽ trở thành hướng dẫn, có bài chỉ là một mốc
          đánh dấu trong quá trình học.
        </p>

        <blockquote>
          Chưa có đáp án hoàn chỉnh vẫn có thể có một câu hỏi
          đáng giữ lại.
        </blockquote>

        <p>
          Nội dung này là lời mở đầu gợi ý cho góc viết; bạn có
          thể thay bằng câu chuyện và giọng văn của chính mình.
        </p>
      `
    }
  ];

  /* ==================== PHẦN TỬ VÀ TRẠNG THÁI ==================== */

  const $ = selector => document.querySelector(selector);

  const list = $('#posts');
  const reader = $('#reader');
  const article = $('#article');
  const search = $('#search');
  const count = $('#count');
  const empty = $('#empty');

  const SAVED_KEY = 'crepmc-blog-bookmarks-v1';
  const THEME_KEY = 'crepmc-blog-theme-v1';

  let filter = 'all';
  let current = null;
  let toastTimer;

  /* ==================== LƯU TRỮ ==================== */

  function readStorage(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  function initialSaved() {
    try {
      const value = JSON.parse(readStorage(SAVED_KEY) || '[]');

      return new Set(
        Array.isArray(value)
          ? value.filter(slug =>
              POSTS.some(post => post.slug === slug)
            )
          : []
      );
    } catch {
      return new Set();
    }
  }

  const saved = initialSaved();

  /* ==================== HÀM HỖ TRỢ ==================== */

  const escapeHTML = value =>
    String(value).replace(/[&<>"']/g, character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[character]));

  const normalise = value =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase();

  function minutes(post) {
    const node = document.createElement('div');
    node.innerHTML = post.body;

    const words = node.textContent
      .trim()
      .split(/\s+/)
      .length;

    return Math.max(1, Math.ceil(words / 220));
  }

  function toast(message) {
    clearTimeout(toastTimer);

    const node = $('#toast');

    // Đặt thông báo vào dialog khi đang đọc để nó luôn hiện được.
    (reader.open ? reader : document.body).append(node);

    node.textContent = message;
    node.classList.add('show');

    toastTimer = setTimeout(() => {
      node.classList.remove('show');
    }, 3200);
  }

  /* ==================== MINH HỌA BẰNG CSS ==================== */

  function cover(post) {
    if (post.cover === 'game') {
      return `
        <div class="pixel-face">
          ${'<span></span>'.repeat(25)}
        </div>

        <span class="cover-label">
          G A M E B O T / A WORK IN PROGRESS
        </span>
      `;
    }

    if (post.cover === 'code') {
      return `
        <div class="code-window">
          <div class="window-dots">● ● ●</div>

          <code>
            <b>const</b> idea = {<br />
            &nbsp; build: <b>"something useful"</b>,<br />
            &nbsp; status: <b>"learning"</b><br />
            };
          </code>
        </div>
      `;
    }

    return `
      <div class="paper">
        <small>NOTE TO SELF / 001</small>
        <p>Chưa rõ.<br />Cứ ghi lại đã.</p>
      </div>
    `;
  }

  /* ==================== DANH SÁCH BÀI ==================== */

  function render() {
    const query = normalise(search.value.trim());

    const matches = POSTS.filter(post => {
      const matchesFilter =
        filter === 'all' ||
        (
          filter === 'saved'
            ? saved.has(post.slug)
            : post.category === filter
        );

      const searchable = normalise(
        `${post.title} ${post.excerpt} ${post.label} ` +
        post.body.replace(/<[^>]*>/g, ' ')
      );

      return matchesFilter && searchable.includes(query);
    });

    count.textContent =
      `${String(matches.length).padStart(2, '0')} / ` +
      `${String(POSTS.length).padStart(2, '0')} BÀI VIẾT`;

    empty.hidden = matches.length > 0;

    $('#empty-text').textContent =
      filter === 'saved' && !saved.size
        ? 'Nhấn “Lưu bài” ở một bài viết để tìm lại tại đây, trên trình duyệt này.'
        : 'Thử đổi từ khóa hoặc chủ đề nhé.';

    list.innerHTML = matches.map(post => {
      const isSaved = saved.has(post.slug);

      return `
        <article class="post">
          <div
            class="cover cover-${post.cover}"
            aria-hidden="true"
          >
            ${cover(post)}
          </div>

          <div class="post-body">
            <div class="post-meta">
              <span>${escapeHTML(post.label)}</span>
              <span>${minutes(post)} PHÚT ĐỌC · BẢN NHÁP</span>
            </div>

            <h3>
              <a href="#bai/${post.slug}">
                ${escapeHTML(post.title)}
              </a>
            </h3>

            <p class="excerpt">
              ${escapeHTML(post.excerpt)}
            </p>

            <div class="post-bottom">
              <a class="read-link" href="#bai/${post.slug}">
                Mở trang viết
                <span aria-hidden="true">↗</span>
              </a>

              <button
                class="save"
                type="button"
                data-save="${post.slug}"
                aria-pressed="${isSaved}"
                aria-label="${isSaved ? 'Bỏ lưu' : 'Lưu'}: ${escapeHTML(post.title)}"
              >
                ${isSaved ? '✓ Đã lưu' : '+ Lưu bài'}
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  /* ==================== LƯU BÀI ==================== */

  function syncSaved() {
    document.querySelectorAll('[data-save]').forEach(button => {
      const isSaved = saved.has(button.dataset.save);
      const post = POSTS.find(
        item => item.slug === button.dataset.save
      );

      button.setAttribute('aria-pressed', String(isSaved));

      button.setAttribute(
        'aria-label',
        `${isSaved ? 'Bỏ lưu' : 'Lưu'}: ${post.title}`
      );

      button.textContent = isSaved
        ? '✓ Đã lưu'
        : '+ Lưu bài';
    });

    if (current) {
      const isSaved = saved.has(current.slug);

      $('#save-reader').textContent = isSaved
        ? '✓ Đã lưu · Bỏ lưu'
        : '+ Lưu bài';

      $('#save-reader').setAttribute(
        'aria-pressed',
        String(isSaved)
      );
    }
  }

  function toggleSave(slug) {
    if (!POSTS.some(post => post.slug === slug)) return;

    saved.has(slug)
      ? saved.delete(slug)
      : saved.add(slug);

    const persisted = writeStorage(
      SAVED_KEY,
      JSON.stringify([...saved])
    );

    if (filter === 'saved') {
      render();

      if (!reader.open) {
        const nextFocus =
          list.querySelector('[data-save]') ||
          $('[data-filter="saved"]');

        nextFocus.focus();
      }
    }

    syncSaved();

    if (!persisted) {
      toast(
        'Chỉ lưu trong phiên này vì trình duyệt đang chặn lưu trữ.'
      );
    } else {
      toast(
        saved.has(slug)
          ? 'Đã lưu trên trình duyệt này.'
          : 'Đã bỏ lưu bài viết.'
      );
    }
  }

  /* ==================== ĐỌC BÀI ==================== */

  function updateProgress() {
    const max = reader.scrollHeight - reader.clientHeight;

    const progress = max > 0
      ? Math.min(1, reader.scrollTop / max)
      : 1;

    $('#reading-progress').style.transform =
      `scaleX(${progress})`;
  }

  function openPost(post) {
    current = post;

    article.innerHTML = `
      <div class="post-meta">
        <span>${escapeHTML(post.label)}</span>
        <span>${minutes(post)} PHÚT ĐỌC</span>
      </div>

      <h1 class="article-title" id="article-title">
        ${escapeHTML(post.title)}
      </h1>

      <p class="article-summary">
        ${escapeHTML(post.excerpt)}
      </p>

      <div class="article-author">
        Góc viết của Phạm Đức Nhân / CrepMC<br />
        Bản nháp gợi ý · Chưa phải bài do Nhân tự viết
      </div>

      <div class="article-content">
        ${post.body}
      </div>

      <p class="article-end">
        Bạn vừa đọc hết một trang.
        Cảm ơn đã ghé góc nhỏ này.
      </p>
    `;

    $('#toc').replaceChildren();

    article.querySelectorAll('h2').forEach((heading, index) => {
      heading.id = `section-${index}`;

      const link = document.createElement('a');

      link.href = `#section-${index}`;
      link.textContent = heading.textContent;

      link.addEventListener('click', event => {
        event.preventDefault();

        const reduceMotion = matchMedia(
          '(prefers-reduced-motion: reduce)'
        ).matches;

        heading.scrollIntoView({
          behavior: reduceMotion ? 'instant' : 'smooth',
          block: 'start'
        });
      });

      $('#toc').append(link);
    });

    if (!reader.open) {
      reader.showModal();
    }

    document.body.classList.add('reading');

    reader.scrollTop = 0;

    syncSaved();
    updateProgress();
  }

  function route() {
    if (location.hash.startsWith('#bai/')) {
      const post = POSTS.find(
        item => `#bai/${item.slug}` === location.hash
      );

      if (post) {
        openPost(post);
        return;
      }

      toast('Liên kết bài viết này chưa có nội dung.');
    }

    if (reader.open) {
      reader.close();
    }
  }

  function closeReader() {
    reader.close();

    if (location.hash.startsWith('#bai/')) {
      history.replaceState(
        null,
        '',
        `${location.pathname}${location.search}#bai-viet`
      );
    }

    document.body.classList.remove('reading');
    current = null;
  }

  /* ==================== GIAO DIỆN SÁNG / TỐI ==================== */

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;

    $('#theme').setAttribute(
      'aria-label',
      theme === 'dark'
        ? 'Bật giao diện sáng'
        : 'Bật giao diện tối'
    );

    document.querySelector(
      'meta[name="theme-color"]'
    ).content = theme === 'dark'
      ? '#141718'
      : '#f1eee5';
  }

  setTheme(
    readStorage(THEME_KEY) === 'light'
      ? 'light'
      : 'dark'
  );

  $('#theme').addEventListener('click', () => {
    const next =
      document.documentElement.dataset.theme === 'dark'
        ? 'light'
        : 'dark';

    setTheme(next);
    writeStorage(THEME_KEY, next);
  });

  /* ==================== SỰ KIỆN ==================== */

  $('.filters').addEventListener('click', event => {
    const button = event.target.closest('[data-filter]');

    if (!button) return;

    filter = button.dataset.filter;

    document.querySelectorAll('[data-filter]').forEach(item => {
      item.classList.toggle('selected', item === button);

      item.setAttribute(
        'aria-pressed',
        String(item === button)
      );
    });

    render();
  });

  search.addEventListener('input', render);

  $('#reset').addEventListener('click', () => {
    search.value = '';
    $('[data-filter="all"]').click();
    search.focus();
  });

  list.addEventListener('click', event => {
    const button = event.target.closest('[data-save]');

    if (button) {
      toggleSave(button.dataset.save);
    }
  });

  $('#save-reader').addEventListener('click', () => {
    if (current) {
      toggleSave(current.slug);
    }
  });

  $('#close-reader').addEventListener(
    'click',
    closeReader
  );

  reader.addEventListener('cancel', event => {
    event.preventDefault();
    closeReader();
  });

  reader.addEventListener('close', () => {
    document.body.classList.remove('reading');
    current = null;
  });

  reader.addEventListener(
    'scroll',
    updateProgress,
    { passive: true }
  );

  window.addEventListener('resize', updateProgress);
  window.addEventListener('hashchange', route);

  $('#back-top').addEventListener('click', event => {
    event.preventDefault();

    const reduceMotion = matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? 'instant' : 'smooth'
    });
  });

  $('#share').addEventListener('click', async () => {
    const url = location.href;

    try {
      await navigator.clipboard.writeText(url);
      toast('Đã sao chép liên kết bài viết.');
    } catch {
      window.prompt('Sao chép liên kết bài viết:', url);
    }
  });

  /* ==================== KHỞI TẠO ==================== */

  render();
  route();
})();
