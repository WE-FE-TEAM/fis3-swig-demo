'use strict'

let path = require('path');

let express = require('express');
let _ = require('lodash');
let yogView = require('yog-view');
let yogBigPipe = require('yog-bigpipe');
let mapjson = require('./lib/mapjson.js');

let app = express();

const ROOT_PATH = __dirname;
let resource_path = ROOT_PATH + '/output/resource-map/';
let view_path = ROOT_PATH + '/output/views';
let static_path = ROOT_PATH + '/output/static';

let viewConf  = {
    confDir: resource_path,
    viewsDir: view_path,
    bigpipe: true,
    bigpipeOpt: {
        skipAnalysis: true,
        isSpiderMode: function (req) {
            if (req.headers['user-agent'] && /bot|spider/.test(req.headers['user-agent'].toLowerCase())) {
                return true;
            }
        },
    },
    tpl: {
        cache: 'memory'
    },
    engine: {
        tpl: 'yog-swig'
    }
};

function setViews(app, conf){
    app.set('views', conf.viewsDir);

    app.fis = new mapjson.ResourceApi(conf.confDir);

    app.use( (req, res, next) => {
        res.fis = app.fis;
        next();
    });

    //初始化bigpipe
    if (conf.bigpipe) {
        app.use(yogBigPipe(conf.bigpipeOpt));
    }

    _.forIn(conf.engine, function (engine, name) {
        //设置view engine
        let viewEngine = new yogView(app, engine, conf[name] || {});
        // viewEngines.push(viewEngine);
        app.engine(name, viewEngine.renderFile.bind(viewEngine));
    });
}

setViews(app, viewConf);

console.log(static_path);

app.use('/static', express.static(static_path));

app.get('/test', (req, res) => {
    res.render('./home/page/index.tpl');
});

app.listen(3000, () => {
    console.log('Example app listening on port 3000!');
});
