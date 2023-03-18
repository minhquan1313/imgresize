const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");
const { exec } = require("child_process");
const { readdir } = require("fs/promises");

(async () => {
    const distPath = path.join(__dirname, "../dist");

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    console.log("Removing dist folder...");
    fs.rmSync(distPath, { recursive: true, force: true });

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    console.log("Typescript executing...");
    exec("tsc --outDir dist", (err) => {
        if (!err) return;

        console.log(`Error when executing typescript`);
        console.log(err);
    });

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    console.log("Copying files...");
    try {
        const srcDir = path.join(__dirname);
        const destDir = distPath;

        fse.copySync(srcDir, destDir, { overwrite: true | false });
    } catch (err) {
        throw console.error(err);
    }

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    console.log("Deleting *.ts files...");
    const findFiles = async (dir, cb) => {
        const matchedFiles = [];

        const files = await readdir(dir);

        for (const file of files) {
            const fileExt = path.extname(file);
            const fileName = path.basename(file);

            if (fileExt === ``) {
                // File now is directory
                const filesInDirectory = await findFiles(path.join(dir, file), cb);

                matchedFiles.push(...filesInDirectory);

                continue;
            }
            if (cb(fileName, fileExt)) {
                matchedFiles.push(path.join(dir, file));
            }
        }

        return matchedFiles;
    };
    let files = await findFiles(distPath, (fileName, fileExt) => fileExt === ".ts");
    files.forEach((r) => fs.unlinkSync(r));

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    console.log("Deleting unnecessary files...");
    files = await findFiles(distPath, (fileName) => fileName === "nodeBuild.js");
    files.forEach((r) => fs.unlinkSync(r));

    console.log("Done...");
})();

// RAW Windows cmd: rmdir /s/q dist && tsc && xcopy /s/q src\\* dist && del /s/q dist\\*.ts
