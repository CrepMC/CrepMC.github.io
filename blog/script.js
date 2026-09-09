(() => {
  'use strict';

  const DB_NAME = 'my-blog-local-database';
  const DB_VERSION = 1;
  const POSTS_STORE = 'posts';
  const DRAFT_KEY = 'my-blog-draft-v2';
  const THEME_KEY = 'my-blog-theme';
  const FALLBACK_POSTS_KEY = 'my-blog-posts-fallback';
  const MAX_VIDEO_SIZE = 250 * 1024 * 1024;

  const elements = {
    html: document.documentElement,
    themeMeta: document.querySelector('meta[name="theme-color"]'),
    themeToggle: document.getElementById('themeToggle'),
    form: document.getElementById('publishForm'),
    title: document.getElementById('postTitle'),
    category: document.getElementById('postCategory'),
    content: document.getElementById('inputText'),
    counter: document.getElementById('contentCounter'),
    fileInput: document.getElementById('fileInput'),
    uploadZone: document.getElementById('uploadZone'),
    videoPreview: document.getElementById('videoPreview'),
    draftVideo: document.getElementById('draftVideo'),
    videoName: document.getElementById('videoName'),
    videoSize: document.getElementById('videoSize'),
    removeVideo: document.getElementById('removeVideo'),
    formError: document.getElementById('formError'),
    clearDraft: document.getElementById('clearDraft'),
    publishButton: document.getElementById('publishButton'),
    publishButtonLabel: document.getElementById('publishButtonLabel'),
    composerTitle: document.getElementById('composerTitle'),
    draftStatus: document.getElementById('draftStatus'),
    postsContainer: document.getElementById('publishedContent'),
    emptyState: document.getElementById('emptyState'),
    noResults: document.getElementById('noResults'),
    searchInput: document.getElementById('searchInput'),
    filterCategory: document.getElementById('filterCategory'),
    resetFilters: document.getElementById('resetFilters'),
    postCount: document.getElementById('postCount'),
    wordCount: document.getElementById('wordCount'),
    deleteDialog: document.getElementById('deleteDialog'),
    confirmDelete: document.getElementById('confirmDelete'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage'),
  };

  const state = {
    db: null,
    storageMode: 'indexedDB',
    posts: [],
    editingId: null,
    pendingDeleteId: null,
    selectedVideo: null,
    draftVideoUrl: null,
    postVideoUrls: [],
    draftTimer: null,
    toastTimer: null,
  };

  function safeStorageGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function safeStorageSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch (error) {
      return false;
    }
  }

  function safeStorageRemove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      // The blog still works in the current session when browser storage is blocked.
    }
  }

  function setTheme(theme) {
    const nextTheme = theme === 'light' ? 'light' : 'dark';
    elements.html.dataset.theme = nextTheme;
    elements.themeMeta.setAttribute('content', nextTheme === 'dark' ? '#07100a' : '#eff5ec');
    elements.themeToggle.setAttribute(
      'aria-label',
      nextTheme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối',
    );
    safeStorageSet(THEME_KEY, nextTheme);
  }

  function initialiseTheme() {
    const savedTheme = safeStorageGet(THEME_KEY);
    const preferredTheme = window.matchMedia?.('(prefers-color-scheme: light)').matches
      ? 'light'
      : 'dark';
    setTheme(savedTheme || preferredTheme);
  }

  function openDatabase() {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        reject(new Error('IndexedDB is unavailable'));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(POSTS_STORE)) {
          const store = database.createObjectStore(POSTS_STORE, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt');
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Cannot open IndexedDB'));
      request.onblocked = () => reject(new Error('IndexedDB is blocked by another tab'));
    });
  }

  function databaseRequest(mode, action) {
    return new Promise((resolve, reject) => {
      const transaction = state.db.transaction(POSTS_STORE, mode);
      const store = transaction.objectStore(POSTS_STORE);
      const request = action(store);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Database request failed'));
      transaction.onabort = () => reject(transaction.error || new Error('Database transaction failed'));
    });
  }

  function getFallbackPosts() {
    try {
      const parsed = JSON.parse(safeStorageGet(FALLBACK_POSTS_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function saveFallbackPosts() {
    const serialisablePosts = state.posts.map(({ video, ...post }) => ({
      ...post,
      video: null,
      videoUnavailable: Boolean(video),
    }));
    return safeStorageSet(FALLBACK_POSTS_KEY, JSON.stringify(serialisablePosts));
  }

  async function initialiseStorage() {
    try {
      state.db = await openDatabase();
      state.storageMode = 'indexedDB';
      state.posts = await databaseRequest('readonly', (store) => store.getAll());
    } catch (error) {
      state.storageMode = 'fallback';
      state.posts = getFallbackPosts();
      showToast('Trình duyệt đang giới hạn lưu trữ; bài chữ vẫn được lưu, video chỉ giữ trong phiên này.');
    }

    sortPosts();
  }

  async function persistPost(post) {
    if (state.storageMode === 'indexedDB') {
      await databaseRequest('readwrite', (store) => store.put(post));
      const existingIndex = state.posts.findIndex((item) => item.id === post.id);
      if (existingIndex >= 0) state.posts.splice(existingIndex, 1, post);
      else state.posts.push(post);
      return;
    }

    const existingIndex = state.posts.findIndex((item) => item.id === post.id);
    if (existingIndex >= 0) state.posts.splice(existingIndex, 1, post);
    else state.posts.push(post);
    saveFallbackPosts();
  }

  async function removeStoredPost(id) {
    if (state.storageMode === 'indexedDB') {
      await databaseRequest('readwrite', (store) => store.delete(id));
    }
    state.posts = state.posts.filter((post) => post.id !== id);
    if (state.storageMode === 'fallback') saveFallbackPosts();
  }

  function sortPosts() {
    state.posts.sort((a, b) => Number(b.updatedAt || b.createdAt) - Number(a.updatedAt || a.createdAt));
  }

  function makeId() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `post-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function countWords(value) {
    const trimmed = String(value || '').trim();
    return trimmed ? trimmed.split(/\s+/u).length : 0;
  }

  function readingMinutes(value) {
    return Math.max(1, Math.ceil(countWords(value) / 200));
  }

  function normaliseText(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('vi-VN');
  }

  function formatFileSize(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 MB';
    const units = ['B', 'KB', 'MB', 'GB'];
    const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / 1024 ** unitIndex;
    return `${value >= 10 || unitIndex === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[unitIndex]}`;
  }

  function formatPostDate(timestamp, wasEdited) {
    const date = new Date(Number(timestamp));
    if (Number.isNaN(date.getTime())) return '';
    const formatted = new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
    return wasEdited ? `Đã sửa · ${formatted}` : formatted;
  }

  function createElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function updateStats() {
    const totalWords = state.posts.reduce((total, post) => total + countWords(post.content), 0);
    elements.postCount.textContent = String(state.posts.length).padStart(2, '0');
    elements.wordCount.textContent = new Intl.NumberFormat('vi-VN').format(totalWords).padStart(2, '0');
  }

  function revokePostVideoUrls() {
    state.postVideoUrls.forEach((url) => URL.revokeObjectURL(url));
    state.postVideoUrls = [];
  }

  function buildPostCard(post, index) {
    const hasVideo = post.video instanceof Blob;
    const article = createElement('article', `post-card${hasVideo ? ' post-card--video' : ''}`);
    article.dataset.id = post.id;
    article.style.animationDelay = `${Math.min(index * 55, 220)}ms`;

    if (hasVideo) {
      const videoWrap = createElement('div', 'post-video-wrap');
      const video = createElement('video', 'post-video');
      const videoUrl = URL.createObjectURL(post.video);
      state.postVideoUrls.push(videoUrl);
      video.src = videoUrl;
      video.controls = true;
      video.preload = 'metadata';
      video.playsInline = true;
      video.setAttribute('aria-label', `Video của bài viết ${post.title}`);
      videoWrap.append(video);
      article.append(videoWrap);
    }

    const body = createElement('div', 'post-card__body');
    const topLine = createElement('div', 'post-card__topline');
    topLine.append(
      createElement('span', 'post-category', post.category || 'Khác'),
      createElement(
        'time',
        'post-date',
        formatPostDate(post.updatedAt || post.createdAt, post.updatedAt !== post.createdAt),
      ),
    );

    const title = createElement('h3', 'post-title', post.title || 'Bài viết không tiêu đề');
    const content = createElement('p', 'post-content', post.content || 'Bài viết có video đính kèm.');

    body.append(topLine, title, content);

    if ((post.content || '').length > 380 || (post.content || '').split('\n').length > 6) {
      const readMore = createElement('button', 'text-button read-more', 'Đọc tiếp');
      readMore.type = 'button';
      readMore.dataset.action = 'expand';
      readMore.setAttribute('aria-expanded', 'false');
      body.append(readMore);
    }

    const footer = createElement('div', 'post-card__footer');
    footer.append(createElement('span', 'reading-time', `${readingMinutes(post.content)} phút đọc`));

    const actions = createElement('div', 'post-actions');
    const editButton = createElement('button', 'post-action', 'Chỉnh sửa');
    editButton.type = 'button';
    editButton.dataset.action = 'edit';
    const deleteButton = createElement('button', 'post-action post-action--delete', 'Xóa');
    deleteButton.type = 'button';
    deleteButton.dataset.action = 'delete';
    actions.append(editButton, deleteButton);
    footer.append(actions);
    body.append(footer);
    article.append(body);

    return article;
  }

  function renderPosts() {
    revokePostVideoUrls();
    elements.postsContainer.replaceChildren();
    sortPosts();
    updateStats();

    const query = normaliseText(elements.searchInput.value.trim());
    const category = elements.filterCategory.value;
    const filteredPosts = state.posts.filter((post) => {
      const matchesCategory = category === 'Tất cả' || post.category === category;
      const haystack = normaliseText(`${post.title} ${post.content} ${post.category}`);
      return matchesCategory && (!query || haystack.includes(query));
    });

    const hasAnyPosts = state.posts.length > 0;
    elements.emptyState.hidden = hasAnyPosts;
    elements.noResults.hidden = !hasAnyPosts || filteredPosts.length > 0;

    const fragment = document.createDocumentFragment();
    filteredPosts.forEach((post, index) => fragment.append(buildPostCard(post, index)));
    elements.postsContainer.append(fragment);
  }

  function updateCounter() {
    const length = elements.content.value.length;
    elements.counter.textContent = `${new Intl.NumberFormat('vi-VN').format(length)} ký tự · ${readingMinutes(elements.content.value)} phút đọc`;
  }

  function setDraftStatus(message, isSaving = false) {
    elements.draftStatus.lastChild.textContent = ` ${message}`;
    elements.draftStatus.classList.toggle('is-saving', isSaving);
  }

  function saveDraft() {
    window.clearTimeout(state.draftTimer);
    setDraftStatus('Đang lưu...', true);

    state.draftTimer = window.setTimeout(() => {
      const draft = {
        title: elements.title.value,
        category: elements.category.value,
        content: elements.content.value,
        editingId: state.editingId,
        savedAt: Date.now(),
      };
      const hasDraft = draft.title.trim() || draft.content.trim();
      const saved = hasDraft
        ? safeStorageSet(DRAFT_KEY, JSON.stringify(draft))
        : (safeStorageRemove(DRAFT_KEY), true);

      if (!saved) {
        setDraftStatus('Không thể tự lưu bản nháp');
        return;
      }

      const time = new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date());
      setDraftStatus(hasDraft ? `Đã lưu lúc ${time}` : 'Bản nháp tự động lưu');
    }, 520);
  }

  function restoreDraft() {
    const storedDraft = safeStorageGet(DRAFT_KEY);
    if (!storedDraft) return;

    try {
      const draft = JSON.parse(storedDraft);
      elements.title.value = draft.title || '';
      elements.content.value = draft.content || '';
      elements.category.value = draft.category || 'Nhật ký';

      if (draft.editingId && state.posts.some((post) => post.id === draft.editingId)) {
        state.editingId = draft.editingId;
        elements.composerTitle.textContent = 'Chỉnh sửa bài viết';
        elements.publishButtonLabel.textContent = 'Lưu thay đổi';
      }

      updateCounter();
      setDraftStatus('Đã khôi phục bản nháp');
    } catch (error) {
      safeStorageRemove(DRAFT_KEY);
    }
  }

  function showFormError(message) {
    elements.formError.textContent = message;
    elements.formError.hidden = false;
  }

  function clearFormError() {
    elements.formError.hidden = true;
    elements.formError.textContent = '';
  }

  function clearSelectedVideo() {
    if (state.draftVideoUrl) URL.revokeObjectURL(state.draftVideoUrl);
    state.draftVideoUrl = null;
    state.selectedVideo = null;
    elements.draftVideo.pause();
    elements.draftVideo.removeAttribute('src');
    elements.draftVideo.load();
    elements.fileInput.value = '';
    elements.videoName.textContent = '';
    elements.videoSize.textContent = '';
    elements.videoPreview.hidden = true;
    elements.uploadZone.hidden = false;
  }

  function selectVideo(blob, name = 'video') {
    if (!(blob instanceof Blob) || !blob.type.startsWith('video/')) {
      showFormError('Tệp đã chọn không phải là video hợp lệ.');
      return false;
    }
    if (blob.size > MAX_VIDEO_SIZE) {
      showFormError('Video vượt quá 250 MB. Hãy chọn video nhẹ hơn.');
      return false;
    }

    clearSelectedVideo();
    clearFormError();
    state.selectedVideo = {
      blob,
      name: name || 'video',
      type: blob.type,
      size: blob.size,
    };
    state.draftVideoUrl = URL.createObjectURL(blob);
    elements.draftVideo.src = state.draftVideoUrl;
    elements.videoName.textContent = state.selectedVideo.name;
    elements.videoSize.textContent = formatFileSize(blob.size);
    elements.uploadZone.hidden = true;
    elements.videoPreview.hidden = false;
    return true;
  }

  function resetComposer(showConfirmation = false) {
    window.clearTimeout(state.draftTimer);
    state.editingId = null;
    elements.form.reset();
    elements.category.value = 'Nhật ký';
    elements.composerTitle.textContent = 'Tạo bài viết mới';
    elements.publishButtonLabel.textContent = 'Xuất bản bài viết';
    clearSelectedVideo();
    clearFormError();
    safeStorageRemove(DRAFT_KEY);
    updateCounter();
    setDraftStatus('Bản nháp tự động lưu');
    if (showConfirmation) showToast('Đã xóa bản nháp.');
  }

  function deriveTitle(content, videoName) {
    const firstLine = String(content || '').split('\n').find((line) => line.trim())?.trim();
    if (firstLine) return firstLine.length > 76 ? `${firstLine.slice(0, 73)}...` : firstLine;
    if (videoName) return videoName.replace(/\.[^.]+$/, '') || 'Video mới';
    return 'Bài viết không tiêu đề';
  }

  async function publishPost(event) {
    event.preventDefault();
    clearFormError();

    const content = elements.content.value.trim();
    if (!content && !state.selectedVideo) {
      showFormError('Hãy nhập nội dung hoặc chọn một video trước khi xuất bản.');
      elements.content.focus();
      return;
    }

    const existingPost = state.editingId
      ? state.posts.find((post) => post.id === state.editingId)
      : null;
    const now = Date.now();
    const post = {
      id: existingPost?.id || makeId(),
      title: elements.title.value.trim() || deriveTitle(content, state.selectedVideo?.name),
      category: elements.category.value || 'Khác',
      content,
      video: state.selectedVideo?.blob || null,
      videoName: state.selectedVideo?.name || null,
      videoType: state.selectedVideo?.type || null,
      createdAt: existingPost?.createdAt || now,
      updatedAt: now,
    };

    elements.publishButton.disabled = true;
    elements.publishButtonLabel.textContent = existingPost ? 'Đang lưu...' : 'Đang xuất bản...';

    try {
      await persistPost(post);
      sortPosts();
      const successMessage = existingPost ? 'Đã cập nhật bài viết.' : 'Bài viết đã được xuất bản.';
      resetComposer(false);
      renderPosts();
      showToast(successMessage);
      document.getElementById('posts').scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
      const isQuotaError = error?.name === 'QuotaExceededError';
      showFormError(
        isQuotaError
          ? 'Bộ nhớ trình duyệt không còn đủ cho video này. Hãy chọn video nhẹ hơn hoặc xóa bớt bài cũ.'
          : 'Chưa thể lưu bài viết. Hãy thử lại một lần nữa.',
      );
      elements.publishButtonLabel.textContent = existingPost ? 'Lưu thay đổi' : 'Xuất bản bài viết';
    } finally {
      elements.publishButton.disabled = false;
    }
  }

  function beginEdit(post) {
    state.editingId = post.id;
    elements.title.value = post.title || '';
    elements.category.value = post.category || 'Khác';
    elements.content.value = post.content || '';
    elements.composerTitle.textContent = 'Chỉnh sửa bài viết';
    elements.publishButtonLabel.textContent = 'Lưu thay đổi';
    clearSelectedVideo();
    if (post.video instanceof Blob) selectVideo(post.video, post.videoName || 'video');
    clearFormError();
    updateCounter();
    saveDraft();
    document.getElementById('composer').scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => elements.title.focus(), 450);
  }

  function requestDelete(id) {
    state.pendingDeleteId = id;
    if (typeof elements.deleteDialog.showModal === 'function') {
      elements.deleteDialog.returnValue = '';
      elements.deleteDialog.showModal();
      return;
    }

    if (window.confirm('Xóa bài viết này?')) confirmDeletePost();
    else state.pendingDeleteId = null;
  }

  async function confirmDeletePost() {
    if (!state.pendingDeleteId) return;
    const id = state.pendingDeleteId;
    state.pendingDeleteId = null;

    try {
      await removeStoredPost(id);
      if (state.editingId === id) resetComposer(false);
      renderPosts();
      showToast('Đã xóa bài viết.');
    } catch (error) {
      showToast('Chưa thể xóa bài viết. Hãy thử lại.');
    }
  }

  function handlePostAction(event) {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const card = button.closest('.post-card');
    if (!card) return;
    const post = state.posts.find((item) => item.id === card.dataset.id);
    if (!post) return;

    if (button.dataset.action === 'expand') {
      const content = card.querySelector('.post-content');
      const isExpanded = content.classList.toggle('is-expanded');
      button.textContent = isExpanded ? 'Thu gọn' : 'Đọc tiếp';
      button.setAttribute('aria-expanded', String(isExpanded));
      return;
    }

    if (button.dataset.action === 'edit') beginEdit(post);
    if (button.dataset.action === 'delete') requestDelete(post.id);
  }

  function showToast(message) {
    window.clearTimeout(state.toastTimer);
    elements.toastMessage.textContent = message;
    elements.toast.classList.add('is-visible');
    state.toastTimer = window.setTimeout(() => {
      elements.toast.classList.remove('is-visible');
    }, 3600);
  }

  function handleDroppedFiles(fileList) {
    const video = Array.from(fileList || []).find((file) => file.type.startsWith('video/'));
    if (!video) {
      showFormError('Hãy thả một tệp video hợp lệ vào đây.');
      return;
    }
    selectVideo(video, video.name);
  }

  function attachEvents() {
    elements.themeToggle.addEventListener('click', () => {
      setTheme(elements.html.dataset.theme === 'dark' ? 'light' : 'dark');
    });

    elements.form.addEventListener('submit', publishPost);
    elements.title.addEventListener('input', saveDraft);
    elements.category.addEventListener('change', saveDraft);
    elements.content.addEventListener('input', () => {
      updateCounter();
      clearFormError();
      saveDraft();
    });

    elements.fileInput.addEventListener('change', () => {
      const file = elements.fileInput.files?.[0];
      if (file) selectVideo(file, file.name);
    });
    elements.removeVideo.addEventListener('click', clearSelectedVideo);
    elements.clearDraft.addEventListener('click', () => resetComposer(true));

    ['dragenter', 'dragover'].forEach((eventName) => {
      elements.uploadZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        elements.uploadZone.classList.add('is-dragging');
      });
    });
    ['dragleave', 'drop'].forEach((eventName) => {
      elements.uploadZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        elements.uploadZone.classList.remove('is-dragging');
      });
    });
    elements.uploadZone.addEventListener('drop', (event) => {
      handleDroppedFiles(event.dataTransfer?.files);
    });

    elements.searchInput.addEventListener('input', renderPosts);
    elements.filterCategory.addEventListener('change', renderPosts);
    elements.resetFilters.addEventListener('click', () => {
      elements.searchInput.value = '';
      elements.filterCategory.value = 'Tất cả';
      renderPosts();
      elements.searchInput.focus();
    });
    elements.postsContainer.addEventListener('click', handlePostAction);

    elements.deleteDialog.addEventListener('close', () => {
      if (elements.deleteDialog.returnValue === 'confirm') confirmDeletePost();
      else state.pendingDeleteId = null;
    });

    window.addEventListener('beforeunload', () => {
      if (state.draftVideoUrl) URL.revokeObjectURL(state.draftVideoUrl);
      revokePostVideoUrls();
      state.db?.close();
    });
  }

  async function initialiseBlog() {
    initialiseTheme();
    attachEvents();
    updateCounter();
    await initialiseStorage();
    restoreDraft();
    renderPosts();
  }

  initialiseBlog().catch(() => {
    state.storageMode = 'fallback';
    state.posts = getFallbackPosts();
    restoreDraft();
    renderPosts();
    showToast('Blog đã mở ở chế độ lưu trữ đơn giản.');
  });
})();
