/**
 * @file FIS 配置
 * @author
 */

'use strict'

fis.require.prefixes.unshift('yogurt');

fis.set('namespace', 'home');
fis.set('static', '/static');
fis.set('template', '/views');
fis.set('map', '/resource-map');

let clientRoadmap = {
    'client/(**)': {
        id: '$1',
        moduleId: '${namespace}:$1',
        release: '/${static}/${namespace}/$1'
    },
    'client/**.sass': {
        parser: fis.plugin('sass'),
        rExt: '.css'
    },
    'client/**.tpl': {
        preprocessor: fis.plugin('extlang'),
        postprocessor: fis.plugin('require-async'),
        useMap: true
    },
    'client/**.{tpl,js,ts,jsx,es,tsx}': {
        useSameNameRequire: true
    },
    'client/page/**.tpl': {
        extras: {
            isPage: true
        }
    },
    'client/(page/**.tpl)': {
        url: '${namespace}/$1',
        release: '/${template}/${namespace}/$1',
        useMap: true
    },
    'client/(widget/**.tpl)': {
        url: '${namespace}/$1',
        release: '/${template}/${namespace}/$1',
        useMap: true
    },
    'client/{components,widget}/**.{js,es,ts,tsx,jsx,css,less}': {
        isMod: true
    },
    'client/test/(**)': {
        useMap: false,
        release: '/test/${namespace}/$1'
    },
    '${namespace}-map.json': {
        release: '${map}/${namespace}-map.json'
    },
    '::package': {}
};

let serverRoadmap = {

};

[clientRoadmap, serverRoadmap].forEach(function (roadmap) {
    fis.util.map(roadmap, function (selector, rules) {
        fis.match(selector, rules);
    });
});

// 模块化支持
fis.hook('commonjs', {
    extList: ['.js', '.es', '.ts', '.tsx', '.jsx']
});


fis.unhook('components'); // fis3 中预设的是 fis-components，这里不需要，所以先关了。
fis.hook('node_modules'); // 使用 fis3-hook-node_modules 插件。

// 设置成是模块化 js
fis.match('/node_modules/(**.{js,jsx})', {
    isMod: true,
    url : '${static}/nm/$1',
    release : '/${static}/nm/$1'
});

fis.media('prod')
    .match('/node_modules/(**.{js,jsx})', {
        packTo : '/${static}/pkg/nm_pkg.js'
    });


// map.json
fis.match('::package', {
    postpackager: function createMap(ret) {
        var path = require('path');
        var root = fis.project.getProjectPath();
        var map = fis.file.wrap(path.join(root, fis.get('namespace') + '-map.json'));
        map.setContent(JSON.stringify(ret.map, null, 4));
        ret.pkg[map.subpath] = map;
    }
});
