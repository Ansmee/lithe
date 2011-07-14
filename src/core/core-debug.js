/**
 * calendar 
 * @author xiaojue[designsor@gmail.com]
 * @date 20110618
 */
(function(doc,w){
	/**
	 *���ȰѴ�����ɳ�Ϊ3�����֣�ͨ�ú��Ĳ��ֺͺ����������첽���أ��������¼���dom���Զ����¼��ȡ�
	 *�����������ܲ���
	 *Ԥ��������չ���� 
	 */
	
	/*my core*/
	
	var myCore={
		fn:{
			/*��װ���forѭ��*/
			each:function(o,callback){
				for(var i in o){
					if(callback){
						if( callback( i , o[i] ) == false) break;
					} 
				}
			},
			/*mix��Ϊ��ʼ��ֵ�ͼ򵥺ϲ��ã�֧��������͸���*/
			mix:function(o,s,cover,deep){
				var fn = this;
				fn.each(s,function(i,v){
					if(!deep){
						if(!o.hasOwnProperty(i) || cover) o[i]=v;
					}else{
						if(!o.hasOwnProperty(i) || cover){
							if((typeof(v)=="object") && (v instanceof Object)){
								fn.mix(o,v,cover,deep);
							}else{
								o[i]=v;
							}
						}
					}
				});
				return o;				
			},
			/*kissy extend*/
			extend:function(r, s, px, sx){
				var fn=this;
				
	            if (!s || !r) return r;
	
	            var create = Object.create ?
	                function(proto, c) {
	                    return Object.create(proto, {
	                        constructor: {
	                            value: c
	                        }
	                    });
	                } :
	                function (proto, c) {
	                    function F() {
	                    }
	
	                    F.prototype = proto;
	
	                    var o = new F();
	                    o.constructor = c;
	                    return o;
	                },
	                sp = s.prototype,
	                rp;
	
	            // add prototype chain
	            rp = create(sp, r);
	            r.prototype = myCore.fn.mix(rp, r.prototype);
	            r.superclass = create(sp, s);
	
	            // add prototype overrides
	            if (px) {
	                myCore.fn.mix(rp, px);
	            }
	
	            // add object overrides
	            if (sx) {
	                myCore.fn.mix(r, sx);
	            }
	
	            return r;
				
			},
			
			_Global_CustomEvent:{},
			
			customEvent:{
				fire:function(name,args){
					var map=myCore.fn._Global_CustomEvent;
					if(map.hasOwnProperty(name)) map[name](args);	
				},
				bind:function(name,fun,cover){
					var map=myCore.fn._Global_CustomEvent;
					if(!map.hasOwnProperty(name) || cover){
						map[name]=fun;
					}
				}
			}
		},
		DOM:{
			/**
			 * ֧������
			 * #id
			 * .class
			 * tag
			 */
			_findChild:function(parent,text){
				var that=myCore.DOM,
					indexid=text.indexOf('#'),
					id=text.slice(indexid+1),
					indexcls=text.indexOf('.'),
					cls=text.slice(indexcls+1),
					tag=text.slice(0,indexcls);
				//������ѡ����Ķ������
				if(indexid!=-1){
					//�����#ֱ�ӷ���
					return [doc.getElementById(id)];	
				}else if(indexcls!=-1 && indexcls!=0){
					//��cls���Һ���tag
					return that._getElementsByClassName(cls,parent,tag);	
				}else if(indexcls!=-1 && indexcls==0){
					//����cls�����ҽ���cls
					return that._getElementsByClassName(text.slice(1),parent);	
				}else{
					//ֻ����tag
					return Array.prototype.slice.call(parent.getElementsByTagName(text),0);	
				}
			},
			_getElementsByClassName:function(cls,parent,tag){
				var results=[];
				if(parent==null) parent=doc;
				if(!tag) tag='*';
				
				function likecls(s,o){
					var ary=o.split(' ');
					for(var i=0;i<ary.length;i++){
						if(s==ary[i]) return true;
					}
					return false;
				}
				var eles=parent.getElementsByTagName(tag);
				for(var i=0;i<eles.length;i++){
					if(eles[i].className==cls || likecls(cls,eles[i].className)){
						results.push(eles[i]);
					} 
				}
				return results;
			},
			_selector:function(selectors){
				var fn=myCore.fn,
					that=myCore.DOM,
					selectors=selectors,
					realselector='',
					order=[], //ѡ��������	
					result,
					results;	
							
				if(typeof(selectors)!='string') return null;
				
				//���Ȱ��տո����
				order=selectors.split(' ');
				
				//���ҵ�һ��id��ȷ�����е���߼�
				//���û��id����tag��
				//���û��tag����class
				for(var i=order.length-1;i>=0;i--){
					var selector=order[i].slice(0,1);
					if(selector=='#'){
						realselector+=' '+order[i];
						break;						
					}else{
						if(order[i].match(/#/)){
							realselector+=' '+order[i];
							break;	
						}else{
							realselector+=' '+order[i];
						}
					}
				}
				//ȷ����������,�ų���ID���
				order=realselector.slice(1).split(' ').reverse();
				
				if(order.length==1){
					//û�ո񣬵�ѡ���ֱ�ӷ���ֵ
					return that._findChild(doc,order[0]);
				}else{
					//����ո�ĵ���Ѱ��
					for(var i=0;i<order.length;i++){
						if(i==order.length-1) return results;
						
						result=that._findChild(doc,order[i]);
						
						results=[];
						
						for(var j=0;j<result.length;j++){
							results=results.concat(that._findChild(result[j],order[i+1]));
						}
					}
					return results;
				}	
			},
			query:function(selector){
				var that=myCore.DOM;
				if(doc.querySelectorAll) return doc.querySelectorAll(selector);	
				return that._selector(selector);
			},
			get:function(selector){
				var that=myCore.DOM;
				if(doc.querySelector) return doc.querySelector(selector);	
				var	result=that._selector(selector);
				if((typeof(result)=="object") && (result instanceof Array)) return result[0];
				return result;				
			}
		},
		Event:{
			/** 
			 * domready event
			 */
			_isReady:false,
			
			_doScrollCheck:function(){
				
			},
			_bindReady:function(){
				
			},
			DOMready:function(fun){
				var Event=this;
				if(Event._isReady){
					fun();
				}else{
					setTimeout(Event._bindReady,1);
				}; 
			}
		},
		Load:function(){
			
		}
	};
	
	/*calendar core*/
	
	var Calendar=function(){
		
	};
	
	Calendar.fn={
		
	}
	
	/*_selector test*/
	/*#abc.cc���ֲ�֧�� ֱ��дabc���� �����abc.cc����ƥ��ID*/
	window.onload=function(){
		var _$=myCore.DOM.query;
		console.log(_$('#abc'));
		console.log(_$('.abc'));
		console.log(_$('div'))
		console.log(_$('div#abc'));
		console.log(_$('div.abc'));
		console.log(_$('span'))
		console.log(_$('#abc .cc'));
		console.log(_$('#abc div'));
		console.log(_$('#abc #hh .cc'));
		console.log(_$('.abc #ab .cc span'));
		console.log(_$('.abc div.bb'));
		console.log(_$('div span .abc'));
	}
	
	
	/*mix test*/
	var a={};
	var b={a:1,d:{t:2,e:{ccc:2,a:3}}}
	var c=myCore.fn.mix(a,b);
	//console.log(c);
	
	/*extend test*/
	function test1(){
		this.test1='test1';	
	} 
	test1.prototype.echo=function(){ return this.test1;}
	
	function test2(){
		this.test2='test2';
	}
	test2.prototype.echo2=function(){return this.test2;}
	
	myCore.fn.extend(test2,test1,{
		newtest:1
	},{
		s:function(){
			console.log('s');
		}
	});
	
	/*
	test3=new test2();
	console.log(test3);
	console.log(test3.echo());
	console.log(test3.echo2());
	console.log(test3.newtest);		
	test2.s();
	*/
	
	/*custom event test*/
	function custom1(i,n){
		var T=setInterval(function(){
				i++;
				console.log(i);
				if(i==n) clearInterval(T);
				if(i==n-2)  myCore.fn.customEvent.fire('custom:test1',{T:T,index:i,obj:this});
			},1000);
	};
	
	myCore.fn.customEvent.bind('custom:test1',function(o){
		console.log('mycustom1:'+o.index);
		console.log(o.obj);
		clearInterval(o.T);
	});
	
	//console.log(myCore.fn._Global_CustomEvent)
	
	//custom1(0,10);
	
})(document,window);