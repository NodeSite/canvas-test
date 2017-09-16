! function() {
    "use strict";

    var hasDot = false, // 显示点
        hasRect = false, // 显示方格
        hasPic = true, // 显示图片
        count = 10; // 等分割数量

    var canvas = document.getElementById("cas");
    var ctx = canvas.getContext("2d");

    var dots = [];
    var dotscopy, idots;

    var img = new Image();
    img.src = "./img/test.jpg";
    img.onload = function() {
        var img_w = img.width / 2;
        var img_h = img.height / 2;
        var left = (canvas.width - img_w) / 2;
        var top = (canvas.height - img_h) / 2;

        img.width = img_w;
        img.height = img_h;

        window.dots = dots = [
            { x: left, y: top },
            { x: left + img_w, y: top },
            { x: left + img_w, y: top + img_h },
            { x: left, y: top + img_h }
        ];

        //保存一份不变的拷贝
        dotscopy = [
            { x: left, y: top },
            { x: left + img_w, y: top },
            { x: left + img_w, y: top + img_h },
            { x: left, y: top + img_h }
        ];

        //获得所有初始点坐标
        idots = rectsplit(count, dotscopy[0], dotscopy[1], dotscopy[2], dotscopy[3]);

        dots = [{ "x": 416, "y": 19 }, { "x": 953, "y": 471 }, { "x": 922, "y": 114 }, { "x": 30, "y": 749 }];
        render();
    };

    /**
     * 鼠标拖动事件绑定
     * @param e
     */
    window.onmousedown = function(e) {
        if (!dots.length) return;

        var area = getArea(e);
        var dot, i;
        //鼠标事件触发区域
        var qy = 40;

        for (i = 0; i < dots.length; i++) {
            dot = dots[i];
            if (area.t >= (dot.y - qy) && area.t <= (dot.y + qy) && area.l >= (dot.x - qy) && area.l <= (dot.x + qy)) {
                break;
            } else {
                dot = null;
            }
        }

        if (!dot) return;

        window.onmousemove = function(e) {
            var narea = getArea(e);
            var nx = narea.l - area.l;
            var ny = narea.t - area.t;

            dot.x += nx;
            dot.y += ny;

            area = narea;

            render();
        };

        window.onmouseup = function() {
            window.onmousemove = null;
            window.onmouseup = null;
        }
    };

    /**
     * 获取鼠标点击/移过的位置
     * @param e
     * @returns {{t: number, l: number}}
     */
    function getArea(e) {
        e = e || window.event;
        return {
            t: e.clientY - canvas.offsetTop + document.body.scrollTop + document.documentElement.scrollTop,
            l: e.clientX - canvas.offsetLeft + document.body.scrollLeft + document.documentElement.scrollLeft
        }
    }

    /**
     * 画布渲染
     */
    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        var ndots = rectsplit(count, dots[0], dots[1], dots[2], dots[3]);

        ndots.forEach(function(d, i) {
            //获取平行四边形的四个点
            var dot1 = ndots[i];
            var dot2 = ndots[i + 1];
            var dot3 = ndots[i + count + 2];
            var dot4 = ndots[i + count + 1];

            //获取初始平行四边形的四个点
            var idot1 = idots[i];
            var idot2 = idots[i + 1];
            var idot3 = idots[i + count + 2];
            var idot4 = idots[i + count + 1];

            if (dot2 && dot3 && i % (count + 1) < count) {
                //绘制三角形的下半部分
                renderImage(idot3, dot3, idot2, dot2, idot4, dot4);

                //绘制三角形的上半部分
                renderImage(idot1, dot1, idot2, dot2, idot4, dot4, true);
            }

            if (hasDot) {
                ctx.save();
                ctx.fillStyle = "red";
                ctx.fillRect(d.x - 1, d.y - 1, 2, 2);
                ctx.save();
            }
        });
    }

    /**
     * 计算矩阵，同时渲染图片
     * @param arg_1
     * @param _arg_1
     * @param arg_2
     * @param _arg_2
     * @param arg_3
     * @param _arg_3
     */
    function renderImage(arg_1, _arg_1, arg_2, _arg_2, arg_3, _arg_3, isUp) {
        ctx.save();
        //根据变换后的坐标创建剪切区域
        ctx.beginPath();
        var extend = 2
        if (isUp) { // 上半部分三角形
            ctx.moveTo(_arg_1.x - extend, _arg_1.y - extend);
            ctx.lineTo(_arg_2.x + extend, _arg_2.y - extend);
            ctx.lineTo(_arg_3.x + extend, _arg_3.y + extend);
        } else { // 下半部分三角形
            ctx.moveTo(_arg_1.x + extend, _arg_1.y + extend);
            ctx.lineTo(_arg_2.x + extend, _arg_2.y - extend);
            ctx.lineTo(_arg_3.x - extend, _arg_3.y - extend);
        }
        ctx.closePath();
        if (hasRect) {
            ctx.lineWidth = 2;
            ctx.strokeStyle = "red";
            ctx.stroke();
        }
        ctx.clip();

        if (hasPic) {
            //传入变换前后的点坐标，计算变换矩阵
            var result = matrix.getMatrix.apply(this, arguments);

            //变形
            ctx.transform(result.a, result.b, result.c, result.d, result.e, result.f);

            //绘制图片
            ctx.drawImage(img, idots[0].x, idots[0].y, img.width, img.height);
        }

        ctx.restore();
    }


    /**
     * 将abcd四边形分割成n的n次方份，获取n等分后的所有点坐标
     * @param n     多少等分
     * @param a     a点坐标
     * @param b     b点坐标
     * @param c     c点坐标
     * @param d     d点坐标
     * @returns {Array}
     */
    function rectsplit(n, a, b, c, d) {
        //ad向量方向n等分
        var ad_x = (d.x - a.x) / n;
        var ad_y = (d.y - a.y) / n;
        //bc向量方向n等分
        var bc_x = (c.x - b.x) / n;
        var bc_y = (c.y - b.y) / n;

        var ndots = [];
        var x1, y1, x2, y2, ab_x, ab_y;

        //左边点递增，右边点递增，获取每一次递增后的新的向量，继续n等分，从而获取所有点坐标
        for (var i = 0; i <= n; i++) {
            //获得ad向量n等分后的坐标
            x1 = a.x + ad_x * i;
            y1 = a.y + ad_y * i;
            //获得bc向量n等分后的坐标
            x2 = b.x + bc_x * i;
            y2 = b.y + bc_y * i;

            for (var j = 0; j <= n; j++) {
                //ab向量为：[x2 - x1 , y2 - y1]，所以n等分后的增量为除于n
                ab_x = (x2 - x1) / n;
                ab_y = (y2 - y1) / n;

                ndots.push({
                    x: x1 + ab_x * j,
                    y: y1 + ab_y * j
                })
            }
        }

        return ndots;
    }
}();