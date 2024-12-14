// 获取DOM元素
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const compressControl = document.getElementById('compressControl');
const previewSection = document.getElementById('previewSection');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const originalPreview = document.getElementById('originalPreview');
const compressedPreview = document.getElementById('compressedPreview');
const originalSize = document.getElementById('originalSize');
const compressedSize = document.getElementById('compressedSize');
const downloadBtn = document.getElementById('downloadBtn');

// 当前处理的图片数据
let currentImage = null;

// 初始化拖放区域
function initDropZone() {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // 拖放效果
    uploadArea.addEventListener('dragenter', () => uploadArea.classList.add('drag-over'));
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
    uploadArea.addEventListener('drop', handleDrop);
}

// 处理拖放的文件
function handleDrop(e) {
    const dt = e.dataTransfer;
    const file = dt.files[0];
    handleFile(file);
}

// 处理文件选择
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    handleFile(file);
});

// 点击上传区域触发文件选择
uploadArea.querySelector('.upload-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
});

// 处理文件
function handleFile(file) {
    if (!file.type.match('image.*')) {
        alert('请上传图片文件！');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            currentImage = img;
            displayOriginalImage(img, file);
            compressImage(); // 初始压缩
            showControls();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// 显示原始图片
function displayOriginalImage(img, file) {
    originalPreview.src = img.src;
    originalSize.textContent = `大小：${formatFileSize(file.size)}`;
}

// 显示控制区域
function showControls() {
    compressControl.style.display = 'block';
    previewSection.style.display = 'block';
}

// 压缩图片
function compressImage() {
    const quality = qualitySlider.value / 100;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // 设置画布尺寸
    canvas.width = currentImage.width;
    canvas.height = currentImage.height;

    // 绘制图片
    ctx.drawImage(currentImage, 0, 0);

    // 获取压缩后的图片
    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        compressedPreview.src = url;
        compressedSize.textContent = `大小：${formatFileSize(blob.size)}`;
        
        // 更新下载按钮
        downloadBtn.onclick = () => {
            const a = document.createElement('a');
            a.href = url;
            a.download = 'compressed-image.' + getFileExtension(currentImage.src);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };
    }, 'image/jpeg', quality);
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 获取文件扩展名
function getFileExtension(url) {
    const mimeType = url.split(',')[0].split(':')[1].split(';')[0];
    return mimeType.split('/')[1] === 'jpeg' ? 'jpg' : mimeType.split('/')[1];
}

// 监听滑块变化
qualitySlider.addEventListener('input', (e) => {
    qualityValue.textContent = e.target.value;
    compressImage();
});

// 初始化
initDropZone(); 