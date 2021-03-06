$(document).ready(function(){
	
	var camera = $('#camera'),
		photos = $('#photos'),
		screen =  $('#screen');

	var template = '<div class="pic" style="background: url(uploads/thumbs/{src})"><span rel="cam" '
		+'"></span></div>';

	/*----------------------------------
		Setting up the web camera
	----------------------------------*/


	webcam.set_swf_url('assets/webcam/webcam.swf');
	webcam.set_api_url('upload.inc.php');	// The upload script
	webcam.set_quality(100);				// JPEG Photo Quality
	webcam.set_shutter_sound(true, 'assets/webcam/shutter.mp3');

	// Generating the embed code and adding it to the page:	
	screen.html(
		webcam.get_html(screen.width(), screen.height())
	);


	/*----------------------------------
		Binding event listeners
	----------------------------------*/


	var shootEnabled = false;
		
	/*$('#shootButton').click(function(){
		if(!shootEnabled){
			return false;
		}
		webcam.freeze();
		togglePane();
		return false;
	});*/

	/*$('#shootButton').click(function(){
	    for(var x=0; x<3; x++){
	        setTimeout(function(){
	        	webcam.freeze();
	        	togglePane();
	            webcam.upload();
	            webcam.reset();
	        },2000);
	    }
	    return false;
	});*/
	var y = 3;
	var x = 0;

	
	
	function photoShoot(x){
		if(x<8){
			var words = new Array("neutral", "hate", "joy", "disgust", "sadness", "fear", "surprise", "pain");
			$('.word').html(words[x]+" <span>"+(x+1)+" / 8</span>");
			y = 3;
		
			
			var timer = setInterval(function(){
				$('.timerCount').html(y);
				y--;
				if(y<0){
					y = 3;
					pewpew(x, y);
					window.clearInterval(timer);
				} 
			}, 1000);
		} else {
			$('#camera').fadeOut(300,function(){
				$(this).css({
					'opacity':'0',
					'display':'none'
				});
				summary();
			});
			x = 0;
			y = 0;	
		}
	};
	function pewpew(x){
		if(!shootEnabled){
			return false;
		}
		webcam.freeze();
		togglePane();
		setTimeout(function(){
			webcam.upload();
			webcam.reset();
			togglePane();
			setTimeout(function(){
				x++;
				photoShoot(x);
			},300);
		},500);	
	}

	function summary(){
		$.ajax({
		   url: 'photoSummary.inc.php',
		   cache: false,
		   success: function(html){
		      $('.summaryPhotoContainer').html(html);
		   },
		   error: function(XMLHttpRequest, textStatus, errorThrown){
		      alert(textStatus);
		   }
		});

		$('.photoSummary').hide().queue(function(){
			$(this).css({
				'display':'block',
				'opacity':'1'
			});
			$('.photoSummary h2').fadeIn(200,function(){
				$('.summaryPhotoContainer').fadeIn(200);
			});
		});

	}


	$('#shootButton').click(function(){
		$(this).fadeOut();
		$('.word').html("neutral <span>1 / 8</span>").fadeIn();
		$('.timer').fadeIn();
		$('.timerCount').html(3);
		photoShoot(0);
	});







	
	$('#cancelButton').click(function(){
		webcam.reset();
		togglePane();
		return false;
	});
	
	$('#uploadButton').click(function(){
		webcam.upload();
		webcam.reset();
		togglePane();
		return false;
	});


	camera.find('.settings').click(function(){
		if(!shootEnabled){
			return false;
		}
		
		webcam.configure('camera');
	});

	// Showing and hiding the camera panel:
	
	var shown = false;
	$('.camTop').click(function(){
		
		$('.tooltip').fadeOut('fast');
		
		if(shown){
			camera.animate({
				bottom:-466
			});
		}
		else {
			camera.animate({
				bottom:-5
			},{easing:'easeOutExpo',duration:'slow'});
		}
		
		shown = !shown;
	});

	$('.tooltip').mouseenter(function(){
		$(this).fadeOut('fast');
	});


	/*---------------------- 
		Callbacks
	----------------------*/
	
	
	webcam.set_hook('onLoad',function(){
		// When the flash loads, enable
		// the Shoot and settings buttons:
		shootEnabled = true;
	});
	
	webcam.set_hook('onComplete', function(msg){
		
		// This response is returned by upload.inc.php
		// and it holds the name of the image in a
		// JSON object format:
		
		msg = $.parseJSON(msg);
		
		if(msg.error){
			alert(msg.message);
		}
		else {
			// Adding it to the page;
			photos.prepend(templateReplace(template,{src:msg.filename}));
			initFancyBox();
		}
	});
	
	webcam.set_hook('onError',function(e){
		screen.html(e);
	});
	
	
	/*-------------------------------------
		Populating the page with images
	-------------------------------------*/
	
	/*var start = '';
	
	function loadPics(){
	
		if(this != window){
			if($(this).html() == 'Loading..'){
				// Preventing more than one click
				return false;
			}
			$(this).html('Loading..');
		}
		

		$.getJSON('browse.inc.php',{'start':start},function(r){
			
			photos.find('a').show();
			var loadMore = $('#loadMore').detach();
			
			if(!loadMore.length){
				loadMore = $('<span>',{
					id			: 'loadMore',
					html		: 'Load More',
					click		: loadPics
				});
			}
			
			$.each(r.files,function(i,filename){
				photos.append(templateReplace(template,{src:filename}));
			});

			if(r.nextStart){

				
				start = r.nextStart;
				photos.find('a:last').hide();
				photos.append(loadMore.html('Load More'));
			}
			
		});
		
		return false;
	}*/

	
	/*loadPics();*/
	

	/*----------------------
		Helper functions
	------------------------*/


	// This function toggles the two
	// .buttonPane divs into visibility:
	
	function togglePane(){
		var visible = $('#camera .buttonPane:visible:first');
		var hidden = $('#camera .buttonPane:hidden:first');


		visible.fadeOut('fast',function(){
			hidden.show();
		});
	}
	
	
	// Helper function for replacing "{KEYWORD}" with
	// the respectful values of an object:
	
	function templateReplace(template,data){
		return template.replace(/{([^}]+)}/g,function(match,group){
			return data[group.toLowerCase()];
		});
	}
});
