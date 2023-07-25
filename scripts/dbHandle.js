var db = null;
var var_no = null;
var position = null;
var index;
 
// 데이터베이스 생성 및 오픈 함수
function openDB(){
   db = window.openDatabase('listDB', '1.0', 'ListDB', 1024*1024); 
   console.log('1_DB 생성...'); 
} 

// 테이블 생성 트랜잭션 실행 함수
function createTable() {
	db.transaction(function(tr){
		var createSQL = 'create table if not exists list_todo3(id INTEGER PRIMARY KEY AUTOINCREMENT, taskDate text, task text, color text, complete text)';       
		tr.executeSql(createSQL, [], function(){
			 console.log('2_1_테이블생성_sql 실행 성공...');        
		}, function(){
			 console.log('2_1_테이블생성_sql 실행 실패...');            
		});
	}, function(){
		 console.log('2_2_테이블 생성 트랜잭션 실패...롤백은 자동');
	}, function(){
		 console.log('2_2_테이블 생성 트랜잭션 성공...');
	});
 }
 

//데이터 삽입 함수
function insertData(taskDate, task, color, complete) {
    db.transaction(function(tr) {
        var insertSQL = 'insert into list_todo3(taskDate, task, color, complete) values (?, ?, ?, ?)';
        tr.executeSql(insertSQL, [taskDate, task, color, complete], function() {
            console.log('데이터 삽입 성공...');
			showAllTasks();
			alert("추가 완료!");
        }, function(error) {
            console.log('데이터 삽입 실패:', error.message, error.code);
        });
    }, function(error) {
        console.log('데이터 삽입 트랜잭션 실패...롤백은 자동', error);
    }, function() {
        console.log('데이터 삽입 트랜잭션 성공...');
    });
}




// 모든 데이터를 보여주는 함수
function showAllTasks() {
    var listTodo = $("#listTodo");
    listTodo.empty(); // 기존 목록 비우기

    db.transaction(function (tr) {
        var selectSQL = 'SELECT * FROM list_todo3';
        tr.executeSql(selectSQL, [], function (tr, result) {
            for (var i = 0; i < result.rows.length; i++) {
                var row = result.rows.item(i);
                var taskDate = row.taskDate;
                var task = row.task;
                // 새로운 데이터를 동적으로 생성하여 목록에 추가
                if (taskDate == "") {
                    if(result.rows.item(i).complete == "true"){
                        listTodo.append("<li style='text-decoration:line-through; margin: 20px 0px;'>" + task + "</li>");
                    }else{
                        if(result.rows.item(i).color == "red"){
						    listTodo.append("<li style='color:red; margin: 20px 0px;'>" + task + "</li>");
					    }else{
						    listTodo.append("<li style='color:white; margin: 20px 0px;'>" + task + "</li>");
					    }
                    }
                } else {
                    if(result.rows.item(i).complete == "true"){
                        listTodo.append("<li style='text-decoration:line-through; margin: 20px 0px;'>" + taskDate + "  " + task + "</li>");
                    }else{
                        if(result.rows.item(i).color == "red"){
						    listTodo.append("<li style='color:red; margin: 20px 0px;'>" + taskDate + "  " + task + "</li>");
					    }else{
						    listTodo.append("<li style='color:white; margin: 20px 0px;'>" + taskDate + "  " + task + "</li>");
					    }
                    }
                }
            }
            // 데이터가 많아 화면에 다 담지 못하는 경우 스크롤 생성
            $("#page_main").trigger("create");
        }, function (error) {
            console.log('데이터 조회 실패:', error);
        });
    });
}

// Today 데이터를 보여주는 함수
function showTodayTasks() {
	var listTodo = $("#listTodo");
	listTodo.empty(); // 기존 목록 비우기
	db.transaction(function(tr) {
		var selectSQL = 'SELECT * FROM list_todo3';
		tr.executeSql(selectSQL, [], function(tr, result) {
			// 오늘 날짜를 가져오기
			var today = new Date().toISOString().slice(0, 10);
			for (var i = 0; i < result.rows.length; i++) {
				var row = result.rows.item(i);
				var taskDate = row.taskDate;
				var task = row.task;
				// 새로운 데이터를 동적으로 생성하여 목록에 추가 (오늘 날짜인 경우에만 추가)
				if (taskDate == today) {
					listTodo.append("<li>" + taskDate + "  " + task + "</li>");
				}
			}
			// 데이터가 많아 화면에 다 담지 못하는 경우 스크롤 생성
			$("#page_main").trigger("create");
		}, function(error) {
			console.log('데이터 조회 실패:', error);
		});
	});
}



//전체삭제 버튼 함수
function deleteAllTasks() {
	db.transaction(function(tr) {
		var deleteAllSQL = 'DELETE FROM list_todo3';
		tr.executeSql(deleteAllSQL, [], function() {
			console.log('모든 데이터 삭제 성공...');
			alert("모든 할 일 목록이 삭제되었습니다.");
			// 삭제 후 할 일 목록을 갱신합니다
			showAllTasks();
		}, function(error) {
			console.log('데이터 삭제 실패:', error);
		});
	});
}



// 색상 데이터 삽입함수1
function updateColorData(color, position) {
    db.transaction(function (tr) {
        var deleteForSelectSQL = 'SELECT * FROM list_todo3';
        tr.executeSql(deleteForSelectSQL, [], function (tr, result) {
           var re = result.rows.item(position).id;		//고민한부분
		   if(result.rows.item(position).color=='red'){
				color = 'black';
		   }
		   updateColorData1(color, re);
		   console.log('성공');
        }, function (error) {
            console.log('실패:', error);
        });
    });
}
function updateColorData1(color, re) {
    db.transaction(function(tr) {
        var updateColorSQL = 'UPDATE list_todo3 SET color = ? WHERE id = ?';
        tr.executeSql(updateColorSQL, [color, re], function() {
            console.log('색상 데이터 삽입 성공');
			showAllTasks();
        }, function(error) {
            console.log('색상 데이터 삽입 실패: ', error);
        });
    }, function(error) {
        console.log('색상 데이터 삽입 트랜잭션 실패...롤백은 자동', error);
    }, function(){
        console.log('색상 데이터 삽입 트랜잭션 성공...');
    });
}







//삭제함수 1
function deleteTask(position) {
    db.transaction(function (tr) {
        var deleteForSelectSQL = 'SELECT * FROM list_todo3';
        tr.executeSql(deleteForSelectSQL, [], function (tr, result) {
           var re = result.rows.item(position).id;		
		   console.log(re);
		   deleteTask1(re);
		   console.log('성공');
        }, function (error) {
            console.log('실패:', error);
        });
    });
}
function deleteTask1(re) {
	db.transaction(function(tr) {
		var deleteTaskSQL = 'DELETE from list_todo3 where id = ?';
        tr.executeSql(deleteTaskSQL, [re], function() {
            console.log('데이터 삭제 성공');
			showAllTasks();
        }, function(error) {
            console.log('데이터 삭제 실패: ', error);
        });
    }, function(error) {
        console.log('데이터 삭제 트랜잭션 실패...롤백은 자동', error);
    }, function(){
        console.log('데이터 삭제 트랜잭션 성공...');
	});
}



// 완료표시 함수1
function completeTask(complete, position) {
    db.transaction(function (tr) {
        var deleteForSelectSQL = 'SELECT * FROM list_todo3';
        tr.executeSql(deleteForSelectSQL, [], function (tr, result) {
           var re = result.rows.item(position).id;		//고민한부분
		   if(result.rows.item(position).complete=='true'){
				complete = 'false';
		   }
		   completeTask1(complete, re);
		   console.log('성공');
        }, function (error) {
            console.log('실패:', error);
        });
    });
}
function completeTask1(complete, re) {
    db.transaction(function(tr) {
        var updateCompleteSQL = 'UPDATE list_todo3 SET complete = ? WHERE id = ?';
        tr.executeSql(updateCompleteSQL, [complete, re], function() {
            console.log('완료 표시 삽입 성공');
			showAllTasks();
        }, function(error) {
            console.log('완료 표시 삽입 실패: ', error);
        });
    }, function(error) {
        console.log('완료 작업 트랜잭션 실패...롤백은 자동', error);
    }, function(){
        console.log('완료 작업 트랜잭션 성공...');
    });
}
