import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const root = new URL("../", import.meta.url);
const original = await readFile(new URL("bensrecipes_logo.png", root));
const iconBackground = "#080808";
const splashBackground = "#ffffff";
const transparent = { r: 0, g: 0, b: 0, alpha: 0 };

const { data, info } = await sharp(original)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const pixels = info.width * info.height;
const exterior = new Uint8Array(pixels);
const queue = new Uint32Array(pixels);
let queueLength = 0;

/** @param {number} pixel */
function visitBackground(pixel) {
  if (exterior[pixel]) return;
  const offset = pixel * 4;
  const brightness = Math.min(
    data[offset] ?? 0,
    data[offset + 1] ?? 0,
    data[offset + 2] ?? 0,
  );
  if (brightness < 24) return;
  exterior[pixel] = 1;
  queue[queueLength++] = pixel;
}

for (let column = 0; column < info.width; column++) {
  visitBackground(column);
  visitBackground((info.height - 1) * info.width + column);
}
for (let row = 0; row < info.height; row++) {
  visitBackground(row * info.width);
  visitBackground(row * info.width + info.width - 1);
}
for (let cursor = 0; cursor < queueLength; cursor++) {
  const pixel = queue[cursor];
  assert.notEqual(pixel, undefined);
  if (pixel === undefined) continue;
  if (pixel % info.width > 0) visitBackground(pixel - 1);
  if (pixel % info.width < info.width - 1) visitBackground(pixel + 1);
  if (pixel >= info.width) visitBackground(pixel - info.width);
  if (pixel < pixels - info.width) visitBackground(pixel + info.width);
}

const cleaned = Buffer.from(data);
let preservedWhitePixels = 0;
for (let pixel = 0; pixel < pixels; pixel++) {
  const offset = pixel * 4;
  const brightness = Math.min(
    data[offset] ?? 0,
    data[offset + 1] ?? 0,
    data[offset + 2] ?? 0,
  );
  if (!exterior[pixel]) {
    if (brightness > 240) preservedWhitePixels++;
    continue;
  }
  cleaned[offset] = 8;
  cleaned[offset + 1] = 8;
  cleaned[offset + 2] = 8;
  cleaned[offset + 3] =
    brightness >= 248 ? 0 : Math.round(((255 - brightness) / (255 - 8)) * 255);
}
assert.ok(
  preservedWhitePixels > 100,
  "The enclosed white lettering must remain intact",
);
for (const corner of [0, info.width - 1, pixels - info.width, pixels - 1]) {
  assert.equal(
    cleaned[corner * 4 + 3],
    0,
    "Exterior corners must be transparent",
  );
}
const source = await sharp(cleaned, {
  raw: { width: info.width, height: info.height, channels: 4 },
})
  .trim({ background: transparent, threshold: 1 })
  .png()
  .toBuffer();
const sourceMetadata = await sharp(source).metadata();
assert.ok(sourceMetadata.width && sourceMetadata.height);

/** @type {{ path: string, width: number, height: number, opaque: boolean }[]} */
const generated = [];

await mkdir(new URL("public/icons/", root), { recursive: true });
await mkdir(new URL("public/splash/", root), { recursive: true });

/** @param {number} size @param {boolean} opaque */
async function resizeLogo(size, opaque = false) {
  const image = sharp(source).resize(size, size, {
    fit: "contain",
    background: opaque ? iconBackground : transparent,
  });
  return (opaque ? image.flatten({ background: iconBackground }) : image)
    .png()
    .toBuffer();
}

/** @param {string} path @param {Buffer} image @param {number} width @param {number} height @param {boolean} opaque */
async function savePng(path, image, width, height, opaque = false) {
  await writeFile(new URL(path, root), image);
  generated.push({ path, width, height, opaque });
}

await savePng(
  "src/app/bensrecipes_logo.png",
  source,
  sourceMetadata.width,
  sourceMetadata.height,
);
await savePng("src/app/icon.png", await resizeLogo(512), 512, 512);
await savePng(
  "src/app/apple-icon.png",
  await resizeLogo(180, true),
  180,
  180,
  true,
);
await savePng("public/logo.png", await resizeLogo(512), 512, 512);

for (const size of [16, 32, 48]) {
  await savePng(
    `public/icons/favicon-${size}.png`,
    await resizeLogo(size),
    size,
    size,
  );
}

const favicon = await pngToIco(
  await Promise.all([16, 32, 48].map((size) => resizeLogo(size))),
);
await writeFile(new URL("src/app/favicon.ico", root), favicon);
assert.equal(favicon.readUInt16LE(2), 1);
assert.equal(favicon.readUInt16LE(4), 3);

for (const size of [192, 512]) {
  await savePng(
    `public/icons/icon-${size}.png`,
    await resizeLogo(size),
    size,
    size,
  );
  const mark = await resizeLogo(Math.floor(size * 0.56), true);
  const maskable = await sharp({
    create: {
      width: size,
      height: size,
      channels: 3,
      background: iconBackground,
    },
  })
    .composite([{ input: mark, gravity: "centre" }])
    .flatten({ background: iconBackground })
    .removeAlpha()
    .png()
    .toBuffer();
  await savePng(
    `public/icons/maskable-${size}.png`,
    maskable,
    size,
    size,
    true,
  );

  const { data, info } = await sharp(maskable)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let pixel = 0; pixel < info.width * info.height; pixel++) {
    if ((data[pixel * info.channels] ?? 0) > 128) {
      const x = (pixel % info.width) + 0.5 - size / 2;
      const y = Math.floor(pixel / info.width) + 0.5 - size / 2;
      assert.ok(
        Math.hypot(x, y) <= size * 0.4,
        "Maskable artwork must stay inside the safe circle",
      );
    }
  }
}

const displays = [
  { width: 320, height: 568, scale: 2 },
  { width: 375, height: 667, scale: 2 },
  { width: 414, height: 736, scale: 3 },
  { width: 375, height: 812, scale: 3 },
  { width: 414, height: 896, scale: 2 },
  { width: 414, height: 896, scale: 3 },
  { width: 390, height: 844, scale: 3 },
  { width: 393, height: 852, scale: 3 },
  { width: 402, height: 874, scale: 3 },
  { width: 420, height: 912, scale: 3 },
  { width: 428, height: 926, scale: 3 },
  { width: 430, height: 932, scale: 3 },
  { width: 440, height: 956, scale: 3 },
  { width: 744, height: 1133, scale: 2 },
  { width: 768, height: 1024, scale: 2 },
  { width: 810, height: 1080, scale: 2 },
  { width: 820, height: 1180, scale: 2 },
  { width: 834, height: 1112, scale: 2 },
  { width: 834, height: 1194, scale: 2 },
  { width: 1024, height: 1366, scale: 2 },
  { width: 1032, height: 1376, scale: 2 },
];

const startupImages = [];
for (const display of displays) {
  for (const orientation of ["portrait", "landscape"]) {
    const width =
      (orientation === "portrait" ? display.width : display.height) *
      display.scale;
    const height =
      (orientation === "portrait" ? display.height : display.width) *
      display.scale;
    const path = `public/splash/apple-${width}x${height}.png`;
    const splash = await sharp({
      create: { width, height, channels: 3, background: splashBackground },
    })
      .composite([
        { input: await resizeLogo(112 * display.scale), gravity: "centre" },
      ])
      .flatten({ background: splashBackground })
      .removeAlpha()
      .png()
      .toBuffer();
    await savePng(path, splash, width, height, true);
    startupImages.push({
      url: `/${path.replace(/^public\//, "")}`,
      media: `(device-width: ${display.width}px) and (device-height: ${display.height}px) and (-webkit-device-pixel-ratio: ${display.scale}) and (orientation: ${orientation})`,
    });
  }
}
await writeFile(
  new URL("public/splash/apple-startup-images.json", root),
  `${JSON.stringify(startupImages, null, 2)}\n`,
);

for (const asset of generated) {
  const metadata = await sharp(
    fileURLToPath(new URL(asset.path, root)),
  ).metadata();
  assert.equal(metadata.width, asset.width, asset.path);
  assert.equal(metadata.height, asset.height, asset.path);
  if (asset.opaque) assert.equal(metadata.hasAlpha, false, asset.path);
}
console.log(
  `Generated and verified ${generated.length} PNG files, a multi-size ICO, and Apple startup-image metadata.`,
);
