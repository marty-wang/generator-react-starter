'use strict';

const Generator = require('yeoman-generator');
const _ = require('lodash');

const overwrite = (target, propName, overwrites) => {
    const original = target[propName];

    Object.keys(overwrites).forEach(key => {
        original[key] = overwrites[key];
    });

    target[propName] = Object.keys(original).sort().reduce((result, curKey) => {
        result[curKey] = original[curKey];
        return result;
    }, {});
};

module.exports = class extends Generator {
    prompting() {
        return this.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'Your app name',
                default: this.appname
            },
            {
                type: 'confirm',
                name: 'useMobX',
                message: 'Would you like to use MobX to manage the app state?',
                default: false
            }
        ]).then((answers) => {
            this._appName = answers.name;
            this._useMobX = answers.useMobX;
        });
    }

    writing() {
        // recursively copy everything under the root of the source to the root of the destination,
        // except for the files and directories with leading underscore
        this.fs.copy([this.templatePath('**/*'), '!**/_*', '!**/_*/**'], this.destinationPath());

        this._copy('_gitignore', '.gitignore');
        this._copy('_gitattributes', '.gitattributes');
        this._copy('_vscode/*', '.vscode');

        this._copyTpl('src/_index.html', 'src/index.html', {
            appTitle: _.startCase(this._appName)
        });

        if (this._useMobX) {
            this._copyPackageJson((json) => {
                overwrite(json, 'dependencies', {
                    "mobx": "^3.1.0",
                    "mobx-react": "^4.1.0"
                });
                overwrite(json, 'devDependencies', {
                    "mobx-react-devtools": "^4.2.11"
                });
            });
            this._copy('src/_store/*', 'src/store');
            this._copy('src/_Index.mobx.tsx', 'src/Index.tsx');
            this._copy('src/components/_App.mobx.tsx', 'src/components/App.tsx');
        } else {
            this._copyPackageJson();
            this._copy('src/_Index.tsx', 'src/Index.tsx');
            this._copy('src/components/_App.tsx', 'src/components/App.tsx');
        }
    }

    _copy(source, destination) {
        this.fs.copy(this.templatePath(source), this.destinationPath(destination));
    }

    _copyTpl(source, destination, dataObj) {
        this.fs.copyTpl(this.templatePath(source), this.destinationPath(destination), dataObj);
    }

    _copyPackageJson(callback) {
        const packageJson = this.fs.readJSON(this.templatePath('_package.json'));
        packageJson.name = _.kebabCase(this._appName);
        callback && callback(packageJson);
        this.fs.writeJSON(this.destinationPath('package.json'), packageJson);
    }
};