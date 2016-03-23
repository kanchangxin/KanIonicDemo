angular.module('ionicApp', ['ionic'])
  .config(function ($stateProvider, $urlRouterProvider) {
  })

  .factory('ExamDb', function () {
    var tableName = "exam";
    var ExamDb = {};
    var db = openDatabase('yx360plus', '1.0', tableName, 10 * 1024 * 1024);
    db.transaction(function (tx) {
      tx.executeSql('CREATE TABLE IF NOT EXISTS exam (id unique, exambody,createDate)');
    });

    //删除表
    ExamDb.dropTable = function () {
      db.transaction(function (tx) {
        tx.executeSql('DROP TABLE ' + tableName);
      });
    };
    //添加数据
    ExamDb.set = function (key, value) {
      db.transaction(function (tx) {
        tx.executeSql('INSERT INTO exam (id,exambody,createDate) VALUES (?, ?,?)', [key, value, new Date()]);
      });
    };
    return ExamDb;
  })

  .service('ExamDBValue', ['$q', function ($q) {
    var tableName = "exam";
    var db = openDatabase('yx360plus', '1.0', tableName, 10 * 1024 * 1024);


    this.findOneValue = function (key) {
      var value = "";
      var defer = $q.defer();
      db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM ' + tableName + ' where id like ?', [key], function (tx, results) {
          var len = results.rows.length, i;

          if (len == 0) {
            defer.reject( );
          } else {
            for (i = 0; i < len; i++) {
              value = value + results.rows.item(i).exambody;
            }
            defer.resolve(value);
          }
        }, function(transaction, error) {
          defer.reject(error);
        });
      });
      return defer.promise;
    };
    this.set = function (key,value) {
      var deferred = $q.defer();
      db.transaction(function (tx) {
        tx.executeSql('INSERT INTO exam (id,exambody,createDate) VALUES (?, ?,?)', [key, value, new Date()], function (transaction, result) {
          console.log("set ok "+key)
          deferred.resolve(result);
        }, function (transaction, error) {
          console.log("set err "+error)
          deferred.reject(error);
        });
      });
      return deferred.promise;
    };
    //this.objectValue = function (key) {
    //  db.transaction(function (tx) {
    //    tx.executeSql('SELECT * FROM ' + tableName + ' where id like ?', [key], function (tx, results) {
    //      var len = results.rows.length, i;
    //
    //      for (i = 0; i < len; i++) {
    //        value = value + results.rows.item(i).exambody;
    //      }
    //      defer.resolve(results.rows.item(0));
    //    });
    //  });
    //
    //  return defer.promise;
    //};

  }])
  //.directive('emitLastRepeaterElement', function() {
  //  return function(scope) {
  //    if (scope.$last){
  //      scope.$emit('LastRepeaterElement');
  //    }
  //  };
  //})
  .directive("mathjaxBind", function () {
    return {
      restrict: "A",
      controller: ["$scope", "$element", "$attrs", "ExamDBValue","$q",  function ($scope, $element, $attrs, ExamDBValue) {
        $scope.$watch($attrs.mathjaxBind, function (value) {
          //不能依赖于id，id在mathjaxBind变化的时候还不一定存在
          //console.log($attrs.id+",,"+document.getElementById($attrs.id));
          //console.log( value.examTitle.EXAM_ID+","+document.getElementById(value.examTitle.EXAM_ID));
          //console.log($element[0].id+"，，,"+document.getElementById($element[0].id));
          var id=value.examTitle.EXAM_ID;
          //console.log("mathjaxBind  $watch 触发:"+ id)
          //如果此id的试题已经被缓存，则从缓存中读取
          ExamDBValue.findOneValue(id).then(function (res) {
                    $element.html(res);
                    console.log("mathjaxBind  $watch 从缓存中读取:"+ id)
                   // $scope.examid_cached.push($attrs.id);
                    //MathJax.Hub.Queue(
                    //  ["Process",MathJax.Hub,$element[0]]
                    //);

          },function (err) {
                    console.debug("没找到:"+$attrs.id);
                    var title=value.examTitle.EXAM_NAME;
                    var options=getOptionText(value);
                    $element.html(value == undefined ? "" : title+options);
                    var timerb = new Date().getTime();

                    MathJax.Hub.Queue(
                      ["Typeset",MathJax.Hub,$element[0]]
                      ,[setcache, id,timerb,$element] //等价于function(){ dosomethins($element[0].id,timerb)}
                      //,function () {
                      //  console.log($element[0].id+"处理完成,耗时："+(new Date().getTime() - timerb) );
                      //  console.log( $element[0].innerHTML )
                      //}
                    );
          })
        });
        function getOptionText(value){
          //获得选项html text
          var text="";
          var len=value.examOptions.length;
          for(var i=0;i<len;i++){
            var eOption=value.examOptions[i];
            text=text+"<li><strong>"+eOption.eoSequence+"</strong>&nbsp;<span>"+eOption.eoName+"</span></li>";
          }
          return "<ul class='selections' >"+text+"</ul>";
        }
        function setcache(theid,timerbegin, $element ){

          console.log('公式：'+theid+"耗时:"+timerbegin+","+ (new Date().getTime() - timerbegin ));
          var timerb2 = new Date().getTime();
          var ele=$element.html();//document.getElementById(id);
          ExamDBValue.set(theid, ele).then(function (res) {console.log("写缓存耗时：" + (new Date().getTime() - timerb2 ))},function (err) {console.log(err)})
        }

      }]
    };
  })

  .filter('mathjaxAndCache', function ($sce,ExamDBValue) {
    return  function (input,id) {
      var target=document.getElementById(id);
      //console.log("o "+id+","+ target);
      //alert( target)
      var r =  input ;
      //如果此id的试题已经被缓存，则从缓存中读取
      ExamDBValue.findOneValue( id).then(function (res) {
        document.getElementById(id).innerHTML =res;
           console.log("mathjaxBind  $watch 从缓存中读取:"+ id);
      },function (err) {
            console.debug("没找到:"+ id);
            var timerb = new Date().getTime();
            MathJax.Hub.Queue(
              function(){document.getElementById(id).innerHTML=$sce.trustAsHtml( document.getElementById(id).innerText);    },
              ["Typeset",MathJax.Hub,id]
             ,[dosomethins,id,timerb] //等价于function(){ dosomethins($element[0].id,timerb)}
            );
      });
      function dosomethins(id,timerbegin ){
          console.log('公式：'+id+"耗时:"+ (new Date().getTime() - timerbegin ));
          var timerb2 = new Date().getTime();
          var ele=document.getElementById(id);
          ExamDBValue.set(id, ele.innerHTML).then(function (res) {console.log("写缓存耗时：" + (new Date().getTime() - timerb2 ))},function (err) {console.log(err)})
      };
      return r;
    };
  })

  .controller('formulaCtrl', function ($scope,ExamDb ) {

    //$scope.examid_cached=[];//已缓存的题目id
    //$scope.examid_nocache=[];//为缓存的题目id
    $scope.cleantable= function( ){
      ExamDb.dropTable()
    }
    $scope.adddata=function(){
      //$scope.formulaCollection.push(get360Date().data.examList.splice(3,1)[0] );
      $scope.formulaCollection=[]
      $scope.formulaCollection = get360Date().data.examList.splice(8,1);
    }

     ///////////
    //var db = new PouchDB('dbname');
    ////db.get('mydoc').then(function (doc) {
    ////  console.log(doc);
    ////}).catch(function (err) {
    ////  console.log(err);
    ////});
    //
    //db.get('mydoc').then(function(doc) {
    //  return db.remove(doc);
    //}).then(function (result) {
    //  // handle result
    //}).catch(function (err) {
    //  console.log(err);
    //});
    ///////////

    $scope.formulaCollection = get360Date().data.examList.splice(1,1);


    //$scope.cacheName = function (formula, id) {
    //  console.log("执行了几次？")
    //  //查看缓存中的值
    //  var v = window.localStorage.getItem(id);
    //  var timerb = new Date().getTime();
    //  if (v == null) {
    //    //如果没有则渲染公式，缓存，并返回
    //    var target = document.getElementById("formula_my");
    //    target.innerHTML = formula;
    //    //console.log("要解析的是 " + formula);
    //    MathJax.Hub.Queue(function () {
    //        MathJax.Hub.Typeset("formula_my", function () {
    //          window.localStorage.setItem(id, target.innerHTML);
    //          console.log("ok");
    //          //return target.innerHTML;
    //        });//必要的时候手工执行排版
    //
    //      }, function () {
    //        console.log("公式计算完成，耗时：" + timerb - (new Date().getTime()));
    //      }
    //    );
    //  } else {
    //    //如果有则返回结果
    //    return v;
    //  }
    //}

    //需要2个转义符号连用才行。与目前服务端接口一致
    function get360Date() {
      var result =
      {
        "success": true,
        "message": "",
        "data": {
          "examList": [{
            "examOptions": [{
              "id": "d02fd111-fc65-4ebb-b30c-a9c9b6781689",
              "examId": "15e62270-d21e-4b60-95d6-302ac0bb3735",
              "eoSequence": "A",
              "eoName": "\\( - 5\\)",
              "eoOrder": 1
            },
              {
                "id": "a0d4f46e-bc59-4956-92ff-95f2e9135077",
                "examId": "15e62270-d21e-4b60-95d6-302ac0bb3735",
                "eoSequence": "B",
                "eoName": "\\(5\\)",
                "eoOrder": 2
              },
              {
                "id": "b0c765b8-23a1-4156-84aa-24e956746f93",
                "examId": "15e62270-d21e-4b60-95d6-302ac0bb3735",
                "eoSequence": "C",
                "eoName": "\\(1\\)",
                "eoOrder": 3
              },
              {
                "id": "5a20dddc-04c0-4f48-9e28-534e11ce4f1c",
                "examId": "15e62270-d21e-4b60-95d6-302ac0bb3735",
                "eoSequence": "D",
                "eoName": "\\( - 1\\)",
                "eoOrder": 4
              }],
            "examTitle": {
              "EXAM_NAME": "\\( - 3\\)&nbsp;与&nbsp;\\(2\\)&nbsp;的差是 \\((\\qquad)\\)",
              "IS_RIGHT": 0,
              "UT_ID": "eac1d718-cc45-4aea-b3bd-b7521a2fb7c1",
              "UTE_ID": "e67d8cb3-3703-469b-a936-47e9e3c2fc37",
              "ANSWER_COM": "D",
              "EXAM_FLAG": "KH",
              "RIGHT_ANSWER": "A",
              "EXAM_ID": "15e62270-d21e-4b60-95d6-302ac0bb3735"
            }
          },
            {
              "examOptions": [{
                "id": "83482a98-04bc-4020-b719-9b26087e5ced",
                "examId": "375de904-a096-4e4b-a734-fec14b95cc12",
                "eoSequence": "A",
                "eoName": "\\( 41 \\)",
                "eoOrder": 1
              },
                {
                  "id": "37197fcc-a124-4ec8-ae3f-d7e598b483f9",
                  "examId": "375de904-a096-4e4b-a734-fec14b95cc12",
                  "eoSequence": "B",
                  "eoName": "\\( 39 \\) \\( 2^3 \\)，",
                  "eoOrder": 2
                },
                {
                  "id": "7ec820be-ccc5-4be7-b02b-f4c62721d272",
                  "examId": "375de904-a096-4e4b-a734-fec14b95cc12",
                  "eoSequence": "C",
                  "eoName": "\\( 31 \\)",
                  "eoOrder": 3
                },
                {
                  "id": "0cd92d72-e5b9-4f41-b849-b68e48b0fafc",
                  "examId": "375de904-a096-4e4b-a734-fec14b95cc12",
                  "eoSequence": "D",
                  "eoName": "\\( 29 \\)",
                  "eoOrder": 4
                }],
              "examTitle": {
                "EXAM_NAME": "\\( 39 \\) \\( 2^3 \\)，\\( 3^3 \\)&nbsp;和&nbsp;\\( 4^3 \\)&nbsp;分别可以按如图所示方式&quot;分裂&quot;成&nbsp;\\( 2 \\)&nbsp;个、&nbsp;\\( 3 \\)&nbsp;个和&nbsp;\\( 4 \\)&nbsp;个连续奇数的和，\\( 6^3 \\)&nbsp;也能按此规律进行&quot;分裂&quot;，则&nbsp;\\( 6^3 \\)&nbsp;&quot;分裂&quot;出的奇数中最大的是 \\((\\qquad)\\) ．\n<br />\n<img src=\"http://file.k12.kssws.ks-cdn.com/20151024195154.3nkroovGCQ.png\" class=\"img-responsive\" />",
                "IS_RIGHT": 0,
                "UT_ID": "eac1d718-cc45-4aea-b3bd-b7521a2fb7c1",
                "EXPLAIN_PICTURE": "由题干中的图所给的条件可知：\n<br />&nbsp;\\( 5^3=21+23+25+27+29 \\)；\n<br />&nbsp;\\( 6^3=31+33+35+37+39+41 \\)．",
                "UTE_ID": "9ae939ba-12ab-4679-9d7c-4aaa3b194fe8",
                "ANSWER_COM": "B",
                "EXAM_FLAG": "YX",
                "RIGHT_ANSWER": "A",
                "EXAM_ID": "375de904-a096-4e4b-a734-fec14b95cc12"
              }
            },
            {
              "examOptions": [{
                "id": "64148dc2-3577-4c87-9028-08fcfd123bd0",
                "examId": "4307bc94-2ac1-4d3e-bf87-8f2f86a9a9de",
                "eoSequence": "A",
                "eoName": "\\( 28.3\\times 10^7 \\)",
                "eoOrder": 1
              },
                {
                  "id": "4bcfaeb0-4d81-4d6b-b7a1-efacf211b337",
                  "examId": "4307bc94-2ac1-4d3e-bf87-8f2f86a9a9de",
                  "eoSequence": "B",
                  "eoName": "\\( 2.83\\times 10^8 \\)",
                  "eoOrder": 2
                },
                {
                  "id": "2f8749b7-71ef-495c-9804-1ff69a503654",
                  "examId": "4307bc94-2ac1-4d3e-bf87-8f2f86a9a9de",
                  "eoSequence": "C",
                  "eoName": "\\( 0.283\\times 10^{10} \\)",
                  "eoOrder": 3
                },
                {
                  "id": "55d0e678-6383-4df4-a83b-9661fca12cf6",
                  "examId": "4307bc94-2ac1-4d3e-bf87-8f2f86a9a9de",
                  "eoSequence": "D",
                  "eoName": "\\( 2.83\\times 10^9 \\)",
                  "eoOrder": 4
                }],
              "examTitle": {
                "EXAM_NAME": "森林是<u>地球之肺</u>，每年<span style='color:red'>能为</span>人类提供大约&nbsp;\\( 28.3 \\)&nbsp;亿吨的有机物，\\( 28.3 \\)&nbsp;亿吨用科学记数法表示为 \\((\\qquad)\\)",
                "IS_RIGHT": 0,
                "UT_ID": "eac1d718-cc45-4aea-b3bd-b7521a2fb7c1",
                "EXPLAIN_PICTURE": "\\( 28.3亿=28.3\\times 10^8=2.83\\times 10^9 \\)．",
                "UTE_ID": "790bcd08-6e10-407c-a4ac-eb354bd78334",
                "ANSWER_COM": "C",
                "EXAM_FLAG": "KH",
                "RIGHT_ANSWER": "D",
                "EXAM_ID": "4307bc94-2ac1-4d3e-bf87-8f2f86a9a9de"
              }
            },
            {
              "examOptions": [{
                "id": "4693e890-b54b-4576-93a1-63838f3ea677",
                "examId": "53119156-0f2a-49ca-ab5a-c3e35cb92068",
                "eoSequence": "A",
                "eoName": "\\(0.216 \\times {10^5}\\)",
                "eoOrder": 1
              },
                {
                  "id": "7205da06-a808-44be-b4ac-5e9700281f79",
                  "examId": "53119156-0f2a-49ca-ab5a-c3e35cb92068",
                  "eoSequence": "B",
                  "eoName": "\\(21.6 \\times {10^3}\\)",
                  "eoOrder": 2
                },
                {
                  "id": "3b91e7a5-660b-4792-9cc7-9c93cbb237ab",
                  "examId": "53119156-0f2a-49ca-ab5a-c3e35cb92068",
                  "eoSequence": "C",
                  "eoName": "\\(2.16 \\times {10^3}\\)",
                  "eoOrder": 3
                },
                {
                  "id": "412658ca-7305-4b56-81fc-0d4220264846",
                  "examId": "53119156-0f2a-49ca-ab5a-c3e35cb92068",
                  "eoSequence": "D",
                  "eoName": "\\(2.16 \\times {10^4}\\)",
                  "eoOrder": 4
                }],
              "examTitle": {
                "EXAM_NAME": "截止到&nbsp;\\( 2008年5月19日 \\)&nbsp;，已有&nbsp;\\(21600\\)&nbsp;名中外记者成为北京奥运会的注册记者，创历届奥运会之最．将&nbsp;\\(21600\\)&nbsp;用科学记数法表示应为 \\((\\qquad)\\)",
                "IS_RIGHT": 0,
                "UT_ID": "1",
                "UTE_ID": "62ee343e-d367-4f42-9193-6445e63b1ec9",
                "ANSWER_COM": "A",
                "EXAM_FLAG": "QH",
                "RIGHT_ANSWER": "D",
                "EXAM_ID": "53119156-0f2a-49ca-ab5a-c3e35cb92068"
              }
            },
            {
              "examOptions": [{
                "id": "edde90d5-8576-45c0-b13f-50aee21ddcf8",
                "examId": "564378ee-cfcf-42b0-9c72-f5e530f41d2b",
                "eoSequence": "A",
                "eoName": "\\(0\\)",
                "eoOrder": 1
              },
                {
                  "id": "829ea655-ae42-43ac-907f-fbd451d9f0b7",
                  "examId": "564378ee-cfcf-42b0-9c72-f5e530f41d2b",
                  "eoSequence": "B",
                  "eoName": "\\(1\\)",
                  "eoOrder": 2
                },
                {
                  "id": "93f8ed4a-5c16-4c09-8c4d-4fab31532d0d",
                  "examId": "564378ee-cfcf-42b0-9c72-f5e530f41d2b",
                  "eoSequence": "C",
                  "eoName": "\\(0.000 1\\)",
                  "eoOrder": 3
                },
                {
                  "id": "d591fc34-dd50-49a1-82a7-24bd3f68b95b",
                  "examId": "564378ee-cfcf-42b0-9c72-f5e530f41d2b",
                  "eoSequence": "D",
                  "eoName": "不存在",
                  "eoOrder": 4
                }],
              "examTitle": {
                "EXAM_NAME": "最小的正有理数是 \\((\\qquad)\\)",
                "IS_RIGHT": 0,
                "UT_ID": "a1ad51eb-2653-4b58-b269-44dcd9f819b6",
                "UTE_ID": "aae1634d-2ef7-48f1-a0ce-46423edb400c",
                "ANSWER_COM": "A",
                "EXAM_FLAG": "FX",
                "RIGHT_ANSWER": "D",
                "EXAM_ID": "564378ee-cfcf-42b0-9c72-f5e530f41d2b"
              }
            },
            {
              "examOptions": [{
                "id": "2d1ed4e6-7ab0-46ed-babf-5fd2d155b7e7",
                "examId": "5a8ca64e-06a7-4f5b-ad3b-67ae7a0ad732",
                "eoSequence": "A",
                "eoName": "\\(2\\)",
                "eoOrder": 1
              },
                {
                  "id": "f6aed357-087f-4d12-b0e4-4518bf77e16d",
                  "examId": "5a8ca64e-06a7-4f5b-ad3b-67ae7a0ad732",
                  "eoSequence": "B",
                  "eoName": "\\(3\\)",
                  "eoOrder": 2
                },
                {
                  "id": "64a91e91-4a4f-4f82-95bc-59d73ba130bd",
                  "examId": "5a8ca64e-06a7-4f5b-ad3b-67ae7a0ad732",
                  "eoSequence": "C",
                  "eoName": "\\(4\\)",
                  "eoOrder": 3
                },
                {
                  "id": "b200d40a-ffc6-4c32-9894-77c01f741bd6",
                  "examId": "5a8ca64e-06a7-4f5b-ad3b-67ae7a0ad732",
                  "eoSequence": "D",
                  "eoName": "\\(5\\)",
                  "eoOrder": 4
                }],
              "examTitle": {
                "EXAM_NAME": "在&nbsp;\\(-1{\\dfrac{1}{2}}\\)，\\(1.2\\)，\\(\\left(-2\\right)^3\\)，\\(0\\)，\\(-\\left(-2\\right)\\)&nbsp;中，负数的个数有 \\((\\qquad)\\)",
                "IS_RIGHT": 0,
                "UT_ID": "a1ad51eb-2653-4b58-b269-44dcd9f819b6",
                "UTE_ID": "6da16720-217f-40e0-95fb-8b18a2789305",
                "ANSWER_COM": "B",
                "EXAM_FLAG": "FX",
                "RIGHT_ANSWER": "A",
                "EXAM_ID": "5a8ca64e-06a7-4f5b-ad3b-67ae7a0ad732"
              }
            },
            {
              "examOptions": [{
                "id": "896916f9-e92a-4c71-bfb8-cdff1b0cce16",
                "examId": "6133bb0b-7ff0-4149-be7c-519ec12625c4",
                "eoSequence": "A",
                "eoName": "\\( - 26^\\circ{\\rm C} \\)",
                "eoOrder": 1
              },
                {
                  "id": "fc070419-3c78-405d-bdff-6213b57870b0",
                  "examId": "6133bb0b-7ff0-4149-be7c-519ec12625c4",
                  "eoSequence": "B",
                  "eoName": "\\( - 22^\\circ{\\rm C} \\)",
                  "eoOrder": 2
                },
                {
                  "id": "7101b312-05c6-4895-af8f-fe898f8fa973",
                  "examId": "6133bb0b-7ff0-4149-be7c-519ec12625c4",
                  "eoSequence": "C",
                  "eoName": "\\( - 18^\\circ{\\rm C} \\)",
                  "eoOrder": 3
                },
                {
                  "id": "e48284b8-945a-49c6-985e-2d623cd87ae4",
                  "examId": "6133bb0b-7ff0-4149-be7c-519ec12625c4",
                  "eoSequence": "D",
                  "eoName": "\\( 22^\\circ{\\rm C} \\)",
                  "eoOrder": 4
                }],
              "examTitle": {
                "EXAM_NAME": "\\( 2008 \\)&nbsp;年&nbsp;\\( 5 \\)&nbsp;月&nbsp;\\( 5 \\)&nbsp;日，奥运火炬手携带着象征&quot;和平、友谊、进步&quot;的奥运圣火火种，离开海拔&nbsp;\\( 5200 \\)&nbsp;米的&quot;珠峰大本营&quot;，向山顶攀登．他们在海拔每上升&nbsp;\\(100 \\)&nbsp;米，气温就下降&nbsp;\\( 0.6^\\circ{\\rm C} \\)&nbsp;的低温和缺氧的情况下，于&nbsp;\\( 5 \\)&nbsp;月&nbsp;\\( 8 \\)&nbsp;日&nbsp;\\( 9 \\)&nbsp;时&nbsp;\\( 17 \\)&nbsp;分，成功登上海拔&nbsp;\\( 8844.43 \\)&nbsp;米的地球最高点．而此时&quot;珠峰大本营&quot;的温度为&nbsp;\\( - 4^\\circ{\\rm C} \\)&nbsp;，峰顶的温度为 \\((\\qquad)\\) （结果保留整数）．",
                "IS_RIGHT": 0,
                "UT_ID": "1",
                "UTE_ID": "777b2214-2efd-48f7-b529-741bf10a11e4",
                "ANSWER_COM": "B",
                "EXAM_FLAG": "QH",
                "RIGHT_ANSWER": "A",
                "EXAM_ID": "6133bb0b-7ff0-4149-be7c-519ec12625c4"
              }
            },
            {
              "examOptions": [{
                "id": "8d2ce3be-220e-436a-9877-ee20761fa661",
                "examId": "62e8e029-9c58-45cc-96da-60bf72d0520f",
                "eoSequence": "A",
                "eoName": "\\( -8+3+9-2 \\)",
                "eoOrder": 1
              },
                {
                  "id": "ac552fc5-e610-46d6-b0a0-6e7910aebf9b",
                  "examId": "62e8e029-9c58-45cc-96da-60bf72d0520f",
                  "eoSequence": "B",
                  "eoName": "\\( 8+3+9-2 \\)",
                  "eoOrder": 2
                },
                {
                  "id": "00de8a11-2194-4d1b-bf5a-dc00cfe9c32b",
                  "examId": "62e8e029-9c58-45cc-96da-60bf72d0520f",
                  "eoSequence": "C",
                  "eoName": "\\( -8-3+9-2 \\)",
                  "eoOrder": 3
                },
                {
                  "id": "20fcb747-b241-48f1-9f39-73c84c9bb016",
                  "examId": "62e8e029-9c58-45cc-96da-60bf72d0520f",
                  "eoSequence": "D",
                  "eoName": "\\( 8+3+9+2 \\)",
                  "eoOrder": 4
                }],
              "examTitle": {
                "EXAM_NAME": "将&nbsp;\\(-8-\\left(-3\\right)+9-\\left(+2\\right)\\)&nbsp;写成省略加号的和的形式，正确的是 \\((\\qquad)\\)",
                "IS_RIGHT": 0,
                "UT_ID": "1",
                "UTE_ID": "b479c200-0ceb-4044-99ea-3559e134ff6c",
                "ANSWER_COM": "B",
                "EXAM_FLAG": "QH",
                "RIGHT_ANSWER": "A",
                "EXAM_ID": "62e8e029-9c58-45cc-96da-60bf72d0520f"
              }
            },
            {
              "examOptions": [{
                "id": "c94c7252-f68d-4255-afb4-049f43aca120",
                "examId": "79fc4f82-a82a-4269-b1a5-ee04433db82e",
                "eoSequence": "A",
                "eoName": "\\(10\\)&nbsp;幢",
                "eoOrder": 1
              },
                {
                  "id": "5f1ce7df-1eb0-47e0-bf9d-97b6c1f106be",
                  "examId": "79fc4f82-a82a-4269-b1a5-ee04433db82e",
                  "eoSequence": "B",
                  "eoName": "\\(10\\)&nbsp;万幢",
                  "eoOrder": 2
                },
                {
                  "id": "d3ee9b02-aafb-4b98-bd52-83727eded561",
                  "examId": "79fc4f82-a82a-4269-b1a5-ee04433db82e",
                  "eoSequence": "C",
                  "eoName": "\\(20\\)&nbsp;万幢",
                  "eoOrder": 3
                },
                {
                  "id": "dd7208d6-1186-4019-9ea1-d93dd51ddbd3",
                  "examId": "79fc4f82-a82a-4269-b1a5-ee04433db82e",
                  "eoSequence": "D",
                  "eoName": "\\(100\\)&nbsp;万幢",
                  "eoOrder": 4
                }],
              "examTitle": {
                "EXAM_NAME": "全国中小学危房改造工程实施五年来，已改造农村中小学危房&nbsp;\\(7 800\\)&nbsp;万平方米，如果按一幢教学楼的总面积是&nbsp;\\(750\\)&nbsp;平方米计算，那么该项改造工程共修建教学楼大约有 \\((\\qquad)\\)",
                "IS_RIGHT": 0,
                "UT_ID": "eac1d718-cc45-4aea-b3bd-b7521a2fb7c1",
                "UTE_ID": "fba43ae6-e53b-4568-9995-f544a40b96a8",
                "ANSWER_COM": "A",
                "EXAM_FLAG": "KH",
                "RIGHT_ANSWER": "B",
                "EXAM_ID": "79fc4f82-a82a-4269-b1a5-ee04433db82e"
              }
            },
            {
              "examOptions": [{
                "id": "428fb1a3-f0df-4683-93e5-a80d1da9eed8",
                "examId": "ac089587-cc62-4e6a-93bc-5335e936dde5",
                "eoSequence": "A",
                "eoName": "\\(a&gt;5 \\)",
                "eoOrder": 1
              },
                {
                  "id": "437a3d4a-593a-4b68-99a2-06441b2357d1",
                  "examId": "ac089587-cc62-4e6a-93bc-5335e936dde5",
                  "eoSequence": "B",
                  "eoName": "\\( a&lt;5 \\)",
                  "eoOrder": 2
                },
                {
                  "id": "59c578d1-7f19-4391-b479-600e8e2d6303",
                  "examId": "ac089587-cc62-4e6a-93bc-5335e936dde5",
                  "eoSequence": "C",
                  "eoName": "\\(a\\leqslant 5\\)",
                  "eoOrder": 3
                },
                {
                  "id": "5f9e001f-bd3b-48d1-b1b1-424866cb84a0",
                  "examId": "ac089587-cc62-4e6a-93bc-5335e936dde5",
                  "eoSequence": "D",
                  "eoName": "\\(a\\geqslant 5\\)",
                  "eoOrder": 4
                }],
              "examTitle": {
                "EXAM_NAME": "如果&nbsp;\\({\\left|{a-5}\\right|}=-\\left(a-5\\right)\\)，那么&nbsp;\\(a\\)&nbsp;的取值范围是 \\((\\qquad)\\)",
                "IS_RIGHT": 0,
                "UT_ID": "1",
                "EXPLAIN_PICTURE": "因为一个负数的绝对值是它的相反数；\\(0\\)&nbsp;的绝对值是&nbsp;\\(0\\)，所以如果&nbsp;\\({\\left|{a-5}\\right|}=-\\left(a-5\\right)\\)，那么&nbsp;\\(a\\)&nbsp;的取值范围是&nbsp;\\(a\\leqslant 5\\)．",
                "UTE_ID": "53a6e85e-aede-42d5-80ad-6a6c442c3c0b",
                "ANSWER_COM": "B",
                "EXAM_FLAG": "QH",
                "RIGHT_ANSWER": "C",
                "EXAM_ID": "ac089587-cc62-4e6a-93bc-5335e936dde5"
              }
            },
            {
              "examOptions": [{
                "id": "9a409d8b-ae8a-499d-ba0d-f4a36d7a5659",
                "examId": "c8727e92-e519-4b69-9bd6-22f3821eb7bf",
                "eoSequence": "A",
                "eoName": "\\(\\dfrac{{\\left| a \\right|}}{a} + \\dfrac{b}{{\\left| b \\right|}} = 1\\)",
                "eoOrder": 1
              },
                {
                  "id": "5670be2a-2431-480e-9e64-122d8e4b86bf",
                  "examId": "c8727e92-e519-4b69-9bd6-22f3821eb7bf",
                  "eoSequence": "B",
                  "eoName": "\\(\\dfrac{{\\left| a \\right|}}{a} + \\dfrac{{\\left| b \\right|}}{b} + \\dfrac{{\\left| c \\right|}}{c} = 2\\)",
                  "eoOrder": 2
                },
                {
                  "id": "fa3dbaa2-bce8-4eb2-85cf-077025a6c39d",
                  "examId": "c8727e92-e519-4b69-9bd6-22f3821eb7bf",
                  "eoSequence": "C",
                  "eoName": "\\(\\dfrac{a}{{\\left| a \\right|}} + \\dfrac{b}{{\\left| b \\right|}} + \\dfrac{{\\left| c \\right|}}{c} + \\dfrac{{\\left| d \\right|}}{d} = 3\\)",
                  "eoOrder": 3
                },
                {
                  "id": "498e16fe-9212-4dc5-b7f4-a5c808028d33",
                  "examId": "c8727e92-e519-4b69-9bd6-22f3821eb7bf",
                  "eoSequence": "D",
                  "eoName": "\\(\\dfrac{{\\left| a \\right|}}{a} + \\dfrac{{\\left| b \\right|}}{b} + \\dfrac{{\\left| c \\right|}}{c} + \\dfrac{{\\left| d \\right|}}{d} + \\left| {\\dfrac{{a + b + c + d}}{{abcd}}} \\right| = 4\\)",
                  "eoOrder": 4
                }],
              "examTitle": {
                "EXAM_NAME": "下列可能正确的是 \\((\\qquad)\\)",
                "IS_RIGHT": 0,
                "UT_ID": "1",
                "UTE_ID": "ed59c929-7da8-4197-ac59-73f853812408",
                "ANSWER_COM": "A",
                "EXAM_FLAG": "QH",
                "RIGHT_ANSWER": "D",
                "EXAM_ID": "c8727e92-e519-4b69-9bd6-22f3821eb7bf"
              }
            },
            {
              "examOptions": [{
                "id": "f495d38a-fa4a-4037-91dc-16ba76f7c8a3",
                "examId": "f7ab42e6-22f7-4ef7-a092-03aa60b8f255",
                "eoSequence": "A",
                "eoName": "七年级的数学课本共有&nbsp;\\( 200 \\)&nbsp;页",
                "eoOrder": 1
              },
                {
                  "id": "68923313-eb14-4a73-a5db-d2127e5e2104",
                  "examId": "f7ab42e6-22f7-4ef7-a092-03aa60b8f255",
                  "eoSequence": "B",
                  "eoName": "小明的体重是&nbsp;\\( 67 \\)&nbsp;千克",
                  "eoOrder": 2
                },
                {
                  "id": "63c15f71-f3d7-48f1-94ea-54af46b3c397",
                  "examId": "f7ab42e6-22f7-4ef7-a092-03aa60b8f255",
                  "eoSequence": "C",
                  "eoName": "\\( 1 \\)&nbsp;纳米等于&nbsp;\\( 1 \\)&nbsp;毫米的一百万分之一",
                  "eoOrder": 3
                },
                {
                  "id": "61422cb3-6fab-438a-95b9-9a3d16f41cf9",
                  "examId": "f7ab42e6-22f7-4ef7-a092-03aa60b8f255",
                  "eoSequence": "D",
                  "eoName": "期中数学考试满分为&nbsp;\\( 120 \\)&nbsp;分",
                  "eoOrder": 4
                }],
              "examTitle": {
                "EXAM_NAME": "下列各数据中，哪个可能是近似数 \\((\\qquad)\\)",
                "IS_RIGHT": 0,
                "UT_ID": "1",
                "EXPLAIN_PICTURE": "由测量得到的数据为近似数．",
                "UTE_ID": "1fce4d08-8856-41e7-bc4d-dbbb1fbe9e43",
                "ANSWER_COM": "C",
                "EXAM_FLAG": "QH",
                "RIGHT_ANSWER": "B",
                "EXAM_ID": "f7ab42e6-22f7-4ef7-a092-03aa60b8f255"
              }
            },
            {
              "examOptions": [{
                "id": "83389c60-34ca-42c3-a708-1f9935a0a7ab",
                "examId": "f9a94b78-e79d-4aa0-90af-44fbf4b322c9",
                "eoSequence": "A",
                "eoName": "\\(0\\)&nbsp;个",
                "eoOrder": 1
              },
                {
                  "id": "3a0a0ed5-29c7-44a8-b12d-b73f236c4e04",
                  "examId": "f9a94b78-e79d-4aa0-90af-44fbf4b322c9",
                  "eoSequence": "B",
                  "eoName": "\\(1\\)&nbsp;个",
                  "eoOrder": 2
                },
                {
                  "id": "846f97b6-1e1c-44ba-b28b-60b369359e0f",
                  "examId": "f9a94b78-e79d-4aa0-90af-44fbf4b322c9",
                  "eoSequence": "C",
                  "eoName": "\\(2\\)&nbsp;个",
                  "eoOrder": 3
                },
                {
                  "id": "33e842c3-0ce0-4e36-81a0-0b37d1c450d1",
                  "examId": "f9a94b78-e79d-4aa0-90af-44fbf4b322c9",
                  "eoSequence": "D",
                  "eoName": "\\(3\\)&nbsp;个",
                  "eoOrder": 4
                }],
              "examTitle": {
                "EXAM_NAME": "下列语句：①不带“&nbsp;\\(-\\)&nbsp;”号的数都是正数；②如果&nbsp;\\(a\\)&nbsp;是正数，那么&nbsp;\\(-a\\)&nbsp;一定是负数；③不存在既不是正数也不是负数的数；④&nbsp;\\(0 ^\\circ{\\rm C} \\)&nbsp;表示没有温度．其中正确的有 \\((\\qquad)\\)",
                "IS_RIGHT": 0,
                "UT_ID": "a1ad51eb-2653-4b58-b269-44dcd9f819b6",
                "UTE_ID": "203e6912-2fe2-45e2-9bd0-c8e4f472a9ed",
                "ANSWER_COM": "C",
                "EXAM_FLAG": "FX",
                "RIGHT_ANSWER": "B",
                "EXAM_ID": "f9a94b78-e79d-4aa0-90af-44fbf4b322c9"
              }
            },
            {
              "examOptions": [{
                "id": "83389c60-34ca-42c3-a708-1f9935a0a7ab",
                "examId": "f9a94b78-e79d-4aa0-90af-44fbf4b322c9",
                "eoSequence": "A",
                "eoName": "\\(0\\)&nbsp;个",
                "eoOrder": 1
              },
                {
                  "id": "3a0a0ed5-29c7-44a8-b12d-b73f236c4e04",
                  "examId": "f9a94b78-e79d-4aa0-90af-44fbf4b322c9",
                  "eoSequence": "B",
                  "eoName": "\\(1\\)&nbsp;个",
                  "eoOrder": 2
                },
                {
                  "id": "846f97b6-1e1c-44ba-b28b-60b369359e0f",
                  "examId": "f9a94b78-e79d-4aa0-90af-44fbf4b322c9",
                  "eoSequence": "C",
                  "eoName": "\\(2\\)&nbsp;个",
                  "eoOrder": 3
                },
                {
                  "id": "33e842c3-0ce0-4e36-81a0-0b37d1c450d1",
                  "examId": "f9a94b78-e79d-4aa0-90af-44fbf4b322c9",
                  "eoSequence": "D",
                  "eoName": "\\(3\\)&nbsp;个",
                  "eoOrder": 4
                }],
              "examTitle": {
                "EXAM_NAME": "下列a语句：①不带“&nbsp;\\(-\\)&nbsp;”号的数都是正数；②如果&nbsp;\\(a\\)&nbsp;是正数，那么&nbsp;\\(-a\\)&nbsp;一定是负数；③不存在既不是正数也不是负数的数；④&nbsp;\\(0 ^\\circ{\\rm C} \\)&nbsp;表示没有温度．其中正确的有 \\((\\qquad)\\)",
                "IS_RIGHT": 0,
                "UT_ID": "a1ad51eb-2653-4b58-b269-44dcd9f819b6",
                "UTE_ID": "203e6912-2fe2-45e2-9bd0-c8e4f472a9ed",
                "ANSWER_COM": "C",
                "EXAM_FLAG": "FX",
                "RIGHT_ANSWER": "B",
                "EXAM_ID": "f9a94b78-e79d-4aa0-90af-44fbf4b322cc"
              }
            }],
          "asize": 81
        },
        "state": 0,
        "ts": 1457512257389
      }
      return result;
    }

    //配置mathjax
    MathJax.Hub.Config({
      "fast-preview": {
        Chunks: {EqnChunk: 10, EqnChunkFactor: 1.5, EqnChunkDelay: 0},
        color: "inherit!important",
        updateTime: 30, updateDelay: 6,
        messageStyle: "none",
        //disabled: false
        disabled:true
      },
      skipStartupTypeset: true,//手动排版网页,必须的，否则copy公式会乱码
      messageStyle: "none", //公式解析时左下角不再出现进度提示
      "HTML-CSS": {//这里以HTML-CSS为例
        linebreaks: {automatic: true}, //自动换行
        showMathMenu: false, //在网页上右键公式出现查看公式源码菜单
        EqnChunk: 20, //表示公式被排版显示在屏幕上的数量   越大 闪烁越少但是延迟显示的时间越长
        EqnChunkFactor: 1.5,//每次公式显示数量增长倍数
        EqnChunkDelay: 100  //单位毫秒，每次显示的间隔，这样允许浏览器相应用户的其他交互请求）
      }
    });

    $scope.aa=get360Date().data.examList.splice(2,1)[0];
    //$scope.test=function(){
    //  MathJax.Hub.Queue(
    //    ["Typeset",MathJax.Hub],
    //    function () {
    //      console.log("lalalla in ")
    //    });
    //}


    //MathJax.Hub.Register.StartupHook("End",function () {
    //  console.log("l22222")
    //});
    //   MathJax.Hub.Configured();
  });


