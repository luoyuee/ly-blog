import { useThrottleFn } from "@vueuse/core";
export const useParticleAnimation = (canvas: HTMLCanvasElement) => {
  const velocityFactor = 0.05;
  const particles: Particle[] = [];
  const cometColor = "226,225,224";

  let ctx: CanvasRenderingContext2D | null = null;
  let canvasWidth = 0;
  let canvasHeight = 0;
  let particleCount = 0;
  let allowComets = false;

  const resizeCanvas = () => {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    particleCount = 0.216 * canvasWidth;
    canvas.setAttribute("width", canvasWidth.toString());
    canvas.setAttribute("height", canvasHeight.toString());
  };

  class Particle {
    giant: boolean = false;
    comet: boolean = false;
    x: number = 0;
    y: number = 0;
    size: number = 0;
    dx: number = 0;
    dy: number = 0;
    fadingOut: boolean = false;
    fadingIn: boolean = false;
    opacity: number = 0;
    opacityThreshold: number = 0;
    fadeSpeed: number = 0;

    constructor() {
      this.reset();
    }

    checkProbability(threshold: number) {
      return Math.random() < threshold / 1000;
    }

    getRandom(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    reset() {
      this.giant = this.checkProbability(10); // 巨型粒子概率
      this.comet = !this.giant && allowComets && this.checkProbability(100); // 彗星概率

      // 初始随机位置
      this.x = this.getRandom(0, canvasWidth - 10);
      this.y = this.getRandom(0, canvasHeight);

      // 粒子属性
      this.size = this.getRandom(1.1, 2.6); // 粒子大小
      this.dx = this.getRandom(velocityFactor, 6 * velocityFactor); // x轴移动速度
      this.dy = -this.getRandom(velocityFactor, 6 * velocityFactor); // y轴移动速度

      // 彗星增强移动速度
      if (this.comet) {
        this.dx += velocityFactor * this.getRandom(50, 120) + 0.1;
        this.dy -= velocityFactor * this.getRandom(50, 120);
      }

      // 透明度控制
      this.fadingOut = false; //淡出中
      this.fadingIn = true; // 淡入中
      this.opacity = 0; // 不透明度
      this.opacityThreshold = this.getRandom(0.2, this.comet ? 0.6 : 1); // 不透明度阈值
      this.fadeSpeed = this.getRandom(0.0005, 0.002) + (this.comet ? 0.001 : 0); // 淡出速度
    }

    // 淡入效果
    fadeIn() {
      if (this.fadingIn) {
        this.opacity += this.fadeSpeed;
        if (this.opacity > this.opacityThreshold) {
          this.fadingIn = false;
        }
      }
    }

    // 淡出效果
    fadeOut() {
      if (this.fadingOut) {
        this.opacity -= this.fadeSpeed / 2;

        if (this.opacity < 0 || this.x > canvasWidth || this.y < 0) {
          this.reset();
        }
      }
    }

    draw() {
      if (!ctx) return;
      ctx.beginPath();

      if (this.giant) {
        // 绘制巨型粒子（浅蓝色圆形）
        ctx.fillStyle = `rgba(180,184,240,${this.opacity})`;
        ctx.arc(this.x, this.y, 3, 0, 2 * Math.PI);
      } else if (this.comet) {
        // 绘制彗星
        ctx.fillStyle = `rgba(${cometColor},${this.opacity})`;
        ctx.arc(this.x, this.y, 1.5, 0, 2 * Math.PI);

        // 提前计算运动偏移量
        const dxStep = this.dx / 4;
        const dyStep = this.dy / 4;
        // 拖尾粒子
        for (let i = 0; i < 30; i++) {
          const alpha = this.opacity - (this.opacity / 20) * i;
          if (alpha <= 0) break; // 提前终止循环
          ctx.fillStyle = `rgba(${cometColor},${alpha})`;
          ctx.rect(this.x - dxStep * i, this.y - dyStep * i - 2, 2, 2);
          ctx.fill();
        }
      } else {
        // 普通粒子（黄色方块）
        ctx.fillStyle = `rgba(226,225,142,${this.opacity})`;
        ctx.rect(this.x, this.y, this.size, this.size);
      }

      ctx.closePath();
      ctx.fill();
    }

    // 移动粒子
    move() {
      this.x += this.dx;
      this.y += this.dy;

      // 触发淡出条件
      if (this.x > canvasWidth * 0.75 || this.y < 0) {
        this.fadingOut = true;
      }
    }
  }

  resizeCanvas();

  const throttleResizeCanvas = useThrottleFn(resizeCanvas, 200);
  window.addEventListener("resize", throttleResizeCanvas);

  ctx = canvas.getContext("2d");
  for (let t = 0; t < particleCount; t++) {
    particles.push(new Particle());
  }

  setTimeout(() => {
    allowComets = true;
  }, 50);

  let isRunning = true; // 添加控制标志

  const loop = () => {
    if (!ctx || !isRunning) return;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    const count = particles.length;
    for (let i = 0; i < count; i++) {
      const s = particles[i];
      if (s) {
        s.move();
        s.fadeIn();
        s.fadeOut();
        s.draw();
      }
    }

    window.requestAnimationFrame(loop);
  };
  loop();

  return {
    destroy: () => {
      isRunning = false;
      window.removeEventListener("resize", throttleResizeCanvas);
    }
  };
};
