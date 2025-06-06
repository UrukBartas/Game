import { ElementRef, Injectable, NgZone } from '@angular/core';
import { LootboxPresaleThreeService } from 'src/modules/black-market/services/lootbox-presale-threejs.service';
import { ViewportService } from 'src/services/viewport.service';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root',
})
export class CryptThreejsServiceTsService extends LootboxPresaleThreeService {
  constructor(ngZone: NgZone) {
    super(ngZone);
  }

  override initialize(
    container: ElementRef<HTMLDivElement>,
    fogColor: number
  ): void {
    // Create the scene
    this.scene = new THREE.Scene();
    this.scene.background = null; // Elimina el fondo negro para permitir transparencia

    // Create the camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      container.nativeElement.clientWidth /
      container.nativeElement.clientHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;

    // Create the renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setClearColor(0x000000, 0); // Fondo transparente
    this.renderer.setSize(
      container.nativeElement.clientWidth,
      container.nativeElement.clientHeight
    );
    container.nativeElement.appendChild(this.renderer.domElement);

    // Add lighting
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(0, 5, 10);
    this.scene.add(pointLight);

    // Add centered light
    const centeredLight = new THREE.PointLight(0xffffff, 1, 100);
    centeredLight.position.set(0, 0, 0);
    this.scene.add(centeredLight);

    // Load fog texture
    const loader = new THREE.TextureLoader();
    loader.load(
      ViewportService.getPreffixImg() + '/assets/presale/fog.png',
      (texture) => {
        // Create smoke particles using the texture
        this.createSmoke(texture, fogColor);
      }
    );

    this.resizeListener = this.onWindowResize.bind(this);
    window.addEventListener('resize', this.resizeListener);

    this.animate();
  }

  override createSmoke(texture: THREE.Texture, fogColor: number) {
    const smokeMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.5,
      blending: THREE.NormalBlending,
      depthWrite: false,
      color: fogColor,
    });

    const smokeGeometry = new THREE.PlaneGeometry(10, 10);
    for (let i = 0; i < 50; i++) {
      const particle = new THREE.Mesh(smokeGeometry, smokeMaterial);
      particle.position.set(
        Math.random() * 20 - 10, // X position
        Math.random() * -5 - 5, // Y position: stay below the canvas
        Math.random() * 20 - 10 // Z position
      );
      particle.rotation.z = Math.random() * Math.PI * 2;
      this.scene.add(particle);
      this.smokeParticles.push(particle);
    }
  }

  override animate = () => {
    this.ngZone.runOutsideAngular(() => {
      requestAnimationFrame(this.animate);

      // Keep the smoke particles static or move very slightly
      this.smokeParticles.forEach((particle) => {
        particle.rotation.z += 0.001; // Minimal rotation
      });

      this.renderer.render(this.scene, this.camera);
    });
  };
}
