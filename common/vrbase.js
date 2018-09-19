class VRBase {
    constructor(el) {
        this.el = el;
        this.canvas;
        this.gl;
        this.xrDevice;
        this.xrSession;
        this.xrFrameOfRef;
        this.addCanvas();
        this.checkForXR();
    }
    addCanvas() {
        const {el} = this;
        const canvas = document.createElement('canvas');
        canvas.style.width = el.clientWidth + 'px',
        canvas.style.height = el.clientHeight + 'px';
        canvas.width = window.devicePixelRatio * el.clientWidth,
        canvas.height = window.devicePixelRatio * el.clientHeight;
        el.appendChild(canvas);
        this.canvas = canvas;
    }
    async checkForXR() {
        try {
            const xrDevice = navigator.xr.requestDevice();
            await xrDevice.supportsSession({ immersive: true });
            this._createVRButton();
            this.xrDevice = xrDevice;
            this.gl = this.canvas.getContext('webgl', { compatibleXRDevice: xrDevice });
        } catch(err) {

        }
    }
    async onEnterVR() {
        const { xrDevice, gl, drawXRFrame } = this;
        try {
            let xrSession = await xrDevice.requestSession({ immersive: true });
            let xrFrameOfRef = await xrSession.requestFrameOfReference("stage");
            xrSession.baseLayer = new XRWebGLLayer(xrSession, gl);
            this.xrSession = xrSession;
            this.xrFrameOfRef = xrFrameOfRef;
            drawXRFrame();
        } catch(err) {

        }
    }
    drawXRFrame(timestamp, xrFrame) {
        const { gl, xrFrameOfRef, update } = this;
        let pose = xrFrame.getDevicePose(xrFrameOfRef);
        gl.bindFramebuffer(gl.FRAMEBUFFER, xrSession.baseLayer.framebuffer);
        for (let view of xrFrame.views) {
            let viewport = xrSession.baseLayer.getViewport(view);
            gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
            let viewMatrix = pose.getViewMatrix(view);
            let projectionMatrix = view.projectionMatrix;
            update(viewMatrix,projectionMatrix);
          }
      
          // Request the next animation callback
          xrSession.requestAnimationFrame(drawXRFrame);
    }
    _createVRButton() {
        const { el, onEnterVR } = this;
        let enterXrBtn = document.createElement("button");
        enterXrBtn.innerHTML = "Enter VR";
        enterXrBtn.addEventListener("click", onEnterVR.bind(this));
        el.appendChild(enterXrBtn);
    }
    
    update() {}
}