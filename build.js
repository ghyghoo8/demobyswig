//http://www.cnblogs.com/rubylouvre/archive/2011/11/28/2264717.html

var fs = require('fs');
var swig  = require('swig');
var watch  = require('watch');


//关闭缓存===
swig.setDefaults({ cache: false });


var rmdirSync = (function(){
    function iterator(url,dirs){
        var stat = fs.statSync(url);
        if(stat.isDirectory()){
            dirs.unshift(url);//收集目录
            inner(url,dirs);
        }else if(stat.isFile()){
            fs.unlinkSync(url);//直接删除文件
        }
    }
    function inner(path,dirs){
        var arr = fs.readdirSync(path);
        for(var i = 0, el ; el = arr[i++];){
            iterator(path+"/"+el,dirs);
        }
    }
    return function(dir,cb){
        cb = cb || function(){};
        var dirs = [];

        try{
            iterator(dir,dirs);
            for(var i = 0, el ; el = dirs[i++];){
                fs.rmdirSync(el);//一次性删除所有收集到的目录
            }
            cb()
        }catch(e){//如果文件或目录本来就不存在，fs.statSync会报错，不过我们还是当成没有异常发生
            e.code === "ENOENT" ? cb() : cb(e);
        }
    }
})();



swigBuild();



//监听
watch.watchTree(__dirname+'/src',function(f,curr,prev){

    if(typeof f == "string"){
        console.log('change:',f);
        swigBuild();
    }
});

function swigBuild(){

//删除build目录
    rmdirSync(__dirname+"/build",function(e){
        console.log("删除build目录以及子目录成功");
        fs.mkdirSync(__dirname+"/build", 0755);

        //编译src下面的html
        setTimeout(function(){
            walk(__dirname+'/src', 0, handleFile);
        },200);
    });

}




function handleFile(path, floor) {
    var blankStr = '';
    for (var i = 0; i < floor; i++) {
        blankStr += '    ';
    }
    fs.stat(path, function(err1, stats) {
        if (err1) {
            console.log('stat error');
        } else {
            if (!stats.isDirectory() && /(\.html)$/g.test(path)) {
                var html=swig.renderFile(path,{cache:false}),
                    filename=path.split('/').pop();
//                console.log('-' + blankStr + path);

                //写入html
                fs.writeFile('build/'+filename,html,function(e){
                    if(e) throw e;
                });
            }
        }
    })
}

/*
 递归处理文件,文件夹
 path 路径
 floor 层数
 handleFile 文件,文件夹处理函数
 */

function walk(path, floor, handleFile) {
    console.log('编译src目录');
    handleFile(path, floor);
    floor++;
    fs.readdir(path, function(err, files) {
        if (err) {
            console.log('read dir error');
        } else {
            files.forEach(function(item) {
                var tmpPath = path + '/' + item;
                fs.stat(tmpPath, function(err1, stats) {
                    if (err1) {
                        console.log('stat error');
                    } else {
                        if (stats.isDirectory()) {
                            //子目录递归
                            //walk(tmpPath, floor, handleFile);
                        } else {
                            handleFile(tmpPath, floor);
                        }
                    }
                })
            });

        }
    });
}  