import { optimize } from "svgo";
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";

// 配置
const CONFIG = {
  colorIconsDir: "./old-color-icons",
  normalIconsDir: "./old-icons",
  outputDir: "./new-icons",
  iconSize: 32
};

// 彩色图标的SVGO配置 - 只调整大小
const colorIconConfig = {
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {}
      }
    },
    {
      name: "cleanupIds",
      params: {
        remove: true
      }
    },
    "removeViewBox",
    "sortAttrs",
    {
      name: "setSize",
      fn: (ast) => {
        if (ast.children && ast.children[0] && ast.children[0].attributes) {
          ast.children[0].attributes.width = CONFIG.iconSize;
          ast.children[0].attributes.height = CONFIG.iconSize;
        }
        return ast;
      }
    }
  ]
};

// 普通图标的SVGO配置 - 删除不必要的属性和颜色填充
const normalIconConfig = {
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {}
      }
    },
    {
      name: "cleanupIds",
      params: {
        remove: true
      }
    },
    "removeViewBox",
    "sortAttrs",
    {
      name: "setSize",
      fn: (ast) => {
        if (ast.children && ast.children[0] && ast.children[0].attributes) {
          ast.children[0].attributes.width = CONFIG.iconSize;
          ast.children[0].attributes.height = CONFIG.iconSize;
        }
        return ast;
      }
    },
    {
      name: "remove-custom-attr",
      fn: () => {
        return {
          element: {
            enter: (node) => {
              // 删除不必要的属性
              delete node.attributes.opacity;
              delete node.attributes["xml:space"];

              // 删除class和style属性
              if (node.attributes.class) {
                delete node.attributes.class;
              }

              if (node.attributes.style) {
                delete node.attributes.style;
              }

              // 设置fill为currentColor
              if (node.attributes.fill) {
                delete node.attributes.fill;
              }

              if (
                ["path", "circle", "rect", "ellipse", "polygon", "polyline"].includes(node.name)
              ) {
                node.attributes.fill = "currentColor";
              }
            }
          }
        };
      }
    }
  ]
};

// 确保输出目录存在
function ensureDirExists(dirPath) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

// 处理单个SVG文件
function processSvgFile(inputPath, outputPath, config) {
  try {
    const svgContent = readFileSync(inputPath, "utf8");
    const result = optimize(svgContent, config);

    // 确保输出目录存在
    const outputDir = dirname(outputPath);
    ensureDirExists(outputDir);

    writeFileSync(outputPath, result.data);
    console.log(`已处理: ${inputPath} -> ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`处理文件失败 ${inputPath}:`, error.message);
    return false;
  }
}

// 处理目录中的所有SVG文件
function processDirectory(inputDir, outputSubDir, config) {
  if (!existsSync(inputDir)) {
    console.log(`目录不存在: ${inputDir}`);
    return;
  }

  const outputDir = join(CONFIG.outputDir, outputSubDir);
  ensureDirExists(outputDir);

  const files = readdirSync(inputDir);
  let processedCount = 0;

  for (const file of files) {
    if (file.endsWith(".svg")) {
      const inputPath = join(inputDir, file);
      const outputPath = join(outputDir, file);

      if (processSvgFile(inputPath, outputPath, config)) {
        processedCount++;
      }
    }
  }

  console.log(`${outputSubDir}: 处理了 ${processedCount} 个SVG文件`);
}

// 主函数
function main() {
  console.log("开始处理SVG图标...");

  // 处理彩色图标
  console.log("处理彩色图标...");
  processDirectory(CONFIG.colorIconsDir, "color-icons", colorIconConfig);

  // 处理普通图标
  console.log("处理普通图标...");
  processDirectory(CONFIG.normalIconsDir, "normal-icons", normalIconConfig);

  console.log("所有图标处理完成！");
}

// 运行主函数
main();
