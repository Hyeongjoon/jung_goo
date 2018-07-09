$(document).ready(function(){


  $(".submenu > a").click(function(e) {
    e.preventDefault();
    var $li = $(this).parent("li");
    var $ul = $(this).next("ul");

    if($li.hasClass("open")) {
      $ul.slideUp(350);
      $li.removeClass("open");
    } else {
      $(".nav > li > ul").slideUp(350);
      $(".nav > li").removeClass("open");
      $ul.slideDown(350);
      $li.addClass("open");
    }
  });
  $("#admin-login").on('click' ,function(){
	  var email = $("#email").val();
	  var pw = $("#pw").val();
	  firebase.auth().signInWithEmailAndPassword(email, pw).then((user) => {
		  user.getIdToken(/* forceRefresh */ true).then(function(idToken) {
			  location.href="/admin/login?token="+idToken;
			}).catch(function(error) {
				alert('내부 서버 오류입니다 잠시후에 사용해주세요');
			});
	        	
		}).catch(function(error) {
			if(error.code='auth/wrong-password'){
				alert('이메일이나 비밀번호가 틀렸습니다.');
			}else{
				alert('내부 서버 오류입니다 잠시후에 사용해주세요');
			}
		});
  });
  $("#save_btn").on('click' , function(){
	  var email = $("#email").val();
	  var phone = $("#phone").val();
	  var content = $("#bootstrap-editor").val();
	  $.post("/admin/save_board" ,{token : token, email:email, phone: phone, content : content} ,function(result){
			alert("저장 완료");
			location.reload();
		}).fail(function(message){
			alert("내부 서버 오류입니다. 잠시후에 시도해 주세요");
		});
  });
  firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
	  if(user.email!=='3sh0402@gmail.com'){
		  firebase.auth().signOut();  
	  };
	  user.getIdToken(true).then(function(idToken){
		 token = idToken; 
	  });
  } else {
	  if(location.href=='http://www.anyair.co.kr/admin'){

	  } else{
		  location.href="/admin"  
	  };
  }
});
  $("#log_out").on('click', function(){
	  firebase.auth().signOut();
  });
  $("#search_btn").on('click', function(){
	  $.post("/admin/search" ,{token : token, content:	$("#search_input").val(),option:$("#search_value").val()} ,function(result){
		  var data = result['result'];
		  if(data.length!==0){
			  var content = '';
			  for(var i = 0; i < data.length; i++){ 
				  var date = data[i]['reg_date'].replace('T',' ');
				  var date = date.slice(0, date.length-5);
				  content+='<tr><td>'+data[i]['email']+'</td><td>'+data[i]['phone']+'</td><td>'+date+'</td><td><button type="button" class="btn btn-default" onclick="javascript:find_content('+data[i]['bid']+')">확인</button></td>'
			  }
			  $("#table_body").html(content);
		  } else{
			  alert("검색결과가 없습니다.");
		  }
		}).fail(function(message){
			alert("내부 서버 오류입니다. 잠시후에 시도해 주세요");
		});

  });
  $("#paid_list").on('click', function(){
	 location.href="/admin/paid_list?token="+token; 
  });
});

function find_content(bid){
	window.open(
			  'http://www.anyair.co.kr/admin/find_board?bid='+bid+'&token='+token,
			  '_blank', // <- This is what makes it open in a new window.,
			  'location=yes,height=570,width=520,scrollbars=yes,status=yes'
			);
}

function change_search_option(value){
	if(value==0){
		$("#search_btn").html("email")
		$("#search_value").val(0);
	} else if(value==1){
		$("#search_btn").html("phone")
		$("#search_value").val(1);
	}
}

function goMain(){
	location.href="/admin/login?token="+token;
}

function check(oid){
	var check = confirm("배송 완료 처리 하시겠습니까?");
	  if(check) {
		  $.post("/admin/delivery" ,{token : token, oid:oid} ,function(result){
			  location.reload();
			}).fail(function(message){
				alert("내부 서버 오류입니다. 잠시후에 시도해 주세요");
			});
	  }
}
