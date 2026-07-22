import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const work = await mkdtemp(path.join(tmpdir(), "northern-xinjiang-static-"));

async function copy(relative) {
  await cp(path.join(root, relative), path.join(work, relative), { recursive: true });
}

try {
  await mkdir(path.join(work, "app"), { recursive: true });
  for (const file of ["app/layout.tsx", "app/page.tsx", "app/globals.css", "next.config.ts", "tsconfig.json", "next-env.d.ts", "package.json"]) {
    await mkdir(path.dirname(path.join(work, file)), { recursive: true });
    await writeFile(path.join(work, file), await readFile(path.join(root, file)));
  }
  for (const directory of ["components", "lib", "public", "edge-functions"]) await copy(directory);
  await symlink(path.join(root, "node_modules"), path.join(work, "node_modules"), "dir");

  const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
  const exitCode = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [nextBin, "build", "--webpack"], {
      cwd: work,
      stdio: "inherit",
      env: { ...process.env, BUILD_STATIC: "1", NEXT_TELEMETRY_DISABLED: "1" },
    });
    child.on("error", reject);
    child.on("exit", (code) => resolve(code ?? 1));
  });
  if (exitCode !== 0) throw new Error(`静态构建失败，退出码 ${exitCode}`);

  const output = path.join(root, "out");
  await rm(output, { recursive: true, force: true });
  await cp(path.join(work, "out"), output, { recursive: true });
  await cp(path.join(work, "edge-functions"), path.join(output, "edge-functions"), { recursive: true });
  console.log(`静态站已生成：${output}`);
} finally {
  await rm(work, { recursive: true, force: true });
}
