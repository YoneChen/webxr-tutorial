class RTCBase {
    constructor(el) {
        let canvas = document.createElement('canvas');
        canvas.style.width = el.clientWidth + 'px', canvas.style.height = el.clientHeight + 'px';
        this.width = el.clientHeight, this.height = el.clientWidth;
        canvas.width = el.clientWidth * window.devicePixelRatio, canvas.height = el.clientHeight * window.devicePixelRatio;
        el.appendChild(canvas);
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this._init();
    }
    async _init() {
        let video = document.createElement('video');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
        video.onloadedmetadata = function(e) {
            video.play();
          };
        video.srcObject = stream;
        this.video = video;
        this.stream = stream;
        window.requestAnimationFrame(this._render.bind(this));
    }
    _drawVideo() {
        const {ctx,video,canvas} = this;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
    _render() {
        this._drawVideo();
        this.update();
        window.requestAnimationFrame(this._render.bind(this));
    }
    update() {}
}