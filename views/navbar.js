checkLogin:function(){
			if(this.user==null){
				return false;
			} else{
				return true;
			}
		},
		facebookLogin:function(){
			const vm = this;
			var provider = new firebase.auth.FacebookAuthProvider();
			provider.setCustomParameters({
				  'display': 'popup'
			});
			firebase.auth().signInWithPopup(provider).then(function(result) {
				vm.user = result.user;
				$.magnificPopup.close();
			}).catch(function(error) {
    			if(error.code =='auth/account-exists-with-different-credential'){
    				vm.loginMessage='이미 다른 서비스로 이용중인 이메일 입니다.';
    			} else{
    				vm.loginMessage='로그인에 실패 했습니다. 다시 시도해 주세요';
    			}
			});
		},
		kakaoLogin:function(e){
			var $button=$(e.target);
			const vm = this;
			$button.addClass('running');
			Kakao.Auth.login({
		        success: function(authObj) {
		                $.post("/kakao_login" ,{access_token : authObj['access_token']} ,function(result){
		    				if(result['result']=='duplicate'){
		    					vm.loginMessage='이미 가입된 이메일 입니다.';
		    					$button.removeClass('running');
		    				}else {
		    					firebase.auth().signInWithCustomToken(result['token']).catch(function(error) {
		    						vm.loginMessage='내부 서버 오류입니다. 잠시후에 시도해 주세요';
		    						$button.removeClass('running');
		    						}).then(function(){
		    							$.magnificPopup.close();
		    							$button.removeClass('running');
		    						});
		    				}
			                Kakao.Auth.logout();
		    			}).fail(function(message){
		    				if(!message){
		    					vm.loginMessage=message['message'];	
		    				} else{
		    					vm.loginMessage='내부 서버 오류입니다. 잠시후에 시도해 주세요';
		    				}
		    				$button.removeClass('running');
		    				Kakao.Auth.logout();
		    			});
		        },
		        fail: function(err) {
		        	vm.loginMessage='이메일이나 비밀번호가 틀렸습니다.';
		        	$button.removeClass('running');
		        },
		        throughTalk: false
		      });
		},
		naverLogin:function(e){
			$("#naver_id_login").find('a').click();
		},
		logout:function(){
			this.user = null;
			firebase.auth().signOut();
		},
		closePopup:function(){
			$.magnificPopup.close();
		},
		popupLogin:function(){
			const vm = this;
			$.magnificPopup.open({
				items:{
					src:'#login'
				},
				type:'inline',
			    midClick: true,
			    mainClass: 'mfp-fade',
			    callbacks:{
				    close: function(){
				    	vm.loginEmailInput='';
				    	vm.loginPwInput='';
				    	vm.loginMessage='';
				    }
			    }
			});
		},
		sendEmail:function(){
			const vm  = this;
			var emailRegExp = /([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
			var email = this.findEmail.trim();
			if(!emailRegExp.test(email)){
				this.findPWMessage = '올바른 이메일을 적어주세요';
			}else{
				firebase.auth().sendPasswordResetEmail(email).then(function() {
					$.magnificPopup.close();
					alert("비밀번호 찾게 메일이 발송되었습니다.")
					}).catch(function(error) {
						if(error.code='auth/user-not-found'){
							vm.findPWMessage = '해당 이메일로 가입한 회원이 없습니다.';							
						} else{
							vm.findPWMessage = '내부 서버 오류입니다 .잠시후에 시도해 주세요';
						}
					});
			}
		},
		findPw:function(e){
			const vm = this;
			$.magnificPopup.close();
			e.stopPropagation();  //이거 있어야 새창으로 리뉴얼 됨
			$.magnificPopup.open({
				items:{
					src:'#pwEmail'
				},
				type:'inline',
			    midClick: true,
			    mainClass: 'mfp-fade',
			    callbacks:{
			    	close:function(){
						vm.findEmail = '';
						findPWMessage='';
			    	}
			    }
			});
		},
		signUp:function(){
			const vm = this;
			var emailRegExp = /([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
			var passRegExp = /^(?=.*[a-zA-Z])((?=.*\d)|(?=.*\W)).{6,20}$/
			var email = this.signUpEmailInput.trim();
			var pw = this.signUpPwInput.trim();
			var pw_confirm = this.signUpPwConfirmInput.trim();
			var nickname = this.signUpNicknameInput.trim();
			if(!emailRegExp.test(email)){
				this.signUpMessage = '올바른 이메일을 적어주세요';
			} else if(!passRegExp.test(pw)){
				this.signUpMessage = '비밀번호는 숫자 혹은 특수 문자를 포함 영문자 6자리 이상으로 해주세요.';
			}else if(pw !== pw_confirm){
				this.signUpMessage = '비밀번호가 일치하지 않습니다.';
			} else if(nickname.length==0){
				this.signUpMessage = '사용할 닉네임을 입력해주세요!';
			} else if(nickname.length>20){
				this.signUpMessage = '닉네임은 20자 이하로 입력해주세요!';
			} else{
				$.post("/sign-up" ,{email:email , pw:pw, pw_confirm:pw_confirm , nickname:nickname} ,function(result){
					if(result['result']=='duplicate'){
						vm.signUpMessage = '이미 사용중인 email입니다. 다른 Email을 사용해 주세요';
					} else if(result['result']=='success'){
						firebase.auth().signInWithEmailAndPassword(email, pw).catch(function(error) {
							vm.signUpMessage = '내부 서버 오류입니다. 잠시후에 로그인 해주세요';
						});
					}
				}).fail(function(){
					this.signUpMessage = '내부 서버 오류입니다. 잠시후에 로그인 해주세요';
				});
			}
		},
		popupSignup:function(e){
			var vm = this;
			$.magnificPopup.close();
            e.stopPropagation();
			$.magnificPopup.open({
				items:{
					src:'#signup'
				},
				type:'inline',
			    midClick: true,
			    mainClass: 'mfp-fade',
			    closeOnBgClick:false,
			    callbacks:{
			    	close:function(){
			    		vm.signUpEmailInput='';
			    		vm.signUpPwInput='';
			    		vm.signUpPwConfirmInput='';
			    		vm.signUpNicknameInput='';
			    		vm.signUpMessage='';
			    	}
			    }
			});
		},
		login:function(){
			var vm = this;
			var email = this.loginEmailInput.trim();
			var pw = this.loginPwInput.trim();
			firebase.auth().signInWithEmailAndPassword(email, pw).then((user) => {
		        if (user) {
		        	$.magnificPopup.close();
			     	this.user = user
				}
			}).catch(function(error) {
				if(error.code='auth/wrong-password'){
					vm.loginMessage='이메일이나 비밀번호가 틀렸습니다.';
				}else{
					vm.loginMessage='내부 서버 오류입니다 잠시후에 사용해주세요';
				}
			});
		},
		cart:function(){
			var vm = this;
			this.user.getIdToken(true).then(function(idToken) {
					location.href="/cart?token="+idToken;
				}).catch(function(error) {
					alert("내부 서버 오류입니다. 잠시후에 다시 시도 해 주세요!");
				});
		},
		popAnony:function(){
			var vm = this;
			$.magnificPopup.open({
				items:{
					src:'#anonycart'
				},
				type:'inline',
			    midClick: true,
			    mainClass: 'mfp-fade',
			    closeOnBgClick:true,
			    callbacks:{
			    	close:function(){
			    		vm.anonyEmail='',
			    		vm.anonyPw=''
			    	}
			    }
			});
		},
		anonyCart:function(e){
			var emailRegExp = /([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
			if(!emailRegExp.test(this.anonyEmail)){
				alert("올바른 이메일을 적어주세요!");
			}else if((this.anonyPw.trim()).length==0){
				alert("비밀번호를 입력해 주세요!");
			} else{
				location.href="/cart/anony_cart?email="+this.anonyEmail+"&pw="+this.anonyPw
			}
		}