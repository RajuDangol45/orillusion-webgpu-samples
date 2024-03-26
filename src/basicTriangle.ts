import vertex from "./shaders/triangle.vert.wgsl?raw";
import frag from "./shaders/red.frag.wgsl?raw";

if (!navigator.gpu) throw Error("WebGPU not supported");

async function initWEBGPU() {
  const adapter = await navigator.gpu.requestAdapter({
    powerPreference: "low-power",
  });
  if (!adapter) throw Error("No gpu adapter found");
  const device = await adapter.requestDevice({
    requiredFeatures: ["texture-compression-bc"],
    requiredLimits: {
      maxStorageBufferBindingSize: adapter.limits.maxStorageBufferBindingSize,
    },
  });
  const canvas = document.querySelector("canvas");
  const context: any = canvas?.getContext("webgpu");
  const format = navigator.gpu.getPreferredCanvasFormat();
  context?.configure({
    device,
    format,
  });

  return { adapter, device, context, format };
}

async function initPipeline(device: GPUDevice, format: GPUTextureFormat) {
  const vertexShader = device.createShaderModule({
    code: vertex,
  });
  const fragmentShader = device.createShaderModule({
    code: frag,
  });
  const pipeline = await device.createRenderPipelineAsync({
    vertex: {
      module: vertexShader,
      entryPoint: "main",
    },
    fragment: {
      module: fragmentShader,
      entryPoint: "main",
      targets: [
        {
          format,
        },
      ],
    },
    primitive: {
      topology: "triangle-list",
    },
    layout: "auto",
  });
  return { pipeline };
}

function draw(device: GPUDevice, pipeline: GPURenderPipeline, context: GPUCanvasContext) {
    const encoder = device.createCommandEncoder();
    const renderPass = encoder.beginRenderPass({
        colorAttachments: [{
            view: context.getCurrentTexture().createView(),
            loadOp: 'clear',
            clearValue: {r: 0, g: 0, b: 0, a: 1},
            storeOp: 'store'
        }]
    })
    renderPass.setPipeline(pipeline);
    renderPass.draw(3);
    renderPass.end();
    const buffer = encoder.finish();
    device.queue.submit([buffer]);
}

async function run() {
  const { device, format, context} = await initWEBGPU();
  const { pipeline } = await initPipeline(device, format);
  draw(device, pipeline, context);
}

run();