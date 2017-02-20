'use strict';

const Generator = require('yeoman-generator');
const _ = require('lodash');

module.exports = class extends Generator {
    prompting() {
        return this.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'Your app name',
                default: this.appname
            }
        ]).then((answers) => {
            this._appName = answers.name;
        });
    }

    writing() {
        // recursively copy everything under the root of the source to the root of the destination,
        // except for the files and directories with leading underscore
        this.fs.copy([this.templatePath('**/*'), '!**/_*', '!**/_*/**'], this.destinationPath());

        this._copy('_gitignore', '.gitignore');
        this._copy('_gitattributes', '.gitattributes');
        this._copy('_vscode/*', '.vscode');

        this._copyTpl('_package.json', 'package.json', {
            appName: _.kebabCase(this._appName)
        });
        this._copyTpl('src/_index.html', 'src/index.html', {
            appTitle: _.startCase(this._appName)
        });
    }

    _copy(source, destination) {
        this.fs.copy(this.templatePath(source), this.destinationPath(destination));
    }

    _copyTpl(source, destination, dataObj) {
        this.fs.copyTpl(this.templatePath(source), this.destinationPath(destination), dataObj);
    }
};