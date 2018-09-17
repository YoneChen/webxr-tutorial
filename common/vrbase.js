class VRBase {
    constructor(el) {
        this.el = el;
        this.canvas;
        this.gl;
        this.xrDevice;
        this.xrSession;
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
        const { xrDevice, gl } = this;
        try {
            const xrSession = await xrDevice.requestSession({ immersive: true });
            const xrFrameOfRef = await xrSession.requestFrameOfReference("stage");
            xrSession.baseLayer = new XRWebGLLayer(xrSession, gl);
            this.xrSession = xrSession;
        } catch(err) {

        }
    }
    _createVRButton() {
        const {el} = this;
        const enterXrBtn = document.createElement("button");
        enterXrBtn.innerHTML = "Enter VR";
        enterXrBtn.addEventListener("click", this.onEnterVR.bind(this));
        el.appendChild(enterXrBtn);
    }
    update() {}
}