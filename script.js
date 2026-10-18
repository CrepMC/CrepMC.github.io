// ======================================================
// HIỆU ỨNG LÁ RƠI: CHỈ KHỞI TẠO MỘT LẦN
// ======================================================

let leafScene;

function startLeafAnimation() {
  const container = document.querySelector('.falling-leaves');

  if (!container || leafScene) return;

  leafScene = new LeafScene(container);
  leafScene.init();
  leafScene.render();
}

// ======================================================
// CÁC HÀM HỖ TRỢ LOADING
// ======================================================

// Chỉ hoàn tất khi hiệu ứng thực sự chạy xong.
async function animateStep(element, frames, duration) {
  if (!element) return;

  await element.animate(frames, {
    duration,
    easing: 'ease',
    fill: 'forwards'
  }).finished;
}

// Tải và giải mã ảnh trước khi hiện nền/lá.
function preloadImage(src, signal) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    function finish(error) {
      image.onload = image.onerror = null;
      signal.removeEventListener('abort', onAbort);

      error ? reject(error) : resolve();
    }

    function onAbort() {
      finish(new Error('Hết thời gian tải ảnh'));
      image.src = '';
    }

    if (signal.aborted) return onAbort();

    signal.addEventListener('abort', onAbort, { once: true });

    image.onload = () => {
      image.decode().then(() => finish(), finish);
    };

    image.onerror = () => {
      finish(new Error('Không tải được ảnh: ' + src));
    };

    image.src = src;
  });
}

// Chờ video có dữ liệu khung hình đầu tiên.
function waitForVideoData(video, signal) {
  return new Promise((resolve, reject) => {
    function cleanup() {
      video.removeEventListener('loadeddata', ready);
      video.removeEventListener('error', failed);
      signal.removeEventListener('abort', failed);
    }

    function ready() {
      cleanup();
      resolve();
    }

    function failed() {
      cleanup();
      reject(new Error('Không chuẩn bị được video'));
    }

    video.addEventListener('loadeddata', ready, { once: true });
    video.addEventListener('error', failed, { once: true });
    signal.addEventListener('abort', failed, { once: true });

    if (signal.aborted || video.error) {
      failed();
    } else if (video.readyState >= 2) {
      ready();
    }
  });
}

// Chỉ hoàn tất khi video phát hết.
function playUntilEnded(video) {
  return new Promise((resolve, reject) => {
    function cleanup() {
      video.removeEventListener('ended', ended);
      video.removeEventListener('error', failed);
    }

    function ended() {
      cleanup();
      resolve();
    }

    function failed(error) {
      cleanup();

      reject(
        error instanceof Error
          ? error
          : new Error('Không phát được video')
      );
    }

    // Đăng ký sự kiện trước khi gọi play().
    video.addEventListener('ended', ended, { once: true });
    video.addEventListener('error', failed, { once: true });

    video.style.display = 'block';
    video.currentTime = 0;

    video.play().catch(failed);
  });
}

// ======================================================
// DÂY CHUYỀN LOADING
// ======================================================

document.addEventListener('DOMContentLoaded', async () => {
  const bar = document.querySelector('.progress');
  const text = document.querySelector('.progress-text');
  const loader = document.getElementById('hideLoading');
  const video = document.getElementById('mainVideo');
  const cover = document.getElementById('fadeOutScreen');
  const content = document.querySelector('.content');
  const leaves = document.getElementById('fallingLeaves');

  const controller = new AbortController();
  const { signal } = controller;

  let videoURL;
  let completed = 0;

  if (content) {
    content.inert = true;
    content.style.visibility = 'hidden';
  }

  if (bar) {
    bar.style.transition = 'none';
  }

  /*
    Giới hạn chờ khi tài nguyên bị treo.

    Đây là thời hạn xử lý lỗi, không phải bộ đếm
    để chuyển từ hiệu ứng này sang hiệu ứng khác.
  */
  const deadline = setTimeout(() => {
    controller.abort();
  }, 45000);

  async function prepareVideo() {
    if (!video) {
      throw new Error('Không có video intro');
    }

    /*
      Tải toàn bộ video trước khi phát.
      Trong lúc phát sẽ không phải chờ tải thêm qua mạng.
    */
    const response = await fetch(video.dataset.src, { signal });

    if (!response.ok) {
      throw new Error('Lỗi tải video: HTTP ' + response.status);
    }

    const blob = await response.blob();

    // Không tiếp tục nếu quá trình chuẩn bị đã bị hủy.
    signal.throwIfAborted();

    videoURL = URL.createObjectURL(blob);

    video.preload = 'auto';
    video.muted = true;
    video.loop = false;
    video.src = videoURL;
    video.load();

    await waitForVideoData(video, signal);
  }

  // Tải các tài nguyên song song để tiết kiệm thời gian.
  const tasks = [
    prepareVideo(),

    preloadImage(
      'https://s3-us-west-2.amazonaws.com/s.cdpn.io/125707/sidebar-bg.png',
      signal
    ),

    preloadImage(
      'https://s3-us-west-2.amazonaws.com/s.cdpn.io/125707/leaf.svg',
      signal
    )
  ];

  try {
    // Chờ các tài nguyên tải xong hoặc được xử lý lỗi.
    const results = await Promise.allSettled(
      tasks.map(task =>
        task.finally(() => {
          const percent = Math.round(
            ++completed / tasks.length * 100
          );

          if (bar) {
            bar.style.width = percent + '%';
          }

          if (text) {
            text.textContent = percent + '%';
          }
        })
      )
    );

    clearTimeout(deadline);

    results.forEach(result => {
      if (result.status === 'rejected') {
        console.warn(result.reason);
      }
    });

    // --------------------------------------------------
    // BƯỚC 1: LOADER MỜ HẾT
    // --------------------------------------------------

    await animateStep(
      loader,
      [{ opacity: 1 }, { opacity: 0 }],
      500
    );

    if (loader) {
      loader.style.display = 'none';
    }

    // --------------------------------------------------
    // BƯỚC 2: HIỆN VIDEO VÀ CHỜ VIDEO PHÁT HẾT
    // --------------------------------------------------

    if (results[0].status === 'fulfilled') {
      try {
        await playUntilEnded(video);
      } catch (error) {
        console.warn('Bỏ qua video do lỗi:', error);
      }
    }

    // --------------------------------------------------
    // BƯỚC 3: PHỦ MÀN TRẮNG, CHUẨN BỊ TRANG BÊN DƯỚI
    // --------------------------------------------------

    if (cover) {
      cover.style.display = 'block';
    }

    if (video) {
      video.pause();
      video.style.display = 'none';
    }

    if (leaves) {
      leaves.style.display = 'block';
      startLeafAnimation();
    }

    if (content) {
      content.style.visibility = 'visible';
    }

    // --------------------------------------------------
    // BƯỚC 4: MÀN TRẮNG MỜ DẦN ĐỂ LỘ TRANG
    // --------------------------------------------------

    await animateStep(
      cover,
      [{ opacity: 1 }, { opacity: 0 }],
      3000
    );
  } catch (error) {
    console.error('Lỗi loading:', error);
  } finally {
    // Dọn dẹp cả khi chạy thành công lẫn khi có lỗi.
    clearTimeout(deadline);
    controller.abort();

    if (loader) {
      loader.style.display = 'none';
    }

    if (cover) {
      cover.style.display = 'none';
    }

    if (video) {
      video.pause();
      video.style.display = 'none';
      video.removeAttribute('src');
      video.load();
    }

    if (videoURL) {
      URL.revokeObjectURL(videoURL);
    }

    if (leaves) {
      leaves.style.display = 'block';
      startLeafAnimation();
    }

    // Chỉ mở tương tác sau khi chuỗi loading kết thúc.
    if (content) {
      content.style.visibility = 'visible';
      content.inert = false;
    }
  }
}, { once: true });

// ======================================================
// DROPDOWN MENU
// ======================================================

const dropdownBtn = document.getElementById('dropdown-btn');
const dropdownContent = document.getElementById('dropdown-content');

if (dropdownBtn && dropdownContent) {
  dropdownBtn.addEventListener('click', function (event) {
    event.stopPropagation();
    dropdownContent.classList.toggle('show');
  });

  window.addEventListener('click', function (event) {
    if (!dropdownBtn.contains(event.target)) {
      dropdownContent.classList.remove('show');
    }
  });
}

// ======================================================
// LEAF SCENE
// ======================================================

var LeafScene = function (el) {
  this.viewport = el;
  this.world = document.createElement('div');
  this.leaves = [];

  this.options = {
    numLeaves: 20,

    wind: {
      magnitude: 1.2,
      maxSpeed: 12,
      duration: 300,
      start: 0,
      speed: 0
    }
  };

  this.width = this.viewport.offsetWidth;
  this.height = this.viewport.offsetHeight;
  this.timer = 0;

  this._resetLeaf = function (leaf) {
    leaf.x = this.width * 2 - Math.random() * this.width * 1.75;
    leaf.y = -10;
    leaf.z = Math.random() * 200;

    if (leaf.x > this.width) {
      leaf.x = this.width + 10;
      leaf.y = Math.random() * this.height / 2;
    }

    if (this.timer === 0) {
      leaf.y = Math.random() * this.height;
    }

    leaf.rotation.speed = Math.random() * 10;

    var randomAxis = Math.random();

    if (randomAxis > 0.5) {
      leaf.rotation.axis = 'X';
    } else if (randomAxis > 0.25) {
      leaf.rotation.axis = 'Y';
      leaf.rotation.x = Math.random() * 180 + 90;
    } else {
      leaf.rotation.axis = 'Z';
      leaf.rotation.x = Math.random() * 360 - 180;
      leaf.rotation.speed = Math.random() * 3;
    }

    leaf.xSpeedVariation = Math.random() * 0.8 - 0.4;
    leaf.ySpeed = Math.random() + 1.5;

    return leaf;
  };

  this._updateLeaf = function (leaf) {
    var leafWindSpeed = this.options.wind.speed(
      this.timer - this.options.wind.start,
      leaf.y
    );

    var xSpeed = leafWindSpeed + leaf.xSpeedVariation;

    leaf.x -= xSpeed;
    leaf.y += leaf.ySpeed;
    leaf.rotation.value += leaf.rotation.speed;

    var transform =
      'translateX(' + leaf.x + 'px) ' +
      'translateY(' + leaf.y + 'px) ' +
      'translateZ(' + leaf.z + 'px) ' +
      'rotate' + leaf.rotation.axis +
      '(' + leaf.rotation.value + 'deg)';

    if (leaf.rotation.axis !== 'X') {
      transform += ' rotateX(' + leaf.rotation.x + 'deg)';
    }

    leaf.el.style.webkitTransform = transform;
    leaf.el.style.MozTransform = transform;
    leaf.el.style.oTransform = transform;
    leaf.el.style.transform = transform;

    if (leaf.x < -10 || leaf.y > this.height + 10) {
      this._resetLeaf(leaf);
    }
  };

  this._updateWind = function () {
    if (
      this.timer === 0 ||
      this.timer > this.options.wind.start + this.options.wind.duration
    ) {
      this.options.wind.magnitude =
        Math.random() * this.options.wind.maxSpeed;

      this.options.wind.duration =
        this.options.wind.magnitude * 50 +
        (Math.random() * 20 - 10);

      this.options.wind.start = this.timer;

      var screenHeight = this.height;

      this.options.wind.speed = function (t, y) {
        var amplitude =
          ((this.magnitude / 2) * (screenHeight - 2 * y / 3)) /
          screenHeight;

        return (
          amplitude *
          Math.sin(
            2 * Math.PI / this.duration * t +
            3 * Math.PI / 2
          ) +
          amplitude
        );
      };
    }
  };
};

LeafScene.prototype.init = function () {
  for (var i = 0; i < this.options.numLeaves; i++) {
    var leaf = {
      el: document.createElement('div'),
      x: 0,
      y: 0,
      z: 0,

      rotation: {
        axis: 'X',
        value: 0,
        speed: 0,
        x: 0
      },

      xSpeedVariation: 0,
      ySpeed: 0,

      path: {
        type: 1,
        start: 0
      },

      image: 1
    };

    this._resetLeaf(leaf);
    this.leaves.push(leaf);
    this.world.appendChild(leaf.el);
  }

  this.world.className = 'leaf-scene';
  this.viewport.appendChild(this.world);

  this.world.style.webkitPerspective = '400px';
  this.world.style.MozPerspective = '400px';
  this.world.style.oPerspective = '400px';
  this.world.style.perspective = '400px';

  var self = this;

  window.addEventListener('resize', function () {
    self.width = self.viewport.offsetWidth;
    self.height = self.viewport.offsetHeight;
  });
};

LeafScene.prototype.render = function () {
  this._updateWind();

  for (var i = 0; i < this.leaves.length; i++) {
    this._updateLeaf(this.leaves[i]);
  }

  this.timer++;

  requestAnimationFrame(this.render.bind(this));
};
