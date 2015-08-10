;(function($) {

	var Carousel = function(poster) {
		//console.log(poster.attr("data-setting"));

		var self = this;

		//保存单个旋转木马对象
		this.poster = poster;

		this.posterItemMain = poster.find("ul.poster-list");
		this.nextBtn = poster.find("div.poster-next-btn");
		this.prevBtn = poster.find("div.poster-prev-btn");
		this.posterItems = poster.find('li.poster-item');
		if(this.posterItems.size()/2==0) {
			this.posterItemMain.append(this.posterItems.eq(0).clone());
			this.posterItems = this.posterItemMain.children();
		}
		this.posterFirstItem = this.posterItems.eq(0);
		this.posterLastItem = this.posterItems.last();
		this.rotateFlag = true;

		//配置默认参数
		this.setting = {
			"width":1000,//幻灯片宽度
			"height":351,//幻灯片高度
			"posterWidth":800,//幻灯片第一张宽度
			"posterHeight":351,//幻灯片第一张高度
			"scale":0.9,
			"speed":500,
			"autoplay":false,
			"delay":2000,
			"verticalAlign":"middle"
		};

		$.extend(this.setting,this.getSetting());

		this.setSettingValue();
		this.setPosterPos();

		this.nextBtn.click(function() {
			if(self.rotateFlag) {
				self.rotateFlag = false;
				self.carouseRotate("left");
			}
			//self.bookAnimation();
		});

		this.posterItems.each(function() {
			var li = $(this);
			li.click(function() { 
				var index = li.css('zIndex');
				if(index==2) {

				} else {
					if(self.rotateFlag) {
					self.rotateFlag = false;
					self.carouseRotate("right");
				}
				}
			});
		});

		this.prevBtn.click(function() {
			if(self.rotateFlag) {
				self.rotateFlag = false;
				self.carouseRotate("right");
			}
			//self.bookAnimation();
		});

		//是否播放自动播放
		if(this.setting.autoplay) {
			this.autoPlay();
			this.poster.hover(function() {
				window.clearInterval(self.timer);
			}, function() {
				self.autoPlay();
			});
		}
		
		//console.log(this.setting);
	}

	Carousel.prototype = {

		autoPlay:function() {
			var self = this;
			this.timer = window.setInterval(function() {
				self.nextBtn.click();
			},this.setting.delay);
		},

		//设置剩余广告的位置关系
		setPosterPos:function() {
			var self = this;
			//获取到除第一张外的其它li
			var sliceItems = this.posterItems.slice(1);
			var sliceSize = sliceItems.size()/2;

			//右边的个数
			var rightSlice = sliceItems.slice(0,sliceSize);
			var level = Math.floor(this.posterItems.size()/2);

			//左边
			var leftSlice = sliceItems.slice(sliceSize);

			var rw = this.setting.posterWidth;
			var rh = this.setting.posterHeight;
			var gap = ((this.setting.width-this.setting.posterWidth)/2)/level;

			var firstLeft = (this.setting.width-this.setting.posterWidth)/2;
			var fixOffsetLeft = firstLeft+rw;
			

			//设置右边帧的位置和宽度高度
			rightSlice.each(function(i) {
				level--;
				rw = rw*self.setting.scale;
				rh = rh*self.setting.scale;
				
				var j = i;

				$(this).css({
					zIndex:level,
					width:rw,
					height:rh,
					opacity:1/(++i),
					left:fixOffsetLeft+(++j)*gap-rw,
					top:self.setVerticalAlign(rh)
				});
			});

			//设置左边的
			var lw = rightSlice.last().width();
			var lh = rightSlice.last().height();
			var oloop = Math.floor(this.posterItems.size()/2);
			leftSlice.each(function(i) {
				$(this).css({
					zIndex:i,
					width:lw,
					height:lh,
					opacity:1/oloop,
					left:i*gap,
					top:self.setVerticalAlign(lh)
				});

				lw = lw/self.setting.scale;
				lh = lh/self.setting.scale;
				oloop--;
			})
		},

		//设置垂直排列方式
		setVerticalAlign:function(height) {
			var verticalType = this.setting.verticalAlign;
			var top = 0;
			if(verticalType==="middle"){
				top = (this.setting.height-height)/2;
			} else if(verticalType === "top") {
				top = 0;
			} else if(verticalType === "bottom") {
				top = this.setting.height-height;
			} else {
				top = (this.setting.height-height)/2;
			}

			return top;
		},

		//设置配置参数数值去控制基本的宽度高度
		setSettingValue:function() {

			this.poster.css({
				width:this.setting.width,
				height:this.setting.height
			});

			this.posterItemMain.css({
				width:this.setting.width,
				height:this.setting.height
			});

			//计算上下切换按钮的宽度
			var w = (this.setting.width-this.setting.posterWidth)/2;
			this.nextBtn.css({
				width:w,
				height:this.setting.height,
				zIndex:Math.ceil(this.posterItems.size()/2) 
			});
			this.prevBtn.css({
				width:w,
				height:this.setting.height,
				zIndex:Math.ceil(this.posterItems.size()/2)
			});
			this.posterFirstItem.css({
				width:this.setting.posterWidth,
				height:this.setting.posterHeight,
				left:w,
				zIndex:Math.floor(this.posterItems.size()/2)
			})
		},

		//获取人工配置的参数
		getSetting:function() {
			var setting = this.poster.attr("data-setting");

			//转换成json对象
			if(setting&&setting!="") {
				return $.parseJSON(setting);
			} else {
				return {};
			}
		},

		carouseRotate:function(dir) {
			var _this_ = this;

			var zIndexArr = [];

			if(dir === "left") {
				this.posterItems.each(function() {
					var self = $(this);

					var prev = self.prev().get(0)?self.prev():_this_.posterLastItem;
					var width = prev.width();
					var height = prev.height();
					var zIndex = prev.css("zIndex");
					var opacity = prev.css("opacity");
					var left = prev.css("left");
					var top = prev.css("top");
					zIndexArr.push(zIndex);

					self.animate({
						width:width,
						height:height,
						opacity:opacity,
						left:left,
						top:top
					},_this_.setting.speed,function() {
						_this_.rotateFlag = true;
					});
				});
				this.posterItems.each(function(i) {
					$(this).css("zIndex",zIndexArr[i]);
				});
			} else if (dir === "right") {
				this.posterItems.each(function() {
					var self = $(this);
					var next = self.next().get(0)?self.next():_this_.posterFirstItem;
					var width = next.width();
					var height = next.height();
					var zIndex = next.css("zIndex");
					var opacity = next.css("opacity");
					var left = next.css("left");
					var top = next.css("top");
					zIndexArr.push(zIndex);

					self.animate({
						width:width,
						height:height,
						//zIndex:zIndex,
						opacity:opacity,
						left:left,
						top:top
					},_this_.setting.speed,function() {
						_this_.rotateFlag = true;
					});
				});
				this.posterItems.each(function(i) {
					$(this).css("zIndex",zIndexArr[i]);
				});
			}
		}
	};

	//init用来初始化所有传进来的集合的
	Carousel.init = function(posters) {
		var _this = this;//用_this来保存Carousel
		posters.each(function() {
			new _this($(this));//new的是Carousel,这个里面的this就是posters里的每一个，并包装成jquery对象
		})
	}

	window["Carousel"] = Carousel;//全局注册，否则外面无法访问到
})(jQuery);
