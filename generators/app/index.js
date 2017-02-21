'use strict';

const Generator = require('yeoman-generator');
const yosay = require('yosay');
const chalk = require('chalk');
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
        this.log(yosay(
            `Yo! Let me help you quickly set up your ${chalk.yellow('React')} webapp with ${chalk.yellow('TypeScript')}.`,
            { maxLength: 40 }
        ));

        return this.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'Your app name:',
                default: this.appname
            },
            {
                type: 'confirm',
                name: 'useMobX',
                message: 'Would you like to use MobX to manage the app state?',
                default: false
            },
            {
                type: 'checkbox',
                name: 'packages',
                message: 'Please select additional packages to add:',
                choices: [{ name: 'glamor - css in js', value: 'glamor:^2.20.23', short: 'glamor' }]
            }
        ]).then((answers) => {
            this._appName = answers.name;
            this._useMobX = answers.useMobX;
            this._packages = answers.packages;

            if (this._useMobX) {
                this._packages.push(
                    'mobx:^3.1.0',
                    'mobx-react:^4.1.0',
                    'mobx-react-devtools:^4.2.11:dev'
                );
            }
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

        this._copyPackageJson();

        if (this._useMobX) {
            this._copy('src/_store/*', 'src/store');
            this._copy('src/_Index.mobx.tsx', 'src/Index.tsx');
            this._copy('src/components/_App.mobx.tsx', 'src/components/App.tsx');
        } else {
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

    _copyPackageJson() {
        const json = this.fs.readJSON(this.templatePath('_package.json'));
        const packages = [];
        const devPackages = [];

        this._packages.forEach(p => {
            const arr = p.split(':');
            const packs = arr[2] === 'dev' ? devPackages : packages;
            packs[arr[0]] = arr[1];
        });

        json.name = _.kebabCase(this._appName);

        overwrite(json, 'dependencies', packages);
        overwrite(json, 'devDependencies', devPackages);

        this.fs.writeJSON(this.destinationPath('package.json'), json);
    }
};