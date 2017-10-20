"use strict";

const Generator = require("yeoman-generator");
const yosay = require("yosay");
const chalk = require("chalk");
const _ = require("lodash");

const overwrite = (target, propName, overwrites) => {
    const copy = _.assign({}, target[propName], overwrites);

    target[propName] = Object.keys(copy)
        .sort()
        .reduce((result, curKey) => {
            result[curKey] = copy[curKey];
            return result;
        }, {});
};

const dependencies = {
    mobx: ["mobx:^3.3.1", "mobx-react:^4.3.3", "mobx-react-devtools:^4.2.15"],
    glamor: ["glamor:^2.20.40"]
};

module.exports = class extends Generator {
    prompting() {
        this.log(
            yosay(
                `Yo! Let me help you quickly set up your ${chalk.yellow(
                    "React"
                )} webapp with ${chalk.yellow(
                    "TypeScript"
                )}. Please make sure that you have ${chalk.red(
                    "Yarn"
                )} installed before continuing.`,
                { maxLength: 40 }
            )
        );

        return this.prompt([
            {
                type: "input",
                name: "name",
                message: "Your app name:",
                default: this.appname
            },
            {
                type: "checkbox",
                name: "packages",
                message: "Please select additional packages to add:",
                choices: [
                    {
                        name: "MobX - state management based on observable",
                        value: "mobx",
                        short: "mobx"
                    },
                    {
                        name: "glamor - css in js",
                        value: "glamor",
                        short: "glamor"
                    }
                ]
            }
        ]).then(answers => {
            const packages = answers.packages;

            this._appName = answers.name;
            this._useMobX = _.includes(packages, "mobx");
            this._packages = [];
            this._devPackages = [];

            packages.forEach(p => {
                const deps = dependencies[p];
                deps.forEach(d => {
                    const arr = d.split(":");
                    const packs =
                        arr[2] === "dev" ? this._devPackages : this._packages;
                    packs[arr[0]] = arr[1];
                });
            });
        });
    }

    writing() {
        // recursively copy everything under the root of the source to the root of the destination,
        // except for the files and directories with leading underscore
        this.fs.copy(
            [this.templatePath("**/*"), "!**/_*", "!**/_*/**"],
            this.destinationPath()
        );

        this._copy("_gitignore", ".gitignore");
        this._copy("_gitattributes", ".gitattributes");
        this._copy("_vscode/*", ".vscode");

        this._copyTpl("src/_index.html", "src/index.html", {
            appTitle: _.startCase(this._appName)
        });

        this._copyPackageJson();

        if (this._useMobX) {
            this._copy("src/_store/*", "src/store");
            this._copy("src/_Index.mobx.tsx", "src/Index.tsx");
            this._copy(
                "src/components/_App.mobx.tsx",
                "src/components/App.tsx"
            );
        } else {
            this._copy("src/_Index.tsx", "src/Index.tsx");
            this._copy("src/components/_App.tsx", "src/components/App.tsx");
        }
    }

    install() {
        if (!this.options["skip-install"]) {
            this.installDependencies({
                bower: false,
                npm: false,
                yarn: true
            });
        }
    }

    end() {
        const message = this.options["skip-install"]
            ? `Please install dependencies by executing '${chalk.yellow(
                  "yarn"
              )}' before getting started.`
            : `Congratulations! Your '${chalk.yellow(
                  this._appName
              )}' app is successfully set up. Please run '${chalk.yellow(
                  "npm start"
              )}' to get started.`;

        this.log(message);
    }

    _copy(source, destination) {
        this.fs.copy(
            this.templatePath(source),
            this.destinationPath(destination)
        );
    }

    _copyTpl(source, destination, dataObj) {
        this.fs.copyTpl(
            this.templatePath(source),
            this.destinationPath(destination),
            dataObj
        );
    }

    _copyPackageJson() {
        const json = this.fs.readJSON(this.templatePath("_package.json"));

        json.name = _.kebabCase(this._appName);

        overwrite(json, "dependencies", this._packages);
        overwrite(json, "devDependencies", this._devPackages);

        this.fs.writeJSON(this.destinationPath("package.json"), json);
    }
};
