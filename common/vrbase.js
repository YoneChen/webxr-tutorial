class VRBase {
    constructor(el) {
        this.el = el;
        this._init();
        this.start();
        this._checkForXR();
    }
    _init() {
        const { el } = this;
		// 初始化场景
		this.scene = new THREE.Scene();
		// 初始化相机
		this.camera = new THREE.PerspectiveCamera(60, el.clientWidth / el.clientHeight, 0.1, 1000);
		this.scene.add(this.camera);

		// 初始化渲染器
		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setSize(el.clientWidth, el.clientHeight);
		this.renderer.shadowMapEnabled = true;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        el.appendChild(this.renderer.domElement);
        this.gl = this.renderer.getContext();
    }
    async _checkForMagicWindow() {
        const { gl } = this;
        try {
            const xrDevice = await navigator.xr.requestDevice();
            await xrDevice.supportsSession({ immersive: false });
            await gl.setCompatibleXRDevice(xrDevice);
            this._createVRButton();
            this.xrDevice = xrDevice;
        } catch(err) {
            console.error(err);
            this._drawFrame();
        }
    }
    async _checkForXR() {
        const { gl } = this;
        try {
            const xrDevice = await navigator.xr.requestDevice();
            console.log(xrDevice);
            await xrDevice.supportsSession({ immersive: true });
            await gl.setCompatibleXRDevice(xrDevice);
            this._createVRButton();
            this.xrDevice = xrDevice;
        } catch(err) {
            console.error(err);
            this._drawFrame();
        }
    }
    async _onEnterVR() {
        const { xrDevice, gl } = this;
        try {
            let xrSession = await xrDevice.requestSession({ immersive: true });
            let xrFrameOfRef = await xrSession.requestFrameOfReference("stage");
            xrSession.baseLayer = new XRWebGLLayer(xrSession, gl);
            this.xrSession = xrSession;
            this.xrFrameOfRef = xrFrameOfRef;
            xrSession.requestAnimationFrame(this._drawXRFrame.bind(this));
        } catch(err) {
            console.error(err);
        }
    }
    _drawFrame(timestamp) {
        const { renderer, camera, scene } = this;
        this.update();
        renderer.render(scene, camera);
        window.requestAnimationFrame(this._drawFrame.bind(this));
    }
    _drawXRFrame(timestamp, xrFrame) {
        const { gl, xrFrameOfRef, xrSession, renderer, camera, scene } = this;
        let pose = xrFrame.getDevicePose(xrFrameOfRef);
        gl.bindFramebuffer(gl.FRAMEBUFFER, xrSession.baseLayer.framebuffer);
        for (let view of xrFrame.views) {
            let viewport = xrSession.baseLayer.getViewport(view);
            renderer.setSize(viewport.width, viewport.height);
    
            camera.projectionMatrix.fromArray(view.projectionMatrix);
            const viewMatrix = new THREE.Matrix4().fromArray(pose.getViewMatrix(view));
            camera.matrix.getInverse(viewMatrix);
            camera.updateMatrixWorld(true);
    
            renderer.clearDepth();
            this.update();
    
            renderer.render(scene, camera);
            // gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
            // let viewMatrix = pose.getViewMatrix(view);
            // let projectionMatrix = view.projectionMatrix;
            // update(viewMatrix,projectionMatrix);
          }
      
          // Request the next animation callback
          xrSession.requestAnimationFrame(this._drawXRFrame.bind(this));
    }
    _createVRButton() {
        const { el } = this;
        let enterXrBtn = document.createElement("button");
        enterXrBtn.innerHTML = "Enter VR";
        enterXrBtn.addEventListener("click", this._onEnterVR.bind(this));
        el.appendChild(enterXrBtn);
    }
    start() {}
    update() {}
}