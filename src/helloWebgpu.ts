if (!navigator.gpu) throw Error('WebGPU not supported');

async function initWebGPU() {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) throw Error('No gpu adapter found');
    return adapter;
}

async function run() {
    const adapter = await initWebGPU();
}