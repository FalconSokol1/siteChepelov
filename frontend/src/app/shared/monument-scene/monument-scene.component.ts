import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-monument-scene',
  standalone: true,
  template: `<canvas #canvas class="monument-scene__canvas" aria-label="3D модель памятника"></canvas>`,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
        overflow: visible;
      }
      .monument-scene__canvas {
        display: block;
        width: 100%;
        height: 100%;
        background: transparent;
      }
    `,
  ],
})
export class MonumentSceneComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private monument?: THREE.Group;
  private frameId = 0;
  private resizeObserver?: ResizeObserver;
  private textures: THREE.Texture[] = [];
  private materials: THREE.Material[] = [];
  private readonly clock = new THREE.Clock();
  private readonly lookAt = new THREE.Vector3(0, 0.78, 0);

  ngAfterViewInit(): void {
    this.initScene();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.frameId);
    this.resizeObserver?.disconnect();
    this.textures.forEach((t) => t.dispose());
    this.materials.forEach((m) => m.dispose());
    this.renderer?.dispose();
  }

  private initScene(): void {
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.clientWidth || 480;
    const height = canvas.clientHeight || 420;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 100);

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height, false);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.48;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.35));

    const hemi = new THREE.HemisphereLight(0xf2ece4, 0x1c1814, 0.55);
    this.scene.add(hemi);

    const key = new THREE.DirectionalLight(0xfff6ea, 1.85);
    key.position.set(4, 7, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 20;
    key.shadow.camera.left = -3;
    key.shadow.camera.right = 3;
    key.shadow.camera.top = 3;
    key.shadow.camera.bottom = -0.5;
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(0xc8d0dc, 0.65);
    fill.position.set(-5, 2, 4);
    this.scene.add(fill);

    const rim = new THREE.DirectionalLight(0xb79a72, 0.45);
    rim.position.set(0, 2, -5);
    this.scene.add(rim);

    this.monument = this.buildMonument();
    this.monument.scale.setScalar(0.86);
    this.scene.add(this.monument);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 8),
      new THREE.ShadowMaterial({ opacity: 0.12 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(canvas.parentElement ?? canvas);
    this.animate();
  }

  /** Классический вертикальный памятник: габбро-стела + гранитный постамент */
  private buildMonument(): THREE.Group {
    const root = new THREE.Group();
    const gabbroTex = this.graniteTex('#1e1e22', true);
    const grayTex = this.graniteTex('#6d6d72', false);

    const gabbroPolished = this.mat(
      new THREE.MeshStandardMaterial({
        map: gabbroTex,
        color: 0x3a3a40,
        roughness: 0.32,
        metalness: 0.08,
      })
    );

    const gabbroEdge = this.mat(
      new THREE.MeshStandardMaterial({
        color: 0x52525a,
        roughness: 0.35,
        metalness: 0.1,
      })
    );

    const graniteGray = this.mat(
      new THREE.MeshStandardMaterial({
        map: grayTex,
        color: 0x8a8a90,
        roughness: 0.58,
        metalness: 0.06,
      })
    );

    const graniteDark = this.mat(
      new THREE.MeshStandardMaterial({
        map: grayTex,
        color: 0x5e5e64,
        roughness: 0.72,
        metalness: 0.04,
      })
    );

    const engraving = this.mat(
      new THREE.MeshStandardMaterial({
        color: 0x141416,
        roughness: 0.95,
        metalness: 0,
      })
    );

    root.add(this.pedestal(2.35, 0.18, 1.35, graniteDark, 0.09));
    root.add(this.pedestal(1.85, 0.14, 1.05, graniteGray, 0.25));
    root.add(this.pedestal(1.38, 0.16, 0.78, graniteGray, 0.39));

    const steleGroup = new THREE.Group();
    steleGroup.position.y = 1.02;

    const steleW = 0.72;
    const steleH = 1.62;
    const steleD = 0.2;
    const steleGeo = new THREE.BoxGeometry(steleW, steleH, steleD, 1, 12, 1);
    const sp = steleGeo.attributes['position'];
    for (let i = 0; i < sp.count; i++) {
      const y = sp.getY(i);
      if (y > 0) {
        const t = THREE.MathUtils.smoothstep(y, 0, steleH * 0.5);
        const s = 1 - t * 0.06;
        sp.setX(i, sp.getX(i) * s);
      }
    }
    steleGeo.computeVertexNormals();

    const stele = new THREE.Mesh(steleGeo, gabbroPolished);
    stele.castShadow = true;
    steleGroup.add(stele);

    const topCap = new THREE.Mesh(new THREE.BoxGeometry(steleW + 0.04, 0.06, steleD + 0.02), gabbroEdge);
    topCap.position.y = steleH / 2 + 0.02;
    steleGroup.add(topCap);

    const edgeL = new THREE.Mesh(new THREE.BoxGeometry(0.015, steleH * 0.92, steleD + 0.004), gabbroEdge);
    edgeL.position.set(-steleW / 2 + 0.01, 0, 0.002);
    steleGroup.add(edgeL);
    const edgeR = edgeL.clone();
    edgeR.position.x = steleW / 2 - 0.01;
    steleGroup.add(edgeR);

    const portrait = new THREE.Mesh(
      new THREE.CylinderGeometry(0.132, 0.132, 0.018, 48),
      engraving
    );
    portrait.rotation.x = Math.PI / 2;
    portrait.position.set(0, 0.28, steleD / 2 + 0.003);
    steleGroup.add(portrait);

    const frameOuter = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.42, 0.01), gabbroEdge);
    frameOuter.position.set(0, 0.28, steleD / 2 + 0.001);
    steleGroup.add(frameOuter);
    const frameInner = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.36, 0.012), gabbroPolished);
    frameInner.position.set(0, 0.28, steleD / 2 + 0.002);
    steleGroup.add(frameInner);

    const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.018, 0.008), engraving);
    crossH.position.set(0, -0.08, steleD / 2 + 0.006);
    steleGroup.add(crossH);
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.22, 0.008), engraving);
    crossV.position.set(0, -0.08, steleD / 2 + 0.006);
    steleGroup.add(crossV);

    root.add(steleGroup);

    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.castShadow = true;
        m.receiveShadow = true;
      }
    });

    return root;
  }

  private pedestal(w: number, h: number, d: number, mat: THREE.Material, y: number): THREE.Mesh {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.y = y;
    return m;
  }

  private graniteTex(base: string, dark: boolean): THREE.CanvasTexture {
    const size = 512;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, size, size);

    const n = dark ? 14000 : 9000;
    for (let i = 0; i < n; i++) {
      const v = dark ? 20 + Math.random() * 70 : 90 + Math.random() * 80;
      ctx.fillStyle = `rgba(${v},${v},${v + (dark ? 3 : 1)},${0.03 + Math.random() * 0.09})`;
      const s = 0.5 + Math.random() * (dark ? 2.5 : 2);
      ctx.fillRect(Math.random() * size, Math.random() * size, s, s);
    }

    if (dark) {
      for (let i = 0; i < 400; i++) {
        const b = 60 + Math.random() * 80;
        ctx.fillStyle = `rgba(${b - 15},${b - 8},${b + 20},0.05)`;
        ctx.beginPath();
        ctx.arc(Math.random() * size, Math.random() * size, 0.3 + Math.random(), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2.5, 2.5);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.textures.push(tex);
    return tex;
  }

  private mat(m: THREE.Material): THREE.Material {
    this.materials.push(m);
    return m;
  }

  private onResize(): void {
    if (!this.renderer || !this.camera || !this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight || 360;
    if (!w || !h) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  private animate = (): void => {
    this.frameId = requestAnimationFrame(this.animate);
    const t = this.clock.getElapsedTime();

    if (this.monument) {
      this.monument.rotation.y = t * 0.28;
    }

    if (this.camera) {
      const a = t * 0.1;
      const r = 4.15 + Math.sin(t * 0.19) * 0.12;
      const y = 0.92 + Math.sin(t * 0.14 + 1) * 0.08;
      this.camera.position.set(Math.sin(a) * r, y, Math.cos(a) * r);
      this.camera.lookAt(this.lookAt);
    }

    this.renderer?.render(this.scene!, this.camera!);
  };
}