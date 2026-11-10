//  ORIGAMI BOX 3D SIMULATION ENGINE


class OrigamiSimulator {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.paper = null;
        this.animationSpeed = 1.0;
        this.isPlaying = false;
        this.isPaused = false;
        this.autoRotate = false;
        this.currentStep = 0;
        this.totalSteps = 6;
        this.animationProgress = 0;
        this.foldingSteps = [];
        
        this.init();
    }

    init() {
        this.setupScene();
        this.setupLighting();
        this.createPaper();
        this.setupControls();
        this.setupEventListeners();
        this.defineFoldingSequence();
        this.animate();
        
        // Hide loading screen
        setTimeout(() => {
            document.getElementById('loading').classList.add('hidden');
        }, 1000);
    }

    setupScene() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf5f5f5);
        
        // Setup camera
        const canvas = document.getElementById('origamiCanvas');
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        this.camera.position.set(0, 8, 15);
        this.camera.lookAt(0, 0, 0);
        
        // Setup renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        // Main directional light
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
        mainLight.position.set(5, 10, 7);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        this.scene.add(mainLight);
        
        // Fill light
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(-5, 5, -5);
        this.scene.add(fillLight);
        
        // Rim light
        const rimLight = new THREE.DirectionalLight(0xffffff, 0.2);
        rimLight.position.set(0, 5, -10);
        this.scene.add(rimLight);
        
        // Add ground plane for shadows
        const groundGeometry = new THREE.PlaneGeometry(50, 50);
        const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.1 });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -2;
        ground.receiveShadow = true;
        this.scene.add(ground);
    }

    createPaper() {
        // Create realistic paper material
        const paperMaterial = new THREE.MeshPhongMaterial({
            color: 0xff6b9d,
            side: THREE.DoubleSide,
            shininess: 5,
            specular: 0x222222,
            flatShading: false
        });
        
        // Create square paper (starting shape)
        const size = 6;
        const geometry = new THREE.PlaneGeometry(size, size, 64, 64);
        
        this.paper = new THREE.Mesh(geometry, paperMaterial);
        this.paper.castShadow = true;
        this.paper.receiveShadow = true;
        
        this.paper.rotation.x = -Math.PI / 2;
        
        // Store original vertices for animation
        this.originalVertices = geometry.attributes.position.array.slice();
        
        this.scene.add(this.paper);
    }

    setupControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 30;
        this.controls.maxPolarAngle = Math.PI / 1.5;
    }

    defineFoldingSequence() {
        this.foldingSteps = [
            {
                name: "Starting Position",
                description: "Square paper ready to fold",
                transform: (progress) => this.transformStep0(progress)
            },
            {
                name: "Mark Center Lines",
                description: "Creating center creases",
                transform: (progress) => this.transformStep1(progress)
            },
            {
                name: "Fold Corners",
                description: "Folding corners to center",
                transform: (progress) => this.transformStep2(progress)
            },
            {
                name: "Prepare Walls",
                description: "Preparing to lift walls",
                transform: (progress) => this.transformStep3(progress)
            },
            {
                name: "Lift Walls",
                description: "Lifting walls vertically",
                transform: (progress) => this.transformStep4(progress)
            },
            {
                name: "Complete Box",
                description: "Final box shape",
                transform: (progress) => this.transformStep5(progress)
            }
        ];
    }

    // Transformation functions for each folding step
    transformStep0(progress) {
        // Initial flat square - no transformation
        const geometry = this.paper.geometry;
        const positions = geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i++) {
            positions[i] = this.originalVertices[i];
        }
        
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
    }

    transformStep1(progress) {
        // Create center creases by slightly lifting the middle
        const geometry = this.paper.geometry;
        const positions = geometry.attributes.position.array;
        const easing = this.easeInOutCubic(progress);
        
        for (let i = 0; i < positions.length; i += 3) {
            const x = this.originalVertices[i];
            const y = this.originalVertices[i + 1];
            const z = this.originalVertices[i + 2];
            
            // Create subtle creases along center lines
            const distFromCenterX = Math.abs(x);
            const distFromCenterY = Math.abs(y);
            
            let lift = 0;
            if (distFromCenterX < 0.1) {
                lift = 0.1 * easing * (1 - distFromCenterY / 3);
            }
            if (distFromCenterY < 0.1) {
                lift = Math.max(lift, 0.1 * easing * (1 - distFromCenterX / 3));
            }
            
            positions[i] = x;
            positions[i + 1] = y;
            positions[i + 2] = z + lift;
        }
        
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
    }

    transformStep2(progress) {
        // Fold corners to center
        const geometry = this.paper.geometry;
        const positions = geometry.attributes.position.array;
        const easing = this.easeInOutCubic(progress);
        
        for (let i = 0; i < positions.length; i += 3) {
            const x = this.originalVertices[i];
            const y = this.originalVertices[i + 1];
            const z = this.originalVertices[i + 2];
            
            // Define corner regions (4 triangular areas)
            const isTopRight = x > 0 && y > 0 && (x + y) > 3;
            const isTopLeft = x < 0 && y > 0 && (-x + y) > 3;
            const isBottomRight = x > 0 && y < 0 && (x - y) > 3;
            const isBottomLeft = x < 0 && y < 0 && (-x - y) > 3;
            
            if (isTopRight) {
                // Fold top-right corner
                const foldProgress = easing;
                const newX = x - (x - 0) * foldProgress * 0.7;
                const newY = y - (y - 0) * foldProgress * 0.7;
                const newZ = Math.sqrt(x * x + y * y) * foldProgress * 0.3;
                
                positions[i] = newX;
                positions[i + 1] = newY;
                positions[i + 2] = newZ;
            } else if (isTopLeft) {
                // Fold top-left corner
                const foldProgress = easing;
                const newX = x - (x - 0) * foldProgress * 0.7;
                const newY = y - (y - 0) * foldProgress * 0.7;
                const newZ = Math.sqrt(x * x + y * y) * foldProgress * 0.3;
                
                positions[i] = newX;
                positions[i + 1] = newY;
                positions[i + 2] = newZ;
            } else if (isBottomRight) {
                // Fold bottom-right corner
                const foldProgress = easing;
                const newX = x - (x - 0) * foldProgress * 0.7;
                const newY = y - (y - 0) * foldProgress * 0.7;
                const newZ = Math.sqrt(x * x + y * y) * foldProgress * 0.3;
                
                positions[i] = newX;
                positions[i + 1] = newY;
                positions[i + 2] = newZ;
            } else if (isBottomLeft) {
                // Fold bottom-left corner
                const foldProgress = easing;
                const newX = x - (x - 0) * foldProgress * 0.7;
                const newY = y - (y - 0) * foldProgress * 0.7;
                const newZ = Math.sqrt(x * x + y * y) * foldProgress * 0.3;
                
                positions[i] = newX;
                positions[i + 1] = newY;
                positions[i + 2] = newZ;
            } else {
                // Keep center area flat
                positions[i] = x;
                positions[i + 1] = y;
                positions[i + 2] = z;
            }
        }
        
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
    }

    transformStep3(progress) {
        // Prepare walls - start lifting edges
        const geometry = this.paper.geometry;
        const positions = geometry.attributes.position.array;
        const easing = this.easeInOutCubic(progress);
        
        const boxSize = 2.0; // Final box size
        
        for (let i = 0; i < positions.length; i += 3) {
            const x = this.originalVertices[i];
            const y = this.originalVertices[i + 1];
            const z = this.originalVertices[i + 2];
            
            // Keep corners folded
            const isCorner = (Math.abs(x) > 2 && Math.abs(y) > 2);
            
            if (isCorner) {
                // Keep corners in place from previous step
                const cornerX = x > 0 ? boxSize : -boxSize;
                const cornerY = y > 0 ? boxSize : -boxSize;
                positions[i] = cornerX * 0.5;
                positions[i + 1] = cornerY * 0.5;
                positions[i + 2] = 0.5;
            } else if (Math.abs(x) > boxSize) {
                // Side walls (left/right) - start lifting
                const wallX = x > 0 ? boxSize : -boxSize;
                positions[i] = wallX;
                positions[i + 1] = y * (boxSize / 3);
                positions[i + 2] = Math.abs(x - wallX) * easing * 0.3;
            } else if (Math.abs(y) > boxSize) {
                // Front/back walls - start lifting
                const wallY = y > 0 ? boxSize : -boxSize;
                positions[i] = x * (boxSize / 3);
                positions[i + 1] = wallY;
                positions[i + 2] = Math.abs(y - wallY) * easing * 0.3;
            } else {
                // Bottom stays flat
                positions[i] = x * (boxSize / 3);
                positions[i + 1] = y * (boxSize / 3);
                positions[i + 2] = 0;
            }
        }
        
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
    }

    transformStep4(progress) {
        // Lift walls to vertical position
        const geometry = this.paper.geometry;
        const positions = geometry.attributes.position.array;
        const easing = this.easeInOutCubic(progress);
        
        const boxSize = 2.0;
        const wallHeight = 2.0;
        
        for (let i = 0; i < positions.length; i += 3) {
            const x = this.originalVertices[i];
            const y = this.originalVertices[i + 1];
            const z = this.originalVertices[i + 2];
            
            const absX = Math.abs(x);
            const absY = Math.abs(y);
            
            // Determine which part of the box this vertex belongs to
            if (absX > boxSize && absY > boxSize) {
                // Corner flaps - tuck inside
                const cornerX = x > 0 ? boxSize : -boxSize;
                const cornerY = y > 0 ? boxSize : -boxSize;
                positions[i] = cornerX * 0.9;
                positions[i + 1] = cornerY * 0.9;
                positions[i + 2] = wallHeight * 0.8 * easing;
            } else if (absX > boxSize && absY <= boxSize) {
                // Left/right walls
                const wallX = x > 0 ? boxSize : -boxSize;
                positions[i] = wallX;
                positions[i + 1] = y * (boxSize / 3);
                positions[i + 2] = (absX - boxSize) * wallHeight * easing / (3 - boxSize);
            } else if (absY > boxSize && absX <= boxSize) {
                // Front/back walls
                const wallY = y > 0 ? boxSize : -boxSize;
                positions[i] = x * (boxSize / 3);
                positions[i + 1] = wallY;
                positions[i + 2] = (absY - boxSize) * wallHeight * easing / (3 - boxSize);
            } else {
                // Bottom of box
                positions[i] = x * (boxSize / 3);
                positions[i + 1] = y * (boxSize / 3);
                positions[i + 2] = 0;
            }
        }
        
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
    }

    transformStep5(progress) {
        // Final box shape with clean walls
        const geometry = this.paper.geometry;
        const positions = geometry.attributes.position.array;
        const easing = this.easeInOutCubic(progress);
        
        const boxSize = 2.0;
        const wallHeight = 2.0;
        
        for (let i = 0; i < positions.length; i += 3) {
            const x = this.originalVertices[i];
            const y = this.originalVertices[i + 1];
            const z = this.originalVertices[i + 2];
            
            const absX = Math.abs(x);
            const absY = Math.abs(y);
            
            // Create clean box shape
            if (absX > boxSize && absY > boxSize) {
                // Corner flaps - fully tucked
                const cornerX = x > 0 ? boxSize : -boxSize;
                const cornerY = y > 0 ? boxSize : -boxSize;
                positions[i] = cornerX * 0.85;
                positions[i + 1] = cornerY * 0.85;
                positions[i + 2] = wallHeight * 0.9;
            } else if (absX > boxSize && absY <= boxSize) {
                // Left/right walls - vertical
                const wallX = x > 0 ? boxSize : -boxSize;
                const heightRatio = (absX - boxSize) / (3 - boxSize);
                positions[i] = wallX;
                positions[i + 1] = y * (boxSize / 3);
                positions[i + 2] = wallHeight * heightRatio;
            } else if (absY > boxSize && absX <= boxSize) {
                // Front/back walls - vertical
                const wallY = y > 0 ? boxSize : -boxSize;
                const heightRatio = (absY - boxSize) / (3 - boxSize);
                positions[i] = x * (boxSize / 3);
                positions[i + 1] = wallY;
                positions[i + 2] = wallHeight * heightRatio;
            } else {
                // Bottom of box - perfectly flat
                positions[i] = x * (boxSize / 3);
                positions[i + 1] = y * (boxSize / 3);
                positions[i + 2] = 0;
            }
        }
        
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    setupEventListeners() {
        // Play button
        document.getElementById('playBtn').addEventListener('click', () => {
            this.play();
        });
        
        // Pause button
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.pause();
        });
        
        // Reset button
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.reset();
        });
        
        // Speed slider
        const speedSlider = document.getElementById('speedSlider');
        speedSlider.addEventListener('input', (e) => {
            this.animationSpeed = parseFloat(e.target.value);
            document.getElementById('speedValue').textContent = this.animationSpeed.toFixed(1) + 'x';
        });
        
        // Auto-rotate button
        document.getElementById('rotateBtn').addEventListener('click', () => {
            this.autoRotate = !this.autoRotate;
            this.controls.autoRotate = this.autoRotate;
            document.getElementById('rotateBtn').classList.toggle('active');
        });
        
        // Reset view button
        document.getElementById('resetViewBtn').addEventListener('click', () => {
            this.resetView();
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.onWindowResize();
        });
    }

    play() {
        this.isPlaying = true;
        this.isPaused = false;
        document.getElementById('playBtn').classList.add('active');
        document.getElementById('pauseBtn').classList.remove('active');
    }

    pause() {
        this.isPaused = true;
        document.getElementById('pauseBtn').classList.add('active');
        document.getElementById('playBtn').classList.remove('active');
    }

    reset() {
        this.isPlaying = false;
        this.isPaused = false;
        this.currentStep = 0;
        this.animationProgress = 0;
        this.updateUI();
        this.foldingSteps[0].transform(0);
        document.getElementById('playBtn').classList.remove('active');
        document.getElementById('pauseBtn').classList.remove('active');
    }

    resetView() {
        this.camera.position.set(0, 8, 15);
        this.camera.lookAt(0, 0, 0);
        this.controls.reset();
    }

    updateUI() {
        const stepNumber = document.getElementById('stepNumber');
        const stepDescription = document.getElementById('stepDescription');
        const progressFill = document.getElementById('progressFill');
        
        stepNumber.textContent = `${this.currentStep} / ${this.totalSteps}`;
        stepDescription.textContent = this.foldingSteps[this.currentStep].description;
        
        const progress = (this.currentStep / this.totalSteps) * 100;
        progressFill.style.width = progress + '%';
    }

    onWindowResize() {
        const canvas = document.getElementById('origamiCanvas');
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update animation
        if (this.isPlaying && !this.isPaused) {
            this.animationProgress += 0.01 * this.animationSpeed;
            
            if (this.animationProgress >= 1) {
                this.animationProgress = 0;
                this.currentStep++;
                
                if (this.currentStep >= this.totalSteps) {
                    this.currentStep = this.totalSteps - 1;
                    this.isPlaying = false;
                    document.getElementById('playBtn').classList.remove('active');
                }
                
                this.updateUI();
            }
            
            // Apply current step transformation
            this.foldingSteps[this.currentStep].transform(this.animationProgress);
        }
        
        // Update controls
        this.controls.update();
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the simulator when the page loads
window.addEventListener('DOMContentLoaded', () => {
    const simulator = new OrigamiSimulator();
});