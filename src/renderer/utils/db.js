const electron = require('electron');
const fs = require('fs-extra')
const path = require('path');
import swal from 'sweetalert';
const basePath = path.join(electron.remote.app.getPath('userData'), "/xxm");
var firstTime = false;
if (!fs.existsSync(basePath)) {
    firstTime = true;
    fs.mkdirSync(basePath);
}
const knex = require('knex')({
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {
        filename: path.join(basePath, "db")
    },
    log: {
        info(message) {
            console.err(message);
        }
    }
});
const rwOption = {
    encoding: 'utf8'
}

const initializer = {
    initTable() {
        return knex.schema.createTable('articles', table => {
            table.increments('id');
            table.string('title');
            table.datetime('created_at').defaultTo(knex.fn.now());
            table.datetime('updated_at').defaultTo(knex.fn.now());
            table.string('editor_type').defaultTo("html");
        }).createTable('tags', table => {
            table.increments('id');
            table.string('title');
            table.datetime('created_at').defaultTo(knex.fn.now());
        }).createTable('article_tag', table => {
            table.increments('id');
            table.integer('tag_id');
            table.integer('article_id');
            table.datetime('created_at').defaultTo(knex.fn.now());
        }).createTable('settings', (table) => {
            table.increments('id');
            table.integer('autosave_interval');
            table.integer('img_w');
            table.integer('img_h');
            table.string("editor_type").defaultTo("html");
            table.datetime('created_at').defaultTo(knex.fn.now());
        }).createTable('tabs', (table) => {
            table.increments('id');
            table.string('title');
            table.string('url');
            table.integer('order_num');
            table.boolean('selected')
            table.datetime('created_at').defaultTo(knex.fn.now());
        }).createTable('article_site', (table) => {
            table.increments('id');
            table.integer('article_id');
            table.integer('site_id');
            table.integer('edit_url');
            table.datetime('created_at').defaultTo(knex.fn.now());
        })
    },
    initDefaultData() {
        let defaultSetting = {
            autosave_interval: 8,
            img_w: 1300,
            img_h: 800,
            editor_type: 'html',
        };
        let defaultTab = {
            title: "我的知识",
            url: '/',
            order_num: 0,
            selected: true,
        };
        return knex.insert(defaultSetting).into("settings").then(() => {
            return knex.insert(defaultTab).into("tabs");
        });
    },
    init(cb) {
        //todo: 在6.2.x的时候删掉此目录
        if (!firstTime) {
            cb(knex);
            let bakDir = path.join(electron.remote.app.getPath('userData'), "/xxm_bak");
            fs.exists(bakDir, flag => {
                if (!flag) {
                    return;
                }
                fs.remove(bakDir, err => {
                    if (err) return console.error(err)
                })
            })
            return;
        }
        swal({
            icon: "info",
            title: "请稍后",
            text: "初次见面\n请容我稍事整理",
            closeOnClickOutside: false,
            closeOnEsc: false,
            timer: 6000,
            buttons: false,
        });
        this.initTable().then(() => {
            this.initDefaultData().then(() => {
                cb(knex)
            })
        });
    }
}

export default initializer;