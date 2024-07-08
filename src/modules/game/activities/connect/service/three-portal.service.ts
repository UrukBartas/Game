import { Injectable, ElementRef, NgZone } from '@angular/core';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader';

@Injectable({
  providedIn: 'root',
})
export class ThreePortalService {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private composer: EffectComposer;
  private portalMaterial: THREE.ShaderMaterial;
  private animationId: number;
  private container: ElementRef;

  constructor(private ngZone: NgZone) {}

  initialize(container: ElementRef): void {
    this.container = container;

    // Basic scene setup
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      container.nativeElement.clientWidth /
        container.nativeElement.clientHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(
      container.nativeElement.clientWidth,
      container.nativeElement.clientHeight
    );
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.nativeElement.appendChild(this.renderer.domElement);

    this.camera.position.set(0, 0, 7);

    // Shader material for the portal
    this.portalMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 1.0 },
        resolution: { value: new THREE.Vector2() },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec2 vUv;

        void main() {
          vec2 uv = vUv;
          vec2 center = uv - vec2(0.5, 0.4);
          float angle = atan(center.y, center.x);
          float radius = length(center * 1.5);

          float swirl = angle + radius * 6.0 - time * 1.0;
          float electric = sin(radius * 20.0 - time * 10.0) * 0.5 + 0.5;

          float colorFactor = 0.5 + 0.5 * sin(swirl * 10.0);
          vec3 baseColor = vec3(0.0, 0.0, 0.4);
          vec3 midColor = vec3(0.0, 0.2, 1.0);
          vec3 swirlColor = vec3(0.0, 0.8, 1.0);
          vec3 brightColor = vec3(0.2, 0.2, 1.5);
          vec3 color = mix(baseColor, midColor, colorFactor);
          color = mix(color, swirlColor, colorFactor);
          color = mix(color, brightColor, electric);

          float intensity = smoothstep(0.6, 0.0, radius);
          color *= intensity;

          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.DoubleSide,
      transparent: true,
    });

    const portalGeometry = new THREE.CircleGeometry(5, 64);
    const portal = new THREE.Mesh(portalGeometry, this.portalMaterial);
    this.scene.add(portal);

    // Post-processing for glow and bloom effects
    const renderPass = new RenderPass(this.scene, this.camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(
        container.nativeElement.clientWidth,
        container.nativeElement.clientHeight
      ),
      1.5,
      0.4,
      0.85
    );
    bloomPass.threshold = 0;
    bloomPass.strength = 2;
    bloomPass.radius = 0.5;

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(renderPass);
    this.composer.addPass(bloomPass);

    this.animate();
    window.addEventListener('resize', this.onWindowResize.bind(this), false);
  }

  private animate(): void {
    this.ngZone.runOutsideAngular(() => {
      this.animationId = requestAnimationFrame(() => this.animate());
      this.portalMaterial.uniforms['time'].value += 0.003;
      this.composer.render();
    });
  }

  private onWindowResize(): void {
    if (this.container) {
      this.camera.aspect =
        this.container.nativeElement.clientWidth /
        this.container.nativeElement.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(
        this.container.nativeElement.clientWidth,
        this.container.nativeElement.clientHeight
      );
      this.composer.setSize(
        this.container.nativeElement.clientWidth,
        this.container.nativeElement.clientHeight
      );
    }
  }

  dispose(): void {
    cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.onWindowResize.bind(this));
    this.renderer.dispose();
    this.portalMaterial.dispose();
  }
}
