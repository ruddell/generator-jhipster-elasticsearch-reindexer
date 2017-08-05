'use strict';
var util = require('util');
var generator = require('yeoman-generator');
var chalk = require('chalk');
var packagejs = require(__dirname + '/../../package.json');
var shelljs = require('shelljs');
var fs = require('fs');
var BaseGenerator = require('generator-jhipster/generators/generator-base');
var jhipsterConstants = require('generator-jhipster/generators/generator-constants');

var JhipsterGenerator = generator.extend({});
util.inherits(JhipsterGenerator, BaseGenerator);

// Stores JHipster variables
var jhipsterVar = {moduleName: 'elasticsearch-reindexer'};
jhipsterVar.jhipsterConfigDirectory = '.jhipster';

module.exports = JhipsterGenerator.extend({
  initializing: {
    displayLogo: function () {
      // Have Yeoman greet the user.
      this.log('Welcome to the ' + chalk.red('JHipster elasticsearch-reindexer') + ' generator! ' + chalk.yellow('v' + packagejs.version + '\n'));
    }
  },

  writing: {
    setUpVars: function () {
      var config = this.getJhipsterAppConfig()
      this.applicationType = config.applicationType;
      this.nativeLanguage = config.nativeLanguage;
      this.languages = config.languages;
      this.searchEngine = config.searchEngine;
      this.enableTranslation = config.enableTranslation;
      this.clientFramework = config.clientFramework;
      // set the major version to 2 if it isn't specifified
      this.jhipsterVersion = config.jhipsterVersion;
      if (!this.jhipsterVersion) {
        this.jhipsterMajorVersion = 2;
      } else {
        this.jhipsterMajorVersion = config.jhipsterVersion[0];
      }
      this.entityFiles = shelljs.ls(jhipsterVar.jhipsterConfigDirectory).filter(function (file) {
        return file.match(/\.json$/);
      });
      this.baseName = config.baseName;
      this.packageName = config.packageName;
      this.packageFolder = config.packageFolder;
      this.clientFramework = config.clientFramework;

      // this variable is used in templates
      if (this.clientFramework === 'angularX' || this.clientFramework === 'angular2') {
        this.angular2AppName = this.getAngularXAppName();
      } else if (this.clientFramework === 'angular1') {
        this.angularAppName = this.getAngularAppName();
      }

      if (this.jhipsterMajorVersion > 2) {
        this.appFolder = 'app/admin/elasticsearch-reindex/';
        this.serviceFolder = this.appFolder;
      } else {
        this.appFolder = 'scripts/app/admin/elasticsearch-reindex/';
        this.serviceFolder = 'scripts/components/admin/';
      }

      jhipsterVar.javaDir = `${jhipsterConstants.SERVER_MAIN_SRC_DIR + this.packageFolder}/`;
      jhipsterVar.resourceDir = jhipsterConstants.SERVER_MAIN_RES_DIR;
      jhipsterVar.webappDir = jhipsterConstants.CLIENT_MAIN_SRC_DIR;
    },
    validateVars: function () {
      if (!this.jhipsterVersion) {
        this.log(chalk.yellow('WARNING jhipsterVersion is missing in JHipster configuration, defaulting to v2'));
      }
      if (!this.applicationType) {
        this.log(chalk.yellow('WARNING applicationType is missing in JHipster configuration, using monolith as fallback'));
        this.applicationType = 'monolith';
      }
      if (!this.entityFiles || !this.entityFiles.length) {
        this.log(chalk.yellow('WARNING no entities found'));
      }
      if (this.searchEngine !== 'elasticsearch') {
        this.log(chalk.yellow('WARNING search engine is not set to Elasticsearch in JHipster configuration, ' +
          'generated service may fail to compile'));
      }
      if (!this.nativeLanguage) {
        this.log(chalk.yellow('WARNING nativeLanguage is missing in JHipster configuration, using english as fallback'));
        this.nativeLanguage = 'en';
      }
      if (!this.clientFramework) {
        this.log(chalk.yellow('WARNING clientFramework is missing in JHipster configuration, using angular1 as fallback'));
        this.clientFramework = 'angular1';
      }
    },
    writeTemplates: function () {
      this.template('src/main/java/package/web/rest/_ElasticsearchIndexResource.java', jhipsterVar.javaDir + 'web/rest/ElasticsearchIndexResource.java', this, {});
      this.template('src/main/java/package/service/_ElasticsearchIndexService.java', jhipsterVar.javaDir + 'service/ElasticsearchIndexService.java', this, {});
      if (this.clientFramework === 'angular1') {
        this.template('src/main/webapp/js/elasticsearch-reindex.controller.js', jhipsterVar.webappDir + this.appFolder + '/elasticsearch-reindex.controller.js', this, {});
        this.template('src/main/webapp/js/elasticsearch-reindex-dialog.controller.js', jhipsterVar.webappDir + this.appFolder + '/elasticsearch-reindex-dialog.controller.js', this, {});
        this.template('src/main/webapp/i18n/elasticsearch-reindex.json', jhipsterVar.webappDir + 'i18n/' + this.nativeLanguage + '/elasticsearch-reindex.json', this, {});
        this.template('src/main/webapp/js/elasticsearch-reindex.service.js', jhipsterVar.webappDir + this.serviceFolder + '/elasticsearch-reindex.service.js', this, {});
        this.template('src/main/webapp/html/elasticsearch-reindex.html', jhipsterVar.webappDir + this.appFolder + '/elasticsearch-reindex.html', this, {});
        this.template('src/main/webapp/html/elasticsearch-reindex-dialog.html', jhipsterVar.webappDir + this.appFolder + '/elasticsearch-reindex-dialog.html', this, {});

        if (this.jhipsterMajorVersion > 2) {
          this.template('src/main/webapp/js/elasticsearch-reindex.state.js', jhipsterVar.webappDir + this.appFolder + '/elasticsearch-reindex.state.js', this, {});
        } else {
          this.template('src/main/webapp/js/elasticsearch-reindex.state.js', jhipsterVar.webappDir + this.appFolder + '/elasticsearch-reindex.js', this, {});
        }

        if (this.addJavaScriptToIndex) {
          this.addJavaScriptToIndex('app/admin/elasticsearch-reindex/elasticsearch-reindex.controller.js');
          this.addJavaScriptToIndex('app/admin/elasticsearch-reindex/elasticsearch-reindex-dialog.controller.js');
          if (this.jhipsterMajorVersion > 2) {
            this.addJavaScriptToIndex('app/admin/elasticsearch-reindex/elasticsearch-reindex.state.js');
            this.addJavaScriptToIndex('app/admin/elasticsearch-reindex.service.js');
          } else {
            this.addJavaScriptToIndex('app/admin/elasticsearch-reindex/elasticsearch-reindex.js');
            this.addJavaScriptToIndex('components/admin/elasticsearch-reindex.service.js');
          }
        }

        if (this.addElementToAdminMenu) {
          this.addElementToAdminMenu('elasticsearch-reindex', 'exclamation-sign', this.enableTranslation, this.clientFramework);
          if (this.enableTranslation) {
            this.addAdminElementTranslationKey('elasticsearch-reindex', 'Reindex Elasticsearch', this.nativeLanguage);
          }
        }
      } else if (this.clientFramework === 'angularX' || this.clientFramework === 'angular2') {
        this.template('src/main/webapp/ts/_elasticsearch-reindex-modal.component.html', jhipsterVar.webappDir + this.appFolder + '/elasticsearch-reindex-modal.component.html', this, {});
        this.template('src/main/webapp/ts/_elasticsearch-reindex-modal.component.ts', jhipsterVar.webappDir + this.appFolder + '/elasticsearch-reindex-modal.component.ts', this, {});
        this.template('src/main/webapp/ts/_elasticsearch-reindex.component.html', jhipsterVar.webappDir + this.appFolder + '/elasticsearch-reindex.component.html', this, {});
        this.template('src/main/webapp/ts/_elasticsearch-reindex.component.ts', jhipsterVar.webappDir + this.appFolder + '/elasticsearch-reindex.component.ts', this, {});
        this.template('src/main/webapp/ts/_elasticsearch-reindex.module.ts', jhipsterVar.webappDir + this.appFolder + '/elasticsearch-reindex.module.ts', this, {});
        this.template('src/main/webapp/ts/_elasticsearch-reindex.route.ts', jhipsterVar.webappDir + this.appFolder + '/elasticsearch-reindex.route.ts', this, {});
        this.template('src/main/webapp/ts/_elasticsearch-reindex.service.ts', jhipsterVar.webappDir + this.appFolder + '/elasticsearch-reindex.service.ts', this, {});
        this.template('src/main/webapp/ts/_index.ts', jhipsterVar.webappDir + this.appFolder + '/index.ts', this, {});
        if (this.addAdminToModule) {
          this.addAdminToModule(this.angular2AppName, 'ElasticsearchReindex', 'elasticsearch-reindex', 'elasticsearch-reindex', this.enableTranslation, this.clientFramework);
        } else {
          this.log(chalk.yellow('WARNING the function addAdminToModule is missing, you need to add the missing import in src/main/webapp/app/admin/admin.module.ts:'));
          this.log(chalk.yellow('  - at the beginning of the file: ') + 'import { ' + this.angular2AppName + 'ElasticsearchReindexModule } from \'./elasticsearch-reindex/elasticsearch-reindex.module\';');
          this.log(chalk.yellow('  - inside @NgModule, imports: ') + this.angular2AppName + 'ElasticsearchReindexModule\n');
        }
        if (this.addElementToAdminMenu) {
          this.addElementToAdminMenu('elasticsearch-reindex', 'fw fa-search', this.enableTranslation, this.clientFramework);
          if (this.enableTranslation) {
            this.languages.forEach((language) => {
              this.addAdminElementTranslationKey('elasticsearch-reindex', 'Reindex Elasticsearch', language);
            });
          }
        }
        if (this.enableTranslation) {
          this.languages.forEach((language) => {
            this.template('src/main/webapp/i18n/elasticsearch-reindex.json', jhipsterVar.webappDir + 'i18n/' + language + '/elasticsearch-reindex.json', this, {});
          });
        }
      }
    },

    registering: function () {
      try {
        this.registerModule("generator-jhipster-elasticsearch-reindexer", "entity", "post", "app", "Generate a service for reindexing all database rows for each of your entities");
      } catch (err) {
        this.log(chalk.red.bold('WARN!') + ' Could not register as a jhipster entity post creation hook...\n');
      }
    }
  },

  end: function () {
    this.log('End of elasticsearch-reindexer generator');
  }
});
