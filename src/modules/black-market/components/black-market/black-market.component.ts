import { Location } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import * as THREE from 'three';

@Component({
  selector: 'app-black-market',
  templateUrl: './black-market.component.html',
  styleUrls: ['./black-market.component.scss']
})
export class BlackMarketComponent extends TemplatePage implements OnInit, AfterViewInit, OnDestroy {
  activeSection: string | null = null;
  @ViewChild('animatedParticles', { static: true }) particlesContainer: ElementRef;

  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private particles: THREE.Group;
  private animationFrameId: number;
  private clock = new THREE.Clock();

  constructor(private router: Router, private location: Location) {
    super();
  }

  ngOnInit(): void {
    // Initialize component
  }

  ngAfterViewInit(): void {
    this.initThreeJS();
    this.animate();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    if (this.renderer) {
      this.renderer.dispose();
    }

    // Remove event listener
    window.removeEventListener('resize', this.onWindowResize.bind(this));
  }

  private initThreeJS(): void {
    // Create scene
    this.scene = new THREE.Scene();

    // Create camera
    const aspectRatio = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
    this.camera.position.z = 30;

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 0);
    this.particlesContainer.nativeElement.appendChild(this.renderer.domElement);

    // Create smoke-like particles
    this.createSmokeParticles();

    // Handle window resize
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  private createSmokeParticles(): void {
    // Create a group to hold all smoke planes
    this.particles = new THREE.Group();

    // Create particle texture
    const texture = this.createSmokeTexture();

    // Create multiple smoke planes
    const smokeCount = 20;

    for (let i = 0; i < smokeCount; i++) {
      // Use a simpler material to avoid shader compilation issues
      const smokeMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.2 + Math.random() * 0.1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        color: new THREE.Color(0xc8aa6e) // Gold color
      });

      // Create plane geometry
      const size = 10 + Math.random() * 15;
      const smokeGeo = new THREE.PlaneGeometry(size, size);

      // Create mesh
      const smoke = new THREE.Mesh(smokeGeo, smokeMaterial);

      // Position randomly
      smoke.position.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 10 - 5
      );

      // Random rotation
      smoke.rotation.z = Math.random() * Math.PI * 2;

      // Store animation properties
      smoke.userData = {
        rotationSpeed: (Math.random() - 0.5) * 0.001,
        driftX: (Math.random() - 0.5) * 0.01,
        driftY: (Math.random() - 0.5) * 0.01,
        driftZ: (Math.random() - 0.5) * 0.005,
        initialY: smoke.position.y,
        amplitude: 0.5 + Math.random() * 0.5,
        frequency: 0.05 + Math.random() * 0.05,
        initialOpacity: smokeMaterial.opacity
      };

      this.particles.add(smoke);
    }

    this.scene.add(this.particles);
  }

  private createSmokeTexture(): THREE.Texture {
    // Create a canvas to draw the smoke texture
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;

    const context = canvas.getContext('2d');

    // Create a radial gradient for a soft smoke texture
    const gradient = context.createRadialGradient(
      64, 64, 0,
      64, 64, 64
    );

    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);

    // Add some noise for texture
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * 128;
      const y = Math.random() * 128;
      const r = Math.random() * 2;

      context.beginPath();
      context.arc(x, y, r, 0, Math.PI * 2);
      context.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.03})`;
      context.fill();
    }

    // Create texture from canvas
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  private animate(): void {
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));

    const elapsedTime = this.clock.getElapsedTime();

    // Animate smoke particles
    if (this.particles) {
      this.particles.children.forEach((smoke: THREE.Mesh) => {
        // Rotate each smoke plane
        smoke.rotation.z += smoke.userData.rotationSpeed;

        // Drift movement
        smoke.position.x += smoke.userData.driftX;
        smoke.position.y = smoke.userData.initialY + Math.sin(elapsedTime * smoke.userData.frequency) * smoke.userData.amplitude;
        smoke.position.z += smoke.userData.driftZ;

        // Pulse opacity for a more dynamic effect
        const material = smoke.material as THREE.MeshBasicMaterial;
        material.opacity = smoke.userData.initialOpacity + Math.sin(elapsedTime * 0.5) * 0.1;

        // Reset position if too far
        if (
          smoke.position.x > 20 || smoke.position.x < -20 ||
          smoke.position.z > 10 || smoke.position.z < -20
        ) {
          smoke.position.x = (Math.random() - 0.5) * 30;
          smoke.position.z = (Math.random() - 0.5) * 10 - 5;
          smoke.userData.driftX = (Math.random() - 0.5) * 0.01;
          smoke.userData.driftZ = (Math.random() - 0.5) * 0.005;
        }
      });
    }

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  navigateToSection(section: string): void {
    setTimeout(() => {
      this.activeSection = section;
    }, 100);

    // Add transition effect to particles
    if (this.particles) {
      // Create a swirl effect when navigating
      this.particles.children.forEach((smoke: THREE.Mesh) => {
        // Increase drift speed temporarily
        smoke.userData.driftX *= 3;
        smoke.userData.driftZ *= 3;

        // Reset to normal after 1 second
        setTimeout(() => {
          smoke.userData.driftX /= 3;
          smoke.userData.driftZ /= 3;
        }, 1000);
      });
    }
  }

  resetSection(): void {
    this.activeSection = null;

    // Add transition effect to particles
    if (this.particles) {
      // Create a converging effect when returning
      this.particles.children.forEach((smoke: THREE.Mesh) => {
        // Increase amplitude temporarily for a "pulse" effect
        const originalAmplitude = smoke.userData.amplitude;
        smoke.userData.amplitude *= 2;

        // Reset to normal after 1 second
        setTimeout(() => {
          smoke.userData.amplitude = originalAmplitude;
        }, 1000);
      });
    }
  }

  navigateBack(): void {
    this.location.back();
  }
}
