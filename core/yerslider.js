/*
 * yerSlider
 * A javascript object for slided content
 *
 * Copyright (c) 2013 Johann Heyne
 *
 * Version 1
 * Update 2013-05-17
 *
 * Minimum requirements: jQuery v1.6+
 *
 * Terms of use:
 * yerslider is licensed under the MIT License.
 *
 */

var yerSlider = {
    
    param: {
        slidegap: 0,
        slidegroupresp: {},
        slidegroup: 1,
        sliderid: '.yerslider',
        sliderwrapclass: '.yerslider-wrap',
        slidermaskclass: '.yerslider-mask',
        sliderclass: '.yerslider-slider',
        slideclass: '.yerslider-slide',
        bulletswrapclass: '.yerslider-bullets-wrap',
        bulletclass: '.yerslider-bullet',
        bulletcurrentclass: '.yerslider-bullet-current',
        bulletclickable: true,
        nextbtn: true,
        prevbtn: true,
        nextclass: '.yerslider-next',
        prevclass: '.yerslider-prev',
        nextinactiveclass: '.yerslider-next-inactive',
        previnactiveclass: '.yerslider-prev-inactive',
        animationspeed: 1000,
        bullets: false,
        loop: 'none', /* appending, rollback, from-first */
        swipe: false
    },
    
    status: {
        slidegroupmax: 1,
        currentslideindex: 0,
        slidecount: 0,
        slidermaskwidth: 0,
        slidewidth: 0,
        isanimating: false,
        nextbtnclickable: false,
        prevbtnclickable: false,
        bulletscount: 0,
        bulletscountcache: 0,
        bulletcurrent: 0,
        bulletschanged: false,
        slidingleft: false,
        slidingright: false,
        resizing: false,
        cssanimation: false
    },
    
    obj: {
        sliderid: undefined,
        sliderwrap: undefined,
        slider: undefined,
        slide: undefined,
        bulletswrap: undefined,
        bullets: undefined,
        prevbtn: undefined,
        nextbtn: undefined
    },
    
    init: function ( p ) {
        
        /* get default parameters */
        
        this.param = this.helper.setDefaultParam({
            p: p,
            d: this.param
        });
        
        
        /* css animation */
        
        if ( jQuery('html').hasClass('csstransforms3d csstransitions') ) {
        
            this.status.cssanimation = true;
        };
        
        
        /* define slider objects */
        
        this.obj.sliderid = jQuery( this.param.sliderid );
        this.obj.sliderwrap = jQuery( this.param.sliderwrapclass );
        this.obj.slidermask = jQuery( this.param.slidermaskclass );
        this.obj.slider = jQuery( this.param.sliderclass );
        this.obj.slide = jQuery( this.param.slideclass );
        
        /* layout slider */
        
        this.obj.sliderwrap.css({
            position: 'relative',
            width: '100%'
        });
        
        this.obj.slidermask.css({
            position: 'relative',
            width: '100%',
            overflow: 'hidden'
        });
        
        /* remember font-size and line-height for the slides because
        the font-size and line-height of the slider needs to be zero */
        
        var obj_slide_css = [];
            
            obj_slide_css.fontsize = this.obj.slide.css('font-size');
            obj_slide_css.lineheight = this.obj.slide.css('line-height');
        
        this.obj.slider.css({
            'white-space': 'nowrap',
            position: 'relative',
            'list-style-type': 'none',
            padding: 0,
            margin: 0,
            'line-height': 0,
            'font-size': 0
        });
        
        this.obj.slide.css({
            display: 'inline-block',
            'vertical-align': 'top',
            'white-space': 'normal',
            'font-size': obj_slide_css.fontsize,
            'line-height': obj_slide_css.lineheight
        });
        
        this.set_slidermaskwidth();
        this.set_slidecount();
        this.set_slidegroup();
        this.set_slidegroupmax();
        this.clon_slides();
        this.set_slidewidth();
        this.set_prevnext();
        if ( this.param.bullets ) {
            this.bullets();
        }
        
        if ( this.param.swipe ) {
        
            this.touch_swipe();
        }
        
        window.onresize = function(event) {
            
            yerSlider.status.resizing = true;
            
            yerSlider.set_slidermaskwidth();
            yerSlider.set_slidegroup();
            yerSlider.set_slidewidth();
            yerSlider.proof_slider_current_index();
            yerSlider.move_slider_to_current_index();
            yerSlider.set_prevnext();
            
            if ( yerSlider.param.bullets ) {
            
                yerSlider.bullets();
            }
            
            if ( yerSlider.status.cssanimation ) {
            
                yerSlider.status.currentslideindex = 0;
                yerSlider.animate_slider_to_current_position();
            }
            
            yerSlider.status.resizing = false;
        };
    },
    
    
    /* touch swipe */
    
    touch_swipe: function () {

        var slide_with_default = ( this.status.slidewidth + this.param.slidegap ) * this.param.slidegroup,
    		slide_with = slide_with_default,
    		current_slide = 0,
    		max_slides = Math.ceil( this.status.slidecount / this.param.slidegroup ),
    		speed = this.param.animationspeed,
    		slides = this.obj.slide;
        

		// init touch swipe
		slides.swipe( {
			triggerOnTouchEnd: true,
			swipeStatus: swipeStatus,
			allowPageScroll: 'vertical'
		});

		/**
		* Catch each phase of the swipe.
		* move : we drag the div.
		* cancel : we animate back to where we were
		* end : we animate to the next image
		*/
		function swipeStatus(event, phase, direction, distance, fingers) {
		
			//If we are moving before swipe, and we are going L or R, then manually drag the images
			
			if ( phase === 'move' && ( direction === 'left' || direction === 'right' ) ) {
				
				var duration =  0;

				if ( direction === 'left' ) {
				
					scrollImages( ( slide_with * current_slide ) + distance, duration );
                }
				else if ( direction === 'right' ) {
				
					scrollImages( ( slide_with * current_slide ) - distance, duration );
				}
			}


			//Else, cancel means snap back to the begining
			
			else if ( phase === 'cancel' ) {
			
				scrollImages( slide_with * current_slide, speed);
			}


			//Else end means the swipe was completed, so move to the next image
			
			else if ( phase === 'end' )
			{
				if ( direction == 'right' ) {
				
					previousImage();
				}
				else if ( direction === 'left' ) {
				
					nextImage();
				}
			}
		}

		function previousImage() {
		
			current_slide = Math.max( current_slide - 1, 0 );
			scrollImages( slide_with * current_slide, speed );
			
            yerSlider.prev_slide();
            yerSlider.refresh_prevnext();
            
            if ( yerSlider.param.bullets ) {

                yerSlider.set_bullet_current();
                yerSlider.set_bullet_current_class();
            }
		}

		function nextImage() {
		
			current_slide = Math.min( current_slide + 1, max_slides - 1 );
			scrollImages( slide_with * current_slide, speed );
			
            yerSlider.next_slide();
            yerSlider.refresh_prevnext();
            
            if ( yerSlider.param.bullets ) {

                yerSlider.set_bullet_current();
                yerSlider.set_bullet_current_class();
            }
		}

		/**
		 * Manually update the position of the slides on drag
		 */
		function scrollImages( distance, duration ) {
		
			slides.css('-webkit-transition-duration', ( duration / 1000 ).toFixed(1) + 's' );

			//inverse the number we set in the css
			var value = ( distance < 0 ? '' : '-' ) + Math.abs(distance).toString();

			slides.css( '-webkit-transform', 'translate3d('+value +'px,0px,0px)' );
		}
    },
    
    
    /* setup */
    
    set_slidermaskwidth: function () {
        
        if ( this.param.insidetablecellfix ) {
            this.obj.slider.hide();
            this.obj.slidermask.css('width','100%');
        }
        
        this.status.slidermaskwidth = this.obj.slidermask.innerWidth();
        
        if ( this.param.insidetablecellfix ) {
            this.obj.slidermask.css('width',this.obj.slidermask.width() + 'px');
            this.obj.slider.show();
        }
    },
    
    set_slidecount: function () {
        
        this.status.slidecount = this.obj.slide.size();
    },
    
    set_slidegroup: function () {
        
        var slidermaskwidth = this.obj.slidermask.innerWidth();
        
        var temp = this.param.slidegroup;
        
        if ( this.helper.getLength( this.param.slidegroupresp ) > 0 ) {
            
            for ( var i in this.param.slidegroupresp ) {
        
                if ( i <= this.status.slidermaskwidth ) {
            
                    temp = this.param.slidegroupresp[ i ];
                }
            }
        }
        
        if ( temp >= this.status.slidecount ) {
        
            temp = this.status.slidecount;
            this.status.currentslideindex = 0;
            this.move_slider_to_current_index();
        }
        
        this.param.slidegroup = temp;
    },
    
    set_slidegroupmax: function () {
        
        for ( var i in this.param.slidegroupresp ) {
            if ( this.status.slidegroupmax < this.param.slidegroupresp[ i ] ) {
                this.status.slidegroupmax = this.param.slidegroupresp[ i ];
            }
        }
    },
    
    set_slidewidth: function () {
        
        /*
            the slide width should be
            sliderwrap.width - ( slidegap * ( slidegroup - 1 ) / slidegroup ) %
        */
        
        this.status.slidewidth = Math.floor( ( this.status.slidermaskwidth - ( this.param.slidegap * ( this.param.slidegroup - 1 ) ) ) / this.param.slidegroup );
        
        var diff = this.status.slidermaskwidth - ( ( this.status.slidewidth * this.param.slidegroup ) + ( this.param.slidegap * ( this.param.slidegroup - 1 ) ) );
        
        this.obj.slide
            .width( this.status.slidewidth )
            .css( 'margin-right', this.param.slidegap + 'px' )
            .last().css( 'margin-right', '0' );
        
        
        /* streching the width of some slides by 1 pixel to fit the sliderwrapwidth */
        
        if ( diff > 0 ) {
            
            for ( var i = 0; i < diff; i++ ) {
                jQuery( this.param.slideclass + ':nth-child(' + ( 1 + i )  + 'n-' + (this.param.slidegroup - 1) + ')' ).css( 'margin-right', ( this.param.slidegap + 1 ) + 'px' );
                
            }
        }
    },
    
    
    /* prev next */
    
    set_prevnext: function () {
        
        
        /* init */
        if ( this.status.slidecount > this.param.slidegroup ) {
        
            if ( typeof this.obj.nextbtn !== 'object' && this.param.nextbtn ) {
                this.obj.sliderwrap.append('<div class="js-yerslider-next yerslider-prevnext ' + this.param.nextclass.replace( '.', '' ) + '">');
                this.obj.nextbtn = jQuery( this.param.nextclass );
            }
        
            if ( typeof this.obj.prevbtn !== 'object' && this.param.prevbtn ) {
                this.obj.sliderwrap.append('<div class="js-yerslider-prev yerslider-prevnext ' + this.param.prevclass.replace( '.', '' ) + '">');
                this.obj.prevbtn = jQuery( this.param.prevclass );
            }
            
            this.refresh_prevnext();
        }
        
        /* remove */
        else {
        
            if ( typeof this.obj.nextbtn === 'object' ) {
                this.obj.nextbtn.remove();
                this.obj.nextbtn = undefined;
                this.status.nextbtnclickable = false;
            }
            if ( typeof this.obj.prevbtn === 'object' ) {
                this.obj.prevbtn.remove();
                this.obj.prevbtn = undefined;
                this.status.prevbtnclickable = false;
            }
        }
        
    },
    
    next_slide: function () {
        
        this.status.currentslideindex = this.status.currentslideindex + this.param.slidegroup;
        
        /* loop-none */
        
        if ( this.param.loop === 'none' && this.status.currentslideindex >= this.status.slidecount - this.param.slidegroup ) {
           
            this.status.currentslideindex = this.status.slidecount - this.param.slidegroup;
            
            this.nextbtn_click_unbind();
        }
        
        
        /* loop-appending */
        
        if ( this.param.loop === 'appending' && this.status.currentslideindex > this.status.slidecount - 1 + this.param.slidegroup ) {
           
           var temp = this.status.currentslideindex - this.status.slidecount;
            
            this.status.currentslideindex = this.status.currentslideindex - this.status.slidecount - this.param.slidegroup;
            
            this.move_slider_to_current_index();
            
            this.status.currentslideindex = temp;
        }
        
        
        /* loop-rollback */
        
        
        
        /* loop-from-first */
        
        
        
        this.obj.slide.removeClass('current');
        jQuery( this.obj.slide[ this.status.currentslideindex ] ).addClass('current');
    },
    
    prev_slide: function () {
        
        this.status.currentslideindex = this.status.currentslideindex - this.param.slidegroup;
        
        /* loop-none */
        
        if ( this.param.loop === 'none' && this.status.currentslideindex <= 0 ) {
           
            this.status.currentslideindex = 0;
            
            this.prevbtn_click_unbind();
        }
        
        
        /* loop-appending */
        
        if ( this.param.loop === 'appending' && this.status.currentslideindex < 0 ) {
            
            var temp = this.status.slidecount + this.status.currentslideindex;
            
            this.status.currentslideindex = this.status.currentslideindex + this.status.slidecount + this.param.slidegroup;
            
            this.move_slider_to_current_index();
            
            this.status.currentslideindex = temp;
        }
        
        
        /* loop-rollback */
        
        
        
        /* loop-from-first */
        
        
        
        this.obj.slide.removeClass('current');
        jQuery( this.obj.slide[ this.status.currentslideindex ] ).addClass('current');
    },
    
    nextbtn_click: function () {
        
        if ( !yerSlider.status.nextbtnclickable ) {
        
            this.obj.nextbtn.on( 'click', function () {
        
                if ( !yerSlider.status.isanimating ) {
        
                    yerSlider.status.isanimating = true;
                    yerSlider.status.slidingright = true;
                
                    yerSlider.next_slide();
                    yerSlider.animate_slider_to_current_position();
            
                    yerSlider.refresh_prevnext();
            
                    if ( yerSlider.param.bullets ) {

                        yerSlider.set_bullet_current();
                        yerSlider.set_bullet_current_class();
                    }
                
                    yerSlider.status.slidingright = false;
                }
            });
        
            yerSlider.status.nextbtnclickable = true;
        }
    },
    
    prevbtn_click: function () {
        
        if ( !yerSlider.status.prevbtnclickable ) {
        
            this.obj.prevbtn.on( 'click', function () {
        
                if ( !yerSlider.status.isanimating ) {
            
                    yerSlider.status.isanimating = true;
                    yerSlider.status.slidingleft = true;
                
                    yerSlider.prev_slide();
                    yerSlider.animate_slider_to_current_position();
            
                    yerSlider.refresh_prevnext();
            
                    if ( yerSlider.param.bullets ) {

                        yerSlider.set_bullet_current();
                        yerSlider.set_bullet_current_class();
                    }
                
                    yerSlider.status.slidingleft = false;
                }
            });
            
            yerSlider.status.prevbtnclickable = true;
        }
        
    },
    
    nextbtn_click_unbind: function () {
                
        this.obj.nextbtn.unbind( 'click' )
            .addClass( this.param.nextinactiveclass.replace( '.', '' ) );
        
        this.status.nextbtnclickable = false;
    },
    
    prevbtn_click_unbind: function () {

        this.obj.prevbtn.unbind( 'click' )
            .addClass( this.param.previnactiveclass.replace( '.', '' ) );
        
        this.status.prevbtnclickable = false;
    },
    
    refresh_prevnext: function () {
        
        /* bind click events if unbinded in general */
        
        if ( !this.status.nextbtnclickable ) this.nextbtn_click();
        if ( !this.status.prevbtnclickable ) this.prevbtn_click();
        
        
        /* remove inactive classes in general */
        
        this.obj.nextbtn.removeClass( this.param.nextinactiveclass.replace( '.', '' ) );
        this.obj.prevbtn.removeClass( this.param.previnactiveclass.replace( '.', '' ) );
        
        
        /* then unbind in some kind of slider situation */
        
        if ( this.param.loop === 'none' ) {
            
            if ( this.status.currentslideindex >= this.status.slidecount - this.param.slidegroup ) {
            
                this.nextbtn_click_unbind();
            }
        
            if ( this.status.currentslideindex <= 0 ) {

                this.prevbtn_click_unbind();
            }
        }  
    },
    
    
    /* bullets */
    
    bullets: function () {
          
        if ( this.param.bullets ) {
        
            /* do bullets-wrap html and object */
        
            if ( typeof this.obj.bulletswrap !== 'object' ) {
        
                this.obj.sliderwrap.append('<div class="' + this.param.bulletswrapclass.replace( '.', '' ) + '"></div>');
                this.obj.bulletswrap = this.obj.sliderwrap.find( this.param.bulletswrapclass );
            }
        
        
            /* get amount of bullets */
        
            this.status.bulletscount = Math.ceil( this.status.slidecount / this.param.slidegroup );
            
            
            /* current bullet index */
            
            this.set_bullet_current();
            
            
            /* bullet items */
            
            this.bullet_items();
            
            
            /* bullet current class */
            
            this.set_bullet_current_class();
            
            
            /* bullets click */
            
            this.bullet_click();
        }
    },
    
    bullet_items: function () {
          
        /* do bullets html and object */

        if ( this.status.bulletscountcache !== this.status.bulletscount ) {
            
            var bullets = '';
        
            for ( var i = 1; i <= this.status.bulletscount; i++ ) {
            
                bullets += '<div class="' + this.param.bulletclass.replace( '.', '' ) + '" data-index="' + i + '"></div>';
            }
        
            this.obj.bulletswrap.empty();
        
            if ( this.status.bulletscount > 1 ) {
            
                this.obj.bulletswrap.append( bullets );
            }
        
            this.status.bulletscountcache = this.status.bulletscount;
        }
        
        this.obj.bullets = this.obj.bulletswrap.find( this.param.bulletclass );
        
        this.set_bullet_current_class();
    },
    
    set_bullet_current: function () {
        
        var currentslideindex = this.status.currentslideindex;

        /* translate clone current slide index into original index */

        if ( currentslideindex + 1 > this.status.slidecount ) {

            currentslideindex = currentslideindex - this.status.slidecount;
        }


        /* current bullet index */

        if ( this.param.loop === 'none' ) {
            
            this.status.bulletcurrent = Math.ceil( currentslideindex / this.param.slidegroup ) + 1;
        }
        else {
            
            this.status.bulletcurrent = Math.round( currentslideindex / this.param.slidegroup ) + 1;
            
            if ( this.status.bulletcurrent > this.status.bulletscount ) {
                
                this.status.bulletcurrent = this.status.bulletscount;
            }
        }
    },
    
    set_bullet_current_class: function () {
        
        /* current bullet class */
        
        this.obj.bullets.removeClass( this.param.bulletcurrentclass.replace( '.', '' ) );
        
        this.obj.bulletswrap.find('[data-index="' + this.status.bulletcurrent + '"]').addClass( this.param.bulletcurrentclass.replace( '.', '' ) );
    },
    
    bullet_click: function () {
    
        this.obj.bullets.on( 'click', function () {
            
            
            if ( !yerSlider.status.isanimating ) {
                
                yerSlider.status.isanimating = true;
                
                var currentbullet = jQuery(this).data('index');
                
                yerSlider.status.currentslideindex = ( currentbullet - 1 ) * yerSlider.param.slidegroup;
                
                yerSlider.proof_slider_current_index();
                
                yerSlider.animate_slider_to_current_position();
                
                if ( !yerSlider.status.prevbtnclickable ) {
                    
                    yerSlider.prevbtn_click();
                }
            }
            
            
            /* bullets */
            
            if ( yerSlider.param.bullets ) {
            
                yerSlider.set_bullet_current();
                yerSlider.set_bullet_current_class();
            }
            
            
            /* prev next buttons */
            
            yerSlider.refresh_prevnext();
        });
    },
    
    
    /* animation */
    
    move_slider_to_current_index: function () {
        yerSlider.obj.slider.css({
            'margin-left': '-' + yerSlider.get_sliderposition() + 'px'
        });
    },
    
    animate_slider_to_current_position: function () {
        
        if ( this.status.cssanimation ) {
        
            yerSlider.animate_slider_to_current_position_css();
        }
        else {
        
            yerSlider.animate_slider_to_current_position_js();
        }
    },
    
    animate_slider_to_current_position_js: function () {
        
        yerSlider.obj.slider.animate({
            'margin-left': '-' + yerSlider.get_sliderposition() + 'px'
        }, yerSlider.param.animationspeed, function () {
           yerSlider.status.isanimating = false;
        });
        
    },
    
    animate_slider_to_current_position_css: function() {
        
        var sliderposition = yerSlider.get_sliderposition() * -1,
            transform = 'translate3d(' + sliderposition.toString() + 'px,0px,0px)',
            duration = ( ( yerSlider.param.animationspeed / 1000 ).toFixed(1) + 's' );
            
        yerSlider.obj.slider.css({
            '-webkit-transition-duration': duration,
            '-ms-transition-duration': duration,
            '-o-transition-duration': duration,
            '-moz-transition-duration': duration,
            'transition-duration': duration
        });
        
        yerSlider.obj.slider.css({
            '-webkit-transform': transform,
            '-ms-transform': transform,
            '-o-transform': transform,
            '-moz-transform': transform,
            'transform': transform
        });
        
        yerSlider.status.isanimating = false;
    },
    
    
    /* misc */
    
    clon_slides: function () {
        
        var index = 0;
        
        for (var i = 0; i < this.status.slidegroupmax * 2; i++) {
            
            if ( index > this.status.slidecount ) {
                index = 0;
            }
            
            this.obj.slider.append( jQuery( this.obj.slide[ index ] ).clone() );
            
            index++;
        }
        
        this.obj.slide = jQuery( this.param.slideclass );
    },
    
    get_sliderposition: function () {

        //var pos = ( parseInt( yerSlider.status.currentslideindex * yerSlider.status.slidewidth, 10 ) + parseInt( yerSlider.param.slidegap * yerSlider.status.currentslideindex, 10 ) );
        var pos = jQuery( this.obj.slide[ yerSlider.status.currentslideindex ] ).position().left;
        return pos;
    },
    
    proof_slider_current_index: function () {
        
        if ( this.status.slidecount - this.param.slidegroup > 0 && this.status.currentslideindex >= this.status.slidecount - this.param.slidegroup ) {
           
            this.status.currentslideindex = this.status.slidecount - this.param.slidegroup;
            
            this.nextbtn_click_unbind();
        }
    },
    
    
    /* helper */
    
    helper: {
        
        getLength:  function( o ) {

            var len = o.length ? --o.length : -1;

            for (var k in o) {
                len++;
            }

            return len;
        },
        
        setDefaultParam: function ( p ) {

            if ( typeof p === 'undefined' ) {
                p = {};
            }
            
            if ( typeof p.p === 'undefined' ) {
                p.p = {};
            }
            
            if ( typeof p.d === 'undefined' ) {
                p.d = {};
            }

            var r = p.p;

            for( var i in p.d ) {

                if ( typeof p.d[ i ] !== 'undefined' && typeof r[ i ] !== typeof p.d[ i ] ) {
                    r[ i ] = p.d[ i ];
                }
                else {
                
                    if ( typeof p.d[ i ] !== 'undefined' && yerSlider.helper.getLength( r[ i ] ) !== yerSlider.helper.getLength( p.d[ i ] ) ) {
                        r[ i ] = yerSlider.helper.setDefaultParam({ p: r[ i ], d: p.d[ i ] });
                    }
                }
            }

            return r;
        }
    }
};